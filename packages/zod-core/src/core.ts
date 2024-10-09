import type * as err from "./errors_v2.js";
import * as symbols from "./symbols.js";
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
  | "never"
  | "any"
  | "unknown"
  | "void"
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
  | "custom"
  | "nullable"
  | "optional"
  | "preprocess"
  | "transform"
  | "default"
  | "catch"
  | "nan"
  | "branded"
  | "pipeline"
  | "readonly"
  | "template_literal";

// const asdf = {
//   string: true,
//   number: true,
//   boolean: true,
//   bigint: true,
//   symbol: true,
//   null: true,
//   undefined: true,
//   never: true,
//   any: true,
//   unknown: true,
//   void: true,
//   date: true,
//   object: true,
//   record: true,
//   file: true,
//   array: true,
//   tuple: true,
//   union: true,
//   intersection: true,
//   map: true,
//   set: true,
//   enum: true,
//   literal: true,
//   custom: true,
//   nullable: true,
//   optional: true,
//   preprocess: true,
//   transform: true,
//   default: true,
//   catch: true,
//   nan: true,
//   branded: true,
//   pipeline: true,
//   readonly: true,
// };

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  description?: string | undefined;
  error?: err.$ZodErrorMap | undefined;
  checks?: $ZodCheck<never>[];
}

// export type Types<O, I> = { output: O; input: (arg: I) => void };
export type Types<O, I> = { output: O; input: I };
export const BRAND: unique symbol = Symbol("zod_brand");
export type BRAND<T extends string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};
// @ts-expect-error
export interface $ZodType<out O = unknown, out I = unknown, out D extends $ZodTypeDef = $ZodTypeDef> extends D {
  // standard-schema
  "~standard": number;
  "~types": Types<O, I>;
  // checks?: $ZodCheck<never>[];

  /** @deprecated Internal API, use with caution (not deprecated) */
  _output: O;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _input: I;
  // /** @deprecated Internal API, use with caution (not deprecated) */
  // _computed?: object;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _parse(input: unknown, ctx?: $ParseContext): types.MaybeAsync<O | $ZodFailure>;
  /** @deprdecated Internal API, use with caution (not deprecated) */
  _typecheck(input: unknown, ctx?: $ParseContext): types.MaybeAsync<O | $ZodFailure>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _refine(...refinements: $ZodCheck<O>[]): this;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _clone(): this;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _traits: Set<string>;

  _def: D;
  _constr: new (def: any) => any;
  _computed?: object;

  brand<T extends PropertyKey>(): this & { _output: BRAND<T> };
}

export const $ZodType: $constructor<$ZodType, $ZodTypeDef> = $constructor("$ZodType", (inst, def) => {
  Object.assign(inst, def); // copy def into inst
  inst["~standard"] = 1; // set standard-schema version
  inst._computed = inst._computed || {}; // initialize _computed object

  inst._clone = () => new inst._constr(inst._def);

  inst._refine = (...checks: $ZodCheck[]) => {
    const clone = inst._clone();
    clone.checks = [...(inst.checks || []), ...checks];
    return clone;
  };

  const checkEntries = (inst.checks || []).entries();

  inst._parse = (input, ctx) => {
    let fail!: $ZodFailure;
    const result = inst._typecheck(input, ctx);
    if (!inst.checks) return result;
    if (failed(result)) {
      fail = result;

      if (aborted(result)) {
        return result;
      }
    }

    const checkCtx = makeCheckCtx(input as never, ctx, fail);

    for (const [i, check] of checkEntries) {
      check.run(checkCtx);
      if (checkCtx instanceof Promise) {
        const remainingChecks = inst.checks.slice(i + 1);
        return checkCtx.then(async () => {
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
});

/////////////////////////////   PARSE   //////////////////////////////

type $ParsePathComponent = PropertyKey;
type $ParsePath = $ParsePathComponent[];
export interface $ParseContext {
  readonly path?: $ParsePath;
  readonly error?: err.$ZodErrorMap<never>;
  // readonly contextualErrorMap?: err.$ZodErrorMap;
  // readonly schemaErrorMap?: err.$ZodErrorMap;
}

export type $SyncParseResult<T = unknown> = T | $ZodFailure;
export type $AsyncParseResult<T> = Promise<$SyncParseResult<T>>;
export type $ParseResult<T> = $SyncParseResult<T> | $AsyncParseResult<T>;

/////////////////////////////   ZODFAILURE   //////////////////////////////

export type ErrorLevel = "error" | "abort";

export class $ZodFailure {
  protected "~tag": typeof symbols.FAILURE = symbols.FAILURE;
  issues: err.$ZodIssue[] = [];
  ctx?: $ParseContext | undefined;

  constructor(issues?: err.$ZodIssue[], ctx?: $ParseContext) {
    this.issues = issues ?? [];
    this.ctx = ctx;
  }

  mergeIn(fail: $ZodFailure, ...path: PropertyKey[]): $ZodFailure {
    console.log(`MERGEIN`);
    console.log(this);
    if (!fail || !fail.issues) return this;
    console.log(`mering ${fail.issues.length} issues`);
    for (const iss of fail.issues) {
      if (fail.issues.length > 5) throw new Error("Too many issues");

      iss.path.unshift(...path);
      console.log(this.issues);
      console.log(`pushing issue: ${iss}`);
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
    return new $ZodFailure(undefined, ctx);
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

  addIssue(data: err.$ZodIssueData, schema?: { error?: err.$ZodErrorMap<never> | undefined }): void {
    const iss = makeIssue(data, schema);
    this.issues.push(iss);
  }

  // @ts-ignore
  static [hasInstance as "string"](inst: any) {
    return inst?.["~tag"] === symbols.FAILURE;
  }
}

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
  return (x as any)?.["~tag"] === symbols.FAILURE;
}

export function aborted(x: $ZodFailure): x is $ZodFailure {
  return x.level === "abort";
}

export function succeeded<T>(x: any): x is T {
  return x?.["~tag"] !== symbols.FAILURE;
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
  addIssue(issue: err.$ZodIssueData, schema?: { error?: err.$ZodErrorMap<never> | undefined }): void;
}

export interface $ZodCheckDef {
  check: string;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheck<in T = never, out Def extends $ZodCheckDef = $ZodCheckDef> extends $Dynamic<Def> {
  if?: null | ((err: $ZodFailure) => boolean);
  // return T or ZodFailure
  // T cannot occur in signature to maintain contravariance
  run(ctx: $ZodCheckCtx<T>): void | Promise<void>;

  // alternative signature
  // abstract run2: (ctx: I) => O | $ZodFailure;
}
export const $ZodCheck: $constructor<$ZodCheck, $ZodCheckDef> = $constructor("$ZodCheck", (inst, def) => {
  inst.ch;
});

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
    addIssue(issue: err.$ZodIssueData, schema?: { error?: err.$ZodErrorMap<never> | undefined }) {
      console.log(`addissue!`);
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

export interface $constructor<T extends $ZodType, D extends $ZodTypeDef> {
  new (def: D): T;
  init(inst: T, def: D): void;
}

export function $constructor<T extends $ZodType, D extends $ZodTypeDef>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T, D> {
  const hi: string = Symbol.hasInstance as any;
  return class X {
    constructor(def: D) {
      initializer(this as any as T, def);
    }
    static init(inst: T, def: D): void {
      initializer(inst, def);
      inst._constr = X;
      inst._def = def;
      inst._traits ??= new Set();
      inst._traits.add(name);
    }
    static [hi](inst: any) {
      return inst._traits?.has(name);
    }
  } as any;
}
