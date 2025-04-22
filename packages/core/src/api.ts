import * as checks from "./checks.js";
import type * as core from "./core.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

// String
export type $ZodStringParams = util.TypeParams<schemas.$ZodString<string>, "coerce">;
export function _string<T extends schemas.$ZodString>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodStringParams
): T {
  return new Class({
    type: "string",
    ...util.normalizeParams(params),
  });
}

export function _coercedString<T extends schemas.$ZodString>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodStringParams
): T {
  return new Class({
    type: "string",
    coerce: true,
    ...util.normalizeParams(params),
  });
}

// Email
export type $ZodEmailParams = util.StringFormatParams<schemas.$ZodEmail>;
export type $ZodCheckEmailParams = util.CheckStringFormatParams<schemas.$ZodEmail>;
export function _email<T extends schemas.$ZodEmail>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodEmailParams | $ZodCheckEmailParams
): T {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// GUID
export type $ZodGUIDParams = util.StringFormatParams<schemas.$ZodGUID, "pattern">;
export type $ZodCheckGUIDParams = util.CheckStringFormatParams<schemas.$ZodGUID, "pattern">;
export function _guid<T extends schemas.$ZodGUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodGUIDParams | $ZodCheckGUIDParams
): T {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// UUID
export type $ZodUUIDParams = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDParams = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
export function _uuid<T extends schemas.$ZodUUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUUIDParams | $ZodCheckUUIDParams
): T {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// UUIDv4
export type $ZodUUIDv4Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv4Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
export function _uuidv4<T extends schemas.$ZodUUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUUIDv4Params | $ZodCheckUUIDv4Params
): T {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...util.normalizeParams(params),
  });
}

// UUIDv6
export type $ZodUUIDv6Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv6Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
export function _uuidv6<T extends schemas.$ZodUUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUUIDv6Params | $ZodCheckUUIDv6Params
): T {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...util.normalizeParams(params),
  });
}

// UUIDv7
export type $ZodUUIDv7Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv7Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
export function _uuidv7<T extends schemas.$ZodUUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUUIDv7Params | $ZodCheckUUIDv7Params
): T {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...util.normalizeParams(params),
  });
}

