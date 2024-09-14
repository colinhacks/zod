import type * as checks from "./checks.js";
import * as core from "./core.js";
import type * as err from "./errors.js";
import * as parse from "./parse.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";
import * as util from "./util.js";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

type $RefinementCtx = {
  addIssue: (arg: err.$ZodIssueData) => void;
};
type $ZodRawShape = { [k: string]: core.$ZodType<unknown, never> };
type $Def<T extends object> = types.PickProps<Omit<T, `_${string}`>>;

export interface Parse<O> {
  (data: unknown, params?: Partial<parse.ParseParams>): O;
  safe(input: unknown, ctx?: parse.ParseContext): parse.ParseReturnType<O>;
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodString      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodStringDef extends core.$ZodTypeDef {
  coerce: boolean;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
}

export class $ZodString<
  O extends string,
  I,
  D extends $ZodStringDef,
> extends core.$ZodType<O, I, D> {
  override type = "string" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "string") return input as O;
    if (this.coerce) return String(input) as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "string",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx,
      this
    );
  }
}

///////////////////////////////////////
/////     $ZodStringFormat(s)     /////
///////////////////////////////////////
interface $ZodStringFormatDef extends $ZodStringDef {
  pattern?: RegExp;
}
export abstract class $ZodStringFormat<
    Def extends $ZodStringFormatDef = $ZodStringFormatDef,
  >
  extends $ZodString<string, string, Def>
  implements checks.$ZodCheck<string>
{
  abstract check: err.$ZodStringFormats;

  run(ctx: checks.$CheckCtx<string>): void {
    if (!this.pattern) throw new Error("Not implemented.");
    if (!this.pattern.test(ctx.input)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        pattern: this.pattern,
        input: ctx.input,
      } as err.$ZodIssueData);
    }
  }

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    _ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    console.log("uuid _typecheck");
    const typedResult = super._typeCheck(input, _ctx);
    if (parse.failed(typedResult)) {
      if (parse.aborted(typedResult)) return typedResult;
      return this._runCheck(this, input, _ctx, typedResult);
    }
    return this._runCheck(this, input, _ctx);
  }
}

/* ZodUUID */
export class $ZodUUID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "uuid" as const;
  override pattern: RegExp = regexes.uuidRegex;
}

/* ZodRegex */
export class $ZodRegex
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "regex" as const;
  override pattern!: RegExp;
}

/* ZodEmail */
export class $ZodEmail
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "email" as const;
  override pattern?: RegExp = regexes.emailRegex;
}

/* ZodURL */
export class $ZodURL
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "url" as const;

  override run(ctx: checks.$CheckCtx<string>): void {
    try {
      const url = new URL(ctx.input);
      if (!regexes.hostnameRegex.test(url.hostname)) {
        ctx.addIssue({
          code: "invalid_string",
          format: this.check,
          input: ctx.input,
        });
      }
    } catch {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        input: ctx.input,
      });
    }
  }
}

/* ZodJWT */
export function isValidJWT(
  token: string,
  algorithm: types.JWTAlgorithm | null = null
): boolean {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) {
      return false;
    }

    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));

    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") {
      return false;
    }

    if (
      algorithm &&
      (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

interface $ZodJWTDef extends $ZodStringDef {
  algorithm?: types.JWTAlgorithm | undefined;
}
export class $ZodJWT
  extends $ZodStringFormat<$ZodJWTDef>
  implements checks.$ZodCheck<string>
{
  check = "jwt" as const;
  override run(ctx: checks.$CheckCtx<string>): void {
    if (!isValidJWT(ctx.input, this.algorithm)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        algorithm: this.algorithm,
        input: ctx.input,
      });
    }
  }
}

/* ZodEmoji */
export class $ZodEmoji
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "emoji" as const;
  override pattern: RegExp = regexes.emojiRegex();
}

/* ZodNanoID */
export class $ZodNanoID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "nanoid" as const;
  override pattern: RegExp = regexes.nanoidRegex;
}

/* ZodGUID */
export class $ZodGUID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "guid" as const;
  override pattern: RegExp = regexes.guidRegex;
}

/* ZodCUID */
export class $ZodCUID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "cuid" as const;
  override pattern: RegExp = regexes.cuidRegex;
}

/* ZodCUID2 */
export class $ZodCUID2
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "cuid2" as const;
  override pattern: RegExp = regexes.cuid2Regex;
}

/* ZodULID */
export class $ZodULID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "ulid" as const;
  override pattern: RegExp = regexes.ulidRegex;
}

/* ZodXID */
export class $ZodXID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "xid" as const;
  override pattern: RegExp = regexes.xidRegex;
}

/* ZodKSUID */
export class $ZodKSUID
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "ksuid" as const;
}

/* ZodISODateTime */
export class $ZodISODateTime
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "iso_datetime" as const;
  precision?: number | null;
  offset?: boolean;
  local?: boolean;

  constructor(
    def: $ZodStringFormatDef & {
      precision?: number | null;
      offset?: boolean;
      local?: boolean;
    }
  ) {
    super(def);
    this.pattern = regexes.datetimeRegex(def);
    this.precision = def.precision ?? null;
    this.offset = def.offset ?? false;
    this.local = def.local ?? false;
  }
}

/* ZodISODate */
export class $ZodISODate
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "iso_date" as const;
  override pattern: RegExp = regexes.dateRegex;
}

/* ZodISOTime */
export class $ZodISOTime
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "iso_time" as const;
  precision?: number | null;
  offset?: boolean;
  local?: boolean;

  constructor(
    def: $ZodStringFormatDef & {
      precision?: number | null;
      offset?: boolean;
      local?: boolean;
    }
  ) {
    super(def);
    this.pattern = regexes.timeRegex(def);
    this.precision = def.precision ?? null;
    this.offset = def.offset ?? false;
    this.local = def.local ?? false;
  }
}

/* ZodDuration */
export class $ZodDuration
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "duration" as const;
  override pattern: RegExp = regexes.durationRegex;
}

/* ZodIP */
export class $ZodIP
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "ip" as const;
  override pattern: RegExp = regexes.ipv4Regex;

  override run(ctx: checks.$CheckCtx<string>): void {
    if (regexes.ipv4Regex.test(ctx.input) || regexes.ipv6Regex.test(ctx.input))
      return;
    ctx.addIssue({
      code: "invalid_string",
      format: this.check,
      input: ctx.input,
    });
  }
}

/* ZodIPv4 */
export class $ZodIPv4
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "ipv4" as const;
  override pattern: RegExp = regexes.ipv4Regex;
}

/* ZodIPv6 */
export class $ZodIPv6
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "ipv6" as const;
  override pattern: RegExp = regexes.ipv6Regex;
}

/* ZodBase64 */
export class $ZodBase64
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "base64" as const;
  override pattern: RegExp = regexes.base64Regex;
}

/* ZodJSONString */
export class $ZodJSONString
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "json_string" as const;

  override run(ctx: checks.$CheckCtx<string>): void {
    try {
      JSON.parse(ctx.input);
    } catch (err) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        input: ctx.input,
      });
    }
  }
}

/* ZodE164 */
export class $ZodE164
  extends $ZodStringFormat
  implements checks.$ZodCheck<string>
{
  check = "e164" as const;
  override pattern: RegExp = regexes.e164Regex;
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodNumberDef extends core.$ZodTypeDef {
  coerce: boolean;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
}

export class $ZodNumber<out O extends number, in I> extends core.$ZodType<
  O,
  I,
  $ZodNumberDef
> {
  override type = "number" as const;
  _typeCheck(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "number" && !Number.isNaN(input)) return input as O;
    if (this.coerce) input = Number(input);
    if (typeof input !== "number" || !Number.isNaN(input)) {
      return parse.$ZodFailure.from(
        [
          {
            input,
            code: "invalid_type",
            expected: parse.ZodParsedType.number,
            received: parse.getParsedType(input),
          },
        ],
        ctx,
        this
      );
    }
    return input as this["~output"];
  }
  minValue?: number;
  maxValue?: number;
}

/////////////////////////////
/////    $ZodInteger    /////
/////////////////////////////

export const RANGES_BY_INTEGER_FORMAT: {
  [k in types.IntegerTypes]: [number | bigint, number | bigint];
} = {
  int8: [-128, 127],
  uint8: [0, 255],
  int16: [-32768, 32767],
  uint16: [0, 65535],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  int64: [BigInt("6854775808"), BigInt("9223372036854775807")],
  uint64: [0, BigInt("18446744073709551615")],
  int128: [
    BigInt("-170141183460469231731687303715884105728"),
    BigInt("170141183460469231731687303715884105727"),
  ],
  uint128: [0, BigInt("340282366920938463463374607431768211455")],
};

interface $ZodIntegerDef extends core.$ZodTypeDef {
  format?: types.IntegerTypes;
  error?:
    | err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic | err.$ZodNumberIssues>
    | undefined;
}

export class $ZodInteger<
  out O extends number,
  in I,
  out D extends $ZodIntegerDef = $ZodIntegerDef,
> extends core.$ZodType<O, I, D> {
  override type = "string" as const;
  check = "integer" as const;

  /** @deprecated Internal API, use with caution. */
  _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (typeof input !== "number" && typeof input !== "bigint")
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "integer",
            received: parse.getParsedType(input),
            input,
          },
        ],
        ctx,
        this
      );
    return this._runChecks(input, ctx, undefined, [this]);
  }
  run(ctx: checks.$CheckCtx<number | bigint>): void {
    if (!util.isInteger(ctx.input))
      ctx.addIssue(
        {
          code: "invalid_type",
          expected: "integer",
          received: parse.getParsedType(ctx.input),
          input: ctx.input,
        },
        this
      );

    if (this.format) {
      const [minimum, maximum] = RANGES_BY_INTEGER_FORMAT[this.format];
      if (ctx.input < minimum) {
        ctx.addIssue(
          {
            code: "invalid_number",
            expected: "greater_than_or_equal",
            minimum,
            input: ctx.input,
          },
          this
        );
      }
      if (ctx.input > maximum) {
        ctx.addIssue(
          {
            code: "invalid_number",
            expected: "less_than_or_equal",
            maximum,
            input: ctx.input,
          },
          this
        );
      }
    }
  }
}

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodBigInt      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
interface $ZodBigIntDef extends core.$ZodTypeDef {
  coerce: boolean;
}
export class $ZodBigInt<
  out O extends bigint,
  in I,
  D extends $ZodBigIntDef = $ZodBigIntDef,
> extends core.$ZodType<O, I, D> {
  override type = "bigint" as const;

  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (typeof input === "bigint") return input as this["~output"];
    if (this.coerce) {
      try {
        input = BigInt(input as any);
      } catch (err) {}
    }
    if (typeof input !== "bigint") {
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "bigint",
            received: parse.getParsedType(input),
            input,
          },
        ],
        ctx,
        this
      );
    }
    return input as this["~output"];
  }
}

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                     ///////////
// //////////      $ZodBoolean      //////////
// //////////                     ///////////
// //////////////////////////////////////////
// //////////////////////////////////////////

interface $ZodBooleanDef extends core.$ZodTypeDef {
  coerce: boolean;
}
export class $ZodBoolean<
  O extends boolean,
  I,
  D extends $ZodBooleanDef,
> extends core.$ZodType<O, I, D> {
  type = "boolean" as const;

  _typeCheck(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "boolean") return input as O;
    if (this.coerce) input = Boolean(input);

    if (typeof input !== "boolean") {
      return parse.$ZodFailure.from(
        [
          {
            input,
            code: "invalid_type",
            expected: "boolean",
            received: parse.getParsedType(input),
          },
        ],
        ctx,
        this
      );
    }

    return input as O;
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      $ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////

export interface $ZodDateDef extends core.$ZodTypeDef {
  coerce: boolean;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueInvalidTypeBasic | err.$ZodIssueInvalidTypeInvalidDate
      >
    | undefined;
}

export class $ZodDate<
  O extends Date,
  I,
  D extends $ZodDateDef = $ZodDateDef,
> extends core.$ZodType<O, I, D> {
  type = "date" as const;
  _typeCheck(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (input instanceof Date && !Number.isNaN(input.getTime()))
      return input as O;
    if (this.coerce) {
      try {
        input = new Date(input as string | number | Date);
      } catch (err) {}
    }

    if (!(input instanceof Date)) {
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "date",
            received: parse.getParsedType(input),
            input,
          },
        ],
        ctx,
        this
      );
    }

    if (Number.isNaN(input.getTime())) {
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "date",
            received: "invalid_date",
            input,
          },
        ],
        ctx,
        this
      );
    }

    return new Date(input.getTime()) as O;
  }
}

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////       $ZodSymbol        //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
export interface $ZodSymbolDef extends core.$ZodTypeDef {
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
}

export class $ZodSymbol<
  O extends symbol,
  I,
  D extends $ZodSymbolDef = $ZodSymbolDef,
> extends core.$ZodType<O, I, D> {
  override type = "symbol" as const;
  _typeCheck(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "symbol") return input as O;
    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "symbol",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx,
      this
    );
  }
}

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////      $ZodUndefined      //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////

export interface $ZodUndefinedDef extends core.$ZodTypeDef {
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
}

export class $ZodUndefined<
  O extends undefined,
  I,
  D extends $ZodUndefinedDef = $ZodUndefinedDef,
> extends core.$ZodType<O, I, D> {
  override type = "undefined" as const;
  _typeCheck(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "undefined") return input as O;
    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "undefined",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx,
      this
    );
  }
}

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodNull      /////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export class $ZodNull extends core.$ZodType<null, null> {
//   override typeName: $ZodFirstPartyTypeKind.ZodNull;
//   constructor(_def: core.$Def<$ZodNull>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.null) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.null,
//           received: parsedType,
//         },
//       ]);
//     }
//     return input;
//   }
//   static create(params?: RawCreateParams): $ZodNull {
//     return new $ZodNull({
//       typeName: $ZodFirstPartyTypeKind.ZodNull,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      $ZodAny      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export class $ZodAny extends core.$ZodType<any, any> {
//   override typeName: $ZodFirstPartyTypeKind.ZodAny;
//   constructor(_def: core.$Def<$ZodAny>) {
//     super(_def);
//   }
//   // to prevent instances of other classes from extending $ZodAny. this causes issues with catchall in $ZodObject.
//   _any = true as const;
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     return input;
//   }
//   static create(params?: RawCreateParams): $ZodAny {
//     return new $ZodAny({
//       typeName: $ZodFirstPartyTypeKind.ZodAny,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodUnknown      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////

// export class $ZodUnknown extends core.$ZodType<unknown, unknown> {
//   override typeName: $ZodFirstPartyTypeKind.ZodUnknown;
//   constructor(_def: core.$Def<$ZodUnknown>) {
//     super(_def);
//   }
//   // required
//   _unknown = true as const;
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     return input;
//   }

