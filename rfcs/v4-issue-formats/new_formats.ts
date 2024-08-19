type ZodParsedType = string;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}
type flatten<T> = { [k in keyof T]: T[k] } & {};

export const ZodIssueCode = {
  custom: "custom",
  invalid_type: "invalid_type",
  invalid_string: "invalid_string",
  invalid_number: "invalid_number",
  invalid_date: "invalid_date",
  invalid_bigint: "invalid_bigint",
  invalid_object: "invalid_object",
  invalid_array: "invalid_array",
  invalid_set: "invalid_set",
  invalid_file: "invalid_file",
} as const;
export type ZodIssueCode = typeof ZodIssueCode;

export type ZodIssueBase = {
  path: (string | number)[];
  message?: string;
  input?: unknown;
  code: string;
  level: "warn" | "error" | "abort";
};

export type ZodInvalidTypeIssue = ZodIssueBase & {
  code: "invalid_type";
} & (
    | {
        check: ZodParsedType;
        received: ZodParsedType;
      }
    | {
        check: "union";
        unionErrors: ZodError[];
      }
    | {
        check: "literal";
        literalValues: Primitive[];
      }
    | {
        check: "enum";
        enumValues: (string | number)[];
      }
  );

export type $StringFormat =
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

export type ZodInvalidStringIssue = ZodIssueBase & {
  code: "invalid_string";
} & (
    | {
        check: $StringFormat;
      }
    | {
        check: "starts_with";
        value: string;
      }
    | {
        check: "ends_with";
        value: string;
      }
    | {
        check: "includes";
        value: string;
      }
    | {
        check: "min_size";
        minimum: number;
      }
    | {
        check: "max_size";
        maximum: number;
      }
    | {
        check: "size";
        size: number;
      }
    | {
        check: "regex";
        regex: string;
      }
  );

export type ZodInvalidNumberIssue = ZodIssueBase & {
  code: "invalid_number";
} & (
    | {
        check: "maximum";
        maximum: number;
      }
    | {
        check: "minimum";
        minimum: number;
      }
    | {
        check: "not_multiple_of";
        multipleOf: number;
      }
  );

export type ZodInvalidDateIssue = ZodIssueBase & {
  code: "invalid_date";
} & (
    | {
        check: "maximum";
        maximum: number;
      }
    | {
        check: "minimum";
        minimum: number;
      }
  );

export type ZodInvalidBigIntIssue = ZodIssueBase & {
  code: "invalid_bigint";
} & (
    | {
        check: "maximum";
        maximum: bigint;
      }
    | {
        check: "minimum";
        minimum: bigint;
      }
    | {
        check: "not_multiple_of";
        multipleOf: bigint;
      }
  );

export type ZodInvalidObjectIssue = ZodIssueBase & {
  code: "invalid_object";
} & {
  check: "unrecognized_keys";
  keys: string[];
};

export type ZodInvalidArrayIssue = ZodIssueBase & {
  code: "invalid_array";
} & (
    | {
        check: "min_size";
        minimum: number;
      }
    | {
        check: "max_size";
        maximum: number;
      }
    | {
        check: "size";
        size: number;
      }
  );

export type ZodInvalidSetIssue = ZodIssueBase & {
  code: "invalid_set";
} & (
    | {
        check: "min_size";
        minimum: number;
      }
    | {
        check: "max_size";
        maximum: number;
      }
    | {
        check: "size";
        size: number;
      }
  );

export type ZodInvalidFileIssue = ZodIssueBase & {
  code: "invalid_file";
} & (
    | {
        check: "min_size";
        minimum: number;
      }
    | {
        check: "max_size";
        maximum: number;
      }
  );

export interface ZodCustomIssues {
  custom: { params?: { [k: string]: any } };
  // test: { name: "string" }
}

type _ZodCustomIssue<T extends keyof ZodCustomIssues = keyof ZodCustomIssues> =
  T extends keyof ZodCustomIssues
    ? flatten<{ check: T } & ZodCustomIssues[T]>
    : never;
type ZodCustomIssue = ZodIssueBase & { code: "custom" } & _ZodCustomIssue;

export type ZodIssue =
  | ZodInvalidTypeIssue
  | ZodInvalidStringIssue
  | ZodInvalidNumberIssue
  | ZodInvalidBigIntIssue
  | ZodInvalidDateIssue
  | ZodInvalidArrayIssue
  | ZodInvalidSetIssue
  | ZodInvalidObjectIssue
  | ZodInvalidFileIssue
  | ZodCustomIssue;
