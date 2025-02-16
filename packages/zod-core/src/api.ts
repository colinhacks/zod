import * as base from "./base.js";
import * as checks from "./checks.js";
import type * as errors from "./errors.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

export * as iso from "./iso.js";
export * as coerce from "./coerce.js";

/**
 * Dropped:
 * - effect
 * - function
 * - preprocess
 * - promise
 * - strictObject
 * - transformer
 * - oboolean
 * - onumber
 * - ostring
 */

//////   API   //////
// $ZodString
export type $ZodStringParams = util.TypeParams<schemas.$ZodString<string>, "coerce">;
const _string = util.factory(() => schemas.$ZodString, {
  type: "string",
});
export function string(checks?: base.$ZodCheck<string>[]): schemas.$ZodString<string>;
export function string(
  params?: string | $ZodStringParams,
  checks?: base.$ZodCheck<string>[]
): schemas.$ZodString<string>;
export function string(...args: any): schemas.$ZodString<string> {
  return _string(...args) as any;
}

// $ZodGUID
export type $ZodGUIDParams = util.StringFormatParams<schemas.$ZodGUID>;
export type $ZodCheckGUIDParams = util.CheckStringFormatParams<schemas.$ZodGUID>;
const _guid = util.factory(() => schemas.$ZodGUID, {
  type: "string",
  format: "guid",
  check: "string_format",
  abort: false,
});
export function guid(checks?: base.$ZodCheck<string>[]): schemas.$ZodGUID;
export function guid(params?: string | $ZodGUIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodGUID;
export function guid(...args: any[]): schemas.$ZodGUID {
  return _guid(...args);
}

// $ZodUUID
export type $ZodUUIDParams = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDParams = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
const _uuid = util.factory(() => schemas.$ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
});
export function uuid(checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuid(params?: string | $ZodUUIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuid(...args: any[]): schemas.$ZodUUID {
  return _uuid(...args);
}

// $ZodUUIDv4
export type $ZodUUIDv4Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv4Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
const _uuidv4 = util.factory(() => schemas.$ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v4",
});
export function uuidv4(checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv4(params?: string | $ZodUUIDv4Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv4(...args: any): schemas.$ZodUUID {
  return _uuidv4(...args);
}

// $ZodUUIDv6
export type $ZodUUIDv6Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv6Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
const _uuidv6 = util.factory(() => schemas.$ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v6",
});
export function uuidv6(checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv6(params?: string | $ZodUUIDv6Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv6(...args: any): schemas.$ZodUUID {
  return _uuidv6(...args);
}

// $ZodUUIDv7
export type $ZodUUIDv7Params = util.StringFormatParams<schemas.$ZodUUID, "pattern">;
export type $ZodCheckUUIDv7Params = util.CheckStringFormatParams<schemas.$ZodUUID, "pattern">;
const _uuidv7 = util.factory(() => schemas.$ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v7",
});
export function uuidv7(checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv7(params?: string | $ZodUUIDv7Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodUUID;
export function uuidv7(...args: any): schemas.$ZodUUID {
  return _uuidv7(...args);
}

// $ZodEmail
export type $ZodEmailParams = util.StringFormatParams<schemas.$ZodEmail>;
export type $ZodCheckEmailParams = util.CheckStringFormatParams<schemas.$ZodEmail>;
const _email = util.factory(() => schemas.$ZodEmail, {
  type: "string",
  format: "email",
  check: "string_format",
  abort: false,
});
export function email(checks?: base.$ZodCheck<string>[]): schemas.$ZodEmail;
export function email(params?: string | $ZodEmailParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodEmail;
export function email(...args: any): schemas.$ZodEmail {
  return _email(...args);
}

// $ZodURL
export type $ZodURLParams = util.StringFormatParams<schemas.$ZodURL>;
export type $ZodCheckURLParams = util.CheckStringFormatParams<schemas.$ZodURL>;
const _url = util.factory(() => schemas.$ZodURL, {
  type: "string",
  format: "url",
  check: "string_format",
  abort: false,
});
export function url(checks?: base.$ZodCheck<string>[]): schemas.$ZodURL;
export function url(params?: string | $ZodURLParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodURL;
export function url(...args: any): schemas.$ZodURL {
  return _url(...args);
}

// $ZodEmoji
export type $ZodEmojiParams = util.StringFormatParams<schemas.$ZodEmoji>;
export type $ZodCheckEmojiParams = util.CheckStringFormatParams<schemas.$ZodEmoji>;
const _emoji = util.factory(() => schemas.$ZodEmoji, {
  type: "string",
  format: "emoji",
  check: "string_format",
  abort: false,
});
export function emoji(checks?: base.$ZodCheck<string>[]): schemas.$ZodEmoji;
export function emoji(params?: string | $ZodEmojiParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodEmoji;
export function emoji(...args: any): schemas.$ZodEmoji {
  return _emoji(...args);
}

// $ZodNanoID
export type $ZodNanoIDParams = util.StringFormatParams<schemas.$ZodNanoID>;
export type $ZodCheckNanoIDParams = util.CheckStringFormatParams<schemas.$ZodNanoID>;
const _nanoid = util.factory(() => schemas.$ZodNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
  abort: false,
});
export function nanoid(checks?: base.$ZodCheck<string>[]): schemas.$ZodNanoID;
export function nanoid(params?: string | $ZodNanoIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodNanoID;
export function nanoid(...args: any): schemas.$ZodNanoID {
  return _nanoid(...args);
}

// $ZodCUID
export type $ZodCUIDParams = util.StringFormatParams<schemas.$ZodCUID>;
export type $ZodCheckCUIDParams = util.CheckStringFormatParams<schemas.$ZodCUID>;
const _cuid = util.factory(() => schemas.$ZodCUID, {
  type: "string",
  format: "cuid",
  check: "string_format",
  abort: false,
});
export function cuid(checks?: base.$ZodCheck<string>[]): schemas.$ZodCUID;
export function cuid(params?: string | $ZodCUIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodCUID;
export function cuid(...args: any): schemas.$ZodCUID {
  return _cuid(...args);
}

// $ZodCUID2
export type $ZodCUID2Params = util.StringFormatParams<schemas.$ZodCUID2>;
export type $ZodCheckCUID2Params = util.CheckStringFormatParams<schemas.$ZodCUID2>;
const _cuid2 = util.factory(() => schemas.$ZodCUID2, {
  type: "string",
  format: "cuid2",
  check: "string_format",
  abort: false,
});
export function cuid2(checks?: base.$ZodCheck<string>[]): schemas.$ZodCUID2;
export function cuid2(params?: string | $ZodCUID2Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodCUID2;
export function cuid2(...args: any): schemas.$ZodCUID2 {
  return _cuid2(...args);
}

// $ZodULID
export type $ZodULIDParams = util.StringFormatParams<schemas.$ZodULID>;
export type $ZodCheckULIDParams = util.CheckStringFormatParams<schemas.$ZodULID>;
const _ulid = util.factory(() => schemas.$ZodULID, {
  type: "string",
  format: "ulid",
  check: "string_format",
  abort: false,
});
export function ulid(checks?: base.$ZodCheck<string>[]): schemas.$ZodULID;
export function ulid(params?: string | $ZodULIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodULID;
export function ulid(...args: any): schemas.$ZodULID {
  return _ulid(...args);
}

// $ZodXID
export type $ZodXIDParams = util.StringFormatParams<schemas.$ZodXID>;
export type $ZodCheckXIDParams = util.CheckStringFormatParams<schemas.$ZodXID>;
const _xid = util.factory(() => schemas.$ZodXID, {
  type: "string",
  format: "xid",
  check: "string_format",
  abort: false,
});
export function xid(checks?: base.$ZodCheck<string>[]): schemas.$ZodXID;
export function xid(params?: string | $ZodXIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodXID;
export function xid(...args: any): schemas.$ZodXID {
  return _xid(...args);
}

// $ZodKSUID
export type $ZodKSUIDParams = util.StringFormatParams<schemas.$ZodKSUID>;
export type $ZodCheckKSUIDParams = util.CheckStringFormatParams<schemas.$ZodKSUID>;
const _ksuid = util.factory(() => schemas.$ZodKSUID, {
  type: "string",
  format: "ksuid",
  check: "string_format",
  abort: false,
});
export function ksuid(checks?: base.$ZodCheck<string>[]): schemas.$ZodKSUID;
export function ksuid(params?: string | $ZodKSUIDParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodKSUID;
export function ksuid(...args: any): schemas.$ZodKSUID {
  return _ksuid(...args);
}

// $ZodIP
export type $ZodIPParams = util.StringFormatParams<schemas.$ZodIP>;
export type $ZodCheckIPParams = util.CheckStringFormatParams<schemas.$ZodIP>;
const _ip = util.factory(() => schemas.$ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
});
export function ip(checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ip(params?: string | $ZodIPParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ip(...args: any): schemas.$ZodIP {
  return _ip(...args);
}

// $ZodIPv4
export type $ZodIPv4Params = util.StringFormatParams<schemas.$ZodIP>;
export type $ZodCheckIPv4Params = util.CheckStringFormatParams<schemas.$ZodIP>;
const _ipv4 = util.factory(() => schemas.$ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v4",
});
export function ipv4(checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ipv4(params?: string | $ZodIPv4Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ipv4(...args: any): schemas.$ZodIP {
  return _ipv4(...args);
}

// $ZodIPv6
export type $ZodIPv6Params = util.StringFormatParams<schemas.$ZodIP>;
export type $ZodCheckIPv6Params = util.CheckStringFormatParams<schemas.$ZodIP>;
const _ipv6 = util.factory(() => schemas.$ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v6",
});
export function ipv6(checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ipv6(params?: string | $ZodIPv6Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodIP;
export function ipv6(...args: any): schemas.$ZodIP {
  return _ipv6(...args);
}

// $ZodBase64
export type $ZodBase64Params = util.StringFormatParams<schemas.$ZodBase64>;
export type $ZodCheckBase64Params = util.CheckStringFormatParams<schemas.$ZodBase64>;
const _base64 = util.factory(() => schemas.$ZodBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
  abort: false,
});
export function base64(checks?: base.$ZodCheck<string>[]): schemas.$ZodBase64;
export function base64(params?: string | $ZodBase64Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodBase64;
export function base64(...args: any): schemas.$ZodBase64 {
  return _base64(...args);
}

// $ZodJSONString
export type $ZodJSONStringParams = util.StringFormatParams<schemas.$ZodJSONString>;
export type $ZodCheckJSONStringParams = util.CheckStringFormatParams<schemas.$ZodJSONString>;
const _jsonString = util.factory(() => schemas.$ZodJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
  abort: false,
});
export function jsonString(checks?: base.$ZodCheck<string>[]): schemas.$ZodJSONString;
export function jsonString(
  params?: string | $ZodJSONStringParams,
  checks?: base.$ZodCheck<string>[]
): schemas.$ZodJSONString;
export function jsonString(...args: any): schemas.$ZodJSONString {
  return _jsonString(...args);
}

// $ZodE164
export type $ZodE164Params = util.StringFormatParams<schemas.$ZodE164>;
export type $ZodCheckE164Params = util.CheckStringFormatParams<schemas.$ZodE164>;
const _e164 = util.factory(() => schemas.$ZodE164, {
  type: "string",
  format: "e164",
  check: "string_format",
  abort: false,
});
export function e164(checks?: base.$ZodCheck<string>[]): schemas.$ZodE164;
export function e164(params?: string | $ZodE164Params, checks?: base.$ZodCheck<string>[]): schemas.$ZodE164;
export function e164(...args: any): schemas.$ZodE164 {
  return _e164(...args);
}

// $ZodJWT
export type $ZodJWTParams = util.StringFormatParams<schemas.$ZodJWT, "pattern">;
export type $ZodCheckJWTParams = util.CheckStringFormatParams<schemas.$ZodJWT, "pattern">;
const _jwt = util.factory(() => schemas.$ZodJWT, {
  type: "string",
  format: "jwt",
  check: "string_format",
  abort: false,
});
export function jwt(checks?: base.$ZodCheck<string>[]): schemas.$ZodJWT;
export function jwt(params?: string | $ZodJWTParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodJWT;
export function jwt(...args: any): schemas.$ZodJWT {
  return _jwt(...args);
}

// number
const _number = util.factory(() => schemas.$ZodNumber, { type: "number" });
export type $ZodNumberParams = util.TypeParams<schemas.$ZodNumber<number>, "coerce">;
export function number(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumber<number>;
export function number(
  params?: string | $ZodNumberParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumber<number>;
export function number(...args: any): schemas.$ZodNumber<number> {
  return _number(...args) as any;
}

export type $ZodNumberFormatParams = util.CheckTypeParams<schemas.$ZodNumberFormat, "format" | "coerce">;

export type $ZodCheckNumberFormatParams = util.CheckParams<checks.$ZodCheckNumberFormat, "format">;

// int
const _int = util.factory(() => schemas.$ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "safeint",
});
export function int(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumberFormat;
export function int(
  params?: string | $ZodCheckNumberFormatParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumberFormat;
export function int(...args: any): schemas.$ZodNumberFormat {
  return _int(...args);
}

// float32
const _float32 = util.factory(() => schemas.$ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float32",
});
export function float32(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumberFormat;
export function float32(
  params?: string | $ZodCheckNumberFormatParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumberFormat;
export function float32(...args: any): schemas.$ZodNumberFormat {
  return _float32(...args);
}

// float64
const _float64 = util.factory(() => schemas.$ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float64",
});
export function float64(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumberFormat;
export function float64(
  params?: string | $ZodCheckNumberFormatParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumberFormat;
export function float64(...args: any): schemas.$ZodNumberFormat {
  return _float64(...args);
}

// int32
const _int32 = util.factory(() => schemas.$ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "int32",
});
export function int32(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumberFormat;
export function int32(
  params?: string | $ZodCheckNumberFormatParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumberFormat;
export function int32(...args: any): schemas.$ZodNumberFormat {
  return _int32(...args);
}

// uint32
const _uint32 = util.factory(() => schemas.$ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "uint32",
});
export function uint32(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumberFormat;
export function uint32(
  params?: string | $ZodCheckNumberFormatParams,
  checks?: base.$ZodCheck<number>[]
): schemas.$ZodNumberFormat;
export function uint32(...args: any): schemas.$ZodNumberFormat {
  return _uint32(...args);
}

// bigint
export type $ZodBigIntParams = util.TypeParams<schemas.$ZodBigInt<bigint>>;
const _bigint = util.factory(() => schemas.$ZodBigInt, {
  type: "bigint",
}) as any;
export function bigint(checks?: base.$ZodCheck<bigint>[]): schemas.$ZodBigInt<bigint>;
export function bigint(
  params?: string | $ZodBigIntParams,
  checks?: base.$ZodCheck<bigint>[]
): schemas.$ZodBigInt<bigint>;
export function bigint(...args: any): schemas.$ZodBigInt<bigint> {
  return _bigint(...args) as any;
}

// bigint formats
export type $ZodBigIntFormatParams = util.CheckTypeParams<schemas.$ZodBigIntFormat, "format" | "coerce">;
export type $ZodCheckBigIntFormatParams = util.CheckParams<checks.$ZodCheckBigIntFormat, "format">;
// int64
const _int64 = util.factory(() => schemas.$ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "int64",
});
export function int64(checks?: base.$ZodCheck<bigint | number>[]): schemas.$ZodBigIntFormat;
export function int64(
  params?: string | $ZodBigIntFormatParams,
  checks?: base.$ZodCheck<bigint | number>[]
): schemas.$ZodBigIntFormat;
export function int64(...args: any): schemas.$ZodBigIntFormat {
  return _int64(...args);
}

// uint64
const _uint64 = util.factory(() => schemas.$ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "uint64",
});
export function uint64(checks?: base.$ZodCheck<bigint>[]): schemas.$ZodBigIntFormat;
export function uint64(
  params?: string | $ZodBigIntFormatParams,
  checks?: base.$ZodCheck<bigint>[]
): schemas.$ZodBigIntFormat;
export function uint64(...args: any): schemas.$ZodBigIntFormat {
  return _uint64(...args);
}

// boolean
export type $ZodBooleanParams = util.TypeParams<schemas.$ZodBoolean<boolean>, "coerce">;
const _boolean = util.factory(() => schemas.$ZodBoolean, {
  type: "boolean",
}) as any;
export function boolean(checks?: base.$ZodCheck<boolean>[]): schemas.$ZodBoolean<boolean>;
export function boolean(
  params?: string | $ZodBooleanParams,
  checks?: base.$ZodCheck<boolean>[]
): schemas.$ZodBoolean<boolean>;
export function boolean(...args: any): schemas.$ZodBoolean<boolean> {
  return _boolean(...args) as any;
}

// symbol
export type $ZodSymbolParams = util.TypeParams<schemas.$ZodSymbol>;
const _symbol = util.factory(() => schemas.$ZodSymbol, {
  type: "symbol",
}) as any;
export function symbol(checks?: base.$ZodCheck<symbol>[]): schemas.$ZodSymbol;
export function symbol(params?: string | $ZodSymbolParams, checks?: base.$ZodCheck<symbol>[]): schemas.$ZodSymbol;
export function symbol(...args: any): schemas.$ZodSymbol {
  return _symbol(...args) as any;
}

// date
export type $ZodDateParams = util.TypeParams<schemas.$ZodDate, "coerce">;
const _date = util.factory(() => schemas.$ZodDate, { type: "date" });
export function date(checks?: base.$ZodCheck<Date>[]): schemas.$ZodDate;
export function date(params?: string | $ZodDateParams, checks?: base.$ZodCheck<Date>[]): schemas.$ZodDate;
export function date(...args: any): schemas.$ZodDate {
  return _date(...args) as any;
}

// undefined
export type $ZodUndefinedParams = util.TypeParams<schemas.$ZodUndefined>;
const _undefinedFactory = util.factory(() => schemas.$ZodUndefined, {
  type: "undefined",
});
function _undefined(checks?: base.$ZodCheck<undefined>[]): schemas.$ZodUndefined;
function _undefined(params?: string | $ZodUndefinedParams, checks?: base.$ZodCheck<undefined>[]): schemas.$ZodUndefined;
function _undefined(...args: any): schemas.$ZodUndefined {
  return _undefinedFactory(...args) as any;
}
export { _undefined as undefined };

// null
export type $ZodNullParams = util.TypeParams<schemas.$ZodNull>;
const _nullFactory = util.factory(() => schemas.$ZodNull, { type: "null" });
function _null(checks?: base.$ZodCheck<null>[]): schemas.$ZodNull;
function _null(params?: string | $ZodNullParams, checks?: base.$ZodCheck<null>[]): schemas.$ZodNull;
function _null(...args: any): schemas.$ZodNull {
  return _nullFactory(...args) as any;
}
export { _null as null };

// any
export type $ZodAnyParams = util.TypeParams<schemas.$ZodAny>;
const _any = util.factory(() => schemas.$ZodAny, { type: "any" });
export function any(checks?: base.$ZodCheck<any>[]): schemas.$ZodAny;
export function any(params?: string | $ZodAnyParams, checks?: base.$ZodCheck<any>[]): schemas.$ZodAny;
export function any(...args: any): schemas.$ZodAny {
  return _any(...args) as any;
}

// unknown
export type $ZodUnknownParams = util.TypeParams<schemas.$ZodUnknown>;
const _unknown = util.factory(() => schemas.$ZodUnknown, { type: "unknown" });
export function unknown(checks?: base.$ZodCheck<unknown>[]): schemas.$ZodUnknown;
export function unknown(params?: string | $ZodUnknownParams, checks?: base.$ZodCheck<unknown>[]): schemas.$ZodUnknown;
export function unknown(...args: any): schemas.$ZodUnknown {
  return _unknown(...args) as any;
}

// never
export type $ZodNeverParams = util.TypeParams<schemas.$ZodNever>;
const _never = util.factory(() => schemas.$ZodNever, { type: "never" });
export function never(checks?: base.$ZodCheck<never>[]): schemas.$ZodNever;
export function never(params?: string | $ZodNeverParams, checks?: base.$ZodCheck<never>[]): schemas.$ZodNever;
export function never(...args: any): schemas.$ZodNever {
  return _never(...args) as any;
}

// void
export type $ZodVoidParams = util.TypeParams<schemas.$ZodVoid>;
const _voidFactory = util.factory(() => schemas.$ZodVoid, { type: "void" });
function _void(checks?: base.$ZodCheck<void>[]): schemas.$ZodVoid;
function _void(params?: string | $ZodVoidParams, checks?: base.$ZodCheck<void>[]): schemas.$ZodVoid;
function _void(...args: any): schemas.$ZodVoid {
  return _voidFactory(...args) as any;
}
export { _void as void };

// array
export type $ZodArrayParams = util.TypeParams<schemas.$ZodArray, "element">;

export function array<T extends base.$ZodType>(element: T, params?: $ZodArrayParams): schemas.$ZodArray<T>;
export function array<T extends base.$ZodType>(element: base.$ZodType, params?: any): schemas.$ZodArray<T> {
  return new schemas.$ZodArray({
    type: "array",
    get element() {
      return element;
    },
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodArray<T>;
}

export type $ZodObjectLikeParams = util.TypeParams<schemas.$ZodObjectLike, "shape">;

// object
export function object<T extends schemas.$ZodShape = Record<never, base.$ZodType>>(
  shape?: T,
  params?: $ZodObjectLikeParams
): schemas.$ZodObject<T, {}> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape: shape ?? {},
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as any;
}

// strictObject
export type $ZodStrictObjectParams = util.TypeParams<schemas.$ZodObjectLike, "shape" | "catchall">;
export function strictObject<T extends schemas.$ZodShape>(
  shape: T,
  params?: $ZodStrictObjectParams
): schemas.$ZodObject<T, {}> {
  const def: schemas.$ZodObjectDef = {
    type: "object",

    shape: shape as schemas.$ZodShape,
    catchall: never(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T, {}>;
}

// looseObject
export type $ZodLooseObjectParams = util.TypeParams<schemas.$ZodObjectLike, "shape" | "catchall">;
export function looseObject<T extends schemas.$ZodShape>(
  shape: T,
  params?: $ZodLooseObjectParams
): schemas.$ZodObject<T, { [k: string]: unknown }> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape: shape as schemas.$ZodShape,
    catchall: unknown(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T, { [k: string]: unknown }>;
}

// interface
export type $ZodInterfaceParams = util.TypeParams<schemas.$ZodInterface, "shape">;
function _interface<T extends schemas.$ZodLooseShape>(
  shape: T,
  params?: $ZodInterfaceParams
): schemas.$ZodInterface<T, {}> {
  // {
  //   [k in keyof T]: base.$ZodType<T[k]["_output"], T[k]["_input"]>;
  // }
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    shape,
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodInterface(def) as any;
}
export { _interface as interface };

// strictInterface
export type $ZodStrictInterfaceParams = util.TypeParams<schemas.$ZodObjectLike, "shape" | "catchall">;
export function strictInterface<T extends schemas.$ZodLooseShape>(
  shape: T,
  params?: $ZodStrictInterfaceParams
): schemas.$ZodInterface<
  T,
  {}
  //{ [k in keyof T]: base.$ZodType<T[k]["_output"], T[k]["_input"]>;}
> {
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    shape,
    catchall: never(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodInterface(def) as any;
}

// looseInterface
export type $ZodLooseInterfaceParams = util.TypeParams<schemas.$ZodObjectLike, "shape" | "catchall">;
export function looseInterface<T extends schemas.$ZodLooseShape>(
  shape: T,
  params?: $ZodLooseInterfaceParams
): schemas.$ZodInterface<
  T,
  Record<string, unknown>
  // {[k in keyof T]: base.$ZodType<T[k]["_output"], T[k]["_input"]>;}
> {
  const def: schemas.$ZodInterfaceDef = {
    type: "interface",
    shape,
    catchall: unknown(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodInterface(def) as any;
}

// .keyof
export function keyof<T extends schemas.$ZodObject>(schema: T): schemas.$ZodLiteral<keyof T["_shape"]>;
export function keyof<T extends schemas.$ZodInterface>(schema: T): schemas.$ZodLiteral<keyof T["_output"]>;
export function keyof(schema: schemas.$ZodObjectLike) {
  const shape =
    schema._def.type === "interface" ? util.cleanInterfaceShape(schema._def.shape).shape : schema._def.shape;

  return literal(Object.keys(shape)) as any;
}

export function extend<T extends schemas.$ZodObjectLike, U extends schemas.$ZodShape>(
  schema: T,
  shape: U
): T["_def"]["type"] extends "interface"
  ? schemas.$ZodInterface<util.Flatten<util.ExtendShape<T["_shape"], U>>, T["_extra"]>
  : schemas.$ZodObject<util.Flatten<util.ExtendShape<T["_shape"], U>>, T["_extra"]>;

export function extend(schema: schemas.$ZodObjectLike, shape: schemas.$ZodShape): schemas.$ZodObjectLike {
  return util.extend(schema, shape);
}

// .merge
export function merge<T extends schemas.$ZodObjectLike, U extends schemas.$ZodObjectLike>(
  base: T,
  incoming: U
): schemas.$ZodObjectLike<T["_shape"] & U["_shape"]> {
  return incoming.clone({
    ...incoming._def, // incoming overrides properties on base
    shape: { ...base._def.shape, ...incoming._def.shape },
    checks: [],
  }) as any;
}

// .pick
// export function pick<T extends schemas.$ZodObject, M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
//   schema: T,
//   mask: M
// ): schemas.$ZodObject<util.Flatten<Pick<T["_shape"], Extract<keyof T["_shape"], keyof M>>>>;
// export function pick<
//   T extends schemas.$ZodInterface,
//   const M extends util.Exactly<util.Mask<keyof NoInfer<T>["_shape"]>, M>,
// >(schema: T, mask: M): schemas.$ZodInterface<Pick<T["_shape"], string & keyof M>, T["_extra"]>;
// export function pick(schema: schemas.$ZodObjectLike, mask: object) {
//   return util.pick(schema, mask);
// }

// .pick
export function pick<T extends schemas.$ZodObjectLike, M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
  schema: T,
  mask: M
): T["_def"]["type"] extends "interface"
  ? schemas.$ZodInterface<util.Flatten<Pick<T["_shape"], keyof T["_shape"] & keyof M>>, T["_extra"]>
  : schemas.$ZodObject<util.Flatten<Pick<T["_shape"], keyof T["_shape"] & keyof M>>, T["_extra"]>;
export function pick(schema: schemas.$ZodObjectLike, mask: object) {
  return util.pick(schema, mask);
}

// .omit
export function omit<T extends schemas.$ZodObjectLike, const M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
  schema: T,
  mask: M
): T["_def"]["type"] extends "interface"
  ? schemas.$ZodInterface<util.Flatten<Omit<T["_shape"], keyof M>>, T["_extra"]>
  : schemas.$ZodObject<util.Flatten<Omit<T["_shape"], keyof M>>, T["_extra"]>;
// export function omit<
//   T extends schemas.$ZodInterface,
//   M extends util.Exactly<util.Mask<keyof T["_output"]>, M>,
// >(
//   schema: T,
//   mask: M
// ): schemas.$ZodInterface<
//   Omit<T["_output"], Extract<keyof T["_output"], keyof M>>,
//   Omit<T["_input"], Extract<keyof T["_input"], keyof M>>
// >;
// export function omit<
//   T extends schemas.$ZodObject,
//   M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>,
// >(
//   schema: T,
//   mask: M
// ):
// schemas.$ZodObject<
//   util.Flatten<
//     Omit<T["_shape"], Extract<keyof T["_shape"], keyof M>>
//   >
// >;
export function omit(schema: schemas.$ZodObjectLike, mask: object) {
  return util.omit(schema, mask);
}

// .partial
// export function partial<T extends schemas.$ZodObject>(
//   schema: T
// ): schemas.$ZodObject<
//   {
//     [k in keyof T["_shape"]]: schemas.$ZodOptional<T["_shape"][k]>;
//   },
//   T["_extra"]
// >;
// export function partial<T extends schemas.$ZodObject, M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
//   schema: T,
//   mask: M
// ): schemas.$ZodObject<
//   {
//     [k in keyof T["_shape"]]: k extends keyof M ? schemas.$ZodOptional<T["_shape"][k]> : T["_shape"][k];
//   },
//   T["_extra"]
// >;
// export function partial<T extends schemas.$ZodInterface>(
//   schema: T
// ): schemas.$ZodInterface<Partial<T["_output"]>, Partial<T["_input"]>>;
// export function partial<T extends schemas.$ZodInterface, M extends util.Mask<keyof T["_output"]>>(
//   schema: T,
//   mask: M
// ): schemas.$ZodInterface<util.PartialInterfaceShape<T["_shape"], string & keyof M>, T["_extra"]>;
export function partial<T extends schemas.$ZodObjectLike>(
  schema: T
): T["_def"]["type"] extends "interface"
  ? schemas.$ZodInterface<util.PartialInterfaceShape<T["_shape"], string & keyof T["_shape"]>, T["_extra"]>
  : schemas.$ZodObject<
      {
        [k in keyof T["_shape"]]: schemas.$ZodOptional<T["_shape"][k]>;
      },
      T["_extra"]
    >;
export function partial<T extends schemas.$ZodObjectLike, M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
  schema: T,
  mask: M
): T["_def"]["type"] extends "interface"
  ? schemas.$ZodInterface<util.PartialInterfaceShape<T["_shape"], string & keyof M>, T["_extra"]>
  : schemas.$ZodObject<
      {
        [k in keyof T["_shape"]]: k extends keyof M ? schemas.$ZodOptional<T["_shape"][k]> : T["_shape"][k];
      },
      T["_extra"]
    >;

// export function partial<T extends schemas.$ZodInterface>(
//   schema: T
// ): schemas.$ZodInterface<Partial<T["_output"]>, Partial<T["_input"]>>;
// export function partial<T extends schemas.$ZodInterface, M extends util.Mask<keyof T["_output"]>>(
//   schema: T,
//   mask: M
// ): schemas.$ZodInterface<util.PartialInterfaceShape<T["_shape"], string & keyof M>, T["_extra"]>;
export function partial(schema: schemas.$ZodObjectLike, mask?: object): schemas.$ZodObjectLike {
  if (schema._def.type === "interface") {
    return util.partialInterface(schema as any, mask);
  }
  if (schema._def.type === "object") {
    return util.partialObject(schema, mask, schemas.$ZodOptional);
  }
  throw new Error(`Unexpected input to partial(): ${schema._def.type}`);
}

// .required
export function required<T extends schemas.$ZodObject>(
  schema: T
): schemas.$ZodObject<{
  [k in keyof T["_shape"]]: schemas.$ZodNonOptional<T["_shape"][k]>;
}>;
export function required<T extends schemas.$ZodObject, M extends util.Exactly<util.Mask<keyof T["_shape"]>, M>>(
  schema: T,
  mask: M
): schemas.$ZodObject<{
  [k in keyof T["_shape"]]: k extends keyof M ? schemas.$ZodNonOptional<T["_shape"][k]> : T["_shape"][k];
}>;
export function required<T extends schemas.$ZodInterface>(
  schema: T
): schemas.$ZodInterface<Required<T["_output"]>, Required<T["_input"]>>;
export function required<T extends schemas.$ZodInterface, M extends util.Mask<keyof T["_output"]>>(
  schema: T,
  mask: M
): schemas.$ZodInterface<util.RequiredInterfaceShape<T["_shape"], string & keyof M>, T["_extra"]>;
export function required(schema: schemas.$ZodObjectLike, mask?: object): schemas.$ZodObjectLike {
  if (schema._def.type === "interface") {
    return util.requiredInterface(schema as any, mask);
  }

  if (schema._def.type === "object") {
    return util.requiredObject(schema, mask, schemas.$ZodNonOptional);
  }
  throw new Error(`Unexpected input to required(): ${schema._def.type}`);
}

// lazy
export function lazy<T extends object>(getter: () => T): T {
  return util.createTransparentProxy<T>(getter);
}

// union
export type $ZodUnionParams = util.TypeParams<schemas.$ZodUnion, "options">;
export function union<const T extends readonly base.$ZodType[]>(
  options: T,
  params?: $ZodUnionParams
): schemas.$ZodUnion<T> {
  return new schemas.$ZodUnion({
    type: "union",
    options,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodUnion<T>;
}

// discriminatedUnion
export interface $ZodHasDiscriminator extends base.$ZodType {
  _disc: base.$DiscriminatorMap;
}
export type $ZodDiscriminatedUnionParams = util.TypeParams<schemas.$ZodDiscriminatedUnion, "options">;
export function discriminatedUnion<Types extends [$ZodHasDiscriminator, ...$ZodHasDiscriminator[]]>(
  options: Types,
  params?: $ZodDiscriminatedUnionParams
): schemas.$ZodDiscriminatedUnion<Types> {
  return new schemas.$ZodDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodDiscriminatedUnion<Types>;
}

// intersection
export type $ZodIntersectionParams = util.TypeParams<schemas.$ZodIntersection, "left" | "right">;
export function intersection<T extends base.$ZodType, U extends base.$ZodType>(
  left: T,
  right: U,
  params?: $ZodIntersectionParams
): schemas.$ZodIntersection<T, U> {
  return new schemas.$ZodIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodIntersection<T, U>;
}

// tuple
export type $ZodTupleParams = util.TypeParams<schemas.$ZodTuple, "items">;

export function tuple<T extends readonly [base.$ZodType, ...base.$ZodType[]]>(
  items: T,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, null>;
export function tuple<T extends readonly [base.$ZodType, ...base.$ZodType[]], Rest extends base.$ZodType>(
  items: T,
  rest: Rest,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, Rest>;
export function tuple(items: [], params?: $ZodTupleParams): schemas.$ZodTuple<[], null>;
export function tuple(
  items: base.$ZodType[],
  _paramsOrRest?: $ZodTupleParams | base.$ZodType,
  _params?: $ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof base.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new schemas.$ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util.normalizeTypeParams(params),
  });
}

// record
export type $ZodRecordParams = util.TypeParams<schemas.$ZodRecord, "keySchema" | "valueSchema">;
export function record<Key extends schemas.$ZodPropertyKey, Value extends base.$ZodType>(
  keySchema: Key,
  valueSchema: Value,
  params?: $ZodRecordParams
): schemas.$ZodRecord<Key, Value> {
  return new schemas.$ZodRecord({
    type: "record",
    keySchema,
    valueSchema,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodRecord<Key, Value>;
}

// map
export type $ZodMapParams = util.TypeParams<schemas.$ZodMap, "keyType" | "valueType">;
export function map<Key extends base.$ZodType, Value extends base.$ZodType>(
  keyType: Key,
  valueType: Value,
  params?: $ZodMapParams
): schemas.$ZodMap<Key, Value> {
  return new schemas.$ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodMap<Key, Value>;
}

// set
export type $ZodSetParams = util.TypeParams<schemas.$ZodSet, "valueType">;
export function set<Value extends base.$ZodType>(valueType: Value, params?: $ZodSetParams): schemas.$ZodSet<Value> {
  return new schemas.$ZodSet({
    type: "set",
    valueType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodSet<Value>;
}

// enum
export type $ZodEnumParams = util.TypeParams<schemas.$ZodEnum, "entries">;
function _enum<const T extends string[]>(values: T, params?: $ZodEnumParams): schemas.$ZodEnum<util.ToEnum<T[number]>>;
function _enum<T extends util.EnumLike>(entries: T, params?: $ZodEnumParams): schemas.$ZodEnum<T>;
function _enum<T extends util.EnumLike>(values: any, params?: $ZodEnumParams) {
  const entries: util.EnumLike = {};
  if (Array.isArray(values)) {
    for (const value of values) {
      entries[value] = value;
    }
  } else {
    Object.assign(entries, values);
  }
  // const entries: util.EnumLike = {};
  // for (const val of values) {
  //   entries[val] = val;
  // }

  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodEnum<util.ToEnum<T[number]>>;
}
export { _enum as enum };

// nativeEnum
/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
export function nativeEnum<T extends util.EnumLike>(entries: T, params?: $ZodEnumParams): schemas.$ZodEnum<T> {
  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodEnum<T>;
}

// literal
export type $ZodLiteralParams = util.TypeParams<schemas.$ZodLiteral, "values">;
export function literal<const T extends util.Literal | util.Literal[]>(
  value: T,
  params?: $ZodLiteralParams
): schemas.$ZodLiteral<T extends any[] ? T[number] : T> {
  return new schemas.$ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodLiteral<T extends any[] ? T[number] : T>;
}

// stringbool
export interface $ZodStringBoolParams extends util.TypeParams {
  truthy?: string[];
  falsy?: string[];
  /**
   * Options `"sensitive"`, `"insensitive"`
   *
   * Defaults to `"insensitive"`
   */
  case?: "sensitive" | "insensitive";
}

export function stringbool(
  _params?: $ZodStringBoolParams
): schemas.$ZodPipe<schemas.$ZodCustom<unknown>, schemas.$ZodBoolean<boolean>> {
  const params = util.normalizeTypeParams<$ZodStringBoolParams>(_params);
  const trueValues = new Set(params?.truthy ?? ["true", "1", "yes", "on", "y", "enabled"]);
  const falseValues = new Set(params?.falsy ?? ["false", "0", "no", "off", "n", "disabled"]);

  const parser = check<unknown>((ctx) => {
    if (typeof ctx.value === "string") {
      let data: string = ctx.value;
      if (params?.case !== "sensitive") data = data.toLowerCase();
      if (trueValues.has(data)) {
        ctx.value = true;
      } else if (falseValues.has(data)) {
        ctx.value = false;
      } else {
        ctx.issues.push({
          code: "invalid_format",
          format: "stringbool",
          input: ctx.value,
          def: params as any,
        });
      }
    } else {
      ctx.issues.push({
        code: "invalid_type",
        expected: "string",
        input: ctx.value,
      });
    }
  });

  return pipe(parser, boolean());
}

// json
export type JSONType = string | number | boolean | null | JSONType[] | { [key: string]: JSONType };

export interface $ZodJSONSchema
  extends schemas.$ZodUnion<
    [
      schemas.$ZodString<string>,
      schemas.$ZodNumber<number>,
      schemas.$ZodBoolean<boolean>,
      schemas.$ZodNull,
      schemas.$ZodArray<$ZodJSONSchema>,
      schemas.$ZodRecord<schemas.$ZodString<string>, $ZodJSONSchema>,
    ]
  > {
  _input: JSONType;
  _output: JSONType;
}

export function json(): $ZodJSONSchema {
  const jsonSchema = lazy(() => {
    return union([string(), number(), boolean(), _null(), array(jsonSchema), record(string(), jsonSchema)]);
  }) as $ZodJSONSchema;

  return jsonSchema;
}

// truthy
// type $ZodTruthyParams = util.TypeParams<schemas.$ZodBoolean>;
// export function truthy(
//   params?: $ZodTruthyParams
// ): schemas.$ZodPipe<
//   schemas.$ZodTransform<boolean, unknown>,
//   schemas.$ZodBoolean
// > {
//   return preprocess((val) => Boolean(val), boolean(params));
// }

// file
export type $ZodFileParams = util.TypeParams<schemas.$ZodFile>;
const _file = util.factory(() => schemas.$ZodFile, { type: "file" });
export function file(checks?: base.$ZodCheck<File>[]): schemas.$ZodFile;

export function file(params?: string | $ZodFileParams, checks?: base.$ZodCheck<File>[]): schemas.$ZodFile;
export function file(...args: any): schemas.$ZodFile {
  return _file(...args) as any;
}

// effect
export type $ZodTransformParams = util.TypeParams<schemas.$ZodTransform, "effect">;

// transform
// rewrite to use pipe and effect
// interface $ZodTransformParams extends $ZodTransformParams, $ZodPipeParams {}
// export function transform<T extends base.$ZodType, NewOut>(
//   schema: T,
//   fn: (arg: base.output<T>) => NewOut,
//   params?: $ZodTransformParams
// ): schemas.$ZodPipe<T, schemas.$ZodTransform<Awaited<NewOut>, base.output<T>>>;
export function transform<I = unknown, O = I>(
  fn: (input: I, ctx?: base.$ParsePayload) => O,
  params?: $ZodTransformParams
): schemas.$ZodTransform<Awaited<O>, I>;
export function transform<I = unknown, O = I>(
  schemaOrFn: base.$ZodType | util.AnyFunc,
  fnOrParams?: $ZodTransformParams | util.AnyFunc,
  _params?: object
) {
  if (schemaOrFn instanceof base.$ZodType) {
    const schema = schemaOrFn as base.$ZodType;
    const fn = fnOrParams as util.AnyFunc;
    return pipe(schema, transform(fn, _params), _params) as any;
  }

  const fn = schemaOrFn as util.AnyFunc;
  const params = fnOrParams as $ZodTransformParams;
  return new schemas.$ZodTransform({
    type: "effect",
    effect: fn as any,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodTransform<O, I>;
}

// preprocess
// export type $ZodPreprocessParams = util.Flatten<
//   $ZodTransformParams & $ZodPipeParams
// >;
// export function preprocess<T, U extends base.$ZodType<unknown, T>>(
//   fn: (arg: unknown) => T,
//   schema: U,
//   params?: $ZodPreprocessParams
// ): schemas.$ZodPipe<schemas.$ZodTransform<T, unknown>, U> {
//   return pipe(effect(fn, params), schema, params);
// }

// optional
export type $ZodOptionalParams = util.TypeParams<schemas.$ZodOptional, "innerType">;
export function optional<T extends base.$ZodType, D extends T["_output"] | undefined>(
  innerType: T,
  params?: $ZodOptionalParams
): schemas.$ZodOptional<T>;
export function optional<T extends base.$ZodType>(innerType: T, params?: $ZodOptionalParams): schemas.$ZodOptional<T>;
export function optional<T extends base.$ZodType>(innerType: T, params?: $ZodOptionalParams): schemas.$ZodOptional<T> {
  return new schemas.$ZodOptional({
    type: "optional",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodOptional<T>;
}

// nullable
export type $ZodNullableParams = util.TypeParams<schemas.$ZodNullable, "innerType">;
export function nullable<T extends base.$ZodType>(innerType: T, params?: $ZodNullableParams): schemas.$ZodNullable<T> {
  return new schemas.$ZodNullable({
    type: "nullable",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodNullable<T>;
}

// nonoptional
export type $ZodNonOptionalParams = util.TypeParams<schemas.$ZodNonOptional, "innerType">;
export function nonoptional<T extends base.$ZodType>(
  innerType: T,
  params?: $ZodNonOptionalParams
): schemas.$ZodNonOptional<T> {
  return new schemas.$ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodNonOptional<T>;
}

// default
export type $ZodDefaultParams = util.TypeParams<schemas.$ZodDefault, "innerType" | "defaultValue">;
export function _default<T extends base.$ZodType>(
  innerType: T,
  defaultValue: util.NoUndefined<base.output<T>> | (() => util.NoUndefined<base.output<T>>),
  params?: $ZodDefaultParams
): schemas.$ZodDefault<T> {
  return new schemas.$ZodDefault({
    type: "default",
    defaultValue: (typeof defaultValue === "function" ? defaultValue : () => defaultValue) as () => base.output<T>,
    innerType,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodDefault<T>;
}

// coalesce
export type $ZodCoalesceParams = util.TypeParams<schemas.$ZodCoalesce, "innerType" | "defaultValue">;
export function coalesce<T extends base.$ZodType>(
  innerType: T,
  defaultValue: base.output<T> | (() => base.output<T>),
  params?: $ZodCoalesceParams
): schemas.$ZodCoalesce<T> {
  return new schemas.$ZodCoalesce({
    type: "coalesce",
    defaultValue: (typeof defaultValue === "function" ? defaultValue : () => defaultValue) as () => NonNullable<
      base.output<T>
    >,
    innerType,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodCoalesce<T>;
}

// success
export type $ZodSuccessParams = util.TypeParams<schemas.$ZodSuccess, "innerType">;
export function success<T extends base.$ZodType>(innerType: T, params?: $ZodSuccessParams): schemas.$ZodSuccess<T> {
  return new schemas.$ZodSuccess({
    type: "success",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodSuccess<T>;
}

// catch
export type $ZodCatchParams = util.TypeParams<schemas.$ZodCatch, "innerType" | "catchValue">;
function _catch<T extends base.$ZodType>(
  innerType: T,
  catchValue: base.output<T> | ((ctx: schemas.$ZodCatchCtx) => base.output<T>),
  params?: $ZodCatchParams
): schemas.$ZodCatch<T> {
  return new schemas.$ZodCatch({
    type: "catch",
    innerType,
    catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue) as (
      ctx: schemas.$ZodCatchCtx
    ) => base.output<T>,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodCatch<T>;
}
export { _catch as catch };

// nan
export type $ZodNaNParams = util.TypeParams<schemas.$ZodNaN>;
const _nan = util.factory(() => schemas.$ZodNaN, { type: "nan" });
export function nan(checks?: base.$ZodCheck<number>[]): schemas.$ZodNaN;
export function nan(params?: string | $ZodNaNParams, checks?: base.$ZodCheck<number>[]): schemas.$ZodNaN;
export function nan(...args: any): schemas.$ZodNaN {
  return _nan(...args) as any;
}

// pipe
export type $ZodPipeParams = util.TypeParams<schemas.$ZodPipe, "in" | "out">;

export function pipe<
  const A extends base.$ZodType,
  B extends base.$ZodType<unknown, base.output<A>> = base.$ZodType<unknown, base.output<A>>,
>(in_: A, out: B | base.$ZodType<unknown, base.output<A>>, params?: $ZodPipeParams): schemas.$ZodPipe<A, B>;
export function pipe(in_: base.$ZodType, out: base.$ZodType, params?: $ZodPipeParams) {
  return new schemas.$ZodPipe({
    type: "pipe",
    in: in_,
    out,
    ...util.normalizeTypeParams(params),
  });
}

// readonly
export type $ZodReadonlyParams = util.TypeParams<schemas.$ZodReadonly, "innerType">;
export function readonly<T extends base.$ZodType>(innerType: T, params?: $ZodReadonlyParams): schemas.$ZodReadonly<T> {
  return new schemas.$ZodReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodReadonly<T>;
}

// templateLiteral
export type $ZodTemplateLiteralParams = util.TypeParams<schemas.$ZodTemplateLiteral, "parts">;
export function templateLiteral<const Parts extends schemas.$TemplateLiteralPart[]>(
  parts: Parts,
  params?: $ZodTemplateLiteralParams
): schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>> {
  return new schemas.$ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeTypeParams(params),
  }) as any;
}

// promise
export type $ZodPromiseParams = util.TypeParams<schemas.$ZodPromise, "innerType">;
export function promise<T extends base.$ZodType>(innerType: T, params?: $ZodPromiseParams): schemas.$ZodPromise<T> {
  return new schemas.$ZodPromise({
    type: "promise",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodPromise<T>;
}

//////////    CUSTOM     //////////
export interface $ZodCustomParams extends util.CheckTypeParams<schemas.$ZodCustom, "fn"> {}
export interface $ZodCustomParamsWithPath extends $ZodCustomParams {
  path?: PropertyKey[];
}

// export function check<T extends base.$ZodType>(
//   inst: T,
//   ...checks: Array<base.$CheckFn<T["_output"]> | base.$ZodCheck<T["_output"]>>
// ): T;
export function check<O = unknown>(fn: base.$CheckFn<O>, params?: $ZodCustomParams): schemas.$ZodCustom<O> {
  // if (typeof schemaOrFn === "function") {
  // const _params = rest[0];
  // const params = util.normalizeCheckParams(_params);

  return new schemas.$ZodCustom({
    type: "custom",
    check: "custom",
    fn,

    ...util.normalizeCheckParams(params),
  }) as any;
  // }

  // return base.clone(schemaOrFn, {
  //   ...schemaOrFn._def,
  //   checks: [
  //     ...(schemaOrFn._def.checks ?? []),
  //     ...(rest as any[]).map((ch) => (typeof ch === "function" ? { _check: ch, _def: { check: "custom" } } : ch)),
  //   ],
  // });
}

export function _custom<O = unknown, I = O>(
  fn: (data: O) => unknown,
  _params: string | $ZodCustomParamsWithPath | undefined,
  Class: util.Constructor<schemas.$ZodCustom, [schemas.$ZodCustomDef]>
): schemas.$ZodCustom<O, I> {
  const params = util.normalizeCheckParams(_params);
  params.path;

  return new Class({
    type: "custom",
    check: "custom",
    fn: fn
      ? (ctx) => {
          const input = ctx.value;
          const r = fn(input as any);
          if (r instanceof Promise) {
            return r.then((r) => {
              if (!r) {
                ctx.issues.push({
                  input,
                  code: "custom",
                  def: params,
                  path: params.path,
                });
              }
            });
          }
          if (!r) {
            ctx.issues.push({
              input,
              code: "custom",
              def: params,
              path: params.path,
            });
          }
          return;
        }
      : () => {},
    ...params,
  }) as any;
}

export function custom<O = unknown, I = O>(
  fn?: (data: O) => unknown,
  _params?: string | $ZodCustomParams
): schemas.$ZodCustom<O, I> {
  return _custom(fn ?? (() => true), _params, schemas.$ZodCustom);
}

//////////    INSTANCEOF     //////////

abstract class Class {
  constructor(..._args: any[]) {}
}
function _instanceof<T extends typeof Class>(
  cls: T,
  params: $ZodCustomParams = {
    error: `Input not instance of ${cls.name}`,
  }
): schemas.$ZodCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}
export { _instanceof as instanceof };

//////////    REFINES     //////////
export function issue(_iss: string, input: any, def: any): errors.$ZodRawIssue;
export function issue(_iss: errors.$ZodRawIssue): errors.$ZodRawIssue;
export function issue(...args: [string | errors.$ZodRawIssue, any?, any?]): errors.$ZodRawIssue {
  const [iss, input, def] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      def,
    };
  }

  return { ...iss };
}

function handleRefineResult(
  result: unknown,
  final: base.$ParsePayload,
  input: unknown,
  def: util.Normalize<$ZodCustomParamsWithPath>
): void {
  if (!result) {
    // check if result is falsy
    final.issues.push(
      issue({
        code: "custom",
        input,
        def, // incorporates params.error into issue reporting
        path: def.path, // incorporates params.error into issue reporting
        continue: !def.abort,
      })
    );
  }
}

export function refine<T>(
  fn: (arg: NoInfer<T>) => unknown,
  _params: string | $ZodCustomParamsWithPath = {}
): base.$ZodCheck<T> {
  const params = util.normalizeCheckParams(_params);
  return {
    _def: { check: "custom", error: params.error },
    _check(payload) {
      const result = fn(payload.value);
      if (result instanceof Promise) {
        return result.then((result) => {
          handleRefineResult(result, payload, payload.value, params);
        });
      }

      return handleRefineResult(result, payload, payload.value, params);
    },
  };
}

// export function mutate<T>()

////////    CHECKS   ////////
export type $ZodCheckLessThanParams = util.CheckParams<checks.$ZodCheckLessThan, "inclusive" | "value">;

// type $ZodCheckLessThanParams = util.CheckParams<checks.$ZodCheckLessThan>;
export function lt(
  value: util.Numeric,
  params?: string | $ZodCheckLessThanParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function lte(
  value: util.Numeric,
  params?: string | $ZodCheckLessThanParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",

    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}
export {
  /** @deprecated Use `z.lte()` instead. */
  lte as max,
};

export type $ZodCheckGreaterThanParams = util.CheckParams<checks.$ZodCheckGreaterThan, "inclusive" | "value">;

export function gt(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",

    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function gte(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}

export {
  /** @deprecated Use `z.gte()` instead. */
  gte as min,
};

// multipleOf
export type $ZodCheckMultipleOfParams = util.CheckParams<checks.$ZodCheckMultipleOf, "value">;
export function multipleOf(
  value: number | bigint,
  params?: string | $ZodCheckMultipleOfParams
): checks.$ZodCheckMultipleOf {
  return new checks.$ZodCheckMultipleOf({
    check: "multiple_of",

    ...util.normalizeCheckParams(params),
    value,
  });
}

// positive

export function positive(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return gt(0, params);
}

// negative
export function negative(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan {
  return lt(0, params);
}

// nonpositive
export function nonpositive(params?: string | $ZodCheckLessThanParams): checks.$ZodCheckLessThan {
  return lte(0, params);
}

// nonnegative
export function nonnegative(params?: string | $ZodCheckGreaterThanParams): checks.$ZodCheckGreaterThan {
  return gte(0, params);
}

/** z.number() only accepts finite values now */
// finite
// export type $ZodCheckFiniteParams = util.CheckParams<checks.$ZodCheckFinite>;
// export function finite(
//   params?: string | $ZodCheckFiniteParams
// ): checks.$ZodCheckFinite {
//   return new checks.$ZodCheckFinite({
//     check: "finite",
//     ...util.normalizeCheckParams(params),
//   });
// }
export type $ZodCheckMinSizeParams = util.CheckParams<checks.$ZodCheckMinSize, "minimum">;
export function minSize(
  minimum: number,
  params?: string | $ZodCheckMinSizeParams
): checks.$ZodCheckMinSize<util.HasSize> {
  return new checks.$ZodCheckMinSize({
    check: "min_size",
    ...util.normalizeCheckParams(params),
    minimum,
  });
}

export type $ZodCheckMaxSizeParams = util.CheckParams<checks.$ZodCheckMaxSize, "maximum">;

export function maxSize(
  maximum: number,
  params?: string | $ZodCheckMaxSizeParams
): checks.$ZodCheckMaxSize<util.HasSize> {
  return new checks.$ZodCheckMaxSize({
    check: "max_size",
    ...util.normalizeCheckParams(params),
    maximum,
  });
}
export type $ZodCheckSizeEqualsParams = util.CheckParams<checks.$ZodCheckSizeEquals, "size">;
export function size(
  size: number,
  params?: string | $ZodCheckSizeEqualsParams
): checks.$ZodCheckSizeEquals<util.HasSize> {
  return new checks.$ZodCheckSizeEquals({
    check: "size_equals",
    ...util.normalizeCheckParams(params),
    size,
  });
}

export type $ZodCheckMinLengthParams = util.CheckParams<checks.$ZodCheckMinLength, "minimum">;
export function minLength(
  minimum: number,
  params?: string | $ZodCheckMinLengthParams
): checks.$ZodCheckMinLength<util.HasLength> {
  return new checks.$ZodCheckMinLength({
    check: "min_length",
    ...util.normalizeCheckParams(params),
    minimum,
  });
}

export type $ZodCheckMaxLengthParams = util.CheckParams<checks.$ZodCheckMaxLength, "maximum">;

export function maxLength(
  maximum: number,
  params?: string | $ZodCheckMaxLengthParams
): checks.$ZodCheckMaxLength<util.HasLength> {
  return new checks.$ZodCheckMaxLength({
    check: "max_length",
    ...util.normalizeCheckParams(params),
    maximum,
  });
}
export type $ZodCheckLengthEqualsParams = util.CheckParams<checks.$ZodCheckLengthEquals, "length">;
export function length(
  length: number,
  params?: string | $ZodCheckLengthEqualsParams
): checks.$ZodCheckLengthEquals<util.HasLength> {
  return new checks.$ZodCheckLengthEquals({
    check: "length_equals",
    ...util.normalizeCheckParams(params),
    length,
  });
}

// export {
//   /** Identical to `minSize`. */
//   minSize as minLength,
//   /** Identical to `maxSize`. */
//   maxSize as maxLength,
//   /** Identical to `size`. */
//   size as length,
// };

export type $ZodCheckRegexParams = util.CheckParams<checks.$ZodCheckRegex, "format" | "pattern">;
export function regex(pattern: RegExp, params?: string | $ZodCheckRegexParams): checks.$ZodCheckRegex {
  return new checks.$ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...util.normalizeCheckParams(params),
    pattern,
  });
}

export type $ZodCheckIncludesParams = util.CheckParams<checks.$ZodCheckIncludes, "includes" | "format" | "pattern">;
export function includes(includes: string, params?: string | $ZodCheckIncludesParams): checks.$ZodCheckIncludes {
  return new checks.$ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...util.normalizeCheckParams(params),
    includes,
  });
}

export type $ZodCheckStartsWithParams = util.CheckParams<checks.$ZodCheckStartsWith, "prefix" | "format" | "pattern">;
export function startsWith(prefix: string, params?: string | $ZodCheckStartsWithParams): checks.$ZodCheckStartsWith {
  return new checks.$ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...util.normalizeCheckParams(params),
    prefix,
  });
}

export type $ZodCheckEndsWithParams = util.CheckParams<checks.$ZodCheckEndsWith, "suffix" | "format" | "pattern">;

export function endsWith(suffix: string, params?: string | $ZodCheckEndsWithParams): checks.$ZodCheckEndsWith {
  return new checks.$ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...util.normalizeCheckParams(params),
    suffix,
  });
}

export type $ZodCheckLowerCaseParams = util.CheckParams<checks.$ZodCheckLowerCase, "format">;

export function lowercase(params?: string | $ZodCheckLowerCaseParams): checks.$ZodCheckLowerCase {
  return new checks.$ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...util.normalizeCheckParams(params),
  });
}

export type $ZodCheckUpperCaseParams = util.CheckParams<checks.$ZodCheckUpperCase, "format">;

export function uppercase(params?: string | $ZodCheckUpperCaseParams): checks.$ZodCheckUpperCase {
  return new checks.$ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...util.normalizeCheckParams(params),
  });
}

export type $ZodCheckPropertyParams = util.CheckParams<checks.$ZodCheckProperty, "property" | "schema">;
export function property(
  property: string,
  schema: base.$ZodType,
  params?: string | $ZodCheckPropertyParams
): checks.$ZodCheckProperty {
  return new checks.$ZodCheckProperty({
    check: "property",
    property,
    schema,
    ...util.normalizeCheckParams(params),
  });
}

////////    TRANSFORMS   ////////
export function overwrite<T>(tx: (input: T) => T): checks.$ZodCheckOverwrite<T> {
  return new checks.$ZodCheckOverwrite({
    check: "overwrite",
    tx,
  }) as checks.$ZodCheckOverwrite<T>;
}

// normalize
export function normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.normalize(form));
}

// trim
export function trim(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.trim());
}
// toLowerCase
export function toLowerCase(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.toLowerCase());
}
// toUpperCase
export function toUpperCase(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.toUpperCase());
}

// export function namedRegistry<
//   T extends { name: string } = { name: string },
//   S extends base.$ZodType = base.$ZodType,
// >(): registries.$ZodNamedRegistry<T, S, {}> {
//   return new registries.$ZodNamedRegistry();
// }
