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
 * optional, recursively. Built on {@link core.visit}; terminates on
 * lazy cycles and visits shared sub-schemas once. Non-object nodes
 * are left untouched.
 */
export function deepPartial<T extends core.$ZodType>(
  schema: T
): schemas.ZodType<DeepPartialValue<core.output<T>>, DeepPartialValue<core.input<T>>> {
  return core.visit(schema, {
    object: (s) => (s as schemas.ZodObject).partial(),
    // Making a discriminator optional collapses the fast-path lookup
    // (every option gets `undefined` as a possible discriminator).
    // Degrade to a plain union over the already-partialed options —
    // validation semantics are preserved via try-each.
    union: (s) => {
      const def = s._zod.def as any;
      return def.discriminator !== undefined ? schemas.union(def.options) : s;
    },
  }) as any;
}
