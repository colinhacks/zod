import * as err from "./errors.js";
import { type ZodFailure, type ZodParsedType, getParsedType } from "./parse.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";

function processParams(params?: string | $ZodCheckParams): $ZodCheckParams {
  if (typeof params === "string") return { error: params };
  if (!params) return {};
  return params;
}
export interface $ZodCheckParams {
  error?: string;
}

type $Def<T extends $ZodCheck, AlsoOmit extends string = never> = Omit<
  types.PickProps<T>,
  "kind" | AlsoOmit
>;

export interface $CheckCtx<T> {
  fail?: ZodFailure;
  input: T;
  addIssue(issue: err.IssueData): void;
}

interface $ZodCheckDef extends $Def<$ZodCheck> {}
declare const a: $ZodCheckDef;

export abstract class $ZodCheck<in T = never> {
  abstract readonly kind: string;
  deps?: string[];
  error?: string | undefined;
  constructor(def: object) {
    Object.assign(this, def);
  }

  abstract run(ctx: $CheckCtx<T>): void;
}

/////////////////////////////////
/////    $ZodCheckEquals    /////
/////////////////////////////////
interface $ZodCheckEqualsDef {
  value: $ZodCheckEqualsDomain;
}
type $ZodCheckEqualsDomain = number | bigint | Date;
export class $ZodCheckEquals<
  T extends $ZodCheckEqualsDomain = $ZodCheckEqualsDomain,
