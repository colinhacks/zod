import type * as errors from "./errors.js";
import * as util from "./util.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
interface Trait {
  _def: unknown;
}

export interface $constructor<T extends Trait> {
  new (def: T["_def"]): T;
  init(inst: T | {}, def: T["_def"]): asserts inst is T;
  extend(fns: Record<string, (this: T, ...args: any) => any>): void;
  fns: Record<string, (...args: any) => any>;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends Trait, D = T["_def"]>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T> {
  class _ {
    constructor(def: D) {
      const th = this as any;
      th._deferred ??= [];
      _.init(th, def);
      for (const fn of th._deferred) {
        fn();
      }
    }
    static init(inst: T, def: D) {
      (inst as any)._traits ??= new Set();
      (inst as any)._traits.add(name);
      initializer(inst, def);
      // support prototype modifications
      for (const k in _.prototype) {
        Object.defineProperty(inst, k, { value: (_.prototype as any)[k].bind(inst) });
      }
      (inst as any)._constr = _;
      (inst as any)._def = def;
    }

    static [Symbol.hasInstance](inst: any) {
      return inst?._traits?.has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

/////////////////////////////   PARSE   //////////////////////////////

export interface $ParseContext {
  /** Customize error messages. */
  readonly error?: errors.$ZodErrorMap<never>;
  /** Include the `input` field in issue objects. Default `false`. */
  readonly reportInput?: boolean;
  /** Skip eval-based fast path. Default `false`. */
  readonly skipFast?: boolean;
  /** Abort validation after the first error. Default `false`. */
  readonly abortEarly?: boolean;
}

/** @internal */
export interface $InternalParseContext extends $ParseContext {
  readonly async?: boolean | undefined;
}

export interface $ParsePayload<T = unknown> {
  value: T;
  issues: errors.$ZodRawIssue[];
  $payload: true;
}

/////////////////////////////   ZODRESULT   //////////////////////////////

//////////////////////////////////////////////////////////////////////////////

export type $ZodSchemaTypes =
  | "string"
  | "number"
  | "int"
  | "boolean"
  | "bigint"
  | "symbol"
  | "null"
  | "undefined"
  | "void" // merge with undefined?
  | "never"
  | "any"
  | "unknown"
  | "date"
  | "object"
  | "interface"
  | "record"
  | "file"
  | "array"
  | "tuple"
  | "union"
  | "intersection"
  | "map"
  | "set"
  | "enum"
  | "literal"
  // | "const"
  | "nullable"
  | "optional"
  | "nonoptional"
  // | "coalesce"
  | "success"
  // | "preprocess"
  // | "effect"
  | "transform"
  | "default"
  | "catch"
  | "nan"
  | "branded"
  | "pipe"
  | "readonly"
  | "template_literal"
  | "promise"
  | "function"
  | "custom";

export type $IO<O, I> = { output: O; input: I };
export const BRAND: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};

export type $DiscriminatorMapElement = {
  values: Set<util.Primitive>;
  maps: $DiscriminatorMap[];
};
export type $DiscriminatorMap = Map<PropertyKey, $DiscriminatorMapElement>;
export type $PrimitiveSet = Set<util.Primitive>;

export type $ZodCheckFn<T> = (input: $ParsePayload<T>) => util.MaybeAsync<void>;

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  // description?: string | undefined;
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}

// @ts-ignore
// type _Zod<T = {}> = T & {
//   /** @deprecated Internal API, use with caution. Not deprecated. */
//   _id: string;
//   /** @deprecated Internal API, use with caution. */
//   // _standard: number;
//   /** @deprecated Internal API, use with caution. */
//   // _types: $IO<this["_output"], this["_input"]>;
//   /** @deprecated Internal API, use with caution. */
//   _output: O;
//   /** @deprecated Internal API, use with caution. */
//   _input: I;
//   /** @deprecated List of deferred initializations */
//   _deferred?: util.AnyFunc[];

//   /** @deprecated Internal API, use with caution. Stores identifiers for the set of traits implemented by this schema. */
//   _traits: Set<string>;
//   /** @deprecated Internal API, use with caution.
//    *
//    * Indicates that a schema output type should be considered optional inside objects.  */
//   _qout?: "true" | undefined;
//   /** @deprecated Internal API, use with caution.
//    *
//    * Indicates that a schema input type should be considered optional inside objects. */
//   _qin?: "true" | undefined;
//   /** @deprecated Internal API, use with caution. A set of literal discriminators used for the fast path in discriminated unions. */
//   _disc?: $DiscriminatorMap;
//   /** @deprecated Internal API, use with caution. The set of literal values that will pass validation. Must be an exhaustive set. Used to determine optionality inside record schemas.
//    *
//    * Defined on: enum, const, literal, null, undefined
//    * Passthrough: optional, nullable, branded, default, catch, pipe
//    * Todo: unions?
//    */
//   _values?: $PrimitiveSet | undefined;
//   /** @deprecated Internal API, use with caution. */
//   _def: $ZodTypeDef;
//   /** @deprecated Internal API, use with caution.
//    *
//    * The constructor function of this schema.
//    */
//   _constr: new (
//     def: any
//   ) => any;
//   /** @deprecated Internal API, use with caution. */
//   _computed: Record<string, any>;
//   /** The set of issues this schema might throw during type checking. */
//   _isst?: errors.$ZodIssueBase;
// };

export interface $Zod<T extends $ZodType = $ZodType> {
  _zod: T;
}

export interface $ZodType<out O = unknown, out I = unknown> {
  $check(...checks: ($ZodCheckFn<this["_output"]> | $ZodCheck<this["_output"]>)[]): this;
  $clone(def?: this["_def"]): this;
  $register<R extends $ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [$ZodRegistry<R["_meta"], this>["_meta"]?]
        : [$ZodRegistry<R["_meta"], this>["_meta"]]
      : ["Incompatible schema"]
  ): this;
  $brand<T extends PropertyKey = PropertyKey>(
    value?: T
  ): this & {
    _output: O & $brand<T>;
  };

  _zod: this;

  // assertInput<T>(...args: T extends I ? [] : ["Invalid input type"]): void;
  // assertOutput<T>(...args: T extends O ? [] : ["Invalid output type"]): void;

  // _zod: _Zod;
  /** @deprecated Internal API, use with caution. Not deprecated. */
  _id: string;
  /** @deprecated Internal API, use with caution. */
  // _standard: number;
  /** @deprecated Internal API, use with caution. */
  // _types: $IO<this["_output"], this["_input"]>;
  /** @deprecated Internal API, use with caution. */
  _output: O;
  /** @deprecated Internal API, use with caution. */
  _input: I;
  /** @deprecated List of deferred initializations */
  _deferred?: util.AnyFunc[];

  /** @deprecated Internal API, use with caution. */
  _run(payload: $ParsePayload<any>, ctx: $InternalParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. */
  _parse(payload: $ParsePayload<any>, ctx: $InternalParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. Stores identifiers for the set of traits implemented by this schema. */
  _traits: Set<string>;
  /** @deprecated Internal API, use with caution.
   *
   * Indicates that a schema output type should be considered optional inside objects.  */
  _qout?: "true" | undefined;
  /** @deprecated Internal API, use with caution.
   *
   * Indicates that a schema input type should be considered optional inside objects. */
  _qin?: "true" | undefined;
  /** @deprecated Internal API, use with caution. A set of literal discriminators used for the fast path in discriminated unions. */
  _disc?: $DiscriminatorMap;
  /** @deprecated Internal API, use with caution. The set of literal values that will pass validation. Must be an exhaustive set. Used to determine optionality inside record schemas.
   *
   * Defined on: enum, const, literal, null, undefined
   * Passthrough: optional, nullable, branded, default, catch, pipe
   * Todo: unions?
   */
  _values?: $PrimitiveSet | undefined;
  // _pattern?: RegExp;
  /** @deprecated Internal API, use with caution. */
  _def: $ZodTypeDef;
  /** @deprecated Internal API, use with caution.
   *
   * The constructor function of this schema.
   */
  _constr: new (
    def: any
  ) => any;
  /** @deprecated Internal API, use with caution. */
  _computed: Record<string, any>;
  /** The set of issues this schema might throw during type checking. */
  _isst?: errors.$ZodIssueBase;
}

export function clone<T extends $ZodType>(inst: T, def: T["_def"]): T {
  return new inst._constr(def);
}

export class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}
export const $ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
  inst._id = def.type + "_" + util.randomString(10);
  inst._def = def; // set _def property
  inst._computed = inst._computed || {}; // initialize _computed object

  inst.$check = (...checks) => {
    return inst.$clone({
      ...def,
      checks: [
        ...(def.checks ?? []),
        ...checks.map((ch) => (typeof ch === "function" ? { _check: ch, _def: { check: "custom" } } : ch)),
      ],
    });
  };
  inst.$clone = (_def) => clone(inst, _def ?? def);
  inst.$brand = () => inst as any;
  inst.$register = ((reg: any, meta: any) => {
    reg.add(inst, meta);
    return inst;
  }) as any;

  const checks = [...(inst._def.checks ?? [])];

  // if inst is itself a $ZodCheck, run it as a check
  if (inst._traits.has("$ZodCheck")) {
    checks.unshift(inst as any);
  }
  //

  for (const ch of checks) {
    ch._onattach?.(inst);
  }

  if (checks.length === 0) {
    // deferred initializer
    // inst._parse is not yet defined
    inst._run = (a, b) => inst._parse(a, b);
    inst._deferred?.push(() => {
      inst._run = inst._parse;
    });
  } else {
    //
    // let runChecks = (result: $ParsePayload<any>): util.MaybeAsync<$ParsePayload> => {
    //   return result;
    // };

    // for (const ch of checks.slice().reverse()) {
    //   const _curr = runChecks;
    //   runChecks = (result) => {
    //     const numIssues = result.issues.length;
    //     const _ = ch._check(result as any);
    //     if (_ instanceof Promise) {
    //       return _.then((_) => {
    //         const len = result.issues.length;
    //         if (len > numIssues && util.aborted(result)) return result;
    //         return _curr(result);
    //       });
    //     }

    //     // if ch has "when", run it
    //     // if (ch._def.when) {
    //     // }
    //     // otherwise, check if parse has aborted and return
    //     if (util.aborted(result)) return result;
    //     // if not aborted, continue running checks
    //     return _curr(result);
    //   };
    // }

    const runChecks = (
      payload: $ParsePayload,
      checks: $ZodCheck<never>[],
      ctx?: $InternalParseContext | undefined
    ): util.MaybeAsync<$ParsePayload> => {
      let isAborted = util.aborted(payload);
      let asyncResult!: Promise<unknown> | undefined;
      for (const ch of checks) {
        if (ch._when) {
          const shouldRun = ch._when(payload);

          if (!shouldRun) continue;
        } else {
          if (isAborted) {
            continue;
          }
        }

        const currLen = payload.issues.length;
        const _ = ch._check(payload as any) as any as $ParsePayload;
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = asyncResult ?? Promise.resolve();
          asyncResult.then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen) return;
            if (!isAborted) isAborted = util.aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen) continue;
          if (!isAborted) isAborted = util.aborted(payload, currLen);
        }
      }

      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };

    inst._run = (payload, ctx) => {
      const result = inst._parse(payload, ctx);

      if (result instanceof Promise) {
        if (ctx.async === false) throw new $ZodAsyncError();
        return result.then((result) => runChecks(result, checks, ctx));
      }

      return runChecks(result, checks, ctx);
    };
  }
});

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends $ZodType> = T["_input"]; // extends object ? util.Flatten<T["_input"]> : T["_input"];
export type output<T extends $ZodType> = T["_output"]; // extends object ? util.Flatten<T["_output"]> : T["_output"];
export type { output as infer };

