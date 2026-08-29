import type * as checks from "./checks.js";
import type * as JSONSchema from "./json-schema.js";
import * as regexes from "./regexes.js";
import type { $ZodRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";
import {
  type ProcessParams,
  type Processor,
  type RegistryToJSONSchemaParams,
  type Seen,
  type ToJSONSchemaContext,
  type ToJSONSchemaParams,
  type ZodStandardJSONSchemaPayload,
  extractDefs,
  finalize,
  handleUnrepresentable,
  initializeContext,
  process,
} from "./to-json-schema.js";
import { assignProp, getEnumValues } from "./util.js";

const formatMap: Partial<Record<checks.$ZodStringFormats, string | undefined>> = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: "", // do not set
};

// ==================== SIMPLE TYPE PROCESSORS ====================

export const stringProcessor: Processor<schemas.$ZodString> = (schema, ctx, _json, _params) => {
  const json = _json as JSONSchema.StringSchema;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = schema._zod
    .bag as schemas.$ZodStringInternals<unknown>["bag"];
  if (typeof minimum === "number") json.minLength = minimum;
  if (typeof maximum === "number") json.maxLength = maximum;
  // custom pattern overrides format
  if (format) {
    json.format = formatMap[format as checks.$ZodStringFormats] ?? format;
    if (json.format === "") delete json.format; // empty format is not valid

    // `z.iso.time()` is never full-time, and `laxFormat` carries the datetime shapes that also accept what their keyword forbids
    if (format === "time" || laxFormat) {
      delete json.format;
    }
  }
  if (contentEncoding) json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const patternList = [...patterns];
    if (patternList.length === 1) json.pattern = patternList[0]!.source;
    else if (patternList.length > 1) {
      json.allOf = [
        ...patternList.map((regex) => ({
          ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
            ? ({ type: "string" } as const)
            : {}),
          pattern: regex.source,
        })),
      ];
    }
  }
};

export const numberProcessor: Processor<schemas.$ZodNumber> = (schema, ctx, _json, params) => {
  const json = _json as JSONSchema.NumberSchema | JSONSchema.IntegerSchema;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int")) json.type = "integer";
  else json.type = "number";

  // when both minimum and exclusiveMinimum exist, pick the more restrictive one
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";

  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }

  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }

  if (typeof multipleOf === "number") {
    // JSON Schema requires a divisor strictly greater than zero, and a non-finite one does not survive JSON at all. A negative divisor accepts exactly what its absolute value accepts, so it still maps; zero, NaN and Infinity have no keyword form.
    if (Number.isFinite(multipleOf) && multipleOf !== 0) json.multipleOf = Math.abs(multipleOf);
    else
      handleUnrepresentable(
        schema,
        ctx,
        json,
        params,
        `A multipleOf divisor of ${multipleOf} cannot be represented in JSON Schema`
      );
  }
};

export const booleanProcessor: Processor<schemas.$ZodBoolean> = (_schema, _ctx, json, _params) => {
  (json as JSONSchema.BooleanSchema).type = "boolean";
};

export const bigintProcessor: Processor<schemas.$ZodBigInt> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "BigInt cannot be represented in JSON Schema");
};

export const symbolProcessor: Processor<schemas.$ZodSymbol> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Symbols cannot be represented in JSON Schema");
};

export const nullProcessor: Processor<schemas.$ZodNull> = (_schema, ctx, json, _params) => {
  if (ctx.target === "openapi-3.0") {
    json.type = "string";
    json.nullable = true;
    json.enum = [null];
  } else {
    json.type = "null";
  }
};

export const undefinedProcessor: Processor<schemas.$ZodUndefined> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Undefined cannot be represented in JSON Schema");
};

export const voidProcessor: Processor<schemas.$ZodVoid> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Void cannot be represented in JSON Schema");
};

export const neverProcessor: Processor<schemas.$ZodNever> = (_schema, _ctx, json, _params) => {
  json.not = {};
};

export const anyProcessor: Processor<schemas.$ZodAny> = (_schema, _ctx, _json, _params) => {
  // empty schema accepts anything
};

export const unknownProcessor: Processor<schemas.$ZodUnknown> = (_schema, _ctx, _json, _params) => {
  // empty schema accepts anything
};

export const dateProcessor: Processor<schemas.$ZodDate> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Date cannot be represented in JSON Schema");
};

