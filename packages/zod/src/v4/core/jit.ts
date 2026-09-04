import type * as checks from "./checks.js";
import {
  type CompileContext,
  INVALID,
  type IssueCodegen,
  type IssuePath,
  SP_INIT,
  type StringFormatDef,
  ZodCompileAsyncError,
  ZodCompileUnsupportedError,
  addConstant,
  addUserConstant,
  compileChild,
  compileChildIssues,
  compileFn,
  dropsWhenAbsent,
  generateCheck,
  generateNumberFormatCheck,
  generatePropertiesChecks,
  generateStringFormatCheck,
  isAsyncFunction,
  isExactOptional,
  issueConsts,
  leafFailBlock,
  leafIssues,
  mayOutputUndefined,
  newVar,
  pipeStops,
  pushInvalidKey,
  pushIssue,
  pushNonOptionalIssue,
  requiresPresenceCheck,
  throwAsync,
  unionIssuesForCompiled,
} from "./compile.js";
import type { Doc } from "./doc.js";
import * as regexes from "./regexes.js";
import { getTupleOptStart, mergeValues } from "./schemas.js";
import type { $ZodProperties, $ZodType, ParseContextInternal, ParsePayload, SomeType } from "./schemas.js";
import * as util from "./util.js";

// The compiler, split per core subclass: one fast-path emitter per class, collected in `emitters` at the bottom and resolved by `codegenFor` from the traits an instance recorded, so `generateCheck` in compile.ts never switches on def.type and a schema with no compilable ancestor refuses compilation.

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

// ---- issue-mode emitters that are a few lines each; the container ones follow below

const STRING_ISSUES = leafIssues((_ctx, _inst, a) => `typeof ${a} !== "string"`);
const NUMBER_ISSUES = leafIssues((_ctx, _inst, a) => `typeof ${a} !== "number" || !Number.isFinite(${a})`);

function templateLiteralFail(ctx: CompileContext, inst: SomeType, a: string): string {
  const pattern = (inst._zod as unknown as { pattern: RegExp }).pattern;
  if (!pattern) throw new ZodCompileUnsupportedError("template literal without a pattern");
  const patternConst = addConstant(ctx, pattern);
  return `typeof ${a} !== "string" || (${patternConst}.lastIndex = 0, !${patternConst}.test(${a}))`;
}

function enumFail(ctx: CompileContext, inst: SomeType, a: string): string {
  const values = (inst._zod as unknown as { values?: Set<unknown> }).values;
  if (!values) throw new ZodCompileUnsupportedError("enum schema without enumerated values");
  return `!${addConstant(ctx, values)}.has(${a})`;
}

function literalFail(ctx: CompileContext, inst: SomeType, a: string): string {
  const values = (inst._zod.def as unknown as { values: unknown[] }).values;
  if (values.length !== 1 || (typeof values[0] === "number" && Number.isNaN(values[0]))) {
    return `!${addConstant(ctx, new Set(values))}.has(${a})`;
  }
  const value = values[0];
  if (typeof value === "string") return `${a} !== ${util.esc(value)}`;
  if (typeof value === "number" || typeof value === "boolean") return `${a} !== ${value}`;
  if (value === null) return `${a} !== null`;
  if (value === undefined) return `${a} !== undefined`;
  if (typeof value === "bigint") return `${a} !== ${value}n`;
  throw new ZodCompileUnsupportedError(`literal type ${typeof value}`);
}

// unconditional canonical push; value stays the input, like the interpreter
const neverIssues: IssueCodegen = (doc, ctx, inst, accessor, path) => {
  doc.write(leafFailBlock(ctx, inst, accessor, path));
  return accessor;
};

const nullableIssues: IssueCodegen = (doc, ctx, inst, accessor, path, shared) => {
  const inner = (inst._zod.def as unknown as { innerType: SomeType }).innerType;
  const v = newVar(ctx);
  doc.write(`let ${v} = null;`);
  doc.write(`if (${accessor} !== null) {`);
  doc.indented((d) => {
    const iv = compileChildIssues(d, ctx, inner, accessor, path, shared);
    d.write(`${v} = ${iv};`);
  });
  doc.write(`}`);
  return v;
};