function unwrapMessage(message: string | { message: string } | undefined | null): string | undefined {
  return typeof message === "string" ? message : message?.message;
}

export function finalizeIssue(iss: errors.$ZodRawIssue, ctx: $InternalParseContext | undefined): errors.$ZodIssue {
  const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
  // for backwards compatibility
  // const _ctx: errors.$ZodErrorMapCtx = { data: iss.input, defaultError: undefined as any };
  if (!iss.message) {
    const message =
      unwrapMessage(iss.inst?._def?.error?.(iss as never)) ??
      unwrapMessage(ctx?.error?.(iss as never)) ??
      unwrapMessage(config().customError?.(iss)) ??
      unwrapMessage(config().localeError?.(iss)) ??
      "Invalid input";
    full.message = message;
  }

  // delete (full as any).def;
  delete (full as any).inst;
  delete (full as any).continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError<T = unknown> implements Error {
  /** @deprecated Virtual property, do not access. */
  _t!: T;
  public issues: errors.$ZodIssue[];
  name!: string;
  stack?: string;

  get message(): string {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }

  constructor(issues: errors.$ZodIssue[]) {
    Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
    Object.defineProperty(this, "name", { value: "$ZodError", enumerable: false });
    this.issues = issues;
  }

  static [Symbol.hasInstance](inst: any) {
    return inst?._tag === ZOD_ERROR;
  }

  static assert(value: unknown): asserts value is $ZodError {
    if (!(value instanceof $ZodError)) {
      throw new Error(`Not a $ZodError: ${value}`);
    }
  }
}

//////////////////////////////   CONFIG   ///////////////////////////////////////

import type { $ZodRegistry } from "./registries.js";

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

//////////////////////////////   CHECKS   ///////////////////////////////////////

export interface $ZodCheckDef {
  check: string;
  error?: errors.$ZodErrorMap<never> | undefined;
  /** Whether parsing should be aborted if this check fails. */
  abort?: boolean | undefined;
  // when?: ((payload: $ParsePayload) => boolean) | undefined;
}

export interface $ZodCheck<in T = never> {
  _def: $ZodCheckDef;
  /** The set of issues this check might throw. */
  _issc?: errors.$ZodIssueBase;
  // "_check"(input: $ZodResult<T>): util.MaybeAsync<void>;
  _check(payload: $ParsePayload<T>): util.MaybeAsync<void>;
  // _parseB(payload: $ParsePayload<any>, ctx: $ParseContext): util.MaybeAsync<$ParsePayload>;
  _onattach?(schema: $ZodType): void;
  // "_async": boolean;
  _when?: ((payload: $ParsePayload) => boolean) | undefined;
}

export const $ZodCheck: $constructor<$ZodCheck<any>> = $constructor("$ZodCheck", (inst, def) => {
  inst._def = def;
});

///////////////////    ERROR UTILITIES   ////////////////////////

// flatten
export type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
type _FlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in keyof T]?: U[];
  };
};