> extends $ZodCheck<T> {
  override kind = "equals" as const;
  value!: T;
  constructor(def: $ZodCheckEqualsDef) {
    super(def);
  }
  run(ctx: $CheckCtx<T>): void {
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
/////      $ZodCheckLessThan      /////
//////////////////////////////////////
type $ZodCheckLessThanDomain = number | bigint | Date;

export class $ZodCheckLessThan<
  T extends $ZodCheckLessThanDomain = $ZodCheckLessThanDomain,
> extends $ZodCheck<T> {
  override kind = "less_than" as const;
  value!: T;
  inclusive!: boolean;

  constructor(def: $Def<$ZodCheckLessThan>) {
    super(def);
  }
  run(ctx: $CheckCtx<T>): void {
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

export function lt<T extends $ZodCheckLessThanDomain>(
  value: T,
  params?: string | $ZodCheckParams
): $ZodCheckLessThan<T> {
  return new $ZodCheckLessThan({
    ...processParams(params),
    value,
    inclusive: false,
  });
}

export function lte<T extends $ZodCheckLessThanDomain>(
  value: T,
  params?: string | $ZodCheckParams
): $ZodCheckLessThan<T> {
  return new $ZodCheckLessThan({
    ...processParams(params),
    value,
    inclusive: true,
  });
}

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
type $ZodCheckGreaterThanDomain = number | bigint | Date;

export class $ZodCheckGreaterThan<
  T extends $ZodCheckGreaterThanDomain = $ZodCheckGreaterThanDomain,
> extends $ZodCheck<T> {
  override kind = "greater_than" as const;
  value!: T;
  inclusive!: boolean;

  constructor(def: $Def<$ZodCheckGreaterThan>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
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

export function gt<T extends $ZodCheckGreaterThanDomain>(
  value: T,
  params?: string | $ZodCheckParams
): $ZodCheckGreaterThan<T> {
  return new $ZodCheckGreaterThan({
    ...processParams(params),
    value,
    inclusive: false,
  });
}

export function gte<T extends $ZodCheckGreaterThanDomain>(
  value: T,
  params?: string | $ZodCheckParams
): $ZodCheckGreaterThan<T> {
  return new $ZodCheckGreaterThan({
    ...processParams(params),
    value,
    inclusive: true,
  });
}

//////////////////////////////////////
/////    $ZodCheckSizeLessThan    /////
//////////////////////////////////////
type $ZodCheckSizeLessThanDomain =
  | string
  | Array<unknown>
  | Set<unknown>
  | File;

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
export class $ZodCheckSizeLessThan<
  T extends $ZodCheckSizeLessThanDomain = $ZodCheckSizeLessThanDomain,
> extends $ZodCheck<T> {
  override kind = "size_less_than" as const;
  value!: number;
  constructor(def: $Def<$ZodCheckSizeLessThan>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
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
  params?: string | $ZodCheckParams
): $ZodCheckSizeLessThan<string | Array<any>> {
  return new $ZodCheckSizeLessThan({
    ...processParams(params),

    value,
  });
}

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
type $ZodCheckSizeGreaterThanDomain =
  | string
  | Array<unknown>
  | Set<unknown>
  | File;

export class $ZodCheckSizeGreaterThan<
  T extends $ZodCheckSizeGreaterThanDomain = $ZodCheckSizeGreaterThanDomain,
> extends $ZodCheck<T> {
  override kind = "size_greater_than" as const;
  value!: number;
  inclusive!: boolean;
  path?: "length" | "size";
  constructor(def: $Def<$ZodCheckSizeGreaterThan>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
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
  params?: string | $ZodCheckParams
): $ZodCheckSizeGreaterThan<Set<any> | File> {
  return new $ZodCheckSizeGreaterThan({
    ...processParams(params),
    value,
    inclusive: true,
  });
}

/////////////////////////////////
/////    $ZodCheckFormat    /////
/////////////////////////////////

interface $ZodCheckOptionalRegexParams {
  error?: string;
  pattern?: RegExp;
}
type $StringFormatDef<T extends $ZodCheck> = $Def<T, "format">;

interface $ZodCheckRegexParams {
  error?: string;
  pattern: RegExp;
}
abstract class _$ZodCheckStringFormat extends $ZodCheck<string> {
  override kind = "string_format" as const;
  abstract format: err.StringValidation;
  pattern?: RegExp;
  override run(ctx: $CheckCtx<string>): void {
    if (!this.pattern) throw new Error("Not implemented.");
    if (this.pattern.test(ctx.input)) {
      ctx.addIssue({
        code: "invalid_string",
        validation: this.format || "regex",
        input: ctx.input,
        message: this.error,
      });
    }
  }
}

export class $ZodCheckRegex extends _$ZodCheckStringFormat {
  override format = "regex" as const;
  override pattern!: RegExp;
  constructor(def: $StringFormatDef<$ZodCheckRegex>) {
    super(def);
  }
}

export function regex(
  pattern: RegExp,
  params?: string | $ZodCheckParams
): $ZodCheckRegex {
  return new $ZodCheckRegex({
    ...processParams(params),
    pattern,
  });
}

////////////////////////////////
/////    $ZodCheckEmail    /////
////////////////////////////////
export class $ZodCheckEmail extends _$ZodCheckStringFormat {
  override format = "email" as const;
  override pattern: RegExp = regexes.emailRegex;
  constructor(def: $StringFormatDef<$ZodCheckEmail>) {
    super(def);
  }
}

export function email(
  params?: string | $ZodCheckOptionalRegexParams
): $ZodCheckEmail {
  return new $ZodCheckEmail({
    ...processParams(params),
    //

    // format: "email",
    pattern: regexes.emailRegex,
  });
}

//////////////////////////////
/////    $ZodCheckURL    /////
//////////////////////////////
class $ZodCheckURL extends _$ZodCheckStringFormat {
  override format = "url" as const;
  constructor(def: $StringFormatDef<$ZodCheckURL>) {
    super(def);
  }
  override run(ctx: $CheckCtx<string>): void {
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
  params?: string | $ZodCheckOptionalRegexParams
): $ZodCheckURL {
  return new $ZodCheckURL({
    ...processParams(params),
    format: "url",
  });
}

export type IpVersion = "v4" | "v6";
export type JwtAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512";
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
class $ZodCheckJWT extends _$ZodCheckStringFormat {
  override format = "jwt" as const;
  constructor(def: $StringFormatDef<$ZodCheckJWT>) {
    super(def);
  }
}

class $ZodCheckEmoji extends _$ZodCheckStringFormat {
  override format = "emoji" as const;
  constructor(def: $StringFormatDef<$ZodCheckEmoji>) {
    super(def);
  }
}

class $ZodCheckUUID extends _$ZodCheckStringFormat {
  override format = "uuid" as const;
  constructor(def: $StringFormatDef<$ZodCheckUUID>) {
    super(def);
  }
}

class $ZodCheckNanoID extends _$ZodCheckStringFormat {
  override format = "nanoid" as const;
  constructor(def: $StringFormatDef<$ZodCheckNanoID>) {
    super(def);
  }
}

class $ZodCheckGUID extends _$ZodCheckStringFormat {
  override format = "guid" as const;
  constructor(def: $StringFormatDef<$ZodCheckGUID>) {
    super(def);
  }
}

class $ZodCheckCUID extends _$ZodCheckStringFormat {
  override format = "cuid" as const;
  constructor(def: $StringFormatDef<$ZodCheckCUID>) {
    super(def);
  }
}

class $ZodCheckCUID2 extends _$ZodCheckStringFormat {
  override format = "cuid2" as const;
  constructor(def: $StringFormatDef<$ZodCheckCUID2>) {
    super(def);
  }
}

class $ZodCheckULID extends _$ZodCheckStringFormat {
  override format = "ulid" as const;
  constructor(def: $StringFormatDef<$ZodCheckULID>) {
    super(def);
  }
}

class $ZodCheckXID extends _$ZodCheckStringFormat {
  override format = "xid" as const;
  constructor(def: $StringFormatDef<$ZodCheckXID>) {
    super(def);
  }
}

class $ZodCheckKSUID extends _$ZodCheckStringFormat {
  override format = "ksuid" as const;
  constructor(def: $StringFormatDef<$ZodCheckKSUID>) {
    super(def);
  }
}

class $ZodCheckIncludes extends _$ZodCheckStringFormat {
  override format = "includes" as const;
  constructor(def: $StringFormatDef<$ZodCheckIncludes>) {
    super(def);
  }
}

class $ZodCheckStartsWith extends _$ZodCheckStringFormat {
  override format = "starts_with" as const;
  constructor(def: $StringFormatDef<$ZodCheckStartsWith>) {
    super(def);
  }
}

class $ZodCheckEndsWith extends _$ZodCheckStringFormat {
  override format = "endsWith" as const;
  constructor(def: $StringFormatDef<$ZodCheckEndsWith>) {
    super(def);
  }
}

class $ZodCheckDateTime extends _$ZodCheckStringFormat {
  override format = "datetime" as const;
  constructor(def: $StringFormatDef<$ZodCheckDateTime>) {
    super(def);
  }
}

class $ZodCheckDate extends _$ZodCheckStringFormat {
  override format = "date" as const;
  constructor(def: $StringFormatDef<$ZodCheckDate>) {
    super(def);
  }
}

class $ZodCheckTime extends _$ZodCheckStringFormat {
  override format = "time" as const;
  constructor(def: $StringFormatDef<$ZodCheckTime>) {
    super(def);
  }
}

class $ZodCheckDuration extends _$ZodCheckStringFormat {
  override format = "duration" as const;
  constructor(def: $StringFormatDef<$ZodCheckDuration>) {
    super(def);
  }
}

class $ZodCheckIP extends _$ZodCheckStringFormat {
  override format = "ip" as const;
  constructor(def: $StringFormatDef<$ZodCheckIP>) {
    super(def);
  }
}

class $ZodCheckBase64 extends _$ZodCheckStringFormat {
  override format = "base64" as const;
  constructor(def: $StringFormatDef<$ZodCheckBase64>) {
    super(def);
  }
}

class $ZodCheckJSON extends _$ZodCheckStringFormat {
  override format = "json" as const;
  constructor(def: $StringFormatDef<$ZodCheckJSON>) {
    super(def);
  }
}

class $ZodCheckE164 extends _$ZodCheckStringFormat {
  override format = "e164" as const;
  constructor(def: $StringFormatDef<$ZodCheckE164>) {
    super(def);
  }
}
