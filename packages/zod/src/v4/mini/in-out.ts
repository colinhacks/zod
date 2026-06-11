import * as core from "../core/index.js";
import type * as schemas from "./schemas.js";

// See `classic/in-out.ts` for why these aliases exist.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/** See `classic/in-out.ts`. */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.input<T>, core.input<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).in as core.$ZodType,
  }) as any;
}

/** See `classic/in-out.ts`. */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.output<T>, core.output<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).out as core.$ZodType,
  }) as any;
}
