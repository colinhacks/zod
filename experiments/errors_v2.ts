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
  level: "warn" | "error" | "abort";
  check: string;
  path: (string | number)[];
  domain?: string;
  message?: string;
  input?: unknown;
};

export type ZodInvalidTypeIssue = ZodIssueBase & {
  domain: "type";
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
  domain: "string";
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
  domain: "number";
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
  domain: "date";
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
  domain: "bigint";
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
  domain: "object";
} & {
  check: "unrecognized_keys";
  keys: string[];
};

export type ZodInvalidArrayIssue = ZodIssueBase & {
  domain: "array";
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
  domain: "set";
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
        check: "items";
        size: number;
      }
  );

export type ZodInvalidFileIssue = ZodIssueBase & {
  domain: "file";
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

type _ZodCustomIssue<T extends keyof ZodCustomIssues = keyof ZodCustomIssues> = T extends keyof ZodCustomIssues
  ? flatten<{ check: T } & ZodCustomIssues[T]>
  : never;
type ZodCustomIssue = ZodIssueBase & _ZodCustomIssue;

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
