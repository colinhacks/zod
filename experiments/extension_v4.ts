// import type * as core from "./core";
import { CheckCtx, type ZodCheck } from "./checks.js";
import * as errors from "./errors.js";
import * as parse from "./parse.js";
import * as symbols from "./symbols.js";

type $in<T> = (arg: T) => void;
type Infer<T extends $ZodType> = T["~output"];

export type input<T extends $ZodType> = Parameters<T["~input"]>[0];
export type output<T extends $ZodType> = T["~output"];
export type { Infer as infer };

export class ZodFail {
  protected "~tag": typeof symbols.FAILURE = symbols.FAILURE;
  issues: errors.ZodIssue[];
  ctx?: parse.ParseContext;

  constructor(issues?: errors.IssueData[], ctx?: parse.ParseContext) {
    this.issues = issues?.map((iss) => errors.makeIssue(iss, this.ctx)) || [];
    this.ctx = ctx;
  }
  status = "aborted" as const;
  report(data: errors.IssueData) {
    this.issues.push(errors.makeIssue(data, this.ctx));
  }
}

export type ParseResultSync<T = unknown> = T | ZodFail;
export type ParseResultAsync<T> = Promise<ParseResultSync<T>>;
export type ParseResult<T> = ParseResultSync<T> | ParseResultAsync<T>;

////////////////////////////////////////////////
//////////        $ZodType        //////////////
////////////////////////////////////////////////
// type ID<T> = T;
// interface $ZodType {
//   $zod: {
//     version: number;
//   };
//   "~output": unknown;
//   "~input": (input: never) => void;
//   "~parse"(input: unknown, ...args: unknown[]): ParseResult<this["~output"]>;
// }
interface $ZSF {
  $zsf: {
    version: number;
  };
  type: string;
}

// const arg: $ZodType = {
//   $zod: {
//     version: 4,
//   },
//   "~output": "asdf",
//   "~input": (input: never) => {},
//   "~parse"(input: unknown, ...args: unknown[]): ParseResult<unknown> {
//     return "asdf";
//   },
// }

abstract class $ZodType<out O = unknown, in I = never> implements $ZSF {
  readonly $zod: { version: number } = { version: 4 };
  readonly $zsf: { version: number } = { version: 0 };
  type: string;

  "~output": O;
  "~input": $in<I>;
  "~checks"?: ZodCheck<never>[];
  "~parse"(input: O, ctx: parse.ParseContext): ParseResult<O> {
    this["~validateType"](input, ctx);
    return "sdf" as any;
  }

  abstract "~validateType"(input: O, ctx?: parse.ParseContext): ParseResult<O>;
  "~runChecks"(input: O, ctx: parse.ParseContext): ParseResult<O> {
    if (!this["~checks"]) return input;
    const checkCtx = new CheckCtx(input, [], ctx);
    const result = input;
    for (const check of this["~checks"]) {
      // check.run(checkCtx);
    }
    return "asd" as any;
  }
  constructor(def: object) {
    Object.assign(def);
  }
}

////////////////////////////////////////////////
//////////        $ZSFString        ////////////
////////////////////////////////////////////////
interface $ZSFString extends $ZSF {
  type: "string";
}

class $ZodString<O extends string = string, I = never>
  extends $ZodType<O, I>
  implements $ZSFString
{
  $zsf: { version: number };
  readonly type = "string" as const;
  readonly $schema: "zsf";
  override "~output": O;
  override "~input": $in<I>;
  override "~validateType"(
    input: unknown,
    ctx?: parse.ParseContext
  ): ParseResult<O> {
    if (typeof input !== "string") {
      return new ZodFail(
        [
          {
            input,
            code: errors.ZodIssueCode.invalid_type,
            expected: parse.ZodParsedType.string,
            received: parse.t(input),
          },
        ],
        ctx
      );
    }
    return input as O;
  }
}

interface ZodType<O, I> extends $ZodType<O, I> {
  nullable(): ZodNullable<this>;
}

interface ZodType<O, I> extends $ZodType<O, I> {}

type InClass = new (...args: any) => $ZodType;
// type Decorate<T extends inClass> = {

// }
function decorate<T extends InClass>(Base: T): T {
  return class ZodType extends Base {
    nullable(): ZodNullable<this> {
      return this as any;
    }
    declare "~validateType": any;
  };
}

// function decorate(cls: )

// type Decorate<T extends $ZodType> = T & ZodType<T["~output"], T["~input"]>;
type aa = $ZodString["~validateType"];
type bb = Decorate<$ZodString>["~validateType"];

// @ts-ignore
interface Decorate<T extends $ZodType> extends T {
  nullable(): ZodNullable<this>;
}

