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
}

export interface $ZodString<Input = unknown> extends base.$ZodType<string, Input> {
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _def: $ZodStringDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _isst: errors.$ZodIssueInvalidType;
  /** Computed properties */
}

export const $ZodString: base.$constructor<$ZodString> = /*@__PURE__*/ base.$constructor("$ZodString", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._pattern = inst?._computed?.pattern ?? regexes.stringRegex(inst._computed);

  inst._parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}

    if (typeof payload.value === "string") return payload;

    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst,
    });
    return payload;
  };
  // inst._run = inst._parse;
});

//////////////////////////////   ZodStringFormat   //////////////////////////////

export interface $ZodStringFormatDef<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends $ZodStringDef,
    checks.$ZodCheckStringFormatDef<Format> {
  /** Whether parsing should continue if this check fails. */
  // abort?: boolean;
}

export interface $ZodStringFormat extends $ZodString<string>, checks.$ZodCheckStringFormat {
  _pattern: RegExp;
  _def: $ZodStringFormatDef;
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
  _def: $ZodStringFormatDef<"guid">;
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
  _def: $ZodUUIDDef;
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
  _def: $ZodEmailDef;
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
  _def: $ZodURLDef;
}

export const $ZodURL: base.$constructor<$ZodURL> = /*@__PURE__*/ base.$constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._check = (payload) => {
    try {
      const url = new URL(payload.value);
      regexes.hostnameRegex.lastIndex = 0;
      if (regexes.hostnameRegex.test(url.hostname)) return;
    } catch {}
    payload.issues.push({
      code: "invalid_format",
      format: def.format,
      input: payload.value,
      inst,
    });
  };
});

//////////////////////////////   ZodEmoji   //////////////////////////////

export interface $ZodEmojiDef extends $ZodStringFormatDef<"emoji"> {}
export interface $ZodEmoji extends $ZodStringFormat {
  _def: $ZodEmojiDef;
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
  _def: $ZodNanoIDDef;
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
  _def: $ZodCUIDDef;
}

