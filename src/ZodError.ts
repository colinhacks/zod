import { ZodParsedType } from "./helpers/parseUtil";
import { util } from "./helpers/util";

export const ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "custom",
  "invalid_union",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
]);

export type ZodIssueCode = keyof typeof ZodIssueCode;

export type ZodIssueBase = {
  path: (string | number)[];
  // code: ZodIssueCode;
  message?: string;
};

export interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.unrecognized_keys;
  keys: string[];
}

export interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}

export interface ZodInvalidEnumValueIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_enum_value;
  options: (string | number)[];
}

export interface ZodInvalidArgumentsIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_arguments;
  argumentsError: ZodError;
}

export interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_return_type;
  returnTypeError: ZodError;
}

export interface ZodInvalidDateIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_date;
}

export type StringValidation = "email" | "url" | "uuid" | "regex" | "cuid";

export interface ZodInvalidStringIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_string;
  validation: StringValidation;
}

export interface ZodTooSmallIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_small;
  minimum: number;
  inclusive: boolean;
  type: "array" | "string" | "number";
}

export interface ZodTooBigIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_big;
  maximum: number;
  inclusive: boolean;
  type: "array" | "string" | "number";
}

export interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_intersection_types;
}

export interface ZodNotMultipleOfIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.not_multiple_of;
  multipleOf: number;
}

export interface ZodCustomIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.custom;
  params?: { [k: string]: any };
}

export type DenormalizedError = { [k: string]: DenormalizedError | string[] };

export type ZodIssueOptionalMessage =
  | ZodInvalidTypeIssue
  | ZodUnrecognizedKeysIssue
  | ZodInvalidUnionIssue
  | ZodInvalidEnumValueIssue
  | ZodInvalidArgumentsIssue
  | ZodInvalidReturnTypeIssue
  | ZodInvalidDateIssue
  | ZodInvalidStringIssue
  | ZodTooSmallIssue
  | ZodTooBigIssue
  | ZodInvalidIntersectionTypesIssue
  | ZodNotMultipleOfIssue
  | ZodCustomIssue;

export type ZodIssue = ZodIssueOptionalMessage & { message: string };

export const quotelessJson = (obj: any) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

export type ZodFormattedError<T> = {
  _errors: string[];
} & (T extends [any, ...any[]]
  ? { [K in keyof T]?: ZodFormattedError<T[K]> }
  : T extends any[]
  ? ZodFormattedError<T[number]>[]
  : T extends object
  ? { [K in keyof T]?: ZodFormattedError<T[K]> }
  : unknown);

export class ZodError<T = any> extends Error {
  issues: ZodIssue[] = [];

  get errors() {
    return this.issues;
  }

  constructor(issues: ZodIssue[]) {
    super();

    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      // eslint-disable-next-line ban/ban
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }

  format = (): ZodFormattedError<T> => {
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
          (fieldErrors as any)._errors.push(issue.message);
        } else {
          let curr: any = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;

            if (!terminal) {
              if (typeof el === "string") {
                curr[el] = curr[el] || { _errors: [] };
              } else if (typeof el === "number") {
                const errorArray: any = [];
                errorArray._errors = [];
                curr[el] = curr[el] || errorArray;
              }
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(issue.message);
            }

            curr = curr[el];
            i++;
          }
        }
      }
    };

    processError(this);
    return fieldErrors;
  };

  static create = (issues: ZodIssue[]) => {
    const error = new ZodError(issues);
    return error;
  };

  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, null, 2);
  }

  get isEmpty(): boolean {
    return this.issues.length === 0;
  }

  addIssue = (sub: ZodIssue) => {
    this.issues = [...this.issues, sub];
  };

  addIssues = (subs: ZodIssue[] = []) => {
    this.issues = [...this.issues, ...subs];
  };

  flatten = <U = string>(
    mapper: (issue: ZodIssue) => U = (issue: ZodIssue) => issue.message as any
  ): {
    formErrors: U[];
    fieldErrors: { [k: string]: U[] };
  } => {
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
  };

  get formErrors() {
    return this.flatten();
  }
}

type stripPath<T extends object> = T extends any
  ? util.OmitKeys<T, "path">
  : never;

export type IssueData = stripPath<ZodIssueOptionalMessage> & {
  path?: (string | number)[];
  fatal?: boolean;
};
export type MakeErrorData = IssueData;

type ErrorMapCtx = {
  defaultError: string;
  data: any;
};

export type ZodErrorMap = typeof defaultErrorMap;
export const defaultErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
): { message: string } => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${issue.keys
        .map((k) => `'${k}'`)
        .join(", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${issue.options
        .map((val) => (typeof val === "string" ? `'${val}'` : val))
        .join(" | ")}`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
      else message = "Invalid";
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Should have ${issue.inclusive ? `at least` : `more than`} ${
          issue.minimum
        } items`;
      else if (issue.type === "string")
        message = `Should be ${issue.inclusive ? `at least` : `over`} ${
          issue.minimum
        } characters`;
      else if (issue.type === "number")
        message = `Value should be greater than ${
          issue.inclusive ? `or equal to ` : ``
        }${issue.minimum}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Should have ${issue.inclusive ? `at most` : `less than`} ${
          issue.maximum
        } items`;
      else if (issue.type === "string")
        message = `Should be ${issue.inclusive ? `at most` : `under`} ${
          issue.maximum
        } characters long`;
      else if (issue.type === "number")
        message = `Value should be less than ${
          issue.inclusive ? `or equal to ` : ``
        }${issue.maximum}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Should be multiple of ${issue.multipleOf}`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export let overrideErrorMap = defaultErrorMap;

export const setErrorMap = (map: ZodErrorMap) => {
  overrideErrorMap = map;
};
