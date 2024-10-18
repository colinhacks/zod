import type { $ZodSchemaTypes } from "./core.js";
import type * as types from "./types.js";

export interface $ZodIssueBase<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> {
  origin: Origin;
  level: "error" | "abort";
  path: PropertyKey[];
  message: string;
  input?: Input;
  [k: string]: unknown;
}

///////////////////////////////
////     COMMON ISSUES     ////
///////////////////////////////

export interface $ZodIssueInvalidType<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  // origin: Origin;
  code: "invalid_type";
  // input: unknown;
  received?: string;
  // received: $ZodParsedTypes;
  // allowable?: types.Primitive[];
}

export interface $ZodIssueTooBig<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "too_big";
  maximum: number;
  inclusive?: boolean;
}

export interface $ZodIssueTooSmall<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "too_small";
  minimum: number;
  inclusive?: boolean;
}

//////////////////////////////
////     NEVER ISSUES     ////
//////////////////////////////
// interface $ZodIssueNeverInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"never"> {}

///////////////////////////////
////     STRING ISSUES     ////
///////////////////////////////

// interface $ZodIssueStringInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"string"> {}

// interface $ZodIssueStringTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "string";
//   input: string;
//   code: "too_big";
//   maximum: number;
// }

// interface $ZodIssueStringTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "string";
//   input: string;
//   code: "too_small";
//   minimum: number;
// }

export interface $ZodIssueInvalidStringFormat
  extends $ZodIssueBase<"string", string> {
  code: "invalid_format";
  format: string;
  pattern?: string;
}

export type _RegularFormats =
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

export interface $ZodIssueStringCommonFormats
  extends $ZodIssueInvalidStringFormat {
  format: _RegularFormats;
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

///////////////////////////////
////     NUMBER ISSUES     ////
///////////////////////////////
// interface $ZodIssueNumberInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"number"> {}

// interface $ZodIssueNumberTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "number";
//   // format?: string | undefined;
//   input: number;
//   code: "too_big";
//   maximum: number;
//   inclusive: boolean;
// }

// interface $ZodIssueNumberTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "number";
//   // format?: string | undefined;
//   input: number;
//   code: "too_small";
//   minimum: number;
//   inclusive: boolean;
// }

export interface $ZodIssueNotMultipleOf<
  Origin extends "number" | "bigint" = "number" | "bigint",
  Input extends number | bigint = number | bigint,
> extends $ZodIssueBase<Origin, Input> {
  code: "not_multiple_of";
  divisor: number;
}

// export type $ZodNumberIssues =
// | $ZodIssueNumberInvalidType
// | $ZodIssueNumberTooBig
// | $ZodIssueNumberTooSmall
// | $ZodIssueNumberNotMultipleOf;

///////////////////////////////
////     BIGINT ISSUES     ////
///////////////////////////////
// interface $ZodIssueBigIntInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"bigint"> {}

// interface $ZodIssueBigIntTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "bigint";
//   input: bigint;
//   code: "too_big";
//   maximum: bigint;
//   inclusive: boolean;
// }

// interface $ZodIssueBigIntTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "bigint";
//   input: bigint;
//   code: "too_small";
//   minimum: bigint;
//   inclusive: boolean;
// }

// interface $ZodIssueBigIntNotMultipleOf<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "bigint";
//   input: bigint;
//   code: "not_multiple_of";
//   divisor: bigint;
// }

////////////////////////////////
////     BOOLEAN ISSUES     ////
////////////////////////////////
// interface $ZodIssueBooleanInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"boolean"> {}

////////////////////////////////
////     SYMBOL ISSUES      ////
////////////////////////////////
// interface $ZodIssueSymbolInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"symbol"> {}

////////////////////////////////
////      DATE ISSUES       ////
////////////////////////////////
// interface $ZodIssueDateInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"date"> {}

export interface $ZodIssueInvalidDate extends $ZodIssueBase<"date", Date> {
  // origin: "date";
  // input: Date;
  code: "invalid_date";
}

// interface $ZodIssueDateTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "date";
//   input: Date;
//   code: "too_small";
//   minimum: Date;
//   inclusive: boolean;
// }

// interface $ZodIssueDateTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "date";
//   input: Date;
//   code: "too_big";
//   maximum: Date;
//   inclusive: boolean;
// }

//////////////////////////////
////     ARRAY ISSUES     ////
//////////////////////////////
// interface $ZodIssueArrayInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"array"> {}

// interface $ZodIssueArrayTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "array";
//   input: unknown[];
//   code: "too_big";
//   maximum: number;
// }

// interface $ZodIssueArrayTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "array";
//   input: unknown[];
//   code: "too_small";
//   minimum: number;
// }

///////////////////////////////
////     OBJECT ISSUES     ////
///////////////////////////////
// interface $ZodIssueObjectInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"object"> {}

export interface $ZodIssueUnrecognizedKeys
  extends $ZodIssueBase<"object", Record<string, unknown>> {
  code: "unrecognized_keys";
  keys: string[];
}

//////////////////////////////
////     UNION ISSUES     ////
//////////////////////////////

export interface $ZodIssueInvalidUnion extends $ZodIssueBase<"union", unknown> {
  code: "invalid_union";
  errors: $ZodIssue[][];
}

////////////////////////////
////     MAP ISSUES     ////
////////////////////////////
// interface $ZodIssueMapInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"map"> {}

export interface $ZodIssueInvalidKey<
  Origin extends "map" | "record" = "map" | "record",
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_key";
  issues: $ZodIssue[];
}

