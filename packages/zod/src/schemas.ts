import * as core from "@zod/core";
import * as util from "@zod/core/util";
import * as api from "./api.js";
import * as factories from "./factories.js";
import { type ZodSafeParseResult, parse, parseAsync, safeParse, safeParseAsync } from "./parse.js";

export type CustomErrorParams = Omit<core.$ZodIssueBase, "code">;
export interface ParseContext extends core.$ParseContext {}

///////////////////////////////////////////
///////////////////////////////////////////
////////////                   ////////////
////////////      ZodType      ////////////
////////////                   ////////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface RefinementCtx<T = unknown> extends core.$ParsePayload<T> {
  addIssue(arg: string | core.$ZodRawIssue | Partial<core.$ZodIssueCustom>): void;
}

export interface ZodType<out Output = unknown, out Input = unknown> extends core.$ZodType<Output, Input> {
  $check(...checks: (core.$ZodCheckFn<this["_zod"]["output"]> | core.$ZodCheck<this["_zod"]["output"]>)[]): this;
  $clone(def?: this["_zod"]["def"]): this;
  $register<R extends core.$ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [core.$ZodRegistry<R["_meta"], this>["_meta"]?]
        : [core.$ZodRegistry<R["_meta"], this>["_meta"]]
      : ["Incompatible schema"]
  ): this;
  $brand<T extends PropertyKey = PropertyKey>(
    value?: T
  ): this & {
    _output: Output & core.$brand<T>;
  };

  // parsing
  parse(data: unknown, params?: ParseContext): this["_zod"]["output"];
  safeParse(data: unknown, params?: ParseContext): ZodSafeParseResult<this["_zod"]["output"]>;
  parseAsync(data: unknown, params?: ParseContext): Promise<this["_zod"]["output"]>;
  safeParseAsync(data: unknown, params?: ParseContext): Promise<ZodSafeParseResult<this["_zod"]["output"]>>;
  spa: (data: unknown, params?: ParseContext) => Promise<ZodSafeParseResult<this["_zod"]["output"]>>;

  // refinements
  refine(check: (arg: Output) => unknown | Promise<unknown>, params?: string | core.$ZodCustomParams): this;
  /** @deprecated Use `.$check()` instead. */
  superRefine(refinement: (arg: Output, ctx: RefinementCtx<Output>) => void | Promise<void>): this;
  overwrite(fn: (x: Output) => Output): this;

  // wrappers
  optional(params?: core.$ZodOptionalParams): ZodOptional<this>;
  nonoptional(params?: core.$ZodNonOptionalParams): ZodNonOptional<this>;
  nullable(params?: core.$ZodNullParams): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  default(def: util.NoUndefined<Output>, params?: core.$ZodDefaultParams): ZodDefault<this>;
  default(def: () => util.NoUndefined<Output>, params?: core.$ZodDefaultParams): ZodDefault<this>;
  array(): ZodArray<this>;
  or<T extends core.$ZodType>(option: T): ZodUnion<[this, T]>;
  and<T extends core.$ZodType>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(
    transform: (arg: Output, ctx: RefinementCtx<Output>) => NewOut | Promise<NewOut>
  ): ZodPipe<this, ZodTransform<Awaited<NewOut>, core.output<this>>>;
  catch(def: Output): ZodCatch<this>;
  catch(def: (ctx: core.$ZodCatchCtx) => Output): ZodCatch<this>;
  pipe<T extends core.$ZodType>(target: T): ZodPipe<this, T>;
  readonly(): ZodReadonly<this>;

  // metadata
  describe(description: string): this;
  description?: string;
  /** Registers schema to z.globalRegistry with the specified metadata */
  meta(): core.GlobalMeta | undefined;
  meta(data: core.$replace<core.GlobalMeta, this>): this;

  // helpers
  isOptional(): boolean;
  isNullable(): boolean;
}

export const ZodType: core.$constructor<ZodType> = /*@__PURE__*/ core.$constructor("ZodType", (inst, def) => {
  core.$ZodType.init(inst, def);

  inst._zod.def = def;

  // parsing
  inst.parse = (data, params) => parse(inst, data, params);
  inst.safeParse = (data, params) => safeParse(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync(inst, data, params);
  inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
  inst.spa = inst.safeParseAsync;

  // refinements
  inst.refine = (check, params) => inst.$check(api.refine(check, params));
  inst.superRefine = (refinement) => inst.$check(api.superRefine(refinement));
  inst.overwrite = (fn) => inst.$check(api.overwrite(fn));

  // wrappers
  inst.optional = (params) => api.optional(inst, params);
  inst.nullable = (params) => api.nullable(inst, params);
  inst.nullish = () => api.optional(api.nullable(inst));
  inst.nonoptional = (params) => api.nonoptional(inst, params);
  inst.array = () => api.array(inst);
  inst.or = (arg) => api.union([inst, arg]);
  inst.and = (arg) => api.intersection(inst, arg);
  inst.transform = (tx) => api.pipe(inst, api.transform(tx as any)) as never;
  inst.default = (def, params) => api._default(inst, def, params);
  // inst.coalesce = (def, params) => api.coalesce(inst, def, params);
  inst.catch = (params) => api.catch(inst, params);
  inst.pipe = (target) => api.pipe(inst, target);
  inst.readonly = () => api.readonly(inst);

  // meta
  inst.describe = (description) => {
    const meta = core.globalRegistry.get(inst) ?? {};
    meta.description = description;
    core.globalRegistry.add(inst, meta);
    return inst;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return core.globalRegistry.get(inst)?.description;
    },
    configurable: true,
  });
  inst.meta = (...args: any) => {
    if (args.length === 0) return core.globalRegistry.get(inst);
    core.globalRegistry.add(inst, args[0]);
    return inst as any;
  };

  // helpers
  inst.isOptional = () => inst.safeParse(undefined).success;
  inst.isNullable = () => inst.safeParse(null).success;
  return inst;
});

/** @deprecated Use z.ZodType (without generics) instead. */
export type ZodTypeAny = ZodType;

/////////////////////////////////////////////
/////////////////////////////////////////////
////////////                     ////////////
////////////      ZodString      ////////////
////////////                     ////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export type StringFormatParams<Extra = unknown> = util.MethodParams<
  core.$ZodIssueInvalidStringFormat, // | core.$ZodIssueInvalidType,
  Extra
>;
// type ZodURLParams = util.StringFormatParams<ZodURL, "coerce">[""];

export interface ZodString extends ZodType {
  _zod: core._$ZodString<string>;
  // _isst: core.$ZodIssueInvalidType;

  format: string | null;
  minLength: number | null;
  maxLength: number | null;