//   static create(params?: RawCreateParams): $ZodUnknown {
//     return new $ZodUnknown({
//       typeName: $ZodFirstPartyTypeKind.ZodUnknown,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      $ZodNever      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export class $ZodNever extends core.$ZodType<never, never> {
//   override typeName: $ZodFirstPartyTypeKind.ZodNever;

//   constructor(_def: core.$Def<$ZodNever>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     return new parse.ZodFailure([
//       {
//         input,
//         code: err.ZodIssueCode.invalid_type,
//         expected: parse.ZodParsedType.never,
//         received: parsedType,
//       },
//     ]);
//   }
//   static create(params?: RawCreateParams): $ZodNever {
//     return new $ZodNever({
//       typeName: $ZodFirstPartyTypeKind.ZodNever,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodVoid      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export class $ZodVoid extends core.$ZodType<void, void> {
//   override typeName: $ZodFirstPartyTypeKind.ZodVoid;

//   constructor(_def: core.$Def<$ZodVoid>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.undefined) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.void,
//           received: parsedType,
//         },
//       ]);
//     }
//     return input;
//   }

//   static create(params?: RawCreateParams): $ZodVoid {
//     return new $ZodVoid({
//       typeName: $ZodFirstPartyTypeKind.ZodVoid,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      $ZodArray      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// // export interface $ZodArrayDef<T extends $ZodType = $ZodType> {
// //   type: T;
// //   typeName: $ZodFirstPartyTypeKind.ZodArray;
// //   exactLength: { value: number; message?: string } | null;
// //   minLength: { value: number; message?: string } | null;
// //   maxLength: { value: number; message?: string } | null;
// //   uniqueness: {
// //     identifier?: <U extends T["~output"]>(item: U) => unknown;
// //     message?:
// //       | string
// //       | (<U extends T["~output"]>(duplicateItems: U[]) => string);
// //     showDuplicates?: boolean;
// //   } | null;
// // }

// export type ArrayCardinality = "many" | "atleastone";
// export type arrayOutputType<
//   T extends $ZodType,
//   Cardinality extends ArrayCardinality = "many",
// > = Cardinality extends "atleastone"
//   ? [T["~output"], ...T["~output"][]]
//   : T["~output"][];

// export class $ZodArray<
//   T extends $ZodType = $ZodType,
//   Cardinality extends ArrayCardinality = ArrayCardinality,
// > extends core.$ZodType<
//   arrayOutputType<T, Cardinality>,
//   Cardinality extends "atleastone"
//     ? [core.input<T>, ...core.input<T>[]]
//     : core.input<T>[]
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodArray;
//   type: T;
//   exactLength: { value: number; message?: string } | null;
//   minLength: { value: number; message?: string } | null;
//   maxLength: { value: number; message?: string } | null;
//   uniqueness: {
//     identifier?: <U extends T["~output"]>(item: U) => unknown;
//     message?:
//       | string
//       | (<U extends T["~output"]>(duplicateItems: U[]) => string);
//     showDuplicates?: boolean;
//   } | null;

//   constructor(_def: core.$Def<$ZodArray>) {
//     super(_def);
//   }
//   override "~omit": "element";
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);

//     if (parsedType !== parse.ZodParsedType.array) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.array,
//           received: parsedType,
//         },
//       ]);
//     }

//     const issues: err.ZodIssueData[] = [];

//     if (this.exactLength !== null) {
//       const tooBig = input.length > this.exactLength.value;
//       const tooSmall = input.length < this.exactLength.value;
//       if (tooBig || tooSmall) {
//         issues.push({
//           input,
//           code: tooBig ? err.ZodIssueCode.too_big : err.ZodIssueCode.too_small,
//           minimum: (tooSmall ? this.exactLength.value : undefined) as number,
//           maximum: (tooBig ? this.exactLength.value : undefined) as number,
//           type: "array",
//           inclusive: true,
//           exact: true,
//           message: this.exactLength.message,
//         });
//       }
//     }

//     if (this.minLength !== null) {
//       if (input.length < this.minLength.value) {
//         issues.push({
//           input,
//           code: err.ZodIssueCode.too_small,
//           minimum: this.minLength.value,
//           type: "array",
//           inclusive: true,
//           exact: false,
//           message: this.minLength.message,
//         });
//       }
//     }

//     if (this.maxLength !== null) {
//       if (input.length > this.maxLength.value) {
//         issues.push({
//           input,
//           code: err.ZodIssueCode.too_big,
//           maximum: this.maxLength.value,
//           type: "array",
//           inclusive: true,
//           exact: false,
//           message: this.maxLength.message,
//         });
//       }
//     }

//     if (this.uniqueness !== null) {
//       const { identifier, message, showDuplicates } = this.uniqueness;
//       const duplicates = (
//         identifier
//           ? (input as this["~output"][]).map(identifier)
//           : (input as this["~output"][])
//       ).filter((item, idx, arr) => arr.indexOf(item) !== idx);
//       if (duplicates.length) {
//         issues.push({
//           input,
//           code: err.ZodIssueCode.not_unique,
//           duplicates: showDuplicates ? duplicates : undefined,
//           message:
//             typeof message === "function" ? message(duplicates) : message,
//         });
//       }
//     }

//     let hasPromises = false;

//     const parseResults = [...(input as any[])].map((item) => {
//       const result = this.type["~parse"](item, ctx);
//       if (result instanceof Promise) {
//         hasPromises = true;
//       }
//       return result;
//     });

//     if (hasPromises) {
//       return Promise.all(parseResults).then((result) => {
//         issues.push(
//           ...result.flatMap((r, i) =>
//             parse.failed(r)
//               ? r.issues.map((issue) => ({
//                   ...issue,
//                   path: [i, ...(issue.path || [])],
//                 }))
//               : []
//           )
//         );

//         if (issues.length > 0) {
//           return new parse.ZodFailure(issues);
//         }

//         return result.map((x) => x as any) as any;
//       });
//     }

//     const results = parseResults as parse.SyncParseReturnType<any>[];
//     // we know it's sync because hasPromises is false

//     issues.push(
//       ...results.flatMap((r, i) =>
//         !parse.failed(r)
//           ? []
//           : r.issues.map((issue) => ({
//               ...issue,
//               path: [i, ...(issue.path || [])],
//             }))
//       )
//     );

//     if (issues.length > 0) {
//       return new parse.ZodFailure(issues);
//     }

//     return results.map((x) => x as any) as any;
//   }

//   get element(): T {
//     return this.type;
//   }

//   min(minLength: number, message?: types.ErrMessage): this {
//     return new $ZodArray({
//       ...this,
//       minLength: { value: minLength, message: util.errToString(message) },
//     }) as any;
//   }

//   max(maxLength: number, message?: types.ErrMessage): this {
//     return new $ZodArray({
//       ...this,
//       maxLength: { value: maxLength, message: util.errToString(message) },
//     }) as any;
//   }

//   length(len: number, message?: types.ErrMessage): this {
//     return new $ZodArray({
//       ...this,
//       exactLength: { value: len, message: util.errToString(message) },
//     }) as any;
//   }

//   nonempty(message?: types.ErrMessage): $ZodArray<T, "atleastone"> {
//     return this.min(1, message) as any;
//   }

//   unique(params: $ZodArray["uniqueness"] = {}): this {
//     const message =
//       typeof params?.message === "function"
//         ? params.message
//         : util.errToString(params?.message);

//     return new $ZodArray({
//       ...this,
//       uniqueness: { ...params, message },
//     }) as any;
//   }

//   static create<T extends $ZodType>(
//     schema: T,
//     params?: RawCreateParams
//   ): $ZodArray<T> {
//     return new $ZodArray({
//       type: schema,
//       minLength: null,
//       maxLength: null,
//       exactLength: null,
//       uniqueness: null,
//       typeName: $ZodFirstPartyTypeKind.ZodArray,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// export type $ZodNonEmptyArray<T extends $ZodType> = $ZodArray<T, "atleastone">;

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodObject      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export type UnknownKeysParam = "passthrough" | "strict" | "strip";

// export type mergeTypes<A, B> = {
//   [k in keyof A | keyof B]: k extends keyof B
//     ? B[k]
//     : k extends keyof A
//       ? A[k]
//       : never;
// };

// export type objectOutputType<
//   Shape extends $ZodRawShape,
//   Catchall extends $ZodType,
//   UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
// > = types.flatten<types.addQuestionMarks<baseObjectOutputType<Shape>>> &
//   CatchallOutput<Catchall> &
//   PassthroughType<UnknownKeys>;

// export type baseObjectOutputType<Shape extends $ZodRawShape> = {
//   [k in keyof Shape]: Shape[k]["~output"];
// };

// export type objectInputType<
//   Shape extends $ZodRawShape,
//   Catchall extends $ZodType,
//   UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
// > = types.flatten<baseObjectInputType<Shape>> &
//   CatchallInput<Catchall> &
//   PassthroughType<UnknownKeys>;
// export type baseObjectInputType<Shape extends $ZodRawShape> =
//   types.addQuestionMarks<{
//     [k in keyof Shape]: core.input<Shape[k]>;
//   }>;

// export type CatchallOutput<T extends $ZodType> = core.$ZodType extends T
//   ? unknown
//   : { [k: string]: T["~output"] };

// export type CatchallInput<T extends $ZodType> = core.$ZodType extends T
//   ? unknown
//   : { [k: string]: core.input<T> };

// export type PassthroughType<T extends UnknownKeysParam> =
//   T extends "passthrough" ? { [k: string]: unknown } : unknown;

// export type deoptional<T extends $ZodType> = T extends $ZodOptional<infer U>
//   ? deoptional<U>
//   : T extends $ZodNullable<infer U>
//     ? $ZodNullable<deoptional<U>>
//     : T;

// export type SomeZodObject = $ZodObject<
//   $ZodRawShape,
//   UnknownKeysParam,
//   $ZodType
// >;

// export type noUnrecognized<Obj extends object, Shape extends object> = {
//   [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
// };

// // function deepPartialify(schema: $ZodType): any {
// //   if (schema instanceof $ZodObject) {
// //     const newShape: any = {};

// //     for (const key in schema.shape) {
// //       const fieldSchema = schema.shape[key];
// //       newShape[key] = $ZodOptional.create(deepPartialify(fieldSchema));
// //     }
// //     const clone = schema["~clone"]();
// //     clone.shape = () => newShape;
// //     return clone;
// //     // return new $ZodObject({
// //     //   ...schema._def,
// //     //   shape: () => newShape,
// //     // }) as any;
// //   }
// //   if (schema instanceof $ZodArray) {
// //     const clone = schema["~clone"]()
// //     clone.type= deepPartialify(schema.element);
// //     return clone;
// //     // return new $ZodArray({
// //     //   ...schema._def,
// //     //   type: deepPartialify(schema.element),
// //     // });
// //   }
// //   if (schema instanceof $ZodOptional) {
// //     return $ZodOptional.create(deepPartialify(schema.unwrap()));
// //   }
// //   if (schema instanceof $ZodNullable) {
// //     return $ZodNullable.create(deepPartialify(schema.unwrap()));
// //   }
// //   if (schema instanceof $ZodTuple) {
// //     return $ZodTuple.create(
// //       schema.items.map((item: any) => deepPartialify(item))
// //     );
// //   }
// //   return schema;
// // }

// export class $ZodObject<
//   T extends $ZodRawShape = $ZodRawShape,
//   UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
//   Catchall extends $ZodType = $ZodType,
//   Output = objectOutputType<T, Catchall, UnknownKeys>,
//   Input = objectInputType<T, Catchall, UnknownKeys>,
// > extends core.$ZodType<Output, Input> {
//   override typeName: $ZodFirstPartyTypeKind.ZodObject;
//   shape: T;
//   catchall: Catchall;
//   unknownKeys: UnknownKeys;
//   constructor(_def: core.$Def<$ZodObject>) {
//     super(_def);
//   }
//   private _cached = util.makeCache(this, {
//     shape() {
//       return this.shape;
//     },
//     keys() {
//       return Object.keys(this.shape);
//     },
//     keyset() {
//       return new Set(Object.keys(this.shape));
//     },
//   });

//   "~parse"(
//     input: unknown,
//     ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.object) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.object,
//           received: parsedType,
//         },
//       ]);
//     }

//     const issues: err.ZodIssueData[] = [];
//     const extraKeys: string[] = [];

//     if (!(this.catchall instanceof $ZodNever && this.unknownKeys === "strip")) {
//       for (const key in input) {
//         if (!this._cached.keys.includes(key)) {
//           extraKeys.push(key);
//         }
//       }
//     }

//     const final: any = {};

//     const asyncResults: Array<{
//       key: string;
//       promise: parse.AsyncParseReturnType<unknown>;
//     }> = [];

//     for (const key of this._cached.keys) {
//       const keyValidator = this._cached.shape[key];
//       const value = input[key];
//       const parseResult = keyValidator["~parse"](value, ctx);
//       if (parseResult instanceof Promise) {
//         asyncResults.push({ key, promise: parseResult });
//       } else if (parse.failed(parseResult)) {
//         issues.push(
//           ...parseResult.issues.map((issue) => ({
//             ...issue,
//             path: [key, ...(issue.path || [])],
//           }))
//         );
//       } else {
//         if (
//           key in input ||
//           keyValidator instanceof $ZodDefault ||
//           keyValidator instanceof $ZodCatch
//         ) {
//           final[key] = parseResult;
//         }
//       }
//     }

//     if (this.catchall instanceof $ZodNever) {
//       const unknownKeys = this.unknownKeys;

//       if (unknownKeys === "passthrough") {
//         for (const extraKey of extraKeys) {
//           if (extraKey === "__proto__") continue;
//           final[extraKey] = input[extraKey];
//         }
//       } else if (unknownKeys === "strict") {
//         if (extraKeys.length > 0) {
//           issues.push({
//             input,
//             code: err.ZodIssueCode.unrecognized_keys,
//             keys: extraKeys,
//           });
//         }
//       } else if (unknownKeys === "strip") {
//       } else {
//         throw new Error(
//           `Internal $ZodObject error: invalid unknownKeys value.`
//         );
//       }
//     } else {
//       // run catchall validation
//       const catchall = this.catchall;

//       for (const key of extraKeys) {
//         const value = input[key];
//         const parseResult = catchall["~parse"](value, ctx);
//         if (parseResult instanceof Promise) {
//           asyncResults.push({ key, promise: parseResult });
//         } else if (parse.failed(parseResult)) {
//           issues.push(
//             ...parseResult.issues.map((issue) => ({
//               ...issue,
//               path: [key, ...(issue.path || [])],
//             }))
//           );
//         } else {
//           if (
//             key in input ||
//             catchall instanceof $ZodDefault ||
//             catchall instanceof $ZodCatch
//           ) {
//             final[key] = parseResult;
//           }
//         }
//       }
//     }