// URL
export type $ZodURLParams = util.StringFormatParams<schemas.$ZodURL>;
export type $ZodCheckURLParams = util.CheckStringFormatParams<schemas.$ZodURL>;
export function _url<T extends schemas.$ZodURL>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodURLParams | $ZodCheckURLParams
): T {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// Emoji
export type $ZodEmojiParams = util.StringFormatParams<schemas.$ZodEmoji>;
export type $ZodCheckEmojiParams = util.CheckStringFormatParams<schemas.$ZodEmoji>;
export function _emoji<T extends schemas.$ZodEmoji>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodEmojiParams | $ZodCheckEmojiParams
): T {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// NanoID
export type $ZodNanoIDParams = util.StringFormatParams<schemas.$ZodNanoID>;
export type $ZodCheckNanoIDParams = util.CheckStringFormatParams<schemas.$ZodNanoID>;
export function _nanoid<T extends schemas.$ZodNanoID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodNanoIDParams | $ZodCheckNanoIDParams
): T {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// CUID
export type $ZodCUIDParams = util.StringFormatParams<schemas.$ZodCUID>;
export type $ZodCheckCUIDParams = util.CheckStringFormatParams<schemas.$ZodCUID>;
export function _cuid<T extends schemas.$ZodCUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCUIDParams | $ZodCheckCUIDParams
): T {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// CUID2
export type $ZodCUID2Params = util.StringFormatParams<schemas.$ZodCUID2>;
export type $ZodCheckCUID2Params = util.CheckStringFormatParams<schemas.$ZodCUID2>;
export function _cuid2<T extends schemas.$ZodCUID2>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCUID2Params | $ZodCheckCUID2Params
): T {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// ULID
export type $ZodULIDParams = util.StringFormatParams<schemas.$ZodULID>;
export type $ZodCheckULIDParams = util.CheckStringFormatParams<schemas.$ZodULID>;
export function _ulid<T extends schemas.$ZodULID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodULIDParams | $ZodCheckULIDParams
): T {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// XID
export type $ZodXIDParams = util.StringFormatParams<schemas.$ZodXID>;
export type $ZodCheckXIDParams = util.CheckStringFormatParams<schemas.$ZodXID>;
export function _xid<T extends schemas.$ZodXID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodXIDParams | $ZodCheckXIDParams
): T {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// KSUID
export type $ZodKSUIDParams = util.StringFormatParams<schemas.$ZodKSUID>;
export type $ZodCheckKSUIDParams = util.CheckStringFormatParams<schemas.$ZodKSUID>;
export function _ksuid<T extends schemas.$ZodKSUID>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodKSUIDParams | $ZodCheckKSUIDParams
): T {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// IP
// export type $ZodIPParams = util.StringFormatParams<schemas.$ZodIP, "pattern">;
// export type $ZodCheckIPParams = util.CheckStringFormatParams<schemas.$ZodIP, "pattern">;
// export function _ip<T extends schemas.$ZodIP>(
//   Class: util.SchemaClass<T>,
//   params?: string | $ZodIPParams | $ZodCheckIPParams
// ): T {
//   return new Class({
//     type: "string",
//     format: "ip",
//     check: "string_format",
//     abort: false,
//     ...util.normalizeParams(params),
//   });
// }

// IPv4
export type $ZodIPv4Params = util.StringFormatParams<schemas.$ZodIPv4, "pattern">;
export type $ZodCheckIPv4Params = util.CheckStringFormatParams<schemas.$ZodIPv4, "pattern">;
export function _ipv4<T extends schemas.$ZodIPv4>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodIPv4Params | $ZodCheckIPv4Params
): T {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// IPv6
export type $ZodIPv6Params = util.StringFormatParams<schemas.$ZodIPv6, "pattern">;
export type $ZodCheckIPv6Params = util.CheckStringFormatParams<schemas.$ZodIPv6, "pattern">;
export function _ipv6<T extends schemas.$ZodIPv6>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodIPv6Params | $ZodCheckIPv6Params
): T {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// CIDRv4
export type $ZodCIDRv4Params = util.StringFormatParams<schemas.$ZodCIDRv4, "pattern">;
export type $ZodCheckCIDRv4Params = util.CheckStringFormatParams<schemas.$ZodCIDRv4, "pattern">;
export function _cidrv4<T extends schemas.$ZodCIDRv4>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCIDRv4Params | $ZodCheckCIDRv4Params
): T {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// CIDRv6
export type $ZodCIDRv6Params = util.StringFormatParams<schemas.$ZodCIDRv6, "pattern">;
export type $ZodCheckCIDRv6Params = util.CheckStringFormatParams<schemas.$ZodCIDRv6, "pattern">;
export function _cidrv6<T extends schemas.$ZodCIDRv6>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCIDRv6Params | $ZodCheckCIDRv6Params
): T {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// Base64
export type $ZodBase64Params = util.StringFormatParams<schemas.$ZodBase64, "pattern">;
export type $ZodCheckBase64Params = util.CheckStringFormatParams<schemas.$ZodBase64, "pattern">;
export function _base64<T extends schemas.$ZodBase64>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBase64Params | $ZodCheckBase64Params
): T {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// base64url
export type $ZodBase64URLParams = util.StringFormatParams<schemas.$ZodBase64URL, "pattern">;
export type $ZodCheckBase64URLParams = util.CheckStringFormatParams<schemas.$ZodBase64URL, "pattern">;
export function _base64url<T extends schemas.$ZodBase64URL>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBase64URLParams | $ZodCheckBase64URLParams
): T {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// E164
export type $ZodE164Params = util.StringFormatParams<schemas.$ZodE164>;
export type $ZodCheckE164Params = util.CheckStringFormatParams<schemas.$ZodE164>;
export function _e164<T extends schemas.$ZodE164>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodE164Params | $ZodCheckE164Params
): T {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// JWT
export type $ZodJWTParams = util.StringFormatParams<schemas.$ZodJWT, "pattern">;
export type $ZodCheckJWTParams = util.CheckStringFormatParams<schemas.$ZodJWT, "pattern">;
export function _jwt<T extends schemas.$ZodJWT>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodJWTParams | $ZodCheckJWTParams
): T {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...util.normalizeParams(params),
  });
}

// ISODateTime
export type $ZodISODateTimeParams = util.StringFormatParams<schemas.$ZodISODateTime, "pattern">;
export type $ZodCheckISODateTimeParams = util.CheckStringFormatParams<schemas.$ZodISODateTime, "pattern">;
export function _isoDateTime<T extends schemas.$ZodISODateTime>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodISODateTimeParams | $ZodCheckISODateTimeParams
): T {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...util.normalizeParams(params),
  });
}

// ISODate
export type $ZodISODateParams = util.StringFormatParams<schemas.$ZodISODate, "pattern">;
export type $ZodCheckISODateParams = util.CheckStringFormatParams<schemas.$ZodISODate, "pattern">;
export function _isoDate<T extends schemas.$ZodISODate>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodISODateParams | $ZodCheckISODateParams
): T {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...util.normalizeParams(params),
  });
}

// ISOTime
export type $ZodISOTimeParams = util.StringFormatParams<schemas.$ZodISOTime, "pattern">;
export type $ZodCheckISOTimeParams = util.CheckStringFormatParams<schemas.$ZodISOTime, "pattern">;
export function _isoTime<T extends schemas.$ZodISOTime>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodISOTimeParams | $ZodCheckISOTimeParams
): T {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...util.normalizeParams(params),
  });
}

// ISODuration
export type $ZodISODurationParams = util.StringFormatParams<schemas.$ZodISODuration>;
export type $ZodCheckISODurationParams = util.CheckStringFormatParams<schemas.$ZodISODuration>;
export function _isoDuration<T extends schemas.$ZodISODuration>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodISODurationParams | $ZodCheckISODurationParams
): T {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...util.normalizeParams(params),
  });
}

// Number
export type $ZodNumberParams = util.TypeParams<schemas.$ZodNumber<number>, "coerce">;
export type $ZodNumberFormatParams = util.CheckTypeParams<schemas.$ZodNumberFormat, "format" | "coerce">;
export type $ZodCheckNumberFormatParams = util.CheckParams<checks.$ZodCheckNumberFormat, "format">;
export function _number<T extends schemas.$ZodNumber>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodNumberParams
): T {
  return new Class({
    type: "number",
    checks: [],
    ...util.normalizeParams(params),
  });
}

