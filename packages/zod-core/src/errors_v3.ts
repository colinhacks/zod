type ZodParsedType = string;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}
type flatten<T> = { [k in keyof T]: T[k] } & {};

type ZodCheckCode =
  | "type"
  | "string_format"
  | "regex"
  | "starts_with"
  | "ends_with"
  | "includes"
  | "min_size"
  | "max_size"
  | "size_equals"
  | "less_than"
  | "less_than_or_equal"
  | "greater_than"
  | "greater_than_or_equal"
  | "equals"
  | "not_multiple_of"
  | "unrecognized_keys";

export type ZodIssueBase = {
  level: "warn" | "error" | "abort";
  check: ZodCheckCode;
  path: (string | number)[];
  message?: string;
  input?: unknown;
};

export type ZodInvalidTypeIssue = ZodIssueBase & {
  check: "type";
} & (
    | {
        expected: ZodParsedType;
        received: ZodParsedType;
      }
    | {
        expected: "union";
        unionErrors: ZodError[];
      }
    | {
        expected: "literal";
        literalValues: Primitive[];
      }
    | {
        expected: "enum";
        enumValues: (string | number)[];
      }
  );

export type ZodStringFormatIssue = ZodIssueBase & {
  check: "string_format";
} & (
    | { format: "email" }
    | { format: "url" }
    | { format: "emoji" }
    | { format: "uuid" }
    | { format: "nanoid" }
    | { format: "regex" }
    | { format: "cuid" }
    | { format: "cuid2" }
    | { format: "ulid" }
    | { format: "datetime" }
    | { format: "date" }
    | { format: "time" }
    | { format: "duration" }
    | { format: "ip" }
    | { format: "base64" }
  );
export type $StringFormat = ZodStringFormatIssue["format"];

export type ZodRegexIssue = ZodIssueBase & {
  check: "regex";
  regex: string;
};

export type ZodStartsWithIssue = ZodIssueBase & {
  check: "starts_with";
  value: string;
};

export type ZodEndsWithIssue = ZodIssueBase & {
  check: "ends_with";
  value: string;
};

export type ZodIncludesIssue = ZodIssueBase & {
  check: "includes";
  value: string;
};

export type ZodMinSizeIssue = ZodIssueBase & {
  check: "min_size";
  domain: "string" | "array" | "set" | "file";
  minimum: number;
};

export type ZodMaxSizeIssue = ZodIssueBase & {
  check: "max_size";
  domain: "string" | "array" | "set" | "file";
  maximum: number;
};

export type ZodSizeIssue = ZodIssueBase & {
  check: "size_equals";
  domain: "string" | "array" | "set" | "file";
  size: number;
};

export type ZodLessThanIssue = ZodIssueBase & {
  check: "less_than";
  maximum: number;
  domain: "number" | "bigint" | "date";
};

export type ZodLessThanOrEqualIssue = ZodIssueBase & {
  check: "less_than_or_equal";
  maximum: number;
};

export type ZodGreaterThanIssue = ZodIssueBase & {
  check: "greater_than";
  minimum: number;
};

export type ZodGreaterThanOrEqualIssue = ZodIssueBase & {
  check: "greater_than_or_equal";
  minimum: number;
};

export type ZodEqualsIssue = ZodIssueBase & {
  check: "equals";
  value: number;
};

export type ZodNotMultipleOfIssue = ZodIssueBase & {
  check: "not_multiple_of";
  multipleOf: number;
};

export type ZodUnrecognizedKeysIssue = ZodIssueBase & {
  check: "no_unrecognized_keys";
  keys: string[];
};

export interface ZodCustomIssues {
  custom: { params?: { [k: string]: any } };
}

type _ZodCustomIssue<T extends keyof ZodCustomIssues = keyof ZodCustomIssues> =
  T extends keyof ZodCustomIssues
    ? flatten<{ check: T } & ZodCustomIssues[T]>
    : never;
type ZodCustomIssue = ZodIssueBase & _ZodCustomIssue;

export type ZodIssue =
  | ZodInvalidTypeIssue
  | ZodStringFormatIssue
  | ZodRegexIssue
  | ZodStartsWithIssue
  | ZodEndsWithIssue
  | ZodIncludesIssue
  | ZodMinSizeIssue
  | ZodMaxSizeIssue
  | ZodSizeIssue
  | ZodLessThanIssue
  | ZodLessThanOrEqualIssue
  | ZodGreaterThanIssue
  | ZodGreaterThanOrEqualIssue
  | ZodEqualsIssue
  | ZodNotMultipleOfIssue
  | ZodUnrecognizedKeysIssue
  | ZodCustomIssue;
