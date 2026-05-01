import * as core from "../core/index.js";
import * as schemas from "./schemas.js";

type DeepPartialValue<T> = T extends Date | RegExp | ((...args: any[]) => any)
  ? T
  : T extends ReadonlyArray<infer U>
    ? T extends unknown[]
      ? DeepPartialValue<U>[]
      : ReadonlyArray<DeepPartialValue<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartialValue<T[K]> }
      : T;

/**
 * Returns a schema where every nested object's properties are made
 * optional, recursively. Built on {@link core.mapOnSchema}; terminates
 * on lazy cycles and visits shared sub-schemas once. Non-object nodes
 * (primitives, transforms, refinements, etc.) are left untouched.
 */
export function deepPartial<T extends core.$ZodType>(
  schema: T
): schemas.ZodType<DeepPartialValue<core.output<T>>, DeepPartialValue<core.input<T>>> {
  return core.mapOnSchema(schema, (s) => {
    const def = s._zod.def as any;
    if (def.type === "object") return (s as schemas.ZodObject).partial();
    // Discriminated unions: making the discriminator optional collapses
    // the fast-path lookup (duplicate `undefined` discriminator). Fall
    // back to a plain `union` over the already-partialed options, which
    // still validates correctly via try-each.
    if (def.type === "union" && def.discriminator !== undefined) {
      return schemas.union(def.options);
    }
    return s;
  }) as any;
}
