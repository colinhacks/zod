import { PseudoPromise } from "../PseudoPromise.ts";
import {
  defaultErrorMap,
  MakeErrorData,
  overrideErrorMap,
  ZodError,
  ZodErrorMap,
  ZodIssue,
} from "../ZodError.ts";
import { util } from "./util.ts";

export const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set",
]);

export type ZodParsedType = keyof typeof ZodParsedType;

export const getParsedType = (data: any): ZodParsedType => {
  if (typeof data === "string") return ZodParsedType.string;
  if (typeof data === "number") {
    if (Number.isNaN(data)) return ZodParsedType.nan;
    return ZodParsedType.number;
  }
  if (typeof data === "boolean") return ZodParsedType.boolean;
  if (typeof data === "bigint") return ZodParsedType.bigint;
  if (typeof data === "symbol") return ZodParsedType.symbol;
  if (data instanceof Date) return ZodParsedType.date;
  if (typeof data === "function") return ZodParsedType.function;
  if (data === undefined) return ZodParsedType.undefined;
  if (typeof data === "undefined") return ZodParsedType.undefined;
  if (typeof data === "object") {
    if (Array.isArray(data)) return ZodParsedType.array;
    if (data === null) return ZodParsedType.null;
    if (
      data.then &&
      typeof data.then === "function" &&
      data.catch &&
      typeof data.catch === "function"
    ) {
      return ZodParsedType.promise;
    }
    if (data instanceof Map) {
      return ZodParsedType.map;
    }
    if (data instanceof Set) {
      return ZodParsedType.set;
    }
    return ZodParsedType.object;
  }
  return ZodParsedType.unknown;
};

export const makeIssue = (
  data: any,
  path: (string | number)[],
  errorMap: ZodErrorMap,
  errorData: MakeErrorData
): ZodIssue => {
  const fullPath = [...path, ...(errorData.path || [])];
  const errorArg = {
    ...errorData,
    path: fullPath,
  };

  const defaultError = defaultErrorMap(errorArg, {
    data: data,
    defaultError: `Invalid input`,
  });
  return {
    ...errorData,
    path: fullPath,
    message:
      errorData.message ||
      errorMap(errorArg, {
        data: data,
        defaultError: defaultError.message,
      }).message,
  };
};

export type ParseParams = {
  data: any;
  path: (string | number)[];
  errorMap: ZodErrorMap;
  parentError: ZodError;
  async: boolean;
};

export type ParseParamsNoData = Omit<ParseParams, "data">;

export type ParsePathComponent = string | number;

export type ParsePath = ParsePathComponent[];

export const EMPTY_PATH: ParsePath = [];

export type ParseContextParameters = {
  errorMap: ZodErrorMap;
  async: boolean;
};

export class ParseContext {
  constructor(
    public readonly path: ParsePath,
    public readonly issues: ZodIssue[],
    public readonly params: ParseContextParameters
  ) {}

  stepInto(component: ParsePathComponent): ParseContext {
    return new ParseContext(
      [...this.path, component],
      this.issues,
      this.params
    );
  }

  addIssue(data: any, errorData: MakeErrorData): void {
    const issue = makeIssue(data, this.path, this.params.errorMap, errorData);
    this.issues.push(issue);
  }
}

export const createRootContext = (
  params: Partial<ParseParamsNoData>
): ParseContext =>
  new ParseContext(EMPTY_PATH, [], {
    async: params.async ?? false,
    errorMap: params.errorMap || overrideErrorMap,
  });

export type ZodParserReturnPayload<T> =
  | {
      success: false;
      error: ZodError;
    }
  | {
      success: true;
      data: T;
    };

export type INVALID = { valid: false };
export const INVALID: INVALID = Object.freeze({ valid: false });

export type OK<T> = { valid: true; value: T };
export const OK = <T>(value: T): OK<T> => ({ valid: true, value });

export type ASYNC<T> = PseudoPromise<T>;
export const ASYNC = <T>(promise: Promise<T>): ASYNC<T> =>
  new PseudoPromise<T>(promise);

export type SyncParseReturnType<T> = OK<T> | INVALID;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | ASYNC<SyncParseReturnType<T>>;

export const isInvalid = (x: ParseReturnType<any>): x is INVALID =>
  x === INVALID;
export const isOk = <T>(x: ParseReturnType<T>): x is OK<T> =>
  (x as any).valid === true;
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is ASYNC<SyncParseReturnType<T>> => x instanceof PseudoPromise;
