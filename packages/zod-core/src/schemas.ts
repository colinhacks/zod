import * as base from "./base.js";
import * as checks from "./checks.js";
import type * as errors from "./errors.js";
import * as regexes from "./regexes.js";
import * as util from "./util.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodString      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodStringDef extends base.$ZodTypeDef {
  type: "string";
  coerce?: boolean;
  checks: base.$ZodCheck<string>[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodString<Input = unknown>
  extends base.$ZodType<string, Input> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodStringDef;
}

export const $ZodString: base.$constructor<$ZodString> =
  /*@__PURE__*/ base.$constructor("$ZodString", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.stringRegex;

    inst._typecheck = (input, _ctx) => {
      if (typeof input === "string") return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "string",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

//////////////////////////////   ZodStringFormat   //////////////////////////////

export interface $ZodStringFormatDef
  extends $ZodStringDef,
    checks.$ZodCheckStringFormatDef {
  error?:
    | errors.$ZodErrorMap<
        errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidStringFormat
      >
    | undefined;
}

export interface $ZodStringFormat
  extends $ZodString<string>,
    checks.$ZodCheckStringFormat {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodStringFormatDef;
}

export const $ZodStringFormat: base.$constructor<$ZodStringFormat> =
  /*@__PURE__*/ base.$constructor(
    "$ZodStringFormat",
    function (inst, def): void {
      def.checks = [inst, ...def.checks];
      $ZodString.init(inst, def);
      checks.$ZodCheckStringFormat.init(inst, def);
    }
  );

//////////////////////////////   ZodGUID   //////////////////////////////

export interface $ZodGUIDDef extends $ZodStringFormatDef {
  format: "guid";
}
export interface $ZodGUID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodGUIDDef;
}

export const $ZodGUID: base.$constructor<$ZodGUID> =
  /*@__PURE__*/ base.$constructor("$ZodGUID", (inst, def): void => {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.guidRegex;
  });

//////////////////////////////   ZodUUID   //////////////////////////////

export interface $ZodUUIDDef extends $ZodStringFormatDef {
  format: "uuid";
  version?: number;
}
export interface $ZodUUID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUUIDDef;
}

export const $ZodUUID: base.$constructor<$ZodUUID> =
  /*@__PURE__*/ base.$constructor("$ZodUUID", (inst, def): void => {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.uuidRegex(def.version);
  });

//////////////////////////////   ZodEmail   //////////////////////////////

export interface $ZodEmailDef extends $ZodStringFormatDef {
  format: "email";
}
export interface $ZodEmail extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEmailDef;
}

export const $ZodEmail: base.$constructor<$ZodEmail> =
  /*@__PURE__*/ base.$constructor("$ZodEmail", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.emailRegex;
  });

//////////////////////////////   ZodURL   //////////////////////////////

export interface $ZodURLDef extends $ZodStringFormatDef {
  format: "url";
}

export interface $ZodURL extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodURLDef;
}

export const $ZodURL: base.$constructor<$ZodURL> =
  /*@__PURE__*/ base.$constructor("$ZodURL", function (inst, def) {
    $ZodStringFormat.init(inst, def);
    inst.run2 = (ctx) => {
      try {
        const url = new URL(ctx.value);
        if (regexes.hostnameRegex.test(url.hostname)) return;
      } catch {}
      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: ctx.value,
        def,
      });
    };
  });

//////////////////////////////   ZodEmoji   //////////////////////////////

export interface $ZodEmojiDef extends $ZodStringFormatDef {
  format: "emoji";
}
export interface $ZodEmoji extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEmojiDef;
}

export const $ZodEmoji: base.$constructor<$ZodEmoji> =
  /*@__PURE__*/ base.$constructor("$ZodEmoji", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.emojiRegex();
  });

//////////////////////////////   ZodNanoID   //////////////////////////////

export interface $ZodNanoIDDef extends $ZodStringFormatDef {
  format: "nanoid";
}

export interface $ZodNanoID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNanoIDDef;
}

export const $ZodNanoID: base.$constructor<$ZodNanoID> =
  /*@__PURE__*/ base.$constructor("$ZodNanoID", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.nanoidRegex;
  });

//////////////////////////////   ZodCUID   //////////////////////////////

export interface $ZodCUIDDef extends $ZodStringFormatDef {
  format: "cuid";
}
export interface $ZodCUID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodCUIDDef;
}

export const $ZodCUID: base.$constructor<$ZodCUID> =
  /*@__PURE__*/ base.$constructor("$ZodCUID", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.cuidRegex;
  });

//////////////////////////////   ZodCUID2   //////////////////////////////

export interface $ZodCUID2Def extends $ZodStringFormatDef {
  format: "cuid2";
}
export interface $ZodCUID2 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodCUID2Def;
}

export const $ZodCUID2: base.$constructor<$ZodCUID2> =
  /*@__PURE__*/ base.$constructor("$ZodCUID2", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.cuid2Regex;
  });

//////////////////////////////   ZodULID   //////////////////////////////

export interface $ZodULIDDef extends $ZodStringFormatDef {
  format: "ulid";
}
export interface $ZodULID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodULIDDef;
}

export const $ZodULID: base.$constructor<$ZodULID> =
  /*@__PURE__*/ base.$constructor("$ZodULID", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.ulidRegex;
  });

//////////////////////////////   ZodXID   //////////////////////////////

export interface $ZodXIDDef extends $ZodStringFormatDef {
  format: "xid";
}
export interface $ZodXID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodXIDDef;
}

export const $ZodXID: base.$constructor<$ZodXID> =
  /*@__PURE__*/ base.$constructor("$ZodXID", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.xidRegex;
  });

//////////////////////////////   ZodKSUID   //////////////////////////////

export interface $ZodKSUIDDef extends $ZodStringFormatDef {
  format: "ksuid";
}
export interface $ZodKSUID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodKSUIDDef;
}

export const $ZodKSUID: base.$constructor<$ZodKSUID> =
  /*@__PURE__*/ base.$constructor("$ZodKSUID", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.ksuidRegex;
  });

//////////////////////////////   ZodISODateTime   //////////////////////////////

export interface $ZodISODateTimeDef extends $ZodStringFormatDef {
  format: "iso_datetime";
  precision: number | null;
  offset: boolean;
  local: boolean;
}
export interface $ZodISODateTime extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodISODateTimeDef;
}

export const $ZodISODateTime: base.$constructor<$ZodISODateTime> =
  /*@__PURE__*/ base.$constructor(
    "$ZodISODateTime",
    function (inst, def): void {
      $ZodStringFormat.init(inst, def);
      def.pattern = regexes.datetimeRegex(inst._def);
    }
  );

//////////////////////////////   ZodISODate   //////////////////////////////

export interface $ZodISODateDef extends $ZodStringFormatDef {
  format: "iso_date";
}
export interface $ZodISODate extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodISODateDef;
}

export const $ZodISODate: base.$constructor<$ZodISODate> =
  /*@__PURE__*/ base.$constructor("$ZodISODate", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.dateRegex;
  });

//////////////////////////////   ZodISOTime   //////////////////////////////

export interface $ZodISOTimeDef extends $ZodStringFormatDef {
  format: "iso_time";
  offset?: boolean;
  local?: boolean;
  precision?: number | null;
}
export interface $ZodISOTime extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodISOTimeDef;
}

