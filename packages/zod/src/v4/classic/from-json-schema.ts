import type * as JSONSchema from "../core/json-schema.js";
import { maxLength, minLength } from "./checks.js";
import * as iso from "./iso.js";
import type { ZodNumber, ZodString, ZodType } from "./schemas.js";
import {
  url,
  any,
  array,
  base64,
  base64url,
  boolean,
  cidrv4,
  cidrv6,
  cuid,
  cuid2,
  e164,
  email,
  emoji,
  enum as enum_,
  intersection,
  ipv4,
  ipv6,
  jwt,
  ksuid,
  lazy,
  literal,
  looseRecord,
  mac,
  nanoid,
  never,
  null as null_,
  nullable,
  number,
  object,
  readonly as readonly_,
  record,
  string,
  tuple,
  ulid,
  union,
  uuid,
  xid,
  xor,
} from "./schemas.js";

type JSONSchemaVersion = "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0";

interface FromJSONSchemaParams {
  defaultTarget?: JSONSchemaVersion;
}

interface ConversionContext {
  version: JSONSchemaVersion;
  defs: Record<string, JSONSchema.JSONSchema>;
  refs: Map<string, ZodType>;
  processing: Set<string>;
  rootSchema: JSONSchema.JSONSchema;
}

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
    const key = path[1];
    if (!key || !ctx.defs[key]) {
      throw new Error(`Reference not found: ${ref}`);
    }
    return ctx.defs[key]!;
  }

  throw new Error(`Reference not found: ${ref}`);
}

