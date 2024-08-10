import * as err from "./errors.js";
import {
  type ParseContext,
  ZodFailure,
  type ZodParsedType,
  getParsedType,
} from "./parse.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";

function processParams(params?: string | ZodCheckParams): ZodCheckParams {
  if (typeof params === "string") return { error: params };
  if (!params) return {};
  return params;
}
export interface ZodCheckParams {
  error?: string;
}

export interface ZodCheckDef {
  kind: string;
  deps?: string[];
  error?: string;
}

export interface ZodCheck<T> extends ZodCheckDef {}

type $CheckDef<T extends ZodCheck> = types.PickProps<
  Pick<T, types.OmitString<keyof T, `~${string}` | `_${string}`>>
>;
// type domain<T extends ZodCheck> =

export abstract class ZodCheck<in T = never> {
  constructor(def: $CheckDef<ZodCheck>) {
    Object.assign(this, def);
  }

  abstract run(ctx: CheckCtx<T>): void | Promise<void>;
}
// const ch: ZodCheck<any> = {} as any as ZodCheck<string | number>;

type CheckCtxReporter = {
  (data: err.IssueData): void;
  invalid_type(data: err.IssueData<err.ZodIssues["InvalidType"]>): void;
  invalid_literal(data: err.IssueData<err.ZodIssueInvalidLiteral>): void;
  unrecognized_keys(data: err.IssueData<err.ZodIssueUnrecognizedKeys>): void;
  invalid_union(data: err.IssueData<err.ZodIssueInvalidUnion>): void;
  invalid_union_discriminator(
    data: err.IssueData<err.ZodIssueInvalidUnionDiscriminator>
  ): void;
  invalid_enum_value(data: err.IssueData<err.ZodIssueInvalidEnumValue>): void;
  invalid_arguments(data: err.IssueData<err.ZodIssueInvalidArguments>): void;
  invalid_return_type(data: err.IssueData<err.ZodIssueInvalidReturnType>): void;
  invalid_date(data: err.IssueData<err.ZodIssueInvalidDate>): void;
  invalid_string(data: err.IssueData<err.ZodIssueInvalidString>): void;
  too_small(data: err.IssueData<err.ZodIssueTooSmall>): void;
  too_big(data: err.IssueData<err.ZodIssueTooBig>): void;
  invalid_intersection_types(
    data: err.IssueData<err.ZodIssueInvalidIntersectionTypes>
  ): void;
  not_multiple_of(data: err.IssueData<err.ZodIssueNotMultipleOf>): void;
  not_finite(data: err.IssueData<err.ZodIssueNotFinite>): void;
  uniqueness(data: err.IssueData<err.ZodIssueNotUnique>): void;
  invalid_file_type(data: err.IssueData<err.ZodIssueInvalidFileType>): void;
  invalid_file_name(data: err.IssueData<err.ZodIssueInvalidFileName>): void;
  custom(data: err.IssueData<err.ZodIssueCustom>): void;
};

export class CheckCtx<T> {
  aborted = false;
  constructor(
    public input: T,
    public _issues: err.IssueData[],
    public ctx: ParseContext
  ) {
    if (_issues) {
      this.aborted = _issues.some((issue) => issue.level === "abort");
    }
  }
  addIssue(data: err.IssueData): void {
    this._issues = this._issues || [];
    if (data.level === "abort") this.aborted = true;
  }
  toFail(): ZodFailure {
    return new ZodFailure(
      this._issues.map((iss) => err.makeIssue(iss, this.ctx))
    ); //  err.issuesToZodError(this.ctx, this._issues);
  }
}
// export interface CheckCtx<T> {
//   addIssue: CheckCtxReporter;
//   input: T;
//   report: CheckCtxReporter;

// }

// type adsf = err.IssueData;

////////////////////////////////
/////    ZodCheckEquals    /////
////////////////////////////////
type ZodCheckEqualsDomain = Array<any> | Set<any> | File;
export class ZodCheckEquals<
  T extends ZodCheckEqualsDomain = ZodCheckEqualsDomain,