export const $ZodISOTime: base.$constructor<$ZodISOTime> =
  /*@__PURE__*/ base.$constructor("$ZodISOTime", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.timeRegex(inst._def);
  });

//////////////////////////////   ZodISODuration   //////////////////////////////

export interface $ZodISODurationDef extends $ZodStringFormatDef {
  format: "duration";
}
export interface $ZodISODuration extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodISODurationDef;
}

export const $ZodISODuration: base.$constructor<$ZodISODuration> =
  /*@__PURE__*/ base.$constructor(
    "$ZodISODuration",
    function (inst, def): void {
      $ZodStringFormat.init(inst, def);
      def.pattern = regexes.durationRegex;
    }
  );

//////////////////////////////   ZodIP   //////////////////////////////

export interface $ZodIPDef extends $ZodStringFormatDef {
  format: "ip";
  version?: 4 | 6;
}
export interface $ZodIP extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIPDef;
}

export const $ZodIP: base.$constructor<$ZodIP> =
  /*@__PURE__*/ base.$constructor("$ZodIP", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    if (def.version === 4) def.pattern = regexes.ipv4Regex;
    else if (def.version === 6) def.pattern = regexes.ipv6Regex;
    else def.pattern = regexes.ipRegex;
  });

//////////////////////////////   ZodBase64   //////////////////////////////

export interface $ZodBase64Def extends $ZodStringFormatDef {
  format: "base64";
}
export interface $ZodBase64 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBase64Def;
}

export const $ZodBase64: base.$constructor<$ZodBase64> =
  /*@__PURE__*/ base.$constructor("$ZodBase64", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.base64Regex;
  });

//////////////////////////////   ZodJSONString   //////////////////////////////

export interface $ZodJSONStringDef extends $ZodStringFormatDef {
  format: "json_string";
}
export interface $ZodJSONString extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodJSONStringDef;
}

export const $ZodJSONString: base.$constructor<$ZodJSONString> =
  /*@__PURE__*/ base.$constructor("$ZodJSONString", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.run2 = (ctx) => {
      try {
        JSON.parse(ctx.value);
        return;
      } catch {
        ctx.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "json_string",
          input: ctx.value,
          def,
        });
      }
    };
  });

//////////////////////////////   ZodE164   //////////////////////////////

export interface $ZodE164Def extends $ZodStringFormatDef {
  format: "e164";
}
export interface $ZodE164 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodE164Def;
}

export const $ZodE164: base.$constructor<$ZodE164> =
  /*@__PURE__*/ base.$constructor("$ZodE164", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.e164Regex;
  });

//////////////////////////////   ZodJWT   //////////////////////////////

export function isValidJWT(
  token: string,
  algorithm: util.JWTAlgorithm | null = null
): boolean {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) return false;
    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));
    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") return false;
    if (
      algorithm &&
      (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

export interface $ZodJWTDef extends $ZodStringFormatDef {
  format: "jwt";
  algorithm?: util.JWTAlgorithm | undefined;
}
export interface $ZodJWT extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodJWTDef;
}

export const $ZodJWT: base.$constructor<$ZodJWT> =
  /*@__PURE__*/ base.$constructor("$ZodJWT", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.run2 = (ctx) => {
      if (isValidJWT(ctx.value, def.algorithm)) return;

      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "jwt",
        input: ctx.value,
        def,
      });
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export const NUMBER_FORMAT_RANGES: Record<
  $ZodNumberFormats,
  [number | bigint, number | bigint]
> = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
  uint64: [0, BigInt("18446744073709551615")],
  float32: [-3.4028234663852886e38, 3.4028234663852886e38],
  float64: [-1.7976931348623157e308, 1.7976931348623157e308],
};

export interface $ZodNumberDef extends base.$ZodTypeDef {
  type: "number";
  format?: $ZodNumberFormats | undefined;
  coerce?: boolean;
  checks: base.$ZodCheck<number>[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export type $ZodIntegerFormats =
  | "int32"
  | "uint32"
  | "int64"
  | "uint64"
  | "safeint";
export type $ZodFloatFormats = "float32" | "float64";
export type $ZodNumberFormats = $ZodIntegerFormats | $ZodFloatFormats;

export interface $ZodNumber<T = unknown> extends base.$ZodType<number, T> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNumberDef;
  computed?: {
    minimum?: number | bigint;
    maximum?: number | bigint;
    multiple_of?: number;
  };
}

// only use for z.numeber()

export const $ZodNumberFast: base.$constructor<$ZodNumber> =
  /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.numberRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "number" && !Number.isNaN(input))
        return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "number",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

export const $ZodNumber: base.$constructor<$ZodNumber> =
  /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
    $ZodNumberFast.init(inst, def); // no format checks
    def.format = def.format || "float64";
    // if format is integer:
    if (def.format.includes("int")) {
      inst._pattern = regexes.intRegex;
    }

    const fastcheck = inst._typecheck; // super._typecheck
    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format!];

    inst._typecheck = (input, _ctx) => {
      const result = fastcheck(input, _ctx) as base.$ZodResult<number>;

      if (base.$failed(result)) return result;

      if (isInt && !Number.isInteger(result.value)) {
        result.issues = result.issues || [];
        result.issues.push({
          origin,
          format: def.format,
          code: "invalid_type",
          input,
          def,
        });
        result.aborted = true;
        return result;
      }

      if (result.value! < minimum) {
        result.issues = result.issues || [];
        result.issues.push({
          origin: "number",
          input: input as number,
          code: "too_small",
          minimum: minimum as number,
          inclusive: true,
          def,
        });
      }

      if (result.value! > maximum) {
        result.issues = result.issues || [];
        result.issues.push({
          origin: "number",
          input: input as number,
          code: "too_big",
          maximum,
          def,
        } as any);
      }
      return result;
    };
  });

///////////////////////////////////////////
///////////////////////////////////////////
//////////                      ///////////
//////////      $ZodBoolean      //////////
//////////                      ///////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface $ZodBooleanDef extends base.$ZodTypeDef {
  type: "boolean";
  coerce?: boolean;
  checks?: base.$ZodCheck<boolean>[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodBoolean<T = unknown> extends base.$ZodType<boolean, T> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBooleanDef;
}

export const $ZodBoolean: base.$constructor<$ZodBoolean> =
  /*@__PURE__*/ base.$constructor("$ZodBoolean", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.booleanRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "boolean") return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "boolean",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodBigInt      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodBigIntDef extends base.$ZodTypeDef {
  type: "bigint";
  coerce?: boolean;
  checks: base.$ZodCheck<bigint>[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType>;
}

export interface $ZodBigInt<T = unknown> extends base.$ZodType<bigint, T> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBigIntDef;
}

export const $ZodBigInt: base.$constructor<$ZodBigInt> =
  /*@__PURE__*/ base.$constructor("$ZodBigInt", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.bigintRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "bigint") return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "bigint",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////       $ZodSymbol       //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
export interface $ZodSymbolDef extends base.$ZodTypeDef {
  type: "symbol";
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSymbol<T = unknown> extends base.$ZodType<symbol, T> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSymbolDef;
}

export const $ZodSymbol: base.$constructor<$ZodSymbol> =
  /*@__PURE__*/ base.$constructor("$ZodSymbol", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "symbol") return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "symbol",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodUndefined     //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodUndefinedDef extends base.$ZodTypeDef {
  type: "undefined";
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodUndefined extends base.$ZodType<undefined, undefined> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUndefinedDef;
}

