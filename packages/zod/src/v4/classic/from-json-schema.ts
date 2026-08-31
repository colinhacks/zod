import type * as JSONSchema from "../core/json-schema.js";
import { type $ZodRegistry, globalRegistry } from "../core/registries.js";
import { assignProp, isPlainObject } from "../core/util.js";
import * as _checks from "./checks.js";
import * as _iso from "./iso.js";
import * as _schemas from "./schemas.js";
import type { ZodNumber, ZodString, ZodType } from "./schemas.js";

// Local z object to avoid circular dependency with ../index.js
const z = {
  ..._schemas,
  ..._checks,
  iso: _iso,
};

type JSONSchemaVersion = "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0";

interface FromJSONSchemaParams {
  defaultTarget?: JSONSchemaVersion;
  registry?: $ZodRegistry<any>;
}

interface ConversionContext {
  version: JSONSchemaVersion;
  defs: Record<string, JSONSchema.JSONSchema>;
  refs: Map<string, ZodType>;
  processing: Set<string>;
  rootSchema: JSONSchema.JSONSchema;
  registry: $ZodRegistry<any>;
}

// Keys that are recognized and handled by the conversion logic
const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
  // Schema identification
  "$schema",
  "$ref",
  "$defs",
  "definitions",
  // Core schema keywords
  "$id",
  "id",
  "$comment",
  "$anchor",
  "$vocabulary",
  "$dynamicRef",
  "$dynamicAnchor",
  // Type
  "type",
  "enum",
  "const",
  // Composition
  "anyOf",
  "oneOf",
  "allOf",
  "not",
  // Object
  "properties",
  "required",
  "additionalProperties",
  "patternProperties",
  "propertyNames",
  "minProperties",
  "maxProperties",
  // Array
  "items",
  "prefixItems",
  "additionalItems",
  "minItems",
  "maxItems",
  "uniqueItems",
  "contains",
  "minContains",
  "maxContains",
  // String
  "minLength",
  "maxLength",
  "pattern",
  "format",
  // Number
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  // Already handled metadata
  "description",
  "default",
  // Content
  "contentEncoding",
  "contentMediaType",
  "contentSchema",
  // Unsupported (error-throwing)
  "unevaluatedItems",
  "unevaluatedProperties",
  "if",
  "then",
  "else",
  "dependentSchemas",
  "dependentRequired",
  // OpenAPI
  "nullable",
  "readOnly",
]);

function detectVersion(schema: JSONSchema.JSONSchema, defaultTarget?: JSONSchemaVersion): JSONSchemaVersion {
  const $schema = schema.$schema;

  if ($schema === "https://json-schema.org/draft/2020-12/schema") {
    return "draft-2020-12";
  }
  if ($schema === "http://json-schema.org/draft-07/schema#") {
    return "draft-7";
  }
  if ($schema === "http://json-schema.org/draft-04/schema#") {
    return "draft-4";
  }

  // Use defaultTarget if provided, otherwise default to draft-2020-12
  return defaultTarget ?? "draft-2020-12";
}

// Positional schemas constrain the elements that are present; only minItems makes them required.
function applyMinItems(items: ZodType[], minItems: number): ZodType[] {
  return items.map((item, index) => (index < minItems ? item : item.optional()));
}

