import type { $ZodSchemaTypes } from "./core.js";
import type { $ZodParsedTypes } from "./parse.js";
import type * as types from "./types.js";

interface $ZodIssueBase {
  origin: $ZodSchemaTypes;
  level: "error" | "abort";
  path: PropertyKey[];
  message: string;
  input?: unknown;
}

///////////////////////////////
////     COMMON ISSUES     ////
///////////////////////////////

export interface $ZodIssueInvalidType<T extends $ZodSchemaTypes = $ZodSchemaTypes> extends $ZodIssueBase {
  origin: T;
  code: "invalid_type";
  input: unknown;
  received: $ZodParsedTypes;
  allowable?: types.Primitive[];
}

//////////////////////////////
////     NEVER ISSUES     ////
//////////////////////////////
interface $ZodIssueNeverInvalidType extends $ZodIssueInvalidType<"never"> {}

///////////////////////////////
////     STRING ISSUES     ////
///////////////////////////////

interface $ZodIssueStringInvalidType extends $ZodIssueInvalidType<"string"> {}

interface $ZodIssueStringTooBig extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "too_big";
  max_size: number;
}

interface $ZodIssueStringTooSmall extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "too_small";
  min_size: number;
}

export type _StringFormats =
  | "regex"
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

interface $ZodIssueStringInvalidFormat extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: _StringFormats; //| (string & {});
  pattern?: string;
}

interface $ZodIssueStringInvalidRegex extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: "regex";
  pattern: string;
}

interface $ZodIssueStringInvalidJWT extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: "jwt";
  algorithm?: string;
}

interface $ZodIssueStringStartsWith extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: "starts_with";
  starts_with: string;
}

interface $ZodIssueStringEndsWith extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: "ends_with";
  ends_with: string;
}

interface $ZodIssueStringIncludes extends $ZodIssueBase {
  origin: "string";
  input: string;
  code: "invalid_format";
  format: "includes";
  includes: string;
}

type ZodStringIssues =
  | $ZodIssueStringInvalidFormat
  | $ZodIssueStringInvalidRegex
  | $ZodIssueStringInvalidJWT
  | $ZodIssueStringStartsWith
  | $ZodIssueStringEndsWith
  | $ZodIssueStringIncludes;
export type $ZodStringFormats = ZodStringIssues["format"];

///////////////////////////////
////     NUMBER ISSUES     ////
///////////////////////////////
interface $ZodIssueNumberInvalidType extends $ZodIssueInvalidType<"number"> {}

interface $ZodIssueNumberTooBig extends $ZodIssueBase {
  origin: "number";
  // format?: string | undefined;
  input: number;
  code: "too_big";
  maximum: number;
  inclusive: boolean;
}

interface $ZodIssueNumberTooSmall extends $ZodIssueBase {
  origin: "number";
  // format?: string | undefined;
  input: number;
  code: "too_small";
  minimum: number;
  inclusive: boolean;
}

interface $ZodIssueNumberNotMultipleOf extends $ZodIssueBase {
  origin: "number";
  // format?: string | undefined;
  input: number;
  code: "not_multiple_of";
  divisor: number;
}

export type $ZodNumberIssues =
  | $ZodIssueNumberInvalidType
  | $ZodIssueNumberTooBig
  | $ZodIssueNumberTooSmall
  | $ZodIssueNumberNotMultipleOf;

///////////////////////////////
////     BIGINT ISSUES     ////
///////////////////////////////
interface $ZodIssueBigIntInvalidType extends $ZodIssueInvalidType<"bigint"> {}

interface $ZodIssueBigIntTooBig extends $ZodIssueBase {
  origin: "bigint";
  input: bigint;
  code: "too_big";
  maximum: bigint;
  inclusive: boolean;
}

interface $ZodIssueBigIntTooSmall extends $ZodIssueBase {
  origin: "bigint";
  input: bigint;
  code: "too_small";
  minimum: bigint;
  inclusive: boolean;
}

interface $ZodIssueBigIntNotMultipleOf extends $ZodIssueBase {
  origin: "bigint";
  input: bigint;
  code: "not_multiple_of";
  divisor: bigint;
}

////////////////////////////////
////     BOOLEAN ISSUES     ////
////////////////////////////////
interface $ZodIssueBooleanInvalidType extends $ZodIssueInvalidType<"boolean"> {}

////////////////////////////////
////     SYMBOL ISSUES      ////
////////////////////////////////
interface $ZodIssueSymbolInvalidType extends $ZodIssueInvalidType<"symbol"> {}

////////////////////////////////
////      DATE ISSUES       ////
////////////////////////////////
interface $ZodIssueDateInvalidType extends $ZodIssueInvalidType<"date"> {}

interface $ZodIssueDateInvalidDate extends $ZodIssueBase {
  origin: "date";
  input: Date;
  code: "invalid_date";
}

