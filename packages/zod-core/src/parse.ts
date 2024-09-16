import type * as errors from "./errors.js";
import defaultErrorMap from "./locales/en.js";
import * as symbols from "./symbols.js";
import { FAILURE } from "./symbols.js";

/** @deprecated Use string literals instead, e.g. `"string"` instead of `ZodParsedType.string` */
export const ZodParsedType = {
  string: "string",
  nan: "nan",
  number: "number",
  integer: "integer",
  float: "float",
  boolean: "boolean",
  date: "date",
  bigint: "bigint",
  symbol: "symbol",
  function: "function",
  undefined: "undefined",
  null: "null",
  array: "array",
  object: "object",
  unknown: "unknown",
  promise: "promise",
  void: "void",
  never: "never",
  map: "map",
  set: "set",
  file: "file",
} as const;

export type ZodParsedType = keyof typeof ZodParsedType;

export const getParsedType = (data: any): ZodParsedType => {
  const t = typeof data;

  switch (t) {
    case "undefined":
      return "undefined";

    case "string":
      return "string";

    case "number":
      return Number.isNaN(data) ? "nan" : "number";

    case "boolean":
      return "boolean";

    case "function":
      return "function";

    case "bigint":
      return "bigint";

    case "symbol":
      return "symbol";

    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";

    default:
      return "unknown";
  }
};
export { getParsedType as t };

export type ParseParams = {
  path?: (string | number)[];
  error?: errors.$ZodErrorMap;
};

type ParsePathComponent = string | number;
type ParsePath = ParsePathComponent[];
export interface ParseContext {
  readonly path?: ParsePath;
  readonly error?: errors.$ZodErrorMap<never>;
  // readonly contextualErrorMap?: errors.$ZodErrorMap;
  // readonly schemaErrorMap?: errors.$ZodErrorMap;
}

export type ErrorLevel = "error" | "abort";
const errorLevels: ErrorLevel[] = ["error", "abort"];

export class $ZodFailure {
  protected "~tag": typeof symbols.FAILURE = symbols.FAILURE;
  issues: errors.$ZodIssue[] = [];
  ctx?: ParseContext | undefined;

  constructor(issues?: errors.$ZodIssue[], ctx?: ParseContext) {
    this.issues = issues ?? [];
    // this.issues = issues?.map((iss) => makeIssue(iss, this.ctx)) || [];
    this.ctx = ctx;
  }

  mergeIn(fail: $ZodFailure, ...path: (string | number)[]): void {
    if (!fail || !fail.issues) return;
    for (const iss of fail.issues) {
      iss.path.unshift(...path);
      this.issues.push(iss);
    }
  }

  static from(
    issueDatas: errors.$ZodIssueData[],
    ctx: ParseContext | undefined,
    schema?: { error?: errors.$ZodErrorMap<never> | undefined }
  ): $ZodFailure {
    return new $ZodFailure(
      issueDatas.map((iss) => makeIssue(iss, schema, ctx)),
      ctx
    );
  }

  level: ErrorLevel | null = null;
  addIssue(
    data: errors.$ZodIssueData,
    // ctx?: { error?: errors.$ZodErrorMap },
    schema?: { error?: errors.$ZodErrorMap<never> | undefined }
  ): void {
    const iss = makeIssue(data, schema);
    // elevate level if needed
    if (errorLevels.indexOf(iss.level) > errorLevels.indexOf(this.level!)) {
      this.level = iss.level;
    }
    this.issues.push(iss);
  }

  /** @internal */
  static [Symbol.hasInstance](inst: any) {
    return inst?.["~tag"] === symbols.FAILURE;
  }
}

export type SyncParseReturnType<T = unknown> = T | $ZodFailure;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export function failed(x: SyncParseReturnType<unknown>): x is $ZodFailure {
  return (x as any)?.["~tag"] === FAILURE;
}

export function aborted(x: $ZodFailure): x is $ZodFailure {
  return x.level === "abort";
}

export function isValid<T>(x: any): x is T {
  return x?.["~tag"] !== FAILURE;
}

export function isAsync<T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> {
  return typeof Promise !== "undefined" && x instanceof Promise;
}

export function safeResult<Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
): { success: true; data: Output } | { success: false; error: $ZodFailure } {
  if (failed(result) && aborted(result)) {
    if (!result.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }

    return {
      success: false,
      get error() {
        if ((this as any)._error) return (this as any)._error as Error;
        const error = new $ZodFailure(result.issues, ctx);
        (this as any)._error = error;
        return (this as any)._error;
      },
    };
  }
  return { success: true, data: result as any };
}

export type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: never;
};
export type SafeParseError<Input> = {
  success: false;
  error: $ZodFailure;
  data?: never;
};

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Awaited<Output>>
  | SafeParseError<Awaited<Input>>;

let overrideErrorMap: errors.$ZodErrorMap = defaultErrorMap;
export { defaultErrorMap };

export function setErrorMap(map: errors.$ZodErrorMap): void {
  overrideErrorMap = map;
}

export function getErrorMap(): errors.$ZodErrorMap {
  return overrideErrorMap;
}

export const makeIssue = (
  issueData: errors.$ZodIssueData,
  schema?: { error?: errors.$ZodErrorMap<never> | undefined },
  ctx?: ParseContext
): errors.$ZodIssue => {
  const fullPath = ctx?.path
    ? issueData.path
      ? [...ctx.path, ...issueData.path]
      : ctx.path
    : issueData.path
      ? issueData.path
      : [];

  const fullIssue = {
    ...issueData,
    level: issueData.level ?? "error",
    path: fullPath,
  };

  if (issueData.message) return fullIssue as errors.$ZodIssue;
  const _message: any =
    schema?.error?.(fullIssue as never) ??
    ctx?.error?.(fullIssue as never) ??
    getErrorMap()(fullIssue) ??
    defaultErrorMap(fullIssue);
  fullIssue.message = _message.message ?? _message;
  return fullIssue as errors.$ZodIssue;
};
