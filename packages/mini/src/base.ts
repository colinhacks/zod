// import type * as _schemas from "./_schemas.js";
// import type * as errors from "./errors.js";
// import * as util from "./util.js";

// //////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
// interface Trait {
//   _zod: { def: unknown };
// }

// export interface $constructor<T extends Trait, D = T["_zod"]["def"]> {
//   new (def: D): T;
//   init(inst: T, def: D): asserts inst is T;
//   extend(fns: Record<string, (this: T, ...args: any) => any>): void;
//   fns: Record<string, (...args: any) => any>;
// }

// export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends Trait, D = T["_zod"]["def"]>(
//   name: string,
//   initializer: (inst: T, def: D) => void
// ): $constructor<T> {
//   class _ {
//     constructor(def: D) {
//       const th = this as any;
//       th._deferred ??= [];
//       _.init(th, def);
//       for (const fn of th._deferred) {
//         fn();
//       }
//     }
//     static init(inst: T, def: D) {
//       (inst as any)._traits ??= new Set();
//       (inst as any)._traits.add(name);
//       initializer(inst, def);
//       // support prototype modifications
//       for (const k in _.prototype) {
//         Object.defineProperty(inst, k, { value: (_.prototype as any)[k].bind(inst) });
//       }
//       (inst as any)._constr = _;
//       (inst as any)._def = def;
//     }

//     static [Symbol.hasInstance](inst: any) {
//       return inst?._traits?.has(name);
//     }
//   }
//   Object.defineProperty(_, "name", { value: name });
//   return _ as any;
// }

// /////////////////////////////   PARSE   //////////////////////////////

// export interface ParseContext {
//   /** Customize error messages. */
//   readonly error?: errors.$ZodErrorMap<never>;
//   /** Include the `input` field in issue objects. Default `false`. */
//   readonly reportInput?: boolean;
//   /** Skip eval-based fast path. Default `false`. */
//   readonly skipFast?: boolean;
//   /** Abort validation after the first error. Default `false`. */
//   readonly abortEarly?: boolean;
// }

// /** @internal */
// export interface ParseContextInternal extends ParseContext {
//   readonly async?: boolean | undefined;
// }

// export interface ParsePayload<T = unknown> {
//   value: T;
//   issues: errors.$ZodRawIssue[];
//   $payload: true;
// }

// /////////////////////////////   ZODRESULT   //////////////////////////////

// //////////////////////////////////////////////////////////////////////////////

// export type ZodSchemaTypes =
//   | "string"
//   | "number"
//   | "int"
//   | "boolean"
//   | "bigint"
//   | "symbol"
//   | "null"
//   | "undefined"
//   | "void" // merge with undefined?
//   | "never"
//   | "any"
//   | "unknown"
//   | "date"
//   | "object"
//   | "interface"
//   | "record"
//   | "file"
//   | "array"
//   | "tuple"
//   | "union"
//   | "intersection"
//   | "map"
//   | "set"
//   | "enum"
//   | "literal"
//   | "nullable"
//   | "optional"
//   | "nonoptional"
//   | "success"
//   | "transform"
//   | "default"
//   | "catch"
//   | "nan"
//   | "branded"
//   | "pipe"
//   | "readonly"
//   | "template_literal"
//   | "promise"
//   | "custom";
// // | "const"
// // | "coalesce"
// // | "preprocess"
// // | "effect"
// // | "function"

// export type $IO<O, I> = { output: O; input: I };
// export const BRAND: unique symbol = Symbol("zod_brand");
// export type $brand<T extends string | number | symbol = string | number | symbol> = {
//   [BRAND]: { [k in T]: true };
// };

// export class $ZodAsyncError extends Error {
//   constructor() {
//     super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
//   }
// }

// export type $DiscriminatorMapElement = {
//   values: Set<util.Primitive>;
//   maps: $DiscriminatorMap[];
// };
// export type $DiscriminatorMap = Map<PropertyKey, $DiscriminatorMapElement>;
// export type $PrimitiveSet = Set<util.Primitive>;

// export type $ZodCheckFn<T> = (input: ParsePayload<T>) => util.MaybeAsync<void>;

// // export interface _schemas._$ZodType<O = unknown, I = unknown> {
// //   _zod: _schemas._$ZodType<O, I>;
// // }
// // export const _schemas._$ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
// //   if (!inst._zod) throw new Error("Must set _zod property before initializing.");
// // });

// export type $type<T extends _schemas._$ZodType> = { _zod: T };

// // export const _schemas._$ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
// //   inst._zod ??= {} as any;
// //   inst._zod.id = def.type + "_" + util.randomString(10);
// //   inst._zod.def = def; // set _def property
// //   inst._zod.computed = inst._zod.computed || {}; // initialize _computed object

// //   // inst.$check = (...checks) => {
// //   //   return inst.$clone({
// //   //     ...def,
// //   //     checks: [
// //   //       ...(def.checks ?? []),
// //   //       ...checks.map((ch) => (typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" } } } : ch)),
// //   //     ],
// //   //   });
// //   // };
// //   // inst.$clone = (_def) => clone(inst, _def ?? def);
// //   // inst.$brand = () => inst as any;
// //   // inst.$register = ((reg: any, meta: any) => {
// //   //   reg.add(inst, meta);
// //   //   return inst;
// //   // }) as any;