// Inverse of the encoding applied to $ref pointer segments in to-json-schema.ts. Per RFC 6901 the `~1` replacement must run before `~0`.
function decodeJSONPointerSegment(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

function resolveRef(ref: string, ctx: ConversionContext): JSONSchema.JSONSchema {
  if (!ref.startsWith("#")) {
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  }

  const path = ref.slice(1).split("/").filter(Boolean);

  // Handle root reference "#"
  if (path.length === 0) {
    return ctx.rootSchema;
  }

  const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";

  if (path[0] === defsKey) {
    const key = path[1] === undefined ? undefined : decodeJSONPointerSegment(path[1]);
    if (!key || !ctx.defs[key]) {
      throw new Error(`Reference not found: ${ref}`);
    }
    return ctx.defs[key]!;
  }

  throw new Error(`Reference not found: ${ref}`);
}

/**
 * Enforces the keywords that constrain an object's own keys — `propertyNames`,
 * `minProperties`, `maxProperties` — before `objectSchema` runs. The guard has
 * to see the raw input: an object parse drops `__proto__` and can add keys from
 * a property `default`, so its output is not the set of names the instance
 * actually carried.
 */
function checkObjectGuards(
  objectSchema: ZodType,
  guards: { keySchema?: ZodType | undefined; minProperties?: number | undefined; maxProperties?: number | undefined }
): ZodType {
  // An identity transform, not z.any(), so `toJSONSchema` reports the object on both the input and the output side of the pipe.
  const guard = z
    .transform((value: unknown) => value)
    .check((payload) => {
      const value = payload.value;
      if (typeof value !== "object" || value === null || Array.isArray(value)) return;
      const keys = Object.getOwnPropertyNames(value);
      if (guards.minProperties !== undefined && keys.length < guards.minProperties) {
        payload.issues.push({
          origin: "object",
          code: "too_small",
          minimum: guards.minProperties,
          inclusive: true,
          message: `Too small: expected object to have >=${guards.minProperties} properties`,
          input: value,
          inst: objectSchema,
          continue: true,
        });
      }
      if (guards.maxProperties !== undefined && keys.length > guards.maxProperties) {
        payload.issues.push({
          origin: "object",
          code: "too_big",
          maximum: guards.maxProperties,
          inclusive: true,
          message: `Too big: expected object to have <=${guards.maxProperties} properties`,
          input: value,
          inst: objectSchema,
          continue: true,
        });
      }
      if (guards.keySchema) {
        for (const key of keys) {
          const result = guards.keySchema.safeParse(key);
          if (result.success) continue;
          payload.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: result.error.issues,
            input: key,
            path: [key],
            continue: true,
          });
        }
      }
    });
  return guard.pipe(objectSchema);
}

/**
 * An injective string for JSON data: two values share a key exactly when `uniqueItems` calls them
 * equal, so duplicate detection is a Map lookup rather than a pairwise walk. Strings and keys are
 * length-prefixed so no value can spell another one. `null` means "never equal to anything" — a
 * cycle or a NaN, neither of which JSON can express.
 */
function canonicalKey(value: unknown, seen: Set<object>): string | null {
  if (value === null) return "z";
  const type = typeof value;
  if (type !== "object") {
    if (type === "number" && Number.isNaN(value)) return null;
    const raw = String(value);
    return `${type[0]}${raw.length}:${raw}`;
  }
  if (seen.has(value as object)) return null;
  seen.add(value as object);
  try {
    if (Array.isArray(value)) {
      const parts: string[] = [];
      for (const item of value) {
        const key = canonicalKey(item, seen);
        if (key === null) return null;
        parts.push(key);
      }
      return `a${parts.length}:[${parts.join(",")}]`;
    }
    const keys = Object.keys(value as object).sort();
    const parts: string[] = [];
    for (const k of keys) {
      const key = canonicalKey((value as any)[k], seen);
      if (key === null) return null;
      parts.push(`${k.length}:${k}=${key}`);
    }
    return `o${parts.length}:{${parts.join(",")}}`;
  } finally {
    seen.delete(value as object);
  }
}

// keywords whose value is a schema or an array of them
const SCHEMA_KEYWORDS = /*@__PURE__*/ new Set([
  "items",
  "prefixItems",
  "additionalItems",
  "additionalProperties",
  "contains",
  "propertyNames",
  "not",
  "if",
  "then",
  "else",
  "allOf",
  "anyOf",
  "oneOf",
  "unevaluatedItems",
  "unevaluatedProperties",
  "contentSchema",
]);

// keywords whose value maps names to schemas. draft-7 `dependencies` also allows an array of property names, which holds no schema to walk
const SCHEMA_MAP_KEYWORDS = /*@__PURE__*/ new Set([
  "properties",
  "patternProperties",
  "dependentSchemas",
  "dependencies",
  "$defs",
  "definitions",
]);