export const enumProcessor: Processor<schemas.$ZodEnum> = (schema, _ctx, json, _params) => {
  const def = schema._zod.def as schemas.$ZodEnumDef;
  const values = getEnumValues(def.entries);

  // an empty enum accepts nothing, same as z.never()
  if (values.length === 0) {
    json.not = {};
    return;
  }

  // Number enums can have both string and number values
  if (values.every((v) => typeof v === "number")) json.type = "number";
  if (values.every((v) => typeof v === "string")) json.type = "string";
  json.enum = values;
};

export const literalProcessor: Processor<schemas.$ZodLiteral> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodLiteralDef<any>;

  // a literal with no values accepts nothing, same as z.never()
  if (def.values.length === 0) {
    json.not = {};
    return;
  }

  const vals: (string | number | boolean | null)[] = [];
  for (const val of def.values) {
    if (val === undefined) {
      // a custom schema replaces the whole literal, so there is nothing left to accumulate
      if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema"))
        return;
      // otherwise do not add to vals
    } else if (typeof val === "bigint") {
      if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema"))
        return;
      vals.push(Number(val));
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {
    // do nothing (an undefined literal was stripped)
  } else if (vals.length === 1) {
    const val = vals[0]!;
    json.type = val === null ? ("null" as const) : (typeof val as any);
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number")) json.type = "number";
    if (vals.every((v) => typeof v === "string")) json.type = "string";
    if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
    if (vals.every((v) => v === null)) json.type = "null";
    json.enum = vals;
  }
};

export const nanProcessor: Processor<schemas.$ZodNaN> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "NaN cannot be represented in JSON Schema");
};

export const templateLiteralProcessor: Processor<schemas.$ZodTemplateLiteral> = (schema, _ctx, json, _params) => {
  const _json = json as JSONSchema.StringSchema;
  const pattern = schema._zod.pattern;
  if (!pattern) throw new Error("Pattern not found in template literal");
  _json.type = "string";
  _json.pattern = pattern.source;
};

export const fileProcessor: Processor<schemas.$ZodFile> = (schema, _ctx, json, _params) => {
  const _json = json as JSONSchema.StringSchema;
  const file: JSONSchema.StringSchema = {
    type: "string",
    format: "binary",
    contentEncoding: "binary",
  };

  const { minimum, maximum, mime } = schema._zod.bag as schemas.$ZodFileInternals["bag"];
  if (minimum !== undefined) file.minLength = minimum;
  if (maximum !== undefined) file.maxLength = maximum;
  if (mime) {
    if (mime.length === 1) {
      file.contentMediaType = mime[0]!;
      Object.assign(_json, file);
    } else {
      Object.assign(_json, file); // shared props at root
      _json.anyOf = mime.map((m) => ({ contentMediaType: m })); // only contentMediaType differs
    }
  } else {
    Object.assign(_json, file);
  }
};

export const successProcessor: Processor<schemas.$ZodSuccess> = (_schema, _ctx, json, _params) => {
  (json as JSONSchema.BooleanSchema).type = "boolean";
};

export const customProcessor: Processor<schemas.$ZodCustom> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};

export const functionProcessor: Processor<schemas.$ZodFunction> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Function types cannot be represented in JSON Schema");
};

export const transformProcessor: Processor<schemas.$ZodTransform> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};

export const mapProcessor: Processor<schemas.$ZodMap> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Map cannot be represented in JSON Schema");
};

export const setProcessor: Processor<schemas.$ZodSet> = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Set cannot be represented in JSON Schema");
};

// ==================== COMPOSITE TYPE PROCESSORS ====================

export const arrayProcessor: Processor<schemas.$ZodArray> = (schema, ctx, _json, params) => {
  const json = _json as JSONSchema.ArraySchema;
  const def = schema._zod.def as schemas.$ZodArrayDef;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number") json.minItems = minimum;
  if (typeof maximum === "number") json.maxItems = maximum;

  json.type = "array";
  json.items = process(def.element, ctx as any, {
    ...params,
    path: [...params.path, "items"],
  });
};

