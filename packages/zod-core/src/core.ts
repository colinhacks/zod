import type * as checks from "./checks.js";
import type * as errors from "./errors.js";
import * as parse from "./parse.js";
import type * as types from "./types.js";
import type * as zsf from "./zsf.js";

export type input<T extends $ZodType<unknown, never>> = T["~input"];
export type output<T extends $ZodType<unknown, never>> = T["~output"];
export type {
  output as infer,
  /** @deprecated Use z.output<typeof schema> instead */
  output as Infer,
};

// @ts-expect-error
export interface Dynamic<T extends object> extends T {}
export class Dynamic<T extends object> {
  constructor() {
    // Object.assign(this, properties);
  }
}

type NonConstructorKeys = "output" | "input" | "$zod" | "$zsf";
export type $Def<
  T extends object,
  AlsoOmit extends string = never,
> = types.PickProps<Omit<T, `_${string}` | NonConstructorKeys | AlsoOmit>>;

export function $makeCheckCtx<T>(
  input: T,
  ctx?: parse.ParseContext,
  fail?: parse.$ZodFailure
): checks.$CheckCtx<T> {
  return fail
    ? {
        input,
        fail,
        addIssue: fail.addIssue.bind(fail),
      }
    : {
        input,
        addIssue(
          issue: errors.$ZodIssueData,
          schema?: { error?: errors.$ZodErrorMap<never> | undefined }
        ) {
          if (!this.fail) {
            const fail = new parse.$ZodFailure([], ctx);
            this.fail = fail;
            this.addIssue = this.fail.addIssue.bind(fail);
          }
          this.addIssue(issue, schema);
        },
      };
}

type $contravar<T> = (arg: T) => void;
type $covar<T> = T extends (arg: infer I) => void ? I : never;

interface Parse<O> {
  (input: unknown, ctx?: parse.ParseContext): O | Promise<O>;

  sync(input: unknown, ctx?: parse.ParseContext): O;
  async(input: unknown, ctx?: parse.ParseContext): Promise<O>;
  safe(input: unknown, ctx?: parse.ParseContext): O | parse.$ZodFailure;
  safeAsync(
    input: unknown,
    ctx?: parse.ParseContext
  ): Promise<O | parse.$ZodFailure>;

  /** @deprecated */ bind: Function["bind"];
  /** @deprecated */ call: Function["call"];
  /** @deprecated */ caller: Function["caller"];
  /** @deprecated */ apply: Function["apply"];
  /** @deprecated */ arguments: Function["arguments"];
  /** @deprecated */ length: Function["length"];
  /** @deprecated */ name: Function["name"];
  /** @deprecated */ toString: Function["toString"];
  /** @deprecated */ prototype: Function["prototype"];
  /** @deprecated */ Symbol: unknown;
}

const _parse: Parse<any> = function (
  this: $ZodType<unknown, never>,
  input: unknown,
  ctx?: parse.ParseContext
) {
  const result = this._parse(input, ctx);
  if (parse.failed(result)) throw result;
  return result;
} as any;

export type $ZodVirtuals = {
  "~async": boolean;
  "~meta": unknown;
};

export interface $ZodTypeDef {
  readonly description?: string | undefined;
  readonly error?: errors.$ZodErrorMap<never> | undefined;
  checks: checks.$ZodCheck<never, unknown>[];
}

export abstract class $ZodType<
    out O,
    in I,
    out D extends $ZodTypeDef = $ZodTypeDef,
    V extends $ZodVirtuals = $ZodVirtuals,
  >
  extends Dynamic<D & V> // sets defaults
  implements zsf.$ZSF
{
  "~output": O;
  "~input": $contravar<I>;
  "~def": D;
  $zod: { version: number } = { version: 4 };
  $zsf: { version: number } = { version: 0 };
  override checks: checks.$ZodCheck<never, this["~output"]>[] = [];
  // readonly description?: string | undefined;
  // readonly error?: errors.$ZodErrorMap<never> | undefined;
  abstract type: string;

  constructor(def: D) {
    super();
    this["~def"] = def;
    Object.assign(this, def);
    // if (!this.checks.length) this._parse = this._typeCheck;
  }

  // parse: Parse<O> (input: unknown, ctx?: parse.ParseContext): this["~output"] {
  //   const result = this._parse(input, ctx);
  //   if (parse.failed(result)) throw result;
  //   return result;
  // }

  /** @deprecated Internal API, use with caution. */
  _parse(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const result = this._typeCheck(input, ctx);
    if (!this.checks.length) return result;
    if (parse.failed(result)) {
      if (parse.aborted(result)) return result;
      return this._runChecks(input, ctx, result);
    }

    return this._runChecks(input, ctx);
  }

  /** @deprecated Internal API, use with caution. */
  abstract _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]>;

  _runCheck(
    check: checks.$ZodCheck<never, this["~output"]>,
    input: unknown,
    ctx?: parse.ParseContext,
    fail?: parse.$ZodFailure
  ): parse.ParseReturnType<this["~output"]> {
    const checkCtx = $makeCheckCtx<any>(input, ctx);
    check.run(checkCtx);
    return checkCtx.fail ?? (checkCtx.input as this["~output"]);
  }

  /** @deprecated Internal API, use with caution. */
  _runChecks(
    input: unknown,
    ctx?: parse.ParseContext,
    fail?: parse.$ZodFailure,
    checks?: checks.$ZodCheck<never, this["~output"]>[]
  ): parse.ParseReturnType<this["~output"]> {
    console.log("_checks::fail", fail);
    const checkCtx = $makeCheckCtx<any>(input as any, ctx, fail);

    for (const check of checks || this.checks) {
      check.run(checkCtx);
      if (checkCtx.fail && checkCtx.fail.level === "abort")
        return checkCtx.fail;
    }

    return checkCtx.fail ?? (checkCtx.input as this["~output"]);
  }

  /** @deprecated Internal API, use with caution. */
  _clone(this: any): this {
    // const def: any = {};
    // for (const key of Reflect.ownKeys(this)) {
    //   if (typeof this[key] !== "function") def[key] = this[key];
    // }
    return new this.constructor(this["~def"]);
  }

  /** @deprecated Internal API, use with caution. */
  _addCheck(check: checks.$ZodCheck<never, this["~output"]>): this {
    const clone = this._clone();
    clone.checks = [...(clone.checks || []), check];
    return clone;
  }
}
