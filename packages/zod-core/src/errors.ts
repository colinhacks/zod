import type { $ZodType, input, output } from "./core.js";
import defaultErrorMap from "./locales/en.js";
import type { ParseContext, ZodParsedType } from "./parse.js";
import type { Primitive } from "./types.js";
import { jsonStringifyReplacer } from "./util.js";

type allKeys<T> = T extends any ? keyof T : never;

export type inferFlattenedErrors<
  T extends $ZodType,
  U = string,
> = typeToFlattenedError<input<T>, U>;
export type typeToFlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in allKeys<T>]?: U[];
  };
};

export const ZodIssueCode = {
  invalid_type: "invalid_type",
  invalid_literal: "invalid_literal",
  custom: "custom",
  invalid_union: "invalid_union",
  invalid_union_discriminator: "invalid_union_discriminator",
  invalid_enum_value: "invalid_enum_value",
  unrecognized_keys: "unrecognized_keys",
  invalid_arguments: "invalid_arguments",
  invalid_return_type: "invalid_return_type",
  invalid_date: "invalid_date",
  invalid_string: "invalid_string",
  too_small: "too_small",
  too_big: "too_big",
  invalid_intersection_types: "invalid_intersection_types",
  not_multiple_of: "not_multiple_of",
  not_finite: "not_finite",
  not_unique: "not_unique",
  invalid_file_type: "invalid_file_type",
  invalid_file_name: "invalid_file_name",
} as const;
export type ZodIssueCode = (typeof ZodIssueCode)[keyof typeof ZodIssueCode];

export interface ZodIssueBase {
  path: (string | number)[];
  message?: string;
}

export interface ZodIssueCore {
  input: unknown;
  code: ZodIssueCode;
  path: (string | number)[];
  message: string;
  // fatal: boolean;
  level: "warn" | "error" | "abort";
}

export interface ZodIssueInvalidType extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export interface ZodIssueInvalidLiteral extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_literal;
  expected: unknown;
  received: unknown;
}

export interface ZodIssueUnrecognizedKeys extends ZodIssueCore {
  code: typeof ZodIssueCode.unrecognized_keys;
  keys: string[];
}

export interface ZodIssueInvalidUnion extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}

export interface ZodIssueInvalidUnionDiscriminator extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_union_discriminator;
  options: Primitive[];
}

export interface ZodIssueInvalidEnumValue extends ZodIssueCore {
  received: string | number;
  code: typeof ZodIssueCode.invalid_enum_value;
  options: (string | number)[];
}

export interface ZodIssueInvalidArguments extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_arguments;
  argumentsError: ZodError;
}

export interface ZodIssueInvalidReturnType extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_return_type;
  returnTypeError: ZodError;
}

export interface ZodIssueInvalidDate extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_date;
}

export type StringValidation =
  | "email"
  | "url"
  | "jwt"
  | "json"
  | "emoji"
  | "uuid"
  | "nanoid"
  | "guid"
  | "regex"
  | "cuid"
  | "cuid2"
  | "ulid"
  | "xid"
  | "ksuid"
  | "datetime"
  | "date"
  | "time"
  | "duration"
  | "ip"
  | "base64"
  | "e164"
  | { includes: string; position?: number }
  | { startsWith: string }
  | { endsWith: string };

export interface ZodIssueInvalidString extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_string;
  validation: StringValidation;
}

export interface ZodIssueTooSmall extends ZodIssueCore {
  code: typeof ZodIssueCode.too_small;
  minimum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: "array" | "string" | "number" | "set" | "date" | "bigint" | "file";
}

export interface ZodIssueTooBig extends ZodIssueCore {
  code: typeof ZodIssueCode.too_big;
  maximum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: "array" | "string" | "number" | "set" | "date" | "bigint" | "file";
}

export interface ZodIssueInvalidIntersectionTypes extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_intersection_types;
  mergeErrorPath: (string | number)[];
}

