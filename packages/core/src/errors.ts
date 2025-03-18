import type { $ZodCheck } from "./checks.js";
import type { $ZodType } from "./schemas.js";
import type * as util from "./util.js";
import { jsonStringifyReplacer } from "./util.js";

///////////////////////////
////     base type     ////
///////////////////////////
export interface $ZodIssueBase {
  code?: string;
  input?: unknown;
  path: PropertyKey[];
  message: string;
  // [k: string]: unknown;
}

////////////////////////////////
////     issue subtypes     ////
////////////////////////////////
export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
  code: "invalid_type";
  expected: $ZodType["_zod"]["def"]["type"];
  input: Input;
}

export interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
  code: "too_big";
  origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  maximum: number | bigint;
  inclusive?: boolean;
  input: Input;
}

export interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
  code: "too_small";
  origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  minimum: number | bigint;
  inclusive?: boolean;
  input: Input;
}

export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
  code: "invalid_format";
  format: string;
  pattern?: string;
  input: string;
}

export interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
  code: "not_multiple_of";
  divisor: number;
  input: Input;
}

// export interface $ZodIssueInvalidDate extends $ZodIssueBase {
//   code: "invalid_date";
//   input: Date;
// }

export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
  code: "unrecognized_keys";
  keys: string[];
  input: Record<string, unknown>;
}

export interface $ZodIssueInvalidUnion extends $ZodIssueBase {
  code: "invalid_union";
  errors: $ZodIssue[][];
  input: unknown;
}

export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
  code: "invalid_key";
  origin: "map" | "record";
  issues: $ZodIssue[];
  input: Input;
}

export interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
  code: "invalid_element";
  origin: "map" | "set";
  key: unknown;
  issues: $ZodIssue[];
  input: Input;
}

export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
  code: "invalid_value";
  values: util.Primitive[];
  input: Input;
}

export interface $ZodIssueCustom extends $ZodIssueBase {
  code?: "custom";
  params?: Record<string, any> | undefined;
  input: unknown;
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

export type $ZodStringFormatIssues =
  | $ZodIssueStringCommonFormats
  | $ZodIssueStringInvalidRegex
  | $ZodIssueStringInvalidJWT
  | $ZodIssueStringStartsWith
  | $ZodIssueStringEndsWith
  | $ZodIssueStringIncludes;

export type $ZodStringFormats = $ZodStringFormatIssues["format"];

////////////////////////
////     utils     /////
////////////////////////

export type $ZodIssue =
  | $ZodIssueInvalidType
  | $ZodIssueTooBig
  | $ZodIssueTooSmall
  | $ZodIssueInvalidStringFormat
  | $ZodIssueNotMultipleOf
  // | $ZodIssueInvalidDate
  | $ZodIssueUnrecognizedKeys
  | $ZodIssueInvalidUnion
  | $ZodIssueInvalidKey
  | $ZodIssueInvalidElement
  | $ZodIssueInvalidValue
  | $ZodIssueCustom;

export type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
type RawIssue<T extends $ZodIssueBase> = util.Flatten<
  util.MakePartial<T, "message" | "path"> & {
    def?: never;
    inst?: $ZodType | $ZodCheck;
    continue?: boolean | undefined;
    input?: unknown;
  } & Record<string, any>
>;

export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
  // biome-ignore lint:
  (issue: $ZodRawIssue<T>): { message: string } | string | undefined | null;
}

////////////////////////    ERROR CLASS   ////////////////////////

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError<T = unknown> implements Error {
  /** @deprecated Virtual property, do not access. */
  _zod!: { type: T };
  public issues: $ZodIssue[];
  name!: string;
  stack?: string;

  get message(): string {
    return JSON.stringify(this.issues, jsonStringifyReplacer, 2);
  }

  constructor(issues: $ZodIssue[]) {
    Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
    Object.defineProperty(this, "name", { value: "$ZodError", enumerable: false });
    this.issues = issues;
  }

  // @ts-ignore
  static [Symbol.hasInstance](inst: any) {
    return inst?._tag === ZOD_ERROR;
  }

  static assert(value: unknown): asserts value is $ZodError {
    if (!(value instanceof $ZodError)) {
      throw new Error(`Not a $ZodError: ${value}`);
    }
  }
}

///////////////////    ERROR UTILITIES   ////////////////////////

// flatten
export type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
type _FlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in keyof T]?: U[];
  };
};

export function flattenError<T>(error: $ZodError<T>): _FlattenedError<T>;
export function flattenError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): _FlattenedError<T, U>;
export function flattenError(error: $ZodError, mapper = (issue: $ZodIssue) => issue.message): any {
  const fieldErrors: any = {};
  const formErrors: any[] = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}

export type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
  ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
  : T extends any[]
    ? { [k: number]: $ZodFormattedError<T[number], U> }
    : T extends object
      ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
      : any;

export type $ZodFormattedError<T, U = string> = {
  _errors: U[];
} & util.Flatten<_ZodFormattedError<T, U>>;

export function formatError<T>(error: $ZodError<T>): $ZodFormattedError<T>;
export function formatError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): $ZodFormattedError<T, U>;
export function formatError<T>(error: $ZodError, _mapper?: any) {
  const mapper: (issue: $ZodIssue) => any =
    _mapper ||
    function (issue: $ZodIssue) {
      return issue.message;
    };
  const fieldErrors: $ZodFormattedError<T> = { _errors: [] } as any;
  const processError = (error: { issues: $ZodIssue[] }) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union") {
        issue.errors.map((issues) => processError({ issues }));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues });
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues });
      } else if (issue.path.length === 0) {
        (fieldErrors as any)._errors.push(mapper(issue));
      } else {
        let curr: any = fieldErrors;
        let i = 0;
        while (i < issue.path.length) {
          const el = issue.path[i];
          const terminal = i === issue.path.length - 1;

          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue));
          }

          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}
