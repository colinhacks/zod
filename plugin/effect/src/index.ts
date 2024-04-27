import * as Effect from "effect/Effect";
import * as z from "zod";

function zodEffect(this: z.ZodType, data: unknown, params?: any) {
  return Effect.flatMap(
    Effect.promise(() => this.safeParseAsync(data, params)),
    (result) =>
      result.success ? Effect.succeed(result.data) : Effect.fail(result.error)
  );
}

function zodEffectSync(this: z.ZodType, data: unknown, params?: any) {
  return Effect.suspend(() => {
    const result = this.safeParse(data, params);
    return result.success
      ? Effect.succeed(result.data)
      : Effect.fail(result.error);
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
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>>;
    effectSync(
      ...args: Parameters<z.ZodType["parse"]>
    ): Effect.Effect<this["_output"], z.ZodError<this["_output"]>>;
  }

  interface ZodError {
    _tag: "ZodError";
  }
}