> extends ZodCheck<T> {
  override kind: "equals";
  value: T;
  constructor(def: $CheckDef<ZodCheckEquals>) {
    super(def);
  }
  run(ctx: CheckCtx<T>): void {
    const type = getParsedType(ctx.input);

    if (ctx.input !== this.value) {
      const tooBig = ctx.input > this.value;
      ctx.addIssue({
        code: tooBig ? "too_big" : "too_small",
        type: type as err.ZodIssueTooBig["type"],
        input: ctx.input,
        inclusive: true,
        minimum: tooBig ? (undefined as any) : this.value,
        maximum: tooBig ? this.value : (undefined as any),
        exact: true,
        message: this.error,
      } satisfies
        | err.IssueData<err.ZodIssueTooBig>
        | err.IssueData<err.ZodIssueTooSmall>);
    }
  }
}

//////////////////////////////////////
/////      ZodCheckLessThan      /////
//////////////////////////////////////
type ZodCheckLessThanDomain = number | bigint | Date;

export class ZodCheckLessThan<
  T extends ZodCheckLessThanDomain = ZodCheckLessThanDomain,
> extends ZodCheck<T> {
  override kind: "less_than";
  value: T;
  inclusive: boolean;
  constructor(def: $CheckDef<ZodCheckLessThan>) {
    super(def);
  }
  run(ctx: CheckCtx<T>): void {
    const type = getParsedType(ctx.input);

    if (this.inclusive ? this.value <= ctx.input : this.value < ctx.input) {
      ctx.addIssue({
        code: "too_small",
        type: type as err.ZodIssueTooSmall["type"],
        input: ctx.input,
        inclusive: false,
        minimum: this.value instanceof Date ? this.value.getTime() : this.value,
        message: this.error,
      });
    }
  }
}

export function lt<T extends ZodCheckLessThanDomain>(
  value: T,
  params?: string | ZodCheckParams
): ZodCheckLessThan<T> {
  return new ZodCheckLessThan({
    ...processParams(params),
    kind: "less_than",
    value,
    inclusive: false,
  });
}

export function lte<T extends ZodCheckLessThanDomain>(
  value: T,
  params?: string | ZodCheckParams
): ZodCheckLessThan<T> {
  return new ZodCheckLessThan({
    ...processParams(params),
    kind: "less_than",
    value,
    inclusive: true,
  });
}

/////////////////////////////////////
/////    ZodCheckGreaterThan    /////
/////////////////////////////////////
type ZodCheckGreaterThanDomain = number | bigint | Date;

export class ZodCheckGreaterThan<
  T extends ZodCheckGreaterThanDomain = ZodCheckGreaterThanDomain,
> extends ZodCheck<T> {
  override kind: "greater_than";
  value: T;
  inclusive: boolean;
  constructor(def: $CheckDef<ZodCheckGreaterThan>) {
    super(def);
  }
  run(ctx: CheckCtx<T>): void {
    const type = getParsedType(ctx.input);
    if (this.inclusive ? this.value > ctx.input : this.value >= ctx.input) {
      ctx.addIssue({
        code: "too_big",
        type: type as err.ZodIssueTooBig["type"],
        input: ctx.input,
        inclusive: false,
        maximum: this.value instanceof Date ? this.value.getTime() : this.value,
        message: this.error,
      });
    }
  }
}

export function gt<T extends ZodCheckGreaterThanDomain>(
  value: T,
  params?: string | ZodCheckParams
): ZodCheckGreaterThan<T> {
  return new ZodCheckGreaterThan({
    ...processParams(params),
    kind: "greater_than",
    value,
    inclusive: false,
  });
}

export function gte<T extends ZodCheckGreaterThanDomain>(
  value: T,
  params?: string | ZodCheckParams
): ZodCheckGreaterThan<T> {
  return new ZodCheckGreaterThan({
    ...processParams(params),
    kind: "greater_than",
    value,
    inclusive: true,
  });
}

//////////////////////////////////////
/////    ZodCheckSizeLessThan    /////
//////////////////////////////////////
type ZodCheckSizeLessThanDomain = string | Array<unknown> | Set<unknown> | File;

function getSize(input: any, type: ZodParsedType) {
  switch (type) {
    case "string":
      return input.length;
    case "array":
      return input.length;
    case "set":
      return input.size;
    case "file":
      return input.size;
    default:
      throw new Error(`Invalid input for size check: ${type}`);
  }
}
export class ZodCheckSizeLessThan<
  T extends ZodCheckSizeLessThanDomain = ZodCheckSizeLessThanDomain,