export function _coercedNumber<T extends schemas.$ZodNumber>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodNumberParams
): T {
  return new Class({
    type: "number",
    coerce: true,
    checks: [],
    ...util.normalizeParams(params),
  });
}

export function _int<T extends schemas.$ZodNumberFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCheckNumberFormatParams
): T {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...util.normalizeParams(params),
  });
}
export function _float32<T extends schemas.$ZodNumberFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCheckNumberFormatParams
): T {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float32",
    ...util.normalizeParams(params),
  });
}
export function _float64<T extends schemas.$ZodNumberFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCheckNumberFormatParams
): T {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float64",
    ...util.normalizeParams(params),
  });
}
export function _int32<T extends schemas.$ZodNumberFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCheckNumberFormatParams
): T {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "int32",
    ...util.normalizeParams(params),
  });
}
export function _uint32<T extends schemas.$ZodNumberFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodCheckNumberFormatParams
): T {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "uint32",
    ...util.normalizeParams(params),
  });
}

// Boolean
export type $ZodBooleanParams = util.TypeParams<schemas.$ZodBoolean<boolean>, "coerce">;
export function _boolean<T extends schemas.$ZodBoolean>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBooleanParams
): T {
  return new Class({
    type: "boolean",
    ...util.normalizeParams(params),
  });
}
export function _coercedBoolean<T extends schemas.$ZodBoolean>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBooleanParams
): T {
  return new Class({
    type: "boolean",
    coerce: true,
    ...util.normalizeParams(params),
  });
}

// BigInt
export type $ZodBigIntParams = util.TypeParams<schemas.$ZodBigInt<bigint>>;
export type $ZodBigIntFormatParams = util.CheckTypeParams<schemas.$ZodBigIntFormat, "format" | "coerce">;
export type $ZodCheckBigIntFormatParams = util.CheckParams<checks.$ZodCheckBigIntFormat, "format">;
export function _bigint<T extends schemas.$ZodBigInt>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBigIntParams
): T {
  return new Class({
    type: "bigint",
    ...util.normalizeParams(params),
  });
}
export function _coercedBigint<T extends schemas.$ZodBigInt>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBigIntParams
): T {
  return new Class({
    type: "bigint",
    coerce: true,
    ...util.normalizeParams(params),
  });
}

export function _int64<T extends schemas.$ZodBigIntFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBigIntFormatParams
): T {
  return new Class({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "int64",
    ...util.normalizeParams(params),
  });
}
export function _uint64<T extends schemas.$ZodBigIntFormat>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodBigIntFormatParams
): T {
  return new Class({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "uint64",
    ...util.normalizeParams(params),
  });
}

// Symbol
export type $ZodSymbolParams = util.TypeParams<schemas.$ZodSymbol>;
export function _symbol<T extends schemas.$ZodSymbol>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodSymbolParams
): T {
  return new Class({
    type: "symbol",
    ...util.normalizeParams(params),
  });
}

// Undefined
export type $ZodUndefinedParams = util.TypeParams<schemas.$ZodUndefined>;
export function _undefined<T extends schemas.$ZodUndefined>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUndefinedParams
): T {
  return new Class({
    type: "undefined",
    ...util.normalizeParams(params),
  });
}

// Null
export type $ZodNullParams = util.TypeParams<schemas.$ZodNull>;
export function _null<T extends schemas.$ZodNull>(Class: util.SchemaClass<T>, params?: string | $ZodNullParams): T {
  return new Class({
    type: "null",
    ...util.normalizeParams(params),
  });
}

// Any
export type $ZodAnyParams = util.TypeParams<schemas.$ZodAny>;
export function _any<T extends schemas.$ZodAny>(Class: util.SchemaClass<T>, params?: string | $ZodAnyParams): T {
  return new Class({
    type: "any",
    ...util.normalizeParams(params),
  });
}

// Unknown
export type $ZodUnknownParams = util.TypeParams<schemas.$ZodUnknown>;
export function _unknown<T extends schemas.$ZodUnknown>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodUnknownParams
): T {
  return new Class({
    type: "unknown",
    ...util.normalizeParams(params),
  });
}

// Never
export type $ZodNeverParams = util.TypeParams<schemas.$ZodNever>;
export function _never<T extends schemas.$ZodNever>(Class: util.SchemaClass<T>, params?: string | $ZodNeverParams): T {
  return new Class({
    type: "never",
    ...util.normalizeParams(params),
  });
}

// Void
export type $ZodVoidParams = util.TypeParams<schemas.$ZodVoid>;
export function _void<T extends schemas.$ZodVoid>(Class: util.SchemaClass<T>, params?: string | $ZodVoidParams): T {
  return new Class({
    type: "void",
    ...util.normalizeParams(params),
  });
}

