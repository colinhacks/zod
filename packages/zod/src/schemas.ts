import * as core from "@zod/core";
import * as util from "@zod/core/util";
import * as checks from "./checks.js";
import * as iso from "./iso.js";
import * as parse from "./parse.js";

export * as iso from "./iso.js";
export * as coerce from "./coerce.js";

type SomeType = core.$ZodType;

///////////////////////////////////////////
///////////////////////////////////////////
////////////                   ////////////
////////////      ZodType      ////////////
////////////                   ////////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface RefinementCtx<T = unknown> extends core.ParsePayload<T> {
  addIssue(arg: string | core.$ZodRawIssue | Partial<core.$ZodIssueCustom>): void;
}

export interface ZodType<out Output = unknown, out Input = unknown> extends core.$ZodType<Output, Input> {
  // base methods
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

  // parsing
  parse(data: unknown, params?: core.ParseContext): core.output<this>;
  safeParse(data: unknown, params?: core.ParseContext): parse.ZodSafeParseResult<core.output<this>>;
  parseAsync(data: unknown, params?: core.ParseContext): Promise<core.output<this>>;
  safeParseAsync(data: unknown, params?: core.ParseContext): Promise<parse.ZodSafeParseResult<core.output<this>>>;
  spa: (data: unknown, params?: core.ParseContext) => Promise<parse.ZodSafeParseResult<core.output<this>>>;

  // refinements
  refine(check: (arg: core.output<this>) => unknown | Promise<unknown>, params?: string | core.$ZodCustomParams): this;
  /** @deprecated Use `.check()` instead. */
  superRefine(
    refinement: (arg: core.output<this>, ctx: RefinementCtx<this["_zod"]["output"]>) => void | Promise<void>
  ): this;
  overwrite(fn: (x: core.output<this>) => core.output<this>): this;

  // wrappers
  optional(params?: core.$ZodOptionalParams): ZodOptional<this>;
  nonoptional(params?: core.$ZodNonOptionalParams): ZodNonOptional<this>;
  nullable(params?: core.$ZodNullableParams): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  default(def: util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams): ZodDefault<this>;
  default(def: () => util.NoUndefined<core.output<this>>, params?: core.$ZodDefaultParams): ZodDefault<this>;
  array(): ZodArray<this>;
  or<T extends core.$ZodType>(option: T): ZodUnion<[this, T]>;
  and<T extends core.$ZodType>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(
    transform: (arg: core.output<this>, ctx: RefinementCtx<core.output<this>>) => NewOut | Promise<NewOut>
  ): ZodPipe<this, ZodTransform<Awaited<NewOut>, core.output<this>>>;
  catch(def: core.output<this>): ZodCatch<this>;
  catch(def: (ctx: core.$ZodCatchCtx) => core.output<this>): ZodCatch<this>;
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
  // mini.ZodTypeMini.init(inst, def);
  inst._zod.def = def;

  // base methods
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

  // parsing
  inst.parse = (data, params) => parse.parse(inst, data, params);
  inst.safeParse = (data, params) => parse.safeParse(inst, data, params);
  inst.parseAsync = async (data, params) => parse.parseAsync(inst, data, params);
  inst.safeParseAsync = async (data, params) => parse.safeParseAsync(inst, data, params);
  inst.spa = inst.safeParseAsync;