//     if (asyncResults.length) {
//       return Promise.resolve()
//         .then(async () => {
//           for (const asyncResult of asyncResults) {
//             const result = await asyncResult.promise;
//             if (parse.failed(result)) {
//               issues.push(
//                 ...result.issues.map((issue) => ({
//                   ...issue,
//                   path: [asyncResult.key, ...(issue.path || [])],
//                 }))
//               );
//             } else {
//               if (asyncResult.key in input) {
//                 final[asyncResult.key] = result;
//               }
//             }
//           }
//         })
//         .then(() => {
//           if (issues.length) {
//             return new parse.ZodFailure(issues);
//           }

//           return final;
//         });
//     }

//     if (issues.length) {
//       return new parse.ZodFailure(issues);
//     }

//     return final;
//   }
//   strict(message?: types.ErrMessage): $ZodObject<T, "strict", Catchall> {
//     util.errToObj;
//     return new $ZodObject({
//       ...this,
//       unknownKeys: "strict",

//       ...(message !== undefined
//         ? {
//             errorMap: (issue, ctx) => {
//               const defaultError =
//                 this.errorMap?.(issue, ctx).message ?? ctx.defaultError;
//               if (issue.code === "unrecognized_keys")
//                 return {
//                   message: util.errToObj(message).message ?? defaultError,
//                 };
//               return {
//                 message: defaultError,
//               };
//             },
//           }
//         : {}),
//     }) as any;
//   }

//   strip(): $ZodObject<T, "strip", Catchall> {
//     return new $ZodObject({
//       ...this,
//       unknownKeys: "strip",
//     }) as any;
//   }

//   passthrough(): $ZodObject<T, "passthrough", Catchall> {
//     return new $ZodObject({
//       ...this,
//       unknownKeys: "passthrough",
//     }) as any;
//   }

//   /**
//    * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
//    * If you want to pass through unknown properties, use `.passthrough()` instead.
//    */
//   nonstrict: () => $ZodObject<T, "passthrough", Catchall> = this.passthrough;

//   // const AugmentFactory =
//   //   <Def extends $ZodObjectDef>(def: Def) =>
//   //   <Augmentation extends $ZodRawShape>(
//   //     augmentation: Augmentation
//   //   ): $ZodObject<
//   //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
//   //     Def["unknownKeys"],
//   //     Def["catchall"]
//   //   > => {
//   //     return new $ZodObject({
//   //       ...def,
//   //       shape: () => ({
//   //         ...def.shape,
//   //         ...augmentation,
//   //       }),
//   //     }) as any;
//   //   };
//   extend<Augmentation extends $ZodRawShape>(
//     augmentation: Augmentation & Partial<{ [k in keyof T]: unknown }>
//   ): $ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
//   extend<Augmentation extends $ZodRawShape>(
//     augmentation: Augmentation
//   ): $ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
//   extend(augmentation: $ZodRawShape) {
//     return new $ZodObject({
//       ...this,
//       shape: () => ({
//         ...this.shape,
//         ...augmentation,
//       }),
//     }) as any;
//   }
//   // extend<
//   //   Augmentation extends $ZodRawShape,
//   //   NewOutput extends types.flatten<{
//   //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
//   //       ? Augmentation[k]["~output"]
//   //       : k extends keyof Output
//   //       ? Output[k]
//   //       : never;
//   //   }>,
//   //   NewInput extends types.flatten<{
//   //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
//   //       ? core.input<Augmentation[k]>
//   //       : k extends keyof Input
//   //       ? Input[k]
//   //       : never;
//   //   }>
//   // >(
//   //   augmentation: Augmentation
//   // ): $ZodObject<
//   //   extendShape<T, Augmentation>,
//   //   UnknownKeys,
//   //   Catchall,
//   //   NewOutput,
//   //   NewInput
//   // > {
//   //   return new $ZodObject({
//   //     ...this,
//   //     shape: () => ({
//   //       ...this.shape,
//   //       ...augmentation,
//   //     }),
//   //   }) as any;
//   // }

//   /**
//    * @deprecated Use `.extend` instead
//    *  */
//   augment: (typeof this)["extend"] = this.extend;

//   /**
//    * Prior to zod@1.0.12 there was a bug in the
//    * inferred type of merged objects. Please
//    * upgrade if you are experiencing issues.
//    */
//   merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(
//     merging: Incoming
//   ): $ZodObject<
//     types.extendShape<T, Augmentation>,
//     Incoming["_def"]["unknownKeys"],
//     Incoming["_def"]["catchall"]
//   > {
//     const merged: any = new $ZodObject({
//       unknownKeys: merging._def.unknownKeys,
//       catchall: merging._def.catchall,
//       shape: () => ({
//         ...this.shape,
//         ...merging._def.shape,
//       }),
//       typeName: $ZodFirstPartyTypeKind.ZodObject,
//     }) as any;
//     return merged;
//   }
//   // merge<
//   //   Incoming extends AnyZodObject,
//   //   Augmentation extends Incoming["shape"],
//   //   NewOutput extends {
//   //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
//   //       ? Augmentation[k]["~output"]
//   //       : k extends keyof Output
//   //       ? Output[k]
//   //       : never;
//   //   },
//   //   NewInput extends {
//   //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
//   //       ? core.input<Augmentation[k]>
//   //       : k extends keyof Input
//   //       ? Input[k]
//   //       : never;
//   //   }
//   // >(
//   //   merging: Incoming
//   // ): $ZodObject<
//   //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
//   //   Incoming["_def"]["unknownKeys"],
//   //   Incoming["_def"]["catchall"],
//   //   NewOutput,
//   //   NewInput
//   // > {
//   //   const merged: any = new $ZodObject({
//   //     unknownKeys: merging._def.unknownKeys,
//   //     catchall: merging._def.catchall,
//   //     shape: () =>
//   //       core.mergeShapes(this.shape, merging._def.shape),
//   //     typeName: $ZodFirstPartyTypeKind.ZodObject,
//   //   }) as any;
//   //   return merged;
//   // }

//   setKey<Key extends string, Schema extends $ZodType>(
//     key: Key,
//     schema: Schema
//   ): $ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> {
//     return this.augment({ [key]: schema }) as any;
//   }
//   // merge<Incoming extends AnyZodObject>(
//   //   merging: Incoming
//   // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
//   // $ZodObject<
//   //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
//   //   Incoming["_def"]["unknownKeys"],
//   //   Incoming["_def"]["catchall"]
//   // > {
//   //   // const mergedShape = core.mergeShapes(
//   //   //   this.shape,
//   //   //   merging._def.shape
//   //   // );
//   //   const merged: any = new $ZodObject({
//   //     unknownKeys: merging._def.unknownKeys,
//   //     catchall: merging._def.catchall,
//   //     shape: () =>
//   //       core.mergeShapes(this.shape, merging._def.shape),
//   //     typeName: $ZodFirstPartyTypeKind.ZodObject,
//   //   }) as any;
//   //   return merged;
//   // }

//   pick<Mask extends types.Exactly<{ [k in keyof T]?: true }, Mask>>(
//     mask: Mask
//   ): $ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall> {
//     const shape: any = {};

//     for (const key of util.objectKeys(mask)) {
//       if (mask[key] && this.shape[key]) {
//         shape[key] = this.shape[key];
//       }
//     }

//     return new $ZodObject({
//       ...this,
//       shape: () => shape,
//     }) as any;
//   }

//   omit<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
//     mask: Mask
//   ): $ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall> {
//     const shape: any = {};

//     for (const key of util.objectKeys(this.shape)) {
//       if (!mask[key]) {
//         shape[key] = this.shape[key];
//       }
//     }

//     return new $ZodObject({
//       ...this,
//       shape: () => shape,
//     }) as any;
//   }

//   /**
//    * @deprecated
//    */
//   // deepPartial(): core.DeepPartial<this> {
//   //   return deepPartialify(this) as any;
//   // }

//   partial(): $ZodObject<
//     { [k in keyof T]: $ZodOptional<T[k]> },
//     UnknownKeys,
//     Catchall
//   >;

//   partial<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
//     mask: Mask
//   ): $ZodObject<
//     core.noNever<{
//       [k in keyof T]: k extends keyof Mask ? $ZodOptional<T[k]> : T[k];
//     }>,
//     UnknownKeys,
//     Catchall
//   >;
//   partial(mask?: any) {
//     const newShape: any = {};

//     // util.objectKeys(this.shape).forEach((key) => {
//     //   const fieldSchema = this.shape[key];

//     //   if (mask && !mask[key]) {
//     //     newShape[key] = fieldSchema;
//     //   } else {
//     //     newShape[key] = fieldSchema.optional();
//     //   }
//     // });

//     // rewrite to use for of
//     for (const key of this._cached.keys) {
//       const fieldSchema = this.shape[key];

//       if (mask && !mask[key]) {
//         newShape[key] = fieldSchema;
//       } else {
//         newShape[key] = fieldSchema.optional();
//       }
//     }

//     return new $ZodObject({
//       ...this,
//       shape: () => newShape,
//     }) as any;
//   }

//   required(): $ZodObject<
//     { [k in keyof T]: deoptional<T[k]> },
//     UnknownKeys,
//     Catchall
//   >;
//   required<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
//     mask: Mask
//   ): $ZodObject<
//     core.noNever<{
//       [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
//     }>,
//     UnknownKeys,
//     Catchall
//   >;
//   required(mask?: any) {
//     const newShape: any = {};
//     for (const key of this._cached.keys) {
//       if (mask && !mask[key]) {
//         newShape[key] = this.shape[key];
//       } else {
//         const fieldSchema = this.shape[key];
//         let newField = fieldSchema;

//         while (newField instanceof $ZodOptional) {
//           newField = (newField as $ZodOptional<any>)._def.innerType;
//         }

//         newShape[key] = newField;
//       }
//     }

//     return new $ZodObject({
//       ...this,
//       shape: () => newShape,
//     }) as any;
//   }

//   keyof(): $ZodEnum<core.UnionToTupleString<keyof T>> {
//     return $ZodEnum.create(
//       util.objectKeys(this.shape) as [string, ...string[]]
//     ) as any;
//   }

//   static create<T extends $ZodRawShape>(
//     shape: T,
//     params?: RawCreateParams
//   ): $ZodObject<
//     T,
//     "strip",
//     $ZodType,
//     objectOutputType<T, $ZodType, "strip">,
//     objectInputType<T, $ZodType, "strip">
//   > {
//     return new $ZodObject({
//       shape: () => shape,
//       unknownKeys: "strip",
//       catchall: $ZodNever.create(),
//       typeName: $ZodFirstPartyTypeKind.ZodObject,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }

//   static strictCreate<T extends $ZodRawShape>(
//     shape: T,
//     params?: RawCreateParams
//   ): $ZodObject<T, "strict"> {
//     return new $ZodObject({
//       shape: () => shape,
//       unknownKeys: "strict",
//       catchall: $ZodNever.create(),
//       typeName: $ZodFirstPartyTypeKind.ZodObject,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }

//   static lazycreate<T extends $ZodRawShape>(
//     shape: () => T,
//     params?: RawCreateParams
//   ): $ZodObject<T, "strip"> {
//     return new $ZodObject({
//       shape,
//       unknownKeys: "strip",
//       catchall: $ZodNever.create(),
//       typeName: $ZodFirstPartyTypeKind.ZodObject,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }
// }

// export type AnyZodObject = $ZodObject<any, any, any>;

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      $ZodUnion      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export type $ZodUnionOptions = Readonly<[$ZodType, ...$ZodType[]]>;
// export class $ZodUnion<
//   T extends $ZodUnionOptions = $ZodUnionOptions,
// > extends core.$ZodType<T[number]["~output"], core.input<T[number]>> {
//   override typeName: $ZodFirstPartyTypeKind.ZodUnion;
//   options: T;
//   constructor(_def: core.$Def<$ZodUnion>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const options = this.options;

//     function handleResults(results: parse.SyncParseReturnType<any>[]) {
//       // return first issue-free validation if it exists
//       for (const result of results) {
//         if (parse.isValid(result)) {
//           return result;
//         }
//       }

//       const unionErrors: err.ZodError[] = [];

//       for (const result of results) {
//         if (parse.failed(result)) {
//           unionErrors.push(
//             new err.ZodError(
//               result.issues.map((issue) => err.makeIssue(issue, ctx))
//             )
//           );
//         }
//       }

//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_union,
//           unionErrors,
//         },
//       ]);
//     }

//     let hasPromises = false;
//     const parseResults = options.map((option) => {
//       const result = option["~parse"](input, ctx);
//       if (result instanceof Promise) {
//         hasPromises = true;
//       }
//       return result;
//     });

//     if (hasPromises) {
//       return Promise.all(parseResults).then(handleResults);
//     }
//     const issues: err.ZodIssue[][] = [];
//     for (const result of parseResults as parse.SyncParseReturnType<any>[]) {
//       // we know it's sync because hasPromises is false
//       if (!parse.failed(result)) {
//         return result;
//       }

//       issues.push(result.issues.map((issue) => err.makeIssue(issue, ctx)));
//     }

//     const unionErrors = issues.map((issues) => new err.ZodError(issues));

//     return new parse.ZodFailure([
//       {
//         input,
//         code: err.ZodIssueCode.invalid_union,
//         unionErrors,
//       },
//     ]);
//   }

//   static create<T extends Readonly<[$ZodType, $ZodType, ...$ZodType[]]>>(
//     types: T,
//     params?: RawCreateParams
//   ): $ZodUnion<T> {
//     return new $ZodUnion({
//       options: types,
//       typeName: $ZodFirstPartyTypeKind.ZodUnion,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////
// //////////                                 //////////
// //////////      $ZodDiscriminatedUnion      //////////
// //////////                                 //////////
// /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////

// const getDiscriminator = <T extends $ZodType>(type: T): types.Primitive[] => {
//   if (type instanceof $ZodLazy) {
//     return getDiscriminator(type.schema);
//   }
//   if (type instanceof $ZodEffects) {
//     return getDiscriminator(type.innerType());
//   }
//   if (type instanceof $ZodLiteral) {
//     return [type.value];
//   }
//   if (type instanceof $ZodEnum) {
//     return type.options;
//   }
//   if (type instanceof $ZodNativeEnum) {
//     return util.objectValues(type.enum as any);
//   }
//   if (type instanceof $ZodDefault) {
//     return getDiscriminator(type._def.innerType);
//   }
//   if (type instanceof $ZodUndefined) {
//     return [undefined];
//   }
//   if (type instanceof $ZodNull) {
//     return [null];
//   }
//   if (type instanceof $ZodOptional) {
//     return [undefined, ...getDiscriminator(type.unwrap())];
//   }
//   if (type instanceof $ZodNullable) {
//     return [null, ...getDiscriminator(type.unwrap())];
//   }
//   if (type instanceof $ZodBranded) {
//     return getDiscriminator(type.unwrap());
//   }
//   if (type instanceof $ZodReadonly) {
//     return getDiscriminator(type.unwrap());
//   }
//   if (type instanceof $ZodCatch) {
//     return getDiscriminator(type._def.innerType);
//   }
//   return [];
// };