// Date
export type $ZodDateParams = util.TypeParams<schemas.$ZodDate, "coerce">;
export function _date<T extends schemas.$ZodDate>(Class: util.SchemaClass<T>, params?: string | $ZodDateParams): T {
  return new Class({
    type: "date",
    ...util.normalizeParams(params),
  });
}
export function _coercedDate<T extends schemas.$ZodDate>(
  Class: util.SchemaClass<T>,
  params?: string | $ZodDateParams
): T {
  return new Class({
    type: "date",
    coerce: true,
    ...util.normalizeParams(params),
  });
}

// NaN
export type $ZodNaNParams = util.TypeParams<schemas.$ZodNaN>;
export function _nan<T extends schemas.$ZodNaN>(Class: util.SchemaClass<T>, params?: string | $ZodNaNParams): T {
  return new Class({
    type: "nan",
    ...util.normalizeParams(params),
  });
}

export type $ZodCheckLessThanParams = util.CheckParams<checks.$ZodCheckLessThan, "inclusive" | "value">;
export function _lt(
  value: util.Numeric,
  params?: string | $ZodCheckLessThanParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeParams(params),
    value,
    inclusive: false,
  });
}

export function _lte(
  value: util.Numeric,
  params?: string | $ZodCheckLessThanParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",

    ...util.normalizeParams(params),
    value,
    inclusive: true,
  });
}
export {
  /** @deprecated Use `z.lte()` instead. */
  _lte as _max,
};

// ZodCheckGreaterThan
export type $ZodCheckGreaterThanParams = util.CheckParams<checks.$ZodCheckGreaterThan, "inclusive" | "value">;
export function _gt(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",

    ...util.normalizeParams(params),
    value,
    inclusive: false,
  });
}

export function _gte(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeParams(params),
    value,
    inclusive: true,
  });
}

export {
  /** @deprecated Use `z.gte()` instead. */
  _gte as _min,
};

export function _positive(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return _gt(0, params);
}

// negative
export function _negative(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan {
  return _lt(0, params);
}

// nonpositive
export function _nonpositive(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan {
  return _lte(0, params);
}

// nonnegative
export function _nonnegative(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return _gte(0, params);
}

export type $ZodCheckMultipleOfParams = util.CheckParams<checks.$ZodCheckMultipleOf, "value">;
export function _multipleOf(
  value: number | bigint,
  params?: string | $ZodCheckMultipleOfParams
): checks.$ZodCheckMultipleOf {
  return new checks.$ZodCheckMultipleOf({
    check: "multiple_of",
    ...util.normalizeParams(params),
    value,
  });
}

export type $ZodCheckMaxSizeParams = util.CheckParams<checks.$ZodCheckMaxSize, "maximum">;
export function _maxSize(
  maximum: number,
  params?: string | $ZodCheckMaxSizeParams
): checks.$ZodCheckMaxSize<util.HasSize> {
  return new checks.$ZodCheckMaxSize({
    check: "max_size",
    ...util.normalizeParams(params),
    maximum,
  });
}

export type $ZodCheckMinSizeParams = util.CheckParams<checks.$ZodCheckMinSize, "minimum">;
export function _minSize(
  minimum: number,
  params?: string | $ZodCheckMinSizeParams
): checks.$ZodCheckMinSize<util.HasSize> {
  return new checks.$ZodCheckMinSize({
    check: "min_size",
    ...util.normalizeParams(params),
    minimum,
  });
}

export type $ZodCheckSizeEqualsParams = util.CheckParams<checks.$ZodCheckSizeEquals, "size">;
export function _size(
  size: number,
  params?: string | $ZodCheckSizeEqualsParams
): checks.$ZodCheckSizeEquals<util.HasSize> {
  return new checks.$ZodCheckSizeEquals({
    check: "size_equals",
    ...util.normalizeParams(params),
    size,
  });
}

export type $ZodCheckMaxLengthParams = util.CheckParams<checks.$ZodCheckMaxLength, "maximum">;
export function _maxLength(
  maximum: number,
  params?: string | $ZodCheckMaxLengthParams
): checks.$ZodCheckMaxLength<util.HasLength> {
  const ch = new checks.$ZodCheckMaxLength({
    check: "max_length",
    ...util.normalizeParams(params),
    maximum,
  });
  return ch;
}

export type $ZodCheckMinLengthParams = util.CheckParams<checks.$ZodCheckMinLength, "minimum">;
export function _minLength(
  minimum: number,
  params?: string | $ZodCheckMinLengthParams
): checks.$ZodCheckMinLength<util.HasLength> {
  return new checks.$ZodCheckMinLength({
    check: "min_length",
    ...util.normalizeParams(params),
    minimum,
  });
}

export type $ZodCheckLengthEqualsParams = util.CheckParams<checks.$ZodCheckLengthEquals, "length">;
export function _length(
  length: number,
  params?: string | $ZodCheckLengthEqualsParams
): checks.$ZodCheckLengthEquals<util.HasLength> {
  return new checks.$ZodCheckLengthEquals({
    check: "length_equals",
    ...util.normalizeParams(params),
    length,
  });
}

export type $ZodCheckRegexParams = util.CheckParams<checks.$ZodCheckRegex, "format" | "pattern">;
export function _regex(pattern: RegExp, params?: string | $ZodCheckRegexParams): checks.$ZodCheckRegex {
  return new checks.$ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...util.normalizeParams(params),
    pattern,
  });
}