// Transform and catch set `optin = "optional"` at runtime so the parser lets them observe an
// absent key, but their declared input type stays required. An input JSON Schema describes the
// declared type, so resolve past them to the schema that actually carries the optionality.
// Used by both `objectProcessor` (for `required`) and `tupleProcessor` (for `minItems`); see
// wiki/optionality.md, "The JSON Schema emitter reads the *static* value".
function inputOptin(schema: schemas.$ZodType): "optional" | "defaulted" | undefined {
  const def = schema._zod.def;
  if (def.type === "pipe" && (def as schemas.$ZodPipeDef).in._zod.traits.has("$ZodTransform")) {
    return inputOptin((def as schemas.$ZodPipeDef).out);
  }
  if (def.type === "catch") {
    return inputOptin((def as schemas.$ZodCatchDef).innerType);
  }
  return schema._zod.optin;
}

export const objectProcessor: Processor<schemas.$ZodObject> = (schema, ctx, _json, params) => {
  const json = _json as JSONSchema.ObjectSchema;
  const def = schema._zod.def as schemas.$ZodObjectDef;
  const shape = def.shape;

  // dropping it while still emitting `additionalProperties: false` would emit a schema that rejects data this one requires
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  if (
    symbolKeys.length &&
    handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")
  ) {
    return;
  }

  json.type = "object";
  json.properties = {};

  for (const key in shape) {
    // assignProp so a __proto__ key becomes an own property instead of hitting the inherited setter on the plain {} we build into
    assignProp(
      json.properties,
      key,
      process(shape[key]!, ctx as any, {
        ...params,
        path: [...params.path, "properties", key],
      })
    );
  }

  // required keys
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set(
    [...allKeys].filter((key) => {
      const field = def.shape[key]!;
      if (ctx.io === "input") {
        return inputOptin(field) === undefined;
      } else {
        return field._zod.optout === undefined;
      }
    })
  );

  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }

  // catchall
  if (def.catchall?._zod.def.type === "never") {
    // strict
    json.additionalProperties = false;
  } else if (!def.catchall) {
    // regular
    if (ctx.io === "output") json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process(def.catchall, ctx as any, {
      ...params,
      path: [...params.path, "additionalProperties"],
    });
  }
};

export const unionProcessor: Processor<schemas.$ZodUnion> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodUnionDef;
  // Exclusive unions (inclusive === false) use oneOf (exactly one match) instead of anyOf (one or more matches). This includes both z.xor() and discriminated unions
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) =>
    process(x, ctx as any, {
      ...params,
      path: [...params.path, isExclusive ? "oneOf" : "anyOf", i],
    })
  );
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};

export const intersectionProcessor: Processor<schemas.$ZodIntersection> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodIntersectionDef;
  const a = process(def.left, ctx as any, {
    ...params,
    path: [...params.path, "allOf", 0],
  });
  const b = process(def.right, ctx as any, {
    ...params,
    path: [...params.path, "allOf", 1],
  });

  const isSimpleIntersection = (val: any) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...(isSimpleIntersection(a) ? (a.allOf as any[]) : [a]),
    ...(isSimpleIntersection(b) ? (b.allOf as any[]) : [b]),
  ];
  json.allOf = allOf;
  // Recorded innermost first, so a nested intersection has already folded by the time this one is considered. The array is the handle rather than the schema, because a wrapper that inherits this schema shares the same array; `finalize` folds every object holding it. See `foldIntersection`.
  ctx.intersections.push(allOf);
};

export const tupleProcessor: Processor<schemas.$ZodTuple> = (schema, ctx, _json, params) => {
  const json = _json as JSONSchema.ArraySchema;
  const def = schema._zod.def as schemas.$ZodTupleDef;
  json.type = "array";

  const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
  const restPath =
    ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";

  const prefixItems = def.items.map((x, i) =>
    process(x, ctx as any, {
      ...params,
      path: [...params.path, prefixPath, i],
    })
  );
  const rest = def.rest
    ? process(def.rest, ctx as any, {
        ...params,
        path: [...params.path, restPath, ...(ctx.target === "openapi-3.0" ? [def.items.length] : [])],
      })
    : null;

  let minItems = def.items.length;
  while (minItems > 0) {
    const item = def.items[minItems - 1] as schemas.$ZodType;
    const optional = ctx.io === "input" ? inputOptin(item) !== undefined : item._zod.optout === "optional";
    if (!optional) break;
    minItems--;
  }
  const maxItems = def.items.length;
  const isClosed = !def.rest;

  if (ctx.target === "draft-2020-12") {
    json.prefixItems = prefixItems;
    if (isClosed) {
      json.items = false;
    } else if (rest) {
      json.items = rest;
    }
    if (minItems > 0) json.minItems = minItems;
    if (isClosed) json.maxItems = maxItems;
  } else if (ctx.target === "openapi-3.0") {
    json.items = {
      anyOf: prefixItems,
    };

    if (rest) {
      json.items.anyOf!.push(rest);
    }
    if (minItems > 0) json.minItems = minItems;
    if (isClosed) json.maxItems = maxItems;
  } else {
    json.items = prefixItems;
    if (isClosed) {
      json.additionalItems = false;
    } else if (rest) {
      json.additionalItems = rest;
    }
    if (minItems > 0) json.minItems = minItems;
    if (isClosed) json.maxItems = maxItems;
  }

  // explicit user-defined length checks take precedence
  const { minimum, maximum } = schema._zod.bag as {
    minimum?: number;
    maximum?: number;
  };
  if (typeof minimum === "number") json.minItems = minimum;
  if (typeof maximum === "number") json.maxItems = maximum;
};