/**
 * True when a subschema holds a `$ref` anywhere a schema can appear. Only those positions are
 * walked: `$ref` under `default` or an `x-` annotation is instance data with an ordinary key, and
 * reading it as a reference would drop a constraint that resolves perfectly well.
 */
function containsRef(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return value.some(containsRef);
  if (typeof (value as any).$ref === "string") return true;
  return Object.entries(value).some(([key, sub]) => {
    if (SCHEMA_KEYWORDS.has(key)) return containsRef(sub);
    if (!SCHEMA_MAP_KEYWORDS.has(key) || typeof sub !== "object" || sub === null) return false;
    return Object.values(sub).some(containsRef);
  });
}

function plural(n: number): string {
  return n === 1 ? "element" : "elements";
}

/**
 * Enforces `uniqueItems` and the `contains` family before `arraySchema` runs, for the same reason
 * `checkObjectGuards` runs pre-pipe: an item parse can apply a nested `default`, so the parsed
 * array is not the instance the keywords are defined over. A guard issue aborts the pipe, so
 * `minItems`/`maxItems` are not also reported on the same parse — instance correctness is worth
 * more than co-reporting two issues.
 */
function checkArrayGuards(
  arraySchema: ZodType,
  guards: {
    uniqueItems?: boolean | undefined;
    containsSchema?: ZodType | undefined;
    minContains?: number | undefined;
    maxContains?: number | undefined;
  }
): ZodType {
  // An identity transform, not z.any(), so `toJSONSchema` reports the array on both the input and the output side of the pipe.
  const guard = z
    .transform((value: unknown) => value)
    .check((payload) => {
      const items = payload.value;
      if (!Array.isArray(items)) return;
      if (guards.uniqueItems === true) {
        const firstSeen = new Map<string, number>();
        for (let i = 0; i < items.length; i++) {
          const key = canonicalKey(items[i], new Set());
          if (key === null) continue;
          const first = firstSeen.get(key);
          if (first === undefined) {
            firstSeen.set(key, i);
            continue;
          }
          payload.issues.push({
            code: "custom",
            message: `Array items must be unique: element at index ${i} duplicates the one at index ${first}`,
            input: items,
            path: [i],
            continue: true,
          });
        }
      }
      if (guards.containsSchema) {
        const minContains = guards.minContains ?? 1;
        // one past the ceiling already proves the failure, and nothing above it changes the verdict
        const ceiling = guards.maxContains !== undefined ? guards.maxContains + 1 : Number.POSITIVE_INFINITY;
        let matches = 0;
        for (const item of items) {
          if (guards.containsSchema.safeParse(item).success && ++matches >= ceiling) break;
        }
        if (matches < minContains) {
          // the scan ran to the end, so this count is exact
          payload.issues.push({
            code: "custom",
            message: `Array must contain at least ${minContains} matching ${plural(minContains)}; found ${matches}`,
            input: items,
            continue: true,
          });
        }
        if (guards.maxContains !== undefined && matches > guards.maxContains) {
          payload.issues.push({
            code: "custom",
            message: `Array must contain at most ${guards.maxContains} matching ${plural(guards.maxContains)}`,
            input: items,
            continue: true,
          });
        }
      }
    });
  return guard.pipe(arraySchema);
}

function getTupleRest(restSchema: JSONSchema._JSONSchema | undefined, ctx: ConversionContext): ZodType | undefined {
  if (restSchema === false) {
    return undefined;
  }
  if (restSchema === undefined || restSchema === true) {
    return z.any();
  }
  return convertSchema(restSchema, ctx);
}

// the RFC 3339 full-time keyword, narrower than `z.iso.time()`; local because sharing it via `timeSource` pins that builder into every bundle (+139 B gzipped on a mini `z.boolean()`)
const fullTime = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

