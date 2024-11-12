import * as checks from "./checks.js";
import * as core from "./core.js";
import type * as err from "./errors.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";
import * as util from "./util.js";

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodCore      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

// export type $DiscriminatorMap = Array<
//   { key: PropertyKey; discs: $DiscriminatorMap } | Set<unknown>
// >;

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodString      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodStringDef extends core.$ZodTypeDef {
  type: "string";
  coerce?: boolean;
  checks: core.$ZodCheck<string>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodString<Input = unknown>
  extends core.$ZodType<string, Input> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodStringDef;
}

export const $ZodString: core.$constructor<$ZodString> =
  /*@__PURE__*/ core.$constructor("$ZodString", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.stringRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "string") return input;
      return core.$ZodFailure.from(
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
    checks._$ZodCheckStringFormatDef {
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueInvalidType | err.$ZodIssueInvalidStringFormat
      >
    | undefined;
}

export interface $ZodStringFormat
  extends $ZodString<string>,
    checks._$ZodCheckStringFormat {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodStringFormatDef;
}

export const $ZodStringFormat: core.$constructor<$ZodStringFormat> =
  /*@__PURE__*/ core.$constructor(
    "$ZodStringFormat",
    function (inst, def): void {
      def.checks = [inst, ...def.checks];
      $ZodString.init(inst, def);
      checks._$ZodCheckStringFormat.init(inst, def);
    }
  );

//////////////////////////////   ZodUUID   //////////////////////////////

export interface $ZodUUIDDef extends $ZodStringFormatDef {
  format: "uuid";
  version?: number;
}
export interface $ZodUUID extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUUIDDef;
}

