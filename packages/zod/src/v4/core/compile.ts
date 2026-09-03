import type * as checks from "./checks.js";
import type * as core from "./core.js";
import { $ZodAsyncError, config } from "./core.js";
import { Doc } from "./doc.js";
import { isBackEdge, isRecursiveSchema } from "./memoizer.js";
import * as regexes from "./regexes.js";
import {
  isValidBase64,
  isValidBase64URL,
  isValidCIDRv6,
  isValidCreditCard,
  isValidIPv6,
  isValidJWT,
  mergeValues,
  parseURLObject,
  stripTabAndNewline,
  urlHostnameOk,
  urlProtocolOk,
} from "./schemas.js";
import type { $ZodProperties, $ZodPropertiesDef, ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
import * as util from "./util.js";

/** @internal Sentinel the compiled fast path returns when validation fails. */
export const INVALID: unique symbol = Symbol.for("zod.compile.invalid");
/** @internal */
export type INVALID = typeof INVALID;

// Set on the parse ctx when a compiled wrapper falls back to the runtime, so nested compiled wrappers skip their fast paths for the rest of that parse.
const FALLBACK_FLAG: unique symbol = Symbol.for("zod.compile.fallback");

interface CompileFnOptions {
  debug?: boolean | undefined;
  /** Emit a validator instead of a parser: skip building the output value where nothing reads it. */
  assertOnly?: boolean | undefined;
  /** Emit an issue-collecting parser: failures push the same raw issues the interpreter pushes instead of returning INVALID. */
  issues?: boolean | undefined;
}

type CompiledFn<T> = ((input: unknown) => T | INVALID) & {
  code?: string | undefined;
  /** False when this function's INVALID does not strictly mean "the runtime would reject". */
  definite?: boolean | undefined;
};

/** Raised when the schema contains async refinements or transforms. Surfaces only under `compile(schema, { strict: true })`. */
export class ZodCompileAsyncError extends Error {
  constructor(message = "z.compile does not support async refinements, transforms, or checks") {
    super(message);
    this.name = "ZodCompileAsyncError";
  }
}

/**
 * Raised when the schema contains a feature whose semantics the fast path
 * can't fully model. Both the shim in `zod/compile` and the default
 * `compile()` fall back to the runtime parser for that schema; only
 * `compile(schema, { strict: true })` lets it surface.
 */
export class ZodCompileUnsupportedError extends Error {
  /** Whether a container may absorb this refusal by running the child through the runtime (see `compileChild`). False when running only that node on the runtime is not equivalent to running the whole parse there — a runtime island gets no parse context, so a node that *consumes* issues rather than propagating them would finalize them against the wrong error map and still succeed. */
  readonly islandable: boolean;

  constructor(feature: string, islandable = true) {
    super(`z.compile does not support ${feature}; this schema must use the runtime parser`);
    this.name = "ZodCompileUnsupportedError";
    this.islandable = islandable;
  }
}

interface CompileContext {
  constants: Map<string, unknown>;
  constantCounter: number;
  varCounter: number;
  /** Cleared when a construct can return INVALID for something the interpreter throws on, so `validate` keeps its fallback. */
  definite: boolean;
}

// Union of all check types we support in AOT compilation
type SupportedCheck =
  | checks.$ZodCheckLessThan
  | checks.$ZodCheckGreaterThan
  | checks.$ZodCheckMultipleOf
  | checks.$ZodCheckNumberFormat
  | checks.$ZodCheckBigIntFormat
  | checks.$ZodCheckMaxSize
  | checks.$ZodCheckMinSize
  | checks.$ZodCheckSizeEquals
  | checks.$ZodCheckMaxLength
  | checks.$ZodCheckMinLength
  | checks.$ZodCheckLengthEquals
  | checks.$ZodCheckStringFormat
  | checks.$ZodCheckProperty
  | $ZodProperties
  | checks.$ZodCheckMimeType
  | checks.$ZodCheckOverwrite
  | { _zod: { def: { check: "custom"; fn?: (value: unknown) => boolean }; check?: (payload: unknown) => unknown } };

/**
 * Build the validator `validate` calls: the same codegen as the parser with the output construction
 * dropped. A schema the flag cannot express reuses the parser, which still answers correctly — it
 * just builds a value nothing reads.
 */
function compileValidator(schema: SomeType, parser: CompiledFn<unknown>): CompiledFn<unknown> {
  try {
    return compileFn(schema, { assertOnly: true }) as CompiledFn<unknown>;
  } catch {
    return parser;
  }
}

export interface CompileOptions {
  /** Throw the refusal instead of returning the schema uncompiled. */
  strict?: boolean | undefined;
  /**
   * Experimental: compile the failure path too, so invalid input produces its issues from generated code instead of a runtime re-parse. `"single"` runs one issue-collecting parser for every parse; `"dual"` keeps the current fast parser for the hot path and runs the issue parser only after it rejects. Falls back to the default fallback model when the schema has no issue-mode compile.
   */
  issues?: "single" | "dual" | undefined;
}

/**
 * AOT-compile a Zod schema. Returns a clone whose `_zod.run` calls a generated
 * fast path first and falls back to the original runtime parser on failure.
 *
 * - Forward direction only. Backward (encode), async, and `skipChecks` paths
 *   bypass the fast path and use the runtime directly.
 * - Never throws. A schema the fast path can't model is returned unchanged and
 *   keeps using the runtime parser. Pass `{ strict: true }` to get the refusal
 *   as a thrown `ZodCompileUnsupportedError` / `ZodCompileAsyncError` instead.
 * - The original schema is unchanged. The clone shares children by reference.
 */
export function compile<T extends SomeType>(schema: T, options?: CompileOptions): T {
  try {
    const parser = compileFn(schema);
    const clone = util.clone(schema as any) as T;

    type IssueParser = (input: unknown, payload: ParsePayload, pctx: ParseContextInternal) => unknown;
    let issueParser: IssueParser | null = null;
    if (options?.issues) {
      try {
        issueParser = compileFn(schema, { issues: true }) as unknown as IssueParser;
      } catch (err) {
        if (!(err instanceof ZodCompileUnsupportedError || err instanceof ZodCompileAsyncError)) throw err;
      }
    }

    // Capture the source-of-truth runtime eagerly. If schema._zod.run is itself a shim installed by global-mode (`__originalRun` set), unwrap past it. Otherwise capturing the live property lazily would let a later self- replacement of schema._zod.run feed our wrapper back into itself.
    const liveRun = schema._zod.run as ((p: ParsePayload, c: ParseContextInternal) => any) & {
      __originalRun?: (p: ParsePayload, c: ParseContextInternal) => any;
    };
    const originalRun = liveRun.__originalRun ?? liveRun;

    // Delegate to the *original* schema's run on bypass/fallback (not the
    // clone's). The original closed over its own `inst` at construction time;
    // issue payloads use that reference to derive things like the class name
    // for `z.instanceof(Test)`. Calling the clone's freshly-initialized run
    // would push issues with `inst === clone`, producing diverging error
    // messages from the original schema.
    const wrapped = (payload: ParsePayload, ctx: ParseContextInternal): any => {
      if (
        ctx?.async ||
        ctx?.direction === "backward" ||
        ctx?.skipChecks ||
        (ctx as Record<symbol, unknown> | undefined)?.[FALLBACK_FLAG]
      ) {
        return originalRun(payload, ctx);
      }

      // A memoized back-edge: only the runtime can close a reference cycle, and a transform on one must raise $ZodCyclicError from its own parse.
      if (ctx && isBackEdge(ctx, payload.value)) {
        return originalRun(payload, ctx);
      }

      if (issueParser && options?.issues === "single") {
        payload.value = issueParser(payload.value, payload, ctx);
        return payload;
      }

      const out = parser(payload.value);
      if (out !== INVALID) {
        payload.value = out;
        return payload;
      }
      if (issueParser) {
        // dual: the issue parser replaces the runtime fallback
        payload.value = issueParser(payload.value, payload, ctx);
        return payload;
      }
      // Mark this parse as runtime-driven: under global mode every nested schema carries its own compiled wrapper, and without the flag the parent's runtime fallback re-enters each child's fast path, running user callbacks a third time on invalid input.
      if (ctx) (ctx as Record<symbol, unknown>)[FALLBACK_FLAG] = true;
      return originalRun(payload, ctx);
    };
    // Let later compiles of (or through) this run unwrap to the true runtime — both the global shim and repeated z.compile calls rely on this. The bag also carries the parser and the validator, so the standalone validate can skip the payload and wrapper on the happy path.
    (wrapped as { __originalRun?: typeof originalRun }).__originalRun = originalRun;
    clone._zod.bag.fallbackRun = originalRun;
    clone._zod.bag.validator = compileValidator(schema, parser as CompiledFn<unknown>);
    if (issueParser) clone._zod.bag.issueParser = issueParser;
    clone._zod.run = wrapped;

    // The fast parse/safeParse closures fall back through the source schema's methods. If the source is shim- or wrapper-managed, those methods route into a compiled run and would execute user callbacks a third time on invalid input — the plain method → wrapper path is exactly 2x, so skip. Dual issue mode keeps them but falls back through the CLONE's own methods, so a rejection lands in the wrapper's issue parser instead of a whole-schema re-parse. Single mode skips them: its contract is one issue-parser pass per parse.
    if (!liveRun.__originalRun) {
      if (!issueParser) installCompiledUserMethods(clone, schema, parser);
      else if (options?.issues === "dual") installCompiledUserMethods(clone, clone, parser);
    }

    return clone;
  } catch (err) {
    if (options?.strict) throw err;
    // a schema we can't compile still has to work, so hand it back untouched on the runtime parser — the same silent fallback global mode already does
    return schema;
  }
}

function installCompiledUserMethods<T extends SomeType>(
  target: T,
  source: T,
  parser: CompiledFn<core.output<T>>
): void {
  const targetAny = target as any;
  const sourceAny = source as any;

  if (typeof sourceAny.safeParse === "function") {
    const originalSafeParse = sourceAny.safeParse;
    targetAny.safeParse = (data: unknown, params?: unknown) => {
      const out = parser(data);
      if (out !== INVALID) {
        return { success: true, data: out };
      }
      return originalSafeParse(data, params);
    };
  }

  if (typeof sourceAny.parse === "function") {
    const originalParse = sourceAny.parse;
    targetAny.parse = (data: unknown, params?: unknown) => {
      const out = parser(data);
      if (out !== INVALID) {
        return out;
      }
      return originalParse(data, params);
    };
  }
}

/**
 * @internal Generate the standalone compiled function: a parser by default, a validator under
 * `assertOnly`. Returns the parsed value, `true` where nothing reads the output, or `INVALID`. Consumers use `compile()`.
 */
export function compileFn<T extends SomeType>(schema: T, options?: CompileFnOptions): CompiledFn<core.output<T>> {
  // Cycle-breaking is keyed on the parse context, which generated code never receives. `shape` can be a getter that throws (z.pick() with an unrecognized mask key), so treat "can't tell" as recursive.
  let recursive = true;
  try {
    recursive = isRecursiveSchema(schema as any);
  } catch {}
  if (recursive) {
    throw new ZodCompileUnsupportedError("a schema whose subtree contains a reference cycle");
  }

  const ctx: CompileContext = {
    constants: new Map(),
    constantCounter: 0,
    varCounter: 0,
    definite: true,
  };

  const doc = new Doc(options?.issues ? ["input", "payload", "pctx"] : ["input"]);
  if (options?.issues) {
    // a root that would compile to a bare self-island is just the interpreter with extra steps — refuse so the wrapper keeps the fallback model instead
    const rootType = schema._zod.def.type as SupportedSchemaType;
    if (
      !ISSUE_LEAF_TYPES.has(rootType) &&
      ![
        "never",
        "object",
        "array",
        "tuple",
        "optional",
        "nullable",
        "default",
        "prefault",
        "nonoptional",
        "readonly",
        "success",
        "pipe",
        "transform",
        "union",
      ].includes(rootType)
    ) {
      throw new ZodCompileUnsupportedError(`schema type ${rootType} at the root of an issue-mode compile`);
    }
    doc.write(`let _sp;`);
    const outputAccessor = generateCheckIssues(doc, ctx, schema, "input", [], true);
    doc.write(`return ${outputAccessor};`);
  } else {
    const outputAccessor = generateCheck(doc, ctx, schema, "input", !options?.assertOnly);
    // In assert mode a root that built nothing has already returned INVALID on every failure, so reaching the end means valid.
    doc.write(outputAccessor === null ? `return true;` : `return ${outputAccessor};`);
  }

  // Build the function with hoisted constants Always include INVALID as the first constant
  const constantNames = ["INVALID", ...ctx.constants.keys()];
  const constantValues = [INVALID, ...ctx.constants.values()];

  const code = doc.content.join("\n");
  const fullCode = options?.debug
    ? constantNames.length > 0
      ? `// Constants: ${constantNames.join(", ")}\n${code}`
      : code
    : "";

  const F = Function;
  const params = options?.issues ? "(input, payload, pctx)" : "(input)";
  const factoryCode = `return ${params} => {\n${code}\n}`;
  let fn: CompiledFn<core.output<T>>;
  try {
    const factory = new F(...constantNames, factoryCode);
    fn = factory(...constantValues) as CompiledFn<core.output<T>>;
  } catch (err) {
    // Malformed generated code (or a CSP environment rejecting `new Function`) surfaces as a typed error so the global shim falls back to the runtime instead of crashing with a raw SyntaxError/EvalError.
    throw new ZodCompileUnsupportedError(`this schema (generated code failed to evaluate: ${(err as Error).message})`);
  }
  if (options?.debug) {
    fn.code = fullCode;
  }
  fn.definite = ctx.definite;
  return fn;
}

function addConstant(ctx: CompileContext, value: unknown): string {
  // Check if we already have this constant
  for (const [name, v] of ctx.constants) {
    if (v === value) return name;
  }
  const name = `c${ctx.constantCounter++}`;
  ctx.constants.set(name, value);
  return name;
}

/** Hoists a user-supplied callback. Anything the schema's author wrote can throw, and generated code can reject an earlier sibling before ever reaching it, so this clears `definite` — a rejection is then no longer proof that the interpreter would have rejected rather than thrown. */
function addUserConstant(ctx: CompileContext, fn: unknown): string {
  ctx.definite = false;
  return addConstant(ctx, fn);
}

function newVar(ctx: CompileContext): string {
  return `v${ctx.varCounter++}`;
}

// Runs a child schema as a black box: its value, or INVALID for a failure or an async run.
function runtimeRun(schema: SomeType, value: unknown): unknown {
  const result = (schema._zod.run as (p: ParsePayload, c: ParseContextInternal) => any)(
    { value, issues: [] },
    {} as ParseContextInternal
  );
  if (result && typeof (result as Promise<unknown>).then === "function") return INVALID;
  const r = result as { value: unknown; issues: unknown[] };
  return r.issues.length === 0 ? r.value : INVALID;
}

// Try to compile `schema` against `accessor`. If `generateCheck` throws
// `ZodCompileUnsupportedError`, the doc + ctx state is rolled back and a
// runtime island is emitted instead — the child schema is invoked through
// `runtimeRun` at parse time and treated as a black box. Anything else thrown
// propagates (e.g. `ZodCompileAsyncError`).
function compileChild(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string;
function compileChild(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue: boolean
): string | null;
// `null` means the node built no value because nothing reads it. The overloads keep that case out of the 20-odd callers that always want one, so only a caller passing needsValue has to handle it.
function compileChild(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue = true
): string | null {
  const contentLen = doc.content.length;
  const constantCount = ctx.constants.size;
  const constantCounter = ctx.constantCounter;
  const varCounter = ctx.varCounter;
  try {
    return generateCheck(doc, ctx, schema, accessor, needsValue);
  } catch (err) {
    if (!(err instanceof ZodCompileUnsupportedError) || !err.islandable) throw err;
    doc.content.length = contentLen;
    if (ctx.constants.size > constantCount) {
      const trailing = Array.from(ctx.constants.keys()).slice(constantCount);
      for (const k of trailing) ctx.constants.delete(k);
    }
    ctx.constantCounter = constantCounter;
    ctx.varCounter = varCounter;
    return emitRuntimeIsland(doc, ctx, schema, accessor);
  }
}

function emitRuntimeIsland(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  // an islanded child answers INVALID for an async run too, which the interpreter throws for
  ctx.definite = false;
  const schemaConst = addConstant(ctx, schema);
  const runConst = addConstant(ctx, runtimeRun);
  const outVar = newVar(ctx);
  doc.write(`const ${outVar} = ${runConst}(${schemaConst}, ${accessor});`);
  doc.write(`if (${outVar} === INVALID) return INVALID;`);
  return outVar;
}

// Check classes whose `when` is auto-defaulted at init (checks.ts `when ??=`).
const WHEN_DEFAULTED_CHECKS = new Set([
  "max_size",
  "min_size",
  "size_equals",
  "max_length",
  "min_length",
  "length_equals",
]);

/** Emits the statement run when a check's predicate fails. Fast mode returns INVALID; issue mode writes a cold block that pushes the canonical issue. Called once per failure site, so implementations may allocate fresh vars. */
type FailEmitter = () => string;
const RETURN_INVALID: FailEmitter = () => "return INVALID;";

// Emits the predicate for one non-structural check (everything but custom/overwrite/property/properties), calling `fail()` at each failure site. Returns the accessor holding the post-check value.
function emitCheckPredicate(
  doc: Doc,
  ctx: CompileContext,
  check: SupportedCheck,
  accessor: string,
  fail: FailEmitter
): string {
  const def = check._zod.def;
  switch (def.check) {
    case "greater_than":
      generateGreaterThanCheck(doc, ctx, def, accessor, fail);
      return accessor;
    case "less_than":
      generateLessThanCheck(doc, ctx, def, accessor, fail);
      return accessor;
    case "multiple_of":
      generateMultipleOfCheck(doc, ctx, def, accessor, fail);
      return accessor;
    case "number_format":
      generateNumberFormatCheck(doc, def, accessor, fail);
      return accessor;
    case "min_length": {
      const min = numericOperand(def.minimum, "min_length");
      const len = codePointLengthVar(
        doc,
        ctx,
        accessor,
        `${accessor}.length >= ${min} && ${accessor}.length < ${def.minimum * 2}`
      );
      doc.write(`if (${len} < ${min}) ${fail()}`);
      return accessor;
    }
    case "max_length": {
      const max = numericOperand(def.maximum, "max_length");
      const len = codePointLengthVar(doc, ctx, accessor, `${accessor}.length > ${max}`);
      doc.write(`if (${len} > ${max}) ${fail()}`);
      return accessor;
    }
    case "length_equals": {
      const exact = numericOperand(def.length, "length_equals");
      const len = codePointLengthVar(
        doc,
        ctx,
        accessor,
        `${accessor}.length >= ${exact} && ${accessor}.length <= ${def.length * 2}`
      );
      doc.write(`if (${len} !== ${exact}) ${fail()}`);
      return accessor;
    }
    case "min_size":
      doc.write(`if (${accessor}.size < ${numericOperand(def.minimum, "min_size")}) ${fail()}`);
      return accessor;
    case "max_size":
      doc.write(`if (${accessor}.size > ${numericOperand(def.maximum, "max_size")}) ${fail()}`);
      return accessor;
    case "size_equals":
      doc.write(`if (${accessor}.size !== ${numericOperand(def.size, "size_equals")}) ${fail()}`);
      return accessor;
    case "string_format":
      return generateStringFormatCheck(doc, ctx, def, accessor, fail);
    case "bigint_format":
      generateBigIntFormatCheck(doc, def, accessor, fail);
      return accessor;
    case "mime_type":
      generateMimeTypeCheck(doc, ctx, def, accessor, fail);
      return accessor;
    default:
      throw new ZodCompileUnsupportedError(`check type ${(def as { check: string }).check}`);
  }
}

function generateChecks(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const schemaChecks = schema._zod.def.checks as SupportedCheck[] | undefined;
  if (!schemaChecks || schemaChecks.length === 0) return accessor;

  // Track current accessor - may change if overwrite checks are encountered
  let currentAccessor = accessor;

  for (const check of schemaChecks) {
    const def = check._zod.def;
    // A custom `when` skips a check the fast path always runs; the one auto-defaulted on size/length classes matches its bail-on-first-failure.
    if ((def as { when?: unknown }).when && !WHEN_DEFAULTED_CHECKS.has(def.check)) {
      throw new ZodCompileUnsupportedError(`check with a custom "when" condition`);
    }
    switch (def.check) {
      case "custom":
        currentAccessor = generateCustomRefineCheck(doc, ctx, check as CustomCheck, currentAccessor);
        break;
      case "property":
        generatePropertyCheck(doc, ctx, def, currentAccessor);
        break;
      case "properties":
        generatePropertiesChecks(doc, ctx, def, currentAccessor, false);
        break;
      case "overwrite": {
        // Overwrite transforms the value - create new variable for transformed result
        const newAccessor = newVar(ctx);
        generateOverwriteCheck(doc, ctx, check as checks.$ZodCheckOverwrite, currentAccessor, newAccessor);
        currentAccessor = newAccessor;
        break;
      }
      default:
        currentAccessor = emitCheckPredicate(doc, ctx, check, currentAccessor, RETURN_INVALID);
    }
  }

  return currentAccessor;
}

// Emit the length operand for a length check, mirroring `$ZodCheckMinLength` and friends: strings measure in code points, everything else in `.length`. `inDoubt` is the caller's cheap UTF-16 bound test — outside it the unit count already settles the comparison, so the scan is skipped.
function codePointLengthVar(doc: Doc, ctx: CompileContext, accessor: string, inDoubt: string): string {
  const cpLen = addConstant(ctx, util.codePointLength);
  const v = newVar(ctx);
  doc.write(`const ${v} = typeof ${accessor} === "string" && ${inDoubt} ? ${cpLen}(${accessor}) : ${accessor}.length;`);
  return v;
}

// Emit a source operand for a gt/lt bound. Numbers inline; Dates hoist as a constant (relational operators compare via valueOf). NaN and Invalid Date bounds can't compile to a comparison that matches runtime semantics.
/**
 * A count bound reaches generated source verbatim, so a non-number would be
 * emitted as code rather than as a value — `min('0) {} evil(); if (0')` writes an
 * arbitrary statement into the function body. TypeScript types these as `number`
 * and fromJSONSchema guards them, so this is a backstop rather than a live hole,
 * but generated source is the one place a wrong type stops being a type error.
 */
function numericOperand(value: unknown, label: string): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ZodCompileUnsupportedError(`${label} bound of type ${typeof value}`);
  }
  return `${value}`;
}

