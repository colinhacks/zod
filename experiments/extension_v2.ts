import type { ZodCheck } from "./checks.js";
import type { ZodErrorMap } from "./errors.js";
import type { ParseContext, ParseInput, ParseReturnType } from "./parse.js";

type inputFunc<T> = (arg: T) => any;

export const InnerDynamicBase = class {
  constructor(properties: object) {
    Object.assign(this, properties);
  }
} as new <t extends object>(
  base: t
) => t;

/** @ts-expect-error (needed to extend `t`, but safe given ShallowClone's implementation) **/
export class DynamicBase<T extends object> extends InnerDynamicBase<T> {}

export interface $ZodTypeDef {
  checks: ZodCheck<any>[];
  readonly description?: string;
  readonly errorMap?: ZodErrorMap;
}
export interface $ZodType extends $ZodTypeDef {}
type Empty = Record<never, unknown>;
export abstract class $ZodType<
  out Output = unknown,
  in Input = never,
  Ext extends object & ThisType<$ZodType> = Empty,
> extends DynamicBase<Ext> {
  readonly class: Set<symbol> = new Set();

  readonly "~output"!: Output;
  readonly "~input": inputFunc<Input>;

  abstract "~parse"(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<Output>;

  static "~def": $ZodTypeDef;
  public constructor(def: $ZodTypeDef & Ext) {
    super(def);
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
}

export interface $ZodStringDef extends $ZodTypeDef {
  coerce: true;
}

export class $ZodString<Ext extends {}> extends $ZodType<string, unknown, Ext> {
  public constructor(def: $ZodStringDef & Ext) {
    super(def);
  }
  "~parse"(data: unknown): this["~output"] {
    return "asdf";
  }
}

// type $input<T> = { "~input": inputFunc<T> };
// declare const str: $ZodString & $input<
