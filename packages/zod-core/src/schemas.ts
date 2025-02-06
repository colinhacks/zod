import * as base from "./base.js";
import * as checks from "./checks.js";
import { Doc } from "./doc.js";
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodString<Input = unknown> extends base.$ZodType<string, Input> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  "~pattern": RegExp;
  "~def": $ZodStringDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodString: base.$constructor<$ZodString> = /*@__PURE__*/ base.$constructor("$ZodString", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst["~pattern"] = regexes.stringRegex;

  inst._parse = (input, _ctx) => {
    if (typeof input === "string") return base.$succeed(input);
    return base.$fail(
      [
        {
          expected: "string",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _) => {
    if (def.coerce) payload.value = Number(payload.value);
    if (typeof payload.value === "string") return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      def,
    });
    return payload;
  };
});

//////////////////////////////   ZodStringFormat   //////////////////////////////

export interface $ZodStringFormatDef<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends $ZodStringDef,
    checks.$ZodCheckStringFormatDef<Format> {
  /** Whether parsing should continue if this check fails. */
  // abort?: boolean;
}

export interface $ZodStringFormat extends $ZodString<string>, checks.$ZodCheckStringFormat {
  "~pattern": RegExp;
  "~def": $ZodStringFormatDef;
}

export const $ZodStringFormat: base.$constructor<$ZodStringFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodStringFormat",
  (inst, def): void => {
    // check initialization must come first
    checks.$ZodCheckStringFormat.init(inst, def);
    $ZodString.init(inst, def);
  }
);

//////////////////////////////   ZodGUID   //////////////////////////////

export interface $ZodGUIDDef extends $ZodStringFormatDef<"guid"> {
  // format: "guid";
}
export interface $ZodGUID extends $ZodStringFormat {
  "~def": $ZodStringFormatDef<"guid">;
}