export type $ZodCheckLowerCaseParams = util.CheckParams<checks.$ZodCheckLowerCase, "format">;
export function _lowercase(params?: string | $ZodCheckLowerCaseParams): checks.$ZodCheckLowerCase {
  return new checks.$ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...util.normalizeParams(params),
  });
}

export type $ZodCheckUpperCaseParams = util.CheckParams<checks.$ZodCheckUpperCase, "format">;

export function _uppercase(params?: string | $ZodCheckUpperCaseParams): checks.$ZodCheckUpperCase {
  return new checks.$ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...util.normalizeParams(params),
  });
}

export type $ZodCheckIncludesParams = util.CheckParams<checks.$ZodCheckIncludes, "includes" | "format" | "pattern">;
export function _includes(includes: string, params?: string | $ZodCheckIncludesParams): checks.$ZodCheckIncludes {
  return new checks.$ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...util.normalizeParams(params),
    includes,
  });
}
export type $ZodCheckStartsWithParams = util.CheckParams<checks.$ZodCheckStartsWith, "prefix" | "format" | "pattern">;
export function _startsWith(prefix: string, params?: string | $ZodCheckStartsWithParams): checks.$ZodCheckStartsWith {
  return new checks.$ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...util.normalizeParams(params),
    prefix,
  });
}

export type $ZodCheckEndsWithParams = util.CheckParams<checks.$ZodCheckEndsWith, "suffix" | "format" | "pattern">;

export function _endsWith(suffix: string, params?: string | $ZodCheckEndsWithParams): checks.$ZodCheckEndsWith {
  return new checks.$ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...util.normalizeParams(params),
    suffix,
  });
}

export type $ZodCheckPropertyParams = util.CheckParams<checks.$ZodCheckProperty, "property" | "schema">;
export function _property<K extends string, T extends schemas.$ZodType>(
  property: K,
  schema: T,
  params?: string | $ZodCheckPropertyParams
): checks.$ZodCheckProperty<{ [k in K]: core.output<T> }> {
  return new checks.$ZodCheckProperty({
    check: "property",
    property,
    schema,
    ...util.normalizeParams(params),
  });
}

export type $ZodCheckMimeTypeParams = util.CheckParams<checks.$ZodCheckMimeType, "mime">;
export function _mime(types: util.MimeTypes[], params?: string | $ZodCheckMimeTypeParams): checks.$ZodCheckMimeType {
  return new checks.$ZodCheckMimeType({
    check: "mime_type",
    mime: types,
    ...util.normalizeParams(params),
  });
}

export function _overwrite<T>(tx: (input: T) => T): checks.$ZodCheckOverwrite<T> {
  return new checks.$ZodCheckOverwrite({
    check: "overwrite",
    tx,
  }) as checks.$ZodCheckOverwrite<T>;
}
// normalize
export function _normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): checks.$ZodCheckOverwrite<string> {
  return _overwrite((input) => input.normalize(form));
}

// trim
export function _trim(): checks.$ZodCheckOverwrite<string> {
  return _overwrite((input) => input.trim());
}
// toLowerCase
export function _toLowerCase(): checks.$ZodCheckOverwrite<string> {
  return _overwrite((input) => input.toLowerCase());
}
// toUpperCase
export function _toUpperCase(): checks.$ZodCheckOverwrite<string> {
  return _overwrite((input) => input.toUpperCase());
}

///////  collections   ///////

// Array
export type $ZodArrayParams = util.TypeParams<schemas.$ZodArray, "element">;
export function _array<T extends schemas.$ZodType>(
  Class: util.SchemaClass<schemas.$ZodArray>,
  element: T,
  params?: $ZodArrayParams
): schemas.$ZodArray<T> {
  return new Class({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...util.normalizeParams(params),
  }) as schemas.$ZodArray<T>;
}

// ZodObjectLike
export type $ZodObjectLikeParams = util.TypeParams<schemas.$ZodObjectLike, "shape" | "catchall">;

export type $ZodInterfaceParams = util.TypeParams<schemas.$ZodInterface, "shape">;
export function _interface<T extends schemas.$ZodLooseShape>(
  Class: util.SchemaClass<schemas.$ZodInterface>,
  shape: T,
  params?: $ZodInterfaceParams
): schemas.$ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    get shape() {
      const _shape = cleaned.value.shape;
      util.assignProp(this, "shape", _shape);
      return _shape;
      // return cleaned.value.shape;
    },
    get optional() {
      return cleaned.value.optional;
    },
    ...util.normalizeParams(params),
  };
  return new Class(def) as any;
}

// strictInterface
export function _strictInterface<T extends schemas.$ZodLooseShape>(
  Class: util.SchemaClass<schemas.$ZodInterface>,
  shape: T,
  params?: $ZodInterfaceParams
): schemas.$ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    get shape() {
      const _shape = cleaned.value.shape;
      util.assignProp(this, "shape", _shape);
      return _shape;
      // return cleaned.value.shape;
    },
    get optional() {
      return cleaned.value.optional;
    },
    catchall: _never(schemas.$ZodNever),
    ...util.normalizeParams(params),
  };
  return new Class(def) as any;
}