/** JSON object keys are always strings, so a numeric record key schema is re-expressed over the
 * numeric-string form the record parser matches. Deferred to `finalize`, after the flatten: a key
 * behind a wrapper only carries its own `type` before then, and a union key only has its branches.
 *
 * A numeric bound cannot apply to a property name, so `minimum` and its siblings are dropped rather
 * than carried over: keeping them beside `type: "string"` reproduces the match-nothing schema this
 * exists to fix. A key that carries one therefore emits wider than the record parses — `z.record(z.number().min(5), V)`
 * accepts `"3"` — which is the deliberate trade, since throwing on it would reject an ordinary schema
 * outright. */
function stringifyKeyNames(
  bySchema: Map<JSONSchema.BaseSchema, Seen>,
  json: JSONSchema.BaseSchema,
  visited: Set<JSONSchema.BaseSchema>
): JSONSchema.BaseSchema {
  // an extracted key that rewrites cannot go on sharing its definition — the string form a key position needs is not the number form every other reference wants — so it inlines. One that does not rewrite keeps the `$ref`.
  if (json.$ref) {
    // a recursive key holds its own reference inside its definition, so a node already on the path is left alone rather than resolved again
    if (visited.has(json)) return json;
    visited.add(json);
    const def = bySchema.get(json)?.def;
    if (!def) return json;
    const inlined = stringifyKeyNames(bySchema, def, visited);
    return inlined === def ? json : inlined;
  }

  for (const keyword of ["anyOf", "oneOf"] as const) {
    const branches = json[keyword];
    if (!Array.isArray(branches)) continue;
    const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
    // rebuilding regardless would detach a key that had nothing to re-express, dropping its `$ref` and leaking the internal `id`
    if (mapped.some((branch, i) => branch !== branches[i])) json = { ...json, [keyword]: mapped };
  }

  // a member that already admits a string leaves the key unconstrained, so the node's own type re-expresses only when every member is numeric
  const types = Array.isArray(json.type) ? json.type : [json.type];
  const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
  // a heterogeneous key carries no type at all, so its numeric members are caught here instead
  const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
  if (!numericType && !values?.some((v) => typeof v === "number")) return json;

  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
  if (rest.enum) rest.enum = rest.enum.map((v) => (typeof v === "number" ? String(v) : v));
  else if (typeof rest.const === "number") rest.const = String(rest.const);
  // a heterogeneous key keeps its absent type: the stringified members already say what a key may be
  if (!numericType) return rest;
  rest.type = "string";
  if (!values) rest.pattern = (types.includes("number") ? regexes.number : regexes.integer).source;
  return rest;
}

/** Every record of one conversion, so the carriers are found in a single pass rather than once per record. */
const pendingRecords = new WeakMap<ToJSONSchemaContext, schemas.$ZodType[]>();