const nonOptionalIssues: IssueCodegen = (doc, ctx, inst, accessor, path, shared, mark) => {
  const inner = (inst._zod.def as unknown as { innerType: SomeType }).innerType;
  const { pfx } = issueConsts(ctx);
  const iv = compileChildIssues(doc, ctx, inner, accessor, path, shared);
  const v = newVar(ctx);
  doc.write(`const ${v} = ${iv};`);
  const pushConst = addConstant(ctx, pushNonOptionalIssue);
  const instConst = addConstant(ctx, inst);
  const m2 = newVar(ctx);
  const prefix = path.length ? ` ${pfx}(payload.issues, ${m2}, [${path.join(", ")}]);` : "";
  doc.write(
    `if (payload.issues.length === ${mark} && ${v} === undefined) { const ${m2} = payload.issues.length; ${pushConst}(payload.issues, ${v}, ${instConst});${prefix} }`
  );
  return v;
};

const readonlyIssues: IssueCodegen = (doc, ctx, inst, accessor, path, shared) => {
  const inner = (inst._zod.def as unknown as { innerType: SomeType }).innerType;
  const iv = compileChildIssues(doc, ctx, inner, accessor, path, shared);
  const v = newVar(ctx);
  doc.write(`const ${v} = Object.freeze(${iv});`);
  return v;
};

const successIssues: IssueCodegen = (doc, ctx, inst, accessor, path, shared, mark) => {
  const inner = (inst._zod.def as unknown as { innerType: SomeType }).innerType;
  compileChildIssues(doc, ctx, inner, accessor, path, shared);
  const v = newVar(ctx);
  doc.write(`const ${v} = payload.issues.length === ${mark};`);
  return v;
};

const pipeIssues: IssueCodegen = (doc, ctx, inst, accessor, path, shared, mark) => {
  const pdef = inst._zod.def as unknown as { in: SomeType; out: SomeType; transform?: unknown };
  // a transform between the stages runs inside the pipe's own parse; refusing lets the caller island the whole node, checks included
  if (pdef.transform) throw new ZodCompileUnsupportedError("a pipe with a transform in issue mode");
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
  return { value: v, abOverride: stopped };
};