export const $ZodGUID: base.$constructor<$ZodGUID> = /*@__PURE__*/ base.$constructor("$ZodGUID", (inst, def): void => {
  def.pattern ??= regexes.guidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodUUID   //////////////////////////////

export interface $ZodUUIDDef extends $ZodStringFormatDef<"uuid"> {
  version?: "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
}
export interface $ZodUUID extends $ZodStringFormat {
  "~def": $ZodUUIDDef;
}

export const $ZodUUID: base.$constructor<$ZodUUID> = /*@__PURE__*/ base.$constructor("$ZodUUID", (inst, def): void => {
  if (def.version) {
    const versionMap: Record<string, number> = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8,
    };
    const v = versionMap[def.version];
    if (v === undefined) throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ??= regexes.uuidRegex(v);
  } else def.pattern ??= regexes.uuidRegex();
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodEmail   //////////////////////////////

export interface $ZodEmailDef extends $ZodStringFormatDef<"email"> {}
export interface $ZodEmail extends $ZodStringFormat {
  "~def": $ZodEmailDef;
}

export const $ZodEmail: base.$constructor<$ZodEmail> = /*@__PURE__*/ base.$constructor(
  "$ZodEmail",
  (inst, def): void => {
    def.pattern ??= regexes.emailRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodURL   //////////////////////////////

export interface $ZodURLDef extends $ZodStringFormatDef<"url"> {}

export interface $ZodURL extends $ZodStringFormat {
  "~def": $ZodURLDef;
}

export const $ZodURL: base.$constructor<$ZodURL> = /*@__PURE__*/ base.$constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst["~check"] = (ctx) => {
    try {
      const url = new URL(ctx.value);
      regexes.hostnameRegex.lastIndex = 0;
      if (regexes.hostnameRegex.test(url.hostname)) return;
    } catch {}
    ctx.issues.push({
      code: "invalid_format",
      format: def.format,
      input: ctx.value,
      def,
    });
  };

  // inst._checkB = (payload) => {
  //   try {
  //     const url = new URL(payload.value);
  //     regexes.hostnameRegex.lastIndex = 0;
  //     if (regexes.hostnameRegex.test(url.hostname)) return;
  //   } catch {}
  //   payload.issues.push({
  //     code: "invalid_format",
  //     format: def.format,
  //     input: payload.value,
  //     def,
  //   });
  // };
});

//////////////////////////////   ZodEmoji   //////////////////////////////

export interface $ZodEmojiDef extends $ZodStringFormatDef<"emoji"> {}
export interface $ZodEmoji extends $ZodStringFormat {
  "~def": $ZodEmojiDef;
}

export const $ZodEmoji: base.$constructor<$ZodEmoji> = /*@__PURE__*/ base.$constructor(
  "$ZodEmoji",
  (inst, def): void => {
    def.pattern ??= regexes.emojiRegex();
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodNanoID   //////////////////////////////

export interface $ZodNanoIDDef extends $ZodStringFormatDef<"nanoid"> {}

export interface $ZodNanoID extends $ZodStringFormat {
  "~def": $ZodNanoIDDef;
}

export const $ZodNanoID: base.$constructor<$ZodNanoID> = /*@__PURE__*/ base.$constructor(
  "$ZodNanoID",
  (inst, def): void => {
    def.pattern ??= regexes.nanoidRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodCUID   //////////////////////////////

export interface $ZodCUIDDef extends $ZodStringFormatDef<"cuid"> {}
export interface $ZodCUID extends $ZodStringFormat {
  "~def": $ZodCUIDDef;
}

export const $ZodCUID: base.$constructor<$ZodCUID> = /*@__PURE__*/ base.$constructor("$ZodCUID", (inst, def): void => {
  def.pattern ??= regexes.cuidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodCUID2   //////////////////////////////

export interface $ZodCUID2Def extends $ZodStringFormatDef<"cuid2"> {}
export interface $ZodCUID2 extends $ZodStringFormat {
  "~def": $ZodCUID2Def;
}

export const $ZodCUID2: base.$constructor<$ZodCUID2> = /*@__PURE__*/ base.$constructor(
  "$ZodCUID2",
  (inst, def): void => {
    def.pattern ??= regexes.cuid2Regex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodULID   //////////////////////////////

export interface $ZodULIDDef extends $ZodStringFormatDef<"ulid"> {}
export interface $ZodULID extends $ZodStringFormat {
  "~def": $ZodULIDDef;
}

export const $ZodULID: base.$constructor<$ZodULID> = /*@__PURE__*/ base.$constructor("$ZodULID", (inst, def): void => {
  def.pattern ??= regexes.ulidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodXID   //////////////////////////////

export interface $ZodXIDDef extends $ZodStringFormatDef<"xid"> {}
export interface $ZodXID extends $ZodStringFormat {
  "~def": $ZodXIDDef;
}

export const $ZodXID: base.$constructor<$ZodXID> = /*@__PURE__*/ base.$constructor("$ZodXID", (inst, def): void => {
  def.pattern ??= regexes.xidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodKSUID   //////////////////////////////

export interface $ZodKSUIDDef extends $ZodStringFormatDef<"ksuid"> {}
export interface $ZodKSUID extends $ZodStringFormat {
  "~def": $ZodKSUIDDef;
}

export const $ZodKSUID: base.$constructor<$ZodKSUID> = /*@__PURE__*/ base.$constructor(
  "$ZodKSUID",
  (inst, def): void => {
    def.pattern ??= regexes.ksuidRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODateTime   //////////////////////////////

export interface $ZodISODateTimeDef extends $ZodStringFormatDef<"iso_datetime"> {
  precision: number | null;
  offset: boolean;
  local: boolean;
}
export interface $ZodISODateTime extends $ZodStringFormat {
  "~def": $ZodISODateTimeDef;
}

export const $ZodISODateTime: base.$constructor<$ZodISODateTime> = /*@__PURE__*/ base.$constructor(
  "$ZodISODateTime",
  (inst, def): void => {
    def.pattern ??= regexes.datetimeRegex(def);
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODate   //////////////////////////////

export interface $ZodISODateDef extends $ZodStringFormatDef<"iso_date"> {}
export interface $ZodISODate extends $ZodStringFormat {
  "~def": $ZodISODateDef;
}

export const $ZodISODate: base.$constructor<$ZodISODate> = /*@__PURE__*/ base.$constructor(
  "$ZodISODate",
  (inst, def): void => {
    def.pattern ??= regexes.dateRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISOTime   //////////////////////////////

export interface $ZodISOTimeDef extends $ZodStringFormatDef<"iso_time"> {
  offset?: boolean;
  local?: boolean;
  precision?: number | null;
}
export interface $ZodISOTime extends $ZodStringFormat {
  "~def": $ZodISOTimeDef;
}

export const $ZodISOTime: base.$constructor<$ZodISOTime> = /*@__PURE__*/ base.$constructor(
  "$ZodISOTime",
  (inst, def): void => {
    def.pattern ??= regexes.timeRegex(def);
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODuration   //////////////////////////////

export interface $ZodISODurationDef extends $ZodStringFormatDef<"duration"> {}
export interface $ZodISODuration extends $ZodStringFormat {
  "~def": $ZodISODurationDef;
}

export const $ZodISODuration: base.$constructor<$ZodISODuration> = /*@__PURE__*/ base.$constructor(
  "$ZodISODuration",
  (inst, def): void => {
    def.pattern ??= regexes.durationRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodIP   //////////////////////////////

export interface $ZodIPDef extends $ZodStringFormatDef<"ip"> {
  version?: "v4" | "v6";
}
export interface $ZodIP extends $ZodStringFormat {
  "~def": $ZodIPDef;
}

export const $ZodIP: base.$constructor<$ZodIP> = /*@__PURE__*/ base.$constructor("$ZodIP", (inst, def): void => {
  if (def.version === "v4") def.pattern ??= regexes.ipv4Regex;
  else if (def.version === "v6") def.pattern ??= regexes.ipv6Regex;
  else def.pattern ??= regexes.ipRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodBase64   //////////////////////////////

export interface $ZodBase64Def extends $ZodStringFormatDef<"base64"> {}
export interface $ZodBase64 extends $ZodStringFormat {
  "~def": $ZodBase64Def;
}

export const $ZodBase64: base.$constructor<$ZodBase64> = /*@__PURE__*/ base.$constructor(
  "$ZodBase64",
  (inst, def): void => {
    def.pattern ??= regexes.base64Regex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodJSONString   //////////////////////////////

export interface $ZodJSONStringDef extends $ZodStringFormatDef<"json_string"> {}
export interface $ZodJSONString extends $ZodStringFormat {
  "~def": $ZodJSONStringDef;
}

export const $ZodJSONString: base.$constructor<$ZodJSONString> = /*@__PURE__*/ base.$constructor(
  "$ZodJSONString",
  (inst, def): void => {
    $ZodStringFormat.init(inst, def);
    inst["~check"] = (ctx) => {
      try {
        JSON.parse(ctx.value);
        return;
      } catch {
        ctx.issues.push({
          code: "invalid_format",
          format: "json_string",
          input: ctx.value,
          def,
        });
      }
    };

    // inst._checkB = (payload) => {
    //   try {
    //     JSON.parse(payload.value);
    //     return;
    //   } catch {
    //     payload.issues.push({
    //       code: "invalid_format",
    //       format: "json_string",
    //       input: payload.value,
    //       def,
    //     });
    //   }
    // };
  }
);

//////////////////////////////   ZodE164   //////////////////////////////

export interface $ZodE164Def extends $ZodStringFormatDef<"e164"> {}
export interface $ZodE164 extends $ZodStringFormat {
  "~def": $ZodE164Def;
}

export const $ZodE164: base.$constructor<$ZodE164> = /*@__PURE__*/ base.$constructor("$ZodE164", (inst, def): void => {
  def.pattern ??= regexes.e164Regex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodJWT   //////////////////////////////

export function isValidJWT(token: string, algorithm: util.JWTAlgorithm | null = null): boolean {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) return false;
    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));
    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
    return true;
  } catch {
    return false;
  }
}

export interface $ZodJWTDef extends $ZodStringFormatDef<"jwt"> {
  alg?: util.JWTAlgorithm | undefined;
}
export interface $ZodJWT extends $ZodStringFormat {
  "~def": $ZodJWTDef;
}

export const $ZodJWT: base.$constructor<$ZodJWT> = /*@__PURE__*/ base.$constructor("$ZodJWT", (inst, def): void => {
  $ZodStringFormat.init(inst, def);
  inst["~check"] = (ctx) => {
    if (isValidJWT(ctx.value, def.alg)) return;

    ctx.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: ctx.value,
      def,
    });
  };

  // inst._checkB = (payload) => {
  //   if (!isValidJWT(payload.value, def.alg)) {
  //     payload.issues.push({
  //       code: "invalid_format",
  //       format: "jwt",
  //       input: payload.value,
  //       def,
  //     });
  //   }
  // };
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodNumberDef extends base.$ZodTypeDef {
  type: "number";
  coerce?: boolean;
  checks: base.$ZodCheck<number>[];
}

export interface $ZodNumber<T = unknown> extends base.$ZodType<number, T> {
  "~pattern": RegExp;
  "~def": $ZodNumberDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodNumber: base.$constructor<$ZodNumber> = /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst["~pattern"] = regexes.numberRegex;
  inst._parse = (input, _ctx) => {
    if (def.coerce) input = Number(input);
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return base.$succeed(input);
    return base.$fail(
      [
        {
          expected: "number",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    if (def.coerce) payload.value = Number(payload.value);
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
  };

  // inst._parseB = (payload, ctx) => {
  //   const { input } = payload;
  //   if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
  //   // return base.$fail(
  //   //   [
  //   //     {
  //   //       expected: "number",
  //   //       code: "invalid_type",
  //   //       input,
  //   //       def,
  //   //     },
  //   //   ],
  //   //   true
  //   // );
  //   ctx.issues.push({
  //     expected: "number",
  //     code: "invalid_type",
  //     input,
  //     def,
  //   });
  //   payload.aborted = true;
  //   return payload;
  // };
});

///////////////////////////////////////////////
//////////      ZodNumberFormat      //////////
///////////////////////////////////////////////
export interface $ZodNumberFormatDef extends $ZodNumberDef, checks.$ZodCheckNumberFormatDef {}

export interface $ZodNumberFormat extends $ZodNumber<number>, checks.$ZodCheckNumberFormat {
  "~def": $ZodNumberFormatDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodNumberFormat: base.$constructor<$ZodNumberFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodNumber",
  (inst, def) => {
    checks.$ZodCheckNumberFormat.init(inst, def);
    $ZodNumber.init(inst, def); // no format checks

    // if format is integer:
    if (def.format.includes("int")) {
      inst["~pattern"] = regexes.intRegex;
    }
  }
);

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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodBoolean<T = unknown> extends base.$ZodType<boolean, T> {
  "~pattern": RegExp;
  "~def": $ZodBooleanDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodBoolean: base.$constructor<$ZodBoolean> = /*@__PURE__*/ base.$constructor(
  "$ZodBoolean",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~pattern"] = regexes.booleanRegex;
    inst._parse = (input, _ctx) => {
      if (typeof input === "boolean") return base.$succeed(input);
      return base.$fail(
        [
          {
            expected: "boolean",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };

    inst._parseB = (payload, _ctx) => {
      if (def.coerce) payload.value = Boolean(payload.value);
      const input = payload.value;
      if (typeof input === "boolean") return payload;
      payload.issues.push({
        expected: "boolean",
        code: "invalid_type",
        input,
        def,
      });
      return payload;
    };
  }
);

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
}

export interface $ZodBigInt<T = unknown> extends base.$ZodType<bigint, T> {
  "~pattern": RegExp;
  /** @internal Internal API, use with caution */
  "~def": $ZodBigIntDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodBigInt: base.$constructor<$ZodBigInt> = /*@__PURE__*/ base.$constructor("$ZodBigInt", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst["~pattern"] = regexes.bigintRegex;
  inst._parse = (input, _ctx) => {
    if (typeof input === "bigint") return base.$succeed(input);
    return base.$fail(
      [
        {
          expected: "bigint",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    if (def.coerce) payload.value = BigInt(payload.value);
    const { value: input } = payload;
    if (typeof input === "bigint") return payload;
    payload.issues.push({
      expected: "bigint",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
  };
});

///////////////////////////////////////////////
//////////      ZodBigIntFormat      //////////
///////////////////////////////////////////////
export interface $ZodBigIntFormatDef extends $ZodBigIntDef, checks.$ZodCheckBigIntFormatDef {
  check: "bigint_format";
}

export interface $ZodBigIntFormat extends $ZodBigInt<bigint>, checks.$ZodCheckBigIntFormat {
  "~def": $ZodBigIntFormatDef;
}

export const $ZodBigIntFormat: base.$constructor<$ZodBigIntFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodNumber",
  (inst, def) => {
    checks.$ZodCheckBigIntFormat.init(inst, def);
    $ZodBigInt.init(inst, def); // no format checks
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodSymbol       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodSymbolDef extends base.$ZodTypeDef {
  type: "symbol";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSymbol extends base.$ZodType<symbol, symbol> {
  "~def": $ZodSymbolDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodSymbol: base.$constructor<$ZodSymbol> = /*@__PURE__*/ base.$constructor("$ZodSymbol", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    if (typeof input === "symbol") return base.$succeed(input);
    return base.$fail(
      [
        {
          expected: "symbol",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    const { value: input } = payload;
    if (typeof input === "symbol") return payload;
    payload.issues.push({
      expected: "symbol",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodUndefined extends base.$ZodType<undefined, undefined> {
  "~pattern": RegExp;
  "~def": $ZodUndefinedDef;
  "~values": base.$PrimitiveSet;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodUndefined: base.$constructor<$ZodUndefined> = /*@__PURE__*/ base.$constructor(
  "$ZodUndefined",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~pattern"] = regexes.undefinedRegex;
    inst["~values"] = new Set([undefined]);
    inst._parse = (input, _ctx) => {
      if (typeof input === "undefined") return base.$succeed(undefined);
      return base.$fail(
        [
          {
            expected: "undefined",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    };

    inst._parseB = (payload, _ctx) => {
      const { value: input } = payload;
      if (typeof input === "undefined") return payload;
      payload.issues.push({
        expected: "undefined",
        code: "invalid_type",
        input,
        def,
      });
      return payload;
    };
  }
);

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodNull      /////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface $ZodNullDef extends base.$ZodTypeDef {
  type: "null";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNull extends base.$ZodType<null, null> {
  "~pattern": RegExp;
  "~def": $ZodNullDef;
  "~values": base.$PrimitiveSet;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodNull: base.$constructor<$ZodNull> = /*@__PURE__*/ base.$constructor("$ZodNull", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst["~pattern"] = regexes.nullRegex;
  inst["~values"] = new Set([null]);
  inst._parse = (input, _ctx) => {
    if (input === null) return base.$succeed(null);
    return base.$fail(
      [
        {
          expected: "null",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    const { value: input } = payload;
    if (input === null) return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
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
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodAny extends base.$ZodType<any, any> {
  "~def": $ZodAnyDef;
  "~isst": never;
}

export const $ZodAny: base.$constructor<$ZodAny> = /*@__PURE__*/ base.$constructor("$ZodAny", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input) => base.$succeed(input);
  inst._parseB = (payload) => payload;
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodUnknown     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface $ZodUnknownDef extends base.$ZodTypeDef {
  type: "unknown";
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodUnknown extends base.$ZodType<unknown, unknown> {
  "~def": $ZodUnknownDef;
  "~isst": never;
}

export const $ZodUnknown: base.$constructor<$ZodUnknown> = /*@__PURE__*/ base.$constructor(
  "$ZodUnknown",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (input) => base.$succeed(input);
    inst._parseB = (payload) => payload;
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNever      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodNeverDef extends base.$ZodTypeDef {
  type: "never";
  // error?: errors.$ZodErrorMap<errors.$ZodIssue> | undefined;
}

export interface $ZodNever extends base.$ZodType<never, never> {
  "~def": $ZodNeverDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodNever: base.$constructor<$ZodNever> = /*@__PURE__*/ base.$constructor("$ZodNever", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    return base.$fail(
      [
        {
          expected: "never",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      def,
    });
    return payload;
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
  type: "void";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodVoid extends base.$ZodType<void, void> {
  "~def": $ZodVoidDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodVoid: base.$constructor<$ZodVoid> = /*@__PURE__*/ base.$constructor("$ZodVoid", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    if (typeof input === "undefined") return base.$succeed(undefined);
    return base.$fail(
      [
        {
          expected: "void",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    const { value: input } = payload;
    if (typeof input === "undefined") return payload;
    payload.issues.push({
      expected: "void",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
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
}

export interface $ZodDate<T = unknown> extends base.$ZodType<Date, T> {
  "~def": $ZodDateDef;
  "~isst": errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidDate;
}

export const $ZodDate: base.$constructor<$ZodDate> = /*@__PURE__*/ base.$constructor("$ZodDate", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    if (input instanceof Date && !Number.isNaN(input.getTime())) return base.$succeed(input);
    if (def.coerce) {
      try {
        input = new Date(input as string | number | Date);
      } catch (_err: any) {}
    }

    if (!(input instanceof Date)) {
      return base.$fail(
        [
          {
            expected: "date",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    }

    if (Number.isNaN(input.getTime())) {
      return base.$fail([{ code: "invalid_date", input, def }]);
    }

    return base.$succeed(new Date(input.getTime()));
  };

  inst._parseB = (payload, _ctx) => {
    if (def.coerce) {
      try {
        payload.value = new Date(payload.value as string | number | Date);
      } catch (_err: any) {}
    }
    const input = payload.value;

    if (!(input instanceof Date)) {
      payload.issues.push({
        expected: "date",
        code: "invalid_type",
        input,
        def,
      });
      // return payload;
    } else if (Number.isNaN(input.getTime())) {
      payload.issues.push({ code: "invalid_date", input, def });
    } else {
      payload.value = new Date(input.getTime());
    }

    return payload;
  };
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodArray      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodArrayDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "array";
  element: T;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodArray<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["~output"][], T["~input"][]> {
  "~def": $ZodArrayDef<T>;
  "~isst": errors.$ZodIssueInvalidType;
}

function handleArrayResult(result: base.$ZodResult, final: base.$ZodResult<any[]>, index: number) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

function handleArrayResultB(result: base.ParsePayloadB<any>, final: base.ParsePayloadB<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

export const $ZodArray: base.$constructor<$ZodArray> = /*@__PURE__*/ base.$constructor("$ZodArray", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, ctx) => {
    if (!Array.isArray(input)) {
      return base.$fail(
        [
          {
            expected: "array",
            code: "invalid_type",

            input,
            def,
          },
        ],
        true
      );
    }

    const proms: Promise<any>[] = [];
    const final = base.$result(Array.from({ length: input.length }));

    for (const index in input) {
      const item = input[index];

      const result = def.element._run(item, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, final, index as any)));
      } else {
        handleArrayResult(result, final, index as any);
      }
    }

    if (proms.length) {
      return Promise.all(proms).then(() => final);
    }

    return final; //handleArrayResultsAsync(parseResults, final);
  };

  inst._parseB = (payload, ctx) => {
    const input = payload.value;
    payload.value = [];
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        def,
      });
      return payload;
    }

    const proms: Promise<any>[] = [];
    // const final = [];//base.$result(Array.from({ length: input.length }));

    for (const index in input) {
      const item = input[index];

      const result = def.element._runB(
        {
          value: item,
          issues: [],
          $payload: true,
        },
        ctx
      );
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResultB(result, payload, index as any)));
      } else {
        handleArrayResultB(result, payload, index as any);
      }
    }

    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }

    return payload; //handleArrayResultsAsync(parseResults, final);
  };
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodObjectLike      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export type $ZodShape = Readonly<Record<string, base.$ZodType>>;

export interface $ZodObjectLikeDef extends base.$ZodTypeDef {
  type: "object" | "interface";
  // mode: "object" | "interface";
  shape: $ZodShape;
  catchall?: base.$ZodType | undefined;
}

export interface $ZodObjectLike<out O = object, out I = object> extends base.$ZodType<O, I> {
  "~def": $ZodObjectLikeDef;
  "~shape": $ZodShape;
  "~extra": Record<string, unknown>;
  "~disc": base.$DiscriminatorMap;
  "~isst": errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys;
}

function handleObjectResult(result: base.$ZodResult, final: base.$ZodResultWithIssues, key: PropertyKey) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(key, result.issues));
  } else {
    (final.value as any)[key] = result.value;
  }
}

function handleObjectResultB(result: base.ParsePayloadB, final: base.ParsePayloadB, key: PropertyKey) {
  if (result.issues.length) {
    final.issues.push(...base.$prefixIssuesB(key, result.issues));
  } else {
    (final.value as any)[key] = result.value;
  }
}

export const $ZodObjectLike: base.$constructor<$ZodObjectLike> = /*@__PURE__*/ base.$constructor(
  "$ZodObjectLike",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    Object.defineProperty(inst, "~disc", {
      get() {
        const discMap: base.$DiscriminatorMap = new Map();
        for (const key in def.shape) {
          const field = def.shape[key];
          if (field["~values"] || field["~disc"]) {
            const o: base.$DiscriminatorMapElement = {
              values: new Set(field["~values"] ?? []),
              maps: field["~disc"] ? [field["~disc"]] : [],
            };
            discMap.set(key, o)!;
          }
        }
        return discMap;
      },
    });

    const _normalized = util.cached(() => util.normalizeObjectLikeDef(def));

    inst._parse = (input, ctx) => {
      const { shape, keys, keySet, optionals } = _normalized.value;

      if (!util.isPlainObject(input)) {
        return base.$fail(
          [
            {
              expected: "object",
              code: "invalid_type",
              input,
              def,
            },
          ],
          true
        );
      }

      const final = base.$result({}, []);
      const proms: Promise<any>[] = [];
      let unrecognizedKeys!: Set<string>;

      // iterate over shape keys
      for (const key of keys) {
        const value = shape[key];

        if (!(key in input)) {
          // do not add omitted optional keys
          if (optionals.has(key)) continue;
        }

        const result = value._run((input as any)[key], ctx);

        if (result instanceof Promise) {
          proms.push(result.then((result) => handleObjectResult(result, final, key)));
        } else {
          handleObjectResult(result, final, key);
        }
      }

      // iterate over input keys
      if (def.catchall) {
        for (const key of Object.keys(input)) {
          if (keySet.has(key)) continue;
          // if (def.catchall) {
          const result = def.catchall._run((input as any)[key]);
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
          // objectResults[key] = def.catchall._run((input as any)[key]);
          // if (objectResults[key] instanceof Promise) async = true;
          // }
        }
      }

      if (unrecognizedKeys) {
        final.issues = final.issues ?? [];
        final.issues.push({
          code: "unrecognized_keys",
          keys: [...unrecognizedKeys],
          input: input,
          def,
        });
      }
      if (!proms.length) return final;
      return Promise.all(proms).then(() => final);
    };

    const fastParseShape = util.cached(() => {
      const { shape, keys, optionals, keyMap } = _normalized.value;
      const doc = new Doc(["shape", "payload", "ctx"]);
      const parseStr = (key: string) => {
        const k = util.esc(key);
        return `shape[${k}]._runB({ value: input[${k}], issues: [] }, ctx)`;
      };

      doc.write(`const input = payload.value;`);

      for (const key of keys) {
        // assign results to var based on ~id
        const id = shape[key]["~id"];
        doc.write(``);
        doc.write(`const ${id} = ${parseStr(key)};`);
        doc.write(`if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({ 
           ...iss, 
           path: iss.path ? [${util.esc(keyMap[key])}, ...iss.path] : [${util.esc(keyMap[key])}]
        })));`);
      }

      doc.write(`if (payload.issues.length && payload.issues.some(iss => iss.continue !== true)) return payload;`);

      // add required keys to result
      doc.write(`payload.value = {`);
      doc.indented(() => {
        for (const key of keys) {
          if (optionals.has(key)) continue;
          const id = shape[key]["~id"];
          doc.write(`  ${util.esc(key)}: ${id}.value,`);
          // doc.write(`${util.esc(key)}: ${parseStr(key)}.value,`);
        }
      });
      doc.write(`}`);

      // add in optionals if defined
      for (const key of keys) {
        if (optionals.has(key)) {
          const id = shape[key]["~id"];
          doc.write(`if (${util.esc(key)} in input) { payload.value[${util.esc(key)}] = ${id}.value; };`);
        }
      }

      doc.write(`return payload;`);
      return doc.compile();
    });

    inst._parseB = (payload, ctx) => {
      const { shape, keys, optionals, keySet } = _normalized.value;
      const { value: input } = payload;

      if (!util.isObject(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          def,
          abort: true,
        });
        return payload;
      }

      const fast = util.allowsEval.value && ctx.async === false;
      const proms: Promise<any>[] = [];

      if (fast) {
        // always synchronous
        // this overwrites payload.value
        fastParseShape.value(shape, payload, ctx);
      } else {
        payload.value = {};
        for (const key of keys) {
          const valueSchema = shape[key];

          // do not add omitted optional keys
          if (!(key in input)) {
            if (optionals.has(key)) continue;
          }

          const r = valueSchema._runB({ value: input[key], issues: [], $payload: true }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((r) => handleObjectResultB(r, payload, key)));
          } else {
            handleObjectResultB(r, payload, key);
          }
        }
      }

      if (def.catchall) {
        // iterate over input keys
        for (const key of Object.keys(input)) {
          if (keySet.has(key)) continue;

          const r = def.catchall._runB({ value: input[key], issues: [], $payload: true }, ctx);

          if (r instanceof Promise) {
            proms.push(r.then((r) => handleObjectResultB(r, payload, key)));
          } else {
            handleObjectResultB(r, payload, key);
          }
        }
      }

      if (!proms.length) return payload;
      return Promise.all(proms).then(() => {
        return payload;
      });
    };
  }
);

///////////////////////////////////////////////////
/////////////      $ZodInterface      /////////////
///////////////////////////////////////////////////
// looser type is required for recursive inference
export type $ZodLooseShape = Readonly<Record<string, any>>;

export type $InferInterfaceOutput<
  T extends $ZodLooseShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = string extends keyof T
  ? Record<string, unknown>
  : util.Flatten<
      {
        -readonly [k in keyof T as k extends `${infer K}?` ? K : never]?: T[k]["~output"];
      } & {
        -readonly [k in Exclude<keyof T, `${string}?`> as k extends `?${infer K}` ? K : k]: T[k]["~output"];
      } & Extra
    >;

export type $InferInterfaceInput<
  T extends $ZodLooseShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = string extends keyof T
  ? Record<string, unknown>
  : {
      -readonly [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K}` ? K : never]?: T[k]["~input"];
    } & {
      -readonly [k in Exclude<keyof T, `${string}?` | `?${string}`>]: T[k]["~input"];
    } & Extra;

export interface $ZodInterfaceDef extends $ZodObjectLikeDef {
  type: "interface";
}

export interface $ZodInterface<
  /** @ts-ignore Cast variance */
  out Shape extends $ZodLooseShape = $ZodLooseShape,
  out Extra extends Record<string, unknown> = Record<string, unknown>,
> extends $ZodObjectLike<$InferInterfaceOutput<Shape, Extra>, $InferInterfaceInput<Shape, Extra>> {
  "~def": $ZodInterfaceDef;
  "~shape": Shape;
  "~extra": Extra;
  "~subtype": "interface";
}

export const $ZodInterface: base.$constructor<$ZodInterface> = /*@__PURE__*/ base.$constructor(
  "$ZodInterface",
  (inst, def) => {
    $ZodObjectLike.init(inst, def);
  }
);

///////////////////////////////////////////////////////
/////////////      $ZodObject      /////////////
///////////////////////////////////////////////////////

// compute output type
type OptionalOutKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qout": "true" } ? k : never;
}[keyof T];
type OptionalOutProps<T extends $ZodShape> = {
  [k in OptionalOutKeys<T>]?: T[k]["~output"];
};
export type RequiredOutKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qout": "true" } ? never : k;
}[keyof T];
export type RequiredOutProps<T extends $ZodShape> = {
  [k in RequiredOutKeys<T>]: T[k]["~output"];
};
export type $InferObjectOutput<T extends $ZodShape, Extra extends Record<string, unknown>> = util.Flatten<
  OptionalOutProps<T> & RequiredOutProps<T> & Extra
>;

// compute input type
type OptionalInKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qin": "true" } ? k : never;
}[keyof T];
type OptionalInProps<T extends $ZodShape> = {
  [k in OptionalInKeys<T>]?: T[k]["~input"];
};
export type RequiredInKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qin": "true" } ? never : k;
}[keyof T];
export type RequiredInProps<T extends $ZodShape> = {
  [k in RequiredInKeys<T>]: T[k]["~input"];
};
export type $InferObjectInput<T extends $ZodShape, Extra extends Record<string, unknown>> = util.Flatten<
  OptionalInProps<T> & RequiredInProps<T> & Extra
>;

export interface $ZodObjectDef<Shape extends $ZodShape = $ZodShape> extends $ZodObjectLikeDef {
  type: "object";
  shape: Shape;
}

export interface $ZodObject<
  Shape extends $ZodShape = $ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends $ZodObjectLike<$InferObjectOutput<Shape, Extra>, $InferObjectInput<Shape, Extra>> {
  "~def": $ZodObjectDef<Shape>;
  "~shape": Shape;
  "~subtype": "object";
  "~extra": Extra;
}

export const $ZodObject: base.$constructor<$ZodObject> = /*@__PURE__*/ base.$constructor("$ZodObject", (inst, def) => {
  $ZodObjectLike.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                    ///////////
//////////      $ZodUnion      //////////
//////////                    ///////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface $ZodUnionDef extends base.$ZodTypeDef {
  type: "union";
  options: readonly base.$ZodType[];
}

export interface $ZodUnion<T extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends base.$ZodType<T[number]["~output"], T[number]["~input"]> {
  "~def": $ZodUnionDef;
  "~isst": errors.$ZodIssueInvalidUnion;
}

function handleUnionResults(results: base.$ZodResult[], input: unknown, def: $ZodUnionDef, ctx?: base.$ParseContext) {
  for (const result of results) {
    if (base.$succeeded(result)) return result;
  }

  return base.$fail([
    {
      code: "invalid_union",
      input,
      def,
      errors: results.map((result) => base.$finalize(result.issues!, ctx).issues),
    },
  ]);
}

function handleUnionResultsB(
  results: base.ParsePayloadB[],
  final: base.ParsePayloadB,
  def: $ZodUnionDef
  // ctx?: base.$ParseContext
) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }

  final.issues.push({
    code: "invalid_union",
    input: final.value,
    def,
    errors: results.map((result) => base.$finalize(result.issues).issues),
  });
  return final;
}

export const $ZodUnion: base.$constructor<$ZodUnion> = /*@__PURE__*/ base.$constructor("$ZodUnion", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (input, ctx) => {
    let async = false;
    const results: base.$ZodResult[] = [];
    for (const option of def.options) {
      const result = option._run(input, ctx);
      results.push(result as base.$ZodResult);
      if (result instanceof Promise) async = true;
    }

    if (!async) return handleUnionResults(results, input, def, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, input, def, ctx);
    });
  };

  inst._parseB = (payload, ctx) => {
    let async = false;

    const results: util.MaybeAsync<base.ParsePayloadB>[] = [];
    for (const option of def.options) {
      const result = option._runB(payload, ctx);
      results.push(result);
      if (result instanceof Promise) async = true;
    }

    if (!async) return handleUnionResultsB(results as base.ParsePayloadB[], payload, def);
    return Promise.all(results).then((results) => {
      return handleUnionResultsB(results as base.ParsePayloadB[], payload, def);
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
  unionFallback?: boolean;
}

export interface $ZodDiscriminatedUnion<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends $ZodUnion<Options> {
  "~def": $ZodDiscriminatedUnionDef;
  "~disc": base.$DiscriminatorMap;
}

function matchDiscriminators(input: any, discs: base.$DiscriminatorMap): boolean {
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
    const _super = inst._parse;
    const _disc: base.$DiscriminatorMap = new Map();
    for (const el of def.options) {
      if (!el["~disc"]) throw new Error(`Invalid discriminated union element: ${el["~def"].type}`);
      for (const [key, o] of el["~disc"]) {
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
    inst["~disc"] = _disc;

    const discMap: Map<base.$ZodType, base.$DiscriminatorMap> = new Map();
    for (const option of def.options) {
      const disc = option["~disc"];
      if (!disc) {
        throw new Error(`Invalid disciminated union element: ${option["~def"].type}`);
      }
      discMap.set(option, disc);
    }

    inst._parse = (input, ctx) => {
      if (!util.isObject(input)) {
        return base.$fail([
          {
            code: "invalid_type",
            expected: "object",
            input,
            def,
          },
        ]);
      }

      const filteredOptions: base.$ZodType[] = [];
      for (const option of def.options) {
        if (discMap.has(option)) {
          if (matchDiscriminators(input, discMap.get(option)!)) {
            filteredOptions.push(option);
          }
        } else {
          // no discriminator
          filteredOptions.push(option);
        }
      }

      if (filteredOptions.length === 1) return filteredOptions[0]._run(input, ctx) as any;

      if (def.unionFallback) {
        return _super(input, ctx);
      }
      return base.$fail([
        {
          code: "invalid_union",
          errors: [],
          note: "No matching discriminator",
          input,
          def,
        },
      ]);
    };

    inst._parseB = (payload, ctx) => {
      const input = payload.value;
      if (!util.isObject(input)) {
        payload.issues.push({
          code: "invalid_type",
          expected: "object",
          input,
          def,
        });
        return payload;
      }

      const filteredOptions: base.$ZodType[] = [];
      for (const option of def.options) {
        if (discMap.has(option)) {
          if (matchDiscriminators(input, discMap.get(option)!)) {
            filteredOptions.push(option);
          }
        } else {
          // no discriminator
          filteredOptions.push(option);
        }
      }

      if (filteredOptions.length === 1) return filteredOptions[0]._run(input, ctx) as any;

      if (def.unionFallback) {
        return _super(input, ctx);
      }
      payload.issues.push({
        code: "invalid_union",
        errors: [],
        note: "No matching discriminator",
        input,
        def,
      });
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
): { valid: true; data: any } | { valid: false; mergeErrorPath: (string | number)[] } {
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
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);

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
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodIntersection<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<A["~output"] & B["~output"], A["~input"] & B["~input"]> {
  "~def": $ZodIntersectionDef;
  "~isst": never;
}

function handleIntersectionResults(results: [base.$ZodResult, base.$ZodResult]): base.$ZodResult {
  const [parsedLeft, parsedRight] = results;
  const result = base.$result(undefined, [...(parsedLeft.issues ?? []), ...(parsedRight.issues ?? [])], true);

  if (base.$failed(result)) return result;
  const merged = mergeValues(parsedLeft, parsedRight);

  if (!merged.valid) {
    throw new Error(
      `Unmergable intersection types at ` +
        `${merged.mergeErrorPath.join(".")}: ${typeof parsedLeft} and ${typeof parsedRight}`
    );
  }

  result.value = merged.data;
  return merged.data;
}

export const $ZodIntersection: base.$constructor<$ZodIntersection> = /*@__PURE__*/ base.$constructor(
  "$ZodIntersection",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (input, ctx) => {
      const resultLeft = def.left._run(input, ctx);
      const resultRight = def.right._run(input, ctx);
      const async = resultLeft instanceof Promise || resultRight instanceof Promise;
      return async
        ? Promise.all([resultLeft, resultRight]).then(handleIntersectionResults)
        : handleIntersectionResults([resultLeft, resultRight]);
    };

    inst._parseB = (payload, ctx) => {
      const { value: input } = payload;
      const resultLeft = def.left._runB({ value: input, issues: [], $payload: true }, ctx);
      const resultRight = def.right._runB({ value: input, issues: [], $payload: true }, ctx);
      const async = resultLeft instanceof Promise || resultRight instanceof Promise;

      if (async) {
        return Promise.all([resultLeft, resultRight]).then(([left, right]) => {
          if (left.issues.length || right.issues.length) {
            payload.issues.push(...left.issues, ...right.issues);
            return payload;
          }

          const merged = mergeValues(left.value, right.value);
          if (!merged.valid) {
            throw new Error(
              `Unmergable intersection types at ` +
                `${merged.mergeErrorPath.join(".")}: ${typeof left.value} and ${typeof right.value}`
            );
          }

          payload.value = merged.data;
          return payload;
        });
      }

      if ((resultLeft as any).issues.length || (resultRight as any).issues.length) {
        payload.issues.push(...(resultLeft as any).issues, ...(resultRight as any).issues);
        return payload;
      }

      const merged = mergeValues((resultLeft as any).value, (resultRight as any).value);
      if (!merged.valid) {
        throw new Error(
          `Unmergable intersection types at ` +
            `${merged.mergeErrorPath.join(".")}: ${typeof (resultLeft as any).value} and ${typeof (resultRight as any).value}`
        );
      }

      payload.value = merged.data;
      return payload;
    };
  }
);

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
  type: "tuple";
  items: T;
  rest: Rest;
}

export type ZodTupleItems = readonly base.$ZodType[];
export type $InferTupleInputType<T extends ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleInputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["~input"][] : []),
];
type TupleInputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["~input"];
};
type TupleInputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["~qin"] extends "true"
    ? [...TupleInputTypeWithOptionals<Prefix>, Tail["~input"]?]
    : TupleInputTypeNoOptionals<T>
  : [];

export type $InferTupleOutputType<T extends ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleOutputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["~output"][] : []),
];
type TupleOutputTypeNoOptionals<T extends ZodTupleItems> = {
  [k in keyof T]: T[k]["~output"];
};
type TupleOutputTypeWithOptionals<T extends ZodTupleItems> = T extends [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["~qout"] extends "true"
    ? [...TupleOutputTypeWithOptionals<Prefix>, Tail["~output"]?]
    : TupleOutputTypeNoOptionals<T>
  : [];

function handleTupleResult(result: base.$ZodResult, final: base.$ZodResultWithIssues<any[]>, index: number) {
  if (base.$failed(result)) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
    if (result.aborted) final.aborted = true;
  } else {
    final.value[index] = result.value;
  }
}

function handleTupleResultB(result: base.ParsePayloadB, final: base.ParsePayloadB<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...base.$prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

export interface $ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodType<$InferTupleOutputType<T, Rest>, $InferTupleInputType<T, Rest>> {
  "~def": $ZodTupleDef<T, Rest>;
  "~isst": errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<unknown[]> | errors.$ZodIssueTooSmall<unknown[]>;
}

export const $ZodTuple: base.$constructor<$ZodTuple> = /*@__PURE__*/ base.$constructor("$ZodTuple", (inst, def) => {
  base.$ZodType.init(inst, def);
  const items = def.items;
  // const itemsLength = items.length;
  // const optIndex = itemsLength;
  const optStart = items.length - [...items].reverse().findIndex((item) => item["~qout"] !== "true");

  // [string, number, string, boolean, string?, number?];
  // optStart = 3
  // first non-true index is 2
  // length is 5
  //

  inst._parse = (input, ctx) => {
    if (!Array.isArray(input)) {
      return base.$fail(
        [
          {
            input,
            def,
            expected: "tuple",
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
              origin: "array" as const,
              ...(tooBig ? { code: "too_big", maximum: items.length } : { code: "too_small", minimum: items.length }),
            },
          ],
          true
        );
    }

    let i = -1;
    for (const item of items) {
      i++;
      if (i >= input.length) if (i >= optStart) continue;
      const result = item._run(input[i], ctx);

      if (result instanceof Promise) {
        proms.push(result.then((result) => handleTupleResult(result, final, i)));
      } else {
        handleTupleResult(result, final, i);
      }
    }

    if (def.rest) {
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._run(el, ctx);

        if (result instanceof Promise) {
          proms.push(result.then((result) => handleTupleResult(result, final, i)));
        } else {
          handleTupleResult(result, final, i);
        }
      }
    }

    if (proms.length) return Promise.all(proms).then(() => final);
    return final;
  };

  inst._parseB = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        input,
        def,
        expected: "tuple",
        code: "invalid_type",
      });
      return payload;
    }

    // let async = false;
    // const final = base.$result<any[]>(Array(input.length), []);
    payload.value = [];
    const proms: Promise<any>[] = [];
    // const results: any[] = Array(input.length);

    if (!def.rest) {
      const tooBig = input.length > items.length;
      const tooSmall = input.length < optStart;
      if (tooBig || tooSmall) {
        payload.issues.push({
          input,
          def,
          origin: "array" as const,
          ...(tooBig ? { code: "too_big", maximum: items.length } : { code: "too_small", minimum: items.length }),
        });
        return payload;
      }
    }

    let i = -1;
    for (const item of items) {
      i++;
      if (i >= input.length) if (i >= optStart) continue;
      const result = item._runB(
        {
          value: input[i],
          issues: [],
          $payload: true,
        },
        ctx
      );

      if (result instanceof Promise) {
        proms.push(result.then((result) => handleTupleResultB(result, payload, i)));
      } else {
        handleTupleResultB(result, payload, i);
      }
    }

    if (def.rest) {
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._runB(
          {
            value: el,
            issues: [],
            $payload: true,
          },
          ctx
        );

        if (result instanceof Promise) {
          proms.push(result.then((result) => handleTupleResultB(result, payload, i)));
        } else {
          handleTupleResultB(result, payload, i);
        }
      }
    }

    if (proms.length) return Promise.all(proms).then(() => payload);
    return payload;
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
//   "~values": base.$PrimitiveSet;
// }

// interface $HasPattern extends base.$ZodType<PropertyKey, PropertyKey> {
//   "~pattern": RegExp;
// }

export interface $ZodPropertyKey extends base.$ZodType<PropertyKey, PropertyKey> {}

type $ZodRecordKey = base.$ZodType<string | number | symbol, string | number | symbol>; // $HasValues | $HasPattern;
export interface $ZodRecordDef extends base.$ZodTypeDef {
  type: "record";
  keySchema: $ZodRecordKey;
  valueSchema: base.$ZodType;
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

export interface $ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<Record<Key["~output"], Value["~output"]>, Record<Key["~input"], Value["~input"]>> {
  "~def": $ZodRecordDef;
  "~isst": errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
}

export const $ZodRecord: base.$constructor<$ZodRecord> = /*@__PURE__*/ base.$constructor("$ZodRecord", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (input, ctx) => {
    // const objectResults: any = {};
    // let fail!: base.$ZodFailure;
    // let async!: boolean;
    const final = base.$result<Record<PropertyKey, unknown>>({}, []);
    const proms: Promise<any>[] = [];

    if (!util.isPlainObject(input)) {
      return base.$fail(
        [
          {
            expected: "record",
            code: "invalid_type",
            input,
            def,
          },
        ],
        true
      );
    }

    if ("~values" in def.keySchema) {
      const values = def.keySchema["~values"];
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          const valueResult = def.valueSchema._run(input[key], ctx);

          if (valueResult instanceof Promise) {
            proms.push(valueResult.then((val) => handleObjectResult(val, final, key)));
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
          code: "unrecognized_keys",
          input,
          def,
          keys: unrecognized,
        });
        final.aborted = true;
      }
    } else {
      for (const key of Reflect.ownKeys(input)) {
        const keyResult = def.keySchema._run(key, ctx);
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
        const valueResult = def.valueSchema._run(input[key], ctx);
        if (valueResult instanceof Promise) {
          proms.push(valueResult.then((val) => handleObjectResult(val, final, key)));
        } else handleObjectResult(valueResult, final, key);
        // objectResults[keyResult] = def.valueSchema._run(input[key], ctx);
        // if (objectResults[key] instanceof Promise) async = true;
      }
    }

    if (proms.length) return Promise.all(proms).then(() => final); // handleObjectResults(objectResults, fail) as object;
    return final;
  };

  inst._parseB = (payload, ctx) => {
    const input = payload.value;

    if (!util.isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        def,
      });
      return payload;
    }

    const proms: Promise<any>[] = [];

    if ("~values" in def.keySchema) {
      const values = def.keySchema["~values"];
      payload.value = {};

      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          const result = def.valueSchema._runB({ value: input[key], issues: [], $payload: true }, ctx);

          if (result instanceof Promise) {
            proms.push(
              result.then((result) => {
                if (result.issues.length) {
                  payload.issues.push(...base.$prefixIssues(key, result.issues));
                } else {
                  payload.value[key] = result.value;
                }
              })
            );
          } else {
            if (result.issues.length) {
              payload.issues.push(...base.$prefixIssues(key, result.issues));
            } else {
              payload.value[key] = result.value;
            }
          }
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
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          def,
          keys: unrecognized,
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        const keyResult = def.keySchema._runB({ value: key, issues: [], $payload: true }, ctx);

        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }

        if (keyResult.issues.length) {
          payload.issues.push({
            origin: "record",
            code: "invalid_key",
            issues: base.$finalize(keyResult.issues).issues,
            input: key,
            path: [key],
            def,
          });
          continue;
        }

        const result = def.valueSchema._runB({ value: input[key], issues: [], $payload: true }, ctx);

        if (result instanceof Promise) {
          proms.push(
            result.then((result) => {
              if (result.issues.length) {
                payload.issues.push(...base.$prefixIssues(key, result.issues));
              } else {
                payload.value[keyResult.value as PropertyKey] = result.value;
              }
            })
          );
        } else {
          if (result.issues.length) {
            payload.issues.push(...base.$prefixIssues(key, result.issues));
          } else {
            payload.value[keyResult.value as PropertyKey] = result.value;
          }
        }
      }
    }

    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
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
  type: "map";
  keyType: base.$ZodType;
  valueType: base.$ZodType;
}

export interface $ZodMap<Key extends base.$ZodType = base.$ZodType, Value extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<Map<Key["~output"], Value["~output"]>, Map<Key["~input"], Value["~input"]>> {
  "~def": $ZodMapDef;
  "~isst": errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement<unknown>;
}

function handleMapResult(
  keyResult: base.$ZodResult,
  valueResult: base.$ZodResult,
  final: base.$ZodResultWithIssues<Map<unknown, unknown>>,
  key: unknown,
  input: Map<any, any>,
  def: $ZodMapDef,
  ctx?: base.$ParseContext | undefined
): void {
  if (base.$failed(keyResult)) {
    // if (!fail) fail = new base.$ZodFailure();
    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...base.$prefixIssues(key as PropertyKey, keyResult.issues));
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

    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...base.$prefixIssues(key as PropertyKey, valueResult.issues));
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

function handleMapResultB(
  keyResult: base.ParsePayloadB,
  valueResult: base.ParsePayloadB,
  final: base.ParsePayloadB<Map<unknown, unknown>>,
  key: unknown,
  input: Map<any, any>,
  def: $ZodMapDef,
  ctx?: base.$ParseContext | undefined
): void {
  if (keyResult.issues.length) {
    // if (!fail) fail = new base.$ZodFailure();
    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...base.$prefixIssues(key as PropertyKey, keyResult.issues));
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
  if (valueResult.issues.length) {
    // if (!fail) fail = new base.$ZodFailure();

    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...base.$prefixIssues(key as PropertyKey, valueResult.issues));
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

export const $ZodMap: base.$constructor<$ZodMap> = /*@__PURE__*/ base.$constructor("$ZodMap", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, ctx) => {
    if (!(input instanceof Map)) {
      return base.$fail([
        {
          expected: "map",
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
      const keyResult = def.keyType._run(key, ctx);
      const valueResult = def.valueType._run(value, ctx);
      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        proms.push(
          Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
            handleMapResult(keyResult, valueResult, final, key, input, def, ctx);
          })
        );
        // mapResults.push(Promise.all([keyResult, valueResult, key]) as any);
        // async = true;
      } else {
        //  mapResults.push([keyResult, valueResult, key]);
        handleMapResult(keyResult, valueResult, final, key, input, def, ctx);
      }
    }

    // if (async) return Promise.all(mapResults).then((mapResults) => handleMapResults(mapResults, input, ctx));
    if (proms.length) return Promise.all(proms).then(() => final);
    return final;
  };

  inst._parseB = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Map)) {
      payload.issues.push({
        expected: "map",
        code: "invalid_type",
        input,
        def,
      });
      return payload;
    }

    const proms: Promise<any>[] = [];
    payload.value = new Map();

    for (const [key, value] of input) {
      const keyResult = def.keyType._runB({ value: key, issues: [], $payload: true }, ctx);
      const valueResult = def.valueType._runB({ value: value, issues: [], $payload: true }, ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        proms.push(
          Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
            handleMapResultB(keyResult, valueResult, payload, key, input, def, ctx);
          })
        );
      } else {
        handleMapResultB(
          keyResult as base.ParsePayloadB,
          valueResult as base.ParsePayloadB,
          payload,
          key,
          input,
          def,
          ctx
        );
      }
    }

    if (proms.length) return Promise.all(proms).then(() => payload);
    return payload;
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSet<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<Set<T["~output"]>, Set<T["~input"]>> {
  "~def": $ZodSetDef;
  "~isst": errors.$ZodIssueInvalidType;
}

function handleSetResult(result: base.$ZodResult<any>, final: base.$ZodResultWithIssues<Set<any>>) {
  if (base.$failed(result)) {
    final.issues.push(...result.issues);
  } else {
    final.value.add(result.value);
  }
}

function handleSetResultB(result: base.ParsePayloadB, final: base.ParsePayloadB<Set<any>>) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  } else {
    final.value.add(result.value);
  }
}

export const $ZodSet: base.$constructor<$ZodSet> = /*@__PURE__*/ base.$constructor("$ZodSet", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, ctx) => {
    if (!(input instanceof Set)) {
      return base.$fail(
        [
          {
            input,
            def,
            expected: "set",
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
      const result = def.valueType._run(item, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleSetResult(result, final)));
      } else handleSetResult(result, final);
      // setResults[index++] = result;
    }

    if (proms.length) return Promise.all(proms).then(() => final);
    return final;
  };

  inst._parseB = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Set)) {
      payload.issues.push({
        input,
        def,
        expected: "set",
        code: "invalid_type",
      });
      return payload;
    }

    const proms: Promise<any>[] = [];
    payload.value = new Set();
    for (const item of input) {
      const result = def.valueType._runB({ value: item, issues: [], $payload: true }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleSetResultB(result, payload)));
      } else handleSetResultB(result, payload);
    }

    if (proms.length) return Promise.all(proms).then(() => payload);
    return payload;
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

export interface $ZodEnumDef<T extends util.EnumLike = util.EnumLike> extends base.$ZodTypeDef {
  type: "enum";
  entries: T;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidValue> | undefined;
}

export interface $ZodEnum<T extends util.EnumLike = util.EnumLike>
  extends base.$ZodType<$InferEnumOutput<T>, $InferEnumInput<T>> {
  enum: T;

  "~def": $ZodEnumDef<T>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  "~values": base.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  "~pattern": RegExp;
  "~isst": errors.$ZodIssueInvalidValue;
}

export const $ZodEnum: base.$constructor<$ZodEnum> = /*@__PURE__*/ base.$constructor("$ZodEnum", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst.enum = def.entries;

  const values = Object.values(def.entries);

  inst["~values"] = new Set<util.Primitive>(values);
  inst["~pattern"] = new RegExp(
    `^(${values
      .filter((k) => util.propertyKeyTypes.has(typeof k))
      .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o.toString()))
      .join("|")})$`
  );
  inst._parse = (input, _ctx) => {
    if (inst["~values"].has(input as any)) {
      return base.$succeed(input) as any;
    }
    return base.$fail(
      [
        {
          code: "invalid_value",
          values,
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    const input = payload.value;
    if (inst["~values"].has(input as any)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      def,
    });
    return payload;
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
  type: "literal";
  values: util.LiteralArray;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidValue> | undefined;
}

export interface $ZodLiteral<T extends util.Literal = util.Literal> extends base.$ZodType<T, T> {
  "~def": $ZodLiteralDef;
  "~values": base.$PrimitiveSet;
  "~pattern": RegExp;
  "~isst": errors.$ZodIssueInvalidValue;
}

export const $ZodLiteral: base.$constructor<$ZodLiteral> = /*@__PURE__*/ base.$constructor(
  "$ZodLiteral",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst["~values"] = new Set<util.Primitive>(def.values);
    inst["~pattern"] = new RegExp(
      `^(${def.values
        .filter((k) => util.propertyKeyTypes.has(typeof k))
        .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o.toString()))
        .join("|")})$`
    );
    inst._parse = (input, _ctx) => {
      if (inst["~values"].has(input as any)) {
        return base.$succeed(input) as any;
      }
      return base.$fail(
        [
          {
            code: "invalid_value",
            values: def.values,
            input,
            def,
          },
        ],
        true
      );
    };

    inst._parseB = (payload, _ctx) => {
      const input = payload.value;
      if (inst["~values"].has(input as any)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values: def.values,
        input,
        def,
      });
      return payload;
    };
  }
);

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodConst      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface $ZodConstDef extends base.$ZodTypeDef {
  type: "const";
  value: unknown;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidValue> | undefined;
}

export interface $ZodConst<T extends util.Literal = util.Literal> extends base.$ZodType<T, T> {
  "~def": $ZodConstDef;
  "~values": base.$PrimitiveSet;
  "~pattern": RegExp;
  "~isst": errors.$ZodIssueInvalidValue;
}

export const $ZodConst: base.$constructor<$ZodConst> = /*@__PURE__*/ base.$constructor("$ZodConst", (inst, def) => {
  base.$ZodType.init(inst, def);

  if (util.primitiveTypes.has(typeof def.value) || def.value === null) {
    inst["~values"] = new Set<util.Primitive>(def.value as any);
  }

  Object.defineProperty(inst, "~pattern", {
    get() {
      if (util.propertyKeyTypes.has(typeof def.value)) {
        return new RegExp(
          `^(${typeof def.value === "string" ? util.escapeRegex(def.value) : (def.value as any).toString()})$`
        );
      }
      throw new Error("Const value cannot be converted to regex");
    },
  });

  inst._parse = (_, _ctx) => {
    return base.$succeed(def.value) as any;
  };

  inst._parseB = (payload, _ctx) => {
    return payload;
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodFile extends base.$ZodType<File, File> {
  "~def": $ZodFileDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodFile: base.$constructor<$ZodFile> = /*@__PURE__*/ base.$constructor("$ZodFile", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    if (input instanceof File) return base.$succeed(input);
    return base.$fail(
      [
        {
          expected: "file",
          code: "invalid_type",
          input,
          def,
        },
      ],
      true
    );
  };

  inst._parseB = (payload, _ctx) => {
    const input = payload.value;
    if (input instanceof File) return payload;
    payload.issues.push({
      expected: "file",
      code: "invalid_type",
      input,
      def,
    });
    return payload;
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
    ctx?: base.$ZodResult<unknown>
    // ctx?: base.$ParseContext | undefined
  ) => util.MaybeAsync<unknown>;
  effectB: (
    payload: base.ParsePayloadB<unknown>,
    ctx?: base.ParseContextB
    // ctx?: base.$ParseContext | undefined
  ) => util.MaybeAsync<unknown>;
  // error?: errors.$ZodErrorMap<never> | undefined;
  // async: boolean;
}
export interface $ZodEffect<O = unknown, I = unknown> extends base.$ZodType<O, I> {
  "~def": $ZodEffectDef;
  "~isst": never;
}

export const $ZodEffect: base.$constructor<$ZodEffect> = /*@__PURE__*/ base.$constructor("$ZodEffect", (inst, def) => {
  base.$ZodType.init(inst, def);
  // inst._async = def.async;

  inst._parse = (input, _ctx) => {
    const result = base.$result<unknown>(input);
    const output = def.effect(input, result);
    if (output instanceof Promise) {
      return output.then((output) => {
        return base.$failed(result) ? result : base.$succeed(output);
      });
    }
    if (base.$failed(result)) return result;
    return base.$succeed(output);
  };

  inst._parseB = (payload, _ctx) => {
    const output = def.effectB(payload, _ctx);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodOptional      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodOptionalDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "optional";
  innerType: T;
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodOptional<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["~output"] | undefined, T["~input"] | undefined> {
  "~def": $ZodOptionalDef<T>;
  "~qin": "true";
  "~qout": "true";
  "~isst": never;
}

export const $ZodOptional: base.$constructor<$ZodOptional> = /*@__PURE__*/ base.$constructor(
  "$ZodOptional",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~qin"] = "true";
    inst["~qout"] = "true";
    inst._parse = (input, ctx) => {
      if (input === undefined) return base.$succeed(undefined);
      return def.innerType._run(input, ctx);
    };

    inst._parseB = (payload, ctx) => {
      if (payload.value === undefined) return payload;
      return def.innerType._runB(payload, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodNullable      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNullableDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "nullable";
  innerType: T;
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodNullable<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["~output"] | null, T["~input"] | null> {
  "~def": $ZodNullableDef<T>;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;
}

export const $ZodNullable: base.$constructor<$ZodNullable> = /*@__PURE__*/ base.$constructor(
  "$ZodNullable",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~qin"] = def.innerType["~qin"];
    inst["~qout"] = def.innerType["~qout"];
    inst._parse = (input, ctx) => {
      if (input === null) return base.$succeed(null);
      return def.innerType._run(input, ctx);
    };

    inst._parseB = (payload, ctx) => {
      if (payload.value === null) return payload;
      return def.innerType._runB(payload, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodRequired      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodRequiredDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "required";
  innerType: T;
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodRequired<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<util.NoUndefined<T["~output"]>, util.NoUndefined<T["~input"]>> {
  "~def": $ZodRequiredDef<T>;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodRequired: base.$constructor<$ZodRequired> = /*@__PURE__*/ base.$constructor(
  "$ZodRequired",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._parse = (input, ctx) => {
      if (input === undefined) {
        return base.$fail([
          {
            expected: "required",
            code: "invalid_type",
            input,
            def,
          },
        ]);
      }
      return def.innerType._run(input, ctx);
    };

    inst._parseB = (payload, ctx) => {
      if (payload.value === undefined) {
        payload.issues.push({
          expected: "required",
          code: "invalid_type",
          input: payload.value,
          def,
        });
        return payload;
      }
      return def.innerType._runB(payload, ctx);
    };
  }
);

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
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodSuccess<T extends base.$ZodType = base.$ZodType> extends base.$ZodType<boolean, T["~input"]> {
  "~def": $ZodSuccessDef;
  "~isst": never;
}

export const $ZodSuccess: base.$constructor<$ZodSuccess> = /*@__PURE__*/ base.$constructor(
  "$ZodSuccess",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (input, ctx) => {
      const result = def.innerType._run(input, ctx);
      if (result instanceof Promise) return result.then((result) => base.$succeed(!base.$failed(result)));
      return base.$succeed(!base.$failed(result));
    };

    inst._parseB = (payload, ctx) => {
      const result = def.innerType._runB(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => {
          payload.value = result.issues.length === 0;
          return payload;
        });
      }
      payload.value = result.issues.length === 0;
      return payload;
    };
  }
);

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
  defaultValue: () => this["innerType"]["~input"];
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodDefault<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<
    util.NoUndefined<T["~output"]>,
    // T["~output"], // it can still return undefined
    T["~input"] | undefined
  > {
  "~def": $ZodDefaultDef;
  "~qin": "true";
  "~isst": never;
}

export const $ZodDefault: base.$constructor<$ZodDefault> = /*@__PURE__*/ base.$constructor(
  "$ZodDefault",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~qin"] = "true"; //def.innerType["~qin"];
    inst._parse = (input, ctx) => {
      if (input === undefined) return base.$succeed(def.defaultValue());
      return def.innerType._run(input, ctx);
      // const result = def.innerType._run(input, ctx);
      // if (result instanceof Promise) {
      //   return result.then((result) =>
      //     handleDefaultResult(result, def.defaultValue)
      //   );
      // }
      // return handleDefaultResult(result, def.defaultValue);
    };

    inst._parseB = (payload, ctx) => {
      if (payload.value === undefined) {
        payload.value = def.defaultValue();
        return payload;
      }
      return def.innerType._runB(payload, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodCatch        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodCatchCtx {
  error: base.$ZodError;
}
export interface $ZodCatchDef extends base.$ZodTypeDef {
  type: "catch";
  innerType: base.$ZodType;
  catchValue: (ctx: $ZodCatchCtx) => this["innerType"]["~output"];
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodCatch<T extends base.$ZodType = base.$ZodType> extends base.$ZodType<T["~output"], unknown> {
  "~def": $ZodCatchDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;
}

export const $ZodCatch: base.$constructor<$ZodCatch> = /*@__PURE__*/ base.$constructor("$ZodCatch", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst["~qin"] = def.innerType["~qin"];
  inst["~qout"] = def.innerType["~qout"];
  inst._parse = (input, ctx) => {
    const result = def.innerType._run(input, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        if (base.$failed(result)) return base.$succeed(def.catchValue({ error: base.$finalize(result.issues, ctx) }));
        return result;
      });
    }
    if (base.$failed(result)) return base.$succeed(def.catchValue({ error: base.$finalize(result.issues, ctx) }));
    return result;
  };

  inst._parseB = (payload, ctx) => {
    const result = def.innerType._runB(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        if (result.issues.length) {
          payload.value = def.catchValue({ error: base.$finalize(result.issues, ctx) });
          payload.issues = [];
        } else {
          payload.value = result.value;
        }
        return payload;
      });
    }

    if (result.issues.length) {
      payload.value = def.catchValue({ error: base.$finalize(result.issues, ctx) });
      payload.issues = [];
    } else {
      payload.value = result.value;
    }
    return payload;
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNaN extends base.$ZodType<number, number> {
  "~def": $ZodNaNDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export const $ZodNaN: base.$constructor<$ZodNaN> = /*@__PURE__*/ base.$constructor("$ZodNaN", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._parse = (input, _ctx) => {
    if (typeof input !== "number" || !Number.isNaN(input)) {
      return base.$fail(
        [
          {
            input,
            def,
            expected: "nan",
            code: "invalid_type",
          },
        ],
        true
      );
    }
    return base.$succeed(input);
  };

  inst._parseB = (payload, _ctx) => {
    if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
      payload.issues.push({
        input: payload.value,
        def,
        expected: "nan",
        code: "invalid_type",
      });
      return payload;
    }
    return payload;
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
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodPipeline<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<B["~output"], A["~input"]> {
  "~def": $ZodPipelineDef;
  "~isst": never;
}

function handleBPipelineResult(result: base.$ZodResult, outResult: base.$ZodResult) {
  if (base.$failed(outResult)) {
    result.issues.push(...outResult.issues);
  }
  if (outResult.aborted) result.aborted = true;
  result.value = outResult.value;
  return result;
}

function handleAPipelineResult(result: base.$ZodResult, def: $ZodPipelineDef, ctx?: base.$ParseContext) {
  if (result.aborted) return result;
  const outResult = def.out._run(result.value, ctx);
  if (outResult instanceof Promise) {
    return outResult.then((outResult) => {
      return handleBPipelineResult(result, outResult);
    });
  }
  return handleBPipelineResult(result, outResult);
}

function handleBPipelineResultB(resultB: base.ParsePayloadB, outResultB: base.ParsePayloadB) {
  if (outResultB.issues.length) {
    resultB.issues.push(...outResultB.issues);
  }
  resultB.value = outResultB.value;
  return resultB;
}

function handleAPipelineResultB(resultB: base.ParsePayloadB, def: $ZodPipelineDef, ctx: base.ParseContextB) {
  if (resultB.issues.length) return resultB;
  const outResultB = def.out._runB({ value: resultB.value, issues: [], $payload: true }, ctx);
  if (outResultB instanceof Promise) {
    return outResultB.then((outResultB) => {
      return handleBPipelineResultB(resultB, outResultB);
    });
  }
  return handleBPipelineResultB(resultB, outResultB);
}

export const $ZodPipeline: base.$constructor<$ZodPipeline> = /*@__PURE__*/ base.$constructor(
  "$ZodPipeline",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (input, ctx) => {
      const result = def.in._run(input, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleAPipelineResult(result, def, ctx));
      }
      return handleAPipelineResult(result, def, ctx);
    };

    inst._parseB = (payload, ctx) => {
      const result = def.in._runB(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleAPipelineResultB(result, def, ctx));
      }
      return handleAPipelineResultB(result, def, ctx);
    };
  }
);

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

function handleReadonlyResult(result: base.$ZodResult): Readonly<base.$ZodResult> {
  // if (base.$failed(result)) return result;
  result.value = Object.freeze(result.value);
  return result;
}

function handleReadonlyResultB(payload: base.ParsePayloadB): base.ParsePayloadB {
  payload.value = Object.freeze(payload.value);
  return payload;
}

export interface $ZodReadonlyDef extends base.$ZodTypeDef {
  type: "readonly";
  innerType: base.$ZodType;
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodReadonly<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<MakeReadonly<T["~output"]>, MakeReadonly<T["~input"]>> {
  "~def": $ZodReadonlyDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;
}

export const $ZodReadonly: base.$constructor<$ZodReadonly> = /*@__PURE__*/ base.$constructor(
  "$ZodReadonly",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst["~qin"] = def.innerType["~qin"];
    inst["~qout"] = def.innerType["~qout"];
    inst._parse = (input, ctx) => {
      const result = def.innerType._run(input, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
    };

    inst._parseB = (payload, ctx) => {
      const result = def.innerType._runB(payload, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResultB);
      }
      return handleReadonlyResultB(result);
    };
  }
);

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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
}
export interface $ZodTemplateLiteral<Template extends string = string> extends base.$ZodType<Template, Template> {
  "~pattern": RegExp;
  "~def": $ZodTemplateLiteralDef;
  "~isst": errors.$ZodIssueInvalidType;
}

export type $LiteralPart = string | number | boolean | null | undefined;
export interface $SchemaPart extends base.$ZodType<$LiteralPart, $LiteralPart> {
  "~pattern": RegExp;
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

export type $PartsToTemplateLiteral<Parts extends $TemplateLiteralPart[]> = [] extends Parts
  ? ``
  : Parts extends [...infer Rest extends $TemplateLiteralPart[], infer Last extends $TemplateLiteralPart]
    ? AppendToTemplateLiteral<$PartsToTemplateLiteral<Rest>, Last>
    : never;

export const $ZodTemplateLiteral: base.$constructor<$ZodTemplateLiteral> = /*@__PURE__*/ base.$constructor(
  "$ZodTemplateLiteral",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    const regexParts: string[] = [];
    for (const part of def.parts) {
      if (part instanceof base.$ZodType) {
        const source = part["~pattern"] instanceof RegExp ? part["~pattern"].source : part["~pattern"];
        if (!source) throw new Error(`Invalid template literal part: ${part["~traits"]}`);

        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else {
        regexParts.push(`${part}`);
      }
    }
    inst["~pattern"] = new RegExp(`^${regexParts.join("")}$`);

    inst._parse = (input, _ctx) => {
      if (typeof input !== "string") {
        return base.$fail(
          [
            {
              input,
              def,
              expected: "template_literal",
              code: "invalid_type",
            },
          ],
          true
        );
      }

      if (!inst["~pattern"].test(input)) {
        return base.$fail(
          [
            {
              input,
              def,
              expected: "template_literal",
              code: "invalid_type",
              pattern: inst["~pattern"],
            },
          ],
          true
        );
      }

      return base.$succeed(input);
    };

    inst._parseB = (payload, _ctx) => {
      if (typeof payload.value !== "string") {
        payload.issues.push({
          input: payload.value,
          def,
          expected: "template_literal",
          code: "invalid_type",
        });
        return payload;
      }

      if (!inst["~pattern"].test(payload.value)) {
        payload.issues.push({
          input: payload.value,
          def,
          expected: "template_literal",
          code: "invalid_type",
          pattern: inst["~pattern"],
        });
        return payload;
      }

      return payload;
    };
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////     $ZodPromise     //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface $ZodPromiseDef extends base.$ZodTypeDef {
  type: "promise";
  innerType: base.$ZodType;
}

export interface $ZodPromise<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["~output"], util.MaybeAsync<T["~input"]>> {
  "~def": $ZodPromiseDef;
  "~isst": never;
}

export const $ZodPromise: base.$constructor<$ZodPromise> = /*@__PURE__*/ base.$constructor(
  "$ZodPromise",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (input, ctx) => {
      return Promise.resolve(input).then((inner) => def.innerType._run(inner, ctx));
    };

    inst._parseB = (payload, ctx) => {
      return Promise.resolve(payload.value).then((inner) =>
        def.innerType._runB({ value: inner, issues: [], $payload: true }, ctx)
      );
    };
  }
);

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////     $ZodCustom     //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export interface $ZodCustomDef extends base.$ZodTypeDef, base.$ZodCheckDef {
  type: "custom";
  fn: base.$ZodCheck["~check"];
}
export interface $ZodCustom<O = unknown, I = unknown> extends base.$ZodType<O, I>, base.$ZodCheck<O> {
  "~def": $ZodCustomDef;
  "~issc": errors.$ZodIssue;
  "~isst": never;
}

export const $ZodCustom: base.$constructor<$ZodCustom<unknown>> = base.$constructor("$ZodCustom", (inst, def) => {
  if (def.checks?.length) console.warn("Can't add custom checks to z.custom()");

  base.$ZodCheck.init(inst, def);
  base.$ZodType.init(inst, def);

  inst._parse = (input, _) => {
    return base.$succeed(input);
  };

  inst._parseB = (payload, _) => {
    return payload;
  };

  inst["~check"] = (_) => def.fn(_ as any);
  inst._checkB = (_) => def.fn(_ as any);
});