// //   const checks = [...(inst._zod.def.checks ?? [])];

// //   // if inst is itself a $ZodCheck, run it as a check
// //   if (inst._zod.traits.has("$ZodCheck")) {
// //     checks.unshift(inst as any);
// //   }
// //   //

// //   for (const ch of checks) {
// //     ch._zod.onattach?.(inst);
// //   }

// //   if (checks.length === 0) {
// //     // deferred initializer
// //     // inst._zod.parse is not yet defined
// //     inst._zod.run = (a, b) => inst._zod.parse(a, b);
// //     inst._zod.deferred?.push(() => {
// //       inst._zod.run = inst._zod.parse;
// //     });
// //   } else {
// //     //
// //     // let runChecks = (result: ParsePayload<any>): util.MaybeAsync<ParsePayload> => {
// //     //   return result;
// //     // };

// //     // for (const ch of checks.slice().reverse()) {
// //     //   const _curr = runChecks;
// //     //   runChecks = (result) => {
// //     //     const numIssues = result.issues.length;
// //     //     const _ = ch._zod.check(result as any);
// //     //     if (_ instanceof Promise) {
// //     //       return _.then((_) => {
// //     //         const len = result.issues.length;
// //     //         if (len > numIssues && util.aborted(result)) return result;
// //     //         return _curr(result);
// //     //       });
// //     //     }

// //     //     // if ch has "when", run it
// //     //     // if (ch._zod.def.when) {
// //     //     // }
// //     //     // otherwise, check if parse has aborted and return
// //     //     if (util.aborted(result)) return result;
// //     //     // if not aborted, continue running checks
// //     //     return _curr(result);
// //     //   };
// //     // }

// //     const runChecks = (
// //       payload: ParsePayload,
// //       checks: $ZodCheck<never>[],
// //       ctx?: ParseContextInternal | undefined
// //     ): util.MaybeAsync<ParsePayload> => {
// //       let isAborted = util.aborted(payload);
// //       let asyncResult!: Promise<unknown> | undefined;
// //       for (const ch of checks) {
// //         if (ch._zod.when) {
// //           const shouldRun = ch._zod.when(payload);

// //           if (!shouldRun) continue;
// //         } else {
// //           if (isAborted) {
// //             continue;
// //           }
// //         }

// //         const currLen = payload.issues.length;
// //         const _ = ch._zod.check(payload as any) as any as ParsePayload;
// //         if (_ instanceof Promise && ctx?.async === false) {
// //           throw new $ZodAsyncError();
// //         }
// //         if (asyncResult || _ instanceof Promise) {
// //           asyncResult = asyncResult ?? Promise.resolve();
// //           asyncResult.then(async () => {
// //             await _;
// //             const nextLen = payload.issues.length;
// //             if (nextLen === currLen) return;
// //             if (!isAborted) isAborted = util.aborted(payload, currLen);
// //           });
// //         } else {
// //           const nextLen = payload.issues.length;
// //           if (nextLen === currLen) continue;
// //           if (!isAborted) isAborted = util.aborted(payload, currLen);
// //         }
// //       }

// //       if (asyncResult) {
// //         return asyncResult.then(() => {
// //           return payload;
// //         });
// //       }
// //       return payload;
// //     };

// //     inst._zod.run = (payload, ctx) => {
// //       const result = inst._zod.parse(payload, ctx);

// //       if (result instanceof Promise) {
// //         if (ctx.async === false) throw new $ZodAsyncError();
// //         return result.then((result) => runChecks(result, checks, ctx));
// //       }

// //       return runChecks(result, checks, ctx);
// //     };
// //   }
// // });

// ////////////////////////////  TYPE HELPERS  ///////////////////////////////////

// export type input<T extends _schemas._$ZodType> = T["_zod"]["input"]; // extends object ? util.Flatten<T["_input"]> : T["_input"];
// export type output<T extends _schemas._$ZodType> = T["_zod"]["output"]; // extends object ? util.Flatten<T["_output"]> : T["_output"];
// export type { output as infer };

// function unwrapMessage(message: string | { message: string } | undefined | null): string | undefined {
//   return typeof message === "string" ? message : message?.message;
// }

// export function finalizeIssue(iss: errors.$ZodRawIssue, ctx: ParseContextInternal | undefined): errors.$ZodIssue {
//   const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
//   // for backwards compatibility
//   // const _ctx: errors.$ZodErrorMapCtx = { data: iss.input, defaultError: undefined as any };
//   if (!iss.message) {
//     const message =
//       unwrapMessage(iss.inst?._zod.def?.error?.(iss as never)) ??
//       unwrapMessage(ctx?.error?.(iss as never)) ??
//       unwrapMessage(config().customError?.(iss)) ??
//       unwrapMessage(config().localeError?.(iss)) ??
//       "Invalid input";
//     full.message = message;
//   }