// export type $ZodDiscriminatedUnionOption<Discriminator extends string> =
//   $ZodObject<
//     { [key in Discriminator]: $ZodType } & $ZodRawShape,
//     UnknownKeysParam,
//     $ZodType
//   >;

// export class $ZodDiscriminatedUnion<
//   Discriminator extends string = string,
//   Options extends
//     $ZodDiscriminatedUnionOption<Discriminator>[] = $ZodDiscriminatedUnionOption<Discriminator>[],
// > extends core.$ZodType<
//   core.output<Options[number]>,
//   core.input<Options[number]>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
//   discriminator: Discriminator;
//   options: Options;
//   optionsMap: Map<types.Primitive, $ZodDiscriminatedUnionOption<any>>;

//   constructor(_def: core.$Def<$ZodDiscriminatedUnion>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);

//     if (parsedType !== parse.ZodParsedType.object) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.object,
//           received: parsedType,
//         },
//       ]);
//     }

//     const discriminator = this.discriminator;
//     const discriminatorValue: string = input[discriminator];
//     const option = this.optionsMap.get(discriminatorValue);

//     if (!option) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_union_discriminator,
//           options: Array.from(this.optionsMap.keys()),
//           path: [discriminator],
//         },
//       ]);
//     }

//     return option["~parse"](input, ctx) as any;
//   }

//   /**
//    * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
//    * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
//    * have a different value for each object in the union.
//    * @param discriminator the name of the discriminator property
//    * @param types an array of object schemas
//    * @param params
//    */
//   static create<
//     Discriminator extends string,
//     Types extends [
//       $ZodDiscriminatedUnionOption<Discriminator>,
//       ...$ZodDiscriminatedUnionOption<Discriminator>[],
//     ],
//   >(
//     discriminator: Discriminator,
//     options: Types,
//     params?: RawCreateParams
//   ): $ZodDiscriminatedUnion<Discriminator, Types> {
//     // Get all the valid discriminator values
//     const optionsMap: Map<types.Primitive, Types[number]> = new Map();

//     // try {
//     for (const type of options) {
//       const discriminatorValues = getDiscriminator(type.shape[discriminator]);
//       if (!discriminatorValues.length) {
//         throw new Error(
//           `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
//         );
//       }
//       for (const value of discriminatorValues) {
//         if (optionsMap.has(value)) {
//           throw new Error(
//             `Discriminator property ${String(
//               discriminator
//             )} has duplicate value ${String(value)}`
//           );
//         }

//         optionsMap.set(value, type);
//       }
//     }

//     return new $ZodDiscriminatedUnion<
//       Discriminator,
//       // DiscriminatorValue,
//       Types
//     >({
//       typeName: $ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
//       discriminator,
//       options,
//       optionsMap,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ///////////////////////////////////////////////
// ///////////////////////////////////////////////
// //////////                           //////////
// //////////      $ZodIntersection      //////////
// //////////                           //////////
// ///////////////////////////////////////////////
// ///////////////////////////////////////////////

// function mergeValues(
//   a: any,
//   b: any
// ):
//   | { valid: true; data: any }
//   | { valid: false; mergeErrorPath: (string | number)[] } {
//   const aType = parse.getParsedType(a);
//   const bType = parse.getParsedType(b);

//   if (a === b) {
//     return { valid: true, data: a };
//   }
//   if (
//     aType === parse.ZodParsedType.object &&
//     bType === parse.ZodParsedType.object
//   ) {
//     const bKeys = util.objectKeys(b);
//     const sharedKeys = util
//       .objectKeys(a)
//       .filter((key) => bKeys.indexOf(key) !== -1);

//     const newObj: any = { ...a, ...b };
//     for (const key of sharedKeys) {
//       const sharedValue = mergeValues(a[key], b[key]);
//       if (!sharedValue.valid) {
//         return {
//           valid: false,
//           mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
//         };
//       }
//       newObj[key] = sharedValue.data;
//     }

//     return { valid: true, data: newObj };
//   }
//   if (
//     aType === parse.ZodParsedType.array &&
//     bType === parse.ZodParsedType.array
//   ) {
//     if (a.length !== b.length) {
//       return { valid: false, mergeErrorPath: [] };
//     }

//     const newArray: unknown[] = [];
//     for (let index = 0; index < a.length; index++) {
//       const itemA = a[index];
//       const itemB = b[index];
//       const sharedValue = mergeValues(itemA, itemB);

//       if (!sharedValue.valid) {
//         return {
//           valid: false,
//           mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
//         };
//       }

//       newArray.push(sharedValue.data);
//     }

//     return { valid: true, data: newArray };
//   }
//   if (
//     aType === parse.ZodParsedType.date &&
//     bType === parse.ZodParsedType.date &&
//     +a === +b
//   ) {
//     return { valid: true, data: a };
//   }
//   return { valid: false, mergeErrorPath: [] };
// }

// export class $ZodIntersection<
//   T extends $ZodType = $ZodType,
//   U extends $ZodType = $ZodType,
// > extends core.$ZodType<
//   T["~output"] & U["~output"],
//   core.input<T> & core.input<U>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodIntersection;
//   left: T;
//   right: U;
//   constructor(_def: core.$Def<$ZodIntersection>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const handleParsed = (
//       parsedLeft: parse.SyncParseReturnType,
//       parsedRight: parse.SyncParseReturnType
//     ): parse.SyncParseReturnType<T & U> => {
//       if (parse.failed(parsedLeft) || parse.failed(parsedRight)) {
//         const issuesLeft = parse.failed(parsedLeft) ? parsedLeft.issues : [];
//         const issuesRight = parse.failed(parsedRight) ? parsedRight.issues : [];
//         return new parse.ZodFailure(issuesLeft.concat(issuesRight));
//       }

//       const merged = mergeValues(parsedLeft, parsedRight);

//       if (!merged.valid) {
//         return new parse.ZodFailure([
//           {
//             input,
//             code: err.ZodIssueCode.invalid_intersection_types,
//             mergeErrorPath: merged.mergeErrorPath,
//           },
//         ]);
//       }

//       return merged.data;
//     };

//     const parseResults = [
//       this.left["~parse"](input, ctx),
//       this.right["~parse"](input, ctx),
//     ];

//     const hasPromises = parseResults.some(
//       (result) => result instanceof Promise
//     );

//     if (hasPromises) {
//       return Promise.all(parseResults).then(([left, right]) =>
//         handleParsed(left, right)
//       );
//     }
//     return handleParsed(
//       parseResults[0] as parse.SyncParseReturnType,
//       parseResults[1] as parse.SyncParseReturnType
//     );
//   }

//   static create<T extends $ZodType, U extends $ZodType>(
//     left: T,
//     right: U,
//     params?: RawCreateParams
//   ): $ZodIntersection<T, U> {
//     return new $ZodIntersection({
//       left: left,
//       right: right,
//       typeName: $ZodFirstPartyTypeKind.ZodIntersection,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      $ZodTuple      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export type $ZodTupleItems = [$ZodType, ...$ZodType[]];
// export type AssertArray<T> = T extends any[] ? T : never;
// export type OutputTypeOfTuple<T extends $ZodTupleItems | []> = AssertArray<{
//   [k in keyof T]: T[k] extends core.$ZodType ? T[k]["~output"] : never;
// }>;
// export type OutputTypeOfTupleWithRest<
//   T extends $ZodTupleItems | [],
//   Rest extends $ZodType | null = null,
// > = Rest extends $ZodType
//   ? [...OutputTypeOfTuple<T>, ...Rest["~output"][]]
//   : OutputTypeOfTuple<T>;

// export type InputTypeOfTuple<T extends $ZodTupleItems | []> = AssertArray<{
//   [k in keyof T]: T[k] extends core.$ZodType ? core.input<T[k]> : never;
// }>;
// export type InputTypeOfTupleWithRest<
//   T extends $ZodTupleItems | [],
//   Rest extends $ZodType | null = null,
// > = Rest extends $ZodType
//   ? [...InputTypeOfTuple<T>, ...core.input<Rest>[]]
//   : InputTypeOfTuple<T>;

// export type AnyZodTuple = $ZodTuple<
//   [$ZodType, ...$ZodType[]] | [],
//   $ZodType | null
// >;
// export class $ZodTuple<
//   T extends [$ZodType, ...$ZodType[]] | [] = [$ZodType, ...$ZodType[]] | [],
//   Rest extends $ZodType | null = null,
// > extends core.$ZodType<
//   OutputTypeOfTupleWithRest<T, Rest>,
//   InputTypeOfTupleWithRest<T, Rest>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodTuple;
//   items: T;
//   rest: Rest;
//   constructor(_def: core.$Def<$ZodTuple>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.array) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.array,
//           received: parsedType,
//         },
//       ]);
//     }

//     if (input.length < this.items.length) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.too_small,
//           minimum: this.items.length,
//           inclusive: true,
//           exact: false,
//           type: "array",
//         },
//       ]);
//     }

//     const rest = this.rest;

//     const issues: err.ZodIssueData[] = [];

//     if (!rest && input.length > this.items.length) {
//       issues.push({
//         input,
//         code: err.ZodIssueCode.too_big,
//         maximum: this.items.length,
//         inclusive: true,
//         exact: false,
//         type: "array",
//       });
//     }

//     let hasPromises = false;

//     const items = ([...input] as any[])
//       .map((item, itemIndex) => {
//         const schema = this.items[itemIndex] || this.rest;
//         if (!schema)
//           return symbols.NOT_SET as any as parse.SyncParseReturnType<any>;
//         const result = schema["~parse"](item, ctx);
//         if (result instanceof Promise) {
//           hasPromises = true;
//         }

//         return result;
//       })
//       .filter((x) => x !== symbols.NOT_SET); // filter nulls

//     if (hasPromises) {
//       return Promise.all(items).then((results) => {
//         issues.push(
//           ...results.flatMap((r, i) =>
//             !parse.failed(r)
//               ? []
//               : r.issues.map((issue) => ({
//                   ...issue,
//                   path: [i, ...(issue.path || [])],
//                 }))
//           )
//         );

//         if (issues.length) {
//           return new parse.ZodFailure(issues);
//         }
//         return results.map((x) => x as any) as any;
//       });
//     }
//     issues.push(
//       ...(items as parse.SyncParseReturnType<any>[]).flatMap((r, i) =>
//         !parse.failed(r)
//           ? []
//           : r.issues.map((issue) => ({
//               ...issue,
//               path: [i, ...(issue.path || [])],
//             }))
//       )
//     );

//     if (issues.length) {
//       return new parse.ZodFailure(issues);
//     }
//     return items.map((x) => x as any) as any;
//   }

//   static create<T extends [$ZodType, ...$ZodType[]] | []>(
//     schemas: T,
//     params?: RawCreateParams
//   ): $ZodTuple<T, null> {
//     if (!Array.isArray(schemas)) {
//       throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
//     }
//     return new $ZodTuple({
//       items: schemas,
//       typeName: $ZodFirstPartyTypeKind.ZodTuple,
//       rest: null,

//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodRecord      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export type KeySchema = core.$ZodType<string | number | symbol, any>;
// export type RecordType<K extends string | number | symbol, V> = [
//   string,
// ] extends [K]
//   ? Record<K, V>
//   : [number] extends [K]
//     ? Record<K, V>
//     : [symbol] extends [K]
//       ? Record<K, V>
//       : [BRAND<string | number | symbol>] extends [K]
//         ? Record<K, V>
//         : Partial<Record<K, V>>;
// export class $ZodRecord<
//   Key extends KeySchema = KeySchema,
//   Value extends $ZodType = $ZodType,
// > extends core.$ZodType<
//   RecordType<Key["~output"], Value["~output"]>,
//   RecordType<core.input<Key>, core.input<Value>>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodRecord;
//   valueType: Value;
//   keyType: Key;
//   constructor(_def: core.$Def<$ZodRecord>) {
//     super(_def);
//   }
//   get keySchema(): Key {
//     return this.keyType;
//   }
//   get valueSchema(): Value {
//     return this.valueType;
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.object) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.object,
//           received: parsedType,
//         },
//       ]);
//     }

//     const keyType = this.keyType;
//     const valueType = this.valueType;

//     const issues: err.ZodIssueData[] = [];

//     const final: Record<any, any> = {};
//     const asyncResults: {
//       key: any;
//       keyR: parse.AsyncParseReturnType<any>;
//       valueR: parse.AsyncParseReturnType<any>;
//     }[] = [];

//     for (const key of util.objectKeys(input)) {
//       if (key === "__proto__") continue;
//       const keyResult = keyType["~parse"](key, ctx);
//       const valueResult = valueType["~parse"](input[key], ctx);

//       if (keyResult instanceof Promise || valueResult instanceof Promise) {
//         asyncResults.push({
//           key,
//           keyR: keyResult as any,
//           valueR: valueResult as any,
//         });
//       } else if (parse.failed(keyResult) || parse.failed(valueResult)) {
//         if (parse.failed(keyResult)) {
//           issues.push(
//             ...keyResult.issues.map((issue) => ({
//               ...issue,
//               path: [key, ...(issue.path || [])],
//             }))
//           );
//         }
//         if (parse.failed(valueResult)) {
//           issues.push(
//             ...valueResult.issues.map((issue) => ({
//               ...issue,
//               path: [key, ...(issue.path || [])],
//             }))
//           );
//         }
//       } else {
//         final[keyResult as any] = valueResult as any;
//       }
//     }

//     if (asyncResults.length) {
//       return Promise.resolve().then(async () => {
//         for (const asyncResult of asyncResults) {
//           const key = asyncResult.key;
//           const keyR = await asyncResult.keyR;
//           const valueR = await asyncResult.valueR;
//           if (parse.failed(keyR) || parse.failed(valueR)) {
//             if (parse.failed(keyR)) {
//               issues.push(
//                 ...keyR.issues.map((issue) => ({
//                   ...issue,
//                   path: [key, ...(issue.path || [])],
//                 }))
//               );
//             }
//             if (parse.failed(valueR)) {
//               issues.push(
//                 ...valueR.issues.map((issue) => ({
//                   ...issue,
//                   path: [key, ...(issue.path || [])],
//                 }))
//               );
//             }
//           } else {
//             final[keyR as any] = valueR;
//           }
//         }

//         if (issues.length) {
//           return new parse.ZodFailure(issues);
//         }
//         return final as this["~output"];
//       });
//     }
//     if (issues.length) {
//       return new parse.ZodFailure(issues);
//     }
//     return final as this["~output"];
//   }

