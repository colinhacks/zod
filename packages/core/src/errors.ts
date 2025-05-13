import type { $ZodCheck, $ZodStringFormats } from "./checks.js";
import type { $ZodType } from "./schemas.js";
import type * as util from "./util.js";
import { jsonStringifyReplacer } from "./util.js";

///////////////////////////
////     base type     ////
///////////////////////////
export interface $ZodIssueBase {
  readonly code?: string;
  readonly input?: unknown;
  readonly path: PropertyKey[];
  readonly message: string;
  // [k: string]: unknown;
}

////////////////////////////////
////     issue subtypes     ////
////////////////////////////////
export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_type";
  readonly expected: $ZodType["_zod"]["def"]["type"];
  readonly input: Input;
}

export interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
  readonly code: "too_big";
  readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  readonly maximum: number | bigint;
  readonly inclusive?: boolean;
  readonly input: Input;
}

export interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
  readonly code: "too_small";
  readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  readonly minimum: number | bigint;
  readonly inclusive?: boolean;
  readonly input: Input;
}

export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
  readonly code: "invalid_format";
  readonly format: $ZodStringFormats | (string & {});
  readonly pattern?: string;
  readonly input: string;
}

export interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
  readonly code: "not_multiple_of";
  readonly divisor: number;
  readonly input: Input;
}

export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
  readonly code: "unrecognized_keys";
  readonly keys: string[];
  readonly input: Record<string, unknown>;
}

export interface $ZodIssueInvalidUnion extends $ZodIssueBase {
  readonly code: "invalid_union";
  readonly errors: $ZodIssue[][];
  readonly input: unknown;
}

export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_key";
  readonly origin: "map" | "record";
  readonly issues: $ZodIssue[];
  readonly input: Input;
}

export interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_element";
  readonly origin: "map" | "set";
  readonly key: unknown;
  readonly issues: $ZodIssue[];
  readonly input: Input;
}

export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_value";
  readonly values: util.Primitive[];
  readonly input: Input;
}

export interface $ZodIssueCustom extends $ZodIssueBase {
  readonly code?: "custom";
  readonly params?: Record<string, any> | undefined;
  readonly input: unknown;
}

////////////////////////////////////////////
////     first-party string formats     ////
////////////////////////////////////////////

export interface $ZodIssueStringCommonFormats extends $ZodIssueInvalidStringFormat {
  format: Exclude<$ZodStringFormats, "regex" | "jwt" | "starts_with" | "ends_with" | "includes">;
}

export interface $ZodIssueStringInvalidRegex extends $ZodIssueInvalidStringFormat {
  format: "regex";
  pattern: string;
}

export interface $ZodIssueStringInvalidJWT extends $ZodIssueInvalidStringFormat {
  format: "jwt";
  algorithm?: string;
}

export interface $ZodIssueStringStartsWith extends $ZodIssueInvalidStringFormat {
  format: "starts_with";
  prefix: string;
}

export interface $ZodIssueStringEndsWith extends $ZodIssueInvalidStringFormat {
  format: "ends_with";
  suffix: string;
}

export interface $ZodIssueStringIncludes extends $ZodIssueInvalidStringFormat {
  format: "includes";
  includes: string;
}

export type $ZodStringFormatIssues =
  | $ZodIssueStringCommonFormats
  | $ZodIssueStringInvalidRegex
  | $ZodIssueStringInvalidJWT
  | $ZodIssueStringStartsWith
  | $ZodIssueStringEndsWith
  | $ZodIssueStringIncludes;

////////////////////////
////     utils     /////
////////////////////////

export type $ZodIssue =
  | $ZodIssueInvalidType
  | $ZodIssueTooBig
  | $ZodIssueTooSmall
  | $ZodIssueInvalidStringFormat
  | $ZodIssueNotMultipleOf
  | $ZodIssueUnrecognizedKeys
  | $ZodIssueInvalidUnion
  | $ZodIssueInvalidKey
  | $ZodIssueInvalidElement
  | $ZodIssueInvalidValue
  | $ZodIssueCustom;

