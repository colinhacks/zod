import type * as err from "./errors.js";
import type * as types from "./types.js";

export type input<T extends $ZodType> = T["_input"];
export type output<T extends $ZodType> = T["_output"];
export type {
  output as infer,
  /** @deprecated Use z.output<typeof schema> instead */
  output as Infer,
};

// @ts-expect-error
export interface $Dynamic<T extends object> extends T {}
export class $Dynamic<T extends object> {
  constructor(def: T) {
    Object.assign(this, def);
  }
}

//////////////////////////////////////////////////////////////////////////////

export type $ZodSchemaTypes =
  | "string"
  | "number"
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
  | "nullable"
  | "optional"
  | "success"
  | "preprocess"
  | "effect"
  | "transform"
  | "default"
  | "catch"
  | "nan"
  | "branded"
  | "pipeline"
  | "readonly"
  | "template_literal"
  | "custom";

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  description?: string | undefined;
  error?: err.$ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}

// export type Types<O, I> = { output: O; input: (arg: I) => void };
export type Types<O, I> = { output: O; input: I };
export const BRAND: unique symbol = Symbol("zod_brand");
export type BRAND<T extends string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};

export interface $Zod<out O = unknown, out I = unknown> {
  // standard-schema
  "~standard": number;
  "~types": Types<this["_output"], this["_input"]>;

  /** @deprecated Internal API, use with caution (not deprecated) */
  _output: O;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _input: I;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _parse(
    input: unknown,
    ctx?: $ParseContext
  ): types.MaybeAsync<O | $ZodFailure>;
}

export interface $ZodType<out O = unknown, out I = unknown> extends $Zod<O, I> {
  /** @deprdecated Internal API, use with caution (not deprecated) */
  _typecheck(
    input: unknown,
    ctx?: $ParseContext
  ): types.MaybeAsync<O | $ZodFailure>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _refine(...refinements: $ZodCheck<O>[]): this;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _clone(def?: this["_def"]): this;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _traits: Set<string>;

  _def: $ZodTypeDef;
  _constr: new (def: any) => any;
  _computed?: object;

  brand<T extends PropertyKey>(): this & { _output: BRAND<T> };
}

export const $ZodType: $constructor<$ZodType> = $constructor(
  "$ZodType",
  (inst, def) => {
    // Object.assign(inst, def); // copy def into inst
    inst._def = def; // set _def property
    inst["~standard"] = 1; // set standard-schema version
    inst._computed = inst._computed || {}; // initialize _computed object

    inst._clone = (_def = def) => {
      return new inst._constr(_def);
    };

    inst._refine = (...checks: $ZodCheck[]) => {
      return inst._clone({
        ...inst._def,
        checks: [...(inst._def.checks || []), ...checks],
      });
    };
    inst.brand = () => inst as any;

    const checkEntries = [...(inst._def.checks || []).entries()];
    const noChecks = checkEntries.length === 0;

    inst._parse = (input, ctx) => {
      let fail!: $ZodFailure;
      const result = inst._typecheck(input, ctx);
      if (noChecks) return result;
      if (failed(result)) {
        fail = result;

        if (aborted(result)) {
          return result;
        }
      }

      const checkCtx = makeCheckCtx(input as never, ctx, fail);

      for (const [i, check] of checkEntries) {
        const _checkResult = check.run(checkCtx);
        if (_checkResult instanceof Promise) {
          const remainingChecks = inst._def.checks!.slice(i + 1);
          return _checkResult.then(async () => {
            for (const check of remainingChecks) {
              let result = check.run(checkCtx);
              if (result instanceof Promise) result = await result;
              if (checkCtx.fail && aborted(checkCtx.fail)) return checkCtx.fail;
            }
            return checkCtx.fail ?? checkCtx.input;
          });
        }
        if (checkCtx.fail && aborted(checkCtx.fail)) {
          return checkCtx.fail;
        }
      }
      return checkCtx.fail ?? checkCtx.input;
    };
  }
);

/////////////////////////////   PARSE   //////////////////////////////

type $ParsePathComponent = PropertyKey;
type $ParsePath = $ParsePathComponent[];
export interface $ParseContext {
  readonly path?: $ParsePath;
  readonly error?: err.$ZodErrorMap<never>;
}

export type $SyncParseResult<T = unknown> = T | $ZodFailure;
export type $AsyncParseResult<T = unknown> = Promise<$SyncParseResult<T>>;
export type $ParseResult<T> = $SyncParseResult<T> | $AsyncParseResult<T>;

/////////////////////////////   ZODFAILURE   //////////////////////////////

export type ErrorLevel = "error" | "abort";

export const FAILURE: symbol = Symbol.for("{{zod.failure}}");
export class $ZodFailure {
  protected "~tag": typeof FAILURE = FAILURE;
  issues: err.$ZodIssue[] = [];
  ctx?: $ParseContext | undefined;

  constructor(issues: err.$ZodIssue[], ctx: $ParseContext | undefined) {
    // super();
    this.issues = issues ?? [];
    this.ctx = ctx;
  }

  mergeIn(fail: $ZodFailure, ...path: PropertyKey[]): $ZodFailure {
    if (!fail || !fail.issues) return this;

    for (const iss of fail.issues) {
      if (fail.issues.length > 5) throw new Error("Too many issues");

      iss.path.unshift(...path);

      this.issues.push(iss);
    }
    return this;
  }

  static from(
    issueDatas: err.$ZodIssueData[],
    ctx: $ParseContext | undefined,
    schema: { error?: err.$ZodErrorMap<never> | undefined }
  ): $ZodFailure {
    return new $ZodFailure(
      issueDatas.map((iss) => makeIssue(iss, schema, ctx)),
      ctx
    );
  }

