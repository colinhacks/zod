import * as Effect from "effect/Effect";
import { ZodError, ZodType } from "zod";

function zodEffect(this: ZodType, data: unknown, params?: any) {
  return Effect.flatMap(
    Effect.promise(() => this.safeParseAsync(data, params)),
    (result) =>
      result.success ? Effect.succeed(result.data) : Effect.fail(result.error)
  );
}

function zodEffectSync(this: ZodType, data: unknown, params?: any) {
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
  Object.defineProperty(ZodType.prototype, "effect", {
    get() {
      return {
        parse: zodEffect.bind(this),
        parseSync: zodEffectSync.bind(this),
      };
    },
  });
  ZodError.prototype._tag = "ZodError";
}

interface EffectMethods<T> {
  parse(
    ...args: Parameters<ZodType["parseAsync"]>
  ): Effect.Effect<T, ZodError<T>>;
  parseSync(
    ...args: Parameters<ZodType["parse"]>
  ): Effect.Effect<T, ZodError<T>>;
}
declare module "zod" {
  interface ZodType {
    effect: EffectMethods<this["~output"]>;
  }

  interface ZodError {
    _tag: "ZodError";
  }
}