> extends ZodCheck<T> {
  override kind: "size_less_than";
  value: number;
  constructor(def: $CheckDef<ZodCheckSizeLessThan>) {
    super(def);
  }
  run(ctx: CheckCtx<T>): void {
    const type = getParsedType(ctx.input);
    const size = getSize(ctx.input, type);
    if (size < ctx.input) {
      ctx.addIssue({
        code: "too_small",
        type: type as err.ZodIssueTooSmall["type"],
        input: ctx.input,
        inclusive: false,
        minimum: this.value,
        message: this.error,
      });
    }
  }
}

export function minItems(
  value: number,
  params?: string | ZodCheckParams
): ZodCheckSizeLessThan<string | Array<any>> {
  return new ZodCheckSizeLessThan({
    ...processParams(params),
    kind: "size_less_than",
    value,
  });
}

/////////////////////////////////////
/////    ZodCheckGreaterThan    /////
/////////////////////////////////////
type ZodCheckSizeGreaterThanDomain =
  | string
  | Array<unknown>
  | Set<unknown>
  | File;

export class ZodCheckSizeGreaterThan<
  T extends ZodCheckSizeGreaterThanDomain = ZodCheckSizeGreaterThanDomain,
> extends ZodCheck<T> {
  override kind: "size_greater_than";
  value: number;
  inclusive: boolean;
  path?: "length" | "size";
  constructor(def: $CheckDef<ZodCheckSizeGreaterThan>) {
    super(def);
  }
  run(ctx: CheckCtx<T>): void {
    const type = getParsedType(ctx.input);

    const input = getSize(ctx.input, type);
    if (this.inclusive ? input >= ctx.input : input > ctx.input) {
      ctx.addIssue({
        code: "too_big",
        type: type as err.ZodIssueTooBig["type"],
        input: ctx.input,
        inclusive: false,
        maximum: this.value,
        message: this.error,
      });
    }
  }
}

export function maxItems(
  value: number,
  params?: string | ZodCheckParams
): ZodCheckSizeGreaterThan<Set<any> | File> {
  return new ZodCheckSizeGreaterThan({
    ...processParams(params),
    kind: "size_greater_than",
    value,
    inclusive: true,
  });
}

//////////////////////////////////////
/////    ZodCheckStringFormat    /////
//////////////////////////////////////
interface ZodCheckRegexParams {
  error?: string;
  pattern: RegExp;
}
abstract class $ZodCheckRegex extends ZodCheck<string> {
  // override kind: "string.regex";
  format?: err.StringValidation;
  pattern: RegExp;

  override run(ctx: CheckCtx<string>): void {
    if (!this.pattern.test(ctx.input)) {
      ctx.addIssue({
        code: "invalid_string",
        validation: this.format || "regex",
        input: ctx.input,
        message: this.error,
      });
    }
  }
}

class ZodCheckRegex extends $ZodCheckRegex {
  override kind: "regex";

  constructor(def: $CheckDef<ZodCheckRegex>) {
    super(def);
  }
}

export function regex(
  pattern: RegExp,
  params?: string | ZodCheckParams
): ZodCheckRegex {
  return new ZodCheckRegex({
    ...processParams(params),
    kind: "regex",
    format: "regex",
    pattern,
  });
}

interface ZodCheckOptionalRegexParams {
  error?: string;
  pattern?: RegExp;
}
export class ZodCheckStringEmail extends ZodCheckRegex {
  validation: "email";
  constructor(def: $CheckDef<ZodCheckStringEmail>) {
    super(def);
  }
}

export function email(
  params?: string | ZodCheckOptionalRegexParams
): ZodCheckStringEmail {
  return new ZodCheckStringEmail({
    ...processParams(params),
    kind: "regex",
    validation: "email",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  });
}

class ZodCheckStringURL extends ZodCheck<string> {
  validation: "url";
  constructor(def: $CheckDef<ZodCheckStringURL>) {
    super(def);
  }
  run(ctx: CheckCtx<string>): void {
    try {
      const url = new URL(ctx.input);
      if (!regexes.hostnameRegex.test(url.hostname)) {
        ctx.addIssue({
          input: ctx.input,
          validation: "url",
          code: err.ZodIssueCode.invalid_string,
          message: this.error,
        });
      }
    } catch {
      ctx.addIssue({
        input: ctx.input,
        validation: "url",
        code: err.ZodIssueCode.invalid_string,
        message: this.error,
      });
    }
  }
}

