import type * as errors from "./errors.js";
import * as util from "./util.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
interface Trait {
  _def: unknown;
}

export interface $constructor<T extends Trait> {
  new (def: T["_def"]): T;
  init(inst: T, def: T["_def"]): void;
  extend(fns: Record<string, (this: T, ...args: any) => any>): void;
  fns: Record<string, (...args: any) => any>;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends Trait, D = T["_def"]>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T> {
  class _ {
    constructor(def: D) {
      _.init(this as any as T, def);
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
  readonly error?: errors.$ZodErrorMap<never>;
  readonly includeInputInErrors?: boolean;
  readonly skipFast?: boolean;
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

export function $aborted(x: $ParsePayload, startIndex = 0): boolean {
  // console.log("$aborted", `startIndex: ${startIndex}`);
  for (let i = startIndex; i < x.issues.length; i++) {
    // console.log("checking issue", i);
    if (x.issues[i].continue !== true) return true;
  }
  return false;
}

export function $continuable(issues: errors.$ZodRawIssue[]): boolean {
  return issues.every((iss) => iss.continue === true);
}

export function $prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => {
    iss.path ??= [];
    iss.path.unshift(path);
    return iss;
  });
}

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
  | "const"
  | "nullable"
  | "optional"
  | "required"
  | "success"
  | "preprocess"
  | "effect"
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

export type $CheckFn<T> = (input: $ParsePayload<T>) => util.MaybeAsync<void>;

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  description?: string | undefined;
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}

export interface $ZodType<out O = unknown, out I = unknown> {
  check(...checks: ($CheckFn<this["_output"]> | $ZodCheck<this["_output"]>)[]): this;
  // refine(...checks: ($ZodCheck<this["_output"]>)[]): this;
  clone(def?: this["_def"]): this;
  register<R extends $ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [R["_meta"]?]
        : [R["_meta"]]
      : ["Incompatible schema"]
  ): this;
  brand<T extends PropertyKey = PropertyKey, Output = this["_output"]>(): this & {
    _output: Output & $brand<T>;
  };

  // assertInput<T>(...args: T extends I ? [] : ["Invalid input type"]): void;
  // assertOutput<T>(...args: T extends O ? [] : ["Invalid output type"]): void;

  /** @deprecated Internal API, use with caution. Not deprecated. */
  _id: string;
  /** @deprecated Internal API, use with caution. */
  _standard: number;
  /** @deprecated Internal API, use with caution. */
  _types: $IO<this["_output"], this["_input"]>;
  /** @deprecated Internal API, use with caution. */
  _output: O;
  /** @deprecated Internal API, use with caution. */
  _input: I;

  /** @deprecated Internal API, use with caution. */
  _run(payload: $ParsePayload, ctx: $InternalParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. */
  _parse(payload: $ParsePayload<any>, ctx: $InternalParseContext): util.MaybeAsync<$ParsePayload>;

  /** @deprecated Internal API, use with caution. */
  _traits: Set<string>;
  /** @deprecated Internal API, use with caution. */
  _qout?: "true" | undefined;
  /** @deprecated Internal API, use with caution. */
  _qin?: "true" | undefined;
  /** @deprecated Internal API, use with caution. */
  _disc?: $DiscriminatorMap;
  /** @deprecated Internal API, use with caution. */
  _values?: $PrimitiveSet;
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
  constructor(public noun: string) {
    super(`Asynchronous ${noun} encountered. Use an async parsing function instead.`);
  }
}
export const $ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
  inst._id = def.type + "_" + util.randomString(10);
  inst._def = def; // set _def property
  inst._standard = 1; // set standard-schema version
  inst._computed = inst._computed || {}; // initialize _computed object

  inst.check = (...checks) => {
    return inst.clone({
      ...def,
      checks: [
        ...(def.checks ?? []),
        ...checks.map((ch) => (typeof ch === "function" ? { _check: ch, _def: { check: "custom" } } : ch)),
      ],
    });
  };
  inst.clone = (_def) => clone(inst, _def ?? def);
  inst.brand = () => inst as any;
  inst.register = ((reg: any, meta: any) => {
    reg.add(inst, meta);
    return inst;
  }) as any;

  const checks = [...(inst._def.checks ?? [])];

  // if inst is itself a $ZodCheck, run it as a check
  if (inst._traits.has("$ZodCheck")) {
    checks.unshift(inst as any);
  }
  // console.log("checks", checks);

  for (const ch of checks) {
    ch._onattach?.(inst);
  }