export interface ZodIssueNotMultipleOf extends ZodIssueCore {
  code: typeof ZodIssueCode.not_multiple_of;
  multipleOf: number | bigint;
}

export interface ZodIssueNotFinite extends ZodIssueCore {
  code: typeof ZodIssueCode.not_finite;
}

export interface ZodIssueNotUnique<T = unknown> extends ZodIssueCore {
  code: typeof ZodIssueCode.not_unique;
  duplicates?: Array<T>;
}

export interface ZodIssueInvalidFileType extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_file_type;
  expected: string[];
  received: string;
}

export interface ZodIssueInvalidFileName extends ZodIssueCore {
  code: typeof ZodIssueCode.invalid_file_name;
}

export interface ZodIssueCustom extends ZodIssueCore {
  code: typeof ZodIssueCode.custom;
  params?: { [k: string]: any };
}

export type DenormalizedError = { [k: string]: DenormalizedError | string[] };

export interface ZodIssues {
  InvalidType: ZodIssueInvalidType;
  InvalidLiteral: ZodIssueInvalidLiteral;
  UnrecognizedKeys: ZodIssueUnrecognizedKeys;
  InvalidUnion: ZodIssueInvalidUnion;
  InvalidUnionDiscriminator: ZodIssueInvalidUnionDiscriminator;
  InvalidEnumValue: ZodIssueInvalidEnumValue;
  InvalidArguments: ZodIssueInvalidArguments;
  InvalidReturnType: ZodIssueInvalidReturnType;
  InvalidDate: ZodIssueInvalidDate;
  InvalidString: ZodIssueInvalidString;
  TooSmall: ZodIssueTooSmall;
  TooBig: ZodIssueTooBig;
  InvalidIntersectionTypes: ZodIssueInvalidIntersectionTypes;
  NotMultipleOf: ZodIssueNotMultipleOf;
  NotFinite: ZodIssueNotFinite;
  NotUnique: ZodIssueNotUnique;
  InvalidFileType: ZodIssueInvalidFileType;
  InvalidFileName: ZodIssueInvalidFileName;
  Custom: ZodIssueCustom;
}

export type ZodIssue = ZodIssues[keyof ZodIssues];

export type ZodErrorMapInput<T = ZodIssue> = T extends ZodIssueBase
  ? Omit<T, "message" | "fatal" | "level"> & {
      message?: string;
      fatal?: boolean;
      level?: "warn" | "error" | "abort";
    }
  : never;
export type ZodIssueOptionalMessage = ZodErrorMapInput;

type recursiveZodFormattedError<T> = T extends [any, ...any[]]
  ? { [K in keyof T]?: ZodFormattedError<T[K]> }
  : T extends any[]
    ? { [k: number]: ZodFormattedError<T[number]> }
    : T extends object
      ? { [K in keyof T]?: ZodFormattedError<T[K]> }
      : unknown;

export type ZodFormattedError<T, U = string> = {
  _errors: U[];
} & recursiveZodFormattedError<NonNullable<T>>;

export type inferFormattedError<
  T extends $ZodType,
  U = string,
> = ZodFormattedError<output<T>, U>;

export class ZodError<T = any> extends Error {
  issues: ZodIssue[] = [];

  get errors(): ZodIssue[] {
    return this.issues;
  }

  constructor(issues: ZodIssue[]) {
    super();

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }

  format(): ZodFormattedError<T>;
  format<U>(mapper: (issue: ZodIssue) => U): ZodFormattedError<T, U>;
  format(_mapper?: any) {
    const mapper: (issue: ZodIssue) => any =
      _mapper || ((issue: ZodIssue) => issue.message);
    const fieldErrors: ZodFormattedError<T> = { _errors: [] } as any;
    const processError = (error: ZodError) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
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
              // if (typeof el === "string") {
              //   curr[el] = curr[el] || { _errors: [] };
              // } else if (typeof el === "number") {
              //   const errorArray: any = [];
              //   errorArray._errors = [];
              //   curr[el] = curr[el] || errorArray;
              // }
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

    processError(this);
    return fieldErrors;
  }

