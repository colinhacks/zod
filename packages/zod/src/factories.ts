import * as util from "zod-core/util";
// import * as util from "../../zod-core/src/util.js";
import * as schemas from "./schemas.js";

type Factory = (...args: any[]) => any;

export const _string: Factory = util.factory(() => schemas.ZodString, {
  type: "string",
});

export const _guid: Factory = util.factory(() => schemas.ZodGUID, {
  type: "string",
  format: "guid",
  check: "string_format",
});

export const _uuid: Factory = util.factory(() => schemas.ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
});

export const _uuidv4: Factory = util.factory(() => schemas.ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  version: "v4",
});

export const _uuidv6: Factory = util.factory(() => schemas.ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  version: 6,
});

export const _uuidv7: Factory = util.factory(() => schemas.ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  version: 7,
});

export const _email: Factory = util.factory(() => schemas.ZodEmail, {
  type: "string",
  format: "email",
  check: "string_format",
});

export const _url: Factory = util.factory(() => schemas.ZodURL, {
  type: "string",
  format: "url",
  check: "string_format",
});

export const _emoji: Factory = util.factory(() => schemas.ZodEmoji, {
  type: "string",
  format: "emoji",
  check: "string_format",
});

export const _nanoid: Factory = util.factory(() => schemas.ZodNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
});

export const _cuid: Factory = util.factory(() => schemas.ZodCUID, {
  type: "string",
  format: "cuid",
  check: "string_format",
});

export const _cuid2: Factory = util.factory(() => schemas.ZodCUID2, {
  type: "string",
  format: "cuid2",
  check: "string_format",
});

export const _ulid: Factory = util.factory(() => schemas.ZodULID, {
  type: "string",
  format: "ulid",
  check: "string_format",
});

export const _xid: Factory = util.factory(() => schemas.ZodXID, {
  type: "string",
  format: "xid",
  check: "string_format",
});

export const _ksuid: Factory = util.factory(() => schemas.ZodKSUID, {
  type: "string",
  format: "ksuid",
  check: "string_format",
});

export const _ip: Factory = util.factory(() => schemas.ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
});

export const _ipv4: Factory = util.factory(() => schemas.ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  version: 4,
});

export const _ipv6: Factory = util.factory(() => schemas.ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  version: 6,
});

export const _base64: Factory = util.factory(() => schemas.ZodBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
});

export const _jsonString: Factory = util.factory(() => schemas.ZodJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
});

export const _e164: Factory = util.factory(() => schemas.ZodE164, {
  type: "string",
  format: "e164",
  check: "string_format",
});

export const _jwt: Factory = util.factory(() => schemas.ZodJWT, {
  type: "string",
  format: "jwt",
  check: "string_format",
});

export const _number: Factory = util.factory(() => schemas.ZodNumber, {
  type: "number",
});

export const _int: Factory = util.factory(() => schemas.ZodNumberFormat, {
  type: "number",
  check: "number_format",
  format: "safeint",
});

export const _float32: Factory = util.factory(() => schemas.ZodNumberFormat, {
  type: "number",
  check: "number_format",
  format: "float32",
});

export const _float64: Factory = util.factory(() => schemas.ZodNumberFormat, {
  type: "number",
  check: "number_format",
  format: "float64",
});

export const _int32: Factory = util.factory(() => schemas.ZodNumberFormat, {
  type: "number",
  check: "number_format",
  format: "int32",
});

export const _uint32: Factory = util.factory(() => schemas.ZodNumberFormat, {
  type: "number",
  check: "number_format",
  format: "uint32",
});

export const _int64: Factory = util.factory(() => schemas.ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  format: "int64",
});

export const _uint64: Factory = util.factory(() => schemas.ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  format: "uint64",
});

export const _boolean: Factory = util.factory(() => schemas.ZodBoolean, {
  type: "boolean",
});

export const _bigint: Factory = util.factory(() => schemas.ZodBigInt, {
  type: "bigint",
});

export const _symbol: Factory = util.factory(() => schemas.ZodSymbol, {
  type: "symbol",
});

export const _date: Factory = util.factory(() => schemas.ZodDate, {
  type: "date",
});

export const _undefinedFactory: Factory = util.factory(
  () => schemas.ZodUndefined,
  {
    type: "undefined",
  }
);

export const _nullFactory: Factory = util.factory(() => schemas.ZodNull, {
  type: "null",
});

export const _any: Factory = util.factory(() => schemas.ZodAny, {
  type: "any",
});

export const _unknown: Factory = util.factory(() => schemas.ZodUnknown, {
  type: "unknown",
});

export const _never: Factory = util.factory(() => schemas.ZodNever, {
  type: "never",
});

export const _voidFactory: Factory = util.factory(() => schemas.ZodVoid, {
  type: "void",
});
