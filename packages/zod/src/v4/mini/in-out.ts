import * as core from "../core/index.js";
import type * as schemas from "./schemas.js";

/** See `classic/in-out.ts`. */
export function inOf<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.input<T>, core.input<T>> {
  return core.mapOnSchema(schema, (s) =>
    s._zod.def.type === "pipe" ? ((s._zod.def as any).in as core.$ZodType) : s
  ) as any;
}

/** See `classic/in-out.ts`. */
export function outOf<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.output<T>, core.output<T>> {
  return core.mapOnSchema(schema, (s) =>
    s._zod.def.type === "pipe" ? ((s._zod.def as any).out as core.$ZodType) : s
  ) as any;
}
