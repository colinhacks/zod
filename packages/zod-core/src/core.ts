import type * as checks from "./checks.js";
import type * as errors from "./errors.js";
import type * as parse from "./parse.js";
import type * as types from "./types.js";
import type * as zsf from "./zsf.js";

export type input<T extends $ZodType> = T["input"];
export type output<T extends $ZodType> = T["output"];
export type {
  output as infer,
  /** @deprecated Use z.output<typeof schema> instead */
  output as Infer,
};

// @ts-expect-error
export interface Dynamic<T extends object> extends T {}
export class Dynamic<T extends object> {
  // constructor(properties: object) {
  //   Object.assign(this, properties);
  // }
}

export interface $ZodVirtuals {
  output: unknown;
  input: unknown;
  async: boolean;
  meta: unknown;
}

export interface $ZodTypeDef {
  type: string;
  readonly description?: string;
  readonly errorMap?: errors.ZodErrorMap;
}

type NonConstructorKeys = "output" | "input" | "$zod" | "$zsf";
export type $Def<
  T extends object,
  AlsoOmit extends string = never,
> = types.PickProps<Omit<T, `_${string}` | NonConstructorKeys | AlsoOmit>>;

export interface $ZodType extends $ZodTypeDef {}
export abstract class $ZodType<T extends Partial<$ZodVirtuals> = $ZodVirtuals>
  extends Dynamic<$ZodVirtuals & T>
  implements zsf.$ZSF
{
  $zod: { version: number } = { version: 4 };
  $zsf: { version: number } = { version: 0 };
  checks: checks.$ZodCheck<this["input"]>[] = [];

  constructor(def: $ZodTypeDef) {
    super();
    Object.assign(this, def);
  }

  _parse(
    input: parse.ParseInput,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["output"]> {
    // run validateType
    // run checks
    return {};
  }

  /** @deprecated Internal API, use with caution. (Not deprecated.) */
  _runChecks(input: unknown, fail?: parse.ZodFailure): void | Promise<void> {
    let acc: Promise<void> | undefined;
  }

  /** @deprecated Internal API, use with caution. (Not deprecated.) */
  _validateType(input: unknown, fail?: parse.ZodFailure): void | Promise<void> {
    let acc: Promise<void> | undefined;
  }

  /** @deprecated Internal API, use with caution. (Not deprecated.) */
  _clone(this: any): this {
    const def: any = {};
    for (const key of Reflect.ownKeys(this)) {
      if (typeof this[key] !== "function") def[key] = this[key];
    }
    return new this.constructor(def);
  }

  /** @deprecated Internal API, use with caution. (Not deprecated.) */
  _addCheck(check: checks.$ZodCheck<this["input"]>): this {
    const clone = this._clone();
    clone.checks = [...(clone.checks || []), check];
    return clone;
  }
}
