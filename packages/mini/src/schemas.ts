import * as core from "@zod/core";
import { util } from "@zod/core";
import * as parse from "./parse.js";

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

  def: this["_zod"]["def"];

  parse(data: unknown, params?: core.ParseContext<core.$ZodIssue>): core.output<this>;
  safeParse(data: unknown, params?: core.ParseContext<core.$ZodIssue>): util.SafeParseResult<core.output<this>>;
  parseAsync(data: unknown, params?: core.ParseContext<core.$ZodIssue>): Promise<core.output<this>>;
  safeParseAsync(
    data: unknown,
    params?: core.ParseContext<core.$ZodIssue>
  ): Promise<util.SafeParseResult<core.output<this>>>;
}

export const ZodMiniType: core.$constructor<ZodMiniType> = /*@__PURE__*/ core.$constructor(
  "ZodMiniType",
  (inst, def) => {
    if (!inst._zod) throw new Error("Uninitialized schema in mixin ZodMiniType.");

    core.$ZodType.init(inst, def);
    inst.def = def;
    inst.parse = (data, params) => parse.parse(inst, data, params);
    inst.safeParse = (data, params) => parse.safeParse(inst, data, params);
    inst.parseAsync = async (data, params) => parse.parseAsync(inst, data, params);
    inst.safeParseAsync = async (data, params) => parse.safeParseAsync(inst, data, params);
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
  }
);