function rewriteKeyNames(ctx: ToJSONSchemaContext): void {
  // an extracted key is resolved by the object `extractToDef` left in its place, so the map is built once rather than searched per reference. `_zod.toJSONSchema` can hand the same object to two schemas, so the first entry carrying a body wins, as a search would have found it.
  const bySchema = new Map<JSONSchema.BaseSchema, Seen>();
  for (const entry of ctx.seen.values()) {
    if (entry.def && !bySchema.has(entry.schema)) bySchema.set(entry.schema, entry);
  }

  const rewrites = new Map<JSONSchema.BaseSchema, JSONSchema.BaseSchema>();
  for (const record of pendingRecords.get(ctx) ?? []) {
    const seen = ctx.seen.get(record);
    const names = (seen?.def ?? seen?.schema)?.propertyNames;
    if (!names || names === true || rewrites.has(names)) continue;
    const rewritten = stringifyKeyNames(bySchema, names, new Set());
    if (rewritten !== names) rewrites.set(names, rewritten);
  }
  if (!rewrites.size) return;

  // the flatten has already copied each record's own properties onto every wrapper by reference, and an extracted body is another such copy, so every carrier holding a rewritten key is updated together
  for (const entry of ctx.seen.values()) {
    for (const carrier of [entry.schema, entry.def]) {
      const rewritten = carrier && rewrites.get(carrier.propertyNames as JSONSchema.BaseSchema);
      if (rewritten) carrier!.propertyNames = rewritten;
    }
  }
}

export const recordProcessor: Processor<schemas.$ZodRecord> = (schema, ctx, _json, params) => {
  const json = _json as JSONSchema.ObjectSchema;
  const def = schema._zod.def as schemas.$ZodRecordDef;
  json.type = "object";

  // For looseRecord with regex patterns, use patternProperties. This correctly represents "only validate keys matching the pattern" semantics and composes well with allOf (intersections)
  const keyType = def.keyType as schemas.$ZodTypes;
  const keyBag = keyType._zod.bag as schemas.$ZodStringInternals<unknown>["bag"] | undefined;
  const patterns = keyBag?.patterns;

  if (def.mode === "loose" && patterns && patterns.size > 0) {
    // Use patternProperties for looseRecord with regex patterns
    const valueSchema = process(def.valueType, ctx as any, {
      ...params,
      path: [...params.path, "patternProperties", "*"],
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      assignProp(json.patternProperties, pattern.source, valueSchema);
    }
  } else {
    // Default behavior: use propertyNames + additionalProperties
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = process(def.keyType, ctx as any, {
        ...params,
        path: [...params.path, "propertyNames"],
      });
      let pending = pendingRecords.get(ctx);
      if (!pending) {
        pending = [];
        pendingRecords.set(ctx, pending);
        ctx.deferred.push(() => rewriteKeyNames(ctx));
      }
      pending.push(schema);
    }
    json.additionalProperties = process(def.valueType, ctx as any, {
      ...params,
      path: [...params.path, "additionalProperties"],
    });
  }

  // Add required for keys with discrete values (enum, literal, etc.)
  const keyValues = keyType._zod.values;
  // Every key shares one value schema, so an optional-in value makes the whole key set omittable on input. Output keeps them: the exhaustive branch assigns every key, even one whose value came back undefined.
  const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType as schemas.$ZodType) !== undefined;
  if (keyValues && !def.partial && !omittableOnInput) {
    const validKeyValues = [...keyValues].filter(
      (v): v is string | number => typeof v === "string" || typeof v === "number"
    );

    if (validKeyValues.length > 0) {
      json.required = validKeyValues.map(String);
    }
  }
};

export const nullableProcessor: Processor<schemas.$ZodNullable> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodNullableDef;
  const inner = process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};

export const nonoptionalProcessor: Processor<schemas.$ZodNonOptional> = (schema, ctx, _json, params) => {
  const def = schema._zod.def as schemas.$ZodNonOptionalDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
};

/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
 * A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
 * unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(
  value: unknown,
  schema: schemas.$ZodType,
  ctx: ToJSONSchemaContext,
  json: JSONSchema.BaseSchema,
  params: ProcessParams
): any {
  let unrepresentable = false;
  const serialized = JSON.stringify(value, (_, val) => {
    if (typeof val !== "bigint") return val;
    unrepresentable = true;
    return null;
  });
  if (!unrepresentable) return JSON.parse(serialized);
  handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
  return UNREPRESENTABLE_DEFAULT;
}

export const defaultProcessor: Processor<schemas.$ZodDefault> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodDefaultDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx as ToJSONSchemaContext, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
};

export const prefaultProcessor: Processor<schemas.$ZodPrefault> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodPrefaultDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
  if (ctx.io !== "input") return;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx as ToJSONSchemaContext, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
};

export const catchProcessor: Processor<schemas.$ZodCatch> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodCatchDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
  let catchValue: any;
  try {
    catchValue = def.catchValue(undefined as any);
  } catch {
    handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  json.default = catchValue;
};