function comparisonOperand(ctx: CompileContext, value: number | bigint | Date): string {
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "number") {
    if (Number.isNaN(value)) throw new ZodCompileUnsupportedError("comparison check with NaN bound");
    return `${value}`;
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ZodCompileUnsupportedError("comparison check with Invalid Date bound");
    }
    return addConstant(ctx, value);
  }
  throw new ZodCompileUnsupportedError(`comparison check bound of type ${typeof value}`);
}

function generateGreaterThanCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckGreaterThanDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  const op = def.inclusive ? "<" : "<=";
  doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) ${fail()}`);
}

function generateLessThanCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckLessThanDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  const op = def.inclusive ? ">" : ">=";
  doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) ${fail()}`);
}

function generateMultipleOfCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckMultipleOfDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  if (typeof def.value === "bigint") {
    // a zero divisor has no compiled form: `x % 0n` throws
    if (def.value === BigInt(0)) throw new ZodCompileUnsupportedError("multiple_of check with a zero divisor");
    doc.write(`if (${accessor} % ${def.value}n !== 0n) ${fail()}`);
  } else {
    // Float `%` has well-known precision issues for sub-integer steps
    // (`1.5 % 0.1`, `2.5e-7 % 1e-7`). Defer to util.floatSafeRemainder so the
    // exact tolerance logic stays in one place — single function call is fine
    // since `multipleOf` runs at most once per number.
    const remainder = addConstant(ctx, util.floatSafeRemainder);
    doc.write(`if (${remainder}(${accessor}, ${numericOperand(def.value, "multiple_of")}) !== 0) ${fail()}`);
  }
}

function generateNumberFormatCheck(
  doc: Doc,
  def: checks.$ZodCheckNumberFormatDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  const format = def.format;
  switch (format) {
    case "safeint":
      doc.write(`if (!Number.isSafeInteger(${accessor})) ${fail()}`);
      break;
    case "int32":
      doc.write(
        `if (!Number.isInteger(${accessor}) || ${accessor} < -2147483648 || ${accessor} > 2147483647) ${fail()}`
      );
      break;
    case "uint32":
      doc.write(`if (!Number.isInteger(${accessor}) || ${accessor} < 0 || ${accessor} > 4294967295) ${fail()}`);
      break;
    case "float32":
      // Float32 range per util.NUMBER_FORMAT_RANGES
      doc.write(
        `if (!Number.isFinite(${accessor}) || ${accessor} < -3.4028234663852886e38 || ${accessor} > 3.4028234663852886e38) ${fail()}`
      );
      break;
    case "float64":
      doc.write(`if (!Number.isFinite(${accessor})) ${fail()}`);
      break;
    default: {
      void (format satisfies never);
      throw new ZodCompileUnsupportedError(`number format ${format}`);
    }
  }
}

function generateBigIntFormatCheck(
  doc: Doc,
  def: checks.$ZodCheckBigIntFormatDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  const format = def.format;
  if (!format) return; // undefined format means no range check
  switch (format) {
    case "int64":
      doc.write(`if (${accessor} < -9223372036854775808n || ${accessor} > 9223372036854775807n) ${fail()}`);
      break;
    case "uint64":
      doc.write(`if (${accessor} < 0n || ${accessor} > 18446744073709551615n) ${fail()}`);
      break;
    default: {
      void (format satisfies never);
      throw new ZodCompileUnsupportedError(`bigint format ${format}`);
    }
  }
}

function generateMimeTypeCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckMimeTypeDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): void {
  const mimeTypes = def.mime;
  if (mimeTypes && mimeTypes.length > 0) {
    const mimeSet = addConstant(ctx, new Set(mimeTypes));
    doc.write(`if (!${mimeSet}.has(${accessor}.type)) ${fail()}`);
  }
}

// asserts each named property in place; children compile assert-only because z.properties never rebuilds its input
function generatePropertiesChecks(
  doc: Doc,
  ctx: CompileContext,
  def: $ZodPropertiesDef,
  accessor: string,
  schemaRole: boolean
): void {
  // a custom `when` gates the assertion at runtime; inside a union a wrongly-run branch is absorbed as a branch failure rather than falling back, so refuse at codegen the way the check role does
  if (def.when) {
    throw new ZodCompileUnsupportedError(`check with a custom "when" condition`);
  }
  // matches the runtime gate for whichever role this is: a schema rejects a primitive outright, a check only a nullish value
  doc.write(
    schemaRole
      ? `if (${accessor} === null || (typeof ${accessor} !== "object" && typeof ${accessor} !== "function")) return INVALID;`
      : `if (${accessor} == null) return INVALID;`
  );
  const shape = def.shape as Record<string | symbol, SomeType>;
  for (const key of Reflect.ownKeys(shape)) {
    // a symbol has no source literal, so it is hoisted as a constant
    const keyExpr = typeof key === "symbol" ? addConstant(ctx, key) : util.esc(key);
    // cache the property read so a getter runs exactly once, matching the runtime
    const inputVar = newVar(ctx);
    doc.write(`const ${inputVar} = ${accessor}[${keyExpr}];`);
    compileChild(doc, ctx, shape[key]!, inputVar, false);
  }
}

function generatePropertyCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckPropertyDef,
  accessor: string
): void {
  const propAccessor = `${accessor}[${JSON.stringify(def.property)}]`;
  generateCheck(doc, ctx, def.schema as SomeType, propAccessor);
}

function generateOverwriteCheck(
  doc: Doc,
  ctx: CompileContext,
  check: checks.$ZodCheckOverwrite,
  currentAccessor: string,
  newAccessor: string
): void {
  const tx = check._zod.def.tx;
  if (!tx) {
    throw new ZodCompileUnsupportedError("overwrite check without a transform function");
  }

  // Check for async transform
  if (isAsyncFunction(tx)) {
    throw new ZodCompileAsyncError("z.compile: async overwrite transforms are not supported");
  }

  // Hoist the transform function as a constant and apply it
  const txConst = addConstant(ctx, tx);
  doc.write(`const ${newAccessor} = ${txConst}(${currentAccessor});`);
}

type CustomCheck = {
  _zod: { def: { check: "custom"; fn?: (value: unknown) => boolean }; check?: (payload: unknown) => unknown };
};
/** A predicate that hands back a thenable is an async check reached synchronously, and the interpreter throws `$ZodAsyncError` for it. Returning INVALID instead would be a bail-out, and a union reads a bail-out as a rejected branch and answers with a later one — so the throw has to survive into generated code. */
function throwAsync(): never {
  throw new $ZodAsyncError();
}

/** Shared `addIssue` for the spoofed payloads a refine, check or transform receives. Allocating one per call — a fresh closure plus a `this`-bound method on a fresh literal — pinned every payload-allocating schema at ~2.7M ops/sec against 135M for a plain object literal. It captures nothing per call; it only reaches `this.issues`. */
function pushIssue(this: { issues: unknown[] }, issue: unknown): void {
  this.issues.push(issue);
}

function generateCustomRefineCheck(doc: Doc, ctx: CompileContext, check: CustomCheck, accessor: string): string {
  const def = check._zod.def;

  if (def.fn) {
    // Simple predicate function (from .refine())
    if (isAsyncFunction(def.fn)) {
      throw new ZodCompileAsyncError("z.compile: async .refine() predicates are not supported");
    }
    const fnConst = addUserConstant(ctx, def.fn);
    const throwAsyncConst = addConstant(ctx, throwAsync);
    const resVar = newVar(ctx);
    doc.write(`const ${resVar} = ${fnConst}(${accessor});`);
    // A thenable is truthy, so it would otherwise read as a pass. It is not a rejection either: the interpreter throws, and INVALID inside a union would just hand the parse to the next branch.
    doc.write(`if (${resVar} instanceof Promise) ${throwAsyncConst}();`);
    doc.write(`if (!${resVar}) return INVALID;`);
    // A `.refine()` predicate only answers yes or no; it cannot rewrite the value.
    return accessor;
  }
  if (check._zod.check) {
    if (isAsyncFunction(check._zod.check)) {
      throw new ZodCompileAsyncError("z.compile: async .superRefine() / check functions are not supported");
    }
    // SuperRefine or other check function - need to spoof context Create a helper that runs the check and returns true if no issues
    const checkFn = check._zod.check;
    // `$RefinementCtx` extends the parse payload, so a check may rewrite
    // `ctx.value` as well as push issues — `.superRefine((v, ctx) => { ctx.value =
    // v.trim() })` is a value transform. Returning only a boolean discarded that
    // write and emitted the untrimmed input. Hand the value back and thread it on.
    const helperFn = (value: unknown): unknown => {
      const fakePayload = { value, issues: [] as unknown[], addIssue: pushIssue };
      const result = checkFn(fakePayload);
      // Throw rather than return INVALID: the interpreter throws here, and a union would read INVALID as a rejected branch.
      if (result instanceof Promise) throwAsync();
      return fakePayload.issues.length === 0 ? fakePayload.value : INVALID;
    };
    const helperConst = addUserConstant(ctx, helperFn);
    const outVar = newVar(ctx);
    doc.write(`const ${outVar} = ${helperConst}(${accessor});`);
    doc.write(`if (${outVar} === INVALID) return INVALID;`);
    return outVar;
  }
  throw new ZodCompileUnsupportedError("custom check without a predicate or check function");
}

type StringFormatDef =
  | checks.$ZodCheckStringFormatDef
  | checks.$ZodCheckRegexDef
  | checks.$ZodCheckLowerCaseDef
  | checks.$ZodCheckUpperCaseDef
  | checks.$ZodCheckIncludesDef
  | checks.$ZodCheckStartsWithDef
  | checks.$ZodCheckEndsWithDef;

type SupportedStringFormat = "regex" | "lowercase" | "uppercase" | "includes" | "starts_with" | "ends_with";

/**
 * Built-in formats that validate with nothing but `def.pattern`, so compiling
 * the regex reproduces the runtime exactly. Deliberately an allowlist: a format
 * missing from it loses its fast path, while a format wrongly added to it
 * silently accepts input the runtime rejects. Formats that layer extra
 * validation over a shape-only pattern (`credit_card`, `base64`, `ipv6`, …) are
 * handled above by hoisting the runtime validator itself.
 */
const PATTERN_IS_COMPLETE: Set<string> = new Set([
  "cidrv4",
  "cuid",
  "cuid2",
  "date",
  "datetime",
  "duration",
  "e164",
  "email",
  "emoji",
  "ends_with",
  "guid",
  "includes",
  "ipv4",
  "ksuid",
  "lowercase",
  "mac",
  "nanoid",
  "regex",
  "starts_with",
  "time",
  "ulid",
  "uppercase",
  "uuid",
  "xid",
]);