  // string format checks
  // email(): ZodString;
  // email(params?: string): ZodString;
  // email(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.email()` instead. */
  email(params?: string | core.$ZodCheckEmailParams): ZodString;
  /** @deprecated Use `z.url()` instead. */
  url(params?: string | core.$ZodCheckURLParams): ZodString;
  /** @deprecated Use `z.jwt()` instead. */
  jwt(params?: string | core.$ZodCheckJWTParams): ZodString;
  /** @deprecated Use `z.emoji()` instead. */
  emoji(params?: string | core.$ZodCheckEmojiParams): ZodString;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | core.$ZodCheckGUIDParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuid(params?: string | core.$ZodCheckUUIDParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv4(params?: string | core.$ZodCheckUUIDParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv6(params?: string | core.$ZodCheckUUIDParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv7(params?: string | core.$ZodCheckUUIDParams): ZodString;
  /** @deprecated Use `z.nanoid()` instead. */
  nanoid(params?: string | core.$ZodCheckNanoIDParams): ZodString;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | core.$ZodCheckGUIDParams): ZodString;
  /** @deprecated Use `z.cuid()` instead. */
  cuid(params?: string | core.$ZodCheckCUIDParams): ZodString;
  /** @deprecated Use `z.cuid2()` instead. */
  cuid2(params?: string | core.$ZodCheckCUID2Params): ZodString;
  /** @deprecated Use `z.ulid()` instead. */
  ulid(params?: string | core.$ZodCheckULIDParams): ZodString;
  /** @deprecated Use `z.base64()` instead. */
  base64(params?: string | core.$ZodCheckBase64Params): ZodString;
  // /** @deprecated Use `z.jsonString()` instead. */
  // jsonString(params?: string | core.$ZodCheckJSONStringParams): ZodString;
  /** @deprecated Use `z.xid()` instead. */
  xid(params?: string | core.$ZodCheckXIDParams): ZodString;
  /** @deprecated Use `z.ksuid()` instead. */
  ksuid(params?: string | core.$ZodCheckKSUIDParams): ZodString;
  /** @deprecated Use `z.ip()` instead. */
  ip(params?: string | core.$ZodCheckIPParams): ZodString;
  /** @deprecated Use `z.ipv4()` instead. */
  ipv4(params?: string | core.$ZodCheckIPv4Params): ZodString;
  /** @deprecated Use `z.ipv6()` instead. */
  ipv6(params?: string | core.$ZodCheckIPv6Params): ZodString;
  /** @deprecated Use `z.e164()` instead. */
  e164(params?: string | core.$ZodCheckE164Params): ZodString;

  // ISO 8601 checks
  /** @deprecated Use `z.iso.datetime()` instead. */
  datetime(params?: string | core.iso.$ZodISODateTimeParams): ZodString;
  /** @deprecated Use `z.iso.date()` instead. */
  date(params?: string | core.iso.$ZodISODateParams): ZodString;
  /** @deprecated Use `z.iso.time()` instead. */
  time(
    params?:
      | string
      // | {
      //     message?: string | undefined;
      //     precision?: number | null;
      //   }
      | core.iso.$ZodISOTimeParams
  ): ZodString;
  /** @deprecated Use `z.iso.duration()` instead. */
  duration(params?: string | core.iso.$ZodISODurationParams): ZodString;

  // /** @deprecated Use `z.jsonString()` instead. */
  // json(params?: string | core.$ZodCheckJSONStringParams): this;

  // miscellaneous checks
  regex(regex: RegExp, params?: StringFormatParams): ZodString;
  includes(value: string, params?: { message?: string; position?: number }): ZodString;
  startsWith(value: string, params?: string | core.$ZodCheckStartsWithParams): ZodString;
  endsWith(value: string, params?: string | core.$ZodCheckEndsWithParams): ZodString;
  min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): ZodString;
  max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): ZodString;
  length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): ZodString;
  nonempty(params?: string | core.$ZodCheckMinLengthParams): ZodString;
  lowercase(params?: string | core.$ZodCheckLowerCaseParams): ZodString;
  uppercase(params?: string | core.$ZodCheckUpperCaseParams): ZodString;

  // transforms
  trim(): ZodString;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
}

export const ZodString: core.$constructor<ZodString> = /*@__PURE__*/ core.$constructor("ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  ZodType.init(inst, def);

  inst.format = inst._zod.computed.format ?? null;
  inst.minLength = inst._zod.computed.minimum ?? null;
  inst.maxLength = inst._zod.computed.maximum ?? null;

  inst.email = (params) => inst.$check(factories._email(params));
  inst.url = (params) => inst.$check(factories._url(params));
  inst.jwt = (params) => inst.$check(factories._jwt(params));
  inst.emoji = (params) => inst.$check(factories._emoji(params));
  inst.guid = (params) => inst.$check(factories._guid(params));
  inst.uuid = (params) => inst.$check(factories._uuid(params));
  inst.uuidv4 = (params) => inst.$check(factories._uuid(params));
  inst.uuidv6 = (params) => inst.$check(factories._uuid(params));
  inst.uuidv7 = (params) => inst.$check(factories._uuid(params));
  inst.nanoid = (params) => inst.$check(factories._nanoid(params));
  inst.guid = (params) => inst.$check(factories._guid(params));
  inst.cuid = (params) => inst.$check(factories._cuid(params));
  inst.cuid2 = (params) => inst.$check(factories._cuid2(params));
  inst.ulid = (params) => inst.$check(factories._ulid(params));
  inst.base64 = (params) => inst.$check(factories._base64(params));
  // inst.jsonString = (params) => inst.$check(factories._jsonString(params));
  // inst.json = (params) => inst.$check(factories._jsonString(params));
  inst.xid = (params) => inst.$check(factories._xid(params));
  inst.ksuid = (params) => inst.$check(factories._ksuid(params));
  inst.ip = (params) => inst.$check(factories._ip(params));
  inst.ipv4 = (params) => inst.$check(factories._ipv4(params));
  inst.ipv6 = (params) => inst.$check(factories._ipv6(params));
  inst.e164 = (params) => inst.$check(factories._e164(params));

  inst.datetime = (params) => inst.$check(api.iso.datetime(params));
  inst.date = (params) => inst.$check(api.iso.date(params));
  inst.time = (params) => inst.$check(api.iso.time(params));
  inst.duration = (params) => inst.$check(api.iso.duration(params));

  // validations
  inst.regex = (params) => inst.$check(core.regex(params));
  inst.includes = (...args) => inst.$check(core.includes(...args));
  inst.startsWith = (params) => inst.$check(core.startsWith(params));
  inst.endsWith = (params) => inst.$check(core.endsWith(params));
  inst.min = (...args) => inst.$check(core.minLength(...args));
  inst.max = (...args) => inst.$check(core.maxLength(...args));
  inst.length = (...args) => inst.$check(core.length(...args));
  inst.nonempty = (...args) => inst.$check(core.minLength(1, ...args));
  inst.lowercase = (params) => inst.$check(core.lowercase(params));
  inst.uppercase = (params) => inst.$check(core.uppercase(params));

  // transforms
  inst.trim = () => inst.$check(core.trim());
  inst.normalize = (...args) => inst.$check(core.normalize(...args));
  inst.toLowerCase = () => inst.$check(core.toLowerCase());
  inst.toUpperCase = () => inst.$check(core.toUpperCase());
});

