import type * as checks from "./checks.js";
import type * as core from "./core.js";
import { $ZodAsyncError } from "./core.js";
import { Doc } from "./doc.js";
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
import type { ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
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
}

type CompiledFn<T> = ((input: unknown) => T | INVALID) & { code?: string | undefined };

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
  | checks.$ZodCheckMimeType
  | checks.$ZodCheckOverwrite
  | { _zod: { def: { check: "custom"; fn?: (value: unknown) => boolean }; check?: (payload: unknown) => unknown } };

/**
 * Build the validator `validate` calls: the same codegen as the parser with the output construction
 * dropped. A schema the flag cannot express reuses the parser, which still answers correctly — it
 * just builds a value nothing reads.
 */
function compileValidator(schema: SomeType, parser: (input: unknown) => unknown): (input: unknown) => unknown {
  try {
    return compileFn(schema, { assertOnly: true }) as (input: unknown) => unknown;
  } catch {
    return parser;
  }
}

export interface CompileOptions {
  /** Throw the refusal instead of returning the schema uncompiled. */
  strict?: boolean | undefined;
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

      const out = parser(payload.value);
      if (out !== INVALID) {
        payload.value = out;
        return payload;
      }
      // Mark this parse as runtime-driven: under global mode every nested schema carries its own compiled wrapper, and without the flag the parent's runtime fallback re-enters each child's fast path, running user callbacks a third time on invalid input.
      if (ctx) (ctx as Record<symbol, unknown>)[FALLBACK_FLAG] = true;
      return originalRun(payload, ctx);
    };
    // Let later compiles of (or through) this run unwrap to the true runtime — both the global shim and repeated z.compile calls rely on this. The bag also carries the parser and the validator, so the standalone validate can skip the payload and wrapper on the happy path.
    (wrapped as { __originalRun?: typeof originalRun }).__originalRun = originalRun;
    clone._zod.bag.fallbackRun = originalRun;
    clone._zod.bag.validator = compileValidator(schema, parser as (input: unknown) => unknown);
    clone._zod.run = wrapped;

    // The fast parse/safeParse closures fall back through the source schema's methods. If the source is shim- or wrapper-managed, those methods route into a compiled run and would execute user callbacks a third time on invalid input — the plain method → wrapper path is exactly 2x, so skip.
    if (!liveRun.__originalRun) installCompiledUserMethods(clone, schema, parser);

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
  };

  const doc = new Doc(["input"]);
  const outputAccessor = generateCheck(doc, ctx, schema, "input", !options?.assertOnly);
  // In assert mode a root that built nothing has already returned INVALID on every failure, so reaching the end means valid.
  doc.write(outputAccessor === null ? `return true;` : `return ${outputAccessor};`);

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
  const factoryCode = `return (input) => {\n${code}\n}`;
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
      case "greater_than":
        generateGreaterThanCheck(doc, ctx, def, currentAccessor);
        break;
      case "less_than":
        generateLessThanCheck(doc, ctx, def, currentAccessor);
        break;
      case "multiple_of":
        generateMultipleOfCheck(doc, ctx, def, currentAccessor);
        break;
      case "number_format":
        generateNumberFormatCheck(doc, def, currentAccessor);
        break;
      case "min_length": {
        const min = numericOperand(def.minimum, "min_length");
        const len = codePointLengthVar(
          doc,
          ctx,
          currentAccessor,
          `${currentAccessor}.length >= ${min} && ${currentAccessor}.length < ${def.minimum * 2}`
        );
        doc.write(`if (${len} < ${min}) return INVALID;`);
        break;
      }
      case "max_length": {
        const max = numericOperand(def.maximum, "max_length");
        const len = codePointLengthVar(doc, ctx, currentAccessor, `${currentAccessor}.length > ${max}`);
        doc.write(`if (${len} > ${max}) return INVALID;`);
        break;
      }
      case "length_equals": {
        const exact = numericOperand(def.length, "length_equals");
        const len = codePointLengthVar(
          doc,
          ctx,
          currentAccessor,
          `${currentAccessor}.length >= ${exact} && ${currentAccessor}.length <= ${def.length * 2}`
        );
        doc.write(`if (${len} !== ${exact}) return INVALID;`);
        break;
      }
      case "min_size":
        doc.write(`if (${currentAccessor}.size < ${numericOperand(def.minimum, "min_size")}) return INVALID;`);
        break;
      case "max_size":
        doc.write(`if (${currentAccessor}.size > ${numericOperand(def.maximum, "max_size")}) return INVALID;`);
        break;
      case "size_equals":
        doc.write(`if (${currentAccessor}.size !== ${numericOperand(def.size, "size_equals")}) return INVALID;`);
        break;
      case "string_format":
        currentAccessor = generateStringFormatCheck(doc, ctx, def, currentAccessor);
        break;
      case "custom":
        currentAccessor = generateCustomRefineCheck(doc, ctx, check as CustomCheck, currentAccessor);
        break;
      case "bigint_format":
        generateBigIntFormatCheck(doc, def, currentAccessor);
        break;
      case "mime_type":
        generateMimeTypeCheck(doc, ctx, def, currentAccessor);
        break;
      case "property":
        generatePropertyCheck(doc, ctx, def, currentAccessor);
        break;
      case "overwrite": {
        // Overwrite transforms the value - create new variable for transformed result
        const newAccessor = newVar(ctx);
        generateOverwriteCheck(doc, ctx, check as checks.$ZodCheckOverwrite, currentAccessor, newAccessor);
        currentAccessor = newAccessor;
        break;
      }
      default: {
        void (def satisfies never);
        throw new ZodCompileUnsupportedError(`check type ${(def as { check: string }).check}`);
      }
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
  accessor: string
): void {
  const op = def.inclusive ? "<" : "<=";
  doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) return INVALID;`);
}

function generateLessThanCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckLessThanDef,
  accessor: string
): void {
  const op = def.inclusive ? ">" : ">=";
  doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) return INVALID;`);
}