// Returns the accessor holding the (possibly normalized) value after the check — url/normalize formats produce a new value like overwrite does. Never assigns to the incoming accessor: it may be a `const` or a property expression on user input.
function generateStringFormatCheck(
  doc: Doc,
  ctx: CompileContext,
  def: StringFormatDef,
  accessor: string,
  fail: FailEmitter = RETURN_INVALID
): string {
  // Some string formats do runtime validation beyond their advertised pattern. For cheap pure utility checks, hoist the runtime function and call it so the fast path stays correct without cloning the utility logic into codegen.
  const fmt = def.format;
  if (fmt === "base64") {
    const validator = addConstant(ctx, isValidBase64);
    doc.write(`if (!${validator}(${accessor})) ${fail()}`);
    return accessor;
  }
  if (fmt === "base64url") {
    const validator = addConstant(ctx, isValidBase64URL);
    doc.write(`if (!${validator}(${accessor})) ${fail()}`);
    return accessor;
  }
  if (fmt === "jwt") {
    const validator = addConstant(ctx, isValidJWT);
    const alg = addConstant(ctx, (def as unknown as { alg?: util.JWTAlgorithm }).alg ?? null);
    doc.write(`if (!${validator}(${accessor}, ${alg})) ${fail()}`);
    return accessor;
  }
  if (fmt === "ipv6") {
    const validator = addConstant(ctx, isValidIPv6);
    doc.write(`if (!${validator}(${accessor})) ${fail()}`);
    return accessor;
  }
  if (fmt === "cidrv6") {
    const validator = addConstant(ctx, isValidCIDRv6);
    doc.write(`if (!${validator}(${accessor})) ${fail()}`);
    return accessor;
  }
  if (fmt === "credit_card") {
    const validator = addConstant(ctx, isValidCreditCard);
    doc.write(`if (!${validator}(${accessor})) ${fail()}`);
    return accessor;
  }
  const formatDef = def as unknown as { normalize?: boolean; hostname?: unknown; protocol?: unknown };
  if (
    fmt === "url" ||
    fmt === "httpurl" ||
    formatDef.normalize ||
    formatDef.hostname !== undefined ||
    formatDef.protocol !== undefined
  ) {
    // Same three predicates the runtime calls, in the same order, so there is no second URL implementation to drift. Which options exist is known now, so the calls the runtime makes conditionally are emitted conditionally instead.
    const parseConst = addConstant(ctx, parseURLObject);
    const defConst = addConstant(ctx, def);
    const trimVar = newVar(ctx);
    const urlVar = newVar(ctx);
    doc.write(`const ${trimVar} = ${accessor}.trim();`);
    doc.write(`const ${urlVar} = ${parseConst}(${trimVar}, ${defConst});`);
    doc.write(`if (typeof ${urlVar} === "number") ${fail()}`);
    if (formatDef.hostname !== undefined) {
      const hostnameConst = addConstant(ctx, urlHostnameOk);
      doc.write(`if (!${hostnameConst}(${urlVar}, ${defConst}.hostname)) ${fail()}`);
    }
    if (formatDef.protocol !== undefined) {
      const protocolConst = addConstant(ctx, urlProtocolOk);
      doc.write(`if (!${protocolConst}(${urlVar}, ${defConst}.protocol)) ${fail()}`);
    }
    const outputVar = newVar(ctx);
    const outputExpr = formatDef.normalize ? `${urlVar}.href` : `${addConstant(ctx, stripTabAndNewline)}(${trimVar})`;
    doc.write(`const ${outputVar} = ${outputExpr};`);
    return outputVar;
  }

  // A custom string format carries the predicate the runtime actually calls. Hoist and call it instead of testing `def.pattern`: the two only coincide when the format was built from a RegExp, and relying on that coupling is how supplemental validation gets dropped.
  const customFn = (def as unknown as { fn?: (input: string) => unknown }).fn;
  if (customFn) {
    if (isAsyncFunction(customFn)) throw new ZodCompileUnsupportedError(`async string format ${fmt}`);
    const fnConst = addConstant(ctx, customFn);
    doc.write(`if (!${fnConst}(${accessor})) ${fail()}`);
    return accessor;
  }

  // Formats whose `pattern` IS the whole check. An allowlist rather than `if (def.pattern)`, because credit_card, base64 and ipv6 carry a shape-only pattern and validate the rest separately.
  if (PATTERN_IS_COMPLETE.has(fmt) && def.pattern) {
    const patternConst = addConstant(ctx, def.pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) ${fail()}`);
    return accessor;
  }

  const format = def.format as SupportedStringFormat;
  switch (format) {
    case "regex":
      // A regex check with a pattern returned above. Reaching here means there is no pattern to test, and accepting unconditionally would pass every input, so hand the schema back to the runtime.
      throw new ZodCompileUnsupportedError("regex format without a pattern");
    case "lowercase":
      doc.write(`if (${accessor} !== ${accessor}.toLowerCase()) ${fail()}`);
      break;
    case "uppercase":
      doc.write(`if (${accessor} !== ${accessor}.toUpperCase()) ${fail()}`);
      break;
    case "includes":
      doc.write(`if (!${accessor}.includes(${util.esc((def as checks.$ZodCheckIncludesDef).includes)})) ${fail()}`);
      break;
    case "starts_with": {
      const prefix = (def as checks.$ZodCheckStartsWithDef).prefix;
      doc.write(`if (${accessor}.slice(0, ${prefix.length}) !== ${util.esc(prefix)}) ${fail()}`);
      break;
    }
    case "ends_with": {
      const suffix = (def as checks.$ZodCheckEndsWithDef).suffix;
      doc.write(`if (${accessor}.slice(-${suffix.length}) !== ${util.esc(suffix)}) ${fail()}`);
      break;
    }
    default: {
      void (format satisfies never);
      throw new ZodCompileUnsupportedError(`string format ${format}`);
    }
  }
  return accessor;
}

// Union of all schema types we support in AOT compilation
type SupportedSchemaType =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "undefined"
  | "null"
  | "any"
  | "unknown"
  | "never"
  | "void"
  | "nan"
  | "date"
  | "object"
  | "optional"
  | "nullable"
  | "array"
  | "literal"
  | "enum"
  | "readonly"
  | "success"
  | "default"
  | "prefault"
  | "nonoptional"
  | "tuple"
  | "union"
  | "intersection"
  | "record"
  | "map"
  | "set"
  | "file"
  | "template_literal"
  | "lazy"
  | "pipe"
  | "custom"
  | "properties"
  | "transform"
  | "catch";

function generateCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string;
function generateCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue: boolean
): string | null;
function generateCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue = true
): string | null {
  const def = schema._zod.def;
  const type = def.type as SupportedSchemaType;

  // A coercing schema would compile to the bare type test and reject what it should convert; inside a union that reads as a rejected branch, so refuse at codegen.
  if ((def as { coerce?: boolean }).coerce) {
    throw new ZodCompileUnsupportedError(`coercion (z.coerce.${type}())`);
  }

  // A node builds its output when its caller reads one, or when it carries checks of its own, since a check reads what was built. One polarity for the whole walk: this is what the node does, and it is what its children are told they need.
  const buildsValue = needsValue || !!def.checks?.length;
  let typeAccessor: string | null;

  switch (type) {
    case "string":
      typeAccessor = generateStringCheck(doc, ctx, schema, accessor);
      break;
    case "number":
      typeAccessor = generateNumberCheck(doc, schema, accessor);
      break;
    case "boolean":
      typeAccessor = generateBooleanCheck(doc, accessor);
      break;
    case "bigint":
      typeAccessor = generateBigIntCheck(doc, schema, accessor);
      break;
    case "symbol":
      typeAccessor = generateSymbolCheck(doc, accessor);
      break;
    case "undefined":
      typeAccessor = generateUndefinedCheck(doc, accessor);
      break;
    case "null":
      typeAccessor = generateNullCheck(doc, accessor);
      break;
    case "any":
    case "unknown":
      // No check needed - pass through
      typeAccessor = accessor;
      break;
    case "never":
      doc.write("return INVALID;");
      typeAccessor = accessor;
      break;
    case "void":
      typeAccessor = generateVoidCheck(doc, accessor);
      break;
    case "nan":
      typeAccessor = generateNaNCheck(doc, accessor);
      break;
    case "date":
      typeAccessor = generateDateCheck(doc, accessor);
      break;
    case "object":
      typeAccessor = generateObjectCheck(doc, ctx, schema, accessor, buildsValue);
      break;
    case "optional":
      typeAccessor = generateOptionalCheck(doc, ctx, schema, accessor, buildsValue);
      break;
    case "nullable":
      typeAccessor = generateNullableCheck(doc, ctx, schema, accessor, buildsValue);
      break;
    case "array":
      typeAccessor = generateArrayCheck(doc, ctx, schema, accessor, buildsValue);
      break;
    case "literal":
      typeAccessor = generateLiteralCheck(doc, ctx, schema, accessor);
      break;
    case "enum":
      typeAccessor = generateEnumCheck(doc, ctx, schema, accessor);
      break;
    case "readonly": {
      const innerOut = generateWrapperCheck(doc, ctx, schema, accessor);
      // Runtime freezes the parsed value (schemas.ts handleReadonlyResult).
      const frozenVar = newVar(ctx);
      doc.write(`const ${frozenVar} = Object.freeze(${innerOut});`);
      typeAccessor = frozenVar;
      break;
    }
    case "success":
      // Runtime output is `issues.length === 0`. The fast path only reaches
      // here when the inner check passed (failure returns INVALID and the
      // runtime fallback reproduces the inner issues), so the output is
      // always `true`.
      generateWrapperCheck(doc, ctx, schema, accessor);
      typeAccessor = "true";
      break;
    case "default":
    case "prefault":
      typeAccessor = generateDefaultCheck(doc, ctx, schema, accessor);
      break;
    case "nonoptional":
      typeAccessor = generateNonOptionalCheck(doc, ctx, schema, accessor);
      break;
    case "tuple":
      typeAccessor = generateTupleCheck(doc, ctx, schema, accessor);
      break;
    case "union":
      typeAccessor = generateUnionCheck(doc, ctx, schema, accessor);
      break;
    case "intersection":
      typeAccessor = generateIntersectionCheck(doc, ctx, schema, accessor);
      break;
    case "record":
      typeAccessor = generateRecordCheck(doc, ctx, schema, accessor);
      break;
    case "map":
      typeAccessor = generateMapCheck(doc, ctx, schema, accessor);
      break;
    case "set":
      typeAccessor = generateSetCheck(doc, ctx, schema, accessor);
      break;
    case "file":
      typeAccessor = generateFileCheck(doc, accessor);
      break;
    case "template_literal":
      typeAccessor = generateTemplateLiteralCheck(doc, ctx, schema, accessor);
      break;
    case "lazy":
      typeAccessor = generateLazyCheck(doc, ctx, schema, accessor);
      break;
    case "pipe":
      typeAccessor = generatePipeCheck(doc, ctx, schema, accessor);
      break;
    case "custom":
      typeAccessor = generateCustomCheck(doc, ctx, schema, accessor);
      break;
    case "properties":
      generatePropertiesChecks(doc, ctx, (schema as $ZodProperties)._zod.def, accessor, true);
      typeAccessor = accessor;
      break;
    case "transform":
      typeAccessor = generateTransformCheck(doc, ctx, schema, accessor);
      break;
    case "catch":
      typeAccessor = generateCatchCheck(doc, ctx, schema, accessor);
      break;
    default: {
      void (type satisfies never);
      throw new ZodCompileUnsupportedError(`schema type ${type}`);
    }
  }

  // a node that built nothing has no checks to run: not building requires an empty check list
  if (typeAccessor === null) return null;

  // Generate checks after the type-specific validation (may transform value)
  return generateChecks(doc, ctx, schema, typeAccessor);
}

function generateStringCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);

  // z.email() carries its format on the def, z.string().email() in def.checks; both route here so the format table has no second copy to drift from.
  const def = schema._zod.def as unknown as StringFormatDef & { format?: string };
  if (def.format === undefined) return accessor;
  return generateStringFormatCheck(doc, ctx, def, accessor);
}

function generateNumberCheck(doc: Doc, schema: SomeType, accessor: string): string {
  // Runtime z.number() rejects NaN and ±Infinity. Number.isFinite covers both.
  doc.write(`if (typeof ${accessor} !== "number" || !Number.isFinite(${accessor})) return INVALID;`);

  // Mini factories like z.int(), z.int32(), z.uint32(), z.float32() bake a number_format check into the schema def itself (not into def.checks). Apply the same constraint here.
  const def = schema._zod.def as unknown as { check?: string; format?: string };
  if (def.check === "number_format" && def.format) {
    generateNumberFormatCheck(doc, { format: def.format } as checks.$ZodCheckNumberFormatDef, accessor);
  }
  return accessor;
}

function generateBooleanCheck(doc: Doc, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "boolean") return INVALID;`);
  return accessor;
}

function generateBigIntCheck(doc: Doc, schema: SomeType, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "bigint") return INVALID;`);

  // Handle bigint format (int64, uint64) directly on the schema def
  const def = schema._zod.def as unknown as { format?: string };
  if (def.format) {
    switch (def.format) {
      case "int64":
        doc.write(`if (${accessor} < -9223372036854775808n || ${accessor} > 9223372036854775807n) return INVALID;`);
        break;
      case "uint64":
        doc.write(`if (${accessor} < 0n || ${accessor} > 18446744073709551615n) return INVALID;`);
        break;
    }
  }
  return accessor;
}

function generateSymbolCheck(doc: Doc, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "symbol") return INVALID;`);
  return accessor;
}

function generateUndefinedCheck(doc: Doc, accessor: string): string {
  doc.write(`if (${accessor} !== undefined) return INVALID;`);
  return accessor;
}

function generateNullCheck(doc: Doc, accessor: string): string {
  doc.write(`if (${accessor} !== null) return INVALID;`);
  return accessor;
}

function generateVoidCheck(doc: Doc, accessor: string): string {
  doc.write(`if (${accessor} !== undefined) return INVALID;`);
  return accessor;
}

