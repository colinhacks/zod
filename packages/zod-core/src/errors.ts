import type { $ZodSchemaTypes } from "./base.js";
import type * as util from "./util.js";

///////////////////////////
////     base type     ////
///////////////////////////
export interface $ZodIssueBase<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> {
  code: string;
  origin: Origin;
  input?: Input | undefined;
  path: PropertyKey[];
  message: string;
  [k: string]: unknown;
}

////////////////////////////////
////     issue subtypes     ////
////////////////////////////////
export interface $ZodIssueInvalidType<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_type";
  input: Input;
  // received?: string;
}

export interface $ZodIssueTooBig<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "too_big";
  maximum: number | bigint;
  inclusive?: boolean;
}

export interface $ZodIssueTooSmall<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "too_small";
  minimum: number | bigint;
  inclusive?: boolean;
}

export interface $ZodIssueInvalidStringFormat
  extends $ZodIssueBase<"string", string> {
  code: "invalid_format";
  format: string;
  pattern?: string;
}

export interface $ZodIssueNotMultipleOf<
  Origin extends "number" | "bigint" = "number" | "bigint",
  Input extends number | bigint = number | bigint,
> extends $ZodIssueBase<Origin, Input> {
  code: "not_multiple_of";
  divisor: number;
}

export interface $ZodIssueInvalidDate extends $ZodIssueBase<"date", Date> {
  code: "invalid_date";
}

export interface $ZodIssueUnrecognizedKeys
  extends $ZodIssueBase<"object" | "record", Record<string, unknown>> {
  code: "unrecognized_keys";
  keys: string[];
}

// export interface $ZodIssueMissingKeys
//   extends $ZodIssueBase<"object" | "record", Record<string, unknown>> {
//   code: "missing_keys";
//   keys: string[];
// }

export interface $ZodIssueInvalidUnion extends $ZodIssueBase<"union", unknown> {
  code: "invalid_union";
  errors: $ZodIssue[][];
}

export interface $ZodIssueInvalidKey<
  Origin extends "map" | "record" = "map" | "record",
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_key";
  issues: $ZodIssue[];
}

export interface $ZodIssueInvalidElement<
  Origin extends "map" | "set" = "map" | "set",
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_element";
  key: unknown;
  issues: $ZodIssue[];
}

export interface $ZodIssueInvalidValue<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_value";
  values: util.Primitive[];
}

export interface $ZodIssueCustom extends $ZodIssueBase<"custom", unknown> {
  code: "custom";
}

////////////////////////////////////////////
////     first-party string formats     ////
////////////////////////////////////////////

type CommonStringFormats =
  | "regex"
  | "email"
  | "url"
  | "emoji"
  | "uuid"
  | "guid"
  | "nanoid"
  | "guid"
  | "cuid"
  | "cuid2"
  | "ulid"
  | "xid"
  | "ksuid"
  | "iso_datetime"
  | "iso_date"
  | "iso_time"
  | "duration"
  | "ip"
  | "ipv4"
  | "ipv6"
  | "base64"
  | "json_string"
  | "e164"
  | "lowercase"
  | "uppercase";

export interface $ZodIssueStringCommonFormats
  extends $ZodIssueInvalidStringFormat {
  format: CommonStringFormats;
}

export interface $ZodIssueStringInvalidRegex
  extends $ZodIssueInvalidStringFormat {
  format: "regex";
  pattern: string;
}

export interface $ZodIssueStringInvalidJWT
  extends $ZodIssueInvalidStringFormat {
  format: "jwt";
  algorithm?: string;
}

export interface $ZodIssueStringStartsWith
  extends $ZodIssueInvalidStringFormat {
  format: "starts_with";
  prefix: string;
}

export interface $ZodIssueStringEndsWith extends $ZodIssueInvalidStringFormat {
  format: "ends_with";
  suffix: string;
}

export interface $ZodIssueStringIncludes extends $ZodIssueInvalidStringFormat {
  format: "includes";
  includes: string;
}

export type $FirstPartyStringFormats =
  | $ZodIssueStringCommonFormats
  | $ZodIssueStringInvalidRegex
  | $ZodIssueStringInvalidJWT
  | $ZodIssueStringStartsWith
  | $ZodIssueStringEndsWith
  | $ZodIssueStringIncludes;

export type $ZodStringFormats = $FirstPartyStringFormats["format"];

////////////////////////
////     utils     /////
////////////////////////

export type $ZodIssue =
  | $ZodIssueInvalidType
  | $ZodIssueTooBig
  | $ZodIssueTooSmall
  | $ZodIssueInvalidStringFormat
  | $ZodIssueNotMultipleOf
  | $ZodIssueInvalidDate
  | $ZodIssueUnrecognizedKeys
  | $ZodIssueInvalidUnion
  | $ZodIssueInvalidKey
  | $ZodIssueInvalidElement
  | $ZodIssueInvalidValue
  | $ZodIssueCustom;

export type $ZodIssueData<T extends $ZodIssueBase = $ZodIssue> = T extends any
  ? _$ZodIssueData<T>
  : never;

// type ComputedIssueDataPieces<In> = {
//   path?: PropertyKey[] | undefined;
//   // level?: "error" | "abort" | undefined;
//   message?: string | undefined;
//   input: In;
//   def?: { error?: $ZodErrorMap<never> | undefined } | undefined;
// };
type ComputedIssueDataPieces = {
  path?: PropertyKey[] | undefined;
  // level?: "error" | "abort" | undefined;
  message?: string | undefined;

  def?: { error?: $ZodErrorMap<never> | undefined } | undefined;
};

type _$ZodIssueData<T extends $ZodIssueBase> = util.Flatten<
  Omit<util.OmitIndexSignature<T>, "message" | "path"> &
    ComputedIssueDataPieces &
    util.ExtractIndexSignature<T>
>;

/** @deprecated Use `$ZodIssueData` instead. */
export type IssueData = $ZodIssueData;

/** @deprecated */
export type ErrorMapCtx = {
  /** @deprecated To use the default error, return `undefined` or don't return anything at all. */
  defaultError: string;
  /** @deprecated The input data is now available via the `input` property on the issue data (first parameter.)
   *
   * ```ts
   * const errorMap: ZodErrorMap = (issue) => {
   *   // issue.input ;
   * }
   * ```
   */
  data: any;
};

export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
  // biome-ignore lint:
  (
    issue: $ZodIssueData<T>,
    /** @deprecated */
    _ctx?: ErrorMapCtx
  ): { message: string } | string | undefined;
}
