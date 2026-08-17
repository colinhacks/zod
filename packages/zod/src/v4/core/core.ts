import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import type { Class } from "./util.js";
//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////

type ZodTrait = { _zod: { def: any; [k: string]: any } };
export interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
  new (def: D): T;
  init(inst: T, def: D): asserts inst is T;
}

/** A special constant with type `never` */
export const NEVER: never = /*@__PURE__*/ Object.freeze({
  status: "aborted",
}) as never;

/* Shared descriptor for installing `_zod`; defineProperty reads it
 * synchronously, so reusing one object avoids a per-instance allocation. */
const _zodDesc: PropertyDescriptor = { value: undefined, enumerable: false };

// Marks a `_zod` prototype whose constructor has completed an instance: its lazily-derived internals are installed, so later constructions skip them.
export const built: unique symbol = Symbol("zod_built");

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
  name: string,
  initializer: (inst: T, def: D) => void,
  params?: { Parent?: typeof Class }
): $constructor<T, D> {
  // Prototype for this constructor's `_zod` internals. Lazily-derived fields (`values`, `pattern`, `optin`, …) install here once rather than as an accessor on every instance.
  const zodProto: any = {};

  // Flipped once this constructor has produced an instance; after that the prototype's lazily-derived internals are installed and there is nothing left to seal.
  let sealed = false;

  // Assigning the fields in the constructor body is what gives instances in-object slots; building the object literally and reparenting it costs a second allocation and a generic property copy.
  function Internals(this: any, def: D) {
    this.def = def;
    this.constr = _;
    this.traits = new Set();
  }
  Internals.prototype = zodProto;

  function init(inst: T, def: D) {
    if (!inst._zod) {
      _zodDesc.value = new (Internals as any)(def);
      try {
        Object.defineProperty(inst, "_zod", _zodDesc);
      } finally {
        // Cleared even on throw, so the shared descriptor never leaks one instance's internals into the next.
        _zodDesc.value = undefined;
      }
    }

    if (inst._zod.traits.has(name)) {
      return;
    }

    inst._zod.traits.add(name);

    initializer(inst, def);

    // support prototype modifications; for-in avoids the array allocation of Object.keys on the (usually empty) prototype
    const proto = _.prototype;
    for (const k in proto) {
      if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
      if (!(k in inst)) {
        (inst as any)[k] = proto[k].bind(inst);
      }
    }
  }

  // doesn't work if Parent has a constructor with arguments
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {}
  Object.defineProperty(Definition, "name", { value: name });

  function _(this: any, def: D) {
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    const deferred = inst._zod.deferred;
    if (deferred) {
      for (const fn of deferred) {
        fn();
      }
      // Released: initializers run once, and the list would otherwise be retained for the schema's lifetime.
      inst._zod.deferred = undefined;
    }

    if (!sealed) {
      sealed = true;
      const zodProtoUsed = Object.getPrototypeOf(inst._zod);
      if (!zodProtoUsed[built]) Object.defineProperty(zodProtoUsed, built, { value: true });
    }

    // Global post-processor hook. Internal: installed by `import "zod/compile"` to enable AOT compilation for every constructed schema. Runs last, once the instance is fully built and sealed, because it hands the instance to compile(). The post-processor is expected to be reentrancy-guarded by its own implementation.
    const pp = (globalThis as GlobalThisWithConfig).__zod_globalConfig?.postProcessor;
    if (pp) pp(inst);
    return inst;
  }

  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst: any) => {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    },
  });
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

//////////////////////////////   UTILITIES   ///////////////////////////////////////
export const $brand: unique symbol = /*@__PURE__*/ Symbol("zod_brand");
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
  /**
   * Internal: post-processor invoked on every freshly-constructed schema
   * instance, after init and deferred fns run. Set by `import "zod/compile"`
   * to install AOT compilation. Not part of the public API.
   * @internal
   */
  postProcessor?: ((inst: any) => void) | undefined;
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