function generateNaNCheck(doc: Doc, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "number" || !Number.isNaN(${accessor})) return INVALID;`);
  return accessor;
}

function generateDateCheck(doc: Doc, accessor: string): string {
  doc.write(`if (!(${accessor} instanceof Date) || Number.isNaN(${accessor}.getTime())) return INVALID;`);
  return accessor;
}

function generateObjectCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  buildsValue = true
): string | null {
  const def = schema._zod.def as unknown as { shape: Record<string, SomeType>; catchall?: SomeType };

  // Check that input is a non-null, non-array object
  doc.write(
    `if (typeof ${accessor} !== "object" || ${accessor} === null || Array.isArray(${accessor})) return INVALID;`
  );

  const shape = def.shape;
  const keys = Object.keys(shape);
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  // a symbol has no source literal, so it is hoisted as a constant; `keys` stays string-only where the emitted code uses `for...in`
  const allKeys: (string | symbol)[] = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
  const keyExpr = (k: string | symbol) => (typeof k === "symbol" ? addConstant(ctx, k) : util.esc(k));
  const propKey = (k: string | symbol) => (typeof k === "symbol" ? `[${keyExpr(k)}]` : util.esc(k));
  const propShape = shape as Record<string | symbol, SomeType>;

  // `__proto__` as an own shape key can't be expressed in an output object literal (the literal form sets the prototype instead of an own property).
  if (keys.includes("__proto__")) {
    throw new ZodCompileUnsupportedError('object shape key "__proto__"');
  }

  // Map from key to output accessor for that property
  const propOutputs = new Map<string | symbol, string>();

  // Validate each property and collect output accessors
  for (const key of allKeys) {
    const propSchema = propShape[key]!;
    const kx = keyExpr(key);
    // Always cache the property read: the runtime reads input[key] exactly once, so a getter must not be re-read by checks or output assembly.
    const inputVar = newVar(ctx);
    doc.write(`const ${inputVar} = ${accessor}[${kx}];`);

    if (propSchema._zod.optin !== undefined) {
      // Any optin rung means the key may be omitted. The runtime runs the property anyway and ignores issues only when the key is genuinely absent, which is what makes exactOptional compositional.
      const outputVar = newVar(ctx);
      doc.write(`let ${outputVar} = (() => {`);
      doc.indented((d) => {
        const outputAccessor = compileChild(d, ctx, propSchema, inputVar);
        d.write(`return ${outputAccessor};`);
      });
      doc.write(`})();`);

      if (propSchema._zod.optout === "optional") {
        doc.write(`if (${outputVar} === INVALID) {`);
        doc.indented((d) => {
          d.write(`if (${kx} in ${accessor}) return INVALID;`);
          d.write(`${outputVar} = undefined;`);
        });
        doc.write(`}`);
      } else {
        doc.write(`if (${outputVar} === INVALID) return INVALID;`);
      }
      propOutputs.set(key, outputVar);
    } else {
      if (requiresPresenceCheck(propSchema)) {
        doc.write(`if (!(${kx} in ${accessor})) return INVALID;`);
      }

      // Generate check and get output accessor
      const outputAccessor = compileChild(doc, ctx, propSchema, inputVar, buildsValue);
      if (outputAccessor !== null) propOutputs.set(key, outputAccessor);
    }
  }

  // Handle catchall
  const catchall = def.catchall;
  let unknownKeysMode: "none" | "passthrough" | "schema" = "none";

  if (catchall) {
    const catchallType = catchall._zod.def.type;

    if (catchallType === "never") {
      // Strict: one `for...in`, as the runtime does, so inherited enumerable keys count. An undeclared `__proto__` is reported here and excluded only from the output (#6221); an own-key count would wrongly reject a class instance.
      const condition = keys.map((k) => `k !== ${util.esc(k)}`).join(" && ") || "true";
      doc.write(`for (const k in ${accessor}) {`);
      doc.indented((d) => {
        d.write(`if (${condition}) return INVALID;`);
      });
      doc.write(`}`);
    } else if ((catchallType === "unknown" || catchallType === "any") && !catchall._zod.def.checks?.length) {
      unknownKeysMode = "passthrough";
    } else {
      unknownKeysMode = "schema";
    }
  }
  // else: strip mode (no catchall) - unknown keys ignored, only include known keys

  // Shape keys in declared order, then unknown keys in for...in order. A middle-rung key is included iff present on the input, else iff its output is not undefined.
  const outputVar = newVar(ctx);
  const hasConditionalKeys = allKeys.some((k) => mayOutputUndefined(propShape[k]!) || dropsWhenAbsent(propShape[k]!));

  // Assert mode: every declared key is validated above, so the output literal and the unknown-key copy are pure waste. A `never` catchall already emitted its rejection loop; a schema catchall still has to validate the values it would otherwise have stored.
  if (!buildsValue) {
    if (unknownKeysMode === "schema") {
      const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
      doc.write(`for (const k in ${accessor}) {`);
      doc.indented((d) => {
        d.write(`if (k === "__proto__") continue;`);
        if (knownSet) d.write(`if (${knownSet}.has(k)) continue;`);
        const valVar = newVar(ctx);
        d.write(`const ${valVar} = ${accessor}[k];`);
        compileChild(d, ctx, catchall!, valVar, false);
      });
      doc.write(`}`);
    }
    return null;
  }

  if (!hasConditionalKeys) {
    const propLiterals = allKeys.map((k) => `${propKey(k)}: ${propOutputs.get(k)}`).join(", ");
    doc.write(`const ${outputVar} = { ${propLiterals} };`);
  } else {
    doc.write(`const ${outputVar} = {};`);
    for (const k of allKeys) {
      const kx = keyExpr(k);
      const out = propOutputs.get(k);
      if (dropsWhenAbsent(propShape[k]!)) {
        doc.write(`if (${kx} in ${accessor}) ${outputVar}[${kx}] = ${out};`);
      } else if (mayOutputUndefined(propShape[k]!)) {
        doc.write(`if (${out} !== undefined || ${kx} in ${accessor}) ${outputVar}[${kx}] = ${out};`);
      } else {
        doc.write(`${outputVar}[${kx}] = ${out};`);
      }
    }
  }

  if (unknownKeysMode !== "none") {
    // Unknown keys are written directly into the output after shape keys — for...in (like the runtime) so inherited enumerables participate.
    const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
    doc.write(`for (const k in ${accessor}) {`);
    doc.indented((d) => {
      // Skip __proto__: assigning obj["__proto__"] on a plain {} replaces the prototype via the setter rather than adding an own property. Mirrors the runtime catchall fix (#5898).
      d.write(`if (k === "__proto__") continue;`);
      if (knownSet) d.write(`if (${knownSet}.has(k)) continue;`);
      if (unknownKeysMode === "passthrough") {
        d.write(`${outputVar}[k] = ${accessor}[k];`);
      } else {
        const valVar = newVar(ctx);
        d.write(`const ${valVar} = ${accessor}[k];`);
        const catchallOut = compileChild(d, ctx, catchall!, valVar);
        d.write(`${outputVar}[k] = ${catchallOut};`);
      }
    });
    doc.write(`}`);
  }

  return outputVar;
}

function generateOptionalCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  buildsValue = true
): string | null {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  if (isExactOptional(schema)) {
    return generateCheck(doc, ctx, def.innerType, accessor, buildsValue);
  }

  // Same question $ZodOptional asks: only the top rung of the optin ladder substitutes a value for an absent input, so only it is worth running on `undefined`. Every other rung leaves the value intact, which is the skip branch below.
  if (def.innerType._zod.optin === "defaulted") {
    const outputVar = newVar(ctx);
    const branchVar = newVar(ctx);
    doc.write(`let ${outputVar};`);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      d.write(`const ${branchVar} = (() => {`);
      d.indented((d2) => {
        const innerOutput = generateCheck(d2, ctx, def.innerType, accessor);
        d2.write(`return ${innerOutput};`);
      });
      d.write(`})();`);
      d.write(`if (${branchVar} !== INVALID) ${outputVar} = ${branchVar};`);
    });
    doc.write(`} else {`);
    doc.indented((d) => {
      const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
      d.write(`${outputVar} = ${innerOutput};`);
    });
    doc.write(`}`);
    return outputVar;
  }

  const outputVar = buildsValue ? newVar(ctx) : null;
  if (outputVar) doc.write(`let ${outputVar};`);
  doc.write(`if (${accessor} !== undefined) {`);
  doc.indented((d) => {
    const innerOutput = generateCheck(d, ctx, def.innerType, accessor, buildsValue);
    if (outputVar && innerOutput !== null) d.write(`${outputVar} = ${innerOutput};`);
  });
  doc.write(`}`);
  return outputVar;
}

function isExactOptional(schema: SomeType): boolean {
  return (schema._zod as { traits?: Set<string> }).traits?.has("$ZodExactOptional") === true;
}

// A value-level fast path reads an absent key as `undefined`, so z.undefined(), z.any() and unions containing undefined would accept a missing property the runtime rejects.
function requiresPresenceCheck(schema: SomeType): boolean {
  return schema._zod.optin === undefined && fastPathAcceptsAbsence(schema);
}

function fastPathAcceptsAbsence(schema: SomeType): boolean {
  // An island is handed `input[key]` and cannot tell absent from explicitly undefined, so report absence-accepting and let the object emit the presence guard (#6405).
  if ((schema._zod.def as { coerce?: boolean }).coerce) return true;

  const def = schema._zod.def as {
    type: string;
    values?: unknown[];
    innerType?: SomeType;
    options?: SomeType[];
    in?: SomeType;
    out?: SomeType;
    left?: SomeType;
    right?: SomeType;
  };

  switch (def.type) {
    case "any":
    case "unknown":
    case "undefined":
    case "void":
    case "default":
    case "prefault":
    case "transform":
    case "custom":
    case "lazy":
      return true;
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
    case "null":
    case "never":
    case "nan":
    case "date":
    case "object":
    case "array":
    case "tuple":
    case "record":
    case "map":
    case "set":
    case "file":
    case "template_literal":
      return false;
    case "nonoptional":
      // Normally rejects an absent key, but not when something inside supplies a value for it: `.default(v).optional().nonoptional()` accepts absence and yields v. Defer to the inner — over-reporting here only costs a presence check, and a fast path that wrongly rejects still falls back to the runtime.
      return def.innerType ? fastPathAcceptsAbsence(def.innerType) : false;
    case "literal":
      return !!def.values?.includes(undefined);
    case "enum":
      return !!(schema._zod as unknown as { values?: Set<unknown> }).values?.has(undefined);
    case "optional":
    case "nullable":
    case "readonly":
    case "success":
      return def.innerType ? fastPathAcceptsAbsence(def.innerType) : true;
    case "catch":
      // catch always produces a value (inner may fail → catchValue substitutes), so it accepts an absent key regardless of inner.
      return true;
    case "union":
      return def.options ? def.options.some(fastPathAcceptsAbsence) : true;
    case "intersection":
      if (!def.left || !def.right) return true;
      return fastPathAcceptsAbsence(def.left) && fastPathAcceptsAbsence(def.right);
    case "pipe":
      return def.in ? fastPathAcceptsAbsence(def.in) : true;
    default:
      return true;
  }
}

/** The middle rung permits absence without supplying anything in its place, so an absent key contributes nothing — mirrors the leading gate in `handlePropertyResult`. */
function dropsWhenAbsent(schema: SomeType): boolean {
  return schema._zod.optin === "optional" && schema._zod.optout === "optional";
}

// Whether a schema's success-path output can be `undefined`. Object output
// assembly gives such props the runtime's value-or-presence inclusion rule;
// everything else keeps the unconditional object-literal slot.
function mayOutputUndefined(schema: SomeType): boolean {
  const def = schema._zod.def as {
    type: string;
    values?: unknown[];
    innerType?: SomeType;
    options?: SomeType[];
    out?: SomeType;
    left?: SomeType;
    right?: SomeType;
  };
  switch (def.type) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
    case "null":
    case "nan":
    case "date":
    case "object":
    case "array":
    case "tuple":
    case "record":
    case "map":
    case "set":
    case "file":
    case "template_literal":
    case "never":
    case "success":
      return false;
    case "literal":
      return !!def.values?.includes(undefined);
    case "enum":
      return !!(schema._zod as unknown as { values?: Set<unknown> }).values?.has(undefined);
    case "optional":
      return true;
    case "nullable":
    case "readonly":
    case "nonoptional":
      return def.innerType ? mayOutputUndefined(def.innerType) : true;
    case "union":
      return def.options ? def.options.some(mayOutputUndefined) : true;
    case "intersection":
      return !def.left || !def.right || mayOutputUndefined(def.left) || mayOutputUndefined(def.right);
    case "pipe":
      return def.out ? mayOutputUndefined(def.out) : true;
    default:
      // any/unknown/undefined/void/default/prefault/transform/custom/lazy/catch
      return true;
  }
}

function generateNullableCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  buildsValue = true
): string | null {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  const outputVar = buildsValue ? newVar(ctx) : null;
  if (outputVar) doc.write(`let ${outputVar} = null;`);
  doc.write(`if (${accessor} !== null) {`);
  doc.indented((d) => {
    const innerOutput = generateCheck(d, ctx, def.innerType, accessor, buildsValue);
    if (outputVar && innerOutput !== null) d.write(`${outputVar} = ${innerOutput};`);
  });
  doc.write(`}`);
  return outputVar;
}

function generateArrayCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  buildsValue = true
): string | null {
  const def = schema._zod.def as unknown as { element: SomeType };
  doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);

  // Build a new array with validated/transformed elements.
  const outputVar = buildsValue ? newVar(ctx) : null;
  const iVar = newVar(ctx);
  const elemVar = newVar(ctx);

  if (outputVar) doc.write(`const ${outputVar} = new Array(${accessor}.length);`);
  doc.write(`for (let ${iVar} = 0; ${iVar} < ${accessor}.length; ${iVar}++) {`);
  doc.indented((d) => {
    d.write(`const ${elemVar} = ${accessor}[${iVar}];`);
    const elemOutput = compileChild(d, ctx, def.element, elemVar, buildsValue);
    if (outputVar && elemOutput !== null) d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
  });
  doc.write(`}`);

  return outputVar;
}

function generateLiteralCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { values: unknown[] };
  const values = def.values;

  // Anything but a single value goes through Set.has: multi-value so every value participates, empty so nothing does — values[0] would be undefined and compile to an `!== undefined` check that accepts it. Single-value stays inlined for speed.
  if (values.length !== 1) {
    const literalSet = addConstant(ctx, new Set(values));
    doc.write(`if (!${literalSet}.has(${accessor})) return INVALID;`);
    return accessor;
  }

  const value = values[0];
  // `$ZodLiteral` matches with `values.has`, i.e. SameValueZero, so NaN matches itself. `x !== NaN` is true for every input, which would reject everything — hand it to the same Set form the multi-value path uses.
  if (typeof value === "number" && Number.isNaN(value)) {
    const literalSet = addConstant(ctx, new Set(values));
    doc.write(`if (!${literalSet}.has(${accessor})) return INVALID;`);
    return accessor;
  }
  if (typeof value === "string") {
    doc.write(`if (${accessor} !== ${util.esc(value)}) return INVALID;`);
  } else if (typeof value === "number" || typeof value === "boolean") {
    doc.write(`if (${accessor} !== ${value}) return INVALID;`);
  } else if (value === null) {
    doc.write(`if (${accessor} !== null) return INVALID;`);
  } else if (value === undefined) {
    doc.write(`if (${accessor} !== undefined) return INVALID;`);
  } else if (typeof value === "bigint") {
    doc.write(`if (${accessor} !== ${value}n) return INVALID;`);
  } else {
    throw new ZodCompileUnsupportedError(`literal type ${typeof value}`);
  }
  return accessor;
}

function generateEnumCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const values = (schema._zod as unknown as { values?: Set<unknown> }).values;
  // z.partialRecord and friends clear `_zod.values`, leaving no set to test membership against. Throw rather than emit INVALID so a union falls back whole instead of counting a false rejection.
  if (!values) {
    throw new ZodCompileUnsupportedError("enum schema without enumerated values");
  }
  const enumSet = addConstant(ctx, values);
  doc.write(`if (!${enumSet}.has(${accessor})) return INVALID;`);
  return accessor;
}

function generateWrapperCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  return generateCheck(doc, ctx, def.innerType, accessor);
}

function generateDefaultCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };

  // `defaultValue` is an accessor on schemas built through the classic/mini
  // factories and a plain data property on ones rebuilt programmatically
  // (deepPartial and friends). Read it off the def either way — taking only
  // `descriptor.get` silently dropped the default for the second kind, so
  // `.default(v)` compiled to `undefined` instead of `v`.
  const descriptor = Object.getOwnPropertyDescriptor(schema._zod.def, "defaultValue");
  const defaultGetter = descriptor
    ? () => (schema._zod.def as unknown as { defaultValue: unknown }).defaultValue
    : undefined;

  // prefault differs from default: undefined-input is first replaced with the prefault value, then run through the inner schema.
  if (schema._zod.def.type === "prefault") {
    if (!defaultGetter) {
      return generateCheck(doc, ctx, def.innerType, accessor);
    }
    const defaultFn = addConstant(ctx, defaultGetter);
    const inputVar = newVar(ctx);
    doc.write(`let ${inputVar} = ${accessor};`);
    doc.write(`if (${accessor} === undefined) ${inputVar} = ${defaultFn}();`);
    return generateCheck(doc, ctx, def.innerType, inputVar);
  }

  const outputVar = newVar(ctx);

  // Default allows undefined (replaces with default value), otherwise validates inner type
  if (defaultGetter) {
    const defaultFn = addConstant(ctx, defaultGetter);
    const cloneFn = addConstant(ctx, util.shallowClone);
    doc.write(`let ${outputVar};`);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      // Shallow-clone the default so callers can mutate the result without affecting subsequent parses (#5855 — also covers Map/Set).
      d.write(`${outputVar} = ${cloneFn}(${defaultFn}());`);
    });
    doc.write(`} else {`);
    doc.indented((d) => {
      const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
      d.write(`${outputVar} = ${innerOutput} === undefined ? ${cloneFn}(${defaultFn}()) : ${innerOutput};`);
    });
    doc.write(`}`);
  } else {
    doc.write(`let ${outputVar};`);
    doc.write(`if (${accessor} !== undefined) {`);
    doc.indented((d) => {
      const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
      d.write(`${outputVar} = ${innerOutput};`);
    });
    doc.write(`}`);
  }

  return outputVar;
}

function generateNonOptionalCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  // The runtime inspects what the inner produced, not what it was given: a catch can turn a defined input into undefined, a default an absent one into a value.
  const innerOutput = generateCheck(doc, ctx, def.innerType, accessor);
  const outputVar = newVar(ctx);
  doc.write(`const ${outputVar} = ${innerOutput};`);
  doc.write(`if (${outputVar} === undefined) return INVALID;`);
  return outputVar;
}

function generateTupleCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { items: SomeType[]; rest: SomeType | null };
  const items = def.items;
  const rest = def.rest;

  doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);

  // Mirror the runtime's getTupleOptStart: find the first index where every subsequent slot accepts `undefined` (i.e. is optional on input). Anything shorter than this is too_small; trailing absent slots are legal.
  const optinStart = getTupleOptStart(items, "optin");
  const optoutStart = getTupleOptStart(items, "optout");

  // Length bounds
  if (rest) {
    // With rest: minimum length is the last required input slot
    doc.write(`if (${accessor}.length < ${optinStart}) return INVALID;`);
  } else {
    // No rest: input must be in [optinStart, items.length]
    doc.write(`if (${accessor}.length < ${optinStart} || ${accessor}.length > ${items.length}) return INVALID;`);
  }

  // Build the output in assignment order so absent optional-output tail slots can truncate while default/prefault slots still fill missing positions.
  const outputVar = newVar(ctx);
  doc.write(`const ${outputVar} = [];`);

  // Validate and collect each fixed item
  for (let i = 0; i < items.length; i++) {
    const itemSchema = items[i]!;
    if (i >= optoutStart) {
      doc.write(`if (${outputVar}.length === ${i}) {`);
      doc.indented((d) => {
        d.write(`if (${i} < ${accessor}.length) {`);
        d.indented((d2) => {
          const elemVar = newVar(ctx);
          d2.write(`const ${elemVar} = ${accessor}[${i}];`);
          const elemOutput = compileChild(d2, ctx, itemSchema, elemVar);
          d2.write(`${outputVar}[${i}] = ${elemOutput};`);
        });
        d.write(`} else {`);
        d.indented((d2) => {
          // Middle rung: absence supplies nothing in its place, so truncate rather than running the item on `undefined` and keeping what it invents. Mirrors the leading gate in `handleTupleResults`.
          if (dropsWhenAbsent(itemSchema)) {
            d2.write(`${outputVar}.length = ${i};`);
            return;
          }
          const elemVar = newVar(ctx);
          const branchVar = newVar(ctx);
          d2.write(`const ${elemVar} = undefined;`);
          d2.write(`const ${branchVar} = (() => {`);
          d2.indented((d3) => {
            const elemOutput = compileChild(d3, ctx, itemSchema, elemVar);
            d3.write(`return ${elemOutput};`);
          });
          d2.write(`})();`);
          d2.write(`if (${branchVar} === INVALID || ${branchVar} === undefined) ${outputVar}.length = ${i};`);
          d2.write(`else ${outputVar}[${i}] = ${branchVar};`);
        });
        d.write(`}`);
      });
      doc.write(`}`);
    } else {
      const elemVar = newVar(ctx);
      doc.write(`const ${elemVar} = ${accessor}[${i}];`);
      const elemOutput = compileChild(doc, ctx, itemSchema, elemVar);
      doc.write(`${outputVar}[${i}] = ${elemOutput};`);
    }
  }

  // Validate and collect rest elements if present
  if (rest) {
    const iVar = newVar(ctx);
    const elemVar = newVar(ctx);
    doc.write(`for (let ${iVar} = ${items.length}; ${iVar} < ${accessor}.length; ${iVar}++) {`);
    doc.indented((d) => {
      d.write(`const ${elemVar} = ${accessor}[${iVar}];`);
      const elemOutput = compileChild(d, ctx, rest, elemVar);
      d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
    });
    doc.write(`}`);
  }

  return outputVar;
}

function getTupleOptStart(items: SomeType[], key: "optin" | "optout"): number {
  for (let i = items.length - 1; i >= 0; i--) {
    // Mirrors the runtime: optin is a three-rung ladder so any rung above `undefined` permits an absent slot; optout stays two-valued.
    const omittable = key === "optin" ? items[i]!._zod.optin !== undefined : items[i]!._zod.optout === "optional";
    if (!omittable) return i + 1;
  }
  return 0;
}

function generateUnionCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as {
    options: SomeType[];
    inclusive?: boolean;
    discriminator?: string;
    unionFallback?: boolean;
  };
  const options = def.options;

  if (def.discriminator) {
    return generateDiscriminatedUnionCheck(
      doc,
      ctx,
      def as { options: SomeType[]; discriminator: string; unionFallback?: boolean },
      accessor
    );
  }

  // z.xor requires *exactly one* option to match. Match-counting in the fast path is only sound if every branch is exactly as strict as the runtime — any falsely-rejecting branch silently turns a multi-match rejection into an accept. Force the runtime for this rare combinator.
  if (def.inclusive === false) {
    throw new ZodCompileUnsupportedError("exclusive unions (z.xor)");
  }

  if (options.length === 0) {
    doc.write("return INVALID;");
    return accessor;
  }

  if (options.length === 1) {
    return generateCheck(doc, ctx, options[0]!, accessor);
  }

  // Check if all options are bare literals - use Set optimization. A literal option carrying checks (e.g. .refine) must take the general path or the Set would accept values its checks reject.
  const allLiterals = options.every(
    (opt) => opt._zod.def.type === "literal" && !(opt._zod.def.checks as unknown[] | undefined)?.length
  );
  if (allLiterals) {
    const values = new Set(options.flatMap((opt) => (opt._zod.def as unknown as { values: unknown[] }).values));
    const valuesConst = addConstant(ctx, values);
    doc.write(`if (!${valuesConst}.has(${accessor})) return INVALID;`);
    return accessor;
  }

  // General case: try each option until one succeeds Use IIFEs that return the output or INVALID
  const outputVar = newVar(ctx);
  doc.write(`let ${outputVar};`);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i]!;

    if (i === 0) {
      doc.write(`${outputVar} = (() => {`);
    } else {
      doc.write(`if (${outputVar} === INVALID) ${outputVar} = (() => {`);
    }

    doc.indented((d) => {
      // Generate check inside IIFE - returns INVALID on failure
      const branchOutput = generateCheck(d, ctx, opt, accessor);
      d.write(`return ${branchOutput};`);
    });
    doc.write(`})();`);
  }

  doc.write(`if (${outputVar} === INVALID) return INVALID;`);
  return outputVar;
}

function generateDiscriminatedUnionCheck(
  doc: Doc,
  ctx: CompileContext,
  def: { options: SomeType[]; discriminator: string; unionFallback?: boolean },
  accessor: string
): string {
  if (def.unionFallback) {
    throw new ZodCompileUnsupportedError("discriminated union with unionFallback");
  }

  if (def.options.length === 0) {
    doc.write("return INVALID;");
    return accessor;
  }

  const discVar = newVar(ctx);
  const outputVar = newVar(ctx);
  doc.write(`const ${discVar} = ${accessor}?.[${util.esc(def.discriminator)}];`);
  doc.write(`let ${outputVar};`);

  let firstBranch = true;
  const claimed = new Set<util.Primitive>();
  for (const option of def.options) {
    const values = option._zod.propValues?.[def.discriminator];
    if (!values || values.size === 0) {
      throw new ZodCompileUnsupportedError("discriminated union option without static discriminator values");
    }

    // Two options claiming one value are not discriminable, and the branch chain below would silently give it to the first. Declining to compile hands that back to the interpreter, whose own map build reports it.
    for (const value of values) {
      if (claimed.has(value)) {
        throw new ZodCompileUnsupportedError(`duplicate discriminator value ${String(value)}`);
      }
      claimed.add(value);
    }

    const conditions = Array.from(values, (value) => literalEquality(ctx, discVar, value));
    const prefix = firstBranch ? "if" : "else if";
    doc.write(`${prefix} (${conditions.join(" || ")}) {`);
    doc.indented((d) => {
      const branchOutput = generateCheck(d, ctx, option, accessor);
      d.write(`${outputVar} = ${branchOutput};`);
    });
    doc.write(`}`);
    firstBranch = false;
  }

  doc.write(`else { return INVALID; }`);
  return outputVar;
}

function literalEquality(ctx: CompileContext, accessor: string, value: unknown): string {
  if (typeof value === "string") return `${accessor} === ${util.esc(value)}`;
  if (typeof value === "number") {
    if (Number.isNaN(value)) return `Number.isNaN(${accessor})`;
    return `${accessor} === ${value}`;
  }
  if (typeof value === "boolean") return `${accessor} === ${value}`;
  if (value === null) return `${accessor} === null`;
  if (value === undefined) return `${accessor} === undefined`;
  if (typeof value === "bigint") return `${accessor} === ${value}n`;
  if (typeof value === "symbol") {
    const symbolConst = addConstant(ctx, value);
    return `${accessor} === ${symbolConst}`;
  }
  throw new ZodCompileUnsupportedError(`literal discriminator value ${String(value)}`);
}

function generateIntersectionCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { left: SomeType; right: SomeType };
  // An unmergeable merge, and a child failing before the merge is even reached, both return INVALID for a case the interpreter answers with a throw.
  ctx.definite = false;
  const leftOutput = compileChild(doc, ctx, def.left, accessor);
  const rightOutput = compileChild(doc, ctx, def.right, accessor);

  // Hoist the runtime merge helper so recursive object/array merge semantics stay in one place. If the merge is invalid, return INVALID and let the runtime fallback construct canonical errors.
  const mergeConst = addConstant(ctx, mergeValues);
  const mergedVar = newVar(ctx);
  doc.write(`const ${mergedVar} = ${mergeConst}(${leftOutput}, ${rightOutput});`);
  doc.write(`if (!${mergedVar}.valid) return INVALID;`);
  return `${mergedVar}.data`;
}

function generateRecordCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { keyType: SomeType; valueType: SomeType };

  // Use util.isPlainObject (rejects Date, Map, Set, class instances, etc.) to match runtime behavior. Hoisted call instead of inline so this stays a single source of truth with the runtime parser.
  const isPlainObjectConst = addConstant(ctx, util.isPlainObject);
  doc.write(`if (!${isPlainObjectConst}(${accessor})) return INVALID;`);

  const outputVar = newVar(ctx);
  const kVar = newVar(ctx);
  const valVar = newVar(ctx);

  doc.write(`const ${outputVar} = {};`);

  // Exhaustive record. The runtime gates this on `values && !def.partial`, since z.partialRecord keeps its value set but makes every key optional; a loose record passes unrecognized keys through, which the per-key scan cannot express.
  const recordDef = def as unknown as { mode?: string; partial?: boolean };
  const keyValues = recordDef.partial ? undefined : (def.keyType._zod as unknown as { values?: Set<unknown> }).values;
  if (keyValues) {
    const inputKeys: Array<string | symbol> = [];
    for (const key of keyValues) {
      if (!(typeof key === "string" || typeof key === "number" || typeof key === "symbol")) {
        throw new ZodCompileUnsupportedError(`record key value ${String(key)}`);
      }

      const inputKey = typeof key === "number" ? key.toString() : key;
      if (inputKey === "__proto__") {
        // `out["__proto__"] = v` would hit the prototype setter on the output.
        throw new ZodCompileUnsupportedError('record key "__proto__"');
      }
      inputKeys.push(inputKey);

      const keyConst = addConstant(ctx, key);
      const outKey = generateCheck(doc, ctx, def.keyType, keyConst);
      // Read the property once. Passing the raw expression let compileChild validate one read while the output write performed a second, so a getter could hand back a value nothing had checked.
      const valueVar = newVar(ctx);
      doc.write(`const ${valueVar} = ${accessor}[${literalPropertyKey(ctx, inputKey)}];`);
      const valOutput = compileChild(doc, ctx, def.valueType, valueVar);
      doc.write(`${outputVar}[${outKey}] = ${valOutput};`);
    }

    // `mode: "loose"` changes only what happens to unrecognized keys, so it belongs here rather than the per-present-key scan. Passing them through matches the runtime, which skips `__proto__`.
    const knownKeysConst = addConstant(ctx, new Set(inputKeys));
    doc.write(`for (const ${kVar} in ${accessor}) {`);
    doc.indented((d) => {
      d.write(`if (${knownKeysConst}.has(${kVar})) continue;`);
      if (recordDef.mode === "loose") {
        d.write(`if (${kVar} !== "__proto__") ${outputVar}[${kVar}] = ${accessor}[${kVar}];`);
      } else {
        d.write(`return INVALID;`);
      }
    });
    doc.write(`}`);
    return outputVar;
  }

  // The bare-string shortcut below only tests `typeof key === "string"`, so it
  // is correct exclusively for a `z.string()` carrying nothing else. A string
  // *format* lives on the def rather than in `checks` — `z.record(z.email(), …)`
  // reads as a plain string here — and coercion rewrites the key, so both have
  // to take the general path or the shortcut accepts keys the runtime rejects.
  const keyDef = def.keyType._zod.def as { type: string; format?: string; coerce?: boolean; checks?: unknown[] };
  const keyIsBareString =
    keyDef.type === "string" && keyDef.format === undefined && !keyDef.coerce && (keyDef.checks?.length ?? 0) === 0;
  if (!keyIsBareString) {
    // A key schema with no value set is a constraint every key must satisfy
    // (`z.email()`, `z.string().min(3)`, `z.number()`, a template literal).
    // The runtime runs it against each own enumerable key and writes the value
    // under the key it produced, so compile it once and call it per key.
    const isLoose = (def as { mode?: string }).mode === "loose";
    // the key compiles in its own context, so carry its verdict out: a key schema that can answer INVALID undecidably makes this validator undecidable too
    const keyFn = compileFn(def.keyType);
    if (keyFn.definite === false) ctx.definite = false;
    const keyFast = addConstant(ctx, keyFn);
    const numericConst = addConstant(ctx, regexes.number);
    const propIsEnumerableConst = addConstant(ctx, Object.prototype.propertyIsEnumerable);
    const outKeyVar = newVar(ctx);

    doc.write(`for (const ${kVar} of Reflect.ownKeys(${accessor})) {`);
    doc.indented((d) => {
      d.write(`if (${kVar} === "__proto__") continue;`);
      d.write(`if (!${propIsEnumerableConst}.call(${accessor}, ${kVar})) continue;`);
      d.write(`let ${outKeyVar} = ${keyFast}(${kVar});`);
      // Numeric-string retry, mirroring the runtime: a key the schema rejects as a string is tried again as a number, so z.record(z.number(), …) matches the numeric keys JavaScript stringified on the way in.
      d.write(
        `if (${outKeyVar} === INVALID && typeof ${kVar} === "string" && ${numericConst}.test(${kVar})) ${outKeyVar} = ${keyFast}(Number(${kVar}));`
      );
      if (isLoose) {
        // A loose record keeps a key its schema rejects, copying the value across unvalidated rather than failing the parse.
        d.write(`if (${outKeyVar} === INVALID) { ${outputVar}[${kVar}] = ${accessor}[${kVar}]; continue; }`);
      } else {
        d.write(`if (${outKeyVar} === INVALID) return INVALID;`);
      }
      // The guard above tested the input key, but the schema can normalize an ordinary key into __proto__; re-check the one actually written under.
      d.write(`if (${outKeyVar} === "__proto__") continue;`);
      // Read once: the raw expression would be evaluated again by the output write below, so an accessor could return an unvalidated second value.
      const valueVar = newVar(ctx);
      d.write(`const ${valueVar} = ${accessor}[${kVar}];`);
      const valOutput = compileChild(d, ctx, def.valueType, valueVar);
      d.write(`${outputVar}[${outKeyVar}] = ${valOutput};`);
    });
    doc.write(`}`);
    return outputVar;
  }

  // Plain z.string() keys: iterate enumerable own keys and validate each value. Runtime uses Reflect.ownKeys so symbol keys participate in validation; matching that here prevents silently accepting objects with enumerable Symbol keys under z.record(z.string(), ...).
  const propIsEnumerable = addConstant(ctx, Object.prototype.propertyIsEnumerable);
  doc.write(`for (const ${kVar} of Reflect.ownKeys(${accessor})) {`);
  doc.indented((d) => {
    d.write(`if (${kVar} === "__proto__") continue;`);
    d.write(`if (!${propIsEnumerable}.call(${accessor}, ${kVar})) continue;`);
    d.write(`if (typeof ${kVar} !== "string") return INVALID;`);
    d.write(`const ${valVar} = ${accessor}[${kVar}];`);
    const valOutput = compileChild(d, ctx, def.valueType, valVar);
    d.write(`${outputVar}[${kVar}] = ${valOutput};`);
  });
  doc.write(`}`);

  return outputVar;
}

function literalPropertyKey(ctx: CompileContext, key: string | symbol): string {
  if (typeof key === "string") return util.esc(key);
  return addConstant(ctx, key);
}

function generateMapCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { keyType: SomeType; valueType: SomeType };

  doc.write(`if (!(${accessor} instanceof Map)) return INVALID;`);

  const outputVar = newVar(ctx);
  const kVar = newVar(ctx);
  const valVar = newVar(ctx);

  doc.write(`const ${outputVar} = new Map();`);
  doc.write(`for (const [${kVar}, ${valVar}] of ${accessor}) {`);
  doc.indented((d) => {
    const keyOutput = generateCheck(d, ctx, def.keyType, kVar);
    const valOutput = generateCheck(d, ctx, def.valueType, valVar);
    d.write(`${outputVar}.set(${keyOutput}, ${valOutput});`);
  });
  doc.write(`}`);

  return outputVar;
}

function generateSetCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { valueType: SomeType };

  doc.write(`if (!(${accessor} instanceof Set)) return INVALID;`);

  const outputVar = newVar(ctx);
  const valVar = newVar(ctx);

  doc.write(`const ${outputVar} = new Set();`);
  doc.write(`for (const ${valVar} of ${accessor}) {`);
  doc.indented((d) => {
    const valOutput = generateCheck(d, ctx, def.valueType, valVar);
    d.write(`${outputVar}.add(${valOutput});`);
  });
  doc.write(`}`);

  return outputVar;
}

function generateFileCheck(doc: Doc, accessor: string): string {
  // Runtime $ZodFile is a bare `instanceof File`, including the implicit global lookup. The previous duck-typed fallback accepted arbitrary {name, size} objects in File-less environments — behavior the runtime never had.
  doc.write(`if (!(${accessor} instanceof File)) return INVALID;`);
  return accessor;
}

function generateTemplateLiteralCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);

  // Template literal schemas have a pre-computed pattern in _zod.pattern
  const pattern = (schema._zod as unknown as { pattern: RegExp }).pattern;
  if (pattern) {
    const patternConst = addConstant(ctx, pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
  }
  return accessor;
}

function generateLazyCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  // For lazy schemas, we use a cached parser that falls back to runtime Zod parsing This handles recursive schemas correctly by avoiding infinite compilation loops
  const def = schema._zod.def as unknown as { getter: () => SomeType };
  const getterConst = addUserConstant(ctx, def.getter);
  const cacheConst = addConstant(ctx, { parser: null as ((input: unknown) => unknown) | null });

  doc.write(`if (!${cacheConst}.parser) {`);
  doc.indented((d) => {
    d.write(`const inner = ${getterConst}();`);
    d.write(`${cacheConst}.parser = function(input) {`);
    d.indented((d2) => {
      // Use runtime Zod parsing - this correctly handles recursive schemas Pass an empty ctx like runtimeRun does — runtime parsers read ctx.skipChecks/ctx.direction unconditionally and crash on undefined.
      d2.write(`const result = inner._zod.run({ value: input, issues: [] }, {});`);
      d2.write(`return result.issues.length === 0 ? result.value : INVALID;`);
    });
    d.write(`};`);
  });
  doc.write(`}`);

  const outputVar = newVar(ctx);
  doc.write(`const ${outputVar} = ${cacheConst}.parser(${accessor});`);
  doc.write(`if (${outputVar} === INVALID) return INVALID;`);
  return outputVar;
}

function generatePipeCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as {
    in: SomeType;
    out: SomeType;
    transform?: (value: unknown, payload: unknown) => unknown;
  };

  // Validate input type first
  const inputOutput = generateCheck(doc, ctx, def.in, accessor);

  if (def.transform) {
    // Apply transform and validate output. The transform may read its second `payload` argument (codec transforms like z.stringbool() push issues there) so wrap the call in a helper that spoofs a payload. Pushed issues signal INVALID and the wrapper falls back to the runtime, and a plain function handing back a promise answers INVALID too — union parity, but not a decidable rejection at the top level.
    if (isAsyncFunction(def.transform)) {
      throw new ZodCompileAsyncError("z.compile: async transforms in pipes are not supported");
    }
    const transformFn = def.transform;
    const helperFn = (value: unknown): unknown => {
      // `addIssue` has to be here: a transform reporting through it is reporting, not failing. Without it the call threw a TypeError that the old catch swallowed into a fallback, so every ctx.addIssue transform quietly lost its fast path and the real error was never visible.
      const fakePayload = { value, issues: [] as unknown[], addIssue: pushIssue };
      // A throw is deliberately not caught. The interpreter lets one propagate out of the whole parse; swallowing it into INVALID turned a thrown error into a merely-rejected union branch, so a later branch answered instead.
      const result = transformFn(value, fakePayload as any);
      if (result instanceof Promise) return INVALID;
      return fakePayload.issues.length === 0 ? result : INVALID;
    };
    const helperConst = addUserConstant(ctx, helperFn);
    const transformedVar = newVar(ctx);
    doc.write(`const ${transformedVar} = ${helperConst}(${inputOutput});`);
    doc.write(`if (${transformedVar} === INVALID) return INVALID;`);
    return generateCheck(doc, ctx, def.out, transformedVar);
  } else {
    // No transform - validate output type on same value
    return generateCheck(doc, ctx, def.out, inputOutput);
  }
}

//////////////////////////////////////////////////////////////////////////////
// Issue mode ("apply" codegen): the generated parser pushes the same raw issues the interpreter pushes instead of returning INVALID. Failure sites never hand-build issue objects — they cold-call the hoisted runtime parse/check of the failing node so the canonical issue comes from runtime code, and the generated code owns only the walk plumbing: path prefixes, abort/continue gating, sibling continuation, partial output assembly. Nodes with no native emission are handled by a node-scoped rerun island: the failing subtree runs through its own runtime parser and its issues merge in, which is exact parity at the cost of re-running that subtree's user callbacks (bounded at 2x, the same bound the whole-schema fallback has today).
//////////////////////////////////////////////////////////////////////////////

// mirrors util.prefixIssues, but from an index and applying a whole path prefix at once — same resulting arrays as the interpreter's per-level unshift
function prefixIssuesFrom(issues: unknown[], start: number, path: unknown[]): void {
  for (let i = start; i < issues.length; i++) {
    const iss = issues[i] as { path?: unknown[] };
    iss.path = iss.path ? [...path, ...iss.path] : path.slice();
  }
}

// Runs a node through its own runtime parser, merging its issues into the caller's payload — the issue path's escape hatch for constructs it doesn't model natively. A promise means an async member reached a sync parse, which the interpreter answers with a throw. `shared` marks a node whose runtime payload is the caller's own, so the abort flag a pipe or codec sets has to carry across.
function rerunNodeForIssues(
  schema: SomeType,
  value: unknown,
  payload: ParsePayload,
  pctx: ParseContextInternal | undefined,
  shared: boolean
): unknown {
  // unwrap a compiled wrapper or global-mode shim: the island wants the interpreter, and under global mode `_zod.run` is the wrapper whose issue parser is the very code calling this
  const live = schema._zod.run as ((p: ParsePayload, c: ParseContextInternal) => any) & {
    __originalRun?: (p: ParsePayload, c: ParseContextInternal) => any;
  };
  const run = live.__originalRun ?? live;
  const r = run({ value, issues: [] }, pctx ?? ({} as ParseContextInternal));
  if (r && typeof (r as Promise<unknown>).then === "function") throw new $ZodAsyncError();
  if (r.issues.length) payload.issues.push(...r.issues);
  if (shared && r.aborted) payload.aborted = true;
  return r.value;
}

// mirrors handleUnionResults for the all-branches-failed case: adopt the lone non-aborted branch outright, else aggregate every branch's finalized issues into one invalid_union
function unionIssuesForCompiled(
  inst: SomeType,
  input: unknown,
  payload: ParsePayload,
  results: ParsePayload[],
  pctx: ParseContextInternal | undefined,
  shared: boolean
): unknown {
  for (const r of results) {
    if (r.issues.length === 0) return r.value;
  }
  const nonaborted = results.filter((r) => !util.aborted(r));
  if (nonaborted.length === 1) {
    const r = nonaborted[0]!;
    payload.issues.push(...r.issues);
    if (shared && r.aborted) payload.aborted = true;
    return r.value;
  }
  payload.issues.push({
    code: "invalid_union",
    input,
    inst,
    errors: results.map((result) => result.issues.map((iss) => util.finalizeIssue(iss as never, pctx, config()))),
  } as never);
  return input;
}

// mirrors handlePipeResult's stop rule: any issue except unrecognized_keys halts the pipe, continuable or not
function pipeStops(issues: unknown[], start: number): boolean {
  for (let i = start; i < issues.length; i++) {
    if ((issues[i] as { code?: string }).code !== "unrecognized_keys") return true;
  }
  return false;
}

// mirrors handleNonOptionalResult's push; kept as a runtime helper so the shape lives in one place on this side
function pushNonOptionalIssue(issues: unknown[], input: unknown, inst: unknown): void {
  (issues as { push: (i: unknown) => void }).push({ code: "invalid_type", expected: "nonoptional", input, inst });
}

/** JS expressions for the path from the root to the current node — string literals for static keys, variable names for loop indices, constant names for symbols. */
type IssuePath = string[];

function issueConsts(ctx: CompileContext) {
  return {
    pfx: addConstant(ctx, prefixIssuesFrom),
    abt: addConstant(ctx, util.aborted),
    eabt: addConstant(ctx, util.explicitlyAborted),
    att: addConstant(ctx, util.attachSchema),
  };
}

const SP_INIT = `(_sp ??= { value: null, issues: payload.issues })`;

// Cold block for a failed leaf type test: re-run the node's runtime parse so it pushes the canonical issue, then prefix. The parse re-evaluates a trivial predicate; the price of never hand-building an issue shape.
function leafFailBlock(ctx: CompileContext, schema: SomeType, accessor: string, path: IssuePath): string {
  const { pfx } = issueConsts(ctx);
  const parseConst = addConstant(ctx, schema._zod.parse);
  const m = newVar(ctx);
  const prefix = path.length ? ` ${pfx}(payload.issues, ${m}, [${path.join(", ")}]);` : "";
  return `{ ${SP_INIT}.value = ${accessor}; const ${m} = payload.issues.length; ${parseConst}(_sp, pctx);${prefix} }`;
}

interface ChainGate {
  ab: string;
  ex: string | null;
}

// Cold block for a failed check predicate: re-run the runtime check so it pushes canonically, stamp the owning schema, prefix, and update the abort gates. `label` breaks out of the check's remaining hot statements (multi-site checks like url).
function checkFailBlock(
  ctx: CompileContext,
  check: { _zod: { check?: unknown } },
  ownerConst: string,
  accessor: string,
  path: IssuePath,
  gate: ChainGate,
  label: string
): string {
  const { pfx, abt, eabt, att } = issueConsts(ctx);
  const checkFn = (check._zod as { check?: unknown }).check;
  if (typeof checkFn !== "function") throw new ZodCompileUnsupportedError("check without a runtime check function");
  const checkConst = addConstant(ctx, checkFn);
  const m = newVar(ctx);
  const prefix = path.length ? ` ${pfx}(payload.issues, ${m}, [${path.join(", ")}]);` : "";
  const exUpd = gate.ex ? ` if (!${gate.ex}) ${gate.ex} = ${eabt}(payload, ${m});` : "";
  return `{ ${SP_INIT}.value = ${accessor}; const ${m} = payload.issues.length; ${checkConst}(_sp); ${att}(payload.issues, ${m}, ${ownerConst});${prefix} if (!${gate.ab}) ${gate.ab} = ${abt}(payload, ${m});${exUpd} break ${label}; }`;
}

/**
 * Issue-mode check chain. Mirrors the runChecks loop in $ZodType.init: a check
 * runs unless the chain is aborted, a when-carrying check consults its `when`
 * instead (and skips only on explicit abort), and every failure recomputes the
 * gates from the issues it pushed. `valueVar` must be a reassignable binding —
 * overwrite/url/refine rewrite it in place.
 */
function generateChecksIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  valueVar: string,
  path: IssuePath,
  nodeMark: string,
  abOverride: string | null = null
): void {
  const defChecks = (schema._zod.def.checks as SupportedCheck[] | undefined) ?? [];
  const isOwnCheck = (schema._zod as { traits?: Set<string> }).traits?.has("$ZodCheck") === true;
  const list: SupportedCheck[] = isOwnCheck ? [schema as unknown as SupportedCheck, ...defChecks] : defChecks;
  if (list.length === 0) return;

  const { pfx, abt, eabt, att } = issueConsts(ctx);
  const ownerConst = addConstant(ctx, schema);
  const hasWhen = list.some((c) => {
    const d = c._zod.def as { when?: unknown; check: string };
    return !!d.when;
  });

  const gate: ChainGate = { ab: newVar(ctx), ex: hasWhen ? newVar(ctx) : null };
  // a stopped pipe reads as aborted (explicitly too) whatever its issues' continue flags say, matching util.aborted's payload.aborted short-circuit on the runtime's returned payload
  const pre = abOverride ? `${abOverride} || ` : "";
  doc.write(`let ${gate.ab} = ${pre}(payload.issues.length > ${nodeMark} && ${abt}(payload, ${nodeMark}));`);
  if (gate.ex)
    doc.write(`let ${gate.ex} = ${pre}(payload.issues.length > ${nodeMark} && ${eabt}(payload, ${nodeMark}));`);

  for (const check of list) {
    const def = check._zod.def as { check: string; when?: (p: unknown) => boolean };
    if (def.when && !WHEN_DEFAULTED_CHECKS.has(def.check)) {
      throw new ZodCompileUnsupportedError(`check with a custom "when" condition`);
    }
    const guard = def.when
      ? `(!${gate.ab} || (!${gate.ex} && ${addConstant(ctx, def.when)}((${SP_INIT}.value = ${valueVar}, _sp))))`
      : `!${gate.ab}`;

    switch (def.check) {
      case "custom": {
        // the check function runs hot — it IS the user callback, and it pushes its own canonical issue (with the normalizing addIssue for superRefine), so there is no cold re-run and the callback executes exactly once
        const c = check as CustomCheck;
        const fn = c._zod.check ?? c._zod.def.fn;
        if (!fn) throw new ZodCompileUnsupportedError("custom check without a predicate or check function");
        if (
          isAsyncFunction(fn) ||
          (c._zod.def.fn && isAsyncFunction(c._zod.def.fn)) ||
          (c._zod.check && isAsyncFunction(c._zod.check))
        ) {
          throw new ZodCompileAsyncError();
        }
        const checkConst = addConstant(ctx, c._zod.check);
        const throwAsyncConst = addConstant(ctx, throwAsync);
        const m = newVar(ctx);
        const r = newVar(ctx);
        doc.write(`if (${guard}) {`);
        doc.indented((d) => {
          d.write(`${SP_INIT}.value = ${valueVar};`);
          d.write(`const ${m} = payload.issues.length;`);
          d.write(`const ${r} = ${checkConst}(_sp);`);
          d.write(`if (${r} instanceof Promise) ${throwAsyncConst}();`);
          d.write(`if (payload.issues.length > ${m}) {`);
          d.indented((d2) => {
            d2.write(`${att}(payload.issues, ${m}, ${ownerConst});`);
            if (path.length) d2.write(`${pfx}(payload.issues, ${m}, [${path.join(", ")}]);`);
            d2.write(`if (!${gate.ab}) ${gate.ab} = ${abt}(payload, ${m});`);
            if (gate.ex) d2.write(`if (!${gate.ex}) ${gate.ex} = ${eabt}(payload, ${m});`);
          });
          d.write(`}`);
          d.write(`${valueVar} = _sp.value;`);
        });
        doc.write(`}`);
        break;
      }
      case "overwrite": {
        const tx = (check as checks.$ZodCheckOverwrite)._zod.def.tx;
        if (!tx) throw new ZodCompileUnsupportedError("overwrite check without a transform function");
        if (isAsyncFunction(tx)) throw new ZodCompileAsyncError();
        const txConst = addConstant(ctx, tx);
        doc.write(`if (${guard}) ${valueVar} = ${txConst}(${valueVar});`);
        break;
      }
      case "property":
      case "properties": {
        // hot: the fast-mode emission inside an IIFE; cold: re-run the whole check so it pushes canonically (it re-walks its children through the runtime)
        const r = newVar(ctx);
        const label = `c${newVar(ctx)}`;
        doc.write(`if (${guard}) ${label}: {`);
        doc.indented((d) => {
          d.write(`const ${r} = (() => {`);
          d.indented((d2) => {
            if (def.check === "property") {
              generatePropertyCheck(d2, ctx, check._zod.def as checks.$ZodCheckPropertyDef, valueVar);
            } else {
              generatePropertiesChecks(d2, ctx, check._zod.def as unknown as $ZodPropertiesDef, valueVar, false);
            }
            d2.write(`return true;`);
          });
          d.write(`})();`);
          d.write(
            `if (${r} === INVALID) ${checkFailBlock(ctx, check as { _zod: { check?: unknown } }, ownerConst, valueVar, path, gate, label)}`
          );
        });
        doc.write(`}`);
        break;
      }
      default: {
        const label = `c${newVar(ctx)}`;
        doc.write(`if (${guard}) ${label}: {`);
        doc.indented((d) => {
          const fail = () =>
            checkFailBlock(ctx, check as { _zod: { check?: unknown } }, ownerConst, valueVar, path, gate, label);
          const out = emitCheckPredicate(d, ctx, check, valueVar, fail);
          if (out !== valueVar) d.write(`${valueVar} = ${out};`);
        });
        doc.write(`}`);
      }
    }
  }
}

function emitIssueIsland(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const { pfx } = issueConsts(ctx);
  const schemaConst = addConstant(ctx, schema);
  const rerunConst = addConstant(ctx, rerunNodeForIssues);
  const m = newVar(ctx);
  const v = newVar(ctx);
  doc.write(`const ${m} = payload.issues.length;`);
  doc.write(`const ${v} = ${rerunConst}(${schemaConst}, ${accessor}, payload, pctx, ${shared});`);
  if (path.length) doc.write(`if (payload.issues.length > ${m}) ${pfx}(payload.issues, ${m}, [${path.join(", ")}]);`);
  return v;
}

// Issue-mode counterpart of compileChild: try the native emission, roll back and island on an islandable refusal.
function compileChildIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const contentLen = doc.content.length;
  const constantCount = ctx.constants.size;
  const constantCounter = ctx.constantCounter;
  const varCounter = ctx.varCounter;
  try {
    return generateCheckIssues(doc, ctx, schema, accessor, path, shared);
  } catch (err) {
    if (!(err instanceof ZodCompileUnsupportedError) || !err.islandable) throw err;
    doc.content.length = contentLen;
    if (ctx.constants.size > constantCount) {
      const trailing = Array.from(ctx.constants.keys()).slice(constantCount);
      for (const k of trailing) ctx.constants.delete(k);
    }
    ctx.constantCounter = constantCounter;
    ctx.varCounter = varCounter;
    return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
  }
}

// inverted type predicates for the simple-parse leaves; keep in lock-step with the generate*Check emissions above
function leafFailCondition(ctx: CompileContext, schema: SomeType, accessor: string): string | null {
  const def = schema._zod.def as { type: string; values?: unknown[] };
  switch (def.type) {
    case "string":
      return `typeof ${accessor} !== "string"`;
    case "number":
      return `typeof ${accessor} !== "number" || !Number.isFinite(${accessor})`;
    case "boolean":
      return `typeof ${accessor} !== "boolean"`;
    case "bigint":
      return `typeof ${accessor} !== "bigint"`;
    case "symbol":
      return `typeof ${accessor} !== "symbol"`;
    case "undefined":
    case "void":
      return `${accessor} !== undefined`;
    case "null":
      return `${accessor} !== null`;
    case "nan":
      return `typeof ${accessor} !== "number" || !Number.isNaN(${accessor})`;
    case "date":
      return `!(${accessor} instanceof Date) || Number.isNaN(${accessor}.getTime())`;
    case "file":
      return `!(${accessor} instanceof File)`;
    case "template_literal": {
      const pattern = (schema._zod as unknown as { pattern: RegExp }).pattern;
      if (!pattern) throw new ZodCompileUnsupportedError("template literal without a pattern");
      const patternConst = addConstant(ctx, pattern);
      return `typeof ${accessor} !== "string" || (${patternConst}.lastIndex = 0, !${patternConst}.test(${accessor}))`;
    }
    case "enum": {
      const values = (schema._zod as unknown as { values?: Set<unknown> }).values;
      if (!values) throw new ZodCompileUnsupportedError("enum schema without enumerated values");
      return `!${addConstant(ctx, values)}.has(${accessor})`;
    }
    case "literal": {
      const values = def.values!;
      if (values.length !== 1 || (typeof values[0] === "number" && Number.isNaN(values[0]))) {
        return `!${addConstant(ctx, new Set(values))}.has(${accessor})`;
      }
      const value = values[0];
      if (typeof value === "string") return `${accessor} !== ${util.esc(value)}`;
      if (typeof value === "number" || typeof value === "boolean") return `${accessor} !== ${value}`;
      if (value === null) return `${accessor} !== null`;
      if (value === undefined) return `${accessor} !== undefined`;
      if (typeof value === "bigint") return `${accessor} !== ${value}n`;
      throw new ZodCompileUnsupportedError(`literal type ${typeof value}`);
    }
    case "any":
    case "unknown":
    case "custom":
    case "transform":
      return null;
    default:
      throw new ZodCompileUnsupportedError(`schema type ${def.type} as an issue-mode leaf`);
  }
}

const ISSUE_LEAF_TYPES = new Set([
  "string",
  "number",
  "boolean",
  "bigint",
  "symbol",
  "undefined",
  "void",
  "null",
  "nan",
  "date",
  "file",
  "template_literal",
  "enum",
  "literal",
  "any",
  "unknown",
  "custom",
]);

// Central issue-mode dispatch. Every native node shares the pattern: take a mark, emit the node body, then run the node's own check chain against the mark — the chain lives HERE (not per node) because any schema type can carry checks. Island cases return before the chain; their rerun covers checks.
function generateCheckIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def;
  const type = def.type as SupportedSchemaType;

  // coercion rewrites the value before the type test — the interpreter models it, so island the node
  if ((def as { coerce?: boolean }).coerce) {
    return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
  }

  const defChecks = (schema._zod.def.checks as unknown[] | undefined) ?? [];
  const isOwnCheck = (schema._zod as { traits?: Set<string> }).traits?.has("$ZodCheck") === true;
  const hasChain = defChecks.length > 0 || isOwnCheck;

  const mark = newVar(ctx);
  doc.write(`const ${mark} = payload.issues.length;`);

  let value: string;
  let abOverride: string | null = null;

  if (ISSUE_LEAF_TYPES.has(type)) {
    value = generateLeafIssues(doc, ctx, schema, accessor, path);
  } else {
    switch (type) {
      case "never": {
        // unconditional canonical push; value stays the input, like the interpreter
        doc.write(leafFailBlock(ctx, schema, accessor, path));
        value = accessor;
        break;
      }
      case "object":
        value = generateObjectIssues(doc, ctx, schema, accessor, path);
        break;
      case "array":
        value = generateArrayIssues(doc, ctx, schema, accessor, path);
        break;
      case "optional":
        value = generateOptionalIssues(doc, ctx, schema, accessor, path, shared);
        break;
      case "nullable": {
        const inner = (def as unknown as { innerType: SomeType }).innerType;
        const v = newVar(ctx);
        doc.write(`let ${v} = null;`);
        doc.write(`if (${accessor} !== null) {`);
        doc.indented((d) => {
          const iv = compileChildIssues(d, ctx, inner, accessor, path, shared);
          d.write(`${v} = ${iv};`);
        });
        doc.write(`}`);
        value = v;
        break;
      }
      case "default":
      case "prefault":
        value = generateDefaultIssues(doc, ctx, schema, accessor, path, shared);
        break;
      case "nonoptional": {
        const inner = (def as unknown as { innerType: SomeType }).innerType;
        const { pfx } = issueConsts(ctx);
        const iv = compileChildIssues(doc, ctx, inner, accessor, path, shared);
        const v = newVar(ctx);
        doc.write(`const ${v} = ${iv};`);
        const pushConst = addConstant(ctx, pushNonOptionalIssue);
        const instConst = addConstant(ctx, schema);
        const m2 = newVar(ctx);
        const prefix = path.length ? ` ${pfx}(payload.issues, ${m2}, [${path.join(", ")}]);` : "";
        doc.write(
          `if (payload.issues.length === ${mark} && ${v} === undefined) { const ${m2} = payload.issues.length; ${pushConst}(payload.issues, ${v}, ${instConst});${prefix} }`
        );
        value = v;
        break;
      }
      case "readonly": {
        const inner = (def as unknown as { innerType: SomeType }).innerType;
        const iv = compileChildIssues(doc, ctx, inner, accessor, path, shared);
        const v = newVar(ctx);
        doc.write(`const ${v} = Object.freeze(${iv});`);
        value = v;
        break;
      }
      case "success": {
        const inner = (def as unknown as { innerType: SomeType }).innerType;
        compileChildIssues(doc, ctx, inner, accessor, path, shared);
        const v = newVar(ctx);
        doc.write(`const ${v} = payload.issues.length === ${mark};`);
        value = v;
        break;
      }
      case "pipe": {
        const pdef = def as unknown as { in: SomeType; out: SomeType; transform?: unknown };
        if (pdef.transform) return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
        const stopsConst = addConstant(ctx, pipeStops);
        const iv = compileChildIssues(doc, ctx, pdef.in, accessor, path, shared);
        const v = newVar(ctx);
        const stopped = newVar(ctx);
        doc.write(`let ${v} = ${iv};`);
        // handlePipeResult: ANY in-stage issue but unrecognized_keys stops the pipe, continuable or not, and marks the payload aborted
        doc.write(`const ${stopped} = payload.issues.length > ${mark} && ${stopsConst}(payload.issues, ${mark});`);
        doc.write(`if (!${stopped}) {`);
        doc.indented((d) => {
          const ov = compileChildIssues(d, ctx, pdef.out, iv, path, shared);
          d.write(`${v} = ${ov};`);
        });
        doc.write(`}`);
        if (shared) doc.write(`else payload.aborted = true;`);
        value = v;
        abOverride = stopped;
        break;
      }
      case "transform": {
        // the runtime parse runs the user transform against the shared scratch payload, installing its own normalizing addIssue — canonical issues, callback runs once
        const tdef = def as unknown as { transform?: (v: unknown, p: unknown) => unknown };
        if (!tdef.transform) {
          value = accessor;
          break;
        }
        if (isAsyncFunction(tdef.transform)) throw new ZodCompileAsyncError();
        const { pfx } = issueConsts(ctx);
        const parseConst = addConstant(ctx, schema._zod.parse);
        const throwAsyncConst = addConstant(ctx, throwAsync);
        const r = newVar(ctx);
        doc.write(`${SP_INIT}.value = ${accessor};`);
        doc.write(`const ${r} = ${parseConst}(_sp, pctx);`);
        doc.write(`if (${r} instanceof Promise) ${throwAsyncConst}();`);
        if (path.length) {
          doc.write(`if (payload.issues.length > ${mark}) ${pfx}(payload.issues, ${mark}, [${path.join(", ")}]);`);
        }
        const v = newVar(ctx);
        doc.write(`const ${v} = _sp.value;`);
        value = v;
        break;
      }
      case "union":
        value = generateUnionIssues(doc, ctx, schema, accessor, path, shared);
        break;
      case "tuple":
        value = generateTupleIssues(doc, ctx, schema, accessor, path);
        break;
      default:
        // intersection, record, map, set, lazy, catch, properties, tuple, …: exact parity through the node-scoped runtime rerun
        return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
    }
  }

  if (!hasChain) return value;
  // the chain mutates its accessor, so alias non-let values
  const chainVar = newVar(ctx);
  doc.write(`let ${chainVar} = ${value};`);
  generateChecksIssues(doc, ctx, schema, chainVar, path, mark, abOverride);
  return chainVar;
}

function generateLeafIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath
): string {
  const failCond = leafFailCondition(ctx, schema, accessor);
  const isOwnCheck = (schema._zod as { traits?: Set<string> }).traits?.has("$ZodCheck") === true;
  // a def-level format with no check trait would silently skip its own validation
  const anyDef = schema._zod.def as { format?: unknown; check?: unknown; type: string };
  if (!isOwnCheck && (anyDef.check !== undefined || (anyDef.format !== undefined && anyDef.type !== "literal"))) {
    throw new ZodCompileUnsupportedError(`def-level format on a non-check ${anyDef.type} schema`);
  }
  if (failCond) doc.write(`if (${failCond}) ${leafFailBlock(ctx, schema, accessor, path)}`);
  return accessor;
}

function generateDefaultIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def as unknown as { innerType: SomeType; type: string };
  const descriptor = Object.getOwnPropertyDescriptor(schema._zod.def, "defaultValue");
  const defaultGetter = descriptor
    ? () => (schema._zod.def as unknown as { defaultValue: unknown }).defaultValue
    : undefined;

  if (def.type === "prefault") {
    if (!defaultGetter) return compileChildIssues(doc, ctx, def.innerType, accessor, path, shared);
    const defaultFn = addConstant(ctx, defaultGetter);
    const inputVar = newVar(ctx);
    doc.write(`let ${inputVar} = ${accessor};`);
    doc.write(`if (${accessor} === undefined) ${inputVar} = ${defaultFn}();`);
    return compileChildIssues(doc, ctx, def.innerType, inputVar, path, shared);
  }

  const v = newVar(ctx);
  doc.write(`let ${v};`);
  if (defaultGetter) {
    const defaultFn = addConstant(ctx, defaultGetter);
    const cloneFn = addConstant(ctx, util.shallowClone);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      d.write(`${v} = ${cloneFn}(${defaultFn}());`);
    });
    doc.write(`} else {`);
    doc.indented((d) => {
      const iv = compileChildIssues(d, ctx, def.innerType, accessor, path, shared);
      // like handleDefaultResult, the substitution applies whether or not the inner pushed issues
      d.write(`${v} = ${iv} === undefined ? ${cloneFn}(${defaultFn}()) : ${iv};`);
    });
    doc.write(`}`);
  } else {
    doc.write(`if (${accessor} !== undefined) {`);
    doc.indented((d) => {
      const iv = compileChildIssues(d, ctx, def.innerType, accessor, path, shared);
      d.write(`${v} = ${iv};`);
    });
    doc.write(`}`);
  }
  return v;
}

function generateOptionalIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  if (isExactOptional(schema)) {
    return compileChildIssues(doc, ctx, def.innerType, accessor, path, shared);
  }

  const v = newVar(ctx);
  doc.write(`let ${v};`);
  if (def.innerType._zod.optin === "defaulted") {
    const m = newVar(ctx);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      d.write(`const ${m} = payload.issues.length;`);
      // the substituting branch runs on a payload of its own in the interpreter, so it is never shared
      const iv = compileChildIssues(d, ctx, def.innerType, accessor, path, false);
      // handleOptionalResult: a substituting schema that still failed yields undefined and its issues are dropped
      d.write(`if (payload.issues.length > ${m}) payload.issues.length = ${m};`);
      d.write(`else ${v} = ${iv};`);
    });
    doc.write(`} else {`);
    doc.indented((d) => {
      const iv = compileChildIssues(d, ctx, def.innerType, accessor, path, shared);
      d.write(`${v} = ${iv};`);
    });
    doc.write(`}`);
    return v;
  }

  doc.write(`if (${accessor} !== undefined) {`);
  doc.indented((d) => {
    const iv = compileChildIssues(d, ctx, def.innerType, accessor, path, shared);
    d.write(`${v} = ${iv};`);
  });
  doc.write(`}`);
  return v;
}

function generateArrayIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath
): string {
  const def = schema._zod.def as unknown as { element: SomeType };
  const v = newVar(ctx);
  doc.write(`let ${v} = ${accessor};`);
  doc.write(`if (!Array.isArray(${accessor})) ${leafFailBlock(ctx, schema, accessor, path)}`);
  doc.write(`else {`);
  doc.indented((d) => {
    const out = newVar(ctx);
    const iVar = newVar(ctx);
    const elemVar = newVar(ctx);
    d.write(`const ${out} = new Array(${accessor}.length);`);
    d.write(`for (let ${iVar} = 0; ${iVar} < ${accessor}.length; ${iVar}++) {`);
    d.indented((d2) => {
      d2.write(`const ${elemVar} = ${accessor}[${iVar}];`);
      const ev = compileChildIssues(d2, ctx, def.element, elemVar, [...path, iVar], false);
      // like handleArrayResult, the element's value lands in the output even when it pushed issues
      d2.write(`${out}[${iVar}] = ${ev};`);
    });
    d.write(`}`);
    d.write(`${v} = ${out};`);
  });
  doc.write(`}`);
  return v;
}

function generateObjectIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath
): string {
  const def = schema._zod.def as unknown as { shape: Record<string, SomeType>; catchall?: SomeType };
  const shape = def.shape;
  const keys = Object.keys(shape);
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  const allKeys: (string | symbol)[] = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
  const keyExpr = (k: string | symbol) => (typeof k === "symbol" ? addConstant(ctx, k) : util.esc(k));
  const propShape = shape as Record<string | symbol, SomeType>;
  if (keys.includes("__proto__")) {
    throw new ZodCompileUnsupportedError('object shape key "__proto__"');
  }

  const v = newVar(ctx);
  doc.write(`let ${v} = ${accessor};`);
  doc.write(
    `if (typeof ${accessor} !== "object" || ${accessor} === null || Array.isArray(${accessor})) ${leafFailBlock(ctx, schema, accessor, path)}`
  );
  doc.write(`else {`);
  doc.indented((d) => {
    const out = newVar(ctx);
    d.write(`const ${out} = {};`);

    for (const key of allKeys) {
      if (key === "__proto__") continue;
      const propSchema = propShape[key]!;
      const kx = keyExpr(key);
      const childPath = [...path, kx];
      const inputVar = newVar(ctx);
      const mk = newVar(ctx);
      d.write(`const ${inputVar} = ${accessor}[${kx}];`);
      d.write(`const ${mk} = payload.issues.length;`);
      const kv = compileChildIssues(d, ctx, propSchema, inputVar, childPath, false);
      const optin = propSchema._zod.optin;
      const optout = propSchema._zod.optout;

      if (optin !== undefined && optout === "optional") {
        // absent key + issues: the middle rung discards both, like handlePropertyResult
        const present = newVar(ctx);
        d.write(`const ${present} = ${kx} in ${accessor};`);
        const assignCond = optin === "optional" ? present : `${kv} !== undefined || ${present}`;
        d.write(`if (payload.issues.length > ${mk} && !${present}) payload.issues.length = ${mk};`);
        d.write(`else if (${assignCond}) ${out}[${kx}] = ${kv};`);
      } else if (optin === undefined) {
        const present = newVar(ctx);
        d.write(`const ${present} = ${kx} in ${accessor};`);
        d.write(
          `if (!${present} && payload.issues.length === ${mk}) payload.issues.push({ code: "invalid_type", expected: "nonoptional", input: undefined, path: [${childPath.join(", ")}] });`
        );
        d.write(`if (${present}) ${out}[${kx}] = ${kv};`);
      } else {
        d.write(
          `if (${kv} === undefined) { if (${kx} in ${accessor}) ${out}[${kx}] = undefined; } else ${out}[${kx}] = ${kv};`
        );
      }
    }

    // catchall, mirroring handleCatchall
    const catchall = def.catchall;
    if (catchall) {
      const catchallType = catchall._zod.def.type;
      if (catchallType === "never") {
        const condition = keys.map((k) => `k !== ${util.esc(k)}`).join(" && ") || "true";
        const unrec = newVar(ctx);
        d.write(`let ${unrec};`);
        d.write(`for (const k in ${accessor}) {`);
        d.indented((d2) => {
          d2.write(`if (${condition}) (${unrec} ??= []).push(k);`);
        });
        d.write(`}`);
        const instConst = addConstant(ctx, schema);
        const pathProp = path.length ? `, path: [${path.join(", ")}]` : "";
        d.write(
          `if (${unrec}) payload.issues.push({ code: "unrecognized_keys", keys: ${unrec}, input: ${accessor}, inst: ${instConst}, continue: true${pathProp} });`
        );
      } else if ((catchallType === "unknown" || catchallType === "any") && !catchall._zod.def.checks?.length) {
        const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
        d.write(`for (const k in ${accessor}) {`);
        d.indented((d2) => {
          d2.write(`if (k === "__proto__") continue;`);
          if (knownSet) d2.write(`if (${knownSet}.has(k)) continue;`);
          d2.write(`${out}[k] = ${accessor}[k];`);
        });
        d.write(`}`);
      } else {
        const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
        d.write(`for (const k in ${accessor}) {`);
        d.indented((d2) => {
          d2.write(`if (k === "__proto__") continue;`);
          if (knownSet) d2.write(`if (${knownSet}.has(k)) continue;`);
          const valVar = newVar(ctx);
          d2.write(`const ${valVar} = ${accessor}[k];`);
          const cv = compileChildIssues(d2, ctx, catchall, valVar, [...path, "k"], false);
          d2.write(`${out}[k] = ${cv};`);
        });
        d.write(`}`);
      }
    }

    d.write(`${v} = ${out};`);
  });
  doc.write(`}`);
  return v;
}

// Mirrors $ZodTuple.parse + handleTupleResults: invalid_type and too_small push-and-return inside the runtime parse (cold call is safe), too_big is hand-built because the runtime pushes it and keeps walking, and the optional-out tail truncates instead of reporting absent-slot issues.
function generateTupleIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath
): string {
  const def = schema._zod.def as unknown as { items: SomeType[]; rest: SomeType | null };
  const items = def.items;
  const rest = def.rest;
  const optinStart = getTupleOptStart(items, "optin");
  const optoutStart = getTupleOptStart(items, "optout");

  const { pfx } = issueConsts(ctx);
  const v = newVar(ctx);
  doc.write(`let ${v} = ${accessor};`);
  const label = `t${newVar(ctx)}`;
  doc.write(`${label}: {`);
  doc.indented((d) => {
    d.write(
      `if (!Array.isArray(${accessor})) { ${trimBlock(leafFailBlock(ctx, schema, accessor, path))} break ${label}; }`
    );
    if (!rest) {
      d.write(
        `if (${accessor}.length < ${optinStart}) { ${trimBlock(leafFailBlock(ctx, schema, accessor, path))} break ${label}; }`
      );
      const instConst = addConstant(ctx, schema);
      const m = newVar(ctx);
      const pathStmt = path.length ? ` ${pfx}(payload.issues, ${m}, [${path.join(", ")}]);` : "";
      // copied from $ZodTuple.parse's too_big push: the runtime pushes this and keeps walking the items
      d.write(
        `if (${accessor}.length > ${items.length}) { const ${m} = payload.issues.length; payload.issues.push({ code: "too_big", maximum: ${items.length}, inclusive: true, input: ${accessor}, inst: ${instConst}, origin: "array" });${pathStmt} }`
      );
    }

    const out = newVar(ctx);
    d.write(`const ${out} = [];`);
    const hasTail = optoutStart < items.length;
    const trunc = hasTail ? newVar(ctx) : null;
    if (trunc) d.write(`let ${trunc} = false;`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      if (i < optoutStart) {
        const el = newVar(ctx);
        d.write(`const ${el} = ${accessor}[${i}];`);
        const iv = compileChildIssues(d, ctx, item, el, [...path, `${i}`], false);
        d.write(`${out}[${i}] = ${iv};`);
      } else {
        d.write(`if (!${trunc}) {`);
        d.indented((d2) => {
          d2.write(`if (${i} < ${accessor}.length) {`);
          d2.indented((d3) => {
            const el = newVar(ctx);
            d3.write(`const ${el} = ${accessor}[${i}];`);
            const iv = compileChildIssues(d3, ctx, item, el, [...path, `${i}`], false);
            d3.write(`${out}[${i}] = ${iv};`);
          });
          if (item._zod.optin === "optional") {
            // absent middle rung: truncate the tail without running the item, like handleTupleResults' early break
            d2.write(`} else ${trunc} = true;`);
          } else {
            d2.write(`} else {`);
            d2.indented((d3) => {
              const m = newVar(ctx);
              d3.write(`const ${m} = payload.issues.length;`);
              const iv = compileChildIssues(d3, ctx, item, "undefined", [...path, `${i}`], false);
              // an absent optional-out slot that failed truncates and discards its issues; one that produced a value fills the slot
              d3.write(`if (payload.issues.length > ${m}) { payload.issues.length = ${m}; ${trunc} = true; }`);
              d3.write(`else ${out}[${i}] = ${iv};`);
            });
            d2.write(`}`);
          }
        });
        d.write(`}`);
      }
    }

    if (rest) {
      const iVar = newVar(ctx);
      const el = newVar(ctx);
      d.write(`for (let ${iVar} = ${items.length}; ${iVar} < ${accessor}.length; ${iVar}++) {`);
      d.indented((d2) => {
        d2.write(`const ${el} = ${accessor}[${iVar}];`);
        const iv = compileChildIssues(d2, ctx, rest, el, [...path, iVar], false);
        d2.write(`${out}[${iVar}] = ${iv};`);
      });
      d.write(`}`);
    }

    // trailing absent optional-out slots that produced undefined truncate, mirroring handleTupleResults' final loop
    if (items.some((it) => it._zod.optout === "optional")) {
      const optConst = addConstant(
        ctx,
        items.map((it) => it._zod.optout === "optional")
      );
      const iVar = newVar(ctx);
      d.write(`for (let ${iVar} = ${out}.length - 1; ${iVar} >= ${accessor}.length && ${iVar} >= 0; ${iVar}--) {`);
      d.indented((d2) => {
        d2.write(`if (${optConst}[${iVar}] && ${out}[${iVar}] === undefined) ${out}.length = ${iVar};`);
        d2.write(`else break;`);
      });
      d.write(`}`);
    }

    d.write(`${v} = ${out};`);
  });
  doc.write(`}`);
  return v;
}

// strips the outer braces off a fail block so it can inline before a labeled break
function trimBlock(block: string): string {
  return block.slice(1, -1).trim();
}

function generateUnionIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def as unknown as {
    options: SomeType[];
    inclusive?: boolean;
    discriminator?: string;
    unionFallback?: boolean;
  };
  const options = def.options;

  // the runtime dispatches on the discriminator and runs the matched option on the SHARED payload, so branch children compile in issue mode directly — no island, no re-walk. Non-object input and a missing discriminator both push-and-return inside the runtime parse, so the cold call is safe. Checked before the xor gate: a discriminated union also carries inclusive: false.
  if (def.discriminator) {
    if (def.unionFallback || options.length === 0) return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
    const v = newVar(ctx);
    const discVar = newVar(ctx);
    const label = `d${newVar(ctx)}`;
    doc.write(`let ${v} = ${accessor};`);
    doc.write(`${label}: {`);
    doc.indented((d) => {
      d.write(`if (typeof ${accessor} === "object" && ${accessor} !== null && !Array.isArray(${accessor})) {`);
      d.indented((d2) => {
        d2.write(`const ${discVar} = ${accessor}[${util.esc(def.discriminator!)}];`);
        let firstBranch = true;
        const claimed = new Set<util.Primitive>();
        for (const option of options) {
          const values = option._zod.propValues?.[def.discriminator!];
          if (!values || values.size === 0) {
            throw new ZodCompileUnsupportedError("discriminated union option without static discriminator values");
          }
          for (const value of values) {
            if (claimed.has(value)) {
              throw new ZodCompileUnsupportedError(`duplicate discriminator value ${String(value)}`);
            }
            claimed.add(value);
          }
          const conditions = Array.from(values, (value) => literalEquality(ctx, discVar, value));
          const prefix = firstBranch ? "if" : "else if";
          d2.write(`${prefix} (${conditions.join(" || ")}) {`);
          d2.indented((d3) => {
            const bv = compileChildIssues(d3, ctx, option, accessor, path, shared);
            d3.write(`${v} = ${bv};`);
            d3.write(`break ${label};`);
          });
          d2.write(`}`);
          firstBranch = false;
        }
      });
      d.write(`}`);
      d.write(leafFailBlock(ctx, schema, accessor, path));
    });
    doc.write(`}`);
    return v;
  }

  // xor and unionFallback change match semantics; the interpreter owns them wholesale
  if (def.inclusive === false || def.unionFallback) {
    return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
  }
  if (options.length === 0) return emitIssueIsland(doc, ctx, schema, accessor, path, shared);
  if (options.length === 1) return compileChildIssues(doc, ctx, options[0]!, accessor, path, shared);

  const allLiterals = options.every(
    (opt) => opt._zod.def.type === "literal" && !(opt._zod.def.checks as unknown[] | undefined)?.length
  );
  if (allLiterals) {
    const values = new Set(options.flatMap((opt) => (opt._zod.def as unknown as { values: unknown[] }).values));
    const valuesConst = addConstant(ctx, values);
    const v = newVar(ctx);
    doc.write(`let ${v} = ${accessor};`);
    doc.write(`if (!${valuesConst}.has(${accessor})) {`);
    doc.indented((d) => {
      const iv = emitIssueIsland(d, ctx, schema, accessor, path, shared);
      d.write(`${v} = ${iv};`);
    });
    doc.write(`}`);
    return v;
  }

  // two-phase: the fast-mode branch attempts decide the match on the hot path; on total failure each branch re-runs as a compiled issue parser against a payload of its own (the interpreter gives branches fresh payloads too), and a helper mirroring handleUnionResults aggregates them
  const v = newVar(ctx);
  doc.write(`let ${v};`);
  for (let i = 0; i < options.length; i++) {
    const opt = options[i]!;
    if (i === 0) {
      doc.write(`${v} = (() => {`);
    } else {
      doc.write(`if (${v} === INVALID) ${v} = (() => {`);
    }
    doc.indented((d) => {
      const branchOutput = generateCheck(d, ctx, opt, accessor);
      d.write(`return ${branchOutput};`);
    });
    doc.write(`})();`);
  }
  doc.write(`if (${v} === INVALID) {`);
  doc.indented((d) => {
    const { pfx } = issueConsts(ctx);
    const helperConst = addConstant(ctx, unionIssuesForCompiled);
    const instConst = addConstant(ctx, schema);
    const rsVar = newVar(ctx);
    const m = newVar(ctx);
    d.write(`const ${rsVar} = [];`);
    for (const opt of options) {
      // the shadowed `payload` and fresh `_sp` confine the branch's pushes to its own local payload, exactly like the interpreter's per-branch payloads; `shared` is true relative to that payload so a branch pipe's abort flag lands on it for the nonaborted filter
      d.write(`${rsVar}.push(((payload) => {`);
      d.indented((d2) => {
        d2.write(`let _sp;`);
        const bv = compileChildIssues(d2, ctx, opt, "payload.value", [], true);
        d2.write(`payload.value = ${bv};`);
        d2.write(`return payload;`);
      });
      d.write(`})({ value: ${accessor}, issues: [] }));`);
    }
    d.write(`const ${m} = payload.issues.length;`);
    d.write(`${v} = ${helperConst}(${instConst}, ${accessor}, payload, ${rsVar}, pctx, ${shared});`);
    if (path.length) d.write(`if (payload.issues.length > ${m}) ${pfx}(payload.issues, ${m}, [${path.join(", ")}]);`);
  });
  doc.write(`}`);
  return v;
}

function isAsyncFunction(fn: unknown): boolean {
  return (
    typeof fn === "function" &&
    (fn.constructor.name === "AsyncFunction" ||
      (fn as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === "AsyncFunction")
  );
}

function generateCustomCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { fn?: (value: unknown) => boolean };

  if (def.fn) {
    // Check for async function
    if (isAsyncFunction(def.fn)) {
      throw new ZodCompileAsyncError("z.compile: async custom predicates are not supported");
    }
    // Custom schema with a predicate function (e.g. z.instanceof). `isAsyncFunction` above is syntactic, so a plain function returning a promise reaches here, and a promise is truthy — it would read as a pass where the interpreter throws.
    const fnConst = addUserConstant(ctx, def.fn);
    const throwAsyncConst = addConstant(ctx, throwAsync);
    const resVar = newVar(ctx);
    doc.write(`const ${resVar} = ${fnConst}(${accessor});`);
    doc.write(`if (${resVar} instanceof Promise) ${throwAsyncConst}();`);
    doc.write(`if (!${resVar}) return INVALID;`);
  } else {
    throw new ZodCompileUnsupportedError("custom schema without a predicate function");
  }
  return accessor;
}

// Runtime helper for a compiled `catch`: runs the inner schema once and returns its value when it succeeded. Anything else — a failure the catch would handle, or an async inner — returns INVALID so the interpreter takes over.
function runtimeCatch(innerSchema: SomeType, catchValue: () => unknown, value: unknown): unknown {
  const result = (innerSchema._zod.run as (p: ParsePayload, c: ParseContextInternal) => any)(
    { value, issues: [] },
    {} as ParseContextInternal
  );
  if (result && typeof (result as Promise<unknown>).then === "function") return INVALID;
  const r = result as { value: unknown; issues: any[] };
  if (r.issues.length === 0) return r.value;
  // Only reached for a catch value that ignores the parse context — codegen refuses the rest — so there are no issues to finalize and nothing here needs the caller's error map.
  return catchValue();
}

function generateCatchCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as {
    innerType: SomeType;
    catchValue: (ctx: any) => unknown;
  };

  // An untagged catchValue is a user callback, and one reading `ctx.error` needs the caller's per-parse error map. Catch *succeeds*, so a wrong message there is unobservable — refuse at codegen, and not islandable either, since `runtimeRun` has no context to hand it.
  if (!(def.catchValue as { [util.CONSTANT_CATCH]?: boolean })[util.CONSTANT_CATCH]) {
    throw new ZodCompileUnsupportedError("catch with a callback (only a constant catch value compiles)", false);
  }

  const outputVar = newVar(ctx);
  doc.write(`let ${outputVar} = (() => {`);
  doc.indented((d) => {
    const innerOut = compileChild(d, ctx, def.innerType, accessor);
    d.write(`return ${innerOut};`);
  });
  doc.write(`})();`);

  const innerConst = addConstant(ctx, def.innerType);
  const catchConst = addUserConstant(ctx, def.catchValue);
  const catchHelperConst = addConstant(ctx, runtimeCatch);
  doc.write(`if (${outputVar} === INVALID) {`);
  doc.indented((d) => {
    d.write(`${outputVar} = ${catchHelperConst}(${innerConst}, ${catchConst}, ${accessor});`);
    d.write(`if (${outputVar} === INVALID) return INVALID;`);
  });
  doc.write(`}`);
  return outputVar;
}

function generateTransformCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as {
    transform: (value: unknown, payload: unknown) => unknown;
  };

  if (def.transform) {
    // Check for async transform
    if (isAsyncFunction(def.transform)) {
      throw new ZodCompileAsyncError("z.compile: async transforms are not supported");
    }

    // Create a helper that runs the transform and returns the result or INVALID on error
    const transformFn = def.transform;
    const helperFn = (value: unknown): unknown => {
      const fakePayload = { value, issues: [] as unknown[], addIssue: pushIssue };
      // As in the pipe helper: a throw propagates, because the interpreter lets it out of the whole parse rather than treating it as a failed branch.
      const result = transformFn(value, fakePayload);
      if (result instanceof Promise) return INVALID;
      return fakePayload.issues.length === 0 ? result : INVALID;
    };
    const helperConst = addUserConstant(ctx, helperFn);
    const outputVar = newVar(ctx);
    doc.write(`const ${outputVar} = ${helperConst}(${accessor});`);
    doc.write(`if (${outputVar} === INVALID) return INVALID;`);
    return outputVar;
  }

  return accessor;
}
