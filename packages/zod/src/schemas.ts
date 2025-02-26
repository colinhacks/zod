// import * as core from "../../zod-core/src/index.js";
// import * as util from "../../zod-core/src/util.js";
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
  addIssue(arg: string | core.$ZodRawIssue): void;
}

export interface ZodType<out Output = unknown, out Input = unknown> extends core.$ZodType<Output, Input> {
  _def: core.$ZodTypeDef;
  // parse methods
  parse(data: unknown, params?: ParseContext): this["_output"];
  safeParse(data: unknown, params?: ParseContext): ZodSafeParseResult<this["_output"]>;
  parseAsync(data: unknown, params?: ParseContext): Promise<this["_output"]>;
  safeParseAsync(data: unknown, params?: ParseContext): Promise<ZodSafeParseResult<this["_output"]>>;
  spa: (data: unknown, params?: ParseContext) => Promise<ZodSafeParseResult<this["_output"]>>;
  refine(check: (arg: Output) => unknown | Promise<unknown>, params?: string | core.$ZodCustomParams): this;
  /** @deprecated Use `.$check()` instead. */
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void | Promise<void>): this;
  overwrite(fn: (x: Output) => Output): this;

  // wrappers
  optional(params?: core.$ZodOptionalParams): ZodOptional<this>;
  nonoptional(params?: core.$ZodNonOptionalParams): ZodNonOptional<this>;
  nullable(params?: core.$ZodNullParams): ZodUnion<readonly [this, ZodNull]>;
  nullish(): ZodOptional<ZodUnion<readonly [this, ZodNull]>>;
  default(def: util.NoUndefined<Output>, params?: core.$ZodDefaultParams): ZodDefault<this>;
  default(def: () => util.NoUndefined<Output>, params?: core.$ZodDefaultParams): ZodDefault<this>;

  // coalesce(def: NonNullable<Output> | (() => NonNullable<Output>), params?: core.$ZodCoalesceParams): ZodCoalesce<this>;

  array(): ZodArray<this>;
  // promise(): ZodPromise<this>;
  or<T extends core.$ZodType>(option: T): ZodUnion<[this, T]>;
  and<T extends core.$ZodType>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(
    transform: (arg: Output) => NewOut | Promise<NewOut>
  ): ZodPipe<this, ZodTransform<Awaited<NewOut>, core.output<this>>>;
  catch(def: Output): ZodCatch<this>;
  catch(def: (ctx: core.$ZodCatchCtx) => Output): ZodCatch<this>;
  pipe<T extends core.$ZodType>(target: T): ZodPipe<this, T>;

  describe(description: string): this;
  description?: string;
  /** Registers schema to z.globalRegistry with the specified metadata */
  meta(): core.GlobalMeta | undefined;
  meta(data: core.$replace<core.GlobalMeta, this>): this;

  isOptional(): boolean;
  isNullable(): boolean;
}

