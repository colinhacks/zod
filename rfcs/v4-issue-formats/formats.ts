type ZodParsedType = string;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}

export enum ZodIssueKind {
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

export enum ZodIssueCode {
  invalid_type = "invalid_type",
  invalid_literal = "invalid_literal",
  custom = "custom",
  invalid_union = "invalid_union",
  invalid_union_discriminator = "invalid_union_discriminator",
  invalid_enum_value = "invalid_enum_value",
  unrecognized_keys = "unrecognized_keys",
  invalid_arguments = "invalid_arguments",
  invalid_return_type = "invalid_return_type",
  invalid_date = "invalid_date",
  invalid_string = "invalid_string",
  too_small = "too_small",
  too_big = "too_big",
  invalid_intersection_types = "invalid_intersection_types",
  not_multiple_of = "not_multiple_of",
  not_finite = "not_finite",
}

// type ZodIssueCode = keyof typeof ZodIssueCode;

export type ZodIssueBase = {
  path: (string | number)[];
  message?: string;
  input?: unknown;
  code: ZodIssueCode[keyof ZodIssueCode];
  level: "warn" | "error" | "abort";
};

export type ZodInvalidTypeIssue = ZodIssueBase & {
  kind: ZodIssueKind.invalid_type;
  code: ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
};

export type ZodInvalidUnionIssue = ZodIssueBase & {
  kind: ZodIssueKind.invalid_union;
  code: ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
};

// type TooBig = { code: "too_big"; maximum: number };
// type TooBigInclusive = { code: "too_big"; maximum: number; inclusive: boolean };
// type TooSmall = { code: "too_small"; minimum: number };
// type TooSmallInclusive = {
//   code: "too_small";
//   minimum: number;
//   inclusive: boolean;
// };

export type ZodInvalidDateIssue = ZodIssueBase & {
  kind: ZodIssueCode.invalid_date;
} & (
    | { code: "too_big"; maximum: number; inclusive: boolean }
    | {
        code: "too_small";
        minimum: number;
        inclusive: boolean;
      }
  );

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

export type ZodInvalidStringIssue = ZodIssueBase &
  (
    | {
        code: "too_small";
        subcode: "number_too_small";
        minimum?: number;
      }
    | {
        kind: ZodIssueCode.invalid_string;
        code: "too_big";
        subcode: "number_too_big";
        maximum?: number;
      }
    | {
        kind: ZodIssueCode.invalid_string;
        code: "invalid_format";
        format: StringValidation;
        pattern?: string;
      }
    | {
        kind: ZodIssueCode.invalid_string;
        code: "invalid_format";
        format: "starts_with";
        value: string;
      }
    | {
        kind: ZodIssueCode.invalid_string;
        code: "invalid_format";
        format: "ends_with";
        value: string;
      }
    | {
        kind: ZodIssueCode.invalid_string;
        code: "invalid_format";
        format: "includes";
        value: string;
      }
  );

export type ZodInvalidObjectIssue = ZodIssueBase &
  (
    | {
        kind: ZodIssueCode.invalid_object;
        code: "missing_keys";
        keys?: string[];
      }
    | {
        kind: ZodIssueCode.invalid_object;
        code: "unrecognized_keys";
        keys?: string[];
      }
  );

export type ZodInvalidArrayIssue = ZodIssueBase &
  (
    | {
        kind: ZodIssueCode.invalid_array;
        code: "not_unique";
      }
    | {
        kind: ZodIssueCode.invalid_array;
        code: "too_big";
        maximum?: number;
      }
    | {
        kind: ZodIssueCode.invalid_array;
        code: "too_small";
        minimum?: number;
      }
  );

export type ZodInvalidNumberIssue = ZodIssueBase &
  (
    | {
        kind: ZodIssueCode.invalid_number;
        code: "too_big";

        maximum?: number;
        exclusive?: boolean;
      }
    | {
        kind: ZodIssueCode.invalid_number;
        code: "too_small";
        minimum?: number;
        exclusive?: boolean;
      }
    | {
        kind: ZodIssueCode.invalid_number;
        code: "not_multiple_of";
        multipleOf?: number;
      }
  );

export type ZodInvalidSetIssue = ZodIssueBase &
  (
    | {
        code: ZodIssueCode.invalid_set;
        code: "too_big";
        maximum?: number;
      }
    | {
        code: ZodIssueCode.invalid_set;
        code: "too_small";
        minimum?: number;
      }
    | {
        code: ZodIssueCode.invalid_set;
        code: "not_unique";
      }
  );

export interface ZodInvalidBigIntIssue extends ZodIssueBase {
  kind: ZodIssueCode.invalid_bigint;
  subcode: "too_big" | "too_small";
  minimum?: number;
  maximum?: number;
  exclusive?: boolean;
}

export type ZodInvalidFileIssue = ZodIssueBase & {
  type: ZodIssueCode.invalid_file;
} & (
    | {
        code: "too_big";
        maximum: number;
      }
    | {
        code: "too_small";
        minimum: number;
      }
    | {
        code: "invalid_mime";
        acceptedTypes: string[];
      }
    | {
        code: "invalid_name";
        expectedName?: string;
      }
  );

export interface ZodCustomIssue extends ZodIssueBase {
  code: ZodIssueCode.custom;
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
