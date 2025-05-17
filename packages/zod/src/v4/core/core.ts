import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import type { Class } from "./util.js";
//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////

type ZodTrait = { _zod: { def: any; [k: string]: any } };
export interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
  new (def: D): T;
  init(inst: T, def: D): asserts inst is T;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
  name: string,
  initializer: (inst: T, def: D) => void,
  params?: { Parent?: typeof Class }
): $constructor<T, D> {
  const Parent = params?.Parent ?? Object;

  class _ extends Parent {
    constructor(def: D) {
      super();
      const th = this as any;
      _.init(th, def);
      th._zod.deferred ??= [];
      for (const fn of th._zod.deferred) {
        fn();
      }
    }
    static init(inst: T, def: D) {
      Object.defineProperty(inst, "_zod", {
        value: inst._zod ?? {},
        enumerable: false,
      });
      // inst._zod ??= {} as any;
      inst._zod.traits ??= new Set();
      // const seen = inst._zod.traits.has(name);

      inst._zod.traits.add(name);
      initializer(inst, def);
      // support prototype modifications
      for (const k in _.prototype) {
        Object.defineProperty(inst, k, { value: (_.prototype as any)[k].bind(inst) });
      }
      inst._zod.constr = _;
      inst._zod.def = def;
    }

    static override [Symbol.hasInstance](inst: any) {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

//////////////////////////////   UTILITIES   ///////////////////////////////////////
export const $brand: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
  [$brand]: { [k in T]: true };
};

export type $ZodBranded<T extends schemas.$ZodType, Brand extends string | number | symbol> = T &
  Record<"_zod", Record<"~output", output<T> & $brand<Brand>>>;

export class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends schemas.$ZodType> = T["_zod"] extends { "~input": any }
  ? T["_zod"]["~input"]
  : T["_zod"]["input"];
export type output<T extends schemas.$ZodType> = T["_zod"] extends { "~output": any }
  ? T["_zod"]["~output"]
  : T["_zod"]["output"];
export type { output as infer };

//////////////////////////////   CONFIG   ///////////////////////////////////////

export interface $ZodConfig {
  /** Custom error map. Overrides `config().localeError`. */
  customError?: errors.$ZodErrorMap | undefined;
  /** Localized error map. Lowest priority. */
  localeError?: errors.$ZodErrorMap | undefined;
  /** Disable JIT schema compilation. Useful in environments that disallow `eval`. */
  jitless?: boolean | undefined;
}

export const globalConfig: $ZodConfig = {};

export function config(newConfig?: Partial<$ZodConfig>): $ZodConfig {
  if (newConfig) Object.assign(globalConfig, newConfig);
  return globalConfig;
}
