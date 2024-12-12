import * as core from "zod-core";
import type * as util from "zod-core/util";
import * as api from "./api.js";
import * as factories from "./factories.js";
export type CustomErrorParams = Omit<core.$ZodIssueBase, "code">;
export interface ParseContext extends core.$ParseContext {}

// import { $ZodError } from "zod-core";
export { $ZodError as ZodError } from "zod-core";

///////////////////////////////////////////
///////////////////////////////////////////
////////////                   ////////////
////////////      ZodType      ////////////
////////////                   ////////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface ZodTypeDef extends core.$ZodTypeDef {}

interface OptionalParams extends util.TypeParams<ZodOptional, "innerType"> {}
interface NullableParams extends util.TypeParams<ZodNullable, "innerType"> {}

export interface ZodType<Output = unknown, Input = unknown>
  extends core.$ZodType<Output, Input> {
  "~def": ZodTypeDef;
  // parse methods
  parse(data: unknown, params?: ParseContext): Output;
  safeParse(data: unknown, params?: ParseContext): util.SafeParseResult<Output>;
  parseAsync(data: unknown, params?: ParseContext): Promise<Output>;
  safeParseAsync(
    data: unknown,
    params?: ParseContext
  ): Promise<util.SafeParseResult<Output>>;
  spa: (
    data: unknown,
    params?: ParseContext
  ) => Promise<util.SafeParseResult<Output>>;

  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?:
      | string
      | CustomErrorParams
      | core.$ZodErrorMap<core.$ZodIssueCustom>
  ): this;
  /**
   * @deprecated Use `.check()` instead.
   */
  // refinement<RefinedOutput extends Output>(
  //   check: (arg: Output) => arg is RefinedOutput,
  //   refinementData:
  //     | core.IssueData
  //     | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  // ): this;
  // /**
  //  * @deprecated Use `.check()` instead.
  //  */
  // refinement(
  //   check: (arg: Output) => boolean,
  //   refinementData:
  //     | core.IssueData
  //     | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  // ): this;
  // _refinement(refinement: RefinementEffect<Output>["refinement"]): this;
  // /**
  //  * @deprecated Use `.check()` instead.
  //  */
  // superRefine<RefinedOutput extends Output>(
  //   refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  // ): this;
  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine(
    refinement: (arg: Output, ctx: util.RefinementCtx) => void | Promise<void>
  ): this;

  // check(...checks: core.$CheckFn<Output> | core.$ZodCheck<Output>[]): this;

  optional(params?: OptionalParams): ZodOptional<this>;
  nullable(params?: NullableParams): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  array(): ZodArray<this>;
  // promise(): ZodPromise<this>;
  or<T extends ZodType>(option: T): ZodUnion<[this, T]>;
  and<T extends ZodType>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(
    transform: (
      arg: Output
      // ctx: RefinementCtx
    ) => NewOut | Promise<NewOut>
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

export const ZodType: core.$constructor<ZodType> = core.$constructor(
  "ZodType",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst.parse = (data, params) => {
      return api.parse(inst, data, params);
    };
    inst.safeParse = (data, params) => {
      return api.safeParse(inst, data, params);
    };
    inst.parseAsync = async (data, params) => {
      return api.parseAsync(inst, data, params);
    };
    inst.safeParseAsync = async (data, params) => {
      return api.safeParseAsync(inst, data, params);
    };

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
    inst.transform = (tx) => api.transform(inst, tx);
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
  }
);

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

export interface ZodStringDef extends core.$ZodStringDef {}
export interface ZodString
  extends core.$ZodString<string>,
    ZodType<string, string> {
  "~def": ZodStringDef;
  "~issp": core.$ZodIssueInvalidType<"string">;

  // string format checks
  // email(): ZodString;
  // email(params?: string): ZodString;
  // email(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.email()` instead. */
  email(params?: string | core.$ZodCheckEmailParams): ZodString;
  /** @deprecated Use `z.url()` instead. */
  url(params?: core.$ZodCheckURLParams): ZodString;
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
  includes(
    value: string,
    params?: { message?: string; position?: number }
  ): ZodString;
  startsWith(
    value: string,
    message?: string | core.$ZodCheckStartsWithParams
  ): ZodString;
  endsWith(
    value: string,
    message?: string | core.$ZodCheckEndsWithParams
  ): ZodString;
  min(
    minLength: number,
    message?: string | core.$ZodCheckMinSizeParams
  ): ZodString;
  max(
    maxLength: number,
    message?: string | core.$ZodCheckMaxSizeParams
  ): ZodString;
  length(
    len: number,
    message?: string | core.$ZodCheckSizeEqualsParams
  ): ZodString;
  nonempty(message?: string | core.$ZodCheckMinSizeParams): ZodString;

  // transforms
  trim(): ZodString;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;

  get minLength(): number | null;
  get maxLength(): number | null;
}