// looseInterface
export function _looseInterface<T extends schemas.$ZodLooseShape>(
  Class: util.SchemaClass<schemas.$ZodInterface>,
  shape: T,
  params?: $ZodInterfaceParams
): schemas.$ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, Record<string, unknown>>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    get optional() {
      return cleaned.value.optional;
    },
    get shape() {
      const _shape = cleaned.value.shape;
      util.assignProp(this, "shape", _shape);
      return _shape;
      // return cleaned.value.shape;
    },
    catchall: _unknown(schemas.$ZodUnknown),
    ...util.normalizeParams(params),
  };
  return new Class(def) as any;
}

export type $ZodObjectParams = util.TypeParams<schemas.$ZodObject, "shape" | "catchall">;
export function _object<T extends schemas.$ZodShape = Record<never, schemas.$ZodObject>>(
  Class: util.SchemaClass<schemas.$ZodObject>,
  shape?: T,
  params?: $ZodObjectLikeParams
): schemas.$ZodObject<T, {}> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape: shape ?? {},
    get optional() {
      return util.optionalObjectKeys(shape ?? {});
    },
    ...util.normalizeParams(params),
  };
  return new Class(def) as any;
}

// strictObject
export function _strictObject<T extends schemas.$ZodShape>(
  Class: util.SchemaClass<schemas.$ZodObject>,
  shape: T,
  params?: $ZodObjectParams
): schemas.$ZodObject<T, {}> {
  return new Class({
    type: "object",
    shape: shape as schemas.$ZodShape,
    get optional() {
      return util.optionalObjectKeys(shape);
    },
    catchall: _never(schemas.$ZodNever),
    ...util.normalizeParams(params),
  }) as any;
}

// looseObject
export function _looseObject<T extends schemas.$ZodShape>(
  Class: util.SchemaClass<schemas.$ZodObject>,
  shape: T,
  params?: $ZodObjectParams
): schemas.$ZodObject<T, { [k: string]: unknown }> {
  return new Class({
    type: "object",
    shape: shape as schemas.$ZodShape,
    get optional() {
      return util.optionalObjectKeys(shape);
    },
    catchall: _unknown(schemas.$ZodUnknown),
    ...util.normalizeParams(params),
  }) as any;
}

