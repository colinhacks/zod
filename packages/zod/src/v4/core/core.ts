import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import type { Class } from "./util.js";
//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////

type ZodTrait = { _zod: { def: any; [k: string]: any } };
export interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
  new (def: D): T;
  init(inst: T, def: D): asserts inst is T;
}

/**
 * Symbol used to access the internal prototype of a Zod constructor.
 *
 * Each constructor created by `$constructor` maintains two prototype layers:
 *   inst → _.prototype (user-visible; copy-loop targets this)
 *            └── internalProto (library methods set by _initLazy go here)
 *
 * Library methods placed on internalProto are inherited (not own properties)
 * which keeps instances under V8's fast-property threshold.
 */
export const $internalProto: unique symbol = Symbol("zod.internalProto");

/**
 * Define a method on `proto` such that the FIRST time it is accessed on an
 * instance, a `bind`-equivalent thunk is allocated and cached as an
 * enumerable own property on that instance. Subsequent accesses skip the
 * getter entirely.
 *
 * This preserves detached usage (`const m = schema.optional; m()` works
 * because `m` is a bound function with `this` pre-resolved) while only
 * allocating closures for methods actually accessed.
 */
export function defineLazy(proto: object, key: string | symbol, sharedFn: (...args: any[]) => any): void {
  Object.defineProperty(proto, key, {
    configurable: true,
    enumerable: false,
    get(this: any) {
      // `bind` is roughly equivalent in cost to allocating a closure that
      // captures `this`. We cache the result on the instance so this getter
      // fires at most once per (instance, method).
      const bound = sharedFn.bind(this);
      Object.defineProperty(this, key, {
        configurable: true,
        writable: true,
        enumerable: true,
        value: bound,
      });
      return bound;
    },
    set(this: any, v: unknown) {
      // Allow user reassignment / extension of the method on a specific instance.
      Object.defineProperty(this, key, {
        configurable: true,
        writable: true,
        enumerable: true,
        value: v,
      });
    },
  });
}

/** A special constant with type `never` */
export const NEVER: never = /*@__PURE__*/ Object.freeze({
  status: "aborted",
}) as never;

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
  name: string,
  initializer: (inst: T, def: D) => void,
  params?: { Parent?: typeof Class }
): $constructor<T, D> {
  function init(inst: T, def: D) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: new Set(),
        },
        enumerable: false,
      });
    }

    if (inst._zod.traits.has(name)) {
      return;
    }

    inst._zod.traits.add(name);

    initializer(inst, def);

    // support prototype modifications
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]!;
      if (!(k in inst)) {
        (inst as any)[k] = proto[k].bind(inst);
      }
    }
  }

  // doesn't work if Parent has a constructor with arguments
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {}
  Object.defineProperty(Definition, "name", { value: name });

  // Internal prototype layer: library-owned space for shared methods. Sits
  // between `_.prototype` (user space, empty by default) and the parent
  // prototype, so `Object.keys(_.prototype)` never enumerates library
  // methods and the copy-loop above stays a no-op for default schemas.
  const internalProto = Object.create(params?.Parent?.prototype ?? Object.prototype);
  Object.setPrototypeOf(Definition.prototype, internalProto);

  function _(this: any, def: D) {
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    inst._zod.deferred ??= [];
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }

  Object.defineProperty(_, $internalProto, { value: internalProto });
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst: any) => {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    },
  });
  Object.defineProperty(_, "name", { value: name });

  // Wire `_.prototype → internalProto` so the chain reads:
  //   inst → _.prototype (user space) → internalProto (library) → Parent
  Object.setPrototypeOf(_.prototype, internalProto);

  return _ as any;
}

//////////////////////////////   UTILITIES   ///////////////////////////////////////
export const $brand: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
  [$brand]: { [k in T]: true };
};

export type $ZodBranded<
  T extends schemas.SomeType,
  Brand extends string | number | symbol,
  Dir extends "in" | "out" | "inout" = "out",
> = T &
  (Dir extends "inout"
    ? { _zod: { input: input<T> & $brand<Brand>; output: output<T> & $brand<Brand> } }
    : Dir extends "in"
      ? { _zod: { input: input<T> & $brand<Brand> } }
      : { _zod: { output: output<T> & $brand<Brand> } });

export type $ZodNarrow<T extends schemas.SomeType, Out> = T & { _zod: { output: Out } };

export class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

export class $ZodEncodeError extends Error {
  constructor(name: string) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

// export type input<T extends schemas.$ZodType> = T["_zod"]["input"];
// export type output<T extends schemas.$ZodType> = T["_zod"]["output"];
// export type input<T extends schemas.$ZodType> = T["_zod"]["input"];
// export type output<T extends schemas.$ZodType> = T["_zod"]["output"];
export type input<T> = T extends { _zod: { input: any } } ? T["_zod"]["input"] : unknown;
export type output<T> = T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown;

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

interface GlobalThisWithConfig {
  /**
   * The globalConfig instance shared across both CommonJS and ESM builds.
   * Attached to `globalThis` (mirroring `__zod_globalRegistry`) so that a
   * single config object is used regardless of how Zod is loaded — CJS,
   * ESM, multiple bundles in a monorepo, etc. This means `z.config(...)`
   * applied against any one instance is observed by all of them, and
   * pre-populating it before Zod loads (e.g. `globalThis.__zod_globalConfig
   * = { jitless: true }` in an inline script) takes effect immediately on
   * import.
   */
  __zod_globalConfig?: $ZodConfig;
}

(globalThis as GlobalThisWithConfig).__zod_globalConfig ??= {};
export const globalConfig: $ZodConfig = (globalThis as GlobalThisWithConfig).__zod_globalConfig!;

export function config(newConfig?: Partial<$ZodConfig>): $ZodConfig {
  if (newConfig) Object.assign(globalConfig, newConfig);
  return globalConfig;
}
