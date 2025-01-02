import type * as errors from "./errors.js";
import type * as util from "./util.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
interface Trait {
  "~def": unknown;
}

export interface $constructor<T extends Trait> {
  new (def: T["~def"]): T;
  init(inst: T, def: T["~def"]): void;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<
  T extends Trait,
  D = T["~def"],
>(name: string, initializer: (inst: T, def: D) => void): $constructor<T> {
  class _ {
    constructor(def: D) {
      _.init(this as any as T, def);
    }
    static init(inst: T, def: D) {
      (inst as any)["~traits"] ??= new Set();
      (inst as any)["~traits"].add(name);
      initializer(inst, def);
      (inst as any)["~constr"] = _;
      (inst as any)["~def"] = def;
    }
    static [Symbol.hasInstance](inst: any) {
      return inst?.["~traits"].has(name);
    }
  }
  Object.defineProperty(_, "name", { value: name });
  return _ as any;
}

////////////////////////////  DYNAMIC  ///////////////////////////////////

// interface $Dynamic<T extends object> extends T {}
// class $Dynamic<T extends object> {
//   constructor(def: T) {
//     Object.assign(this, def);
//   }
// }

/////////////////////////////   PARSE   //////////////////////////////

type $ParsePathComponent = PropertyKey;
type $ParsePath = $ParsePathComponent[];
export interface $ParseContext {
  readonly path?: $ParsePath;
  readonly error?: errors.$ZodErrorMap<never>;
  readonly includeInputInErrors?: boolean;
}

// export type $SyncParseResult<T = unknown> = T | $ZodFailure;
// export type $AsyncParseResult<T = unknown> = Promise<$SyncParseResult<T>>;
// export type $ParseResult<T> = $SyncParseResult<T> | $AsyncParseResult<T>;

/////////////////////////////   ZODRESULT   //////////////////////////////

// export const RESULT: symbol = Symbol.for("{{zod.result}}");

export interface $ZodResult<T = unknown> {
  value: T;
  issues: errors.$ZodIssueData[];
  aborted: boolean;
}
export interface $ZodResultWithIssues<T = unknown> extends $ZodResult<T> {
  issues: errors.$ZodIssueData[];
}

// interface $ZodResultSuccess<T> extends $ZodResult<T> {
//   value: T;
//   issues: undefined;
// }

// interface $ZodResultFailure extends $ZodResult<never> {
//   issues: errors.$ZodIssueData[];
// }

export function $result<T>(
  value: T,
  issues: errors.$ZodIssueData[] = [],
  aborted = false
): $ZodResultWithIssues<T> {
  return { value, issues, aborted };
}

export function $fail(
  issues: errors.$ZodIssueData[],
  aborted = false
): $ZodResult {
  return { issues, aborted, value: null } as any;
}

export function $succeed<T>(value: T): $ZodResult<T> {
  return { issues: [], aborted: false, value };
}

export function $failed(x: $ZodResult): boolean {
  return x.issues?.length as any;
}

export function $succeeded<T>(x: $ZodResult<T>): boolean {
  return !x?.issues?.length as any;
}

export function $prefixIssues(
  path: PropertyKey,
  issues: errors.$ZodIssueData[]
): errors.$ZodIssueData[] {
  return issues.map((iss) => {
    iss.path = [path, ...(iss.path ?? [])];
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
  | "pipeline"
  | "readonly"
  | "template_literal"
  | "promise"
  | "custom";

export type $IO<O, I> = { output: O; input: I };
const BRAND: unique symbol = Symbol("zod_brand");
export type $brand<
  T extends string | number | symbol = string | number | symbol,
> = {
  [BRAND]: { [k in T]: true };
};

export type $DiscriminatorMapElement = {
  values: Set<util.Primitive>;
  maps: $DiscriminatorMap[];
};
export type $DiscriminatorMap = Map<PropertyKey, $DiscriminatorMapElement>;
export type $PrimitiveSet = Set<util.Primitive>;

export type $CheckFn<T> = (input: $ZodResult<T>) => util.MaybeAsync<void>;

export interface $ZodTypeDef {
  type: $ZodSchemaTypes;
  description?: string | undefined;
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}

export interface $ZodType<out O = unknown, out I = unknown> {
  check(...checks: ($CheckFn<O> | $ZodCheck<O>)[]): this;
  clone(def?: this["~def"]): this;
  register<R extends $ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [R["_meta"]?]
        : [R["_meta"]]
      : ["Incompatible schema"]
  ): this;
  brand<T extends PropertyKey = PropertyKey>(): this & {
    "~output": O & $brand<T>;
  };

  /** @internal Internal API, use with caution. */
  "~standard": number;
  /** @internal Internal API, use with caution. */
  "~types": $IO<this["~output"], this["~input"]>;
  /** @internal Internal API, use with caution. */
  "~output": O;
  /** @internal Internal API, use with caution. */
  "~input": I;
  /** @internal Internal API, use with caution. */
  "~parse"(input: unknown, ctx?: $ParseContext): util.MaybeAsync<$ZodResult>;
  /** @internal Internal API, use with caution. */
  "~typecheck"(
    input: unknown,
    ctx?: $ParseContext
  ): util.MaybeAsync<$ZodResult>;
  /** @internal Internal API, use with caution. */
  "~traits": Set<string>;
  /** @internal Internal API, use with caution. */
  "~qout"?: "true" | undefined;
  /** @internal Internal API, use with caution. */
  "~qin"?: "true" | undefined;
  /** @internal Internal API, use with caution. */
  "~disc"?: $DiscriminatorMap;
  /** @internal Internal API, use with caution. */
  "~values"?: $PrimitiveSet;
  /** @internal Internal API, use with caution. */
  "~def": $ZodTypeDef;
  /** @internal Internal API, use with caution. */
  "~constr": new (
    def: any
  ) => any;
  /** @internal Internal API, use with caution. */
  "~computed": Record<string, unknown>;
  /** The set of issues this schema might throw during type checking. */
  "~isst"?: errors.$ZodIssueBase;
}

// type asdf = PropertyKey & BRAND<PropertyKey>;

export function runCheck(
  check: $ZodCheck<never>,
  result: util.MaybeAsync<$ZodResult<never>>
): util.MaybeAsync<$ZodResult<never>> {
  if (result instanceof Promise)
    return result.then((result) => {
      check["~run"](result);
      return result;
    });
  check["~run"](result);
  return result;
}

export const $ZodType: $constructor<$ZodType> = $constructor(
  "$ZodType",
  (inst, def) => {
    inst["~def"] = def; // set _def property
    inst["~standard"] = 1; // set standard-schema version
    inst["~computed"] = inst["~computed"] || {}; // initialize _computed object

    inst.clone = (_def) => new inst["~constr"](_def ?? def);

    inst.check = (...checks) => {
      return inst.clone({
        ...def,
        checks: [
          ...(def.checks ?? []),
          ...checks.map((ch) =>
            typeof ch === "function"
              ? { "~run": ch, "~def": { check: "custom" } }
              : ch
          ),
        ],
      });
    };

    inst.brand = () => inst as any;
    inst.register = ((reg: any, meta: any) => {
      reg.add(inst, meta);
      return inst;
    }) as any;

    const checks = [...(inst["~def"].checks ?? [])];

    // if inst is itself a $ZodCheck, run it as a check
    if (inst["~traits"].has("$ZodCheck")) {
      checks.unshift(inst as any);
    }
    for (const ch of checks) {
      ch["~onattach"]?.(inst);
    }

    if (checks.length === 0) {
      inst["~parse"] = (...args) => inst["~typecheck"](...args);
    } else {
      let runChecks = (
        result: $ZodResult<never>
      ): util.MaybeAsync<$ZodResult> => {
        return result;
      };
      for (const ch of checks.slice().reverse()) {
        const _curr = runChecks;
        runChecks = (result) => {
          const _ = ch["~run"](result as $ZodResult<never>);
          if (_ instanceof Promise) {
            return _.then((_) => {
              if (result.aborted) return result;
              return _curr(result);
            });
          }

          if (result.aborted) return result;
          return _curr(result);
        };
      }

      inst["~parse"] = (_input, ctx) => {
        const result = inst["~typecheck"](_input, ctx);
        if (result instanceof Promise) {
          return result.then((result) => {
            if (result.aborted) return result;
            return runChecks(result as any);
          });
        }
        if (result.aborted) return result;
        return runChecks(result as any);
      };
    }
  }
);

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends $ZodType> = T["~input"] extends object
  ? util.Flatten<T["~input"]>
  : T["~input"];
export type output<T extends $ZodType> =
  // T extends $ZodObject<
  //   infer T
  //   // infer Params
  // >
  //   ? $InferObjectOutput<T>
  T["~output"] extends object ? util.Flatten<T["~output"]> : T["~output"];
export type {
  output as infer,
  /** @deprecated Use z.output<typeof schema> instead */
  output as Infer,
};

// type alksjdf = null extends object ? true : false;
// type asdf =

// function emptyFail
// export const FAILURE: symbol = Symbol.for("{{zod.failure}}");

// export class $ZodFailure {
//   protected "~tag": typeof FAILURE = FAILURE;
//   issues: errors.$ZodIssueData[];
//   aborted: boolean;

//   constructor(issues?: errors.$ZodIssueData[], aborted?: boolean | undefined) {
//     this.issues = issues ?? [];
//     this.aborted = !!aborted;
//   }

//   static from(issues: errors.$ZodIssueData[], aborted?: boolean): $ZodFailure {
//     return new $ZodFailure(issues, aborted);
//   }

//   push(...issues: errors.$ZodIssueData[]): void {
//     this.issues.push(...issues);
//   }

//   finalize(ctx?: $ParseContext): $ZodError {
//     return new $ZodError(
//       this.issues.map((iss) => {
//         const full = { ...iss } as errors.$ZodIssue;
//         if (!iss.message) {
//           const message =
//             ctx?.error?.(iss as never) ??
//             iss?.def?.error?.(iss as never) ??
//             getConfig().error?.(iss) ??
//             defaultErrorMap(iss);
//           full.message =
//             typeof message === "string" ? message : message?.message!;
//         }

//         delete full.def;
//         if (!ctx?.includeInputInErrors) delete full.input;
//         return full;
//       })
//     );
//   }

//   // @ts-ignore
//   static [Symbol.hasInstance](inst: any) {
//     return inst?["~tag"] === FAILURE;
//   }
// }

export function $finalize(
  issues: errors.$ZodIssueData[],
  ctx?: $ParseContext
): $ZodError {
  return new $ZodError(
    issues.map((iss) => {
      const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
      if (!iss.message) {
        const message =
          ctx?.error?.(iss as never) ??
          iss.def?.error?.(iss as never) ??
          config().error?.(iss) ??
          defaultErrorMap(iss)!;
        full.message = typeof message === "string" ? message : message?.message;
      }

      delete full.def;
      if (!ctx?.includeInputInErrors) {
        delete full.input;
      }
      return full;
    })
  );
}

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError {
  "~tag": typeof ZOD_ERROR = ZOD_ERROR;
  public issues: errors.$ZodIssue[];
  constructor(issues: errors.$ZodIssue[]) {
    this.issues = issues;
  }

  static [Symbol.hasInstance](inst: any) {
    return inst?.["~tag"] === ZOD_ERROR;
  }
}

// export const makeIssue = (
//   issueData: errors.$ZodIssueData,
//   // schema?: { error?: errors.$ZodErrorMap<never> | undefined },
//   ctx?: $ParseContext
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
//     // level: issueData.level ?? "error",
//     path: fullPath,
//   };

//   if (issueData.message) return fullIssue as errors.$ZodIssue;
//   const _message: any =
//     ctx?.error?.(fullIssue as never) ??
//     issueData?.def?.error?.(fullIssue as never) ??
//     getConfig().error?.(fullIssue) ??
//     defaultErrorMap(fullIssue);
//   fullIssue.message = _message.message ?? _message;
//   return fullIssue as errors.$ZodIssue;
// };

// export function failed(x: $SyncParseResult<unknown>): x is $ZodFailure {
//   return (x as any)?["~tag"] === FAILURE;
// }

// export function aborted(x: $ZodFailure): x is $ZodFailure {
//   return !!x.aborted;
// }

// export function succeeded<T>(x: any): x is T {
//   return x?["~tag"] !== FAILURE;
// }

//////////////////////////////   ZodFail   ///////////////////////////////////////

// export type $ZodFail = {
//   "~tag": typeof FAILURE;
//   issues: errors.$ZodIssueData[];
//   aborted?: boolean;
// };

// export function fail(issues: errors.$ZodIssueData[]): $ZodFail {
//   return {
//     "~tag": FAILURE,
//     issues,
//   };
// }

//////////////////////////////   ERROR MAPS   ///////////////////////////////////////

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
}

// @ts-ignore cast variance
export interface $ZodCheck<in T = never> {
  "~def": $ZodCheckDef;
  /** The set of issues this check might throw. */
  "~issc"?: errors.$ZodIssueBase;

  "~run"(input: $ZodResult<T>): util.MaybeAsync<void>;
  "~onattach"?(schema: $ZodType): void;
}

export const $ZodCheck: $constructor<$ZodCheck<any>> = $constructor(
  "$ZodCheck",
  (inst, def) => {
    inst["~def"] = def;
  }
);

// export function makeCheckCtx<T>(
//   input: T,
//   ctx: $ParseContext | undefined,
//   fail: $ZodFailure | undefined
// ): $ZodCheckCtx<T> {
//   if (fail) {
//     const checkCtx: $ZodCheckCtx<T> = {
//       input,
//       fail,
//       addIssue(iss, schema) {
//         this.fail!.addIssue(iss, schema); //.bind(fail),
//       },
//     };
//     return checkCtx;
//   }

//   const checkCtx: $ZodCheckCtx<T> = {
//     input,
//     addIssue(
//       issue: errors.$ZodIssueData,
//       schema?: { error?: errors.$ZodErrorMap<never> | undefined }
//     ) {
//       if (!checkCtx.fail) {
//         const fail = new $ZodFailure([]);
//         // fail.addIssue(issue, schema);
//         checkCtx.fail = fail;
//         // return;
//       }
//       checkCtx.fail.addIssue(issue, schema);
//     },
//   };
//   return checkCtx;
// }
