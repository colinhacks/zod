import type * as checks from "./checks.js";
import type * as core from "./core.js";
import { Doc } from "./doc.js";
import type { SomeType } from "./schemas.js";
import * as util from "./util.js";

/** Sentinel value returned by compiled functions when validation fails */
export const INVALID = Symbol.for("zod.compile.invalid");
export type INVALID = typeof INVALID;

type CompiledParser<T> = ((input: unknown) => T | INVALID) & { code: string };

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
 * AOT compile a Zod schema into a standalone parsing function.
 *
 * The generated function returns the parsed/transformed output if validation
 * succeeds, or `INVALID` symbol if validation fails. It always returns a new
 * object/array (never mutates or returns the input directly).
 *
 * Supported schema types: string, number, boolean, object, array, tuple,
 * union, intersection, record, map, set, and more.
 *
 * Not supported: async validation
 */
export function compile<T extends SomeType>(schema: T): CompiledParser<core.output<T>> {
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
  const fullCode = constantNames.length > 0 ? `// Constants: ${constantNames.join(", ")}\n${code}` : code;

  // Create function with constants as closure variables
  const F = Function;
  const factoryCode = `return (input) => {\n${code}\n}`;
  const factory = new F(...constantNames, factoryCode);
  const fn = factory(...constantValues) as CompiledParser<core.output<T>>;
  fn.code = fullCode;
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
        generateMultipleOfCheck(doc, def, currentAccessor);
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

function generateMultipleOfCheck(doc: Doc, def: checks.$ZodCheckMultipleOfDef, accessor: string): void {
  if (typeof def.value === "bigint") {
    doc.write(`if (${accessor} % ${def.value}n !== 0n) return INVALID;`);
  } else {
    doc.write(`if (${accessor} % ${def.value} !== 0) return INVALID;`);
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
    throw new Error("AOT compilation does not support async overwrite transforms");
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
    const fnConst = addConstant(ctx, def.fn);
    doc.write(`if (!${fnConst}(${accessor})) return INVALID;`);
  } else if (check._zod.check) {
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
  // If a pattern is provided, use regex check for all format types
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
      typeAccessor = generateNumberCheck(doc, accessor);
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
      typeAccessor = generateLiteralCheck(doc, schema, accessor);
      break;
    case "enum":
      typeAccessor = generateEnumCheck(doc, ctx, schema, accessor);
      break;
    case "readonly":
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
  const def = schema._zod.def as unknown as { pattern?: RegExp; format?: string };
  if (def.pattern) {
    const patternConst = addConstant(ctx, def.pattern);
    doc.write(`${patternConst}.lastIndex = 0;`);
    doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
  } else if (def.format === "url") {
    // URL validation uses try/catch with new URL()
    doc.write(`try { new URL(${accessor}); } catch { return INVALID; }`);
  }
  return accessor;
}

function generateNumberCheck(doc: Doc, accessor: string): string {
  doc.write(`if (typeof ${accessor} !== "number" || Number.isNaN(${accessor})) return INVALID;`);
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
          d.write(`if (!${knownSet}.has(k)) ${unknownKeysVar}[k] = ${accessor}[k];`);
        });
        doc.write(`}`);
      } else {
        // No known keys - just spread all input
        unknownKeysVar = accessor;
      }
    } else {
      // Catchall with schema: validate each unknown key against catchall
      unknownKeysVar = newVar(ctx);
      const knownSet = addConstant(ctx, new Set(keys));
      doc.write(`const ${unknownKeysVar} = {};`);
      doc.write(`for (const k in ${accessor}) {`);
      doc.indented((d) => {
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

  // Build output object literal
  const outputVar = newVar(ctx);
  const propLiterals = keys.map((k) => `${util.esc(k)}: ${propOutputs[k]}`).join(", ");

  if (unknownKeysVar && unknownKeysVar !== accessor) {
    // Include unknown keys via spread
    doc.write(`const ${outputVar} = { ...${unknownKeysVar}, ${propLiterals} };`);
  } else if (unknownKeysVar === accessor) {
    // All keys are unknown (empty shape with passthrough)
    doc.write(`const ${outputVar} = { ...${accessor} };`);
  } else {
    // Just known properties
    doc.write(`const ${outputVar} = { ${propLiterals} };`);
  }

  return outputVar;
}

function generateOptionalCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { innerType: SomeType };
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

function generateLiteralCheck(doc: Doc, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { values: unknown[] };
  const value = def.values[0];

  if (typeof value === "string") {
    doc.write(`if (${accessor} !== ${util.esc(value)}) return INVALID;`);
  } else if (typeof value === "number" || typeof value === "boolean") {
    doc.write(`if (${accessor} !== ${value}) return INVALID;`);
  } else if (value === null) {
    doc.write(`if (${accessor} !== null) return INVALID;`);
  } else if (typeof value === "bigint") {
    doc.write(`if (${accessor} !== ${value}n) return INVALID;`);
  } else {
    throw new Error(`Unsupported literal type for AOT compilation: ${typeof value}`);
  }
  return accessor;
}

function generateEnumCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const values = (schema._zod as unknown as { values: Set<unknown> }).values;
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
  const outputVar = newVar(ctx);

  // Get the default value getter from the property descriptor
  const descriptor = Object.getOwnPropertyDescriptor(schema._zod.def, "defaultValue");
  const defaultGetter = descriptor?.get;

  // Default allows undefined (replaces with default value), otherwise validates inner type
  if (defaultGetter) {
    const defaultFn = addConstant(ctx, defaultGetter);
    doc.write(`let ${outputVar};`);
    doc.write(`if (${accessor} === undefined) {`);
    doc.indented((d) => {
      d.write(`${outputVar} = ${defaultFn}();`);
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

  doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);

  // Check length bounds
  if (rest) {
    // With rest: minimum length is items.length
    doc.write(`if (${accessor}.length < ${items.length}) return INVALID;`);
  } else {
    // No rest: exact length
    doc.write(`if (${accessor}.length !== ${items.length}) return INVALID;`);
  }

  // Build output array
  const outputVar = newVar(ctx);
  doc.write(`const ${outputVar} = new Array(${accessor}.length);`);

  // Validate and collect each fixed item
  for (let i = 0; i < items.length; i++) {
    const itemSchema = items[i]!;
    const elemVar = newVar(ctx);
    doc.write(`const ${elemVar} = ${accessor}[${i}];`);
    const elemOutput = generateCheck(doc, ctx, itemSchema, elemVar);
    doc.write(`${outputVar}[${i}] = ${elemOutput};`);
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

function generateUnionCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { options: SomeType[] };
  const options = def.options;

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

function generateIntersectionCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { left: SomeType; right: SomeType };

  // Both schemas must pass
  const leftOutput = generateCheck(doc, ctx, def.left, accessor);
  const rightOutput = generateCheck(doc, ctx, def.right, accessor);

  // For intersections of objects, merge the outputs
  const leftType = def.left._zod.def.type;
  const rightType = def.right._zod.def.type;

  if (leftType === "object" && rightType === "object") {
    // Merge both object outputs
    const outputVar = newVar(ctx);
    doc.write(`const ${outputVar} = { ...${leftOutput}, ...${rightOutput} };`);
    return outputVar;
  }

  // For non-objects, return the right side (they should be the same value)
  return rightOutput;
}

function generateRecordCheck(doc: Doc, ctx: CompileContext, schema: SomeType, accessor: string): string {
  const def = schema._zod.def as unknown as { keyType: SomeType; valueType: SomeType };

  doc.write(
    `if (typeof ${accessor} !== "object" || ${accessor} === null || Array.isArray(${accessor})) return INVALID;`
  );

  const outputVar = newVar(ctx);
  const kVar = newVar(ctx);
  const valVar = newVar(ctx);

  doc.write(`const ${outputVar} = {};`);

  // Get key type - if it has values (enum), we know the valid keys
  const keySchema = def.keyType;
  const keyType = keySchema._zod.def.type;

  if (keyType === "enum" || keyType === "literal") {
    // Enumerated keys - check only those keys exist
    const keyValues = (keySchema._zod as unknown as { values: Set<string> }).values;
    const keysConst = addConstant(ctx, keyValues);
    doc.write(`for (const ${kVar} in ${accessor}) {`);
    doc.indented((d) => {
      d.write(`if (!${keysConst}.has(${kVar})) return INVALID;`);
      d.write(`const ${valVar} = ${accessor}[${kVar}];`);
      const valOutput = generateCheck(d, ctx, def.valueType, valVar);
      d.write(`${outputVar}[${kVar}] = ${valOutput};`);
    });
    doc.write(`}`);
  } else {
    // Dynamic keys - validate all keys and values
    doc.write(`for (const ${kVar} in ${accessor}) {`);
    doc.indented((d) => {
      // Skip __proto__
      d.write(`if (${kVar} === "__proto__") continue;`);
      d.write(`const ${valVar} = ${accessor}[${kVar}];`);
      const valOutput = generateCheck(d, ctx, def.valueType, valVar);
      d.write(`${outputVar}[${kVar}] = ${valOutput};`);
    });
    doc.write(`}`);
  }

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
  const def = schema._zod.def as unknown as { in: SomeType; out: SomeType; transform?: (value: unknown) => unknown };

  // Validate input type first
  const inputOutput = generateCheck(doc, ctx, def.in, accessor);

  if (def.transform) {
    // Apply transform and validate output
    if (isAsyncFunction(def.transform)) {
      throw new Error("AOT compilation does not support async transforms in pipes");
    }
    const transformConst = addConstant(ctx, def.transform);
    const transformedVar = newVar(ctx);
    doc.write(`const ${transformedVar} = ${transformConst}(${inputOutput});`);
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
      throw new Error("AOT compilation does not support async custom predicates");
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
      throw new Error("AOT compilation does not support async transforms");
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
