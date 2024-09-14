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

export type $ZodIssueInvalidTypeObjectUnrecognizedKeys =
  _$ZodIssueInvalidType & {
    expected: "object";
    received: "object";
    unrecognized_keys: string[];
  };

export type $ZodIssueInvalidTypeInvalidDate = _$ZodIssueInvalidType & {
  expected: "date";
  received: "invalid_date";
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
  | $ZodIssueInvalidTypeObjectUnrecognizedKeys
  | $ZodIssueInvalidTypeInvalidDate
  | $ZodIssueInvalidTypeUnion
  | $ZodIssueInvalidTypeLiteral
  | $ZodIssueInvalidTypeEnum;

////////////////////////////////////
////     STRING FORMAT ISSUES   ////
////////////////////////////////////
interface _$ZodIssueStringFormat extends $ZodIssueBase {
  code: "invalid_string";
}

export type $ZodIssueRegex = _$ZodIssueStringFormat & {
  format: "regex";
  pattern: string;
};

export type $ZodIssueEmail = _$ZodIssueStringFormat & {
  format: "email";
};

export type $ZodIssueURL = _$ZodIssueStringFormat & {
  format: "url";
};

export type $ZodIssueEmoji = _$ZodIssueStringFormat & {
  format: "emoji";
};

export type $ZodIssueUUID = _$ZodIssueStringFormat & {
  format: "uuid";
};

export type $ZodIssueUUIDv4 = _$ZodIssueStringFormat & {
  format: "uuidv4";
};

export type $ZodIssueUUIDv6 = _$ZodIssueStringFormat & {
  format: "uuidv6";
};

export type $ZodIssueNanoid = _$ZodIssueStringFormat & {
  format: "nanoid";
};

export type $ZodIssueGUID = _$ZodIssueStringFormat & {
  format: "guid";
};

export type $ZodIssueCUID = _$ZodIssueStringFormat & {
  format: "cuid";
};

export type $ZodIssueCUID2 = _$ZodIssueStringFormat & {
  format: "cuid2";
};

export type $ZodIssueULID = _$ZodIssueStringFormat & {
  format: "ulid";
};

export type $ZodIssueXID = _$ZodIssueStringFormat & {
  format: "xid";
};

export type $ZodIssueKSUID = _$ZodIssueStringFormat & {
  format: "ksuid";
};

export type $ZodIssueISODateTime = _$ZodIssueStringFormat & {
  format: "iso_datetime";
};

export type $ZodIssueISODate = _$ZodIssueStringFormat & {
  format: "iso_date";
};

export type $ZodIssueISOTime = _$ZodIssueStringFormat & {
  format: "iso_time";
};

export type $ZodIssueDuration = _$ZodIssueStringFormat & {
  format: "duration";
};

export type $ZodIssueIP = _$ZodIssueStringFormat & {
  format: "ip";
};

export type $ZodIssueIPv4 = _$ZodIssueStringFormat & {
  format: "ipv4";
};

export type $ZodIssueIPv6 = _$ZodIssueStringFormat & {
  format: "ipv6";
};

export type $ZodIssueBase64 = _$ZodIssueStringFormat & {
  format: "base64";
};

export type $ZodIssueJWT = _$ZodIssueStringFormat & {
  format: "jwt";
  algorithm?: JWTAlgorithm | undefined;
};

export type $ZodIssueJSONString = _$ZodIssueStringFormat & {
  format: "json_string";
};

export type $ZodIssueE164 = _$ZodIssueStringFormat & {
  format: "e164";
};

export type $ZodIssueStartsWith = _$ZodIssueStringFormat & {
  format: "starts_with";
  starts_with: string;
};

export type $ZodIssueEndsWith = _$ZodIssueStringFormat & {
  format: "ends_with";
  ends_with: string;
};

export type $ZodIssueIncludes = _$ZodIssueStringFormat & {
  format: "includes";
  includes: string;
};

export type $ZodStringFormatIssues =
  | $ZodIssueRegex
  | $ZodIssueEmail
  | $ZodIssueURL
  | $ZodIssueEmoji
  | $ZodIssueUUID
  | $ZodIssueUUIDv4
  | $ZodIssueUUIDv6
  | $ZodIssueNanoid
  | $ZodIssueGUID
  | $ZodIssueCUID
  | $ZodIssueCUID2
  | $ZodIssueULID
  | $ZodIssueXID
  | $ZodIssueKSUID
  | $ZodIssueISODateTime
  | $ZodIssueISODate
  | $ZodIssueISOTime
  | $ZodIssueDuration
  | $ZodIssueIP
  | $ZodIssueIPv4
  | $ZodIssueIPv6
  | $ZodIssueBase64
  | $ZodIssueJWT
  | $ZodIssueJSONString
  | $ZodIssueE164
  | $ZodIssueStartsWith
  | $ZodIssueEndsWith
  | $ZodIssueIncludes;

export type $ZodStringFormats = $ZodStringFormatIssues["format"];

//////////////////////////////////////////
////     SIZE OUT OF RANGE ISSUES     ////
//////////////////////////////////////////
interface _$ZodIssueSizeOutOfRange extends $ZodIssueBase {
  code: "size_out_of_range";
  domain: "string" | "array" | "set" | "file";
}
export type $ZodIssueMinSize = _$ZodIssueSizeOutOfRange & {
  expected: ">";
  size: number;
  input?: types.Sizeable;
};

export type $ZodIssueMaxSize = _$ZodIssueSizeOutOfRange & {
  expected: "<";
  size: number;
  input?: types.Sizeable;
};

export type $ZodIssueSize = _$ZodIssueSizeOutOfRange & {
  expected: "==";
  size: number;
  input?: types.Sizeable;
};

export type $ZodSizeOutOfRangeIssues =
  | $ZodIssueMinSize
  | $ZodIssueMaxSize
  | $ZodIssueSize;

/////////////////////////////////////////
////     VALUE OUT OF RANGE ISSUES   ////
/////////////////////////////////////////
interface _$ZodIssueInvalidNumber extends $ZodIssueBase {
  code: "invalid_number";
}

export type $ZodIssueLessThan = _$ZodIssueInvalidNumber & {
  expected: "less_than";
  maximum: types.Numeric;
  input?: types.Numeric;
};

export type $ZodIssueLessThanOrEqual = _$ZodIssueInvalidNumber & {
  expected: "less_than_or_equal";
  maximum: types.Numeric;
  input?: types.Numeric;
};

export type $ZodIssueGreaterThan = _$ZodIssueInvalidNumber & {
  expected: "greater_than";
  minimum: types.Numeric;
  input?: types.Numeric;
};

export type $ZodIssueGreaterThanOrEqual = _$ZodIssueInvalidNumber & {
  expected: "greater_than_or_equal";
  minimum: types.Numeric;
  input?: types.Numeric;
};

export type $ZodIssueMultipleOf = _$ZodIssueInvalidNumber & {
  expected: "multiple_of";
  value: types.Numeric;
  input?: types.Numeric;
};

export type $ZodNumberIssues =
  | $ZodIssueLessThan
  | $ZodIssueLessThanOrEqual
  | $ZodIssueGreaterThan
  | $ZodIssueGreaterThanOrEqual
  | $ZodIssueMultipleOf;

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
  | $ZodInvalidTypeIssues
  | $ZodStringFormatIssues
  | $ZodSizeOutOfRangeIssues
  | $ZodNumberIssues
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

export type $ZodErrorMap<in T extends $ZodIssueBase = $ZodIssue> = (
  issue: $ZodIssueData<T>,
  /** @deprecated */
  _ctx?: ErrorMapCtx
) => { message: string } | string | undefined;

/** @deprecated Use `$ZodErrorMap` instead. */
export type ZodErrorMap = $ZodErrorMap;
