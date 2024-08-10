import type { CheckCtx, ZodCheck } from "./checks.js";
import type { ZodErrorMap } from "./errors.js";
import type { ParseContext, ParseInput, ParseReturnType } from "./parse.js";
import type * as types from "./types.js";

import * as parse from "./parse.js";

type inputFunc<T> = (arg: T) => any;

const sym: unique symbol = Symbol.for("$ZodType");

export interface $ZodTypeDef {
  checks: ZodCheck<any>[];
  readonly description?: string;
  readonly errorMap?: ZodErrorMap;
}
export interface $ZodType extends $ZodTypeDef {}
export abstract class $ZodType<out Output = unknown, in Input = never> {
  readonly class: Set<symbol> = new Set();

  readonly "~output"!: Output;
  readonly "~input": inputFunc<Input>;

  readonly "~omit": string;
  abstract "~parse"(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<Output>;

  static "~def": $Def<$ZodType>;
  public constructor(def: $ZodTypeDef) {
    Object.assign(this, def);
  }

  "~clone"(this: any): this {
    const def: any = {};
    for (const key of Reflect.ownKeys(this)) {
      if (typeof this[key] !== "function") def[key] = this[key];
    }
    return new this.constructor(def);
  }

  "~check"(check: ZodCheck<this["~output"]>): this {
    const clone = this["~clone"]();
    clone.checks = [...(clone.checks || []), check];
    return clone;
  }

  "~runChecks"(ctx: CheckCtx<Output>): void | Promise<void> {
    // const checkCtx: CheckCtx<Output> = {
    //   addIssue: (arg: err.IssueData) => {
    //     issues.push(arg);
    //   },
    //   report: "asdf" as any,
    //   input,
    // };
    let acc: Promise<void> | undefined;

    for (const [i, check] of this.checks.entries()) {
      const result = check.run(ctx);
      if (result instanceof Promise) {
        return result.then(async (result) => {
          // iterate over
          for (const [j, check] of this.checks.slice(i).entries()) {
            const result = check.run(ctx);
            if (result instanceof Promise) await result;
            if (ctx.aborted) return;
          }
        });
      }
      // do stuff

      // const result = acc ? acc.then(() => check.run(ctx)) : check.run(ctx);

      // if(ctx.aborted) return
      // const executeCheck = (acc: unknown): any => {
      //   check.run(ctx);
      //   const result = check.run(ctx);
      //   if (result instanceof Promise) {
      //     return result;
      //   }
      //   return acc;
      // };

      // const inner = this.schema["~parse"](input, ctx);

      if (!(inner instanceof Promise)) {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        const value = parse.isAborted(inner)
          ? inner.value !== symbols.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;
        // else, check parse.ZodFailure for `.value` (set after transforms)
        // then fall back to original input
        if (issues.some((i) => i.fatal)) {
          return new parse.ZodFailure(issues, value);
        }

        // return value is ignored
        const executed = executeCheck(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new parse.ZodFailure(issues, inner);
            return inner;
          }) as any;
        }

        if (issues.length) return new parse.ZodFailure(issues, inner);
        return inner as any;
      }
      return inner.then((inner) => {
        if (parse.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        if (issues.some((i) => i.fatal)) {
          return new parse.ZodFailure(issues, inner);
        }

        const value = parse.isAborted(inner)
          ? inner.value !== symbols.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;

        const executed = executeCheck(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new parse.ZodFailure(issues, inner);
            return inner;
          });
        }

        if (issues.length) return new parse.ZodFailure(issues, inner);
        return inner;
      });
    }
  }
}

export interface $ZodStringDef extends $ZodTypeDef {
  coerce: true;
}

export interface $ZodString extends $ZodStringDef {}
export class $ZodString extends $ZodType<string, unknown> {
  public constructor(def: $ZodStringDef) {
    super(def);
    // Object.ass/ign(this, def);
  }
  "~parse"(data: unknown): this["~output"] {
    return "asdf";
  }
}

type Infer<T extends $ZodType> = T["~output"];
export type input<T extends $ZodType> = T["~input"];
export type output<T extends $ZodType> = T["~output"];
export type { Infer as infer };

export type $Def<
  T extends $ZodType = $ZodType,
  // K extends keyof T = OmitString<keyof T, `~${string}` | `_${string}`>,
> = Omit<
  types.PickProps<
    Pick<T, types.OmitString<keyof T, `~${string}` | `_${string}`>>
  >,
  string extends T["~omit"] ? never : T["~omit"]
>; //{ [k in keyof T]: T[k] };