interface $ZodIssueDateTooSmall extends $ZodIssueBase {
  origin: "date";
  input: Date;
  code: "too_small";
  minimum: Date;
  inclusive: boolean;
}

interface $ZodIssueDateTooBig extends $ZodIssueBase {
  origin: "date";
  input: Date;
  code: "too_big";
  maximum: Date;
  inclusive: boolean;
}

//////////////////////////////
////     ARRAY ISSUES     ////
//////////////////////////////
interface $ZodIssueArrayInvalidType extends $ZodIssueInvalidType<"array"> {}

interface $ZodIssueArrayTooBig extends $ZodIssueBase {
  origin: "array";
  input: unknown[];
  code: "too_big";
  max_size: number;
}

interface $ZodIssueArrayTooSmall extends $ZodIssueBase {
  origin: "array";
  input: unknown[];
  code: "too_small";
  min_size: number;
}

///////////////////////////////
////     OBJECT ISSUES     ////
///////////////////////////////
interface $ZodIssueObjectInvalidType extends $ZodIssueInvalidType<"object"> {}

interface $ZodIssueObjectUnrecognizedKeys extends $ZodIssueBase {
  origin: "object";
  input: Record<string, unknown>;
  code: "unrecognized_keys";
  keys: string[];
}

//////////////////////////////
////     UNION ISSUES     ////
//////////////////////////////

interface $ZodIssueUnionErrors extends $ZodIssueBase {
  origin: "union";
  input: unknown;
  code: "invalid_union";
  errors: $ZodIssue[][];
}

////////////////////////////
////     MAP ISSUES     ////
////////////////////////////
interface $ZodIssueMapInvalidType extends $ZodIssueInvalidType<"map"> {}

interface $ZodIssueMapInvalidKey extends $ZodIssueBase {
  origin: "map";
  input: Map<unknown, unknown>;
  code: "invalid_key";
  issues: $ZodIssue[];
}

interface $ZodIssueMapInvalidValue extends $ZodIssueBase {
  origin: "map";
  input: Map<unknown, unknown>;
  code: "invalid_value";
  key: unknown;
  issues: $ZodIssue[];
}

////////////////////////////
////     SET ISSUES     ////
////////////////////////////

interface $ZodIssueSetInvalidType extends $ZodIssueInvalidType<"set"> {}

interface $ZodIssueSetInvalidElement extends $ZodIssueBase {
  origin: "set";
  input: unknown;
  code: "invalid_set_element";
  value: unknown;
  issues: $ZodIssue[];
}

interface $ZodIssueSetTooBig extends $ZodIssueBase {
  origin: "set";
  input: Set<unknown>;
  code: "too_big";
  max_size: number;
}

interface $ZodIssueSetTooSmall extends $ZodIssueBase {
  origin: "set";
  input: Set<unknown>;
  code: "too_small";
  min_size: number;
}

///////////////////////////////
////     RECORD ISSUES     ////
///////////////////////////////

// interface $ZodIssueRecordInvalidType extends $ZodIssueInvalidType<"record"> {}

interface $ZodIssueRecordInvalidKey extends $ZodIssueBase {
  origin: "record";
  input: PropertyKey;
  code: "invalid_key";
  issues: $ZodIssue[];
}

/////////////////////////////
////     ENUM ISSUES     ////
/////////////////////////////

interface $ZodIssueEnumInvalidValue extends $ZodIssueBase {
  origin: "enum";
  input: unknown;
  code: "invalid_type";
  options: types.Primitive[];
}

//////////////////////////////////
////      LITERAL ISSUES      ////
//////////////////////////////////
interface $ZodIssueLiteralInvalidType extends $ZodIssueInvalidType<"literal"> {
  values: types.Primitive[];
}

////////////////////////////////
////    FILE ISSUES          ////
////////////////////////////////
interface $ZodIssueFileInvalidType extends $ZodIssueInvalidType<"file"> {}

interface $ZodIssueFileTooBig extends $ZodIssueBase {
  origin: "file";
  input: File;
  code: "too_big";
  maximum: number;
}

interface $ZodIssueFileTooSmall extends $ZodIssueBase {
  origin: "file";
  input: File;
  code: "too_small";
  min_size: number;
}

//////////////////////////////
////     CUSTOM ISSUES    ////
//////////////////////////////
// user-defined custom issue sub-types
interface $ZodConfigBase {
  customIssues: object;
}
export interface $ZodConfig extends $ZodConfigBase {
  // customIssues: { problem: "custom"; params?: { [k: string]: unknown } } | { problem: "test"; test: number };
  // customIssues: unknown;
}

export interface $ZodIssueCustom extends $ZodIssueBase {
  code: "custom";
  [k: string]: unknown;
}
// export type $ZodCustomIssues = types.flatten<
//   $ZodIssueCustom & {
//     origin: "custom";
//   } & $ZodConfig["customIssues"]
// >;

///////////////////////////////////////////////////////////////////////

