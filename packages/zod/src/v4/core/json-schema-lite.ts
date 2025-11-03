import type * as JSONSchema from "./json-schema.js";
import { globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

const cache = new WeakMap<schemas.$ZodType, JSONSchema.BaseSchema>();

export interface JSONSchemaContext {
  /** Whether to extract the `"input"` or `"output"` type. Relevant to transforms, defaults, coerced primitives, etc.
   * - `"input"` — Convert the input schema.
   * - `"output"` — Convert the output schema. */
  io: "input" | "output";
  /** The JSON Schema version to target.
   * - `"draft-2020-12"` — JSON Schema Draft 2020-12
   * - `"draft-7"` — JSON Schema Draft 7
   * - `"draft-4"` — JSON Schema Draft 4
   * - `"openapi-3.0"` — OpenAPI 3.0 Schema Object */
  target: "draft-4" | "draft-7" | "draft-2020-12" | "openapi-3.0";
  /** JSON Schema property path for this schema */
  path: (string | number)[];
  /** Zod schema path for cycle detection */
  schemaPath: schemas.$ZodType[];
  /** How to handle unrepresentable types.
   * - `"throw"` — Unrepresentable types throw an error
   * - `"any"` — Unrepresentable types become `{}` */
  unrepresentable: "throw" | "any";
  /** Processor for advanced features like cycle detection, reference extraction, etc.
   * Receives the schema, context, and the result from getJSONSchema.
   * Must return a JSON Schema. */
  processor: (
    schema: schemas.$ZodType,
    context: JSONSchemaContext,
    result: JSONSchema.BaseSchema
  ) => JSONSchema.BaseSchema;
}

export function toJSON<T extends JSONSchema.BaseSchema>(
  schema: schemas.$ZodType,
  ctx: JSONSchemaContext,
  pathSegment: (string | number)[],
  build: (json: T, ctx: JSONSchemaContext) => void
): T {
  const cached = cache.get(schema);
  if (cached) return cached as T;

  const context: JSONSchemaContext = {
    io: ctx.io,
    target: ctx.target,
    path: [...ctx.path, ...pathSegment],
    schemaPath: [...ctx.schemaPath, schema],
    unrepresentable: ctx.unrepresentable,
    processor: ctx.processor,
  };

  // Build the JSON Schema first
  const json = {} as T;
  cache.set(schema, json);
  Object.assign(json, schema._zod.bag);

  const meta = globalRegistry._map.get(schema);
  if (meta) Object.assign(json, meta);

  build(json, context);

  // Processor handles the result
  const processorResult = ctx.processor(schema, context, json);
  cache.set(schema, processorResult);
  return processorResult as T;
}
