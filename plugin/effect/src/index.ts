import { Effect } from "effect";
import * as z from "zod";

function zodEffect(this: z.ZodType, data: unknown, params?: any) {
  return Effect.tryPromise({
    try: async () => this.parseAsync(data, params),
    catch(error) {
      return error as z.ZodError;
    },
  });
}

function zodEffectSync(this: z.ZodType, data: unknown, params?: any) {
  return Effect.try({
    try: () => this.parse(data, params),
    catch(error) {
      return error as z.ZodError;
    },
  });
}

const sym = Symbol.for("zod_effect_executed");
if (!(globalThis as { [k: symbol]: unknown })[sym]) {
  (globalThis as { [k: symbol]: unknown })[sym] = true;
  z.ZodType.prototype.effect = zodEffect;
  z.ZodType.prototype.effectSync = zodEffectSync;
  z.ZodError.prototype._tag = "ZodError";
}

declare module "zod" {
  interface ZodType {
    effect(
      ...args: Parameters<z.ZodType["parseAsync"]>
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
    effectSync(
      ...args: Parameters<z.ZodType["parse"]>
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
  }

  interface ZodError {
    _tag: "ZodError";
  }
}
