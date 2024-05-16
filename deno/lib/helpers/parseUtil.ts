import { getErrorMap } from "../errors.ts";
import defaultErrorMap from "../locales/en.ts";
import type { IssueData, ZodErrorMap, ZodIssue } from "../ZodError.ts";

export const makeIssue = (
  issueData: IssueData,
  ctx: ParseContext
): ZodIssue => {
  const { basePath, contextualErrorMap, schemaErrorMap } = ctx;
  const fullPath = [...basePath, ...(issueData.path || [])];
  const fullIssue = {
    ...issueData,
    path: fullPath,
  };

  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message,
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
    message: errorMessage,
  };
};

export type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
};

export type ParsePathComponent = string | number;
export type ParsePath = ParsePathComponent[];

export interface ParseContext {
  readonly contextualErrorMap?: ZodErrorMap;
  readonly basePath: ParsePath;
  readonly schemaErrorMap?: ZodErrorMap;
}

export type ParseInput = any;

export const NOT_SET = Symbol.for("NOT_SET");
export const ZOD_FAILURE = "ZOD_FAILURE";
export class ZodFailure {
  [ZOD_FAILURE]: true;
  constructor(
    public issues: IssueData[],
    protected _value: unknown = NOT_SET
  ) {}
  status: "aborted" = "aborted";

  get value() {
    return this._value;
  }
  set value(v: unknown) {
    if (this._value !== NOT_SET) {
      console.log(`curr`, this._value);
      console.log(`v`, v);
      throw new Error("value already set");
    }
    this._value = v;
  }
}

// export type OK<T> = T;
// export const OK = <T>(value: T): OK<T> => value as OK<T>;

export type SyncParseReturnType<T = unknown> = T | ZodFailure;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export function isAborted(x: ParseReturnType<unknown>): x is ZodFailure {
  return (x as any)[ZOD_FAILURE];
}
// export function isAborted(x: ParseReturnType<unknown>): x is ZodFailure {
//   return typeof x === "object" && ZOD_FAILURE in (x as any);
// }
// export function isAborted(x: ParseReturnType<unknown>): x is ZodFailure {
//   return x instanceof ZodFailure;
// }
export const isValid = <T>(x: ParseReturnType<T>): x is T =>
  !(x instanceof ZodFailure);
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> =>
  typeof Promise !== "undefined" && x instanceof Promise;
