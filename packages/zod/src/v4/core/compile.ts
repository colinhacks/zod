import type * as checks from "./checks.js";
import type * as core from "./core.js";
import { $ZodAsyncError } from "./core.js";
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
  parseValidURL,
} from "./schemas.js";
import type { ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
import * as util from "./util.js";

/** Sentinel value returned by the compiled fast path when validation fails. Internal. */
export const INVALID: unique symbol = Symbol.for("zod.compile.invalid");
export type INVALID = typeof INVALID;

// Set on the parse ctx when a compiled wrapper falls back to the runtime, so nested compiled wrappers skip their fast paths for the rest of that parse.
const FALLBACK_FLAG: unique symbol = Symbol.for("zod.compile.fallback");

interface CompileFastpassOptions {
  debug?: boolean | undefined;
}

type CompiledFastpass<T> = ((input: unknown) => T | INVALID) & { code?: string | undefined };

/** Thrown by `compile()` when the schema contains async refinements or transforms. */
export class ZodCompileAsyncError extends Error {
  constructor(message = "z.compile does not support async refinements, transforms, or checks") {
    super(message);
    this.name = "ZodCompileAsyncError";
  }
}

/**
 * Thrown by `compile()` when the schema contains a feature whose semantics the
 * fast path can't fully model. The shim in `zod/compile` catches this and
 * falls back permanently to the runtime parser for that schema. Users calling
 * `z.compile(s)` explicitly will see this thrown and should not catch it —
 * they should not be compiling that schema.
 */
export class ZodCompileUnsupportedError extends Error {
  constructor(feature: string) {
    super(`z.compile does not support ${feature}; this schema must use the runtime parser`);
    this.name = "ZodCompileUnsupportedError";
  }
}

interface CompileContext {
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
 * AOT-compile a Zod schema. Returns a clone whose `_zod.run` calls a generated
 * fast path first and falls back to the original runtime parser on failure.
 *
 * - Forward direction only. Backward (encode), async, and `skipChecks` paths
 *   bypass the fast path and use the runtime directly.
 * - Throws `ZodCompileAsyncError` at compile time if the schema contains any
 *   async refinement/transform/check. Async detection is static: the
 *   `isAsyncFunction` probe runs on every hoisted user function.
 * - The original schema is unchanged. The clone shares children by reference.
 */
export function compile<T extends SomeType>(schema: T): T {
  const fast = compileFastpass(schema);
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

    // The value is a placeholder the runtime memoizer is still filling in, so a reference cycle closes here. Only the runtime can finish it — and a transform on the cycle has to raise $ZodCyclicError from its own parse, which a compiled node would skip. Cheap to ask: no memo state on the ctx means no cycle in flight, which is every ordinary parse.
    if (ctx && isBackEdge(ctx, payload.value)) {
      return originalRun(payload, ctx);
    }

    const out = fast(payload.value);
    if (out !== INVALID) {
      payload.value = out;
      return payload;
    }
    // Mark this parse as runtime-driven: under global mode every nested schema carries its own compiled wrapper, and without the flag the parent's runtime fallback re-enters each child's fast path, running user callbacks a third time on invalid input.
    if (ctx) (ctx as Record<symbol, unknown>)[FALLBACK_FLAG] = true;
    return originalRun(payload, ctx);
  };
  // Let later compiles of (or through) this run unwrap to the true runtime — both the global shim and repeated z.compile calls rely on this.
  (wrapped as { __originalRun?: typeof originalRun }).__originalRun = originalRun;
  clone._zod.run = wrapped;

  // The fast parse/safeParse closures fall back through the source schema's methods. If the source is shim- or wrapper-managed, those methods route into a compiled run and would execute user callbacks a third time on invalid input — the plain method → wrapper path is exactly 2x, so skip.
  if (!liveRun.__originalRun) installCompiledUserMethods(clone, schema, fast);

  return clone;
}

function installCompiledUserMethods<T extends SomeType>(
  target: T,
  source: T,
  fast: CompiledFastpass<core.output<T>>
): void {
  const targetAny = target as any;
  const sourceAny = source as any;

  if (typeof sourceAny.safeParse === "function") {
    const originalSafeParse = sourceAny.safeParse;
    targetAny.safeParse = (data: unknown, params?: unknown) => {
      const out = fast(data);
      if (out !== INVALID) {
        return { success: true, data: out };
      }
      return originalSafeParse(data, params);
    };
  }

  if (typeof sourceAny.parse === "function") {
    const originalParse = sourceAny.parse;
    targetAny.parse = (data: unknown, params?: unknown) => {
      const out = fast(data);
      if (out !== INVALID) {
        return out;
      }
      return originalParse(data, params);
    };
  }
}

/**
 * Generate the standalone fast-path validator. Returns a function that takes an
 * input and returns either the parsed/transformed value or the `INVALID`
 * sentinel. Internal — consumers should use `compile()`.
 */
export function compileFastpass<T extends SomeType>(
  schema: T,
  options?: CompileFastpassOptions
): CompiledFastpass<core.output<T>> {
  // A recursive schema can be re-entered by a single parse, which is how input containing a reference cycle terminates: the runtime memoizer registers each in-progress output before its children run, keyed on the parse context every schema in that call shares. The generated fast path takes an input and returns a value — it has no context to key on, so it would follow the cycle in the input until the stack ran out. Hand the whole schema to the runtime. Walking the graph reads `shape`, which some schemas define as a getter that throws (`z.pick()` with an unrecognized mask key). Treat "can't tell" as recursive: the runtime raises that error from the parse where it belongs, and every escape from here stays a ZodCompileUnsupportedError.
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
  const outputAccessor = generateCheck(doc, ctx, schema, "input");
  doc.write(`return ${outputAccessor};`);

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
  let fn: CompiledFastpass<core.output<T>>;
  try {
    const factory = new F(...constantNames, factoryCode);
    fn = factory(...constantValues) as CompiledFastpass<core.output<T>>;
  } catch (err) {
    // Malformed generated code (or a CSP environment rejecting `new Function`) surfaces as a typed error so the global shim falls back to the runtime instead of crashing with a raw SyntaxError/EvalError.
    throw new ZodCompileUnsupportedError(`this schema (generated code failed to evaluate: ${(err as Error).message})`);
  }
  if (options?.debug) {
    fn.code = fullCode;
  }
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

function newVar(ctx: CompileContext): string {
  return `v${ctx.varCounter++}`;
}

// Runtime helper called from inside the compiled fast path. Black-boxes a child schema by running its `_zod.run` with a fresh payload. Returns either the parsed value, INVALID (validation failed, triggers outer fallback), or signals async-boundary-violation by returning INVALID when the run resolves asynchronously. Used by the runtime-island pattern (see `compileChild`).
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
function compileChild(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const contentLen = doc.content.length;
  const constantCount = ctx.constants.size;
  const constantCounter = ctx.constantCounter;
  const varCounter = ctx.varCounter;
  try {
    return generateCheck(doc, ctx, schema, accessor);
  } catch (err) {
    if (!(err instanceof ZodCompileUnsupportedError)) throw err;
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

function generateChecks(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const schemaChecks = schema._zod.def.checks as SupportedCheck[] | undefined;
  if (!schemaChecks || schemaChecks.length === 0) return accessor;

  // Track current accessor - may change if overwrite checks are encountered
  let currentAccessor = accessor;

  for (const check of schemaChecks) {
    const def = check._zod.def;
    // Custom `when` gates make the runtime skip a check conditionally; the fast path always runs it, which diverges (dangerously so for value-mutating checks). The six size/length classes auto-default `when` to "skip after aborting issues" — satisfied by the fast path's bail-on-first-failure, and they never mutate values, so they stay compilable.
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
      case "min_length":
        doc.write(`if (${currentAccessor}.length < ${numericOperand(def.minimum, "min_length")}) return INVALID;`);
        break;
      case "max_length":
        doc.write(`if (${currentAccessor}.length > ${numericOperand(def.maximum, "max_length")}) return INVALID;`);
        break;
      case "length_equals":
        doc.write(`if (${currentAccessor}.length !== ${numericOperand(def.length, "length_equals")}) return INVALID;`);
        break;
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

function generateNumberFormatCheck(doc: Doc, def: checks.$ZodCheckNumberFormatDef, accessor: string): void {
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
function generateStringFormatCheck(doc: Doc, ctx: CompileContext, def: StringFormatDef, accessor: string): string {
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
    const validator = addConstant(ctx, parseValidURL);
    const defConst = addConstant(ctx, def);
    const outputVar = newVar(ctx);
    doc.write(`const ${outputVar} = ${validator}(${accessor}, ${defConst});`);
    doc.write(`if (${outputVar} === undefined) return INVALID;`);
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

  // Formats whose `pattern` IS the entire check, so testing the regex is exact. A pattern is not on its own evidence of that: `credit_card` advertises a shape-only pattern and validates the Luhn digit separately, and `base64`, `ipv6` and friends do the same. Emitting the regex for one of those silently accepts invalid input, which is why this is an allowlist rather than an `if (def.pattern)` catch-all — an unrecognized format falls through to the throw below and takes the runtime path instead of a wrong fast one.
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
  | "transform"
  | "catch";

function generateCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def;
  const type = def.type as SupportedSchemaType;

  // Coercion is modelled nowhere: a coercing schema would compile to the bare type test and reject everything it was supposed to convert. Standalone the wrapper hides that, but inside a union a rejected branch is indistinguishable from one the runtime rejected, so a later branch wins and the parse silently returns a different value. Refuse at codegen time, which the union honours.
  if ((def as { coerce?: boolean }).coerce) {
    throw new ZodCompileUnsupportedError(`coercion (z.coerce.${type}())`);
  }

  let typeAccessor: string;

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
      typeAccessor = generateObjectCheck(doc, ctx, schema, accessor);
      break;
    case "optional":
      typeAccessor = generateOptionalCheck(doc, ctx, schema, accessor);
      break;
    case "nullable":
      typeAccessor = generateNullableCheck(doc, ctx, schema, accessor);
      break;
    case "array":
      typeAccessor = generateArrayCheck(doc, ctx, schema, accessor);
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

  // Generate checks after the type-specific validation (may transform value)
  return generateChecks(doc, ctx, schema, typeAccessor);
}

function generateStringCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);

  // A string-format schema (z.email(), z.creditCard(), z.hostname(), …) carries its format on its own def rather than in def.checks, while z.string().email() puts it in def.checks. Both route through generateStringFormatCheck so the two can never drift: keeping a second copy of the format table here is what let z.creditCard() compile to its shape-only regex without the Luhn digit.
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

function generateObjectCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { shape: Record<string, SomeType>; catchall?: SomeType };

  // Check that input is a non-null, non-array object
  doc.write(
    `if (typeof ${accessor} !== "object" || ${accessor} === null || Array.isArray(${accessor})) return INVALID;`
  );

  const shape = def.shape;
  const keys = Object.keys(shape);

  // `__proto__` as an own shape key can't be expressed in an output object literal (the literal form sets the prototype instead of an own property).
  if (keys.includes("__proto__")) {
    throw new ZodCompileUnsupportedError('object shape key "__proto__"');
  }

  // Map from key to output accessor for that property
  const propOutputs: Record<string, string> = {};

  // Validate each property and collect output accessors
  for (const key of keys) {
    const propSchema = shape[key]!;
    // Always cache the property read: the runtime reads input[key] exactly once, so a getter must not be re-read by checks or output assembly.
    const inputVar = newVar(ctx);
    doc.write(`const ${inputVar} = ${accessor}[${util.esc(key)}];`);

    if (propSchema._zod.optin !== undefined) {
      // Any rung of the optin ladder means the container may omit this key. The runtime runs such properties even when absent, then ignores issues on absent keys only when the output is optional too. This is what makes exactOptional compositional: the child rejects explicit undefined, while the object layer suppresses that failure only for an actually absent key.
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
          d.write(`if (${util.esc(key)} in ${accessor}) return INVALID;`);
          d.write(`${outputVar} = undefined;`);
        });
        doc.write(`}`);
      } else {
        doc.write(`if (${outputVar} === INVALID) return INVALID;`);
      }
      propOutputs[key] = outputVar;
    } else {
      if (requiresPresenceCheck(propSchema)) {
        doc.write(`if (!(${util.esc(key)} in ${accessor})) return INVALID;`);
      }

      // Generate check and get output accessor
      const outputAccessor = compileChild(doc, ctx, propSchema, inputVar);
      propOutputs[key] = outputAccessor;
    }
  }

  // Handle catchall
  const catchall = def.catchall;
  let unknownKeysMode: "none" | "passthrough" | "schema" = "none";

  if (catchall) {
    const catchallType = catchall._zod.def.type;

    if (catchallType === "never") {
      // Strict object: reject unknown keys. Runtime iterates with for...in, so inherited enumerable keys count as unrecognized. An undeclared `__proto__` counts too (handleCatchall reports it before skipping the copy, see #6221) — it is only excluded from the *output*, never from this scan. A declared `__proto__` can't reach here; the shape key is rejected at compile time above. One `for...in` for every shape, which is what the runtime does. An own-key count is faster but only equivalent for a plain prototype, and guarding on the prototype meant rejecting a class instance whose own enumerable keys match — input the runtime accepts. Standalone the wrapper hid that; inside a union the branch merely looked rejected and a later one won, so the parse returned a different value with no error at all. `|| "true"` for an empty shape: with no keys the join is "" and the emitted `if () return INVALID;` is a syntax error, which the single top-level `new Function` rejects long after compileChild's per-branch catch could island it — so the whole tree lost its fast path. An empty strict object rejects any own enumerable key, which is what `true` says.
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

  // Build the output: shape keys first in declared order (the runtime assigns them before its catchall loop), then unknown keys in for...in order. Runtime inclusion rule (handlePropertyResult): a key is included iff its output value !== undefined OR the key is present on the input. Props that can never output undefined keep the fast object-literal form.
  const outputVar = newVar(ctx);
  const hasConditionalKeys = keys.some((k) => mayOutputUndefined(shape[k]!));

  if (!hasConditionalKeys) {
    const propLiterals = keys.map((k) => `${util.esc(k)}: ${propOutputs[k]}`).join(", ");
    doc.write(`const ${outputVar} = { ${propLiterals} };`);
  } else {
    doc.write(`const ${outputVar} = {};`);
    for (const k of keys) {
      if (mayOutputUndefined(shape[k]!)) {
        doc.write(
          `if (${propOutputs[k]} !== undefined || ${util.esc(k)} in ${accessor}) ${outputVar}[${util.esc(k)}] = ${propOutputs[k]};`
        );
      } else {
        doc.write(`${outputVar}[${util.esc(k)}] = ${propOutputs[k]};`);
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

function generateOptionalCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  if (isExactOptional(schema)) {
    return generateCheck(doc, ctx, def.innerType, accessor);
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

  const outputVar = newVar(ctx);
  doc.write(`let ${outputVar};`);
  doc.write(`if (${accessor} !== undefined) {`);
  doc.indented((d) => {
    const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
    d.write(`${outputVar} = ${innerOutput};`);
  });
  doc.write(`}`);
  return outputVar;
}

function isExactOptional(schema: SomeType): boolean {
  return (schema._zod as { traits?: Set<string> }).traits?.has("$ZodExactOptional") === true;
}

// A required object key whose value-level fast path would silently accept an absent key (which reads as `undefined`) needs an explicit `key in input` guard. Without it, schemas like `z.undefined()` / `z.any()` / unions containing undefined would pass for missing properties even though the runtime rejects them.
function requiresPresenceCheck(schema: SomeType): boolean {
  return schema._zod.optin === undefined && fastPathAcceptsAbsence(schema);
}

function fastPathAcceptsAbsence(schema: SomeType): boolean {
  // A coercing schema materialises a value out of an absent key — `z.coerce.string()` turns one into "undefined" — but the runtime object refuses to let a coercion fill a key that was not there (#6405). Compilation refuses coercion, so the child becomes a runtime island, and an island is handed `input[key]` with no way to tell absent from explicitly undefined. Report it as absence-accepting so the object emits the presence guard that keeps the two apart.
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

function generateNullableCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
  const outputVar = newVar(ctx);
  doc.write(`let ${outputVar} = null;`);
  doc.write(`if (${accessor} !== null) {`);
  doc.indented((d) => {
    const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
    d.write(`${outputVar} = ${innerOutput};`);
  });
  doc.write(`}`);
  return outputVar;
}

function generateArrayCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { element: SomeType };
  doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);

  // Build a new array with validated/transformed elements
  const outputVar = newVar(ctx);
  const iVar = newVar(ctx);
  const elemVar = newVar(ctx);

  doc.write(`const ${outputVar} = new Array(${accessor}.length);`);
  doc.write(`for (let ${iVar} = 0; ${iVar} < ${accessor}.length; ${iVar}++) {`);
  doc.indented((d) => {
    d.write(`const ${elemVar} = ${accessor}[${iVar}];`);
    const elemOutput = compileChild(d, ctx, def.element, elemVar);
    d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
  });
  doc.write(`}`);

  return outputVar;
}

function generateLiteralCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { values: unknown[] };
  const values = def.values;

  // Multi-value literals (z.literal(["a", "b", c])) use Set.has so every allowed value participates. Single-value stays inlined for speed.
  if (values.length > 1) {
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
  // `_zod.values` is cleared by z.partialRecord and similar helpers when they want a schema that *infers* like an enum but isn't structurally enumerated. Without a known value set the fast path can't check membership. Throw (rather than emit `return INVALID`) so containers island this child and unions fall back whole — a falsely-rejecting branch inside xor would otherwise corrupt the match count into a false accept.
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
  // The runtime inspects what the inner *produced*, not what it was given. Both directions matter: an inner catch or transform can turn a defined input into `undefined`, which has to be rejected, and an inner default turns an absent input into a value, which has to be accepted. Testing the input did neither.
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
  for (const option of def.options) {
    const values = option._zod.propValues?.[def.discriminator];
    if (!values || values.size === 0) {
      throw new ZodCompileUnsupportedError("discriminated union option without static discriminator values");
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

  // Exhaustive records: keyType has a known value set (enum/literal/etc.). Runtime validates every known key, applies key transforms to choose the output key, and rejects unrecognized string keys. Generate the same shape. The runtime gates this on `values && !def.partial`: z.partialRecord keeps its value set but every key is optional, so required-key codegen would reject a record missing one. A loose record passes an unrecognized key through rather than rejecting it, which the scan below cannot express either.
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

    // `mode: "loose"` only changes what happens to *unrecognized* keys — it still requires every enumerated key, so it belongs on this path rather than the per-present-key scan, which has no notion of a declared-but-absent key. Passing it through here matches the runtime, which copies the extra key across and skips `__proto__` so the assignment cannot reseat the output's prototype.
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
    const keyFast = addConstant(ctx, compileFastpass(def.keyType));
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
  const getterConst = addConstant(ctx, def.getter);
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
    // Apply transform and validate output. The transform may read its second `payload` argument (codec transforms like z.stringbool() push issues there) so wrap the call in a helper that spoofs a payload. Pushed issues signal INVALID and the wrapper falls back to the runtime.
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
    const helperConst = addConstant(ctx, helperFn);
    const transformedVar = newVar(ctx);
    doc.write(`const ${transformedVar} = ${helperConst}(${inputOutput});`);
    doc.write(`if (${transformedVar} === INVALID) return INVALID;`);
    return generateCheck(doc, ctx, def.out, transformedVar);
  } else {
    // No transform - validate output type on same value
    return generateCheck(doc, ctx, def.out, inputOutput);
  }
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
    const fnConst = addConstant(ctx, def.fn);
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

  // `.catch(value)` synthesises a tagged thunk for a constant, so anything untagged is a user callback. Every callback is refused, not just one that reads `ctx.error`: whether it does is undecidable here, and a callback that reads it needs issues finalized against the caller's per-parse error map, which generated code never sees. Producing them here gave a different message than `.parse(input, { error })` and, because catch *succeeds*, nothing downstream could notice. Refuse at codegen instead: returning INVALID would be a bail-out, and a union reads that as a rejected branch rather than a reason to hand the whole parse back.
  if (!(def.catchValue as { [util.CONSTANT_CATCH]?: boolean })[util.CONSTANT_CATCH]) {
    throw new ZodCompileUnsupportedError("catch with a callback (only a constant catch value compiles)");
  }

  const outputVar = newVar(ctx);
  doc.write(`let ${outputVar} = (() => {`);
  doc.indented((d) => {
    const innerOut = compileChild(d, ctx, def.innerType, accessor);
    d.write(`return ${innerOut};`);
  });
  doc.write(`})();`);

  const innerConst = addConstant(ctx, def.innerType);
  const catchConst = addConstant(ctx, def.catchValue);
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
    const helperConst = addConstant(ctx, helperFn);
    const outputVar = newVar(ctx);
    doc.write(`const ${outputVar} = ${helperConst}(${accessor});`);
    doc.write(`if (${outputVar} === INVALID) return INVALID;`);
    return outputVar;
  }

  return accessor;
}