export type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
type RawIssue<T extends $ZodIssueBase> = util.Flatten<
  util.MakePartial<T, "message" | "path"> & {
    /** The input data */
    readonly input?: unknown;
    /** The schema or check that originated this issue. */
    readonly inst?: $ZodType | $ZodCheck;
    /** @deprecated Internal use only. If `true`, Zod will continue executing validation despite this issue. */
    readonly continue?: boolean | undefined;
  } & Record<string, any>
>;

export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
  // biome-ignore lint:
  (issue: $ZodRawIssue<T>): { message: string } | string | undefined | null;
}

////////////////////////    ERROR CLASS   ////////////////////////

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export interface $ZodError<T = unknown> extends Error {
  _zod: { type: T };
  stack?: string;
  name: string;
}
export class $ZodError implements Error {
  public issues: $ZodIssue[];
  get message(): string {
    return JSON.stringify(this.issues, jsonStringifyReplacer, 2);
  }

  constructor(issues: $ZodIssue[]) {
    Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
    Object.defineProperty(this, "name", { value: "$ZodError", enumerable: false });
    this.issues = issues;
  }

  // @ts-ignore
  static [Symbol.hasInstance](inst: any) {
    return inst?._tag === ZOD_ERROR;
  }
}

///////////////////    ERROR UTILITIES   ////////////////////////

// flatten
export type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
type _FlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in keyof T]?: U[];
  };
};

/** @deprecated Use `z.treeifyError()` instead. */
export function flattenError<T>(error: $ZodError<T>): _FlattenedError<T>;
export function flattenError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): _FlattenedError<T, U>;
export function flattenError(error: $ZodError, mapper = (issue: $ZodIssue) => issue.message): any {
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

type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
  ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
  : T extends any[]
    ? { [k: number]: $ZodFormattedError<T[number], U> }
    : T extends object
      ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
      : any;

export type $ZodFormattedError<T, U = string> = {
  _errors: U[];
} & util.Flatten<_ZodFormattedError<T, U>>;

/** @deprecated Use `z.treeifyError()` instead. */
export function formatError<T>(error: $ZodError<T>): $ZodFormattedError<T>;
/** @deprecated Use `z.treeifyError()` instead. */
export function formatError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): $ZodFormattedError<T, U>;
export function formatError<T>(error: $ZodError, _mapper?: any) {
  const mapper: (issue: $ZodIssue) => any =
    _mapper ||
    function (issue: $ZodIssue) {
      return issue.message;
    };
  const fieldErrors: $ZodFormattedError<T> = { _errors: [] } as any;
  const processError = (error: { issues: $ZodIssue[] }) => {
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

type _ZodErrorTree<T, U = string> = T extends [any, ...any[]]
  ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
  : T extends any[]
    ? { [k: number]: $ZodFormattedError<T[number], U> }
    : T extends object
      ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
      : any;

// export type $ZodErrorTree<T, U = string> = {
//   errors: U[];
//   properties: T extends [any, ...any[]]
//     ? { [K in keyof T]?: $ZodErrorTree<T[K], U> }
//     : T extends any[]
//       ? Array<$ZodErrorTree<T[number], U>>
//       : T extends object
//         ? { [K in keyof T]?: $ZodErrorTree<T[K], U> }
//         : any;
// };
export type $ZodErrorTree<T, U = string> = T extends [any, ...any[]]
  ? { errors: U[]; items?: { [K in keyof T]?: $ZodErrorTree<T[K], U> } }
  : T extends any[]
    ? { errors: U[]; items?: Array<$ZodErrorTree<T[number], U>> }
    : T extends object
      ? { errors: U[]; properties?: { [K in keyof T]?: $ZodErrorTree<T[K], U> } }
      : { errors: U[] };

export function treeifyError<T>(error: $ZodError<T>): $ZodErrorTree<T>;
export function treeifyError<T, U>(error: $ZodError<T>, mapper?: (issue: $ZodIssue) => U): $ZodErrorTree<T, U>;
export function treeifyError<T>(error: $ZodError, _mapper?: any) {
  const mapper: (issue: $ZodIssue) => any =
    _mapper ||
    function (issue: $ZodIssue) {
      return issue.message;
    };
  const result: $ZodErrorTree<T> = { errors: [] } as any;
  const processError = (error: { issues: $ZodIssue[] }) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union") {
        issue.errors.map((issues) => processError({ issues }));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues });
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues });
      } else if (issue.path.length === 0) {
        result.errors.push(mapper(issue));
      } else {
        let curr: any = result;
        let i = 0;

        while (i < issue.path.length) {
          const el = issue.path[i];

          const terminal = i === issue.path.length - 1;
          if (typeof el === "string") {
            curr.properties ??= {};
            curr.properties[el] ??= { errors: [] };
            curr = curr.properties[el];
          } else {
            curr.items ??= [];
            curr.items[el] ??= { errors: [] };
            curr = curr.items[el];
          }

          if (terminal) {
            curr.errors.push(mapper(issue));
          }
          // curr = curr.properties[el];
          // const terminal = i === issue.path.length - 1;

          // if (!curr) {
          //   if (typeof el === "string") {
          //     result.properties = {};
          //   } else {
          //     (result as any).properties = [];
          //   }
          // }

          // // const curr: any = result.properties;
          // if (!terminal) {
          //   curr[el] = curr[el] || { errors: [] };
          // } else {
          //   curr[el] = curr[el] || { errors: [] };
          //   curr[el].errors.push(mapper(issue));
          // }

          // curr = curr[el];
          // curr = curr.properties[el];
          i++;
        }
      }
    }
  };
  processError(error);
  return result;
}

