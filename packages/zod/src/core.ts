import {
  type IssueData,
  type ZodCustomIssue,
  ZodError,
  type ZodErrorMap,
} from "./ZodError.js";
import type { util } from "./helpers/index.js";
import {
  type ParseContext,
  type ParseInput,
  type ParseParams,
  type ParseReturnType,
  type SyncParseReturnType,
  type ZodFailure,
  isAborted,
  makeIssue,
} from "./helpers/parseUtil.js";
export const NEVER = Symbol.for("{{zod.never}}") as never;

export function issuesToZodError(
  ctx: ParseContext,
  issues: IssueData[]
): ZodError {
  return new ZodError(issues.map((issue) => makeIssue(issue, ctx)));
}

interface $optional {
  __tag: "ZOD";
}

export function safeResult<Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> } {
  if (isAborted(result)) {
    if (!result.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }

    return {
      success: false,
      get error() {
        if ((this as any)._error) return (this as any)._error as Error;
        const err = issuesToZodError(ctx, result.issues);
        (this as any)._error = err;
        return (this as any)._error;
      },
    };
  }
  return { success: true, data: result as any };
}

export interface $ZodTypeDef {
  typeName: string;
  errorMap?: ZodErrorMap;
  description?: string;
}

export type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: never;
};
export type SafeParseError<Input> = {
  success: false;
  error: ZodError<Input>;
  data?: never;
};

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Awaited<Output>>
  | SafeParseError<Awaited<Input>>;

type ZodCacheInput = { [k: string]: () => unknown };
type ZodCached<T extends ZodCacheInput> = { [k in keyof T]: ReturnType<T[k]> };

export function makeCache<This, T extends ZodCacheInput>(
  th: This,
  elements: T & ThisType<This>
): ZodCached<T> {
  const cache: { [k: string]: unknown } = {};
  for (const key in elements) {
    const getter = elements[key].bind(th);
    Object.defineProperty(cache, key, {
      get() {
        const value = getter();
        Object.defineProperty(cache, key, {
          value,
          configurable: true,
        });
        return value;
      },
      configurable: true,
    });
  }
  return cache as any;
}

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;

export abstract class $ZodType<Output = unknown, Input = unknown> {
  readonly "~output"!: Output;
  readonly "~input"!: Input;
  readonly _def!: $ZodTypeDef;

  abstract "~parse"(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<Output>;

  parse(data: unknown, params?: Partial<ParseParams>): Output {
    if (!params) {
      const result = this["~parse"](data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");

      if (isAborted(result))
        throw issuesToZodError(
          this.cache.defaultSyncContext,
          (result as ZodFailure).issues
        );
      return result as any;
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = this["~parse"](data, ctx);
    if (result instanceof Promise)
      throw Error("Synchronous parse encountered promise.");
    if (isAborted(result)) throw issuesToZodError(ctx, result.issues);
    return result as any;
  }

  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<Input, Output> {
    if (!params) {
      const result = this["~parse"](data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");
      return safeResult(this.cache.defaultSyncContext, result) as any;
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = this["~parse"](data, ctx);
    if (result instanceof Promise)
      throw Error("Synchronous parse encountered promise.");
    return safeResult(ctx, result) as any;
  }

  async parseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<Output> {
    if (!params) {
      const result = await this["~parse"](data, this.cache.defaultAsyncContext);
      if (isAborted(result))
        throw issuesToZodError(this.cache.defaultAsyncContext, result.issues);
      return result;
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = await this["~parse"](data, ctx);
    if (isAborted(result)) throw issuesToZodError(ctx, result.issues);
    return result;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<SafeParseReturnType<Input, Output>> {
    if (!params) {
      const result = await this["~parse"](data, this.cache.defaultAsyncContext);
      return safeResult(this.cache.defaultAsyncContext, result);
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };

    const result = await this["~parse"](data, ctx);
    return safeResult(ctx, result);
  }

  protected cache: {
    defaultSyncContext: ParseContext;
    defaultAsyncContext: ParseContext;
  } = makeCache(this, {
    defaultSyncContext() {
      return {
        basePath: [],
        async: false,
        schemaErrorMap: this._def.errorMap,
      } as ParseContext;
    },
    defaultAsyncContext() {
      return {
        basePath: [],
        async: true,
        schemaErrorMap: this._def.errorMap,
      } as ParseContext;
    },
  });

  /** Alias of safeParseAsync */
  spa: (
    data: unknown,
    params?: Partial<ParseParams>
  ) => Promise<SafeParseReturnType<Input, Output>> = this.safeParseAsync;

  constructor(def: $ZodTypeDef) {
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
  }
}

type Infer<T extends $ZodType> = T["~output"];
export type input<T extends $ZodType> = T["~input"];
export type output<T extends $ZodType> = T["~output"];
export type { Infer as infer };