export const $ZodCUID: base.$constructor<$ZodCUID> = /*@__PURE__*/ base.$constructor("$ZodCUID", (inst, def): void => {
  def.pattern ??= regexes.cuidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodCUID2   //////////////////////////////

export interface $ZodCUID2Def extends $ZodStringFormatDef<"cuid2"> {}
export interface $ZodCUID2 extends $ZodStringFormat {
  _def: $ZodCUID2Def;
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
  _def: $ZodULIDDef;
}

export const $ZodULID: base.$constructor<$ZodULID> = /*@__PURE__*/ base.$constructor("$ZodULID", (inst, def): void => {
  def.pattern ??= regexes.ulidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodXID   //////////////////////////////

export interface $ZodXIDDef extends $ZodStringFormatDef<"xid"> {}
export interface $ZodXID extends $ZodStringFormat {
  _def: $ZodXIDDef;
}

export const $ZodXID: base.$constructor<$ZodXID> = /*@__PURE__*/ base.$constructor("$ZodXID", (inst, def): void => {
  def.pattern ??= regexes.xidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodKSUID   //////////////////////////////

export interface $ZodKSUIDDef extends $ZodStringFormatDef<"ksuid"> {}
export interface $ZodKSUID extends $ZodStringFormat {
  _def: $ZodKSUIDDef;
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
  _def: $ZodISODateTimeDef;
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
  _def: $ZodISODateDef;
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
  _def: $ZodISOTimeDef;
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
  _def: $ZodISODurationDef;
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
  _def: $ZodIPDef;
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
  _def: $ZodBase64Def;
}

export const $ZodBase64: base.$constructor<$ZodBase64> = /*@__PURE__*/ base.$constructor(
  "$ZodBase64",
  (inst, def): void => {
    def.pattern ??= regexes.base64Regex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodJSONString   //////////////////////////////

// export interface $ZodJSONStringDef extends $ZodStringFormatDef<"json_string"> {}
// export interface $ZodJSONString extends $ZodStringFormat {
//   _def: $ZodJSONStringDef;
// }

// export const $ZodJSONString: base.$constructor<$ZodJSONString> = /*@__PURE__*/ base.$constructor(
//   "$ZodJSONString",
//   (inst, def): void => {
//     $ZodStringFormat.init(inst, def);
//     inst._check = (payload) => {
//       try {
//         JSON.parse(payload.value);
//         return;
//       } catch {
//         payload.issues.push({
//           code: "invalid_format",
//           format: "json_string",
//           input: payload.value,
//           inst,
//         });
//       }
//     };
//   }
// );

//////////////////////////////   ZodE164   //////////////////////////////

export interface $ZodE164Def extends $ZodStringFormatDef<"e164"> {}
export interface $ZodE164 extends $ZodStringFormat {
  _def: $ZodE164Def;
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
  _def: $ZodJWTDef;
}

export const $ZodJWT: base.$constructor<$ZodJWT> = /*@__PURE__*/ base.$constructor("$ZodJWT", (inst, def): void => {
  $ZodStringFormat.init(inst, def);
  inst._check = (payload) => {
    if (isValidJWT(payload.value, def.alg)) return;

    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
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

export interface $ZodNumberDef extends base.$ZodTypeDef {
  type: "number";
  coerce?: boolean;
  checks: base.$ZodCheck<number>[];
}

export interface $ZodNumber<T = unknown> extends base.$ZodType<number, T> {
  _pattern: RegExp;
  _def: $ZodNumberDef;
  _isst: errors.$ZodIssueInvalidType;
  /** Computed properties */
}

export const $ZodNumber: base.$constructor<$ZodNumber> = /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._pattern = inst._computed.pattern ?? regexes.numberRegex;

  inst._parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...(received ? { received } : {}),
    });
    return payload;
  };

  // inst._parse = (payload, ctx) => {
  //   const { input } = payload;
  //   if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
  //   // return base.$fail(
  //   //   [
  //   //     {
  //   //       expected: "number",
  //   //       code: "invalid_type",
  //   //       input,
  //   //       inst,
  //   //     },
  //   //   ],
  //   //   true
  //   // );
  //   ctx.issues.push({
  //     expected: "number",
  //     code: "invalid_type",
  //     input,
  //     inst,
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
  _def: $ZodNumberFormatDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodNumberFormat: base.$constructor<$ZodNumberFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodNumber",
  (inst, def) => {
    checks.$ZodCheckNumberFormat.init(inst, def);
    $ZodNumber.init(inst, def); // no format checksp
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
}

export interface $ZodBoolean<T = unknown> extends base.$ZodType<boolean, T> {
  _pattern: RegExp;
  _def: $ZodBooleanDef;
  _isst: errors.$ZodIssueInvalidType;
  /** Computed properties */
}

export const $ZodBoolean: base.$constructor<$ZodBoolean> = /*@__PURE__*/ base.$constructor(
  "$ZodBoolean",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.booleanRegex;

    inst._parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = Boolean(payload.value);
        } catch (_) {}
      const input = payload.value;
      if (typeof input === "boolean") return payload;
      payload.issues.push({
        expected: "boolean",
        code: "invalid_type",
        input,
        inst,
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
  _pattern: RegExp;
  /** @internal Internal API, use with caution */
  _def: $ZodBigIntDef;
  _isst: errors.$ZodIssueInvalidType;
  /** Computed properties */
}

export const $ZodBigInt: base.$constructor<$ZodBigInt> = /*@__PURE__*/ base.$constructor("$ZodBigInt", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._pattern = regexes.bigintRegex;

  inst._parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = BigInt(payload.value as any);
      } catch (_) {}
    const { value: input } = payload;
    if (typeof input === "bigint") return payload;
    payload.issues.push({
      expected: "bigint",
      code: "invalid_type",
      input,
      inst,
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
  _def: $ZodBigIntFormatDef;
}

export const $ZodBigIntFormat: base.$constructor<$ZodBigIntFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodBigInt",
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
}

export interface $ZodSymbol extends base.$ZodType<symbol, symbol> {
  _def: $ZodSymbolDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodSymbol: base.$constructor<$ZodSymbol> = /*@__PURE__*/ base.$constructor("$ZodSymbol", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    const { value: input } = payload;
    if (typeof input === "symbol") return payload;
    payload.issues.push({
      expected: "symbol",
      code: "invalid_type",
      input,
      inst,
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
}

export interface $ZodUndefined extends base.$ZodType<undefined, undefined> {
  _pattern: RegExp;
  _def: $ZodUndefinedDef;
  _values: base.$PrimitiveSet;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodUndefined: base.$constructor<$ZodUndefined> = /*@__PURE__*/ base.$constructor(
  "$ZodUndefined",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._pattern = regexes.undefinedRegex;
    inst._values = new Set([undefined]);

    inst._parse = (payload, _ctx) => {
      const { value: input } = payload;
      if (typeof input === "undefined") return payload;
      payload.issues.push({
        expected: "undefined",
        code: "invalid_type",
        input,
        inst,
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
}

export interface $ZodNull extends base.$ZodType<null, null> {
  _pattern: RegExp;
  _def: $ZodNullDef;
  _values: base.$PrimitiveSet;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodNull: base.$constructor<$ZodNull> = /*@__PURE__*/ base.$constructor("$ZodNull", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._pattern = regexes.nullRegex;
  inst._values = new Set([null]);

  inst._parse = (payload, _ctx) => {
    const { value: input } = payload;
    if (input === null) return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      inst,
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
}

export interface $ZodAny extends base.$ZodType<any, any> {
  _def: $ZodAnyDef;
  _isst: never;
}

export const $ZodAny: base.$constructor<$ZodAny> = /*@__PURE__*/ base.$constructor("$ZodAny", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload) => payload;
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
}

export interface $ZodUnknown extends base.$ZodType<unknown, unknown> {
  _def: $ZodUnknownDef;
  _isst: never;
}

export const $ZodUnknown: base.$constructor<$ZodUnknown> = /*@__PURE__*/ base.$constructor(
  "$ZodUnknown",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._parse = (payload) => payload;
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
}

export interface $ZodNever extends base.$ZodType<never, never> {
  _def: $ZodNeverDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodNever: base.$constructor<$ZodNever> = /*@__PURE__*/ base.$constructor("$ZodNever", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst,
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
}

export interface $ZodVoid extends base.$ZodType<void, void> {
  _def: $ZodVoidDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodVoid: base.$constructor<$ZodVoid> = /*@__PURE__*/ base.$constructor("$ZodVoid", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    const { value: input } = payload;
    if (typeof input === "undefined") return payload;
    payload.issues.push({
      expected: "void",
      code: "invalid_type",
      input,
      inst,
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
  coerce?: boolean | "iso";
}

export interface $ZodDate<T = unknown> extends base.$ZodType<Date, T> {
  _def: $ZodDateDef;
  _isst: errors.$ZodIssueInvalidType; // | errors.$ZodIssueInvalidDate;
}

export const $ZodDate: base.$constructor<$ZodDate> = /*@__PURE__*/ base.$constructor("$ZodDate", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    if (def.coerce === "iso") {
      try {
        const coerced = typeof payload.value === "string" ? new Date(payload.value) : null;
        if (coerced && coerced.toISOString() === payload.value) {
          payload.value = coerced;
        }
      } catch {}
    } else if (def.coerce) {
      try {
        payload.value = new Date(payload.value as string | number | Date);
      } catch (_err: any) {}
    }
    const input = payload.value;

    const isDate = input instanceof Date;
    const isValidDate = isDate && !Number.isNaN(input.getTime());
    if (isValidDate) return payload;
    payload.issues.push({
      expected: "date",
      code: "invalid_type",
      input,
      ...(isDate ? { received: "Invalid Date" } : {}),
      inst,
    });

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
}

export interface $ZodArray<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"][], T["_input"][]> {
  _def: $ZodArrayDef<T>;
  _isst: errors.$ZodIssueInvalidType;
}

function handleArrayResult(result: base.$ParsePayload<any>, final: base.$ParsePayload<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...util.prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}

export const $ZodArray: base.$constructor<$ZodArray> = /*@__PURE__*/ base.$constructor("$ZodArray", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, ctx) => {
    const input = payload.value;

    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst,
      });
      return payload;
    }

    payload.value = Array(input.length);
    const proms: Promise<any>[] = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];

      const result = def.element._run(
        {
          value: item,
          issues: [],
          $payload: true,
        },
        ctx
      );

      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
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

export type $ZodShape = Readonly<{ [k: string]: base.$ZodType }>;

export interface $ZodObjectLikeDef<out Shape extends $ZodShape = $ZodShape> extends base.$ZodTypeDef {
  type: "object" | "interface";
  shape: Shape;
  optional: string[];
  catchall?: base.$ZodType | undefined;
}

export interface $ZodObjectLike<out O = object, out I = object> extends base.$ZodType<O, I> {
  /** @deprecated */
  _def: $ZodObjectLikeDef;
  /** @deprecated */
  _shape: $ZodShape;
  /** @deprecated */
  _extra: Record<string, unknown>;
  /** @deprecated */
  _optional: string;
  /** @deprecated */
  _defaulted: string;
  // _disc: base.$DiscriminatorMap;
  /** @deprecated */
  _isst: errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys;
}

function handleObjectResult(result: base.$ParsePayload, final: base.$ParsePayload, key: PropertyKey) {
  if (result.issues.length) {
    final.issues.push(...util.prefixIssues(key, result.issues));
  } else {
    (final.value as any)[key] = result.value;
  }
}

const $ZodObjectLike: base.$constructor<$ZodObjectLike> = /*@__PURE__*/ base.$constructor(
  "$ZodObjectLike",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._shape = def.shape;
    // Object.defineProperty(inst, "_shape", )

    const _normalized = util.cached(() => {
      const n = util.normalizeObjectLikeDef(def);
      return n;
    });

    util.defineLazy(inst, "_disc", () => {
      const shape = _normalized.value.shape;
      const discMap: base.$DiscriminatorMap = new Map();
      let hasDisc = false;
      for (const key in shape) {
        const field = shape[key];
        if (field._values || field._disc) {
          hasDisc = true;
          const o: base.$DiscriminatorMapElement = {
            values: new Set(field._values ?? []),
            maps: field._disc ? [field._disc] : [],
          };
          discMap.set(key, o);
        }
      }
      if (!hasDisc) return undefined;
      return discMap;
    });

    const generateFastpass = () => {
      const { keys, optionalKeys } = _normalized.value;
      const doc = new Doc(["inst", "payload", "ctx"]);
      const parseStr = (key: string) => {
        const k = util.esc(key);
        return `shape[${k}]._run({ value: input[${k}], issues: [] }, ctx)`;
      };

      doc.write(`const shape = inst._def.shape;`);
      doc.write(`const input = payload.value;`);

      const ids: any = {};
      for (const key of keys) {
        ids[key] = util.randomString(15);
      }
      for (const key of keys) {
        if (optionalKeys.has(key)) continue;
        const id = ids[key];
        doc.write(`const ${id} = ${parseStr(key)};`);
        doc.write(`
          if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${util.esc(key)}, ...iss.path] : [${util.esc(key)}]
          })));`);
      }

      // check for missing keys
      // for (const key of keys) {
      //   if (optionalKeys.has(key)) continue;
      //   doc.write(`if(!(${util.esc(key)} in input)) {`);
      //   doc.indented(() => {
      //     doc.write(`payload.issues.push({`);
      //     doc.indented(() => {
      //       doc.write(`code: "invalid_type",`);
      //       doc.write(`path: [${util.esc(key)}],`);
      //       doc.write(`expected: "nonoptional",`);
      //       doc.write(`note: 'Missing required key: "${key}"',`);
      //       doc.write(`input,`);
      //       doc.write(`inst,`);
      //     });
      //     doc.write(`});`);
      //   });
      //   doc.write(`}`);
      // }

      // add required keys to result
      // doc.write(`return payload;`);
      // doc.write(`if(Object.keys(input).length === ${keys.length}) {
      //   payload.value = {...input};
      //   return payload;
      // }`);
      doc.write(`payload.value = {`);
      doc.indented(() => {
        for (const key of keys) {
          if (optionalKeys.has(key)) continue;
          const id = ids[key];
          doc.write(`  ${util.esc(key)}: ${id}.value,`);
          // doc.write(`payload.value[${util.esc(key)}] = ${id}.value;`);
        }
      });
      doc.write(`}`);

      // add in optionalKeys if defined
      for (const key of keys) {
        if (!optionalKeys.has(key)) continue;
        const id = ids[key];
        doc.write(`if (${util.esc(key)} in input) {`);
        doc.indented(() => {
          doc.write(`if(input[${util.esc(key)}] === undefined) {`);
          doc.indented(() => {
            doc.write(`payload.value[${util.esc(key)}] = undefined;`);
          });
          doc.write(`} else {`);
          doc.indented(() => {
            doc.write(`const ${id} = ${parseStr(key)};`);
            doc.write(`payload.value[${util.esc(key)}] = ${id}.value;`);
            doc.write(`
              if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({ 
                ...iss, 
                path: iss.path ? [${util.esc(key)}, ...iss.path] : [${util.esc(key)}] 
              })));`);
          });
          doc.write(`}`);
        });
        doc.write(`}`);
      }

      // doc.write(`payload.value = final;`);
      doc.write(`return payload;`);
      return doc.compile();
    };

    let fastpass!: ReturnType<typeof generateFastpass>;
    const fastEnabled = util.allowsEval.value; // && !def.catchall;
    const isObject = util.isObject;
    const { catchall } = def;
    // const noCatchall = !def.catchall;

    inst._parse = (payload, ctx) => {
      const input = payload.value;
      if (!isObject(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          inst,
        });
        return payload;
      }

      const proms: Promise<any>[] = [];

      if (fastEnabled && ctx.async === false && !ctx.skipFast) {
        // always synchronous
        fastpass ??= generateFastpass();
        payload = fastpass(inst, payload, ctx);
      } else {
        payload.value = {};
        const normalized = _normalized.value;

        for (const key of normalized.keys) {
          const valueSchema = normalized.shape[key];

          // do not add omitted optional keys
          // if (!(key in input)) {
          //   if (optionalKeys.has(key)) continue;
          //   payload.issues.push({
          //     code: "invalid_type",
          //     path: [key],
          //     expected: "nonoptional",
          //     note: `Missing required key: "${key}"`,
          //     input,
          //     inst,
          //   });
          // }

          if (normalized.optionalKeys.has(key)) {
            if (!(key in input)) {
              continue;
            }
            if (input[key] === undefined) {
              input[key] = undefined;
              continue;
            }
          }

          const r = valueSchema._run({ value: input[key], issues: [], $payload: true }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((r) => handleObjectResult(r, payload, key)));
          } else {
            handleObjectResult(r, payload, key);
          }
        }
      }

      if (!catchall) {
        return proms.length ? Promise.all(proms).then(() => payload) : payload;
      }
      const unrecognized: string[] = [];
      // iterate over input keys
      for (const key of Object.keys(input)) {
        if (_normalized.value.keySet.has(key)) continue;
        if (catchall._def.type === "never") {
          unrecognized.push(key);
          continue;
        }
        const r = catchall._run({ value: input[key], issues: [], $payload: true }, ctx);

        if (r instanceof Promise) {
          proms.push(r.then((r) => handleObjectResult(r, payload, key)));
        } else {
          handleObjectResult(r, payload, key);
        }
      }

      if (unrecognized.length) {
        payload.issues.push({
          code: "unrecognized_keys",
          keys: unrecognized,
          input,
          inst,
        });
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

// export type $InferInterfaceOutput<
//   T extends $ZodLooseShape,
//   Extra extends Record<string, unknown> = Record<string, unknown>,
// > = string extends keyof T
//   ? Record<string, unknown>
//   : util.Flatten<
//       {
//         -readonly [k in keyof T as k extends `${infer K}?` ? K : never]?: T[k]["_output"];
//       } & {
//         -readonly [k in Exclude<keyof T, `${string}?`> as k extends `?${infer K}` ? K : k]: T[k]["_output"];
//       } & Extra
//     >;

// export type $InferInterfaceInput<
//   T extends $ZodLooseShape,
//   Extra extends Record<string, unknown> = Record<string, unknown>,
// > = string extends keyof T
//   ? Record<string, unknown>
//   : util.Flatten<
//       {
//         -readonly [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K}` ? K : never]?: T[k]["_input"];
//       } & {
//         -readonly [k in Exclude<keyof T, `${string}?` | `?${string}`>]: T[k]["_input"];
//       } & Extra
//     >;

export type $InferInterfaceOutput<
  T extends $ZodLooseShape,
  Params extends $ZodInterfaceNamedParams,
> = string extends keyof T
  ? object
  : {} extends T
    ? object
    : util.Flatten<
        {
          -readonly [k in Params["optional"]]?: T[k]["_output"];
        } & {
          -readonly [k in Exclude<keyof T, Params["optional"]>]: T[k]["_output"];
        } & Params["extra"]
      >;

export type $InferInterfaceInput<
  T extends $ZodLooseShape,
  Params extends $ZodInterfaceNamedParams,
> = string extends keyof T
  ? Record<string, unknown>
  : $ZodInterfaceNamedParams extends Params
    ? Record<string, unknown>
    : util.Flatten<
        {
          -readonly [k in Params["optional"] | Params["defaulted"]]?: T[k]["_input"];
        } & {
          -readonly [k in Exclude<keyof T, Params["optional"] | Params["defaulted"]>]: T[k]["_input"];
        } & Params["extra"]
      >;

export interface $ZodInterfaceDef<out Shape extends $ZodLooseShape = $ZodLooseShape> extends $ZodObjectLikeDef<Shape> {
  type: "interface";
}

export interface $ZodInterfaceNamedParams {
  optional: string;
  defaulted: string;
  extra: Record<string, unknown>;
}
export interface $ZodInterface<
  Shape extends $ZodLooseShape = $ZodLooseShape,
  Params extends $ZodInterfaceNamedParams = {
    optional: string & keyof Shape;
    defaulted: string & keyof Shape;
    extra: {};
  },
> extends $ZodObjectLike<$InferInterfaceOutput<Shape, Params>, $InferInterfaceInput<Shape, Params>> {
  _subtype: "interface";
  _def: $ZodInterfaceDef<Shape>;
  _shape: Shape;
  _optional: Params["optional"];
  _defaulted: Params["defaulted"];
  _extra: Params["extra"];
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
  [k in keyof T]: T[k] extends { _qout: "true" } ? k : never;
}[keyof T];
type OptionalOutProps<T extends $ZodShape> = {
  [k in OptionalOutKeys<T>]?: T[k]["_output"];
};
// type OptionalOutProps<T extends $ZodShape> = {
//   [k in keyof T]?: T[k]["_output"];
// };

// type RequiredOutKeys<T extends $ZodShape> = {
//   [k in keyof T]: T[k] extends { _qout: "true" } ? never : k;
// }[keyof T];
// type RequiredOutProps<T extends $ZodShape> = {
//   [k in RequiredOutKeys<T>]: T[k]["_output"];
// };
type RequiredOutProps<T extends $ZodShape> = {
  [k in keyof T as T[k]["_qout"] extends "true" ? never : k]-?: T[k]["_output"];
};
export type $InferObjectOutput<T extends $ZodShape, Extra extends Record<string, unknown>> = {} extends T
  ? object
  : util.Flatten<OptionalOutProps<T> & RequiredOutProps<T>> & Extra;

// type Empty = {};
// type RecordNever = Record<never, unknown>;
// type KInNever = { [k in never]: unknown };
// type A = util.Flatten<object & Empty>; // object
// type B = util.Flatten<object & RecordNever>; // {}
// type C = util.Flatten<object & KInNever>; // {}
// type E = keyof {}; // true
// type F = keyof { [k in never]?: unknown }; // false
// type G = keyof { [k in never]: unknown }; // false
// type H = keyof Record<never, unknown>; // false
// type I = Empty extends RecordNever ? true : false;
// type J = RecordNever extends Empty ? true : false;
// type K = KInNever extends Empty ? true : false;
// type L = Empty extends KInNever ? true : false;
// type M = KInNever extends RecordNever ? true : false;
// type N = RecordNever extends KInNever ? true : false;
// type O = Empty[keyof Empty]; // never
// type P = RecordNever[keyof RecordNever]; // unknown
// type Q = KInNever[keyof KInNever]; // unknown

// compute input type
type OptionalInKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { _qin: "true" } ? k : never;
}[keyof T];
type OptionalInProps<T extends $ZodShape> = {
  [k in OptionalInKeys<T>]?: T[k]["_input"];
};
type RequiredInKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { _qin: "true" } ? never : k;
}[keyof T];
type RequiredInProps<T extends $ZodShape> = {
  [k in RequiredInKeys<T>]: T[k]["_input"];
};
export type $InferObjectInput<T extends $ZodShape, Extra extends Record<string, unknown>> = util.Flatten<
  ({} extends T ? object : OptionalInProps<T> & RequiredInProps<T>) & Extra
>;

export interface $ZodObjectDef<Shape extends $ZodShape = $ZodShape> extends $ZodObjectLikeDef<Shape> {
  type: "object";
  shape: Shape;
}

export interface $ZodObject<
  Shape extends $ZodShape = $ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends $ZodObjectLike<$InferObjectOutput<Shape, Extra>, $InferObjectInput<Shape, Extra>> {
  /** @deprecated */
  _subtype: "object";
  /** @deprecated */
  _def: $ZodObjectDef<Shape>;
  /** @deprecated */
  _shape: Shape;
  /** @deprecated */
  _extra: Extra;
  // _params: {extra: Extra};
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
export interface $ZodUnionDef<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends base.$ZodTypeDef {
  type: "union";
  options: Options;
}

export interface $ZodUnion<T extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends base.$ZodType<T[number]["_output"], T[number]["_input"]> {
  _def: $ZodUnionDef<T>;
  _isst: errors.$ZodIssueInvalidUnion;

  _pattern: [T[number]] extends { _pattern: RegExp } ? RegExp : never;
}

function handleUnionResults(
  results: base.$ParsePayload[],
  final: base.$ParsePayload,
  inst: $ZodUnion,
  ctx?: base.$ParseContext
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
    inst,
    errors: results.map((result) => result.issues.map((iss) => base.finalizeIssue(iss, ctx))),
  });

  return final;
}

export const $ZodUnion: base.$constructor<$ZodUnion> = /*@__PURE__*/ base.$constructor("$ZodUnion", (inst, def) => {
  base.$ZodType.init(inst, def);

  const values = new Set<util.Primitive>();
  if (def.options.every((o) => o._values)) {
    for (const option of def.options) {
      for (const v of option._values!) {
        values.add(v);
      }
    }
    inst._values = values;
  }

  // computed union regex for _pattern if all options have _pattern
  if (def.options.every((o) => (o as any)._pattern)) {
    const patterns = def.options.map((o) => (o as any)._pattern);
    (inst as any)._pattern = new RegExp(`^(${patterns.map((p) => util.cleanRegex(p.source)).join("|")})$`);
  }

  inst._parse = (payload, ctx) => {
    const async = false;

    const results: util.MaybeAsync<base.$ParsePayload>[] = [];
    for (const option of def.options) {
      const result = option._run(
        {
          value: payload.value,
          issues: [],
          $payload: true,
        },
        ctx
      );
      if (result instanceof Promise) {
        results.push(result);
      } else {
        if (result.issues.length === 0) return result;
        results.push(result);
      }
    }

    if (!async) return handleUnionResults(results as base.$ParsePayload[], payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results as base.$ParsePayload[], payload, inst, ctx);
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

export interface $ZodDiscriminatedUnionDef<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends $ZodUnionDef<Options> {
  unionFallback?: boolean;
}

export interface $ZodDiscriminatedUnion<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends $ZodUnion<Options> {
  _def: $ZodDiscriminatedUnionDef<Options>;
  _disc: base.$DiscriminatorMap;
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
      if (!el._disc) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(el)}"`);
      for (const [key, o] of el._disc) {
        if (!_disc.has(key))
          _disc.set(key, {
            values: new Set(),
            maps: [],
          });
        const _o = _disc.get(key)!;
        for (const v of o.values) {
          // Removed to account for unions of unions
          // Some schemas may have the same discriminator value in this case
          /* if (_o.values.has(v)) {
            throw new Error(`Duplicate discriminator value: ${String(v)}`);
          } */
          _o.values.add(v);
        }
        for (const m of o.maps) _o.maps.push(m);
      }
    }
    inst._disc = _disc;

    const discMap: Map<base.$ZodType, base.$DiscriminatorMap> = new Map();
    for (const option of def.options) {
      const disc = option._disc;
      if (!disc) {
        throw new Error(`Invalid disciminated union element: ${option._def.type}`);
      }
      discMap.set(option, disc);
    }

    inst._parse = (payload, ctx) => {
      const input = payload.value;
      if (!util.isObject(input)) {
        payload.issues.push({
          code: "invalid_type",
          expected: "object",
          input,
          inst,
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

      if (filteredOptions.length === 1) return filteredOptions[0]._run(payload, ctx) as any;

      if (def.unionFallback) {
        return _super(payload, ctx);
      }
      payload.issues.push({
        code: "invalid_union",
        errors: [],
        note: "No matching discriminator",
        input,
        inst,
      });
      return payload;
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
}

export interface $ZodIntersection<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<A["_output"] & B["_output"], A["_input"] & B["_input"]> {
  _def: $ZodIntersectionDef;
  _isst: never;
}

function handleIntersectionResults(
  result: base.$ParsePayload,
  left: base.$ParsePayload,
  right: base.$ParsePayload
): base.$ParsePayload {
  if (left.issues.length) {
    result.issues.push(...left.issues);
  }
  if (right.issues.length) {
    result.issues.push(...right.issues);
  }
  if (util.aborted(result)) return result;
  // const result = base.$result(undefined, [...(parsedLeft.issues ?? []), ...(parsedRight.issues ?? [])], true);

  // if (base.$failed(result)) return result;

  const merged = mergeValues(left.value, right.value);

  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }

  result.value = merged.data;
  return result;
}

export const $ZodIntersection: base.$constructor<$ZodIntersection> = /*@__PURE__*/ base.$constructor(
  "$ZodIntersection",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._parse = (payload, ctx) => {
      const { value: input } = payload;
      const left = def.left._run({ value: input, issues: [], $payload: true }, ctx);
      const right = def.right._run({ value: input, issues: [], $payload: true }, ctx);
      const async = left instanceof Promise || right instanceof Promise;

      if (async) {
        return Promise.all([left, right]).then(([left, right]) => {
          // if (left.issues.length || right.issues.length) {
          //   payload.issues.push(...left.issues, ...right.issues);
          //   return payload;
          // }

          // const merged = mergeValues(left.value, right.value);
          // if (!merged.valid) {
          //   throw new Error(
          //     `Unmergable intersection types at ` +
          //       `${merged.mergeErrorPath.join(".")}: ${typeof left.value} and ${typeof right.value}`
          //   );
          // }

          // payload.value = merged.data;
          // return payload;
          return handleIntersectionResults(payload, left, right);
        });
      }

      return handleIntersectionResults(payload, left, right);
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
  T extends $ZodTupleItems = $ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodTypeDef {
  type: "tuple";
  items: T;
  rest: Rest;
}

export type $ZodTupleItems = readonly base.$ZodType[];
export type $InferTupleInputType<T extends $ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleInputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_input"][] : []),
];
type TupleInputTypeNoOptionals<T extends $ZodTupleItems> = {
  [k in keyof T]: T[k]["_input"];
};
type TupleInputTypeWithOptionals<T extends $ZodTupleItems> = T extends readonly [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_qin"] extends "true"
    ? [...TupleInputTypeWithOptionals<Prefix>, Tail["_input"]?]
    : TupleInputTypeNoOptionals<T>
  : [];

export type $InferTupleOutputType<T extends $ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleOutputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_output"][] : []),
];
type TupleOutputTypeNoOptionals<T extends $ZodTupleItems> = {
  [k in keyof T]: T[k]["_output"];
};
type TupleOutputTypeWithOptionals<T extends $ZodTupleItems> = T extends readonly [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_qout"] extends "true"
    ? [...TupleOutputTypeWithOptionals<Prefix>, Tail["_output"]?]
    : TupleOutputTypeNoOptionals<T>
  : [];

function handleTupleResult(result: base.$ParsePayload, final: base.$ParsePayload<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...util.prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

export interface $ZodTuple<
  T extends $ZodTupleItems = $ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodType<$InferTupleOutputType<T, Rest>, $InferTupleInputType<T, Rest>> {
  _def: $ZodTupleDef<T, Rest>;
  _isst: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<unknown[]> | errors.$ZodIssueTooSmall<unknown[]>;
}

export const $ZodTuple: base.$constructor<$ZodTuple> = /*@__PURE__*/ base.$constructor("$ZodTuple", (inst, def) => {
  base.$ZodType.init(inst, def);
  const items = def.items;
  const optStart = items.length - [...items].reverse().findIndex((item) => item._qout !== "true");

  inst._parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        input,
        inst,
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
      const tooSmall = input.length < optStart - 1;
      if (tooBig || tooSmall) {
        payload.issues.push({
          input,
          inst,
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
      const result = item._run(
        {
          value: input[i],
          issues: [],
          $payload: true,
        },
        ctx
      );

      if (result instanceof Promise) {
        proms.push(result.then((result) => handleTupleResult(result, payload, i)));
      } else {
        handleTupleResult(result, payload, i);
      }
    }

    if (def.rest) {
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._run(
          {
            value: el,
            issues: [],
            $payload: true,
          },
          ctx
        );

        if (result instanceof Promise) {
          proms.push(result.then((result) => handleTupleResult(result, payload, i)));
        } else {
          handleTupleResult(result, payload, i);
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
//   "_values": base.$PrimitiveSet;
// }

// interface $HasPattern extends base.$ZodType<PropertyKey, PropertyKey> {
//   "_pattern": RegExp;
// }

export interface $ZodPropertyKey extends base.$ZodType<PropertyKey, PropertyKey> {}

type $ZodRecordKey = base.$ZodType<string | number | symbol, string | number | symbol>; // $HasValues | $HasPattern;
export interface $ZodRecordDef extends base.$ZodTypeDef {
  type: "record";
  keyType: $ZodRecordKey;
  valueType: base.$ZodType;
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
  extends base.$ZodType<Record<Key["_output"], Value["_output"]>, Record<Key["_input"], Value["_input"]>> {
  _def: $ZodRecordDef;
  _isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
}

export const $ZodRecord: base.$constructor<$ZodRecord> = /*@__PURE__*/ base.$constructor("$ZodRecord", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, ctx) => {
    const input = payload.value;

    if (!util.isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst,
      });
      return payload;
    }

    const proms: Promise<any>[] = [];

    if ("_values" in def.keyType) {
      const values = def.keyType._values!;
      payload.value = {};
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          const result = def.valueType._run({ value: input[key], issues: [], $payload: true }, ctx);

          if (result instanceof Promise) {
            proms.push(
              result.then((result) => {
                if (result.issues.length) {
                  payload.issues.push(...util.prefixIssues(key, result.issues));
                }
                payload.value[key] = result.value;
              })
            );
          } else {
            if (result.issues.length) {
              payload.issues.push(...util.prefixIssues(key, result.issues));
            }
            payload.value[key] = result.value;
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
          inst,
          keys: unrecognized,
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__") continue;
        const keyResult = def.keyType._run({ value: key, issues: [], $payload: true }, ctx);

        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }

        if (keyResult.issues.length) {
          payload.issues.push({
            origin: "record",
            code: "invalid_key",
            issues: keyResult.issues.map((iss) => base.finalizeIssue(iss, ctx)),
            input: key,
            path: [key],
            inst,
          });
          continue;
        }

        const result = def.valueType._run({ value: input[key], issues: [], $payload: true }, ctx);

        if (result instanceof Promise) {
          proms.push(
            result.then((result) => {
              if (result.issues.length) {
                payload.issues.push(...util.prefixIssues(key, result.issues));
              } else {
                payload.value[keyResult.value as PropertyKey] = result.value;
              }
            })
          );
        } else {
          if (result.issues.length) {
            payload.issues.push(...util.prefixIssues(key, result.issues));
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
  extends base.$ZodType<Map<Key["_output"], Value["_output"]>, Map<Key["_input"], Value["_input"]>> {
  _def: $ZodMapDef;
  _isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement<unknown>;
}

function handleMapResult(
  keyResult: base.$ParsePayload,
  valueResult: base.$ParsePayload,
  final: base.$ParsePayload<Map<unknown, unknown>>,
  key: unknown,
  input: Map<any, any>,
  inst: $ZodMap,
  ctx?: base.$ParseContext | undefined
): void {
  if (keyResult.issues.length) {
    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...util.prefixIssues(key as PropertyKey, keyResult.issues));
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_key",
        input,
        inst,
        issues: keyResult.issues.map((iss) => base.finalizeIssue(iss, ctx)),
      });
    }
  }
  if (valueResult.issues.length) {
    // if (!fail) fail = new base.$ZodFailure();

    if (util.propertyKeyTypes.has(typeof key)) {
      final.issues.push(...util.prefixIssues(key as PropertyKey, valueResult.issues));
      // fail = base.mergeFails(fail, valueResult, key as PropertyKey);
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_element",
        input,
        inst,
        key: key,
        issues: valueResult.issues.map((iss) => base.finalizeIssue(iss, ctx)),
      });
    }
    // return final;
  } else {
    final.value.set(keyResult.value, valueResult.value);
  }
}

export const $ZodMap: base.$constructor<$ZodMap> = /*@__PURE__*/ base.$constructor("$ZodMap", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Map)) {
      payload.issues.push({
        expected: "map",
        code: "invalid_type",
        input,
        inst,
      });
      return payload;
    }

    const proms: Promise<any>[] = [];
    payload.value = new Map();

    for (const [key, value] of input) {
      const keyResult = def.keyType._run({ value: key, issues: [], $payload: true }, ctx);
      const valueResult = def.valueType._run({ value: value, issues: [], $payload: true }, ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        proms.push(
          Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
            handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
          })
        );
      } else {
        handleMapResult(
          keyResult as base.$ParsePayload,
          valueResult as base.$ParsePayload,
          payload,
          key,
          input,
          inst,
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
}

export interface $ZodSet<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<Set<T["_output"]>, Set<T["_input"]>> {
  _def: $ZodSetDef;
  _isst: errors.$ZodIssueInvalidType;
}

function handleSetResult(result: base.$ParsePayload, final: base.$ParsePayload<Set<any>>) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  } else {
    final.value.add(result.value);
  }
}

export const $ZodSet: base.$constructor<$ZodSet> = /*@__PURE__*/ base.$constructor("$ZodSet", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Set)) {
      payload.issues.push({
        input,
        inst,
        expected: "set",
        code: "invalid_type",
      });
      return payload;
    }

    const proms: Promise<any>[] = [];
    payload.value = new Set();
    for (const item of input) {
      const result = def.valueType._run({ value: item, issues: [], $payload: true }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleSetResult(result, payload)));
      } else handleSetResult(result, payload);
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
}

export interface $ZodEnum<T extends util.EnumLike = util.EnumLike>
  extends base.$ZodType<$InferEnumOutput<T>, $InferEnumInput<T>> {
  enum: T;

  _def: $ZodEnumDef<T>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _values: base.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  _pattern: RegExp;
  _isst: errors.$ZodIssueInvalidValue;
}

export const $ZodEnum: base.$constructor<$ZodEnum> = /*@__PURE__*/ base.$constructor("$ZodEnum", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst.enum = def.entries;

  const values = Object.entries(def.entries)
    // remove reverse mappings
    .filter(([k, _]) => {
      return typeof def.entries[def.entries[k]] !== "number";
    })
    .map(([_, v]) => v);
  inst._values = new Set<util.Primitive>(values);

  inst._pattern = new RegExp(
    `^(${values
      .filter((k) => util.propertyKeyTypes.has(typeof k))
      .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o.toString()))
      .join("|")})$`
  );

  inst._parse = (payload, _ctx) => {
    const input = payload.value;
    if (inst._values.has(input as any)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst,
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
}

export interface $ZodLiteral<T extends util.Primitive = util.Primitive> extends base.$ZodType<T, T> {
  _def: $ZodLiteralDef;
  _values: base.$PrimitiveSet;
  _pattern: RegExp;
  _isst: errors.$ZodIssueInvalidValue;
}

export const $ZodLiteral: base.$constructor<$ZodLiteral> = /*@__PURE__*/ base.$constructor(
  "$ZodLiteral",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._values = new Set<util.Primitive>(def.values);
    inst._pattern = new RegExp(
      `^(${def.values
        // .filter((k) => util.propertyKeyTypes.has(typeof k))
        .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o ? o.toString() : String(o)))
        .join("|")})$`
    );

    inst._parse = (payload, _ctx) => {
      const input = payload.value;
      if (inst._values.has(input as any)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values: def.values,
        input,
        inst,
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

// export interface $ZodConstDef extends base.$ZodTypeDef {
//   type: "const";
//   value: unknown;
// }

// export interface $ZodConst<T extends util.Literal = util.Literal> extends base.$ZodType<T, T> {
//   _def: $ZodConstDef;
//   _values: base.$PrimitiveSet;
//   _pattern: RegExp;
//   _isst: errors.$ZodIssueInvalidValue;
// }

// export const $ZodConst: base.$constructor<$ZodConst> = /*@__PURE__*/ base.$constructor("$ZodConst", (inst, def) => {
//   base.$ZodType.init(inst, def);

//   if (util.primitiveTypes.has(typeof def.value) || def.value === null) {
//     inst._values = new Set<util.Primitive>(def.value as any);
//   }

//   if (util.propertyKeyTypes.has(typeof def.value)) {
//     inst._pattern = new RegExp(
//       `^(${typeof def.value === "string" ? util.escapeRegex(def.value) : (def.value as any).toString()})$`
//     );
//   } else {
//     throw new Error("Const value cannot be converted to regex");
//   }

//   inst._parse = (payload, _ctx) => {
//     payload.value = def.value; // always override
//     return payload;
//   };
// });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile        //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface $ZodFileDef extends base.$ZodTypeDef {
  type: "file";
}

export interface $ZodFile extends base.$ZodType<File, File> {
  _def: $ZodFileDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodFile: base.$constructor<$ZodFile> = /*@__PURE__*/ base.$constructor("$ZodFile", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    const input = payload.value;
    if (input instanceof File) return payload;
    payload.issues.push({
      expected: "file",
      code: "invalid_type",
      input,
      inst,
    });
    return payload;
  };
});

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////        $ZodTransform        //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////
export interface $ZodTransformDef extends base.$ZodTypeDef {
  type: "transform";
  transform: (input: unknown, payload: base.$ParsePayload<unknown>) => util.MaybeAsync<unknown>;
  abort?: boolean | undefined;
}
export interface $ZodTransform<O = unknown, I = unknown> extends base.$ZodType<O, I> {
  _def: $ZodTransformDef;
  _isst: never;
}

export const $ZodTransform: base.$constructor<$ZodTransform> = /*@__PURE__*/ base.$constructor(
  "$ZodTransform",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._parse = (payload, _ctx) => {
      const _output = def.transform(payload.value, payload);

      if (_ctx.async) {
        const output = _output instanceof Promise ? _output : Promise.resolve(_output);
        return output.then((output) => {
          payload.value = output;
          return payload;
        });
      }

      if (_output instanceof Promise) {
        throw new base.$ZodAsyncError();
      }

      payload.value = _output;
      return payload;
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodOptional      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodOptionalDef<T extends base.$ZodType> extends base.$ZodTypeDef {
  type: "optional";
  innerType: T;
}

export interface $ZodOptional<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"] | undefined, T["_input"] | undefined> {
  _def: $ZodOptionalDef<T>;
  _qin: "true";
  _qout: "true";
  _isst: never;
  _values: T["_values"];
  _pattern: RegExp;
}

export const $ZodOptional: base.$constructor<$ZodOptional> = /*@__PURE__*/ base.$constructor(
  "$ZodOptional",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._qin = "true";
    inst._qout = "true";
    if (def.innerType._values) inst._values = new Set([...def.innerType._values, undefined]);
    const pattern = (def.innerType as any)._pattern;
    if (pattern) inst._pattern = new RegExp(`^(${util.cleanRegex(pattern.source)})?$`);

    inst._parse = (payload, ctx) => {
      if (payload.value === undefined) {
        return payload;
      }
      return def.innerType._run(payload, ctx);
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
}

export interface $ZodNullable<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"] | null, T["_input"] | null> {
  _def: $ZodNullableDef<T>;
  _qin: T["_qin"];
  _qout: T["_qout"];
  _isst: never;
  _values: T["_values"];
  _pattern: RegExp;
}

export const $ZodNullable: base.$constructor<$ZodNullable> = /*@__PURE__*/ base.$constructor(
  "$ZodNullable",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;

    const pattern = (def.innerType as any)._pattern;
    if (pattern) inst._pattern = new RegExp(`^(${util.cleanRegex(pattern.source)}|null)$`);

    if (def.innerType._values) inst._values = new Set([...def.innerType._values, null]);

    inst._parse = (payload, ctx) => {
      if (payload.value === null) return payload;
      return def.innerType._run(payload, ctx);
    };
  }
);

// export interface $ZodNullableDef<T extends base.$ZodType = base.$ZodType> extends $ZodUnionDef {
//   type: "nullable";
//   innerType: T;
// }

// export interface $ZodNullable<T extends base.$ZodType = base.$ZodType> extends $ZodUnion<[T, $ZodNull]> {
//   _qin: T["_qin"];
//   _qout: T["_qout"];
//   _isst: never;
//   _values: T["_values"];
// }

// export const $ZodNullable: base.$constructor<$ZodNullable> = /*@__PURE__*/ base.$constructor(
//   "$ZodNullable",
//   (inst, def) => {
//     $ZodUnion.init(inst, def);
//     const innerType = def.options[0];
//     inst._qin = innerType._qin;
//     inst._qout = innerType._qout;
//     if (innerType._values) inst._values = new Set([...innerType._values, null]);

//     inst._parse = (payload, ctx) => {
//       if (payload.value === null) return payload;
//       return innerType._run(payload, ctx);
//     };
//   }
// );

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodDefaultDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "default";
  innerType: T;
  defaultValue: () => util.NoUndefined<T["_output"]>;
}

export interface $ZodDefault<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<
    // this is pragmatic but not strictly correct
    util.NoUndefined<T["_output"]>,
    T["_input"] | undefined
  > {
  _def: $ZodDefaultDef<T>;
  _qin: "true";
  _isst: never;
  _values: T["_values"];
}

function handleDefaultResult(payload: base.$ParsePayload, def: $ZodDefaultDef) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue();
  }
  return payload;
}

export const $ZodDefault: base.$constructor<$ZodDefault> = /*@__PURE__*/ base.$constructor(
  "$ZodDefault",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._qin = "true"; //def.innerType["_qin"];
    inst._values = def.innerType._values;

    inst._parse = (payload, ctx) => {
      if (payload.value === undefined) {
        payload.value = def.defaultValue();
        /**
         * $ZodDefault always returns the default value immediately.
         * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
        return payload;
      }
      const result = def.innerType._run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleDefaultResult(result, def));
      }
      return handleDefaultResult(result, def);
    };
  }
);

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      $ZodNonOptional      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////
export interface $ZodNonOptionalDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
  type: "nonoptional";
  innerType: T;
}

export interface $ZodNonOptional<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<util.NoUndefined<T["_output"]>, util.NoUndefined<T["_input"]>> {
  _def: $ZodNonOptionalDef<T>;
  _isst: errors.$ZodIssueInvalidType;
  _values: T["_values"];
}

function handleNonOptionalResult(payload: base.$ParsePayload, inst: $ZodNonOptional) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst,
    });
  }
  return payload;
}

export const $ZodNonOptional: base.$constructor<$ZodNonOptional> = /*@__PURE__*/ base.$constructor(
  "$ZodNonOptional",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    if (def.innerType._values) inst._values = new Set([...def.innerType._values].filter((x) => x !== undefined));
    inst._parse = (payload, ctx) => {
      const result = def.innerType._run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleNonOptionalResult(result, inst));
      }
      return handleNonOptionalResult(result, inst);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodCoalesce      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
// export interface $ZodCoalesceDef<T extends base.$ZodType = base.$ZodType> extends base.$ZodTypeDef {
//   type: "coalesce";
//   innerType: T;
//   defaultValue: () => NonNullable<T["_output"]>;
// }

// export interface $ZodCoalesce<T extends base.$ZodType = base.$ZodType>
//   extends base.$ZodType<NonNullable<T["_output"]>, T["_input"] | undefined | null> {
//   _def: $ZodCoalesceDef<T>;
//   _isst: errors.$ZodIssueInvalidType;
//   _qin: "true";
// }

// function handleCoalesceResult(payload: base.$ParsePayload, def: $ZodCoalesceDef) {
//   payload.value ??= def.defaultValue();
//   return payload;
// }

// export const $ZodCoalesce: base.$constructor<$ZodCoalesce> = /*@__PURE__*/ base.$constructor(
//   "$ZodCoalesce",
//   (inst, def) => {
//     base.$ZodType.init(inst, def);
// inst._qin = "true";
//     inst._parse = (payload, ctx) => {
//       const result = def.innerType._run(payload, ctx);
//       if (result instanceof Promise) {
//         return result.then((result) => handleCoalesceResult(result, def));
//       }
//       return handleCoalesceResult(result, def);
//     };
//   }
// );

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
}

export interface $ZodSuccess<T extends base.$ZodType = base.$ZodType> extends base.$ZodType<boolean, T["_input"]> {
  _def: $ZodSuccessDef;
  _isst: never;
}

export const $ZodSuccess: base.$constructor<$ZodSuccess> = /*@__PURE__*/ base.$constructor(
  "$ZodSuccess",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._parse = (payload, ctx) => {
      const result = def.innerType._run(payload, ctx);
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
//////////       $ZodCatch        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodCatchCtx extends base.$ParsePayload {
  /** @deprecated Use `ctx.issues` */
  error: { issues: errors.$ZodIssue[] };
  /** @deprecated Use `ctx.value` */
  input: unknown;
}
export interface $ZodCatchDef extends base.$ZodTypeDef {
  type: "catch";
  innerType: base.$ZodType;
  catchValue: (ctx: $ZodCatchCtx) => unknown;
}

export interface $ZodCatch<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<T["_output"], util.Loose<T["_input"]>> {
  _def: $ZodCatchDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
  _isst: never;
  _values: T["_values"];
}

export const $ZodCatch: base.$constructor<$ZodCatch> = /*@__PURE__*/ base.$constructor("$ZodCatch", (inst, def) => {
  base.$ZodType.init(inst, def);
  // inst._qin = def.innerType._qin;
  inst._qout = def.innerType._qout;
  inst._values = def.innerType._values;

  inst._parse = (payload, ctx) => {
    const result = def.innerType._run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: { issues: result.issues.map((iss) => base.finalizeIssue(iss, ctx)) },
            input: payload.value,
          });
          payload.issues = [];
        } else {
          payload.value = result.value;
        }
        return payload;
      });
    }

    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: { issues: result.issues.map((iss) => base.finalizeIssue(iss, ctx)) },
        input: payload.value,
      });
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
}

export interface $ZodNaN extends base.$ZodType<number, number> {
  _def: $ZodNaNDef;
  _isst: errors.$ZodIssueInvalidType;
}

export const $ZodNaN: base.$constructor<$ZodNaN> = /*@__PURE__*/ base.$constructor("$ZodNaN", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _ctx) => {
    if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
      payload.issues.push({
        input: payload.value,
        inst,
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
//////////      $ZodPipe      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodPipeDef<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodTypeDef {
  type: "pipe";
  in: A;
  out: B;
}

export interface $ZodPipe<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<B["_output"], A["_input"]> {
  _def: $ZodPipeDef<A, B>;
  _isst: never;
  // _qin: A["_qin"];
  // _qout: A["_qout"];
  _values: A["_values"];
}

function handlePipeResult(left: base.$ParsePayload, def: $ZodPipeDef, ctx: base.$ParseContext) {
  if (util.aborted(left)) {
    return left;
  }

  return def.out._run({ value: left.value, issues: left.issues, $payload: true }, ctx);
}

export const $ZodPipe: base.$constructor<$ZodPipe> = /*@__PURE__*/ base.$constructor("$ZodPipe", (inst, def) => {
  base.$ZodType.init(inst, def);
  // inst._qin = def.in._qin;
  // inst._qout = def.in._qout;
  inst._values = def.in._values;

  inst._parse = (payload, ctx) => {
    const left = def.in._run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def, ctx));
    }
    return handlePipeResult(left, def, ctx);
  };
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodReadonly      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////

function handleReadonlyResult(payload: base.$ParsePayload): base.$ParsePayload {
  payload.value = Object.freeze(payload.value);
  return payload;
}

export interface $ZodReadonlyDef extends base.$ZodTypeDef {
  type: "readonly";
  innerType: base.$ZodType;
}

export interface $ZodReadonly<T extends base.$ZodType = base.$ZodType>
  extends base.$ZodType<util.MakeReadonly<T["_output"]>, util.MakeReadonly<T["_input"]>> {
  _def: $ZodReadonlyDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
  _isst: never;
}

export const $ZodReadonly: base.$constructor<$ZodReadonly> = /*@__PURE__*/ base.$constructor(
  "$ZodReadonly",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._qin = def.innerType._qin;
    inst._qout = def.innerType._qout;

    inst._parse = (payload, ctx) => {
      const result = def.innerType._run(payload, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
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
}
export interface $ZodTemplateLiteral<Template extends string = string> extends base.$ZodType<Template, Template> {
  _pattern: RegExp;
  _def: $ZodTemplateLiteralDef;
  _isst: errors.$ZodIssueInvalidType;
}

export type $LiteralPart = Exclude<util.Literal, symbol>; //string | number | boolean | null | undefined;
export interface $SchemaPart extends base.$ZodType<$LiteralPart, $LiteralPart> {
  _pattern: RegExp;
}
export type $TemplateLiteralPart = $LiteralPart | $SchemaPart;

type UndefinedToEmptyString<T> = T extends undefined ? "" : T;
type AppendToTemplateLiteral<
  Template extends string,
  Suffix extends $LiteralPart | base.$ZodType,
> = Suffix extends $LiteralPart
  ? `${Template}${UndefinedToEmptyString<Suffix>}`
  : Suffix extends base.$ZodType<infer Output extends $LiteralPart>
    ? `${Template}${UndefinedToEmptyString<Output>}`
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
        if (!("_pattern" in part)) {
          // if (!source)
          throw new Error(`Invalid template literal part, no _pattern found: ${[...(part as any)._traits].shift()}`);
        }
        const source = part._pattern instanceof RegExp ? part._pattern.source : part._pattern;

        // if (!source) throw new Error(`Invalid template literal part: ${part._traits}`);

        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else if (part === null || util.primitiveTypes.has(typeof part)) {
        regexParts.push(util.escapeRegex(`${part}`));
      } else {
        throw new Error(`Invalid template literal part: ${part}`);
      }
    }
    inst._pattern = new RegExp(`^${regexParts.join("")}$`);

    inst._parse = (payload, _ctx) => {
      if (typeof payload.value !== "string") {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "template_literal",
          code: "invalid_type",
        });
        return payload;
      }

      inst._pattern.lastIndex = 0;

      if (!inst._pattern.test(payload.value)) {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "template_literal",
          code: "invalid_type",
          pattern: inst._pattern,
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
  extends base.$ZodType<T["_output"], util.MaybeAsync<T["_input"]>> {
  _def: $ZodPromiseDef;
  _isst: never;
}

export const $ZodPromise: base.$constructor<$ZodPromise> = /*@__PURE__*/ base.$constructor(
  "$ZodPromise",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._parse = (payload, ctx) => {
      return Promise.resolve(payload.value).then((inner) =>
        def.innerType._run({ value: inner, issues: [], $payload: true }, ctx)
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
export interface $ZodCustomDef<O = unknown> extends base.$ZodTypeDef, base.$ZodCheckDef {
  type: "custom";
  check: "custom";
  path?: PropertyKey[] | undefined;
  error?: errors.$ZodErrorMap | undefined;
  params?: Record<string, any> | undefined;
  fn: (arg: O) => unknown; // base.$ZodCheck<O>["_check"];
}

export interface $ZodCustom<O = unknown, I = unknown> extends base.$ZodType<O, I>, base.$ZodCheck<O> {
  _def: $ZodCustomDef;
  _issc: errors.$ZodIssue;
  _isst: never;
}

function handleRefineResult(result: unknown, payload: base.$ParsePayload, input: unknown, inst: $ZodCustom): void {
  if (!result) {
    const _iss: any = {
      code: "custom",
      input,
      inst, // incorporates params.error into issue reporting
      path: inst._def.path, // incorporates params.error into issue reporting
      continue: !inst._def.abort,
      // params: inst._def.params,
    };
    if (inst._def.params) _iss.params = inst._def.params;
    payload.issues.push(util.issue(_iss));
  }
}

export const $ZodCustom: base.$constructor<$ZodCustom<unknown>> = base.$constructor("$ZodCustom", (inst, def) => {
  if (def.checks?.length) console.warn("Can't add custom checks to z.custom()");

  base.$ZodCheck.init(inst, def);
  base.$ZodType.init(inst, def);

  inst._parse = (payload, _) => {
    return payload;
  };

  inst._check = (payload) => {
    const input = payload.value;
    const r = def.fn(input as any);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});

////////   FIRST PARTY TYPES   ////////

export type $ZodTypes =
  | $ZodString
  | $ZodNumber
  | $ZodBigInt
  | $ZodBoolean
  | $ZodDate
  | $ZodSymbol
  | $ZodUndefined
  | $ZodNull
  | $ZodAny
  | $ZodUnknown
  | $ZodNever
  | $ZodVoid
  | $ZodArray
  | $ZodObject
  | $ZodInterface
  | $ZodUnion
  | $ZodIntersection
  | $ZodTuple
  | $ZodRecord
  | $ZodMap
  | $ZodSet
  | $ZodLiteral
  | $ZodEnum
  | $ZodPromise
  | $ZodOptional
  | $ZodDefault
  | $ZodTemplateLiteral
  | $ZodCustom
  | $ZodTransform
  | $ZodNonOptional
  | $ZodReadonly
  | $ZodNaN
  | $ZodPipe
  | $ZodSuccess
  | $ZodCatch
  | $ZodFile;