export interface $ZodIssueInvalidValue<
  Origin extends "map" | "set" = "map" | "set",
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_value";
  key: unknown;
  issues: $ZodIssue[];
}

////////////////////////////
////     SET ISSUES     ////
////////////////////////////

// interface $ZodIssueSetInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"set"> {}

// interface $ZodIssueSetInvalidElement<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "set";
//   input: Set<unknown>;
//   code: "invalid_value";
//   value: unknown;
//   issues: $ZodIssue[];
// }

// interface $ZodIssueSetTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "set";
//   input: Set<unknown>;
//   code: "too_big";
//   maximum: number;
// }

// interface $ZodIssueSetTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "set";
//   input: Set<unknown>;
//   code: "too_small";
//   minimum: number;
// }

///////////////////////////////
////     RECORD ISSUES     ////
///////////////////////////////

// interface $ZodIssueRecordInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"record"> {}

// interface $ZodIssueRecordInvalidKey<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "record";
//   input: PropertyKey;
//   code: "invalid_key";
//   issues: $ZodIssue[];
// }

/////////////////////////////
////     ENUM ISSUES     ////
/////////////////////////////

export interface $ZodIssueInvalidEnum<
  Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
  Input = unknown,
> extends $ZodIssueBase<Origin, Input> {
  code: "invalid_enum";
  options: types.Primitive[];
}

//////////////////////////////////
////      LITERAL ISSUES      ////
//////////////////////////////////
// interface $ZodIssueLiteralInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"literal"> {
//   values: types.Primitive[];
// }

////////////////////////////////
////    FILE ISSUES          ////
////////////////////////////////
// interface $ZodIssueFileInvalidType<Origin extends $ZodSchemaTypes = $ZodSchemaTypes,Input = unknown> extends $ZodIssueInvalidType<"file"> {}

// interface $ZodIssueFileTooBig<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "file";
//   input: File;
//   code: "too_big";
//   maximum: number;
// }

// interface $ZodIssueFileTooSmall<
//   Origin extends $ZodSchemaTypes = $ZodSchemaTypes,
//   Input = unknown,
// > extends $ZodIssueBase<Origin, Input> {
//   origin: "file";
//   input: File;
//   code: "too_small";
//   minimum: number;
// }

//////////////////////////////
////     CUSTOM ISSUES    ////
//////////////////////////////
// user-defined custom issue sub-types
// interface $ZodConfigBase {
//   customIssues: object;
// }
// export interface $ZodConfig extends $ZodConfigBase {
// customIssues: { problem: "custom"; params?: { [k: string]: unknown } } | { problem: "test"; test: number };
// customIssues: unknown;
// }

