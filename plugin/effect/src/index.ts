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
  Object.defineProperty(z.ZodType.prototype, "effect", {
    get() {
      return {
        parse: zodEffect.bind(this),
        parseSync: zodEffectSync.bind(this),
      };
    },
  });
  z.ZodError.prototype._tag = "ZodError";
}

interface EffectMethods<T> {
  parse(
    ...args: Parameters<z.ZodType["parseAsync"]>
  ): Effect.Effect<T, z.ZodError<T>>;
  parseSync(
    ...args: Parameters<z.ZodType["parse"]>
  ): Effect.Effect<T, z.ZodError<T>>;
}
declare module "zod" {
  interface ZodType {
    effect: EffectMethods<this["_output"]>;
  }

  interface ZodError {
    _tag: "ZodError";
  }
}