interface ZodString<O extends string, I> extends Decorate<$ZodString<O, I>> {}
class ZodString<O = string, I = never> {}

Object.setPrototypeOf(ZodString.prototype, decorate($ZodString).prototype);
declare const str3: ZodString & { "~output": never };
str3;

// str3.nullable();

const nstr3 = str3.nullable();

////////////////////////////////////////////////
//////////        $ZSFNumber        ////////////
////////////////////////////////////////////////
interface $ZSFNumber extends $ZSF {
  type: "number";
  min: number;
  max: number;
}
function validateNumber(
  this: $ZSFNumber & $ZodType,
  input: unknown,
  ctx?: parse.ParseContext
): ParseResult<number> {
  if (typeof input !== "number") {
    return new ZodFail(
      [
        {
          input,
          code: "invalid_type",
          expected: "string",
          received: parse.t(input),
        },
      ],
      ctx
    );
  }
  return input;
}

interface ZodNumberDef extends $ZSFNumber {}
class $ZodNumber extends $ZodType<number, number> implements $ZSFNumber {
  min: number;
  max: number;
  readonly type = "number" as const;
  readonly $schema = "zsf" as const;
  override "~output": number;
  override "~input": $in<unknown>;
  override "~validateType" = validateNumber.bind(this);
  constructor(def: ZodNumberDef) {
    super(def);
  }
  $zsf: { version: number };
}

/////////////////////////////////////////////////
//////////        $ZSFUndefined        //////////
/////////////////////////////////////////////////
function validateUndefined(
  this: $ZSFUndefined,
  input: unknown,
  ctx?: parse.ParseContext
): ParseResult<undefined> {
  if (input !== undefined) {
    return new ZodFail(
      [
        {
          input,
          code: "invalid_type",
          expected: "undefined",
          received: parse.t(input),
        },
      ],
      ctx
    );
  }
  return input as any;
}
interface $ZSFUndefined extends $ZSF {
  type: "undefined";
}

////////////////////////////////////////////
//////////        $ZSFNull        //////////
////////////////////////////////////////////
function validateNull(
  this: $ZSFNull & $ZodType,
  input: unknown,
  ctx?: parse.ParseContext
): ParseResult<null> {
  if (input !== null) {
    return new ZodFail(
      [
        {
          input,
          code: "invalid_type",
          expected: "null",
          received: parse.t(input),
        },
      ],
      ctx
    );
  }
  return input as any;
}
interface $ZSFNull extends $ZSF {
  type: "null";
}

/////////////////////////////////////////////
//////////        $ZSFUnion        //////////
/////////////////////////////////////////////
interface $ZSFUnion<Elements extends $ZSF[] = $ZSF[]> extends $ZSF {
  type: "union";
  elements: Elements;
}
function validateUnion(
  this: $ZSFUnion,
  input: unknown,
  ctx?: parse.ParseContext
): ParseResult<unknown> {
  for (const el of this.elements) {
    const result = el["~parse"](input, ctx);
    if (!(result instanceof ZodFail)) return result;
  }
  return new ZodFail([
    {
      input,
      code: "invalid_union",
      unionErrors: this.elements.map((el) => el["~parse"](input, ctx)),
    },
  ]);
}

////////////////////////////////////////////////
//////////        $ZodNullable        //////////
////////////////////////////////////////////////
interface ZodNullableDef<T extends $ZSF = $ZSF>
  extends $ZSFUnion<[$ZSFNull, T]> {}
function validateNullable(
  this: ZodNullableDef & $ZodType,
  input: unknown,
  ctx?: parse.ParseContext
): ParseResult<unknown> {
  if (input === null) return input;
}
class ZodNullable<T extends $ZodType>
  extends $ZodType<output<T> | null, input<T> | null>
  implements ZodNullableDef
{
  type: "union";
  elements: ZodNullableDef["elements"]; // = [{  type: "null" }, T];
  constructor(def: ZodNullableDef) {
    super(def);

    // this.elements = [{$zsf: true, type: "null"}, def.elements];
  }
  $zsf: { version: number };

  "~validateType"(
    input: unknown,
    ctx?: parse.ParseContext
  ): ParseResult<unknown> {
    if (input === null) return input;
    return;
  }
}

/////////////////////////////////////////////
//////////        $ZodArray        //////////
/////////////////////////////////////////////
interface $ZSFArray extends $ZSF {
  type: "array";
  items: $ZSF[];
  rest: $ZSF | null;
}

interface Base {
  a: string;
  b: number;
}

interface Base {
  optional(): any;
}
interface Base {
  /** @deprecated @internal */
  optional(): this;
}

declare const base: Base;
base.optional();
