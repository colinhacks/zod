import * as errors from "./errors.js";
import * as symbols from "./symbols.js";
import { FAILURE } from "./symbols.js";

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
      return ZodParsedType.undefined;

    case "string":
      return ZodParsedType.string;

    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;

    case "boolean":
      return ZodParsedType.boolean;

    case "function":
      return ZodParsedType.function;

    case "bigint":
      return ZodParsedType.bigint;

    case "symbol":
      return ZodParsedType.symbol;

    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return ZodParsedType.file;
      }
      return ZodParsedType.object;

    default:
      return ZodParsedType.unknown;
  }
};
export { getParsedType as t };

export type ParseParams = {
  path: (string | number)[];
  errorMap: errors.ZodErrorMap;
};

export type ParsePathComponent = string | number;
export type ParsePath = ParsePathComponent[];
export interface ParseContext {
  readonly path?: ParsePath;
  readonly contextualErrorMap?: errors.ZodErrorMap;
  readonly schemaErrorMap?: errors.ZodErrorMap;
}

export type ParseInput = any;

export type ErrorLevel = "warn" | "error" | "abort";
const errorLevels: ErrorLevel[] = ["warn", "error", "abort"];

export class ZodFailure {
  protected "~tag": typeof symbols.RESULT = symbols.RESULT;
  issues: errors.ZodIssue[] = [];
  ctx?: ParseContext | undefined;

  constructor(issues?: errors.IssueData[], ctx?: ParseContext) {
    this.issues = issues?.map((iss) => errors.makeIssue(iss, this.ctx)) || [];
    this.ctx = ctx;
  }

  level: ErrorLevel | null = null;
  report(data: errors.IssueData): void {
    const iss = errors.makeIssue(data, this.ctx);
    // elevate level if needed
    if (errorLevels.indexOf(iss.level) > errorLevels.indexOf(this.level!)) {
      this.level = iss.level;
    }
    this.issues.push(iss);
  }
}
Object.defineProperty(ZodFailure, Symbol.hasInstance, {
  value: (inst: any) => inst?.["~tag"] === symbols.RESULT,
});

// export class ZodFailure {
//   protected "~tag": typeof FAILURE = FAILURE;
//   constructor(
//     public issues: errors.IssueData[],
//     protected _value: unknown = NOT_SET
//   ) {}
//   status = "aborted" as const;

//   get value(): unknown {
//     return this._value;
//   }
//   set value(v: unknown) {
//     if (this._value !== NOT_SET) {
//       console.log(`curr`, this._value);
//       console.log(`v`, v);
//       throw new Error("value already set");
//     }
//     this._value = v;
//   }
// }

// Object.defineProperty(ZodFailure, Symbol.hasInstance, {
//   value: (inst: any) => inst?.["~tag"] === FAILURE,
// });

export type SyncParseReturnType<T = unknown> = T | ZodFailure;
export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;

export function isAborted(x: any): x is ZodFailure {
  return x?.["~tag"] === FAILURE;
}

export const isValid = <T>(x: any): x is T => {
  return x?.["~tag"] !== FAILURE;
};

export const isAsync = <T>(
  x: ParseReturnType<T>
): x is AsyncParseReturnType<T> =>
  typeof Promise !== "undefined" && x instanceof Promise;

export function safeResult<Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: errors.ZodError<Input> } {
  if (isAborted(result)) {
    if (!result.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }

    return {
      success: false,
      get error() {
        if ((this as any)._error) return (this as any)._error as Error;
        const err = errors.issuesToZodError(ctx, result.issues);
        (this as any)._error = err;
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
  error: errors.ZodError<Input>;
  data?: never;
};

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Awaited<Output>>
  | SafeParseError<Awaited<Input>>;