export const $ZodUndefined: base.$constructor<$ZodUndefined> =
  /*@__PURE__*/ base.$constructor("$ZodUndefined", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.undefinedRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "undefined") return base.$succeed(undefined);
      return base.$fail(
        [
          {
            origin: "undefined",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodNull      /////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface $ZodNullDef extends base.$ZodTypeDef {
  type: "null";
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNull extends base.$ZodType<null, null> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNullDef;
}

export const $ZodNull: base.$constructor<$ZodNull> =
  /*@__PURE__*/ base.$constructor("$ZodNull", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.nullRegex;
    inst._typecheck = (input, _ctx) => {
      if (input === null) return base.$succeed(null);
      return base.$fail(
        [
          {
            origin: "null",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      $ZodAny     //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface $ZodAnyDef extends base.$ZodTypeDef {
  type: "any";
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodAny extends base.$ZodType<any, any> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodAnyDef;
}

export const $ZodAny: base.$constructor<$ZodAny> =
  /*@__PURE__*/ base.$constructor("$ZodAny", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input) => base.$succeed(input);
  });

/////////////////////////////////////////

export interface $ZodUnknownDef extends base.$ZodTypeDef {
  type: "unknown";
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodUnknown extends base.$ZodType<unknown, unknown> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUnknownDef;
}

export const $ZodUnknown: base.$constructor<$ZodUnknown> =
  /*@__PURE__*/ base.$constructor("$ZodUnknown", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input) => base.$succeed(input);
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNever      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodNeverDef extends base.$ZodTypeDef {
  type: "never";
  error?: errors.$ZodErrorMap<errors.$ZodIssue> | undefined;
}

export interface $ZodNever extends base.$ZodType<never, never> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNeverDef;
}

export const $ZodNever: base.$constructor<$ZodNever> =
  /*@__PURE__*/ base.$constructor("$ZodNever", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      return base.$fail(
        [
          {
            origin: "never",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodVoid      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface $ZodVoidDef extends base.$ZodTypeDef {
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodVoid extends base.$ZodType<void, void> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodVoidDef;
}

export const $ZodVoid: base.$constructor<$ZodVoid> =
  /*@__PURE__*/ base.$constructor("$ZodVoid", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "undefined") return base.$succeed(undefined);
      return base.$fail(
        [
          {
            origin: "void",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      $ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodDateDef extends base.$ZodTypeDef {
  type: "date";
  coerce?: boolean;
  error?:
    | errors.$ZodErrorMap<
        errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidDate
      >
    | undefined;
}

export interface $ZodDate<T = unknown> extends base.$ZodType<Date, T> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDateDef;
}

export const $ZodDate: base.$constructor<$ZodDate> =
  /*@__PURE__*/ base.$constructor("$ZodDate", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (input instanceof Date && !Number.isNaN(input.getTime()))
        return base.$succeed(input);
      if (def.coerce) {
        try {
          input = new Date(input as string | number | Date);
        } catch (_err: any) {}
      }

      if (!(input instanceof Date)) {
        return base.$fail(
          [
            {
              origin: "date",
              code: "invalid_type",
              input,
              def,
            },
          ],
          true
        );
      }

      if (Number.isNaN(input.getTime())) {
        return base.$fail([
          { origin: "date", code: "invalid_date", input, def },
        ]);
      }

      return base.$succeed(new Date(input.getTime()));
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodArray      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodArrayDef<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodTypeDef {
  type: "array";
  element: T;
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodArray<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"][], T["_input"][]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodArrayDef<T>;
}

function handleArrayResult(
  result: base.$ZodResult,
  final: base.$ZodResultFull<any[]>,
  index: number
) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

export const $ZodArray: base.$constructor<$ZodArray> =
  /*@__PURE__*/ base.$constructor("$ZodArray", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (!Array.isArray(input)) {
        return base.$fail(
          [
            {
              origin: "array",
              code: "invalid_type",

              input,
              def,
            },
          ],
          true
        );
      }

      // let async = false;
      const proms: Promise<any>[] = [];
      const final = base.$succeed(Array.from({ length: input.length }));

      for (const index in input) {
        const item = input[index];

        const result = def.element._parse(item, _ctx);
        if (result instanceof Promise) {
          proms.push(
            result.then((result) =>
              handleArrayResult(result, final, index as any)
            )
          );
        } else {
          handleArrayResult(result, final, index as any);
        }
      }

      // const parseResults = input.map((item, index) => {
      //   //  const item = input
      //   const result = def.element._parse(item, _ctx);
      //   // parseResults[i] = result;
      //   if (result instanceof Promise) {
      //     // async = true;
      //     proms.push(
      //       result.then((res) => handleArrayResult(res, final, index))
      //     );
      //     // break;
      //   } else {
      //   }
      //   return result;
      //   // if (base.$failed(result)) {
      //   //   issues.push(...base.$prefixIssues(i, result.issues!)); // = base.mergeIn(result);
      //   // fail = fail ? base.mergeFails(fail, result) : result;
      //   // }
      // });
      // for (const i of input) {
      //   const item = input
      //   const result = def.element._parse(item, _ctx);
      //   parseResults[i] = result;
      //   if (result instanceof Promise) {
      //     async = true;
      //     break;
      //   }
      //   if (base.$failed(result)) {
      //     issues.push(...base.$prefixIssues(i, result.issues!)); // = base.mergeIn(result);
      //     // fail = fail ? base.mergeFails(fail, result) : result;
      //   }
      // }

      if (proms.length) {
        return Promise.all(proms).then(() => final);
        // handleArrayResults(
        //   parseResults as base.$ZodResult<unknown>[],
        //   final
        // );
      }

      return final; //handleArrayResultsAsync(parseResults, final);
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodObject      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
// export type $ZodRawShape = object;
export type $ZodRawShape = Record<PropertyKey, any>;
// export type $ZodRawShape = Record<string, base.$ZodType>;
// export type $ZodRawShape = {
//   [k: PropertyKey]: base.$ZodType;
// };

export type $ZodShape = {
  [k: PropertyKey]: base.$ZodType;
};
// declare const $optional: unique symbol;
// export type $optional = typeof $optional;

export type Values<T> = T[keyof T];
type QuestionMarkKeys<T extends PropertyKey> = T extends `${infer K}?`
  ? K
  : never;
type NonQuestionMarkKeys<T extends PropertyKey> = Exclude<T, `${string}?`>;

export type _ObjectOutputOptionalKeys<T extends $ZodRawShape> = {
  [k in NonQuestionMarkKeys<keyof T>]: T[k] extends { _qout: "true" }
    ? k
    : never;
};
export type ObjectOutputOptionalKeys<T extends $ZodRawShape> = Values<
  _ObjectOutputOptionalKeys<T>
>;
export type ObjectOutputRequiredKeys<T extends $ZodRawShape> = Exclude<
  NonQuestionMarkKeys<keyof T>,
  ObjectOutputOptionalKeys<T>
>;

export type $InferObjectOutput<T extends $ZodRawShape> = {
  // [K in QuestionMarkKeys<keyof T>]?: T[`${K}?`]["_output"];
  [K in keyof T as K extends `${infer Key}?` ? Key : never]?: T[K]["_output"];
} & {
  [K in NonQuestionMarkKeys<keyof T>]: T[K]["_output"];
};
//  & {
//   [K in ObjectOutputRequiredKeys<T>]: T[K]["_output"];
// } & {
//   [K in ObjectOutputOptionalKeys<T>]?: T[K]["_output"];
// };

export type _ObjectInputOptionalKeys<T extends $ZodRawShape> = {
  [k in NonQuestionMarkKeys<keyof T>]: T[k] extends { _qin: "true" }
    ? k
    : never;
};
export type ObjectInputOptionalKeys<T extends $ZodRawShape> = Values<
  _ObjectInputOptionalKeys<T>
>;
export type ObjectInputRequiredKeys<T extends $ZodRawShape> = Exclude<
  NonQuestionMarkKeys<keyof T>,
  ObjectInputOptionalKeys<T>
>;
export type $InferObjectInput<T extends $ZodRawShape> = {
  [K in QuestionMarkKeys<keyof T>]?: T[`${K}?`]["_input"];
} & {
  [K in ObjectInputRequiredKeys<T>]: T[K]["_input"];
} & {
  [K in ObjectInputOptionalKeys<T>]?: T[K]["_input"];
};

// input
// export type StripQuestionMark<T extends string | number | symbol> =
//   T extends `${infer K}?` ? K : T;
// type _ObjectInputOptionalKeys<T extends $ZodRawShape> = {
//   [k in keyof T as StripQuestionMark<k>]: T[k]["_qin"] extends "true"
//     ? k
//     : never;
// };
// export type ObjectInputOptionalKeys<T extends $ZodRawShape> = Values<
//   _ObjectInputOptionalKeys<T>
// >;
// export type ObjectInputRequiredKeys<T extends $ZodRawShape> = Exclude<
//   keyof T,
//   ObjectInputOptionalKeys<T>
// >;

// export type $InferObjectOutput<T extends $ZodRawShape> = util.Flatten<{
//   [K in keyof T]: NonNullable<T[K]>["_output"];
// }>;
// export type $InferObjectInput<T extends $ZodRawShape> = {
//   [K in keyof T]: NonNullable<T[K]>["_input"];
// };

export type CleanShape<T extends $ZodRawShape> = {
  [k in keyof T]: T[k] extends base.$ZodType ? T[k] : never;
};
export interface $ZodObjectDef<Shape extends $ZodShape = $ZodShape>
  extends base.$ZodTypeDef {
  type: "object";
  shape: Shape;
  catchall?: base.$ZodType;
  error?:
    | errors.$ZodErrorMap<
        errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys
      >
    | undefined;
}

export interface $ZodObject<Shape extends $ZodRawShape = $ZodShape>
  extends base.$ZodType<$InferObjectOutput<Shape>, $InferObjectInput<Shape>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  // _shape: Shape;
  _def: $ZodObjectDef<{
    [k in keyof Shape]: Shape[k] extends base.$ZodType ? Shape[k] : never;
  }>;
  _disc: base.$DiscriminatorMap;
}

function handleObjectResult(
  result: base.$ZodResult,
  final: base.$ZodResultFull,
  key: PropertyKey
) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(key, result.issues));
  } else {
    (final.value as any)[key] = result.value;
  }
}

export const $ZodObject: base.$constructor<$ZodObject> =
  /*@__PURE__*/ base.$constructor("$ZodObject", (inst, def) => {
    base.$ZodType.init(inst, def);
    // for (const k in def.shape) {
    //   if (!(def.shape[k] instanceof base.$ZodType)) {
    //     throw new Error(`Invalid schema at key "${k}"`);
    //   }
    // }

    // inst._shape = def.shape;
    Object.defineProperty(inst, "_disc", {
      get() {
        const discMap: base.$DiscriminatorMap = new Map();
        for (const key in def.shape) {
          const field = def.shape[key];
          if (field._values || field._disc) {
            const o: base.$DiscriminatorMapElement = {
              values: new Set(field._values ?? []),
              maps: field._disc ? [field._disc] : [],
            };
            discMap.set(key, o)!;
          }
        }
        return discMap;
      },
    });

    const _computed = util.cached(() => {
      const _shapeKeys: Set<string | symbol> = new Set(
        Reflect.ownKeys(def.shape)
      );
      const _optionalKeys = new Set(
        Reflect.ownKeys(def.shape).filter((k) => {
          return def.shape[k]._qout === "true";
        })
      );
      const _allKeys = Reflect.ownKeys(def.shape);
      return { _shapeKeys, _optionalKeys, _allKeys };
    });

    inst._typecheck = (input: unknown, ctx) => {
      const { _shapeKeys, _optionalKeys, _allKeys } = _computed.value;
      if (!util.isPlainObject(input)) {
        return base.$fail(
          [
            {
              origin: "object",
              code: "invalid_type",
              input,
              def,
            },
          ],
          true
        );
      }

      const final = base.$result<Record<PropertyKey, unknown>>({}, []);
      const proms: Promise<any>[] = [];
      let unrecognizedKeys!: Set<string>;

      // iterate over shape keys
      for (const key of _allKeys) {
        const value = def.shape[key];
        // do not add omitted optional keys
        if (_optionalKeys.has(key)) {
          if (!(key in input)) continue;
        }

        const result = value._parse((input as any)[key], ctx);

        if (result instanceof Promise) {
          proms.push(
            result.then((result) => handleObjectResult(result, final, key))
          );
        } else {
          handleObjectResult(result, final, key);
        }
      }

      // iterate over input keys
      for (const key of Reflect.ownKeys(input)) {
        if (_shapeKeys.has(key)) continue;
        if (def.catchall) {
          const result = def.catchall._parse((input as any)[key]);
          if (result instanceof Promise) {
            proms.push(
              result.then((result) => {
                handleObjectResult(result, final, key);
              })
            );
            //async = true;
          } else {
            handleObjectResult(result, final, key);
          }
          // objectResults[key] = def.catchall._parse((input as any)[key]);
          // if (objectResults[key] instanceof Promise) async = true;
        }
      }

      if (unrecognizedKeys) {
        final.issues = final.issues ?? [];
        final.issues.push({
          origin: "object",
          code: "unrecognized_keys",
          keys: [...unrecognizedKeys],
          input: input,
          def,
        });
      }
      if (!proms.length) return final;
      return Promise.all(proms).then(() => final);
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                    ///////////
//////////      $ZodUnion      //////////
//////////                    ///////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface $ZodUnionDef extends base.$ZodTypeDef {
  options: base.$ZodType[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidUnion> | undefined;
}

export interface $ZodUnion<T extends base.$ZodType[] = base.$ZodType[]>
  extends base.$ZodType<T[number]["_output"], T[number]["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUnionDef;
}

function handleUnionResults(
  results: base.$ZodResult[],
  input: unknown,
  def: $ZodUnionDef,
  ctx?: base.$ParseContext
) {
  for (const result of results) {
    if (base.$succeeded(result)) return result;
  }

  return base.$fail([
    {
      origin: "union",
      code: "invalid_union",
      input,
      def,
      errors: results.map(
        (result) => base.$finalize(result.issues!, ctx).issues
      ),
    },
  ]);
}

export const $ZodUnion: base.$constructor<$ZodUnion> =
  /*@__PURE__*/ base.$constructor("$ZodUnion", (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._typecheck = (input, ctx) => {
      let async = false;
      const results: base.$ZodResult[] = [];
      for (const option of def.options) {
        const result = option._parse(input, ctx);
        results.push(result as base.$ZodResult);
        if (result instanceof Promise) async = true;
      }

      if (!async) return handleUnionResults(results, input, def, ctx);
      return Promise.all(results).then((results) => {
        return handleUnionResults(results, input, def, ctx);
      });
    };
  });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////                                  //////////
//////////      $ZodDiscriminatedUnion      //////////
//////////                                  //////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

export interface $ZodDiscriminatedUnionDef extends $ZodUnionDef {
  // _disc: Map<base.$ZodType, $DiscriminatorMap>;
}

export interface $ZodDiscriminatedUnion<
  Options extends base.$ZodType[] = base.$ZodType[],
> extends $ZodUnion<Options> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDiscriminatedUnionDef;
  _disc: base.$DiscriminatorMap;
}

function matchDiscriminators(
  input: any,
  discs: base.$DiscriminatorMap
): boolean {
  for (const [key, value] of discs) {
    const data = input?.[key];
    if (value.values.has(data)) return true;
    if (value.maps.length > 0) {
      for (const m of value.maps) {
        if (matchDiscriminators(data, m)) return true;
      }
    }
  }
  return false;
}

export const $ZodDiscriminatedUnion: base.$constructor<$ZodDiscriminatedUnion> =
  /*@__PURE__*/
  base.$constructor("$ZodDiscriminatedUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    const _super = inst._typecheck;
    const _disc: base.$DiscriminatorMap = new Map();
    for (const el of def.options) {
      if (!el._disc)
        throw new Error(`Invalid discriminated union element: ${el._def.type}`);
      for (const [key, o] of el._disc) {
        if (!_disc.has(key))
          _disc.set(key, {
            values: new Set(),
            maps: [],
          });
        const _o = _disc.get(key)!;
        for (const v of o.values) _o.values.add(v);
        for (const m of o.maps) _o.maps.push(m);
      }
    }
    inst._disc = _disc;

    const discMap: Map<base.$ZodType, base.$DiscriminatorMap> = new Map();
    for (const option of def.options) {
      const disc = option._disc;
      if (!disc) {
        throw new Error(
          `Invalid disciminated union element: ${option._def.type}`
        );
      }
      discMap.set(option, disc);
    }

    inst._typecheck = (input, _ctx) => {
      const filteredOptions: base.$ZodType[] = [];
      for (const option of def.options) {
        if (discMap.has(option)) {
          if (matchDiscriminators(input, discMap.get(option)!)) {
            filteredOptions.push(option);
          }
        } else {
          filteredOptions.push(option);
        }
      }

      if (filteredOptions.length === 1)
        return filteredOptions[0]._parse(input, _ctx) as any;

      return _super(input, _ctx);
    };
  });

////////////////////////////////////////////////
////////////////////////////////////////////////
//////////                            //////////
//////////      $ZodIntersection      //////////
//////////                            //////////
////////////////////////////////////////////////
////////////////////////////////////////////////
function mergeValues(
  a: any,
  b: any
):
  | { valid: true; data: any }
  | { valid: false; mergeErrorPath: (string | number)[] } {
  // const aType = parse.t(a);
  // const bType = parse.t(b);

  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (util.isPlainObject(a) && util.isPlainObject(b)) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util
      .objectKeys(a)
      .filter((key) => bKeys.indexOf(key) !== -1);

    const newObj: any = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        };
      }
      newObj[key] = sharedValue.data;
    }

    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }

    const newArray: unknown[] = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);

      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        };
      }

      newArray.push(sharedValue.data);
    }

    return { valid: true, data: newArray };
  }

  return { valid: false, mergeErrorPath: [] };
}

