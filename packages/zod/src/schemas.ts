// import * as core from "../../zod-core/src/index.js";
// import * as util from "../../zod-core/src/util.js";
import * as core from "zod-core";
import * as util from "zod-core/util";
import * as api from "./api.js";
import * as factories from "./factories.js";

export type CustomErrorParams = Omit<core.$ZodIssueBase, "code">;
export interface ParseContext extends core.$ParseContext {}

export { $ZodError as ZodError } from "zod-core";

///////////////////////////////////////////
///////////////////////////////////////////
////////////                   ////////////
////////////      ZodType      ////////////
////////////                   ////////////
///////////////////////////////////////////
///////////////////////////////////////////

interface OptionalParams extends util.TypeParams<ZodOptional, "innerType"> {}
interface NullableParams extends util.TypeParams<ZodNullable, "innerType"> {}

export interface RefinementCtx<T = unknown> extends core.$ZodResult<T> {
  /** @deprecated Append to `ctx.issues` instead. */
  addIssue(arg: string | core.$ZodRawIssue): void;
}

export interface ZodType<out Output = unknown, out Input = unknown> extends core.$ZodType<Output, Input> {
  "~def": core.$ZodTypeDef;
  /** @deprecated Only exists for backwards compatibility. Use schema["~def"] instead. */
  _def: this["~def"];
  // parse methods
  parse(data: unknown, params?: ParseContext): this["~output"];
  parse2(data: unknown, params?: ParseContext): this["~output"];
  safeParse(data: unknown, params?: ParseContext): util.SafeParseResult<this["~output"]>;
  parseAsync(data: unknown, params?: ParseContext): Promise<this["~output"]>;
  safeParseAsync(data: unknown, params?: ParseContext): Promise<util.SafeParseResult<this["~output"]>>;
  spa: (data: unknown, params?: ParseContext) => Promise<util.SafeParseResult<this["~output"]>>;

  // /** Use `.refineAsync` for asynchronous refinements. */
  // refine(check: (arg: Output) => Promise<unknown>, ...args: any[]): never;
  refine(check: (arg: Output) => unknown | Promise<unknown>, message?: string | core.$RefineParams): this;

  // refineAsync(
  //   check: (arg: Output) => Promise<unknown>,
  //   message?: string | core.$RefineParams
  //   // | core.$ZodErrorMap<core.$ZodIssueCustom>
  // ): this;

  /**
   * @deprecated Use `.checkAsync()` for asynchronous refinement logic.
   */
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>): never;
  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void | Promise<void>): this;

  optional(params?: OptionalParams): ZodOptional<this>;
  nullable(params?: NullableParams): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  array(): ZodArray<this>;
  // promise(): ZodPromise<this>;
  or<T extends ZodType>(option: T): ZodUnion<[this, T]>;
  and<T extends ZodType>(incoming: T): ZodIntersection<this, T>;

  /** Use `.transformAsync()` for asynchronous transforms. */
  transform<NewOut>(transform: (arg: Output) => Promise<NewOut>): never;
  transform<NewOut>(
    transform: (arg: Output) => NewOut | Promise<NewOut>
  ): ZodPipeline<this, ZodEffect<Awaited<NewOut>, core.output<this>>>;

  transformAsync<NewOut>(
    transform: (arg: Output) => Promise<NewOut>
  ): ZodPipeline<this, ZodEffect<Awaited<NewOut>, core.output<this>>>;

  default(def: util.NoUndefined<Input>): ZodDefault<this>;
  default(def: () => util.NoUndefined<Input>): ZodDefault<this>;
  catch(def: Output): ZodCatch<this>;
  describe(description: string): this;
  pipe<T extends ZodType>(target: T): ZodPipeline<this, T>;

  /** Registers schema to z.globalRegistry with the specified metadata */
  meta(): unknown | undefined;
  meta(data: object): this;

  /** @deprecated Try `.parse(undefined)` to determine optionality. */
  isOptional(): boolean;
  /** @deprecated Try `.parse(null)` to determine nullability. */
  isNullable(): boolean;
}

