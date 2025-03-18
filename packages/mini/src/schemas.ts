import * as core from "@zod/core";
import * as util from "@zod/core/util";

export * as coerce from "./coerce.js";
export * as iso from "./iso.js";

type SomeType = core.$ZodType;

export interface ZodMiniType<out O = unknown, out I = unknown> extends core.$ZodType<O, I> {
  check(...checks: (core.CheckFn<this["_zod"]["output"]> | core.$ZodCheck<this["_zod"]["output"]>)[]): this;
  clone(def?: this["_zod"]["def"]): this;
  register<R extends core.$ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [core.$ZodRegistry<R["_meta"], this>["_meta"]?]
        : [core.$ZodRegistry<R["_meta"], this>["_meta"]]
      : ["Incompatible schema"]
  ): this;
  brand<T extends PropertyKey = PropertyKey>(
    value?: T
  ): this & Record<"_zod", Record<"output", this["_zod"]["output"] & core.$brand<T>>>;
}
export const ZodMiniType: core.$constructor<ZodMiniType> = core.$constructor("ZodMiniType", (inst, def) => {
  if (!inst._zod) throw new Error("Uninitialized schema in mixin ZodMiniType.");

  core.$ZodType.init(inst, def);

  inst.check = (...checks) => {
    return inst.clone({
      ...def,
      checks: [
        ...(def.checks ?? []),
        ...checks.map((ch) => (typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" } } } : ch)),
      ],
    });
  };
  inst.clone = (_def) => core.clone(inst, _def ?? def);
  inst.brand = () => inst as any;
  inst.register = ((reg: any, meta: any) => {
    reg.add(inst, meta);
    return inst;
  }) as any;
});

// ZodMiniString
export interface ZodMiniString<Input = unknown> extends ZodMiniType {
  _zod: core.$ZodStringInternals<Input>;
}
export const ZodMiniString: core.$constructor<ZodMiniString> = core.$constructor("ZodMiniString", (inst, def) => {
  core.$ZodString.init(inst, def);
  ZodMiniType.init(inst, def);
});

// export type Z_odMiniStringParams = util.TypeParams<ZodMiniString<string>, "coerce">;
// const _string = util.factory(() => ZodMiniString, { type: "string" });
// export function string(checks?: core.$ZodCheck<string>[]): ZodMiniString<string>;
// export function string(params?: string | core.$ZodStringParams, checks?: core.$ZodCheck<string>[]): ZodMiniString<string>;
export function string(params?: string | core.$ZodStringParams): ZodMiniString<string> {
  return core._string(ZodMiniString, params) as any;
}

// ZodMiniStringFormat
export interface ZodMiniStringFormat<Format extends core.$ZodStringFormats = core.$ZodStringFormats>
  extends ZodMiniString {
  _zod: core.$ZodStringFormatInternals<Format>;
}
export const ZodMiniStringFormat: core.$constructor<ZodMiniStringFormat> = core.$constructor(
  "ZodMiniStringFormat",
  (inst, def) => {
    core.$ZodStringFormat.init(inst, def);
    ZodMiniString.init(inst, def);
  }
);

// ZodMiniEmail
export interface ZodMiniEmail extends ZodMiniStringFormat<"email"> {
  _zod: core.$ZodEmailInternals;
}
export const ZodMiniEmail: core.$constructor<ZodMiniEmail> = core.$constructor("ZodMiniEmail", (inst, def) => {
  core.$ZodEmail.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniEmailParams = util.StringFormatParams<ZodMiniEmail>;
// export type Z_odMiniCheckEmailParams = util.CheckStringFormatParams<ZodMiniEmail>;
const _email = util.factory(() => ZodMiniEmail, {
  type: "string",
  format: "email",
  check: "string_format",
  abort: false,
});
// export function email(checks?: core.$ZodCheck<string>[]): ZodMiniEmail;
// export function email(params?: string | core.$ZodEmailParams, checks?: core.$ZodCheck<string>[]): ZodMiniEmail;
export function email(params?: string | core.$ZodEmailParams): ZodMiniEmail {
  return core._email(ZodMiniEmail, params);
}

// ZodMiniGUID
export interface ZodMiniGUID extends ZodMiniStringFormat<"guid"> {
  _zod: core.$ZodGUIDInternals;
}
export const ZodMiniGUID: core.$constructor<ZodMiniGUID> = core.$constructor("ZodMiniGUID", (inst, def) => {
  core.$ZodGUID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniGUIDParams = util.StringFormatParams<core.$ZodGUID>;
// export type Z_odMiniCheckGUIDParams = util.CheckStringFormatParams<core.$ZodGUID>;
const _guid = util.factory(() => ZodMiniGUID, {
  type: "string",
  format: "guid",
  check: "string_format",
  abort: false,
});
// export function guid(checks?: core.$ZodCheck<string>[]): ZodMiniGUID;
// export function guid(params?: string | core.$ZodGUIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniGUID;
export function guid(params?: string | core.$ZodGUIDParams): ZodMiniGUID {
  return core._guid(ZodMiniGUID, params);
}

// ZodMiniUUID
export interface ZodMiniUUID extends ZodMiniStringFormat<"uuid"> {
  _zod: core.$ZodUUIDInternals;
}
export const ZodMiniUUID: core.$constructor<ZodMiniUUID> = core.$constructor("ZodMiniUUID", (inst, def) => {
  core.$ZodUUID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniUUIDParams = util.StringFormatParams<ZodMiniUUID, "pattern">;
// export type Z_odMiniCheckUUIDParams = util.CheckStringFormatParams<ZodMiniUUID, "pattern">;
const _uuid = util.factory(() => ZodMiniUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
});
// export function uuid(checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
// export function uuid(params?: string | core.$ZodUUIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
export function uuid(params?: string | core.$ZodUUIDParams): ZodMiniUUID {
  return core._uuid(ZodMiniUUID, params);
}

export type ZodMiniUUIDv4Params = util.StringFormatParams<ZodMiniUUID, "pattern">;
export type ZodMiniCheckUUIDv4Params = util.CheckStringFormatParams<ZodMiniUUID, "pattern">;
const _uuidv4 = util.factory(() => ZodMiniUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v4",
});
// export function uuidv4(checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
// export function uuidv4(params?: string | ZodMiniUUIDv4Params, checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
export function uuidv4(params?: string | ZodMiniUUIDv4Params): ZodMiniUUID {
  return core._uuidv4(ZodMiniUUID, params);
}

// ZodMiniUUIDv6
export type ZodMiniUUIDv6Params = util.StringFormatParams<ZodMiniUUID, "pattern">;
export type ZodMiniCheckUUIDv6Params = util.CheckStringFormatParams<ZodMiniUUID, "pattern">;
const _uuidv6 = util.factory(() => ZodMiniUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v6",
});
// export function uuidv6(checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
// export function uuidv6(params?: string | ZodMiniUUIDv6Params, checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
export function uuidv6(params?: string | ZodMiniUUIDv6Params): ZodMiniUUID {
  return core._uuidv6(ZodMiniUUID, params);
}

// ZodMiniUUIDv7
export type ZodMiniUUIDv7Params = util.StringFormatParams<ZodMiniUUID, "pattern">;
export type ZodMiniCheckUUIDv7Params = util.CheckStringFormatParams<ZodMiniUUID, "pattern">;
const _uuidv7 = util.factory(() => ZodMiniUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v7",
});
// export function uuidv7(checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
// export function uuidv7(params?: string | ZodMiniUUIDv7Params, checks?: core.$ZodCheck<string>[]): ZodMiniUUID;
export function uuidv7(params?: string | ZodMiniUUIDv7Params): ZodMiniUUID {
  return core._uuidv7(ZodMiniUUID, params);
}

// ZodMiniURL
export interface ZodMiniURL extends ZodMiniStringFormat<"url"> {
  _zod: core.$ZodURLInternals;
}
export const ZodMiniURL: core.$constructor<ZodMiniURL> = core.$constructor("ZodMiniURL", (inst, def) => {
  core.$ZodURL.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniURLParams = util.StringFormatParams<ZodMiniURL>;
// export type Z_odMiniCheckURLParams = util.CheckStringFormatParams<ZodMiniURL>;
const _url = util.factory(() => ZodMiniURL, {
  type: "string",
  format: "url",
  check: "string_format",
  abort: false,
});
// export function url(checks?: core.$ZodCheck<string>[]): ZodMiniURL;
// export function url(params?: string | core.$ZodURLParams, checks?: core.$ZodCheck<string>[]): ZodMiniURL;
export function url(params?: string | core.$ZodURLParams): ZodMiniURL {
  return core._url(ZodMiniURL, params);
}

// ZodMiniEmoji
export interface ZodMiniEmoji extends ZodMiniStringFormat<"emoji"> {
  _zod: core.$ZodEmojiInternals;
}
export const ZodMiniEmoji: core.$constructor<ZodMiniEmoji> = core.$constructor("ZodMiniEmoji", (inst, def) => {
  core.$ZodEmoji.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniEmojiParams = util.StringFormatParams<ZodMiniEmoji>;
// export type Z_odMiniCheckEmojiParams = util.CheckStringFormatParams<ZodMiniEmoji>;
const _emoji = util.factory(() => ZodMiniEmoji, {
  type: "string",
  format: "emoji",
  check: "string_format",
  abort: false,
});
// export function emoji(checks?: core.$ZodCheck<string>[]): ZodMiniEmoji;
// export function emoji(params?: string | core.$ZodEmojiParams, checks?: core.$ZodCheck<string>[]): ZodMiniEmoji;
export function emoji(params?: string | core.$ZodEmojiParams): ZodMiniEmoji {
  return core._emoji(ZodMiniEmoji, params);
}

// ZodMiniNanoID
export interface ZodMiniNanoID extends ZodMiniStringFormat<"nanoid"> {
  _zod: core.$ZodNanoIDInternals;
}
export const ZodMiniNanoID: core.$constructor<ZodMiniNanoID> = core.$constructor("ZodMiniNanoID", (inst, def) => {
  core.$ZodNanoID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniNanoIDParams = util.StringFormatParams<ZodMiniNanoID>;
// export type Z_odMiniCheckNanoIDParams = util.CheckStringFormatParams<ZodMiniNanoID>;
const _nanoid = util.factory(() => ZodMiniNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
  abort: false,
});
// export function nanoid(checks?: core.$ZodCheck<string>[]): ZodMiniNanoID;
// export function nanoid(params?: string | core.$ZodNanoIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniNanoID;
export function nanoid(params?: string | core.$ZodNanoIDParams): ZodMiniNanoID {
  return core._nanoid(ZodMiniNanoID, params);
}

// ZodMiniCUID
export interface ZodMiniCUID extends ZodMiniStringFormat<"cuid"> {
  _zod: core.$ZodCUIDInternals;
}
export const ZodMiniCUID: core.$constructor<ZodMiniCUID> = core.$constructor("ZodMiniCUID", (inst, def) => {
  core.$ZodCUID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniCUIDParams = util.StringFormatParams<ZodMiniCUID>;
// export type Z_odMiniCheckCUIDParams = util.CheckStringFormatParams<ZodMiniCUID>;
const _cuid = util.factory(() => ZodMiniCUID, {
  type: "string",
  format: "cuid",
  check: "string_format",
  abort: false,
});
// export function cuid(checks?: core.$ZodCheck<string>[]): ZodMiniCUID;
// export function cuid(params?: string | core.$ZodCUIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniCUID;
export function cuid(params?: string | core.$ZodCUIDParams): ZodMiniCUID {
  return core._cuid(ZodMiniCUID, params);
}

// ZodMiniCUID2
export interface ZodMiniCUID2 extends ZodMiniStringFormat<"cuid2"> {
  _zod: core.$ZodCUID2Internals;
}
export const ZodMiniCUID2: core.$constructor<ZodMiniCUID2> = core.$constructor("ZodMiniCUID2", (inst, def) => {
  core.$ZodCUID2.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
export type ZodMiniCUID2Params = util.StringFormatParams<ZodMiniCUID2>;
export type ZodMiniCheckCUID2Params = util.CheckStringFormatParams<ZodMiniCUID2>;
const _cuid2 = util.factory(() => ZodMiniCUID2, {
  type: "string",
  format: "cuid2",
  check: "string_format",
  abort: false,
});
// export function cuid2(checks?: core.$ZodCheck<string>[]): ZodMiniCUID2;
// export function cuid2(params?: string | ZodMiniCUID2Params, checks?: core.$ZodCheck<string>[]): ZodMiniCUID2;
export function cuid2(params?: string | ZodMiniCUID2Params): ZodMiniCUID2 {
  return core._cuid2(ZodMiniCUID2, params);
}

// ZodMiniULID
export interface ZodMiniULID extends ZodMiniStringFormat<"ulid"> {
  _zod: core.$ZodULIDInternals;
}
export const ZodMiniULID: core.$constructor<ZodMiniULID> = core.$constructor("ZodMiniULID", (inst, def) => {
  core.$ZodULID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniULIDParams = util.StringFormatParams<ZodMiniULID>;
// export type Z_odMiniCheckULIDParams = util.CheckStringFormatParams<ZodMiniULID>;
const _ulid = util.factory(() => ZodMiniULID, {
  type: "string",
  format: "ulid",
  check: "string_format",
  abort: false,
});
// export function ulid(checks?: core.$ZodCheck<string>[]): ZodMiniULID;
// export function ulid(params?: string | core.$ZodULIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniULID;
export function ulid(params?: string | core.$ZodULIDParams): ZodMiniULID {
  return core._ulid(ZodMiniULID, params);
}

// ZodMiniXID
export interface ZodMiniXID extends ZodMiniStringFormat<"xid"> {
  _zod: core.$ZodXIDInternals;
}
export const ZodMiniXID: core.$constructor<ZodMiniXID> = core.$constructor("ZodMiniXID", (inst, def) => {
  core.$ZodXID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});

// export type Z_odMiniXIDParams = util.StringFormatParams<ZodMiniXID>;
// export type Z_odMiniCheckXIDParams = util.CheckStringFormatParams<ZodMiniXID>;
const _xid = util.factory(() => ZodMiniXID, {
  type: "string",
  format: "xid",
  check: "string_format",
  abort: false,
});
// export function xid(checks?: core.$ZodCheck<string>[]): ZodMiniXID;
// export function xid(params?: string | core.$ZodXIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniXID;
export function xid(params?: string | core.$ZodXIDParams): ZodMiniXID {
  return core._xid(ZodMiniXID, params);
}

// ZodMiniKSUID
export interface ZodMiniKSUID extends ZodMiniStringFormat<"ksuid"> {
  _zod: core.$ZodKSUIDInternals;
}
export const ZodMiniKSUID: core.$constructor<ZodMiniKSUID> = core.$constructor("ZodMiniKSUID", (inst, def) => {
  core.$ZodKSUID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniKSUIDParams = util.StringFormatParams<ZodMiniKSUID>;
// export type Z_odMiniCheckKSUIDParams = util.CheckStringFormatParams<ZodMiniKSUID>;
const _ksuid = util.factory(() => ZodMiniKSUID, {
  type: "string",
  format: "ksuid",
  check: "string_format",
  abort: false,
});
// export function ksuid(checks?: core.$ZodCheck<string>[]): ZodMiniKSUID;
// export function ksuid(params?: string | core.$ZodKSUIDParams, checks?: core.$ZodCheck<string>[]): ZodMiniKSUID;
export function ksuid(params?: string | core.$ZodKSUIDParams): ZodMiniKSUID {
  return core._ksuid(ZodMiniKSUID, params);
}

// ZodMiniIP
export interface ZodMiniIP extends ZodMiniStringFormat<"ip"> {
  _zod: core.$ZodIPInternals;
}
export const ZodMiniIP: core.$constructor<ZodMiniIP> = core.$constructor("ZodMiniIP", (inst, def) => {
  core.$ZodIP.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniIPParams = util.StringFormatParams<ZodMiniIP>;
// export type Z_odMiniCheckIPParams = util.CheckStringFormatParams<ZodMiniIP>;
const _ip = util.factory(() => ZodMiniIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
});
// export function ip(checks?: core.$ZodCheck<string>[]): ZodMiniIP;
// export function ip(params?: string | core.$ZodIPParams, checks?: core.$ZodCheck<string>[]): ZodMiniIP;
export function ip(params?: string | core.$ZodIPParams): ZodMiniIP {
  return core._ip(ZodMiniIP, params);
}

// ZodMiniIPv4
export type ZodMiniIPv4Params = util.StringFormatParams<ZodMiniIP>;
export type ZodMiniCheckIPv4Params = util.CheckStringFormatParams<ZodMiniIP>;
const _ipv4 = util.factory(() => ZodMiniIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v4",
});
// export function ipv4(checks?: core.$ZodCheck<string>[]): ZodMiniIP;
// export function ipv4(params?: string | ZodMiniIPv4Params, checks?: core.$ZodCheck<string>[]): ZodMiniIP;
export function ipv4(params?: string | ZodMiniIPv4Params): ZodMiniIP {
  return core._ipv4(ZodMiniIP, params);
}

// ZodMiniIPv6
export type ZodMiniIPv6Params = util.StringFormatParams<ZodMiniIP>;
export type ZodMiniCheckIPv6Params = util.CheckStringFormatParams<ZodMiniIP>;
const _ipv6 = util.factory(() => ZodMiniIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v6",
});
// export function ipv6(checks?: core.$ZodCheck<string>[]): ZodMiniIP;
// export function ipv6(params?: string | ZodMiniIPv6Params, checks?: core.$ZodCheck<string>[]): ZodMiniIP;
export function ipv6(params?: string | ZodMiniIPv6Params): ZodMiniIP {
  return core._ipv6(ZodMiniIP, params);
}

// ZodMiniBase64
export interface ZodMiniBase64 extends ZodMiniStringFormat<"base64"> {
  _zod: core.$ZodBase64Internals;
}
export const ZodMiniBase64: core.$constructor<ZodMiniBase64> = core.$constructor("ZodMiniBase64", (inst, def) => {
  core.$ZodBase64.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});

export type ZodMiniBase64Params = util.StringFormatParams<ZodMiniBase64>;
export type ZodMiniCheckBase64Params = util.CheckStringFormatParams<ZodMiniBase64>;
const _base64 = util.factory(() => ZodMiniBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
  abort: false,
});
// export function base64(checks?: core.$ZodCheck<string>[]): ZodMiniBase64;
// export function base64(params?: string | ZodMiniBase64Params, checks?: core.$ZodCheck<string>[]): ZodMiniBase64;
export function base64(params?: string | ZodMiniBase64Params): ZodMiniBase64 {
  return core._base64(ZodMiniBase64, params);
}

// ZodMiniE164
export interface ZodMiniE164 extends ZodMiniStringFormat<"e164"> {
  _zod: core.$ZodE164Internals;
}
export const ZodMiniE164: core.$constructor<ZodMiniE164> = core.$constructor("ZodMiniE164", (inst, def) => {
  core.$ZodE164.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
export type ZodMiniE164Params = util.StringFormatParams<ZodMiniE164>;
export type ZodMiniCheckE164Params = util.CheckStringFormatParams<ZodMiniE164>;
const _e164 = util.factory(() => ZodMiniE164, {
  type: "string",
  format: "e164",
  check: "string_format",
  abort: false,
});
// export function e164(checks?: core.$ZodCheck<string>[]): ZodMiniE164;
// export function e164(params?: string | ZodMiniE164Params, checks?: core.$ZodCheck<string>[]): ZodMiniE164;
export function e164(params?: string | ZodMiniE164Params): ZodMiniE164 {
  return core._e164(ZodMiniE164, params);
}

// ZodMiniJWT
export interface ZodMiniJWT extends ZodMiniStringFormat<"jwt"> {
  _zod: core.$ZodJWTInternals;
}
export const ZodMiniJWT: core.$constructor<ZodMiniJWT> = core.$constructor("ZodMiniJWT", (inst, def) => {
  core.$ZodJWT.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});
// export type Z_odMiniJWTParams = util.StringFormatParams<ZodMiniJWT, "pattern">;
// export type Z_odMiniCheckJWTParams = util.CheckStringFormatParams<ZodMiniJWT, "pattern">;
// const _jwt = util.factory(() => ZodMiniJWT, {
//   type: "string",
//   format: "jwt",
//   check: "string_format",
//   abort: false,
// });
// export function jwt(checks?: core.$ZodCheck<string>[]): ZodMiniJWT;
// export function jwt(params?: string | core.$ZodJWTParams, checks?: core.$ZodCheck<string>[]): ZodMiniJWT;
export function jwt(params?: string | core.$ZodJWTParams): ZodMiniJWT {
  return core._jwt(ZodMiniJWT, params);
}

// ZodMiniNumber
export interface ZodMiniNumber<Input = unknown> extends ZodMiniType {
  _zod: core.$ZodNumberInternals<Input>;
}
export const ZodMiniNumber: core.$constructor<ZodMiniNumber> = core.$constructor("ZodMiniNumber", (inst, def) => {
  core.$ZodNumber.init(inst, def);
  ZodMiniType.init(inst, def);
});
const _number = util.factory(() => ZodMiniNumber, { type: "number" });
// export type Z_odMiniNumberParams = util.TypeParams<ZodMiniNumber<number>, "coerce">;
// export function number(checks?: core.$ZodCheck<number>[]): ZodMiniNumber<number>;
// export function number(params?: string | core.$ZodNumberParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumber<number>;
export function number(params?: string | core.$ZodNumberParams): ZodMiniNumber<number> {
  return core._number(ZodMiniNumber, params) as any;
}

// ZodMiniNumberFormat
export interface ZodMiniNumberFormat extends ZodMiniNumber {
  _zod: core.$ZodNumberFormatInternals;
}
export const ZodMiniNumberFormat: core.$constructor<ZodMiniNumberFormat> = core.$constructor(
  "ZodMiniNumberFormat",
  (inst, def) => {
    core.$ZodNumberFormat.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniNumberFormatParams = util.CheckTypeParams<ZodMiniNumberFormat, "format" | "coerce">;
// export type Z_odMiniCheckNumberFormatParams = util.CheckParams<core.$ZodCheckNumberFormat, "format">;

// int
const _int = util.factory(() => ZodMiniNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "safeint",
});
// export function int(checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
// export function int(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
export function int(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._int(ZodMiniNumberFormat, params);
}

// float32
const _float32 = util.factory(() => ZodMiniNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float32",
});
// export function float32(checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
// export function float32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
export function float32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._float32(ZodMiniNumberFormat, params);
}

// float64
const _float64 = util.factory(() => ZodMiniNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float64",
});
// export function float64(checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
// export function float64(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
export function float64(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._float64(ZodMiniNumberFormat, params);
}

// int32
const _int32 = util.factory(() => ZodMiniNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "int32",
});
// export function int32(checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
// export function int32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
export function int32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._int32(ZodMiniNumberFormat, params);
}

// uint32
const _uint32 = util.factory(() => ZodMiniNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "uint32",
});
// export function uint32(checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
// export function uint32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodMiniNumberFormat;
export function uint32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._uint32(ZodMiniNumberFormat, params);
}

// ZodMiniBoolean
export interface ZodMiniBoolean<T = unknown> extends ZodMiniType {
  _zod: core.$ZodBooleanInternals<T>;
}
export const ZodMiniBoolean: core.$constructor<ZodMiniBoolean> = core.$constructor("ZodMiniBoolean", (inst, def) => {
  core.$ZodBoolean.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniBooleanParams = util.TypeParams<ZodMiniBoolean<boolean>, "coerce">;
const _boolean = util.factory(() => ZodMiniBoolean, {
  type: "boolean",
}) as any;
// export function boolean(checks?: core.$ZodCheck<boolean>[]): ZodMiniBoolean<boolean>;
// export function boolean(params?: string | core.$ZodBooleanParams, checks?: core.$ZodCheck<boolean>[]): ZodMiniBoolean<boolean>;
export function boolean(params?: string | core.$ZodBooleanParams): ZodMiniBoolean<boolean> {
  return core._boolean(ZodMiniBoolean, params) as any;
}

// ZodMiniBigInt
export interface ZodMiniBigInt<T = unknown> extends ZodMiniType {
  _zod: core.$ZodBigIntInternals<T>;
}
export const ZodMiniBigInt: core.$constructor<ZodMiniBigInt> = core.$constructor("ZodMiniBigInt", (inst, def) => {
  core.$ZodBigInt.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniBigIntParams = util.TypeParams<ZodMiniBigInt<bigint>>;
const _bigint = util.factory(() => ZodMiniBigInt, {
  type: "bigint",
}) as any;
// export function bigint(checks?: core.$ZodCheck<bigint>[]): ZodMiniBigInt<bigint>;
// export function bigint(params?: string | core.$ZodBigIntParams, checks?: core.$ZodCheck<bigint>[]): ZodMiniBigInt<bigint>;
export function bigint(params?: string | core.$ZodBigIntParams): ZodMiniBigInt<bigint> {
  return core._bigint(ZodMiniBigInt, params) as any;
}
// bigint formats
// export type Z_odMiniBigIntFormatParams = util.CheckTypeParams<ZodMiniBigIntFormat, "format" | "coerce">;
// export type Z_odMiniCheckBigIntFormatParams = util.CheckParams<core.$ZodCheckBigIntFormat, "format">;

// ZodMiniBigIntFormat
export interface ZodMiniBigIntFormat extends ZodMiniType {
  _zod: core.$ZodBigIntFormatInternals;
}
export const ZodMiniBigIntFormat: core.$constructor<ZodMiniBigIntFormat> = core.$constructor(
  "ZodMiniBigIntFormat",
  (inst, def) => {
    core.$ZodBigIntFormat.init(inst, def);
    ZodMiniBigInt.init(inst, def);
  }
);

// int64
const _int64 = util.factory(() => ZodMiniBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "int64",
});
// export function int64(checks?: core.$ZodCheck<bigint | number>[]): ZodMiniBigIntFormat;
// export function int64(params?: string | core.$ZodBigIntFormatParams, checks?: core.$ZodCheck<bigint | number>[]): ZodMiniBigIntFormat;
export function int64(params?: string | core.$ZodBigIntFormatParams): ZodMiniBigIntFormat {
  return core._int64(ZodMiniBigIntFormat, params);
}

// uint64
const _uint64 = util.factory(() => ZodMiniBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "uint64",
});
// export function uint64(checks?: core.$ZodCheck<bigint>[]): ZodMiniBigIntFormat;
// export function uint64(params?: string | core.$ZodBigIntFormatParams, checks?: core.$ZodCheck<bigint>[]): ZodMiniBigIntFormat;
export function uint64(params?: string | core.$ZodBigIntFormatParams): ZodMiniBigIntFormat {
  return core._uint64(ZodMiniBigIntFormat, params);
}

// ZodMiniSymbol
export interface ZodMiniSymbol extends ZodMiniType {
  _zod: core.$ZodSymbolInternals;
}
export const ZodMiniSymbol: core.$constructor<ZodMiniSymbol> = core.$constructor("ZodMiniSymbol", (inst, def) => {
  core.$ZodSymbol.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniSymbolParams = util.TypeParams<ZodMiniSymbol>;
const _symbol = util.factory(() => ZodMiniSymbol, {
  type: "symbol",
}) as any;
// export function symbol(checks?: core.$ZodCheck<symbol>[]): ZodMiniSymbol;
// export function symbol(params?: string | core.$ZodSymbolParams, checks?: core.$ZodCheck<symbol>[]): ZodMiniSymbol;
export function symbol(params?: string | core.$ZodSymbolParams): ZodMiniSymbol {
  return core._symbol(ZodMiniSymbol, params) as any;
}

// ZodMiniUndefined
export interface ZodMiniUndefined extends ZodMiniType {
  _zod: core.$ZodUndefinedInternals;
}
export const ZodMiniUndefined: core.$constructor<ZodMiniUndefined> = core.$constructor(
  "ZodMiniUndefined",
  (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniUndefinedParams = util.TypeParams<ZodMiniUndefined>;
const _undefinedFactory = util.factory(() => ZodMiniUndefined, {
  type: "undefined",
});
// function _undefined(checks?: core.$ZodCheck<undefined>[]): ZodMiniUndefined;
// function _undefined(params?: string | core.$ZodUndefinedParams, checks?: core.$ZodCheck<undefined>[]): ZodMiniUndefined;
function _undefined(params?: string | core.$ZodUndefinedParams): ZodMiniUndefined {
  return core._undefined(ZodMiniUndefined, params) as any;
}
export { _undefined as undefined };

// ZodMiniNull
export interface ZodMiniNull extends ZodMiniType {
  _zod: core.$ZodNullInternals;
}
export const ZodMiniNull: core.$constructor<ZodMiniNull> = core.$constructor("ZodMiniNull", (inst, def) => {
  core.$ZodNull.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniNullParams = util.TypeParams<ZodMiniNull>;
const _nullFactory = util.factory(() => ZodMiniNull, { type: "null" });
// function _null(checks?: core.$ZodCheck<null>[]): ZodMiniNull;
// function _null(params?: string | core.$ZodNullParams, checks?: core.$ZodCheck<null>[]): ZodMiniNull;
function _null(params?: string | core.$ZodNullParams): ZodMiniNull {
  return core._null(ZodMiniNull, params) as any;
}
export { _null as null };

// ZodMiniAny
export interface ZodMiniAny extends ZodMiniType {
  _zod: core.$ZodAnyInternals;
}
export const ZodMiniAny: core.$constructor<ZodMiniAny> = core.$constructor("ZodMiniAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniAnyParams = util.TypeParams<ZodMiniAny>;
const _any = util.factory(() => ZodMiniAny, { type: "any" });
// export function any(checks?: core.$ZodCheck<any>[]): ZodMiniAny;
// export function any(params?: string | core.$ZodAnyParams, checks?: core.$ZodCheck<any>[]): ZodMiniAny;
export function any(params?: string | core.$ZodAnyParams): ZodMiniAny {
  return core._any(ZodMiniAny, params) as any;
}

// ZodMiniUnknown
export interface ZodMiniUnknown extends ZodMiniType {
  _zod: core.$ZodUnknownInternals;
}
export const ZodMiniUnknown: core.$constructor<ZodMiniUnknown> = core.$constructor("ZodMiniUnknown", (inst, def) => {
  core.$ZodUnknown.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniUnknownParams = util.TypeParams<ZodMiniUnknown>;
const _unknown = util.factory(() => ZodMiniUnknown, { type: "unknown" });
// export function unknown(checks?: core.$ZodCheck<unknown>[]): ZodMiniUnknown;
// export function unknown(params?: string | core.$ZodUnknownParams, checks?: core.$ZodCheck<unknown>[]): ZodMiniUnknown;
export function unknown(params?: string | core.$ZodUnknownParams): ZodMiniUnknown {
  return core._unknown(ZodMiniUnknown, params) as any;
}

// ZodMiniNever
export interface ZodMiniNever extends ZodMiniType {
  _zod: core.$ZodNeverInternals;
}
export const ZodMiniNever: core.$constructor<ZodMiniNever> = core.$constructor("ZodMiniNever", (inst, def) => {
  core.$ZodNever.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniNeverParams = util.TypeParams<ZodMiniNever>;
const _never = util.factory(() => ZodMiniNever, { type: "never" });
// export function never(checks?: core.$ZodCheck<never>[]): ZodMiniNever;
// export function never(params?: string | core.$ZodNeverParams, checks?: core.$ZodCheck<never>[]): ZodMiniNever;
export function never(params?: string | core.$ZodNeverParams): ZodMiniNever {
  return core._never(ZodMiniNever, params) as any;
}

// ZodMiniVoid
export interface ZodMiniVoid extends ZodMiniType {
  _zod: core.$ZodVoidInternals;
}
export const ZodMiniVoid: core.$constructor<ZodMiniVoid> = core.$constructor("ZodMiniVoid", (inst, def) => {
  core.$ZodVoid.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniVoidParams = util.TypeParams<ZodMiniVoid>;
const _voidFactory = util.factory(() => ZodMiniVoid, { type: "void" });
// function _void(checks?: core.$ZodCheck<void>[]): ZodMiniVoid;
// function _void(params?: string | core.$ZodVoidParams, checks?: core.$ZodCheck<void>[]): ZodMiniVoid;
function _void(params?: string | core.$ZodVoidParams): ZodMiniVoid {
  return core._void(ZodMiniVoid, params) as any;
}
export { _void as void };

// ZodMiniDate
export interface ZodMiniDate<T = unknown> extends ZodMiniType {
  _zod: core.$ZodDateInternals<T>;
}
export const ZodMiniDate: core.$constructor<ZodMiniDate> = core.$constructor("ZodMiniDate", (inst, def) => {
  core.$ZodDate.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniDateParams = util.TypeParams<ZodMiniDate, "coerce">;
const _date = util.factory(() => ZodMiniDate, { type: "date" });
// export function date(checks?: core.$ZodCheck<Date>[]): ZodMiniDate;
// export function date(params?: string | core.$ZodDateParams, checks?: core.$ZodCheck<Date>[]): ZodMiniDate;
export function date(params?: string | core.$ZodDateParams): ZodMiniDate {
  return core._date(ZodMiniDate, params) as any;
}

// ZodMiniArray
export interface ZodMiniArray<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodArrayInternals<T>;
}
export const ZodMiniArray: core.$constructor<ZodMiniArray> = core.$constructor("ZodMiniArray", (inst, def) => {
  core.$ZodArray.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniArrayParams = util.TypeParams<ZodMiniArray, "element">;

export function array<T extends SomeType>(element: T, params?: core.$ZodArrayParams): ZodMiniArray<T>;
export function array<T extends SomeType>(element: SomeType, params?: any): ZodMiniArray<T> {
  return new ZodMiniArray({
    type: "array",
    get element() {
      return element;
    },
    ...util.normalizeParams(params),
  }) as ZodMiniArray<T>;
}

// ZodMiniObjectLike
export interface ZodMiniObjectLike<out O = object, out I = object> extends ZodMiniType {
  _zod: core.$ZodObjectLikeInternals<O, I>;
}
export const ZodMiniObjectLike: core.$constructor<ZodMiniObjectLike> = core.$constructor(
  "ZodMiniObjectLike",
  (inst, def) => {
    core.$ZodObjectLike.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniObjectLikeParams = util.TypeParams<ZodMiniObjectLike, "shape" | "catchall">;

// .keyof
export function keyof<T extends ZodMiniObject>(schema: T): ZodMiniLiteral<keyof T["_zod"]["shape"]>;
export function keyof<T extends ZodMiniInterface>(schema: T): ZodMiniLiteral<keyof T["_zod"]["output"]>;
export function keyof(schema: ZodMiniObjectLike) {
  const shape =
    schema._zod.def.type === "interface"
      ? util.cleanInterfaceShape(schema._zod.def.shape).shape
      : schema._zod.def.shape;

  return literal(Object.keys(shape)) as any;
}

// ZodMiniInterface
export interface ZodMiniInterface<
  Shape extends core.$ZodLooseShape = core.$ZodLooseShape,
  Params extends core.$ZodInterfaceNamedParams = {
    optional: string & keyof Shape;
    defaulted: string & keyof Shape;
    extra: {};
  },
> extends ZodMiniType {
  _zod: core.$ZodInterfaceInternals<Shape, Params>;
}
export const ZodMiniInterface: core.$constructor<ZodMiniInterface> = core.$constructor(
  "ZodMiniInterface",
  (inst, def) => {
    core.$ZodInterface.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniInterfaceParams = util.TypeParams<ZodMiniInterface, "shape">;
function _interface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams,
  Class: util.Constructor<ZodMiniInterface> = ZodMiniInterface
): ZodMiniInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: core.$ZodInterfaceDef = {
    type: "interface",
    get shape() {
      return cleaned.value.shape;
    },
    get optional() {
      return cleaned.value.optional;
    },
    ...util.normalizeParams(params),
  };
  return new Class(def) as any;
}
export { _interface as interface };

// strictInterface
// export type Z_odMiniStrictInterfaceParams = util.TypeParams<ZodMiniObjectLike, "shape" | "catchall">;
export function strictInterface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams
): ZodMiniInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: core.$ZodInterfaceDef = {
    type: "interface",
    get shape() {
      return cleaned.value.shape;
    },
    get optional() {
      return cleaned.value.optional;
    },
    catchall: never(),
    ...util.normalizeParams(params),
  };
  return new ZodMiniInterface(def) as any;
}

// looseInterface
// export type Z_odMiniLooseInterfaceParams = util.TypeParams<ZodMiniObjectLike, "shape" | "catchall">;
export function looseInterface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams
): ZodMiniInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, Record<string, unknown>>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: core.$ZodInterfaceDef = {
    type: "interface",
    get optional() {
      return cleaned.value.optional;
    },
    get shape() {
      return cleaned.value.shape;
    },
    catchall: unknown(),
    ...util.normalizeParams(params),
  };
  return new ZodMiniInterface(def) as any;
}

// ZodMiniObject
export interface ZodMiniObject<
  Shape extends core.$ZodShape = core.$ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends ZodMiniType {
  _zod: core.$ZodObjectInternals<Shape, Extra>;
}
export const ZodMiniObject: core.$constructor<ZodMiniObject> = core.$constructor("ZodMiniObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodMiniType.init(inst, def);
});
export function object<T extends core.$ZodShape = Record<never, SomeType>>(
  shape?: T,
  params?: core.$ZodObjectLikeParams
): ZodMiniObject<T, {}> {
  const def: core.$ZodObjectDef = {
    type: "object",
    shape: shape ?? {},
    get optional() {
      return util.optionalObjectKeys(shape ?? {});
    },
    ...util.normalizeParams(params),
  };
  return new ZodMiniObject(def) as any;
}

// strictObject
// export type Z_odMiniStrictObjectParams = util.TypeParams<ZodMiniObjectLike, "shape" | "catchall">;
export function strictObject<T extends core.$ZodShape>(shape: T, params?: core.$ZodObjectParams): ZodMiniObject<T, {}> {
  return new ZodMiniObject({
    type: "object",
    shape: shape as core.$ZodShape,
    get optional() {
      return util.optionalObjectKeys(shape);
    },
    catchall: never(),
    ...util.normalizeParams(params),
  }) as any;
}

// looseObject
// export type Z_odMiniLooseObjectParams = util.TypeParams<ZodMiniObjectLike, "shape" | "catchall">;
export function looseObject<T extends core.$ZodShape>(
  shape: T,
  params?: core.$ZodObjectParams
): ZodMiniObject<T, { [k: string]: unknown }> {
  return new ZodMiniObject({
    type: "object",
    shape: shape as core.$ZodShape,
    get optional() {
      return util.optionalObjectKeys(shape);
    },
    catchall: unknown(),
    ...util.normalizeParams(params),
  }) as any;
}

// object methods
export function extend<T extends ZodMiniInterface, U extends ZodMiniInterface>(
  a: T,
  b: U
): ZodMiniInterface<util.ExtendShape<T["_zod"]["shape"], U["_zod"]["shape"]>, util.MergeInterfaceParams<T, U>>;
export function extend<T extends ZodMiniObject, U extends ZodMiniObject>(
  a: T,
  b: U
): ZodMiniObject<util.ExtendObject<T["_zod"]["shape"], U["_zod"]["shape"]>, U["_zod"]["extra"] & T["_zod"]["extra"]>;
// export function extend<T extends ZodMiniObjectLike, U extends core.$ZodLooseShape>(
//   schema: T,
//   shape: U
// ): T extends { _zod: { def: { type: "interface" } } } ? ZodMiniInterface<util.ExtendInterfaceShape<T["_zod"]["shape"], U>, util.ExtendInterfaceParams<T, U>> : ZodMiniObject<util.ExtendObject<T["_zod"]["shape"], U>, T["_zod"]["extra"]>;
export function extend<T extends ZodMiniInterface, U extends core.$ZodLooseShape>(
  a: T,
  b: U
): ZodMiniInterface<util.ExtendInterfaceShape<T["_zod"]["shape"], U>, util.ExtendInterfaceParams<T, U>>;
export function extend<T extends ZodMiniObject, U extends core.$ZodLooseShape>(
  a: T,
  b: U
): ZodMiniObject<util.ExtendObject<T["_zod"]["shape"], U>, T["_zod"]["extra"]>;
export function extend(schema: ZodMiniObjectLike, shape: any): ZodMiniObjectLike {
  // console.log({ schema, shape });
  if (shape instanceof core.$ZodType) return util.mergeObjectLike(schema, shape as any);
  if (schema instanceof ZodMiniInterface) {
    return util.mergeObjectLike(schema, _interface(shape));
  }
  if (schema instanceof ZodMiniObject) return util.mergeObjectLike(schema, object(shape));
  return util.extend(schema, shape);
}

export function merge<T extends ZodMiniObjectLike, U extends core.$ZodLooseShape>(
  schema: T,
  shape: U
): T["_zod"]["def"]["type"] extends "interface"
  ? // T extends ZodMiniInterface
    ZodMiniInterface<
      util.ExtendShape<T["_zod"]["shape"], U["_zod"]["shape"]>,
      {
        extra: T["_zod"]["extra"] & U["_zod"]["extra"];
        optional: Exclude<T["_zod"]["optional"], keyof U["_zod"]["shape"]> | U["_zod"]["optional"];
        defaulted: Exclude<T["_zod"]["defaulted"], keyof U["_zod"]["shape"]> | U["_zod"]["defaulted"];
      }
    >
  : ZodMiniObject<util.ExtendObject<T["_zod"]["shape"], U>, T["_zod"]["extra"]>;
export function merge(a: ZodMiniObjectLike, b: ZodMiniObjectLike): ZodMiniObjectLike {
  return util.mergeObjectLike(a, b);
}

// .merge
// export function merge<T extends ZodMiniObjectLike, U extends ZodMiniObjectLike>(
//   base: T,
//   incoming: U
// ): ZodMiniObjectLike<T['_zod']["shape"] & U['_zod']["shape"]> {
//   return incoming.$clone({
//     ...incoming._zod.def, // incoming overrides properties on base
//     shape: { ...core._zod.def.shape, ...incoming._zod.def.shape },
//     checks: [],
//   }) as any;
// }

// .pick
// export function pick<T extends ZodMiniObject, M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>>(
//   schema: T,
//   mask: M
// ): ZodMiniObject<util.Flatten<Pick<T['_zod']["shape"], Extract<keyof T['_zod']["shape"], keyof M>>>>;
// export function pick<
//   T extends ZodMiniInterface,
//   const M extends util.Exactly<util.Mask<keyof NoInfer<T>['_zod']["shape"]>, M>,
// >(schema: T, mask: M): ZodMiniInterface<Pick<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
// export function pick(schema: ZodMiniObjectLike, mask: object) {
//   return util.pick(schema, mask);
// }

// .pick
export function pick<T extends ZodMiniObjectLike, M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.Flatten<Pick<T["_zod"]["shape"], keyof T["_zod"]["shape"] & keyof M>>,
      {
        optional: Extract<T["_zod"]["optional"], keyof M>;
        defaulted: Extract<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<util.Flatten<Pick<T["_zod"]["shape"], keyof T["_zod"]["shape"] & keyof M>>, T["_zod"]["extra"]>;
export function pick(schema: ZodMiniObjectLike, mask: object) {
  return util.pick(schema, mask);
  // const picked = util.pick(schema, mask);
  // return schema.clone({
  //   ...schema._zod.def,
  //   ...picked,
  // });
}

// .omit
export function omit<T extends ZodMiniObjectLike, const M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.Flatten<Omit<T["_zod"]["shape"], keyof M>>,
      {
        optional: Exclude<T["_zod"]["optional"], keyof M>;
        defaulted: Exclude<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<util.Flatten<Omit<T["_zod"]["shape"], keyof M>>, T["_zod"]["extra"]>;
// export function omit<
//   T extends ZodMiniInterface,
//   M extends util.Exactly<util.Mask<keyof T['_zod']["output"]>, M>,
// >(
//   schema: T,
//   mask: M
// ): ZodMiniInterface<
//   Omit<T['_zod']["output"], Extract<keyof T['_zod']["output"], keyof M>>,
//   Omit<T['_zod']["input"], Extract<keyof T['_zod']["input"], keyof M>>
// >;
// export function omit<
//   T extends ZodMiniObject,
//   M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>,
// >(
//   schema: T,
//   mask: M
// ):
// ZodMiniObject<
//   util.Flatten<
//     Omit<T['_zod']["shape"], Extract<keyof T['_zod']["shape"], keyof M>>
//   >
// >;
export function omit(schema: ZodMiniObjectLike, mask: object) {
  return util.omit(schema, mask);
}

// .partial
// export function partial<T extends ZodMiniObject>(
//   schema: T
// ): ZodMiniObject<
//   {
//     [k in keyof T['_zod']["shape"]]: ZodMiniOptional<T['_zod']["shape"][k]>;
//   },
//   T['_zod']["extra"]
// >;
// export function partial<T extends ZodMiniObject, M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>>(
//   schema: T,
//   mask: M
// ): ZodMiniObject<
//   {
//     [k in keyof T['_zod']["shape"]]: k extends keyof M ? ZodMiniOptional<T['_zod']["shape"][k]> : T['_zod']["shape"][k];
//   },
//   T['_zod']["extra"]
// >;
// export function partial<T extends ZodMiniInterface>(
//   schema: T
// ): ZodMiniInterface<Partial<T['_zod']["output"]>, Partial<T['_zod']["input"]>>;
// export function partial<T extends ZodMiniInterface, M extends util.Mask<keyof T['_zod']["output"]>>(
//   schema: T,
//   mask: M
// ): ZodMiniInterface<util.PartialInterfaceShape<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
export function partial<T extends ZodMiniObjectLike>(
  schema: T
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      // T['_zod']["shape"],
      {
        [k in keyof T["_zod"]["shape"]]: ZodMiniOptional<T["_zod"]["shape"][k]>;
      },
      {
        optional: string & keyof T["_zod"]["shape"];
        defaulted: never;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<
      {
        [k in keyof T["_zod"]["shape"]]: ZodMiniOptional<T["_zod"]["shape"][k]>;
      },
      T["_zod"]["extra"]
    >;
export function partial<T extends ZodMiniObjectLike, M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.ExtendShape<
        T["_zod"]["shape"],
        {
          [k in keyof M & keyof T["_zod"]["shape"]]: ZodMiniOptional<T["_zod"]["shape"][k]>;
        }
      >,
      {
        optional: string & (T["_zod"]["optional"] | keyof M);
        defaulted: T["_zod"]["defaulted"];
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<
      {
        [k in keyof T["_zod"]["shape"]]: k extends keyof M
          ? ZodMiniOptional<T["_zod"]["shape"][k]>
          : T["_zod"]["shape"][k];
      },
      T["_zod"]["extra"]
    >;

// export function partial<T extends ZodMiniInterface>(
//   schema: T
// ): ZodMiniInterface<Partial<T['_zod']["output"]>, Partial<T['_zod']["input"]>>;
// export function partial<T extends ZodMiniInterface, M extends util.Mask<keyof T['_zod']["output"]>>(
//   schema: T,
//   mask: M
// ): ZodMiniInterface<util.PartialInterfaceShape<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
export function partial(schema: ZodMiniObjectLike, mask?: object): ZodMiniObjectLike {
  return util.partialObjectLike(ZodMiniOptional, schema, mask);
}

// .required
export function required<T extends { _zod: { subtype: "object" } } & ZodMiniObject>(
  schema: T
): ZodMiniObject<{
  [k in keyof T["_zod"]["shape"]]: ZodMiniNonOptional<T["_zod"]["shape"][k]>;
}>;
export function required<
  T extends { _zod: { subtype: "object" } } & ZodMiniObject,
  M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): ZodMiniObject<
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["shape"]]: ZodMiniNonOptional<T["_zod"]["shape"][k]>;
    }
  >
>;
export function required<T extends { _zod: { subtype: "interface" } } & ZodMiniInterface>(
  schema: T
): ZodMiniInterface<
  {
    [k in keyof T["_zod"]["shape"]]: ZodMiniNonOptional<T["_zod"]["shape"][k]>;
  },
  {
    optional: never;
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
>;
export function required<
  T extends { _zod: { subtype: "interface" } } & ZodMiniInterface,
  M extends util.Mask<keyof T["_zod"]["output"]>,
>(
  schema: T,
  mask: M
): ZodMiniInterface<
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["shape"]]: ZodMiniNonOptional<T["_zod"]["shape"][k]>;
    }
  >,
  {
    optional: Exclude<T["_zod"]["optional"], keyof M>;
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
>;
export function required(schema: ZodMiniObjectLike, mask?: object): ZodMiniObjectLike {
  return util.requiredObjectLike(ZodMiniNonOptional, schema, mask);
}

// ZodMiniUnion
export interface ZodMiniUnion<T extends readonly SomeType[] = readonly SomeType[]> extends ZodMiniType {
  _zod: core.$ZodUnionInternals<T>;
}
export const ZodMiniUnion: core.$constructor<ZodMiniUnion> = core.$constructor("ZodMiniUnion", (inst, def) => {
  core.$ZodUnion.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniUnionParams = util.TypeParams<ZodMiniUnion, "options">;
export function union<const T extends readonly SomeType[]>(options: T, params?: core.$ZodUnionParams): ZodMiniUnion<T> {
  return new ZodMiniUnion({
    type: "union",
    options,
    ...util.normalizeParams(params),
  }) as ZodMiniUnion<T>;
}

// ZodMiniDiscriminatedUnion
export interface ZodMiniDiscriminatedUnion<Options extends readonly SomeType[] = readonly SomeType[]>
  extends ZodMiniUnion<Options> {
  _zod: core.$ZodDiscriminatedUnionInternals<Options>;
}
export const ZodMiniDiscriminatedUnion: core.$constructor<ZodMiniDiscriminatedUnion> = core.$constructor(
  "ZodMiniDiscriminatedUnion",
  (inst, def) => {
    core.$ZodDiscriminatedUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export interface $ZodTypeDiscriminableInternals extends core.$ZodTypeInternals {
  disc: util.DiscriminatorMap;
}

export interface $ZodTypeDiscriminable extends ZodMiniType {
  _zod: $ZodTypeDiscriminableInternals;
}
// export type Z_odMiniDiscriminatedUnionParams = util.TypeParams<ZodMiniDiscriminatedUnion, "options">;
export function discriminatedUnion<Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
  options: Types,
  params?: core.$ZodDiscriminatedUnionParams
): ZodMiniDiscriminatedUnion<Types> {
  return new ZodMiniDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeParams(params),
  }) as ZodMiniDiscriminatedUnion<Types>;
}

// ZodMiniIntersection
export interface ZodMiniIntersection<A extends SomeType = SomeType, B extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodIntersectionInternals<A, B>;
}
export const ZodMiniIntersection: core.$constructor<ZodMiniIntersection> = core.$constructor(
  "ZodMiniIntersection",
  (inst, def) => {
    core.$ZodIntersection.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniIntersectionParams = util.TypeParams<ZodMiniIntersection, "left" | "right">;
export function intersection<T extends SomeType, U extends SomeType>(
  left: T,
  right: U,
  params?: core.$ZodIntersectionParams
): ZodMiniIntersection<T, U> {
  return new ZodMiniIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeParams(params),
  }) as ZodMiniIntersection<T, U>;
}

// ZodMiniTuple
export interface ZodMiniTuple<
  T extends util.TupleItems = util.TupleItems,
  Rest extends SomeType | null = SomeType | null,
> extends ZodMiniType {
  _zod: core.$ZodTupleInternals<T, Rest>;
}
export const ZodMiniTuple: core.$constructor<ZodMiniTuple> = core.$constructor("ZodMiniTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniTupleParams = util.TypeParams<ZodMiniTuple, "items" | "rest">;

export function tuple<T extends readonly [SomeType, ...SomeType[]]>(
  items: T,
  params?: core.$ZodTupleParams
): ZodMiniTuple<T, null>;
export function tuple<T extends readonly [SomeType, ...SomeType[]], Rest extends SomeType>(
  items: T,
  rest: Rest,
  params?: core.$ZodTupleParams
): ZodMiniTuple<T, Rest>;
export function tuple(items: [], params?: core.$ZodTupleParams): ZodMiniTuple<[], null>;
export function tuple(
  items: SomeType[],
  _paramsOrRest?: core.$ZodTupleParams | SomeType,
  _params?: core.$ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof core.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodMiniTuple({
    type: "tuple",
    items,
    rest,
    ...util.normalizeParams(params),
  });
}

// ZodMiniRecord
export interface ZodMiniRecord<Key extends core.$ZodRecordKey = core.$ZodRecordKey, Value extends SomeType = SomeType>
  extends ZodMiniType {
  _zod: core.$ZodRecordInternals<Key, Value>;
}
export const ZodMiniRecord: core.$constructor<ZodMiniRecord> = core.$constructor("ZodMiniRecord", (inst, def) => {
  core.$ZodRecord.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniRecordParams = util.TypeParams<ZodMiniRecord, "keyType" | "valueType">;
export function record<Key extends core.$ZodRecordKey, Value extends SomeType>(
  keyType: Key,
  valueType: Value,
  params?: core.$ZodRecordParams
): ZodMiniRecord<Key, Value> {
  return new ZodMiniRecord({
    type: "record",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as ZodMiniRecord<Key, Value>;
}

// ZodMiniMap
export interface ZodMiniMap<Key extends SomeType = SomeType, Value extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodMapInternals<Key, Value>;
}
export const ZodMiniMap: core.$constructor<ZodMiniMap> = core.$constructor("ZodMiniMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniMapParams = util.TypeParams<ZodMiniMap, "keyType" | "valueType">;
export function map<Key extends SomeType, Value extends SomeType>(
  keyType: Key,
  valueType: Value,
  params?: core.$ZodMapParams
): ZodMiniMap<Key, Value> {
  return new ZodMiniMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as ZodMiniMap<Key, Value>;
}

// ZodMiniSet
export interface ZodMiniSet<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodSetInternals<T>;
}
export const ZodMiniSet: core.$constructor<ZodMiniSet> = core.$constructor("ZodMiniSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniSetParams = util.TypeParams<ZodMiniSet, "valueType">;
export function set<Value extends SomeType>(valueType: Value, params?: core.$ZodSetParams): ZodMiniSet<Value> {
  return new ZodMiniSet({
    type: "set",
    valueType,
    ...util.normalizeParams(params),
  }) as ZodMiniSet<Value>;
}

// ZodMiniEnum
export interface ZodMiniEnum<T extends util.EnumLike = util.EnumLike> extends ZodMiniType {
  _zod: core.$ZodEnumInternals<T>;
}
export const ZodMiniEnum: core.$constructor<ZodMiniEnum> = core.$constructor("ZodMiniEnum", (inst, def) => {
  core.$ZodEnum.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniEnumParams = util.TypeParams<ZodMiniEnum, "entries">;
function _enum<const T extends string[]>(values: T, params?: core.$ZodEnumParams): ZodMiniEnum<util.ToEnum<T[number]>>;
function _enum<T extends util.EnumLike>(entries: T, params?: core.$ZodEnumParams): ZodMiniEnum<T>;
function _enum(values: any, params?: core.$ZodEnumParams) {
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

  return new ZodMiniEnum({
    type: "enum",
    entries,
    ...util.normalizeParams(params),
  }) as any;
}
export { _enum as enum };

/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
export function nativeEnum<T extends util.EnumLike>(entries: T, params?: core.$ZodEnumParams): ZodMiniEnum<T> {
  return new ZodMiniEnum({
    type: "enum",
    entries,
    ...util.normalizeParams(params),
  }) as any as ZodMiniEnum<T>;
}

// ZodMiniLiteral
export interface ZodMiniLiteral<T extends util.Primitive = util.Primitive> extends ZodMiniType {
  _zod: core.$ZodLiteralInternals<T>;
}
export const ZodMiniLiteral: core.$constructor<ZodMiniLiteral> = core.$constructor("ZodMiniLiteral", (inst, def) => {
  core.$ZodLiteral.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniLiteralParams = util.TypeParams<ZodMiniLiteral, "values">;
export function literal<const T extends Array<util.Literal>>(
  value: T,
  params?: core.$ZodLiteralParams
): ZodMiniLiteral<T[number]>;
export function literal<const T extends util.Literal>(value: T, params?: core.$ZodLiteralParams): ZodMiniLiteral<T>;
export function literal(value: any, params: any) {
  return new ZodMiniLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util.normalizeParams(params),
  });
}

// ZodMiniFile
export interface ZodMiniFile extends ZodMiniType {
  _zod: core.$ZodFileInternals;
}
export const ZodMiniFile: core.$constructor<ZodMiniFile> = core.$constructor("ZodMiniFile", (inst, def) => {
  core.$ZodFile.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniFileParams = util.TypeParams<ZodMiniFile>;
const _file = util.factory(() => ZodMiniFile, { type: "file" });
// export function file(checks?: core.$ZodCheck<File>[]): ZodMiniFile;
// export function file(params?: string | core.$ZodFileParams, checks?: core.$ZodCheck<File>[]): ZodMiniFile;
export function file(params?: string | core.$ZodFileParams): ZodMiniFile {
  return core._file(ZodMiniFile, params) as any;
}

// ZodMiniTransform
export interface ZodMiniTransform<O = unknown, I = unknown> extends ZodMiniType {
  _zod: core.$ZodTransformInternals<O, I>;
}
export const ZodMiniTransform: core.$constructor<ZodMiniTransform> = core.$constructor(
  "ZodMiniTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniTransformParams = util.TypeParams<ZodMiniTransform, "transform">;
export function transform<I = unknown, O = I>(
  fn: (input: I, ctx?: core.ParsePayload) => O,
  params?: core.$ZodTransformParams
): ZodMiniTransform<Awaited<O>, I> {
  return new ZodMiniTransform({
    type: "transform",
    transform: fn as any,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodMiniOptional
export interface ZodMiniOptional<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodOptionalInternals<T>;
}
export const ZodMiniOptional: core.$constructor<ZodMiniOptional> = core.$constructor("ZodMiniOptional", (inst, def) => {
  core.$ZodOptional.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniOptionalParams = util.TypeParams<ZodMiniOptional, "innerType">;

export function optional<T extends SomeType>(innerType: T, params?: core.$ZodOptionalParams): ZodMiniOptional<T> {
  return new ZodMiniOptional({
    type: "optional",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniOptional<T>;
}

// ZodMiniNullable
export interface ZodMiniNullable<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodNullableInternals<T>;
}
export const ZodMiniNullable: core.$constructor<ZodMiniNullable> = core.$constructor("ZodMiniNullable", (inst, def) => {
  core.$ZodNullable.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniNullableParams = util.TypeParams<ZodMiniNullable, "innerType">;
export function nullable<T extends SomeType>(innerType: T, params?: core.$ZodNullableParams): ZodMiniNullable<T> {
  return new ZodMiniNullable({
    type: "nullable",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniNullable<T>;
}

// ZodMiniDefault
export interface ZodMiniDefault<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodDefaultInternals<T>;
}
export const ZodMiniDefault: core.$constructor<ZodMiniDefault> = core.$constructor("ZodMiniDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodMiniType.init(inst, def);
});

// export type Z_odMiniDefaultParams = util.TypeParams<ZodMiniDefault, "innerType" | "defaultValue">;
export function _default<T extends SomeType>(
  innerType: T,
  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
  params?: core.$ZodDefaultParams
): ZodMiniDefault<T> {
  return new ZodMiniDefault({
    type: "default",
    defaultValue: (typeof defaultValue === "function" ? defaultValue : () => defaultValue) as () => core.output<T>,
    innerType,
    ...util.normalizeParams(params),
  }) as any as ZodMiniDefault<T>;
}

// ZodMiniNonOptional
export interface ZodMiniNonOptional<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodNonOptionalInternals<T>;
}
export const ZodMiniNonOptional: core.$constructor<ZodMiniNonOptional> = core.$constructor(
  "ZodMiniNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniNonOptionalParams = util.TypeParams<ZodMiniNonOptional, "innerType">;
export function nonoptional<T extends SomeType>(
  innerType: T,
  params?: core.$ZodNonOptionalParams
): ZodMiniNonOptional<T> {
  return new ZodMiniNonOptional({
    type: "nonoptional",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniNonOptional<T>;
}

// ZodMiniSuccess
export interface ZodMiniSuccess<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodSuccessInternals<T>;
}
export const ZodMiniSuccess: core.$constructor<ZodMiniSuccess> = core.$constructor("ZodMiniSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniSuccessParams = util.TypeParams<ZodMiniSuccess, "innerType">;
export function success<T extends SomeType>(innerType: T, params?: core.$ZodSuccessParams): ZodMiniSuccess<T> {
  return new ZodMiniSuccess({
    type: "success",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniSuccess<T>;
}

// ZodMiniCatch
export interface ZodMiniCatch<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodCatchInternals<T>;
}
export const ZodMiniCatch: core.$constructor<ZodMiniCatch> = core.$constructor("ZodMiniCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniCatchParams = util.TypeParams<ZodMiniCatch, "innerType" | "catchValue">;
function _catch<T extends SomeType>(
  innerType: T,
  catchValue: core.output<T> | ((ctx: core.$ZodCatchCtx) => core.output<T>),
  params?: core.$ZodCatchParams
): ZodMiniCatch<T> {
  return new ZodMiniCatch({
    type: "catch",
    innerType,
    catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue) as (
      ctx: core.$ZodCatchCtx
    ) => core.output<T>,
    ...util.normalizeParams(params),
  }) as ZodMiniCatch<T>;
}
export { _catch as catch };

// ZodMiniNaN
export interface ZodMiniNaN extends ZodMiniType {
  _zod: core.$ZodNaNInternals;
}
export const ZodMiniNaN: core.$constructor<ZodMiniNaN> = core.$constructor("ZodMiniNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniNaNParams = util.TypeParams<ZodMiniNaN>;
const _nan = util.factory(() => ZodMiniNaN, { type: "nan" });
// export function nan(checks?: core.$ZodCheck<number>[]): ZodMiniNaN;
// export function nan(params?: string | core.$ZodNaNParams, checks?: core.$ZodCheck<number>[]): ZodMiniNaN;
export function nan(params?: string | core.$ZodNaNParams): ZodMiniNaN {
  return core._nan(ZodMiniNaN, params) as any;
}

// ZodMiniPipe
export interface ZodMiniPipe<A extends SomeType = SomeType, B extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodPipeInternals<A, B>;
}
export const ZodMiniPipe: core.$constructor<ZodMiniPipe> = core.$constructor("ZodMiniPipe", (inst, def) => {
  core.$ZodPipe.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniPipeParams = util.TypeParams<ZodMiniPipe, "in" | "out">;
export function pipe<
  const A extends core.$ZodType,
  B extends core.$ZodType<unknown, core.output<A>> = core.$ZodType<unknown, core.output<A>>,
>(in_: A, out: B | core.$ZodType<unknown, core.output<A>>, params?: core.$ZodPipeParams): ZodMiniPipe<A, B>;
export function pipe(in_: core.$ZodType, out: core.$ZodType, params?: core.$ZodPipeParams) {
  return new ZodMiniPipe({
    type: "pipe",
    in: in_,
    out,
    ...util.normalizeParams(params),
  });
}

// ZodMiniReadonly
export interface ZodMiniReadonly<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodReadonlyInternals<T>;
}
export const ZodMiniReadonly: core.$constructor<ZodMiniReadonly> = core.$constructor("ZodMiniReadonly", (inst, def) => {
  core.$ZodReadonly.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniReadonlyParams = util.TypeParams<ZodMiniReadonly, "innerType">;
export function readonly<T extends SomeType>(innerType: T, params?: core.$ZodReadonlyParams): ZodMiniReadonly<T> {
  return new ZodMiniReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniReadonly<T>;
}

// ZodMiniTemplateLiteral
export interface ZodMiniTemplateLiteral<Template extends string = string> extends ZodMiniType {
  _zod: core.$ZodTemplateLiteralInternals<Template>;
}
export const ZodMiniTemplateLiteral: core.$constructor<ZodMiniTemplateLiteral> = core.$constructor(
  "ZodMiniTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
// export type Z_odMiniTemplateLiteralParams = util.TypeParams<ZodMiniTemplateLiteral, "parts">;
export function templateLiteral<const Parts extends core.$TemplateLiteralPart[]>(
  parts: Parts,
  params?: core.$ZodTemplateLiteralParams
): ZodMiniTemplateLiteral<core.$PartsToTemplateLiteral<Parts>> {
  return new ZodMiniTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodMiniPromise
export interface ZodMiniPromise<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodPromiseInternals<T>;
}
export const ZodMiniPromise: core.$constructor<ZodMiniPromise> = core.$constructor("ZodMiniPromise", (inst, def) => {
  core.$ZodPromise.init(inst, def);
  ZodMiniType.init(inst, def);
});
// export type Z_odMiniPromiseParams = util.TypeParams<ZodMiniPromise, "innerType">;
export function promise<T extends SomeType>(innerType: T, params?: core.$ZodPromiseParams): ZodMiniPromise<T> {
  return new ZodMiniPromise({
    type: "promise",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniPromise<T>;
}

// ZodMiniCustom
export interface ZodMiniCustom<O = unknown, I = unknown> extends ZodMiniType {
  _zod: core.$ZodCustomInternals<O, I>;
}
export const ZodMiniCustom: core.$constructor<ZodMiniCustom> = core.$constructor("ZodMiniCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodMiniType.init(inst, def);
});

//////////    CUSTOM     //////////

export function check<O = unknown>(fn: core.CheckFn<O>, params?: core.$ZodCustomParams): core.$ZodCheck<O> {
  const ch = new core.$ZodCheck({
    check: "custom",
    ...util.normalizeParams(params),
  });

  ch._zod.check = fn;
  return ch;
}

export function _custom<O = unknown, I = O>(
  fn: (data: O) => unknown,
  _params: string | core.$ZodCustomParams | undefined,
  Class: util.Constructor<ZodMiniCustom, [core.$ZodCustomDef]>
): ZodMiniCustom<O, I> {
  const params = util.normalizeParams(_params);

  const schema = new Class({
    type: "custom",
    check: "custom",
    fn: fn as any,
    ...params,
  });

  return schema as any;
}

export function custom<O = unknown, I = O>(
  fn?: (data: O) => unknown,
  _params?: string | core.$ZodCustomParams | undefined
): ZodMiniCustom<O, I> {
  return _custom(fn ?? (() => true), _params, ZodMiniCustom);
}

export function refine<T>(
  fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
  _params: string | core.$ZodCustomParams = {}
): core.$ZodCheck<T> {
  return _custom(fn, _params, ZodMiniCustom);
}

//////////    INSTANCEOF     //////////
abstract class Class {
  constructor(..._args: any[]) {}
}
function _instanceof<T extends typeof Class>(
  cls: T,
  params: core.$ZodCustomParams = {
    error: `Input not instance of ${cls.name}`,
  }
): ZodMiniCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}
export { _instanceof as instanceof };

export function lazy<T extends object>(getter: () => T): T {
  return util.createTransparentProxy<T>(getter);
}

// stringbool
export const stringbool: (_params?: core.$ZodStringBoolParams) => ZodMiniPipe<ZodMiniUnknown, ZodMiniBoolean<boolean>> =
  core._stringbool.bind(null, {
    Pipe: ZodMiniPipe,
    Boolean: ZodMiniBoolean,
    Unknown: ZodMiniUnknown,
  }) as any;
// export interface $ZodStringBoolParams extends util.TypeParams {
//   truthy?: string[];
//   falsy?: string[];
//   /**
//    * Options `"sensitive"`, `"insensitive"`
//    *
//    * Defaults to `"insensitive"`
//    */
//   case?: "sensitive" | "insensitive";
// }

// export function stringbool(
//   this: {Pipe?: typeof core.$ZodPipe, Boolean?: typeof core.$ZodBoolean},
//   _params?: $ZodStringBoolParams): ZodMiniPipe<ZodMiniUnknown, ZodMiniBoolean<boolean>> {
//   const params = util.normalizeParams<$ZodStringBoolParams>(_params);
//   const trueValues = new Set(params?.truthy ?? ["true", "1", "yes", "on", "y", "enabled"]);
//   const falseValues = new Set(params?.falsy ?? ["false", "0", "no", "off", "n", "disabled"]);
//   const inst = unknown().check((ctx) => {
//     if (typeof ctx.value === "string") {
//       let data: string = ctx.value;
//       if (params?.case !== "sensitive") data = data.toLowerCase();
//       if (trueValues.has(data)) {
//         ctx.value = true;
//       } else if (falseValues.has(data)) {
//         ctx.value = false;
//       } else {
//         ctx.issues.push({
//           code: "invalid_value",
//           expected: "stringbool",
//           values: [...trueValues, ...falseValues],
//           input: ctx.value,
//           inst,
//         });
//       }
//     } else {
//       ctx.issues.push({
//         code: "invalid_type",
//         expected: "string",
//         input: ctx.value,
//       });
//     }
//   });

//   return pipe(inst, boolean());
// }

// json
export type ZodMiniJSONSchema = ZodMiniUnion<
  [
    ZodMiniString<string>,
    ZodMiniNumber<number>,
    ZodMiniBoolean<boolean>,
    ZodMiniNull,
    ZodMiniArray<ZodMiniJSONSchema>,
    ZodMiniRecord<ZodMiniString<string>, ZodMiniJSONSchema>,
  ]
> & {
  _zod: {
    input: util.JSONType;
    output: util.JSONType;
  };
};

export function json(): ZodMiniJSONSchema {
  const jsonSchema = lazy(() => {
    return union([string(), number(), boolean(), _null(), array(jsonSchema), record(string(), jsonSchema)]);
  }) as ZodMiniJSONSchema;

  return jsonSchema;
}
