import { Effect } from "effect";
import * as z from "zod";

function zodEffect(this: z.ZodType, data: unknown) {
  return Effect.tryPromise({
    try: async () => this.parseAsync(data),
    catch(error) {
      return error as z.ZodError; // only kinda a lie...
    },
  });
}

function zodEffectSync(this: z.ZodType, data: unknown) {
  return Effect.try({
    try: () => this.parse(data),
    catch(error) {
      return error as z.ZodError; // only kinda a lie...
    },
  });
}

let executed = false;
if (!executed) {
  executed = true;
  z.ZodType.prototype.effect = zodEffect;
  z.ZodType.prototype.effectSync = zodEffectSync;
}

declare module "zod" {
  interface ZodType {
    effect(
      data: unknown
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
    effectSync(
      data: unknown
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
  }
}