// ZodMiniString
export interface ZodMiniString<Input = unknown> extends ZodMiniType {
  _zod: core.$ZodStringInternals<Input>;
}
export const ZodMiniString: core.$constructor<ZodMiniString> = /*@__PURE__*/ core.$constructor(
  "ZodMiniString",
  (inst, def) => {
    core.$ZodString.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function string(params?: string | core.$ZodStringParams): ZodMiniString<string> {
  return core._string(ZodMiniString, params) as any;
}

// ZodMiniStringFormat
export interface ZodMiniStringFormat<Format extends core.$ZodStringFormats = core.$ZodStringFormats>
  extends ZodMiniString {
  _zod: core.$ZodStringFormatInternals<Format>;
}
export const ZodMiniStringFormat: core.$constructor<ZodMiniStringFormat> = /*@__PURE__*/ core.$constructor(
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
export const ZodMiniEmail: core.$constructor<ZodMiniEmail> = /*@__PURE__*/ core.$constructor(
  "ZodMiniEmail",
  (inst, def) => {
    core.$ZodEmail.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function email(params?: string | core.$ZodEmailParams): ZodMiniEmail {
  return core._email(ZodMiniEmail, params);
}

// ZodMiniGUID
export interface ZodMiniGUID extends ZodMiniStringFormat<"guid"> {
  _zod: core.$ZodGUIDInternals;
}
export const ZodMiniGUID: core.$constructor<ZodMiniGUID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniGUID",
  (inst, def) => {
    core.$ZodGUID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function guid(params?: string | core.$ZodGUIDParams): ZodMiniGUID {
  return core._guid(ZodMiniGUID, params);
}

// ZodMiniUUID
export interface ZodMiniUUID extends ZodMiniStringFormat<"uuid"> {
  _zod: core.$ZodUUIDInternals;
}
export const ZodMiniUUID: core.$constructor<ZodMiniUUID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniUUID",
  (inst, def) => {
    core.$ZodUUID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function uuid(params?: string | core.$ZodUUIDParams): ZodMiniUUID {
  return core._uuid(ZodMiniUUID, params);
}

export function uuidv4(params?: string | core.$ZodUUIDv4Params): ZodMiniUUID {
  return core._uuidv4(ZodMiniUUID, params);
}

// ZodMiniUUIDv6

export function uuidv6(params?: string | core.$ZodUUIDv6Params): ZodMiniUUID {
  return core._uuidv6(ZodMiniUUID, params);
}

// ZodMiniUUIDv7

export function uuidv7(params?: string | core.$ZodUUIDv7Params): ZodMiniUUID {
  return core._uuidv7(ZodMiniUUID, params);
}

// ZodMiniURL
export interface ZodMiniURL extends ZodMiniStringFormat<"url"> {
  _zod: core.$ZodURLInternals;
}
export const ZodMiniURL: core.$constructor<ZodMiniURL> = /*@__PURE__*/ core.$constructor("ZodMiniURL", (inst, def) => {
  core.$ZodURL.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});

export function url(params?: string | core.$ZodURLParams): ZodMiniURL {
  return core._url(ZodMiniURL, params);
}

// ZodMiniEmoji
export interface ZodMiniEmoji extends ZodMiniStringFormat<"emoji"> {
  _zod: core.$ZodEmojiInternals;
}
export const ZodMiniEmoji: core.$constructor<ZodMiniEmoji> = /*@__PURE__*/ core.$constructor(
  "ZodMiniEmoji",
  (inst, def) => {
    core.$ZodEmoji.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function emoji(params?: string | core.$ZodEmojiParams): ZodMiniEmoji {
  return core._emoji(ZodMiniEmoji, params);
}

// ZodMiniNanoID
export interface ZodMiniNanoID extends ZodMiniStringFormat<"nanoid"> {
  _zod: core.$ZodNanoIDInternals;
}
export const ZodMiniNanoID: core.$constructor<ZodMiniNanoID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNanoID",
  (inst, def) => {
    core.$ZodNanoID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function nanoid(params?: string | core.$ZodNanoIDParams): ZodMiniNanoID {
  return core._nanoid(ZodMiniNanoID, params);
}

// ZodMiniCUID
export interface ZodMiniCUID extends ZodMiniStringFormat<"cuid"> {
  _zod: core.$ZodCUIDInternals;
}
export const ZodMiniCUID: core.$constructor<ZodMiniCUID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCUID",
  (inst, def) => {
    core.$ZodCUID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function cuid(params?: string | core.$ZodCUIDParams): ZodMiniCUID {
  return core._cuid(ZodMiniCUID, params);
}

// ZodMiniCUID2
export interface ZodMiniCUID2 extends ZodMiniStringFormat<"cuid2"> {
  _zod: core.$ZodCUID2Internals;
}
export const ZodMiniCUID2: core.$constructor<ZodMiniCUID2> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCUID2",
  (inst, def) => {
    core.$ZodCUID2.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function cuid2(params?: string | core.$ZodCUID2Params): ZodMiniCUID2 {
  return core._cuid2(ZodMiniCUID2, params);
}

// ZodMiniULID
export interface ZodMiniULID extends ZodMiniStringFormat<"ulid"> {
  _zod: core.$ZodULIDInternals;
}
export const ZodMiniULID: core.$constructor<ZodMiniULID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniULID",
  (inst, def) => {
    core.$ZodULID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function ulid(params?: string | core.$ZodULIDParams): ZodMiniULID {
  return core._ulid(ZodMiniULID, params);
}

// ZodMiniXID
export interface ZodMiniXID extends ZodMiniStringFormat<"xid"> {
  _zod: core.$ZodXIDInternals;
}
export const ZodMiniXID: core.$constructor<ZodMiniXID> = /*@__PURE__*/ core.$constructor("ZodMiniXID", (inst, def) => {
  core.$ZodXID.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});

export function xid(params?: string | core.$ZodXIDParams): ZodMiniXID {
  return core._xid(ZodMiniXID, params);
}

// ZodMiniKSUID
export interface ZodMiniKSUID extends ZodMiniStringFormat<"ksuid"> {
  _zod: core.$ZodKSUIDInternals;
}
export const ZodMiniKSUID: core.$constructor<ZodMiniKSUID> = /*@__PURE__*/ core.$constructor(
  "ZodMiniKSUID",
  (inst, def) => {
    core.$ZodKSUID.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function ksuid(params?: string | core.$ZodKSUIDParams): ZodMiniKSUID {
  return core._ksuid(ZodMiniKSUID, params);
}

// ZodMiniIP
// export interface ZodMiniIP extends ZodMiniStringFormat<"ip"> {
//   _zod: core.$ZodIPInternals;
// }
// export const ZodMiniIP: core.$constructor<ZodMiniIP> = /*@__PURE__*/ core.$constructor("ZodMiniIP", (inst, def) => {
//   core.$ZodIP.init(inst, def);
//   ZodMiniStringFormat.init(inst, def);
// });

// export function ip(params?: string | core.$ZodIPParams): ZodMiniIP {
//   return core._ip(ZodMiniIP, params);
// }

// ZodMiniIPv4
export interface ZodMiniIPv4 extends ZodMiniStringFormat<"ipv4"> {
  _zod: core.$ZodIPv4Internals;
}
export const ZodMiniIPv4: core.$constructor<ZodMiniIPv4> = /*@__PURE__*/ core.$constructor(
  "ZodMiniIPv4",
  (inst, def) => {
    core.$ZodIPv4.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function ipv4(params?: string | core.$ZodIPv4Params): ZodMiniIPv4 {
  return core._ipv4(ZodMiniIPv4, params);
}

// ZodMiniIPv6
export interface ZodMiniIPv6 extends ZodMiniStringFormat<"ipv6"> {
  _zod: core.$ZodIPv6Internals;
}
export const ZodMiniIPv6: core.$constructor<ZodMiniIPv6> = /*@__PURE__*/ core.$constructor(
  "ZodMiniIPv6",
  (inst, def) => {
    core.$ZodIPv6.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function ipv6(params?: string | core.$ZodIPv6Params): ZodMiniIPv6 {
  return core._ipv6(ZodMiniIPv6, params);
}

// ZodMiniCIDRv4
export interface ZodMiniCIDRv4 extends ZodMiniStringFormat<"cidrv4"> {
  _zod: core.$ZodCIDRv4Internals;
}
export const ZodMiniCIDRv4: core.$constructor<ZodMiniCIDRv4> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCIDRv4",
  (inst, def) => {
    core.$ZodCIDRv4.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function cidrv4(params?: string | core.$ZodCIDRv4Params): ZodMiniCIDRv4 {
  return core._cidrv4(ZodMiniCIDRv4, params);
}

// ZodMiniCIDRv6
export interface ZodMiniCIDRv6 extends ZodMiniStringFormat<"cidrv6"> {
  _zod: core.$ZodCIDRv6Internals;
}
export const ZodMiniCIDRv6: core.$constructor<ZodMiniCIDRv6> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCIDRv6",
  (inst, def) => {
    core.$ZodCIDRv6.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function cidrv6(params?: string | core.$ZodCIDRv6Params): ZodMiniCIDRv6 {
  return core._cidrv6(ZodMiniCIDRv6, params);
}

// ZodMiniBase64
export interface ZodMiniBase64 extends ZodMiniStringFormat<"base64"> {
  _zod: core.$ZodBase64Internals;
}
export const ZodMiniBase64: core.$constructor<ZodMiniBase64> = /*@__PURE__*/ core.$constructor(
  "ZodMiniBase64",
  (inst, def) => {
    core.$ZodBase64.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);
export function base64(params?: string | core.$ZodBase64Params): ZodMiniBase64 {
  return core._base64(ZodMiniBase64, params);
}

// ZodMiniBase64URL
export interface ZodMiniBase64URL extends ZodMiniStringFormat<"base64url"> {
  _zod: core.$ZodBase64URLInternals;
}
export const ZodMiniBase64URL: core.$constructor<ZodMiniBase64URL> = /*@__PURE__*/ core.$constructor(
  "ZodMiniBase64URL",
  (inst, def) => {
    core.$ZodBase64URL.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);
export function base64url(params?: string | core.$ZodBase64URLParams): ZodMiniBase64URL {
  return core._base64url(ZodMiniBase64URL, params);
}

// ZodMiniE164
export interface ZodMiniE164 extends ZodMiniStringFormat<"e164"> {
  _zod: core.$ZodE164Internals;
}
export const ZodMiniE164: core.$constructor<ZodMiniE164> = /*@__PURE__*/ core.$constructor(
  "ZodMiniE164",
  (inst, def) => {
    core.$ZodE164.init(inst, def);
    ZodMiniStringFormat.init(inst, def);
  }
);

export function e164(params?: string | core.$ZodE164Params): ZodMiniE164 {
  return core._e164(ZodMiniE164, params);
}

// ZodMiniJWT
export interface ZodMiniJWT extends ZodMiniStringFormat<"jwt"> {
  _zod: core.$ZodJWTInternals;
}
export const ZodMiniJWT: core.$constructor<ZodMiniJWT> = /*@__PURE__*/ core.$constructor("ZodMiniJWT", (inst, def) => {
  core.$ZodJWT.init(inst, def);
  ZodMiniStringFormat.init(inst, def);
});

export function jwt(params?: string | core.$ZodJWTParams): ZodMiniJWT {
  return core._jwt(ZodMiniJWT, params);
}

// ZodMiniNumber
export interface ZodMiniNumber<Input = unknown> extends ZodMiniType {
  _zod: core.$ZodNumberInternals<Input>;
}
export const ZodMiniNumber: core.$constructor<ZodMiniNumber> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNumber",
  (inst, def) => {
    core.$ZodNumber.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function number(params?: string | core.$ZodNumberParams): ZodMiniNumber<number> {
  return core._number(ZodMiniNumber, params) as any;
}

// ZodMiniNumberFormat
export interface ZodMiniNumberFormat extends ZodMiniNumber {
  _zod: core.$ZodNumberFormatInternals;
}
export const ZodMiniNumberFormat: core.$constructor<ZodMiniNumberFormat> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNumberFormat",
  (inst, def) => {
    core.$ZodNumberFormat.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

// int

export function int(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._int(ZodMiniNumberFormat, params);
}

// float32

export function float32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._float32(ZodMiniNumberFormat, params);
}

// float64

export function float64(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._float64(ZodMiniNumberFormat, params);
}

// int32

export function int32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._int32(ZodMiniNumberFormat, params);
}

// uint32

export function uint32(params?: string | core.$ZodCheckNumberFormatParams): ZodMiniNumberFormat {
  return core._uint32(ZodMiniNumberFormat, params);
}

// ZodMiniBoolean
export interface ZodMiniBoolean<T = unknown> extends ZodMiniType {
  _zod: core.$ZodBooleanInternals<T>;
}
export const ZodMiniBoolean: core.$constructor<ZodMiniBoolean> = /*@__PURE__*/ core.$constructor(
  "ZodMiniBoolean",
  (inst, def) => {
    core.$ZodBoolean.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function boolean(params?: string | core.$ZodBooleanParams): ZodMiniBoolean<boolean> {
  return core._boolean(ZodMiniBoolean, params) as any;
}

// ZodMiniBigInt
export interface ZodMiniBigInt<T = unknown> extends ZodMiniType {
  _zod: core.$ZodBigIntInternals<T>;
}
export const ZodMiniBigInt: core.$constructor<ZodMiniBigInt> = /*@__PURE__*/ core.$constructor(
  "ZodMiniBigInt",
  (inst, def) => {
    core.$ZodBigInt.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function bigint(params?: string | core.$ZodBigIntParams): ZodMiniBigInt<bigint> {
  return core._bigint(ZodMiniBigInt, params) as any;
}

// bigint formats

// ZodMiniBigIntFormat
export interface ZodMiniBigIntFormat extends ZodMiniType {
  _zod: core.$ZodBigIntFormatInternals;
}
export const ZodMiniBigIntFormat: core.$constructor<ZodMiniBigIntFormat> = /*@__PURE__*/ core.$constructor(
  "ZodMiniBigIntFormat",
  (inst, def) => {
    core.$ZodBigIntFormat.init(inst, def);
    ZodMiniBigInt.init(inst, def);
  }
);

// int64

export function int64(params?: string | core.$ZodBigIntFormatParams): ZodMiniBigIntFormat {
  return core._int64(ZodMiniBigIntFormat, params);
}

// uint64

export function uint64(params?: string | core.$ZodBigIntFormatParams): ZodMiniBigIntFormat {
  return core._uint64(ZodMiniBigIntFormat, params);
}

// ZodMiniSymbol
export interface ZodMiniSymbol extends ZodMiniType {
  _zod: core.$ZodSymbolInternals;
}
export const ZodMiniSymbol: core.$constructor<ZodMiniSymbol> = /*@__PURE__*/ core.$constructor(
  "ZodMiniSymbol",
  (inst, def) => {
    core.$ZodSymbol.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function symbol(params?: string | core.$ZodSymbolParams): ZodMiniSymbol {
  return core._symbol(ZodMiniSymbol, params) as any;
}

// ZodMiniUndefined
export interface ZodMiniUndefined extends ZodMiniType {
  _zod: core.$ZodUndefinedInternals;
}
export const ZodMiniUndefined: core.$constructor<ZodMiniUndefined> = /*@__PURE__*/ core.$constructor(
  "ZodMiniUndefined",
  (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

function _undefined(params?: string | core.$ZodUndefinedParams): ZodMiniUndefined {
  return core._undefined(ZodMiniUndefined, params) as any;
}
export { _undefined as undefined };

// ZodMiniNull
export interface ZodMiniNull extends ZodMiniType {
  _zod: core.$ZodNullInternals;
}
export const ZodMiniNull: core.$constructor<ZodMiniNull> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNull",
  (inst, def) => {
    core.$ZodNull.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

function _null(params?: string | core.$ZodNullParams): ZodMiniNull {
  return core._null(ZodMiniNull, params) as any;
}
export { _null as null };

// ZodMiniAny
export interface ZodMiniAny extends ZodMiniType {
  _zod: core.$ZodAnyInternals;
}
export const ZodMiniAny: core.$constructor<ZodMiniAny> = /*@__PURE__*/ core.$constructor("ZodMiniAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodMiniType.init(inst, def);
});

export function any(params?: string | core.$ZodAnyParams): ZodMiniAny {
  return core._any(ZodMiniAny, params) as any;
}

// ZodMiniUnknown
export interface ZodMiniUnknown extends ZodMiniType {
  _zod: core.$ZodUnknownInternals;
}
export const ZodMiniUnknown: core.$constructor<ZodMiniUnknown> = /*@__PURE__*/ core.$constructor(
  "ZodMiniUnknown",
  (inst, def) => {
    core.$ZodUnknown.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function unknown(params?: string | core.$ZodUnknownParams): ZodMiniUnknown {
  return core._unknown(ZodMiniUnknown, params) as any;
}

// ZodMiniNever
export interface ZodMiniNever extends ZodMiniType {
  _zod: core.$ZodNeverInternals;
}
export const ZodMiniNever: core.$constructor<ZodMiniNever> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNever",
  (inst, def) => {
    core.$ZodNever.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function never(params?: string | core.$ZodNeverParams): ZodMiniNever {
  return core._never(ZodMiniNever, params) as any;
}

// ZodMiniVoid
export interface ZodMiniVoid extends ZodMiniType {
  _zod: core.$ZodVoidInternals;
}
export const ZodMiniVoid: core.$constructor<ZodMiniVoid> = /*@__PURE__*/ core.$constructor(
  "ZodMiniVoid",
  (inst, def) => {
    core.$ZodVoid.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

function _void(params?: string | core.$ZodVoidParams): ZodMiniVoid {
  return core._void(ZodMiniVoid, params) as any;
}
export { _void as void };

// ZodMiniDate
export interface ZodMiniDate<T = unknown> extends ZodMiniType {
  _zod: core.$ZodDateInternals<T>;
}
export const ZodMiniDate: core.$constructor<ZodMiniDate> = /*@__PURE__*/ core.$constructor(
  "ZodMiniDate",
  (inst, def) => {
    core.$ZodDate.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function date(params?: string | core.$ZodDateParams): ZodMiniDate {
  return core._date(ZodMiniDate, params) as any;
}

// ZodMiniArray
export interface ZodMiniArray<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodArrayInternals<T>;
}
export const ZodMiniArray: core.$constructor<ZodMiniArray> = /*@__PURE__*/ core.$constructor(
  "ZodMiniArray",
  (inst, def) => {
    core.$ZodArray.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function array<T extends SomeType>(element: T, params?: core.$ZodArrayParams): ZodMiniArray<T>;
export function array<T extends SomeType>(element: SomeType, params?: any): ZodMiniArray<T> {
  return new ZodMiniArray({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...util.normalizeParams(params),
  }) as ZodMiniArray<T>;
}

// ZodMiniObjectLike
export interface ZodMiniObjectLike<out O = object, out I = object> extends ZodMiniType {
  _zod: core.$ZodObjectLikeInternals<O, I>;
}
export const ZodMiniObjectLike: core.$constructor<ZodMiniObjectLike> = /*@__PURE__*/ core.$constructor(
  "ZodMiniObjectLike",
  (inst, def) => {
    core.$ZodObjectLike.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

// .keyof
export function keyof<T extends ZodMiniObject>(schema: T): ZodMiniLiteral<keyof T["_zod"]["def"]["shape"]>;
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
export const ZodMiniInterface: core.$constructor<ZodMiniInterface> = /*@__PURE__*/ core.$constructor(
  "ZodMiniInterface",
  (inst, def) => {
    core.$ZodInterface.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

function _interface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams,
  Class: util.Constructor<ZodMiniInterface> = ZodMiniInterface
): ZodMiniInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: core.$ZodInterfaceDef = {
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
export { _interface as interface };

// strictInterface

export function strictInterface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams
): ZodMiniInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
  const cleaned = util.cached(() => util.cleanInterfaceShape(shape));
  const def: core.$ZodInterfaceDef = {
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
    catchall: never(),
    ...util.normalizeParams(params),
  };
  return new ZodMiniInterface(def) as any;
}

// looseInterface

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
      // return cleaned.value.shape;
      const _shape = cleaned.value.shape;
      util.assignProp(this, "shape", _shape);
      return _shape;
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
export const ZodMiniObject: core.$constructor<ZodMiniObject> = /*@__PURE__*/ core.$constructor(
  "ZodMiniObject",
  (inst, def) => {
    core.$ZodObject.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);
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
): ZodMiniInterface<util.Extend<T["_zod"]["def"]["shape"], U["_zod"]["def"]["shape"]>, util.MergeInterfaceParams<T, U>>;
export function extend<T extends ZodMiniObject, U extends ZodMiniObject>(
  a: T,
  b: U
): ZodMiniObject<
  util.Extend<T["_zod"]["def"]["shape"], U["_zod"]["def"]["shape"]>,
  U["_zod"]["extra"] & T["_zod"]["extra"]
>;

export function extend<T extends ZodMiniInterface, U extends core.$ZodLooseShape>(
  a: T,
  b: U
): ZodMiniInterface<util.ExtendInterfaceShape<T["_zod"]["def"]["shape"], U>, util.ExtendInterfaceParams<T, U>>;
export function extend<T extends ZodMiniObject, U extends core.$ZodLooseShape>(
  a: T,
  b: U
): ZodMiniObject<util.Extend<T["_zod"]["def"]["shape"], U>, T["_zod"]["extra"]>;
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
  ? ZodMiniInterface<
      util.Extend<T["_zod"]["def"]["shape"], U["_zod"]["def"]["shape"]>,
      {
        extra: T["_zod"]["extra"] & U["_zod"]["extra"];
        optional: Exclude<T["_zod"]["optional"], keyof U["_zod"]["def"]["shape"]> | U["_zod"]["optional"];
        defaulted: Exclude<T["_zod"]["defaulted"], keyof U["_zod"]["def"]["shape"]> | U["_zod"]["defaulted"];
      }
    >
  : ZodMiniObject<util.Extend<T["_zod"]["def"]["shape"], U>, T["_zod"]["extra"]>;
export function merge(a: ZodMiniObjectLike, b: ZodMiniObjectLike): ZodMiniObjectLike {
  return util.mergeObjectLike(a, b);
}

// .pick
export function pick<
  T extends ZodMiniObjectLike,
  M extends util.Exactly<util.Mask<keyof T["_zod"]["def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.Flatten<Pick<T["_zod"]["def"]["shape"], keyof T["_zod"]["def"]["shape"] & keyof M>>,
      {
        optional: Extract<T["_zod"]["optional"], keyof M>;
        defaulted: Extract<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<
      util.Flatten<Pick<T["_zod"]["def"]["shape"], keyof T["_zod"]["def"]["shape"] & keyof M>>,
      T["_zod"]["extra"]
    >;
export function pick(schema: ZodMiniObjectLike, mask: object) {
  return util.pick(schema, mask);
}

// .omit
export function omit<
  T extends ZodMiniObjectLike,
  const M extends util.Exactly<util.Mask<keyof T["_zod"]["def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.Flatten<Omit<T["_zod"]["def"]["shape"], keyof M>>,
      {
        optional: Exclude<T["_zod"]["optional"], keyof M>;
        defaulted: Exclude<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<util.Flatten<Omit<T["_zod"]["def"]["shape"], keyof M>>, T["_zod"]["extra"]>;

export function omit(schema: ZodMiniObjectLike, mask: object) {
  return util.omit(schema, mask);
}

export function partial<T extends ZodMiniObjectLike>(
  schema: T
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      // T['_zod']["shape"],
      {
        [k in keyof T["_zod"]["def"]["shape"]]: ZodMiniOptional<T["_zod"]["def"]["shape"][k]>;
      },
      {
        optional: string & keyof T["_zod"]["def"]["shape"];
        defaulted: never;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodMiniObject<
      {
        [k in keyof T["_zod"]["def"]["shape"]]: ZodMiniOptional<T["_zod"]["def"]["shape"][k]>;
      },
      T["_zod"]["extra"]
    >;
export function partial<
  T extends ZodMiniObjectLike,
  M extends util.Exactly<util.Mask<keyof T["_zod"]["def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodMiniInterface<
      util.Extend<
        T["_zod"]["def"]["shape"],
        {
          [k in keyof M & keyof T["_zod"]["def"]["shape"]]: ZodMiniOptional<T["_zod"]["def"]["shape"][k]>;
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
        [k in keyof T["_zod"]["def"]["shape"]]: k extends keyof M
          ? ZodMiniOptional<T["_zod"]["def"]["shape"][k]>
          : T["_zod"]["def"]["shape"][k];
      },
      T["_zod"]["extra"]
    >;

export function partial(schema: ZodMiniObjectLike, mask?: object): ZodMiniObjectLike {
  return util.partialObjectLike(ZodMiniOptional, schema, mask);
}

// .required
export function required<T extends { _zod: { subtype: "object" } } & ZodMiniObject>(
  schema: T
): ZodMiniObject<{
  [k in keyof T["_zod"]["def"]["shape"]]: ZodMiniNonOptional<T["_zod"]["def"]["shape"][k]>;
}>;
export function required<
  T extends { _zod: { subtype: "object" } } & ZodMiniObject,
  M extends util.Exactly<util.Mask<keyof T["_zod"]["def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): ZodMiniObject<
  util.Extend<
    T["_zod"]["def"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["def"]["shape"]]: ZodMiniNonOptional<T["_zod"]["def"]["shape"][k]>;
    }
  >
>;
export function required<T extends { _zod: { subtype: "interface" } } & ZodMiniInterface>(
  schema: T
): ZodMiniInterface<
  {
    [k in keyof T["_zod"]["def"]["shape"]]: ZodMiniNonOptional<T["_zod"]["def"]["shape"][k]>;
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
  util.Extend<
    T["_zod"]["def"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["def"]["shape"]]: ZodMiniNonOptional<T["_zod"]["def"]["shape"][k]>;
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
export const ZodMiniUnion: core.$constructor<ZodMiniUnion> = /*@__PURE__*/ core.$constructor(
  "ZodMiniUnion",
  (inst, def) => {
    core.$ZodUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniDiscriminatedUnion: core.$constructor<ZodMiniDiscriminatedUnion> = /*@__PURE__*/ core.$constructor(
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
export const ZodMiniIntersection: core.$constructor<ZodMiniIntersection> = /*@__PURE__*/ core.$constructor(
  "ZodMiniIntersection",
  (inst, def) => {
    core.$ZodIntersection.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniTuple: core.$constructor<ZodMiniTuple> = /*@__PURE__*/ core.$constructor(
  "ZodMiniTuple",
  (inst, def) => {
    core.$ZodTuple.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniRecord: core.$constructor<ZodMiniRecord> = /*@__PURE__*/ core.$constructor(
  "ZodMiniRecord",
  (inst, def) => {
    core.$ZodRecord.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniMap: core.$constructor<ZodMiniMap> = /*@__PURE__*/ core.$constructor("ZodMiniMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodMiniType.init(inst, def);
});

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
export const ZodMiniSet: core.$constructor<ZodMiniSet> = /*@__PURE__*/ core.$constructor("ZodMiniSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodMiniType.init(inst, def);
});

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
export const ZodMiniEnum: core.$constructor<ZodMiniEnum> = /*@__PURE__*/ core.$constructor(
  "ZodMiniEnum",
  (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

function _enum<const T extends string[]>(values: T, params?: core.$ZodEnumParams): ZodMiniEnum<util.ToEnum<T[number]>>;
function _enum<T extends util.EnumLike>(entries: T, params?: core.$ZodEnumParams): ZodMiniEnum<T>;
function _enum(values: any, params?: core.$ZodEnumParams) {
  const entries: any = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;

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
export const ZodMiniLiteral: core.$constructor<ZodMiniLiteral> = /*@__PURE__*/ core.$constructor(
  "ZodMiniLiteral",
  (inst, def) => {
    core.$ZodLiteral.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniFile: core.$constructor<ZodMiniFile> = /*@__PURE__*/ core.$constructor(
  "ZodMiniFile",
  (inst, def) => {
    core.$ZodFile.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function file(params?: string | core.$ZodFileParams): ZodMiniFile {
  return core._file(ZodMiniFile, params) as any;
}

// ZodMiniTransform
export interface ZodMiniTransform<O = unknown, I = unknown> extends ZodMiniType {
  _zod: core.$ZodTransformInternals<O, I>;
}
export const ZodMiniTransform: core.$constructor<ZodMiniTransform> = /*@__PURE__*/ core.$constructor(
  "ZodMiniTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function transform<I = unknown, O = I>(
  fn: (input: I, ctx: core.ParsePayload) => O,
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
export const ZodMiniOptional: core.$constructor<ZodMiniOptional> = /*@__PURE__*/ core.$constructor(
  "ZodMiniOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniNullable: core.$constructor<ZodMiniNullable> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNullable",
  (inst, def) => {
    core.$ZodNullable.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

export function nullable<T extends SomeType>(innerType: T, params?: core.$ZodNullableParams): ZodMiniNullable<T> {
  return new ZodMiniNullable({
    type: "nullable",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodMiniNullable<T>;
}

// nullish
export function nullish<T extends SomeType>(innerType: T): ZodMiniOptional<ZodMiniNullable<T>> {
  return optional(nullable(innerType));
}

// ZodMiniDefault
export interface ZodMiniDefault<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodDefaultInternals<T>;
}
export const ZodMiniDefault: core.$constructor<ZodMiniDefault> = /*@__PURE__*/ core.$constructor(
  "ZodMiniDefault",
  (inst, def) => {
    core.$ZodDefault.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniNonOptional: core.$constructor<ZodMiniNonOptional> = /*@__PURE__*/ core.$constructor(
  "ZodMiniNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniSuccess: core.$constructor<ZodMiniSuccess> = /*@__PURE__*/ core.$constructor(
  "ZodMiniSuccess",
  (inst, def) => {
    core.$ZodSuccess.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniCatch: core.$constructor<ZodMiniCatch> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCatch",
  (inst, def) => {
    core.$ZodCatch.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniNaN: core.$constructor<ZodMiniNaN> = /*@__PURE__*/ core.$constructor("ZodMiniNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodMiniType.init(inst, def);
});

export function nan(params?: string | core.$ZodNaNParams): ZodMiniNaN {
  return core._nan(ZodMiniNaN, params) as any;
}

// ZodMiniPipe
export interface ZodMiniPipe<A extends SomeType = SomeType, B extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodPipeInternals<A, B>;
}
export const ZodMiniPipe: core.$constructor<ZodMiniPipe> = /*@__PURE__*/ core.$constructor(
  "ZodMiniPipe",
  (inst, def) => {
    core.$ZodPipe.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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

// /** @deprecated Use `z.pipe()` and `z.transform()` instead. */
// export function preprocess<A, U extends core.$ZodType>(
//   fn: (arg: unknown, ctx: core.ParsePayload) => A,
//   schema: U,
//   params?: ZodPreprocessParams
// ): ZodPipe<ZodTransform<A, unknown>, U> {
//   return pipe(transform(fn as any, params), schema as any, params);
// }

// ZodMiniReadonly
export interface ZodMiniReadonly<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodReadonlyInternals<T>;
}
export const ZodMiniReadonly: core.$constructor<ZodMiniReadonly> = /*@__PURE__*/ core.$constructor(
  "ZodMiniReadonly",
  (inst, def) => {
    core.$ZodReadonly.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniTemplateLiteral: core.$constructor<ZodMiniTemplateLiteral> = /*@__PURE__*/ core.$constructor(
  "ZodMiniTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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

// ZodMiniLazy
export interface ZodMiniLazy<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodLazyInternals<T>;
}
export const ZodMiniLazy: core.$constructor<ZodMiniLazy> = /*@__PURE__*/ core.$constructor(
  "ZodMiniLazy",
  (inst, def) => {
    core.$ZodLazy.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

// export function lazy<T extends object>(getter: () => T): T {
//   return util.createTransparentProxy<T>(getter);
// }
function _lazy<T extends SomeType>(getter: () => T): ZodMiniLazy<T> {
  return new ZodMiniLazy({
    type: "lazy",
    getter,
  }) as ZodMiniLazy<T>;
}
export { _lazy as lazy };

// ZodMiniPromise
export interface ZodMiniPromise<T extends SomeType = SomeType> extends ZodMiniType {
  _zod: core.$ZodPromiseInternals<T>;
}
export const ZodMiniPromise: core.$constructor<ZodMiniPromise> = /*@__PURE__*/ core.$constructor(
  "ZodMiniPromise",
  (inst, def) => {
    core.$ZodPromise.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

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
export const ZodMiniCustom: core.$constructor<ZodMiniCustom> = /*@__PURE__*/ core.$constructor(
  "ZodMiniCustom",
  (inst, def) => {
    core.$ZodCustom.init(inst, def);
    ZodMiniType.init(inst, def);
  }
);

// custom checks
export function check<O = unknown>(fn: core.CheckFn<O>, params?: core.$ZodCustomParams): core.$ZodCheck<O> {
  const ch = new core.$ZodCheck({
    check: "custom",
    ...util.normalizeParams(params),
  });

  ch._zod.check = fn;
  return ch;
}

// ZodCustom
function _custom<O = unknown, I = O>(
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

// refine
export function refine<T>(
  fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
  _params: string | core.$ZodCustomParams = {}
): core.$ZodCheck<T> {
  return _custom(fn, _params, ZodMiniCustom);
}

// custom schema
export function custom<O = unknown, I = O>(
  fn?: (data: O) => unknown,
  _params?: string | core.$ZodCustomParams | undefined
): ZodMiniCustom<O, I> {
  return _custom(fn ?? (() => true), _params, ZodMiniCustom);
}

// instanceof
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

// stringbool
export const stringbool: (_params?: core.$ZodStringBoolParams) => ZodMiniPipe<ZodMiniUnknown, ZodMiniBoolean<boolean>> =
  /* @__PURE__ */ core._stringbool.bind(null, {
    Pipe: ZodMiniPipe,
    Boolean: ZodMiniBoolean,
    Unknown: ZodMiniUnknown,
  }) as any;

// json
export type ZodMiniJSONSchema = ZodMiniLazy<
  ZodMiniUnion<
    [
      ZodMiniString<string>,
      ZodMiniNumber<number>,
      ZodMiniBoolean<boolean>,
      ZodMiniNull,
      ZodMiniArray<ZodMiniJSONSchema>,
      ZodMiniRecord<ZodMiniString<string>, ZodMiniJSONSchema>,
    ]
  >
> & {
  _zod: {
    input: util.JSONType;
    output: util.JSONType;
  };
};

export function json(): ZodMiniJSONSchema {
  const jsonSchema: ZodMiniJSONSchema = _lazy(() => {
    return union([string(), number(), boolean(), _null(), array(jsonSchema), record(string(), jsonSchema)]);
  }) as ZodMiniJSONSchema;
  return jsonSchema;
}