export interface $ZodIntersectionDef extends base.$ZodTypeDef {
  type: "intersection";
  left: base.$ZodType;
  right: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodIntersection<
  A extends base.$ZodType = base.$ZodType,
  B extends base.$ZodType = base.$ZodType,
> extends base.$ZodType<
    A["_output"] & B["_output"],
    A["_input"] & B["_input"]
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIntersectionDef;
}

function handleIntersectionResults(
  results: [base.$ZodResult, base.$ZodResult]
): base.$ZodResult {
  const [parsedLeft, parsedRight] = results;
  const result = base.$result(
    undefined,
    [...(parsedLeft.issues ?? []), ...(parsedRight.issues ?? [])],
    true
  );

  if (base.$failed(result)) return result;
  const merged = mergeValues(parsedLeft, parsedRight);

  if (!merged.valid) {
    throw new Error(
      // biome-ignore lint:
      `Unmergable intersection types at ` +
        `${merged.mergeErrorPath.join(".")}: ${typeof parsedLeft} and ${typeof parsedRight}`
    );
  }

  result.value = merged.data;
  return merged.data;
}

export const $ZodIntersection: base.$constructor<$ZodIntersection> =
  /*@__PURE__*/ base.$constructor("$ZodIntersection", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      const resultLeft = def.left._parse(input, _ctx);
      const resultRight = def.right._parse(input, _ctx);
      const async =
        resultLeft instanceof Promise || resultRight instanceof Promise;
      return async
        ? Promise.all([resultLeft, resultRight]).then(handleIntersectionResults)
        : handleIntersectionResults([resultLeft, resultRight]);
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodTuple      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodTupleDef<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodTypeDef {
  items: T;
  rest: Rest;
  error?:
    | errors.$ZodErrorMap<
        | errors.$ZodIssueInvalidType
        | errors.$ZodIssueTooBig<"array", Array<unknown>>
        | errors.$ZodIssueTooSmall<"array", Array<unknown>>
      >
    | undefined;
}

type ZodTupleItems = base.$ZodType[];
export type $InferTupleInputType<
  T extends ZodTupleItems,
  Rest extends base.$ZodType | null,
> = [
  ...TupleInputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_input"][] : []),
];
type TupleInputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["_input"];
};
type TupleInputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_qin"] extends "true"
    ? [...TupleInputTypeWithOptionals<Prefix>, Tail["_input"]?]
    : TupleInputTypeNoOptionals<T>
  : [];