export type {
  $ZodIssueBase,
  // $ZodIssueNeverInvalidType,
  // $ZodIssueStringInvalidType,
  $ZodIssueStringTooBig,
  $ZodIssueStringTooSmall,
  $ZodIssueStringInvalidFormat,
  $ZodIssueStringInvalidRegex,
  $ZodIssueStringInvalidJWT,
  $ZodIssueStringStartsWith,
  $ZodIssueStringEndsWith,
  $ZodIssueStringIncludes,
  // $ZodIssueNumberInvalidType,
  $ZodIssueNumberTooBig,
  $ZodIssueNumberTooSmall,
  $ZodIssueNumberNotMultipleOf,
  // $ZodIssueBigIntInvalidType,
  $ZodIssueBigIntTooBig,
  $ZodIssueBigIntTooSmall,
  $ZodIssueBigIntNotMultipleOf,
  // $ZodIssueBooleanInvalidType,
  // $ZodIssueSymbolInvalidType,
  // $ZodIssueDateInvalidType,
  $ZodIssueDateInvalidDate,
  $ZodIssueDateTooSmall,
  $ZodIssueDateTooBig,
  // $ZodIssueArrayInvalidType,
  $ZodIssueArrayTooBig,
  $ZodIssueArrayTooSmall,
  // $ZodIssueObjectInvalidType,
  $ZodIssueObjectUnrecognizedKeys,
  $ZodIssueUnionErrors,
  // $ZodIssueMapInvalidType,
  $ZodIssueMapInvalidKey,
  $ZodIssueMapInvalidValue,
  // $ZodIssueSetInvalidType,
  $ZodIssueSetInvalidElement,
  $ZodIssueSetTooBig,
  $ZodIssueSetTooSmall,
  $ZodIssueRecordInvalidKey,
  $ZodIssueEnumInvalidValue,
  // $ZodIssueLiteralInvalidType,
  // $ZodIssueFileInvalidType,
  $ZodIssueFileTooBig,
  $ZodIssueFileTooSmall,
};

export type $ZodIssue =
  | $ZodIssueInvalidType
  // | $ZodIssueStringInvalidType
  | $ZodIssueStringTooBig
  | $ZodIssueStringTooSmall
  | $ZodIssueStringInvalidFormat
  | $ZodIssueStringInvalidRegex
  | $ZodIssueStringInvalidJWT
  | $ZodIssueStringStartsWith
  | $ZodIssueStringEndsWith
  | $ZodIssueStringIncludes
  // | $ZodIssueNumberInvalidType
  | $ZodIssueNumberTooBig
  | $ZodIssueNumberTooSmall
  | $ZodIssueNumberNotMultipleOf
  // | $ZodIssueBigIntInvalidType
  | $ZodIssueBigIntTooBig
  | $ZodIssueBigIntTooSmall
  | $ZodIssueBigIntNotMultipleOf
  // | $ZodIssueBooleanInvalidType
  // | $ZodIssueSymbolInvalidType
  // | $ZodIssueDateInvalidType
  | $ZodIssueDateTooSmall
  | $ZodIssueDateTooBig
  | $ZodIssueDateInvalidDate
  // | $ZodIssueArrayInvalidType
  | $ZodIssueArrayTooBig
  | $ZodIssueArrayTooSmall
  // | $ZodIssueObjectInvalidType
  | $ZodIssueObjectUnrecognizedKeys
  | $ZodIssueUnionErrors
  // | $ZodIssueMapInvalidType
  | $ZodIssueMapInvalidKey
  | $ZodIssueMapInvalidValue
  // | $ZodIssueSetInvalidType
  | $ZodIssueSetInvalidElement
  | $ZodIssueSetTooBig
  | $ZodIssueSetTooSmall
  | $ZodIssueRecordInvalidKey
  | $ZodIssueEnumInvalidValue
  // | $ZodIssueLiteralInvalidType
  // | $ZodIssueFileInvalidType
  | $ZodIssueFileTooBig
  | $ZodIssueFileTooSmall
  | $ZodIssueCustom;
// | $ZodCustomIssues;

export type $ZodNumericTooSmallIssues = $ZodIssueNumberTooSmall | $ZodIssueBigIntTooSmall | $ZodIssueDateTooSmall;

export type $ZodNumericTooBigIssues = $ZodIssueNumberTooBig | $ZodIssueBigIntTooBig | $ZodIssueDateTooBig;

export type $ZodSizeTooSmallIssues =
  | $ZodIssueArrayTooSmall
  | $ZodIssueSetTooSmall
  | $ZodIssueStringTooSmall
  | $ZodIssueFileTooSmall;

export type $ZodSizeTooBigIssues =
  | $ZodIssueArrayTooBig
  | $ZodIssueSetTooBig
  | $ZodIssueStringTooBig
  | $ZodIssueFileTooBig;

export type $ZodIssueData<T extends $ZodIssueBase = $ZodIssue> = (T extends infer U
  ? Omit<U, "message" | "path" | "level">
  : never) & {
  // input?: any;
  path?: PropertyKey[];
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