// the runtime parse runs the user transform against the shared scratch payload, installing its own normalizing addIssue — canonical issues, callback runs once
const transformIssues: IssueCodegen = (doc, ctx, inst, accessor, path, _shared, mark) => {
  const tdef = inst._zod.def as unknown as { transform?: (v: unknown, p: unknown) => unknown };
  if (!tdef.transform) return accessor;
  if (isAsyncFunction(tdef.transform)) throw new ZodCompileAsyncError();
  const { pfx } = issueConsts(ctx);
  const parseConst = addConstant(ctx, inst._zod.parse);
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
  return v;
};

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
  const optinStart = getTupleOptStart(items as unknown as readonly $ZodType[], "optin");
  const optoutStart = getTupleOptStart(items as unknown as readonly $ZodType[], "optout");

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
    if (def.unionFallback || options.length === 0)
      throw new ZodCompileUnsupportedError("a union fallback in issue mode");
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
    throw new ZodCompileUnsupportedError("an exclusive union in issue mode");
  }
  if (options.length === 0) throw new ZodCompileUnsupportedError("an empty union in issue mode");
  if (options.length === 1) return compileChildIssues(doc, ctx, options[0]!, accessor, path, shared);

  const allLiterals = options.every(
    (opt) => opt._zod.def.type === "literal" && !(opt._zod.def.checks as unknown[] | undefined)?.length
  );
  if (allLiterals) {
    const values = new Set(options.flatMap((opt) => (opt._zod.def as unknown as { values: unknown[] }).values));
    const valuesConst = addConstant(ctx, values);
    const v = newVar(ctx);
    doc.write(`let ${v} = ${accessor};`);
    // cold: the union's own parse pushes the canonical invalid_union (its checks stay with the central chain, so no island here)
    doc.write(`if (!${valuesConst}.has(${accessor})) ${leafFailBlock(ctx, schema, accessor, path)}`);
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

// Mirrors $ZodRecord.parse. An enumerable key schema walks the declared keys and reports extras as unrecognized; any other key schema is a constraint every own enumerable key must satisfy, with the runtime's numeric-string retry. A rejected key is pushed cold through `pushInvalidKey` (loose keeps it unvalidated, a partial record with enumerable keys counts it as unrecognized); values compile in issue mode so the walk continues past a bad one.
function generateRecordIssues(
  doc: Doc,
  ctx: CompileContext,
  schema: SomeType,
  accessor: string,
  path: IssuePath,
  shared: boolean
): string {
  const def = schema._zod.def as unknown as {
    keyType: SomeType;
    valueType: SomeType;
    mode?: string;
    partial?: boolean;
  };
  const isLoose = def.mode === "loose";
  const keyValues = (def.keyType._zod as unknown as { values?: Set<unknown> }).values;
  const isPlainObjectConst = addConstant(ctx, util.isPlainObject);
  const instConst = addConstant(ctx, schema);
  const pathProp = path.length ? `, path: [${path.join(", ")}]` : "";
  const v = newVar(ctx);
  doc.write(`let ${v} = ${accessor};`);
  doc.write(`if (!${isPlainObjectConst}(${accessor})) ${leafFailBlock(ctx, schema, accessor, path)}`);
  doc.write(`else {`);
  doc.indented((d) => {
    const out = newVar(ctx);
    const unrec = newVar(ctx);
    d.write(`const ${out} = {};`);
    d.write(`let ${unrec};`);
    const pushUnrecognized = () =>
      d.write(
        `if (${unrec}) payload.issues.push({ code: "unrecognized_keys", input: ${accessor}, inst: ${instConst}, keys: ${unrec}, continue: true${pathProp} });`
      );
    if (keyValues && !def.partial) {
      const keyFast = addConstant(ctx, compileFn(def.keyType));
      const badKeyConst = addConstant(ctx, pushInvalidKey);
      const keyTypeConst = addConstant(ctx, def.keyType);
      const knownKeys: Array<string | symbol> = [];
      for (const key of keyValues) {
        if (!(typeof key === "string" || typeof key === "number" || typeof key === "symbol")) {
          throw new ZodCompileUnsupportedError(`record key value ${String(key)}`);
        }
        knownKeys.push(typeof key === "number" ? key.toString() : key);
        // a declared __proto__ is stripped but is not an unrecognized key
        if (key === "__proto__") continue;
        const keyConst = addConstant(ctx, key);
        const outKey = newVar(ctx);
        const label = `r${newVar(ctx)}`;
        d.write(`${label}: {`);
        d.indented((d2) => {
          d2.write(`const ${outKey} = ${keyFast}(${keyConst});`);
          d2.write(
            `if (${outKey} === INVALID) { ${badKeyConst}(${keyTypeConst}, ${keyConst}, payload, pctx, ${instConst}, [${path.join(", ")}]); break ${label}; }`
          );
          d2.write(`if (${outKey} === "__proto__") break ${label};`);
          const valueVar = newVar(ctx);
          // the path element is the declared key as declared: a numeric key stays a number, like util.prefixIssues(key, …) in the runtime
          const pathExpr = typeof key === "number" ? String(key) : literalPropertyKey(ctx, key);
          d2.write(`const ${valueVar} = ${accessor}[${pathExpr}];`);
          const val = compileChildIssues(d2, ctx, def.valueType, valueVar, [...path, pathExpr], shared);
          d2.write(`${out}[${outKey}] = ${val};`);
        });
        d.write(`}`);
      }
      const knownConst = addConstant(ctx, new Set(knownKeys));
      const k = newVar(ctx);
      d.write(`for (const ${k} in ${accessor}) {`);
      d.indented((d2) => {
        d2.write(`if (${knownConst}.has(${k})) continue;`);
        if (isLoose) d2.write(`if (${k} !== "__proto__") ${out}[${k}] = ${accessor}[${k}];`);
        else d2.write(`(${unrec} ??= []).push(${k});`);
      });
      d.write(`}`);
      pushUnrecognized();
    } else {
      const keyDef = def.keyType._zod.def as { type: string; format?: string; coerce?: boolean; checks?: unknown[] };
      const keyIsBareString =
        keyDef.type === "string" && keyDef.format === undefined && !keyDef.coerce && (keyDef.checks?.length ?? 0) === 0;
      const keyFast = keyIsBareString ? null : addConstant(ctx, compileFn(def.keyType));
      const numericConst = addConstant(ctx, regexes.number);
      const propIsEnumerableConst = addConstant(ctx, Object.prototype.propertyIsEnumerable);
      const badKeyConst = addConstant(ctx, pushInvalidKey);
      const keyTypeConst = addConstant(ctx, def.keyType);
      const k = newVar(ctx);
      const outKey = newVar(ctx);
      d.write(`for (const ${k} of Reflect.ownKeys(${accessor})) {`);
      d.indented((d2) => {
        d2.write(`if (${k} === "__proto__") continue;`);
        d2.write(`if (!${propIsEnumerableConst}.call(${accessor}, ${k})) continue;`);
        if (keyFast) {
          d2.write(`let ${outKey} = ${keyFast}(${k});`);
          d2.write(
            `if (${outKey} === INVALID && typeof ${k} === "string" && ${numericConst}.test(${k})) ${outKey} = ${keyFast}(Number(${k}));`
          );
        } else {
          d2.write(`const ${outKey} = typeof ${k} === "string" ? ${k} : INVALID;`);
        }
        const onBadKey = isLoose
          ? `${out}[${k}] = ${accessor}[${k}];`
          : keyValues
            ? `(${unrec} ??= []).push(${k});`
            : `${badKeyConst}(${keyTypeConst}, ${k}, payload, pctx, ${instConst}, [${path.join(", ")}]);`;
        d2.write(`if (${outKey} === INVALID) { ${onBadKey} continue; }`);
        // the key schema can normalize an ordinary key into __proto__; re-check the one actually written under
        d2.write(`if (${outKey} === "__proto__") continue;`);
        const valueVar = newVar(ctx);
        d2.write(`const ${valueVar} = ${accessor}[${k}];`);
        const val = compileChildIssues(d2, ctx, def.valueType, valueVar, [...path, k], shared);
        d2.write(`${out}[${outKey}] = ${val};`);
      });
      d.write(`}`);
      pushUnrecognized();
    }
    d.write(`${v} = ${out};`);
  });
  doc.write(`}`);
  return v;
}

type Codegen = (doc: Doc, ctx: CompileContext, inst: SomeType, accessor: string, buildsValue: boolean) => string | null;

/** A core subclass's two emitters: `fast` writes the reject-on-first-failure path, `issues` the path that pushes the interpreter's issues. A class without `issues` islands through the interpreter in issue mode. */
interface Emitter {
  fast: Codegen;
  issues?: IssueCodegen;
  /** The issue emitter reads `mark` (the issue count before the node). */
  marks?: true;
}

// One emitter per core subclass, keyed by the trait name its constructor records. A class without an entry inherits its nearest ancestor's; a class without any compilable ancestor is unsupported. Only `compile()` reads this, so a bundle that never compiles keeps none of it.
const emitters: Record<string, Emitter> = {
  $ZodObject: {
    fast: (doc, ctx, inst, accessor, buildsValue) => generateObjectCheck(doc, ctx, inst, accessor, buildsValue),
    issues: generateObjectIssues,
  },
  $ZodTuple: {
    fast: (doc, ctx, inst, accessor) => generateTupleCheck(doc, ctx, inst, accessor),
    issues: generateTupleIssues,
  },
  $ZodString: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodStringFormat: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodCustomStringFormat: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodEmail: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodGUID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodUUID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodURL: { fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor), issues: STRING_ISSUES },
  $ZodEmoji: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodNanoID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodCUID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodCUID2: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodULID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodXID: { fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor), issues: STRING_ISSUES },
  $ZodKSUID: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodISODateTime: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodISODate: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodISOTime: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodISODuration: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodIPv4: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodIPv6: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodCIDRv4: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodCIDRv6: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodBase64: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodBase64URL: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodE164: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodJWT: { fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor), issues: STRING_ISSUES },
  $ZodMAC: { fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor), issues: STRING_ISSUES },
  $ZodCreditCard: {
    fast: (doc, ctx, inst, accessor) => generateStringCheck(doc, ctx, inst, accessor),
    issues: STRING_ISSUES,
  },
  $ZodNumber: { fast: (doc, _ctx, inst, accessor) => generateNumberCheck(doc, inst, accessor), issues: NUMBER_ISSUES },
  $ZodNumberFormat: {
    fast: (doc, _ctx, inst, accessor) => generateNumberCheck(doc, inst, accessor),
    issues: NUMBER_ISSUES,
  },
  $ZodBigInt: {
    fast: (doc, _ctx, inst, accessor) => generateBigIntCheck(doc, inst, accessor),
    issues: leafIssues((_ctx, _inst, a) => `typeof ${a} !== "bigint"`),
  },
  $ZodBigIntFormat: {
    fast: (doc, _ctx, inst, accessor) => generateBigIntCheck(doc, inst, accessor),
    issues: leafIssues((_ctx, _inst, a) => `typeof ${a} !== "bigint"`),
  },
  $ZodBoolean: {
    fast: (doc, _ctx, _inst, accessor) => generateBooleanCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `typeof ${a} !== "boolean"`),
  },
  $ZodSymbol: {
    fast: (doc, _ctx, _inst, accessor) => generateSymbolCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `typeof ${a} !== "symbol"`),
  },
  $ZodUndefined: {
    fast: (doc, _ctx, _inst, accessor) => generateUndefinedCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `${a} !== undefined`),
  },
  $ZodNull: {
    fast: (doc, _ctx, _inst, accessor) => generateNullCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `${a} !== null`),
  },
  $ZodVoid: {
    fast: (doc, _ctx, _inst, accessor) => generateVoidCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `${a} !== undefined`),
  },
  $ZodNaN: {
    fast: (doc, _ctx, _inst, accessor) => generateNaNCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `typeof ${a} !== "number" || !Number.isNaN(${a})`),
  },
  $ZodDate: {
    fast: (doc, _ctx, _inst, accessor) => generateDateCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `!(${a} instanceof Date) || Number.isNaN(${a}.getTime())`),
  },
  $ZodFile: {
    fast: (doc, _ctx, _inst, accessor) => generateFileCheck(doc, accessor),
    issues: leafIssues((_ctx, _inst, a) => `!(${a} instanceof File)`),
  },
  $ZodAny: { fast: (_doc, _ctx, _inst, accessor) => accessor, issues: leafIssues(null) },
  $ZodUnknown: { fast: (_doc, _ctx, _inst, accessor) => accessor, issues: leafIssues(null) },
  $ZodNever: {
    fast: (doc, _ctx, _inst, accessor) => {
      doc.write("return INVALID;");
      return accessor;
    },
    issues: neverIssues,
  },
  $ZodArray: {
    fast: (doc, ctx, inst, accessor, buildsValue) => generateArrayCheck(doc, ctx, inst, accessor, buildsValue),
    issues: generateArrayIssues,
  },
  $ZodNullable: {
    fast: (doc, ctx, inst, accessor, buildsValue) => generateNullableCheck(doc, ctx, inst, accessor, buildsValue),
    issues: nullableIssues,
  },
  $ZodOptional: {
    fast: (doc, ctx, inst, accessor, buildsValue) => generateOptionalCheck(doc, ctx, inst, accessor, buildsValue),
    issues: generateOptionalIssues,
  },
  $ZodExactOptional: {
    fast: (doc, ctx, inst, accessor, buildsValue) => generateOptionalCheck(doc, ctx, inst, accessor, buildsValue),
    issues: generateOptionalIssues,
  },
  $ZodLiteral: {
    fast: (doc, ctx, inst, accessor) => generateLiteralCheck(doc, ctx, inst, accessor),
    issues: leafIssues(literalFail),
  },
  $ZodEnum: {
    fast: (doc, ctx, inst, accessor) => generateEnumCheck(doc, ctx, inst, accessor),
    issues: leafIssues(enumFail),
  },
  $ZodTemplateLiteral: {
    fast: (doc, ctx, inst, accessor) => generateTemplateLiteralCheck(doc, ctx, inst, accessor),
    issues: leafIssues(templateLiteralFail),
  },
  $ZodNonOptional: {
    fast: (doc, ctx, inst, accessor) => generateNonOptionalCheck(doc, ctx, inst, accessor),
    issues: nonOptionalIssues,
    marks: true,
  },
  $ZodDefault: {
    fast: (doc, ctx, inst, accessor) => generateDefaultCheck(doc, ctx, inst, accessor),
    issues: generateDefaultIssues,
  },
  $ZodPrefault: {
    fast: (doc, ctx, inst, accessor) => generateDefaultCheck(doc, ctx, inst, accessor),
    issues: generateDefaultIssues,
  },
  $ZodUnion: {
    fast: (doc, ctx, inst, accessor) => generateUnionCheck(doc, ctx, inst, accessor),
    issues: generateUnionIssues,
  },
  $ZodDiscriminatedUnion: {
    fast: (doc, ctx, inst, accessor) => generateUnionCheck(doc, ctx, inst, accessor),
    issues: generateUnionIssues,
  },
  $ZodXor: {
    fast: (doc, ctx, inst, accessor) => generateUnionCheck(doc, ctx, inst, accessor),
    issues: generateUnionIssues,
  },
  $ZodIntersection: { fast: (doc, ctx, inst, accessor) => generateIntersectionCheck(doc, ctx, inst, accessor) },
  $ZodRecord: {
    fast: (doc, ctx, inst, accessor) => generateRecordCheck(doc, ctx, inst, accessor),
    issues: generateRecordIssues,
  },
  $ZodMap: { fast: (doc, ctx, inst, accessor) => generateMapCheck(doc, ctx, inst, accessor) },
  $ZodSet: { fast: (doc, ctx, inst, accessor) => generateSetCheck(doc, ctx, inst, accessor) },
  $ZodLazy: { fast: (doc, ctx, inst, accessor) => generateLazyCheck(doc, ctx, inst, accessor) },
  $ZodPipe: {
    fast: (doc, ctx, inst, accessor) => generatePipeCheck(doc, ctx, inst, accessor),
    issues: pipeIssues,
    marks: true,
  },
  $ZodCodec: {
    fast: (doc, ctx, inst, accessor) => generatePipeCheck(doc, ctx, inst, accessor),
    issues: pipeIssues,
    marks: true,
  },
  $ZodPreprocess: {
    fast: (doc, ctx, inst, accessor) => generatePipeCheck(doc, ctx, inst, accessor),
    issues: pipeIssues,
    marks: true,
  },
  $ZodCustom: {
    fast: (doc, ctx, inst, accessor) => generateCustomCheck(doc, ctx, inst, accessor),
    issues: leafIssues(null),
  },
  $ZodProperties: {
    fast: (doc, ctx, inst, accessor) => {
      generatePropertiesChecks(doc, ctx, (inst as $ZodProperties)._zod.def, accessor, true);
      return accessor;
    },
  },
  $ZodTransform: {
    fast: (doc, ctx, inst, accessor) => generateTransformCheck(doc, ctx, inst, accessor),
    issues: transformIssues,
    marks: true,
  },
  $ZodCatch: { fast: (doc, ctx, inst, accessor) => generateCatchCheck(doc, ctx, inst, accessor) },
  $ZodReadonly: {
    fast: (doc, ctx, inst, accessor) => {
      const innerOut = generateWrapperCheck(doc, ctx, inst, accessor);
      // the runtime freezes the parsed value (handleReadonlyResult)
      const frozenVar = newVar(ctx);
      doc.write(`const ${frozenVar} = Object.freeze(${innerOut});`);
      return frozenVar;
    },
    issues: readonlyIssues,
  },
  $ZodSuccess: {
    fast: (doc, ctx, inst, accessor) => {
      // the runtime output is `issues.length === 0`; the fast path only gets here when the inner check passed, so the output is always true
      generateWrapperCheck(doc, ctx, inst, accessor);
      return "true";
    },
    issues: successIssues,
    marks: true,
  },
};

/** The emitters for a schema's class: the entry for the most specific trait its constructor recorded. */
export function emitterFor(schema: SomeType): Emitter | undefined {
  // traits are recorded outermost-first, so the first hit is the most specific class
  for (const trait of schema._zod.traits) {
    const e = emitters[trait];
    if (e) return e;
  }
  return undefined;
}

/** The fast-path emitter for a schema: its own `_zod.codegen` override, else its class's. */
export function codegenFor(
  schema: SomeType
): ((doc: Doc, ctx: CompileContext, accessor: string, buildsValue: boolean) => string | null) | undefined {
  const own = schema._zod.codegen;
  if (own) return own;
  const emit = emitterFor(schema)?.fast;
  if (!emit) return undefined;
  return (doc, ctx, accessor, buildsValue) => emit(doc, ctx, schema, accessor, buildsValue);
}