function generateMultipleOfCheck(
  doc: Doc,
  ctx: CompileContext,
  def: checks.$ZodCheckMultipleOfDef,
  accessor: string
): void {
  if (typeof def.value === "bigint") {
    // a zero divisor has no compiled form: `x % 0n` throws
    if (def.value === BigInt(0)) throw new ZodCompileUnsupportedError("multiple_of check with a zero divisor");
    doc.write(`if (${accessor} % ${def.value}n !== 0n) return INVALID;`);
  } else {
    // Float `%` has well-known precision issues for sub-integer steps
    // (`1.5 % 0.1`, `2.5e-7 % 1e-7`). Defer to util.floatSafeRemainder so the
    // exact tolerance logic stays in one place — single function call is fine
    // since `multipleOf` runs at most once per number.
    const remainder = addConstant(ctx, util.floatSafeRemainder);
    doc.write(`if (${remainder}(${accessor}, ${numericOperand(def.value, "multiple_of")}) !== 0) return INVALID;`);
  }
}

export function generateNumberFormatCheck(doc: Doc, def: checks.$ZodCheckNumberFormatDef, accessor: string): void {
  const format = def.format;
  switch (format) {
    case "safeint":
      doc.write(`if (!Number.isSafeInteger(${accessor})) return INVALID;`);
      break;
    case "int32":
      doc.write(
        `if (!Number.isInteger(${accessor}) || ${accessor} < -2147483648 || ${accessor} > 2147483647) return INVALID;`
      );
      break;
    case "uint32":
      doc.write(`if (!Number.isInteger(${accessor}) || ${accessor} < 0 || ${accessor} > 4294967295) return INVALID;`);
      break;
    case "float32":
      // Float32 range per util.NUMBER_FORMAT_RANGES
      doc.write(
        `if (!Number.isFinite(${accessor}) || ${accessor} < -3.4028234663852886e38 || ${accessor} > 3.4028234663852886e38) return INVALID;`
      );
      break;
    case "float64":
      doc.write(`if (!Number.isFinite(${accessor})) return INVALID;`);
      break;
    default: {
      void (format satisfies never);
      throw new ZodCompileUnsupportedError(`number format ${format}`);
    }
  }
}