//   get element(): Value {
//     return this.valueType;
//   }

//   static create<Value extends $ZodType>(
//     valueType: Value,
//     params?: RawCreateParams
//   ): $ZodRecord<ZodString, Value>;
//   static create<Keys extends KeySchema, Value extends $ZodType>(
//     keySchema: Keys,
//     valueType: Value,
//     params?: RawCreateParams
//   ): $ZodRecord<Keys, Value>;
//   static create(first: any, second?: any, third?: any): $ZodRecord<any, any> {
//     if (second instanceof $ZodType) {
//       return new $ZodRecord({
//         keyType: first,
//         valueType: second,
//         typeName: $ZodFirstPartyTypeKind.ZodRecord,
//         checks: [],
//         ...processCreateParams(third),
//       });
//     }

//     return new $ZodRecord({
//       keyType: $ZodString.create(),
//       valueType: first,
//       typeName: $ZodFirstPartyTypeKind.ZodRecord,
//       checks: [],
//       ...processCreateParams(second),
//     });
//   }
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      $ZodMap      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export class $ZodMap<
//   Key extends $ZodType = $ZodType,
//   Value extends $ZodType = $ZodType,
// > extends core.$ZodType<
//   Map<Key["~output"], Value["~output"]>,
//   Map<core.input<Key>, core.input<Value>>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodMap;
//   valueType: Value;
//   keyType: Key;
//   constructor(_def: core.$Def<$ZodMap>) {
//     super(_def);
//   }
//   get keySchema(): Key {
//     return this.keyType;
//   }
//   get valueSchema(): Value {
//     return this.valueType;
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.map) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.map,
//           received: parsedType,
//         },
//       ]);
//     }

//     const keyType = this.keyType;
//     const valueType = this.valueType;

//     const asyncResults: {
//       index: number;
//       keyR: parse.AsyncParseReturnType<any>;
//       valueR: parse.AsyncParseReturnType<any>;
//     }[] = [];
//     const issues: err.ZodIssueData[] = [];
//     const final = new Map();

//     const entries = [...(input as Map<string | number, unknown>).entries()];
//     for (let i = 0; i < entries.length; i++) {
//       const [key, value] = entries[i];
//       const keyResult = keyType["~parse"](key, ctx);
//       const valueResult = valueType["~parse"](value, ctx);

//       if (keyResult instanceof Promise || valueResult instanceof Promise) {
//         asyncResults.push({
//           index: i,
//           keyR: keyResult as parse.AsyncParseReturnType<any>,
//           valueR: valueResult as parse.AsyncParseReturnType<any>,
//         });
//       } else if (parse.failed(keyResult) || parse.failed(valueResult)) {
//         if (parse.failed(keyResult)) {
//           issues.push(
//             ...keyResult.issues.map((issue) => ({
//               ...issue,
//               path: [i, "key", ...(issue.path || [])],
//             }))
//           );
//         }
//         if (parse.failed(valueResult)) {
//           issues.push(
//             ...valueResult.issues.map((issue) => ({
//               ...issue,
//               path: [i, "value", ...(issue.path || [])],
//             }))
//           );
//         }
//       } else {
//         final.set(keyResult, valueResult);
//       }
//     }

//     if (asyncResults.length) {
//       return Promise.resolve().then(async () => {
//         for (const asyncResult of asyncResults) {
//           const index = asyncResult.index;
//           const keyR = await asyncResult.keyR;
//           const valueR = await asyncResult.valueR;
//           if (parse.failed(keyR) || parse.failed(valueR)) {
//             if (parse.failed(keyR)) {
//               issues.push(
//                 ...keyR.issues.map((issue) => ({
//                   ...issue,
//                   path: [index, "key", ...(issue.path || [])],
//                 }))
//               );
//             }
//             if (parse.failed(valueR)) {
//               issues.push(
//                 ...valueR.issues.map((issue) => ({
//                   ...issue,
//                   path: [index, "value", ...(issue.path || [])],
//                 }))
//               );
//             }
//           } else {
//             final.set(keyR, valueR);
//           }
//         }

//         if (issues.length) {
//           return new parse.ZodFailure(issues);
//         }

//         return final;
//       });
//     }
//     if (issues.length) {
//       return new parse.ZodFailure(issues);
//     }

//     return final;
//   }
//   static create<
//     Key extends $ZodType = $ZodType,
//     Value extends $ZodType = $ZodType,
//   >(
//     keyType: Key,
//     valueType: Value,
//     params?: RawCreateParams
//   ): $ZodMap<Key, Value> {
//     return new $ZodMap({
//       valueType,
//       keyType,
//       typeName: $ZodFirstPartyTypeKind.ZodMap,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      $ZodSet      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export class $ZodSet<Value extends $ZodType = $ZodType> extends core.$ZodType<
//   Set<Value["~output"]>,
//   Set<core.input<Value>>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodSet;
//   valueType: Value;
//   minSize: { value: number; message?: string } | null;
//   maxSize: { value: number; message?: string } | null;
//   constructor(_def: core.$Def<$ZodSet>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.set) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.set,
//           received: parsedType,
//         },
//       ]);
//     }

//     const issues: err.ZodIssueData[] = [];

//     if (this.minSize !== null) {
//       if (input.size < this.minSize.value) {
//         issues.push({
//           input,
//           code: err.ZodIssueCode.too_small,
//           minimum: this.minSize.value,
//           type: "set",
//           inclusive: true,
//           exact: false,
//           message: this.minSize.message,
//         });
//       }
//     }

//     if (this.maxSize !== null) {
//       if (input.size > this.maxSize.value) {
//         issues.push({
//           input,
//           code: err.ZodIssueCode.too_big,
//           maximum: this.maxSize.value,
//           type: "set",
//           inclusive: true,
//           exact: false,
//           message: this.maxSize.message,
//         });
//       }
//     }

//     const valueType = this.valueType;

//     function finalizeSet(elements: parse.SyncParseReturnType<any>[]) {
//       const parsedSet = new Set();
//       for (let i = 0; i < elements.length; i++) {
//         const element = elements[i];
//         if (parse.failed(element)) {
//           issues.push(
//             ...element.issues.map((issue) => ({
//               ...issue,
//               path: [i, ...(issue.path || [])],
//             }))
//           );
//         } else {
//           parsedSet.add(element);
//         }
//       }

//       if (issues.length) {
//         return new parse.ZodFailure(issues);
//       }

//       return parsedSet;
//     }

//     let hasPromises = false;

//     const elements = [...(input as Set<unknown>).values()].map((item) => {
//       const result = valueType["~parse"](item, ctx);
//       if (result instanceof Promise) {
//         hasPromises = true;
//       }
//       return result;
//     });

//     if (hasPromises) {
//       return Promise.all(elements).then(finalizeSet);
//     }
//     return finalizeSet(elements as parse.SyncParseReturnType[]);
//   }

//   min(minSize: number, message?: types.ErrMessage): this {
//     return new $ZodSet({
//       ...this,
//       minSize: { value: minSize, message: util.errToString(message) },
//     }) as any;
//   }

//   max(maxSize: number, message?: types.ErrMessage): this {
//     return new $ZodSet({
//       ...this,
//       maxSize: { value: maxSize, message: util.errToString(message) },
//     }) as any;
//   }

//   size(size: number, message?: types.ErrMessage): this {
//     return this.min(size, message).max(size, message) as any;
//   }

//   nonempty(message?: types.ErrMessage): $ZodSet<Value> {
//     return this.min(1, message) as any;
//   }

//   static create<Value extends $ZodType = $ZodType>(
//     valueType: Value,
//     params?: RawCreateParams
//   ): $ZodSet<Value> {
//     return new $ZodSet({
//       valueType,
//       minSize: null,
//       maxSize: null,
//       typeName: $ZodFirstPartyTypeKind.ZodSet,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      $ZodFunction      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////

// export type OuterTypeOfFunction<
//   Args extends $ZodTuple,
//   Returns extends $ZodType,
// > = core.input<Args> extends Array<any>
//   ? (...args: core.input<Args>) => Returns["~output"]
//   : never;

// export type InnerTypeOfFunction<
//   Args extends $ZodTuple,
//   Returns extends $ZodType,
// > = Args["~output"] extends Array<any>
//   ? (...args: Args["~output"]) => core.input<Returns>
//   : never;

// export class $ZodFunction<
//   Args extends $ZodTuple = $ZodTuple,
//   Returns extends $ZodType = $ZodType,
// > extends core.$ZodType<
//   OuterTypeOfFunction<Args, Returns>,
//   InnerTypeOfFunction<Args, Returns>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodFunction;
//   args: Args;
//   returns: Returns;
//   constructor(_def: core.$Def<$ZodFunction>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<any> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.function) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.function,
//           received: parsedType,
//         },
//       ]);
//     }

//     function makeArgsIssue(args: any, error: err.ZodError): err.ZodIssue {
//       return err.makeIssue(
//         {
//           input: args,
//           code: err.ZodIssueCode.invalid_arguments,
//           argumentsError: error,
//         },
//         ctx
//       );
//     }

//     function makeReturnsIssue(returns: any, error: err.ZodError): err.ZodIssue {
//       return err.makeIssue(
//         {
//           input: returns,
//           code: err.ZodIssueCode.invalid_return_type,
//           returnTypeError: error,
//         },
//         ctx
//       );
//     }

//     const params = { errorMap: ctx.contextualErrorMap };
//     const fn = input;

//     if (this.returns instanceof $ZodPromise) {
//       // Would love a way to avoid disabling this rule, but we need
//       // an alias (using an arrow function was what caused 2651).
//       const me = this;
//       return async function (this: any, ...args: any[]) {
//         const error = new err.ZodError([]);
//         const parsedArgs = await me._def.args
//           .parseAsync(args, params)
//           .catch((e) => {
//             error.addIssue(makeArgsIssue(args, e));
//             throw error;
//           });
//         const result = await Reflect.apply(fn, this, parsedArgs as any);
//         const parsedReturns = await (
//           me._def.returns as unknown as $ZodPromise<$ZodType>
//         )._def.type
//           .parseAsync(result, params)
//           .catch((e) => {
//             error.addIssue(makeReturnsIssue(result, e));
//             throw error;
//           });
//         return parsedReturns;
//       };
//     }
//     // Would love a way to avoid disabling this rule, but we need
//     // an alias (using an arrow function was what caused 2651).
//     const me = this;
//     return function (this: any, ...args: any[]) {
//       const parsedArgs = me._def.args.safeParse(args, params);
//       if (!parsedArgs.success) {
//         throw new err.ZodError([makeArgsIssue(args, parsedArgs.error)]);
//       }
//       const result = Reflect.apply(fn, this, parsedArgs.data);
//       const parsedReturns = me._def.returns.safeParse(result, params);
//       if (!parsedReturns.success) {
//         throw new err.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
//       }
//       return parsedReturns.data;
//     } as any;
//   }

//   parameters(): Args {
//     return this.args;
//   }

//   returnType(): Returns {
//     return this.returns;
//   }

//   implement<F extends InnerTypeOfFunction<Args, Returns>>(
//     func: F
//   ): ReturnType<F> extends Returns["~output"]
//     ? (...args: core.input<Args>) => ReturnType<F>
//     : OuterTypeOfFunction<Args, Returns> {
//     const validatedFunc = this.parse(func);
//     return validatedFunc as any;
//   }

//   strictImplement(
//     func: InnerTypeOfFunction<Args, Returns>
//   ): InnerTypeOfFunction<Args, Returns> {
//     const validatedFunc = this.parse(func);
//     return validatedFunc as any;
//   }

//   validate: (typeof this)["implement"] = this.implement;

//   static create(): $ZodFunction<$ZodTuple<[], $ZodUnknown>, $ZodUnknown>;
//   static create<T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>>(
//     args: T
//   ): $ZodFunction<T, $ZodUnknown>;
//   static create<T extends Any$ZodTuple, U extends $ZodType>(
//     args: T,
//     returns: U
//   ): $ZodFunction<T, U>;
//   static create<
//     T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>,
//     U extends $ZodType = $ZodUnknown,
//   >(args: T, returns: U, params?: RawCreateParams): $ZodFunction<T, U>;
//   static create(
//     args?: Any$ZodTuple,
//     returns?: $ZodType,
//     params?: RawCreateParams
//   ) {
//     return new $ZodFunction({
//       args: (args
//         ? args
//         : $ZodTuple.create([]).rest(ZodUnknown.create())) as any,
//       returns: returns || $ZodUnknown.create(),
//       typeName: $ZodFirstPartyTypeKind.ZodFunction,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodLazy      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export class $ZodLazy<T extends $ZodType = $ZodType> extends core.$ZodType<
//   core.output<T>,
//   core.input<T>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodLazy;
//   getter: () => T;
//   constructor(_def: core.$Def<$ZodLazy>) {
//     super(_def);
//   }
//   get schema(): T {
//     return this.getter();
//   }

//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const lazySchema = this.getter();
//     return lazySchema["~parse"](input, ctx);
//   }

//   static create<T extends $ZodType>(
//     getter: () => T,
//     params?: RawCreateParams
//   ): $ZodLazy<T> {
//     return new $ZodLazy({
//       getter: getter,
//       typeName: $ZodFirstPartyTypeKind.ZodLazy,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodLiteral      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export class $ZodLiteral<
//   T extends types.Primitive = types.Primitive,
// > extends core.$ZodType<T, T> {
//   override typeName: $ZodFirstPartyTypeKind.ZodLiteral;
//   value: T;
//   message?: string;
//   constructor(_def: core.$Def<$ZodLiteral>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (input !== this.value) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_literal,
//           expected: this.value,
//           received: input,
//           message: this.message,
//         },
//       ]);
//     }
//     return input;
//   }

//   static create<T extends types.Primitive>(
//     value: T,
//     params?: RawCreateParams & Exclude<types.ErrMessage, string>
//   ): $ZodLiteral<T> {
//     return new $ZodLiteral({
//       value: value,
//       typeName: $ZodFirstPartyTypeKind.ZodLiteral,
//       message: params?.message,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodEnum      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export type ArrayKeys = keyof any[];
// export type Indices<T> = Exclude<keyof T, ArrayKeys>;

// export type EnumValues<T extends string = string> = readonly [T, ...T[]];

// export type Values<T extends EnumValues> = {
//   [k in T[number]]: k;
// };

// export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

// export type FilterEnum<Values, ToExclude> = Values extends []
//   ? []
//   : Values extends [infer Head, ...infer Rest]
//     ? Head extends ToExclude
//       ? FilterEnum<Rest, ToExclude>
//       : [Head, ...FilterEnum<Rest, ToExclude>]
//     : never;

// export type typecast<A, T> = A extends T ? A : never;

