import type * as checks from "./checks.js";
import type * as core from "./core.js";
import { Doc } from "./doc.js";
import { isValidBase64, isValidBase64URL, isValidJWT } from "./schemas.js";
import type { ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
import * as util from "./util.js";

/** Sentinel value returned by the compiled fast path when validation fails. Internal. */
export const INVALID: unique symbol = Symbol.for("zod.compile.invalid");
export type INVALID = typeof INVALID;

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

  // Capture the source-of-truth runtime eagerly. If schema._zod.run is itself
  // a shim installed by global-mode (`__originalRun` set), unwrap past it.
  // Otherwise capturing the live property lazily would let a later self-
  // replacement of schema._zod.run feed our wrapper back into itself.
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
  clone._zod.run = (payload: ParsePayload, ctx: ParseContextInternal): any => {
    if (ctx?.async || ctx?.direction === "backward" || ctx?.skipChecks) {
      return originalRun(payload, ctx);
    }

    const out = fast(payload.value);
    if (out !== INVALID) {
      payload.value = out;
      return payload;
    }
    return originalRun(payload, ctx);
  };

  installCompiledUserMethods(clone, schema, fast);

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
  const ctx: CompileContext = {
    constants: new Map(),
    constantCounter: 0,
    varCounter: 0,
  };

  const doc = new Doc(["input"]);
  const outputAccessor = generateCheck(doc, ctx, schema, "input");
  doc.write(`return ${outputAccessor};`);

  // Build the function with hoisted constants
  // Always include INVALID as the first constant
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
  const factory = new F(...constantNames, factoryCode);
  const fn = factory(...constantValues) as CompiledFastpass<core.output<T>>;
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

function generateChecks(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const schemaChecks = schema._zod.def.checks as SupportedCheck[] | undefined;
  if (!schemaChecks || schemaChecks.length === 0) return accessor;

  // Track current accessor - may change if overwrite checks are encountered
  let currentAccessor = accessor;

  for (const check of schemaChecks) {
    const def = check._zod.def;
    switch (def.check) {
      case "greater_than":
        generateGreaterThanCheck(doc, def, currentAccessor);
        break;
      case "less_than":
        generateLessThanCheck(doc, def, currentAccessor);
        break;
      case "multiple_of":
        generateMultipleOfCheck(doc, ctx, def, currentAccessor);
        break;
      case "number_format":
        generateNumberFormatCheck(doc, def, currentAccessor);
        break;
      case "min_length":
        doc.write(`if (${currentAccessor}.length < ${def.minimum}) return INVALID;`);
        break;
      case "max_length":
        doc.write(`if (${currentAccessor}.length > ${def.maximum}) return INVALID;`);
        break;
      case "length_equals":
        doc.write(`if (${currentAccessor}.length !== ${def.length}) return INVALID;`);
        break;
      case "min_size":
        doc.write(`if (${currentAccessor}.size < ${def.minimum}) return INVALID;`);
        break;
      case "max_size":
        doc.write(`if (${currentAccessor}.size > ${def.maximum}) return INVALID;`);
        break;
      case "size_equals":
        doc.write(`if (${currentAccessor}.size !== ${def.size}) return INVALID;`);
        break;
      case "string_format":
        generateStringFormatCheck(doc, ctx, def, currentAccessor);
        break;
      case "custom":
        generateCustomRefineCheck(doc, ctx, check as CustomCheck, currentAccessor);
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
        throw new Error(`Unsupported check type for AOT compilation: ${(def as { check: string }).check}`);
      }
    }
  }

  return currentAccessor;
}

function generateGreaterThanCheck(doc: Doc, def: checks.$ZodCheckGreaterThanDef, accessor: string): void {
  const op = def.inclusive ? "<" : "<=";
  if (typeof def.value === "bigint") {
    doc.write(`if (${accessor} ${op} ${def.value}n) return INVALID;`);
  } else {
    doc.write(`if (${accessor} ${op} ${def.value}) return INVALID;`);
  }
}