  static empty(ctx: $ParseContext | undefined): $ZodFailure {
    return new $ZodFailure([], ctx);
  }

  get level(): ErrorLevel | null {
    let level: ErrorLevel | null = null;
    for (const iss of this.issues) {
      if (iss.level === "abort") return "abort";
      if (iss.level === "error") {
        if (level === null) level = "error";
      }
    }
    return level;
  }

  addIssue(
    data: err.$ZodIssueData,
    schema?: { error?: err.$ZodErrorMap<never> | undefined }
  ): void {
    const iss = makeIssue(data, schema);
    this.issues.push(iss);
  }

  // @ts-ignore
  // static [hasInstance](inst: any) {
  //   return inst?.["~tag"] === FAILURE;
  // }
}

Object.defineProperty($ZodFailure, Symbol.hasInstance, {
  value: (inst: any) => inst?.["~tag"] === FAILURE,
});

export const makeIssue = (
  issueData: err.$ZodIssueData,
  schema?: { error?: err.$ZodErrorMap<never> | undefined },
  ctx?: $ParseContext
): err.$ZodIssue => {
  const fullPath = ctx?.path
    ? issueData.path
      ? [...ctx.path, ...issueData.path]
      : ctx.path
    : issueData.path
      ? issueData.path
      : [];

  const fullIssue = {
    ...issueData,
    level: issueData.level ?? "error",
    path: fullPath,
  };

  if (issueData.message) return fullIssue as err.$ZodIssue;
  const _message: any =
    schema?.error?.(fullIssue as never) ??
    ctx?.error?.(fullIssue as never) ??
    getConfig().error?.(fullIssue) ??
    defaultErrorMap(fullIssue);
  fullIssue.message = _message.message ?? _message;
  return fullIssue as err.$ZodIssue;
};

export function failed(x: $SyncParseResult<unknown>): x is $ZodFailure {
  return (x as any)?.["~tag"] === FAILURE;
}

export function aborted(x: $ZodFailure): x is $ZodFailure {
  return x.level === "abort";
}

export function succeeded<T>(x: any): x is T {
  return x?.["~tag"] !== FAILURE;
}

//////////////////////////////   ERROR MAPS   ///////////////////////////////////////

import defaultErrorMap from "./locales/en.js";
interface ZodConfig {
  error: err.$ZodErrorMap;
}

const globalZodConfig: ZodConfig = {
  error: defaultErrorMap,
};

export function configure(config: Partial<ZodConfig>): void {
  Object.assign(globalZodConfig, config);
}

export function getConfig(): ZodConfig {
  return globalZodConfig;
}

export { defaultErrorMap };

//////////////////////////////   CHECKS   ///////////////////////////////////////

export interface $ZodCheckCtx<out T> {
  input: T;
  fail?: $ZodFailure | undefined;
  addIssue(
    issue: err.$ZodIssueData,
    schema?: { error?: err.$ZodErrorMap<never> | undefined }
  ): void;
}

export interface $ZodCheckDef {
  check: string;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheck<
  in T = never,
  // out Def extends $ZodCheckDef = $ZodCheckDef,
> {
  _def: $ZodCheckDef;
  if?: null | ((err: $ZodFailure) => boolean);
  // return T or ZodFailure
  // T cannot occur in signature to maintain contravariance
  run(ctx: $ZodCheckCtx<T>): void | Promise<void>;

  // alternative signature
  run2?: (input: unknown, ctx: $ParseContext) => unknown | $ZodFailure;
}
export const $ZodCheck: $constructor<$ZodCheck> = $constructor(
  "$ZodCheck",
  (inst, def) => {
    // Object.assign(inst, def);
    inst._def = def;
  }
);

export function makeCheckCtx<T>(
  input: T,
  ctx: $ParseContext | undefined,
  fail: $ZodFailure | undefined
): $ZodCheckCtx<T> {
  if (fail) {
    const checkCtx: $ZodCheckCtx<T> = {
      input,
      fail,
      addIssue(iss, schema) {
        this.fail!.addIssue(iss, schema); //.bind(fail),
      },
    };
    return checkCtx;
  }

  const checkCtx: $ZodCheckCtx<T> = {
    input,
    addIssue(
      issue: err.$ZodIssueData,
      schema?: { error?: err.$ZodErrorMap<never> | undefined }
    ) {
      if (!checkCtx.fail) {
        const fail = new $ZodFailure([], ctx);
        // fail.addIssue(issue, schema);
        checkCtx.fail = fail;
        // return;
      }
      checkCtx.fail.addIssue(issue, schema);
    },
  };
  return checkCtx;
}

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
type Trait = { _def: unknown };
export interface $constructor<T extends Trait> {
  new (def: T["_def"]): T;
  init(inst: T, def: T["_def"]): void;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<
  T extends Trait,
  D = T["_def"],
>(name: string, initializer: (inst: T, def: D) => void): $constructor<T> {
  class _ {
    constructor(def: D) {
      _.init(this as any as T, def);
    }
    // @ts-ignore required for Rollup tree-shaking to work
    // static get name() {
    //   return name;
    // }
    // static name = name;
    static init(inst: T, def: D) {
      initializer(inst, def);
      (inst as any)._constr = _;
      (inst as any)._def = def;
      (inst as any)._traits ??= new Set();
      (inst as any)._traits.add(name);
    }
    static [Symbol.hasInstance](inst: any) {
      return inst._traits?.has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}
