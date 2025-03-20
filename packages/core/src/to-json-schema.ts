import type * as checks from "./checks.js";
import type * as JSONSchema from "./json-schema.js";
import { type $ZodJSONSchemaRegistry, globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

interface ToJSONSchemaParams {
  path: string[];
  registry: $ZodJSONSchemaRegistry;
  seen: Map<schemas.$ZodType, JSONSchema.BaseSchema>;
  defs: Map<schemas.$ZodType, { id: string; schema: JSONSchema.BaseSchema }>;
  shapeCache: Map<schemas.$ZodType, schemas.$ZodShape>;
  counter: number;
}

export function toJSONSchema(
  schema: schemas.$ZodType,
  params?: Pick<ToJSONSchemaParams, "registry">
): JSONSchema.Schema | JSONSchema.BaseSchema {
  const _params: ToJSONSchemaParams = {
    registry: params?.registry ?? globalRegistry,
    path: [],
    seen: new Map(),
    defs: new Map(),
    shapeCache: new Map(),
    counter: 0,
  };
  const json = _toJSONSchema(schema as schemas.$ZodTypes, _params);
  const final: JSONSchema.BaseSchema = {};

  if (_params.defs.size > 0) {
    const $defs: Record<string, JSONSchema.BaseSchema> = {};
    const seenIds = new Set<string>();
    for (const [schema, value] of _params.defs) {
      // check for duplicate ids
      if (seenIds.has(value.id)) throw new Error(`Duplicate $id: ${value.id}`);
      seenIds.add(value.id);

      // copy schema contents to $defs
      const _json = value.schema;

      $defs[value.id] = { ..._json };

      // clear out schema contents and replace with ref

      for (const key in _json) {
        delete (_json as any)[key];
        _json.$ref = `#/$defs/${value.id}`;
      }
    }

    final.$defs = $defs;
  }

  Object.assign(final, json);
  return final;
}

const formatMap: Partial<Record<checks.$ZodStringFormats, string>> = {
  email: "email",
  iso_datetime: "date-time",
  iso_date: "date",
  iso_time: "time",
  iso_duration: "duration",
  // hostname: "hostname",
  ipv4: "ipv4",
  ipv6: "ipv6",
  uuid: "uuid",
  guid: "uuid",
  url: "uri",
};

/**
 *
 * - as you recurse, add all schemas to seen
 * - if a schema has metadata, add it to $defs
 * - if a cycle is detected:
 *   - check if it's in defs. if so, return $ref
 *   - otherwise,
 *
 */

function _toJSONSchema(
  schema: schemas.$ZodType,
  _params: ToJSONSchemaParams,
  startingSchema: JSONSchema.BaseSchema = {}
): JSONSchema.Schema | JSONSchema.BaseSchema {
  // check for schema in defs
  const def = _params.defs.get(schema);
  if (def) {
    return { $ref: `#/$defs/${def.id}` };
  }

  // check for cycle
  const seen = _params.seen.get(schema);
  if (seen && (seen.type === "object" || seen.type === "array")) {
    // cycle occured. adding schema to def.
    const id = `schema_${_params.counter++}`;

    _params.defs.set(schema, { id, schema: seen });

    return { $ref: `#/$defs/${id}` };
  }

  // add to seen
  const json: JSONSchema.BaseSchema = startingSchema;
  _params.seen.set(schema, json);

  // populate schema object
  const params: ToJSONSchemaParams = { ..._params, seen: new Map([..._params.seen.entries(), [schema, json]]) };
  populateJSONSchema(schema as schemas.$ZodTypes, params);

  // check metadata
  const meta = _params.registry.get(schema);
  if (meta && typeof meta === "object") {
    // schema exists in registry. add to $defs.

    json.$id = meta.id ?? `schema_${_params.counter++}`;

    if (meta.description) json.description = meta.description;
    if (meta.title) json.title = meta.title;
    if (meta.examples) json.examples = meta.examples;
    if (meta.example) json.examples = [meta.example];

    // add to defs
    _params.defs.set(schema, { id: json.$id, schema: json });

    // return { $ref: `#/$defs/${json.$id}` };

    // empty out existing schema, replace with ref
    // const id = json.$id;
    // for (const key in json) {
    //   delete (json as any)[key];
    //   json.$ref = `#/$defs/${id}`;
    // }
  }

  return json;
}

function populateJSONSchema(schema: schemas.$ZodTypes, params: ToJSONSchemaParams): void {
  const _json = params.seen.get(schema);
  if (!_json) throw new Error("Schema not found in seen map");

  if (schema._zod.toJSONSchema) {
    Object.assign(_json, schema._zod.toJSONSchema());
    return;
  }

  const def = schema._zod.def;

  switch (def.type) {
    case "string": {
      const json: JSONSchema.StringSchema = _json as any;
      json.type = "string";
      const { minimum, maximum, format, pattern, contentEncoding } = schema._zod.computed as {
        minimum?: number;
        maximum?: number;
        format?: checks.$ZodStringFormats;
        pattern?: string;
        contentEncoding?: string;
      };
      if (minimum) json.minLength = minimum;
      if (maximum) json.maxLength = maximum;
      // custom pattern overrides format
      if (format && formatMap[format]) {
        json.format = formatMap[format];
      } else if (pattern) {
        json.pattern = pattern;
      }
      if (contentEncoding) json.contentEncoding = contentEncoding;

      break;
    }
    case "number": {
      const json: JSONSchema.NumberSchema | JSONSchema.IntegerSchema = _json as any;
      const { minimum, maximum, format, multipleOf, inclusive } = schema._zod.computed as {
        minimum?: number;
        maximum?: number;
        format?: checks.$ZodNumberFormats;
        multipleOf?: number;
        inclusive?: boolean;
      };
      if (format?.includes("int")) json.type = "integer";
      else json.type = "number";

      if (minimum) {
        if (inclusive) json.minimum = minimum;
        else json.exclusiveMinimum = minimum;
      }
      if (maximum) {
        if (inclusive) json.maximum = maximum;
        else json.exclusiveMaximum = maximum;
      }
      if (multipleOf) json.multipleOf = multipleOf;

      break;
    }
    case "boolean": {
      const json = _json as JSONSchema.BooleanSchema;
      json.type = "boolean";
      break;
    }
    case "bigint": {
      throw new Error("BigInt cannot be represented in JSON Schema");
    }
    case "symbol": {
      throw new Error("Symbols cannot be represented in JSON Schema");
    }
    case "undefined": {
      // throw new Error("Undefined cannot be represented in JSON Schema");
      const json = _json as JSONSchema.NullSchema;
      json.type = "null";
      break;
    }
    case "null": {
      _json.type = "null";
      // const json = { type: "null" } as JSONSchema.NullSchema;
      break;
    }
    case "any": {
      break;
    }
    case "unknown": {
      break;
    }
    case "never": {
      _json.not = {};
      break;
    }
    case "void": {
      throw new Error("Void cannot be represented in JSON Schema");
    }
    case "date": {
      throw new Error("Date cannot be represented in JSON Schema");
    }
    case "array": {
      const json: JSONSchema.ArraySchema = _json as any;
      const { minimum, maximum } = schema._zod.computed as {
        minimum?: number;
        maximum?: number;
      };
      if (minimum) json.minItems = minimum;
      if (maximum) json.maxItems = maximum;
      json.type = "array";
      json.items = _toJSONSchema(def.element, params);
      break;
    }
    case "object":
    case "interface": {
      const json: JSONSchema.ObjectSchema = _json as any;
      json.type = "object";
      json.properties = {};
      let shape = params.shapeCache.get(schema)!;
      if (!shape) {
        shape = def.shape;
        params.shapeCache.set(schema, shape);
      }
      for (const key in shape) {
        json.properties[key] = _toJSONSchema(shape[key], params);
      }

      // required keys
      const allKeys = new Set(Object.keys(shape));
      const optionalKeys = new Set(def.optional);
      const requiredKeys = new Set([...allKeys].filter((key) => !optionalKeys.has(key)));
      json.required = Array.from(requiredKeys);

      // catchall
      if (def.catchall) {
        json.additionalProperties = _toJSONSchema(def.catchall, params);
      }

      break;
    }
    case "union": {
      const json: JSONSchema.BaseSchema = _json as any;
      json.oneOf = def.options.map((x) => _toJSONSchema(x, params));
      break;
    }
    case "intersection": {
      const json: JSONSchema.BaseSchema = _json as any;
      json.allOf = [toJSONSchema(def.left, params), _toJSONSchema(def.right, params)];
      break;
    }
    case "tuple": {
      const json: JSONSchema.ArraySchema = _json as any;
      json.type = "array";
      json.prefixItems = def.items.map((x) => _toJSONSchema(x, params));

      // additionalItems
      if (def.rest) {
        json.items = _toJSONSchema(def.rest, params);
      }

      // length
      const { minimum, maximum } = schema._zod.computed as {
        minimum?: number;
        maximum?: number;
      };
      if (minimum) json.minItems = minimum;
      if (maximum) json.maxItems = maximum;
      break;
    }
    case "record": {
      const json: JSONSchema.ObjectSchema = _json as any;
      json.type = "object";
      json.propertyNames = _toJSONSchema(def.keyType, params);
      json.additionalProperties = _toJSONSchema(def.valueType, params);
      break;
    }
    case "map": {
      throw new Error("Map cannot be represented in JSON Schema");
    }
    case "set": {
      throw new Error("Set cannot be represented in JSON Schema");
    }
    case "enum": {
      const json: JSONSchema.BaseSchema = _json as any;
      json.enum = Object.values(def.entries);
      break;
    }
    case "literal": {
      const json: JSONSchema.BaseSchema = _json as any;
      for (const val of def.values) {
        if (val === undefined) throw new Error("Undefined cannot be represented in JSON Schema");
        if (typeof val === "bigint") throw new Error("BigInt cannot be represented in JSON Schema");
      }
      json.enum = def.values as any;
      break;
    }
    case "file": {
      throw new Error("File cannot be represented in JSON Schema");
    }
    case "transform": {
      throw new Error("Transforms cannot be represented in JSON Schema");
    }
    case "optional": {
      const inner = _toJSONSchema(def.innerType, params);
      const json: JSONSchema.BaseSchema = _json as any;
      json!.oneOf = [inner, { type: "null" }];
      break;
    }
    case "nullable": {
      const inner = _toJSONSchema(def.innerType, params);
      _json.oneOf = [inner, { type: "null" }];
      break;
    }
    case "nonoptional": {
      const inner = _toJSONSchema(def.innerType, params, _json);
      if (inner !== _json) Object.assign(_json, inner);
      _json.not = { type: "null" };
      break;
    }
    case "success": {
      _json.if = _toJSONSchema(def.innerType, params);
      _json.then = { const: true };
      _json.else = { const: false };
      break;
    }
    case "default": {
      const inner = _toJSONSchema(def.innerType, params, _json);
      if (inner !== _json) Object.assign(_json, inner);
      _json.default = def.defaultValue();
      break;
    }
    case "catch": {
      // use conditionals
      const inner = _toJSONSchema(def.innerType, params);
      let catchValue: any;
      try {
        catchValue = def.catchValue(undefined as any);
      } catch {
        throw new Error("Dynamic catch values are not supported in JSON Schema");
      }
      _json.if = inner;
      _json.then = inner;
      _json.else = { const: catchValue };
      break;
    }
    case "nan": {
      throw new Error("NaN cannot be represented in JSON Schema");
    }
    case "pipe": {
      // Object.assign(_json, _toJSONSchema(def.out, params));
      const inner = _toJSONSchema(def.out, params, _json);
      if (inner !== _json) Object.assign(_json, inner);
      break;
    }
    case "readonly": {
      const inner = _toJSONSchema(def.innerType, params, _json);
      if (inner !== _json) Object.assign(_json, inner);
      _json.readOnly = true;
      break;
    }
    case "template_literal": {
      const json = _json as JSONSchema.StringSchema;
      const pattern = schema._zod.pattern;
      if (!pattern) throw new Error("Pattern not found in template literal");
      json.type = "string";
      json.pattern = pattern.source;
      break;
    }
    case "promise": {
      // Object.assign(_json, _toJSONSchema(def.innerType, params, _json));
      const inner = _toJSONSchema(def.innerType, params, _json);
      if (inner !== _json) Object.assign(_json, inner);
      break;
    }
    case "lazy": {
      const inner = _toJSONSchema((schema as schemas.$ZodLazy)._zod._getter, params, _json);
      if (inner !== _json) Object.assign(_json, inner);

      break;
    }
    case "custom": {
      throw new Error("Custom types cannot be represented in JSON Schema");
    }
    default: {
      def satisfies never;
    }
  }
}
