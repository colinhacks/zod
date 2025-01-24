import { Doc } from "./doc.js";
import type * as errors from "./errors.js";
import * as util from "./util.js";

//////////////////////////////   CONSTRUCTORS   ///////////////////////////////////////
interface Trait {
  "~def": unknown;
}

export interface $constructor<T extends Trait> {
  new (def: T["~def"]): T;
  init(inst: T, def: T["~def"]): void;
}

export /*@__NO_SIDE_EFFECTS__*/ function $constructor<T extends Trait, D = T["~def"]>(
  name: string,
  initializer: (inst: T, def: D) => void
): $constructor<T> {
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
      return inst?.["~traits"]?.has(name);
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

// type $ParsePathComponent = PropertyKey;
// type $ParsePath = $ParsePathComponent[];
export interface $ParseContext {
  readonly error?: errors.$ZodErrorMap<never>;
  readonly includeInputInErrors?: boolean;
  readonly skipFast?: boolean;
}

// export type $SyncParseResult<T = unknown> = T | $ZodFailure;
// export type $AsyncParseResult<T = unknown> = Promise<$SyncParseResult<T>>;
// export type $ParseResult<T> = $SyncParseResult<T> | $AsyncParseResult<T>;

/////////////////////////////   ZODRESULT   //////////////////////////////

// export const RESULT: symbol = Symbol.for("{{zod.result}}");

export interface $ZodResult<T = unknown> {
  value: T;
  issues: errors.$ZodRawIssue[];
  aborted: boolean;
}
export interface $ZodResultWithIssues<T = unknown> extends $ZodResult<T> {
  issues: errors.$ZodRawIssue[];
}

export function $result<T>(value: T, issues: errors.$ZodRawIssue[] = [], aborted = false): $ZodResultWithIssues<T> {
  return { value, issues, aborted };
}

export function $input<T>(value: T): ParseInput {
  return { value, issues: [], aborted: false };
}

export function $fail(issues: errors.$ZodRawIssue[], aborted = false): $ZodResult {
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

export function $prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
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
  | "pipeline"
  | "readonly"
  | "template_literal"
  | "promise"
  | "custom";

export type $IO<O, I> = { output: O; input: I };
const BRAND: unique symbol = Symbol("zod_brand");
export type $brand<T extends string | number | symbol = string | number | symbol> = {
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

interface ParseInput extends $ZodResult {
  // ctx: $ParseContext | undefined;
}

type ParsePathSegment = {
  key: PropertyKey;
  parent: ParsePathSegment;
} | null;
interface ParseContextB extends $ParseContext {
  readonly async?: boolean | undefined;
  readonly issues: errors.$ZodRawIssueB[];
}

type ParsePayloadB = {
  data: unknown;
  aborted: boolean;
  path: ParsePathSegment;
};
export interface $ZodType<out O = unknown, out I = unknown> {
  check(...checks: ($CheckFn<this["~output"]> | $ZodCheck<this["~output"]>)[]): this;
  clone(def?: this["~def"]): this;
  register<R extends $ZodRegistry>(
    registry: R,
    ...meta: this extends R["_schema"]
      ? undefined extends R["_meta"]
        ? [R["_meta"]?]
        : [R["_meta"]]
      : ["Incompatible schema"]
  ): this;
  brand<T extends PropertyKey = PropertyKey, Output = this["~output"]>(): this & {
    "~output": Output & $brand<T>;
  };

  "~id": string;
  /** @internal Internal API, use with caution. */
  "~standard": number;
  /** @internal Internal API, use with caution. */
  "~types": $IO<this["~output"], this["~input"]>;
  /** @internal Internal API, use with caution. */
  "~output": O;
  /** @internal Internal API, use with caution. */
  "~input": I;
  /** @internal Internal API, use with caution. */
  // "~fastrun"(input: unknown): boolean;
  // "~fastrunner": Function | null;
  // "~fastparse"(doc: Doc, arg: string): void;
  // doc stuff
  _doc: Doc;
  _docParse(doc: Doc): void;
  _docCheck(doc: Doc): void;
  /** @internal Internal API, use with caution. */

  _run(input: unknown, ctx?: $ParseContext): util.MaybeAsync<$ZodResult>;
  _runB(payload: ParsePayloadB, ctx: ParseContextB): util.MaybeAsync<O>;

  /** @internal Internal API, use with caution. */
  _parse(input: unknown, ctx?: $ParseContext): util.MaybeAsync<$ZodResult>;
  /** @internal Internal API, use with caution. */
  _parseB(payload: ParsePayloadB, ctx: ParseContextB): util.MaybeAsync<unknown>;

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
  "~computed": Record<string, any>;
  /** The set of issues this schema might throw during type checking. */
  "~isst"?: errors.$ZodIssueBase;
}

export function runCheck(
  check: $ZodCheck<never>,
  result: util.MaybeAsync<$ZodResult<never>>
): util.MaybeAsync<$ZodResult<never>> {
  if (result instanceof Promise)
    return result.then((result) => {
      check["~check"](result);
      return result;
    });
  check["~check"](result);
  return result;
}

export function clone<T extends $ZodType>(inst: T, def: T["~def"]): T {
  return new inst["~constr"](def);
}

export const $ZodType: $constructor<$ZodType> = $constructor("$ZodType", (inst, def) => {
  inst["~id"] = def.type + "_" + util.randomString(10);
  inst["~def"] = def; // set _def property
  inst["~standard"] = 1; // set standard-schema version
  inst["~computed"] = inst["~computed"] || {}; // initialize _computed object
  inst.clone = (_def) => clone(inst, _def ?? def);

  inst.check = (...checks) => {
    return inst.clone({
      ...def,
      checks: [
        ...(def.checks ?? []),
        ...checks.map((ch) => (typeof ch === "function" ? { "~check": ch, "~def": { check: "custom" } } : ch)),
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
  util.defineLazy(inst, "_doc", () => {
    const doc = new Doc();
    doc.register(inst);
    doc.finalize();
    return doc;
  });

  if (checks.length === 0) {
    inst._run = (...args) => inst._parse(...args);
    inst._runB = (...args) => inst._parseB(...args);
  } else {
    let runChecks = (result: $ZodResult<never>): util.MaybeAsync<$ZodResult> => {
      return result;
    };
    for (const ch of checks.slice().reverse()) {
      const _curr = runChecks;
      runChecks = (result) => {
        const _ = ch["~check"](result as $ZodResult<never>);
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

    inst._run = (_input, ctx) => {
      const result = inst._parse(_input, ctx);
      if (result instanceof Promise) {
        return result.then((result) => {
          if (result.aborted) return result;
          return runChecks(result as any);
        });
      }
      if (result.aborted) return result;
      return runChecks(result as any);
    };

    // let runChecksB = (result: $ZodResult<never>): util.MaybeAsync<$ZodResult> => {
    //   return result;
    // };
    // for (const ch of checks.slice().reverse()) {
    //   const _curr = runChecks;
    //   runChecks = (result) => {
    //     const _ = ch["~check"](result as $ZodResult<never>);
    //     if (_ instanceof Promise) {
    //       return _.then((_) => {
    //         if (result.aborted) return result;
    //         return _curr(result);
    //       });
    //     }

    //     if (result.aborted) return result;
    //     return _curr(result);
    //   };
    // }
    inst._runB = (payload, ctx) => {
      // const payload= {
      //   data: _input,
      //   aborted: false,
      //   path
      // }
      const result = inst._parseB(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result) => {
          if (payload.aborted) return result;
          const f = runChecks({
            value: result as never,
            aborted: false,
            issues: ctx.issues as any,
          });
          return f instanceof Promise ? f.then((f) => f.value) : f.value;
        });
      }
      if (payload.aborted) return result;
      const f = runChecks({
        // value: result,
        value: result as never,
        aborted: false,
        issues: ctx.issues as any,
      });
      return f instanceof Promise ? f.then((f) => f.value) : f.value;
    };
  }
});

////////////////////////////  TYPE HELPERS  ///////////////////////////////////

export type input<T extends $ZodType> = T["~input"]; // extends object ? util.Flatten<T["~input"]> : T["~input"];
export type output<T extends $ZodType> = T["~output"]; // extends object ? util.Flatten<T["~output"]> : T["~output"];
export type { output as infer };

export function $finalize(issues: errors.$ZodRawIssue[], ctx?: $ParseContext): $ZodError {
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

      delete (full as any).def;
      if (!ctx?.includeInputInErrors) {
        delete full.input;
      }
      return full;
    })
  );
}

const ZOD_ERROR: symbol = Symbol.for("{{zod.error}}");
export class $ZodError {
  // "~tag": typeof ZOD_ERROR = ZOD_ERROR;
  public issues: errors.$ZodIssue[];
  constructor(issues: errors.$ZodIssue[]) {
    Object.defineProperty(this, "~tag", { value: ZOD_ERROR, enumerable: false });
    this.issues = issues;
  }

  static [Symbol.hasInstance](inst: any) {
    return inst?.["~tag"] === ZOD_ERROR;
  }

  static assert(value: unknown): asserts value is $ZodError {
    if (!(value instanceof $ZodError)) {
      throw new Error(`Not a $ZodError: ${value}`);
    }
  }
}

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

  "~check"(input: $ZodResult<T>): util.MaybeAsync<void>;
  "~fastcheck"?(doc: Doc, arg: string): void;
  "~onattach"?(schema: $ZodType): void;
}

export const $ZodCheck: $constructor<$ZodCheck<any>> = $constructor("$ZodCheck", (inst, def) => {
  inst["~def"] = def;
  inst["~fastcheck"] = (_doc, _arg) => {
    throw new Error("Not implemented");
  };
});