export const ZodType: core.$constructor<ZodType> = /*@__PURE__*/ core.$constructor("ZodType", (inst, def) => {
  core.$ZodType.init(inst, def);

  inst._def = def;
  inst.parse = (data, params) => parse(inst, data, params);
  inst.safeParse = (data, params) => safeParse(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync(inst, data, params);
  inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.refine = (check, params) => inst.$check(api.refine(check, params));
  inst.superRefine = (refinement) => inst.$check(api.superRefine(refinement));
  inst.overwrite = (fn) => inst.$check(api.overwrite(fn));
  inst.optional = (params) => api.optional(inst, params);
  inst.nullable = (params) => api.nullable(inst, params);
  inst.nullish = () => api.optional(api.nullable(inst));
  inst.nonoptional = (params) => api.nonoptional(inst, params);
  inst.array = () => api.array(inst);
  inst.or = (arg) => api.union([inst, arg]);
  inst.and = (arg) => api.intersection(inst, arg);
  inst.transform = (tx) => api.pipe(inst, api.transform(tx)) as never;
  inst.default = (def, params) => api._default(inst, def, params);
  // inst.coalesce = (def, params) => api.coalesce(inst, def, params);
  inst.catch = (params) => api.catch(inst, params);
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
  });
  inst.pipe = (target) => api.pipe(inst, target);
  inst.meta = (...args: any) => {
    if (args.length === 0) return core.globalRegistry.get(inst);
    core.globalRegistry.add(inst, args[0]);
    return inst as any;
  };
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

export interface ZodString extends core.$ZodString<string>, ZodType<string, string> {
  _def: core.$ZodStringDef;
  _isst: core.$ZodIssueInvalidType;

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
  /** @deprecated Use `z.jsonString()` instead. */
  jsonString(params?: string | core.$ZodCheckJSONStringParams): ZodString;
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

  /** @deprecated Use `z.jsonString()` instead. */
  json(params?: string | core.$ZodCheckJSONStringParams): this;

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

  inst.format = inst._computed.format ?? null;
  inst.minLength = inst._computed.minimum ?? null;
  inst.maxLength = inst._computed.maximum ?? null;

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
  inst.jsonString = (params) => inst.$check(factories._jsonString(params));
  inst.xid = (params) => inst.$check(factories._xid(params));
  inst.ksuid = (params) => inst.$check(factories._ksuid(params));
  inst.ip = (params) => inst.$check(factories._ip(params));
  inst.ipv4 = (params) => inst.$check(factories._ipv4(params));
  inst.ipv6 = (params) => inst.$check(factories._ipv6(params));
  inst.e164 = (params) => inst.$check(factories._e164(params));
  inst.json = (params) => inst.$check(factories._jsonString(params));
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

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodGUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodGUID extends core.$ZodGUID, ZodType<string, string> {
  _def: core.$ZodGUIDDef;
  _isst: core.$ZodIssueInvalidType;
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
export interface ZodUUID extends core.$ZodUUID, ZodType<string, string> {
  _def: core.$ZodUUIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodEmail extends core.$ZodEmail, ZodType<string, string> {
  _def: core.$ZodEmailDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodURL extends core.$ZodURL, ZodType<string, string> {
  _def: core.$ZodURLDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodEmoji extends core.$ZodEmoji, ZodType<string, string> {
  _def: core.$ZodEmojiDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodNanoID extends core.$ZodNanoID, ZodType<string, string> {
  _def: core.$ZodNanoIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodCUID extends core.$ZodCUID, ZodType<string, string> {
  _def: core.$ZodCUIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodCUID2 extends core.$ZodCUID2, ZodType<string, string> {
  _def: core.$ZodCUID2Def;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodULID extends core.$ZodULID, ZodType<string, string> {
  _def: core.$ZodULIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodXID extends core.$ZodXID, ZodType<string, string> {
  _def: core.$ZodXIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodKSUID extends core.$ZodKSUID, ZodType<string, string> {
  _def: core.$ZodKSUIDDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodISODateTime extends core.$ZodISODateTime, ZodType<string, string> {
  _def: core.$ZodISODateTimeDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodISODate extends core.$ZodISODate, ZodType<string, string> {
  _def: core.$ZodISODateDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodISOTime extends core.$ZodISOTime, ZodType<string, string> {
  _def: core.$ZodISOTimeDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodISODuration extends core.$ZodISODuration, ZodType<string, string> {
  _def: core.$ZodISODurationDef;
  _isst: core.$ZodIssueInvalidType;
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
export interface ZodIP extends core.$ZodIP, ZodType<string, string> {
  _def: core.$ZodIPDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodBase64 extends core.$ZodBase64, ZodType<string, string> {
  _def: core.$ZodBase64Def;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodJSONString extends core.$ZodJSONString, ZodType<string, string> {
  _def: core.$ZodJSONStringDef;
  _isst: core.$ZodIssueInvalidType;
}
export const ZodJSONString: core.$constructor<ZodJSONString> = /*@__PURE__*/ core.$constructor(
  "ZodJSONString",
  (inst, def) => {
    core.$ZodJSONString.init(inst, def);
    ZodType.init(inst, def);
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodE164        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodE164 extends core.$ZodE164, ZodType<string, string> {
  _def: core.$ZodE164Def;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodJWT extends core.$ZodJWT, ZodType<string, string> {
  _def: core.$ZodJWTDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodNumber extends core.$ZodNumber<number>, ZodType<number, number> {
  _def: core.$ZodNumberDef;
  _isst: core.$ZodIssueInvalidType;
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

  inst.minValue = inst._computed.minimum ?? null;
  inst.maxValue = inst._computed.maximum ?? null;
  inst.isInt = (inst._computed.format ?? "").includes("int") || Number.isSafeInteger(inst._computed.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = inst._computed.format ?? null;
});

/////////////////////////////////////////////
/////////      ZodNumberFormat      /////////
/////////////////////////////////////////////

export interface ZodNumberFormat extends core.$ZodNumberFormat, ZodNumber {
  _def: core.$ZodNumberFormatDef;
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

export interface ZodBoolean extends core.$ZodBoolean<boolean>, ZodType<boolean, boolean> {
  _def: core.$ZodBooleanDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodBigInt extends core.$ZodBigInt<bigint>, ZodType<bigint, bigint> {
  _def: core.$ZodBigIntDef;
  _isst: core.$ZodIssueInvalidType;

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

  inst.minValue = inst._computed.minimum ?? null;
  inst.maxValue = inst._computed.maximum ?? null;
  inst.format = inst._computed.format ?? null;
});

/////////////////////////////////////////////
/////////      ZodBigIntFormat      /////////
/////////////////////////////////////////////

export interface ZodBigIntFormat extends core.$ZodBigIntFormat, ZodBigInt {
  _def: core.$ZodBigIntFormatDef;
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

export interface ZodSymbol extends core.$ZodSymbol, ZodType<symbol, symbol> {
  _def: core.$ZodSymbolDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodUndefined extends core.$ZodUndefined, ZodType<undefined, undefined> {
  _def: core.$ZodUndefinedDef;
  _isst: core.$ZodIssueInvalidType;
  _values: core.$PrimitiveSet;
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

export interface ZodNull extends core.$ZodNull, ZodType<null, null> {
  _def: core.$ZodNullDef;
  _isst: core.$ZodIssueInvalidType;
  _values: core.$PrimitiveSet;
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

export interface ZodAny extends core.$ZodAny, ZodType<any, any> {
  _def: core.$ZodAnyDef;
  _isst: never;
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

export interface ZodUnknown extends core.$ZodUnknown, ZodType<unknown, unknown> {
  _def: core.$ZodUnknownDef;
  _isst: never;
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

export interface ZodNever extends core.$ZodNever, ZodType<never, never> {
  _def: core.$ZodNeverDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodVoid extends core.$ZodVoid, ZodType<void, void> {
  _def: core.$ZodVoidDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodDate extends core.$ZodDate<Date>, ZodType<Date, Date> {
  _def: core.$ZodDateDef;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueInvalidDate;
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

  const c = inst._computed;
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

export interface ZodArray<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodArray<T>,
    ZodType<T["_output"][], T["_input"][]> {
  _def: core.$ZodArrayDef<T>;
  _isst: core.$ZodIssueInvalidType;

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

export interface ZodObject<
  /** @ts-ignore */
  out Shape extends ZodShape = ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends core.$ZodObject<Shape, Extra>,
    ZodType<core.$InferObjectOutput<Shape, Extra>, core.$InferObjectInput<Shape, Extra>> {
  _def: core.$ZodObjectDef<Shape>;
  _disc: core.$DiscriminatorMap;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;
  shape: Shape;

  keyof(): ZodEnum<util.ToEnum<keyof Shape & string>>;
  catchall(schema: core.$ZodType): this;

  /** @deprecated Use `z.looseObject()` instead. */
  passthrough(): ZodObject<Shape>;
  // /** @deprecated Use `z.looseObject()` instead. */
  // nonstrict(): ZodObject<Shape>;
  /** @deprecated Use `z.looseObject()` instead. */
  loose(): ZodObject<Shape>;

  /** @deprecated Use `z.strictObject()` instead. */
  strict(): this;

  /** @deprecated This is the default behavior. This method call is likely unnecessary. */
  strip(): this;

  extend<U extends ZodShape>(shape: U): ZodObject<util.Flatten<util.Overwrite<Shape, U>>>;

  // merge
  /** @deprecated Use `A.extend(B.shape)` */
  merge<U extends ZodObject<any>>(other: U): ZodObject<util.Flatten<util.Overwrite<Shape, U["_def"]["shape"]>>>;

  pick<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<util.Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>>;

  omit<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<util.Flatten<Omit<Shape, Extract<keyof Shape, keyof M>>>>;

  partial(): ZodObject<{
    [k in keyof Shape]: ZodOptional<Shape[k]>;
  }>;
  partial<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<{
    [k in keyof Shape]: k extends keyof M ? ZodOptional<Shape[k]> : Shape[k];
  }>;

  // required
  required(): ZodObject<{
    [k in keyof Shape]: ZodNonOptional<Shape[k]>;
  }>;
  required<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<{
    [k in keyof Shape]: k extends keyof M ? ZodNonOptional<Shape[k]> : Shape[k];
  }>;
}

export const ZodObject: core.$constructor<ZodObject> = /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodType.init(inst, def);
  inst.shape = def.shape;

  inst.keyof = () => api.enum(Object.keys(inst._def.shape)) as any;
  inst.catchall = (catchall) => inst.$clone({ ...inst._def, catchall });
  inst.passthrough = () => inst.$clone({ ...inst._def, catchall: api.unknown() });
  // inst.nonstrict = () => inst.$clone({ ...inst._def, catchall: api.unknown() });
  inst.loose = () => inst.$clone({ ...inst._def, catchall: api.unknown() });
  inst.strict = () => inst.$clone({ ...inst._def, catchall: api.never() });
  inst.strip = () => inst.$clone({ ...inst._def, catchall: undefined });

  inst.extend = (shape) => util.extend(inst, shape);
  inst.merge = (other) =>
    other.$clone({
      ...other._def,
      get shape() {
        return { ...inst.shape, ...other.shape };
      },
      checks: [],
    });
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
//   // util.Flatten<util.Overwrite<T["_shape"], Shape>>,
//   util.ExtendInterfaceShape<T["_shape"], Shape>,
//   T["_extra"]
// >;

type ZodInterfacePartial<T extends ZodInterface, Keys extends keyof T["_shape"] = keyof T["_shape"]> = ZodInterface<
  // T["_shape"],
  util.ExtendShape<
    T["_shape"],
    {
      [k in Keys]: ZodOptional<T["_shape"][k]>;
    }
  >,
  {
    optional: T["_optional"] | (string & Keys);
    defaulted: T["_defaulted"];
    extra: T["_extra"];
  }
  // util.PartialInterfaceShape<T["_shape"], Keys>,
  // T["_extra"]
>;

type ZodInterfaceRequired<T extends ZodInterface, Keys extends keyof T["_shape"] = keyof T["_shape"]> = ZodInterface<
  util.ExtendShape<
    T["_shape"],
    {
      [k in Keys]: ZodNonOptional<T["_shape"][k]>;
    }
  >,
  {
    optional: never;
    defaulted: T["_defaulted"];
    extra: T["_extra"];
  }
  // util.RequiredInterfaceShape<T["_shape"], Keys>,
  // util.Flatten<
  //   Omit<T, Keys> & {
  //     [k in Keys as k extends `${infer NewK}?` ? NewK : k extends `?${infer NewK}` ? NewK : k]: T["_shape"][k];
  //   }
  // >,
  // T["_extra"]
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
> extends core.$ZodInterface<Shape, Params>,
    ZodType<core.$InferInterfaceOutput<Shape, Params>, core.$InferInterfaceInput<Shape, Params>> {
  shape: util.ReconstructShape<Shape, Params>;
  _def: core.$ZodInterfaceDef<Shape>;
  _disc: core.$DiscriminatorMap;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;

  keyof(): ZodEnum<util.ToEnum<string & util.InterfaceKeys<string & keyof Shape>>>;

  catchall(schema: core.$ZodType): this;

  // extend<U extends ZodShape>(shape: U): ZodInterface<util.ExtendShape<Shape, util.CleanInterfaceShape<U>>, Params>;
  extend<U extends ZodShape>(
    shape: U
  ): ZodInterface<util.ExtendInterfaceShape<Shape, U>, util.ExtendInterfaceParams<Params, U>>;

  merge<U extends ZodInterface>(
    incoming: U
  ): ZodInterface<
    util.ExtendShape<this["_shape"], U["_shape"]>,
    {
      extra: Params["extra"] & U["_extra"];
      optional: Exclude<Params["optional"], keyof U["_shape"]> | U["_optional"];
      defaulted: Exclude<Params["defaulted"], keyof U["_shape"]> | U["_defaulted"];
    }
  >;

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

    inst.shape = def.shape;
    inst.keyof = () => api.enum(Object.keys(inst._def.shape));
    inst.catchall = (catchall) => inst.$clone({ ...inst._def, catchall });

    inst.extend = (shape) => util.extend(inst, shape);
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

export interface ZodUnion<Options extends readonly core.$ZodType[] = readonly core.$ZodType[]>
  extends core.$ZodUnion<Options>,
    ZodType<Options[number]["_output"], Options[number]["_input"]> {
  _def: core.$ZodUnionDef;
  _isst: core.$ZodIssueInvalidUnion;

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
  _disc: core.$DiscriminatorMap;
}

export interface ZodDiscriminatedUnion<Options extends readonly core.$ZodType[] = readonly core.$ZodType[]>
  extends core.$ZodDiscriminatedUnion<Options>,
    ZodType<Options[number]["_output"], Options[number]["_input"]> {
  _def: core.$ZodDiscriminatedUnionDef;
  _disc: core.$DiscriminatorMap;
  _isst: core.$ZodIssueInvalidUnion;

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
  extends core.$ZodIntersection<A, B>,
    ZodType<A["_output"] & B["_output"], A["_input"] & B["_input"]> {
  _def: core.$ZodIntersectionDef;
  _isst: never;
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
> extends core.$ZodTuple<T, Rest>,
    ZodType<core.$InferTupleOutputType<T, Rest>, core.$InferTupleInputType<T, Rest>> {
  _def: core.$ZodTupleDef<T, Rest>;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueTooBig<unknown[]> | core.$ZodIssueTooSmall<unknown[]>;

  rest<Rest extends core.$ZodType>(rest: Rest): ZodTuple<T, Rest>;
}
export const ZodTuple: core.$constructor<ZodTuple> = /*@__PURE__*/ core.$constructor("ZodTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodType.init(inst, def);

  inst.rest = (rest) =>
    inst.$clone({
      ...inst._def,
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
  _values: Set<PropertyKey>;
}

export interface ZodHasPattern extends core.$ZodType<PropertyKey, PropertyKey> {
  _pattern: RegExp;
}

type ZodRecordKey = ZodPropertyKey; // ZodHasValues | ZodHasPattern;

export interface ZodRecord<K extends ZodRecordKey = ZodRecordKey, V extends core.$ZodType = core.$ZodType>
  extends core.$ZodRecord<K, V>,
    ZodType<Record<K["_output"], V["_output"]>, Record<K["_input"], V["_input"]>> {
  _def: core.$ZodRecordDef;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
}
export const ZodRecord: core.$constructor<ZodRecord> = /*@__PURE__*/ core.$constructor("ZodRecord", (inst, def) => {
  core.$ZodRecord.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodMap      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodMap<Key extends core.$ZodType = core.$ZodType, Value extends core.$ZodType = core.$ZodType>
  extends core.$ZodMap<Key, Value>,
    ZodType<Map<Key["_output"], Value["_output"]>, Map<Key["_input"], Value["_input"]>> {
  _def: core.$ZodMapDef;
  _isst: core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey | core.$ZodIssueInvalidElement<unknown>;
  keySchema: Key;
  valueSchema: Value;
}
export const ZodMap: core.$constructor<ZodMap> = /*@__PURE__*/ core.$constructor("ZodMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodType.init(inst, def);

  inst.keySchema = def.keyType;
  inst.valueSchema = def.valueType;
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodSet      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodSet<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodSet<T>,
    ZodType<Set<T["_output"]>, Set<T["_input"]>> {
  _def: core.$ZodSetDef;
  _isst: core.$ZodIssueInvalidType;

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
> extends core.$ZodEnum<T>,
    ZodType<core.$InferEnumOutput<T>, core.$InferEnumInput<T>> {
  _def: core.$ZodEnumDef<T>;
  _values: Set<util.Primitive>;
  _isst: core.$ZodIssueInvalidValue;
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

export interface ZodLiteral<T extends util.Literal = util.Literal> extends core.$ZodLiteral<T>, ZodType<T, T> {
  _def: core.$ZodLiteralDef;
  _values: Set<util.Primitive>;
  _isst: core.$ZodIssueInvalidValue;

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

export interface ZodFile extends core.$ZodFile, ZodType<File, File> {
  _def: core.$ZodFileDef;
  _isst: core.$ZodIssueInvalidType;

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

export interface ZodTransform<O = unknown, I = unknown> extends core.$ZodTransform<O, I>, ZodType<O, I> {
  _def: core.$ZodTransformDef;
  _isst: never;
}

export const ZodTransform: core.$constructor<ZodTransform> = /*@__PURE__*/ core.$constructor(
  "ZodTransform",
  (inst, def) => {
    core.$ZodTransform.init(inst, def);
    ZodType.init(inst, def);
    inst._parse = (payload, _ctx) => {
      (payload as RefinementCtx).addIssue = (issue) => {
        if (typeof issue === "string") {
          payload.issues.push(util.issue(issue, payload.value, def));
        } else {
          // for Zod 3 backwards compatibility
          if ((issue as any).fatal) issue.continue = false;
          issue.code ??= "custom";
          issue.input ??= payload.value;
          issue.inst ??= inst;
          issue.continue ??= !def.abort;
          payload.issues.push(util.issue(issue));
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

export interface ZodOptional<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodOptional<T>,
    ZodType<T["_output"] | undefined, T["_input"] | undefined> {
  _def: core.$ZodOptionalDef<T>;
  _qin: "true";
  _qout: "true";
  _isst: never;
  _values: T["_values"];

  unwrap(): T;
}

export const ZodOptional: core.$constructor<ZodOptional> = /*@__PURE__*/ core.$constructor(
  "ZodOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst._def.innerType;
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
// export interface ZodNullable<T extends core.$ZodType = core.$ZodType>
//   extends core.$ZodNullable<T>,
//     ZodType<T["_output"] | null, T["_input"] | null> {
//   _def: core.$ZodNullableDef<T>;
//   _qin: T["_qin"];
//   _qout: T["_qout"];
//   _isst: never;
//   _values: T["_values"];

//   unwrap(): T;
// }
// export const ZodNullable: core.$constructor<ZodNullable> = /*@__PURE__*/ core.$constructor(
//   "ZodNullable",
//   (inst, def) => {
//     core.$ZodNullable.init(inst, def);
//     ZodType.init(inst, def);

//     inst.unwrap = () => inst._def.innerType;
//   }
// );

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodNonOptional      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodNonOptional<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodNonOptional<T>,
    ZodType<util.NoUndefined<T["_output"]>, util.NoUndefined<T["_input"]>> {
  _def: core.$ZodNonOptionalDef<T>;
  _isst: core.$ZodIssueInvalidType;
  _values: T["_values"];

  unwrap(): T;
}
export const ZodNonOptional: core.$constructor<ZodNonOptional> = /*@__PURE__*/ core.$constructor(
  "ZodNonOptional",
  (inst, def) => {
    core.$ZodNonOptional.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst._def.innerType;
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
//     ZodType<NonNullable<T["_output"]>, T["_input"] | undefined | null> {
//   _def: core.$ZodCoalesceDef<T>;
//   _isst: core.$ZodIssueInvalidType;
//   _qin: T["_qin"];

//   unwrap(): T;
// }
// export const ZodCoalesce: core.$constructor<ZodCoalesce> = /*@__PURE__*/ core.$constructor(
//   "ZodCoalesce",
//   (inst, def) => {
//     core.$ZodCoalesce.init(inst, def);
//     ZodType.init(inst, def);

//     inst.unwrap = () => inst._def.innerType;
//   }
// );

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodSuccess      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodSuccess<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodSuccess<T>,
    ZodType<boolean, T["_input"]> {
  unwrap(): T;
  _def: core.$ZodSuccessDef;
  _isst: never;
}
export const ZodSuccess: core.$constructor<ZodSuccess> = /*@__PURE__*/ core.$constructor("ZodSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._def.innerType;
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodDefault      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodDefault<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodDefault<T>,
    ZodType<util.NoUndefined<T["_output"]>, T["_input"] | undefined> {
  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeDefault(): T;
  _def: core.$ZodDefaultDef<T>;
  _qin: "true"; // T["_qin"];
  _isst: never;
  _values: T["_values"];
}
export const ZodDefault: core.$constructor<ZodDefault> = /*@__PURE__*/ core.$constructor("ZodDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._def.innerType;
  inst.removeDefault = inst.unwrap;
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCatch      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCatch<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodCatch<T>,
    ZodType<T["_output"], util.Loose<T["_input"]>> {
  unwrap(): T;
  /** @deprecated Use `.unwrap()` intstead. */
  removeCatch(): T;
  _def: core.$ZodCatchDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
  _isst: never;
  _values: T["_values"];
}
export const ZodCatch: core.$constructor<ZodCatch> = /*@__PURE__*/ core.$constructor("ZodCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._def.innerType;
  inst.removeCatch = inst.unwrap;
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodNaN      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodNaN extends core.$ZodNaN, ZodType<number, number> {
  _def: core.$ZodNaNDef;
  _isst: core.$ZodIssueInvalidType;
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
  extends core.$ZodPipe<A, B>,
    ZodType<B["_output"], A["_input"]> {
  _def: core.$ZodPipeDef<A, B>;
  _isst: never;
  _values: A["_values"];
  // _qin: A["_qin"];
  // _qout: A["_qout"];

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

export interface ZodReadonly<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodReadonly<T>,
    ZodType<util.MakeReadonly<T["_output"]>, util.MakeReadonly<T["_input"]>> {
  _def: core.$ZodReadonlyDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
  _isst: never;
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

export interface ZodTemplateLiteral<Template extends string = string>
  extends core.$ZodTemplateLiteral<Template>,
    ZodType<Template, Template> {
  _def: core.$ZodTemplateLiteralDef;
  _isst: core.$ZodIssueInvalidType;
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

export interface ZodPromise<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodPromise<T>,
    ZodType<T["_output"], util.MaybeAsync<T["_input"]>> {
  _def: core.$ZodPromiseDef;
  _isst: never;
}

export const ZodPromise: core.$constructor<ZodPromise> = /*@__PURE__*/ core.$constructor("ZodPromise", (inst, def) => {
  core.$ZodPromise.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCustom     //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCustom<O = unknown, I = unknown> extends core.$ZodCustom<O, I>, ZodType<O, I> {
  _def: core.$ZodCustomDef;
  _isst: never;
  // _issc: core.$ZodIssueInvalidType;
}
export const ZodCustom: core.$constructor<ZodCustom> = /*@__PURE__*/ core.$constructor("ZodCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodType.init(inst, def);
});
