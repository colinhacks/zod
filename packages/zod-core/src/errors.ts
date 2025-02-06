import type { $ZodSchemaTypes } from "./base.js";
import type * as util from "./util.js";

///////////////////////////
////     base type     ////
///////////////////////////
export interface $ZodIssueBase<Input = unknown> {
  code?: string;
  input: Input | undefined;
  path: PropertyKey[];
  message: string;
  // [k: string]: unknown;
}

////////////////////////////////
////     issue subtypes     ////
////////////////////////////////
export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase<Input> {
  code: "invalid_type";
  expected: $ZodSchemaTypes;
  input: Input;
}

export interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase<Input> {
  code: "too_big";
  origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file";
  maximum: number | bigint;
  inclusive?: boolean;
  // abort: boolean | undefined;
}

export interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase<Input> {
  code: "too_small";
  origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file";
  minimum: number | bigint;
  inclusive?: boolean;
  // abort: boolean | undefined;
}

export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase<string> {
  code: "invalid_format";
  format: string;
  pattern?: string;
  // abort: boolean | undefined;
}

export interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase<Input> {
  code: "not_multiple_of";
  divisor: number;
  // abort: boolean | undefined;
}

export interface $ZodIssueInvalidDate extends $ZodIssueBase<Date> {
  code: "invalid_date";
}

export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase<Record<string, unknown>> {
  code: "unrecognized_keys";
  keys: string[];
}

export interface $ZodIssueInvalidUnion extends $ZodIssueBase<unknown> {
  code: "invalid_union";
  errors: $ZodIssue[][];
}

export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase<Input> {
  code: "invalid_key";
  origin: "map" | "record";
  issues: $ZodIssue[];
}

export interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase<Input> {
  code: "invalid_element";
  origin: "map" | "set";
  key: unknown;
  issues: $ZodIssue[];
}

export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase<Input> {
  code: "invalid_value";
  values: util.Primitive[];
}

export interface $ZodIssueCustom extends $ZodIssueBase<unknown> {
  code?: "custom";
  // abort: boolean | undefined;
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

export interface $ZodIssueStringCommonFormats extends $ZodIssueInvalidStringFormat {
  format: CommonStringFormats;
}

export interface $ZodIssueStringInvalidRegex extends $ZodIssueInvalidStringFormat {
  format: "regex";
  pattern: string;
}

export interface $ZodIssueStringInvalidJWT extends $ZodIssueInvalidStringFormat {
  format: "jwt";
  algorithm?: string;
}

export interface $ZodIssueStringStartsWith extends $ZodIssueInvalidStringFormat {
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

export type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
type DefLike = { error?: $ZodErrorMap<never> | undefined };
type RawIssue<T extends $ZodIssueBase> = util.Flatten<
  Omit<T, "message" | "path"> & {
    path?: PropertyKey[] | undefined;
    message?: string | undefined;
    def?: DefLike | undefined;
    // continue?: boolean | undefined;
  } & Record<string, unknown>
>;

// type alkjdf = RawIssueB<$ZodIssueCustom>;

export type $ZodRawIssueB<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssueB<T> : never;

type RawIssueB<T extends $ZodIssueBase> = util.Flatten<
  Omit<T, "message" | "path"> & {
    path?: PropertyKey[] | undefined;
    message?: string | undefined;
    def?: DefLike | undefined;
    continue?: boolean | undefined;
  } & Record<string, unknown>
>;
// type PathList = {
//   key: PropertyKey;
//   parent: PathList | undefined;
// };

/** @deprecated Use `$ZodRawIssue` instead. */
export type IssueData = $ZodRawIssue;

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
    issue: $ZodRawIssue<T>,
    /** @deprecated */
    _ctx?: ErrorMapCtx
  ): { message: string } | string | undefined;
}