export function url(
  params?: string | ZodCheckOptionalRegexParams
): ZodCheckStringURL {
  return new ZodCheckStringURL({
    ...processParams(params),
    kind: "url",
    validation: "url",
  });
}

function isValidJwt(token: string, algorithm: JwtAlgorithm | null = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) {
      return false;
    }

    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));

    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") {
      return false;
    }

    if (
      algorithm &&
      (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
class ZodCheckStringJWT extends ZodCheckRegex {
  validation: "jwt";
  constructor(def: $CheckDef<ZodCheckStringJWT>) {
    super(def);
  }
}

class ZodCheckStringEmoji extends ZodCheckRegex {
  validation: "emoji";
  constructor(def: $CheckDef<ZodCheckStringEmoji>) {
    super(def);
  }
}

class ZodCheckStringUUID extends ZodCheckRegex {
  validation: "uuid";
  constructor(def: $CheckDef<ZodCheckStringUUID>) {
    super(def);
  }
}

class ZodCheckStringNanoID extends ZodCheckRegex {
  validation: "nanoid";
  constructor(def: $CheckDef<ZodCheckStringNanoID>) {
    super(def);
  }
}

class ZodCheckStringGUID extends ZodCheckRegex {
  validation: "guid";
  constructor(def: $CheckDef<ZodCheckStringGUID>) {
    super(def);
  }
}

class ZodCheckStringCUID extends ZodCheckRegex {
  validation: "cuid";
  constructor(def: $CheckDef<ZodCheckStringCUID>) {
    super(def);
  }
}

class ZodCheckStringCUID2 extends ZodCheckRegex {
  validation: "cuid2";
  constructor(def: $CheckDef<ZodCheckStringCUID2>) {
    super(def);
  }
}

class ZodCheckStringULID extends ZodCheckRegex {
  validation: "ulid";
  constructor(def: $CheckDef<ZodCheckStringULID>) {
    super(def);
  }
}

class ZodCheckStringXID extends ZodCheckRegex {
  validation: "xid";
  constructor(def: $CheckDef<ZodCheckStringXID>) {
    super(def);
  }
}

class ZodCheckStringKSUID extends ZodCheckRegex {
  validation: "ksuid";
  constructor(def: $CheckDef<ZodCheckStringKSUID>) {
    super(def);
  }
}

class ZodCheckStringIncludes extends ZodCheckRegex {
  validation: "includes";
  constructor(def: $CheckDef<ZodCheckStringIncludes>) {
    super(def);
  }
}

class ZodCheckStringStartsWith extends ZodCheckRegex {
  validation: "startswith";
  constructor(def: $CheckDef<ZodCheckStringStartsWith>) {
    super(def);
  }
}

class ZodCheckStringEndsWith extends ZodCheckRegex {
  validation: "endswith";
  constructor(def: $CheckDef<ZodCheckStringEndsWith>) {
    super(def);
  }
}

class ZodCheckStringDateTime extends ZodCheckRegex {
  validation: "datetime";
  constructor(def: $CheckDef<ZodCheckStringDateTime>) {
    super(def);
  }
}

class ZodCheckStringDate extends ZodCheckRegex {
  validation: "date";
  constructor(def: $CheckDef<ZodCheckStringDate>) {
    super(def);
  }
}

class ZodCheckStringTime extends ZodCheckRegex {
  validation: "time";
  constructor(def: $CheckDef<ZodCheckStringTime>) {
    super(def);
  }
}

class ZodCheckStringDuration extends ZodCheckRegex {
  validation: "duration";
  constructor(def: $CheckDef<ZodCheckStringDuration>) {
    super(def);
  }
}

class ZodCheckStringIP extends ZodCheckRegex {
  validation: "ip";
  constructor(def: $CheckDef<ZodCheckStringIP>) {
    super(def);
  }
}

class ZodCheckStringBase64 extends ZodCheckRegex {
  validation: "base64";
  constructor(def: $CheckDef<ZodCheckStringBase64>) {
    super(def);
  }
}

class ZodCheckStringJSON extends ZodCheckRegex {
  validation: "json";
  constructor(def: $CheckDef<ZodCheckStringJSON>) {
    super(def);
  }
}

class ZodCheckStringE164 extends ZodCheckRegex {
  validation: "e164";
  constructor(def: $CheckDef<ZodCheckStringE164>) {
    super(def);
  }
}