export function flattenError<T>(error: $ZodError<T>): _FlattenedError<T>;
export function flattenError<T, U>(error: $ZodError<T>, mapper?: (issue: errors.$ZodIssue) => U): _FlattenedError<T, U>;
export function flattenError(error: $ZodError, mapper = (issue: errors.$ZodIssue) => issue.message): any {
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

// format
// export type $ZodFormattedError<T, U = string> = T extends any ? util.Flatten<_ZodFormattedError<T, U>> : never;
// type _ZodFormattedError<T, U = string> = {
//   _errors: U[];
// } & (T extends [any, ...any[]]
//   ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
//   : T extends any[]
//     ? { [k: number]: $ZodFormattedError<T[number], U> }
//     : T extends object
//       ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
//       : unknown);
// type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
//   ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
//   : T extends any[]
//     ? { [k: number]: $ZodFormattedError<T[number], U> }
//     : T extends object
//       ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
//       : any;

export type _ZodFormattedError<T, U = string> = T extends [any, ...any[]]
  ? { [K in keyof T]?: $ZodFormattedError<T[K], U> }
  : T extends any[]
    ? { [k: number]: $ZodFormattedError<T[number], U> }
    : T extends object
      ? util.Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U> }>
      : any;

export type $ZodFormattedError<T, U = string> = {
  _errors: U[];
} & util.Flatten<_ZodFormattedError<T, U>>;

export function formatError<T>(error: $ZodError<T>): $ZodFormattedError<T>;
export function formatError<T, U>(
  error: $ZodError<T>,
  mapper?: (issue: errors.$ZodIssue) => U
): $ZodFormattedError<T, U>;
export function formatError<T>(error: $ZodError, _mapper?: any) {
  const mapper: (issue: errors.$ZodIssue) => any =
    _mapper ||
    function (issue: errors.$ZodIssue) {
      return issue.message;
    };
  const fieldErrors: $ZodFormattedError<T> = { _errors: [] } as any;
  const processError = (error: { issues: errors.$ZodIssue[] }) => {
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