/** Format a ZodError as a human-readable string in the following form.
 *
 * From
 *
 * ```ts
 * ZodError {
 *   issues: [
 *     {
 *       expected: 'string',
 *       code: 'invalid_type',
 *       path: [ 'username' ],
 *       message: 'Invalid input: expected string'
 *     },
 *     {
 *       expected: 'number',
 *       code: 'invalid_type',
 *       path: [ 'favoriteNumbers', 1 ],
 *       message: 'Invalid input: expected number'
 *     }
 *   ];
 * }
 * ```
 *
 * to
 *
 * ```
 * username
 *   ✖ Expected number, received string at "username
 * favoriteNumbers[0]
 *   ✖ Invalid input: expected number
 * ```
 */
export function toDotPath(path: (string | number | symbol)[]): string {
  const segs: string[] = [];
  for (const seg of path) {
    if (typeof seg === "number") segs.push(`[${seg}]`);
    else if (typeof seg === "symbol") segs.push(`["${String(seg)}"]`);
    else if (seg.includes(".")) segs.push(`["${seg}"]`);
    else {
      if (segs.length) segs.push(".");
      segs.push(seg);
    }
  }

  return segs.join("");
}

export function prettifyError(error: $ZodError): string {
  // Create a Map to group issues by path
  // const issuesMap = new Map<string, string[]>();
  const lines: string[] = [];
  // issuesMap.set("", []);

  // if(error.issues.every(issue => issue.path.length === 0)) {
  //   return error.issues.map(issue => `✖ ${issue.message}`).join("\n");
  // }

  // sort by path length
  const issues = [...error.issues].sort((a, b) => a.path.length - b.path.length);

  // Process each issue
  for (const issue of issues) {
    lines.push(`✖ ${issue.message}`);
    if (issue.path?.length) lines.push(`  → at ${toDotPath(issue.path)}`);
  }

  // Convert Map to formatted string
  return lines.join("\n");
}
