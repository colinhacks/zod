import type * as core from "../core/index.js";
import { clone, mergeDefs } from "../core/util.js";
import { visit } from "../core/visit.js";
import * as schemas from "./schemas.js";

// Co-located with the functions: a type and a value can only share a name from one module.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/** Appends a pipe's own checks to the side that replaces it, mirroring how `.check()` clones. */
function withChecks(side: core.$ZodType, checks: core.$ZodTypeDef["checks"]): core.$ZodType {
  if (!checks?.length) return side;
  const def = side._zod.def;
  return clone(side, mergeDefs(def, { checks: [...(def.checks ?? []), ...checks] }), { parent: true });
}

/** The out side, carrying the pipe's own checks: those run against the decoded value, which is what `out` produces. */
function outSide(def: core.$ZodPipeDef): core.$ZodType {
  return withChecks(def.out, def.checks);
}

/** The in side. `z.preprocess` pipes a transform into a schema, and a bare transform validates nothing, so the schema it feeds is the real input side — the resolution `toJSONSchema` already makes for this case. */
function inSide(def: core.$ZodPipeDef): core.$ZodType {
  return def.in._zod.traits.has("$ZodTransform") ? outSide(def) : def.in;
}

/** Returns a copy of the schema with every pipe replaced by its input side. A codec's checks are dropped: they constrain the decoded value the input side never produces. */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodType<core.input<T>, core.input<T>> {
  return visit(schema, {
    pipe: (s) => inSide(s._zod.def),
    // A default value belongs to the output side, so a rewritten inner type leaves it stranded. `.default()` widens the declared input type with `undefined`, and `optional` is what carries that across.
    default: (s, rewritten) => (rewritten ? schemas.optional(s._zod.def.innerType) : s),
    // A catch value is output-side too, but `.catch()` leaves the declared input type alone, so the inner schema stands on its own.
    catch: (s, rewritten) => (rewritten ? s._zod.def.innerType : s),
  }) as schemas.ZodType<core.input<T>, core.input<T>>;
}

/** Returns a copy of the schema with every pipe replaced by its output side, carrying over the pipe's own checks. */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodType<core.output<T>, core.output<T>> {
  return visit(schema, {
    pipe: (s) => outSide(s._zod.def),
    // A prefault value is fed through the schema, which makes it input-side, so a rewritten inner type leaves it stranded.
    prefault: (s, rewritten) => (rewritten ? s._zod.def.innerType : s),
  }) as schemas.ZodType<core.output<T>, core.output<T>>;
}