export interface $ZodIssueCustom extends $ZodIssueBase<"custom", unknown> {
  code: "custom";
}
// export type $ZodCustomIssues = types.flatten<
//   $ZodIssueCustom & {
//     origin: "custom";
//   } & $ZodConfig["customIssues"]
// >;

///////////////////////////////////////////////////////////////////////

// export type {
//   $ZodIssueBase,
//   // $ZodIssueNeverInvalidType,
//   // $ZodIssueStringInvalidType,
//   $ZodIssueStringTooBig,
//   $ZodIssueStringTooSmall,
//   $ZodIssueInvalidStringFormat,
//   $ZodIssueStringInvalidRegex,
//   $ZodIssueStringInvalidJWT,
//   $ZodIssueStringStartsWith,
//   $ZodIssueStringEndsWith,
//   $ZodIssueStringIncludes,
//   // $ZodIssueNumberInvalidType,
//   $ZodIssueNumberTooBig,
//   $ZodIssueNumberTooSmall,
//   $ZodIssueNumberNotMultipleOf,
//   // $ZodIssueBigIntInvalidType,
//   $ZodIssueBigIntTooBig,
//   $ZodIssueBigIntTooSmall,
//   $ZodIssueBigIntNotMultipleOf,
//   // $ZodIssueBooleanInvalidType,
//   // $ZodIssueSymbolInvalidType,
//   // $ZodIssueDateInvalidType,
//   $ZodIssueDateInvalidDate,
//   $ZodIssueDateTooSmall,
//   $ZodIssueDateTooBig,
//   // $ZodIssueArrayInvalidType,
//   $ZodIssueArrayTooBig,
//   $ZodIssueArrayTooSmall,
//   // $ZodIssueObjectInvalidType,
//   $ZodIssueObjectUnrecognizedKeys,
//   $ZodIssueInvalidUnion,
//   // $ZodIssueMapInvalidType,
//   $ZodIssueMapInvalidKey,
//   $ZodIssueMapInvalidValue,
//   // $ZodIssueSetInvalidType,
//   $ZodIssueSetInvalidElement,
//   $ZodIssueSetTooBig,
//   $ZodIssueSetTooSmall,
//   $ZodIssueRecordInvalidKey,
//   $ZodIssueEnumInvalidValue,
//   // $ZodIssueLiteralInvalidType,
//   // $ZodIssueFileInvalidType,
//   $ZodIssueFileTooBig,
//   $ZodIssueFileTooSmall,
// };

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
  | $ZodIssueInvalidValue
  | $ZodIssueInvalidEnum
  | $ZodIssueCustom;

// export type $ZodNumericTooSmallIssues =
//   | $ZodIssueNumberTooSmall
//   | $ZodIssueBigIntTooSmall
//   | $ZodIssueDateTooSmall;

// export type $ZodNumericTooBigIssues =
//   | $ZodIssueNumberTooBig
//   | $ZodIssueBigIntTooBig
//   | $ZodIssueDateTooBig;

// export type $ZodSizeTooSmallIssues =
//   | $ZodIssueArrayTooSmall
//   | $ZodIssueSetTooSmall
//   | $ZodIssueStringTooSmall
//   | $ZodIssueFileTooSmall;

// export type $ZodSizeTooBigIssues =
//   | $ZodIssueArrayTooBig
//   | $ZodIssueSetTooBig
//   | $ZodIssueStringTooBig
//   | $ZodIssueFileTooBig;

export type $ZodIssueData<T extends $ZodIssueBase = $ZodIssue> = T extends any
  ? _$ZodIssueData<T>
  : never;

type ComputedIssueDataPieces<In> = {
  path?: PropertyKey[] | undefined;
  level?: "error" | "abort" | undefined;
  message?: string | undefined;
  input: In;
};

export type _$ZodIssueData<T extends $ZodIssueBase> = Omit<
  types.OmitIndex<T>,
  "message" | "path" | "level" | "input"
> &
  ComputedIssueDataPieces<T["input"]> &
  types.ExtractIndex<T>;

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