// interface ZodNumberFormat extends ZodNumber, ZodCheckNumber {

// }

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodGUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodGUID extends ZodType {
  _zod: core._$ZodGUID;
  // _isst: core.$ZodIssueInvalidType;
}

export const ZodGUID: core.$constructor<ZodGUID> = /*@__PURE__*/ core.$constructor("ZodGUID", (inst, def): void => {
  core.$ZodGUID.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodUUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodUUID extends ZodType {
  _zod: core._$ZodUUID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodUUID: core.$constructor<ZodUUID> = /*@__PURE__*/ core.$constructor("ZodUUID", (inst, def): void => {
  core.$ZodUUID.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodEmail      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodEmail extends ZodType {
  _zod: core._$ZodEmail;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodEmail: core.$constructor<ZodEmail> = /*@__PURE__*/ core.$constructor("ZodEmail", (inst, def) => {
  core.$ZodEmail.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodURL      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodURL extends ZodType {
  _zod: core._$ZodURL;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodURL: core.$constructor<ZodURL> = /*@__PURE__*/ core.$constructor("ZodURL", function (inst, def) {
  core.$ZodURL.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodEmoji      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodEmoji extends ZodType {
  _zod: core._$ZodEmoji;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodEmoji: core.$constructor<ZodEmoji> = /*@__PURE__*/ core.$constructor("ZodEmoji", (inst, def) => {
  core.$ZodEmoji.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNanoID      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodNanoID extends ZodType {
  _zod: core._$ZodNanoID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodNanoID: core.$constructor<ZodNanoID> = /*@__PURE__*/ core.$constructor("ZodNanoID", (inst, def) => {
  core.$ZodNanoID.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodCUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodCUID extends ZodType {
  _zod: core._$ZodCUID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodCUID: core.$constructor<ZodCUID> = /*@__PURE__*/ core.$constructor("ZodCUID", (inst, def) => {
  core.$ZodCUID.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodCUID2       //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodCUID2 extends ZodType {
  _zod: core._$ZodCUID2;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodCUID2: core.$constructor<ZodCUID2> = /*@__PURE__*/ core.$constructor("ZodCUID2", (inst, def) => {
  core.$ZodCUID2.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodULID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodULID extends ZodType {
  _zod: core._$ZodULID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodULID: core.$constructor<ZodULID> = /*@__PURE__*/ core.$constructor("ZodULID", (inst, def) => {
  core.$ZodULID.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodXID      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodXID extends ZodType {
  _zod: core._$ZodXID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodXID: core.$constructor<ZodXID> = /*@__PURE__*/ core.$constructor("ZodXID", (inst, def) => {
  core.$ZodXID.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodKSUID      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodKSUID extends ZodType {
  _zod: core._$ZodKSUID;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodKSUID: core.$constructor<ZodKSUID> = /*@__PURE__*/ core.$constructor("ZodKSUID", (inst, def) => {
  core.$ZodKSUID.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodISODateTime      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISODateTime extends ZodType {
  _zod: core._$ZodISODateTime;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodISODateTime: core.$constructor<ZodISODateTime> = /*@__PURE__*/ core.$constructor(
  "ZodISODateTime",
  (inst, def) => {
    core.$ZodISODateTime.init(inst, def);
    ZodType.init(inst, def);
  }
);

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodISODate      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodISODate extends ZodType {
  _zod: core._$ZodISODate;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodISODate: core.$constructor<ZodISODate> = /*@__PURE__*/ core.$constructor("ZodISODate", (inst, def) => {
  core.$ZodISODate.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodISOTime      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodISOTime extends ZodType {
  _zod: core._$ZodISOTime;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodISOTime: core.$constructor<ZodISOTime> = /*@__PURE__*/ core.$constructor("ZodISOTime", (inst, def) => {
  core.$ZodISOTime.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodISODuration      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISODuration extends ZodType {
  _zod: core._$ZodISODuration;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodISODuration: core.$constructor<ZodISODuration> = /*@__PURE__*/ core.$constructor(
  "ZodISODuration",
  (inst, def) => {
    core.$ZodISODuration.init(inst, def);
    ZodType.init(inst, def);
  }
);

/////////////////////////////////////
/////////////////////////////////////
//////////                 //////////
//////////      ZodIP      //////////
//////////                 //////////
/////////////////////////////////////
/////////////////////////////////////
export interface ZodIP extends ZodType {
  _zod: core._$ZodIP;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodIP: core.$constructor<ZodIP> = /*@__PURE__*/ core.$constructor("ZodIP", (inst, def) => {
  core.$ZodIP.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBase64      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodBase64 extends ZodType {
  _zod: core._$ZodBase64;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodBase64: core.$constructor<ZodBase64> = /*@__PURE__*/ core.$constructor("ZodBase64", (inst, def) => {
  core.$ZodBase64.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodJSONString      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// export interface ZodJSONString ZodType {
// _zod   _def: core._$ZodJSONString;
//   _isst: core.$ZodIssueInvalidType;
// }
// export const ZodJSONString: core.$constructor<ZodJSONString> = /*@__PURE__*/ core.$constructor(
//   "ZodJSONString",
//   (inst, def) => {
//     core.$ZodJSONString.init(inst, def);
//     ZodType.init(inst, def);
//   }
// );

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodE164        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodE164 extends ZodType {
  _zod: core._$ZodE164;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodE164: core.$constructor<ZodE164> = /*@__PURE__*/ core.$constructor("ZodE164", (inst, def) => {
  core.$ZodE164.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodJWT      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodJWT extends ZodType {
  _zod: core._$ZodJWT;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodJWT: core.$constructor<ZodJWT> = /*@__PURE__*/ core.$constructor("ZodJWT", (inst, def) => {
  core.$ZodJWT.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodNumber extends ZodType {
  _zod: core._$ZodNumber;
  // _isst: core.$ZodIssueInvalidType;
  gt(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
  /** Identical to .min() */
  gte(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
  min(value: number, params?: string | core.$ZodCheckGreaterThanParams): this;
  lt(value: number, params?: string | core.$ZodCheckLessThanParams): this;
  /** Identical to .max() */
  lte(value: number, params?: string | core.$ZodCheckLessThanParams): this;
  max(value: number, params?: string | core.$ZodCheckLessThanParams): this;
  /** @deprecated Use `z.int()` instead. */
  int(params?: string | core.$ZodCheckNumberFormatParams): this;
  /** @deprecated This is now identical to `.int()` instead. Only numbers in the safe integer range are accepted. */
  safe(params?: string | core.$ZodCheckNumberFormatParams): this;
  positive(params?: string | core.$ZodCheckGreaterThanParams): this;
  nonnegative(params?: string | core.$ZodCheckGreaterThanParams): this;
  negative(params?: string | core.$ZodCheckLessThanParams): this;
  nonpositive(params?: string | core.$ZodCheckLessThanParams): this;
  multipleOf(value: number, params?: string | core.$ZodCheckMultipleOfParams): this;
  /** @deprecated Use `.multipleOf()` instead. */
  step(value: number, params?: string | core.$ZodCheckMultipleOfParams): this;

  /** @deprecated In v4 and later, z.number() does not allow infinite values. This is a no-op. */
  finite(params?: any): this;

  minValue: number | null;
  maxValue: number | null;
  /** @deprecated Check `format` property instead.  */
  isInt: boolean;
  /** @deprecated Number schemas no longer accept infinite values, so this always returns `true`. */
  isFinite: boolean;
  format: string | null;
}

export const ZodNumber: core.$constructor<ZodNumber> = /*@__PURE__*/ core.$constructor("ZodNumber", (inst, def) => {
  core.$ZodNumber.init(inst, def);
  ZodType.init(inst, def);

  inst.gt = (value, params) => inst.$check(core.gt(value, params));
  inst.gte = (value, params) => inst.$check(core.gte(value, params));
  inst.min = (value, params) => inst.$check(core.gte(value, params));
  inst.lt = (value, params) => inst.$check(core.lt(value, params));
  inst.lte = (value, params) => inst.$check(core.lte(value, params));
  inst.max = (value, params) => inst.$check(core.lte(value, params));
  inst.int = (params) => inst.$check(core.int(params));
  inst.safe = (params) => inst.$check(core.int(params));
  inst.positive = (params) => inst.$check(core.gt(0, params));
  inst.nonnegative = (params) => inst.$check(core.gte(0, params));
  inst.negative = (params) => inst.$check(core.lt(0, params));
  inst.nonpositive = (params) => inst.$check(core.lte(0, params));
  inst.multipleOf = (value, params) => inst.$check(core.multipleOf(value, params));
  inst.step = (value, params) => inst.$check(core.multipleOf(value, params));

  // inst.finite = (params) => inst.$check(core.finite(params));
  inst.finite = () => inst;

  inst.minValue = inst._zod.computed.minimum ?? null;
  inst.maxValue = inst._zod.computed.maximum ?? null;
  inst.isInt =
    (inst._zod.computed.format ?? "").includes("int") || Number.isSafeInteger(inst._zod.computed.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = inst._zod.computed.format ?? null;
});

/////////////////////////////////////////////
/////////      ZodNumberFormat      /////////
/////////////////////////////////////////////

export interface ZodNumberFormat extends ZodNumber, core.$ZodNumberFormat {
  _zod: core._$ZodNumberFormat;
}

export const ZodNumberFormat: core.$constructor<ZodNumberFormat> = /*@__PURE__*/ core.$constructor(
  "ZodNumberFormat",
  (inst, def) => {
    core.$ZodNumberFormat.init(inst, def); // no format checks
    ZodNumber.init(inst, def);
  }
);

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodBoolean      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodBoolean extends ZodType {
  _zod: core._$ZodBoolean;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodBoolean: core.$constructor<ZodBoolean> = /*@__PURE__*/ core.$constructor("ZodBoolean", (inst, def) => {
  core.$ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBigInt      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodBigInt extends ZodType {
  _zod: core._$ZodBigInt;
  // _isst: core.$ZodIssueInvalidType;

  gte(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
  /** Alias of `.gte()` */
  min(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
  gt(value: bigint, params?: string | core.$ZodCheckGreaterThanParams): this;
  /** Alias of `.lte()` */
  lte(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
  max(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
  lt(value: bigint, params?: string | core.$ZodCheckLessThanParams): this;
  positive(params?: string | core.$ZodCheckGreaterThanParams): this;
  negative(params?: string | core.$ZodCheckLessThanParams): this;
  nonpositive(params?: string | core.$ZodCheckLessThanParams): this;
  nonnegative(params?: string | core.$ZodCheckGreaterThanParams): this;
  multipleOf(value: bigint, params?: string | core.$ZodCheckMultipleOfParams): this;

  minValue: bigint | null;
  maxValue: bigint | null;
  format: string | null;
}
export const ZodBigInt: core.$constructor<ZodBigInt> = /*@__PURE__*/ core.$constructor("ZodBigInt", (inst, def) => {
  core.$ZodBigInt.init(inst, def);
  ZodType.init(inst, def);

  inst.gte = (value, params) => inst.$check(core.gte(value, params));
  inst.min = (value, params) => inst.$check(core.gte(value, params));
  inst.gt = (value, params) => inst.$check(core.gt(value, params));
  inst.gte = (value, params) => inst.$check(core.gte(value, params));
  inst.min = (value, params) => inst.$check(core.gte(value, params));
  inst.lt = (value, params) => inst.$check(core.lt(value, params));
  inst.lte = (value, params) => inst.$check(core.lte(value, params));
  inst.max = (value, params) => inst.$check(core.lte(value, params));
  inst.positive = (params) => inst.$check(core.gt(BigInt(0), params));
  inst.negative = (params) => inst.$check(core.lt(BigInt(0), params));
  inst.nonpositive = (params) => inst.$check(core.lte(BigInt(0), params));
  inst.nonnegative = (params) => inst.$check(core.gte(BigInt(0), params));
  inst.multipleOf = (value, params) => inst.$check(core.multipleOf(value, params));

  inst.minValue = inst._zod.computed.minimum ?? null;
  inst.maxValue = inst._zod.computed.maximum ?? null;
  inst.format = inst._zod.computed.format ?? null;
});

/////////////////////////////////////////////
/////////      ZodBigIntFormat      /////////
/////////////////////////////////////////////

export interface ZodBigIntFormat extends core.$ZodBigIntFormat, ZodBigInt {
  _zod: core._$ZodBigIntFormat;
}

export const ZodBigIntFormat: core.$constructor<ZodBigIntFormat> = /*@__PURE__*/ core.$constructor(
  "ZodBigIntFormat",
  (inst, def) => {
    core.$ZodBigInt.init(inst, def); // no format checks
    ZodBigInt.init(inst, def);
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodSymbol      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodSymbol extends ZodType {
  _zod: core._$ZodSymbol;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodSymbol: core.$constructor<ZodSymbol> = /*@__PURE__*/ core.$constructor("ZodSymbol", (inst, def) => {
  core.$ZodSymbol.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodUndefined      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////

export interface ZodUndefined extends ZodType {
  _zod: core._$ZodUndefined;
  // _isst: core.$ZodIssueInvalidType;
  // _values: core.$PrimitiveSet;
}
export const ZodUndefined: core.$constructor<ZodUndefined> = /*@__PURE__*/ core.$constructor(
  "ZodUndefined",
  (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodType.init(inst, def);
  }
);

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodNull      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodNull extends ZodType {
  _zod: core._$ZodNull;
  // _isst: core.$ZodIssueInvalidType;
  // _values: core.$PrimitiveSet;
}
export const ZodNull: core.$constructor<ZodNull> = /*@__PURE__*/ core.$constructor("ZodNull", (inst, def) => {
  core.$ZodNull.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodAny      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodAny extends ZodType {
  _zod: core._$ZodAny;
  // _isst: never;
}
export const ZodAny: core.$constructor<ZodAny> = /*@__PURE__*/ core.$constructor("ZodAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodUnknown      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodUnknown extends ZodType {
  _zod: core._$ZodUnknown;
  // _isst: never;
}
export const ZodUnknown: core.$constructor<ZodUnknown> = /*@__PURE__*/ core.$constructor("ZodUnknown", (inst, def) => {
  core.$ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodNever      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodNever extends ZodType {
  _zod: core._$ZodNever;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodNever: core.$constructor<ZodNever> = /*@__PURE__*/ core.$constructor("ZodNever", (inst, def) => {
  core.$ZodNever.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodVoid      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodVoid extends ZodType {
  _zod: core._$ZodVoid;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodVoid: core.$constructor<ZodVoid> = /*@__PURE__*/ core.$constructor("ZodVoid", (inst, def) => {
  core.$ZodVoid.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodDate      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodDate extends ZodType {
  _zod: core._$ZodDate<Date>;
  // _isst: core.$ZodIssueInvalidType; // | core.$ZodIssueInvalidDate;
  min(value: number | Date, params?: string | core.$ZodCheckGreaterThanParams): this;
  max(value: number | Date, params?: string | core.$ZodCheckLessThanParams): this;

  /** @deprecated Not recommended. */
  minDate: Date | null;
  /** @deprecated Not recommended. */
  maxDate: Date | null;
}
export const ZodDate: core.$constructor<ZodDate> = /*@__PURE__*/ core.$constructor("ZodDate", (inst, def) => {
  core.$ZodDate.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (value, params) => inst.$check(core.gte(value, params));
  inst.max = (value, params) => inst.$check(core.lte(value, params));

  const c = inst._zod.computed;
  inst.minDate = c.minimum ? new Date(c.minimum) : null;
  inst.maxDate = c.maximum ? new Date(c.maximum) : null;
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodArray      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodArray<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodArray<T>;
  // _isst: core.$ZodIssueInvalidType;

  element: T;
  min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
  nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
}
export const ZodArray: core.$constructor<ZodArray> = /*@__PURE__*/ core.$constructor("ZodArray", (inst, def) => {
  core.$ZodArray.init(inst, def);
  ZodType.init(inst, def);

  inst.element = def.element as any;
  inst.min = (minLength, params) => inst.$check(core.minLength(minLength, params));
  inst.nonempty = (params) => inst.$check(core.minLength(1, params));
  inst.max = (maxLength, params) => inst.$check(core.maxLength(maxLength, params));
  inst.length = (len, params) => inst.$check(core.length(len, params));
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodShape {
  [k: string]: core.$ZodType;
}

export type { ZodShape as ZodRawShape };

type MergeObjects<A extends ZodObject, B extends ZodObject> = ZodObject<
  util.ExtendShape<A["_zod"]["shape"], B["_zod"]["shape"]>,
  A["_zod"]["extra"] // & B['_zod']["extra"]
>;
export interface ZodObject<
  /** @ts-ignore */
  out Shape extends ZodShape = ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends ZodType {
  /** @deprecated */
  _zod: core._$ZodObject<Shape, Extra>;
  /** @deprecated */
  // _disc: core.$DiscriminatorMap;
  /** @deprecated */
  // _isst: core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;

  /** @deprecated In Zod 4, you can pass `ZodObject` instances directly into `.extend()`. */
  shape: Shape;

  keyof(): ZodEnum<util.ToEnum<keyof Shape & string>>;
  catchall<T extends core.$ZodType>(schema: T): ZodObject<Shape, Record<string, T["_zod"]["output"]>>;

  /** @deprecated Use `z.looseObject()` instead. */
  passthrough(): ZodObject<Shape, Record<string, unknown>>;
  // /** @deprecated Use `z.looseObject()` instead. */
  // nonstrict(): ZodObject<Shape>;
  /** @deprecated Use `z.looseObject()` instead. */
  loose(): ZodObject<Shape, Record<string, unknown>>;

  /** @deprecated Use `z.strictObject()` instead. */
  strict(): ZodObject<Shape, {}>;

  /** @deprecated This is the default behavior. This method call is likely unnecessary. */
  strip(): ZodObject<Shape, {}>;

  extend<U extends ZodObject>(shape: U): MergeObjects<this, U>;
  extend<U extends ZodShape>(shape: U): MergeObjects<this, ZodObject<U, {}>>;

  // merge
  /** @deprecated Use `A.extend(B)` */
  merge<U extends ZodObject<any, any>>(
    other: U
  ): ZodObject<util.Flatten<util.Overwrite<Shape, U["_zod"]["def"]["shape"]>>, Extra>;

  pick<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<util.Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>, Extra>;

  omit<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<util.Flatten<Omit<Shape, Extract<keyof Shape, keyof M>>>, Extra>;

  partial(): ZodObject<
    {
      [k in keyof Shape]: ZodOptional<Shape[k]>;
    },
    Extra
  >;
  partial<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<
    {
      [k in keyof Shape]: k extends keyof M ? ZodOptional<Shape[k]> : Shape[k];
    },
    Extra
  >;

  // required
  required(): ZodObject<
    {
      [k in keyof Shape]: ZodNonOptional<Shape[k]>;
    },
    Extra
  >;
  required<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<
    {
      [k in keyof Shape]: k extends keyof M ? ZodNonOptional<Shape[k]> : Shape[k];
    },
    Extra
  >;
}

export const ZodObject: core.$constructor<ZodObject> = /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodType.init(inst, def);

  util.defineLazy(inst, "shape", () => def.shape);

  inst.keyof = () => api.enum(Object.keys(inst._zod.def.shape)) as any;
  inst.catchall = (catchall) => inst.$clone({ ...inst._zod.def, catchall });
  inst.passthrough = () => inst.$clone({ ...inst._zod.def, catchall: api.unknown() });
  // inst.nonstrict = () => inst.$clone({ ...inst._zod.def, catchall: api.unknown() });
  inst.loose = () => inst.$clone({ ...inst._zod.def, catchall: api.unknown() });
  inst.strict = () => inst.$clone({ ...inst._zod.def, catchall: api.never() });
  inst.strip = () => inst.$clone({ ...inst._zod.def, catchall: undefined });

  inst.extend = (incoming: any) => {
    if (incoming instanceof ZodObject) return util.extendObjectLike(inst, incoming);
    return util.extendObjectLike(inst, api.object(incoming));
  };
  inst.merge = (other) => util.mergeObjectLike(inst, other);
  inst.pick = (mask) => util.pick(inst, mask);
  inst.omit = (mask) => util.omit(inst, mask);
  inst.partial = (...args: any[]) => util.partialObjectLike(inst, args[0] as object, ZodOptional);
  inst.required = (...args: any[]) => util.requiredObjectLike(inst, args[0] as object, ZodNonOptional);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodInterface      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
// type ZodInterfaceExtend<T extends ZodInterface, Shape extends ZodShape> = ZodInterface<
//   // util.Flatten<util.Overwrite<T['_zod']["shape"], Shape>>,
//   util.ExtendInterfaceShape<T['_zod']["shape"], Shape>,
//   T['_zod']["extra"]
// >;

type ZodInterfacePartial<
  T extends ZodInterface,
  Keys extends keyof T["_zod"]["shape"] = keyof T["_zod"]["shape"],
> = ZodInterface<
  // T['_zod']["shape"],
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in Keys]: ZodOptional<T["_zod"]["shape"][k]>;
    }
  >,
  {
    optional: T["_zod"]["optional"] | (string & Keys);
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
  // util.PartialInterfaceShape<T['_zod']["shape"], Keys>,
  // T['_zod']["extra"]
>;

type ZodInterfaceRequired<
  T extends ZodInterface,
  Keys extends keyof T["_zod"]["shape"] = keyof T["_zod"]["shape"],
> = ZodInterface<
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in Keys]: ZodNonOptional<T["_zod"]["shape"][k]>;
    }
  >,
  {
    optional: never;
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
  // util.RequiredInterfaceShape<T['_zod']["shape"], Keys>,
  // util.Flatten<
  //   Omit<T, Keys> & {
  //     [k in Keys as k extends `${infer NewK}?` ? NewK : k extends `?${infer NewK}` ? NewK : k]: T['_zod']["shape"][k];
  //   }
  // >,
  // T['_zod']["extra"]
>;

type MergeInterfaces<A extends ZodInterface, B extends ZodInterface> = ZodInterface<
  util.ExtendShape<A["_zod"]["shape"], B["_zod"]["shape"]>,
  util.MergeInterfaceParams<A, B>
>;
export interface ZodInterface<
  // @ts-ignore
  out Shape extends core.$ZodLooseShape = core.$ZodLooseShape,
  // @ts-ignore
  out Params extends core.$ZodInterfaceNamedParams = {
    optional: string & keyof Shape;
    defaulted: string & keyof Shape;
    extra: {};
  },
  // Extra extends Record<string, unknown> = Record<string, unknown>,
> extends ZodType {
  shape: util.ReconstructShape<Shape, Params>;
  _zod: core._$ZodInterface<Shape, Params>;
  // _disc: core.$DiscriminatorMap;
  // _isst: core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;

  keyof(): ZodEnum<util.ToEnum<string & util.InterfaceKeys<string & keyof Shape>>>;
  catchall<T extends core.$ZodType>(
    schema: T
  ): ZodInterface<
    Shape,
    {
      optional: Params["optional"];
      defaulted: Params["defaulted"];
      extra: Record<string, T["_zod"]["output"]>;
    }
  >;
  strict(): ZodInterface<
    Shape,
    {
      optional: Params["optional"];
      defaulted: Params["defaulted"];
      extra: {};
    }
  >;
  loose(): ZodInterface<
    Shape,
    {
      optional: Params["optional"];
      defaulted: Params["defaulted"];
      extra: Record<string, unknown>;
    }
  >;
  strip(): ZodInterface<
    Shape,
    {
      optional: Params["optional"];
      defaulted: Params["defaulted"];
      extra: {};
    }
  >;

  extend<U extends ZodInterface>(int: U): MergeInterfaces<this, U>;
  extend<U extends core.$ZodLooseShape>(
    shape: U
  ): MergeInterfaces<this, ZodInterface<U, util.InitInterfaceParams<U, {}>>>;

  /** @deprecated Use `.extend()` */
  merge<U extends ZodInterface>(incoming: U): MergeInterfaces<this, U>;

  pick<const M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodInterface<
    util.Flatten<Pick<Shape, keyof Shape & keyof M>>,
    {
      optional: Extract<Params["optional"], keyof M>;
      defaulted: Extract<Params["defaulted"], keyof M>;
      extra: Params["extra"];
    }
  >;

  omit<const M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodInterface<
    util.Flatten<Omit<Shape, keyof M>>,
    {
      optional: Exclude<Params["optional"], keyof M>;
      defaulted: Exclude<Params["defaulted"], keyof M>;
      extra: Params["extra"];
    }
  >;

  partial(): ZodInterfacePartial<this>;
  partial<M extends util.Mask<string & keyof Shape>>(mask: M): ZodInterfacePartial<this, string & keyof M>;

  required(): ZodInterfaceRequired<this, string & keyof Shape>;
  required<M extends util.Mask<string & keyof Shape>>(mask: M): ZodInterfaceRequired<this, string & keyof M>;
}

export const ZodInterface: core.$constructor<ZodInterface> = /*@__PURE__*/ core.$constructor(
  "ZodInterface",
  (inst, def) => {
    core.$ZodInterface.init(inst, def);
    ZodType.init(inst, def);

    util.defineLazy(inst, "shape", () => def.shape);

    inst.keyof = () => api.enum(Object.keys(inst._zod.def.shape));
    inst.catchall = (catchall) => inst.$clone({ ...inst._zod.def, catchall });
    inst.loose = () => inst.$clone({ ...inst._zod.def, catchall: api.unknown() });
    inst.strict = () => inst.$clone({ ...inst._zod.def, catchall: api.never() });
    inst.strip = () => inst.$clone({ ...inst._zod.def, catchall: undefined });

    inst.extend = (incoming: any) => {
      if (incoming instanceof core.$ZodInterface) return util.extendObjectLike(inst, incoming);
      return util.extendObjectLike(inst, api.interface(incoming));
    };
    inst.merge = (other) => util.mergeObjectLike(inst, other);

    inst.pick = (mask) => util.pick(inst, mask);
    inst.omit = (mask) => util.omit(inst, mask);
    inst.partial = (...args: any[]) => util.partialObjectLike(inst, args[0], ZodOptional);
    inst.required = (...args: any[]) => util.requiredObjectLike(inst, args[0], ZodNonOptional);
  }
);

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodUnion      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodUnion<Options extends readonly core.$ZodType[] = readonly core.$ZodType[]> extends ZodType {
  _zod: core._$ZodUnion<Options>;
  // _isst: core.$ZodIssueInvalidUnion;

  options: Options;
}
export const ZodUnion: core.$constructor<ZodUnion> = /*@__PURE__*/ core.$constructor("ZodUnion", (inst, def) => {
  core.$ZodUnion.init(inst, def);
  ZodType.init(inst, def);

  inst.options = def.options as any;
});

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
export interface ZodHasDiscriminator extends core.$ZodType {
  // _disc: core.$DiscriminatorMap;
}

export interface ZodDiscriminatedUnion<Options extends readonly core.$ZodType[] = readonly core.$ZodType[]>
  extends ZodType {
  _zod: core._$ZodDiscriminatedUnion<Options>;
  // _disc: core.$DiscriminatorMap;
  // _isst: core.$ZodIssueInvalidUnion;

  options: Options;
}

export const ZodDiscriminatedUnion: core.$constructor<ZodDiscriminatedUnion> =
  /*@__PURE__*/
  core.$constructor("ZodDiscriminatedUnion", (inst, def) => {
    core.$ZodDiscriminatedUnion.init(inst, def);
    ZodType.init(inst, def);

    inst.options = def.options as any;
  });

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      ZodIntersection      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////

export interface ZodIntersection<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends ZodType {
  _zod: core._$ZodIntersection<A, B>;
  // _isst: never;
}
export const ZodIntersection: core.$constructor<ZodIntersection> = /*@__PURE__*/ core.$constructor(
  "ZodIntersection",
  (inst, def) => {
    core.$ZodIntersection.init(inst, def);
    ZodType.init(inst, def);
  }
);

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodTuple      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

type ZodTupleItems = readonly core.$ZodType[];
export interface ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends core.$ZodType | null = core.$ZodType | null,
> extends ZodType {
  _zod: core._$ZodTuple<T, Rest>;
  // _def: core._$ZodTupleDef<T, Rest>;
  // _isst: core.$ZodIssueInvalidType | core.$ZodIssueTooBig<unknown[]> | core.$ZodIssueTooSmall<unknown[]>;

  rest<Rest extends core.$ZodType>(rest: Rest): ZodTuple<T, Rest>;
}
export const ZodTuple: core.$constructor<ZodTuple> = /*@__PURE__*/ core.$constructor("ZodTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodType.init(inst, def);
  inst.rest = (rest) =>
    inst.$clone({
      ...inst._zod.def,
      rest,
    }) as any;
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodRecord      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodPropertyKey extends core.$ZodType<PropertyKey, PropertyKey> {}
export interface ZodHasValues extends core.$ZodType<PropertyKey, PropertyKey> {
  // _values: Set<PropertyKey>;
}

export interface ZodHasPattern extends core.$ZodType<PropertyKey, PropertyKey> {
  // _pattern: RegExp;
}

type ZodRecordKey = ZodPropertyKey; // ZodHasValues | ZodHasPattern;

export interface ZodRecord<K extends ZodRecordKey = ZodRecordKey, V extends core.$ZodType = core.$ZodType>
  extends ZodType {
  _zod: core._$ZodRecord;
  // _isst: core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;

  keyType: K;
  valueType: V;
}
export const ZodRecord: core.$constructor<ZodRecord> = /*@__PURE__*/ core.$constructor("ZodRecord", (inst, def) => {
  core.$ZodRecord.init(inst, def);
  ZodType.init(inst, def);

  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodMap      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodMap<Key extends core.$ZodType = core.$ZodType, Value extends core.$ZodType = core.$ZodType>
  extends ZodType {
  _zod: core._$ZodMap<Key, Value>;
  // _isst: core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey | core.$ZodIssueInvalidElement<unknown>;
  keyType: Key;
  valueType: Value;
}
export const ZodMap: core.$constructor<ZodMap> = /*@__PURE__*/ core.$constructor("ZodMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodType.init(inst, def);

  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodSet      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodSet<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodSet<T>;
  // _isst: core.$ZodIssueInvalidType;

  min(minSize: number, params?: core.$ZodCheckMinSizeParams): this;
  /** */
  nonempty(params?: core.$ZodCheckMinSizeParams): this;
  max(maxSize: number, params?: core.$ZodCheckMaxSizeParams): this;
  size(size: number, params?: core.$ZodCheckSizeEqualsParams): this;
}
export const ZodSet: core.$constructor<ZodSet> = /*@__PURE__*/ core.$constructor("ZodSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (...args) => inst.$check(core.minSize(...args));
  inst.nonempty = (params) => inst.$check(core.minSize(1, params));
  inst.max = (...args) => inst.$check(core.maxSize(...args));
  inst.size = (...args) => inst.$check(core.size(...args));
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodEnum      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodEnum<
  /** @ts-ignore */
  out T extends readonly util.EnumLike = readonly util.EnumLike,
> extends ZodType {
  _zod: core._$ZodEnum<T>;
  // _values: Set<util.Primitive>;
  // _isst: core.$ZodIssueInvalidValue;
  enum: T;
  options: Array<T[keyof T]>;

  extract<const U extends readonly (keyof T)[]>(
    values: U,
    params?: core.$ZodEnumParams
  ): ZodEnum<util.Flatten<Pick<T, U[number]>>>;
  exclude<const U extends readonly (keyof T)[]>(
    values: U,
    params?: core.$ZodEnumParams
  ): ZodEnum<util.Flatten<Omit<T, U[number]>>>;
}
export const ZodEnum: core.$constructor<ZodEnum> = /*@__PURE__*/ core.$constructor("ZodEnum", (inst, def) => {
  core.$ZodEnum.init(inst, def);
  ZodType.init(inst, def);

  inst.enum = def.entries;
  inst.options = Object.values(def.entries);

  const keys = new Set(Object.keys(def.entries));

  inst.extract = (values, params) => {
    const newEntries: Record<string, any> = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util.normalizeTypeParams(params),
      entries: newEntries,
    }) as any;
  };

  inst.exclude = (values, params) => {
    const newEntries: Record<string, any> = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util.normalizeTypeParams(params),
      entries: newEntries,
    }) as any;
  };
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodLiteral      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodLiteral<T extends util.Primitive = util.Primitive> extends ZodType {
  _zod: core._$ZodLiteral<T>;
  // _values: Set<util.Primitive>;
  // _isst: core.$ZodIssueInvalidValue;

  values: Set<T>;
}
export const ZodLiteral: core.$constructor<ZodLiteral> = /*@__PURE__*/ core.$constructor("ZodLiteral", (inst, def) => {
  core.$ZodLiteral.init(inst, def);
  ZodType.init(inst, def);

  inst.values = new Set(def.values);
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodFile      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodFile extends ZodType {
  _zod: core._$ZodFile;
  // _isst: core.$ZodIssueInvalidType;

  min(size: number, params?: string | core.$ZodCheckMinSizeParams): this;
  max(size: number, params?: string | core.$ZodCheckMaxSizeParams): this;
  mime(types: Array<util.MimeTypes>, params?: string | core.$ZodCheckMimeTypeParams): this;
}
export const ZodFile: core.$constructor<ZodFile> = /*@__PURE__*/ core.$constructor("ZodFile", (inst, def) => {
  core.$ZodFile.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (size, params) => inst.$check(core.minSize(size, params));
  inst.max = (size, params) => inst.$check(core.maxSize(size, params));
  inst.mime = (types, params) => inst.$check(core.mime(types, params));
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodTransform      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodTransform<O = unknown, I = unknown> extends ZodType {
  _zod: core._$ZodTransform<O, I>;
  // _isst: never;
}

export const ZodTransform: core.$constructor<ZodTransform> = /*@__PURE__*/ core.$constructor(
  "ZodTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      (payload as RefinementCtx).addIssue = (issue) => {
        if (typeof issue === "string") {
          payload.issues.push(util.issue(issue, payload.value, def));
        } else {
          // for Zod 3 backwards compatibility
          const _issue = issue as any;

          if (_issue.fatal) _issue.continue = false;
          _issue.code ??= "custom";
          _issue.input ??= payload.value;
          _issue.inst ??= inst;
          _issue.continue ??= !def.abort;
          payload.issues.push(util.issue(_issue));
        }
      };

      const output = def.transform(payload.value, payload);
      if (output instanceof Promise) {
        return output.then((output) => {
          payload.value = output;
          return payload;
        });
      }
      payload.value = output;
      return payload;
    };
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodOptional      //////////
//////////                       //////////
//////////////////////////?////////////////
///////////////////////////////////////////

export interface ZodOptional<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodOptional<T>;
  // _qin: "true";
  // _qout: "true";
  // _isst: never;
  // _values: T["_zod"]["values"];
  // _pattern: T['_zod']["pattern"];

  unwrap(): T;
}

export const ZodOptional: core.$constructor<ZodOptional> = /*@__PURE__*/ core.$constructor(
  "ZodOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst._zod.def.innerType;
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodNullable<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodNullable<T>;
  // _qin: T["_zod"]["qin"];
  // _qout: T["_zod"]["qout"];
  // _isst: never;
  // _values: T["_zod"]["values"];

  unwrap(): T;
}
export const ZodNullable: core.$constructor<ZodNullable> = /*@__PURE__*/ core.$constructor(
  "ZodNullable",
  (inst, def) => {
    core.$ZodNullable.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst._zod.def.innerType;
  }
);

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodNonOptional      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodNonOptional<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodNonOptional<T>;
  // _isst: core.$ZodIssueInvalidType;
  // _values: T["_zod"]["values"];

  unwrap(): T;
}
export const ZodNonOptional: core.$constructor<ZodNonOptional> = /*@__PURE__*/ core.$constructor(
  "ZodNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst._zod.def.innerType;
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodCoalesce      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

// export interface ZodCoalesce<T extends core.$ZodType = core.$ZodType>
//   extends core.$ZodCoalesce<T>,
//     ZodType<NonNullable<T['_zod']["output"]>, T['_zod']["input"] | undefined | null> {
// _zod   _def: core._$ZodCoalesce<T>;
//   _isst: core.$ZodIssueInvalidType;
//   _qin: T['_zod']["qin"];

//   unwrap(): T;
// }
// export const ZodCoalesce: core.$constructor<ZodCoalesce> = /*@__PURE__*/ core.$constructor(
//   "ZodCoalesce",
//   (inst, def) => {
//     core.$ZodCoalesce.init(inst, def);
//     ZodType.init(inst, def);

//     inst.unwrap = () => inst._zod.def.innerType;
//   }
// );

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodSuccess      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodSuccess<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodSuccess<T>;

  unwrap(): T;
  // _isst: never;
}
export const ZodSuccess: core.$constructor<ZodSuccess> = /*@__PURE__*/ core.$constructor("ZodSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodDefault      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodDefault<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodDefault<T>;
  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeDefault(): T;

  // _qin: "true"; // T['_zod']["qin"];
  // _isst: never;
  // _values: T["_zod"]["values"];
}
export const ZodDefault: core.$constructor<ZodDefault> = /*@__PURE__*/ core.$constructor("ZodDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCatch      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCatch<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodCatch<T>;
  unwrap(): T;
  /** @deprecated Use `.unwrap()` intstead. */
  removeCatch(): T;

  // _qin: T["_zod"]["qin"];
  // _qout: T["_zod"]["qout"];
  // _isst: never;
  // _values: T["_zod"]["values"];
}
export const ZodCatch: core.$constructor<ZodCatch> = /*@__PURE__*/ core.$constructor("ZodCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodNaN      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodNaN extends ZodType {
  _zod: core._$ZodNaN;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodNaN: core.$constructor<ZodNaN> = /*@__PURE__*/ core.$constructor("ZodNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodPipe      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodPipe<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends ZodType {
  _zod: core._$ZodPipe<A, B>;
  // _isst: never;
  // _values: A["_zod"]["values"];
  // _qin: A['_zod']["qin"];
  // _qout: A['_zod']["qout"];

  in: A;
  out: B;
}
export const ZodPipe: core.$constructor<ZodPipe> = /*@__PURE__*/ core.$constructor("ZodPipe", (inst, def) => {
  core.$ZodPipe.init(inst, def);
  ZodType.init(inst, def);

  inst.in = def.in;
  inst.out = def.out;
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodReadonly      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodReadonly<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodReadonly<T>;
  // _qin: T["_zod"]["qin"];
  // _qout: T["_zod"]["qout"];
  // _isst: never;
}
export const ZodReadonly: core.$constructor<ZodReadonly> = /*@__PURE__*/ core.$constructor(
  "ZodReadonly",
  (inst, def) => {
    core.$ZodReadonly.init(inst, def);
    ZodType.init(inst, def);
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
////////////                              ////////////
////////////      ZodTemplateLiteral      ////////////
////////////                              ////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

export interface ZodTemplateLiteral<Template extends string = string> extends ZodType {
  _zod: core._$ZodTemplateLiteral<Template>;
  // _isst: core.$ZodIssueInvalidType;
}
export const ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral> = /*@__PURE__*/ core.$constructor(
  "ZodTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodPromise     //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodPromise<T extends core.$ZodType = core.$ZodType> extends ZodType {
  _zod: core._$ZodPromise<T>;
  // _isst: never;

  unwrap(): T;
}

export const ZodPromise: core.$constructor<ZodPromise> = /*@__PURE__*/ core.$constructor("ZodPromise", (inst, def) => {
  core.$ZodPromise.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCustom     //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCustom<O = unknown, I = unknown> extends ZodType {
  _zod: core._$ZodCustom<O, I>;
  // _isst: never;
  // _issc: core.$ZodIssueInvalidType;
}
export const ZodCustom: core.$constructor<ZodCustom> = /*@__PURE__*/ core.$constructor("ZodCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodType.init(inst, def);
});
