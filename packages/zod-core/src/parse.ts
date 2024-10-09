/** @deprecated Use string literals instead, e.g. `"string"` instead of `ZodParsedType.string` */
// export const ZodParsedType = {
//   string: "string",
//   nan: "nan",
//   number: "number",
//   integer: "integer",
//   float: "float",
//   boolean: "boolean",
//   date: "date",
//   bigint: "bigint",
//   symbol: "symbol",
//   function: "function",
//   undefined: "undefined",
//   null: "null",
//   array: "array",
//   object: "object",
//   unknown: "unknown",
//   promise: "promise",
//   void: "void",
//   never: "never",
//   map: "map",
//   set: "set",
//   file: "file",
// } as const;
// export type ZodParsedType = keyof typeof ZodParsedType;

export const $ZodParsedTypes = {
  string: "string",
  number: "number",
  bigint: "bigint",
  boolean: "boolean",
  symbol: "symbol",
  object: "object",
  file: "file",
  date: "date",
  array: "array",
  map: "map",
  set: "set",
  undefined: "undefined",
  nan: "nan",
  function: "function",
  null: "null",
  promise: "promise",
} as const;
export type $ZodParsedTypes = keyof typeof $ZodParsedTypes;

/** @deprecated */
export {
  /** @deprecated */
  // biome-ignore lint:
  $ZodParsedTypes as ZodParsedType,
};

export const getParsedType = (data: any): $ZodParsedTypes => {
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
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
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
      throw new Error(`Unknown data type: ${t}`);
  }
};
export { getParsedType as t };

export function isPlainObject(data: any): data is Record<PropertyKey, unknown> {
  return typeof data === "object" && data !== null && Object.getPrototypeOf(data) === Object.prototype;
}

// export type ParseParams = {
//   path?: PropertyKey[];
//   error?: errors.$ZodErrorMap;
// };

// type ParsePathComponent = PropertyKey;
// type ParsePath = ParsePathComponent[];
// export interface ParseContext {
//   readonly path?: ParsePath;
//   readonly error?: errors.$ZodErrorMap<never>;
//   // readonly contextualErrorMap?: errors.$ZodErrorMap;
//   // readonly schemaErrorMap?: errors.$ZodErrorMap;
// }

// export type ErrorLevel = "error" | "abort";
// const errorLevels: ErrorLevel[] = ["error", "abort"];

// export class $ZodFailure {
//   protected "~tag": typeof symbols.FAILURE = symbols.FAILURE;
//   issues: errors.$ZodIssue[] = [];
//   ctx?: ParseContext | undefined;

//   constructor(issues?: errors.$ZodIssue[], ctx?: ParseContext) {
//     this.issues = issues ?? [];
//     this.ctx = ctx;
//   }

//   mergeIn(fail: $ZodFailure, ...path: PropertyKey[]): $ZodFailure {
//     console.log(`MERGEIN`);
//     console.log(this);
//     if (!fail || !fail.issues) return this;
//     console.log(`mering ${fail.issues.length} issues`);
//     for (const iss of fail.issues) {
//       if (fail.issues.length > 5) throw new Error("Too many issues");

//       iss.path.unshift(...path);
//       console.log(this.issues);
//       console.log(`pushing issue: ${iss}`);
//       this.issues.push(iss);
//     }
//     return this;
//   }

//   static from(
//     issueDatas: errors.$ZodIssueData[],
//     ctx: ParseContext | undefined,
//     schema: { error?: errors.$ZodErrorMap<never> | undefined }
//   ): $ZodFailure {
//     return new $ZodFailure(
//       issueDatas.map((iss) => makeIssue(iss, schema, ctx)),
//       ctx
//     );
//   }

//   static empty(ctx: ParseContext | undefined): $ZodFailure {
//     return new $ZodFailure(undefined, ctx);
//   }

//   get level(): ErrorLevel | null {
//     let level: ErrorLevel | null = null;
//     for (const iss of this.issues) {
//       if (iss.level === "abort") return "abort";
//       if (iss.level === "error") {
//         if (level === null) level = "error";
//       }
//     }
//     return level;
//   }
//   addIssue(
//     data: errors.$ZodIssueData,
//     // ctx?: { error?: errors.$ZodErrorMap },
//     schema?: { error?: errors.$ZodErrorMap<never> | undefined }
//   ): void {
//     const iss = makeIssue(data, schema);
//     this.issues.push(iss);
//   }

//   static [Symbol.hasInstance as any as "string"](inst: any) {
//     return inst?.["~tag"] === symbols.FAILURE;
//   }
// }

// export type SyncParseReturnType<T = unknown> = T | $ZodFailure;
// export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
// export type ParseReturnType<T> =
//   | SyncParseReturnType<T>
//   | AsyncParseReturnType<T>;

// export function failed(x: SyncParseReturnType<unknown>): x is $ZodFailure {
//   return (x as any)?.["~tag"] === FAILURE;
// }

// export function aborted(x: $ZodFailure): x is $ZodFailure {
//   return x.level === "abort";
// }

// export function isValid<T>(x: any): x is T {
//   return x?.["~tag"] !== FAILURE;
// }

// export function isAsync<T>(
//   x: ParseReturnType<T>
// ): x is AsyncParseReturnType<T> {
//   return typeof Promise !== "undefined" && x instanceof Promise;
// }

// export function safeResult<Input, Output>(
//   ctx: ParseContext,
//   result: SyncParseReturnType<Output>
// ): { success: true; data: Output } | { success: false; error: $ZodFailure } {
//   if (failed(result) && aborted(result)) {
//     if (!result.issues.length) {
//       throw new Error("Validation failed but no issues detected.");
//     }

//     return {
//       success: false,
//       get error() {
//         if ((this as any)._error) return (this as any)._error as Error;
//         const error = new $ZodFailure(result.issues, ctx);
//         (this as any)._error = error;
//         return (this as any)._error;
//       },
//     };
//   }
//   return { success: true, data: result as any };
// }

// export type SafeParseSuccess<Output> = {
//   success: true;
//   data: Output;
//   error?: never;
// };
// export type SafeParseError<Input> = {
//   success: false;
//   error: $ZodFailure;
//   data?: never;
// };

// export type SafeParseReturnType<Input, Output> =
//   | SafeParseSuccess<Awaited<Output>>
//   | SafeParseError<Awaited<Input>>;

// let overrideErrorMap: errors.$ZodErrorMap = defaultErrorMap;
// export { defaultErrorMap };

// export function setErrorMap(map: errors.$ZodErrorMap): void {
//   overrideErrorMap = map;
// }

// export function getErrorMap(): errors.$ZodErrorMap {
//   return overrideErrorMap;
// }

// export const makeIssue = (
//   issueData: errors.$ZodIssueData,
//   schema?: { error?: errors.$ZodErrorMap<never> | undefined },
//   ctx?: ParseContext
// ): errors.$ZodIssue => {
//   const fullPath = ctx?.path
//     ? issueData.path
//       ? [...ctx.path, ...issueData.path]
//       : ctx.path
//     : issueData.path
//       ? issueData.path
//       : [];

//   const fullIssue = {
//     ...issueData,
//     level: issueData.level ?? "error",
//     path: fullPath,
//   };

//   if (issueData.message) return fullIssue as errors.$ZodIssue;
//   const _message: any =
//     schema?.error?.(fullIssue as never) ??
//     ctx?.error?.(fullIssue as never) ??
//     getErrorMap()(fullIssue) ??
//     defaultErrorMap(fullIssue);
//   fullIssue.message = _message.message ?? _message;
//   return fullIssue as errors.$ZodIssue;
// };
