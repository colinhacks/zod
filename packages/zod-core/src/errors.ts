// import type * as zsf from "./zsf.js";

import type * as parse from "./parse.js";
import type * as types from "./types.js";
import type { JWTAlgorithm } from "./types.js";

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}
type flatten<T> = { [k in keyof T]: T[k] } & {};

export interface $ZodIssueBase {
  level: "error" | "abort";
  path: (string | number)[];
  message: string;
  input?: unknown;
}

//////////////////////////////////////
////     INVALID TYPE ISSUES      ////
//////////////////////////////////////
interface _$ZodIssueInvalidType extends $ZodIssueBase {
  code: "invalid_type";
}

type BasicTypes =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  // | "function"
  | "nan"
  | "integer"
  | "float"
  | "null"
  | "array"
  // | "unknown"
  // | "promise"
  // | "void"
  | "date"
  | "never"
  | "map"
  | "set"
  | "file";

export type $ZodIssueInvalidTypeBasic = _$ZodIssueInvalidType & {
  expected: parse.ZodParsedType;
  received: parse.ZodParsedType;
};

// this should be invalid_object
export type $ZodIssueInvalidTypeUnrecognizedKeys = _$ZodIssueInvalidType & {
  expected: "object";
  received: "unrecognized_keys";
  keys: string[];
};

export type $ZodIssueInvalidTypeUnion = _$ZodIssueInvalidType & {
  expected: "union";
  unionErrors: ZodError[];
};

export type $ZodIssueInvalidTypeLiteral = _$ZodIssueInvalidType & {
  expected: "literal";
  literalValues: Primitive[];
};

export type $ZodIssueInvalidTypeEnum = _$ZodIssueInvalidType & {
  expected: "enum";
  enumValues: (string | number)[];
};

export type $ZodInvalidTypeIssues =
  | $ZodIssueInvalidTypeBasic
  | $ZodIssueInvalidTypeUnrecognizedKeys
  | $ZodIssueInvalidTypeUnion
  | $ZodIssueInvalidTypeLiteral
  | $ZodIssueInvalidTypeEnum;

////////////////////////////////
////     INVALID_FORMAT     ////
////////////////////////////////

interface _$ZodIssueInvalidFormat extends $ZodIssueBase {
  code: "invalid_format";
  format: string;
}

type _StringFormats =
  | "email"
  | "url"
  | "emoji"
  | "uuid"
  | "uuidv4"
  | "uuidv6"
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
  | "e164";
// | (string & {});

export type $ZodIssueStringFormat = _$ZodIssueInvalidFormat & {
  format: _StringFormats;
  input: string;
};

export type $ZodIssueRegex = _$ZodIssueInvalidFormat & {
  format: "regex";
  pattern: string;
  input: string;
};

export type $ZodIssueJWT = _$ZodIssueInvalidFormat & {
  format: "jwt";
  algorithm?: JWTAlgorithm | undefined;
  input: string;
};

export type $ZodIssueStartsWith = _$ZodIssueInvalidFormat & {
  format: "starts_with";
  starts_with: string;
  input: string;
};

export type $ZodIssueEndsWith = _$ZodIssueInvalidFormat & {
  format: "ends_with";
  ends_with: string;
  input: string;
};

export type $ZodIssueIncludes = _$ZodIssueInvalidFormat & {
  format: "includes";
  includes: string;
  input: string;
};

type $ZodInvalidFormatIssues =
  | $ZodIssueStringFormat
  | $ZodIssueRegex
  | $ZodIssueJWT
  | $ZodIssueStartsWith
  | $ZodIssueEndsWith
  | $ZodIssueIncludes;

export type $ZodStringFormats =
  | $ZodInvalidFormatIssues["format"]
  | (string & {});

//////////////////////////////
////     INVALID_SIZE     ////
//////////////////////////////
interface _$ZodIssueSizeOutOfRange extends $ZodIssueBase {
  code: "invalid_size";
  domain: "string" | "array" | "set" | "file";
}