export const ZodType: core.$constructor<ZodType> = core.$constructor("ZodType", (inst, def) => {
  core.$ZodType.init(inst, def);

  inst._def = def;
  inst.parse = (data, params) => {
    return core.parse(inst, data, params);
  };
  inst.safeParse = (data, params) => {
    return core.safeParse(inst, data, params);
  };
  inst.parseAsync = async (data, params) => {
    return core.parseAsync(inst, data, params);
  };
  inst.safeParseAsync = async (data, params) => {
    return core.safeParseAsync(inst, data, params);
  };
  inst.spa = inst.safeParseAsync;

  inst.refine = (check, message) => inst.check(api.refine(check, message)) as never;
  // inst.refineAsync = (check, message) => inst.check(api.refineAsync(check, message));

  // optional
  inst.optional = (params) => api.optional(inst, params);
  // nullable
  inst.nullable = (params) => api.nullable(inst, params);
  // nullish
  inst.nullish = () => api.optional(api.nullable(inst));
  // array
  inst.array = () => api.array(inst);
  // or
  inst.or = (arg) => api.union([inst, arg]);
  // and
  inst.and = (arg) => api.intersection(inst, arg);
  // transform
  inst.transform = (tx) => api.transform(inst, tx) as never;
  inst.transformAsync = (tx) => api.transformAsync(inst, tx);
  // default
  inst.default = (def) => api._default(inst, def);
  // catch
  inst.catch = (def) => api.catch(inst, def);
  // describe
  inst.describe = (desc) => {
    return inst.clone({
      ...inst["~def"],
      description: desc,
    });
  };

  // pipe
  inst.pipe = (target) => api.pipeline(inst, target);
  // meta
  inst.meta = (...args: any) => {
    if (args.length === 0) return core.globalRegistry.get(inst);
    core.globalRegistry.add(inst, args[0]);
    return inst as any;
  };
  // isOptional
  inst.isOptional = () => inst.safeParse(undefined).success;
  // isNullable
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
  "~def": core.$ZodStringDef;
  "~isst": core.$ZodIssueInvalidType;

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
  regex(regex: RegExp, message?: StringFormatParams): ZodString;
  includes(value: string, params?: { message?: string; position?: number }): ZodString;
  startsWith(value: string, message?: string | core.$ZodCheckStartsWithParams): ZodString;
  endsWith(value: string, message?: string | core.$ZodCheckEndsWithParams): ZodString;
  min(minLength: number, message?: string | core.$ZodCheckMinSizeParams): ZodString;
  max(maxLength: number, message?: string | core.$ZodCheckMaxSizeParams): ZodString;
  length(len: number, message?: string | core.$ZodCheckSizeEqualsParams): ZodString;
  nonempty(message?: string | core.$ZodCheckMinSizeParams): ZodString;
  lowercase(message?: string | core.$ZodCheckLowerCaseParams): ZodString;
  uppercase(message?: string | core.$ZodCheckUpperCaseParams): ZodString;

  // transforms
  trim(): ZodString;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
}

export const ZodString: core.$constructor<ZodString> = core.$constructor("ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  ZodType.init(inst, def);

  inst.format = inst["~computed"].format ?? null;
  inst.minLength = inst["~computed"].minimum ?? null;
  inst.maxLength = inst["~computed"].maximum ?? null;

  inst.email = (params) => inst.check(factories._email(params));
  inst.url = (params) => inst.check(factories._url(params));
  inst.jwt = (params) => inst.check(factories._jwt(params));
  inst.emoji = (params) => inst.check(factories._emoji(params));
  inst.guid = (params) => inst.check(factories._guid(params));
  inst.uuid = (params) => inst.check(factories._uuid(params));
  inst.uuidv4 = (params) => inst.check(factories._uuid(params));
  inst.uuidv6 = (params) => inst.check(factories._uuid(params));
  inst.uuidv7 = (params) => inst.check(factories._uuid(params));
  inst.nanoid = (params) => inst.check(factories._nanoid(params));
  inst.guid = (params) => inst.check(factories._guid(params));
  inst.cuid = (params) => inst.check(factories._cuid(params));
  inst.cuid2 = (params) => inst.check(factories._cuid2(params));
  inst.ulid = (params) => inst.check(factories._ulid(params));
  inst.base64 = (params) => inst.check(factories._base64(params));
  inst.jsonString = (params) => inst.check(factories._jsonString(params));
  inst.xid = (params) => inst.check(factories._xid(params));
  inst.ksuid = (params) => inst.check(factories._ksuid(params));
  inst.ip = (params) => inst.check(factories._ip(params));
  inst.ipv4 = (params) => inst.check(factories._ipv4(params));
  inst.ipv6 = (params) => inst.check(factories._ipv6(params));
  inst.e164 = (params) => inst.check(factories._e164(params));
  inst.json = (params) => inst.check(factories._jsonString(params));
  inst.datetime = (params) => inst.check(api.iso.datetime(params));
  inst.date = (params) => inst.check(api.iso.date(params));
  inst.time = (params) => inst.check(api.iso.time(params));
  inst.duration = (params) => inst.check(api.iso.duration(params));

  // validations
  inst.regex = (params) => inst.check(core.regex(params));
  inst.includes = (...args) => inst.check(core.includes(...args));
  inst.startsWith = (params) => inst.check(core.startsWith(params));
  inst.endsWith = (params) => inst.check(core.endsWith(params));
  inst.min = (...args) => inst.check(core.minSize(...args));
  inst.max = (...args) => inst.check(core.maxSize(...args));
  inst.length = (...args) => inst.check(core.size(...args));
  inst.nonempty = (...args) => inst.check(core.minSize(1, ...args));
  inst.lowercase = (params) => inst.check(core.lowercase(params));
  inst.uppercase = (params) => inst.check(core.uppercase(params));

  // transforms
  inst.trim = () => inst.check(core.trim());
  inst.normalize = (...args) => inst.check(core.normalize(...args));
  inst.toLowerCase = () => inst.check(core.toLowerCase());
  inst.toUpperCase = () => inst.check(core.toUpperCase());
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodGUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodGUID extends core.$ZodGUID, ZodType<string, string> {
  "~def": core.$ZodGUIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodUUIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodEmailDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodURLDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodEmojiDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodNanoIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodCUIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodCUID2Def;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodULIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodXIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodKSUIDDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodISODateTimeDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodISODateDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodISOTimeDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodISODurationDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodIPDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodBase64Def;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodJSONStringDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodE164Def;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodJWTDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodNumberDef;
  "~isst": core.$ZodIssueInvalidType;
  gt(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  /** Identical to .min() */
  gte(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  min(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  lt(value: number, message?: core.$ZodCheckLessThanParams): this;
  /** Identical to .max() */
  lte(value: number, message?: core.$ZodCheckLessThanParams): this;
  max(value: number, message?: core.$ZodCheckLessThanParams): this;
  int(params?: core.$ZodCheckNumberFormatParams): this;
  /** @deprecated This is now identical to `.int()` instead. Only numbers in the safe integer range are accepted. */
  safe(params?: core.$ZodCheckNumberFormatParams): this;
  positive(message?: core.$ZodCheckGreaterThanParams): this;
  nonnegative(message?: core.$ZodCheckGreaterThanParams): this;
  negative(message?: core.$ZodCheckLessThanParams): this;
  nonpositive(message?: core.$ZodCheckLessThanParams): this;
  multipleOf(value: number, message?: core.$ZodCheckMultipleOfParams): this;
  /** @deprecated Use `.multipleOf()` instead. */
  step(value: number, message?: core.$ZodCheckMultipleOfParams): this;

  /** @deprecated In v4 and later, z.number() does not allow infinite values. This is a no-op. */
  finite(message?: any): this;

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

  inst.gt = (value, message) => inst.check(core.gt(value, message));
  inst.gte = (value, message) => inst.check(core.gte(value, message));
  inst.min = (value, message) => inst.check(core.gte(value, message));
  inst.lt = (value, message) => inst.check(core.lt(value, message));
  inst.lte = (value, message) => inst.check(core.lte(value, message));
  inst.max = (value, message) => inst.check(core.lte(value, message));
  inst.int = (message) => inst.check(core.int(message));
  inst.safe = (message) => inst.check(core.int(message));
  inst.positive = (message) => inst.check(core.gt(0, message));
  inst.nonnegative = (message) => inst.check(core.gte(0, message));
  inst.negative = (message) => inst.check(core.lt(0, message));
  inst.nonpositive = (message) => inst.check(core.lte(0, message));
  inst.multipleOf = (value, message) => inst.check(core.multipleOf(value, message));
  inst.step = (value, message) => inst.check(core.multipleOf(value, message));

  // inst.finite = (message) => inst.check(core.finite(message));
  inst.finite = () => inst;

  inst.minValue = inst["~computed"].minimum ?? null;
  inst.maxValue = inst["~computed"].maximum ?? null;
  inst.isInt =
    (inst["~computed"].format ?? "").includes("int") || Number.isSafeInteger(inst["~computed"].multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = inst["~computed"].format ?? null;
});

/////////////////////////////////////////////
/////////      ZodNumberFormat      /////////
/////////////////////////////////////////////

export interface ZodNumberFormat extends core.$ZodNumberFormat, ZodNumber {
  "~def": core.$ZodNumberFormatDef;
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
  "~def": core.$ZodBooleanDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodBigIntDef;
  "~isst": core.$ZodIssueInvalidType;

  gte(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  /** Alias of `.gte()` */
  min(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  gt(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  /** Alias of `.lte()` */
  lte(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  max(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  lt(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  positive(message?: core.$ZodCheckGreaterThanParams): this;
  negative(message?: core.$ZodCheckLessThanParams): this;
  nonpositive(message?: core.$ZodCheckLessThanParams): this;
  nonnegative(message?: core.$ZodCheckGreaterThanParams): this;
  multipleOf(value: bigint, message?: core.$ZodCheckMultipleOfParams): this;

  minValue: bigint | null;
  maxValue: bigint | null;
  format: string | null;
}
export const ZodBigInt: core.$constructor<ZodBigInt> = /*@__PURE__*/ core.$constructor("ZodBigInt", (inst, def) => {
  core.$ZodBigInt.init(inst, def);
  ZodType.init(inst, def);

  inst.gte = (value, message) => inst.check(core.gte(value, message));
  inst.min = (value, message) => inst.check(core.gte(value, message));
  inst.gt = (value, message) => inst.check(core.gt(value, message));
  inst.gte = (value, message) => inst.check(core.gte(value, message));
  inst.min = (value, message) => inst.check(core.gte(value, message));
  inst.lt = (value, message) => inst.check(core.lt(value, message));
  inst.lte = (value, message) => inst.check(core.lte(value, message));
  inst.max = (value, message) => inst.check(core.lte(value, message));
  inst.positive = (message) => inst.check(core.gt(BigInt(0), message));
  inst.negative = (message) => inst.check(core.lt(BigInt(0), message));
  inst.nonpositive = (message) => inst.check(core.lte(BigInt(0), message));
  inst.nonnegative = (message) => inst.check(core.gte(BigInt(0), message));
  inst.multipleOf = (value, message) => inst.check(core.multipleOf(value, message));

  inst.minValue = inst["~computed"].minimum ?? null;
  inst.maxValue = inst["~computed"].maximum ?? null;
  inst.format = inst["~computed"].format ?? null;
});

/////////////////////////////////////////////
/////////      ZodBigIntFormat      /////////
/////////////////////////////////////////////

export interface ZodBigIntFormat extends core.$ZodBigIntFormat, ZodBigInt {
  "~def": core.$ZodBigIntFormatDef;
  // "~isst": core.$ZodIssueInvalidType;
  // "~issc": core.$ZodIssueTooBig<"bigint"> | core.$ZodIssueTooSmall<"bigint">;
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
  "~def": core.$ZodSymbolDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodUndefinedDef;
  "~isst": core.$ZodIssueInvalidType;
  "~values": core.$PrimitiveSet;
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
  "~def": core.$ZodNullDef;
  "~isst": core.$ZodIssueInvalidType;
  "~values": core.$PrimitiveSet;
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
  "~def": core.$ZodAnyDef;
  "~isst": never;
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
  "~def": core.$ZodUnknownDef;
  "~isst": never;
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
  "~def": core.$ZodNeverDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodVoidDef;
  "~isst": core.$ZodIssueInvalidType;
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
  "~def": core.$ZodDateDef;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueInvalidDate;
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

  inst.min = (value, params) => inst.check(core.gte(value, params));
  inst.max = (value, params) => inst.check(core.lte(value, params));

  const c = inst["~computed"];
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

export interface ZodArray<T extends ZodType = ZodType>
  extends core.$ZodArray<T>,
    ZodType<T["~output"][], T["~input"][]> {
  "~def": core.$ZodArrayDef<T>;
  "~isst": core.$ZodIssueInvalidType;

  element: T;
  min(minLength: number, params?: core.$ZodCheckMinSizeParams): this;
  nonempty(params?: core.$ZodCheckMinSizeParams): this;
  max(maxLength: number, params?: core.$ZodCheckMaxSizeParams): this;
  length(len: number, params?: core.$ZodCheckSizeEqualsParams): this;
}
export const ZodArray: core.$constructor<ZodArray> = /*@__PURE__*/ core.$constructor("ZodArray", (inst, def) => {
  core.$ZodArray.init(inst, def);
  ZodType.init(inst, def);

  inst.element = def.type as any;
  inst.min = (minLength, params) => inst.check(core.minSize(minLength, params));
  inst.nonempty = (params) => inst.check(core.minSize(1, params));
  inst.max = (maxLength, params) => inst.check(core.maxSize(maxLength, params));
  inst.length = (len, params) => inst.check(core.size(len, params));
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodShape {
  [k: string]: ZodType;
}

export type { ZodShape as ZodRawShape };

export interface ZodObject<
  // @ts-ignore
  out Shape extends ZodShape = ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends core.$ZodObject<Shape, Extra>,
    ZodType<core.$InferObjectOutput<Shape, Extra>, core.$InferObjectInput<Shape, Extra>> {
  "~def": core.$ZodObjectDef<Shape>;
  "~disc": core.$DiscriminatorMap;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;
  shape: Shape;

  keyof(): ZodEnum<util.ToEnum<keyof Shape & string>>;
  catchall(schema: ZodType): this;

  /** @deprecated Use `z.looseObject()` or `.loose()` instead. */
  passthrough(): ZodObject<Shape>;
  /** @deprecated Use `z.looseObject()` instead. */
  loose(): ZodObject<Shape>;
  /** @deprecated Use `z.strictObject()` instead. */
  strict(): this;
  /** @deprecated This is the defaut behavior. */
  strip(): this;

  extend<U extends ZodShape>(shape: U): ZodObject<util.Flatten<util.Overwrite<Shape, U>>>;

  // merge
  /** @deprecated Use `A.extend(B.shape)` */
  merge<U extends ZodObject<any>>(other: U): ZodObject<util.Flatten<util.Overwrite<Shape, U["~def"]["shape"]>>>;

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
    [k in keyof Shape]: ZodRequired<Shape[k]>;
  }>;
  required<M extends util.Exactly<util.Mask<string & keyof Shape>, M>>(
    mask: M
  ): ZodObject<{
    [k in keyof Shape]: k extends keyof M ? ZodRequired<Shape[k]> : Shape[k];
  }>;
}

export const ZodObject: core.$constructor<ZodObject> = /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodType.init(inst, def);
  inst.shape = def.shape;

  inst.keyof = () => api.enum(Object.keys(inst["~def"].shape)) as any;
  inst.catchall = (catchall) => inst.clone({ ...inst["~def"], catchall });
  inst.passthrough = () => inst.clone({ ...inst["~def"], catchall: api.unknown() });
  inst.loose = () => inst.clone({ ...inst["~def"], catchall: api.unknown() });
  inst.strict = () => inst.clone({ ...inst["~def"], catchall: api.never() });
  inst.strip = () => inst.clone({ ...inst["~def"], catchall: undefined });

  inst.extend = (shape) => util.extend(inst, shape);
  inst.merge = (other) =>
    other.clone({
      ...other["~def"],
      get shape() {
        return { ...inst.shape, ...other.shape };
      },
      checks: [],
    });
  inst.pick = (mask) => util.pick(inst, mask);
  inst.omit = (mask) => util.omit(inst, mask);
  inst.partial = (...args: any[]) => util.partialObject(inst, args[0] as object, ZodOptional);
  inst.required = (...args: any[]) => util.requiredObject(inst, args[0] as object, ZodRequired);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodInterface      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
type ZodInterfaceExtend<T extends ZodInterface, Shape extends ZodShape> = ZodInterface<
  // util.Flatten<util.Overwrite<T["~shape"], Shape>>,
  util.ExtendInterfaceShape<T["~shape"], Shape>,
  T["~extra"]
>;

type ZodInterfacePartial<T extends ZodInterface, Keys extends string> = ZodInterface<
  util.PartialInterfaceShape<T["~shape"], Keys>,
  T["~extra"]
>;

type ZodInterfaceRequired<T extends ZodInterface, Keys extends string> = ZodInterface<
  util.Flatten<
    Omit<T, Keys> & {
      [k in Keys as k extends `${infer NewK}?` ? NewK : k extends `?${infer NewK}` ? NewK : k]: T["~shape"][k];
    }
  >,
  T["~extra"]
>;

export interface ZodInterface<
  // @ts-ignore Cast variance
  out Shape extends core.$ZodLooseShape = core.$ZodLooseShape,
  out Extra extends Record<string, any> = Record<string, any>,
  // @ts-ignore
  // out O extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
  // @ts-ignore
  // out I extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
> extends core.$ZodInterface<Shape, Extra>,
    ZodType<
      // unknown,
      // unknown
      core.$InferInterfaceOutput<Shape, Extra>,
      core.$InferInterfaceInput<Shape, Extra>
    > {
  "~def": core.$ZodInterfaceDef;
  // "~shape": ZodLoo
  // "~output": core.$InferInterfaceOutput<Shape, Extra>;
  // "~input": core.$InferInterfaceInput<Shape, Extra>;
  "~disc": core.$DiscriminatorMap;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueUnrecognizedKeys;

  keyof(): ZodEnum<util.ToEnum<string & util.InterfaceKeys<string & keyof Shape>>>;

  catchall(schema: ZodType): this;

  extend<U extends ZodShape>(shape: U): ZodInterface<util.ExtendInterfaceShape<Shape, U>, Extra>;

  merge<U extends ZodInterface>(
    incoming: U
  ): ZodInterface<
    util.Flatten<util.Overwrite<this["~shape"], U["~shape"]>>,
    // util.Flatten<util.Overwrite<this["~output"], U["~output"]>>,
    // util.Flatten<util.Overwrite<this["~input"], U["~input"]>>
    this["~extra"] & U["~extra"]
  >;

  pick<const M extends util.Exactly<util.Mask<string & keyof this["~shape"]>, M>>(
    mask: M
  ): ZodInterface<Pick<this["~shape"], string & keyof M>, Extra>;

  omit<const M extends util.Exactly<util.Mask<string & keyof this["~shape"]>, M>>(
    mask: M
  ): ZodInterface<Omit<this["~shape"], keyof M>, Extra>;

  partial(): ZodInterfacePartial<this, string & keyof this["~shape"]>;
  partial<M extends util.Mask<string & keyof this["~shape"]>>(mask: M): ZodInterfacePartial<this, string & keyof M>;

  required(): ZodInterfaceRequired<this, string & keyof this["~shape"]>;
  required<M extends util.Mask<string & keyof this["~shape"]>>(mask: M): ZodInterfaceRequired<this, string & keyof M>;
}
export const ZodInterface: core.$constructor<ZodInterface> = /*@__PURE__*/ core.$constructor(
  "ZodObject",
  (inst, def) => {
    core.$ZodInterface.init(inst, def);
    ZodType.init(inst, def);

    inst.keyof = () => api.enum(Object.keys(inst["~output"]));
    inst.catchall = (catchall) => inst.clone({ ...inst["~def"], catchall });

    inst.extend = (shape) => util.extend(inst, shape);
    inst.merge = (other) =>
      other.clone({
        ...other["~def"],
        get shape() {
          return { ...inst["~def"].shape, ...other["~def"].shape };
        },
        checks: [],
      }) as any;

    inst.pick = (mask) => util.pick(inst, mask);
    inst.omit = (mask) => util.omit(inst, mask);
    inst.partial = (...args: any[]) => util.partialInterface(inst, args[0]);
    inst.required = (...args: any[]) => util.requiredInterface(inst, args[0]);
  }
);

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodUnion      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodUnion<Options extends readonly ZodType[] = readonly ZodType[]>
  extends core.$ZodUnion<Options>,
    ZodType<Options[number]["~output"], Options[number]["~input"]> {
  "~def": core.$ZodUnionDef;
  "~isst": core.$ZodIssueInvalidUnion;

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
export interface ZodHasDiscriminator extends ZodType {
  "~disc": core.$DiscriminatorMap;
}

export interface ZodDiscriminatedUnion<Options extends readonly ZodType[] = readonly ZodType[]>
  extends core.$ZodDiscriminatedUnion<Options>,
    ZodType<Options[number]["~output"], Options[number]["~input"]> {
  "~def": core.$ZodDiscriminatedUnionDef;
  "~disc": core.$DiscriminatorMap;
  "~isst": core.$ZodIssueInvalidUnion;

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

export interface ZodIntersection<A extends ZodType = ZodType, B extends ZodType = ZodType>
  extends core.$ZodIntersection<A, B>,
    ZodType<A["~output"] & B["~output"], A["~input"] & B["~input"]> {
  "~def": core.$ZodIntersectionDef;
  "~isst": never;
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

type ZodTupleItems = ZodType[];
export interface ZodTuple<T extends ZodTupleItems = ZodTupleItems, Rest extends ZodType | null = ZodType | null>
  extends core.$ZodTuple<T, Rest>,
    ZodType<core.$InferTupleOutputType<T, Rest>, core.$InferTupleInputType<T, Rest>> {
  "~def": core.$ZodTupleDef<T, Rest>;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueTooBig<unknown[]> | core.$ZodIssueTooSmall<unknown[]>;

  rest<Rest extends ZodType>(rest: Rest): ZodTuple<T, Rest>;
}
export const ZodTuple: core.$constructor<ZodTuple> = /*@__PURE__*/ core.$constructor("ZodTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodType.init(inst, def);

  inst.rest = (rest) =>
    inst.clone({
      ...inst["~def"],
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
export interface ZodPropertyKey extends ZodType<PropertyKey, PropertyKey> {}
export interface ZodHasValues extends ZodType<PropertyKey, PropertyKey> {
  "~values": Set<PropertyKey>;
}

export interface ZodHasPattern extends ZodType<PropertyKey, PropertyKey> {
  "~pattern": RegExp;
}

type ZodRecordKey = ZodPropertyKey; // ZodHasValues | ZodHasPattern;

export interface ZodRecord<K extends ZodRecordKey = ZodRecordKey, V extends ZodType = ZodType>
  extends core.$ZodRecord<K, V>,
    ZodType<Record<K["~output"], V["~output"]>, Record<K["~input"], V["~input"]>> {
  "~def": core.$ZodRecordDef;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
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

export interface ZodMap<Key extends ZodType = ZodType, Value extends ZodType = ZodType>
  extends core.$ZodMap<Key, Value>,
    ZodType<Map<Key["~output"], Value["~output"]>, Map<Key["~input"], Value["~input"]>> {
  "~def": core.$ZodMapDef;
  "~isst": core.$ZodIssueInvalidType | core.$ZodIssueInvalidKey | core.$ZodIssueInvalidElement<unknown>;
}
export const ZodMap: core.$constructor<ZodMap> = /*@__PURE__*/ core.$constructor("ZodMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodSet      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodSet<T extends ZodType = ZodType>
  extends core.$ZodSet<T>,
    ZodType<Set<T["~output"]>, Set<T["~input"]>> {
  "~def": core.$ZodSetDef;
  "~isst": core.$ZodIssueInvalidType;

  min(minSize: number, params?: core.$ZodCheckMinSizeParams): this;
  /** */
  nonempty(params?: core.$ZodCheckMinSizeParams): this;
  max(maxSize: number, params?: core.$ZodCheckMaxSizeParams): this;
  size(size: number, params?: core.$ZodCheckSizeEqualsParams): this;
}
export const ZodSet: core.$constructor<ZodSet> = /*@__PURE__*/ core.$constructor("ZodSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (...args) => inst.check(core.minSize(...args));
  inst.nonempty = (params) => inst.check(core.minSize(1, params));
  inst.max = (...args) => inst.check(core.maxSize(...args));
  inst.size = (...args) => inst.check(core.size(...args));
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodEnum      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodEnum<
  // @ts-ignore
  out T extends util.EnumLike = util.EnumLike,
> extends core.$ZodEnum<T>,
    ZodType<core.$InferEnumOutput<T>, core.$InferEnumInput<T>> {
  "~def": core.$ZodEnumDef<T>;
  "~values": Set<util.Primitive>;
  "~isst": core.$ZodIssueInvalidValue;
  enum: T;
}
export const ZodEnum: core.$constructor<ZodEnum> = /*@__PURE__*/ core.$constructor("ZodEnum", (inst, def) => {
  core.$ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst.enum = def.entries;
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodLiteral      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodLiteral<T extends util.Literal = util.Literal> extends core.$ZodLiteral<T>, ZodType<T, T> {
  "~def": core.$ZodLiteralDef;
  "~values": Set<util.Primitive>;
  "~isst": core.$ZodIssueInvalidValue;

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
  "~def": core.$ZodFileDef;
  "~isst": core.$ZodIssueInvalidType;
}
export const ZodFile: core.$constructor<ZodFile> = /*@__PURE__*/ core.$constructor("ZodFile", (inst, def) => {
  core.$ZodFile.init(inst, def);
  ZodType.init(inst, def);
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodEffect      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
// export interface ZodEffectDef extends core.$ZodEffectDef {
//   effect: (
//     input: unknown,
//     ctx?: RefinementCtx<unknown>
//     // ctx?: base.$ParseContext | undefined
//   ) => util.MaybeAsync<unknown>;
// }
export interface ZodEffect<O = unknown, I = unknown> extends core.$ZodEffect<O, I>, ZodType<O, I> {
  "~def": core.$ZodEffectDef;
  "~isst": never;
}

function handleEffectResult(output: any, result: core.$ZodResult<any>) {
  if (result.aborted) {
    return result;
  }
  result.value = output;
  return result;
}
export const ZodEffect: core.$constructor<ZodEffect> = /*@__PURE__*/ core.$constructor("ZodEffect", (inst, def) => {
  core.$ZodEffect.init(inst, def);
  ZodType.init(inst, def);

  // override super implementation to support RefinementCtx
  inst._parse = (input, _ctx) => {
    const result = core.$result<unknown>(input) as RefinementCtx;

    result.addIssue = (issue) => {
      // for Zod 3 backwards compatibility
      if ((issue as any).fatal) result.aborted = true;
      // result.aborted = true;
      console.log(`adding issue`, issue);
      result.issues.push(core.issue(issue));
    };

    const output = def.effect(input, result);
    if (output instanceof Promise) {
      return output.then((output) => handleEffectResult(output, result));
    }
    return handleEffectResult(output, result);
  };
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodOptional      //////////
//////////                       //////////
//////////////////////////?////////////////
///////////////////////////////////////////

export interface ZodOptional<T extends ZodType = ZodType>
  extends core.$ZodOptional<T>,
    ZodType<T["~output"] | undefined, T["~input"] | undefined> {
  "~def": core.$ZodOptionalDef<T>;
  "~qin": "true";
  "~qout": "true";
  "~isst": never;

  unwrap(): T;
}
export const ZodOptional: core.$constructor<ZodOptional> = /*@__PURE__*/ core.$constructor(
  "ZodOptional",
  (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst["~def"].innerType;
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodNullable<T extends ZodType = ZodType>
  extends core.$ZodNullable<T>,
    ZodType<T["~output"] | null, T["~input"] | null> {
  "~def": core.$ZodNullableDef<T>;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;

  unwrap(): T;
}
export const ZodNullable: core.$constructor<ZodNullable> = /*@__PURE__*/ core.$constructor(
  "ZodNullable",
  (inst, def) => {
    core.$ZodNullable.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst["~def"].innerType;
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodRequired      //////////
//////////                       //////////
//////////////////////////?////////////////
///////////////////////////////////////////

export interface ZodRequired<T extends ZodType = ZodType>
  extends core.$ZodRequired<T>,
    ZodType<util.NoUndefined<T["~output"]>, util.NoUndefined<T["~input"]>> {
  "~def": core.$ZodRequiredDef<T>;
  "~isst": core.$ZodIssueInvalidType;

  unwrap(): T;
}
export const ZodRequired: core.$constructor<ZodRequired> = /*@__PURE__*/ core.$constructor(
  "ZodRequired",
  (inst, def) => {
    core.$ZodRequired.init(inst, def);
    ZodType.init(inst, def);

    inst.unwrap = () => inst["~def"].innerType;
  }
);

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodSuccess      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodSuccess<T extends ZodType = ZodType> extends core.$ZodSuccess<T>, ZodType<boolean, T["~input"]> {
  "~def": core.$ZodSuccessDef;
  "~isst": never;
}
export const ZodSuccess: core.$constructor<ZodSuccess> = /*@__PURE__*/ core.$constructor("ZodSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodDefault      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodDefault<T extends ZodType = ZodType>
  extends core.$ZodDefault<T>,
    ZodType<util.NoUndefined<T["~output"]>, T["~input"] | undefined> {
  "~def": core.$ZodDefaultDef;
  "~qin": "true"; // T["~qin"];
  "~isst": never;
}
export const ZodDefault: core.$constructor<ZodDefault> = /*@__PURE__*/ core.$constructor("ZodDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodType.init(inst, def);
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCatch      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCatch<T extends ZodType = ZodType> extends core.$ZodCatch<T>, ZodType<T["~output"], unknown> {
  "~def": core.$ZodCatchDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;
}
export const ZodCatch: core.$constructor<ZodCatch> = /*@__PURE__*/ core.$constructor("ZodCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodType.init(inst, def);
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodNaN      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface ZodNaN extends core.$ZodNaN, ZodType<number, number> {
  "~def": core.$ZodNaNDef;
  "~isst": core.$ZodIssueInvalidType;
}
export const ZodNaN: core.$constructor<ZodNaN> = /*@__PURE__*/ core.$constructor("ZodNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodType.init(inst, def);
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodPipeline      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodPipeline<A extends ZodType = ZodType, B extends ZodType = ZodType>
  extends core.$ZodPipeline<A, B>,
    ZodType<B["~output"], A["~input"]> {
  "~def": core.$ZodPipelineDef;
  "~isst": never;
}
export const ZodPipeline: core.$constructor<ZodPipeline> = /*@__PURE__*/ core.$constructor(
  "ZodPipeline",
  (inst, def) => {
    core.$ZodPipeline.init(inst, def);
    ZodType.init(inst, def);
  }
);

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodReadonly      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodReadonly<T extends ZodType = ZodType>
  extends core.$ZodReadonly<T>,
    ZodType<core.MakeReadonly<T["~output"]>, core.MakeReadonly<T["~input"]>> {
  "~def": core.$ZodReadonlyDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~isst": never;
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
  "~def": core.$ZodTemplateLiteralDef;
  "~isst": core.$ZodIssueInvalidType;
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

export interface ZodPromise<T extends ZodType = ZodType>
  extends core.$ZodPromise<T>,
    ZodType<T["~output"], util.MaybeAsync<T["~input"]>> {
  "~def": core.$ZodPromiseDef;
  "~isst": never;
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
  "~def": core.$ZodCustomDef;
  "~isst": never;
  // "~issc": core.$ZodIssueInvalidType;
}
export const ZodCustom: core.$constructor<ZodCustom> = /*@__PURE__*/ core.$constructor("ZodCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodType.init(inst, def);
});
