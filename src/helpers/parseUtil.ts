// import type { ZodIssueOptionalMessage } from "..";
// import { getErrorMap } from "../errors";
// import defaultErrorMap from "../locales/en";
// import type { IssueData, ZodErrorMap, ZodIssue } from "../ZodError";
// import type { ZodParsedType } from "./util";

// export const makeIssue = (
//   data: any,
//   // // path: Path,
//   // errorMaps: ZodErrorMap[],
//   issueData: IssueData,
//   contextualErrorMap: ZodErrorMap | undefined | null,
//   schemaErrorMap: ZodErrorMap | undefined | null
// ): ZodIssue => {
//   const fullPath = [...(issueData.path || [])];
//   const fullIssue: ZodIssueOptionalMessage = {
//     ...issueData,
//     path: fullPath,
//     fatal: issueData.fatal ?? true,
//   };
//   // message is explicitly set
//   if (issueData.message) return fullIssue as ZodIssue;

//   let errorMessage = "";
//   const errorMaps = [
//     contextualErrorMap, // contextual error map is first priority
//     schemaErrorMap, // then schema-bound map if available
//     getErrorMap(), // then global override map
//     defaultErrorMap, // then global default map
//   ].filter((x) => !!x) as ZodErrorMap[];
//   const maps = errorMaps
//     .filter((m) => !!m)
//     .slice()
//     .reverse() as ZodErrorMap[];
//   for (const map of maps) {
//     errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
//   }

//   fullIssue.message = errorMessage;
//   return fullIssue as ZodIssue;
//   // return {
//   //   ...issueData,
//   //   path: fullPath,
//   //   message: issueData.message || errorMessage,
//   // };
// };

// export type ParseParams = {
//   path: (string | number)[];
//   errorMap: ZodErrorMap;
//   // async: boolean;
// };

// export type ParsePathComponent = string | number;
// export type ParsePath = ParsePathComponent[];
// export const EMPTY_PATH: ParsePath = [];

<<<<<<< HEAD
// export interface GlobalParseContext {
//   readonly issues: ZodIssue[];
//   readonly contextualErrorMap?: ZodErrorMap;
//   readonly async: boolean;
// }
=======
export interface ParseContext {
  readonly common: {
    readonly issues: ZodIssue[];
    readonly contextualErrorMap?: ZodErrorMap;
    readonly async: boolean;
  };
  readonly path: ParsePath;
  readonly schemaErrorMap?: ZodErrorMap | undefined;
  readonly parent: ParseContext | null;
  readonly data: any;
  readonly parsedType: ZodParsedType;
}
>>>>>>> c8c8cb9 (WIP)

// export interface LocalParseContext {
//   readonly path: ParsePath;
//   readonly schemaErrorMap?: ZodErrorMap;
//   readonly parent: ParseContext | null;
//   readonly data: any;
//   readonly parsedType: ZodParsedType;
// }

// export class ZodInternalError {
//   constructor(public issues: ZodIssue[]) {}
//   // aborted: boolean = false;
//   get aborted() {
//     return this.issues.some((iss) => iss.fatal === true);
//   }
//   addIssue(...args: Parameters<typeof makeIssue>) {
//     this.issues.push(makeIssue(...args));
//     return this;
//   }
//   addIssues(issues: ZodIssue[]) {
//     this.issues.unshift(...issues);
//     return this;
//   }
//   merge(err: ZodInternalError, path?: PathSegment) {
//     this.issues.unshift(...(path ? err.prefix(path).issues : err.issues));
//     // if (err.aborted) this.aborted = true;
//     return this;
//   }
//   // abort() {
//   // this.aborted = true;
//   //   return this;
//   // }
//   prefix(prefix: string | number | symbol) {
//     this.issues = this.issues.map((issue) => ({
//       ...issue,
//       path: [prefix, ...issue.path],
//     }));
//     return this;
//   }
// }
// // const err = new ZodInternalError([]);

// export type PathSegment = string | number | symbol;
// export type Path = PathSegment[];

// export class LazyPath {
//   _resolved?: null | Path = null;
//   cache: Map<PathSegment, LazyPath> = new Map();
//   segment: PathSegment | null;
//   parent: LazyPath | null;
//   constructor(parent: LazyPath | null, segment: PathSegment | null) {
//     this.parent = parent;
//     this.segment = segment;
//   }

//   static from(path?: PathSegment[]) {
//     if (!path) return BASE_PATH;
//     let created = BASE_PATH;
//     for (const segment of path) {
//       created = created.child(segment);
//     }
//     return created;
//   }

//   child(segment: PathSegment) {
//     if (this.cache.has(segment)) {
//       // console.log(`LazyPath: cache hit`);
//       return this.cache.get(segment)!;
//     }
//     const newPath = new LazyPath(this, segment);
//     this.cache.set(segment, newPath);
//     return newPath;
//   }

//   resolve() {
//     if (this._resolved) return this._resolved;
//     const segments: PathSegment[] = [];
//     let current: LazyPath | null = this;
//     while (current !== null) {
//       if (current.segment) segments.unshift(current.segment);
//       current = current.parent;
//     }
//     this._resolved = segments;
//     return segments;
//   }
// }
// const BASE_PATH = new LazyPath(null, null);

// // export const BASEPATH = LazyPath.from();

