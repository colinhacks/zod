import {
  defaultErrorMap,
  IssueData,
  overrideErrorMap,
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
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "object":
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
      if (data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

export const makeIssue = (params: {
  data: any;
  path: (string | number)[];
  errorMaps: (ZodErrorMap | undefined)[];
  issueData: IssueData;
}): ZodIssue => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...(issueData.path || [])];
  const fullIssue = {
    ...issueData,
    path: fullPath,
  };

  let errorMessage = "";
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse() as ZodErrorMap[];
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }

  return {
    ...issueData,
    path: fullPath,
    message: issueData.message || errorMessage,
  };
};

export type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
  async: boolean;
};

export type ParsePathComponent = string | number;
export type ParsePath = ParsePathComponent[];
export const EMPTY_PATH: ParsePath = [];

interface ParseContextDef {
  readonly path: ParsePath;
  readonly issues: ZodIssue[];
  readonly errorMap?: ZodErrorMap;
  readonly async: boolean;
  readonly parent: ParseContext | null;
  _invalid: boolean;
  _aborted: boolean;
}

export class ParseContext {
  // public readonly path: ParsePath;
  // public readonly issues: ZodIssue[];
  // public readonly errorMap: ZodErrorMap;
  protected readonly def: ParseContextDef;

  get invalid() {
    return this.def._invalid;
  }
  get aborted() {
    return this.def._aborted;
  }

  markInvalid() {
    if (!this.def._invalid) {
      this.def._invalid = true;
      if (this.def.parent) this.def.parent.markInvalid();
    }
  }

  abort() {
    if (!this.def._aborted) {
      this.def._aborted = true;
      if (this.def.parent) this.def.parent.abort();
    }
  }

  constructor(def: ParseContextDef) {
    this.def = def;
  }
  get path() {
    return this.def.path;
  }
  get issues() {
    return this.def.issues;
  }
  get errorMap() {
    return this.def.errorMap;
  }
  get async() {
    return this.def.async;
  }

  child(component?: ParsePathComponent) {
    return new ParseContext({
      ...this.def,
      path: component ? [...this.path, component] : this.path,
      parent: this,
      _invalid: false,
      _aborted: false,
    });
  }

  clone() {
    return new ParseContext({
      ...this.def,
    });
  }

  clearIssues() {
    return new ParseContext({
      ...this.def,
      issues: [],
    });
  }

  addIssue(
    data: any,
    issueData: IssueData,
    params: { schemaErrorMap?: ZodErrorMap } = {}
  ): void {
    const issue = makeIssue({
      data,
      issueData,
      path: this.path,
      errorMaps: [
        this.def.errorMap, // contextual error map is first priority
        params.schemaErrorMap, // then schema-bound map if available
        overrideErrorMap, // then global override map
        defaultErrorMap, // then global default map
      ],
    });
    this.issues.push(issue);
    this.markInvalid();
  }
}

export type INVALID = { valid: false };
export const INVALID: INVALID = Object.freeze({ valid: false });

export type OK<T> = { valid: true; value: T };
export const OK = <T>(value: T): OK<T> => ({ valid: true, value });

export type SyncParseReturnType<T> = OK<T> | INVALID;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export const isInvalid = (x: ParseReturnType<any>): x is INVALID =>
  (x as any).valid === false;
export const isOk = <T>(x: ParseReturnType<T>): x is OK<T> =>
  (x as any).valid === true;
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> => x instanceof Promise;