export const pipeProcessor: Processor<schemas.$ZodPipe> = (schema, ctx, _json, params) => {
  const def = schema._zod.def as schemas.$ZodPipeDef;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? (inIsTransform ? def.out : def.in) : def.out;
  process(innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = innerType;
};

export const readonlyProcessor: Processor<schemas.$ZodReadonly> = (schema, ctx, json, params) => {
  const def = schema._zod.def as schemas.$ZodReadonlyDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
  json.readOnly = true;
};

export const promiseProcessor: Processor<schemas.$ZodPromise> = (schema, ctx, _json, params) => {
  const def = schema._zod.def as schemas.$ZodPromiseDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
};

export const optionalProcessor: Processor<schemas.$ZodOptional> = (schema, ctx, _json, params) => {
  const def = schema._zod.def as schemas.$ZodOptionalDef;
  process(def.innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = def.innerType;
};

export const lazyProcessor: Processor<schemas.$ZodLazy> = (schema, ctx, _json, params) => {
  const innerType = (schema as schemas.$ZodLazy)._zod.innerType;
  process(innerType, ctx as any, params);
  const seen = ctx.seen.get(schema)!;
  seen.ref = innerType;
};

// ==================== ALL PROCESSORS ====================

export const allProcessors: Record<string, Processor<any>> = {
  string: stringProcessor,
  number: numberProcessor,
  boolean: booleanProcessor,
  bigint: bigintProcessor,
  symbol: symbolProcessor,
  null: nullProcessor,
  undefined: undefinedProcessor,
  void: voidProcessor,
  never: neverProcessor,
  any: anyProcessor,
  unknown: unknownProcessor,
  date: dateProcessor,
  enum: enumProcessor,
  literal: literalProcessor,
  nan: nanProcessor,
  template_literal: templateLiteralProcessor,
  file: fileProcessor,
  success: successProcessor,
  custom: customProcessor,
  function: functionProcessor,
  transform: transformProcessor,
  map: mapProcessor,
  set: setProcessor,
  array: arrayProcessor,
  object: objectProcessor,
  union: unionProcessor,
  intersection: intersectionProcessor,
  tuple: tupleProcessor,
  record: recordProcessor,
  nullable: nullableProcessor,
  nonoptional: nonoptionalProcessor,
  default: defaultProcessor,
  prefault: prefaultProcessor,
  catch: catchProcessor,
  pipe: pipeProcessor,
  readonly: readonlyProcessor,
  promise: promiseProcessor,
  optional: optionalProcessor,
  lazy: lazyProcessor,
};

// ==================== TOP-LEVEL toJSONSchema ====================

export function toJSONSchema<T extends schemas.$ZodType>(
  schema: T,
  params?: ToJSONSchemaParams
): ZodStandardJSONSchemaPayload<T>;
export function toJSONSchema(
  registry: $ZodRegistry<{ id?: string | undefined }>,
  params?: RegistryToJSONSchemaParams
): { schemas: Record<string, ZodStandardJSONSchemaPayload<schemas.$ZodType>> };
export function toJSONSchema(
  input: schemas.$ZodType | $ZodRegistry<{ id?: string | undefined }>,
  params?: ToJSONSchemaParams | RegistryToJSONSchemaParams
): any {
  if ("_idmap" in input) {
    // Registry case
    const registry = input as $ZodRegistry<{ id?: string | undefined }>;
    const ctx = initializeContext({ ...params, processors: allProcessors });
    const defs: any = {};

    // First pass: process all schemas to build the seen map
    for (const entry of registry._idmap.entries()) {
      const [_, schema] = entry;
      process(schema, ctx as any);
    }

    const schemas: Record<string, JSONSchema.BaseSchema> = {};
    const external = {
      registry,
      uri: (params as RegistryToJSONSchemaParams)?.uri,
      defs,
    };

    // Update the context with external configuration
    ctx.external = external;

    // Second pass: emit each schema
    for (const entry of registry._idmap.entries()) {
      const [key, schema] = entry;
      extractDefs(ctx as any, schema);
      assignProp(schemas, key, finalize(ctx as any, schema));
    }

    if (Object.keys(defs).length > 0) {
      const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
      schemas.__shared = {
        [defsSegment]: defs,
      };
    }

    return { schemas };
  }

  // Single schema case
  const ctx = initializeContext({ ...params, processors: allProcessors });
  process(input, ctx as any);
  extractDefs(ctx as any, input);
  return finalize(ctx as any, input);
}