export const $ZodUUID: core.$constructor<$ZodUUID> =
  /*@__PURE__*/ core.$constructor("$ZodUUID", (inst, def): void => {
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

export const $ZodEmail: core.$constructor<$ZodEmail> =
  /*@__PURE__*/ core.$constructor("$ZodEmail", function (inst, def): void {
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

export const $ZodURL: core.$constructor<$ZodURL> =
  /*@__PURE__*/ core.$constructor("$ZodURL", function (inst, def) {
    $ZodStringFormat.init(inst, def);
    inst.run = (input) => {
      try {
        const url = new URL(input);
        if (regexes.hostnameRegex.test(url.hostname)) return;
      } catch {}
      return {
        issues: [
          {
            origin: "string",
            code: "invalid_format",
            format: def.format,
            input: input,
            def,
          },
        ],
      };
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

export const $ZodEmoji: core.$constructor<$ZodEmoji> =
  /*@__PURE__*/ core.$constructor("$ZodEmoji", function (inst, def): void {
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

export const $ZodNanoID: core.$constructor<$ZodNanoID> =
  /*@__PURE__*/ core.$constructor("$ZodNanoID", function (inst, def): void {
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

export const $ZodCUID: core.$constructor<$ZodCUID> =
  /*@__PURE__*/ core.$constructor("$ZodCUID", function (inst, def): void {
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

export const $ZodCUID2: core.$constructor<$ZodCUID2> =
  /*@__PURE__*/ core.$constructor("$ZodCUID2", function (inst, def): void {
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

export const $ZodULID: core.$constructor<$ZodULID> =
  /*@__PURE__*/ core.$constructor("$ZodULID", function (inst, def): void {
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

export const $ZodXID: core.$constructor<$ZodXID> =
  /*@__PURE__*/ core.$constructor("$ZodXID", function (inst, def): void {
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

export const $ZodKSUID: core.$constructor<$ZodKSUID> =
  /*@__PURE__*/ core.$constructor("$ZodKSUID", function (inst, def): void {
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

export const $ZodISODateTime: core.$constructor<$ZodISODateTime> =
  /*@__PURE__*/ core.$constructor(
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

export const $ZodISODate: core.$constructor<$ZodISODate> =
  /*@__PURE__*/ core.$constructor("$ZodISODate", function (inst, def): void {
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

export const $ZodISOTime: core.$constructor<$ZodISOTime> =
  /*@__PURE__*/ core.$constructor("$ZodISOTime", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.timeRegex(inst._def);
  });

//////////////////////////////   ZodDuration   //////////////////////////////

export interface $ZodDurationDef extends $ZodStringFormatDef {
  format: "duration";
}
export interface $ZodDuration extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDurationDef;
}

export const $ZodDuration: core.$constructor<$ZodDuration> =
  /*@__PURE__*/ core.$constructor("$ZodDuration", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.durationRegex;
  });

//////////////////////////////   ZodIP   //////////////////////////////

export interface $ZodIPDef extends $ZodStringFormatDef {
  format: "ip";
}
export interface $ZodIP extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIPDef;
}

export const $ZodIP: core.$constructor<$ZodIP> =
  /*@__PURE__*/ core.$constructor("$ZodIP", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.ipRegex;
    // const superCheck = inst._typecheck;
    // inst._typecheck = (input, _ctx) => {
    //   const result = superCheck(input, _ctx);
    //   let fail!: core.$ZodFailure;
    //   if (core.failed(result)) {
    //     if (core.aborted(result)) return result;
    //     fail = result;
    //   }

    //   if (regexes.ipv4Regex.test(input as string) || regexes.ipv6Regex.test(input as string))
    // return input as string;
    //   fail = fail ?? core.$ZodFailure.from([], );
    //   fail.push({ origin: "string", code: "invalid_format", format: "ip", input:
    // input as string }, ctx);
    //   return fail;
    // };
  });

//////////////////////////////   ZodIPv4   //////////////////////////////

export interface $ZodIPv4Def extends $ZodStringFormatDef {
  format: "ipv4";
}
export interface $ZodIPv4 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIPv4Def;
}

export const $ZodIPv4: core.$constructor<$ZodIPv4> =
  /*@__PURE__*/ core.$constructor("$ZodIPv4", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.ipv4Regex;
  });

//////////////////////////////   ZodIPv6   //////////////////////////////

export interface $ZodIPv6Def extends $ZodStringFormatDef {
  format: "ipv6";
}
export interface $ZodIPv6 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIPv6Def;
}

export const $ZodIPv6: core.$constructor<$ZodIPv6> =
  /*@__PURE__*/ core.$constructor("$ZodIPv6", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.ipv6Regex;
  });

//////////////////////////////   ZodBase64   //////////////////////////////

export interface $ZodBase64Def extends $ZodStringFormatDef {
  format: "base64";
}
export interface $ZodBase64 extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBase64Def;
}

export const $ZodBase64: core.$constructor<$ZodBase64> =
  /*@__PURE__*/ core.$constructor("$ZodBase64", function (inst, def): void {
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

export const $ZodJSONString: core.$constructor<$ZodJSONString> =
  /*@__PURE__*/ core.$constructor("$ZodJSONString", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.run = (input) => {
      try {
        JSON.parse(input);
        return;
      } catch {
        return {
          issues: [
            {
              origin: "string",
              code: "invalid_format",
              format: "json_string",
              input,
              def,
            },
          ],
        };
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

export const $ZodE164: core.$constructor<$ZodE164> =
  /*@__PURE__*/ core.$constructor("$ZodE164", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    def.pattern = regexes.e164Regex;
  });

//////////////////////////////   ZodJWT   //////////////////////////////

export function isValidJWT(
  token: string,
  algorithm: types.JWTAlgorithm | null = null
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
  algorithm?: types.JWTAlgorithm | undefined;
}
export interface $ZodJWT extends $ZodStringFormat {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodJWTDef;
}

export const $ZodJWT: core.$constructor<$ZodJWT> =
  /*@__PURE__*/ core.$constructor("$ZodJWT", function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.run = (input) => {
      if (isValidJWT(input, def.algorithm)) return;

      return {
        issues: [
          {
            origin: "string",
            code: "invalid_format",
            format: def.format,
            input: input,
            def,
          },
        ],
      };
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

export interface $ZodNumberDef extends core.$ZodTypeDef {
  type: "number";
  format?: $ZodNumberFormats | undefined;
  coerce?: boolean;
  checks: core.$ZodCheck<number>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export type $ZodIntegerFormats =
  | "int32"
  | "uint32"
  | "int64"
  | "uint64"
  | "safeint";
export type $ZodFloatFormats = "float32" | "float64";
export type $ZodNumberFormats = $ZodIntegerFormats | $ZodFloatFormats;

export interface $ZodNumber<T = unknown> extends core.$ZodType<number, T> {
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

export const $ZodNumberFast: core.$constructor<$ZodNumber> =
  /*@__PURE__*/ core.$constructor("$ZodNumber", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.numberRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "number" && !Number.isNaN(input)) return input;
      return core.$ZodFailure.from(
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

export const $ZodNumber: core.$constructor<$ZodNumber> =
  /*@__PURE__*/ core.$constructor("$ZodNumber", (inst, def) => {
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
      const result = fastcheck(input, _ctx) as core.$SyncParseResult<number>;

      if (core.failed(result)) return result;
      let fail!: core.$ZodFailure;
      if (isInt && !Number.isInteger(result)) {
        fail = core.$ZodFailure.from(
          [
            {
              origin,
              format: def.format,
              code: "invalid_type",
              input,
              def,
            },
          ],
          true
        );
      }

      if (result < minimum) {
        if (!fail) fail = new core.$ZodFailure();
        fail.push({
          origin: "number",
          input: input as number,
          code: "too_small",
          minimum: minimum as number,
          inclusive: true,
          def,
        });
      }

      if (result > maximum) {
        if (!fail) fail = new core.$ZodFailure();
        fail.push({
          origin: "number",
          input: input as number,
          code: "too_big",
          maximum,
          def,
        } as any);
      }
      return fail ?? result;
    };
  });

///////////////////////////////////////////
///////////////////////////////////////////
//////////                      ///////////
//////////      $ZodBoolean      //////////
//////////                      ///////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface $ZodBooleanDef extends core.$ZodTypeDef {
  type: "boolean";
  coerce?: boolean;
  checks?: core.$ZodCheck<boolean>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodBoolean<T = unknown> extends core.$ZodType<boolean, T> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBooleanDef;
}

export const $ZodBoolean: core.$constructor<$ZodBoolean> =
  /*@__PURE__*/ core.$constructor("$ZodBoolean", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.booleanRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "boolean") return input;
      return core.$ZodFailure.from(
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
export interface $ZodBigIntDef extends core.$ZodTypeDef {
  type: "bigint";
  coerce?: boolean;
  checks: core.$ZodCheck<bigint>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType>;
}

export interface $ZodBigInt<T = unknown> extends core.$ZodType<bigint, T> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodBigIntDef;
}

export const $ZodBigInt: core.$constructor<$ZodBigInt> =
  /*@__PURE__*/ core.$constructor("$ZodBigInt", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.bigintRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "bigint") return input;
      return core.$ZodFailure.from(
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
export interface $ZodSymbolDef extends core.$ZodTypeDef {
  type: "symbol";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSymbol<T = unknown> extends core.$ZodType<symbol, T> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSymbolDef;
}

export const $ZodSymbol: core.$constructor<$ZodSymbol> =
  /*@__PURE__*/ core.$constructor("$ZodSymbol", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "symbol") return input;
      return core.$ZodFailure.from(
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
export interface $ZodUndefinedDef extends core.$ZodTypeDef {
  type: "undefined";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodUndefined extends core.$ZodType<undefined, undefined> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUndefinedDef;
}

export const $ZodUndefined: core.$constructor<$ZodUndefined> =
  /*@__PURE__*/ core.$constructor("$ZodUndefined", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.undefinedRegex;
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "undefined") return undefined;
      return core.$ZodFailure.from(
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

export interface $ZodNullDef extends core.$ZodTypeDef {
  type: "null";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNull extends core.$ZodType<null, null> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNullDef;
}

export const $ZodNull: core.$constructor<$ZodNull> =
  /*@__PURE__*/ core.$constructor("$ZodNull", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.nullRegex;
    inst._typecheck = (input, _ctx) => {
      if (input === null) return null;
      return core.$ZodFailure.from(
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

export interface $ZodAnyDef extends core.$ZodTypeDef {
  type: "any";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodAny extends core.$ZodType<any, any> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodAnyDef;
}

export const $ZodAny: core.$constructor<$ZodAny> =
  /*@__PURE__*/ core.$constructor("$ZodAny", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input) => input;
  });

/////////////////////////////////////////

export interface $ZodUnknownDef extends core.$ZodTypeDef {
  type: "unknown";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodUnknown extends core.$ZodType<unknown, unknown> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUnknownDef;
}

export const $ZodUnknown: core.$constructor<$ZodUnknown> =
  /*@__PURE__*/ core.$constructor("$ZodUnknown", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input) => input;
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNever      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodNeverDef extends core.$ZodTypeDef {
  type: "never";
  error?: err.$ZodErrorMap<err.$ZodIssue> | undefined;
}

export interface $ZodNever extends core.$ZodType<never, never> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNeverDef;
}

export const $ZodNever: core.$constructor<$ZodNever> =
  /*@__PURE__*/ core.$constructor("$ZodNever", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      return core.$ZodFailure.from(
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

export interface $ZodVoidDef extends core.$ZodTypeDef {
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodVoid extends core.$ZodType<void, void> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodVoidDef;
}

export const $ZodVoid: core.$constructor<$ZodVoid> =
  /*@__PURE__*/ core.$constructor("$ZodVoid", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input === "undefined") return undefined;
      return core.$ZodFailure.from(
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
export interface $ZodDateDef extends core.$ZodTypeDef {
  type: "date";
  coerce?: boolean;
  error?:
    | err.$ZodErrorMap<err.$ZodIssueInvalidType | err.$ZodIssueInvalidDate>
    | undefined;
}

export interface $ZodDate<T = unknown> extends core.$ZodType<Date, T> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDateDef;
}

export const $ZodDate: core.$constructor<$ZodDate> =
  /*@__PURE__*/ core.$constructor("$ZodDate", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
      if (def.coerce) {
        try {
          input = new Date(input as string | number | Date);
        } catch (_err: any) {}
      }

      if (!(input instanceof Date)) {
        return core.$ZodFailure.from(
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
        return core.$ZodFailure.from([
          { origin: "date", code: "invalid_date", input, def },
        ]);
      }

      return new Date(input.getTime());
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodArray      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodArrayDef extends core.$ZodTypeDef {
  type: "array";
  element: core.$ZodType;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodArray<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"][], T["_input"][]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodArrayDef;
}

export const $ZodArray: core.$constructor<$ZodArray> =
  /*@__PURE__*/ core.$constructor("$ZodArray", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (!Array.isArray(input)) {
        return core.$ZodFailure.from(
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

      let fail!: core.$ZodFailure;
      let async = false;
      const parseResults = Array(input.length);
      for (const [i, item] of Object.entries(input) as [number, any]) {
        const result = def.element._parse(item, _ctx);
        parseResults[i] = result;
        if (result instanceof Promise) {
          async = true;
          break;
        }
        if (core.failed(result)) {
          fail = fail ? core.mergeFails(fail, result) : result;
        }
      }

      if (!async) {
        if (!fail) return parseResults as any;
        return fail;
      }

      return Promise.all(parseResults).then((results) => {
        for (const [i, result] of Object.entries(results)) {
          if (core.failed(result)) {
            fail = fail ? core.mergeFails(fail, result, i) : result;
          }
        }
        return fail ?? results;
      });
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodObject      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export type $ZodRawShape = {
  [k: PropertyKey]: core.$ZodType;
};
// type asdf = keyof $ZodRawShape;
// export type AddQuestionMarks<T extends $ZodRawShape> = {
//   [k in keyof T as T[k]["_qout"] extends true ? k : never]?: T[k]["_output"];
// } & {
//   [k in keyof T as boolean extends T[k]["_qout"] ? k : never]: T[k]["_output"];
// };

export type OptionalShapeKeys<T extends $ZodRawShape> = {
  [k in keyof T]: T[k]["_qout"] extends "true" ? k : never;
}[keyof T];
export type RequiredShapeKeys<T extends $ZodRawShape> = {
  [k in keyof T]: undefined extends T[k]["_qout"] ? k : never;
}[keyof T];
export type $InferObjectOutput<T extends $ZodRawShape> = {
  [K in RequiredShapeKeys<T>]: T[K]["_output"];
} & {
  [K in OptionalShapeKeys<T>]?: T[K]["_output"];
};
export type $InferObjectInput<T extends $ZodRawShape> = {
  [K in RequiredShapeKeys<T>]: T[K]["_input"];
} & {
  [K in OptionalShapeKeys<T>]?: T[K]["_input"];
};
// & { [k in keyof T]?: unknown };

// export type $InferObjectOutput<Shape extends $ZodRawShape> =
//   types.AddQuestionMarks<{
//     [k in keyof Shape]: Shape[k]["_output"];
//   }>;

// export type $InferObjectInput<Shape extends $ZodRawShape> =
//   types.AddQuestionMarks<{
//     [k in keyof Shape]: Shape[k]["_input"];
//   }>;

// type shapeToEntries<T extends $ZodRawShape> =
export interface $ZodObjectDef extends core.$ZodTypeDef {
  type: "object";
  shape: $ZodRawShape;
  catchall?: core.$ZodType;
  error?:
    | err.$ZodErrorMap<err.$ZodIssueInvalidType | err.$ZodIssueUnrecognizedKeys>
    | undefined;
}

export interface $ZodObject<Shape extends $ZodRawShape = $ZodRawShape>
  extends core.$ZodType<$InferObjectOutput<Shape>, $InferObjectInput<Shape>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodObjectDef;
  _disc: core.$DiscriminatorMap;
}

function handleObjectResults(
  results: Record<PropertyKey, core.$SyncParseResult>,
  fail?: core.$ZodFailure
) {
  for (const key in results) {
    if (core.failed(results[key])) {
      if (!fail) fail = new core.$ZodFailure();
      // core.mergeFails(fail, results[key], key);
      fail = core.mergeFails(fail, results[key], key);
    }
  }
  return fail ?? results;
}

async function handleObjectResultsAsync(
  results: Record<PropertyKey, core.$AsyncParseResult>,
  // ctx: core.$ParseContext | undefined,
  fail?: core.$ZodFailure
): core.$AsyncParseResult<object> {
  const resolvedResults = await util.promiseAllObject(results);
  return handleObjectResults(resolvedResults, fail);
}

export const $ZodObject: core.$constructor<$ZodObject> =
  /*@__PURE__*/ core.$constructor("$ZodObject", (inst, def) => {
    core.$ZodType.init(inst, def);

    const discMap: core.$DiscriminatorMap = new Map();
    for (const key in def.shape) {
      const field = def.shape[key];
      if (field._values || field._disc) {
        const o: core.$DiscriminatorMapElement = {
          values: new Set(field._values ?? []),
          maps: field._disc ? [field._disc] : [],
        };
        discMap.set(key, o)!;
      }
    }
    inst._disc = discMap;
    const _shapeKeys: Set<string | symbol> = new Set(
      Reflect.ownKeys(def.shape)
    );
    const _optionalKeys = new Set(
      Object.entries(def.shape).map(([_, v]) => {
        return (v as any)["~optional"];
      })
    );
    const _shapeEntries = Object.entries(def.shape);
    const _allKeys = Reflect.ownKeys(def.shape);
    inst._typecheck = (input: unknown, ctx) => {
      if (!util.isPlainObject(input)) {
        return core.$ZodFailure.from(
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

      let async!: true;
      let fail!: core.$ZodFailure;
      const objectResults: any = {}; // in coerce mode, reuse `input` instead of {}
      let unrecognizedKeys!: Set<string>;

      // iterate over shape keys
      for (const key of _allKeys) {
        const value = def.shape[key];
        // do not add omitted optional keys
        if (!(key in input) && _optionalKeys.has(key)) {
          continue;
        }

        const result = value._parse((input as any)[key], ctx);
        objectResults[key] = result;
        if (result instanceof Promise) async = true;
      }

      // iterate over input keys
      for (const key of Reflect.ownKeys(input)) {
        if (_shapeKeys.has(key)) continue;
        if (def.catchall) {
          objectResults[key] = def.catchall._parse((input as any)[key]);
          if (objectResults[key] instanceof Promise) async = true;
        }
      }

      if (unrecognizedKeys) {
        fail = core.$ZodFailure.from([
          {
            origin: "object",
            code: "unrecognized_keys",
            keys: [...unrecognizedKeys],
            input: input,
            def,
          },
        ]);
      }
      if (!async) return handleObjectResults(objectResults, fail) as object;
      return handleObjectResultsAsync(objectResults, fail) as any;
    };
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                    ///////////
//////////      $ZodUnion      //////////
//////////                    ///////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface $ZodUnionDef extends core.$ZodTypeDef {
  options: core.$ZodType[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidUnion> | undefined;
}

export interface $ZodUnion<T extends core.$ZodType[] = core.$ZodType[]>
  extends core.$ZodType<T[number]["_output"], T[number]["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodUnionDef;
}

function handleUnionResults(
  results: core.$SyncParseResult[],
  input: unknown,
  def: $ZodUnionDef,
  ctx?: core.$ParseContext
) {
  for (const result of results) {
    if (core.succeeded(result)) return result;
  }

  return core.$ZodFailure.from([
    {
      origin: "union",
      code: "invalid_union",
      input,
      def,
      errors: (results as any as core.$ZodFailure[]).map((fail) => fail.finalize(ctx).issues),
    },
  ]);
}

export const $ZodUnion: core.$constructor<$ZodUnion> =
  /*@__PURE__*/ core.$constructor("$ZodUnion", (inst, def) => {
    core.$ZodType.init(inst, def);

    inst._typecheck = (input, ctx) => {
      let async = false;
      const results: core.$SyncParseResult[] = [];
      for (const option of def.options) {
        const result = option._parse(input, ctx);
        results.push(result);
        if (result instanceof Promise) async = true;
        if (core.succeeded(result)) return result;
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
  // _disc: Map<core.$ZodType, $DiscriminatorMap>;
}

export interface $ZodDiscriminatedUnion<
  Options extends core.$ZodType[] = core.$ZodType[],
> extends $ZodUnion<Options> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDiscriminatedUnionDef;
  _disc: core.$DiscriminatorMap;
}
// function get(input: any, path: PropertyKey[]): any {
//   return path.reduce((acc, key) => acc?.[key], input);
// }
function matchDiscriminators(
  input: any,
  discs: core.$DiscriminatorMap
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

export const $ZodDiscriminatedUnion: core.$constructor<$ZodDiscriminatedUnion> =
  /*@__PURE__*/
  core.$constructor("$ZodDiscriminatedUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    const _super = inst._typecheck;
    const _disc: core.$DiscriminatorMap = new Map();
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

    const discMap: Map<core.$ZodType, core.$DiscriminatorMap> = new Map();
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
      const filteredOptions: core.$ZodType[] = [];
      for (const option of def.options) {
        if (discMap.has(option)) {
          if (matchDiscriminators(input, discMap.get(option)!)) {
            filteredOptions.push(option);
          }
        } else {
          filteredOptions.push(option);
        }
      }

      console.log(`filtered: ${filteredOptions.length}/${def.options.length}`);

      if (filteredOptions.length === 1)
        return filteredOptions[0]._parse(input, _ctx) as any;

      console.log(`fallback to union`);
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

export interface $ZodIntersectionDef extends core.$ZodTypeDef {
  type: "intersection";
  left: core.$ZodType;
  right: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodIntersection<
  A extends core.$ZodType = core.$ZodType,
  B extends core.$ZodType = core.$ZodType,
> extends core.$ZodType<
    A["_output"] & B["_output"],
    A["_input"] & B["_input"]
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodIntersectionDef;
}

function handleIntersectionResults(
  results: [core.$SyncParseResult, core.$SyncParseResult]
): core.$SyncParseResult {
  const [parsedLeft, parsedRight] = results;
  let fail!: core.$ZodFailure;
  if (core.failed(parsedLeft)) {
    fail = parsedLeft;
  }

  if (core.failed(parsedRight)) {
    fail = fail ? core.mergeFails(fail, parsedRight) : parsedRight;
  }

  if (fail) return fail;

  const merged = mergeValues(parsedLeft, parsedRight);
  if (!merged.valid) {
    throw new Error(
      // biome-ignore lint:
      `Unmergable intersection types at ` +
        `${merged.mergeErrorPath.join(".")}: ${typeof parsedLeft} and ${typeof parsedRight}`
    );
  }

  return merged.data;
}

export const $ZodIntersection: core.$constructor<$ZodIntersection> =
  /*@__PURE__*/ core.$constructor("$ZodIntersection", (inst, def) => {
    core.$ZodType.init(inst, def);
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

export interface $ZodTupleDef extends core.$ZodTypeDef {
  items: core.$ZodType[];
  rest: core.$ZodType | null;
  error?:
    | err.$ZodErrorMap<
        | err.$ZodIssueInvalidType
        | err.$ZodIssueTooBig<"array", Array<unknown>>
        | err.$ZodIssueTooSmall<"array", Array<unknown>>
      >
    | undefined;
}

type ZodTupleItems = core.$ZodType[];
export type $InferTupleInputType<
  T extends ZodTupleItems,
  Rest extends core.$ZodType | null,
> = [
  ...TupleInputTypeWithOptionals<T>,
  ...(Rest extends core.$ZodType ? Rest["_input"][] : []),
];
type TupleInputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["_input"];
};
type TupleInputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends core.$ZodType[],
  infer Tail extends core.$ZodType,
]
  ? Tail["_qin"] extends "true"
    ? [...TupleInputTypeWithOptionals<Prefix>, Tail["_input"]?]
    : TupleInputTypeNoOptionals<T>
  : [];

export type $InferTupleOutputType<
  T extends ZodTupleItems,
  Rest extends core.$ZodType | null,
> = [
  ...TupleOutputTypeWithOptionals<T>,
  ...(Rest extends core.$ZodType ? Rest["_output"][] : []),
];
type TupleOutputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["_output"];
};
type TupleOutputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends core.$ZodType[],
  infer Tail extends core.$ZodType,
]
  ? Tail["_qout"] extends "true"
    ? [...TupleOutputTypeWithOptionals<Prefix>, Tail["_output"]?]
    : TupleOutputTypeNoOptionals<T>
  : [];

function handleTupleResults<T extends unknown[]>(
  results: T,
  ctx: core.$ParseContext | undefined
): core.$SyncParseResult<T> {
  let fail!: core.$ZodFailure;
  for (const i in results) {
    const result = results[i];
    if (core.failed(result)) {
      if (!fail) fail = new core.$ZodFailure();
      fail = core.mergeFails(fail, result, i);
    }
  }
  return fail ?? results;
}

async function handleTupleResultsAsync<T extends Promise<unknown>[]>(
  results: T,
  ctx: core.$ParseContext | undefined
): core.$AsyncParseResult<T> {
  const resolvedResults = await Promise.all(results);
  return handleTupleResults(resolvedResults, ctx);
}

export interface $ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends core.$ZodType | null = core.$ZodType | null,
> extends core.$ZodType<
    $InferTupleOutputType<T, Rest>,
    $InferTupleInputType<T, Rest>
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodTupleDef;
}

export const $ZodTuple: core.$constructor<$ZodTuple> =
  /*@__PURE__*/ core.$constructor("$ZodTuple", (inst, def) => {
    core.$ZodType.init(inst, def);
    const items = def.items;
    // const itemsLength = items.length;
    // const optIndex = itemsLength;
    const optStart =
      items.length -
      [...items].reverse().findIndex((item) => item._qout !== "true");
    console.log({ optStart });
    // [string, number, string, boolean, string?, number?];
    // optStart = 3
    // first non-true index is 2
    // length is 5
    //

    inst._typecheck = (input, _ctx) => {
      if (!Array.isArray(input)) {
        return core.$ZodFailure.from(
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

      let async = false;
      const results: any[] = Array(input.length);

      if (!def.rest) {
        const tooBig = input.length > items.length;
        const tooSmall = input.length < optStart;
        if (tooBig || tooSmall)
          return core.$ZodFailure.from([
            {
              input,
              def,
              origin: "array",
              ...(tooBig
                ? { code: "too_big", maximum: items.length }
                : { code: "too_small", minimum: items.length }),
            },
          ]);
      }

      let i = -1;
      for (const item of items) {
        i++;
        if (i >= input.length) if (i >= optStart) continue;
        results[i] = item._parse(input[i], _ctx);
        if (results[i] instanceof Promise) async = true;
      }
      if (def.rest) {
        const rest = input.slice(items.length);
        for (const el of rest) {
          i++;
          const result = def.rest._parse(el, _ctx);
          results[i] = result;
          if (result instanceof Promise) async = true;
        }
      }

      if (!async) return handleTupleResults(results, _ctx);
      return handleTupleResultsAsync(results, _ctx);
    };
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodRecord      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

interface $HasValues extends core.$ZodType<PropertyKey, PropertyKey> {
  _values: core.$PrimitiveSet;
}

interface $HasPattern extends core.$ZodType<PropertyKey, PropertyKey> {
  _pattern: RegExp;
}

type $ZodRecordKey = core.$ZodType<
  string | number | symbol,
  string | number | symbol
>; // $HasValues | $HasPattern;
export interface $ZodRecordDef extends core.$ZodTypeDef {
  keySchema: $ZodRecordKey;
  valueSchema: core.$ZodType;
  error?:
    | err.$ZodErrorMap<
        | err.$ZodIssueInvalidType
        | err.$ZodIssueInvalidKey<"record", Record<PropertyKey, unknown>>
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
//       : [core.BRAND<string | number | symbol>] extends [K]
//         ? Record<K, V>
//         : Partial<Record<K, V>>;

export interface $ZodRecord<
  Key extends $ZodRecordKey = $ZodRecordKey,
  Value extends core.$ZodType = core.$ZodType,
> extends core.$ZodType<
    Record<Key["_output"], Value["_output"]>,
    Record<Key["_input"], Value["_input"]>
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodRecordDef;
}

export const $ZodRecord: core.$constructor<$ZodRecord> =
  /*@__PURE__*/ core.$constructor("$ZodRecord", (inst, def) => {
    core.$ZodType.init(inst, def);

    inst._typecheck = (input: any, ctx) => {
      const objectResults: any = {};
      let fail!: core.$ZodFailure;
      let async!: boolean;
      if (!util.isPlainObject(input)) {
        return core.$ZodFailure.from(
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
            if (valueResult instanceof Promise) async = true;
            objectResults[key] = valueResult;
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
          fail = core.$ZodFailure.from(
            [
              {
                origin: "record",
                code: "unrecognized_keys",
                input,
                def,
                keys: unrecognized,
              },
            ],
            true
          );
        }
      } else {
        for (const key of Reflect.ownKeys(input)) {
          console.log(key);
          const keyResult = def.keySchema._parse(key, ctx);
          if (keyResult instanceof Promise)
            throw new Error(
              "Async schemas not supported in object keys currently.\
Open an issue if you need this feature."
            );
          if (core.failed(keyResult)) {
            fail = fail ?? new core.$ZodFailure();
            fail.push({
              origin: "record",
              code: "invalid_key",
              issues: keyResult.finalize(ctx).issues,
              input: key,
              path: [key],
              def,
            });
            fail = core.mergeFails(fail, keyResult, key);
            continue;
          }
          objectResults[keyResult] = def.valueSchema._parse(input[key], ctx);
          if (objectResults[key] instanceof Promise) async = true;
        }
      }

      if (!async) return handleObjectResults(objectResults, fail) as object;
      return handleObjectResultsAsync(objectResults, fail) as any;
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodMap      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodMapDef extends core.$ZodTypeDef {
  keyType: core.$ZodType;
  valueType: core.$ZodType;
  error?:
    | err.$ZodErrorMap<
        | err.$ZodIssueInvalidType
        | err.$ZodIssueInvalidKey<"map">
        | err.$ZodIssueInvalidValue<"map", unknown>
      >
    | undefined;
}

export interface $ZodMap<
  Key extends core.$ZodType = core.$ZodType,
  Value extends core.$ZodType = core.$ZodType,
> extends core.$ZodType<
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
async function handleMapResultsAsync(
  _results: Promise<[core.$SyncParseResult, core.$SyncParseResult, unknown][]>,
  input: Map<any, any>,
  def: $ZodMapDef, 
  ctx?: core.$ParseContext
): core.$AsyncParseResult<Map<any, any>> {
  const results = await _results;
  return handleMapResults(results, input, def, ctx);
}

function handleMapResults(
  results: [unknown, unknown, unknown][],
  input: Map<any, any>,
  def: $ZodMapDef, ctx?: core.$ParseContext
): core.$SyncParseResult<Map<any, any>> {
  let fail!: core.$ZodFailure;
  const parsedMap = new Map();
  // console.log(results);
  for (const [keyResult, valueResult, originalKey] of results) {
    if (core.failed(keyResult)) {
      if (!fail) fail = new core.$ZodFailure();
      if ($PropertyKeyTypes.has(typeof originalKey)) {
        console.log(`merge!`);
        fail = core.mergeFails(fail, keyResult, originalKey as PropertyKey);
      } else {
        console.log(`push`);
        fail.push({
          origin: "map",
          code: "invalid_key",
          input,
          def,
          issues: keyResult.finalize(ctx).issues,
        });
      }
    }
    if (core.failed(valueResult)) {
      if (!fail) fail = new core.$ZodFailure();
      console.log(`failed valueResult`);
      if ($PropertyKeyTypes.has(typeof originalKey)) {
        console.log(`merge!`);
        fail = core.mergeFails(fail, valueResult, originalKey as PropertyKey);
      } else {
        fail.push({
          origin: "map",
          code: "invalid_value",
          input,
          def,
          key: originalKey,
          issues: valueResult.finalize(ctx).issues,
        });
      }
    } else {
      console.log(`setting ${keyResult} to ${valueResult}`);
      parsedMap.set(keyResult, valueResult);
    }
  }
  return fail ?? parsedMap;
}

export const $ZodMap: core.$constructor<$ZodMap> =
  /*@__PURE__*/ core.$constructor("$ZodMap", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      if (!(input instanceof Map)) {
        return core.$ZodFailure.from([
          {
            origin: "map",
            code: "invalid_type",
            input,
            def,
          },
        ]);
      }

      let async = false;
      const mapResults: [unknown, unknown, unknown][] = [];

      for (const [key, value] of input) {
        const keyResult = def.keyType._parse(key, ctx);
        const valueResult = def.valueType._parse(value, ctx);
        if (keyResult instanceof Promise || valueResult instanceof Promise) {
          mapResults.push(Promise.all([keyResult, valueResult, key]) as any);
          async = true;
        } else mapResults.push([keyResult, valueResult, key]);
      }

      // if (async) return Promise.all(mapResults).then((mapResults) => handleMapResults(mapResults, input, _ctx));
      if (async)
        return handleMapResultsAsync(Promise.all(mapResults), input, def, ctx);
      return handleMapResults(mapResults, input, def, ctx);
    };
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodSet      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodSetDef extends core.$ZodTypeDef {
  type: "set";
  valueType: core.$ZodType;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSet<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<Set<T["_output"]>, Set<T["_input"]>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSetDef;
}

function handleSetResults(
  setResults: core.$SyncParseResult<any>[],
  ctx: core.$ParseContext | undefined
) {
  const parsedSet = new Set();
  let fail!: core.$ZodFailure;
  for (const result of setResults) {
    if (core.failed(result)) {
      if (!fail) fail = new core.$ZodFailure();
      fail = core.mergeFails(fail, result);
    } else {
      parsedSet.add(result);
    }
  }
  return fail ?? parsedSet;
}

async function handleSetResultsAsync(
  _results: Promise<core.$SyncParseResult<any>[]>,
  ctx: core.$ParseContext | undefined
): core.$AsyncParseResult<Set<any>> {
  return handleSetResults(await _results, ctx);
}

export const $ZodSet: core.$constructor<$ZodSet> =
  /*@__PURE__*/ core.$constructor("$ZodSet", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (!(input instanceof Set)) {
        return core.$ZodFailure.from(
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

      const setResults: any[] = Array(input.size);
      let async!: boolean;
      let index = 0;
      for (const item of input) {
        const result = def.valueType._parse(item, _ctx);
        if (result instanceof Promise) {
          async = true;
        }
        setResults[index++] = result;
      }

      if (async) return handleSetResultsAsync(Promise.all(setResults), _ctx);
      return handleSetResults(setResults, _ctx);
    };
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodEnum      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type $EnumValue = string | number | bigint | boolean | symbol;
export type $EnumLike = Record<string | number, $EnumValue>;
export type $PrimitiveArray = Array<$EnumValue>;
export type $EnumValues = $EnumLike | $PrimitiveArray;
type IsString<T> = T extends PropertyKey ? T : never;
export type $ValuesToEnum<T extends $EnumValues> = T extends $EnumLike
  ? T
  : T extends Array<infer Els>
    ? {
        [k in IsString<Els>]: k;
      }
    : never;

// enum Color {
//   Red = "red",
//   Green = "green",
//   Blue = "blue",
// }
// type arg0 = $ValuesToEnum<typeof Color>;
// type arg1 = $ValuesToEnum<{ a: "a"; b: "b" }>;
// type arg2 = $ValuesToEnum<["a", "b"]>;
// type arg3 = $ValuesToEnum<["a", "b", true, 5, 10n]>;
// type arg4 = $ValuesToEnum<Array<"a" | "b" | 123 | false>>;
// type arg5 = $ValuesToEnum<{ a: "a"; b: "b"; c: 1234n; d: true }>;
// type arg6 = $ValuesToEnum<number[]>;
// type arg7 = $ValuesToEnum<string[]>;
// type arg8 = $ValuesToEnum<$PrimitiveArray>;

export type $InferEnumOutput<T extends $EnumValues> = T extends $EnumLike
  ? T[keyof T]
  : T extends $PrimitiveArray
    ? T[number]
    : keyof T;

export type $InferEnumInput<T extends $EnumValues> = $InferEnumOutput<T>;

// type inf0 = InferEnumOutput<typeof Color>;
// type inf1 = InferEnumOutput<{ a: "a"; b: "b" }>;
// type inf2 = InferEnumOutput<["a", "b"]>;
// type inf3 = InferEnumOutput<["a", "b", true, 5, 10n]>;
// type inf4 = InferEnumOutput<Array<"a" | "b" | 123 | false>>;
// type inf5 = InferEnumOutput<{ a: "a"; b: "b"; c: 1234n; d: true }>;
// type inf6 = InferEnumOutput<number[]>;

// type $EnumValues = Array<{ key?: string; value: types.Primitive }>;
type $EnumEntries = Array<{ key?: string; value: $EnumValue }>;
export interface $ZodEnumDef extends core.$ZodTypeDef {
  type: "enum";
  entries: $EnumEntries;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidEnum> | undefined;
}

export interface $ZodEnum<T extends $EnumValues = $EnumValues>
  extends core.$ZodType<$InferEnumOutput<T>, $InferEnumInput<T>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEnumDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _values: core.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
}

export function $toEnum(
  values: Array<{ key?: string; value: types.Primitive }>
): $ValuesToEnum<$EnumValues> {
  const _enum = {} as any;
  for (const { key, value } of values) {
    if (key) _enum[key] = value;
    if (typeof value === "string") _enum[value] = value;
    if (typeof value === "number") _enum[value] = value;
    if (typeof value === "symbol") _enum[value] = value;
  }
  return _enum;
}

export const $ZodEnum: core.$constructor<$ZodEnum> =
  /*@__PURE__*/ core.$constructor("$ZodEnum", (inst, def) => {
    core.$ZodType.init(inst, def);
    const options = def.entries.map((e) => e.value);
    inst._values = new Set<types.Primitive>(options);
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
        return input as any;
      }
      return core.$ZodFailure.from(
        [
          {
            origin: "enum",
            code: "invalid_enum",
            options,
            input,
            def,
          },
        ],
        true
      );
    };
  });

/////////////////////////////////////   $ZodLiteral   /////////////////////////////////////
// export interface $ZodLiteral<T extends types.Primitive[] = types.Primitive[]>
//   extends $ZodEnum<T> {
/** @deprecated Internal API, use with caution (not deprecated) */
//   _def: $ZodEnumDef;
// }

// export const $ZodLiteral: core.$constructor<$ZodLiteral> =
//   /*@__PURE__*/ core.$constructor("$ZodLiteral", (inst, def) => {
//     $ZodEnum.init(inst, def);
//   });

// /////////////////////////////////////   $ZodNativeEnum   /////////////////////////////////////
// export interface $ZodNativeEnum<T extends $EnumLike = $EnumLike>
//   extends $ZodEnum<T> {
/** @deprecated Internal API, use with caution (not deprecated) */
//   _def: $ZodEnumDef;
// }

// export const $ZodNativeEnum: core.$constructor<$ZodNativeEnum> =
//   /*@__PURE__*/ core.$constructor("$ZodNativeEnum", (inst, def) => {
//     $ZodEnum.init(inst, def);
//   });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile        //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface $ZodFileDef extends core.$ZodTypeDef {
  type: "file";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodFile extends core.$ZodType<File, File> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodFileDef;
}

export const $ZodFile: core.$constructor<$ZodFile> =
  /*@__PURE__*/ core.$constructor("$ZodFile", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (input instanceof File) return input;
      return core.$ZodFailure.from(
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
export interface $ZodEffectDef extends core.$ZodTypeDef {
  type: "effect";
  effect: (input: unknown, ctx?: core.$ParseContext | undefined) => unknown;
  error?: err.$ZodErrorMap<never> | undefined;
}
export interface $ZodEffect<O = unknown, I = unknown>
  extends core.$ZodType<O, I> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodEffectDef;
}

export const $ZodEffect: core.$constructor<$ZodEffect> =
  /*@__PURE__*/ core.$constructor("$ZodEffect", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = def.effect;
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodOptional      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodOptionalDef extends core.$ZodTypeDef {
  type: "optional";
  innerType: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodOptional<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"] | undefined, T["_input"] | undefined> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodOptionalDef;

  _qin: "true";
  _qout: "true";
}

export const $ZodOptional: core.$constructor<$ZodOptional> =
  /*@__PURE__*/ core.$constructor("$ZodOptional", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._qin = "true";
    inst._qout = "true";
    inst._typecheck = (input, _ctx) => {
      if (input === undefined) return undefined;
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
export interface $ZodNullableDef extends core.$ZodTypeDef {
  type: "nullable";
  innerType: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodNullable<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"] | null, T["_input"] | null> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNullableDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodNullable: core.$constructor<$ZodNullable> =
  /*@__PURE__*/ core.$constructor("$ZodNullable", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;
    inst._typecheck = (input, _ctx) => {
      if (input === null) return null;
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
export interface $ZodSuccessDef extends core.$ZodTypeDef {
  type: "success";
  innerType: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodSuccess<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<boolean, T["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodSuccessDef;
}

export const $ZodSuccess: core.$constructor<$ZodSuccess> =
  /*@__PURE__*/ core.$constructor("$ZodSuccess", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      const result = def.innerType._parse(input, _ctx);
      if (result instanceof Promise)
        return result.then((x) => core.succeeded(x));
      return core.succeeded(result);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
function handleDefaultResults(
  result: core.$SyncParseResult,
  defaultValue: () => any["_input"]
) {
  return core.succeeded(result)
    ? result === undefined
      ? defaultValue()
      : result
    : result;
}

export interface $ZodDefaultDef extends core.$ZodTypeDef {
  type: "default";
  innerType: core.$ZodType;
  defaultValue: () => this["innerType"]["_input"];
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodDefault<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<
    types.NoUndefined<T["_output"]>,
    // T["_output"], // it can still return undefined
    T["_input"] | undefined
  > {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodDefaultDef;
  _qin: T["_qin"];
}

export const $ZodDefault: core.$constructor<$ZodDefault> =
  /*@__PURE__*/ core.$constructor("$ZodDefault", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._typecheck = (input, _ctx) => {
      if (input === undefined) {
        input = def.defaultValue();
      }
      if (input instanceof Promise)
        return input
          .then((input) => def.innerType._parse(input, _ctx))
          .then((result) => handleDefaultResults(result, def.defaultValue));
      return handleDefaultResults(
        def.innerType._parse(input, _ctx),
        def.defaultValue
      );
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodCatch        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodCatchDef extends core.$ZodTypeDef {
  type: "catch";
  innerType: core.$ZodType;
  catchValue: (ctx: {
    error: core.$ZodFailure;
    input: unknown;
  }) => this["innerType"]["_input"];
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCatch<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"], unknown> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodCatchDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodCatch: core.$constructor<$ZodCatch> =
  /*@__PURE__*/ core.$constructor("$ZodCatch", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;
    inst._typecheck = (input, _ctx) => {
      const result = def.innerType._parse(input, _ctx);
      if (result instanceof Promise) {
        return result.then((res) => {
          return core.failed(res) ? def.catchValue({ error: res, input }) : res;
        });
      }
      return core.failed(result)
        ? def.catchValue({ error: result, input })
        : result;
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////        $ZodNaN         //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNaNDef extends core.$ZodTypeDef {
  type: "nan";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNaN extends core.$ZodType<number, number> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodNaNDef;
}

export const $ZodNaN: core.$constructor<$ZodNaN> =
  /*@__PURE__*/ core.$constructor("$ZodNaN", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      if (typeof input !== "number" || !Number.isNaN(input)) {
        return core.$ZodFailure.from(
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
      return input;
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodPipeline      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodPipelineDef extends core.$ZodTypeDef {
  type: "pipeline";
  in: core.$ZodType;
  out: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodPipeline<
  A extends core.$ZodType = core.$ZodType,
  B extends core.$ZodType = core.$ZodType,
> extends core.$ZodType<B["_output"], A["_input"]> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodPipelineDef;
}

export const $ZodPipeline: core.$constructor<$ZodPipeline> =
  /*@__PURE__*/ core.$constructor("$ZodPipeline", (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, _ctx) => {
      const result = def.in._parse(input, _ctx);
      if (result instanceof Promise) {
        return result.then((res) => {
          if (core.failed(res)) {
            return res;
          }
          return def.out._parse(res, _ctx);
        });
      }
      if (core.failed(result)) {
        return result;
      }
      return def.out._parse(result, _ctx);
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
  result: core.$SyncParseResult
): Readonly<core.$SyncParseResult> {
  if (core.failed(result)) return result;
  return Object.freeze(result);
}
export interface $ZodReadonlyDef extends core.$ZodTypeDef {
  type: "readonly";
  innerType: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodReadonly<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<MakeReadonly<T["_output"]>, MakeReadonly<T["_input"]>> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodReadonlyDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
}

export const $ZodReadonly: core.$constructor<$ZodReadonly> =
  /*@__PURE__*/ core.$constructor("$ZodReadonly", (inst, def) => {
    core.$ZodType.init(inst, def);
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

export interface $ZodTemplateLiteralDef extends core.$ZodTypeDef {
  type: "template_literal";
  parts: $TemplateLiteralPart[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodTemplateLiteral<Template extends string = string>
  extends core.$ZodType<Template, Template> {
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodTemplateLiteralDef;
}

export type $LiteralPart = string | number | boolean | null | undefined;
export interface $SchemaPart extends core.$ZodType<$LiteralPart, $LiteralPart> {
  _pattern: RegExp;
}
export type $TemplateLiteralPart = $LiteralPart | $SchemaPart;

type AppendToTemplateLiteral<
  Template extends string,
  Suffix extends $LiteralPart | core.$ZodType,
> = Suffix extends $LiteralPart
  ? `${Template}${Suffix}`
  : Suffix extends core.$ZodType<infer Output extends $LiteralPart>
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

export const $ZodTemplateLiteral: core.$constructor<$ZodTemplateLiteral> =
  /*@__PURE__*/ core.$constructor("$ZodTemplateLiteral", (inst, def) => {
    core.$ZodType.init(inst, def);
    const regexParts: string[] = [];
    for (const part of def.parts) {
      if (part instanceof core.$ZodType) {
        const source =
          part._pattern instanceof RegExp
            ? part._pattern.source
            : part._pattern;
        if (!source)
          throw new Error(`Invalid template literal part: ${part._traits}`);
        console.log({ source });
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
        return core.$ZodFailure.from(
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

      console.log(inst._pattern);
      if (!inst._pattern.test(input)) {
        return core.$ZodFailure.from(
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

      return input;
    };
  });