function generateLessThanCheck(doc: Doc, def: checks.$ZodCheckLessThanDef, accessor: string): void {
  const op = def.inclusive ? ">" : ">=";
  if (typeof def.value === "bigint") {
    doc.write(`if (${accessor} ${op} ${def.value}n) return INVALID;`);
  } else {
    doc.write(`if (${accessor} ${op} ${def.value}) return INVALID;`);
  }
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
    doc.write(`if (${remainder}(${accessor}, ${def.value}) !== 0) return INVALID;`);
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
      throw new Error(`Unsupported number format for AOT compilation: ${format}`);
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
      throw new Error(`Unsupported bigint format for AOT compilation: ${format}`);
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
    throw new Error("Overwrite check missing transform function (tx)");
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
function generateCustomRefineCheck(doc: Doc, ctx: CompileContext, check: CustomCheck, accessor: string): void {
  const def = check._zod.def;

  if (def.fn) {
    // Simple predicate function (from .refine())
    if (isAsyncFunction(def.fn)) {
      throw new ZodCompileAsyncError("z.compile: async .refine() predicates are not supported");
    }
    const fnConst = addConstant(ctx, def.fn);
    doc.write(`if (!${fnConst}(${accessor})) return INVALID;`);
  } else if (check._zod.check) {
    if (isAsyncFunction(check._zod.check)) {
      throw new ZodCompileAsyncError("z.compile: async .superRefine() / check functions are not supported");
    }
    // SuperRefine or other check function - need to spoof context
    // Create a helper that runs the check and returns true if no issues
    const checkFn = check._zod.check;
    const helperFn = (value: unknown): boolean => {
      const fakePayload = {
        value,
        issues: [] as unknown[],
        addIssue: function (issue: unknown) {
          this.issues.push(issue);
        },
      };
      try {
        const result = checkFn(fakePayload);
        // Handle async (not supported in sync AOT)
        if (result instanceof Promise) {
          throw new Error("AOT compilation does not support async refinements");
        }
        return fakePayload.issues.length === 0;
      } catch {
        return false;
      }
    };
    const helperConst = addConstant(ctx, helperFn);
    doc.write(`if (!${helperConst}(${accessor})) return INVALID;`);
  } else {
    throw new Error("Unsupported custom check - no predicate or check function found");
  }
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

function generateStringFormatCheck(doc: Doc, ctx: CompileContext, def: StringFormatDef, accessor: string): void {
  // Some string formats do runtime validation beyond their advertised pattern.
  // For cheap pure utility checks, hoist the runtime function and call it so
  // the fast path stays correct without cloning the utility logic into codegen.
  const fmt = def.format;
  if (fmt === "base64") {
    const validator = addConstant(ctx, isValidBase64);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return;
  }
  if (fmt === "base64url") {
    const validator = addConstant(ctx, isValidBase64URL);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return;
  }
  if (fmt === "jwt") {
    const validator = addConstant(ctx, isValidJWT);
    const alg = addConstant(ctx, (def as unknown as { alg?: util.JWTAlgorithm }).alg ?? null);
    doc.write(`if (!${validator}(${accessor}, ${alg})) return INVALID;`);
    return;
  }
  if (fmt === "url" || fmt === "httpurl") {
    throw new ZodCompileUnsupportedError(`z.${fmt}() — runtime check beyond pattern`);
  }
  const formatDef = def as unknown as { normalize?: boolean; hostname?: unknown; protocol?: unknown };
  if (formatDef.normalize || formatDef.hostname !== undefined || formatDef.protocol !== undefined) {
    throw new ZodCompileUnsupportedError(`z.url({normalize|hostname|protocol}) — runtime options`);
  }

  // If a pattern is provided, use regex check for all other format types
  if (def.pattern) {
    const patternConst = addConstant(ctx, def.pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
    return;
  }

  const format = def.format as SupportedStringFormat;
  switch (format) {
    case "regex":
      // Pattern already handled above
      break;
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
      throw new Error(`Unsupported string format for AOT compilation: ${format}`);
    }
  }
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
  | "transform";

function generateCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def;
  const type = def.type as SupportedSchemaType;

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
      typeAccessor = generateWrapperCheck(doc, ctx, schema, accessor);
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
    default: {
      void (type satisfies never);
      throw new Error(`Unsupported schema type for AOT compilation: ${type}`);
    }
  }

  // Generate checks after the type-specific validation (may transform value)
  return generateChecks(doc, ctx, schema, typeAccessor);
}

function generateStringCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);

  // Handle string format patterns (email, uuid, etc.)
  const def = schema._zod.def as unknown as {
    pattern?: RegExp;
    format?: string;
    normalize?: boolean;
    hostname?: unknown;
    protocol?: unknown;
  };

  // URL/httpurl have runtime normalization/options behavior (mini z.url() even
  // trims whitespace by default). Force fallback. Pure string utility formats
  // like base64/base64url/jwt are handled by generateStringFormatCheck above or
  // by the schema-level helper block below.
  if (
    def.format === "url" ||
    def.format === "httpurl" ||
    def.normalize ||
    def.hostname !== undefined ||
    def.protocol !== undefined
  ) {
    throw new ZodCompileUnsupportedError(`z.${def.format ?? "string"} — runtime check beyond pattern`);
  }

  if (def.format === "base64") {
    const validator = addConstant(ctx, isValidBase64);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (def.format === "base64url") {
    const validator = addConstant(ctx, isValidBase64URL);
    doc.write(`if (!${validator}(${accessor})) return INVALID;`);
    return accessor;
  }
  if (def.format === "jwt") {
    const validator = addConstant(ctx, isValidJWT);
    const alg = addConstant(ctx, (def as unknown as { alg?: util.JWTAlgorithm }).alg ?? null);
    doc.write(`if (!${validator}(${accessor}, ${alg})) return INVALID;`);
    return accessor;
  }

  if (def.pattern) {
    const patternConst = addConstant(ctx, def.pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
  }
  return accessor;
}

function generateNumberCheck(doc: Doc, schema: SomeType, accessor: string): string {
  // Runtime z.number() rejects NaN and ±Infinity. Number.isFinite covers both.
  doc.write(`if (typeof ${accessor} !== "number" || !Number.isFinite(${accessor})) return INVALID;`);

  // Mini factories like z.int(), z.int32(), z.uint32(), z.float32() bake a
  // number_format check into the schema def itself (not into def.checks).
  // Apply the same constraint here.
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

  // Map from key to output accessor for that property
  const propOutputs: Record<string, string> = {};

  // Validate each property and collect output accessors
  for (const key of keys) {
    const propSchema = shape[key]!;
    const propType = propSchema._zod.def.type;
    const propAccessor = `${accessor}[${util.esc(key)}]`;

    // Required keys (optin != optional) MUST be present in the input. Reading
    // `input[k]` for an absent key returns undefined silently, which would
    // pass schemas like `z.undefined()` or `z.union([z.string(), z.undefined()])`
    // even though the runtime rejects absent keys for those.
    if (propSchema._zod.optin !== "optional") {
      doc.write(`if (!(${util.esc(key)} in ${accessor})) return INVALID;`);
    }

    // For complex types, cache in variable first
    let inputVar = propAccessor;
    if (propType === "object" || propType === "array" || propType === "tuple") {
      inputVar = newVar(ctx);
      doc.write(`const ${inputVar} = ${propAccessor};`);
    }

    // Generate check and get output accessor
    const outputAccessor = generateCheck(doc, ctx, propSchema, inputVar);
    propOutputs[key] = outputAccessor;
  }

  // Handle catchall
  const catchall = def.catchall;
  let unknownKeysVar: string | null = null;

  if (catchall) {
    const catchallType = catchall._zod.def.type;

    if (catchallType === "never") {
      // Strict object: reject unknown keys
      const hasOptional = keys.some((k) => shape[k]!._zod.optin === "optional");

      if (hasOptional) {
        // With optionals: must iterate and check each key
        const condition = keys.map((k) => `k !== ${util.esc(k)}`).join(" && ");
        doc.write(`for (const k in ${accessor}) {`);
        doc.indented((d) => {
          d.write(`if (${condition}) return INVALID;`);
        });
        doc.write(`}`);
      } else {
        // All required: key count is sufficient (wrong keys fail property checks)
        doc.write(`if (Object.keys(${accessor}).length > ${keys.length}) return INVALID;`);
      }
    } else if ((catchallType === "unknown" || catchallType === "any") && !catchall._zod.def.checks?.length) {
      // Loose/passthrough: include unknown keys in output (no validation)
      if (keys.length > 0) {
        unknownKeysVar = newVar(ctx);
        const knownSet = addConstant(ctx, new Set(keys));
        doc.write(`const ${unknownKeysVar} = {};`);
        doc.write(`for (const k in ${accessor}) {`);
        doc.indented((d) => {
          // Skip __proto__: assigning to obj["__proto__"] on a plain {} replaces
          // the prototype via the setter rather than adding an own property.
          // Mirrors the runtime fix in $ZodObject catchall (#5898).
          d.write(`if (k === "__proto__") continue;`);
          d.write(`if (!${knownSet}.has(k)) ${unknownKeysVar}[k] = ${accessor}[k];`);
        });
        doc.write(`}`);
      } else {
        // No known keys - just spread all input. Spread copies enumerable own
        // properties as data slots, so __proto__ can't reach the setter.
        unknownKeysVar = accessor;
      }
    } else {
      // Catchall with schema: validate each unknown key against catchall
      unknownKeysVar = newVar(ctx);
      const knownSet = addConstant(ctx, new Set(keys));
      doc.write(`const ${unknownKeysVar} = {};`);
      doc.write(`for (const k in ${accessor}) {`);
      doc.indented((d) => {
        d.write(`if (k === "__proto__") continue;`);
        d.write(`if (!${knownSet}.has(k)) {`);
        d.indented((d2) => {
          const valVar = newVar(ctx);
          d2.write(`const ${valVar} = ${accessor}[k];`);
          const outputVar = generateCheck(d2, ctx, catchall, valVar);
          d2.write(`${unknownKeysVar}[k] = ${outputVar};`);
        });
        d.write(`}`);
      });
      doc.write(`}`);
    }
  }
  // else: strip mode (no catchall) - unknown keys ignored, only include known keys

  // Build output object preserving the schema's declared key order. For each
  // key:
  //   - optout != "optional" → always include (required, or default/prefault).
  //   - optout == "optional" AND input had the key → include with value.
  //   - optout == "optional" AND input did not have the key → omit (runtime
  //     drops absent optional keys; explicit `undefined` is preserved).
  const outputVar = newVar(ctx);
  const hasOmittableKeys = keys.some((k) => shape[k]!._zod.optout === "optional");

  if (!hasOmittableKeys) {
    const propLiterals = keys.map((k) => `${util.esc(k)}: ${propOutputs[k]}`).join(", ");
    if (unknownKeysVar && unknownKeysVar !== accessor) {
      doc.write(`const ${outputVar} = { ...${unknownKeysVar}, ${propLiterals} };`);
    } else if (unknownKeysVar === accessor) {
      doc.write(`const ${outputVar} = { ...${accessor}, ${propLiterals} };`);
    } else {
      doc.write(`const ${outputVar} = { ${propLiterals} };`);
    }
  } else {
    if (unknownKeysVar && unknownKeysVar !== accessor) {
      doc.write(`const ${outputVar} = { ...${unknownKeysVar} };`);
    } else if (unknownKeysVar === accessor) {
      doc.write(`const ${outputVar} = { ...${accessor} };`);
    } else {
      doc.write(`const ${outputVar} = {};`);
    }

    for (const k of keys) {
      if (shape[k]!._zod.optout === "optional") {
        doc.write(`if (${util.esc(k)} in ${accessor}) ${outputVar}[${util.esc(k)}] = ${propOutputs[k]};`);
      } else {
        doc.write(`${outputVar}[${util.esc(k)}] = ${propOutputs[k]};`);
      }
    }
  }

  return outputVar;
}

function generateOptionalCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  // exactOptional ("key may be absent, but explicit `undefined` is invalid")
  // is structurally type:"optional" but with overridden parse that doesn't
  // accept undefined. The fast path can't tell "absent" from "present and
  // undefined" so it would incorrectly accept explicit undefined here.
  // Force fallback.
  if ((schema._zod as any).traits?.has?.("$ZodExactOptional")) {
    throw new ZodCompileUnsupportedError("z.exactOptional — runtime distinguishes absent vs explicit undefined");
  }

  const def = schema._zod.def as unknown as { innerType: SomeType };

  // Optional-wrapping-default ("apply default through the optional") requires
  // running the default's getter when input is undefined. Fast path's "skip
  // inner entirely if undefined" would lose the default.
  const innerType = def.innerType._zod.def.type;
  if (innerType === "default" || innerType === "prefault") {
    throw new ZodCompileUnsupportedError("optional wrapping default — runtime applies default through optional");
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
    const elemOutput = generateCheck(d, ctx, def.element, elemVar);
    d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
  });
  doc.write(`}`);

  return outputVar;
}

function generateLiteralCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { values: unknown[] };
  const values = def.values;

  // Multi-value literals (z.literal(["a", "b", c])) use Set.has so every
  // allowed value participates. Single-value stays inlined for speed.
  if (values.length > 1) {
    const literalSet = addConstant(ctx, new Set(values));
    doc.write(`if (!${literalSet}.has(${accessor})) return INVALID;`);
    return accessor;
  }

  const value = values[0];
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
    throw new Error(`Unsupported literal type for AOT compilation: ${typeof value}`);
  }
  return accessor;
}

function generateEnumCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const values = (schema._zod as unknown as { values?: Set<unknown> }).values;
  // `_zod.values` is cleared by z.partialRecord and similar helpers when they
  // want a schema that *infers* like an enum but isn't structurally enumerated.
  // Without a known value set the fast path can't check membership; fall back.
  if (!values) {
    doc.write(`return INVALID;`);
    return accessor;
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

  // prefault differs from default: undefined-input → run the prefault value
  // *through* the inner schema (so checks, transforms, overwrites apply).
  // The current codegen would return the raw default value. Force fallback.
  if (schema._zod.def.type === "prefault") {
    throw new ZodCompileUnsupportedError("z.prefault — runtime runs default through inner");
  }

  // "Apply default at output" — when inner is a transform/pipe/codec, the
  // runtime applies the default if the *transformed* value is undefined, not
  // just the input. The fast path can't see the transform's output to decide.
  const innerType = def.innerType._zod.def.type;
  if (innerType === "transform" || innerType === "pipe") {
    throw new ZodCompileUnsupportedError("default wrapping transform/pipe — runtime applies default at output");
  }

  const outputVar = newVar(ctx);

  // Get the default value getter from the property descriptor
  const descriptor = Object.getOwnPropertyDescriptor(schema._zod.def, "defaultValue");
  const defaultGetter = descriptor?.get;

  // Default allows undefined (replaces with default value), otherwise validates inner type
  if (defaultGetter) {
    const defaultFn = addConstant(ctx, defaultGetter);
    const cloneFn = addConstant(ctx, util.shallowClone);
    doc.write(`let ${outputVar};`);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      // Shallow-clone the default so callers can mutate the result without
      // affecting subsequent parses (#5855 — also covers Map/Set).
      d.write(`${outputVar} = ${cloneFn}(${defaultFn}());`);
    });
    doc.write(`} else {`);
    doc.indented((d) => {
      const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
      d.write(`${outputVar} = ${innerOutput};`);
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
  // NonOptional rejects undefined, then validates inner type
  doc.write(`if (${accessor} === undefined) return INVALID;`);
  return generateCheck(doc, ctx, def.innerType, accessor);
}

function generateTupleCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { items: SomeType[]; rest: SomeType | null };
  const items = def.items;
  const rest = def.rest;

  // Tuple-with-defaults and exactOptional-tuple-items have non-trivial
  // output-shaping rules at runtime (dense vs truncated, defaults applied at
  // output side, etc.). The fast path's simple element-by-element loop
  // doesn't model any of that. Detection via optin/optout: an item whose
  // optin==optional but optout!=optional has a default/prefault somewhere in
  // its wrapper chain that fills in the missing slot. Force fallback.
  for (const item of items) {
    if (item._zod.optin === "optional" && item._zod.optout !== "optional") {
      throw new ZodCompileUnsupportedError("tuple with item that fills a missing slot (default/prefault)");
    }
    if ((item._zod as any).traits?.has?.("$ZodExactOptional")) {
      throw new ZodCompileUnsupportedError("tuple with exactOptional item");
    }
  }

  doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);

  // Mirror the runtime's getTupleOptStart: find the first index where every
  // subsequent slot accepts `undefined` (i.e. is optional on input). Anything
  // shorter than this is too_small; trailing absent slots are legal.
  const optinStart = getTupleOptStart(items);

  // Length bounds
  if (rest) {
    // With rest: minimum length is the last required input slot
    doc.write(`if (${accessor}.length < ${optinStart}) return INVALID;`);
  } else {
    // No rest: input must be in [optinStart, items.length]
    doc.write(`if (${accessor}.length < ${optinStart} || ${accessor}.length > ${items.length}) return INVALID;`);
  }

  // Build output array sized to actual input length (capped at items.length
  // when there's no rest). Absent trailing optional slots stay absent.
  const outputVar = newVar(ctx);
  if (rest) {
    doc.write(`const ${outputVar} = new Array(${accessor}.length);`);
  } else {
    doc.write(`const ${outputVar} = new Array(Math.min(${accessor}.length, ${items.length}));`);
  }

  // Validate and collect each fixed item
  for (let i = 0; i < items.length; i++) {
    const itemSchema = items[i]!;
    if (i >= optinStart) {
      // Slot is optional on input: only validate (and emit into output) when
      // the input actually has this index. Otherwise leave the output sparse.
      doc.write(`if (${i} < ${accessor}.length) {`);
      doc.indented((d) => {
        const elemVar = newVar(ctx);
        d.write(`const ${elemVar} = ${accessor}[${i}];`);
        const elemOutput = generateCheck(d, ctx, itemSchema, elemVar);
        d.write(`${outputVar}[${i}] = ${elemOutput};`);
      });
      doc.write(`}`);
    } else {
      const elemVar = newVar(ctx);
      doc.write(`const ${elemVar} = ${accessor}[${i}];`);
      const elemOutput = generateCheck(doc, ctx, itemSchema, elemVar);
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
      const elemOutput = generateCheck(d, ctx, rest, elemVar);
      d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
    });
    doc.write(`}`);
  }

  return outputVar;
}

