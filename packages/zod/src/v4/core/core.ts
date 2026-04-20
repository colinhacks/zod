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
export const NEVER: never = Object.freeze({
  status: "aborted",
}) as never;

/**
 * Symbol used to access the internal prototype of a Zod constructor.
 *
 * Each constructor created by `$constructor` maintains two prototype layers:
 *   inst → _.prototype (user-visible; copy-loop targets this)
 *            └── internalProto (library methods set by _initProto go here)
 *
 * Keeping library methods one layer below the user-visible prototype means the
 * copy-loop is a no-op for default schemas (_.prototype is empty), which
 * prevents V8 dictionary-mode degradation caused by too many own properties.
 * User prototype extensions still work exactly as before: adding a method to
 * e.g. `z.ZodType.prototype` triggers the copy-loop for every new instance.
 */
export const $internalProto: unique symbol = Symbol("zod.internalProto");

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
    // _.prototype is the user-visible layer (empty by default).  When users add
    // methods there (e.g. z.ZodType.prototype.myHelper = fn) those methods are
    // copied to new instances here, preserving the original extension contract.
    // Library methods live on internalProto (one level below), so they are
    // never enumerated by Object.keys(_.prototype) and never copied to instances.
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

  // Internal prototype layer: library-owned methods (_initProto targets this).
  // Sits between _.prototype (user space) and the Parent prototype so that
  // Object.keys(_.prototype) always returns only user-added keys.
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

  // Expose internalProto so that _initProto (in schemas.ts) can find it.
  Object.defineProperty(_, $internalProto, { value: internalProto });
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst: any) => {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    },
  });
  Object.defineProperty(_, "name", { value: name });

  // Wire _.prototype → internalProto so that instance prototype chain is:
  //   inst → _.prototype (user space) → internalProto (library space) → Parent
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

export const globalConfig: $ZodConfig = {};

export function config(newConfig?: Partial<$ZodConfig>): $ZodConfig {
  if (newConfig) Object.assign(globalConfig, newConfig);
  return globalConfig;
}