//   // delete (full as any).def;
//   delete (full as any).inst;
//   delete (full as any).continue;
//   if (!ctx?.reportInput) {
//     delete full.input;
//   }
//   return full;
// }

// const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
// export class $ZodError<T = unknown> implements Error {
//   /** @deprecated Virtual property, do not access. */
//   _t!: T;
//   public issues: errors.$ZodIssue[];
//   name!: string;
//   stack?: string;

//   get message(): string {
//     return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
//   }

//   constructor(issues: errors.$ZodIssue[]) {
//     Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
//     Object.defineProperty(this, "name", { value: "$ZodError", enumerable: false });
//     this.issues = issues;
//   }

//   static [Symbol.hasInstance](inst: any) {
//     return inst?._tag === ZOD_ERROR;
//   }

//   static assert(value: unknown): asserts value is $ZodError {
//     if (!(value instanceof $ZodError)) {
//       throw new Error(`Not a $ZodError: ${value}`);
//     }
//   }
// }

// //////////////////////////////   CONFIG   ///////////////////////////////////////

// export interface $ZodConfig {
//   /** Custom error map. Overrides `config().localeError`. */
//   customError?: errors.$ZodErrorMap | undefined;
//   /** Localized error map. Lowest priority. */
//   localeError?: errors.$ZodErrorMap | undefined;
// }

// export const globalConfig: $ZodConfig = {};

// export function config(config?: Partial<$ZodConfig>): $ZodConfig {
//   if (config) Object.assign(globalConfig, config);
//   return globalConfig;
// }

// ///////////////////    ERROR UTILITIES   ////////////////////////

// // flatten
// export type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
// type _FlattenedError<T, U = string> = {
//   formErrors: U[];
//   fieldErrors: {
//     [P in keyof T]?: U[];
//   };
// };

// export function flattenError<T>(error: $ZodError<T>): _FlattenedError<T>;
// export function flattenError<T, U>(error: $ZodError<T>, mapper?: (issue: errors.$ZodIssue) => U): _FlattenedError<T, U>;
// export function flattenError(error: $ZodError, mapper = (issue: errors.$ZodIssue) => issue.message): any {
//   const fieldErrors: any = {};
//   const formErrors: any[] = [];
//   for (const sub of error.issues) {
//     if (sub.path.length > 0) {
//       fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
//       fieldErrors[sub.path[0]].push(mapper(sub));
//     } else {
//       formErrors.push(mapper(sub));
//     }
//   }
//   return { formErrors, fieldErrors };
// }

// // format
// // export type $ZodFormattedError<T, U = string> = T extends any ? util.Flatten<_ZodFormattedError<T, U>> : never;
// // type _ZodFormattedError<T, U = string> = {
// //   _errors: U[];
// // } & (T extends [any, ...any[]]
// //   ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
// //   : T extends any[]
// //     ? { [k: number]: $ZodFormattedError<T[number], U> }
// //     : T extends object
// //       ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
// //       : unknown);
// // type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
// //   ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
// //   : T extends any[]
// //     ? { [k: number]: $ZodFormattedError<T[number], U> }
// //     : T extends object
// //       ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
// //       : any;

// export type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
//   ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
//   : T extends any[]
//     ? { [k: number]: $ZodFormattedError<T[number], U> }
//     : T extends object
//       ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
//       : any;

// export type $ZodFormattedError<T, U = string> = {
//   _errors: U[];
// } & util.Flatten<_ZodFormattedError<T, U>>;

// export function formatError<T>(error: $ZodError<T>): $ZodFormattedError<T>;
// export function formatError<T, U>(
//   error: $ZodError<T>,
//   mapper?: (issue: errors.$ZodIssue) => U
// ): $ZodFormattedError<T, U>;
// export function formatError<T>(error: $ZodError, _mapper?: any) {
//   const mapper: (issue: errors.$ZodIssue) => any =
//     _mapper ||
//     function (issue: errors.$ZodIssue) {
//       return issue.message;
//     };
//   const fieldErrors: $ZodFormattedError<T> = { _errors: [] } as any;
//   const processError = (error: { issues: errors.$ZodIssue[] }) => {
//     for (const issue of error.issues) {
//       if (issue.code === "invalid_union") {
//         issue.errors.map((issues) => processError({ issues }));
//       } else if (issue.code === "invalid_key") {
//         processError({ issues: issue.issues });
//       } else if (issue.code === "invalid_element") {
//         processError({ issues: issue.issues });
//       } else if (issue.path.length === 0) {
//         (fieldErrors as any)._errors.push(mapper(issue));
//       } else {
//         let curr: any = fieldErrors;
//         let i = 0;
//         while (i < issue.path.length) {
//           const el = issue.path[i];
//           const terminal = i === issue.path.length - 1;

//           if (!terminal) {
//             curr[el] = curr[el] || { _errors: [] };
//           } else {
//             curr[el] = curr[el] || { _errors: [] };
//             curr[el]._errors.push(mapper(issue));
//           }

//           curr = curr[el];
//           i++;
//         }
//       }
//     }
//   };
//   processError(error);
//   return fieldErrors;
// }