// // export interface ParseContext {
// //   readonly common: {
// //     readonly issues: ZodIssue[];
// //     readonly contextualErrorMap?: ZodErrorMap;
// //     readonly async: boolean;
// //   };
// //   readonly path: ParsePath;
// //   readonly schemaErrorMap?: ZodErrorMap;
// //   readonly parent: ParseContext | null;
// //   readonly data: any;
// //   readonly parsedType: ZodParsedType;
// // }

// export class ParseContext {
//   constructor(
//     // public issues: ZodIssue[],
//     // public async: boolean,
//     public errorMap: ZodErrorMap | null,
//     public async: boolean
//   ) {}

//   // addIssue(
//   //   data: unknown,
//   //   path: Path,
//   //   issueData: IssueData,
//   //   schemaErrorMap?: ZodErrorMap
//   // ): void {
//   //   // const issue = makeIssue(
//   //   //   data,
//   //   //   path,
//   //   //   [
//   //   //     this.errorMap, // contextual error map is first priority
//   //   //     schemaErrorMap, // then schema-bound map if available
//   //   //     getErrorMap(), // then global override map
//   //   //     defaultErrorMap, // then global default map
//   //   //   ].filter((x) => !!x) as ZodErrorMap[],
//   //   //   issueData
//   //   // );
//   //   this.issues.push(this.makeIssue(data, path, issueData, schemaErrorMap));
//   // }
// }

// export type ParseInput = {
//   data: any;
//   path: (string | number)[];
//   parent: ParseContext;
// };

// // export function addIssueToContext(
// //   ctx: ParseContext,
// //   issueData: IssueData
// // ): void {
// //   const issue = makeIssue({
// //     issueData: issueData,
// //     data: ctx.data,
// //     path: ctx.path,
// //     errorMaps: [
// //       ctx.common.contextualErrorMap, // contextual error map is first priority
// //       ctx.schemaErrorMap, // then schema-bound map if available
// //       getErrorMap(), // then global override map
// //       defaultErrorMap, // then global default map
// //     ].filter((x) => !!x) as ZodErrorMap[],
// //   });
// //   ctx.common.issues.push(issue);
// // }

// export type ObjectPair = {
//   key: SyncParseReturnType<any>;
//   value: SyncParseReturnType<any>;
// };
// export class ParseStatus {
//   value: "aborted" | "dirty" | "valid" = "valid";
//   dirty() {
//     if (this.value === "valid") this.value = "dirty";
//   }
//   abort() {
//     if (this.value !== "aborted") this.value = "aborted";
//   }

//   static mergeArray(
//     status: ParseStatus,
//     results: SyncParseReturnType<any>[]
//   ): SyncParseReturnType {
//     const arrayValue: any[] = [];
//     for (const s of results) {
//       if (s.status === "aborted") return INVALID;
//       if (s.status === "dirty") status.dirty();
//       arrayValue.push(s.value);
//     }

//     return { status: status.value, value: arrayValue };
//   }

//   static async mergeObjectAsync(
//     status: ParseStatus,
//     pairs: { key: ParseReturnType<any>; value: ParseReturnType<any> }[]
//   ): Promise<SyncParseReturnType<any>> {
//     const syncPairs: ObjectPair[] = [];
//     for (const pair of pairs) {
//       syncPairs.push({
//         key: await pair.key,
//         value: await pair.value,
//       });
//     }
//     return ParseStatus.mergeObjectSync(status, syncPairs);
//   }

//   static mergeObjectSync(
//     status: ParseStatus,
//     pairs: {
//       key: SyncParseReturnType<any>;
//       value: SyncParseReturnType<any>;
//       alwaysSet?: boolean;
//     }[]
//   ): SyncParseReturnType {
//     const finalObject: any = {};
//     for (const pair of pairs) {
//       const { key, value } = pair;
//       if (key.status === "aborted") return INVALID;
//       if (value.status === "aborted") return INVALID;
//       if (key.status === "dirty") status.dirty();
//       if (value.status === "dirty") status.dirty();

//       if (
//         key.value !== "__proto__" &&
//         (typeof value.value !== "undefined" || pair.alwaysSet)
//       ) {
//         finalObject[key.value] = value.value;
//       }
//     }

//     return { status: status.value, value: finalObject };
//   }
// }
// export interface ParseResult {
//   status: "aborted" | "dirty" | "valid";
//   data: any;
// }

// export type INVALID = { status: "aborted" };
// export const INVALID: INVALID = Object.freeze({
//   status: "aborted",
// });

// export type DIRTY<T> = { status: "dirty"; value: T };
// export const DIRTY = <T>(value: T): DIRTY<T> => ({ status: "dirty", value });

// export type OK<T> = { status: "valid"; value: T };
// export const OK = <T>(value: T): OK<T> => ({ status: "valid", value });

// export type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;
// export type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;

// export type ParseReturnType<T> =
//   | SyncParseReturnType<T>
//   | AsyncParseReturnType<T>;

// export const isAborted = (x: ParseReturnType<any>): x is INVALID =>
//   (x as any).status === "aborted";
// export const isDirty = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> =>
//   (x as any).status === "dirty";
// export const isValid = <T>(x: ParseReturnType<T>): x is OK<T> | DIRTY<T> =>
//   (x as any).status === "valid";
// export const isAsync = <T>(
//   x: ParseReturnType<T>
// ): x is AsyncParseReturnType<T> =>
//   typeof Promise !== "undefined" && x instanceof Promise;

export {};