// export class $ZodEnum<
//   T extends [string, ...string[]] = [string, ...string[]],
// > extends core.$ZodType<T[number], T[number]> {
//   override typeName: $ZodFirstPartyTypeKind.ZodEnum;
//   values: T;
//   constructor(_def: core.$Def<$ZodEnum>) {
//     super(_def);
//   }
//   #cache: Set<T[number]> | undefined;

//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (typeof input !== "string") {
//       const parsedType = parse.getParsedType(input);
//       const expectedValues = this.values;
//       return new parse.ZodFailure([
//         {
//           input,
//           expected: core.joinValues(expectedValues) as "string",
//           received: parsedType,
//           code: err.ZodIssueCode.invalid_type,
//         },
//       ]);
//     }

//     if (!this.#cache) {
//       this.#cache = new Set(this.values);
//     }

//     if (!this.#cache.has(input)) {
//       const expectedValues = this.values;

//       return new parse.ZodFailure([
//         {
//           input,
//           received: input,
//           code: err.ZodIssueCode.invalid_enum_value,
//           options: expectedValues,
//         },
//       ]);
//     }

//     return input;
//   }

//   get options(): T {
//     return this.values;
//   }

//   get enum(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   get Values(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   get Enum(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   extract<ToExtract extends readonly [T[number], ...T[number][]]>(
//     values: ToExtract,
//     newDef: RawCreateParams = this
//   ): $ZodEnum<Writeable<ToExtract>> {
//     return $ZodEnum.create(values, {
//       ...this,
//       ...newDef,
//     }) as any;
//   }

//   exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
//     values: ToExclude,
//     newDef: RawCreateParams = this
//   ): $ZodEnum<
//     typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
//   > {
//     return $ZodEnum.create(
//       this.options.filter((opt) => !values.includes(opt)) as FilterEnum<
//         T,
//         ToExclude[number]
//       >,
//       {
//         ...this,
//         ...newDef,
//       }
//     ) as any;
//   }

//   static create<U extends string, T extends Readonly<[U, ...U[]]>>(
//     values: T,
//     params?: RawCreateParams
//   ): $ZodEnum<Writeable<T>>;
//   static create<U extends string, T extends [U, ...U[]]>(
//     values: T,
//     params?: RawCreateParams
//   ): $ZodEnum<T>;
//   static create(values: [string, ...string[]], params?: RawCreateParams) {
//     return new $ZodEnum({
//       values,
//       typeName: $ZodFirstPartyTypeKind.ZodEnum,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// /////////////////////////////////////////////
// /////////////////////////////////////////////
// //////////                         //////////
// //////////      $ZodNativeEnum      //////////
// //////////                         //////////
// /////////////////////////////////////////////
// /////////////////////////////////////////////
// export type EnumLike = { [k: string]: string | number; [nu: number]: string };

