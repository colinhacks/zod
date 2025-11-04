import type * as JSONSchema from "./json-schema.js";
import { globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

export interface JSONSchemaContext {
  /** Whether to extract the `"input"` or `"output"` type. Relevant to transforms, defaults, coerced primitives, etc.
   * - `"input"` — Convert the input schema.
   * - `"output"` — Convert the output schema. */
  io: "input" | "output";
  /** The JSON Schema version to target.
   * - `"draft-2020-12"` — JSON Schema Draft 2020-12
   * - `"draft-07"` — JSON Schema Draft 7 */
  target: "draft-07" | "draft-2020-12";
}

const cache = new WeakMap<schemas.$ZodType, JSONSchema.BaseSchema>();

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

  const meta = globalRegistry.get(schema);
  if (meta) Object.assign(json, meta);

  const context = { io: "input" as const, target: "draft-2020-12" as const, ...ctx };
  build(json, context);
  return json;
}

// utils

export function strip(json: Record<string, any>, names: string[]): void {
  for (const name of names) {
    delete json[name];
  }
}

export function copy(
  target: Record<string, any>,
  source: Record<string, any>,
  map: string[] | Record<string, string>
): void {
  if (Array.isArray(map)) {
    // Direct copy: copy(target, source, ["field1", "field2"])
    for (const k of map) {
      if (source[k]) {
        target[k] = source[k];
      }
    }
  } else {
    // Key remapping: copy(target, source, { sourceKey: "targetKey" })
    for (const [k, t] of Object.entries(map)) {
      if (source[k]) {
        target[t] = source[k];
      }
    }
  }
}

export function rename(target: Record<string, any>, map: Record<string, string>): void {
  for (const [from, to] of Object.entries(map)) {
    if (target[from] !== undefined) {
      target[to] = target[from];
      delete target[from];
    }
  }
}
