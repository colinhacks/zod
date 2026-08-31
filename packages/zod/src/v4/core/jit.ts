import type * as checks from "./checks.js";
import {
  type CompileContext,
  INVALID,
  type StringFormatDef,
  ZodCompileAsyncError,
  ZodCompileUnsupportedError,
  addConstant,
  compileChild,
  compileFn,
  dropsWhenAbsent,
  generateCheck,
  generateNumberFormatCheck,
  generateStringFormatCheck,
  isAsyncFunction,
  isExactOptional,
  mayOutputUndefined,
  newVar,
  pushIssue,
  requiresPresenceCheck,
  throwAsync,
} from "./compile.js";
import * as core from "./core.js";
import { Doc } from "./doc.js";
import * as regexes from "./regexes.js";
import {
  $ZodAny,
  $ZodArray,
  $ZodBase64,
  $ZodBase64URL,
  $ZodBigInt,
  $ZodBigIntFormat,
  $ZodBoolean,
  $ZodCIDRv4,
  $ZodCIDRv6,
  $ZodCUID,
  $ZodCUID2,
  $ZodCatch,
  $ZodCodec,
  $ZodCreditCard,
  $ZodCustom,
  $ZodCustomStringFormat,
  $ZodDate,
  $ZodDefault,
  $ZodDiscriminatedUnion,
  $ZodE164,
  $ZodEmail,
  $ZodEmoji,
  $ZodEnum,
  $ZodExactOptional,
  $ZodFile,
  $ZodGUID,
  $ZodIPv4,
  $ZodIPv6,
  $ZodISODate,
  $ZodISODateTime,
  $ZodISODuration,
  $ZodISOTime,
  $ZodIntersection,
  $ZodJWT,
  $ZodKSUID,
  $ZodLazy,
  $ZodLiteral,
  $ZodMAC,
  $ZodMap,
  $ZodNaN,
  $ZodNanoID,
  $ZodNever,
  $ZodNonOptional,
  $ZodNull,
  $ZodNullable,
  $ZodNumber,
  $ZodNumberFormat,
  $ZodObject,
  $ZodOptional,
  $ZodPipe,
  $ZodPrefault,
  $ZodPreprocess,
  $ZodReadonly,
  $ZodRecord,
  $ZodSet,
  $ZodString,
  $ZodStringFormat,
  $ZodSuccess,
  $ZodSymbol,
  $ZodTemplateLiteral,
  $ZodTransform,
  $ZodTuple,
  $ZodULID,
  $ZodURL,
  $ZodUUID,
  $ZodUndefined,
  $ZodUnion,
  $ZodUnknown,
  $ZodVoid,
  $ZodXID,
  $ZodXor,
  getTupleOptStart,
  handleCatchall,
  mergeValues,
  normalizeDef,
} from "./schemas.js";
import type { ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
import * as util from "./util.js";

// Per-subclass JIT twins. Each wraps a core schema class and installs `_zod.codegen`, the hook `generateCheck` in compile.ts dispatches through instead of a def.type switch; a schema without the hook refuses compilation.

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
  const optinStart = tupleOptStart(items, "optin");
  const optoutStart = tupleOptStart(items, "optout");

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

function tupleOptStart(items: SomeType[], key: "optin" | "optout"): number {
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
    const keyFast = addConstant(ctx, compileFn(def.keyType));
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

export const $ZodObjectJIT: core.$constructor<$ZodObject> = /*@__PURE__*/ core.$constructor(
  "$ZodObjectJIT",
  (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodObject.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor, buildsValue) => generateObjectCheck(doc, ctx, inst, accessor, buildsValue);

    const superParse = inst._zod.parse;
    const _normalized = util.cached(() => normalizeDef(def));

    const memo = core.globalConfig.memoizer;

    const generateFastpass = (shape: any) => {
      const normalized = _normalized.value;
      const syms = normalized.symbolKeys;
      // a symbol has no source literal, so it is read as `syms[i]` off the closed-over scope
      const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });

      const parseStr = (k: string) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;

      // Prefixes in place, like util.prefixIssues does for every interpreted path.
      const prefixStr = (id: string, k: string) => `
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
          }`;

      doc.write(`const input = payload.value;`);

      const ids: any = Object.create(null);
      let counter = 0;
      for (const key of normalized.allKeys) {
        ids[key] = `key_${counter++}`;
      }

      // A: preserve key order {
      doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
      for (const key of normalized.allKeys) {
        if (key === "__proto__") continue;
        const id = ids[key];
        const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : util.esc(key);
        const isPresent = `${k} in input`;
        const schema = shape[key];
        const optin = schema?._zod?.optin;
        const isOptionalIn = optin !== undefined;
        const isOptionalOut = schema?._zod?.optout === "optional";

        doc.write(`const ${id} = ${parseStr(k)};`);

        if (isOptionalIn && isOptionalOut) {
          // For optional-in/out schemas, ignore errors on absent keys — and, like the interpreted path, drop the value produced alongside them. The middle rung goes further: it permits absence without supplying anything in its place, so an absent key contributes nothing at all.
          const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
          doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
        } else if (!isOptionalIn) {
          doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
        } else {
          doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        
        if (${id}.value === undefined) {
          if (${isPresent}) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }

      `);
        }
      }

      doc.write(`payload.value = newResult;`);
      doc.write(`return payload;`);
      // closing `shape` in is what pays: turbofan specializes the parser against that one shape object, so every `shape[k]._zod.run` folds to a known callee. as a parameter it stays a generic load and measures 13% slower even with the forwarding frame gone
      return doc.compile() as (payload: any, ctx: any) => any;
    };

    let fastpass!: ReturnType<typeof generateFastpass>;

    const isObject = util.isObject;
    const jit = !core.globalConfig.jitless;
    const allowsEval = util.allowsEval;

    const fastEnabled = jit && allowsEval.value; // && !def.catchall;
    const catchall = def.catchall;

    let value!: typeof _normalized.value;

    inst._zod.parse = (payload, ctx) => {
      value ??= _normalized.value;
      const input = payload.value;
      if (!isObject(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          inst,
        });
        return payload;
      }

      if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
        // always synchronous
        if (!fastpass) fastpass = generateFastpass(def.shape);
        payload = fastpass(payload, ctx);

        if (!catchall) return payload;
        return handleCatchall([], input, payload, ctx, value, inst);
      }

      return superParse(payload, ctx);
    };
  }
);

export const $ZodTupleJIT: core.$constructor<$ZodTuple> = /*@__PURE__*/ core.$constructor(
  "$ZodTupleJIT",
  (inst, def) => {
    $ZodTuple.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateTupleCheck(doc, ctx, inst, accessor);

    const superParse = inst._zod.parse;
    const memo = core.globalConfig.memoizer;

    const generateFastpass = () => {
      const items = def.items;
      const rest = def.rest;
      const optinStart = getTupleOptStart(items, "optin");
      const optoutStart = getTupleOptStart(items, "optout");
      const optouts = items.map((item) => item._zod.optout === "optional");
      const doc = new Doc(["payload", "ctx"], { items, rest, inst, memo, optouts });

      // Prefixes in place, like util.prefixIssues does for every interpreted path.
      const prefixStr = (id: string, index: number | string) => `
          for (let j = 0; j < ${id}.issues.length; j++) {
            const iss = ${id}.issues[j];
            iss.path = iss.path ? [${index}, ...iss.path] : [${index}];
            payload.issues.push(iss);
          }`;

      doc.write(`const input = payload.value;`);
      doc.write(`
        if (!Array.isArray(input)) {
          payload.issues.push({ input, inst, expected: "tuple", code: "invalid_type" });
          return payload;
        }`);
      doc.write(memo ? `const newResult = memo.alloc(inst, payload, [], ctx);` : `const newResult = [];`);
      doc.write(`payload.value = newResult;`);

      if (!rest) {
        doc.write(`
          if (input.length < ${optinStart}) {
            payload.issues.push({ code: "too_small", minimum: ${optinStart}, inclusive: true, input, inst, origin: "array" });
            return payload;
          }`);
        doc.write(`
          if (input.length > ${items.length}) {
            payload.issues.push({ code: "too_big", maximum: ${items.length}, inclusive: true, input, inst, origin: "array" });
          }`);
      }

      // Items run first, but their issues are pushed after the rest elements' — the interpreted path collects item results, pushes rest issues inside its rest loop, and only then walks the item results.
      for (let i = 0; i < items.length; i++) {
        doc.write(`const item_${i} = items[${i}]._zod.run({ value: input[${i}], issues: [] }, ctx);`);
      }

      if (rest) {
        doc.write(`
          for (let i = ${items.length}; i < input.length; i++) {
            const r = rest._zod.run({ value: input[i], issues: [] }, ctx);
            if (r.issues.length) {${prefixStr("r", "i")}
            }
            newResult[i] = r.value;
          }`);
      }

      // handleTupleResults, unrolled: the optin/optout rungs per index are codegen-time constants, so each index emits only the branches it can take. `break` becomes a labeled-block break.
      doc.write(`itemLoop: {`);
      for (let i = 0; i < items.length; i++) {
        const id = `item_${i}`;
        const optinOptional = items[i]._zod.optin === "optional";
        const afterOptout = i >= optoutStart;

        if (afterOptout && optinOptional) {
          // absence truncates the tail regardless of issues; when present, the interpreted inner absence check can no longer fire
          doc.write(`
          if (${i} >= input.length) { newResult.length = ${i}; break itemLoop; }
          if (${id}.issues.length) {${prefixStr(id, i)}
          }`);
        } else if (afterOptout) {
          doc.write(`
          if (${id}.issues.length) {
            if (${i} >= input.length) { newResult.length = ${i}; break itemLoop; }${prefixStr(id, i)}
          }`);
        } else {
          doc.write(`
          if (${id}.issues.length) {${prefixStr(id, i)}
          }`);
        }
        doc.write(`newResult[${i}] = ${id}.value;`);
      }
      doc.write(`}`);

      if (optouts.some((o) => o)) {
        doc.write(`
          for (let i = newResult.length - 1; i >= input.length; i--) {
            if (optouts[i] && newResult[i] === undefined) newResult.length = i;
            else break;
          }`);
      }

      doc.write(`return payload;`);
      return doc.compile() as (payload: ParsePayload, ctx: ParseContextInternal) => ParsePayload;
    };

    let fastpass!: ReturnType<typeof generateFastpass>;
    const jit = !core.globalConfig.jitless;
    const allowsEval = util.allowsEval;
    const fastEnabled = jit && allowsEval.value;

    inst._zod.parse = (payload, ctx) => {
      if (fastEnabled && ctx?.async === false && ctx.jitless !== true) {
        if (!fastpass) fastpass = generateFastpass();
        return fastpass(payload, ctx);
      }
      return superParse(payload, ctx);
    };
  }
);

export const $ZodStringJIT: core.$constructor<$ZodString> = /*@__PURE__*/ core.$constructor(
  "$ZodStringJIT",
  (inst, def) => {
    $ZodString.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodStringFormatJIT: core.$constructor<$ZodStringFormat> = /*@__PURE__*/ core.$constructor(
  "$ZodStringFormatJIT",
  (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodCustomStringFormatJIT: core.$constructor<$ZodCustomStringFormat> = /*@__PURE__*/ core.$constructor(
  "$ZodCustomStringFormatJIT",
  (inst, def) => {
    $ZodCustomStringFormat.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodEmailJIT: core.$constructor<$ZodEmail> = /*@__PURE__*/ core.$constructor(
  "$ZodEmailJIT",
  (inst, def) => {
    $ZodEmail.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodGUIDJIT: core.$constructor<$ZodGUID> = /*@__PURE__*/ core.$constructor("$ZodGUIDJIT", (inst, def) => {
  $ZodGUID.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodUUIDJIT: core.$constructor<$ZodUUID> = /*@__PURE__*/ core.$constructor("$ZodUUIDJIT", (inst, def) => {
  $ZodUUID.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodURLJIT: core.$constructor<$ZodURL> = /*@__PURE__*/ core.$constructor("$ZodURLJIT", (inst, def) => {
  $ZodURL.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodEmojiJIT: core.$constructor<$ZodEmoji> = /*@__PURE__*/ core.$constructor(
  "$ZodEmojiJIT",
  (inst, def) => {
    $ZodEmoji.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodNanoIDJIT: core.$constructor<$ZodNanoID> = /*@__PURE__*/ core.$constructor(
  "$ZodNanoIDJIT",
  (inst, def) => {
    $ZodNanoID.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodCUIDJIT: core.$constructor<$ZodCUID> = /*@__PURE__*/ core.$constructor("$ZodCUIDJIT", (inst, def) => {
  $ZodCUID.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodCUID2JIT: core.$constructor<$ZodCUID2> = /*@__PURE__*/ core.$constructor(
  "$ZodCUID2JIT",
  (inst, def) => {
    $ZodCUID2.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodULIDJIT: core.$constructor<$ZodULID> = /*@__PURE__*/ core.$constructor("$ZodULIDJIT", (inst, def) => {
  $ZodULID.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodXIDJIT: core.$constructor<$ZodXID> = /*@__PURE__*/ core.$constructor("$ZodXIDJIT", (inst, def) => {
  $ZodXID.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodKSUIDJIT: core.$constructor<$ZodKSUID> = /*@__PURE__*/ core.$constructor(
  "$ZodKSUIDJIT",
  (inst, def) => {
    $ZodKSUID.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodISODateTimeJIT: core.$constructor<$ZodISODateTime> = /*@__PURE__*/ core.$constructor(
  "$ZodISODateTimeJIT",
  (inst, def) => {
    $ZodISODateTime.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodISODateJIT: core.$constructor<$ZodISODate> = /*@__PURE__*/ core.$constructor(
  "$ZodISODateJIT",
  (inst, def) => {
    $ZodISODate.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodISOTimeJIT: core.$constructor<$ZodISOTime> = /*@__PURE__*/ core.$constructor(
  "$ZodISOTimeJIT",
  (inst, def) => {
    $ZodISOTime.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodISODurationJIT: core.$constructor<$ZodISODuration> = /*@__PURE__*/ core.$constructor(
  "$ZodISODurationJIT",
  (inst, def) => {
    $ZodISODuration.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodIPv4JIT: core.$constructor<$ZodIPv4> = /*@__PURE__*/ core.$constructor("$ZodIPv4JIT", (inst, def) => {
  $ZodIPv4.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodIPv6JIT: core.$constructor<$ZodIPv6> = /*@__PURE__*/ core.$constructor("$ZodIPv6JIT", (inst, def) => {
  $ZodIPv6.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodCIDRv4JIT: core.$constructor<$ZodCIDRv4> = /*@__PURE__*/ core.$constructor(
  "$ZodCIDRv4JIT",
  (inst, def) => {
    $ZodCIDRv4.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodCIDRv6JIT: core.$constructor<$ZodCIDRv6> = /*@__PURE__*/ core.$constructor(
  "$ZodCIDRv6JIT",
  (inst, def) => {
    $ZodCIDRv6.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodBase64JIT: core.$constructor<$ZodBase64> = /*@__PURE__*/ core.$constructor(
  "$ZodBase64JIT",
  (inst, def) => {
    $ZodBase64.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodBase64URLJIT: core.$constructor<$ZodBase64URL> = /*@__PURE__*/ core.$constructor(
  "$ZodBase64URLJIT",
  (inst, def) => {
    $ZodBase64URL.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodE164JIT: core.$constructor<$ZodE164> = /*@__PURE__*/ core.$constructor("$ZodE164JIT", (inst, def) => {
  $ZodE164.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodJWTJIT: core.$constructor<$ZodJWT> = /*@__PURE__*/ core.$constructor("$ZodJWTJIT", (inst, def) => {
  $ZodJWT.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodMACJIT: core.$constructor<$ZodMAC> = /*@__PURE__*/ core.$constructor("$ZodMACJIT", (inst, def) => {
  $ZodMAC.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
});

export const $ZodCreditCardJIT: core.$constructor<$ZodCreditCard> = /*@__PURE__*/ core.$constructor(
  "$ZodCreditCardJIT",
  (inst, def) => {
    $ZodCreditCard.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateStringCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodNumberJIT: core.$constructor<$ZodNumber> = /*@__PURE__*/ core.$constructor(
  "$ZodNumberJIT",
  (inst, def) => {
    $ZodNumber.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateNumberCheck(doc, inst, accessor);
  }
);

export const $ZodNumberFormatJIT: core.$constructor<$ZodNumberFormat> = /*@__PURE__*/ core.$constructor(
  "$ZodNumberFormatJIT",
  (inst, def) => {
    $ZodNumberFormat.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateNumberCheck(doc, inst, accessor);
  }
);

export const $ZodBigIntJIT: core.$constructor<$ZodBigInt> = /*@__PURE__*/ core.$constructor(
  "$ZodBigIntJIT",
  (inst, def) => {
    $ZodBigInt.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateBigIntCheck(doc, inst, accessor);
  }
);

export const $ZodBigIntFormatJIT: core.$constructor<$ZodBigIntFormat> = /*@__PURE__*/ core.$constructor(
  "$ZodBigIntFormatJIT",
  (inst, def) => {
    $ZodBigIntFormat.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateBigIntCheck(doc, inst, accessor);
  }
);

export const $ZodBooleanJIT: core.$constructor<$ZodBoolean> = /*@__PURE__*/ core.$constructor(
  "$ZodBooleanJIT",
  (inst, def) => {
    $ZodBoolean.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateBooleanCheck(doc, accessor);
  }
);

export const $ZodSymbolJIT: core.$constructor<$ZodSymbol> = /*@__PURE__*/ core.$constructor(
  "$ZodSymbolJIT",
  (inst, def) => {
    $ZodSymbol.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateSymbolCheck(doc, accessor);
  }
);

export const $ZodUndefinedJIT: core.$constructor<$ZodUndefined> = /*@__PURE__*/ core.$constructor(
  "$ZodUndefinedJIT",
  (inst, def) => {
    $ZodUndefined.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => generateUndefinedCheck(doc, accessor);
  }
);

export const $ZodNullJIT: core.$constructor<$ZodNull> = /*@__PURE__*/ core.$constructor("$ZodNullJIT", (inst, def) => {
  $ZodNull.init(inst, def);
  inst._zod.codegen = (doc, _ctx, accessor) => generateNullCheck(doc, accessor);
});

export const $ZodVoidJIT: core.$constructor<$ZodVoid> = /*@__PURE__*/ core.$constructor("$ZodVoidJIT", (inst, def) => {
  $ZodVoid.init(inst, def);
  inst._zod.codegen = (doc, _ctx, accessor) => generateVoidCheck(doc, accessor);
});

export const $ZodNaNJIT: core.$constructor<$ZodNaN> = /*@__PURE__*/ core.$constructor("$ZodNaNJIT", (inst, def) => {
  $ZodNaN.init(inst, def);
  inst._zod.codegen = (doc, _ctx, accessor) => generateNaNCheck(doc, accessor);
});

export const $ZodDateJIT: core.$constructor<$ZodDate> = /*@__PURE__*/ core.$constructor("$ZodDateJIT", (inst, def) => {
  $ZodDate.init(inst, def);
  inst._zod.codegen = (doc, _ctx, accessor) => generateDateCheck(doc, accessor);
});

export const $ZodFileJIT: core.$constructor<$ZodFile> = /*@__PURE__*/ core.$constructor("$ZodFileJIT", (inst, def) => {
  $ZodFile.init(inst, def);
  inst._zod.codegen = (doc, _ctx, accessor) => generateFileCheck(doc, accessor);
});

export const $ZodAnyJIT: core.$constructor<$ZodAny> = /*@__PURE__*/ core.$constructor("$ZodAnyJIT", (inst, def) => {
  $ZodAny.init(inst, def);
  // No check needed - pass through
  inst._zod.codegen = (_doc, _ctx, accessor) => accessor;
});

export const $ZodUnknownJIT: core.$constructor<$ZodUnknown> = /*@__PURE__*/ core.$constructor(
  "$ZodUnknownJIT",
  (inst, def) => {
    $ZodUnknown.init(inst, def);
    // No check needed - pass through
    inst._zod.codegen = (_doc, _ctx, accessor) => accessor;
  }
);

export const $ZodNeverJIT: core.$constructor<$ZodNever> = /*@__PURE__*/ core.$constructor(
  "$ZodNeverJIT",
  (inst, def) => {
    $ZodNever.init(inst, def);
    inst._zod.codegen = (doc, _ctx, accessor) => {
      doc.write("return INVALID;");
      return accessor;
    };
  }
);

export const $ZodArrayJIT: core.$constructor<$ZodArray> = /*@__PURE__*/ core.$constructor(
  "$ZodArrayJIT",
  (inst, def) => {
    $ZodArray.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor, buildsValue) => generateArrayCheck(doc, ctx, inst, accessor, buildsValue);
  }
);

export const $ZodNullableJIT: core.$constructor<$ZodNullable> = /*@__PURE__*/ core.$constructor(
  "$ZodNullableJIT",
  (inst, def) => {
    $ZodNullable.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor, buildsValue) =>
      generateNullableCheck(doc, ctx, inst, accessor, buildsValue);
  }
);

export const $ZodOptionalJIT: core.$constructor<$ZodOptional> = /*@__PURE__*/ core.$constructor(
  "$ZodOptionalJIT",
  (inst, def) => {
    $ZodOptional.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor, buildsValue) =>
      generateOptionalCheck(doc, ctx, inst, accessor, buildsValue);
  }
);

export const $ZodExactOptionalJIT: core.$constructor<$ZodExactOptional> = /*@__PURE__*/ core.$constructor(
  "$ZodExactOptionalJIT",
  (inst, def) => {
    $ZodExactOptional.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor, buildsValue) =>
      generateOptionalCheck(doc, ctx, inst, accessor, buildsValue);
  }
);

export const $ZodLiteralJIT: core.$constructor<$ZodLiteral> = /*@__PURE__*/ core.$constructor(
  "$ZodLiteralJIT",
  (inst, def) => {
    $ZodLiteral.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateLiteralCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodEnumJIT: core.$constructor<$ZodEnum> = /*@__PURE__*/ core.$constructor("$ZodEnumJIT", (inst, def) => {
  $ZodEnum.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateEnumCheck(doc, ctx, inst, accessor);
});

export const $ZodTemplateLiteralJIT: core.$constructor<$ZodTemplateLiteral> = /*@__PURE__*/ core.$constructor(
  "$ZodTemplateLiteralJIT",
  (inst, def) => {
    $ZodTemplateLiteral.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateTemplateLiteralCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodNonOptionalJIT: core.$constructor<$ZodNonOptional> = /*@__PURE__*/ core.$constructor(
  "$ZodNonOptionalJIT",
  (inst, def) => {
    $ZodNonOptional.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateNonOptionalCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodDefaultJIT: core.$constructor<$ZodDefault> = /*@__PURE__*/ core.$constructor(
  "$ZodDefaultJIT",
  (inst, def) => {
    $ZodDefault.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateDefaultCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodPrefaultJIT: core.$constructor<$ZodPrefault> = /*@__PURE__*/ core.$constructor(
  "$ZodPrefaultJIT",
  (inst, def) => {
    $ZodPrefault.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateDefaultCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodUnionJIT: core.$constructor<$ZodUnion> = /*@__PURE__*/ core.$constructor(
  "$ZodUnionJIT",
  (inst, def) => {
    $ZodUnion.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateUnionCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodDiscriminatedUnionJIT: core.$constructor<$ZodDiscriminatedUnion> = /*@__PURE__*/ core.$constructor(
  "$ZodDiscriminatedUnionJIT",
  (inst, def) => {
    $ZodDiscriminatedUnion.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateUnionCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodXorJIT: core.$constructor<$ZodXor> = /*@__PURE__*/ core.$constructor("$ZodXorJIT", (inst, def) => {
  $ZodXor.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateUnionCheck(doc, ctx, inst, accessor);
});

export const $ZodIntersectionJIT: core.$constructor<$ZodIntersection> = /*@__PURE__*/ core.$constructor(
  "$ZodIntersectionJIT",
  (inst, def) => {
    $ZodIntersection.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateIntersectionCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodRecordJIT: core.$constructor<$ZodRecord> = /*@__PURE__*/ core.$constructor(
  "$ZodRecordJIT",
  (inst, def) => {
    $ZodRecord.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateRecordCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodMapJIT: core.$constructor<$ZodMap> = /*@__PURE__*/ core.$constructor("$ZodMapJIT", (inst, def) => {
  $ZodMap.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateMapCheck(doc, ctx, inst, accessor);
});

export const $ZodSetJIT: core.$constructor<$ZodSet> = /*@__PURE__*/ core.$constructor("$ZodSetJIT", (inst, def) => {
  $ZodSet.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateSetCheck(doc, ctx, inst, accessor);
});

export const $ZodLazyJIT: core.$constructor<$ZodLazy> = /*@__PURE__*/ core.$constructor("$ZodLazyJIT", (inst, def) => {
  $ZodLazy.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generateLazyCheck(doc, ctx, inst, accessor);
});

export const $ZodPipeJIT: core.$constructor<$ZodPipe> = /*@__PURE__*/ core.$constructor("$ZodPipeJIT", (inst, def) => {
  $ZodPipe.init(inst, def);
  inst._zod.codegen = (doc, ctx, accessor) => generatePipeCheck(doc, ctx, inst, accessor);
});

export const $ZodCodecJIT: core.$constructor<$ZodCodec> = /*@__PURE__*/ core.$constructor(
  "$ZodCodecJIT",
  (inst, def) => {
    $ZodCodec.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generatePipeCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodPreprocessJIT: core.$constructor<$ZodPreprocess> = /*@__PURE__*/ core.$constructor(
  "$ZodPreprocessJIT",
  (inst, def) => {
    $ZodPreprocess.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generatePipeCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodCustomJIT: core.$constructor<$ZodCustom> = /*@__PURE__*/ core.$constructor(
  "$ZodCustomJIT",
  (inst, def) => {
    $ZodCustom.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateCustomCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodTransformJIT: core.$constructor<$ZodTransform> = /*@__PURE__*/ core.$constructor(
  "$ZodTransformJIT",
  (inst, def) => {
    $ZodTransform.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateTransformCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodCatchJIT: core.$constructor<$ZodCatch> = /*@__PURE__*/ core.$constructor(
  "$ZodCatchJIT",
  (inst, def) => {
    $ZodCatch.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => generateCatchCheck(doc, ctx, inst, accessor);
  }
);

export const $ZodReadonlyJIT: core.$constructor<$ZodReadonly> = /*@__PURE__*/ core.$constructor(
  "$ZodReadonlyJIT",
  (inst, def) => {
    $ZodReadonly.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => {
      const innerOut = generateWrapperCheck(doc, ctx, inst, accessor);
      // Runtime freezes the parsed value (schemas.ts handleReadonlyResult).
      const frozenVar = newVar(ctx);
      doc.write(`const ${frozenVar} = Object.freeze(${innerOut});`);
      return frozenVar;
    };
  }
);

export const $ZodSuccessJIT: core.$constructor<$ZodSuccess> = /*@__PURE__*/ core.$constructor(
  "$ZodSuccessJIT",
  (inst, def) => {
    $ZodSuccess.init(inst, def);
    inst._zod.codegen = (doc, ctx, accessor) => {
      // Runtime output is `issues.length === 0`. The fast path only reaches
      // here when the inner check passed (failure returns INVALID and the
      // runtime fallback reproduces the inner issues), so the output is
      // always `true`.
      generateWrapperCheck(doc, ctx, inst, accessor);
      return "true";
    };
  }
);