// export class $ZodNativeEnum<
//   T extends EnumLike = EnumLike,
// > extends core.$ZodType<T[keyof T], T[keyof T]> {
//   override typeName: $ZodFirstPartyTypeKind.ZodNativeEnum;
//   values: T;
//   constructor(_def: core.$Def<$ZodNativeEnum>) {
//     super(_def);
//   }
//   #cache: Set<T[keyof T]> | undefined;
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<T[keyof T]> {
//     const nativeEnumValues = util.getValidEnumValues(this.values);

//     const parsedType = parse.getParsedType(input);
//     if (
//       parsedType !== parse.ZodParsedType.string &&
//       parsedType !== parse.ZodParsedType.number
//     ) {
//       const expectedValues = util.objectValues(nativeEnumValues);
//       return new parse.ZodFailure([
//         {
//           input,
//           expected: core.joinValues(expectedValues) as "string",
//           received: parsedType,
//           code: err.ZodIssueCode.invalid_type,
//         },
//       ]);
//     }

//     if (!this.#cache) {
//       this.#cache = new Set(util.getValidEnumValues(this.values));
//     }

//     if (!this.#cache.has(input)) {
//       const expectedValues = util.objectValues(nativeEnumValues);

//       return new parse.ZodFailure([
//         {
//           input,
//           received: input,
//           code: err.ZodIssueCode.invalid_enum_value,
//           options: expectedValues,
//         },
//       ]);
//     }

//     return input as any;
//   }

//   get enum(): T {
//     return this.values;
//   }

//   static create<T extends EnumLike>(
//     values: T,
//     params?: RawCreateParams
//   ): $ZodNativeEnum<T> {
//     return new $ZodNativeEnum({
//       values: values,
//       typeName: $ZodFirstPartyTypeKind.ZodNativeEnum,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile         //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

interface $ZodFileDef extends core.$ZodTypeDef {}

export class $ZodFile<
  O extends File,
  I,
  D extends $ZodFileDef,
> extends core.$ZodType<O, I, D> {
  override type = "file" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (input instanceof File) return input as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "file",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

// export type $ZodFileCheck =
//   | { kind: "min"; value: number; message?: string }
//   | { kind: "max"; value: number; message?: string }
//   | { kind: "type"; value: Array<string>; message?: string }
//   | { kind: "filename"; value: $ZodType; message?: string };

// interface _ZodBlob {
//   readonly size: number;
//   readonly type: string;
//   arrayBuffer(): Promise<ArrayBuffer>;
//   slice(start?: number, end?: number, contentType?: string): Blob;
//   stream(): ReadableStream;
//   text(): Promise<string>;
// }

// interface _ZodFile extends _ZodBlob {
//   readonly lastModified: number;
//   readonly name: string;
// }

// type File = typeof globalThis extends {
//   File: {
//     prototype: infer X;
//   };
// }
//   ? X
//   : _ZodFile;

// export class $ZodFile extends core.$ZodType<File, File> {
//   override typeName: $ZodFirstPartyTypeKind.ZodFile;
//   constructor(_def: core.$Def<$ZodFile>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<File> {
//     const parsedType = parse.getParsedType(input);

//     if (parsedType !== parse.ZodParsedType.file) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.file,
//           received: parsedType,
//         },
//       ]);
//     }

//     const file: File = input;

//     const issues: err.ZodIssueData[] = [];

//     for (const check of this.checks) {
//       if (check.kind === "min") {
//         if (file.size < check.value) {
//           issues.push({
//             input,
//             code: err.ZodIssueCode.too_small,
//             minimum: check.value,
//             type: "file",
//             inclusive: true,
//             exact: false,
//             message: check.message,
//           });
//         }
//       } else if (check.kind === "max") {
//         if (file.size > check.value) {
//           issues.push({
//             input,
//             code: err.ZodIssueCode.too_big,
//             maximum: check.value,
//             type: "file",
//             inclusive: true,
//             exact: false,
//             message: check.message,
//           });
//         }
//       } else if (check.kind === "type") {
//         const _check: any = check;
//         const cache: Set<string> = _check.cache ?? new Set(check.value);
//         // @todo support extensions?
//         // const extension =
//         //   file.name.indexOf(".") >= 0
//         //     ? file.name.slice(file.name.indexOf("."))
//         //     : undefined;
//         // const checkSpecifier = (fileTypeSpecifier: string): boolean => {
//         //   if (fileTypeSpecifier.startsWith(".")) {
//         //     return fileTypeSpecifier === extension;
//         //   }
//         //   return fileTypeSpecifier === file.type;
//         // };
//         if (!cache.has(file.type)) {
//           issues.push({
//             input,
//             code: err.ZodIssueCode.invalid_file_type,
//             expected: check.value,
//             received: file.type,
//             message: check.message,
//           });
//         }
//       } else if (check.kind === "filename") {
//         const parsedFilename = check.value.safeParse(file.name);
//         if (!parsedFilename.success) {
//           issues.push({
//             input,
//             code: err.ZodIssueCode.invalid_file_name,
//             message: check.message,
//           });
//         }
//       } else {
//         util.assertNever(check);
//       }
//     }

//     if (issues.length > 0) {
//       return new parse.ZodFailure(issues);
//     }

//     return file;
//   }

//   _addCheck(check: $ZodFileCheck): $ZodFile {
//     return new $ZodFile({
//       ...this,
//       checks: [...this.checks, check],
//     });
//   }

//   /**
//    * Restricts file size to the specified min.
//    */
//   min(minSize: number, message?: types.ErrMessage): $ZodFile {
//     return this._addCheck({
//       kind: "min",
//       value: minSize,
//       ...util.errToObj(message),
//     });
//   }

//   /**
//    * Restricts file size to the specified max.
//    */
//   max(maxSize: number, message?: types.ErrMessage): $ZodFile {
//     return this._addCheck({
//       kind: "max",
//       value: maxSize,
//       ...util.errToObj(message),
//     });
//   }

//   /**
//    * Restrict accepted file types.
//    * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
//    */
//   type(fileTypes: Array<string>, message?: types.ErrMessage): $ZodFile {
//     const invalidTypes = [];
//     for (const t of fileTypes) {
//       if (!t.includes("/")) {
//         invalidTypes.push(t);
//       }
//     }
//     if (invalidTypes.length > 0) {
//       throw new Error(`Invalid file type(s): ${invalidTypes.join(", ")}`);
//     }
//     return this._addCheck({
//       kind: "type",
//       value: fileTypes,
//       ...util.errToObj(message),
//     });
//   }

//   /**
//    * Validates file name against the provided schema.
//    */
//   name(schema: $ZodType, message?: types.ErrMessage): $ZodFile {
//     return this._addCheck({
//       kind: "filename",
//       value: schema,
//       ...util.errToObj(message),
//     });
//   }

//   get minSize(): number | null {
//     let min: number | null = null;
//     for (const check of this.checks) {
//       if (check.kind === "min") {
//         if (min === null || check.value > min) {
//           min = check.value;
//         }
//       }
//     }
//     return min;
//   }

//   get maxSize(): number | null {
//     let max: number | null = null;
//     for (const check of this.checks) {
//       if (check.kind === "max") {
//         if (max === null || check.value < max) {
//           max = check.value;
//         }
//       }
//     }
//     return max;
//   }

//   /**
//    * Returns accepted file types or undefined if any file type is acceptable.
//    */
//   get acceptedTypes(): string[] | undefined {
//     let result: Array<string> | undefined;
//     for (const check of this.checks) {
//       if (check.kind === "type") {
//         if (check.value) {
//           if (result) {
//             // reduce to intersection
//             result = result.filter((fileType) =>
//               check.value.includes(fileType)
//             );
//           } else {
//             result = check.value;
//           }
//         }
//       }
//     }
//     return result;
//   }

//   static create = (params?: RawCreateParams): $ZodFile => {
//     if (typeof File === "undefined") {
//       throw new Error("File is not supported in this environment");
//     }
//     return new $ZodFile({
//       checks: [],
//       typeName: $ZodFirstPartyTypeKind.ZodFile,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   };
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodPromise      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export class $ZodPromise<T extends $ZodType = $ZodType> extends core.$ZodType<
//   Promise<T["~output"]>,
//   Promise<core.input<T>>
// > {
//   type: T;
//   override typeName: $ZodFirstPartyTypeKind.ZodPromise;
//   constructor(_def: core.$Def<$ZodPromise>) {
//     super(_def);
//   }
//   unwrap(): T {
//     return this.type;
//   }

//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);

//     if (parsedType !== parse.ZodParsedType.promise) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.promise,
//           received: parsedType,
//         },
//       ]);
//     }

//     return input.then((inner: any) => {
//       return this.type["~parse"](inner, ctx);
//     });
//   }

//   static create<T extends $ZodType>(
//     schema: T,
//     params?: RawCreateParams
//   ): $ZodPromise<T> {
//     return new $ZodPromise({
//       type: schema,
//       typeName: $ZodFirstPartyTypeKind.ZodPromise,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////////////
// //////////////////////////////////////////////
// //////////                          //////////
// //////////        $ZodEffects        //////////
// //////////                          //////////
// //////////////////////////////////////////////
// //////////////////////////////////////////////

// export type Refinement<T> = (arg: T, ctx: $RefinementCtx) => any;
// export type SuperRefinement<T> = (
//   arg: T,
//   ctx: $RefinementCtx
// ) => void | Promise<void>;

// export type RefinementEffect<T> = {
//   type: "refinement";
//   refinement: (arg: T, ctx: $RefinementCtx) => any;
// };
// export type TransformEffect<T> = {
//   type: "transform";
//   transform: (arg: T, ctx: $RefinementCtx) => any;
// };
// export type PreprocessEffect<T> = {
//   type: "preprocess";
//   transform: (arg: T, ctx: $RefinementCtx) => any;
// };
// export type Effect<T> =
//   | RefinementEffect<T>
//   | TransformEffect<T>
//   | PreprocessEffect<T>;

// export class $ZodEffects<
//   T extends $ZodType = $ZodType,
//   Output = core.output<T>,
//   Input = core.input<T>,
// > extends core.$ZodType<Output, Input> {
//   schema: T;
//   override typeName: $ZodFirstPartyTypeKind.ZodEffects;
//   effect: Effect<any>;
//   constructor(_def: core.$Def<$ZodEffects>) {
//     super(_def);
//   }
//   innerType(): T {
//     return this.schema;
//   }

//   sourceType(): T {
//     return this.schema._def.typeName === $ZodFirstPartyTypeKind.ZodEffects
//       ? (this.schema as unknown as $ZodEffects<T>).sourceType()
//       : (this.schema as T);
//   }

//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const effect = this.effect || null;

//     const issues: err.ZodIssueData[] = [];

//     const checkCtx: $RefinementCtx = {
//       addIssue: (arg: err.ZodIssueData) => {
//         issues.push(arg);
//       },
//     };

//     checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

//     if (effect.type === "preprocess") {
//       const processed = effect.transform(input, checkCtx);

//       if (processed instanceof Promise) {
//         return processed.then((processed) => {
//           if (issues.some((i) => i.fatal)) {
//             return new parse.ZodFailure(issues);
//           }
//           const result = this.schema["~parse"](processed, ctx);
//           if (result instanceof Promise) {
//             return result.then((r) => {
//               if (parse.failed(r)) {
//                 issues.push(...r.issues);
//               }
//               if (issues.length) return new parse.ZodFailure(issues);
//               return r;
//             });
//           }

//           if (parse.failed(result)) {
//             issues.push(...result.issues);
//             return new parse.ZodFailure(issues);
//           }

//           return issues.length ? new parse.ZodFailure(issues) : result;
//         }) as any;
//       }
//       if (issues.some((i) => i.fatal)) {
//         return new parse.ZodFailure(issues);
//       }
//       const result = this.schema["~parse"](processed, ctx);

//       if (result instanceof Promise) {
//         return result.then((r) => {
//           if (parse.failed(r)) {
//             issues.push(...r.issues);
//           }
//           if (issues.length) return new parse.ZodFailure(issues);
//           return r;
//         });
//       }

//       if (parse.failed(result)) {
//         issues.push(...result.issues);
//         return new parse.ZodFailure(issues);
//       }

//       return issues.length ? new parse.ZodFailure(issues) : (result as any);
//     }

//     if (effect.type === "refinement") {
//       const executeRefinement = (acc: unknown): any => {
//         const result = effect.refinement(acc, checkCtx);
//         if (result instanceof Promise) {
//           return Promise.resolve(result);
//         }
//         return acc;
//       };

//       const inner = this.schema["~parse"](input, ctx);

//       if (!(inner instanceof Promise)) {
//         if (parse.failed(inner)) {
//           issues.push(...inner.issues);
//         }

//         const value = parse.failed(inner)
//           ? inner.value !== symbols.NOT_SET
//             ? inner.value
//             : input // if valid, use parsed value
//           : inner;
//         // else, check parse.ZodFailure for `.value` (set after transforms)
//         // then fall back to original input
//         if (issues.some((i) => i.fatal)) {
//           return new parse.ZodFailure(issues, value);
//         }

//         // return value is ignored
//         const executed = executeRefinement(value);

//         if (executed instanceof Promise) {
//           return executed.then(() => {
//             if (issues.length) return new parse.ZodFailure(issues, inner);
//             return inner;
//           }) as any;
//         }

//         if (issues.length) return new parse.ZodFailure(issues, inner);
//         return inner as any;
//       }
//       return inner.then((inner) => {
//         if (parse.failed(inner)) {
//           issues.push(...inner.issues);
//         }

//         if (issues.some((i) => i.fatal)) {
//           return new parse.ZodFailure(issues, inner);
//         }

//         const value = parse.failed(inner)
//           ? inner.value !== symbols.NOT_SET
//             ? inner.value
//             : input // if valid, use parsed value
//           : inner;

//         const executed = executeRefinement(value);

//         if (executed instanceof Promise) {
//           return executed.then(() => {
//             if (issues.length) return new parse.ZodFailure(issues, inner);
//             return inner;
//           });
//         }

//         if (issues.length) return new parse.ZodFailure(issues, inner);
//         return inner;
//       });
//     }

//     if (effect.type === "transform") {
//       const inner = this.schema["~parse"](input, ctx);
//       if (!(inner instanceof Promise)) {
//         if (parse.failed(inner)) {
//           issues.push(...inner.issues);
//         }

//         // do not execute transform if any issues exist
//         if (issues.length) return new parse.ZodFailure(issues);

//         const value = parse.failed(inner)
//           ? inner.value === symbols.NOT_SET
//             ? input
//             : inner.value
//           : inner;

//         const result = effect.transform(value, checkCtx);
//         if (result instanceof Promise) {
//           return result.then((result) => {
//             if (issues.length) return new parse.ZodFailure(issues, result);
//             return result;
//           });
//         }

//         if (issues.length) return new parse.ZodFailure(issues, result);
//         return result;
//       }
//       return inner.then((inner) => {
//         if (parse.failed(inner)) {
//           issues.push(...inner.issues);
//         }

//         if (issues.length) return new parse.ZodFailure(issues, inner);

//         const value = parse.failed(inner)
//           ? inner.value === symbols.NOT_SET
//             ? input
//             : inner.value
//           : inner;

//         const result = effect.transform(value, checkCtx);

//         if (result instanceof Promise) {
//           return result.then((result) => {
//             if (issues.length) return new parse.ZodFailure(issues, result);
//             return result;
//           });
//         }

//         if (issues.length) return new parse.ZodFailure(issues, result);
//         return result;
//       });
//     }

//     util.assertNever(effect);
//   }

//   static create<I extends $ZodType>(
//     schema: I,
//     effect: Effect<I["~output"]>,
//     params?: RawCreateParams
//   ): $ZodEffects<I, I["~output"]> {
//     return new $ZodEffects({
//       schema,
//       typeName: $ZodFirstPartyTypeKind.ZodEffects,
//       effect,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }

//   static createWithPreprocess<I extends $ZodType>(
//     preprocess: (arg: unknown, ctx: $RefinementCtx) => unknown,
//     schema: I,
//     params?: RawCreateParams
//   ): $ZodEffects<I, I["~output"], unknown> {
//     return new $ZodEffects({
//       schema,
//       effect: { type: "preprocess", transform: preprocess },
//       typeName: $ZodFirstPartyTypeKind.ZodEffects,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// export { $ZodEffects as $ZodTransformer };

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      $ZodOptional      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// export type $ZodOptionalType<T extends $ZodType> = $ZodOptional<T>;

// export class $ZodOptional<T extends $ZodType = $ZodType> extends core.$ZodType<
//   T["~output"] | undefined,
//   core.input<T> | undefined
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodOptional;
//   innerType: T;
//   constructor(_def: core.$Def<$ZodOptional>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType === parse.ZodParsedType.undefined) {
//       return undefined;
//     }
//     return this.innerType["~parse"](input, ctx);
//   }

//   unwrap(): T {
//     return this.innerType;
//   }

//   static create<T extends $ZodType>(
//     type: T,
//     params?: RawCreateParams
//   ): $ZodOptional<T> {
//     return new $ZodOptional({
//       innerType: type,
//       typeName: $ZodFirstPartyTypeKind.ZodOptional,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }
// }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      $ZodNullable      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// export type $ZodNullableType<T extends $ZodType> = $ZodNullable<T>;

// type adjklf = core.$Def<$ZodNullable>;
// export class $ZodNullable<T extends $ZodType = $ZodType> extends core.$ZodType<
//   T["~output"] | null,
//   core.input<T> | null
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodNullable;
//   innerType: T;
//   constructor(_def: core.$Def<$ZodNullable>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType === parse.ZodParsedType.null) {
//       return null;
//     }

//     return this.innerType["~parse"](input, ctx);
//   }

//   unwrap(): T {
//     return this.innerType;
//   }

//   static create<T extends $ZodType>(
//     type: T,
//     params?: RawCreateParams
//   ): $ZodNullable<T> {
//     return new $ZodNullable({
//       innerType: type,
//       typeName: $ZodFirstPartyTypeKind.ZodNullable,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }
// }

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////       $ZodDefault       //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// export class $ZodDefault<T extends $ZodType = $ZodType> extends core.$ZodType<
//   types.noUndefined<T["~output"]>,
//   core.input<T> | undefined
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodDefault;
//   innerType: T;
//   defaultValue: () => types.noUndefined<core.input<T>>;
//   constructor(_def: core.$Def<$ZodDefault>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType === parse.ZodParsedType.undefined) {
//       input = this.defaultValue();
//     }
//     this["~def"];
//     return this.innerType["~parse"](input, ctx) as any;
//   }

//   removeDefault(): T {
//     return this.innerType;
//   }

//   static create<T extends $ZodType>(
//     type: T,
//     params: RawCreateParams & {
//       default: core.input<T> | (() => types.noUndefined<core.input<T>>);
//     }
//   ): $ZodDefault<T> {
//     return new $ZodDefault({
//       innerType: type,
//       typeName: $ZodFirstPartyTypeKind.ZodDefault,
//       defaultValue:
//         typeof params.default === "function"
//           ? params.default
//           : ((() => params.default) as any),
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////       $ZodCatch       //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export class $ZodCatch<T extends $ZodType = $ZodType> extends core.$ZodType<
//   T["~output"],
//   unknown // any input will pass validation // core.input<T>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodCatch;
//   innerType: T;
//   catchValue: (ctx: { error: err.ZodError; input: unknown }) => core.input<T>;
//   constructor(_def: core.$Def<$ZodCatch>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const result = this.innerType["~parse"](input, ctx);

//     if (parse.isAsync(result)) {
//       return result.then((result) => {
//         return {
//           status: "valid",
//           value: parse.failed(result)
//             ? this.catchValue({
//                 get error() {
//                   return new err.ZodError(
//                     result.issues.map((issue) => err.makeIssue(issue, ctx))
//                   );
//                 },
//                 input,
//               })
//             : result,
//         };
//       });
//     }
//     return parse.failed(result)
//       ? this.catchValue({
//           get error() {
//             return new err.ZodError(
//               result.issues.map((issue) => err.makeIssue(issue, ctx))
//             );
//           },
//           input,
//         })
//       : result;
//   }

//   removeCatch(): T {
//     return this.innerType;
//   }

//   static create<T extends $ZodType>(
//     type: T,
//     params: RawCreateParams & {
//       catch: T["~output"] | (() => T["~output"]);
//     }
//   ): $ZodCatch<T> {
//     return new $ZodCatch({
//       innerType: type,
//       typeName: $ZodFirstPartyTypeKind.ZodCatch,
//       catchValue:
//         typeof params.catch === "function"
//           ? params.catch
//           : ((() => params.catch) as any),
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodNaN         //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// export class $ZodNaN extends core.$ZodType<number, number> {
//   override typeName: $ZodFirstPartyTypeKind.ZodNaN;
//   constructor(_def: core.$Def<$ZodNaN>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<any> {
//     const parsedType = parse.getParsedType(input);
//     if (parsedType !== parse.ZodParsedType.nan) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.nan,
//           received: parsedType,
//         },
//       ]);
//     }

//     return input;
//   }

//   static create(params?: RawCreateParams): $ZodNaN {
//     return new $ZodNaN({
//       typeName: $ZodFirstPartyTypeKind.ZodNaN,
//       checks: [],
//       ...processCreateParams(params),
//     });
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodBranded      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export const BRAND: unique symbol = Symbol("zod_brand");
// export type BRAND<T extends string | number | symbol> = {
//   [BRAND]: { [k in T]: true };
// };

// export class $ZodBranded<
//   T extends $ZodType = $ZodType,
//   B extends string | number | symbol = string | number | symbol,
// > extends core.$ZodType<T["~output"] & BRAND<B>, core.input<T>> {
//   override typeName: $ZodFirstPartyTypeKind.ZodBranded;
//   type: T;
//   constructor(_def: core.$Def<$ZodBranded>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<any> {
//     return this.type["~parse"](input, ctx);
//   }

//   unwrap(): T {
//     return this.type;
//   }
// }

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////      $ZodPipeline       //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// export class $ZodPipeline<
//   A extends $ZodType = $ZodType,
//   B extends $ZodType = $ZodType,
// > extends core.$ZodType<B["~output"], core.input<A>> {
//   override typeName: $ZodFirstPartyTypeKind.ZodPipeline;
//   in: A;
//   out: B;
//   constructor(_def: core.$Def<$ZodPipeline>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<any> {
//     const result = this.in["~parse"](input, ctx);
//     if (result instanceof Promise) {
//       return result.then((inResult) => {
//         if (parse.failed(inResult)) return inResult;

//         return this.out["~parse"](inResult, ctx);
//       });
//     }
//     if (parse.failed(result)) return result;

//     return this.out["~parse"](result, ctx);
//   }

//   static create<A extends $ZodType, B extends $ZodType>(
//     a: A,
//     b: B
//   ): $ZodPipeline<A, B> {
//     return new $ZodPipeline({
//       in: a,
//       out: b,
//       typeName: $ZodFirstPartyTypeKind.ZodPipeline,
//     });
//   }
// }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      $ZodReadonly      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// type BuiltIn =
//   | (((...args: any[]) => any) | (new (...args: any[]) => any))
//   | { readonly [Symbol.toStringTag]: string }
//   | Date
//   | Error
//   | Generator
//   | Promise<unknown>
//   | RegExp;

// type MakeReadonly<T> = T extends Map<infer K, infer V>
//   ? ReadonlyMap<K, V>
//   : T extends Set<infer V>
//     ? ReadonlySet<V>
//     : T extends [infer Head, ...infer Tail]
//       ? readonly [Head, ...Tail]
//       : T extends Array<infer V>
//         ? ReadonlyArray<V>
//         : T extends BuiltIn
//           ? T
//           : Readonly<T>;

// export class $ZodReadonly<T extends $ZodType = $ZodType> extends core.$ZodType<
//   MakeReadonly<T["~output"]>,
//   MakeReadonly<core.input<T>>
// > {
//   override typeName: $ZodFirstPartyTypeKind.ZodReadonly;
//   innerType: T;
//   constructor(_def: core.$Def<$ZodReadonly>) {
//     super(_def);
//   }
//   "~parse"(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const result = this.innerType["~parse"](input, ctx);
//     const freeze = (data: unknown) => {
//       if (parse.isValid(data)) {
//         data = Object.freeze(data) as any;
//       }
//       return data;
//     };
//     return parse.isAsync(result)
//       ? result.then((data) => freeze(data))
//       : (freeze(result) as any);
//   }

//   static create<T extends $ZodType>(
//     type: T,
//     params?: RawCreateParams
//   ): $ZodReadonly<T> {
//     return new $ZodReadonly({
//       innerType: type,
//       typeName: $ZodFirstPartyTypeKind.ZodReadonly,
//       checks: [],
//       ...processCreateParams(params),
//     }) as any;
//   }

//   unwrap(): T {
//     return this.innerType;
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////  $ZodTemplateLiteral  //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////

// type TemplateLiteralPrimitive = string | number | boolean | null | undefined;

// type TemplateLiteralInterpolatedPosition = $ZodType<
//   TemplateLiteralPrimitive | bigint
// >;
// type TemplateLiteralPart =
//   | TemplateLiteralPrimitive
//   | TemplateLiteralInterpolatedPosition;

// type appendToTemplateLiteral<
//   Template extends string,
//   Suffix extends TemplateLiteralPrimitive | $ZodType,
// > = Suffix extends TemplateLiteralPrimitive
//   ? `${Template}${Suffix}`
//   : Suffix extends $ZodOptional<infer UnderlyingType>
//     ? Template | appendToTemplateLiteral<Template, UnderlyingType>
//     : Suffix extends $ZodBranded<infer UnderlyingType, any>
//       ? appendToTemplateLiteral<Template, UnderlyingType>
//       : Suffix extends core.$ZodType<infer Output, any>
//         ? Output extends TemplateLiteralPrimitive | bigint
//           ? `${Template}${Output}`
//           : never
//         : never;

// type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
//   [] extends Parts
//     ? ``
//     : Parts extends [
//           ...infer Rest extends TemplateLiteralPart[],
//           infer Last extends TemplateLiteralPart,
//         ]
//       ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
//       : never;

// export class $ZodTemplateLiteral<
//   Template extends string = "",
// > extends core.$ZodType<Template, Template> {
//   override typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral;
//   coerce: boolean;
//   parts: readonly TemplateLiteralPart[];
//   regexString: string;
//   constructor(_def: core.$Def<$ZodTemplateLiteral>) {
//     super(_def);
//   }
//   interpolated<I extends TemplateLiteralInterpolatedPosition>(
//     type: Exclude<
//       I,
//       $ZodNever | $ZodNaN | $ZodPipeline<any, any> | $ZodLazy<any>
//     >
//   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
//     // TODO: check for invalid types at runtime
//     return this._addPart(type) as any;
//   }

//   literal<L extends TemplateLiteralPrimitive>(
//     literal: L
//   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
//     return this._addPart(literal) as any;
//   }

//   "~parse"(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<Template> {
//     if (this.coerce) {
//       input = String(input);
//     }

//     const parsedType = parse.getParsedType(input);

//     if (parsedType !== parse.ZodParsedType.string) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.invalid_type,
//           expected: parse.ZodParsedType.string,
//           received: parsedType,
//         },
//       ]);
//     }

//     if (!new RegExp(this.regexString).test(input)) {
//       return new parse.ZodFailure([
//         {
//           input,
//           code: err.ZodIssueCode.custom,
//           message: `String does not match template literal`,
//         },
//       ]);
//     }

//     return input;
//   }

//   protected _addParts(parts: TemplateLiteralPart[]): $ZodTemplateLiteral {
//     let r = this.regexString;
//     for (const part of parts) {
//       r = this._appendToRegexString(r, part);
//     }
//     return new $ZodTemplateLiteral({
//       ...this,
//       parts: [...this.parts, ...parts],
//       regexString: r,
//     });
//   }

//   protected _addPart(
//     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
//   ): $ZodTemplateLiteral {
//     const parts = [...this.parts, part];

//     return new $ZodTemplateLiteral({
//       ...this,
//       parts,
//       regexString: this._appendToRegexString(this.regexString, part),
//     });
//   }

//   protected _appendToRegexString(
//     regexString: string,
//     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
//   ): string {
//     return `^${this._unwrapRegExp(
//       regexString
//     )}${this._transformPartToRegexString(part)}$`;
//   }

//   protected _transformPartToRegexString(
//     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
//   ): string {
//     if (!(part instanceof core.$ZodType)) {
//       return this._escapeRegExp(part);
//     }

//     if (part instanceof $ZodLiteral) {
//       return this._escapeRegExp(part._def.value);
//     }

//     if (part instanceof $ZodString) {
//       return this._transformZodStringPartToRegexString(part);
//     }

//     if (part instanceof $ZodEnum || part instanceof $ZodNativeEnum) {
//       const values =
//         part instanceof $ZodEnum
//           ? part._def.values
//           : util.getValidEnumValues(part._def.values);

//       return `(${values.map(this._escapeRegExp).join("|")})`;
//     }

//     if (part instanceof $ZodUnion) {
//       return `(${(part._def.options as any[])
//         .map((option) => this._transformPartToRegexString(option))
//         .join("|")})`;
//     }

//     if (part instanceof $ZodNumber) {
//       return this._transformZodNumberPartToRegexString(part);
//     }

//     if (part instanceof $ZodOptional) {
//       return `(${this._transformPartToRegexString(part.unwrap())})?`;
//     }

//     if (part instanceof $ZodTemplateLiteral) {
//       return this._unwrapRegExp(part._def.regexString);
//     }

//     if (part instanceof $ZodBigInt) {
//       // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
//       return "\\-?\\d+";
//     }

//     if (part instanceof $ZodBoolean) {
//       return "(true|false)";
//     }

//     if (part instanceof $ZodNullable) {
//       do {
//         part = part.unwrap();
//       } while (part instanceof $ZodNullable);

//       return `(${this._transformPartToRegexString(part)}|null)${
//         part instanceof $ZodOptional ? "?" : ""
//       }`;
//     }

//     if (part instanceof $ZodBranded) {
//       return this._transformPartToRegexString(part.unwrap());
//     }

//     if (part instanceof $ZodAny) {
//       return ".*";
//     }

//     if (part instanceof $ZodNull) {
//       return "null";
//     }

//     if (part instanceof $ZodUndefined) {
//       return "undefined";
//     }

//     throw new err.ZodTemplateLiteralUnsupportedTypeError();
//   }

//   // FIXME: we don't support transformations, so `.trim()` is not supported.
//   protected _transformZodStringPartToRegexString(part: $ZodString): string {
//     let maxLength = Number.POSITIVE_INFINITY;
//     let minLength = 0;
//     let endsWith = "";
//     let startsWith = "";

//     for (const ch of part._def.checks) {
//       const regex = this._resolveRegexForStringCheck(ch);

//       if (regex) {
//         return this._unwrapRegExp(regex);
//       }

//       if (ch.kind === "endsWith") {
//         endsWith = ch.value;
//       } else if (ch.kind === "length") {
//         minLength = maxLength = ch.value;
//       } else if (ch.kind === "max") {
//         maxLength = Math.max(0, Math.min(maxLength, ch.value));
//       } else if (ch.kind === "min") {
//         minLength = Math.max(minLength, ch.value);
//       } else if (ch.kind === "startsWith") {
//         startsWith = ch.value;
//       } else {
//         throw new err.ZodTemplateLiteralUnsupportedCheckError(
//           $ZodFirstPartyTypeKind.ZodString,
//           ch.kind
//         );
//       }
//     }

//     const constrainedMinLength = Math.max(
//       0,
//       minLength - startsWith.length - endsWith.length
//     );
//     const constrainedMaxLength = Number.isFinite(maxLength)
//       ? Math.max(0, maxLength - startsWith.length - endsWith.length)
//       : Number.POSITIVE_INFINITY;

//     if (
//       constrainedMaxLength === 0 ||
//       constrainedMinLength > constrainedMaxLength
//     ) {
//       return `${startsWith}${endsWith}`;
//     }

//     return `${startsWith}.${this._resolveRegexWildcardLength(
//       constrainedMinLength,
//       constrainedMaxLength
//     )}${endsWith}`;
//   }

//   protected _resolveRegexForStringCheck(check: $ZodStringCheck): RegExp | null {
//     return {
//       [check.kind]: null,
//       cuid: cuidRegex,
//       cuid2: cuid2Regex,
//       datetime: check.kind === "datetime" ? datetimeRegex(check) : null,
//       email: emailRegex,
//       ip:
//         check.kind === "ip"
//           ? {
//               any: new RegExp(
//                 `^(${this._unwrapRegExp(
//                   ipv4Regex.source
//                 )})|(${this._unwrapRegExp(ipv6Regex.source)})$`
//               ),
//               v4: ipv4Regex,
//               v6: ipv6Regex,
//             }[check.version || "any"]
//           : null,
//       regex: check.kind === "regex" ? check.regex : null,
//       ulid: ulidRegex,
//       uuid: uuidRegex,
//     }[check.kind];
//   }

//   protected _resolveRegexWildcardLength(
//     minLength: number,
//     maxLength: number
//   ): string {
//     if (minLength === maxLength) {
//       return minLength === 1 ? "" : `{${minLength}}`;
//     }

//     if (maxLength !== Number.POSITIVE_INFINITY) {
//       return `{${minLength},${maxLength}}`;
//     }

//     if (minLength === 0) {
//       return "*";
//     }

//     if (minLength === 1) {
//       return "+";
//     }

//     return `{${minLength},}`;
//   }

//   // FIXME: we do not support exponent notation (e.g. 2e5) since it conflicts with `.int()`.
//   protected _transformZodNumberPartToRegexString(part: $ZodNumber): string {
//     let canBeNegative = true;
//     let canBePositive = true;
//     let min = Number.NEGATIVE_INFINITY;
//     let max = Number.POSITIVE_INFINITY;
//     let canBeZero = true;
//     let finite = false;
//     let isInt = false;
//     let acc = "";

//     for (const ch of part._def.checks) {
//       if (ch.kind === "finite") {
//         finite = true;
//       } else if (ch.kind === "int") {
//         isInt = true;
//       } else if (ch.kind === "max") {
//         max = Math.min(max, ch.value);

//         if (ch.value <= 0) {
//           canBePositive = false;

//           if (ch.value === 0 && !ch.inclusive) {
//             canBeZero = false;
//           }
//         }
//       } else if (ch.kind === "min") {
//         min = Math.max(min, ch.value);

//         if (ch.value >= 0) {
//           canBeNegative = false;

//           if (ch.value === 0 && !ch.inclusive) {
//             canBeZero = false;
//           }
//         }
//       } else {
//         throw new err.ZodTemplateLiteralUnsupportedCheckError(
//           $ZodFirstPartyTypeKind.ZodNumber,
//           ch.kind
//         );
//       }
//     }

//     if (Number.isFinite(min) && Number.isFinite(max)) {
//       finite = true;
//     }

//     if (canBeNegative) {
//       acc = `${acc}\\-`;

//       if (canBePositive) {
//         acc = `${acc}?`;
//       }
//     } else if (!canBePositive) {
//       return "0+";
//     }

//     if (!finite) {
//       acc = `${acc}(Infinity|(`;
//     }

//     if (!canBeZero) {
//       if (!isInt) {
//         acc = `${acc}((\\d*[1-9]\\d*(\\.\\d+)?)|(\\d+\\.\\d*[1-9]\\d*))`;
//       } else {
//         acc = `${acc}\\d*[1-9]\\d*`;
//       }
//     } else if (isInt) {
//       acc = `${acc}\\d+`;
//     } else {
//       acc = `${acc}\\d+(\\.\\d+)?`;
//     }

//     if (!finite) {
//       acc = `${acc}))`;
//     }

//     return acc;
//   }

//   protected _unwrapRegExp(regex: RegExp | string): string {
//     const flags = typeof regex === "string" ? "" : regex.flags;
//     const source = typeof regex === "string" ? regex : regex.source;

//     if (flags.includes("i")) {
//       return this._unwrapRegExp(this._makeRegexStringCaseInsensitive(source));
//     }

//     return source.replace(/(^\^)|(\$$)/g, "");
//   }

//   protected _makeRegexStringCaseInsensitive(regexString: string): string {
//     const isAlphabetic = (char: string) => char.match(/[a-z]/i) != null;

//     let caseInsensitive = "";
//     let inCharacterSet = false;
//     for (let i = 0; i < regexString.length; i++) {
//       const char = regexString.charAt(i);
//       const nextChar = regexString.charAt(i + 1);

//       if (char === "\\") {
//         caseInsensitive += `${char}${nextChar}`;
//         i++;
//         continue;
//       }

//       if (char === "[") {
//         inCharacterSet = true;
//       } else if (inCharacterSet && char === "]") {
//         inCharacterSet = false;
//       }

//       if (!isAlphabetic(char)) {
//         caseInsensitive += char;
//         continue;
//       }

//       if (!inCharacterSet) {
//         caseInsensitive += `[${char.toLowerCase()}${char.toUpperCase()}]`;
//         continue;
//       }

//       const charAfterNext = regexString.charAt(i + 2);

//       if (nextChar !== "-" || !isAlphabetic(charAfterNext)) {
//         caseInsensitive += `${char.toLowerCase()}${char.toUpperCase()}`;
//         continue;
//       }

//       caseInsensitive += `${char.toLowerCase()}-${charAfterNext.toLowerCase()}${char.toUpperCase()}-${charAfterNext.toUpperCase()}`;
//       i += 2;
//     }

//     return caseInsensitive;
//   }

//   protected _escapeRegExp(str: unknown): string {
//     if (typeof str !== "string") {
//       str = `${str}`;
//     }

//     return (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   }

//   static empty = (
//     params?: RawCreateParams & { coerce?: true }
//   ): $ZodTemplateLiteral => {
//     return new $ZodTemplateLiteral({
//       checks: [],
//       ...processCreateParams(params),
//       coerce: params?.coerce ?? false,
//       parts: [],
//       regexString: "^$",
//       typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral,
//     });
//   };

//   static create<
//     Part extends TemplateLiteralPart,
//     Parts extends [] | [Part, ...Part[]],
//   >(
//     parts: Parts,
//     params?: RawCreateParams & { coerce?: true }
//   ): $ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
//   static create(
//     parts: TemplateLiteralPart[],
//     params?: RawCreateParams & { coerce?: true }
//   ) {
//     return $ZodTemplateLiteral.empty(params)._addParts(parts) as any;
//   }
// }

// export enum $ZodFirstPartyTypeKind {
//   ZodString = "ZodString",
//   ZodNumber = "ZodNumber",
//   ZodNaN = "ZodNaN",
//   ZodBigInt = "ZodBigInt",
//   ZodBoolean = "ZodBoolean",
//   ZodDate = "ZodDate",
//   ZodFile = "ZodFile",
//   ZodSymbol = "ZodSymbol",
//   ZodUndefined = "ZodUndefined",
//   ZodNull = "ZodNull",
//   ZodAny = "ZodAny",
//   ZodUnknown = "ZodUnknown",
//   ZodNever = "ZodNever",
//   ZodVoid = "ZodVoid",
//   ZodArray = "ZodArray",
//   ZodObject = "ZodObject",
//   ZodUnion = "ZodUnion",
//   ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
//   ZodIntersection = "ZodIntersection",
//   ZodTuple = "ZodTuple",
//   ZodRecord = "ZodRecord",
//   ZodMap = "ZodMap",
//   ZodSet = "ZodSet",
//   ZodFunction = "ZodFunction",
//   ZodLazy = "ZodLazy",
//   ZodLiteral = "ZodLiteral",
//   ZodEnum = "ZodEnum",
//   ZodEffects = "ZodEffects",
//   ZodNativeEnum = "ZodNativeEnum",
//   ZodOptional = "ZodOptional",
//   ZodNullable = "ZodNullable",
//   ZodDefault = "ZodDefault",
//   ZodCatch = "ZodCatch",
//   ZodPromise = "ZodPromise",
//   ZodBranded = "ZodBranded",
//   ZodPipeline = "ZodPipeline",
//   ZodReadonly = "ZodReadonly",
//   ZodTemplateLiteral = "ZodTemplateLiteral",
// }

// export type ZodFirstPartySchemaTypes =
//   | $ZodString
//   | $ZodNumber
//   | $ZodNaN
//   | $ZodBigInt
//   | $ZodBoolean
//   | $ZodDate
//   | $ZodFile
//   | $ZodUndefined
//   | $ZodNull
//   | $ZodAny
//   | $ZodUnknown
//   | $ZodNever
//   | $ZodVoid
//   | $ZodArray
//   | $ZodObject
//   | $ZodUnion
//   | $ZodDiscriminatedUnion
//   | $ZodIntersection
//   | $ZodTuple
//   | $ZodRecord
//   | $ZodMap
//   | $ZodSet
//   | $ZodFunction
//   | $ZodLazy
//   | $ZodLiteral
//   | $ZodEnum
//   | $ZodEffects
//   | $ZodNativeEnum
//   | $ZodOptional
//   | $ZodNullable
//   | $ZodDefault
//   | $ZodCatch
//   | $ZodPromise
//   | $ZodBranded
//   | $ZodPipeline
//   | $ZodReadonly
//   | $ZodSymbol
//   | $ZodTemplateLiteral;
