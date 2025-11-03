import type * as JSONSchema from "./json-schema.js";
import { globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

const cache = new WeakMap<schemas.$ZodType, JSONSchema.BaseSchema>();

export interface JSONSchemaContext {
  /** Whether to extract the `"input"` or `"output"` type. Relevant to transforms, defaults, coerced primitives, etc.
   * - `"input"` — Default. Convert the input schema.
   * - `"output"` — Convert the output schema. */
  io?: "input" | "output";
}

export function toJSON<T extends JSONSchema.BaseSchema>(
  schema: schemas.$ZodType,
  ctx: JSONSchemaContext | undefined,
  build: (json: T, ctx: JSONSchemaContext) => void
): T {
  const cached = cache.get(schema);
  if (cached) return cached as T;

  const json = {} as T;
  cache.set(schema, json);
  Object.assign(json, schema._zod.bag);

  const meta = globalRegistry._map.get(schema);
  if (meta) Object.assign(json, meta);

  const context = { io: "input" as const, ...ctx };
  build(json, context);
  return json;
}