  if (checks.length === 0) {
    inst._run = (...args) => {
      return inst._parse(...args);
    };
  } else {
    // console.log("running checks");
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
    //         if (len > numIssues && $aborted(result)) return result;
    //         return _curr(result);
    //       });
    //     }

    //     // if ch has "when", run it
    //     // if (ch._def.when) {
    //     // }
    //     // otherwise, check if parse has aborted and return
    //     if ($aborted(result)) return result;
    //     // if not aborted, continue running checks
    //     return _curr(result);
    //   };
    // }

    function runChecks(
      payload: $ParsePayload,
      checks: $ZodCheck<never>[],
      ctx?: $InternalParseContext | undefined
    ): util.MaybeAsync<$ParsePayload> {
      // let isAborted = $aborted(payload);
      // for (const ch of checks) {
      //   if (ch._when) {
      //     const shouldRun = ch._when(payload);
      //     if (!shouldRun) continue;
      //   } else {
      //     if (isAborted) {
      //       continue;
      //     }
      //   }

      //   const currLen = payload.issues.length;
      //   const _ = ch._check(payload as any) as any as $ParsePayload;
      //   const nextLen = payload.issues.length;
      //   if (nextLen === currLen) {
      //     continue;
      //   }

      //   if (!isAborted) isAborted = $aborted(payload, currLen);
      // }
      // return payload;
      // const result = _result as $ParsePayload;
      let isAborted = $aborted(payload); // initialize
      let asyncResult!: Promise<unknown> | undefined; // = Promise.resolve();;
      for (const ch of checks) {
        // console.log("running check", ch);
        if (ch._when) {
          const shouldRun = ch._when(payload);
          if (!shouldRun) continue;
        } else {
          if (isAborted) {
            continue;
            // console.log("aborted...skipping check...");
          }
        }

        const currLen = payload.issues.length;
        const _ = ch._check(payload as any) as any as $ParsePayload;
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError("check");
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = asyncResult ?? Promise.resolve();
          asyncResult.then(async () => {
            await _;
            // console.log("async. issues:", payload.issues);
            const nextLen = payload.issues.length;
            if (nextLen === currLen) return;
            if (!isAborted) isAborted = $aborted(payload, currLen);
          });
        } else {
          // console.log("sync. issues:", payload.issues);
          const nextLen = payload.issues.length;
          // console.log(`currLen: ${currLen}, nextLen: ${nextLen}`);
          if (nextLen === currLen) continue;
          if (!isAborted) isAborted = $aborted(payload, currLen);
        }
      }

      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    }

    inst._run = (payload, ctx) => {
      const result = inst._parse(payload, ctx);

      if (result instanceof Promise) {
        if (ctx.async === false) throw new $ZodAsyncError("schema");
        return result.then((result) => runChecks(result, checks, ctx));
      }

      return runChecks(result, checks, ctx);

      // if (!ctx.async) {
    };
  }
});

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends $ZodType> = T["_input"]; // extends object ? util.Flatten<T["_input"]> : T["_input"];
export type output<T extends $ZodType> = T["_output"]; // extends object ? util.Flatten<T["_output"]> : T["_output"];
export type { output as infer };

export function $finalize(iss: errors.$ZodRawIssue, ctx: $InternalParseContext | undefined): errors.$ZodIssue {
  // return new $ZodError(
  // issues.map((iss) => {
  const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
  if (!iss.message) {
    const message =
      ctx?.error?.(iss as never) ?? iss.def?.error?.(iss as never) ?? config().error?.(iss) ?? defaultErrorMap(iss)!;
    full.message = typeof message === "string" ? message : message?.message;
  }

  delete (full as any).def;
  delete (full as any).continue;
  if (!ctx?.includeInputInErrors) {
    delete full.input;
  }
  return full;
  // })
  // );
}

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError<T = unknown> {
  /** @deprecated Virtual property, do not access. */
  _t!: T;
  public issues: errors.$ZodIssue[];
  constructor(issues: errors.$ZodIssue[]) {
    Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
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

import defaultErrorMap from "./locales/en.js";
import type { $ZodRegistry } from "./registries.js";

interface ZodConfig {
  error: errors.$ZodErrorMap;
}

const globalZodConfig: ZodConfig = {
  error: defaultErrorMap,
};

export function config(config?: Partial<ZodConfig>): ZodConfig {
  if (config) Object.assign(globalZodConfig, config);
  return globalZodConfig;
}

export { defaultErrorMap };

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
export type ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
type _FlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in keyof T]?: U[];
  };
};

export function flatten<T>(error: $ZodError<T>): _FlattenedError<T>;
export function flatten<T, U>(error: $ZodError<T>, mapper?: (issue: errors.$ZodIssue) => U): _FlattenedError<T, U>;
export function flatten(error: $ZodError, mapper = (issue: errors.$ZodIssue) => issue.message): any {
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
export type ZodFormattedError<T, U = string> = T extends any ? util.Flatten<_ZodFormattedError<T, U>> : never;
type _ZodFormattedError<T, U = string> = {
  _errors: U[];
} & (T extends [any, ...any[]]
  ? { [K in keyof T]?: ZodFormattedError<T[K], U> }
  : T extends any[]
    ? { [k: number]: ZodFormattedError<T[number], U> }
    : T extends object
      ? { [K in keyof T]?: ZodFormattedError<T[K], U> }
      : unknown);

export function format<T>(error: $ZodError<T>): ZodFormattedError<T>;
export function format<T, U>(error: $ZodError<T>, mapper?: (issue: errors.$ZodIssue) => U): ZodFormattedError<T, U>;
export function format<T>(error: $ZodError, _mapper?: any) {
  const mapper: (issue: errors.$ZodIssue) => any =
    _mapper ||
    function (issue: errors.$ZodIssue) {
      return issue.message;
    };
  const fieldErrors: ZodFormattedError<T> = { _errors: [] } as any;
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