function generateBigIntFormatCheck(doc: Doc, def: checks.$ZodCheckBigIntFormatDef, accessor: string): void {
  const format = def.format;
  if (!format) return; // undefined format means no range check
  switch (format) {
    case "int64":
      doc.write(`if (${accessor} < -9223372036854775808n || ${accessor} > 9223372036854775807n) return INVALID;`);
      break;
    case "uint64":
      doc.write(`if (${accessor} < 0n || ${accessor} > 18446744073709551615n) return INVALID;`);
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
  accessor: string
): void {
  const mimeTypes = def.mime;
  if (mimeTypes && mimeTypes.length > 0) {
    const mimeSet = addConstant(ctx, new Set(mimeTypes));
    doc.write(`if (!${mimeSet}.has(${accessor}.type)) return INVALID;`);
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
    const fnConst = addConstant(ctx, def.fn);
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
    const helperConst = addConstant(ctx, helperFn);
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
  accessor: string
): string {
  // Some string formats do runtime validation beyond their advertised pattern. For cheap pure utility checks, hoist the runtime function and call it so the fast path stays correct without cloning the utility logic into codegen.
  const fmt = def.format;
  if (fmt === "base64") {
    const validator = addConstant(ctx, isValidBase64);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (fmt === "base64url") {
    const validator = addConstant(ctx, isValidBase64URL);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (fmt === "jwt") {
    const validator = addConstant(ctx, isValidJWT);
    const alg = addConstant(ctx, (def as unknown as { alg?: util.JWTAlgorithm }).alg ?? null);
    doc.write(`if (!${validator}(${accessor}, ${alg})) return INVALID;`);
    return accessor;
  }
  if (fmt === "ipv6") {
    const validator = addConstant(ctx, isValidIPv6);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (fmt === "cidrv6") {
    const validator = addConstant(ctx, isValidCIDRv6);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (fmt === "credit_card") {
    const validator = addConstant(ctx, isValidCreditCard);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
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
    doc.write(`if (typeof ${urlVar} === "number") return INVALID;`);
    if (formatDef.hostname !== undefined) {
      const hostnameConst = addConstant(ctx, urlHostnameOk);
      doc.write(`if (!${hostnameConst}(${urlVar}, ${defConst}.hostname)) return INVALID;`);
    }
    if (formatDef.protocol !== undefined) {
      const protocolConst = addConstant(ctx, urlProtocolOk);
      doc.write(`if (!${protocolConst}(${urlVar}, ${defConst}.protocol)) return INVALID;`);
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
    doc.write(`if (!${fnConst}(${accessor})) return INVALID;`);
    return accessor;
  }

  // Formats whose `pattern` IS the whole check. An allowlist rather than `if (def.pattern)`, because credit_card, base64 and ipv6 carry a shape-only pattern and validate the rest separately.
  if (PATTERN_IS_COMPLETE.has(fmt) && def.pattern) {
    const patternConst = addConstant(ctx, def.pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
    return accessor;
  }

  const format = def.format as SupportedStringFormat;
  switch (format) {
    case "regex":
      // A regex check with a pattern returned above. Reaching here means there is no pattern to test, and accepting unconditionally would pass every input, so hand the schema back to the runtime.
      throw new ZodCompileUnsupportedError("regex format without a pattern");
    case "lowercase":
      doc.write(`if (${accessor} !== ${accessor}.toLowerCase()) return INVALID;`);
      break;
    case "uppercase":
      doc.write(`if (${accessor} !== ${accessor}.toUpperCase()) return INVALID;`);
      break;
    case "includes":
      doc.write(
        `if (!${accessor}.includes(${util.esc((def as checks.$ZodCheckIncludesDef).includes)})) return INVALID;`
      );
      break;
    case "starts_with": {
      const prefix = (def as checks.$ZodCheckStartsWithDef).prefix;
      doc.write(`if (${accessor}.slice(0, ${prefix.length}) !== ${util.esc(prefix)}) return INVALID;`);
      break;
    }
    case "ends_with": {
      const suffix = (def as checks.$ZodCheckEndsWithDef).suffix;
      doc.write(`if (${accessor}.slice(-${suffix.length}) !== ${util.esc(suffix)}) return INVALID;`);
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

  const codegen = schema._zod.codegen;
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

export function isAsyncFunction(fn: unknown): boolean {
  return (
    typeof fn === "function" &&
    (fn.constructor.name === "AsyncFunction" ||
      (fn as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === "AsyncFunction")
  );
}
