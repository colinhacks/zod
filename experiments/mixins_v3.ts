// import type * as core from "./core";
import { CheckCtx, type ZodCheck } from "./checks.js";
import * as errors from "./errors.js";
import * as parse from "./parse.js";
import * as symbols from "./symbols.js";
import type * as zsf from "./zsf.js";

type $in<T> = (arg: T) => void;
type Infer<T extends $ZodType> = T["~output"];

export type input<T extends $ZodType> = Parameters<T["~input"]>[0];
export type output<T extends $ZodType> = T["~output"];
export type { Infer as infer };

export class ZodFail {
  protected "~tag": typeof symbols.FAILURE = symbols.FAILURE;
  issues: errors.ZodIssue[];
  ctx?: parse.ParseContext | undefined;

  constructor(issues?: errors.IssueData[], ctx?: parse.ParseContext) {
    this.issues = issues?.map((iss) => errors.makeIssue(iss, this.ctx)) || [];
    this.ctx = ctx;
  }
  status = "aborted" as const;
  report(data: errors.IssueData): void {
    this.issues.push(errors.makeIssue(data, this.ctx));
  }
}

export type ParseResultSync<T = unknown> = T | ZodFail;
export type ParseResultAsync<T> = Promise<ParseResultSync<T>>;
export type ParseResult<T> = ParseResultSync<T> | ParseResultAsync<T>;

////////////////////////////////////////////////
//////////        $ZodType        //////////////
////////////////////////////////////////////////

abstract class $ZodType<out O = unknown, in I = never> implements zsf.$ZSF {
  readonly $zod: { version: number } = { version: 4 };
  override readonly $zsf: { version: number } = { version: 0 };
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

class $ZodString<O extends string = string, I = never>
  extends $ZodType<O, I>
  implements zsf.$ZSFString
{
  override $zsf: { version: number };
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

////////////////////////////////////////////////
//////////        $ZSFNumber        ////////////
////////////////////////////////////////////////

function validateNumber(
  this: zsf.$ZSFNumber & $ZodType,
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

interface ZodNumberDef extends zsf.$ZSFNumber {}
class $ZodNumber extends $ZodType<number, number> implements zsf.$ZSFNumber {
  min: number;
  max: number;
  readonly type = "number" as const;

  override $zsf: { version: number };
  override "~output": number;
  override "~input": $in<unknown>;

  constructor(def: ZodNumberDef) {
    super(def);
  }

  "~validateType"(
    this: zsf.$ZSFNumber & $ZodType,
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
interface $ZSFUndefined extends zsf.$ZSF {
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

/////////////////////////////////////////////
//////////        $ZSFUnion        //////////
/////////////////////////////////////////////

function validateUnion(
  this: zsf.$ZSFUnion,
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
interface ZodNullableDef<T extends zsf.$ZSF = zsf.$ZSF>
  extends zsf.$ZSFUnion<[zsf.$ZSFNull, T]> {}
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
  override $zsf: { version: number };

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

class $ZodArray<Item extends $ZodType>
  extends $ZodType<output<Item>[], input<Item>[]>
  implements zsf.$ZSFArray
{
  type: "array";
  items: zsf.$ZSF[];
  rest: zsf.$ZSF | null;
  override $zsf: { version: number };
  constructor(def: zsf.$ZSFArray) {
    super(def);
  }
  "~validateType"(input: any[], ctx?: parse.ParseContext): ParseResult<any[]> {
    if (!Array.isArray(input)) {
      return new ZodFail(
        [
          {
            input,
            code: "invalid_type",
            expected: "array",
            received: parse.t(input),
          },
        ],
        ctx
      );
    }
    return input;
  }
}

/////////////////////////////////////////////
//////////        ZodType        ////////////
/////////////////////////////////////////////

type Mix<A extends $ZodType, B extends $ZodType> = A & B;
abstract class ZodType<O, I> extends $ZodType<O, I> {
  nullable(): ZodNullable<this> {
    return this as any;
  }
}

interface ZodString<O extends string, I>
  extends Mix<$ZodString<O, I>, ZodType<O, I>> {}
class ZodString<O = string, I = never> {}
