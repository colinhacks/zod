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
export interface _$ZodStringDef extends base._$ZodTypeDef {
  type: "string";
  coerce?: boolean;
  checks: base.$ZodCheck<string>[];
}

export interface _$ZodString<Input = unknown> extends base._$ZodType<string, Input> {
  def: _$ZodStringDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;

  /** @deprecated Internal API, use with caution (not deprecated) */
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodString<Input = unknown> extends base.$ZodType {
  _zod: _$ZodString<Input>;
}

export const $ZodString: base.$constructor<$ZodString> = /*@__PURE__*/ base.$constructor("$ZodString", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._zod.pattern = inst._zod?.computed?.pattern ?? regexes.stringRegex(inst._zod.computed);

  inst._zod.parse = (payload, _) => {
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
});

//////////////////////////////   ZodStringFormat   //////////////////////////////

export interface _$ZodStringFormatDef<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends _$ZodStringDef,
    checks.$ZodCheckStringFormatDef<Format> {}

export interface _$ZodStringFormat<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends _$ZodString<string>,
    checks._$ZodCheckStringFormat {
  def: _$ZodStringFormatDef<Format>;
}

export interface $ZodStringFormat<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends base.$ZodType {
  _zod: _$ZodStringFormat<Format>;
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
export interface _$ZodGUID extends _$ZodStringFormat<"guid"> {}
export interface $ZodGUID extends $ZodStringFormat<"guid"> {}

export const $ZodGUID: base.$constructor<$ZodGUID> = /*@__PURE__*/ base.$constructor("$ZodGUID", (inst, def): void => {
  def.pattern ??= regexes.guidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodUUID   //////////////////////////////

export interface _$ZodUUIDDef extends _$ZodStringFormatDef<"uuid"> {
  version?: "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
}

export interface _$ZodUUID extends _$ZodStringFormat<"uuid"> {
  def: _$ZodUUIDDef;
}

export interface $ZodUUID extends $ZodStringFormat<"uuid"> {
  _zod: _$ZodUUID;
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

export interface _$ZodEmail extends _$ZodStringFormat<"email"> {}
export interface $ZodEmail extends $ZodStringFormat<"email"> {}

export const $ZodEmail: base.$constructor<$ZodEmail> = /*@__PURE__*/ base.$constructor(
  "$ZodEmail",
  (inst, def): void => {
    def.pattern ??= regexes.emailRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodURL   //////////////////////////////

// export interface _$ZodURLDef extends _$ZodStringFormatDef<"url"> {}

export interface _$ZodURL extends _$ZodStringFormat<"url"> {}

export interface $ZodURL extends $ZodStringFormat<"url"> {
  _zod: _$ZodURL;
}

export const $ZodURL: base.$constructor<$ZodURL> = /*@__PURE__*/ base.$constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const url = new URL(payload.value);
      regexes.hostnameRegex.lastIndex = 0;
      if (!regexes.hostnameRegex.test(url.hostname)) throw new Error();
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        message: "Invalid URL",
      });
    }
  };
});

//////////////////////////////   ZodEmoji   //////////////////////////////

export interface _$ZodEmoji extends _$ZodStringFormat<"emoji"> {}
export interface $ZodEmoji extends $ZodStringFormat<"emoji"> {}

export const $ZodEmoji: base.$constructor<$ZodEmoji> = /*@__PURE__*/ base.$constructor(
  "$ZodEmoji",
  (inst, def): void => {
    def.pattern ??= regexes.emojiRegex();
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodNanoID   //////////////////////////////

export interface _$ZodNanoID extends _$ZodStringFormat<"nanoid"> {}
export interface $ZodNanoID extends $ZodStringFormat<"nanoid"> {}

export const $ZodNanoID: base.$constructor<$ZodNanoID> = /*@__PURE__*/ base.$constructor(
  "$ZodNanoID",
  (inst, def): void => {
    def.pattern ??= regexes.nanoidRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodCUID   //////////////////////////////

export interface _$ZodCUID extends _$ZodStringFormat<"cuid"> {}
export interface $ZodCUID extends $ZodStringFormat<"cuid"> {}

export const $ZodCUID: base.$constructor<$ZodCUID> = /*@__PURE__*/ base.$constructor("$ZodCUID", (inst, def): void => {
  def.pattern ??= regexes.cuidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodCUID2   //////////////////////////////

export interface _$ZodCUID2 extends _$ZodStringFormat<"cuid2"> {}
export interface $ZodCUID2 extends $ZodStringFormat<"cuid2"> {}

export const $ZodCUID2: base.$constructor<$ZodCUID2> = /*@__PURE__*/ base.$constructor(
  "$ZodCUID2",
  (inst, def): void => {
    def.pattern ??= regexes.cuid2Regex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodULID   //////////////////////////////

export interface _$ZodULID extends _$ZodStringFormat<"ulid"> {}
export interface $ZodULID extends $ZodStringFormat<"ulid"> {}

export const $ZodULID: base.$constructor<$ZodULID> = /*@__PURE__*/ base.$constructor("$ZodULID", (inst, def): void => {
  def.pattern ??= regexes.ulidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodXID   //////////////////////////////

export interface _$ZodXID extends _$ZodStringFormat<"xid"> {}
export interface $ZodXID extends $ZodStringFormat<"xid"> {}

export const $ZodXID: base.$constructor<$ZodXID> = /*@__PURE__*/ base.$constructor("$ZodXID", (inst, def): void => {
  def.pattern ??= regexes.xidRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodKSUID   //////////////////////////////

export interface _$ZodKSUID extends _$ZodStringFormat<"ksuid"> {}
export interface $ZodKSUID extends $ZodStringFormat<"ksuid"> {}

export const $ZodKSUID: base.$constructor<$ZodKSUID> = /*@__PURE__*/ base.$constructor(
  "$ZodKSUID",
  (inst, def): void => {
    def.pattern ??= regexes.ksuidRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODateTime   //////////////////////////////

export interface _$ZodISODateTimeDef extends _$ZodStringFormatDef<"iso_datetime"> {
  precision: number | null;
  offset: boolean;
  local: boolean;
}

export interface _$ZodISODateTime extends _$ZodStringFormat {
  def: _$ZodISODateTimeDef;
}
export interface $ZodISODateTime extends $ZodStringFormat {
  _zod: _$ZodISODateTime;
}

export const $ZodISODateTime: base.$constructor<$ZodISODateTime> = /*@__PURE__*/ base.$constructor(
  "$ZodISODateTime",
  (inst, def): void => {
    def.pattern ??= regexes.datetimeRegex(def);
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODate   //////////////////////////////

export interface _$ZodISODate extends _$ZodStringFormat<"iso_date"> {}
export interface $ZodISODate extends $ZodStringFormat<"iso_date"> {}

export const $ZodISODate: base.$constructor<$ZodISODate> = /*@__PURE__*/ base.$constructor(
  "$ZodISODate",
  (inst, def): void => {
    def.pattern ??= regexes.dateRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISOTime   //////////////////////////////

export interface _$ZodISOTimeDef extends _$ZodStringFormatDef<"iso_time"> {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}

export interface _$ZodISOTime extends _$ZodStringFormat<"iso_time"> {
  def: _$ZodISOTimeDef;
}

export interface $ZodISOTime extends $ZodStringFormat<"iso_time"> {
  _zod: _$ZodISOTime;
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}

export const $ZodISOTime: base.$constructor<$ZodISOTime> = /*@__PURE__*/ base.$constructor(
  "$ZodISOTime",
  (inst, def): void => {
    def.pattern ??= regexes.timeRegex(def);
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodISODuration   //////////////////////////////

export interface _$ZodISODuration extends _$ZodStringFormat<"duration"> {}
export interface $ZodISODuration extends $ZodStringFormat<"duration"> {}

export const $ZodISODuration: base.$constructor<$ZodISODuration> = /*@__PURE__*/ base.$constructor(
  "$ZodISODuration",
  (inst, def): void => {
    def.pattern ??= regexes.durationRegex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodIP   //////////////////////////////

export interface _$ZodIPDef extends _$ZodStringFormatDef<"ip"> {
  version?: "v4" | "v6";
}

export interface _$ZodIP extends _$ZodStringFormat<"ip"> {
  def: _$ZodIPDef;
}

export interface $ZodIP extends $ZodStringFormat<"ip"> {
  _zod: _$ZodIP;
}

export const $ZodIP: base.$constructor<$ZodIP> = /*@__PURE__*/ base.$constructor("$ZodIP", (inst, def): void => {
  if (def.version === "v4") def.pattern ??= regexes.ipv4Regex;
  else if (def.version === "v6") def.pattern ??= regexes.ipv6Regex;
  else def.pattern ??= regexes.ipRegex;
  $ZodStringFormat.init(inst, def);
});

//////////////////////////////   ZodBase64   //////////////////////////////

export interface _$ZodBase64 extends _$ZodStringFormat<"base64"> {}
export interface $ZodBase64 extends $ZodStringFormat<"base64"> {}

export const $ZodBase64: base.$constructor<$ZodBase64> = /*@__PURE__*/ base.$constructor(
  "$ZodBase64",
  (inst, def): void => {
    def.pattern ??= regexes.base64Regex;
    $ZodStringFormat.init(inst, def);
  }
);

//////////////////////////////   ZodJSONString   //////////////////////////////

// export interface _$ZodJSONStringDef extends _$ZodStringFormatDef<"json_string"> {}
// export interface $ZodJSONString extends $ZodStringFormat {
//   _def: _$ZodJSONStringDef;
// }

// export const $ZodJSONString: base.$constructor<$ZodJSONString> = /*@__PURE__*/ base.$constructor(
//   "$ZodJSONString",
//   (inst, def): void => {
//     $ZodStringFormat.init(inst, def);
//     inst._zod.check = (payload) => {
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

export interface _$ZodE164 extends _$ZodStringFormat<"e164"> {}
export interface $ZodE164 extends $ZodStringFormat<"e164"> {}

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

export interface _$ZodJWTDef extends _$ZodStringFormatDef<"jwt"> {
  alg?: util.JWTAlgorithm | undefined;
}

export interface _$ZodJWT extends _$ZodStringFormat<"jwt"> {
  def: _$ZodJWTDef;
}

export interface $ZodJWT extends $ZodStringFormat<"jwt"> {
  _zod: _$ZodJWT;
}

export const $ZodJWT: base.$constructor<$ZodJWT> = /*@__PURE__*/ base.$constructor("$ZodJWT", (inst, def): void => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg)) return;

    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      message: "Invalid JWT",
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

export interface _$ZodNumberDef extends base._$ZodTypeDef {
  type: "number";
  coerce?: boolean;
  checks: base.$ZodCheck<number>[];
}

export interface _$ZodNumber<Input = unknown> extends base._$ZodType<number, Input> {
  def: _$ZodNumberDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodNumber<Input = unknown> extends base.$ZodType {
  _zod: _$ZodNumber<Input>;
}

export const $ZodNumber: base.$constructor<$ZodNumber> = /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.computed.pattern ?? regexes.numberRegex;

  inst._zod.parse = (payload, _ctx) => {
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
});

///////////////////////////////////////////////
//////////      ZodNumberFormat      //////////
///////////////////////////////////////////////
export interface _$ZodNumberFormatDef extends _$ZodNumberDef, checks.$ZodCheckNumberFormatDef {}

export interface _$ZodNumberFormat extends _$ZodNumber<number>, checks._$ZodCheckNumberFormat {
  def: _$ZodNumberFormatDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodNumberFormat extends base.$ZodType {
  _zod: _$ZodNumberFormat;
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

export interface _$ZodBooleanDef extends base._$ZodTypeDef {
  type: "boolean";
  coerce?: boolean;
  checks?: base.$ZodCheck<boolean>[];
}

export interface _$ZodBoolean<T = unknown> extends base._$ZodType<boolean, T> {
  pattern: RegExp;
  def: _$ZodBooleanDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodBoolean<T = unknown> extends base.$ZodType {
  _zod: _$ZodBoolean<T>;
}

export const $ZodBoolean: base.$constructor<$ZodBoolean> = /*@__PURE__*/ base.$constructor(
  "$ZodBoolean",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._zod.pattern = regexes.booleanRegex;

    inst._zod.parse = (payload, _ctx) => {
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

export interface _$ZodBigIntDef extends base._$ZodTypeDef {
  type: "bigint";
  coerce?: boolean;
  checks: base.$ZodCheck<bigint>[];
}

export interface _$ZodBigInt<T = unknown> extends base._$ZodType<bigint, T> {
  pattern: RegExp;
  /** @internal Internal API, use with caution */
  def: _$ZodBigIntDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodBigInt<T = unknown> extends base.$ZodType {
  _zod: _$ZodBigInt<T>;
}

export const $ZodBigInt: base.$constructor<$ZodBigInt> = /*@__PURE__*/ base.$constructor("$ZodBigInt", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._zod.pattern = regexes.bigintRegex;

  inst._zod.parse = (payload, _ctx) => {
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

// export interface ZodBigInt<T = unknown> extends base.$ZodType {
//   _zod: $ZodBigInt<T>;
// }

// export const ZodBigInt: base.$constructor<ZodBigInt> = /*@__PURE__*/ base.$constructor("$ZodBigInt", (inst, def) => {
//   inst._zod ??= {} as any;
//   // $ZodBigInt.init(inst._zod, def);
//   inst._zod = new $ZodBigInt(def);
// });
///////////////////////////////////////////////
//////////      ZodBigIntFormat      //////////
///////////////////////////////////////////////
export interface _$ZodBigIntFormatDef extends _$ZodBigIntDef, checks.$ZodCheckBigIntFormatDef {
  check: "bigint_format";
}

export interface _$ZodBigIntFormat extends _$ZodBigInt<bigint>, checks._$ZodCheckBigIntFormat {
  def: _$ZodBigIntFormatDef;
}

export interface $ZodBigIntFormat extends base.$ZodType {
  _zod: _$ZodBigIntFormat;
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
export interface _$ZodSymbolDef extends base._$ZodTypeDef {
  type: "symbol";
}

export interface _$ZodSymbol extends base._$ZodType<symbol, symbol> {
  def: _$ZodSymbolDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodSymbol<T = unknown> extends base.$ZodType {
  _zod: _$ZodSymbol;
}

export const $ZodSymbol: base.$constructor<$ZodSymbol> = /*@__PURE__*/ base.$constructor("$ZodSymbol", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
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
//////////      _$ZodUndefined     //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface _$ZodUndefinedDef extends base._$ZodTypeDef {
  type: "undefined";
}

export interface _$ZodUndefined extends base._$ZodType<undefined, undefined> {
  pattern: RegExp;
  def: _$ZodUndefinedDef;
  values: base.$PrimitiveSet;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodUndefined extends base.$ZodType {
  _zod: _$ZodUndefined;
}

export const $ZodUndefined: base.$constructor<$ZodUndefined> = /*@__PURE__*/ base.$constructor(
  "$ZodUndefined",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._zod.pattern = regexes.undefinedRegex;
    inst._zod.values = new Set([undefined]);

    inst._zod.parse = (payload, _ctx) => {
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

export interface _$ZodNullDef extends base._$ZodTypeDef {
  type: "null";
}

export interface _$ZodNull extends base._$ZodType<null, null> {
  pattern: RegExp;
  def: _$ZodNullDef;
  values: base.$PrimitiveSet;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodNull extends base.$ZodType {
  _zod: _$ZodNull;
}

export const $ZodNull: base.$constructor<$ZodNull> = /*@__PURE__*/ base.$constructor("$ZodNull", (inst, def) => {
  base.$ZodType.init(inst, def);
  inst._zod.pattern = regexes.nullRegex;
  inst._zod.values = new Set([null]);

  inst._zod.parse = (payload, _ctx) => {
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

export interface _$ZodAnyDef extends base._$ZodTypeDef {
  type: "any";
}

export interface _$ZodAny extends base._$ZodType<any, any> {
  def: _$ZodAnyDef;
  isst: never;
}

export interface $ZodAny extends base.$ZodType {
  _zod: _$ZodAny;
}

export const $ZodAny: base.$constructor<$ZodAny> = /*@__PURE__*/ base.$constructor("$ZodAny", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload) => payload;
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodUnknown     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface _$ZodUnknownDef extends base._$ZodTypeDef {
  type: "unknown";
}

export interface _$ZodUnknown extends base._$ZodType<unknown, unknown> {
  def: _$ZodUnknownDef;
  isst: never;
}

export interface $ZodUnknown extends base.$ZodType {
  _zod: _$ZodUnknown;
}

export const $ZodUnknown: base.$constructor<$ZodUnknown> = /*@__PURE__*/ base.$constructor(
  "$ZodUnknown",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._zod.parse = (payload) => payload;
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNever      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface _$ZodNeverDef extends base._$ZodTypeDef {
  type: "never";
}

export interface _$ZodNever extends base._$ZodType<never, never> {
  def: _$ZodNeverDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodNever extends base.$ZodType {
  _zod: _$ZodNever;
}

export const $ZodNever: base.$constructor<$ZodNever> = /*@__PURE__*/ base.$constructor("$ZodNever", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
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

export interface _$ZodVoidDef extends base._$ZodTypeDef {
  type: "void";
}

export interface _$ZodVoid extends base._$ZodType<void, void> {
  def: _$ZodVoidDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodVoid extends base.$ZodType {
  _zod: _$ZodVoid;
}

export const $ZodVoid: base.$constructor<$ZodVoid> = /*@__PURE__*/ base.$constructor("$ZodVoid", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
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
export interface _$ZodDateDef extends base._$ZodTypeDef {
  type: "date";
  coerce?: boolean;
}

export interface _$ZodDate<T = unknown> extends base._$ZodType<Date, T> {
  def: _$ZodDateDef;
  isst: errors.$ZodIssueInvalidType; // | errors.$ZodIssueInvalidDate;
}

export interface $ZodDate<T = unknown> extends base.$ZodType {
  _zod: _$ZodDate<T>;
}

export const $ZodDate: base.$constructor<$ZodDate> = /*@__PURE__*/ base.$constructor("$ZodDate", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce) {
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

export interface _$ZodArrayDef<T extends base.$ZodType = base.$ZodType> extends base._$ZodTypeDef {
  type: "array";
  element: T;
}

export interface _$ZodArray<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<T["_zod"]["output"][], T["_zod"]["input"][]> {
  def: _$ZodArrayDef<T>;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodArray<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodArray<T>;
}

function handleArrayResult(result: base.$ParsePayload<any>, final: base.$ParsePayload<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...util.prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}

export const $ZodArray: base.$constructor<$ZodArray> = /*@__PURE__*/ base.$constructor("$ZodArray", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, ctx) => {
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

      const result = def.element._zod.run(
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

export interface _$ZodObjectLikeDef<out Shape extends $ZodShape = $ZodShape> extends base._$ZodTypeDef {
  type: "object" | "interface";
  shape: Shape;
  optional: string[];
  catchall?: base.$ZodType | undefined;
}

export interface _$ZodObjectLike<out O = object, out I = object> extends base._$ZodType<O, I> {
  /** @deprecated */
  def: _$ZodObjectLikeDef;
  /** @deprecated */
  shape: $ZodShape;
  /** @deprecated */
  extra: Record<string, unknown>;
  /** @deprecated */
  optional: string;
  /** @deprecated */
  defaulted: string;
  /** @deprecated */
  isst: errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys;
}

export interface $ZodObjectLike<out O = object, out I = object> extends base.$ZodType {
  _zod: _$ZodObjectLike<O, I>;
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
    // inst._zod.shape = def.shape;
    // Object.defineProperty(inst, "_shape", )

    const _normalized = util.cached(() => {
      const n = util.normalizeObjectLikeDef(def);
      return n;
    });

    util.defineLazy(inst._zod, "disc", () => {
      const shape = _normalized.value.shape;
      const discMap: base.$DiscriminatorMap = new Map();
      let hasDisc = false;
      for (const key in shape) {
        const field = shape[key]._zod;
        if (field.values || field.disc) {
          hasDisc = true;
          const o: base.$DiscriminatorMapElement = {
            values: new Set(field.values ?? []),
            maps: field.disc ? [field.disc] : [],
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
        return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
      };

      doc.write(`const shape = inst._zod.def.shape;`);
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

    inst._zod.parse = (payload, ctx) => {
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

          const r = valueSchema._zod.run({ value: input[key], issues: [], $payload: true }, ctx);
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
        if (catchall._zod.def.type === "never") {
          unrecognized.push(key);
          continue;
        }
        const r = catchall._zod.run({ value: input[key], issues: [], $payload: true }, ctx);

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
//         -readonly [k in keyof T as k extends `${infer K}?` ? K : never]?: T[k]['_zod']["output"];
//       } & {
//         -readonly [k in Exclude<keyof T, `${string}?`> as k extends `?${infer K}` ? K : k]: T[k]['_zod']["output"];
//       } & Extra
//     >;

// export type $InferInterfaceInput<
//   T extends $ZodLooseShape,
//   Extra extends Record<string, unknown> = Record<string, unknown>,
// > = string extends keyof T
//   ? Record<string, unknown>
//   : util.Flatten<
//       {
//         -readonly [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K}` ? K : never]?: T[k]['_zod']["input"];
//       } & {
//         -readonly [k in Exclude<keyof T, `${string}?` | `?${string}`>]: T[k]['_zod']["input"];
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
          -readonly [k in Params["optional"]]?: T[k]["_zod"]["output"];
        } & {
          -readonly [k in Exclude<keyof T, Params["optional"]>]: T[k]["_zod"]["output"];
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
          -readonly [k in Params["optional"] | Params["defaulted"]]?: T[k]["_zod"]["input"];
        } & {
          -readonly [k in Exclude<keyof T, Params["optional"] | Params["defaulted"]>]: T[k]["_zod"]["input"];
        } & Params["extra"]
      >;

export interface _$ZodInterfaceDef<out Shape extends $ZodLooseShape = $ZodLooseShape>
  extends _$ZodObjectLikeDef<Shape> {
  type: "interface";
}

export interface $ZodInterfaceNamedParams {
  optional: string;
  defaulted: string;
  extra: Record<string, unknown>;
}

export interface _$ZodInterface<Shape extends $ZodLooseShape, Params extends $ZodInterfaceNamedParams>
  extends _$ZodObjectLike<$InferInterfaceOutput<Shape, Params>, $InferInterfaceInput<Shape, Params>> {
  subtype: "interface";
  def: _$ZodInterfaceDef<Shape>;
  shape: Shape;
  optional: Params["optional"];
  defaulted: Params["defaulted"];
  extra: Params["extra"];
}

export interface $ZodInterface<
  Shape extends $ZodLooseShape = $ZodLooseShape,
  Params extends $ZodInterfaceNamedParams = {
    optional: string & keyof Shape;
    defaulted: string & keyof Shape;
    extra: {};
  },
> extends base.$ZodType {
  _zod: _$ZodInterface<Shape, Params>;
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
  [k in OptionalOutKeys<T>]?: T[k]["_zod"]["output"];
};
// type OptionalOutProps<T extends $ZodShape> = {
//   [k in keyof T]?: T[k]['_zod']["output"];
// };

// type RequiredOutKeys<T extends $ZodShape> = {
//   [k in keyof T]: T[k] extends { _qout: "true" } ? never : k;
// }[keyof T];
// type RequiredOutProps<T extends $ZodShape> = {
//   [k in RequiredOutKeys<T>]: T[k]['_zod']["output"];
// };
type RequiredOutProps<T extends $ZodShape> = {
  [k in keyof T as T[k]["_zod"]["qout"] extends "true" ? never : k]-?: T[k]["_zod"]["output"];
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
  [k in OptionalInKeys<T>]?: T[k]["_zod"]["input"];
};
type RequiredInKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { _qin: "true" } ? never : k;
}[keyof T];
type RequiredInProps<T extends $ZodShape> = {
  [k in RequiredInKeys<T>]: T[k]["_zod"]["input"];
};
export type $InferObjectInput<T extends $ZodShape, Extra extends Record<string, unknown>> = util.Flatten<
  ({} extends T ? object : OptionalInProps<T> & RequiredInProps<T>) & Extra
>;

export interface _$ZodObjectDef<Shape extends $ZodShape = $ZodShape> extends _$ZodObjectLikeDef<Shape> {
  type: "object";
  shape: Shape;
}

export interface _$ZodObject<
  Shape extends $ZodShape = $ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends _$ZodObjectLike<$InferObjectOutput<Shape, Extra>, $InferObjectInput<Shape, Extra>> {
  /** @deprecated */
  subtype: "object";
  /** @deprecated */
  def: _$ZodObjectDef<Shape>;
  /** @deprecated */
  shape: Shape;
  /** @deprecated */
  extra: Extra;
  // _params: {extra: Extra};
}

export interface $ZodObject<
  Shape extends $ZodShape = $ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends base.$ZodType {
  _zod: _$ZodObject<Shape, Extra>;
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
export interface _$ZodUnionDef<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends base._$ZodTypeDef {
  type: "union";
  options: Options;
}

export interface _$ZodUnion<T extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends base._$ZodType<T[number]["_zod"]["output"], T[number]["_zod"]["input"]> {
  def: _$ZodUnionDef<T>;
  isst: errors.$ZodIssueInvalidUnion;
  pattern: T[number]["_zod"]["pattern"];
}

export interface $ZodUnion<T extends readonly base.$ZodType[] = readonly base.$ZodType[]> extends base.$ZodType {
  _zod: _$ZodUnion<T>;
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
  if (def.options.every((o) => o._zod.values)) {
    for (const option of def.options) {
      for (const v of option._zod.values!) {
        values.add(v);
      }
    }
    inst._zod.values = values;
  }

  // computed union regex for _pattern if all options have _pattern
  if (def.options.every((o) => o._zod.pattern)) {
    const patterns = def.options.map((o) => o._zod.pattern);
    inst._zod.pattern = new RegExp(`^(${patterns.map((p) => util.cleanRegex(p!.source)).join("|")})$`);
  }

  inst._zod.parse = (payload, ctx) => {
    const async = false;

    const results: util.MaybeAsync<base.$ParsePayload>[] = [];
    for (const option of def.options) {
      const result = option._zod.run(
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

export interface _$ZodDiscriminatedUnionDef<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends _$ZodUnionDef<Options> {
  unionFallback?: boolean;
}

export interface _$ZodDiscriminatedUnion<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends _$ZodUnion<Options> {
  def: _$ZodDiscriminatedUnionDef<Options>;
  disc: base.$DiscriminatorMap;
}

export interface $ZodDiscriminatedUnion<Options extends readonly base.$ZodType[] = readonly base.$ZodType[]>
  extends $ZodUnion<Options> {
  _zod: _$ZodDiscriminatedUnion<Options>;
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

    const _super = inst._zod.parse;
    const _disc: base.$DiscriminatorMap = new Map();
    for (const el of def.options) {
      if (!el._zod.disc) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(el)}"`);
      for (const [key, o] of el._zod.disc) {
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
    inst._zod.disc = _disc;

    const discMap: Map<base.$ZodType, base.$DiscriminatorMap> = new Map();
    for (const option of def.options) {
      const disc = option._zod.disc;
      if (!disc) {
        throw new Error(`Invalid disciminated union element: ${option._zod.def.type}`);
      }
      discMap.set(option, disc);
    }

    inst._zod.parse = (payload, ctx) => {
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

      if (filteredOptions.length === 1) return filteredOptions[0]._zod.run(payload, ctx) as any;

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

export interface _$ZodIntersectionDef extends base._$ZodTypeDef {
  type: "intersection";
  left: base.$ZodType;
  right: base.$ZodType;
}

export interface _$ZodIntersection<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<A["_zod"]["output"] & B["_zod"]["output"], A["_zod"]["input"] & B["_zod"]["input"]> {
  def: _$ZodIntersectionDef;
  isst: never;
}

export interface $ZodIntersection<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType {
  _zod: _$ZodIntersection<A, B>;
}

export const $ZodIntersection: base.$constructor<$ZodIntersection> = /*@__PURE__*/ base.$constructor(
  "$ZodIntersection",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._zod.parse = (payload, ctx) => {
      const { value: input } = payload;
      const left = def.left._zod.run({ value: input, issues: [], $payload: true }, ctx);
      const right = def.right._zod.run({ value: input, issues: [], $payload: true }, ctx);
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

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodTuple      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface _$ZodTupleDef<
  T extends $ZodTupleItems = $ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base._$ZodTypeDef {
  type: "tuple";
  items: T;
  rest: Rest;
}

export type $ZodTupleItems = readonly base.$ZodType[];
export type $InferTupleInputType<T extends $ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleInputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_zod"]["input"][] : []),
];
type TupleInputTypeNoOptionals<T extends $ZodTupleItems> = {
  [k in keyof T]: T[k]["_zod"]["input"];
};
type TupleInputTypeWithOptionals<T extends $ZodTupleItems> = T extends readonly [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_zod"]["qin"] extends "true"
    ? [...TupleInputTypeWithOptionals<Prefix>, Tail["_zod"]["input"]?]
    : TupleInputTypeNoOptionals<T>
  : [];

export type $InferTupleOutputType<T extends $ZodTupleItems, Rest extends base.$ZodType | null> = [
  ...TupleOutputTypeWithOptionals<T>,
  ...(Rest extends base.$ZodType ? Rest["_zod"]["output"][] : []),
];
type TupleOutputTypeNoOptionals<T extends $ZodTupleItems> = {
  [k in keyof T]: T[k]["_zod"]["output"];
};
type TupleOutputTypeWithOptionals<T extends $ZodTupleItems> = T extends readonly [
  ...infer Prefix extends base.$ZodType[],
  infer Tail extends base.$ZodType,
]
  ? Tail["_zod"]["qout"] extends "true"
    ? [...TupleOutputTypeWithOptionals<Prefix>, Tail["_zod"]["output"]?]
    : TupleOutputTypeNoOptionals<T>
  : [];

export interface _$ZodTuple<
  T extends $ZodTupleItems = $ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base._$ZodType<$InferTupleOutputType<T, Rest>, $InferTupleInputType<T, Rest>> {
  def: _$ZodTupleDef<T, Rest>;
  isst: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<unknown[]> | errors.$ZodIssueTooSmall<unknown[]>;
}

export interface $ZodTuple<
  T extends $ZodTupleItems = $ZodTupleItems,
  Rest extends base.$ZodType | null = base.$ZodType | null,
> extends base.$ZodType {
  _zod: _$ZodTuple<T, Rest>;
}

export const $ZodTuple: base.$constructor<$ZodTuple> = /*@__PURE__*/ base.$constructor("$ZodTuple", (inst, def) => {
  base.$ZodType.init(inst, def);
  const items = def.items;
  const optStart = items.length - [...items].reverse().findIndex((item) => item._zod.qout !== "true");

  inst._zod.parse = (payload, ctx) => {
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
      const result = item._zod.run(
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
        const result = def.rest._zod.run(
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

function handleTupleResult(result: base.$ParsePayload, final: base.$ParsePayload<any[]>, index: number) {
  if (result.issues.length) {
    final.issues.push(...util.prefixIssues(index, result.issues));
  } else {
    final.value[index] = result.value;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodRecord      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

// interface _$HasValues extends base._$ZodType<PropertyKey, PropertyKey> {
//   "_values": base.$PrimitiveSet;
// }

// interface _$HasPattern extends base._$ZodType<PropertyKey, PropertyKey> {
//   "_pattern": RegExp;
// }

export type $ZodRecordKey = base.$ZodType<string | number | symbol, string | number | symbol>; // $HasValues | $HasPattern;
export interface _$ZodRecordDef extends base._$ZodTypeDef {
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

export interface _$ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<
    Record<Key["_zod"]["output"], Value["_zod"]["output"]>,
    Record<Key["_zod"]["input"], Value["_zod"]["input"]>
  > {
  def: _$ZodRecordDef;
  isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
}

export interface $ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends base.$ZodType = base.$ZodType>
  extends base.$ZodType {
  _zod: _$ZodRecord<Key, Value>;
}

export const $ZodRecord: base.$constructor<$ZodRecord> = /*@__PURE__*/ base.$constructor("$ZodRecord", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, ctx) => {
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
      const values = def.keyType._zod.values!;
      payload.value = {};
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          const result = def.valueType._zod.run({ value: input[key], issues: [], $payload: true }, ctx);

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
        const keyResult = def.keyType._zod.run({ value: key, issues: [], $payload: true }, ctx);

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

        const result = def.valueType._zod.run({ value: input[key], issues: [], $payload: true }, ctx);

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
export interface _$ZodMapDef extends base._$ZodTypeDef {
  type: "map";
  keyType: base.$ZodType;
  valueType: base.$ZodType;
}

export interface _$ZodMap<Key extends base.$ZodType = base.$ZodType, Value extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<
    Map<Key["_zod"]["output"], Value["_zod"]["output"]>,
    Map<Key["_zod"]["input"], Value["_zod"]["input"]>
  > {
  def: _$ZodMapDef;
  isst: errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement<unknown>;
}

export interface $ZodMap<Key extends base.$ZodType = base.$ZodType, Value extends base.$ZodType = base.$ZodType>
  extends base.$ZodType {
  _zod: _$ZodMap<Key, Value>;
}

export const $ZodMap: base.$constructor<$ZodMap> = /*@__PURE__*/ base.$constructor("$ZodMap", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, ctx) => {
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
      const keyResult = def.keyType._zod.run({ value: key, issues: [], $payload: true }, ctx);
      const valueResult = def.valueType._zod.run({ value: value, issues: [], $payload: true }, ctx);

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

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodSet      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface _$ZodSetDef extends base._$ZodTypeDef {
  type: "set";
  valueType: base.$ZodType;
}

export interface _$ZodSet<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<Set<T["_zod"]["output"]>, Set<T["_zod"]["input"]>> {
  def: _$ZodSetDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodSet<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodSet<T>;
}

export const $ZodSet: base.$constructor<$ZodSet> = /*@__PURE__*/ base.$constructor("$ZodSet", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, ctx) => {
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
      const result = def.valueType._zod.run({ value: item, issues: [], $payload: true }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleSetResult(result, payload)));
      } else handleSetResult(result, payload);
    }

    if (proms.length) return Promise.all(proms).then(() => payload);
    return payload;
  };
});

function handleSetResult(result: base.$ParsePayload, final: base.$ParsePayload<Set<any>>) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  } else {
    final.value.add(result.value);
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodEnum      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export type $InferEnumOutput<T extends util.EnumLike> = T[keyof T];
export type $InferEnumInput<T extends util.EnumLike> = $InferEnumOutput<T>;

export interface _$ZodEnumDef<T extends util.EnumLike = util.EnumLike> extends base._$ZodTypeDef {
  type: "enum";
  entries: T;
}

export interface _$ZodEnum<T extends util.EnumLike = util.EnumLike>
  extends base._$ZodType<$InferEnumOutput<T>, $InferEnumInput<T>> {
  // enum: T;

  def: _$ZodEnumDef<T>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  values: base.$PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;
  isst: errors.$ZodIssueInvalidValue;
}

export interface $ZodEnum<T extends util.EnumLike = util.EnumLike> extends base.$ZodType {
  _zod: _$ZodEnum<T>;
}

export const $ZodEnum: base.$constructor<$ZodEnum> = /*@__PURE__*/ base.$constructor("$ZodEnum", (inst, def) => {
  base.$ZodType.init(inst, def);

  const values = Object.entries(def.entries)
    // remove reverse mappings
    .filter(([k, _]) => {
      return typeof def.entries[def.entries[k]] !== "number";
    })
    .map(([_, v]) => v);
  inst._zod.values = new Set<util.Primitive>(values);

  inst._zod.pattern = new RegExp(
    `^(${values
      .filter((k) => util.propertyKeyTypes.has(typeof k))
      .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o.toString()))
      .join("|")})$`
  );

  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (inst._zod.values.has(input as any)) {
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

export interface _$ZodLiteralDef extends base._$ZodTypeDef {
  type: "literal";
  values: util.LiteralArray;
}

export interface _$ZodLiteral<T extends util.Primitive = util.Primitive> extends base._$ZodType<T, T> {
  def: _$ZodLiteralDef;
  values: base.$PrimitiveSet;
  pattern: RegExp;
  isst: errors.$ZodIssueInvalidValue;
}

export interface $ZodLiteral<T extends util.Primitive = util.Primitive> extends base.$ZodType {
  _zod: _$ZodLiteral<T>;
}

export const $ZodLiteral: base.$constructor<$ZodLiteral> = /*@__PURE__*/ base.$constructor(
  "$ZodLiteral",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._zod.values = new Set<util.Primitive>(def.values);
    inst._zod.pattern = new RegExp(
      `^(${def.values
        // .filter((k) => util.propertyKeyTypes.has(typeof k))
        .map((o) => (typeof o === "string" ? util.escapeRegex(o) : o ? o.toString() : String(o)))
        .join("|")})$`
    );

    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (inst._zod.values.has(input as any)) {
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

// export interface _$ZodConstDef extends base._$ZodTypeDef {
//   type: "const";
//   value: unknown;
// }

// export _interface $ZodConst<T extends util.Literal = util.Literal> extends base._$ZodType<T, T> {
//   _def: _$ZodConstDef;
//   _values: base.$PrimitiveSet;
//   _pattern: RegExp;
//   _isst: errors.$ZodIssueInvalidValue;
// }

// export const $ZodConst: base.$constructor<$ZodConst> = /*@__PURE__*/ base.$constructor("$ZodConst", (inst, def) => {
//   base.$ZodType.init(inst, def);

//   if (util.primitiveTypes.has(typeof def.value) || def.value === null) {
//     inst._zod.values = new Set<util.Primitive>(def.value as any);
//   }

//   if (util.propertyKeyTypes.has(typeof def.value)) {
//     inst._zod.pattern = new RegExp(
//       `^(${typeof def.value === "string" ? util.escapeRegex(def.value) : (def.value as any).toString()})$`
//     );
//   } else {
//     throw new Error("Const value cannot be converted to regex");
//   }

//   inst._zod.parse = (payload, _ctx) => {
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

export interface _$ZodFileDef extends base._$ZodTypeDef {
  type: "file";
}

export interface _$ZodFile extends base._$ZodType<File, File> {
  def: _$ZodFileDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodFile extends base.$ZodType {
  _zod: _$ZodFile;
}

export const $ZodFile: base.$constructor<$ZodFile> = /*@__PURE__*/ base.$constructor("$ZodFile", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
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
export interface _$ZodTransformDef extends base._$ZodTypeDef {
  type: "transform";
  transform: (input: unknown, payload: base.$ParsePayload<unknown>) => util.MaybeAsync<unknown>;
  abort?: boolean | undefined;
}
export interface _$ZodTransform<O = unknown, I = unknown> extends base._$ZodType<O, I> {
  def: _$ZodTransformDef;
  isst: never;
}

export interface $ZodTransform<O = unknown, I = unknown> extends base.$ZodType {
  _zod: _$ZodTransform<O, I>;
}

export const $ZodTransform: base.$constructor<$ZodTransform> = /*@__PURE__*/ base.$constructor(
  "$ZodTransform",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
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
export interface _$ZodOptionalDef<T extends base.$ZodType> extends base._$ZodTypeDef {
  type: "optional";
  innerType: T;
}

export interface _$ZodOptional<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<T["_zod"]["output"] | undefined, T["_zod"]["input"] | undefined> {
  def: _$ZodOptionalDef<T>;
  qin: "true";
  qout: "true";
  isst: never;
  values: T["_zod"]["values"];
  pattern: RegExp;
}

export interface $ZodOptional<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodOptional<T>;
}

export const $ZodOptional: base.$constructor<$ZodOptional> = /*@__PURE__*/ base.$constructor(
  "$ZodOptional",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._zod.qin = "true";
    inst._zod.qout = "true";
    if (def.innerType._zod.values) inst._zod.values = new Set([...def.innerType._zod.values, undefined]);
    const pattern = (def.innerType as any)._zod.pattern;
    if (pattern) inst._zod.pattern = new RegExp(`^(${util.cleanRegex(pattern.source)})?$`);

    inst._zod.parse = (payload, ctx) => {
      if (payload.value === undefined) {
        return payload;
      }
      return def.innerType._zod.run(payload, ctx);
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
export interface _$ZodNullableDef<T extends base.$ZodType = base.$ZodType> extends base._$ZodTypeDef {
  type: "nullable";
  innerType: T;
}

export interface _$ZodNullable<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<T["_zod"]["output"] | null, T["_zod"]["input"] | null> {
  def: _$ZodNullableDef<T>;
  qin: T["_zod"]["qin"];
  qout: T["_zod"]["qout"];
  isst: never;
  values: T["_zod"]["values"];
  pattern: RegExp;
}

export interface $ZodNullable<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodNullable<T>;
}

export const $ZodNullable: base.$constructor<$ZodNullable> = /*@__PURE__*/ base.$constructor(
  "$ZodNullable",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    inst._zod.qin = def.innerType._zod.qin;
    inst._zod.qout = def.innerType._zod.qout;

    const pattern = (def.innerType as any)._zod.pattern;
    if (pattern) inst._zod.pattern = new RegExp(`^(${util.cleanRegex(pattern.source)}|null)$`);

    if (def.innerType._zod.values) inst._zod.values = new Set([...def.innerType._zod.values, null]);

    inst._zod.parse = (payload, ctx) => {
      if (payload.value === null) return payload;
      return def.innerType._zod.run(payload, ctx);
    };
  }
);

// export interface _$ZodNullableDef<T extends base.$ZodType = base.$ZodType> extends _$ZodUnionDef {
//   type: "nullable";
//   innerType: T;
// }

// export interface $ZodNullable<T extends base.$ZodType = base.$ZodType> extends $ZodUnion<[T, $ZodNull]> {
//   _qin: T["_zod"]["qin"];
//   _qout: T["_zod"]["qout"];
//   _isst: never;
//   _values: T["_zod"]["values"];
// }

// export const $ZodNullable: base.$constructor<$ZodNullable> = /*@__PURE__*/ base.$constructor(
//   "$ZodNullable",
//   (inst, def) => {
//     $ZodUnion.init(inst, def);
//     const innerType = def.options[0];
//     inst._zod.qin = innerType._zod.qin;
//     inst._zod.qout = innerType._zod.qout;
//     if (innerType._zod.values) inst._zod.values = new Set([...innerType._zod.values, null]);

//     inst._zod.parse = (payload, ctx) => {
//       if (payload.value === null) return payload;
//       return innerType._zod.run(payload, ctx);
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
export interface _$ZodDefaultDef<T extends base.$ZodType = base.$ZodType> extends base._$ZodTypeDef {
  type: "default";
  innerType: T;
  defaultValue: () => util.NoUndefined<T["_zod"]["output"]>;
}

export interface _$ZodDefault<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<
    // this is pragmatic but not strictly correct
    util.NoUndefined<T["_zod"]["output"]>,
    T["_zod"]["input"] | undefined
  > {
  def: _$ZodDefaultDef<T>;
  qin: "true";
  isst: never;
  values: T["_zod"]["values"];
}

export interface $ZodDefault<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodDefault<T>;
}

export const $ZodDefault: base.$constructor<$ZodDefault> = /*@__PURE__*/ base.$constructor(
  "$ZodDefault",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._zod.qin = "true"; //def.innerType["_zod"]["qin"];
    inst._zod.values = def.innerType._zod.values;

    inst._zod.parse = (payload, ctx) => {
      if (payload.value === undefined) {
        payload.value = def.defaultValue();
        /**
         * $ZodDefault always returns the default value immediately.
         * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
        return payload;
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleDefaultResult(result, def));
      }
      return handleDefaultResult(result, def);
    };
  }
);

function handleDefaultResult(payload: base.$ParsePayload, def: _$ZodDefaultDef) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue();
  }
  return payload;
}
///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      $ZodNonOptional      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////
export interface _$ZodNonOptionalDef<T extends base.$ZodType = base.$ZodType> extends base._$ZodTypeDef {
  type: "nonoptional";
  innerType: T;
}

export interface _$ZodNonOptional<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<util.NoUndefined<T["_zod"]["output"]>, util.NoUndefined<T["_zod"]["input"]>> {
  def: _$ZodNonOptionalDef<T>;
  isst: errors.$ZodIssueInvalidType;
  values: T["_zod"]["values"];
}

export interface $ZodNonOptional<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodNonOptional<T>;
}

export const $ZodNonOptional: base.$constructor<$ZodNonOptional> = /*@__PURE__*/ base.$constructor(
  "$ZodNonOptional",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    if (def.innerType._zod.values)
      inst._zod.values = new Set([...def.innerType._zod.values].filter((x) => x !== undefined));
    inst._zod.parse = (payload, ctx) => {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => handleNonOptionalResult(result, inst));
      }
      return handleNonOptionalResult(result, inst);
    };
  }
);

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

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodCoalesce      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
// export interface _$ZodCoalesceDef<T extends base.$ZodType = base.$ZodType> extends base._$ZodTypeDef {
//   type: "coalesce";
//   innerType: T;
//   defaultValue: () => NonNullable<T['_zod']["output"]>;
// }

// export _interface $ZodCoalesce<T extends base.$ZodType = base.$ZodType>
//   extends base._$ZodType<NonNullable<T['_zod']["output"]>, T['_zod']["input"] | undefined | null> {
//   _def: _$ZodCoalesceDef<T>;
//   _isst: errors.$ZodIssueInvalidType;
//   _qin: "true";
// }

// function handleCoalesceResult(payload: base.$ParsePayload, def: _$ZodCoalesceDef) {
//   payload.value ??= def.defaultValue();
//   return payload;
// }

// export const $ZodCoalesce: base.$constructor<$ZodCoalesce> = /*@__PURE__*/ base.$constructor(
//   "$ZodCoalesce",
//   (inst, def) => {
//     base.$ZodType.init(inst, def);
// inst._zod.qin = "true";
//     inst._zod.parse = (payload, ctx) => {
//       const result = def.innerType._zod.run(payload, ctx);
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
export interface _$ZodSuccessDef extends base._$ZodTypeDef {
  type: "success";
  innerType: base.$ZodType;
}

export interface _$ZodSuccess<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<boolean, T["_zod"]["input"]> {
  def: _$ZodSuccessDef;
  isst: never;
}

export interface $ZodSuccess<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodSuccess<T>;
}

export const $ZodSuccess: base.$constructor<$ZodSuccess> = /*@__PURE__*/ base.$constructor(
  "$ZodSuccess",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._zod.parse = (payload, ctx) => {
      const result = def.innerType._zod.run(payload, ctx);
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
export interface _$ZodCatchDef extends base._$ZodTypeDef {
  type: "catch";
  innerType: base.$ZodType;
  catchValue: (ctx: $ZodCatchCtx) => unknown;
}

export interface _$ZodCatch<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<T["_zod"]["output"], util.Loose<T["_zod"]["input"]>> {
  def: _$ZodCatchDef;
  qin: T["_zod"]["qin"];
  qout: T["_zod"]["qout"];
  isst: never;
  values: T["_zod"]["values"];
}

export interface $ZodCatch<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodCatch<T>;
}

export const $ZodCatch: base.$constructor<$ZodCatch> = /*@__PURE__*/ base.$constructor("$ZodCatch", (inst, def) => {
  base.$ZodType.init(inst, def);
  // inst._zod.qin = def.innerType._zod.qin;
  inst._zod.qout = def.innerType._zod.qout;
  inst._zod.values = def.innerType._zod.values;

  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
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
export interface _$ZodNaNDef extends base._$ZodTypeDef {
  type: "nan";
}

export interface _$ZodNaN extends base._$ZodType<number, number> {
  def: _$ZodNaNDef;
  isst: errors.$ZodIssueInvalidType;
}

export interface $ZodNaN extends base.$ZodType {
  _zod: _$ZodNaN;
}

export const $ZodNaN: base.$constructor<$ZodNaN> = /*@__PURE__*/ base.$constructor("$ZodNaN", (inst, def) => {
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _ctx) => {
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
export interface _$ZodPipeDef<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base._$ZodTypeDef {
  type: "pipe";
  in: A;
  out: B;
}

export interface _$ZodPipe<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<B["_zod"]["output"], A["_zod"]["input"]> {
  def: _$ZodPipeDef<A, B>;
  isst: never;
  // _qin: A["_zod"]["qin"];
  // _qout: A["_zod"]["qout"];
  values: A["_zod"]["values"];
}

export interface $ZodPipe<A extends base.$ZodType = base.$ZodType, B extends base.$ZodType = base.$ZodType>
  extends base.$ZodType {
  _zod: _$ZodPipe<A, B>;
}

export const $ZodPipe: base.$constructor<$ZodPipe> = /*@__PURE__*/ base.$constructor("$ZodPipe", (inst, def) => {
  base.$ZodType.init(inst, def);
  // inst._zod.qin = def.in._zod.qin;
  // inst._zod.qout = def.in._zod.qout;
  inst._zod.values = def.in._zod.values;

  inst._zod.parse = (payload, ctx) => {
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def, ctx));
    }
    return handlePipeResult(left, def, ctx);
  };
});

function handlePipeResult(left: base.$ParsePayload, def: _$ZodPipeDef, ctx: base.$ParseContext) {
  if (util.aborted(left)) {
    return left;
  }

  return def.out._zod.run({ value: left.value, issues: left.issues, $payload: true }, ctx);
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodReadonly      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////

export interface _$ZodReadonlyDef extends base._$ZodTypeDef {
  type: "readonly";
  innerType: base.$ZodType;
}

export interface _$ZodReadonly<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<util.MakeReadonly<T["_zod"]["output"]>, util.MakeReadonly<T["_zod"]["input"]>> {
  def: _$ZodReadonlyDef;
  qin: T["_zod"]["qin"];
  qout: T["_zod"]["qout"];
  isst: never;
}

export interface $ZodReadonly<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodReadonly<T>;
}

export const $ZodReadonly: base.$constructor<$ZodReadonly> = /*@__PURE__*/ base.$constructor(
  "$ZodReadonly",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    // inst._zod.qin = def.innerType._zod.qin;
    inst._zod.qout = def.innerType._zod.qout;

    inst._zod.parse = (payload, ctx) => {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
    };
  }
);

function handleReadonlyResult(payload: base.$ParsePayload): base.$ParsePayload {
  payload.value = Object.freeze(payload.value);
  return payload;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   $ZodTemplateLiteral   //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface _$ZodTemplateLiteralDef extends base._$ZodTypeDef {
  type: "template_literal";
  parts: $TemplateLiteralPart[];
}
export interface _$ZodTemplateLiteral<Template extends string = string> extends base._$ZodType<Template, Template> {
  pattern: RegExp;
  def: _$ZodTemplateLiteralDef;
  isst: errors.$ZodIssueInvalidType;
}

export type $LiteralPart = Exclude<util.Literal, symbol>; //string | number | boolean | null | undefined;
export interface $SchemaPart extends base._$ZodType<$LiteralPart, $LiteralPart> {
  pattern: RegExp;
}
export type $TemplateLiteralPart = $LiteralPart | $SchemaPart;

type UndefinedToEmptyString<T> = T extends undefined ? "" : T;
type AppendToTemplateLiteral<
  Template extends string,
  Suffix extends $LiteralPart | base.$ZodType,
> = Suffix extends $LiteralPart
  ? `${Template}${UndefinedToEmptyString<Suffix>}`
  : Suffix extends base._$ZodType<infer Output extends $LiteralPart>
    ? `${Template}${UndefinedToEmptyString<Output>}`
    : never;

export type $PartsToTemplateLiteral<Parts extends $TemplateLiteralPart[]> = [] extends Parts
  ? ``
  : Parts extends [...infer Rest extends $TemplateLiteralPart[], infer Last extends $TemplateLiteralPart]
    ? AppendToTemplateLiteral<$PartsToTemplateLiteral<Rest>, Last>
    : never;

export interface $ZodTemplateLiteral<Template extends string = string> extends base.$ZodType {
  _zod: _$ZodTemplateLiteral<Template>;
}

export const $ZodTemplateLiteral: base.$constructor<$ZodTemplateLiteral> = /*@__PURE__*/ base.$constructor(
  "$ZodTemplateLiteral",
  (inst, def) => {
    base.$ZodType.init(inst, def);
    const regexParts: string[] = [];
    for (const part of def.parts) {
      if (part instanceof base.$ZodType) {
        if (!("_pattern" in part)) {
          // if (!source)
          throw new Error(
            `Invalid template literal part, no _pattern found: ${[...(part as any)._zod.traits].shift()}`
          );
        }
        const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;

        // if (!source) throw new Error(`Invalid template literal part: ${part._zod.traits}`);

        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else if (part === null || util.primitiveTypes.has(typeof part)) {
        regexParts.push(util.escapeRegex(`${part}`));
      } else {
        throw new Error(`Invalid template literal part: ${part}`);
      }
    }
    inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);

    inst._zod.parse = (payload, _ctx) => {
      if (typeof payload.value !== "string") {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "template_literal",
          code: "invalid_type",
        });
        return payload;
      }

      inst._zod.pattern.lastIndex = 0;

      if (!inst._zod.pattern.test(payload.value)) {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "template_literal",
          code: "invalid_type",
          pattern: inst._zod.pattern,
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
export interface _$ZodPromiseDef extends base._$ZodTypeDef {
  type: "promise";
  innerType: base.$ZodType;
}

export interface _$ZodPromise<T extends base.$ZodType = base.$ZodType>
  extends base._$ZodType<T["_zod"]["output"], util.MaybeAsync<T["_zod"]["input"]>> {
  def: _$ZodPromiseDef;
  isst: never;
}

export interface $ZodPromise<T extends base.$ZodType = base.$ZodType> extends base.$ZodType {
  _zod: _$ZodPromise<T>;
}

export const $ZodPromise: base.$constructor<$ZodPromise> = /*@__PURE__*/ base.$constructor(
  "$ZodPromise",
  (inst, def) => {
    base.$ZodType.init(inst, def);

    inst._zod.parse = (payload, ctx) => {
      return Promise.resolve(payload.value).then((inner) =>
        def.innerType._zod.run({ value: inner, issues: [], $payload: true }, ctx)
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
export interface _$ZodCustomDef<O = unknown> extends base._$ZodTypeDef, base._$ZodCheckDef {
  type: "custom";
  check: "custom";
  path?: PropertyKey[] | undefined;
  error?: errors.$ZodErrorMap | undefined;
  params?: Record<string, any> | undefined;
  fn: (arg: O) => unknown; // base.$ZodCheck<O>["_zod"]["check"];
}

export interface _$ZodCustom<O = unknown, I = unknown> extends base._$ZodType<O, I>, base._$ZodCheck<O> {
  def: _$ZodCustomDef;
  issc: errors.$ZodIssue;
  isst: never;
}

export interface $ZodCustom<O = unknown, I = unknown> extends base.$ZodType {
  _zod: _$ZodCustom<O, I>;
}

export const $ZodCustom: base.$constructor<$ZodCustom<unknown>> = base.$constructor("$ZodCustom", (inst, def) => {
  if (def.checks?.length) console.warn("Can't add custom checks to z.custom()");

  base.$ZodCheck.init(inst, def);
  base.$ZodType.init(inst, def);

  inst._zod.parse = (payload, _) => {
    return payload;
  };

  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input as any);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});

function handleRefineResult(result: unknown, payload: base.$ParsePayload, input: unknown, inst: $ZodCustom): void {
  if (!result) {
    const _iss: any = {
      code: "custom",
      input,
      inst, // incorporates params.error into issue reporting
      path: inst._zod.def.path, // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort,
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params) _iss.params = inst._zod.def.params;
    payload.issues.push(util.issue(_iss));
  }
}

////////   FIRST PARTY TYPES   ////////

export type $ZodTypes =
  | $ZodString
  | $ZodNumber
  | $ZodBigInt
  | $ZodBoolean
  | $ZodDate
  | $ZodSymbol
  | _$ZodUndefined
  | $ZodNullable
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