function getTupleOptStart(items: SomeType[]): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i]!._zod.optin !== "optional") return i + 1;
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

  // z.xor (exclusive union) requires *exactly one* option to match; the fast
  // path's "first match wins" semantics would silently accept multi-match.
  if (def.inclusive === false) {
    throw new ZodCompileUnsupportedError("z.xor — exclusive union requires exactly-one-match");
  }

  if (options.length === 0) {
    doc.write("return INVALID;");
    return accessor;
  }

  if (options.length === 1) {
    return generateCheck(doc, ctx, options[0]!, accessor);
  }

  // Check if all options are literals - use Set optimization
  const allLiterals = options.every((opt) => opt._zod.def.type === "literal");
  if (allLiterals) {
    const values = new Set(options.map((opt) => (opt._zod.def as unknown as { values: unknown[] }).values[0]));
    const valuesConst = addConstant(ctx, values);
    doc.write(`if (!${valuesConst}.has(${accessor})) return INVALID;`);
    return accessor;
  }

  // General case: try each option until one succeeds
  // Use IIFEs that return the output or INVALID
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

function generateIntersectionCheck(_doc: Doc, _ctx: CompileContext, _schema: SomeType, _accessor: string): string {
  // Intersection runtime does deep recursive merge of overlapping object/
  // array values plus rich incompatibility errors. The fast path's shallow
  // `{...left, ...right}` silently produces wrong output for nested merges
  // and accepts incompatible array merges that the runtime rejects. Force
  // fallback for the whole intersection.
  throw new ZodCompileUnsupportedError("z.intersection — runtime deep-merge semantics");
}

function generateRecordCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { keyType: SomeType; valueType: SomeType };

  // Use util.isPlainObject (rejects Date, Map, Set, class instances, etc.) to
  // match runtime behavior. Hoisted call instead of inline so this stays a
  // single source of truth with the runtime parser.
  const isPlainObjectConst = addConstant(ctx, util.isPlainObject);
  doc.write(`if (!${isPlainObjectConst}(${accessor})) return INVALID;`);

  const outputVar = newVar(ctx);
  const kVar = newVar(ctx);
  const valVar = newVar(ctx);

  doc.write(`const ${outputVar} = {};`);

  // Force fallback for any non-plain-string key schema. Runtime applies the
  // keyType to each input key (validating + transforming); the fast path
  // doesn't model that. Even a plain `z.string()` with checks (regex,
  // length, refine, etc.) needs the runtime. We only take the fast path for
  // bare `z.string()` keys with no checks.
  // Also: records with enum/literal key types have "exhaustive" semantics
  // (every value must be present); that's only handled by the runtime.
  // TODO(phase 4): specialized codegen per key-type shape.
  const keyType = def.keyType._zod.def.type;
  const keyHasChecks = (def.keyType._zod.def.checks?.length ?? 0) > 0;
  if (keyType !== "string" || keyHasChecks) {
    doc.write(`return INVALID;`);
    return outputVar;
  }

  // Plain z.string() keys: iterate enumerable own keys and validate each
  // value. Runtime uses Reflect.ownKeys so symbol keys participate in
  // validation; matching that here prevents silently accepting objects with
  // enumerable Symbol keys under z.record(z.string(), ...).
  const propIsEnumerable = addConstant(ctx, Object.prototype.propertyIsEnumerable);
  doc.write(`for (const ${kVar} of Reflect.ownKeys(${accessor})) {`);
  doc.indented((d) => {
    d.write(`if (${kVar} === "__proto__") continue;`);
    d.write(`if (!${propIsEnumerable}.call(${accessor}, ${kVar})) continue;`);
    d.write(`if (typeof ${kVar} !== "string") return INVALID;`);
    d.write(`const ${valVar} = ${accessor}[${kVar}];`);
    const valOutput = generateCheck(d, ctx, def.valueType, valVar);
    d.write(`${outputVar}[${kVar}] = ${valOutput};`);
  });
  doc.write(`}`);

  return outputVar;
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
  // File is only available in browser environments
  doc.write(`if (typeof File !== "undefined" && !(${accessor} instanceof File)) return INVALID;`);
  doc.write(
    `if (typeof File === "undefined" && !(${accessor} && typeof ${accessor} === "object" && "name" in ${accessor} && "size" in ${accessor})) return INVALID;`
  );
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
  // For lazy schemas, we use a cached parser that falls back to runtime Zod parsing
  // This handles recursive schemas correctly by avoiding infinite compilation loops
  const def = schema._zod.def as unknown as { getter: () => SomeType };
  const getterConst = addConstant(ctx, def.getter);
  const cacheConst = addConstant(ctx, { parser: null as ((input: unknown) => unknown) | null });

  doc.write(`if (!${cacheConst}.parser) {`);
  doc.indented((d) => {
    d.write(`const inner = ${getterConst}();`);
    d.write(`${cacheConst}.parser = function(input) {`);
    d.indented((d2) => {
      // Use runtime Zod parsing - this correctly handles recursive schemas
      d2.write(`const result = inner._zod.run({ value: input, issues: [] });`);
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
    // Apply transform and validate output. The transform may read its second
    // `payload` argument (codec transforms like z.stringbool() push issues
    // there) so wrap the call in a helper that spoofs a payload. If the
    // transform pushes issues or throws, signal INVALID and let the wrapper
    // fall back to the runtime.
    if (isAsyncFunction(def.transform)) {
      throw new ZodCompileAsyncError("z.compile: async transforms in pipes are not supported");
    }
    const transformFn = def.transform;
    const helperFn = (value: unknown): unknown => {
      const fakePayload = { value, issues: [] as unknown[] };
      try {
        const result = transformFn(value, fakePayload as any);
        if (result instanceof Promise) return INVALID;
        return fakePayload.issues.length === 0 ? result : INVALID;
      } catch {
        return INVALID;
      }
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
    // Custom schema with a predicate function (e.g., z.instanceof)
    const fnConst = addConstant(ctx, def.fn);
    doc.write(`if (!${fnConst}(${accessor})) return INVALID;`);
  } else {
    throw new Error("AOT compilation does not support custom schemas without a predicate function");
  }
  return accessor;
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
      const fakePayload = {
        value,
        issues: [] as unknown[],
      };
      try {
        const result = transformFn(value, fakePayload);
        // Check for async result
        if (result instanceof Promise) {
          throw new Error("Transform returned a Promise - async not supported in AOT");
        }
        return fakePayload.issues.length === 0 ? result : INVALID;
      } catch {
        return INVALID;
      }
    };
    const helperConst = addConstant(ctx, helperFn);
    const outputVar = newVar(ctx);
    doc.write(`const ${outputVar} = ${helperConst}(${accessor});`);
    doc.write(`if (${outputVar} === INVALID) return INVALID;`);
    return outputVar;
  }

  return accessor;
}