export type $InferTupleOutputType<
  T extends ZodTupleItems,
  Rest extends base.$ZodType | null,
> = [
  ...TupleOutputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_output"][] : []),
];
type TupleOutputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["_output"];
};
type TupleOutputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_qout"] extends "true"
    ? [...TupleOutputTypeWithOptionals<Prefix>, Tail["_output"]?]
    : TupleOutputTypeNoOptionals<T>
  : [];

function handleTupleResult(
  result: base.$ZodResult,
  final: base.$ZodResultFull<any[]>,
  index: number
) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
    if (result.aborted) final.aborted = true;
  } else {
    final.value[index] = result.value;
  }
}

export interface $ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodType<
    $InferTupleOutputType<T, Rest>,
    $InferTupleInputType<T, Rest>
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodTupleDef<T, Rest>;
}

export const $ZodTuple: base.$constructor<$ZodTuple> =
  /*@__PURE__*/ base.$constructor("$ZodTuple", (inst, def) => {
    base.$ZodType.init(inst, def);
    const items = def.items;
    // const itemsLength = items.length;
    // const optIndex = itemsLength;
    const optStart =
      items.length -
      [...items].reverse().findIndex((item) => item._qout !== "true");

    // [string, number, string, boolean, string?, number?];
    // optStart = 3
    // first non-true index is 2
    // length is 5
    //

    inst._typecheck = (input, _ctx) => {
      if (!Array.isArray(input)) {
        return base.$fail(
          [
            {
              input,
              def,
              origin: "tuple",
              code: "invalid_type",
            },
          ],
          true
        );
      }

      // let async = false;
      const final = base.$result<any[]>(Array(input.length), []);
      const proms: Promise<any>[] = [];
      // const results: any[] = Array(input.length);

      if (!def.rest) {
        const tooBig = input.length > items.length;
        const tooSmall = input.length < optStart;
        if (tooBig || tooSmall)
          return base.$fail(
            [
              {
                input,
                def,
                origin: "array",
                ...(tooBig
                  ? { code: "too_big", maximum: items.length }
                  : { code: "too_small", minimum: items.length }),
              },
            ],
            true
          );
      }

      let i = -1;
      for (const item of items) {
        i++;
        if (i >= input.length) if (i >= optStart) continue;
        const result = item._parse(input[i], _ctx);

        if (result instanceof Promise) {
          proms.push(
            result.then((result) => handleTupleResult(result, final, i))
          );
        } else {
          handleTupleResult(result, final, i);
        }
      }

      if (def.rest) {
        const rest = input.slice(items.length);
        for (const el of rest) {
          i++;
          const result = def.rest._parse(el, _ctx);

          if (result instanceof Promise) {
            proms.push(
              result.then((result) => handleTupleResult(result, final, i))
            );
          } else {
            handleTupleResult(result, final, i);
          }
        }
      }

      if (proms.length) return Promise.all(proms).then(() => final);
      return final;
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodRecord      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

// interface $HasValues extends base.$ZodType<PropertyKey, PropertyKey> {
//   _values: base.$PrimitiveSet;
// }

// interface $HasPattern extends base.$ZodType<PropertyKey, PropertyKey> {
//   _pattern: RegExp;
// }

export interface $ZodPropertyKey
  extends base.$ZodType<PropertyKey, PropertyKey> {}

type $ZodRecordKey = base.$ZodType<
  string | number | symbol,
  string | number | symbol
>; // $HasValues | $HasPattern;
export interface $ZodRecordDef extends base.$ZodTypeDef {
  keySchema: $ZodRecordKey;
  valueSchema: base.$ZodType;
  error?:
    | errors.$ZodErrorMap<
        | errors.$ZodIssueInvalidType
        | errors.$ZodIssueInvalidKey<"record", Record<PropertyKey, unknown>>
      >
    | undefined;
}
// export type KeySchema = $HasValues | $HasPattern;
// export type RecordType<K extends string | number | symbol, V> = [
//   string,
// ] extends [K]
//   ? Record<K, V>
//   : [number] extends [K]
//     ? Record<K, V>
//     : [symbol] extends [K]
//       ? Record<K, V>
//       : [base.BRAND<string | number | symbol>] extends [K]
//         ? Record<K, V>
//         : Partial<Record<K, V>>;

export interface $ZodRecord<
  Key extends $ZodRecordKey = $ZodRecordKey,
  Value extends base.$ZodType = base.$ZodType,
> extends base.$ZodType<
    Record<Key["_output"], Value["_output"]>,
    Record<Key["_input"], Value["_input"]>
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodRecordDef;
}

export const $ZodRecord: base.$constructor<$ZodRecord> =
  /*@__PURE__*/ base.$constructor("$ZodRecord", (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._typecheck = (input: any, ctx) => {
      // const objectResults: any = {};
      // let fail!: base.$ZodFailure;
      // let async!: boolean;
      const final = base.$result<Record<PropertyKey, unknown>>({}, []);
      const proms: Promise<any>[] = [];

      if (!util.isPlainObject(input)) {
        return base.$fail(
          [
            {
              origin: "record",
              code: "invalid_type",
              input,
              def,
            },
          ],
          true
        );
      }

      if ("_values" in def.keySchema) {
        const values = def.keySchema._values;
        for (const key of values) {
          if (
            typeof key === "string" ||
            typeof key === "number" ||
            typeof key === "symbol"
          ) {
            const valueResult = def.valueSchema._parse(input[key], ctx);

            if (valueResult instanceof Promise) {
              proms.push(
                valueResult.then((val) => handleObjectResult(val, final, key))
              );
            } else handleObjectResult(valueResult, final, key);
            // objectResults[key] = valueResult;
          }
        }
        let unrecognized!: string[];
        for (const key in input) {
          if (!values.has(key)) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
        if (unrecognized && unrecognized.length > 0) {
          final.issues.push({
            origin: "record",
            code: "unrecognized_keys",
            input,
            def,
            keys: unrecognized,
          });
          final.aborted = true;
        }
      } else {
        for (const key of Reflect.ownKeys(input)) {
          const keyResult = def.keySchema._parse(key, ctx);
          if (keyResult instanceof Promise)
            throw new Error(
              "Async schemas not supported in object keys currently.\
Open an issue if you need this feature."
            );
          if (base.$failed(keyResult)) {
            // fail = fail ?? new base.$ZodFailure();
            // final.issues.push(...base.$prefixIssues(key, keyResult.issues));
            final.issues.push({
              origin: "record",
              code: "invalid_key",
              issues: base.$finalize(keyResult.issues).issues,
              input: key,
              path: [key],
              def,
            });
            // fail = base.mergeFails(fail, keyResult, key);
            continue;
          }
          const valueResult = def.valueSchema._parse(input[key], ctx);
          if (valueResult instanceof Promise) {
            proms.push(
              valueResult.then((val) => handleObjectResult(val, final, key))
            );
          } else handleObjectResult(valueResult, final, key);
          // objectResults[keyResult] = def.valueSchema._parse(input[key], ctx);
          // if (objectResults[key] instanceof Promise) async = true;
        }
      }

      if (proms.length) return Promise.all(proms).then(() => final); // handleObjectResults(objectResults, fail) as object;
      return final;
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodMap      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodMapDef extends base.$ZodTypeDef {
  keyType: base.$ZodType;
  valueType: base.$ZodType;
  error?:
    | errors.$ZodErrorMap<
        | errors.$ZodIssueInvalidType
        | errors.$ZodIssueInvalidKey<"map">
        | errors.$ZodIssueInvalidElement<"map", unknown>
      >
    | undefined;
}

export interface $ZodMap<
  Key extends base.$ZodType = base.$ZodType,
  Value extends base.$ZodType = base.$ZodType,
> extends base.$ZodType<
    Map<Key["_output"], Value["_output"]>,
    Map<Key["_input"], Value["_input"]>
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodMapDef;
}

export const $PropertyKeyTypes: Set<string> = new Set([
  "string",
  "number",
  "symbol",
]);

function handleMapResult(
  keyResult: base.$ZodResult,
  valueResult: base.$ZodResult,
  final: base.$ZodResultFull<Map<unknown, unknown>>,
  key: unknown,
  input: Map<any, any>,
  def: $ZodMapDef,
  ctx?: base.$ParseContext | undefined
): void {
  // if (base.$failed(result)) {
  //   final.issues.push(...base.$prefixIssues(key, result.issues));
  // } else {
  //   final.value.set(key, result.value);
  // }

  if (base.$failed(keyResult)) {
    // if (!fail) fail = new base.$ZodFailure();
    if ($PropertyKeyTypes.has(typeof key)) {
      final.issues.push(
        ...base.$prefixIssues(key as PropertyKey, keyResult.issues)
      );
      // fail = base.mergeFails(fail, keyResult, key as PropertyKey);
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_key",
        input,
        def,
        issues: base.$finalize(keyResult.issues, ctx).issues,
      });
    }
  }
  if (base.$failed(valueResult)) {
    // if (!fail) fail = new base.$ZodFailure();

    if ($PropertyKeyTypes.has(typeof key)) {
      final.issues.push(
        ...base.$prefixIssues(key as PropertyKey, valueResult.issues)
      );
      // fail = base.mergeFails(fail, valueResult, key as PropertyKey);
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_element",
        input,
        def,
        key: key,
        issues: base.$finalize(valueResult.issues, ctx).issues,
      });
    }
    // return final;
  } else {
    final.value.set(keyResult.value, valueResult.value);
  }
}

export const $ZodMap: base.$constructor<$ZodMap> =
  /*@__PURE__*/ base.$constructor("$ZodMap", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      if (!(input instanceof Map)) {
        return base.$fail([
          {
            origin: "map",
            code: "invalid_type",
            input,
            def,
          },
        ]);
      }

      // let async = false;
      // const mapResults: [unknown, unknown, unknown][] = [];
      const proms: Promise<any>[] = [];
      const final = base.$result<Map<any, any>>(new Map(), []);

      for (const [key, value] of input) {
        const keyResult = def.keyType._parse(key, ctx);
        const valueResult = def.valueType._parse(value, ctx);
        if (keyResult instanceof Promise || valueResult instanceof Promise) {
          proms.push(
            Promise.all([keyResult, valueResult]).then(
              ([keyResult, valueResult]) => {
                handleMapResult(
                  keyResult,
                  valueResult,
                  final,
                  key,
                  input,
                  def,
                  ctx
                );
              }
            )
          );
          // mapResults.push(Promise.all([keyResult, valueResult, key]) as any);
          // async = true;
        } else {
          //  mapResults.push([keyResult, valueResult, key]);
          handleMapResult(keyResult, valueResult, final, key, input, def, ctx);
        }
      }

      // if (async) return Promise.all(mapResults).then((mapResults) => handleMapResults(mapResults, input, _ctx));
      if (proms.length) return Promise.all(proms).then(() => final);
      return final;
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodSet      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodSetDef extends base.$ZodTypeDef {
  type: "set";
  valueType: base.$ZodType;
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSet<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<Set<T["_output"]>, Set<T["_input"]>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSetDef;
}

function handleSetResult(
  result: base.$ZodResult<any>,
  final: base.$ZodResultFull<Set<any>>
) {
  if (base.$failed(result)) {
    final.issues.push(...result.issues);
  } else {
    final.value.add(result.value);
  }
}

export const $ZodSet: base.$constructor<$ZodSet> =
  /*@__PURE__*/ base.$constructor("$ZodSet", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (!(input instanceof Set)) {
        return base.$fail(
          [
            {
              input,
              def,
              origin: "set",
              code: "invalid_type",
            },
          ],
          true
        );
      }

      // const setResults: any[] = Array(input.size);
      // let async!: boolean;
      const proms: Promise<any>[] = [];
      const final = base.$result<Set<any>>(new Set(), []);
      // let index = 0;
      for (const item of input) {
        const result = def.valueType._parse(item, _ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result) => handleSetResult(result, final)));
        } else handleSetResult(result, final);
        // setResults[index++] = result;
      }

      if (proms.length) return Promise.all(proms).then(() => final);
      return final;
    };
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodEnum      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export type $InferEnumOutput<T extends util.EnumLike> = T[keyof T];
export type $InferEnumInput<T extends util.EnumLike> = $InferEnumOutput<T>;