  // refinements
  inst.refine = (check, params) => inst.check(refine(check, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(checks.overwrite(fn));

  // wrappers
  inst.optional = (params) => optional(inst, params);
  inst.nullable = (params) => nullable(inst, params);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe(inst, transform(tx as any)) as never;
  inst.default = (def, params) => _default(inst, def, params);
  // inst.coalesce = (def, params) => coalesce(inst, def, params);
  inst.catch = (params) => _catch(inst, params);
  inst.pipe = (target) => pipe(inst, target);
  inst.readonly = () => readonly(inst);

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

// ZodString
export interface _ZodString<Input = unknown> extends ZodType {
  _zod: core.$ZodStringInternals<Input>;

  format: string | null;
  minLength: number | null;
  maxLength: number | null;

  // string format checks
  // email(): ZodString;
  // email(params?: string): ZodString;
  // email(params?: StringFormatParams): ZodString;
  /** @deprecated Use `z.email()` instead. */
  email(params?: string | core.$ZodCheckEmailParams): this;
  /** @deprecated Use `z.url()` instead. */
  url(params?: string | core.$ZodCheckURLParams): this;
  /** @deprecated Use `z.jwt()` instead. */
  jwt(params?: string | core.$ZodCheckJWTParams): this;
  /** @deprecated Use `z.emoji()` instead. */
  emoji(params?: string | core.$ZodCheckEmojiParams): this;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | core.$ZodCheckGUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuid(params?: string | core.$ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv4(params?: string | core.$ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv6(params?: string | core.$ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv7(params?: string | core.$ZodCheckUUIDParams): this;
  /** @deprecated Use `z.nanoid()` instead. */
  nanoid(params?: string | core.$ZodCheckNanoIDParams): this;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | core.$ZodCheckGUIDParams): this;
  /** @deprecated Use `z.cuid()` instead. */
  cuid(params?: string | core.$ZodCheckCUIDParams): this;
  /** @deprecated Use `z.cuid2()` instead. */
  cuid2(params?: string | core.$ZodCheckCUID2Params): this;
  /** @deprecated Use `z.ulid()` instead. */
  ulid(params?: string | core.$ZodCheckULIDParams): this;
  /** @deprecated Use `z.base64()` instead. */
  base64(params?: string | core.$ZodCheckBase64Params): this;
  // /** @deprecated Use `z.jsonString()` instead. */
  // jsonString(params?: string | core.$ZodCheckJSONStringParams): this;
  /** @deprecated Use `z.xid()` instead. */
  xid(params?: string | core.$ZodCheckXIDParams): this;
  /** @deprecated Use `z.ksuid()` instead. */
  ksuid(params?: string | core.$ZodCheckKSUIDParams): this;
  /** @deprecated Use `z.ip()` instead. */
  ip(params?: string | core.$ZodCheckIPParams): this;
  /** @deprecated Use `z.ipv4()` instead. */
  ipv4(params?: string | core.$ZodCheckIPv4Params): this;
  /** @deprecated Use `z.ipv6()` instead. */
  ipv6(params?: string | core.$ZodCheckIPv6Params): this;
  /** @deprecated Use `z.e164()` instead. */
  e164(params?: string | core.$ZodCheckE164Params): this;

  // ISO 8601 checks
  /** @deprecated Use `z.iso.datetime()` instead. */
  datetime(params?: string | core.$ZodCheckISODateTimeParams): this;
  /** @deprecated Use `z.iso.date()` instead. */
  date(params?: string | core.$ZodCheckISODateParams): this;
  /** @deprecated Use `z.iso.time()` instead. */
  time(
    params?:
      | string
      // | {
      //     message?: string | undefined;
      //     precision?: number | null;
      //   }
      | core.$ZodCheckISOTimeParams
  ): this;
  /** @deprecated Use `z.iso.duration()` instead. */
  duration(params?: string | core.$ZodCheckISODurationParams): this;

  // /** @deprecated Use `z.jsonString()` instead. */
  // json(params?: string | core.$ZodCheckJSONStringParams): this;

  // miscellaneous checks
  regex(regex: RegExp, params?: core.$ZodCheckRegexParams): this;
  includes(value: string, params?: { message?: string; position?: number }): this;
  startsWith(value: string, params?: string | core.$ZodCheckStartsWithParams): this;
  endsWith(value: string, params?: string | core.$ZodCheckEndsWithParams): this;
  min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
  nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
  lowercase(params?: string | core.$ZodCheckLowerCaseParams): this;
  uppercase(params?: string | core.$ZodCheckUpperCaseParams): this;

  // transforms
  trim(): this;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): this;
  toLowerCase(): this;
  toUpperCase(): this;
}

export interface ZodString extends _ZodString<string> {}
export const ZodString: core.$constructor<ZodString> = core.$constructor("ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  ZodType.init(inst, def);

  inst.format = inst._zod.computed.format ?? null;
  inst.minLength = inst._zod.computed.minimum ?? null;
  inst.maxLength = inst._zod.computed.maximum ?? null;

  inst.email = (params) => inst.check(core._email(ZodEmail, params));
  inst.url = (params) => inst.check(core._url(ZodURL, params));
  inst.jwt = (params) => inst.check(core._jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(core._emoji(ZodEmoji, params));
  inst.guid = (params) => inst.check(core._guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(core._uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(core._uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(core._uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(core._uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(core._nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(core._guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(core._cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(core._cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(core._ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(core._base64(ZodBase64, params));
  // inst.jsonString = (params) => inst.check(core._jsonString(Zodinst,params));
  // inst.json = (params) => inst.check(core._jsonString(Zodinst,params));
  inst.xid = (params) => inst.check(core._xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(core._ksuid(ZodKSUID, params));
  inst.ip = (params) => inst.check(core._ip(ZodIP, params));
  inst.ipv4 = (params) => inst.check(core._ipv4(ZodIP, params));
  inst.ipv6 = (params) => inst.check(core._ipv6(ZodIP, params));
  inst.e164 = (params) => inst.check(core._e164(ZodE164, params));

  // iso
  inst.datetime = (params) => inst.check(iso.datetime(params as any));
  inst.date = (params) => inst.check(iso.date(params as any));
  inst.time = (params) => inst.check(iso.time(params as any));
  inst.duration = (params) => inst.check(iso.duration(params as any));

  // validations
  inst.regex = (params) => inst.check(checks.regex(params));
  inst.includes = (...args) => inst.check(checks.includes(...args));
  inst.startsWith = (params) => inst.check(checks.startsWith(params));
  inst.endsWith = (params) => inst.check(checks.endsWith(params));
  inst.min = (...args) => inst.check(checks.minLength(...args));
  inst.max = (...args) => inst.check(checks.maxLength(...args));
  inst.length = (...args) => inst.check(checks.length(...args));
  inst.nonempty = (...args) => inst.check(checks.minLength(1, ...args));
  inst.lowercase = (params) => inst.check(checks.lowercase(params));
  inst.uppercase = (params) => inst.check(checks.uppercase(params));

  // transforms
  inst.trim = () => inst.check(checks.trim());
  inst.normalize = (...args) => inst.check(checks.normalize(...args));
  inst.toLowerCase = () => inst.check(checks.toLowerCase());
  inst.toUpperCase = () => inst.check(checks.toUpperCase());
});

// export type Z_odMiniStringParams = util.TypeParams<ZodString<string>, "coerce">;
// cons__t _string = util.factory(() => ZodString, { type: "string" });
// export function string(checks?: core.$ZodCheck<string>[]): ZodString<string>;
// export function string(params?: string | core.$ZodStringParams, checks?: core.$ZodCheck<string>[]): ZodString<string>;
export function string(params?: string | core.$ZodStringParams): ZodString {
  return core._string(ZodString, params) as any;
}

// ZodStringFormat
export interface ZodStringFormat<Format extends core.$ZodStringFormats = core.$ZodStringFormats> extends ZodString {
  _zod: core.$ZodStringFormatInternals<Format>;
}
export const ZodStringFormat: core.$constructor<ZodStringFormat> = core.$constructor("ZodStringFormat", (inst, def) => {
  core.$ZodStringFormat.init(inst, def);
  ZodString.init(inst, def);
});

// ZodEmail
export interface ZodEmail extends ZodStringFormat<"email"> {
  _zod: core.$ZodEmailInternals;
}
export const ZodEmail: core.$constructor<ZodEmail> = core.$constructor("ZodEmail", (inst, def) => {
  core.$ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniEmailParams = util.StringFormatParams<ZodEmail>;
// export type Z_odMiniCheckEmailParams = util.CheckStringFormatParams<ZodEmail>;
const ___email = util.factory(() => ZodEmail, {
  type: "string",
  format: "email",
  check: "string_format",
  abort: false,
});
// export function email(checks?: core.$ZodCheck<string>[]): ZodEmail;
// export function email(params?: string | core.$ZodEmailParams, checks?: core.$ZodCheck<string>[]): ZodEmail;
export function email(params?: string | core.$ZodEmailParams): ZodEmail {
  return core._email(ZodEmail, params);
}

// ZodGUID
export interface ZodGUID extends ZodStringFormat<"guid"> {
  _zod: core.$ZodGUIDInternals;
}
export const ZodGUID: core.$constructor<ZodGUID> = core.$constructor("ZodGUID", (inst, def) => {
  core.$ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniGUIDParams = util.StringFormatParams<core.$ZodGUID>;
// export type Z_odMiniCheckGUIDParams = util.CheckStringFormatParams<core.$ZodGUID>;
const ___guid = util.factory(() => ZodGUID, {
  type: "string",
  format: "guid",
  check: "string_format",
  abort: false,
});
// export function guid(checks?: core.$ZodCheck<string>[]): ZodGUID;
// export function guid(params?: string | core.$ZodGUIDParams, checks?: core.$ZodCheck<string>[]): ZodGUID;
export function guid(params?: string | core.$ZodGUIDParams): ZodGUID {
  return core._guid(ZodGUID, params);
}

// ZodUUID
export interface ZodUUID extends ZodStringFormat<"uuid"> {
  _zod: core.$ZodUUIDInternals;
}
export const ZodUUID: core.$constructor<ZodUUID> = core.$constructor("ZodUUID", (inst, def) => {
  core.$ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniUUIDParams = util.StringFormatParams<ZodUUID, "pattern">;
// export type Z_odMiniCheckUUIDParams = util.CheckStringFormatParams<ZodUUID, "pattern">;
const ___uuid = util.factory(() => ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
});
// export function uuid(checks?: core.$ZodCheck<string>[]): ZodUUID;
// export function uuid(params?: string | core.$ZodUUIDParams, checks?: core.$ZodCheck<string>[]): ZodUUID;
export function uuid(params?: string | core.$ZodUUIDParams): ZodUUID {
  return core._uuid(ZodUUID, params);
}

// export type ZodUUIDv4Params = util.StringFormatParams<ZodUUID, "pattern">;
// export type ZodCheckUUIDv4Params = util.CheckStringFormatParams<ZodUUID, "pattern">;
const ___uuidv4 = util.factory(() => ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v4",
});
// export function uuidv4(checks?: core.$ZodCheck<string>[]): ZodUUID;
// export function uuidv4(params?: string | ZodUUIDv4Params, checks?: core.$ZodCheck<string>[]): ZodUUID;
export function uuidv4(params?: string | core.$ZodUUIDv4Params): ZodUUID {
  return core._uuidv4(ZodUUID, params);
}

// ZodUUIDv6
// export type ZodUUIDv6Params = util.StringFormatParams<ZodUUID, "pattern">;
// export type ZodCheckUUIDv6Params = util.CheckStringFormatParams<ZodUUID, "pattern">;
const ___uuidv6 = util.factory(() => ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v6",
});
// export function uuidv6(checks?: core.$ZodCheck<string>[]): ZodUUID;
// export function uuidv6(params?: string | ZodUUIDv6Params, checks?: core.$ZodCheck<string>[]): ZodUUID;
export function uuidv6(params?: string | core.$ZodUUIDv6Params): ZodUUID {
  return core._uuidv6(ZodUUID, params);
}

// ZodUUIDv7
// export type ZodUUIDv7Params = util.StringFormatParams<ZodUUID, "pattern">;
// export type ZodCheckUUIDv7Params = util.CheckStringFormatParams<ZodUUID, "pattern">;
const ___uuidv7 = util.factory(() => ZodUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
  abort: false,
  version: "v7",
});
// export function uuidv7(checks?: core.$ZodCheck<string>[]): ZodUUID;
// export function uuidv7(params?: string | ZodUUIDv7Params, checks?: core.$ZodCheck<string>[]): ZodUUID;
export function uuidv7(params?: string | core.$ZodUUIDv7Params): ZodUUID {
  return core._uuidv7(ZodUUID, params);
}

// ZodURL
export interface ZodURL extends ZodStringFormat<"url"> {
  _zod: core.$ZodURLInternals;
}
export const ZodURL: core.$constructor<ZodURL> = core.$constructor("ZodURL", (inst, def) => {
  core.$ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniURLParams = util.StringFormatParams<ZodURL>;
// export type Z_odMiniCheckURLParams = util.CheckStringFormatParams<ZodURL>;
const ___url = util.factory(() => ZodURL, {
  type: "string",
  format: "url",
  check: "string_format",
  abort: false,
});
// export function url(checks?: core.$ZodCheck<string>[]): ZodURL;
// export function url(params?: string | core.$ZodURLParams, checks?: core.$ZodCheck<string>[]): ZodURL;
export function url(params?: string | core.$ZodURLParams): ZodURL {
  return core._url(ZodURL, params);
}

// ZodEmoji
export interface ZodEmoji extends ZodStringFormat<"emoji"> {
  _zod: core.$ZodEmojiInternals;
}
export const ZodEmoji: core.$constructor<ZodEmoji> = core.$constructor("ZodEmoji", (inst, def) => {
  core.$ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniEmojiParams = util.StringFormatParams<ZodEmoji>;
// export type Z_odMiniCheckEmojiParams = util.CheckStringFormatParams<ZodEmoji>;
const ___emoji = util.factory(() => ZodEmoji, {
  type: "string",
  format: "emoji",
  check: "string_format",
  abort: false,
});
// export function emoji(checks?: core.$ZodCheck<string>[]): ZodEmoji;
// export function emoji(params?: string | core.$ZodEmojiParams, checks?: core.$ZodCheck<string>[]): ZodEmoji;
export function emoji(params?: string | core.$ZodEmojiParams): ZodEmoji {
  return core._emoji(ZodEmoji, params);
}

// ZodNanoID
export interface ZodNanoID extends ZodStringFormat<"nanoid"> {
  _zod: core.$ZodNanoIDInternals;
}
export const ZodNanoID: core.$constructor<ZodNanoID> = core.$constructor("ZodNanoID", (inst, def) => {
  core.$ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniNanoIDParams = util.StringFormatParams<ZodNanoID>;
// export type Z_odMiniCheckNanoIDParams = util.CheckStringFormatParams<ZodNanoID>;
const ___nanoid = util.factory(() => ZodNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
  abort: false,
});
// export function nanoid(checks?: core.$ZodCheck<string>[]): ZodNanoID;
// export function nanoid(params?: string | core.$ZodNanoIDParams, checks?: core.$ZodCheck<string>[]): ZodNanoID;
export function nanoid(params?: string | core.$ZodNanoIDParams): ZodNanoID {
  return core._nanoid(ZodNanoID, params);
}

// ZodCUID
export interface ZodCUID extends ZodStringFormat<"cuid"> {
  _zod: core.$ZodCUIDInternals;
}
export const ZodCUID: core.$constructor<ZodCUID> = core.$constructor("ZodCUID", (inst, def) => {
  core.$ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniCUIDParams = util.StringFormatParams<ZodCUID>;
// export type Z_odMiniCheckCUIDParams = util.CheckStringFormatParams<ZodCUID>;
const ___cuid = util.factory(() => ZodCUID, {
  type: "string",
  format: "cuid",
  check: "string_format",
  abort: false,
});
// export function cuid(checks?: core.$ZodCheck<string>[]): ZodCUID;
// export function cuid(params?: string | core.$ZodCUIDParams, checks?: core.$ZodCheck<string>[]): ZodCUID;
export function cuid(params?: string | core.$ZodCUIDParams): ZodCUID {
  return core._cuid(ZodCUID, params);
}

// ZodCUID2
export interface ZodCUID2 extends ZodStringFormat<"cuid2"> {
  _zod: core.$ZodCUID2Internals;
}
export const ZodCUID2: core.$constructor<ZodCUID2> = core.$constructor("ZodCUID2", (inst, def) => {
  core.$ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type ZodCUID2Params = util.StringFormatParams<ZodCUID2>;
// export type ZodCheckCUID2Params = util.CheckStringFormatParams<ZodCUID2>;
const ___cuid2 = util.factory(() => ZodCUID2, {
  type: "string",
  format: "cuid2",
  check: "string_format",
  abort: false,
});
// export function cuid2(checks?: core.$ZodCheck<string>[]): ZodCUID2;
// export function cuid2(params?: string | ZodCUID2Params, checks?: core.$ZodCheck<string>[]): ZodCUID2;
export function cuid2(params?: string | core.$ZodCUID2Params): ZodCUID2 {
  return core._cuid2(ZodCUID2, params);
}

// ZodULID
export interface ZodULID extends ZodStringFormat<"ulid"> {
  _zod: core.$ZodULIDInternals;
}
export const ZodULID: core.$constructor<ZodULID> = core.$constructor("ZodULID", (inst, def) => {
  core.$ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniULIDParams = util.StringFormatParams<ZodULID>;
// export type Z_odMiniCheckULIDParams = util.CheckStringFormatParams<ZodULID>;
const ___ulid = util.factory(() => ZodULID, {
  type: "string",
  format: "ulid",
  check: "string_format",
  abort: false,
});
// export function ulid(checks?: core.$ZodCheck<string>[]): ZodULID;
// export function ulid(params?: string | core.$ZodULIDParams, checks?: core.$ZodCheck<string>[]): ZodULID;
export function ulid(params?: string | core.$ZodULIDParams): ZodULID {
  return core._ulid(ZodULID, params);
}

// ZodXID
export interface ZodXID extends ZodStringFormat<"xid"> {
  _zod: core.$ZodXIDInternals;
}
export const ZodXID: core.$constructor<ZodXID> = core.$constructor("ZodXID", (inst, def) => {
  core.$ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});

// export type Z_odMiniXIDParams = util.StringFormatParams<ZodXID>;
// export type Z_odMiniCheckXIDParams = util.CheckStringFormatParams<ZodXID>;
const ___xid = util.factory(() => ZodXID, {
  type: "string",
  format: "xid",
  check: "string_format",
  abort: false,
});
// export function xid(checks?: core.$ZodCheck<string>[]): ZodXID;
// export function xid(params?: string | core.$ZodXIDParams, checks?: core.$ZodCheck<string>[]): ZodXID;
export function xid(params?: string | core.$ZodXIDParams): ZodXID {
  return core._xid(ZodXID, params);
}

// ZodKSUID
export interface ZodKSUID extends ZodStringFormat<"ksuid"> {
  _zod: core.$ZodKSUIDInternals;
}
export const ZodKSUID: core.$constructor<ZodKSUID> = core.$constructor("ZodKSUID", (inst, def) => {
  core.$ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniKSUIDParams = util.StringFormatParams<ZodKSUID>;
// export type Z_odMiniCheckKSUIDParams = util.CheckStringFormatParams<ZodKSUID>;
const ___ksuid = util.factory(() => ZodKSUID, {
  type: "string",
  format: "ksuid",
  check: "string_format",
  abort: false,
});
// export function ksuid(checks?: core.$ZodCheck<string>[]): ZodKSUID;
// export function ksuid(params?: string | core.$ZodKSUIDParams, checks?: core.$ZodCheck<string>[]): ZodKSUID;
export function ksuid(params?: string | core.$ZodKSUIDParams): ZodKSUID {
  return core._ksuid(ZodKSUID, params);
}

// ZodIP
export interface ZodIP extends ZodStringFormat<"ip"> {
  _zod: core.$ZodIPInternals;
}
export const ZodIP: core.$constructor<ZodIP> = core.$constructor("ZodIP", (inst, def) => {
  core.$ZodIP.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type Z_odMiniIPParams = util.StringFormatParams<ZodIP>;
// export type Z_odMiniCheckIPParams = util.CheckStringFormatParams<ZodIP>;
const ___ip = util.factory(() => ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
});
// export function ip(checks?: core.$ZodCheck<string>[]): ZodIP;
// export function ip(params?: string | core.$ZodIPParams, checks?: core.$ZodCheck<string>[]): ZodIP;
export function ip(params?: string | core.$ZodIPParams): ZodIP {
  return core._ip(ZodIP, params);
}

// ZodIPv4
// export type ZodIPv4Params = util.StringFormatParams<ZodIP>;
// export type ZodCheckIPv4Params = util.CheckStringFormatParams<ZodIP>;
const ___ipv4 = util.factory(() => ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v4",
});
// export function ipv4(checks?: core.$ZodCheck<string>[]): ZodIP;
// export function ipv4(params?: string | ZodIPv4Params, checks?: core.$ZodCheck<string>[]): ZodIP;
export function ipv4(params?: string | core.$ZodIPv4Params): ZodIP {
  return core._ipv4(ZodIP, params);
}

// ZodIPv6
// export type ZodIPv6Params = util.StringFormatParams<ZodIP>;
// export type ZodCheckIPv6Params = util.CheckStringFormatParams<ZodIP>;
const ___ipv6 = util.factory(() => ZodIP, {
  type: "string",
  format: "ip",
  check: "string_format",
  abort: false,
  version: "v6",
});
// export function ipv6(checks?: core.$ZodCheck<string>[]): ZodIP;
// export function ipv6(params?: string | ZodIPv6Params, checks?: core.$ZodCheck<string>[]): ZodIP;
export function ipv6(params?: string | core.$ZodIPv6Params): ZodIP {
  return core._ipv6(ZodIP, params);
}

// ZodBase64
export interface ZodBase64 extends ZodStringFormat<"base64"> {
  _zod: core.$ZodBase64Internals;
}
export const ZodBase64: core.$constructor<ZodBase64> = core.$constructor("ZodBase64", (inst, def) => {
  core.$ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});

// export type ZodBase64Params = util.StringFormatParams<ZodBase64>;
// export type ZodCheckBase64Params = util.CheckStringFormatParams<ZodBase64>;
const ___base64 = util.factory(() => ZodBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
  abort: false,
});
// export function base64(checks?: core.$ZodCheck<string>[]): ZodBase64;
// export function base64(params?: string | ZodBase64Params, checks?: core.$ZodCheck<string>[]): ZodBase64;
export function base64(params?: string | core.$ZodBase64Params): ZodBase64 {
  return core._base64(ZodBase64, params);
}

// ZodE164
export interface ZodE164 extends ZodStringFormat<"e164"> {
  _zod: core.$ZodE164Internals;
}
export const ZodE164: core.$constructor<ZodE164> = core.$constructor("ZodE164", (inst, def) => {
  core.$ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
// export type ZodE164Params = util.StringFormatParams<ZodE164>;
// export type ZodCheckE164Params = util.CheckStringFormatParams<ZodE164>;
const ___e164 = util.factory(() => ZodE164, {
  type: "string",
  format: "e164",
  check: "string_format",
  abort: false,
});
// export function e164(checks?: core.$ZodCheck<string>[]): ZodE164;
// export function e164(params?: string | ZodE164Params, checks?: core.$ZodCheck<string>[]): ZodE164;
export function e164(params?: string | core.$ZodE164Params): ZodE164 {
  return core._e164(ZodE164, params);
}

// ZodJWT
export interface ZodJWT extends ZodStringFormat<"jwt"> {
  _zod: core.$ZodJWTInternals;
}
export const ZodJWT: core.$constructor<ZodJWT> = core.$constructor("ZodJWT", (inst, def) => {
  core.$ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
const ___jwt = util.factory(() => ZodJWT, {
  type: "string",
  format: "jwt",
  check: "string_format",
  abort: false,
});

export function jwt(params?: string | core.$ZodJWTParams): ZodJWT {
  return core._jwt(ZodJWT, params);
}

// ZodNumber
export interface _ZodNumber<Input = unknown> extends ZodType {
  _zod: core.$ZodNumberInternals<Input>;

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

export interface ZodNumber extends _ZodNumber<number> {}

export const ZodNumber: core.$constructor<ZodNumber> = core.$constructor("ZodNumber", (inst, def) => {
  core.$ZodNumber.init(inst, def);
  ZodType.init(inst, def);

  inst.gt = (value, params) => inst.check(checks.gt(value, params));
  inst.gte = (value, params) => inst.check(checks.gte(value, params));
  inst.min = (value, params) => inst.check(checks.gte(value, params));
  inst.lt = (value, params) => inst.check(checks.lt(value, params));
  inst.lte = (value, params) => inst.check(checks.lte(value, params));
  inst.max = (value, params) => inst.check(checks.lte(value, params));
  inst.int = (params) => inst.check(int(params));
  inst.safe = (params) => inst.check(int(params));
  inst.positive = (params) => inst.check(checks.gt(0, params));
  inst.nonnegative = (params) => inst.check(checks.gte(0, params));
  inst.negative = (params) => inst.check(checks.lt(0, params));
  inst.nonpositive = (params) => inst.check(checks.lte(0, params));
  inst.multipleOf = (value, params) => inst.check(checks.multipleOf(value, params));
  inst.step = (value, params) => inst.check(checks.multipleOf(value, params));

  // inst.finite = (params) => inst.check(core.finite(params));
  inst.finite = () => inst;

  inst.minValue = inst._zod.computed.minimum ?? null;
  inst.maxValue = inst._zod.computed.maximum ?? null;
  inst.isInt =
    (inst._zod.computed.format ?? "").includes("int") || Number.isSafeInteger(inst._zod.computed.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = inst._zod.computed.format ?? null;
});
const ___number = util.factory(() => ZodNumber, { type: "number" });
// export type Z_odMiniNumberParams = util.TypeParams<ZodNumber<number>, "coerce">;
// export function number(checks?: core.$ZodCheck<number>[]): ZodNumber<number>;
// export function number(params?: string | core.$ZodNumberParams, checks?: core.$ZodCheck<number>[]): ZodNumber<number>;
export function number(params?: string | core.$ZodNumberParams): ZodNumber {
  return core._number(ZodNumber, params) as any;
}

// ZodNumberFormat
export interface ZodNumberFormat extends ZodNumber {
  _zod: core.$ZodNumberFormatInternals;
}
export const ZodNumberFormat: core.$constructor<ZodNumberFormat> = core.$constructor("ZodNumberFormat", (inst, def) => {
  core.$ZodNumberFormat.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniNumberFormatParams = util.CheckTypeParams<ZodNumberFormat, "format" | "coerce">;
// export type Z_odMiniCheckNumberFormatParams = util.CheckParams<core.$ZodCheckNumberFormat, "format">;

// int
const ___int = util.factory(() => ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "safeint",
});
// export function int(checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
// export function int(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
export function int(params?: string | core.$ZodCheckNumberFormatParams): ZodNumberFormat {
  return core._int(ZodNumberFormat, params);
}

// float32
const ___float32 = util.factory(() => ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float32",
});
// export function float32(checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
// export function float32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
export function float32(params?: string | core.$ZodCheckNumberFormatParams): ZodNumberFormat {
  return core._float32(ZodNumberFormat, params);
}

// float64
const ___float64 = util.factory(() => ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "float64",
});
// export function float64(checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
// export function float64(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
export function float64(params?: string | core.$ZodCheckNumberFormatParams): ZodNumberFormat {
  return core._float64(ZodNumberFormat, params);
}

// int32
const ___int32 = util.factory(() => ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "int32",
});
// export function int32(checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
// export function int32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
export function int32(params?: string | core.$ZodCheckNumberFormatParams): ZodNumberFormat {
  return core._int32(ZodNumberFormat, params);
}

// uint32
const ___uint32 = util.factory(() => ZodNumberFormat, {
  type: "number",
  check: "number_format",
  abort: false,
  format: "uint32",
});
// export function uint32(checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
// export function uint32(params?: string | core.$ZodCheckNumberFormatParams, checks?: core.$ZodCheck<number>[]): ZodNumberFormat;
export function uint32(params?: string | core.$ZodCheckNumberFormatParams): ZodNumberFormat {
  return core._uint32(ZodNumberFormat, params);
}

// ZodBoolean
export interface _ZodBoolean<T = unknown> extends ZodType {
  _zod: core.$ZodBooleanInternals<T>;
}

export interface ZodBoolean extends _ZodBoolean<boolean> {}
export const ZodBoolean: core.$constructor<ZodBoolean> = core.$constructor("ZodBoolean", (inst, def) => {
  core.$ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniBooleanParams = util.TypeParams<ZodBoolean<boolean>, "coerce">;
const ___boolean = util.factory(() => ZodBoolean, {
  type: "boolean",
}) as any;
// export function boolean(checks?: core.$ZodCheck<boolean>[]): ZodBoolean<boolean>;
// export function boolean(params?: string | core.$ZodBooleanParams, checks?: core.$ZodCheck<boolean>[]): ZodBoolean<boolean>;
export function boolean(params?: string | core.$ZodBooleanParams): ZodBoolean {
  return core._boolean(ZodBoolean, params) as any;
}

// ZodBigInt
export interface _ZodBigInt<T = unknown> extends ZodType {
  _zod: core.$ZodBigIntInternals<T>;

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

export interface ZodBigInt extends _ZodBigInt<bigint> {}
export const ZodBigInt: core.$constructor<ZodBigInt> = core.$constructor("ZodBigInt", (inst, def) => {
  core.$ZodBigInt.init(inst, def);
  ZodType.init(inst, def);

  inst.gte = (value, params) => inst.check(checks.gte(value, params));
  inst.min = (value, params) => inst.check(checks.gte(value, params));
  inst.gt = (value, params) => inst.check(checks.gt(value, params));
  inst.gte = (value, params) => inst.check(checks.gte(value, params));
  inst.min = (value, params) => inst.check(checks.gte(value, params));
  inst.lt = (value, params) => inst.check(checks.lt(value, params));
  inst.lte = (value, params) => inst.check(checks.lte(value, params));
  inst.max = (value, params) => inst.check(checks.lte(value, params));
  inst.positive = (params) => inst.check(checks.gt(BigInt(0), params));
  inst.negative = (params) => inst.check(checks.lt(BigInt(0), params));
  inst.nonpositive = (params) => inst.check(checks.lte(BigInt(0), params));
  inst.nonnegative = (params) => inst.check(checks.gte(BigInt(0), params));
  inst.multipleOf = (value, params) => inst.check(checks.multipleOf(value, params));

  inst.minValue = inst._zod.computed.minimum ?? null;
  inst.maxValue = inst._zod.computed.maximum ?? null;
  inst.format = inst._zod.computed.format ?? null;
});
// export type Z_odMiniBigIntParams = util.TypeParams<ZodBigInt<bigint>>;
const ___bigint = util.factory(() => ZodBigInt, {
  type: "bigint",
}) as any;
// export function bigint(checks?: core.$ZodCheck<bigint>[]): ZodBigInt<bigint>;
// export function bigint(params?: string | core.$ZodBigIntParams, checks?: core.$ZodCheck<bigint>[]): ZodBigInt<bigint>;
export function bigint(params?: string | core.$ZodBigIntParams): ZodBigInt {
  return core._bigint(ZodBigInt, params) as any;
}
// bigint formats
// export type Z_odMiniBigIntFormatParams = util.CheckTypeParams<ZodBigIntFormat, "format" | "coerce">;
// export type Z_odMiniCheckBigIntFormatParams = util.CheckParams<core.$ZodCheckBigIntFormat, "format">;

// ZodBigIntFormat
export interface ZodBigIntFormat extends ZodBigInt {
  _zod: core.$ZodBigIntFormatInternals;
}
export const ZodBigIntFormat: core.$constructor<ZodBigIntFormat> = core.$constructor("ZodBigIntFormat", (inst, def) => {
  core.$ZodBigIntFormat.init(inst, def);
  ZodBigInt.init(inst, def);
});

// int64
const ___int64 = util.factory(() => ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "int64",
});
// export function int64(checks?: core.$ZodCheck<bigint | number>[]): ZodBigIntFormat;
// export function int64(params?: string | core.$ZodBigIntFormatParams, checks?: core.$ZodCheck<bigint | number>[]): ZodBigIntFormat;
export function int64(params?: string | core.$ZodBigIntFormatParams): ZodBigIntFormat {
  return core._int64(ZodBigIntFormat, params);
}

// uint64
const ___uint64 = util.factory(() => ZodBigIntFormat, {
  type: "bigint",
  check: "bigint_format",
  abort: false,
  format: "uint64",
});
// export function uint64(checks?: core.$ZodCheck<bigint>[]): ZodBigIntFormat;
// export function uint64(params?: string | core.$ZodBigIntFormatParams, checks?: core.$ZodCheck<bigint>[]): ZodBigIntFormat;
export function uint64(params?: string | core.$ZodBigIntFormatParams): ZodBigIntFormat {
  return core._uint64(ZodBigIntFormat, params);
}

// ZodSymbol
export interface ZodSymbol extends ZodType {
  _zod: core.$ZodSymbolInternals;
}
export const ZodSymbol: core.$constructor<ZodSymbol> = core.$constructor("ZodSymbol", (inst, def) => {
  core.$ZodSymbol.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniSymbolParams = util.TypeParams<ZodSymbol>;
const ___symbol = util.factory(() => ZodSymbol, {
  type: "symbol",
}) as any;
// export function symbol(checks?: core.$ZodCheck<symbol>[]): ZodSymbol;
// export function symbol(params?: string | core.$ZodSymbolParams, checks?: core.$ZodCheck<symbol>[]): ZodSymbol;
export function symbol(params?: string | core.$ZodSymbolParams): ZodSymbol {
  return core._symbol(ZodSymbol, params);
}

// ZodUndefined
export interface ZodUndefined extends ZodType {
  _zod: core.$ZodUndefinedInternals;
}
export const ZodUndefined: core.$constructor<ZodUndefined> = core.$constructor("ZodUndefined", (inst, def) => {
  core.$ZodUndefined.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniUndefinedParams = util.TypeParams<ZodUndefined>;
const ___undefinedFactory = util.factory(() => ZodUndefined, {
  type: "undefined",
});
// function _undefined(checks?: core.$ZodCheck<undefined>[]): ZodUndefined;
// function _undefined(params?: string | core.$ZodUndefinedParams, checks?: core.$ZodCheck<undefined>[]): ZodUndefined;
function _undefined(params?: string | core.$ZodUndefinedParams): ZodUndefined {
  return core._undefined(ZodUndefined, params);
}
export { _undefined as undefined };

// ZodNull
export interface ZodNull extends ZodType {
  _zod: core.$ZodNullInternals;
}
export const ZodNull: core.$constructor<ZodNull> = core.$constructor("ZodNull", (inst, def) => {
  core.$ZodNull.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniNullParams = util.TypeParams<ZodNull>;
const ___nullFactory = util.factory(() => ZodNull, { type: "null" });
// function _null(checks?: core.$ZodCheck<null>[]): ZodNull;
// function _null(params?: string | core.$ZodNullParams, checks?: core.$ZodCheck<null>[]): ZodNull;
function _null(params?: string | core.$ZodNullParams): ZodNull {
  return core._null(ZodNull, params);
}
export { _null as null };

// ZodAny
export interface ZodAny extends ZodType {
  _zod: core.$ZodAnyInternals;
}
export const ZodAny: core.$constructor<ZodAny> = core.$constructor("ZodAny", (inst, def) => {
  core.$ZodAny.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniAnyParams = util.TypeParams<ZodAny>;
const ___any = util.factory(() => ZodAny, { type: "any" });
// export function any(checks?: core.$ZodCheck<any>[]): ZodAny;
// export function any(params?: string | core.$ZodAnyParams, checks?: core.$ZodCheck<any>[]): ZodAny;
export function any(params?: string | core.$ZodAnyParams): ZodAny {
  return core._any(ZodAny, params);
}

// ZodUnknown
export interface ZodUnknown extends ZodType {
  _zod: core.$ZodUnknownInternals;
}
export const ZodUnknown: core.$constructor<ZodUnknown> = core.$constructor("ZodUnknown", (inst, def) => {
  core.$ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniUnknownParams = util.TypeParams<ZodUnknown>;
const ___unknown = util.factory(() => ZodUnknown, { type: "unknown" });
// export function unknown(checks?: core.$ZodCheck<unknown>[]): ZodUnknown;
// export function unknown(params?: string | core.$ZodUnknownParams, checks?: core.$ZodCheck<unknown>[]): ZodUnknown;
export function unknown(params?: string | core.$ZodUnknownParams): ZodUnknown {
  return core._unknown(ZodUnknown, params);
}

// ZodNever
export interface ZodNever extends ZodType {
  _zod: core.$ZodNeverInternals;
}
export const ZodNever: core.$constructor<ZodNever> = core.$constructor("ZodNever", (inst, def) => {
  core.$ZodNever.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniNeverParams = util.TypeParams<ZodNever>;
const ___never = util.factory(() => ZodNever, { type: "never" });
// export function never(checks?: core.$ZodCheck<never>[]): ZodNever;
// export function never(params?: string | core.$ZodNeverParams, checks?: core.$ZodCheck<never>[]): ZodNever;
export function never(params?: string | core.$ZodNeverParams): ZodNever {
  return core._never(ZodNever, params);
}

// ZodVoid
export interface ZodVoid extends ZodType {
  _zod: core.$ZodVoidInternals;
}
export const ZodVoid: core.$constructor<ZodVoid> = core.$constructor("ZodVoid", (inst, def) => {
  core.$ZodVoid.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniVoidParams = util.TypeParams<ZodVoid>;
const ___voidFactory = util.factory(() => ZodVoid, { type: "void" });
// function _void(checks?: core.$ZodCheck<void>[]): ZodVoid;
// function _void(params?: string | core.$ZodVoidParams, checks?: core.$ZodCheck<void>[]): ZodVoid;
function _void(params?: string | core.$ZodVoidParams): ZodVoid {
  return core._void(ZodVoid, params);
}
export { _void as void };

// ZodDate
export interface _ZodDate<T = unknown> extends ZodType {
  _zod: core.$ZodDateInternals<T>;

  min(value: number | Date, params?: string | core.$ZodCheckGreaterThanParams): this;
  max(value: number | Date, params?: string | core.$ZodCheckLessThanParams): this;

  /** @deprecated Not recommended. */
  minDate: Date | null;
  /** @deprecated Not recommended. */
  maxDate: Date | null;
}

export interface ZodDate extends _ZodDate<Date> {}
export const ZodDate: core.$constructor<ZodDate> = core.$constructor("ZodDate", (inst, def) => {
  core.$ZodDate.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (value, params) => inst.check(checks.gte(value, params));
  inst.max = (value, params) => inst.check(checks.lte(value, params));

  const c = inst._zod.computed;
  inst.minDate = c.minimum ? new Date(c.minimum) : null;
  inst.maxDate = c.maximum ? new Date(c.maximum) : null;
});
// export type Z_odMiniDateParams = util.TypeParams<ZodDate, "coerce">;
const ___date = util.factory(() => ZodDate, { type: "date" });
// export function date(checks?: core.$ZodCheck<Date>[]): ZodDate;
// export function date(params?: string | core.$ZodDateParams, checks?: core.$ZodCheck<Date>[]): ZodDate;
export function date(params?: string | core.$ZodDateParams): ZodDate {
  return core._date(ZodDate, params);
}

// ZodArray
export interface ZodArray<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodArrayInternals<T>;

  element: T;
  min(minLength: number, params?: string | core.$ZodCheckMinLengthParams): this;
  nonempty(params?: string | core.$ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | core.$ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | core.$ZodCheckLengthEqualsParams): this;
}
export const ZodArray: core.$constructor<ZodArray> = core.$constructor("ZodArray", (inst, def) => {
  core.$ZodArray.init(inst, def);
  ZodType.init(inst, def);

  inst.element = def.element as any;
  inst.min = (minLength, params) => inst.check(checks.minLength(minLength, params));
  inst.nonempty = (params) => inst.check(checks.minLength(1, params));
  inst.max = (maxLength, params) => inst.check(checks.maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(checks.length(len, params));
});
// export type Z_odMiniArrayParams = util.TypeParams<ZodArray, "element">;

export function array<T extends SomeType>(element: T, params?: core.$ZodArrayParams): ZodArray<T>;
export function array<T extends SomeType>(element: SomeType, params?: any): ZodArray<T> {
  return core._array(ZodArray, element, params) as any;
}

// ZodObjectLike
export interface ZodObjectLike<out O = object, out I = object> extends ZodType {
  _zod: core.$ZodObjectLikeInternals<O, I>;
}
export const ZodObjectLike: core.$constructor<ZodObjectLike> = core.$constructor("ZodObjectLike", (inst, def) => {
  core.$ZodObjectLike.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniObjectLikeParams = util.TypeParams<ZodObjectLike, "shape" | "catchall">;

// .keyof
export function keyof<T extends ZodObject>(schema: T): ZodLiteral<keyof T["_zod"]["shape"]>;
export function keyof<T extends ZodInterface>(schema: T): ZodLiteral<keyof T["_zod"]["output"]>;
export function keyof(schema: ZodObjectLike) {
  const shape =
    schema._zod.def.type === "interface"
      ? util.cleanInterfaceShape(schema._zod.def.shape).shape
      : schema._zod.def.shape;

  return literal(Object.keys(shape)) as any;
}

// ZodInterface

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
  // @ts-ignore cast variance
  out Shape extends core.$ZodLooseShape = core.$ZodLooseShape,
  // @ts-ignore cast variance
  out Params extends core.$ZodInterfaceNamedParams = core.$ZodInterfaceNamedParams,
> extends ZodType {
  _zod: core.$ZodInterfaceInternals<Shape, Params>;

  keyof(): ZodEnum<util.ToEnum<util.InterfaceKeys<string & keyof Shape>>>;
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
export const ZodInterface: core.$constructor<ZodInterface> = core.$constructor("ZodInterface", (inst, def) => {
  core.$ZodInterface.init(inst, def);
  ZodType.init(inst, def);
  util.defineLazy(inst._zod, "shape", () => def.shape);

  inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
  inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: undefined });
  inst.extend = (incoming: any) => {
    if (incoming instanceof core.$ZodInterface) return util.extendObjectLike(inst, incoming);
    return util.extendObjectLike(inst, _interface(incoming));
  };
  inst.merge = (other) => util.mergeObjectLike(inst, other);
  inst.pick = (mask) => util.pick(inst, mask) as any;
  inst.omit = (mask) => util.omit(inst, mask);
  inst.partial = (...args: any[]) => util.partialObjectLike(ZodOptional, inst, args[0]);
  inst.required = (...args: any[]) => util.requiredObjectLike(ZodNonOptional, inst, args[0]);
});
// export type Z_odMiniInterfaceParams = util.TypeParams<ZodInterface, "shape">;
function _interface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams,
  Class: util.Constructor<ZodInterface> = ZodInterface
): ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
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
// export type Z_odMiniStrictInterfaceParams = util.TypeParams<ZodObjectLike, "shape" | "catchall">;
export function strictInterface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams
): ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, {}>> {
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
  return new ZodInterface(def) as any;
}

// looseInterface
// export type Z_odMiniLooseInterfaceParams = util.TypeParams<ZodObjectLike, "shape" | "catchall">;
export function looseInterface<T extends core.$ZodLooseShape>(
  shape: T,
  params?: core.$ZodInterfaceParams
): ZodInterface<util.CleanInterfaceShape<T>, util.InitInterfaceParams<T, Record<string, unknown>>> {
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
  return new ZodInterface(def) as any;
}

type MergeObjects<A extends ZodObject, B extends ZodObject> = ZodObject<
  util.ExtendShape<A["_zod"]["shape"], B["_zod"]["shape"]>,
  A["_zod"]["extra"] // & B['_zod']["extra"]
>;

// ZodObject

export interface ZodObject<
  // @ts-ignore cast variance
  out Shape extends core.$ZodShape = core.$ZodShape,
  // @ts-ignore cast variance
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends ZodType {
  _zod: core.$ZodObjectInternals<Shape, Extra>;

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
  extend<U extends core.$ZodShape>(shape: U): MergeObjects<this, ZodObject<U, {}>>;

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
export const ZodObject: core.$constructor<ZodObject> = core.$constructor("ZodObject", (inst, def) => {
  core.$ZodObject.init(inst, def);
  ZodType.init(inst, def);

  inst.shape = def.shape;
  inst.keyof = () => _enum(Object.keys(inst._zod.def.shape)) as any;
  inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
  inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  // inst.nonstrict = () => inst.clone({ ...inst._zod.def, catchall: api.unknown() });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: undefined });

  inst.extend = (incoming: any) => {
    if (incoming instanceof ZodObject) return util.extendObjectLike(inst, incoming);
    return util.extendObjectLike(inst, object(incoming));
  };
  inst.merge = (other) => util.mergeObjectLike(inst, other);
  inst.pick = (mask) => util.pick(inst, mask);
  inst.omit = (mask) => util.omit(inst, mask);
  inst.partial = (...args: any[]) => util.partialObjectLike(ZodOptional, inst, args[0] as object);
  inst.required = (...args: any[]) => util.requiredObjectLike(ZodNonOptional, inst, args[0] as object);
});
export function object<T extends core.$ZodShape = Record<never, SomeType>>(
  shape?: T,
  params?: core.$ZodObjectLikeParams
): ZodObject<T, {}> {
  const def: core.$ZodObjectDef = {
    type: "object",
    shape: shape ?? {},
    get optional() {
      return util.optionalObjectKeys(shape ?? {});
    },
    ...util.normalizeParams(params),
  };
  return new ZodObject(def) as any;
}

// strictObject
// export type Z_odMiniStrictObjectParams = util.TypeParams<ZodObjectLike, "shape" | "catchall">;
export function strictObject<T extends core.$ZodShape>(shape: T, params?: core.$ZodObjectParams): ZodObject<T, {}> {
  return new ZodObject({
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
// export type Z_odMiniLooseObjectParams = util.TypeParams<ZodObjectLike, "shape" | "catchall">;
export function looseObject<T extends core.$ZodShape>(
  shape: T,
  params?: core.$ZodObjectParams
): ZodObject<T, { [k: string]: unknown }> {
  return new ZodObject({
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
export function extend<T extends ZodInterface, U extends ZodInterface>(
  a: T,
  b: U
): ZodInterface<util.ExtendShape<T["_zod"]["shape"], U["_zod"]["shape"]>, util.MergeInterfaceParams<T, U>>;
export function extend<T extends ZodObject, U extends ZodObject>(
  a: T,
  b: U
): ZodObject<util.ExtendObject<T["_zod"]["shape"], U["_zod"]["shape"]>, U["_zod"]["extra"] & T["_zod"]["extra"]>;
export function extend<T extends ZodObjectLike, U extends core.$ZodLooseShape>(
  schema: T,
  shape: U
): T extends ZodInterface
  ? ZodInterface<util.ExtendInterfaceShape<T["_zod"]["shape"], U>, util.ExtendInterfaceParams<T, U>>
  : ZodObject<util.ExtendObject<T["_zod"]["shape"], U>, T["_zod"]["extra"]>;
export function extend(schema: ZodObjectLike, shape: core.$ZodShape): ZodObjectLike {
  if (shape instanceof core.$ZodType) return util.mergeObjectLike(schema, shape as any);
  if (schema instanceof ZodInterface) {
    return util.mergeObjectLike(schema, _interface(shape));
  }
  if (schema instanceof ZodObject) return util.mergeObjectLike(schema, object(shape));
  return util.extend(schema, shape);
}

export function merge<T extends ZodObjectLike, U extends core.$ZodLooseShape>(
  schema: T,
  shape: U
): T["_zod"]["def"]["type"] extends "interface"
  ? // T extends ZodInterface
    ZodInterface<
      util.ExtendShape<T["_zod"]["shape"], U["_zod"]["shape"]>,
      {
        extra: T["_zod"]["extra"] & U["_zod"]["extra"];
        optional: Exclude<T["_zod"]["optional"], keyof U["_zod"]["shape"]> | U["_zod"]["optional"];
        defaulted: Exclude<T["_zod"]["defaulted"], keyof U["_zod"]["shape"]> | U["_zod"]["defaulted"];
      }
    >
  : ZodObject<util.ExtendObject<T["_zod"]["shape"], U>, T["_zod"]["extra"]>;
export function merge(a: ZodObjectLike, b: ZodObjectLike): ZodObjectLike {
  return util.mergeObjectLike(a, b);
}

// .merge
// export function merge<T extends ZodObjectLike, U extends ZodObjectLike>(
//   base: T,
//   incoming: U
// ): ZodObjectLike<T['_zod']["shape"] & U['_zod']["shape"]> {
//   return incoming.clone({
//     ...incoming._zod.def, // incoming overrides properties on base
//     shape: { ...core._zod.def.shape, ...incoming._zod.def.shape },
//     checks: [],
//   }) as any;
// }

// .pick
// export function pick<T extends ZodObject, M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>>(
//   schema: T,
//   mask: M
// ): ZodObject<util.Flatten<Pick<T['_zod']["shape"], Extract<keyof T['_zod']["shape"], keyof M>>>>;
// export function pick<
//   T extends ZodInterface,
//   const M extends util.Exactly<util.Mask<keyof NoInfer<T>['_zod']["shape"]>, M>,
// >(schema: T, mask: M): ZodInterface<Pick<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
// export function pick(schema: ZodObjectLike, mask: object) {
//   return util.pick(schema, mask);
// }

// .pick
export function pick<T extends ZodObjectLike, M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodInterface<
      util.Flatten<Pick<T["_zod"]["shape"], keyof T["_zod"]["shape"] & keyof M>>,
      {
        optional: Extract<T["_zod"]["optional"], keyof M>;
        defaulted: Extract<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodObject<util.Flatten<Pick<T["_zod"]["shape"], keyof T["_zod"]["shape"] & keyof M>>, T["_zod"]["extra"]>;
export function pick(schema: ZodObjectLike, mask: object) {
  // const picked = util.pick(schema, mask);
  return util.pick(schema, mask);
}

// .omit
export function omit<T extends ZodObjectLike, const M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodInterface<
      util.Flatten<Omit<T["_zod"]["shape"], keyof M>>,
      {
        optional: Exclude<T["_zod"]["optional"], keyof M>;
        defaulted: Exclude<T["_zod"]["defaulted"], keyof M>;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodObject<util.Flatten<Omit<T["_zod"]["shape"], keyof M>>, T["_zod"]["extra"]>;
// export function omit<
//   T extends ZodInterface,
//   M extends util.Exactly<util.Mask<keyof T['_zod']["output"]>, M>,
// >(
//   schema: T,
//   mask: M
// ): ZodInterface<
//   Omit<T['_zod']["output"], Extract<keyof T['_zod']["output"], keyof M>>,
//   Omit<T['_zod']["input"], Extract<keyof T['_zod']["input"], keyof M>>
// >;
// export function omit<
//   T extends ZodObject,
//   M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>,
// >(
//   schema: T,
//   mask: M
// ):
// ZodObject<
//   util.Flatten<
//     Omit<T['_zod']["shape"], Extract<keyof T['_zod']["shape"], keyof M>>
//   >
// >;
export function omit(schema: ZodObjectLike, mask: object) {
  return util.omit(schema, mask);
}

// .partial
// export function partial<T extends ZodObject>(
//   schema: T
// ): ZodObject<
//   {
//     [k in keyof T['_zod']["shape"]]: ZodOptional<T['_zod']["shape"][k]>;
//   },
//   T['_zod']["extra"]
// >;
// export function partial<T extends ZodObject, M extends util.Exactly<util.Mask<keyof T['_zod']["shape"]>, M>>(
//   schema: T,
//   mask: M
// ): ZodObject<
//   {
//     [k in keyof T['_zod']["shape"]]: k extends keyof M ? ZodOptional<T['_zod']["shape"][k]> : T['_zod']["shape"][k];
//   },
//   T['_zod']["extra"]
// >;
// export function partial<T extends ZodInterface>(
//   schema: T
// ): ZodInterface<Partial<T['_zod']["output"]>, Partial<T['_zod']["input"]>>;
// export function partial<T extends ZodInterface, M extends util.Mask<keyof T['_zod']["output"]>>(
//   schema: T,
//   mask: M
// ): ZodInterface<util.PartialInterfaceShape<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
export function partial<T extends ZodObjectLike>(
  schema: T
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodInterface<
      // T['_zod']["shape"],
      {
        [k in keyof T["_zod"]["shape"]]: ZodOptional<T["_zod"]["shape"][k]>;
      },
      {
        optional: string & keyof T["_zod"]["shape"];
        defaulted: never;
        extra: T["_zod"]["extra"];
      }
    >
  : ZodObject<
      {
        [k in keyof T["_zod"]["shape"]]: ZodOptional<T["_zod"]["shape"][k]>;
      },
      T["_zod"]["extra"]
    >;
export function partial<T extends ZodObjectLike, M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>>(
  schema: T,
  mask: M
): T["_zod"]["def"]["type"] extends "interface"
  ? ZodInterface<
      util.ExtendShape<
        T["_zod"]["shape"],
        {
          [k in keyof M & keyof T["_zod"]["shape"]]: ZodOptional<T["_zod"]["shape"][k]>;
        }
      >,
      {
        optional: string & (T["_zod"]["optional"] | keyof M);
        defaulted: T["_zod"]["defaulted"];
        extra: T["_zod"]["extra"];
      }
    >
  : ZodObject<
      {
        [k in keyof T["_zod"]["shape"]]: k extends keyof M ? ZodOptional<T["_zod"]["shape"][k]> : T["_zod"]["shape"][k];
      },
      T["_zod"]["extra"]
    >;

// export function partial<T extends ZodInterface>(
//   schema: T
// ): ZodInterface<Partial<T['_zod']["output"]>, Partial<T['_zod']["input"]>>;
// export function partial<T extends ZodInterface, M extends util.Mask<keyof T['_zod']["output"]>>(
//   schema: T,
//   mask: M
// ): ZodInterface<util.PartialInterfaceShape<T['_zod']["shape"], string & keyof M>, T['_zod']["extra"]>;
export function partial(schema: ZodObjectLike, mask?: object): ZodObjectLike {
  return util.partialObjectLike(ZodOptional, schema, mask);
}

// .required
export function required<T extends { _subtype: "object" } & ZodObject>(
  schema: T
): ZodObject<{
  [k in keyof T["_zod"]["shape"]]: ZodNonOptional<T["_zod"]["shape"][k]>;
}>;
export function required<
  T extends { _subtype: "object" } & ZodObject,
  M extends util.Exactly<util.Mask<keyof T["_zod"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): ZodObject<
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["shape"]]: ZodNonOptional<T["_zod"]["shape"][k]>;
    }
  >
>;
export function required<T extends { _subtype: "interface" } & ZodInterface>(
  schema: T
): ZodInterface<
  {
    [k in keyof T["_zod"]["shape"]]: ZodNonOptional<T["_zod"]["shape"][k]>;
  },
  {
    optional: never;
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
>;
export function required<
  T extends { _subtype: "interface" } & ZodInterface,
  M extends util.Mask<keyof T["_zod"]["output"]>,
>(
  schema: T,
  mask: M
): ZodInterface<
  util.ExtendShape<
    T["_zod"]["shape"],
    {
      [k in keyof M & keyof T["_zod"]["shape"]]: ZodNonOptional<T["_zod"]["shape"][k]>;
    }
  >,
  {
    optional: Exclude<T["_zod"]["optional"], keyof M>;
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
>;
export function required(schema: ZodObjectLike, mask?: object): ZodObjectLike {
  return util.requiredObjectLike(ZodNonOptional, schema, mask);
}

// ZodUnion
export interface ZodUnion<T extends readonly SomeType[] = readonly SomeType[]> extends ZodType {
  _zod: core.$ZodUnionInternals<T>;
  options: T;
}
export const ZodUnion: core.$constructor<ZodUnion> = core.$constructor("ZodUnion", (inst, def) => {
  core.$ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst.options = def.options;
});
// export type Z_odMiniUnionParams = util.TypeParams<ZodUnion, "options">;
export function union<const T extends readonly SomeType[]>(options: T, params?: core.$ZodUnionParams): ZodUnion<T> {
  return new ZodUnion({
    type: "union",
    options,
    ...util.normalizeParams(params),
  }) as ZodUnion<T>;
}

// ZodDiscriminatedUnion
export interface ZodDiscriminatedUnion<Options extends readonly SomeType[] = readonly SomeType[]>
  extends ZodUnion<Options> {
  _zod: core.$ZodDiscriminatedUnionInternals<Options>;
}
export const ZodDiscriminatedUnion: core.$constructor<ZodDiscriminatedUnion> = core.$constructor(
  "ZodDiscriminatedUnion",
  (inst, def) => {
    core.$ZodDiscriminatedUnion.init(inst, def);
    ZodType.init(inst, def);
  }
);

export interface $ZodTypeDiscriminableInternals extends core.$ZodTypeInternals {
  disc: util.DiscriminatorMap;
}

export interface $ZodTypeDiscriminable extends ZodType {
  _zod: $ZodTypeDiscriminableInternals;
}
// export type Z_odMiniDiscriminatedUnionParams = util.TypeParams<ZodDiscriminatedUnion, "options">;
export function discriminatedUnion<Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
  disc: string,
  options: Types,
  params?: core.$ZodDiscriminatedUnionParams
): ZodDiscriminatedUnion<Types>;
export function discriminatedUnion<Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]>(
  options: Types,
  params?: core.$ZodDiscriminatedUnionParams
): ZodDiscriminatedUnion<Types>;
export function discriminatedUnion(...args: any[]): any {
  if (typeof args[0] === "string") args = args.slice(1);
  const [options, params] = args;
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeParams(params),
  });
}

// ZodIntersection
export interface ZodIntersection<A extends SomeType = SomeType, B extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodIntersectionInternals<A, B>;
}
export const ZodIntersection: core.$constructor<ZodIntersection> = core.$constructor("ZodIntersection", (inst, def) => {
  core.$ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniIntersectionParams = util.TypeParams<ZodIntersection, "left" | "right">;
export function intersection<T extends SomeType, U extends SomeType>(
  left: T,
  right: U,
  params?: core.$ZodIntersectionParams
): ZodIntersection<T, U> {
  return new ZodIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeParams(params),
  }) as ZodIntersection<T, U>;
}

// ZodTuple
export interface ZodTuple<T extends util.TupleItems = util.TupleItems, Rest extends SomeType | null = SomeType | null>
  extends ZodType {
  _zod: core.$ZodTupleInternals<T, Rest>;
  rest<Rest extends core.$ZodType>(rest: Rest): ZodTuple<T, Rest>;
}
export const ZodTuple: core.$constructor<ZodTuple> = core.$constructor("ZodTuple", (inst, def) => {
  core.$ZodTuple.init(inst, def);
  ZodType.init(inst, def);
  inst.rest = (rest) =>
    inst.clone({
      ...inst._zod.def,
      rest,
    }) as any;
});
// export type Z_odMiniTupleParams = util.TypeParams<ZodTuple, "items" | "rest">;

export function tuple<T extends readonly [SomeType, ...SomeType[]]>(
  items: T,
  params?: core.$ZodTupleParams
): ZodTuple<T, null>;
export function tuple<T extends readonly [SomeType, ...SomeType[]], Rest extends SomeType>(
  items: T,
  rest: Rest,
  params?: core.$ZodTupleParams
): ZodTuple<T, Rest>;
export function tuple(items: [], params?: core.$ZodTupleParams): ZodTuple<[], null>;
export function tuple(
  items: SomeType[],
  _paramsOrRest?: core.$ZodTupleParams | SomeType,
  _params?: core.$ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof core.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util.normalizeParams(params),
  });
}

// ZodRecord
export interface ZodRecord<Key extends core.$ZodRecordKey = core.$ZodRecordKey, Value extends SomeType = SomeType>
  extends ZodType {
  _zod: core.$ZodRecordInternals<Key, Value>;
  keyType: Key;
  valueType: Value;
}
export const ZodRecord: core.$constructor<ZodRecord> = core.$constructor("ZodRecord", (inst, def) => {
  core.$ZodRecord.init(inst, def);
  ZodType.init(inst, def);

  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
// export type Z_odMiniRecordParams = util.TypeParams<ZodRecord, "keyType" | "valueType">;
export function record<Key extends core.$ZodRecordKey, Value extends SomeType>(
  keyType: Key,
  valueType: Value,
  params?: core.$ZodRecordParams
): ZodRecord<Key, Value> {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as ZodRecord<Key, Value>;
}

// ZodMap
export interface ZodMap<Key extends SomeType = SomeType, Value extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodMapInternals<Key, Value>;

  keyType: Key;
  valueType: Value;
}
export const ZodMap: core.$constructor<ZodMap> = core.$constructor("ZodMap", (inst, def) => {
  core.$ZodMap.init(inst, def);
  ZodType.init(inst, def);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
// export type Z_odMiniMapParams = util.TypeParams<ZodMap, "keyType" | "valueType">;
export function map<Key extends SomeType, Value extends SomeType>(
  keyType: Key,
  valueType: Value,
  params?: core.$ZodMapParams
): ZodMap<Key, Value> {
  return new ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeParams(params),
  }) as ZodMap<Key, Value>;
}

// ZodSet
export interface ZodSet<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodSetInternals<T>;
  min(minSize: number, params?: core.$ZodCheckMinSizeParams): this;
  /** */
  nonempty(params?: core.$ZodCheckMinSizeParams): this;
  max(maxSize: number, params?: core.$ZodCheckMaxSizeParams): this;
  size(size: number, params?: core.$ZodCheckSizeEqualsParams): this;
}
export const ZodSet: core.$constructor<ZodSet> = core.$constructor("ZodSet", (inst, def) => {
  core.$ZodSet.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (...args) => inst.check(core._minSize(...args));
  inst.nonempty = (params) => inst.check(core._minSize(1, params));
  inst.max = (...args) => inst.check(core._maxSize(...args));
  inst.size = (...args) => inst.check(core._size(...args));
});
// export type Z_odMiniSetParams = util.TypeParams<ZodSet, "valueType">;
export function set<Value extends SomeType>(valueType: Value, params?: core.$ZodSetParams): ZodSet<Value> {
  return new ZodSet({
    type: "set",
    valueType,
    ...util.normalizeParams(params),
  }) as ZodSet<Value>;
}

// ZodEnum
// @ts
export interface ZodEnum<T extends util.EnumLike = util.EnumLike> extends ZodType {
  _zod: core.$ZodEnumInternals<T>;

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
export const ZodEnum: core.$constructor<ZodEnum> = core.$constructor("ZodEnum", (inst, def) => {
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
      ...util.normalizeParams(params),
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
      ...util.normalizeParams(params),
      entries: newEntries,
    }) as any;
  };
});
// export type Z_odMiniEnumParams = util.TypeParams<ZodEnum, "entries">;
function _enum<const T extends string[]>(values: T, params?: core.$ZodEnumParams): ZodEnum<util.ToEnum<T[number]>>;
function _enum<T extends util.EnumLike>(entries: T, params?: core.$ZodEnumParams): ZodEnum<T>;
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

  return new ZodEnum({
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
export function nativeEnum<T extends util.EnumLike>(entries: T, params?: core.$ZodEnumParams): ZodEnum<T> {
  return new ZodEnum({
    type: "enum",
    entries,
    ...util.normalizeParams(params),
  }) as any as ZodEnum<T>;
}

// ZodLiteral
export interface ZodLiteral<T extends util.Primitive = util.Primitive> extends ZodType {
  _zod: core.$ZodLiteralInternals<T>;
  values: Set<T>;
}
export const ZodLiteral: core.$constructor<ZodLiteral> = core.$constructor("ZodLiteral", (inst, def) => {
  core.$ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst.values = new Set(def.values);
});
// export type Z_odMiniLiteralParams = util.TypeParams<ZodLiteral, "values">;
export function literal<const T extends Array<util.Literal>>(
  value: T,
  params?: core.$ZodLiteralParams
): ZodLiteral<T[number]>;
export function literal<const T extends util.Literal>(value: T, params?: core.$ZodLiteralParams): ZodLiteral<T>;
export function literal(value: any, params: any) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util.normalizeParams(params),
  });
}

// ZodFile
export interface ZodFile extends ZodType {
  _zod: core.$ZodFileInternals;

  min(size: number, params?: string | core.$ZodCheckMinSizeParams): this;
  max(size: number, params?: string | core.$ZodCheckMaxSizeParams): this;
  mime(types: Array<util.MimeTypes>, params?: string | core.$ZodCheckMimeTypeParams): this;
}
export const ZodFile: core.$constructor<ZodFile> = core.$constructor("ZodFile", (inst, def) => {
  core.$ZodFile.init(inst, def);
  ZodType.init(inst, def);

  inst.min = (size, params) => inst.check(core._minSize(size, params));
  inst.max = (size, params) => inst.check(core._maxSize(size, params));
  inst.mime = (types, params) => inst.check(core._mime(types, params));
});
// export type Z_odMiniFileParams = util.TypeParams<ZodFile>;
// const ___file = util.factory(() => ZodFile, { type: "file" });
// export function file(checks?: core.$ZodCheck<File>[]): ZodFile;
// export function file(params?: string | core.$ZodFileParams, checks?: core.$ZodCheck<File>[]): ZodFile;
export function file(params?: string | core.$ZodFileParams): ZodFile {
  return core._file(ZodFile, params) as any;
}

// ZodTransform
export interface ZodTransform<O = unknown, I = unknown> extends ZodType {
  _zod: core.$ZodTransformInternals<O, I>;
}
export const ZodTransform: core.$constructor<ZodTransform> = core.$constructor("ZodTransform", (inst, def) => {
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
});

// export type Z_odMiniTransformParams = util.TypeParams<ZodTransform, "transform">;
export function transform<I = unknown, O = I>(
  fn: (input: I, ctx?: core.ParsePayload) => O,
  params?: core.$ZodTransformParams
): ZodTransform<Awaited<O>, I> {
  return new ZodTransform({
    type: "transform",
    transform: fn as any,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodOptional
export interface ZodOptional<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodOptionalInternals<T>;

  unwrap(): T;
}
export const ZodOptional: core.$constructor<ZodOptional> = core.$constructor("ZodOptional", (inst, def) => {
  core.$ZodOptional.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});
// export type Z_odMiniOptionalParams = util.TypeParams<ZodOptional, "innerType">;

export function optional<T extends SomeType>(innerType: T, params?: core.$ZodOptionalParams): ZodOptional<T> {
  return new ZodOptional({
    type: "optional",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodOptional<T>;
}

// ZodNullable
export interface ZodNullable<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodNullableInternals<T>;

  unwrap(): T;
}
export const ZodNullable: core.$constructor<ZodNullable> = core.$constructor("ZodNullable", (inst, def) => {
  core.$ZodNullable.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});
// export type Z_odMiniNullableParams = util.TypeParams<ZodNullable, "innerType">;
export function nullable<T extends SomeType>(innerType: T, params?: core.$ZodNullableParams): ZodNullable<T> {
  return new ZodNullable({
    type: "nullable",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodNullable<T>;
}

// ZodDefault
export interface ZodDefault<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodDefaultInternals<T>;

  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeDefault(): T;
}
export const ZodDefault: core.$constructor<ZodDefault> = core.$constructor("ZodDefault", (inst, def) => {
  core.$ZodDefault.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});

// export type Z_odMiniDefaultParams = util.TypeParams<ZodDefault, "innerType" | "defaultValue">;
export function _default<T extends SomeType>(
  innerType: T,
  defaultValue: util.NoUndefined<core.output<T>> | (() => util.NoUndefined<core.output<T>>),
  params?: core.$ZodDefaultParams
): ZodDefault<T> {
  return new ZodDefault({
    type: "default",
    defaultValue: (typeof defaultValue === "function" ? defaultValue : () => defaultValue) as () => core.output<T>,
    innerType,
    ...util.normalizeParams(params),
  }) as any as ZodDefault<T>;
}

// ZodNonOptional
export interface ZodNonOptional<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodNonOptionalInternals<T>;

  unwrap(): T;
}
export const ZodNonOptional: core.$constructor<ZodNonOptional> = core.$constructor("ZodNonOptional", (inst, def) => {
  core.$ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});
// export type Z_odMiniNonOptionalParams = util.TypeParams<ZodNonOptional, "innerType">;
export function nonoptional<T extends SomeType>(innerType: T, params?: core.$ZodNonOptionalParams): ZodNonOptional<T> {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodNonOptional<T>;
}

// ZodSuccess
export interface ZodSuccess<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodSuccessInternals<T>;

  unwrap(): T;
}
export const ZodSuccess: core.$constructor<ZodSuccess> = core.$constructor("ZodSuccess", (inst, def) => {
  core.$ZodSuccess.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});
// export type Z_odMiniSuccessParams = util.TypeParams<ZodSuccess, "innerType">;
export function success<T extends SomeType>(innerType: T, params?: core.$ZodSuccessParams): ZodSuccess<T> {
  return new ZodSuccess({
    type: "success",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodSuccess<T>;
}

// ZodCatch
export interface ZodCatch<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodCatchInternals<T>;

  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeCatch(): T;
}
export const ZodCatch: core.$constructor<ZodCatch> = core.$constructor("ZodCatch", (inst, def) => {
  core.$ZodCatch.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
// export type Z_odMiniCatchParams = util.TypeParams<ZodCatch, "innerType" | "catchValue">;
function _catch<T extends SomeType>(
  innerType: T,
  catchValue: core.output<T> | ((ctx: core.$ZodCatchCtx) => core.output<T>),
  params?: core.$ZodCatchParams
): ZodCatch<T> {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue) as (
      ctx: core.$ZodCatchCtx
    ) => core.output<T>,
    ...util.normalizeParams(params),
  }) as ZodCatch<T>;
}
export { _catch as catch };

// ZodNaN
export interface ZodNaN extends ZodType {
  _zod: core.$ZodNaNInternals;
}
export const ZodNaN: core.$constructor<ZodNaN> = core.$constructor("ZodNaN", (inst, def) => {
  core.$ZodNaN.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniNaNParams = util.TypeParams<ZodNaN>;
const ___nan = util.factory(() => ZodNaN, { type: "nan" });
// export function nan(checks?: core.$ZodCheck<number>[]): ZodNaN;
// export function nan(params?: string | core.$ZodNaNParams, checks?: core.$ZodCheck<number>[]): ZodNaN;
export function nan(params?: string | core.$ZodNaNParams): ZodNaN {
  return core._nan(ZodNaN, params);
}

// ZodPipe
export interface ZodPipe<A extends SomeType = SomeType, B extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodPipeInternals<A, B>;

  in: A;
  out: B;
}
export const ZodPipe: core.$constructor<ZodPipe> = core.$constructor("ZodPipe", (inst, def) => {
  core.$ZodPipe.init(inst, def);
  ZodType.init(inst, def);

  inst.in = def.in;
  inst.out = def.out;
});
// export type Z_odMiniPipeParams = util.TypeParams<ZodPipe, "in" | "out">;
export function pipe<
  const A extends core.$ZodType,
  B extends core.$ZodType<unknown, core.output<A>> = core.$ZodType<unknown, core.output<A>>,
>(in_: A, out: B | core.$ZodType<unknown, core.output<A>>, params?: core.$ZodPipeParams): ZodPipe<A, B>;
export function pipe(in_: core.$ZodType, out: core.$ZodType, params?: core.$ZodPipeParams) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out,
    ...util.normalizeParams(params),
  });
}

// ZodReadonly
export interface ZodReadonly<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodReadonlyInternals<T>;
}
export const ZodReadonly: core.$constructor<ZodReadonly> = core.$constructor("ZodReadonly", (inst, def) => {
  core.$ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
});
// export type Z_odMiniReadonlyParams = util.TypeParams<ZodReadonly, "innerType">;
export function readonly<T extends SomeType>(innerType: T, params?: core.$ZodReadonlyParams): ZodReadonly<T> {
  return new ZodReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodReadonly<T>;
}

// ZodTemplateLiteral
export interface ZodTemplateLiteral<Template extends string = string> extends ZodType {
  _zod: core.$ZodTemplateLiteralInternals<Template>;
}
export const ZodTemplateLiteral: core.$constructor<ZodTemplateLiteral> = core.$constructor(
  "ZodTemplateLiteral",
  (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
  }
);
// export type Z_odMiniTemplateLiteralParams = util.TypeParams<ZodTemplateLiteral, "parts">;
export function templateLiteral<const Parts extends core.$TemplateLiteralPart[]>(
  parts: Parts,
  params?: core.$ZodTemplateLiteralParams
): ZodTemplateLiteral<core.$PartsToTemplateLiteral<Parts>> {
  return new ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeParams(params),
  }) as any;
}

// ZodPromise
export interface ZodPromise<T extends SomeType = SomeType> extends ZodType {
  _zod: core.$ZodPromiseInternals<T>;

  unwrap(): T;
}
export const ZodPromise: core.$constructor<ZodPromise> = core.$constructor("ZodPromise", (inst, def) => {
  core.$ZodPromise.init(inst, def);
  ZodType.init(inst, def);

  inst.unwrap = () => inst._zod.def.innerType;
});
// export type Z_odMiniPromiseParams = util.TypeParams<ZodPromise, "innerType">;
export function promise<T extends SomeType>(innerType: T, params?: core.$ZodPromiseParams): ZodPromise<T> {
  return new ZodPromise({
    type: "promise",
    innerType,
    ...util.normalizeParams(params),
  }) as ZodPromise<T>;
}

// ZodCustom
export interface ZodCustom<O = unknown, I = unknown> extends ZodType {
  _zod: core.$ZodCustomInternals<O, I>;
}
export const ZodCustom: core.$constructor<ZodCustom> = core.$constructor("ZodCustom", (inst, def) => {
  core.$ZodCustom.init(inst, def);
  ZodType.init(inst, def);
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

// export function _custom<O = unknown, I = O>(fn: (data: O) => unknown, _params: string | core.$ZodCustomParams | undefined, Class: util.Constructor<ZodCustom, [core.$ZodCustomDef]>): ZodCustom<O, I> {
//   const params = util.normalizeParams(_params);

//   const schema = new Class({
//     type: "custom",
//     check: "custom",
//     fn: fn as any,
//     ...params,
//   });

//   return schema as any;
// }

export function custom<O = unknown, I = O>(
  fn?: (data: O) => unknown,
  _params?: string | core.$ZodCustomParams | undefined
): ZodCustom<O, I> {
  return core._custom(ZodCustom, fn ?? (() => true), _params) as any;
}

export function refine<T>(
  fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
  _params: string | core.$ZodCustomParams = {}
): core.$ZodCheck<T> {
  return core._custom(ZodCustom, fn, _params);
}

// superRefine
export function superRefine<T>(
  fn: (arg: T, payload: RefinementCtx<T>) => void | Promise<void>,
  params?: core.$ZodCustomParams
): core.$ZodCheck<T> {
  const ch = check<T>((payload) => {
    (payload as RefinementCtx).addIssue = (issue) => {
      if (typeof issue === "string") {
        payload.issues.push(util.issue(issue, payload.value, ch._zod.def));
      } else {
        // for Zod 3 backwards compatibility
        const _issue: any = issue;
        if (_issue.fatal) _issue.continue = false;
        _issue.code ??= "custom";
        _issue.input ??= payload.value;
        _issue.inst ??= ch;
        _issue.continue ??= !ch._zod.def.abort;
        payload.issues.push(util.issue(_issue));
      }
    };

    return fn(payload.value, payload as RefinementCtx<T>);
  }, params);
  return ch;
}

//////////    INSTANCEOF     //////////
abstract class Class {
  constructor(..._args: any[]) {}
}
type ZodInstanceOfParams = util.Params<
  ZodCustom,
  core.$ZodIssueCustom,
  "type" | "check" | "checks" | "fn" | "abort" | "error" | "params" | "path"
>;
function _instanceof<T extends typeof Class>(
  cls: T,
  params: ZodInstanceOfParams = {
    error: `Input not instance of ${cls.name}`,
  }
): ZodCustom<InstanceType<T>> {
  // params.abort ??= true; // default fatal
  // return custom((data) => data instanceof cls, params);
  return new ZodCustom({
    type: "custom",
    check: "custom",
    fn: (data) => data instanceof cls,
    abort: true,
    ...(util.normalizeParams(params) as any),
  }) as any;
}
export { _instanceof as instanceof };

export function lazy<T extends object>(getter: () => T): T {
  return util.createTransparentProxy<T>(getter);
}

// stringbool
export const stringbool: (_params?: core.$ZodStringBoolParams) => ZodPipe<ZodUnknown, ZodBoolean> =
  core._stringbool.bind(null, {
    Pipe: ZodPipe,
    Boolean: ZodBoolean,
    Unknown: ZodUnknown,
  }) as any;

// json
export type ZodJSONSchema = ZodUnion<
  [ZodString, ZodNumber, ZodBoolean, ZodNull, ZodArray<ZodJSONSchema>, ZodRecord<ZodString, ZodJSONSchema>]
> & {
  _zod: {
    input: util.JSONType;
    output: util.JSONType;
  };
};

export function json(params?: core.$ZodCustomParams): ZodJSONSchema {
  const jsonSchema = lazy(() => {
    return union([string(params), number(), boolean(), _null(), array(jsonSchema), record(string(), jsonSchema)]);
  }) as ZodJSONSchema;

  return jsonSchema;
}

// preprocess
interface ZodPreprocessParams extends core.$ZodTransformParams, core.$ZodPipeParams {}
/** @deprecated Use `z.pipe()` and `z.transform()` instead. */
export function preprocess<A, U extends core.$ZodType>(
  fn: (arg: unknown, ctx: RefinementCtx) => A,
  schema: U,
  params?: ZodPreprocessParams
): ZodPipe<ZodTransform<A, unknown>, U> {
  return pipe(transform(fn as any, params), schema as any, params);
}
