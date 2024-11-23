import * as core from "zod-core";
import type * as util from "zod-core/util";
import * as api from "./api.js";

export type CustomErrorParams = Omit<core.$ZodIssueBase, "code">;
export interface ParseContext extends core.$ParseContext {}

import { $ZodError } from "zod-core";
export { $ZodError as ZodError };

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
  _def: ZodTypeDef;
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

  check(...checks: core.$ZodCheck<Output>[]): this;

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

    // check
    inst.check = inst._check;
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
      return inst._clone({
        ...inst._def,
        description: desc,
      });
    };

    // pipe
    inst.pipe = (target) => api.pipeline(inst, target);
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
export type StringFormatParams<Extra = unknown> =
  | string
  | ({
      error?:
        | string
        | core.$ZodErrorMap<
            core.$ZodIssueInvalidStringFormat | core.$ZodIssueInvalidType
          >;
      /** @deprecated This parameter is deprecated. Use `error` instead. */
      message?: string;
    } & Extra);

export interface ZodStringDef extends core.$ZodStringDef {}
export interface ZodString
  extends core.$ZodString<string>,
    ZodType<string, string> {
  _def: ZodStringDef;

  // string format checks
  // email(): ZodString;
  // email(params?: string): ZodString;
  // email(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.email()` instead. */
  email(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.url()` instead. */
  url(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.jwt()` instead. */
  jwt(params?: StringFormatParams<{ alg?: util.JWTAlgorithm }>): ZodString;
  /** @deprecated Use `z.emoji()` instead. */
  emoji(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv4(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv6(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv7(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.nanoid()` instead. */
  nanoid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.cuid()` instead. */
  cuid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.cuid2()` instead. */
  cuid2(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.ulid()` instead. */
  ulid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.base64()` instead. */
  base64(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.jsonString()` instead. */
  jsonString(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.xid()` instead. */
  xid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.ksuid()` instead. */
  ksuid(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.ip()` instead. */
  ip(params?: StringFormatParams<{ version?: "v4" | "v6" }>): ZodString;
  /** @deprecated Use `z.ipv4()` instead. */
  ipv4(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.ipv6()` instead. */
  ipv6(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.e164()` instead. */
  e164(params?: StringFormatParams): ZodString;

  // ISO 8601 checks
  /** @deprecated Use `z.iso.datetime()` instead. */
  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): ZodString;
  /** @deprecated Use `z.iso.date()` instead. */
  date(message?: string): ZodString;
  /** @deprecated Use `z.iso.time()` instead. */
  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): ZodString;
  /** @deprecated Use `z.iso.duration()` instead. */
  duration(message?: StringFormatParams): ZodString;

  /** @deprecated Use `z.jsonString()` instead. */
  json(message?: StringFormatParams): this;

  // miscellaneous checks
  regex(regex: RegExp, message?: StringFormatParams): ZodString;
  includes(
    value: string,
    options?: { message?: string; position?: number }
  ): ZodString;
  startsWith(value: string, message?: StringFormatParams): ZodString;
  endsWith(value: string, message?: StringFormatParams): ZodString;
  min(minLength: number, message?: StringFormatParams): ZodString;
  max(maxLength: number, message?: StringFormatParams): ZodString;
  length(len: number, message?: StringFormatParams): ZodString;
  nonempty(message?: StringFormatParams): ZodString;

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

    // email;
    inst.email = (params) => {
      // if (typeof params === "string") return inst._check(api.email(params));
      // if (params === undefined) return inst._check(api.email());
      // return inst._check(api.email(params));
      return inst._check(api.email(params as any));
    };

    // url;
    inst.url = (params) => inst._check(api.url(params as any));
    // jwt;
    inst.jwt = (params) => inst._check(api.jwt(params as any));
    // emoji;
    inst.emoji = (params) => inst._check(api.emoji(params as any));
    // guid;
    inst.guid = (params) => inst._check(api.guid(params as any));
    // uuid;
    inst.uuid = (params) => inst._check(api.uuid(params as any));
    // uuidv4
    inst.uuidv4 = (params) => inst._check(api.uuid(params as any));
    // uuidv6
    inst.uuidv6 = (params) => inst._check(api.uuid(params as any));
    // uuidv7
    inst.uuidv7 = (params) => inst._check(api.uuid(params as any));
    // nanoid;
    inst.nanoid = (params) => inst._check(api.nanoid(params as any));
    // guid;
    inst.guid = (params) => inst._check(api.guid(params as any));
    // cuid;
    inst.cuid = (params) => inst._check(api.cuid(params as any));
    // cuid2;
    inst.cuid2 = (params) => inst._check(api.cuid2(params as any));
    // ulid;
    inst.ulid = (params) => inst._check(api.ulid(params as any));
    // base64;
    inst.base64 = (params) => inst._check(api.base64(params as any));
    // jsonString;
    inst.jsonString = (params) => inst._check(api.jsonString(params as any));
    // xid;
    inst.xid = (params) => inst._check(api.xid(params as any));
    // ksuid;
    inst.ksuid = (params) => inst._check(api.ksuid(params as any));
    // ip;
    inst.ip = (params) => inst._check(api.ip(params as any));
    // ipv4;
    inst.ipv4 = (params) => inst._check(api.ipv4(params as any));
    // ipv6;
    inst.ipv6 = (params) => inst._check(api.ipv6(params as any));
    // e164;
    inst.e164 = (params) => inst._check(api.e164(params as any));
    // json;
    inst.json = (params) => inst._check(api.jsonString(params as any));
    // datetime;
    inst.datetime = (params) => inst._check(api.iso.datetime(params as any));
    // date;
    inst.date = (params) => inst._check(api.iso.date(params as any));
    // time;
    inst.time = (params) => inst._check(api.iso.time(params as any));
    // duration;
    inst.duration = (params) => inst._check(api.iso.duration(params as any));
    // regex;
    inst.regex = (params) => inst._check(core.regex(params as any));
    // includes;
    inst.includes = (params) => inst._check(core.includes(params as any));
    // startsWith;
    inst.startsWith = (params) => inst._check(core.startsWith(params as any));
    // endsWith;
    inst.endsWith = (params) => inst._check(core.endsWith(params as any));
    // min;
    inst.min = (...args) => inst._check(core.minSize(...args));
    // max;
    inst.max = (...args) => inst._check(core.maxSize(...args));
    // length;
    inst.length = (...args) => inst._check(core.size(...args));
    // nonempty;
    inst.nonempty = (...args) => inst._check(core.minSize(1, ...args));
    // trim;
    inst.trim = () => inst._check(core.trim());
    // normalize;
    inst.normalize = (...args) => inst._check(core.normalize(...args));
    // toLowerCase;
    inst.toLowerCase = () => inst._check(core.toLowerCase());
    // toUpperCase;
    inst.toUpperCase = () => inst._check(core.toUpperCase());
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
  _def: core.$ZodGUIDDef;
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
  _def: core.$ZodUUIDDef;
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
  _def: ZodEmailDef;
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
  _def: ZodURLDef;
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
  _def: ZodEmojiDef;
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
  _def: ZodNanoIDDef;
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
  _def: ZodCUIDDef;
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
  _def: ZodCUID2Def;
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
  _def: ZodULIDDef;
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
  _def: ZodXIDDef;
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
  _def: ZodKSUIDDef;
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
  _def: ZodISODateTimeDef;
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
  _def: ZodISODateDef;
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
  _def: ZodISOTimeDef;
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
  _def: ZodISODurationDef;
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
  _def: ZodIPDef;
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
  _def: ZodBase64Def;
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
  _def: ZodJSONStringDef;
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
  _def: ZodE164Def;
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
  _def: ZodJWTDef;
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
export type NumberMethodParams<
  Err extends core.$ZodIssueBase,
  Extra = unknown,
> =
  | string
  | ({
      error?: string | core.$ZodErrorMap<Err>;
      /** @deprecated This parameter is deprecated. Use `error` instead. */
      message?: string;
    } & Extra);

type NumberTooBigParams = NumberMethodParams<
  core.$ZodIssueTooSmall<"number", number>
>;
type NumberTooSmallParams = NumberMethodParams<
  core.$ZodIssueTooBig<"number", number>
>;
type NumberInvalidTypeParams = NumberMethodParams<
  core.$ZodIssueInvalidType<"number", number>
>;
type NumberNotMultipleOfParams = NumberMethodParams<
  core.$ZodIssueNotMultipleOf<"number", number>
>;
export interface ZodNumberDef extends core.$ZodNumberDef {}
export interface ZodNumber extends core.$ZodNumber, ZodType<number, number> {
  _def: ZodNumberDef;
  _input: number;
  gt(value: number, message?: NumberTooSmallParams): this;
  gte(value: number, message?: NumberTooSmallParams): this;
  min(value: number, message?: NumberTooSmallParams): this;
  lt(value: number, message?: NumberTooBigParams): this;
  lte(value: number, message?: NumberTooBigParams): this;
  max(value: number, message?: NumberTooBigParams): this;
  int(message?: NumberInvalidTypeParams): this;
  positive(message?: NumberTooSmallParams): this;
  nonnegative(message?: NumberTooSmallParams): this;
  negative(message?: NumberTooBigParams): this;
  nonpositive(message?: NumberTooBigParams): this;
  multipleOf(value: number, message?: NumberNotMultipleOfParams): this;
  step(value: number, message?: NumberNotMultipleOfParams): this;
  finite(message?: NumberTooBigParams): this;
  safe(message?: NumberTooBigParams): this;
}
export const ZodNumberFast: core.$constructor<ZodNumber> =
  /*@__PURE__*/ core.$constructor("ZodNumber", (inst, def) => {
    core.$ZodNumberFast.init(inst, def);
    ZodType.init(inst, def);
  });

export const ZodNumber: core.$constructor<ZodNumber> =
  /*@__PURE__*/ core.$constructor("ZodNumber", (inst, def) => {
    core.$ZodNumber.init(inst, def); // no format checks
    ZodType.init(inst, def);
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
  extends core.$ZodBoolean,
    ZodType<boolean, boolean> {
  _def: ZodBooleanDef;
  _input: boolean;
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
export interface ZodBigInt extends core.$ZodBigInt, ZodType<bigint, bigint> {
  _def: ZodBigIntDef;
  _input: bigint;
}
export const ZodBigInt: core.$constructor<ZodBigInt> =
  /*@__PURE__*/ core.$constructor("ZodBigInt", (inst, def) => {
    core.$ZodBigInt.init(inst, def);
    ZodType.init(inst, def);
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
  _def: ZodSymbolDef;
  _input: symbol;
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
  _def: ZodUndefinedDef;
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
  _def: ZodNullDef;
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
  _def: ZodAnyDef;
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
  _def: ZodUnknownDef;
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
  _def: ZodNeverDef;
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
  _def: ZodVoidDef;
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
export interface ZodDateDef extends core.$ZodDateDef {}
export interface ZodDate extends core.$ZodDate<Date>, ZodType<Date, Date> {
  _def: ZodDateDef;
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
    ZodType<T["_output"][], T["_input"][]> {
  _def: ZodArrayDef<T>;
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
export interface ZodObject<Shape extends ZodRawShape = ZodRawShape>
  extends core.$ZodObject<Shape>,
    ZodType<core.$InferObjectOutput<Shape>, core.$InferObjectInput<Shape>> {
  _def: ZodObjectDef<Shape>;
  _disc: core.$DiscriminatorMap;
  shape: Shape;
}
export const ZodObject: core.$constructor<ZodObject> =
  /*@__PURE__*/ core.$constructor("ZodObject", (inst, def) => {
    core.$ZodObject.init(inst, def);
    ZodType.init(inst, def);
    inst.shape = def.shape;
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
    ZodType<T[number]["_output"], T[number]["_input"]> {
  _def: ZodUnionDef;
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
  _disc: core.$DiscriminatorMap;
}

export interface ZodDiscriminatedUnionDef
  extends core.$ZodDiscriminatedUnionDef {}

export interface ZodDiscriminatedUnion<Options extends ZodType[] = ZodType[]>
  extends core.$ZodDiscriminatedUnion<Options>,
    ZodType<Options[number]["_output"], Options[number]["_input"]> {
  _def: ZodDiscriminatedUnionDef;
  _disc: core.$DiscriminatorMap;
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
    ZodType<A["_output"] & B["_output"], A["_input"] & B["_input"]> {
  _def: ZodIntersectionDef;
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
  _def: ZodTupleDef<T, Rest>;
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
  _values: Set<PropertyKey>;
}

export interface ZodHasPattern extends ZodType<PropertyKey, PropertyKey> {
  _pattern: RegExp;
}

type ZodRecordKey = ZodPropertyKey; // ZodHasValues | ZodHasPattern;
export interface ZodRecordDef extends core.$ZodRecordDef {}
export interface ZodRecord<
  K extends ZodRecordKey = ZodRecordKey,
  V extends ZodType = ZodType,
> extends core.$ZodRecord<K, V>,
    ZodType<
      Record<K["_output"], V["_output"]>,
      Record<K["_input"], V["_input"]>
    > {
  _def: ZodRecordDef;
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
      Map<Key["_output"], Value["_output"]>,
      Map<Key["_input"], Value["_input"]>
    > {
  _def: ZodMapDef;
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
    ZodType<Set<T["_output"]>, Set<T["_input"]>> {
  _def: ZodSetDef;
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
  _def: ZodEnumDef<T>;
  _values: Set<util.Primitive>;
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
  _def: ZodNativeEnumDef<T>;
  _values: Set<util.Primitive>;
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
export interface ZodLiteral<T extends util.Literal[] = util.Literal[]>
  extends core.$ZodLiteral<T>,
    ZodType<T[number], T[number]> {
  _def: ZodLiteralDef;
  _values: Set<util.Primitive>;
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
  _def: ZodFileDef;
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
  _def: ZodEffectDef;
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
export interface ZodOptionalDef extends core.$ZodOptionalDef {}
export interface ZodOptional<T extends ZodType = ZodType>
  extends core.$ZodOptional<T>,
    ZodType<T["_output"] | undefined, T["_input"] | undefined> {
  _def: ZodOptionalDef;
  _qin: "true";
  _qout: "true";
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
export interface ZodNullableDef extends core.$ZodNullableDef {}
export interface ZodNullable<T extends ZodType = ZodType>
  extends core.$ZodNullable<T>,
    ZodType<T["_output"] | null, T["_input"] | null> {
  _def: ZodNullableDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
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
    ZodType<boolean, T["_input"]> {
  _def: ZodSuccessDef;
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
    ZodType<util.NoUndefined<T["_output"]>, T["_input"] | undefined> {
  _def: ZodDefaultDef;
  _qin: "true"; // T["_qin"];
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
    ZodType<T["_output"], unknown> {
  _def: ZodCatchDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
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
  _def: ZodNaNDef;
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
    ZodType<B["_output"], A["_input"]> {
  _def: ZodPipelineDef;
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
    ZodType<core.MakeReadonly<T["_output"]>, core.MakeReadonly<T["_input"]>> {
  _def: ZodReadonlyDef;
  _qin: T["_qin"];
  _qout: T["_qout"];
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
  _def: ZodTemplateLiteralDef;
}
export const ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral> =
  /*@__PURE__*/ core.$constructor("ZodTemplateLiteral", (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
  });