export interface $ZodEnumDef<T extends util.EnumLike = util.EnumLike>
  extends base.$ZodTypeDef {
  type: "enum";
  entries: T;
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidValue> | undefined;
}

export interface $ZodEnum<T extends util.EnumLike = util.EnumLike>
  extends base.$ZodType<$InferEnumOutput<T>, $InferEnumInput<T>> {
  enum: T;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEnumDef<T>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _values: base.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
}

export const $ZodEnum: base.$constructor<$ZodEnum> =
  /*@__PURE__*/ base.$constructor("$ZodEnum", (inst, def) => {
    base.$ZodType.init(inst, def);

    inst.enum = def.entries;
    const options = Object.values(def.entries);
    inst._values = new Set<util.Primitive>(options);
    inst._pattern = new RegExp(
      `^(${options
        .filter((k) => util.propertyKeyTypes.has(typeof k))
        .map((o) =>
          typeof o === "string" ? util.escapeRegex(o) : o.toString()
        )
        .join("|")})$`
    );
    inst._typecheck = (input, _ctx) => {
      if (inst._values.has(input as any)) {
        return base.$succeed(input) as any;
      }
      return base.$fail(
        [
          {
            origin: "enum",
            code: "invalid_value",
            options,
            input,
            def,
          },
        ],
        true
      );
    };
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodLiteral      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface $ZodLiteralDef extends base.$ZodTypeDef {
  type: "enum";
  literals: util.LiteralArray;
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidValue> | undefined;
}

export interface $ZodLiteral<T extends util.LiteralArray = util.LiteralArray>
  extends base.$ZodType<T[number], T[number]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodLiteralDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _values: base.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
}

export const $ZodLiteral: base.$constructor<$ZodLiteral> =
  /*@__PURE__*/ base.$constructor("$ZodLiteral", (inst, def) => {
    base.$ZodType.init(inst, def);

    // const options = def.literals.map((e) => e);
    inst._values = new Set<util.Primitive>(def.literals);
    inst._pattern = new RegExp(
      `^(${def.literals
        .filter((k) => util.propertyKeyTypes.has(typeof k))
        .map((o) =>
          typeof o === "string" ? util.escapeRegex(o) : o.toString()
        )
        .join("|")})$`
    );
    inst._typecheck = (input, _ctx) => {
      if (inst._values.has(input as any)) {
        return base.$succeed(input) as any;
      }
      return base.$fail(
        [
          {
            origin: "literal",
            code: "invalid_value",
            options: def.literals,
            input,
            def,
          },
        ],
        true
      );
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile        //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface $ZodFileDef extends base.$ZodTypeDef {
  type: "file";
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodFile extends base.$ZodType<File, File> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodFileDef;
}

export const $ZodFile: base.$constructor<$ZodFile> =
  /*@__PURE__*/ base.$constructor("$ZodFile", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (input instanceof File) return base.$succeed(input);
      return base.$fail(
        [
          {
            origin: "file",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };
  });

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////        $ZodEffect        //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////
export interface $ZodEffectDef extends base.$ZodTypeDef {
  type: "effect";
  effect: (
    input: unknown,
    ctx?: base.$ParseContext | undefined
  ) => util.MaybeAsync<unknown>;
  error?: errors.$ZodErrorMap<never> | undefined;
}
export interface $ZodEffect<O = unknown, I = unknown>
  extends base.$ZodType<O, I> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEffectDef;
}

export const $ZodEffect: base.$constructor<$ZodEffect> =
  /*@__PURE__*/ base.$constructor("$ZodEffect", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      const result = def.effect(input, ctx);
      return base.$succeed(result);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodOptional      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodOptionalDef extends base.$ZodTypeDef {
  type: "optional";
  innerType: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodOptional<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"] | undefined, T["_input"] | undefined> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodOptionalDef;

  _qin: "true";
  _qout: "true";
}

export const $ZodOptional: base.$constructor<$ZodOptional> =
  /*@__PURE__*/ base.$constructor("$ZodOptional", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = "true";
    inst._qout = "true";
    inst._typecheck = (input, _ctx) => {
      if (input === undefined) return base.$succeed(undefined);
      return def.innerType._parse(input, _ctx);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodNullable      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNullableDef extends base.$ZodTypeDef {
  type: "nullable";
  innerType: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodNullable<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"] | null, T["_input"] | null> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNullableDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodNullable: base.$constructor<$ZodNullable> =
  /*@__PURE__*/ base.$constructor("$ZodNullable", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;
    inst._typecheck = (input, _ctx) => {
      if (input === null) return base.$succeed(null);
      return def.innerType._parse(input, _ctx);
    };
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      $ZodSuccess        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface $ZodSuccessDef extends base.$ZodTypeDef {
  type: "success";
  innerType: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodSuccess<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<boolean, T["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSuccessDef;
}

export const $ZodSuccess: base.$constructor<$ZodSuccess> =
  /*@__PURE__*/ base.$constructor("$ZodSuccess", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      const result = def.innerType._parse(input, _ctx);
      if (result instanceof Promise)
        return result.then((result) => base.$succeed(!base.$failed(result)));
      return base.$succeed(!base.$failed(result));
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodDefaultDef extends base.$ZodTypeDef {
  type: "default";
  innerType: base.$ZodType;
  defaultValue: () => this["innerType"]["_input"];
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodDefault<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<
    util.NoUndefined<T["_output"]>,
    // T["_output"], // it can still return undefined
    T["_input"] | undefined
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDefaultDef;
  _qin: "true";
}

export const $ZodDefault: base.$constructor<$ZodDefault> =
  /*@__PURE__*/ base.$constructor("$ZodDefault", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = "true"; //def.innerType._qin;
    inst._typecheck = (input, _ctx) => {
      if (input === undefined) return base.$succeed(def.defaultValue());
      return def.innerType._parse(input, _ctx);
      // const result = def.innerType._parse(input, _ctx);
      // if (result instanceof Promise) {
      //   return result.then((result) =>
      //     handleDefaultResult(result, def.defaultValue)
      //   );
      // }
      // return handleDefaultResult(result, def.defaultValue);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodCatch        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodCatchDef extends base.$ZodTypeDef {
  type: "catch";
  innerType: base.$ZodType;
  catchValue: () => this["innerType"]["_output"];
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodCatch<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"], unknown> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodCatchDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodCatch: base.$constructor<$ZodCatch> =
  /*@__PURE__*/ base.$constructor("$ZodCatch", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;
    inst._typecheck = (input, _ctx) => {
      const result = def.innerType._parse(input, _ctx);
      if (result instanceof Promise) {
        return result.then((result) => {
          if (base.$failed(result)) return base.$succeed(def.catchValue());
          return result;
        });
      }
      if (base.$failed(result)) return base.$succeed(def.catchValue());
      return result;
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////        $ZodNaN         //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNaNDef extends base.$ZodTypeDef {
  type: "nan";
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNaN extends base.$ZodType<number, number> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNaNDef;
}

export const $ZodNaN: base.$constructor<$ZodNaN> =
  /*@__PURE__*/ base.$constructor("$ZodNaN", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input !== "number" || !Number.isNaN(input)) {
        return base.$fail(
          [
            {
              input,
              def,
              origin: "nan",
              code: "invalid_type",
            },
          ],
          true
        );
      }
      return base.$succeed(input);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodPipeline      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodPipelineDef extends base.$ZodTypeDef {
  type: "pipeline";
  in: base.$ZodType;
  out: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodPipeline<
  A extends base.$ZodType = base.$ZodType,
  B extends base.$ZodType = base.$ZodType,
> extends base.$ZodType<B["_output"], A["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodPipelineDef;
}

export const $ZodPipeline: base.$constructor<$ZodPipeline> =
  /*@__PURE__*/ base.$constructor("$ZodPipeline", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      const result = def.in._parse(input, _ctx);
      if (result instanceof Promise) {
        return result.then((result) => {
          if (base.$failed(result)) return result;
          return def.out._parse(result.value, _ctx);
        });
      }
      if (base.$failed(result)) return result;
      return def.out._parse(result.value, _ctx);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodReadonly      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

export type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? ReadonlyArray<V>
        : T extends BuiltIn
          ? T
          : Readonly<T>;

function handleReadonlyResult(
  result: base.$ZodResult
): Readonly<base.$ZodResult> {
  // if (base.$failed(result)) return result;
  result.value = Object.freeze(result.value);
  return result;
}
export interface $ZodReadonlyDef extends base.$ZodTypeDef {
  type: "readonly";
  innerType: base.$ZodType;
  error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodReadonly<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<MakeReadonly<T["_output"]>, MakeReadonly<T["_input"]>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodReadonlyDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodReadonly: base.$constructor<$ZodReadonly> =
  /*@__PURE__*/ base.$constructor("$ZodReadonly", (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;
    inst._typecheck = (input, _ctx) => {
      const result = def.innerType._parse(input, _ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
    };
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   $ZodTemplateLiteral   //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface $ZodTemplateLiteralDef extends base.$ZodTypeDef {
  type: "template_literal";
  parts: $TemplateLiteralPart[];
  error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}
export interface $ZodTemplateLiteral<Template extends string = string>
  extends base.$ZodType<Template, Template> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodTemplateLiteralDef;
}

export type $LiteralPart = string | number | boolean | null | undefined;
export interface $SchemaPart extends base.$ZodType<$LiteralPart, $LiteralPart> {
  _pattern: RegExp;
}
export type $TemplateLiteralPart = $LiteralPart | $SchemaPart;

type AppendToTemplateLiteral<
  Template extends string,
  Suffix extends $LiteralPart | base.$ZodType,
> = Suffix extends $LiteralPart
  ? `${Template}${Suffix}`
  : Suffix extends base.$ZodType<infer Output extends $LiteralPart>
    ? `${Template}${Output}`
    : never;

export type $PartsToTemplateLiteral<Parts extends $TemplateLiteralPart[]> =
  [] extends Parts
    ? ``
    : Parts extends [
          ...infer Rest extends $TemplateLiteralPart[],
          infer Last extends $TemplateLiteralPart,
        ]
      ? AppendToTemplateLiteral<$PartsToTemplateLiteral<Rest>, Last>
      : never;

export const $ZodTemplateLiteral: base.$constructor<$ZodTemplateLiteral> =
  /*@__PURE__*/ base.$constructor("$ZodTemplateLiteral", (inst, def) => {
    base.$ZodType.init(inst, def);
    const regexParts: string[] = [];
    for (const part of def.parts) {
      if (part instanceof base.$ZodType) {
        const source =
          part._pattern instanceof RegExp
            ? part._pattern.source
            : part._pattern;
        if (!source)
          throw new Error(`Invalid template literal part: ${part._traits}`);

        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else {
        regexParts.push(`${part}`);
      }
    }
    inst._pattern = new RegExp(`^${regexParts.join("")}$`);

    inst._typecheck = (input, _ctx) => {
      if (typeof input !== "string") {
        return base.$fail(
          [
            {
              input,
              def,
              origin: "template_literal",
              code: "invalid_type",
            },
          ],
          true
        );
      }

      if (!inst._pattern.test(input)) {
        return base.$fail(
          [
            {
              input,
              def,
              origin: "template_literal",
              code: "invalid_type",
            },
          ],
          true
        );
      }

      return base.$succeed(input);
    };
  });
