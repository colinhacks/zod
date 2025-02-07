import * as core from "zod-core";
import type { _ZodType } from "./schemas.js";

class ZodError<T = unknown> extends core.$ZodError<T> {}

type allKeys<T> = T extends any ? keyof T : never;
export type inferFlattenedErrors<T extends _ZodType, U = string> = typeToFlattenedError<core.output<T>, U>;
export type typeToFlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in allKeys<T>]?: U[];
  };
};

/** Re-export of `$ZodIssue` from `@zod/core`. If you are building a library on top of Zod you should import from `@zod/core` instead. */
export type ZodIssue = core.$ZodIssue;

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

export type inferFormattedError<T extends _ZodType<any, any>, U = string> = ZodFormattedError<core.output<T>, U>;

export function format<T>(error: ZodError<T>): ZodFormattedError<T>;
export function format<T, U>(error: ZodError<T>, mapper: (issue: core.$ZodIssue) => U): ZodFormattedError<T, U>;
export function format<T>(error: ZodError, _mapper?: any) {
  const mapper: (issue: core.$ZodIssue) => any =
    _mapper ||
    function (issue: core.$ZodIssue) {
      return issue.message;
    };
  const fieldErrors: ZodFormattedError<T> = { _errors: [] } as any;
  const processError = (error: { issues: core.$ZodIssue[] }) => {
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

export function flatten<T>(error: ZodError<T>): typeToFlattenedError<T>;
export function flatten<T, U>(error: ZodError<T>, mapper?: (issue: core.$ZodIssue) => U): typeToFlattenedError<T, U>;
export function flatten(error: ZodError, mapper = (issue: core.$ZodIssue) => issue.message): any {
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
