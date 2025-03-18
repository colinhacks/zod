import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////

type ZodTrait = { _zod: { def: any; [k: string]: any } };
export interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
  new (def: D): T;
  init(inst: T, def: D): asserts inst is T;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T, D> {
  class _ {
    constructor(def: D) {
      const th = this as any;
      _.init(th, def);
      th._zod.deferred ??= [];
      for (const fn of th._zod.deferred) {
        fn();
      }
    }
    static init(inst: T, def: D) {
      inst._zod ??= {} as any;
      inst._zod.traits ??= new Set();
      // const seen = inst._zod.traits.has(name);

      inst._zod.traits.add(name);
      initializer(inst, def);
      // support prototype modifications
      for (const k in _.prototype) {
        Object.defineProperty(inst, k, { value: (_.prototype as any)[k].bind(inst) });
      }
      inst._zod.constr = _;
      inst._zod.def = def;
    }

    static [Symbol.hasInstance](inst: any) {
      return inst?._zod?.traits?.has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

// export interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
//   new (def: D): T;
//   init(inst: T, def: D): asserts inst is T;
// }

// export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(
//   name: string,
//   initializer: (inst: T, def: D) => void
// ): $constructor<T, D> {
//   return _$constructor(name, initializer);
// }

//////////////////////////////   UTILITIES   ///////////////////////////////////////
export const $brand: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
  [$brand]: { [k in T]: true };
};

export class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends schemas.$ZodType> = T["_zod"]["input"];
export type output<T extends schemas.$ZodType> = T["_zod"]["output"];
export type { output as infer };

// const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
// export class $ZodError<T = unknown> implements Error {
//   /** @deprecated Virtual property, do not access. */
//   _zod!: {type: T};
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

//////////////////////////////   CONFIG   ///////////////////////////////////////

export interface $ZodConfig {
  /** Custom error map. Overrides `config().localeError`. */
  customError?: errors.$ZodErrorMap | undefined;
  /** Localized error map. Lowest priority. */
  localeError?: errors.$ZodErrorMap | undefined;
}

export const globalConfig: $ZodConfig = {};

export function config(config?: Partial<$ZodConfig>): $ZodConfig {
  if (config) Object.assign(globalConfig, config);
  return globalConfig;
}

///////////////////    ERROR UTILITIES   ////////////////////////

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
