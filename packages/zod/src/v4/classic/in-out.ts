import type * as core from "../core/index.js";
import { visit } from "../core/visit.js";
import type * as schemas from "./schemas.js";

// Co-located with the functions: a type and a value can only share a name from one module.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/** Returns a copy of the schema with every pipe replaced by its input side. */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodType<core.input<T>, core.input<T>> {
  return visit(schema, {
    pipe: (s) => s._zod.def.in,
  }) as schemas.ZodType<core.input<T>, core.input<T>>;
}

/** Returns a copy of the schema with every pipe replaced by its output side. */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodType<core.output<T>, core.output<T>> {
  return visit(schema, {
    pipe: (s) => s._zod.def.out,
  }) as schemas.ZodType<core.output<T>, core.output<T>>;
}
