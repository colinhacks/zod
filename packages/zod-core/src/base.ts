import type * as errors from "./errors.js";
import * as util from "./util.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
interface Trait {
  _def: unknown;
}

export interface $constructor<T extends Trait> {
  new (def: T["_def"]): T;
  init(inst: T, def: T["_def"]): void;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends Trait, D = T["_def"]>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T> {
  class _ {
    constructor(def: D) {
      _.init(this as any as T, def);
    }
    static init(inst: T, def: D) {
      (inst as any)["_traits"] ??= new Set();
      (inst as any)["_traits"].add(name);
      initializer(inst, def);
      (inst as any)["_constr"] = _;
      (inst as any)["_def"] = def;
    }
    static [Symbol.hasInstance](inst: any) {
      return inst?.["_traits"]?.has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

/////////////////////////////   PARSE   //////////////////////////////

export interface $ParseContext {
  readonly error?: errors.$ZodErrorMap<never>;
  readonly includeInputInErrors?: boolean;
  readonly skipFast?: boolean;
  readonly async?: boolean | undefined;
}

export interface $ParsePayload<T = unknown> {
  value: T;
  issues: errors.$ZodRawIssue[];
  $payload: true;
}

/////////////////////////////   ZODRESULT   //////////////////////////////

export function $aborted(x: $ParsePayload): boolean {
  return x.issues.some((iss) => iss.continue !== true);
}

export function $continuable(issues: errors.$ZodRawIssue[]): boolean {
  return issues.every((iss) => iss.continue === true);
}

export function $prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => {
    iss.path ??= [];
    iss.path.unshift(path);
    return iss;
  });
}

//////////////////////////////////////////////////////////////////////////////

export type $ZodSchemaTypes =
  | "string"
  | "number"
  | "int"
  | "boolean"
  | "bigint"
  | "symbol"
  | "null"
  | "undefined"
  | "void" // merge with undefined?
  | "never"
  | "any"
  | "unknown"
  | "date"
  | "object"
  | "interface"
  | "record"
  | "file"
  | "array"
  | "tuple"
  | "union"
  | "intersection"
  | "map"
  | "set"
  | "enum"
  | "literal"
  | "const"
  | "nullable"
  | "optional"
  | "required"
  | "success"
  | "preprocess"
  | "effect"
  | "transform"
  | "default"
  | "catch"
  | "nan"
  | "branded"
  | "pipe"
  | "readonly"
  | "template_literal"
  | "promise"
  | "custom";

export type $IO<O, I> = { output: O; input: I };
const BRAND: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};

export type $DiscriminatorMapElement = {
  values: Set<util.Primitive>;
  maps: $DiscriminatorMap[];
};
export type $DiscriminatorMap = Map<PropertyKey, $DiscriminatorMapElement>;
export type $PrimitiveSet = Set<util.Primitive>;

export type $CheckFn<T> = (input: $ParsePayload<T>) => util.MaybeAsync<void>;

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  description?: string | undefined;
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}

