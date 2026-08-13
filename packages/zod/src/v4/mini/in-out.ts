import type * as core from "../core/index.js";
import { visit } from "../core/visit.js";
import type * as schemas from "./schemas.js";

// See `classic/in-out.ts` for why these aliases exist.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/** See `classic/in-out.ts`. */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.input<T>, core.input<T>> {
  return visit(schema, {
    pipe: (s) => s._zod.def.in,
  }) as schemas.ZodMiniType<core.input<T>, core.input<T>>;
}

/** See `classic/in-out.ts`. */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodMiniType<core.output<T>, core.output<T>> {
  return visit(schema, {
    pipe: (s) => s._zod.def.out,
  }) as schemas.ZodMiniType<core.output<T>, core.output<T>>;
}