// ZodUnion
export type $ZodUnionParams = util.TypeParams<schemas.$ZodUnion, "options">;
export function _union<const T extends readonly schemas.$ZodObject[]>(
  Class: util.SchemaClass<schemas.$ZodUnion>,
  options: T,
  params?: $ZodUnionParams
): schemas.$ZodUnion<T> {
  return new Class({
    type: "union",
    options,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodDiscriminatedUnion
export interface $ZodTypeDiscriminableInternals extends schemas.$ZodTypeInternals {
  disc: util.DiscriminatorMap;
}

export interface $ZodTypeDiscriminable extends schemas.$ZodType {
  _zod: $ZodTypeDiscriminableInternals;
}
export type $ZodDiscriminatedUnionParams = util.TypeParams<schemas.$ZodDiscriminatedUnion, "options">;
export function _discriminatedUnion<Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
  Class: util.SchemaClass<schemas.$ZodDiscriminatedUnion>,
  options: Types,
  params?: $ZodDiscriminatedUnionParams
): schemas.$ZodDiscriminatedUnion<Types> {
  return new Class({
    type: "union",
    options,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodIntersection
export type $ZodIntersectionParams = util.TypeParams<schemas.$ZodIntersection, "left" | "right">;
export function _intersection<T extends schemas.$ZodObject, U extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodIntersection>,
  left: T,
  right: U,
  params?: $ZodIntersectionParams
): schemas.$ZodIntersection<T, U> {
  return new Class({
    type: "intersection",
    left,
    right,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodTuple
export type $ZodTupleParams = util.TypeParams<schemas.$ZodTuple, "items" | "rest">;
export function _tuple<T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]]>(
  Class: util.SchemaClass<schemas.$ZodTuple>,
  items: T,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, null>;
export function _tuple<T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]], Rest extends schemas.$ZodType>(
  Class: util.SchemaClass<schemas.$ZodTuple>,
  items: T,
  rest: Rest,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, Rest>;
// export function _tuple(
//   Class: util.SchemaClass<schemas.$ZodTuple>,
//   items: [],
//   params?: $ZodTupleParams
// ): schemas.$ZodTuple<[], null>;
export function _tuple(
  Class: util.SchemaClass<schemas.$ZodTuple>,
  items: schemas.$ZodType[],
  _paramsOrRest?: $ZodTupleParams | schemas.$ZodType,
  _params?: $ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof schemas.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new Class({
    type: "tuple",
    items,
    rest,
    ...util.normalizeParams(params),
  });
}

// ZodRecord
export type $ZodRecordParams = util.TypeParams<schemas.$ZodRecord, "keyType" | "valueType">;
export function _record<Key extends schemas.$ZodRecordKey, Value extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodRecord>,
  keyType: Key,
  valueType: Value,
  params?: $ZodRecordParams
): schemas.$ZodRecord<Key, Value> {
  return new Class({
    type: "record",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodMap
export type $ZodMapParams = util.TypeParams<schemas.$ZodMap, "keyType" | "valueType">;
export function _map<Key extends schemas.$ZodObject, Value extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodMap>,
  keyType: Key,
  valueType: Value,
  params?: $ZodMapParams
): schemas.$ZodMap<Key, Value> {
  return new Class({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodSet
export type $ZodSetParams = util.TypeParams<schemas.$ZodSet, "valueType">;
export function _set<Value extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodSet>,
  valueType: Value,
  params?: $ZodSetParams
): schemas.$ZodSet<Value> {
  return new Class({
    type: "set",
    valueType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodEnum
export type $ZodEnumParams = util.TypeParams<schemas.$ZodEnum, "entries">;
export function _enum<const T extends string[]>(
  Class: util.SchemaClass<schemas.$ZodEnum>,
  values: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<util.ToEnum<T[number]>>;
export function _enum<T extends util.EnumLike>(
  Class: util.SchemaClass<schemas.$ZodEnum>,
  entries: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<T>;
export function _enum(Class: util.SchemaClass<schemas.$ZodEnum>, values: any, params?: $ZodEnumParams) {
  const entries: any = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  // if (Array.isArray(values)) {
  //   for (const value of values) {
  //     entries[value] = value;
  //   }
  // } else {
  //   Object.assign(entries, values);
  // }
  // const entries: util.EnumLike = {};
  // for (const val of values) {
  //   entries[val] = val;
  // }

  return new Class({
    type: "enum",
    entries,
    ...util.normalizeParams(params),
  }) as any;
}

/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
export function _nativeEnum<T extends util.EnumLike>(
  Class: util.SchemaClass<schemas.$ZodEnum>,
  entries: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<T> {
  return new Class({
    type: "enum",
    entries,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodLiteral
export type $ZodLiteralParams = util.TypeParams<schemas.$ZodLiteral, "values">;
export function _literal<const T extends Array<util.Literal>>(
  Class: util.SchemaClass<schemas.$ZodLiteral>,
  value: T,
  params?: $ZodLiteralParams
): schemas.$ZodLiteral<T[number]>;
export function _literal<const T extends util.Literal>(
  Class: util.SchemaClass<schemas.$ZodLiteral>,
  value: T,
  params?: $ZodLiteralParams
): schemas.$ZodLiteral<T>;
export function _literal(Class: util.SchemaClass<schemas.$ZodLiteral>, value: any, params: any) {
  return new Class({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util.normalizeParams(params),
  });
}

// ZodFile
export type $ZodFileParams = util.TypeParams<schemas.$ZodFile>;
export function _file(Class: util.SchemaClass<schemas.$ZodFile>, params?: string | $ZodFileParams): schemas.$ZodFile {
  return new Class({
    type: "file",
    ...util.normalizeParams(params),
  });
}

// ZodTransform
export type $ZodTransformParams = util.TypeParams<schemas.$ZodTransform, "transform">;
export function _transform<I = unknown, O = I>(
  Class: util.SchemaClass<schemas.$ZodTransform>,
  fn: (input: I, ctx?: schemas.ParsePayload) => O,
  params?: $ZodTransformParams
): schemas.$ZodTransform<Awaited<O>, I> {
  return new Class({
    type: "transform",
    transform: fn as any,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodOptional
export type $ZodOptionalParams = util.TypeParams<schemas.$ZodOptional, "innerType">;
export function _optional<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodOptional>,
  innerType: T,
  params?: $ZodOptionalParams
): schemas.$ZodOptional<T> {
  return new Class({
    type: "optional",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodNullable
export type $ZodNullableParams = util.TypeParams<schemas.$ZodNullable, "innerType">;
export function _nullable<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodNullable>,
  innerType: T,
  params?: $ZodNullableParams
): schemas.$ZodNullable<T> {
  return new Class({
    type: "nullable",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodDefault
export type $ZodDefaultParams = util.TypeParams<schemas.$ZodDefault, "innerType" | "defaultValue">;
export function _default<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodDefault>,
  innerType: T,
  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
  params?: $ZodDefaultParams
): schemas.$ZodDefault<T> {
  return new Class({
    type: "default",
    defaultValue: (typeof defaultValue === "function" ? defaultValue : () => defaultValue) as any,
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodNonOptional
export type $ZodNonOptionalParams = util.TypeParams<schemas.$ZodNonOptional, "innerType">;
export function _nonoptional<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodNonOptional>,
  innerType: T,
  params?: $ZodNonOptionalParams
): schemas.$ZodNonOptional<T> {
  return new Class({
    type: "nonoptional",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodSuccess
export type $ZodSuccessParams = util.TypeParams<schemas.$ZodSuccess, "innerType">;
export function _success<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodSuccess>,
  innerType: T,
  params?: $ZodSuccessParams
): schemas.$ZodSuccess<T> {
  return new Class({
    type: "success",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodCatch
export type $ZodCatchParams = util.TypeParams<schemas.$ZodCatch, "innerType" | "catchValue">;
export function _catch<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodCatch>,
  innerType: T,
  catchValue: core.output<T> | ((ctx: schemas.$ZodCatchCtx) => core.output<T>),
  params?: $ZodCatchParams
): schemas.$ZodCatch<T> {
  return new Class({
    type: "catch",
    innerType,
    catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue) as any,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodPipe
export type $ZodPipeParams = util.TypeParams<schemas.$ZodPipe, "in" | "out">;
export function _pipe<
  const A extends schemas.$ZodType,
  B extends schemas.$ZodType<unknown, core.output<A>> = schemas.$ZodType<unknown, core.output<A>>,
>(
  Class: util.SchemaClass<schemas.$ZodPipe>,
  in_: A,
  out: B | schemas.$ZodType<unknown, core.output<A>>,
  params?: $ZodPipeParams
): schemas.$ZodPipe<A, B> {
  return new Class({
    type: "pipe",
    in: in_,
    out,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodReadonly
export type $ZodReadonlyParams = util.TypeParams<schemas.$ZodReadonly, "innerType">;
export function _readonly<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodReadonly>,
  innerType: T,
  params?: $ZodReadonlyParams
): schemas.$ZodReadonly<T> {
  return new Class({
    type: "readonly",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodTemplateLiteral
export type $ZodTemplateLiteralParams = util.TypeParams<schemas.$ZodTemplateLiteral, "parts">;
export function _templateLiteral<const Parts extends schemas.$TemplateLiteralPart[]>(
  Class: util.SchemaClass<schemas.$ZodTemplateLiteral>,
  parts: Parts,
  params?: $ZodTemplateLiteralParams
): schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>> {
  return new Class({
    type: "template_literal",
    parts,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodLazy
export type $ZodLazyParams = util.TypeParams<schemas.$ZodLazy, "getter">;
export function _lazy<T extends schemas.$ZodType>(
  Class: util.SchemaClass<schemas.$ZodLazy>,
  getter: () => T,
  params?: $ZodLazyParams
): schemas.$ZodLazy<T> {
  return new Class({
    type: "lazy",
    getter,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodPromise
export type $ZodPromiseParams = util.TypeParams<schemas.$ZodPromise, "innerType">;
export function _promise<T extends schemas.$ZodObject>(
  Class: util.SchemaClass<schemas.$ZodPromise>,
  innerType: T,
  params?: $ZodPromiseParams
): schemas.$ZodPromise<T> {
  return new Class({
    type: "promise",
    innerType,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodCustom
export type $ZodCustomParams = util.CheckTypeParams<schemas.$ZodCustom, "fn">;
export function _custom<O = unknown, I = O>(
  Class: util.SchemaClass<schemas.$ZodCustom>,
  fn: (data: O) => unknown,
  _params: string | $ZodCustomParams | undefined
): schemas.$ZodCustom<O, I> {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn: fn as any,
    ...util.normalizeParams(_params),
  });

  return schema as any;
}

export function _refine<T>(
  Class: util.SchemaClass<schemas.$ZodCustom>,
  fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
  _params: string | $ZodCustomParams = {}
): checks.$ZodCheck<T> {
  return _custom(Class, fn, _params);
}

// export type $ZodCustomParams = util.CheckTypeParams<schemas.$ZodCustom, "fn">

/////////    STRINGBOOL   /////////
// stringbool
export interface $ZodStringBoolParams extends util.TypeParams {
  truthy?: string[];
  falsy?: string[];
  /**
   * Options `"sensitive"`, `"insensitive"`
   *
   * Defaults to `"insensitive"`
   */
  case?: "sensitive" | "insensitive" | undefined;
}

export function _stringbool(
  Classes: {
    Pipe?: typeof schemas.$ZodPipe;
    Boolean?: typeof schemas.$ZodBoolean;
    Unknown?: typeof schemas.$ZodUnknown;
  },
  _params?: $ZodStringBoolParams
): schemas.$ZodPipe<schemas.$ZodUnknown, schemas.$ZodBoolean<boolean>> {
  const params = util.normalizeParams(_params);
  const trueValues = new Set(params?.truthy ?? ["true", "1", "yes", "on", "y", "enabled"]);
  const falseValues = new Set(params?.falsy ?? ["false", "0", "no", "off", "n", "disabled"]);

  const _Pipe = Classes.Pipe ?? schemas.$ZodPipe;
  const _Boolean = Classes.Boolean ?? schemas.$ZodBoolean;
  const _Unknown = Classes.Unknown ?? schemas.$ZodUnknown;

  const inst = new _Unknown({
    type: "unknown",
    checks: [
      {
        _zod: {
          check: (ctx: any) => {
            if (typeof ctx.value === "string") {
              let data: string = ctx.value;
              if (params?.case !== "sensitive") data = data.toLowerCase();
              if (trueValues.has(data)) {
                ctx.value = true;
              } else if (falseValues.has(data)) {
                ctx.value = false;
              } else {
                ctx.issues.push({
                  code: "invalid_value",
                  expected: "stringbool",
                  values: [...trueValues, ...falseValues],
                  input: ctx.value,
                  inst,
                });
              }
            } else {
              ctx.issues.push({
                code: "invalid_type",
                expected: "string",
                input: ctx.value,
              });
            }
          },
          def: {
            check: "custom",
          },
          onattach: [],
        },
      },
    ],
  });

  return new _Pipe({
    type: "pipe",
    in: inst,
    out: new _Boolean({
      type: "boolean",
    }),
  }) as any;
}