export interface $ZodType<out O = unknown, out I = unknown> {
  $check(...checks: ($CheckFn<this["_output"]> | $ZodCheck<this["_output"]>)[]): this;
  clone(def?: this["_def"]): this;
  register<R extends $ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [R["_meta"]?]
        : [R["_meta"]]
      : ["Incompatible schema"]
  ): this;
  brand<T extends PropertyKey = PropertyKey, Output = this["_output"]>(): this & {
    "~output": Output & $brand<T>;
  };

  _id: string;
  /** @deprecated Internal API, use with caution. */
  _standard: number;
  /** @deprecated Internal API, use with caution. */
  _types: $IO<this["_output"], this["_input"]>;
  /** @deprecated Internal API, use with caution. */
  _output: O;
  /** @deprecated Internal API, use with caution. */
  _input: I;

  /** @deprecated Internal API, use with caution. */
  _run(payload: $ParsePayload, ctx: $ParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. */
  _parse(payload: $ParsePayload<any>, ctx: $ParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. */
  _traits: Set<string>;
  /** @deprecated Internal API, use with caution. */
  _qout?: "true" | undefined;
  /** @deprecated Internal API, use with caution. */
  _qin?: "true" | undefined;
  /** @deprecated Internal API, use with caution. */
  _disc?: $DiscriminatorMap;
  /** @deprecated Internal API, use with caution. */
  _values?: $PrimitiveSet;
  /** @deprecated Internal API, use with caution. */
  _def: $ZodTypeDef;
  /** @deprecated Internal API, use with caution.
   *
   * The constructor function of this schema.
   */
  _constr: new (
    def: any
  ) => any;
  /** @deprecated Internal API, use with caution. */
  _computed: Record<string, any>;
  /** The set of issues this schema might throw during type checking. */
  _isst?: errors.$ZodIssueBase;
}

export function clone<T extends $ZodType>(inst: T, def: T["_def"]): T {
  return new inst["_constr"](def);
}

export const $ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
  inst["_id"] = def.type + "_" + util.randomString(10);
  inst._def = def; // set _def property
  inst["_standard"] = 1; // set standard-schema version
  inst["_computed"] = inst["_computed"] || {}; // initialize _computed object
  inst.clone = (_def) => clone(inst, _def ?? def);
  inst.brand = () => inst as any;
  inst.register = ((reg: any, meta: any) => {
    reg.add(inst, meta);
    return inst;
  }) as any;

  const checks = [...(inst._def.checks ?? [])];

  // if inst is itself a $ZodCheck, run it as a check
  if (inst["_traits"].has("$ZodCheck")) {
    checks.unshift(inst as any);
  }

  for (const ch of checks) {
    ch._onattach?.(inst);
  }

  if (checks.length === 0) {
    inst._run = (...args) => {
      return inst._parse(...args);
    };
  } else {
    let runChecks = (result: $ParsePayload<any>): util.MaybeAsync<$ParsePayload> => {
      return result;
    };

    for (const ch of checks.slice().reverse()) {
      const _curr = runChecks;
      runChecks = (result) => {
        const numIssues = result.issues.length;
        const _ = ch._check(result as any);
        if (_ instanceof Promise) {
          return _.then((_) => {
            if (result.issues.length > numIssues && $aborted(result)) return result;
            return _curr(result);
          });
        }

        // if ch has "when", run it
        if (ch._def.when) {
        }
        // otherwise, check if parse has aborted and return
        if ($aborted(result)) return result;
        // if not aborted, continue running checks
        return _curr(result);
      };
    }

    inst._run = (payload, ctx) => {
      const result = inst._parse(payload, ctx);

      if (result instanceof Promise) {
        return result.then((result) => {
          if ($aborted(result)) return result;
          return runChecks(result);
        });
      }

      if ($aborted(result)) return result;
      return runChecks(result);
    };
  }
});

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends $ZodType> = T["_input"]; // extends object ? util.Flatten<T["_input"]> : T["_input"];
export type output<T extends $ZodType> = T["_output"]; // extends object ? util.Flatten<T["_output"]> : T["_output"];
export type { output as infer };

export function $finalize(issues: errors.$ZodRawIssue[], ctx?: $ParseContext): $ZodError {
  return new $ZodError(
    issues.map((iss) => {
      const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
      if (!iss.message) {
        const message =
          ctx?.error?.(iss as never) ??
          iss.def?.error?.(iss as never) ??
          config().error?.(iss) ??
          defaultErrorMap(iss)!;
        full.message = typeof message === "string" ? message : message?.message;
      }

      delete (full as any).def;
      delete (full as any).continue;
      if (!ctx?.includeInputInErrors) {
        delete full.input;
      }
      return full;
    })
  );
}

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError<T = unknown> {
  /** @deprecated Virtual property, do not access. */
  _t!: T;
  public issues: errors.$ZodIssue[];
  constructor(issues: errors.$ZodIssue[]) {
    Object.defineProperty(this, "~tag", { value: ZOD_ERROR, enumerable: false });
    this.issues = issues;
  }

  static [Symbol.hasInstance](inst: any) {
    return inst?.["_tag"] === ZOD_ERROR;
  }

  static assert(value: unknown): asserts value is $ZodError {
    if (!(value instanceof $ZodError)) {
      throw new Error(`Not a $ZodError: ${value}`);
    }
  }
}

import defaultErrorMap from "./locales/en.js";
import type { $ZodRegistry } from "./registries.js";

interface ZodConfig {
  error: errors.$ZodErrorMap;
}

const globalZodConfig: ZodConfig = {
  error: defaultErrorMap,
};

export function config(config?: Partial<ZodConfig>): ZodConfig {
  if (config) Object.assign(globalZodConfig, config);
  return globalZodConfig;
}

export { defaultErrorMap };

//////////////////////////////   CHECKS   ///////////////////////////////////////

export interface $ZodCheckDef {
  check: string;
  error?: errors.$ZodErrorMap<never> | undefined;
  /** Whether parsing should be aborted if this check fails. */
  abort?: boolean | undefined;
  when?: ((payload: $ParsePayload) => boolean) | undefined;
}

export interface $ZodCheck<in T = never> {
  _def: $ZodCheckDef;
  /** The set of issues this check might throw. */
  _issc?: errors.$ZodIssueBase;
  // "~check"(input: $ZodResult<T>): util.MaybeAsync<void>;
  _check(payload: $ParsePayload<T>): util.MaybeAsync<void>;
  // _parseB(payload: $ParsePayload<any>, ctx: $ParseContext): util.MaybeAsync<$ParsePayload>;
  _onattach?(schema: $ZodType): void;
  // "~async": boolean;
}

export const $ZodCheck: $constructor<$ZodCheck<any>> = $constructor("$ZodCheck", (inst, def) => {
  inst._def = def;
});