function convertBaseSchema(schema: JSONSchema.JSONSchema, ctx: ConversionContext): ZodType {
  // Handle unsupported features
  if (schema.not !== undefined) {
    // Special case: { not: {} } represents never
    if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
      return never();
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
      return lazy(() => {
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
      return null_();
    }

    if (enumValues.length === 0) {
      return never();
    }
    if (enumValues.length === 1) {
      return literal(enumValues[0]!);
    }
    // Check if all values are strings
    if (enumValues.every((v) => typeof v === "string")) {
      return enum_(enumValues as [string, ...string[]]);
    }
    // Mixed types - use union of literals
    const literalSchemas = enumValues.map((v) => literal(v));
    if (literalSchemas.length < 2) {
      return literalSchemas[0]!;
    }
    return union([literalSchemas[0]!, literalSchemas[1]!, ...literalSchemas.slice(2)] as [
      ZodType,
      ZodType,
      ...ZodType[],
    ]);
  }

  // Handle const
  if (schema.const !== undefined) {
    return literal(schema.const);
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
      return never();
    }
    if (typeSchemas.length === 1) {
      return typeSchemas[0]!;
    }
    return union(typeSchemas as [ZodType, ZodType, ...ZodType[]]);
  }

  if (!type) {
    // No type specified - empty schema (any)
    return any();
  }

  let zodSchema: ZodType;

  switch (type) {
    case "string": {
      let stringSchema: ZodString = string();

      // Apply format using .check() with Zod format functions
      if (schema.format) {
        const format = schema.format;
        // Map common formats to Zod check functions
        if (format === "email") {
          stringSchema = stringSchema.check(email());
        } else if (format === "uri" || format === "uri-reference") {
          stringSchema = stringSchema.check(url());
        } else if (format === "uuid" || format === "guid") {
          stringSchema = stringSchema.check(uuid());
        } else if (format === "date-time") {
          stringSchema = stringSchema.check(iso.datetime());
        } else if (format === "date") {
          stringSchema = stringSchema.check(iso.date());
        } else if (format === "time") {
          stringSchema = stringSchema.check(iso.time());
        } else if (format === "duration") {
          stringSchema = stringSchema.check(iso.duration());
        } else if (format === "ipv4") {
          stringSchema = stringSchema.check(ipv4());
        } else if (format === "ipv6") {
          stringSchema = stringSchema.check(ipv6());
        } else if (format === "mac") {
          stringSchema = stringSchema.check(mac());
        } else if (format === "cidr") {
          stringSchema = stringSchema.check(cidrv4());
        } else if (format === "cidr-v6") {
          stringSchema = stringSchema.check(cidrv6());
        } else if (format === "base64") {
          stringSchema = stringSchema.check(base64());
        } else if (format === "base64url") {
          stringSchema = stringSchema.check(base64url());
        } else if (format === "e164") {
          stringSchema = stringSchema.check(e164());
        } else if (format === "jwt") {
          stringSchema = stringSchema.check(jwt());
        } else if (format === "emoji") {
          stringSchema = stringSchema.check(emoji());
        } else if (format === "nanoid") {
          stringSchema = stringSchema.check(nanoid());
        } else if (format === "cuid") {
          stringSchema = stringSchema.check(cuid());
        } else if (format === "cuid2") {
          stringSchema = stringSchema.check(cuid2());
        } else if (format === "ulid") {
          stringSchema = stringSchema.check(ulid());
        } else if (format === "xid") {
          stringSchema = stringSchema.check(xid());
        } else if (format === "ksuid") {
          stringSchema = stringSchema.check(ksuid());
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
      let numberSchema: ZodNumber = type === "integer" ? number().int() : number();

      // Apply constraints
      if (typeof schema.minimum === "number") {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (typeof schema.maximum === "number") {
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
      zodSchema = boolean();
      break;
    }

    case "null": {
      zodSchema = null_();
      break;
    }

    case "object": {
      const shape: Record<string, ZodType> = {};
      const properties = schema.properties || {};
      const requiredSet = new Set(schema.required || []);

      // Convert properties - mark optional ones
      for (const [key, propSchema] of Object.entries(properties)) {
        const propZodSchema = convertSchema(propSchema as JSONSchema.JSONSchema, ctx);
        // If not in required array, make it optional
        shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
      }

      // Handle propertyNames
      if (schema.propertyNames) {
        const keySchema = convertSchema(schema.propertyNames, ctx) as ZodString;
        const valueSchema =
          schema.additionalProperties && typeof schema.additionalProperties === "object"
            ? convertSchema(schema.additionalProperties as JSONSchema.JSONSchema, ctx)
            : any();

        // Case A: No properties (pure record)
        if (Object.keys(shape).length === 0) {
          zodSchema = record(keySchema, valueSchema);
          break;
        }

        // Case B: With properties (intersection of object and looseRecord)
        const objectSchema = object(shape).passthrough();
        const recordSchema = looseRecord(keySchema, valueSchema);
        zodSchema = intersection(objectSchema, recordSchema);
        break;
      }

      // Handle patternProperties
      if (schema.patternProperties) {
        // patternProperties: keys matching pattern must satisfy corresponding schema
        // Use loose records so non-matching keys pass through
        const patternProps = schema.patternProperties;
        const patternKeys = Object.keys(patternProps);
        const looseRecords: ZodType[] = [];

        for (const pattern of patternKeys) {
          const patternValue = convertSchema(patternProps[pattern] as JSONSchema.JSONSchema, ctx);
          const keySchema = string().regex(new RegExp(pattern));
          looseRecords.push(looseRecord(keySchema, patternValue));
        }

        // Build intersection: object schema + all pattern property records
        const schemasToIntersect: ZodType[] = [];
        if (Object.keys(shape).length > 0) {
          // Use passthrough so patternProperties can validate additional keys
          schemasToIntersect.push(object(shape).passthrough());
        }
        schemasToIntersect.push(...looseRecords);

        if (schemasToIntersect.length === 0) {
          zodSchema = object({}).passthrough();
        } else if (schemasToIntersect.length === 1) {
          zodSchema = schemasToIntersect[0]!;
        } else {
          // Chain intersections: (A & B) & C & D ...
          let result = intersection(schemasToIntersect[0]!, schemasToIntersect[1]!);
          for (let i = 2; i < schemasToIntersect.length; i++) {
            result = intersection(result, schemasToIntersect[i]!);
          }
          zodSchema = result;
        }
        break;
      }

      // Handle additionalProperties
      // In JSON Schema, additionalProperties defaults to true (allow any extra properties)
      // In Zod, objects strip unknown keys by default, so we need to handle this explicitly
      const objectSchema = object(shape);
      if (schema.additionalProperties === false) {
        // Strict mode - no extra properties allowed
        zodSchema = objectSchema.strict();
      } else if (typeof schema.additionalProperties === "object") {
        // Extra properties must match the specified schema
        zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties as JSONSchema.JSONSchema, ctx));
      } else {
        // additionalProperties is true or undefined - allow any extra properties (passthrough)
        zodSchema = objectSchema.passthrough();
      }
      break;
    }

    case "array": {
      // TODO: uniqueItems is not supported
      // TODO: contains/minContains/maxContains are not supported
      // Check if this is a tuple (prefixItems or items as array)
      const prefixItems = schema.prefixItems;
      const items = schema.items;

      if (prefixItems && Array.isArray(prefixItems)) {
        // Tuple with prefixItems (draft-2020-12)
        const tupleItems = prefixItems.map((item) => convertSchema(item as JSONSchema.JSONSchema, ctx));
        const rest =
          items && typeof items === "object" && !Array.isArray(items)
            ? convertSchema(items as JSONSchema.JSONSchema, ctx)
            : undefined;
        if (rest) {
          zodSchema = tuple(tupleItems as [ZodType, ...ZodType[]]).rest(rest);
        } else {
          zodSchema = tuple(tupleItems as [ZodType, ...ZodType[]]);
        }
        // Apply minItems/maxItems constraints to tuples
        if (typeof schema.minItems === "number") {
          zodSchema = (zodSchema as any).check(minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = (zodSchema as any).check(maxLength(schema.maxItems));
        }
      } else if (Array.isArray(items)) {
        // Tuple with items array (draft-7)
        const tupleItems = items.map((item) => convertSchema(item as JSONSchema.JSONSchema, ctx));
        const rest =
          schema.additionalItems && typeof schema.additionalItems === "object"
            ? convertSchema(schema.additionalItems as JSONSchema.JSONSchema, ctx)
            : undefined; // additionalItems: false means no rest, handled by default tuple behavior
        if (rest) {
          zodSchema = tuple(tupleItems as [ZodType, ...ZodType[]]).rest(rest);
        } else {
          zodSchema = tuple(tupleItems as [ZodType, ...ZodType[]]);
        }
        // Apply minItems/maxItems constraints to tuples
        if (typeof schema.minItems === "number") {
          zodSchema = (zodSchema as any).check(minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = (zodSchema as any).check(maxLength(schema.maxItems));
        }
      } else if (items !== undefined) {
        // Regular array
        const element = convertSchema(items as JSONSchema.JSONSchema, ctx);
        let arraySchema = array(element);

        // Apply constraints
        if (typeof schema.minItems === "number") {
          arraySchema = (arraySchema as any).min(schema.minItems);
        }
        if (typeof schema.maxItems === "number") {
          arraySchema = (arraySchema as any).max(schema.maxItems);
        }

        zodSchema = arraySchema;
      } else {
        // No items specified - array of any
        zodSchema = array(any());
      }
      break;
    }

    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  // Apply metadata
  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description);
  }
  if (schema.default !== undefined) {
    zodSchema = (zodSchema as any).default(schema.default);
  }

  return zodSchema;
}

function convertSchema(schema: JSONSchema.JSONSchema | boolean, ctx: ConversionContext): ZodType {
  if (typeof schema === "boolean") {
    return schema ? any() : never();
  }

  // Convert base schema first (ignoring composition keywords)
  let baseSchema = convertBaseSchema(schema, ctx);
  const hasExplicitType = schema.type || schema.enum !== undefined || schema.const !== undefined;

  // Process composition keywords LAST (they can appear together)
  // Handle anyOf - wrap base schema with union
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const options = schema.anyOf.map((s) => convertSchema(s, ctx));
    const anyOfUnion = union(options as [ZodType, ZodType, ...ZodType[]]);
    baseSchema = hasExplicitType ? intersection(baseSchema, anyOfUnion) : anyOfUnion;
  }

  // Handle oneOf - exclusive union (exactly one must match)
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const options = schema.oneOf.map((s) => convertSchema(s, ctx));
    const oneOfUnion = xor(options as [ZodType, ZodType, ...ZodType[]]);
    baseSchema = hasExplicitType ? intersection(baseSchema, oneOfUnion) : oneOfUnion;
  }

  // Handle allOf - wrap base schema with intersection
  if (schema.allOf && Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 0) {
      baseSchema = hasExplicitType ? baseSchema : any();
    } else {
      let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0]!, ctx);
      const startIdx = hasExplicitType ? 0 : 1;
      for (let i = startIdx; i < schema.allOf.length; i++) {
        result = intersection(result, convertSchema(schema.allOf[i]!, ctx));
      }
      baseSchema = result;
    }
  }

  // Handle nullable (OpenAPI 3.0)
  if (schema.nullable === true && ctx.version === "openapi-3.0") {
    baseSchema = nullable(baseSchema);
  }

  // Handle readOnly
  if (schema.readOnly === true) {
    baseSchema = readonly_(baseSchema);
  }

  return baseSchema;
}

/**
 * Converts a JSON Schema to a Zod schema. This function should be considered semi-experimental. It's behavior is liable to change. */
export function fromJSONSchema(schema: JSONSchema.JSONSchema | boolean, params?: FromJSONSchemaParams): ZodType {
  // Handle boolean schemas
  if (typeof schema === "boolean") {
    return schema ? any() : never();
  }

  const version = detectVersion(schema, params?.defaultTarget);
  const defs = (schema.$defs || schema.definitions || {}) as Record<string, JSONSchema.JSONSchema>;

  const ctx: ConversionContext = {
    version,
    defs,
    refs: new Map(),
    processing: new Set(),
    rootSchema: schema,
  };

  return convertSchema(schema, ctx);
}