export const ZodString: core.$constructor<ZodString> = core.$constructor(
  "ZodString",
  (inst, def) => {
    core.$ZodString.init(inst, def);
    ZodType.init(inst, def);

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

    inst.regex = (params) => inst.check(core.regex(params));
    inst.includes = (params) => inst.check(core.includes(params));
    inst.startsWith = (params) => inst.check(core.startsWith(params));
    inst.endsWith = (params) => inst.check(core.endsWith(params));
    inst.min = (...args) => inst.check(core.minSize(...args));
    inst.max = (...args) => inst.check(core.maxSize(...args));
    inst.length = (...args) => inst.check(core.size(...args));
    inst.nonempty = (...args) => inst.check(core.minSize(1, ...args));
    inst.trim = () => inst.check(core.trim());
    inst.normalize = (...args) => inst.check(core.normalize(...args));
    inst.toLowerCase = () => inst.check(core.toLowerCase());
    inst.toUpperCase = () => inst.check(core.toUpperCase());
  }
);

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodGUID      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodGUID extends core.$ZodGUID, ZodType<string, string> {
  "~def": core.$ZodGUIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodGUID: core.$constructor<ZodGUID> =
  /*@__PURE__*/ core.$constructor("ZodGUID", (inst, def): void => {
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
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodUUID: core.$constructor<ZodUUID> =
  /*@__PURE__*/ core.$constructor("ZodUUID", (inst, def): void => {
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
export interface ZodEmailDef extends core.$ZodEmailDef {}
export interface ZodEmail extends core.$ZodEmail, ZodType<string, string> {
  "~def": ZodEmailDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodEmail: core.$constructor<ZodEmail> =
  /*@__PURE__*/ core.$constructor("ZodEmail", (inst, def) => {
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
export interface ZodURLDef extends core.$ZodURLDef {}
export interface ZodURL extends core.$ZodURL, ZodType<string, string> {
  "~def": ZodURLDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodURL: core.$constructor<ZodURL> =
  /*@__PURE__*/ core.$constructor("ZodURL", function (inst, def) {
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
export interface ZodEmojiDef extends core.$ZodEmojiDef {}
export interface ZodEmoji extends core.$ZodEmoji, ZodType<string, string> {
  "~def": ZodEmojiDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodEmoji: core.$constructor<ZodEmoji> =
  /*@__PURE__*/ core.$constructor("ZodEmoji", (inst, def) => {
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
export interface ZodNanoIDDef extends core.$ZodNanoIDDef {}
export interface ZodNanoID extends core.$ZodNanoID, ZodType<string, string> {
  "~def": ZodNanoIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodNanoID: core.$constructor<ZodNanoID> =
  /*@__PURE__*/ core.$constructor("ZodNanoID", (inst, def) => {
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
export interface ZodCUIDDef extends core.$ZodCUIDDef {}
export interface ZodCUID extends core.$ZodCUID, ZodType<string, string> {
  "~def": ZodCUIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodCUID: core.$constructor<ZodCUID> =
  /*@__PURE__*/ core.$constructor("ZodCUID", (inst, def) => {
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
export interface ZodCUID2Def extends core.$ZodCUID2Def {}
export interface ZodCUID2 extends core.$ZodCUID2, ZodType<string, string> {
  "~def": ZodCUID2Def;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodCUID2: core.$constructor<ZodCUID2> =
  /*@__PURE__*/ core.$constructor("ZodCUID2", (inst, def) => {
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
export interface ZodULIDDef extends core.$ZodULIDDef {}
export interface ZodULID extends core.$ZodULID, ZodType<string, string> {
  "~def": ZodULIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodULID: core.$constructor<ZodULID> =
  /*@__PURE__*/ core.$constructor("ZodULID", (inst, def) => {
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
export interface ZodXIDDef extends core.$ZodXIDDef {}
export interface ZodXID extends core.$ZodXID, ZodType<string, string> {
  "~def": ZodXIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodXID: core.$constructor<ZodXID> =
  /*@__PURE__*/ core.$constructor("ZodXID", (inst, def) => {
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
export interface ZodKSUIDDef extends core.$ZodKSUIDDef {}
export interface ZodKSUID extends core.$ZodKSUID, ZodType<string, string> {
  "~def": ZodKSUIDDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodKSUID: core.$constructor<ZodKSUID> =
  /*@__PURE__*/ core.$constructor("ZodKSUID", (inst, def) => {
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
export interface ZodISODateTimeDef extends core.$ZodISODateTimeDef {}
export interface ZodISODateTime
  extends core.$ZodISODateTime,
    ZodType<string, string> {
  "~def": ZodISODateTimeDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodISODateTime: core.$constructor<ZodISODateTime> =
  /*@__PURE__*/ core.$constructor("ZodISODateTime", (inst, def) => {
    core.$ZodISODateTime.init(inst, def);
    ZodType.init(inst, def);
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodISODate      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodISODateDef extends core.$ZodISODateDef {}
export interface ZodISODate extends core.$ZodISODate, ZodType<string, string> {
  "~def": ZodISODateDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodISODate: core.$constructor<ZodISODate> =
  /*@__PURE__*/ core.$constructor("ZodISODate", (inst, def) => {
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
export interface ZodISOTimeDef extends core.$ZodISOTimeDef {}
export interface ZodISOTime extends core.$ZodISOTime, ZodType<string, string> {
  "~def": ZodISOTimeDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodISOTime: core.$constructor<ZodISOTime> =
  /*@__PURE__*/ core.$constructor("ZodISOTime", (inst, def) => {
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
export interface ZodISODurationDef extends core.$ZodISODurationDef {}
export interface ZodISODuration
  extends core.$ZodISODuration,
    ZodType<string, string> {
  "~def": ZodISODurationDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodISODuration: core.$constructor<ZodISODuration> =
  /*@__PURE__*/ core.$constructor("ZodISODuration", (inst, def) => {
    core.$ZodISODuration.init(inst, def);
    ZodType.init(inst, def);
  });

/////////////////////////////////////
/////////////////////////////////////
//////////                 //////////
//////////      ZodIP      //////////
//////////                 //////////
/////////////////////////////////////
/////////////////////////////////////
export interface ZodIPDef extends core.$ZodIPDef {}
export interface ZodIP extends core.$ZodIP, ZodType<string, string> {
  "~def": ZodIPDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodIP: core.$constructor<ZodIP> = /*@__PURE__*/ core.$constructor(
  "ZodIP",
  (inst, def) => {
    core.$ZodIP.init(inst, def);
    ZodType.init(inst, def);
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBase64      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodBase64Def extends core.$ZodBase64Def {}
export interface ZodBase64 extends core.$ZodBase64, ZodType<string, string> {
  "~def": ZodBase64Def;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodBase64: core.$constructor<ZodBase64> =
  /*@__PURE__*/ core.$constructor("ZodBase64", (inst, def) => {
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
export interface ZodJSONStringDef extends core.$ZodJSONStringDef {}
export interface ZodJSONString
  extends core.$ZodJSONString,
    ZodType<string, string> {
  "~def": ZodJSONStringDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodJSONString: core.$constructor<ZodJSONString> =
  /*@__PURE__*/ core.$constructor("ZodJSONString", (inst, def) => {
    core.$ZodJSONString.init(inst, def);
    ZodType.init(inst, def);
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodE164        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodE164Def extends core.$ZodE164Def {}
export interface ZodE164 extends core.$ZodE164, ZodType<string, string> {
  "~def": ZodE164Def;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodE164: core.$constructor<ZodE164> =
  /*@__PURE__*/ core.$constructor("ZodE164", (inst, def) => {
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
export interface ZodJWTDef extends core.$ZodJWTDef {}
export interface ZodJWT extends core.$ZodJWT, ZodType<string, string> {
  "~def": ZodJWTDef;
  "~issp": core.$ZodIssueInvalidType<"string">;
}
export const ZodJWT: core.$constructor<ZodJWT> =
  /*@__PURE__*/ core.$constructor("ZodJWT", (inst, def) => {
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

export interface ZodNumberDef extends core.$ZodNumberDef {}
export interface ZodNumber
  extends core.$ZodNumber<number>,
    ZodType<number, number> {
  "~def": ZodNumberDef;
  "~computed": {
    minimum?: number | bigint;
    maximum?: number | bigint;
    multiple_of?: number;
  };
  "~issp": core.$ZodIssueInvalidType<"number">;
  gt(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  gte(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  min(value: number, message?: core.$ZodCheckGreaterThanParams): this;
  lt(value: number, message?: core.$ZodCheckLessThanParams): this;
  lte(value: number, message?: core.$ZodCheckLessThanParams): this;
  max(value: number, message?: core.$ZodCheckLessThanParams): this;
  /** @deprecated Use `z.int()` instead. */
  int(
    // message?: util.MethodParams<
    //   | core.$ZodIssueInvalidType<"number", number>
    //   | core.$ZodIssueTooBig<"number">
    //   | core.$ZodIssueTooSmall<"number">
    // >
    params?: core.$ZodCheckNumberFormatParams
  ): this;
  /** @deprecated Use `.int()` instead. */
  safe(params?: core.$ZodCheckNumberFormatParams): this;
  positive(message?: core.$ZodCheckGreaterThanParams): this;
  nonnegative(message?: core.$ZodCheckGreaterThanParams): this;
  negative(message?: core.$ZodCheckLessThanParams): this;
  nonpositive(message?: core.$ZodCheckLessThanParams): this;
  multipleOf(value: number, message?: core.$ZodCheckMultipleOfParams): this;
  /** @deprecated Use `.multipleOf()` instead. */
  step(value: number, message?: core.$ZodCheckMultipleOfParams): this;
  finite(message?: core.$ZodCheckFiniteParams): this;
}

export const ZodNumber: core.$constructor<ZodNumber> =
  /*@__PURE__*/ core.$constructor("ZodNumber", (inst, def) => {
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
    inst.multipleOf = (value, message) =>
      inst.check(core.multipleOf(value, message));
    inst.step = (value, message) => inst.check(core.multipleOf(value, message));
    inst.finite = (message) => inst.check(core.finite(message));
  });

/////////////////////////////////////////////
/////////      ZodNumberFormat      /////////
/////////////////////////////////////////////
export interface ZodNumberFormatDef
  extends core.$ZodNumberFormatDef,
    ZodNumberDef {}

export interface ZodNumberFormat extends core.$ZodNumberFormat, ZodNumber {
  "~def": ZodNumberFormatDef;
}

export const ZodNumberFormat: core.$constructor<ZodNumberFormat> =
  /*@__PURE__*/ core.$constructor("ZodNumberFormat", (inst, def) => {
    core.$ZodNumber.init(inst, def); // no format checks
    ZodNumber.init(inst, def);
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodBoolean      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodBooleanDef extends core.$ZodBooleanDef {}
export interface ZodBoolean
  extends core.$ZodBoolean<boolean>,
    ZodType<boolean, boolean> {
  "~def": ZodBooleanDef;
  "~issp": core.$ZodIssueInvalidType<"boolean">;
}
export const ZodBoolean: core.$constructor<ZodBoolean> =
  /*@__PURE__*/ core.$constructor("ZodBoolean", (inst, def) => {
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

export interface ZodBigIntDef extends core.$ZodBigIntDef {}
export interface ZodBigInt
  extends core.$ZodBigInt<bigint>,
    ZodType<bigint, bigint> {
  "~def": ZodBigIntDef;
  "~issp": core.$ZodIssueInvalidType<"bigint">;

  // gte
  gte(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  // min
  /** Alias of `.gte()` */
  min(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  // gt
  gt(value: bigint, message?: core.$ZodCheckGreaterThanParams): this;
  // lte
  /** Alias of `.lte()` */
  lte(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  // max
  max(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  // lt
  lt(value: bigint, message?: core.$ZodCheckLessThanParams): this;
  // positive
  positive(message?: core.$ZodCheckGreaterThanParams): this;
  // negative
  negative(message?: core.$ZodCheckLessThanParams): this;
  // nonpositive
  nonpositive(message?: core.$ZodCheckLessThanParams): this;
  // nonnegative
  nonnegative(message?: core.$ZodCheckGreaterThanParams): this;
  // multipleOf
  multipleOf(value: bigint, message?: core.$ZodCheckMultipleOfParams): this;
}
export const ZodBigInt: core.$constructor<ZodBigInt> =
  /*@__PURE__*/ core.$constructor("ZodBigInt", (inst, def) => {
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
    inst.multipleOf = (value, message) =>
      inst.check(core.multipleOf(value, message));
  });

/////////////////////////////////////////////
/////////      ZodBigIntFormat      /////////
/////////////////////////////////////////////
export interface ZodBigIntFormatDef
  extends core.$ZodBigIntFormatDef,
    ZodBigIntDef {
  // error?:
  //   | core.$ZodErrorMap<
  //       | core.$ZodIssueInvalidType<"bigint", bigint>
  //       | core.$ZodIssueTooBig<"bigint">
  //       | core.$ZodIssueTooSmall<"bigint">
  //     >
  //   | undefined;
}

export interface ZodBigIntFormat extends core.$ZodBigIntFormat, ZodBigInt {
  "~def": ZodBigIntFormatDef;
  // "~issp": core.$ZodIssueInvalidType<"bigint">;
  // "~issc": core.$ZodIssueTooBig<"bigint"> | core.$ZodIssueTooSmall<"bigint">;
}

export const ZodBigIntFormat: core.$constructor<ZodBigIntFormat> =
  /*@__PURE__*/ core.$constructor("ZodBigIntFormat", (inst, def) => {
    core.$ZodBigInt.init(inst, def); // no format checks
    ZodBigInt.init(inst, def);
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodSymbol      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodSymbolDef extends core.$ZodSymbolDef {}
export interface ZodSymbol extends core.$ZodSymbol, ZodType<symbol, symbol> {
  "~def": ZodSymbolDef;
  "~issp": core.$ZodIssueInvalidType<"symbol">;
}
export const ZodSymbol: core.$constructor<ZodSymbol> =
  /*@__PURE__*/ core.$constructor("ZodSymbol", (inst, def) => {
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
export interface ZodUndefinedDef extends core.$ZodUndefinedDef {}
export interface ZodUndefined
  extends core.$ZodUndefined,
    ZodType<undefined, undefined> {
  "~def": ZodUndefinedDef;
  "~issp": core.$ZodIssueInvalidType<"undefined">;
}
export const ZodUndefined: core.$constructor<ZodUndefined> =
  /*@__PURE__*/ core.$constructor("ZodUndefined", (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodNull      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodNullDef extends core.$ZodNullDef {}
export interface ZodNull extends core.$ZodNull, ZodType<null, null> {
  "~def": ZodNullDef;
  "~issp": core.$ZodIssueInvalidType<"null">;
}
export const ZodNull: core.$constructor<ZodNull> =
  /*@__PURE__*/ core.$constructor("ZodNull", (inst, def) => {
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

export interface ZodAnyDef extends core.$ZodAnyDef {}
export interface ZodAny extends core.$ZodAny, ZodType<any, any> {
  "~def": ZodAnyDef;
  "~issp": never;
}
export const ZodAny: core.$constructor<ZodAny> =
  /*@__PURE__*/ core.$constructor("ZodAny", (inst, def) => {
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

export interface ZodUnknownDef extends core.$ZodUnknownDef {}
export interface ZodUnknown
  extends core.$ZodUnknown,
    ZodType<unknown, unknown> {
  "~def": ZodUnknownDef;
  "~issp": never;
}
export const ZodUnknown: core.$constructor<ZodUnknown> =
  /*@__PURE__*/ core.$constructor("ZodUnknown", (inst, def) => {
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

export interface ZodNeverDef extends core.$ZodNeverDef {}
export interface ZodNever extends core.$ZodNever, ZodType<never, never> {
  "~def": ZodNeverDef;
  "~issp": core.$ZodIssueInvalidType<"never">;
}
export const ZodNever: core.$constructor<ZodNever> =
  /*@__PURE__*/ core.$constructor("ZodNever", (inst, def) => {
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

export interface ZodVoidDef extends core.$ZodVoidDef {}
export interface ZodVoid extends core.$ZodVoid, ZodType<void, void> {
  "~def": ZodVoidDef;
  "~issp": core.$ZodIssueInvalidType<"void">;
}
export const ZodVoid: core.$constructor<ZodVoid> =
  /*@__PURE__*/ core.$constructor("ZodVoid", (inst, def) => {
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

type DateTooSmallParams = util.MethodParams<
  core.$ZodIssueTooSmall<"date", Date>
>;
type DateTooBigParams = util.MethodParams<core.$ZodIssueTooBig<"date", Date>>;

export interface ZodDateDef extends core.$ZodDateDef {}
export interface ZodDate extends core.$ZodDate<Date>, ZodType<Date, Date> {
  "~def": ZodDateDef;
  "~issp": core.$ZodIssueInvalidType<"date"> | core.$ZodIssueInvalidDate;
  min(value: number, message?: DateTooSmallParams): this;
  max(value: number, message?: DateTooBigParams): this;
}
export const ZodDate: core.$constructor<ZodDate> =
  /*@__PURE__*/ core.$constructor("ZodDate", (inst, def) => {
    core.$ZodDate.init(inst, def);
    ZodType.init(inst, def);
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodArray      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export interface ZodArrayDef<T extends ZodType = ZodType>
  extends core.$ZodArrayDef<T> {}
export interface ZodArray<T extends ZodType = ZodType>
  extends core.$ZodArray<T>,
    ZodType<T["~output"][], T["~input"][]> {
  "~def": ZodArrayDef<T>;
  "~issp": core.$ZodIssueInvalidType<"array">;
}
export const ZodArray: core.$constructor<ZodArray> =
  /*@__PURE__*/ core.$constructor("ZodArray", (inst, def) => {
    core.$ZodArray.init(inst, def);
    ZodType.init(inst, def);
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodRawShape {
  [k: PropertyKey]: ZodType;
}

export interface ZodObjectDef<Shape extends ZodRawShape = ZodRawShape>
  extends core.$ZodObjectDef {
  shape: Shape;
}
// type laksdf = core.$ZodObjectClassic<Shape>['~disc']
export interface ZodObject<Shape extends ZodRawShape = ZodRawShape>
  extends core.$ZodObjectClassic<Shape>,
    ZodType<core.$InferObjectOutput<Shape>, core.$InferObjectInput<Shape>> {
  "~def": ZodObjectDef<Shape>;
  "~disc": core.$DiscriminatorMap;
  "~issp": core.$ZodIssueInvalidType<"object"> | core.$ZodIssueUnrecognizedKeys;
  shape: Shape;
}

export const ZodObject: core.$constructor<ZodObject> =
  /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
    core.$ZodObject.init(inst, def);
    ZodType.init(inst, def);
    inst.shape = def.shape;
  });

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodInterface      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

// export interface ZodObjectDef<Shape extends ZodRawShape = ZodRawShape>
//   extends core.$ZodObjectDef {
//   shape: Shape;
// }
export interface ZodInterface<
  O extends object = object,
  I extends object = object,
> extends core.$ZodInterface<O, I>,
    ZodType<O, I> {
  "~def": ZodObjectDef;
  "~disc": core.$DiscriminatorMap;
  "~issp": core.$ZodIssueInvalidType<"object"> | core.$ZodIssueUnrecognizedKeys;
}
export const ZodInterface: core.$constructor<ZodInterface> =
  /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
    core.$ZodObject.init(inst, def);
    ZodType.init(inst, def);
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodUnion      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export interface ZodUnionDef extends core.$ZodUnionDef {}
export interface ZodUnion<T extends ZodType[] = ZodType[]>
  extends core.$ZodUnion<T>,
    ZodType<T[number]["~output"], T[number]["~input"]> {
  "~def": ZodUnionDef;
  "~issp": core.$ZodIssueInvalidUnion;
}
export const ZodUnion: core.$constructor<ZodUnion> =
  /*@__PURE__*/ core.$constructor("ZodUnion", (inst, def) => {
    core.$ZodUnion.init(inst, def);
    ZodType.init(inst, def);
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

export interface ZodDiscriminatedUnionDef
  extends core.$ZodDiscriminatedUnionDef {}

export interface ZodDiscriminatedUnion<Options extends ZodType[] = ZodType[]>
  extends core.$ZodDiscriminatedUnion<Options>,
    ZodType<Options[number]["~output"], Options[number]["~input"]> {
  "~def": ZodDiscriminatedUnionDef;
  "~disc": core.$DiscriminatorMap;
  "~issp": core.$ZodIssueInvalidUnion;
}
export const ZodDiscriminatedUnion: core.$constructor<ZodDiscriminatedUnion> =
  /*@__PURE__*/
  core.$constructor("ZodDiscriminatedUnion", (inst, def) => {
    core.$ZodDiscriminatedUnion.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      ZodIntersection      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////

export interface ZodIntersectionDef extends core.$ZodIntersectionDef {}
export interface ZodIntersection<
  A extends ZodType = ZodType,
  B extends ZodType = ZodType,
> extends core.$ZodIntersection<A, B>,
    ZodType<A["~output"] & B["~output"], A["~input"] & B["~input"]> {
  "~def": ZodIntersectionDef;
  "~issp": never;
}
export const ZodIntersection: core.$constructor<ZodIntersection> =
  /*@__PURE__*/ core.$constructor("ZodIntersection", (inst, def) => {
    core.$ZodIntersection.init(inst, def);
    ZodType.init(inst, def);
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodTuple      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodTupleDef<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends ZodType | null = ZodType | null,
> extends core.$ZodTupleDef<T, Rest> {}
type ZodTupleItems = ZodType[];
export interface ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends ZodType | null = ZodType | null,
> extends core.$ZodTuple<T, Rest>,
    ZodType<
      core.$InferTupleOutputType<T, Rest>,
      core.$InferTupleInputType<T, Rest>
    > {
  "~def": ZodTupleDef<T, Rest>;
  "~issp":
    | core.$ZodIssueInvalidType<"tuple">
    | core.$ZodIssueTooBig<"tuple", unknown[]>
    | core.$ZodIssueTooSmall<"tuple", unknown[]>;
}
export const ZodTuple: core.$constructor<ZodTuple> =
  /*@__PURE__*/ core.$constructor("ZodTuple", (inst, def) => {
    core.$ZodTuple.init(inst, def);
    ZodType.init(inst, def);
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
export interface ZodRecordDef extends core.$ZodRecordDef {}
export interface ZodRecord<
  K extends ZodRecordKey = ZodRecordKey,
  V extends ZodType = ZodType,
> extends core.$ZodRecord<K, V>,
    ZodType<
      Record<K["~output"], V["~output"]>,
      Record<K["~input"], V["~input"]>
    > {
  "~def": ZodRecordDef;
  "~issp":
    | core.$ZodIssueInvalidType<"record">
    | core.$ZodIssueInvalidKey<"record", Record<PropertyKey, unknown>>;
}
export const ZodRecord: core.$constructor<ZodRecord> =
  /*@__PURE__*/ core.$constructor("ZodRecord", (inst, def) => {
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
export interface ZodMapDef extends core.$ZodMapDef {}
export interface ZodMap<
  Key extends ZodType = ZodType,
  Value extends ZodType = ZodType,
> extends core.$ZodMap<Key, Value>,
    ZodType<
      Map<Key["~output"], Value["~output"]>,
      Map<Key["~input"], Value["~input"]>
    > {
  "~def": ZodMapDef;
  "~issp":
    | core.$ZodIssueInvalidType<"map">
    | core.$ZodIssueInvalidKey<"map">
    | core.$ZodIssueInvalidElement<"map", unknown>;
}
export const ZodMap: core.$constructor<ZodMap> =
  /*@__PURE__*/ core.$constructor("ZodMap", (inst, def) => {
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
export interface ZodSetDef extends core.$ZodSetDef {}
export interface ZodSet<T extends ZodType = ZodType>
  extends core.$ZodSet<T>,
    ZodType<Set<T["~output"]>, Set<T["~input"]>> {
  "~def": ZodSetDef;
  "~issp": core.$ZodIssueInvalidType<"set">;
}
export const ZodSet: core.$constructor<ZodSet> =
  /*@__PURE__*/ core.$constructor("ZodSet", (inst, def) => {
    core.$ZodSet.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodEnum      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodEnumDef<T extends util.EnumLike = util.EnumLike>
  extends core.$ZodEnumDef<T> {}
export interface ZodEnum<T extends util.EnumLike = util.EnumLike>
  extends core.$ZodEnum<T>,
    ZodType<core.$InferEnumOutput<T>, core.$InferEnumInput<T>> {
  "~def": ZodEnumDef<T>;
  "~values": Set<util.Primitive>;
  "~issp": core.$ZodIssueInvalidValue<"enum">;
  enum: T;
}
export const ZodEnum: core.$constructor<ZodEnum> =
  /*@__PURE__*/ core.$constructor("ZodEnum", (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodType.init(inst, def);
    inst.enum = def.entries;
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodNativeEnum      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodNativeEnumDef<T extends util.EnumLike = util.EnumLike>
  extends core.$ZodEnumDef<T> {}
export interface ZodNativeEnum<T extends util.EnumLike = util.EnumLike>
  extends core.$ZodEnum<T>,
    ZodType<core.$InferEnumOutput<T>, core.$InferEnumInput<T>> {
  "~def": ZodNativeEnumDef<T>;
  "~values": Set<util.Primitive>;
  "~issp": core.$ZodIssueInvalidValue<"enum">;
  enum: T;
}
export const ZodNativeEnum: core.$constructor<ZodNativeEnum> =
  /*@__PURE__*/ core.$constructor("ZodNativeEnum", (inst, def) => {
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

export interface ZodLiteralDef extends core.$ZodLiteralDef {}
export interface ZodLiteral<T extends util.Literal = util.Literal>
  extends core.$ZodLiteral<T>,
    ZodType<T, T> {
  "~def": ZodLiteralDef;
  "~values": Set<util.Primitive>;
  "~issp": core.$ZodIssueInvalidValue<"literal">;
}
export const ZodLiteral: core.$constructor<ZodLiteral> =
  /*@__PURE__*/ core.$constructor("ZodLiteral", (inst, def) => {
    core.$ZodLiteral.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodFile      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface ZodFileDef extends core.$ZodFileDef {}
export interface ZodFile extends core.$ZodFile, ZodType<File, File> {
  "~def": ZodFileDef;
  "~issp": core.$ZodIssueInvalidType<"file">;
}
export const ZodFile: core.$constructor<ZodFile> =
  /*@__PURE__*/ core.$constructor("ZodFile", (inst, def) => {
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
export interface ZodEffectDef extends core.$ZodEffectDef {}
export interface ZodEffect<O = unknown, I = unknown>
  extends core.$ZodEffect<O, I>,
    ZodType<O, I> {
  "~def": ZodEffectDef;
  "~issp": never;
}
export const ZodEffect: core.$constructor<ZodEffect> =
  /*@__PURE__*/ core.$constructor("ZodEffect", (inst, def) => {
    core.$ZodEffect.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodOptional      //////////
//////////                       //////////
//////////////////////////?////////////////
///////////////////////////////////////////
export interface ZodOptionalDef<T extends ZodType>
  extends core.$ZodOptionalDef<T> {}
export interface ZodOptional<T extends ZodType = ZodType>
  extends core.$ZodOptional<T>,
    ZodType<T["~output"] | undefined, T["~input"] | undefined> {
  "~def": ZodOptionalDef<T>;
  "~qin": "true";
  "~qout": "true";
  "~issp": never;
}
export const ZodOptional: core.$constructor<ZodOptional> =
  /*@__PURE__*/ core.$constructor("ZodOptional", (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodNullableDef<T extends ZodType>
  extends core.$ZodNullableDef<T> {}
export interface ZodNullable<T extends ZodType = ZodType>
  extends core.$ZodNullable<T>,
    ZodType<T["~output"] | null, T["~input"] | null> {
  "~def": ZodNullableDef<T>;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~issp": never;
}
export const ZodNullable: core.$constructor<ZodNullable> =
  /*@__PURE__*/ core.$constructor("ZodNullable", (inst, def) => {
    core.$ZodNullable.init(inst, def);
    ZodType.init(inst, def);
  });

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodSuccess      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodSuccessDef extends core.$ZodSuccessDef {}
export interface ZodSuccess<T extends ZodType = ZodType>
  extends core.$ZodSuccess<T>,
    ZodType<boolean, T["~input"]> {
  "~def": ZodSuccessDef;
  "~issp": never;
}
export const ZodSuccess: core.$constructor<ZodSuccess> =
  /*@__PURE__*/ core.$constructor("ZodSuccess", (inst, def) => {
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
export interface ZodDefaultDef extends core.$ZodDefaultDef {}
export interface ZodDefault<T extends ZodType = ZodType>
  extends core.$ZodDefault<T>,
    ZodType<util.NoUndefined<T["~output"]>, T["~input"] | undefined> {
  "~def": ZodDefaultDef;
  "~qin": "true"; // T["~qin"];
  "~issp": never;
}
export const ZodDefault: core.$constructor<ZodDefault> =
  /*@__PURE__*/ core.$constructor("ZodDefault", (inst, def) => {
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
export interface ZodCatchDef extends core.$ZodCatchDef {}
export interface ZodCatch<T extends ZodType = ZodType>
  extends core.$ZodCatch<T>,
    ZodType<T["~output"], unknown> {
  "~def": ZodCatchDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~issp": never;
}
export const ZodCatch: core.$constructor<ZodCatch> =
  /*@__PURE__*/ core.$constructor("ZodCatch", (inst, def) => {
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
export interface ZodNaNDef extends core.$ZodNaNDef {}
export interface ZodNaN extends core.$ZodNaN, ZodType<number, number> {
  "~def": ZodNaNDef;
  "~issp": core.$ZodIssueInvalidType<"nan">;
}
export const ZodNaN: core.$constructor<ZodNaN> =
  /*@__PURE__*/ core.$constructor("ZodNaN", (inst, def) => {
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
export interface ZodPipelineDef extends core.$ZodPipelineDef {}
export interface ZodPipeline<
  A extends ZodType = ZodType,
  B extends ZodType = ZodType,
> extends core.$ZodPipeline<A, B>,
    ZodType<B["~output"], A["~input"]> {
  "~def": ZodPipelineDef;
  "~issp": never;
}
export const ZodPipeline: core.$constructor<ZodPipeline> =
  /*@__PURE__*/ core.$constructor("ZodPipeline", (inst, def) => {
    core.$ZodPipeline.init(inst, def);
    ZodType.init(inst, def);
  });

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodReadonly      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodReadonlyDef extends core.$ZodReadonlyDef {}
export interface ZodReadonly<T extends ZodType = ZodType>
  extends core.$ZodReadonly<T>,
    ZodType<core.MakeReadonly<T["~output"]>, core.MakeReadonly<T["~input"]>> {
  "~def": ZodReadonlyDef;
  "~qin": T["~qin"];
  "~qout": T["~qout"];
  "~issp": never;
}
export const ZodReadonly: core.$constructor<ZodReadonly> =
  /*@__PURE__*/ core.$constructor("ZodReadonly", (inst, def) => {
    core.$ZodReadonly.init(inst, def);
    ZodType.init(inst, def);
  });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
////////////                              ////////////
////////////      ZodTemplateLiteral      ////////////
////////////                              ////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
export interface ZodTemplateLiteralDef extends core.$ZodTemplateLiteralDef {}
export interface ZodTemplateLiteral<Template extends string = string>
  extends core.$ZodTemplateLiteral<Template>,
    ZodType<Template, Template> {
  "~def": ZodTemplateLiteralDef;
  "~issp": core.$ZodIssueInvalidType<"template_literal">;
}
export const ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral> =
  /*@__PURE__*/ core.$constructor("ZodTemplateLiteral", (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
  });

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodCustom     //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface ZodCustomDef extends core.$ZodCustomDef, ZodTypeDef {
  type: "custom";
  // error?: core.$ZodErrorMap<core.$ZodIssueCustom> | undefined;
}

export interface ZodCustom<T = unknown>
  extends core.$ZodCustom<T>,
    ZodType<T, T> {
  "~def": ZodCustomDef;
  "~issp": never;
  // "~issc": core.$ZodIssueInvalidType<"custom">;
}
export const ZodCustom: core.$constructor<ZodCustom> =
  /*@__PURE__*/ core.$constructor("ZodCustom", (inst, def) => {
    core.$ZodCustom.init(inst, def);
    ZodType.init(inst, def);
  });
