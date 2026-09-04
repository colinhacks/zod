import type * as checks from "./checks.js";
import { _whenHasLength, _whenHasSize } from "./checks.js";
import type * as core from "./core.js";
import { $ZodAsyncError, config } from "./core.js";
import { Doc } from "./doc.js";
import { codegenFor, emitterFor } from "./jit.js";
import { isBackEdge, isRecursiveSchema } from "./memoizer.js";
import {
  isValidBase64,
  isValidBase64URL,
  isValidCIDRv6,
  isValidCreditCard,
  isValidIPv6,
  isValidJWT,
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
// set on a parse context by a compiled method that already rejected: the wrapper goes straight to the failure path
const SKIP_FAST = /* @__PURE__ */ Symbol.for("zod.compile.skipfast");

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

export interface CompileContext {
  constants: Map<string, unknown>;
  constantCounter: number;
  varCounter: number;
  /** Cleared when a construct can return INVALID for something the interpreter throws on, so `validate` keeps its fallback. */
  definite: boolean;
  /** Hoisted static issue paths, keyed by their source text. */
  pathConstants?: Map<string, string>;
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
  /** Compile the failure path too (the default): after the fast parser rejects, a second generated parser pushes the interpreter's issues instead of re-parsing through the runtime. `false` keeps the runtime re-parse. */
  issues?: boolean | undefined;
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
    // Compiled on the first rejection: a schema that never fails never pays for its issue parser, whose source alone can outweigh the schema, and z.compile stays a fast-path-only cost up front. A refusal falls back to the runtime re-parse for good.
    let issueParser: IssueParser | null | undefined = options?.issues === false ? null : undefined;
    const issueParserFor = (): IssueParser | null => {
      if (issueParser === undefined) {
        try {
          issueParser = compileFn(schema, { issues: true }) as unknown as IssueParser;
        } catch (err) {
          if (!(err instanceof ZodCompileUnsupportedError || err instanceof ZodCompileAsyncError)) throw err;
          issueParser = null;
        }
      }
      return issueParser;
    };

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

      // a compiled parse/safeParse method that already rejected comes back through here to build the failure; running the fast parser again would only run user callbacks once more
      if (!(ctx as Record<symbol, unknown> | undefined)?.[SKIP_FAST]) {
        const out = parser(payload.value);
        if (out !== INVALID) {
          payload.value = out;
          return payload;
        }
      }
      // The issue parser replaces the runtime fallback. `validate` asks for the first failure only (abortEarly); the issue parser walks everything, so that answer still comes from the runtime.
      const issues = ctx?.abortEarly ? null : issueParserFor();
      if (issues) {
        payload.value = issues(payload.value, payload, ctx);
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
    clone._zod.run = wrapped;

    // The fast parse/safeParse closures fall back through the clone's own methods with the skip-fast flag, so a rejection lands in the wrapper's issue parser (or its runtime fallback) without running the fast parser a second time: user callbacks run at most twice on invalid input. If the source is shim-managed, its methods already route into a compiled run, so skip.
    if (!liveRun.__originalRun) installCompiledUserMethods(clone, parser);

    return clone;
  } catch (err) {
    if (options?.strict) throw err;
    // a schema we can't compile still has to work, so hand it back untouched on the runtime parser — the same silent fallback global mode already does
    return schema;
  }
}

// parse params spread into the parse context, so the flag rides along to the wrapper
const SKIP_FAST_PARAMS = { [SKIP_FAST]: true };
const skipFast = (params: unknown) => (params ? { ...(params as object), [SKIP_FAST]: true } : SKIP_FAST_PARAMS);

function installCompiledUserMethods<T extends SomeType>(target: T, parser: CompiledFn<core.output<T>>): void {
  const targetAny = target as any;

  if (typeof targetAny.safeParse === "function") {
    const originalSafeParse = targetAny.safeParse;
    targetAny.safeParse = (data: unknown, params?: unknown) => {
      const out = parser(data);
      if (out !== INVALID) {
        return { success: true, data: out };
      }
      return originalSafeParse(data, skipFast(params));
    };
  }

  if (typeof targetAny.parse === "function") {
    const originalParse = targetAny.parse;
    targetAny.parse = (data: unknown, params?: unknown) => {
      const out = parser(data);
      if (out !== INVALID) {
        return out;
      }
      return originalParse(data, skipFast(params));
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
    if ((schema._zod.def as { coerce?: boolean }).coerce || !emitterFor(schema)?.issues) {
      throw new ZodCompileUnsupportedError(`schema type ${schema._zod.def.type} at the root of an issue-mode compile`);
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

export function addConstant(ctx: CompileContext, value: unknown): string {
  // Check if we already have this constant
  for (const [name, v] of ctx.constants) {
    if (v === value) return name;
  }
  const name = `c${ctx.constantCounter++}`;
  ctx.constants.set(name, value);
  return name;
}

/** Hoists a user-supplied callback. Anything the schema's author wrote can throw, and generated code can reject an earlier sibling before ever reaching it, so this clears `definite` — a rejection is then no longer proof that the interpreter would have rejected rather than thrown. */
export function addUserConstant(ctx: CompileContext, fn: unknown): string {
  ctx.definite = false;
  return addConstant(ctx, fn);
}

export function newVar(ctx: CompileContext): string {
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
export function compileChild(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string;
export function compileChild(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue: boolean
): string | null;
// `null` means the node built no value because nothing reads it. The overloads keep that case out of the 20-odd callers that always want one, so only a caller passing needsValue has to handle it.
export function compileChild(
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

export function generateChecks(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
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

export function generateNumberFormatCheck(
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
export function generatePropertiesChecks(
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
export function throwAsync(): never {
  throw new $ZodAsyncError();
}

/** Shared `addIssue` for the spoofed payloads a refine, check or transform receives. Allocating one per call — a fresh closure plus a `this`-bound method on a fresh literal — pinned every payload-allocating schema at ~2.7M ops/sec against 135M for a plain object literal. It captures nothing per call; it only reaches `this.issues`. */
export function pushIssue(this: { issues: unknown[] }, issue: unknown): void {
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

export type StringFormatDef =
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
export function generateStringFormatCheck(
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

export function generateCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string;
export function generateCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue: boolean
): string | null;
export function generateCheck(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  needsValue = true
): string | null {
  const def = schema._zod.def;
  const type = def.type;

  // A coercing schema would compile to the bare type test and reject what it should convert; inside a union that reads as a rejected branch, so refuse at codegen.
  if ((def as { coerce?: boolean }).coerce) {
    throw new ZodCompileUnsupportedError(`coercion (z.coerce.${type}())`);
  }

  // A node builds its output when its caller reads one, or when it carries checks of its own, since a check reads what was built. One polarity for the whole walk: this is what the node does, and it is what its children are told they need.
  const buildsValue = needsValue || !!def.checks?.length;

  const codegen = codegenFor(schema);
  if (!codegen) {
    throw new ZodCompileUnsupportedError(`schema type ${type}`);
  }
  const typeAccessor = codegen(doc, ctx, accessor, buildsValue);

  // a node that built nothing has no checks to run: not building requires an empty check list
  if (typeAccessor === null) return null;

  // Generate checks after the type-specific validation (may transform value)
  return generateChecks(doc, ctx, schema, typeAccessor);
}

export function isExactOptional(schema: SomeType): boolean {
  return (schema._zod as { traits?: Set<string> }).traits?.has("$ZodExactOptional") === true;
}

// A value-level fast path reads an absent key as `undefined`, so z.undefined(), z.any() and unions containing undefined would accept a missing property the runtime rejects.
export function requiresPresenceCheck(schema: SomeType): boolean {
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
export function dropsWhenAbsent(schema: SomeType): boolean {
  return schema._zod.optin === "optional" && schema._zod.optout === "optional";
}

// Whether a schema's success-path output can be `undefined`. Object output
// assembly gives such props the runtime's value-or-presence inclusion rule;
// everything else keeps the unconditional object-literal slot.
export function mayOutputUndefined(schema: SomeType): boolean {
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

//////////////////////////////////////////////////////////////////////////////
// Issue mode ("apply" codegen): the generated parser pushes the same raw issues the interpreter pushes instead of returning INVALID. Failure sites never hand-build issue objects — they cold-call the hoisted runtime parse/check of the failing node so the canonical issue comes from runtime code, and the generated code owns only the walk plumbing: path prefixes, abort/continue gating, sibling continuation, partial output assembly. Nodes with no native emission are handled by a node-scoped rerun island: the failing subtree runs through its own runtime parser and its issues merge in, which is exact parity at the cost of re-running that subtree's user callbacks (bounded at 2x, the same bound the whole-schema fallback has today).
//////////////////////////////////////////////////////////////////////////////

// mirrors util.prefixIssues, but from an index and applying a whole path prefix at once — same resulting arrays as the interpreter's per-level unshift
export function prefixIssuesFrom(issues: unknown[], start: number, path: unknown[]): void {
  for (let i = start; i < issues.length; i++) {
    const iss = issues[i] as { path?: unknown[] };
    iss.path = iss.path ? [...path, ...iss.path] : path.slice();
  }
}

// Runs a node through its own runtime parser, merging its issues into the caller's payload — the issue path's escape hatch for constructs it doesn't model natively. A promise means an async member reached a sync parse, which the interpreter answers with a throw. `shared` marks a node whose runtime payload is the caller's own, so the abort flag a pipe or codec sets has to carry across.
export function rerunNodeForIssues(
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
export function unionIssuesForCompiled(
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

// mirrors $ZodRecord's invalid_key push for a key its schema rejects: the key schema re-runs so the nested issues are the interpreter's own, finalized the way the runtime finalizes them
export function pushInvalidKey(
  keyType: SomeType,
  key: PropertyKey,
  payload: ParsePayload,
  pctx: ParseContextInternal | undefined,
  inst: SomeType,
  path: unknown[]
): void {
  const live = keyType._zod.run as ((p: ParsePayload, c: ParseContextInternal) => any) & {
    __originalRun?: (p: ParsePayload, c: ParseContextInternal) => any;
  };
  const r = (live.__originalRun ?? live)({ value: key, issues: [] }, pctx ?? ({} as ParseContextInternal));
  if (r instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
  payload.issues.push({
    code: "invalid_key",
    origin: "record",
    issues: r.issues.map((iss: never) => util.finalizeIssue(iss, pctx, config())),
    input: key,
    path: [...path, key],
    inst,
  } as never);
}

// mirrors handlePipeResult's stop rule: any issue except unrecognized_keys halts the pipe, continuable or not
export function pipeStops(issues: unknown[], start: number): boolean {
  for (let i = start; i < issues.length; i++) {
    if ((issues[i] as { code?: string }).code !== "unrecognized_keys") return true;
  }
  return false;
}

// mirrors handleNonOptionalResult's push; kept as a runtime helper so the shape lives in one place on this side
export function pushNonOptionalIssue(issues: unknown[], input: unknown, inst: unknown): void {
  (issues as { push: (i: unknown) => void }).push({ code: "invalid_type", expected: "nonoptional", input, inst });
}

/** JS expressions for the path from the root to the current node — string literals for static keys, variable names for loop indices, constant names for symbols. */
export type IssuePath = string[];

export function issueConsts(ctx: CompileContext) {
  return {
    pfx: addConstant(ctx, prefixIssuesFrom),
    abt: addConstant(ctx, util.aborted),
    eabt: addConstant(ctx, util.explicitlyAborted),
    att: addConstant(ctx, util.attachSchema),
  };
}

export const SP_INIT = `(_sp ??= { value: null, issues: payload.issues })`;

// Cold call for a failed leaf type test: the node's own runtime parse pushes the canonical issue onto the caller's issues array, then the pushed issues get their root-relative path. The parse re-evaluates a trivial predicate; the price of never hand-building an issue shape.
export function coldParse(
  value: unknown,
  parse: (p: ParsePayload, c: ParseContextInternal) => unknown,
  payload: ParsePayload,
  pctx: ParseContextInternal | undefined,
  path?: unknown[]
): void {
  const m = payload.issues.length;
  parse({ value, issues: payload.issues }, pctx as ParseContextInternal);
  if (path && payload.issues.length > m) prefixIssuesFrom(payload.issues, m, path);
}

// Cold call for a failed check predicate: the runtime check pushes canonically, the owning schema is stamped, and the pushed issues get their path. The chain's abort gates are recomputed by the caller from the node mark.
export function coldCheck(
  value: unknown,
  check: (p: ParsePayload) => unknown,
  payload: ParsePayload,
  owner: unknown,
  path?: unknown[]
): void {
  const m = payload.issues.length;
  check({ value, issues: payload.issues });
  util.attachSchema(payload.issues, m, owner as never);
  if (path && payload.issues.length > m) prefixIssuesFrom(payload.issues, m, path);
}

const STATIC_PATH_ELEMENT = /^(?:"(?:[^"\\]|\\.)*"|-?\d+)$/;

// Source for a path array that is only read (a cold call's prefix). A path of two or more literals hoists into one shared constant: on a wide schema the literal repeated at every leaf is a large share of the generated issue code, which is retained for the schema's lifetime. Paths carrying a runtime element (an array index, a record key) stay inline.
export function pathExpr(ctx: CompileContext, path: IssuePath): string {
  const literal = `[${path.join(", ")}]`;
  if (path.length < 2 || !path.every((p) => STATIC_PATH_ELEMENT.test(p))) return literal;
  ctx.pathConstants ??= new Map();
  const cache = ctx.pathConstants;
  let name = cache.get(literal);
  if (!name) {
    name = addConstant(ctx, JSON.parse(literal));
    cache.set(literal, name);
  }
  return name;
}

// Source for a path array that lands on an issue, which the caller may mutate: a hoisted constant is copied
export function pathLiteral(ctx: CompileContext, path: IssuePath): string {
  const expr = pathExpr(ctx, path);
  return expr.startsWith("[") ? expr : `${expr}.slice()`;
}

// the synthetic issue for a required key that is absent when the value schema pushed nothing, as $ZodObject's handlePropertyResult pushes it
export function pushMissingKey(payload: ParsePayload, path: unknown[]): void {
  payload.issues.push({ code: "invalid_type", expected: "nonoptional", input: undefined, path: path.slice() } as never);
}

export function leafFailBlock(ctx: CompileContext, schema: SomeType, accessor: string, path: IssuePath): string {
  const coldConst = addConstant(ctx, coldParse);
  const parseConst = addConstant(ctx, schema._zod.parse);
  const pathArg = path.length ? `, ${pathExpr(ctx, path)}` : "";
  return `${coldConst}(${accessor}, ${parseConst}, payload, pctx${pathArg});`;
}

interface ChainGate {
  ab: string;
  ex: string | null;
}

// Cold block for a failed check predicate: `coldCheck` pushes canonically, then the gates are recomputed from the node mark (every issue of this node sits after it, so "aborted since the mark" is exactly the accumulated gate). `label` breaks out of the check's remaining hot statements (multi-site checks like url).
function checkFailBlock(
  ctx: CompileContext,
  check: { _zod: { check?: unknown } },
  ownerConst: string,
  accessor: string,
  path: IssuePath,
  gate: ChainGate,
  label: string,
  nodeMark: string,
  pre: string
): string {
  const { abt, eabt } = issueConsts(ctx);
  const checkFn = (check._zod as { check?: unknown }).check;
  if (typeof checkFn !== "function") throw new ZodCompileUnsupportedError("check without a runtime check function");
  const coldConst = addConstant(ctx, coldCheck);
  const checkConst = addConstant(ctx, checkFn);
  const pathArg = path.length ? `, ${pathExpr(ctx, path)}` : "";
  const exUpd = gate.ex ? ` ${gate.ex} = ${pre}${eabt}(payload, ${nodeMark});` : "";
  return `{ ${coldConst}(${accessor}, ${checkConst}, payload, ${ownerConst}${pathArg}); ${gate.ab} = ${pre}${abt}(payload, ${nodeMark});${exUpd} break ${label}; }`;
}

/**
 * Issue-mode check chain. Mirrors the runChecks loop in $ZodType.init: a check
 * runs unless the chain is aborted, a when-carrying check consults its `when`
 * instead (and skips only on explicit abort), and every failure recomputes the
 * gates from the issues it pushed. `valueVar` must be a reassignable binding —
 * overwrite/url/refine rewrite it in place.
 */
export function generateChecksIssues(
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
            if (path.length) d2.write(`${pfx}(payload.issues, ${m}, ${pathExpr(ctx, path)});`);
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
            `if (${r} === INVALID) ${checkFailBlock(ctx, check as { _zod: { check?: unknown } }, ownerConst, valueVar, path, gate, label, nodeMark, pre)}`
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
            checkFailBlock(
              ctx,
              check as { _zod: { check?: unknown } },
              ownerConst,
              valueVar,
              path,
              gate,
              label,
              nodeMark,
              pre
            );
          const out = emitCheckPredicate(d, ctx, check, valueVar, fail);
          if (out !== valueVar) d.write(`${valueVar} = ${out};`);
        });
        doc.write(`}`);
      }
    }
  }
}

export function emitIssueIsland(
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
  if (path.length) doc.write(`if (payload.issues.length > ${m}) ${pfx}(payload.issues, ${m}, ${pathExpr(ctx, path)});`);
  return v;
}

const runsCallbacks = new WeakMap<object, boolean>();
type ZodNode = { _zod: { def: unknown } };

// Whether an issue-mode walk of this subtree runs user code that receives its parse payload. Three def shapes do: a custom check whose check function is the user's (superRefine, `.check(fn)`: kind "custom" with no value-only `fn` — a refine or a string format keeps its `fn`, which sees the value alone), a `transform`, and a `when` other than the guards the size and length checks install themselves. Structural, so a schema or check class this compiler has never met is classified by what its def holds: children are whatever `_zod`-bearing values the def reaches directly, in an array, or in a shape. A lazy's getter is a function, so it stays out; issue mode islands it and the interpreter hands the island its own payloads.
export function subtreeRunsCallbacks(node: ZodNode): boolean {
  const known = runsCallbacks.get(node);
  if (known !== undefined) return known;
  // an assumed answer for a node still being scanned
  runsCallbacks.set(node, false);
  const def = node._zod.def as Record<string, unknown>;
  let out =
    (def.check === "custom" && typeof def.fn !== "function") ||
    typeof def.transform === "function" ||
    (typeof def.when === "function" && def.when !== _whenHasSize && def.when !== _whenHasLength);
  if (!out) out = childrenReachCallbacks(def);
  runsCallbacks.set(node, out);
  return out;
}

// the def's values, one level deep: a node recurses, an array or a shape is scanned for nodes, and anything else (a default value, a regex, a locale map) stays opaque. accessors stay unread — `defaultValue` runs the user's factory — except `shape`, zod's own lazily derived one, which is read so the answer is the same before and after its first read; a shape getter that throws counts as callbacks, the conservative answer
function childrenReachCallbacks(def: object): boolean {
  for (const key in def) {
    const desc = Object.getOwnPropertyDescriptor(def, key);
    if (!desc) continue;
    let value: unknown;
    if (!desc.get) value = desc.value;
    else if (key !== "shape") continue;
    else {
      try {
        value = (def as Record<string, unknown>)[key];
      } catch {
        return true;
      }
    }
    if (!value || typeof value !== "object") continue;
    if ((value as Partial<ZodNode>)._zod) {
      if (subtreeRunsCallbacks(value as ZodNode)) return true;
    } else if (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype) {
      for (const el of Object.values(value)) {
        if ((el as Partial<ZodNode> | null)?._zod && subtreeRunsCallbacks(el as ZodNode)) return true;
      }
    }
  }
  return false;
}

// the child parsed on its own payload: its issues join the parent's with the child's path in front, as handlePropertyResult and the array walk do
export function mergeChildIssues(payload: ParsePayload, child: ParsePayload, path: unknown[]): void {
  if (!child.issues.length) return;
  const m = payload.issues.length;
  payload.issues.push(...child.issues);
  if (path.length) prefixIssuesFrom(payload.issues, m, path);
}

// A subtree whose callbacks could read the payload runs inside one of its own, as the interpreter gives every object property, array element and record value: the callbacks see only the child's issues, with child-relative paths, and the parent takes the issues afterwards. A subtree without callbacks pushes straight into the parent's array with its path prefixed at the site, which is the same result without the payload and the closure.
function emitIsolatedChild(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string, path: IssuePath): string {
  const mergeConst = addConstant(ctx, mergeChildIssues);
  const r = newVar(ctx);
  doc.write(`const ${r} = ((payload) => {`);
  doc.indented((d) => {
    d.write(`let _sp;`);
    const value = compileChildIssues(d, ctx, schema, "payload.value", [], true);
    d.write(`payload.value = ${value};`);
    d.write(`return payload;`);
  });
  doc.write(`})({ value: ${accessor}, issues: [] });`);
  doc.write(`${mergeConst}(payload, ${r}, ${path.length ? pathExpr(ctx, path) : "[]"});`);
  return `${r}.value`;
}

// Issue-mode counterpart of compileChild: try the native emission, roll back and island on an islandable refusal.
export function compileChildIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  if (!shared && subtreeRunsCallbacks(schema)) return emitIsolatedChild(doc, ctx, schema, accessor, path);
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

/** An issue-mode emitter for one node: writes the node's body against `accessor`, pushing canonical issues (prefixed with `path`) into `payload.issues`, and returns the accessor holding the node's value. `mark` is `payload.issues.length` before the node, present only for an entry that declares `marks`; a pipe also hands back the gate that stops its check chain. */
export type IssueCodegen = (
  doc: Doc,
  ctx: CompileContext,
  inst: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean,
  mark: string
) => string | { value: string; abOverride: string };

/** The issue emitter for a simple-parse leaf: `failCondition` is the inverted type test, or null for a leaf that accepts anything and leaves the work to its check chain. */
export function leafIssues(
  failCondition: ((ctx: CompileContext, inst: SomeType, accessor: string) => string | null) | null
): IssueCodegen {
  return (doc, ctx, inst, accessor, path) => {
    const isOwnCheck = (inst._zod as { traits?: Set<string> }).traits?.has("$ZodCheck") === true;
    // a def-level format with no check trait would silently skip its own validation
    const anyDef = inst._zod.def as { format?: unknown; check?: unknown; type: string };
    if (!isOwnCheck && (anyDef.check !== undefined || (anyDef.format !== undefined && anyDef.type !== "literal"))) {
      throw new ZodCompileUnsupportedError(`def-level format on a non-check ${anyDef.type} schema`);
    }
    const cond = failCondition?.(ctx, inst, accessor);
    if (cond) doc.write(`if (${cond}) ${leafFailBlock(ctx, inst, accessor, path)}`);
    return accessor;
  };
}

// Central issue-mode dispatch. Every native node shares the pattern: take a mark, emit the node body through its class's issue emitter, then run the node's own check chain against the mark — the chain lives HERE (not per node) because any schema type can carry checks. A node whose class has no issue emitter islands, and the rerun covers its checks.
function generateCheckIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def;

  // coercion rewrites the value before the type test — the interpreter models it, so island the node
  const entry = (def as { coerce?: boolean }).coerce ? undefined : emitterFor(schema);
  const emit = entry?.issues;
  if (!emit) return emitIssueIsland(doc, ctx, schema, accessor, path, shared);

  const defChecks = (def.checks as unknown[] | undefined) ?? [];
  const isOwnCheck = (schema._zod as { traits?: Set<string> }).traits?.has("$ZodCheck") === true;
  const hasChain = defChecks.length > 0 || isOwnCheck;

  // the mark costs a statement per node, so only a node whose chain or emitter reads it takes one
  const mark = hasChain || entry.marks ? newVar(ctx) : "";
  if (mark) doc.write(`const ${mark} = payload.issues.length;`);

  const out = emit(doc, ctx, schema, accessor, path, shared, mark);
  const value = typeof out === "string" ? out : out.value;
  const abOverride = typeof out === "string" ? null : out.abOverride;

  if (!hasChain) return value;
  // the chain mutates its accessor, so alias non-let values
  const chainVar = newVar(ctx);
  doc.write(`let ${chainVar} = ${value};`);
  generateChecksIssues(doc, ctx, schema, chainVar, path, mark, abOverride);
  return chainVar;
}

export function isAsyncFunction(fn: unknown): boolean {
  return (
    typeof fn === "function" &&
    (fn.constructor.name === "AsyncFunction" ||
      (fn as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === "AsyncFunction")
  );
}
