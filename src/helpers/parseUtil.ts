import {
  defaultErrorMap,
  IssueData,
  overrideErrorMap,
  ZodErrorMap,
  ZodIssue,
} from "../ZodError";
import { util } from "./util";

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

function cacheAndReturn(
  data: any,
  parsedType: ZodParsedType,
  cache?: Map<any, ZodParsedType>
) {
  if (cache) cache.set(data, parsedType);
  return parsedType;
}

export const getParsedType = (
  data: any,
  cache?: Map<any, ZodParsedType>
): ZodParsedType => {
  if (cache && cache.has(data)) return cache.get(data)!;
  const t = typeof data;

  switch (t) {
    case "undefined":
      return cacheAndReturn(data, ZodParsedType.undefined, cache);

    case "string":
      return cacheAndReturn(data, ZodParsedType.string, cache);

    case "number":
      return cacheAndReturn(
        data,
        isNaN(data) ? ZodParsedType.nan : ZodParsedType.number,
        cache
      );

    case "boolean":
      return cacheAndReturn(data, ZodParsedType.boolean, cache);

    case "function":
      return cacheAndReturn(data, ZodParsedType.function, cache);

    case "bigint":
      return cacheAndReturn(data, ZodParsedType.bigint, cache);

    case "object":
      if (Array.isArray(data)) {
        return cacheAndReturn(data, ZodParsedType.array, cache);
      }
      if (data === null) {
        return cacheAndReturn(data, ZodParsedType.null, cache);
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return cacheAndReturn(data, ZodParsedType.promise, cache);
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return cacheAndReturn(data, ZodParsedType.map, cache);
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return cacheAndReturn(data, ZodParsedType.set, cache);
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return cacheAndReturn(data, ZodParsedType.date, cache);
      }
      return cacheAndReturn(data, ZodParsedType.object, cache);

    default:
      return cacheAndReturn(data, ZodParsedType.unknown, cache);
  }
};

export const makeIssue = (params: {
  data: any;
  path: (string | number)[];
  errorMaps: ZodErrorMap[];
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

export interface ParseContext {
  readonly path: ParsePath;
  readonly issues: ZodIssue[];
  readonly schemaErrorMap?: ZodErrorMap;
  readonly contextualErrorMap?: ZodErrorMap;
  readonly async: boolean;
  readonly parent: ParseContext | null;
  readonly typeCache: Map<any, ZodParsedType> | undefined;
  readonly data: any;
  readonly parsedType: ZodParsedType;
}

export type ParseInput = {
  data: any;
  path: (string | number)[];
  parent: ParseContext;
};

export function addIssueToContext(
  ctx: ParseContext,
  issueData: IssueData
): void {
  const issue = makeIssue({
    issueData: issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.contextualErrorMap, // contextual error map is first priority
      ctx.schemaErrorMap, // then schema-bound map if available
      overrideErrorMap, // then global override map
      defaultErrorMap, // then global default map
    ].filter((x) => !!x) as ZodErrorMap[],
  });
  ctx.issues.push(issue);
}

export type ObjectPair = {
  key: SyncParseReturnType<any>;
  value: SyncParseReturnType<any>;
};
export class ParseStatus {
  value: "aborted" | "dirty" | "valid" = "valid";
  dirty() {
    if (this.value === "valid") this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted") this.value = "aborted";
  }

  static mergeArray(
    status: ParseStatus,
    results: SyncParseReturnType<any>[]
  ): SyncParseReturnType {
    const arrayValue: any[] = [];
    for (const s of results) {
      if (s.status === "aborted") return INVALID;
      if (s.status === "dirty") status.dirty();
      arrayValue.push(s.value);
    }

    return { status: status.value, value: arrayValue };
  }

  static async mergeObjectAsync(
    status: ParseStatus,
    pairs: { key: ParseReturnType<any>; value: ParseReturnType<any> }[]
  ): Promise<SyncParseReturnType<any>> {
    const syncPairs: ObjectPair[] = [];
    for (const pair of pairs) {
      syncPairs.push({
        key: await pair.key,
        value: await pair.value,
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }

  static mergeObjectSync(
    status: ParseStatus,
    pairs: {
      key: SyncParseReturnType<any>;
      value: SyncParseReturnType<any>;
      alwaysSet?: boolean;
    }[]
  ): SyncParseReturnType {
    const finalObject: any = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted") return INVALID;
      if (value.status === "aborted") return INVALID;
      if (key.status === "dirty") status.dirty();
      if (value.status === "dirty") status.dirty();

      if (typeof value.value !== "undefined" || pair.alwaysSet) {
        finalObject[key.value] = value.value;
      }
    }

    return { status: status.value, value: finalObject };
  }
}
export interface ParseResult {
  status: "aborted" | "dirty" | "valid";
  data: any;
}

export type INVALID = { status: "aborted" };
export const INVALID: INVALID = Object.freeze({
  status: "aborted",
});

export type DIRTY<T> = { status: "dirty"; value: T };
export const DIRTY = <T>(value: T): DIRTY<T> => ({ status: "dirty", value });

export type OK<T> = { status: "valid"; value: T };
export const OK = <T>(value: T): OK<T> => ({ status: "valid", value });

export type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export const isAborted = (x: ParseReturnType<any>): x is INVALID =>
  (x as any).status === "aborted";
export const isDirty = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> =>
  (x as any).status === "dirty";
export const isValid = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> =>
  (x as any).status === "valid";
export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> =>
  typeof Promise !== undefined && x instanceof Promise;