function convertBaseSchema(schema: JSONSchema.JSONSchema, ctx: ConversionContext): ZodType {
  // Handle unsupported features
  if (schema.not !== undefined) {
    // Special case: { not: {} } represents never
    if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
      return z.never();
    }
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (schema.unevaluatedItems !== undefined) {
    throw new Error("unevaluatedItems is not supported");
  }
  if (schema.unevaluatedProperties !== undefined) {
    throw new Error("unevaluatedProperties is not supported");
  }
  if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
    throw new Error("Conditional schemas (if/then/else) are not supported");
  }
  if (schema.dependentSchemas !== undefined || schema.dependentRequired !== undefined) {
    throw new Error("dependentSchemas and dependentRequired are not supported");
  }

  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref;
    if (ctx.refs.has(refPath)) {
      return ctx.refs.get(refPath)!;
    }

    if (ctx.processing.has(refPath)) {
      // Circular reference - use lazy
      return z.lazy(() => {
        if (!ctx.refs.has(refPath)) {
          throw new Error(`Circular reference not resolved: ${refPath}`);
        }
        return ctx.refs.get(refPath)!;
      });
    }

    ctx.processing.add(refPath);
    const resolved = resolveRef(refPath, ctx);
    const zodSchema = convertSchema(resolved, ctx);
    ctx.refs.set(refPath, zodSchema);
    ctx.processing.delete(refPath);
    return zodSchema;
  }

  // Handle enum
  if (schema.enum !== undefined) {
    const enumValues = schema.enum;

    // Special case: OpenAPI 3.0 null representation { type: "string", nullable: true, enum: [null] }
    if (
      ctx.version === "openapi-3.0" &&
      schema.nullable === true &&
      enumValues.length === 1 &&
      enumValues[0] === null
    ) {
      return z.null();
    }

    if (enumValues.length === 0) {
      return z.never();
    }
    if (enumValues.length === 1) {
      return z.literal(enumValues[0]!);
    }
    // Check if all values are strings
    if (enumValues.every((v) => typeof v === "string")) {
      return z.enum(enumValues as [string, ...string[]]);
    }
    // Mixed types - use union of literals
    const literalSchemas = enumValues.map((v) => z.literal(v));
    if (literalSchemas.length < 2) {
      return literalSchemas[0]!;
    }
    return z.union([literalSchemas[0]!, literalSchemas[1]!, ...literalSchemas.slice(2)] as [
      ZodType,
      ZodType,
      ...ZodType[],
    ]);
  }

  // Handle const
  if (schema.const !== undefined) {
    return z.literal(schema.const);
  }

  // Handle type
  const type = schema.type;

  if (Array.isArray(type)) {
    // Expand type array into anyOf union
    const typeSchemas = type.map((t) => {
      const typeSchema: JSONSchema.JSONSchema = { ...schema, type: t };
      return convertBaseSchema(typeSchema, ctx);
    });
    if (typeSchemas.length === 0) {
      return z.never();
    }
    if (typeSchemas.length === 1) {
      return typeSchemas[0]!;
    }
    return z.union(typeSchemas as [ZodType, ZodType, ...ZodType[]]);
  }

  if (!type) {
    // No type specified - empty schema (any)
    return z.any();
  }

  let zodSchema: ZodType;

  switch (type) {
    case "string": {
      let stringSchema: ZodString = z.string();

      // Apply format using .check() with Zod format functions
      if (schema.format) {
        const format = schema.format;
        // Map common formats to Zod check functions
        if (format === "email") {
          stringSchema = stringSchema.check(z.email());
        } else if (format === "uri" || format === "uri-reference") {
          stringSchema = stringSchema.check(z.url());
        } else if (format === "uuid" || format === "guid") {
          stringSchema = stringSchema.check(z.uuid());
        } else if (format === "date-time") {
          stringSchema = stringSchema.check(z.iso.datetime({ offset: true }));
        } else if (format === "date") {
          stringSchema = stringSchema.check(z.iso.date());
        } else if (format === "time") {
          stringSchema = stringSchema.check(z.regex(fullTime));
        } else if (format === "duration") {
          stringSchema = stringSchema.check(z.iso.duration());
        } else if (format === "hostname") {
          stringSchema = stringSchema.check(z.hostname());
        } else if (format === "ipv4") {
          stringSchema = stringSchema.check(z.ipv4());
        } else if (format === "ipv6") {
          stringSchema = stringSchema.check(z.ipv6());
        } else if (format === "mac") {
          stringSchema = stringSchema.check(z.mac());
        } else if (format === "cidr") {
          stringSchema = stringSchema.check(z.cidrv4());
        } else if (format === "cidr-v6") {
          stringSchema = stringSchema.check(z.cidrv6());
        } else if (format === "base64") {
          stringSchema = stringSchema.check(z.base64());
        } else if (format === "base64url") {
          stringSchema = stringSchema.check(z.base64url());
        } else if (format === "e164") {
          stringSchema = stringSchema.check(z.e164());
        } else if (format === "credit_card") {
          stringSchema = stringSchema.check(z.creditCard());
        } else if (format === "jwt") {
          stringSchema = stringSchema.check(z.jwt());
        } else if (format === "emoji") {
          stringSchema = stringSchema.check(z.emoji());
        } else if (format === "nanoid") {
          stringSchema = stringSchema.check(z.nanoid());
        } else if (format === "cuid") {
          stringSchema = stringSchema.check(z.cuid());
        } else if (format === "cuid2") {
          stringSchema = stringSchema.check(z.cuid2());
        } else if (format === "ulid") {
          stringSchema = stringSchema.check(z.ulid());
        } else if (format === "xid") {
          stringSchema = stringSchema.check(z.xid());
        } else if (format === "ksuid") {
          stringSchema = stringSchema.check(z.ksuid());
        }
        // Note: json-string format is not currently supported by Zod
        // Custom formats are ignored - keep as plain string
      }

      // Apply constraints
      if (typeof schema.minLength === "number") {
        stringSchema = stringSchema.min(schema.minLength);
      }
      if (typeof schema.maxLength === "number") {
        stringSchema = stringSchema.max(schema.maxLength);
      }
      if (schema.pattern) {
        // JSON Schema patterns are not implicitly anchored (match anywhere in string)
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }

      zodSchema = stringSchema;
      break;
    }

    case "number":
    case "integer": {
      let numberSchema: ZodNumber = type === "integer" ? z.number().int() : z.number();

      // Apply constraints

      // In draft-04, `exclusiveMinimum: true` makes the sibling `minimum` exclusive rather than an independent bound, so the inclusive `.min()` is skipped; emitting it too would be dominated by the exclusive check and report a second, weaker issue.
      if (typeof schema.minimum === "number" && schema.exclusiveMinimum !== true) {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (typeof schema.maximum === "number" && schema.exclusiveMaximum !== true) {
        numberSchema = numberSchema.max(schema.maximum);
      }
      if (typeof schema.exclusiveMinimum === "number") {
        numberSchema = numberSchema.gt(schema.exclusiveMinimum);
      } else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
        numberSchema = numberSchema.gt(schema.minimum);
      }
      if (typeof schema.exclusiveMaximum === "number") {
        numberSchema = numberSchema.lt(schema.exclusiveMaximum);
      } else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
        numberSchema = numberSchema.lt(schema.maximum);
      }
      if (typeof schema.multipleOf === "number") {
        numberSchema = numberSchema.multipleOf(schema.multipleOf);
      }

      zodSchema = numberSchema;
      break;
    }

    case "boolean": {
      zodSchema = z.boolean();
      break;
    }

    case "null": {
      zodSchema = z.null();
      break;
    }

    case "object": {
      const shape: Record<string, ZodType> = {};
      const properties = schema.properties || {};
      const requiredSet = new Set(schema.required || []);

      const additionalSchema =
        typeof schema.additionalProperties === "object"
          ? convertSchema(schema.additionalProperties as JSONSchema.JSONSchema, ctx)
          : undefined;

      // Convert properties - mark optional ones
      for (const [key, propSchema] of Object.entries(properties)) {
        const propZodSchema = convertSchema(propSchema as JSONSchema.JSONSchema, ctx);
        // If not in required array, make it optional. assignProp so a __proto__ key becomes an own property instead of hitting the inherited setter
        assignProp(shape, key, requiredSet.has(key) ? propZodSchema : propZodSchema.optional());
      }

      // Handle patternProperties
      if (schema.patternProperties) {
        // patternProperties: keys matching pattern must satisfy corresponding schema. Use loose records so non-matching keys pass through
        const patternProps = schema.patternProperties;
        const patternKeys = Object.keys(patternProps);
        const looseRecords: ZodType[] = [];

        for (const pattern of patternKeys) {
          const patternValue = convertSchema(patternProps[pattern] as JSONSchema.JSONSchema, ctx);
          const keySchema = z.string().regex(new RegExp(pattern));
          looseRecords.push(z.looseRecord(keySchema, patternValue));
        }

        // Build intersection: object schema + all pattern property records
        const schemasToIntersect: ZodType[] = [];
        if (Object.keys(shape).length > 0) {
          // Use passthrough so patternProperties can validate additional keys
          schemasToIntersect.push(z.object(shape).passthrough());
        }
        schemasToIntersect.push(...looseRecords);

        if (schemasToIntersect.length === 0) {
          zodSchema = z.object({}).passthrough();
        } else if (schemasToIntersect.length === 1) {
          zodSchema = schemasToIntersect[0]!;
        } else {
          // Chain intersections: (A & B) & C & D ...
          let result = z.intersection(schemasToIntersect[0]!, schemasToIntersect[1]!);
          for (let i = 2; i < schemasToIntersect.length; i++) {
            result = z.intersection(result, schemasToIntersect[i]!);
          }
          zodSchema = result;
        }

        // When additionalProperties is false, reject keys that are neither defined in properties nor matched by any patternProperty.
        if (schema.additionalProperties === false) {
          const propertyKeys = Object.keys(shape);
          const patterns = patternKeys.map((p) => new RegExp(p));
          const basePatternSchema = zodSchema;
          zodSchema = zodSchema.check((payload) => {
            if (!isPlainObject(payload.value)) return;
            const unrecognized: string[] = [];
            for (const key of Object.keys(payload.value)) {
              if (propertyKeys.includes(key)) continue;
              if (patterns.some((regex) => regex.test(key))) continue;
              unrecognized.push(key);
            }
            if (unrecognized.length) {
              payload.issues.push({
                code: "unrecognized_keys",
                keys: unrecognized,
                input: payload.value,
                inst: basePatternSchema,
              });
            }
          });
        }
      } else {
        // Handle additionalProperties. In JSON Schema, additionalProperties defaults to true (allow any extra properties). In Zod, objects strip unknown keys by default, so we need to handle this explicitly
        const objectSchema = z.object(shape);
        if (schema.additionalProperties === false) {
          // Strict mode - no extra properties allowed
          zodSchema = objectSchema.strict();
        } else if (additionalSchema) {
          // Extra properties must match the specified schema
          zodSchema = objectSchema.catchall(additionalSchema);
        } else {
          // additionalProperties is true or undefined - allow any extra properties (passthrough)
          zodSchema = objectSchema.passthrough();
        }
      }

      // propertyNames constrains key *names* only, and says nothing about which keys are required or how their values validate. Layering it on top of the result keeps properties/patternProperties/additionalProperties composing underneath. `true` allows every name, so it needs no guard.
      const hasKeyGuard = schema.propertyNames !== undefined && schema.propertyNames !== true;
      const minProperties = typeof schema.minProperties === "number" ? schema.minProperties : undefined;
      const maxProperties = typeof schema.maxProperties === "number" ? schema.maxProperties : undefined;
      if (hasKeyGuard || minProperties !== undefined || maxProperties !== undefined) {
        let keySchema: ZodType | undefined;
        if (hasKeyGuard) {
          // Keys are always strings, so a propertyNames subschema that omits `type` still constrains them — without this it would convert to z.any().
          const keyJSONSchema =
            typeof schema.propertyNames === "object" && schema.propertyNames.type === undefined
              ? { type: "string", ...schema.propertyNames }
              : schema.propertyNames;
          keySchema = convertSchema(keyJSONSchema as JSONSchema.JSONSchema, ctx);
        }
        zodSchema = checkObjectGuards(zodSchema, { keySchema, minProperties, maxProperties });
      }
      break;
    }

    case "array": {
      // Check if this is a tuple (prefixItems or items as array)
      const prefixItems = schema.prefixItems;
      const items = schema.items;

      if (prefixItems && Array.isArray(prefixItems)) {
        // Tuple with prefixItems (draft-2020-12)
        const minItems = typeof schema.minItems === "number" ? schema.minItems : 0;
        const tupleItems = prefixItems.map((item) => convertSchema(item as JSONSchema.JSONSchema, ctx));
        const positionalItems = applyMinItems(tupleItems, minItems);
        const rest = !Array.isArray(items) ? getTupleRest(items, ctx) : undefined;
        const tupleSchema = z.tuple(positionalItems as [ZodType, ...ZodType[]]);
        zodSchema = rest ? tupleSchema.rest(rest) : tupleSchema;
        // Apply minItems/maxItems constraints to tuples
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (Array.isArray(items)) {
        // Tuple with items array (draft-7)
        const minItems = typeof schema.minItems === "number" ? schema.minItems : 0;
        const tupleItems = items.map((item) => convertSchema(item as JSONSchema.JSONSchema, ctx));
        const positionalItems = applyMinItems(tupleItems, minItems);
        const rest = getTupleRest(schema.additionalItems, ctx);
        const tupleSchema = z.tuple(positionalItems as [ZodType, ...ZodType[]]);
        zodSchema = rest ? tupleSchema.rest(rest) : tupleSchema;
        // Apply minItems/maxItems constraints to tuples
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (items !== undefined) {
        // Regular array
        const element = convertSchema(items as JSONSchema.JSONSchema, ctx);
        let arraySchema = z.array(element);

        // Apply constraints
        if (typeof schema.minItems === "number") {
          arraySchema = arraySchema.min(schema.minItems);
        }
        if (typeof schema.maxItems === "number") {
          arraySchema = arraySchema.max(schema.maxItems);
        }

        zodSchema = arraySchema;
      } else {
        // No items specified - array of any
        zodSchema = z.array(z.any());
      }

      // minContains/maxContains only constrain anything when `contains` itself is present
      if (schema.uniqueItems === true || schema.contains !== undefined) {
        zodSchema = checkArrayGuards(zodSchema, {
          uniqueItems: schema.uniqueItems === true,
          containsSchema:
            schema.contains !== undefined ? convertSchema(schema.contains as JSONSchema.JSONSchema, ctx) : undefined,
          minContains: typeof schema.minContains === "number" ? schema.minContains : undefined,
          maxContains: typeof schema.maxContains === "number" ? schema.maxContains : undefined,
        });
      }

      break;
    }

    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  return zodSchema;
}

function convertSchema(schema: JSONSchema.JSONSchema | boolean, ctx: ConversionContext): ZodType {
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }

  // Convert base schema first (ignoring composition keywords)
  let baseSchema = convertBaseSchema(schema, ctx);
  const hasExplicitType = schema.type || schema.enum !== undefined || schema.const !== undefined;

  // Process composition keywords LAST (they can appear together)

  // Handle anyOf - wrap base schema with union
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const options = schema.anyOf.map((s) => convertSchema(s, ctx));
    const anyOfUnion = z.union(options as [ZodType, ZodType, ...ZodType[]]);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
  }

  // Handle oneOf - exclusive union (exactly one must match)
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const options = schema.oneOf.map((s) => convertSchema(s, ctx));
    const oneOfUnion = z.xor(options as [ZodType, ZodType, ...ZodType[]]);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
  }

  // Handle allOf - wrap base schema with intersection
  if (schema.allOf && Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 0) {
      baseSchema = hasExplicitType ? baseSchema : z.any();
    } else {
      let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0]!, ctx);
      const startIdx = hasExplicitType ? 0 : 1;
      for (let i = startIdx; i < schema.allOf.length; i++) {
        result = z.intersection(result, convertSchema(schema.allOf[i]!, ctx));
      }
      baseSchema = result;
    }
  }

  // Handle nullable (OpenAPI 3.0)
  if (schema.nullable === true && ctx.version === "openapi-3.0") {
    baseSchema = z.nullable(baseSchema);
  }

  // Handle readOnly
  if (schema.readOnly === true) {
    baseSchema = z.readonly(baseSchema);
  }

  // Apply `default` so it wraps the fully-composed schema. This ensures `parse(undefined) -> default` works regardless of which branch of `convertBaseSchema` produced the inner schema (enum/const/not/typed/etc.).
  if (schema.default !== undefined) {
    baseSchema = baseSchema.default(schema.default);
  }

  // Collect non-description annotation metadata into the user-supplied registry. Description is handled separately below via `.describe()` to preserve the contract that `schema.description` reads from globalRegistry.
  const extraMeta: Record<string, unknown> = {};

  const coreMetadataKeys = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (const key of coreMetadataKeys) {
    if (key in schema) {
      extraMeta[key] = schema[key];
    }
  }

  const contentMetadataKeys = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (const key of contentMetadataKeys) {
    if (key in schema) {
      extraMeta[key] = schema[key];
    }
  }

  // `propertyNames` and `contains` are enforced by a guard, which `toJSONSchema` cannot infer, so the original keyword is carried as metadata to keep the round-trip lossless. Only where it was actually applied: on any other type it is inert, and on a `$ref` the metadata would land on the target every reference shares. A carried subschema is copied verbatim while the root `$defs` stay behind, so one holding a `$ref` is dropped rather than emitted as a dangling reference.
  if (schema.type === "object" && schema.$ref === undefined) {
    if (schema.propertyNames !== undefined && !containsRef(schema.propertyNames)) {
      extraMeta.propertyNames = schema.propertyNames;
    }
    for (const key of ["minProperties", "maxProperties"] as const) {
      if (schema[key] !== undefined) extraMeta[key] = schema[key];
    }
  }
  if (schema.type === "array" && schema.$ref === undefined) {
    if (schema.contains !== undefined && !containsRef(schema.contains)) {
      extraMeta.contains = schema.contains;
    }
    for (const key of ["uniqueItems", "minContains", "maxContains"] as const) {
      if (schema[key] !== undefined) extraMeta[key] = schema[key];
    }
  }

  for (const key of Object.keys(schema)) {
    if (!RECOGNIZED_KEYS.has(key)) {
      assignProp(extraMeta, key, schema[key]);
    }
  }

  if (Object.keys(extraMeta).length > 0) {
    ctx.registry.add(baseSchema, extraMeta);
  }

  // Apply description last. `.describe()` clones the schema and sets `_zod.parent` on the clone, so registry lookups on the returned reference still resolve `extraMeta` via parent inheritance.
  if (schema.description) {
    baseSchema = baseSchema.describe(schema.description);
  }

  return baseSchema;
}

/**
 * Converts a JSON Schema to a Zod schema. This function should be considered semi-experimental. It's behavior is liable to change. */
export function fromJSONSchema(schema: JSONSchema.JSONSchema | boolean, params?: FromJSONSchemaParams): ZodType {
  // Handle boolean schemas
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }

  // Normalize input via a JSON round-trip. This guarantees the converter walks a plain, finite, JSON-valid object graph: cyclic inputs fail here, getter/Proxy-based properties are materialized into static values, and class instances collapse to plain objects.
  let normalized: JSONSchema.JSONSchema;
  try {
    normalized = JSON.parse(JSON.stringify(schema));
  } catch {
    throw new Error("fromJSONSchema input is not valid JSON (possibly cyclic); use $defs/$ref for recursive schemas");
  }

  const version = detectVersion(normalized, params?.defaultTarget);
  const defs = (normalized.$defs || normalized.definitions || {}) as Record<string, JSONSchema.JSONSchema>;

  const ctx: ConversionContext = {
    version,
    defs,
    refs: new Map(),
    processing: new Set(),
    rootSchema: normalized,
    registry: params?.registry ?? globalRegistry,
  };

  return convertSchema(normalized, ctx);
}
