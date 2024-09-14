import type { ZodCheck } from "../checks.js";
import type { ZodErrorMap } from "./errors_old.js";
import type * as parse from "../parse.js";
import type * as types from "../types.js";

export type $Def<
  T extends $ZodType,
  // K extends keyof T = OmitString<keyof T, `~${string}` | `_${string}`>,
> = Omit<
  types.PickProps<
    Pick<T, types.OmitString<keyof T, `~${string}` | `_${string}`>>
  >,
  string extends T["~omit"] ? never : T["~omit"]
>;

type inputFunc<T> = (arg: T) => any;

function bindAll(inst: any) {
  for (const key of Object.keys(inst)) {
    if (typeof inst[key] === "function") {
      inst[key] = inst[key].bind(inst);
    }
  }
  return inst;
}

const $virtuals = {} as { "~output": any; "~input": never; "~omit": string };

export interface $ZodType<out Output = unknown, in Input = never> {
  // typeName: string;
  "zod.core": true;
  checks: ZodCheck<never>[];
  errorMap?: ZodErrorMap;
  description?: string;
  readonly "~output": Output;
  readonly "~input": inputFunc<Input>;
  readonly "~omit": string;
  "~parse"(
    input: parse.ParseInput,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<Output>;
  "~clone"(this: any): this;
  "~check"(check: ZodCheck<this["~output"]>): this;
}

function $ZodType<T extends $ZodType>(def: $Def<$ZodType>): T {
  return {
    ...$virtuals,
    "zod.core": true,
    "~parse"() {
      throw new Error("not implemented");
    },
    "~clone"(this: any): T {
      const def: any = {};
      for (const key of Reflect.ownKeys(this)) {
        if (typeof this[key] !== "function") def[key] = this[key];
      }
      return new this.constructor(def);
    },
    "~check"(check: ZodCheck<T["~output"]>): T {
      const clone = this["~clone"]();
      clone.checks = [...(clone.checks || []), check];
      return clone;
    },
    checks: [],
  } satisfies $ZodType as any;
}

export interface $ZodString extends $ZodType<string, string> {
  "zod.core.string": true;
  coerce: boolean;
  "~parse"(
    input: parse.ParseInput,
    _ctx?: parse.ParseContext
  ): parse.ParseReturnType<string>;
}

export function $ZodString<T extends $ZodString>(def: $Def<$ZodString>): T {
  return {
    ...$virtuals,
    ...def,
    ...$ZodType<T>(def),
    "zod.core.string": true,
  } satisfies $ZodString;
}

export interface ZodType<Output = unknown, Input = never>
  extends $ZodType<Output, Input> {
  optional(params?: CreateParams): ZodOptional<this>;
}

export function ZodType<T extends ZodType>(def: $Def<ZodType>): T {
  return {
    ...$virtuals,
    ...$ZodType<T>(def),
    optional(this: T, params): ZodOptional<T> {
      return optional(this, params);
    },
  } satisfies ZodType;
}

export interface ZodString extends $ZodString, ZodType<string, string> {
  "zod.string": true;
  min(min: number): this;
}

export function ZodString<T extends ZodString>(def: $Def<ZodString>): T {
  return {
    ...$virtuals,
    ...$ZodString<T>(def),
    ...ZodType<T>(def),
    "zod.string": true,
    min(this: T, min: number): T {
      return this;
    },
  } satisfies ZodString;
}

export interface ZodOptional<T extends ZodType = ZodType>
  extends ZodType<T["~output"] | undefined, T["~input"] | undefined> {
  "zod.optional": true;
  inner: T;
}

type CreateParams = { message: string };

function string(params: { message: string }): ZodString {
  const schema = ZodString<ZodString>({
    checks: [],
    coerce: false,
    "zod.core": true,
    "zod.core.string": true,
    "zod.string": true,
  });
  return bindAll(schema);
}

function optional<T extends ZodType>(
  inner: T,
  params: CreateParams
): ZodOptional<T> {
  const schema = {
    // ...def,
    typeName: "zod.optional",
    // "zod.optional": true,
    errorMap: () => params,
    checks: [],
    inner,
    "~parse": (input: parse.ParseInput, _ctx?: parse.ParseContext) => {
      return "asdf";
    },
    ...$virtuals,
    ...$ZodType<ZodOptional<T>>(),
    ...ZodTypeBase<ZodOptional<T>>(),
  } satisfies ZodOptional<T>;
  return bindAll(schema);
}

// const str = new $ZodString({
//   typeName: "zod.core.string",
//   coerce: false,
//   checks: [],
// });

// console.log(str["~parse"]("colin"));

const str2 = string({ message: "sup" });
console.log(str2["~parse"]("colin"));
