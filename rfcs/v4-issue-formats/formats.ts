type ZodParsedType = string;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}

export enum ZodIssueCode {
  invalid_type = "invalid_type",
  custom = "custom",
  invalid_union = "invalid_union",
  invalid_date = "invalid_date",
  invalid_string = "invalid_string",
  invalid_array = "invalid_array",
  invalid_number = "invalid_number",
  invalid_set = "invalid_set",
  invalid_object = "invalid_object",
  invalid_bigint = "invalid_bigint",
  invalid_file = "invalid_file",
}

export type ZodIssueBase = {
  path: (string | number)[];
  message?: string;
  input?: unknown;
  code: ZodIssueCode;
  level: "warn" | "error" | "abort";
};

export interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}

export interface ZodInvalidDateIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_date;
  subcode: "too_big" | "too_small";
  minimum?: number;
  maximum?: number;
  exclusive?: boolean;
}

// there will be some additions here
export type StringValidation =
  | "email"
  | "url"
  | "emoji"
  | "uuid"
  | "nanoid"
  | "regex"
  | "cuid"
  | "cuid2"
  | "ulid"
  | "datetime"
  | "date"
  | "time"
  | "duration"
  | "ip"
  | "base64";

export interface ZodInvalidStringIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_string;
  subcode: "too_small" | "too_big" | "invalid_format";
  format?: StringValidation;
  pattern?: string;
  startsWith?: string;
  endsWith?: string;
  includes?: string;
}

export interface ZodInvalidObjectIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_object;
  subcode: "unrecognized_keys" | "missing_keys";
  unrecognizedKeys?: string[];
  missingKeys?: string[];
}

export interface ZodInvalidArrayIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_array;
  subcode: "too_big" | "too_small" | "not_unique";
  minimum?: number;
  maximum?: number;
}

export interface ZodInvalidNumberIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_number;
  subcode: "too_big" | "too_small" | "not_integer" | "not_multiple_of";
  minimum?: number;
  maximum?: number;
  exclusive?: boolean;
  multipleOf?: number;
}

export interface ZodInvalidSetIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_set;
  subcode: "too_big" | "too_small" | "not_unique";
  minimum?: number;
  maximum?: number;
}

export interface ZodInvalidBigIntIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_bigint;
  subcode: "too_big" | "too_small";
  minimum?: number;
  maximum?: number;
  exclusive?: boolean;
}

export interface ZodInvalidFileIssue extends ZodIssueBase {
  code: ZodIssueCode.invalid_file;
  subcode: "too_big" | "too_small" | "invalid_mime" | "invalid_name";
  minimum?: number;
  maximum?: number;
  acceptedTypes?: string[];
  name?: string;
}

export interface ZodCustomIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.custom;
  params?: { [k: string]: any };
}

export type ZodIssue =
  | ZodInvalidTypeIssue
  | ZodInvalidUnionIssue
  | ZodInvalidStringIssue
  | ZodInvalidArrayIssue
  | ZodInvalidNumberIssue
  | ZodInvalidSetIssue
  | ZodInvalidObjectIssue
  | ZodInvalidBigIntIssue
  | ZodInvalidFileIssue
  | ZodCustomIssue;