export type $ZodIssueTooSmall = _$ZodIssueSizeOutOfRange & {
  received: "too_small";
  minimum: number;
  input?: types.Sizeable;
};

export type $ZodIssueTooBig = _$ZodIssueSizeOutOfRange & {
  received: "too_big";
  maximum: number;
  input?: types.Sizeable;
};

export type $ZodInvalidSizeIssues = $ZodIssueTooSmall | $ZodIssueTooBig;

///////////////////////////////
////     INVALID_VALUE     ////
///////////////////////////////
interface _$ZodIssueInvalidValue extends $ZodIssueBase {
  code: "invalid_value";
}

export type $ZodIssueLessThan = _$ZodIssueInvalidValue & {
  expected: "less_than";
  maximum: types.Numeric;

  input?: types.Numeric;
};

export type $ZodIssueLessThanOrEqual = _$ZodIssueInvalidValue & {
  expected: "less_than_or_equal";
  maximum: types.Numeric;

  input?: types.Numeric;
};

export type $ZodIssueGreaterThan = _$ZodIssueInvalidValue & {
  expected: "greater_than";
  minimum: types.Numeric;

  input?: types.Numeric;
};

export type $ZodIssueGreaterThanOrEqual = _$ZodIssueInvalidValue & {
  expected: "greater_than_or_equal";
  minimum: types.Numeric;

  input?: types.Numeric;
};

export type $ZodIssueMultipleOf = _$ZodIssueInvalidValue & {
  expected: "multiple_of";
  value: types.Numeric;
  input?: types.Numeric;
};

export interface $ZodIssueInvalidDate extends $ZodIssueBase {
  expected: "valid_date";
  input?: Date;
}

export type $ZodInvalidValueIssues =
  | $ZodIssueLessThan
  | $ZodIssueLessThanOrEqual
  | $ZodIssueGreaterThan
  | $ZodIssueGreaterThanOrEqual
  | $ZodIssueMultipleOf
  | $ZodIssueInvalidDate;

/// MAP ISSUES
// export type $ZodIssueInvalidMapKey = $ZodIssueBase & {
//   code: "invalid_map_key";
//   issue: $ZodIssue;
// };

// export type $ZodIssueInvalidMapValue = $ZodIssueBase & {
//   code: "invalid_map_value";
//   issue: $ZodIssue;
// };

//////////////////////////////
////     CUSTOM ISSUES    ////
//////////////////////////////
// user-defined custom issue sub-types
export interface ZodCustomIssues {
  custom: { params?: { [k: string]: any } };
  test: { test: number };
}

type _ZodCustomIssue = $ZodIssueBase & { code: "custom" } & flatten<
    ZodCustomIssues[keyof ZodCustomIssues]
  >;
export type $ZodCustomIssues = _ZodCustomIssue;

export type $ZodIssue =
  | $ZodInvalidTypeIssues // invalid type
  | $ZodInvalidFormatIssues // invalid format
  | $ZodInvalidSizeIssues // invalid_size
  | $ZodInvalidValueIssues // invalid_value
  | $ZodCustomIssues;

//////////////////////////////
////     UTILITY TYPES    ////
//////////////////////////////
export type $ZodIssueData<T extends $ZodIssueBase = $ZodIssue> =
  (T extends infer U
    ? Omit<Required<U>, "message" | "path" | "level">
    : never) & {
    // input?: any;
    path?: (string | number)[];
    // fatal?: boolean;
    level?: "error" | "abort";
    message?: string | undefined;
  };

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

export type $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> = (
  issue: $ZodIssueData<T>,
  /** @deprecated */
  _ctx?: ErrorMapCtx
) => { message: string } | string | undefined;

/** @deprecated Use `$ZodErrorMap` instead. */
export type ZodErrorMap = $ZodErrorMap;
