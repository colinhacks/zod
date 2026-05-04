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

/** See `classic/deep-partial.ts`. Mini variant uses `mini.partial(...)`. */
export function deepPartial<T extends core.$ZodType>(
  schema: T
): schemas.ZodMiniType<DeepPartialValue<core.output<T>>, DeepPartialValue<core.input<T>>> {
  return core.visit(schema, {
    object: (s) => schemas.partial(s as schemas.ZodMiniObject),
    union: (s) => {
      const def = s._zod.def as any;
      return def.discriminator !== undefined ? schemas.union(def.options) : s;
    },
  }) as any;
}