  static create(issues: ZodIssue[]): ZodError<any> {
    const error = new ZodError(issues);
    return error;
  }

  static assert(value: unknown): asserts value is ZodError {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }

  override toString(): string {
    return this.message;
  }
  override get message(): string {
    return JSON.stringify(this.issues, jsonStringifyReplacer, 2);
  }

  get isEmpty(): boolean {
    return this.issues.length === 0;
  }

  addIssue = (sub: ZodIssue): void => {
    this.issues = [...this.issues, sub];
  };

  addIssues = (subs: ZodIssue[] = []): void => {
    this.issues = [...this.issues, ...subs];
  };

  flatten(): typeToFlattenedError<T>;
  flatten<U>(mapper?: (issue: ZodIssue) => U): typeToFlattenedError<T, U>;
  flatten<U = string>(
    mapper: (issue: ZodIssue) => U = (issue: ZodIssue) => issue.message as any
  ): any {
    const fieldErrors: any = {};
    const formErrors: U[] = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }

  get formErrors(): typeToFlattenedError<T> {
    return this.flatten();
  }
}

export type IssueData<T extends ZodIssueCore = ZodIssue> = T extends infer U
  ? Omit<U, "path" | "level" | "message"> & {
      // input?: any;
      path?: (string | number)[];
      // fatal?: boolean;
      level?: "warn" | "error" | "abort";
      message?: string;
    }
  : never;

export type ErrorMapCtx = {
  defaultError: string;
  data: any;
};

export type ZodErrorMap = (
  issue: ZodErrorMapInput,
  _ctx: ErrorMapCtx
) => { message: string };

export class ZodTemplateLiteralUnsupportedTypeError extends Error {
  constructor() {
    super("Unsupported zod type!");

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = "ZodTemplateLiteralUnsupportedTypeError";
  }
}

export class ZodTemplateLiteralUnsupportedCheckError extends Error {
  constructor(typeKind: string /*ZodFirstPartyTypeKind*/, check: string) {
    super(
      `${typeKind}'s "${check}" check is not supported in template literals!`
    );

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = "ZodTemplateLiteralUnsupportedCheckError";
  }
}

let overrideErrorMap = defaultErrorMap;
export { defaultErrorMap };

export function setErrorMap(map: ZodErrorMap): void {
  overrideErrorMap = map;
}

export function getErrorMap(): ZodErrorMap {
  return overrideErrorMap;
}

export const makeIssue = (
  issueData: IssueData,
  ctx: ParseContext
): ZodIssue => {
  const { basePath, contextualErrorMap, schemaErrorMap } = ctx;
  const fullPath = [...basePath, ...(issueData.path || [])];
  const fullIssue = {
    ...issueData,
    // fatal: issueData.fatal ?? false,
    level: issueData.level ?? "error",
    path: fullPath,
  };

  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message,
      // fatal: issueData.fatal ?? false,
      level: issueData.level ?? "error",
    };
  }

  const errorMaps = [
    contextualErrorMap,
    schemaErrorMap,
    getErrorMap(),
    defaultErrorMap,
  ].filter((x) => !!x) as ZodErrorMap[];

  let errorMessage = "";
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse() as ZodErrorMap[];
  for (const map of maps) {
    errorMessage = map(fullIssue, {
      data: issueData.input,
      defaultError: errorMessage,
    }).message;
  }

  return {
    ...issueData,
    path: fullPath,
    // fatal: issueData.fatal ?? false,
    level: issueData.level ?? "error",
    message: errorMessage,
  };
};

export function issuesToZodError(
  ctx: ParseContext,
  issues: IssueData[]
): ZodError {
  return new ZodError(issues.map((issue) => makeIssue(issue, ctx)));
}

export type CustomErrorParams = Partial<Omit<ZodIssueCustom, "code">>;
