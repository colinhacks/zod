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
  async: boolean;
};

export type ParsePathComponent = string | number;
export type ParsePath = ParsePathComponent[];

export interface ParseContext {
  readonly contextualErrorMap?: ZodErrorMap;
  readonly basePath: ParsePath;
  readonly async: boolean;
  readonly schemaErrorMap?: ZodErrorMap;
}

export type ParseInput = any;
export type INVALID = {
  status: "aborted";
  issues: IssueData[];
};
export const INVALID = (issues: IssueData[]): INVALID => ({
  status: "aborted" as const,
  issues,
});

export type OK<T> = { status: "valid"; value: T };
export const OK = <T>(value: T): OK<T> => ({ status: "valid", value });

export type SyncParseReturnType<T = any> = OK<T> | INVALID;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export const isAborted = (x: ParseReturnType<any>): x is INVALID =>
  (x as any).status === "aborted";
export const isValid = <T>(x: ParseReturnType<T>): x is OK<T> =>
  (x as any).status === "valid";
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> =>
  typeof Promise !== "undefined" && x instanceof Promise;
