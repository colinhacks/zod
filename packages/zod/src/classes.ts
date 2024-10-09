import * as core from "zod-core";

export { ZodParsedType } from "zod-core";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RefinementCtx = {
  addIssue: (arg: core.IssueData) => void;
};
export type ZodRawShape = { [k: string]: ZodTypeAny };
export type ZodTypeAny = ZodType;

export type { output as TypeOf } from "zod-core";

export type RawCreateParams =
  | {
      errorMap?: core.ZodErrorMap;
      invalid_type_error?: string;
      required_error?: string;
      message?: string;
      description?: string;
    }
  | undefined;

export type ProcessedCreateParams = {
  errorMap?: core.ZodErrorMap;
  description?: string;
};

export function processCreateParams(
  params: RawCreateParams
): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: core.ZodErrorMap = (iss, ctx) => {
    const { message } = params;

    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export interface ZodTypeDef extends core.$ZodTypeDef {}
export interface Parse<O> {
  (data: unknown, params?: Partial<core.ParseParams>): O;
  safe(
    input: core.ParseInput,
    ctx?: core.ParseContext
  ): core.ParseReturnType<O>;
}

// function parse
// export interface ZodType<
//   Output = unknown,
//   Def extends ZodTypeDef = ZodTypeDef,
//   Input = unknown,
// > extends core.$ZodType<Output, Input, Def> {
//   parse: {
//     safe: (
//       input: core.ParseInput,
//       ctx?: core.ParseContext
//     ) => core.ParseReturnType<Output>;
//   };
// }

export abstract class ZodType<
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = unknown,
> extends core.$ZodType<Output, Input, Def> {
  // override "~def": Def;
  constructor(def: Def) {
    super(def);

    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);

    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
  }

  /**
   * @deprecated This property has been renamed to "~def". This alias will be removed in a future version.
   */
  get _def(): Def {
    return this["~def"];
  }

  // safe: { parse: (typeof this)["~parse"] } = {
  //   parse: this.parse,
  // };
  // $parse(): void {}

  parse(data: unknown, params?: Partial<core.ParseParams>): Output {
    if (!params) {
      const result = this["~parse"](data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");

      if (core.isAborted(result))
        throw core.issuesToZodError(
          this.cache.defaultSyncContext,
          (result as core.ZodFailure).issues
        );
      return result as any;
    }
    const ctx: core.ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = this["~parse"](data, ctx);
    if (result instanceof Promise)
      throw Error("Synchronous parse encountered promise.");
    if (core.isAborted(result)) throw core.issuesToZodError(ctx, result.issues);
    return result as any;
  }

  safeParse(
    data: unknown,
    params?: Partial<core.ParseParams>
  ): core.SafeParseReturnType<Input, Output> {
    if (!params) {
      const result = this["~parse"](data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");
      return core.safeResult(this.cache.defaultSyncContext, result) as any;
    }
    const ctx: core.ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = this["~parse"](data, ctx);
    if (result instanceof Promise)
      throw Error("Synchronous parse encountered promise.");
    return core.safeResult(ctx, result) as any;
  }

  async parseAsync(
    data: unknown,
    params?: Partial<core.ParseParams>
  ): Promise<Output> {
    if (!params) {
      const result = await this["~parse"](data, this.cache.defaultAsyncContext);
      if (core.isAborted(result))
        throw core.issuesToZodError(
          this.cache.defaultAsyncContext,
          result.issues
        );
      return result;
    }
    const ctx: core.ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = await this["~parse"](data, ctx);
    if (core.isAborted(result)) throw core.issuesToZodError(ctx, result.issues);
    return result;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<core.ParseParams>
  ): Promise<core.SafeParseReturnType<Input, Output>> {
    if (!params) {
      const result = await this["~parse"](data, this.cache.defaultAsyncContext);
      return core.safeResult(this.cache.defaultAsyncContext, result);
    }
    const ctx: core.ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };

    const result = await this["~parse"](data, ctx);
    return core.safeResult(ctx, result);
  }

  protected cache: {
    defaultSyncContext: core.ParseContext;
    defaultAsyncContext: core.ParseContext;
  } = core.makeCache(this, {
    defaultSyncContext() {
      return {
        basePath: [],
        async: false,
        schemaErrorMap: this._def.errorMap,
      } as core.ParseContext;
    },
    defaultAsyncContext() {
      return {
        basePath: [],
        async: true,
        schemaErrorMap: this._def.errorMap,
      } as core.ParseContext;
    },
  });

  /** Alias of safeParseAsync */
  spa: (
    data: unknown,
    params?: Partial<core.ParseParams>
  ) => Promise<core.SafeParseReturnType<Input, Output>> = this.safeParseAsync;

  get description(): string | undefined {
    return this._def.description;
  }

  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?:
      | string
      | core.CustomErrorParams
      | ((arg: Output) => core.CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, Input>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?:
      | string
      | core.CustomErrorParams
      | ((arg: Output) => core.CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  refine(
    check: (arg: Output) => unknown,
    message?:
      | string
      | core.CustomErrorParams
      | ((arg: Output) => core.CustomErrorParams)
  ): ZodEffects<this, Output, Input> {
    const getIssueProperties = (val: Output) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      }
      if (typeof message === "function") {
        return message(val);
      }
      return message;
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () =>
        ctx.addIssue({
          input: val,
          code: core.ZodIssueCode.custom,
          ...getIssueProperties(val),
        });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          }
          return true;
        });
      }
      if (!result) {
        setError();
        return false;
      }
      return true;
    });
  }

  /**
   * @deprecated Use `.check()` instead.
   */
  refinement<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    refinementData:
      | core.IssueData
      | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  ): ZodEffects<this, RefinedOutput, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  refinement(
    check: (arg: Output) => boolean,
    refinementData:
      | core.IssueData
      | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  ): ZodEffects<this, Output, Input>;
  refinement(
    check: (arg: Output) => unknown,
    refinementData:
      | core.IssueData
      | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  ): ZodEffects<this, Output, Input> {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(
          typeof refinementData === "function"
            ? refinementData(val, ctx)
            : refinementData
        );
        return false;
      }
      return true;
    });
  }

  /**
   * @deprecated Use `.check()` instead.
   */
  _refinement(
    refinement: RefinementEffect<Output>["refinement"]
  ): ZodEffects<this, Output, Input> {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement },
      checks: [],
    });
  }

  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine<RefinedOutput extends Output>(
    refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  ): ZodEffects<this, RefinedOutput, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => void | Promise<void>
  ): ZodEffects<this, Output, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => unknown | Promise<unknown>
  ): ZodEffects<this, Output, Input> {
    return this._refinement(refinement);
  }

  optional(): ZodOptional<this> {
    return ZodOptional.create(this, this._def) as any;
  }
  nullable(): ZodNullable<this> {
    return ZodNullable.create(this, this._def) as any;
  }
  nullish(): ZodOptional<ZodNullable<this>> {
    return this.nullable().optional();
  }
  array(): ZodArray<this> {
    return ZodArray.create(this, this._def);
  }
  promise(): ZodPromise<this> {
    return ZodPromise.create(this, this._def);
  }

  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]> {
    return ZodUnion.create([this, option], this._def) as any;
  }

  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T> {
    return ZodIntersection.create(this, incoming, this._def);
  }

  transform<NewOut>(
    transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>
  ): ZodEffects<this, NewOut> {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform },
      checks: [],
    }) as any;
  }

  default(def: core.noUndefined<Input>): ZodDefault<this>;
  default(def: () => core.noUndefined<Input>): ZodDefault<this>;
  default(def: any) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;

    return new ZodDefault({
      checks: [],
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
    }) as any;
  }

  brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
  brand<B extends string | number | symbol>(): ZodBranded<this, B> {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      checks: [],
      ...processCreateParams(this._def),
    });
  }

  catch(def: Output): ZodCatch<this>;
  catch(
    def: (ctx: { error: core.ZodError; input: Input }) => Output
  ): ZodCatch<this>;
  catch(def: any) {
    const catchValueFunc = typeof def === "function" ? def : () => def;

    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      checks: [],
    }) as any;
  }

  describe(description: string): this {
    const This = (this as any).constructor;
    return new This({
      ...this._def,
      description,
    });
  }

  pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T> {
    return ZodPipeline.create(this, target);
  }
  readonly(): ZodReadonly<this> {
    return ZodReadonly.create(this);
  }

  isOptional(): boolean {
    return this.safeParse(undefined).success;
  }
  isNullable(): boolean {
    return this.safeParse(null).success;
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodString      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type IpVersion = "v4" | "v6";
export type JwtAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512";
export type ZodStringCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "length"; value: number; message?: string }
  | { kind: "email"; message?: string }
  | { kind: "url"; message?: string }
  | { kind: "jwt"; alg: JwtAlgorithm | null; message?: string }
  | { kind: "emoji"; message?: string }
  | { kind: "uuid"; message?: string }
  | { kind: "nanoid"; message?: string }
  | { kind: "guid"; message?: string }
  | { kind: "cuid"; message?: string }
  | { kind: "includes"; value: string; position?: number; message?: string }
  | { kind: "cuid2"; message?: string }
  | { kind: "ulid"; message?: string }
  | { kind: "xid"; message?: string }
  | { kind: "ksuid"; message?: string }
  | { kind: "startsWith"; value: string; message?: string }
  | { kind: "endsWith"; value: string; message?: string }
  | { kind: "regex"; regex: RegExp; message?: string }
  | { kind: "trim"; message?: string }
  | { kind: "toLowerCase"; message?: string }
  | { kind: "toUpperCase"; message?: string }
  | {
      kind: "datetime";
      offset: boolean;
      local: boolean;
      precision: number | null;
      message?: string;
    }
  | {
      kind: "date";
      // withDate: true;
      message?: string;
    }
  | {
      kind: "time";
      precision: number | null;
      message?: string;
    }
  | { kind: "duration"; message?: string }
  | { kind: "ip"; version?: IpVersion; message?: string }
  | { kind: "base64"; message?: string }
  | { kind: "json"; message?: string }
  | { kind: "e164"; message?: string };

export interface ZodStringDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodString;
  coerce: boolean;
}

const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const xidRegex = /^[0-9a-v]{20}$/i;
const ksuidRegex = /^[A-Za-z0-9]{27}$/;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
// const uuidRegex =
//   /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const durationRegex =
  /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;

const uuidRegex =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
// const uuidv1Regex =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// const uuidv2Regex =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-2[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// const uuidv3Regex =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// const uuidv4Regex =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// const uuidv5Regex =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const guidRegex =
  /^([0-9a-f]{8}-[0-9a-f]{4}\b-[0-9a-f]{4}-[0-9a-f]{4}\b-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;

// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex: RegExp;

// faster, simpler, safer
const ipv4Regex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6Regex =
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;

// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address

const hostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
const e164Regex = /^\+(?:[0-9]){6,14}[0-9]$/;

// simple
// const dateRegexSource = `\\d{4}-\\d{2}-\\d{2}`;
// no leap year validation
// const dateRegexSource = `\\d{4}-((0[13578]|10|12)-31|(0[13-9]|1[0-2])-30|(0[1-9]|1[0-2])-(0[1-9]|1\\d|2\\d))`;
// with leap year validation
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);

function timeRegexSource(args: { precision?: number | null }) {
  // let regex = `\\d{2}:\\d{2}:\\d{2}`;
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;

  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args: {
  offset?: boolean;
  local?: boolean;
  precision?: number | null;
}) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}

// Adapted from https://stackoverflow.com/a/3143231
export function datetimeRegex(args: {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}): RegExp {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;

  const opts: string[] = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}

function isValidIP(ip: string, version?: IpVersion) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }

  return false;
}

function isValidJwt(token: string, algorithm: JwtAlgorithm | null = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3) {
      return false;
    }

    const [header] = tokensParts;
    const parsedHeader = JSON.parse(atob(header));

    if (!("typ" in parsedHeader) || parsedHeader.typ !== "JWT") {
      return false;
    }

    if (
      algorithm &&
      (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export class ZodString extends ZodType<string, string> {
  override "~def": ZodStringDef;
  constructor(_def: ZodStringDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx?: core.ParseContext
  ): core.ParseReturnType<string> {
    if (this._def.coerce) {
      input = String(input) as string;
    }

    if (typeof input !== "string") {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.string,
          received: core.getParsedType(input),
        },
      ]);
    }

    if (this._def.checks.length === 0) {
      return input;
    }

    let issues: core.IssueData[] | undefined;

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.length < check.value) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        if (input.length > check.value) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "length") {
        const tooBig = input.length > check.value;
        const tooSmall = input.length < check.value;
        if (tooBig || tooSmall) {
          if (tooBig) {
            issues = issues || [];
            issues.push({
              input,
              code: core.ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message,
            });
          } else if (tooSmall) {
            issues = issues || [];
            issues.push({
              input,
              code: core.ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message,
            });
          }
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "email",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "jwt") {
        if (!isValidJwt(input, check.alg)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "jwt",

            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "emoji",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "uuid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "nanoid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "guid") {
        if (!guidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "guid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid2",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ulid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "xid") {
        if (!xidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "xid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ksuid") {
        if (!ksuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ksuid",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "url") {
        try {
          const url = new URL(input);

          if (!hostnameRegex.test(url.hostname)) {
            throw new Error("hostname is invalid");
          }
        } catch {
          issues = issues || [];
          issues.push({
            input,
            validation: "url",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input);
        if (!testResult) {
          issues = issues || [];
          issues.push({
            input,
            validation: "regex",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "trim") {
        input = input.trim();
      } else if (check.kind === "includes") {
        if (!(input as string).includes(check.value, check.position)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message,
          });
        }
      } else if (check.kind === "toLowerCase") {
        input = input.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input = input.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!(input as string).startsWith(check.value)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message,
          });
        }
      } else if (check.kind === "endsWith") {
        if (!(input as string).endsWith(check.value)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message,
          });
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message,
          });
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message,
          });
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);

        if (!regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message,
          });
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "duration",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input, check.version)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ip",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "base64",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "json") {
        try {
          JSON.parse(input);
        } catch (err) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_string,
            validation: "json",
            message: check.message,
          });
        }
      } else if (check.kind === "e164") {
        if (!e164Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "e164",
            code: core.ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else {
        core.assertNever(check);
      }
    }

    if (issues?.length) {
      return new core.ZodFailure(issues);
    }

    return input;
  }

  protected _regex(
    regex: RegExp,
    validation: core.StringValidation,
    message?: core.ErrMessage
  ): ZodEffects<this, this["~output"], this["~input"]> {
    return this.refinement(
      (data) => regex.test(data),
      (input) => ({
        input,
        validation,
        code: core.ZodIssueCode.invalid_string,
        ...core.errToObj(message),
      })
    );
  }

  _addCheck(check: ZodStringCheck): ZodString {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  email(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "email", ...core.errToObj(message) });
  }

  url(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "url", ...core.errToObj(message) });
  }

  jwt(options?: string | { alg?: JwtAlgorithm; message?: string }): ZodString {
    return this._addCheck({
      kind: "jwt",
      alg: typeof options === "object" ? options.alg ?? null : null,
      ...core.errToObj(options),
    });
  }
  emoji(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "emoji", ...core.errToObj(message) });
  }

  uuid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "uuid", ...core.errToObj(message) });
  }
  nanoid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "nanoid", ...core.errToObj(message) });
  }
  guid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "guid", ...core.errToObj(message) });
  }
  cuid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "cuid", ...core.errToObj(message) });
  }

  cuid2(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "cuid2", ...core.errToObj(message) });
  }
  ulid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "ulid", ...core.errToObj(message) });
  }
  base64(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "base64", ...core.errToObj(message) });
  }
  xid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "xid", ...core.errToObj(message) });
  }
  ksuid(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "ksuid", ...core.errToObj(message) });
  }

  ip(
    options?: string | { version?: "v4" | "v6"; message?: string }
  ): ZodString {
    return this._addCheck({ kind: "ip", ...core.errToObj(options) });
  }

  e164(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "e164", ...core.errToObj(message) });
  }

  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): ZodString {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options,
      });
    }
    return this._addCheck({
      kind: "datetime",

      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...core.errToObj(options?.message),
    });
  }

  date(message?: string): ZodString {
    return this._addCheck({ kind: "date", message });
  }

  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): ZodString {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options,
      });
    }
    return this._addCheck({
      kind: "time",
      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      ...core.errToObj(options?.message),
    });
  }

  duration(message?: core.ErrMessage): ZodString {
    return this._addCheck({ kind: "duration", ...core.errToObj(message) });
  }

  regex(regex: RegExp, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "regex",
      regex: regex,
      ...core.errToObj(message),
    });
  }

  includes(
    value: string,
    options?: { message?: string; position?: number }
  ): ZodString {
    return this._addCheck({
      kind: "includes",
      value: value,
      position: options?.position,
      ...core.errToObj(options?.message),
    });
  }

  startsWith(value: string, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "startsWith",
      value: value,
      ...core.errToObj(message),
    });
  }

  endsWith(value: string, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "endsWith",
      value: value,
      ...core.errToObj(message),
    });
  }

  json(message?: core.ErrMessage): this;
  json<T extends ZodTypeAny>(
    pipeTo: T
  ): ZodPipeline<ZodEffects<this, any, core.input<this>>, T>;
  json(input?: core.ErrMessage | ZodTypeAny) {
    if (!(input instanceof ZodType)) {
      return this._addCheck({ kind: "json", ...core.errToObj(input) });
    }
    const schema = this.transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch (error: unknown) {
        ctx.addIssue({
          input,
          code: core.ZodIssueCode.invalid_string,
          validation: "json",
          // message: (error as Error).message,
        });
        return core.NEVER;
      }
    });
    return input ? schema.pipe(input) : schema;
  }

  min(minLength: number, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...core.errToObj(message),
    });
  }

  max(maxLength: number, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...core.errToObj(message),
    });
  }

  length(len: number, message?: core.ErrMessage): ZodString {
    return this._addCheck({
      kind: "length",
      value: len,
      ...core.errToObj(message),
    });
  }

  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(message?: core.ErrMessage): ZodString {
    return this.min(1, core.errToObj(message));
  }

  trim(): ZodString {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }],
    });
  }

  toLowerCase(): ZodString {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }],
    });
  }

  toUpperCase(): ZodString {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }],
    });
  }

  get isDatetime(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }

  get isDate(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }

  get isTime(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }

  get isEmail(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }

  get isURL(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isJwt(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "jwt");
  }
  get isEmoji(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }

  get isUUID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isGUID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "guid");
  }
  get isCUID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }

  get isCUID2(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isXID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "xid");
  }
  get isKSUID(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "ksuid");
  }
  get isIP(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isBase64(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isE164(): boolean {
    return !!this._def.checks.find((ch) => ch.kind === "e164");
  }

  get minLength(): number | null {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxLength(): number | null {
    let max: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }

  static create(params?: RawCreateParams & { coerce?: true }): ZodString {
    const base = new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      coerce: params?.coerce ?? false,
      checks: [],
      ...processCreateParams(params),
    });
    return base;
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type ZodNumberCheck =
  | { kind: "min"; value: number; inclusive: boolean; message?: string }
  | { kind: "max"; value: number; inclusive: boolean; message?: string }
  | { kind: "int"; message?: string }
  | { kind: "multipleOf"; value: number; message?: string }
  | { kind: "finite"; message?: string };

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

export interface ZodNumberDef extends ZodTypeDef {
  // checks: ZodNumberCheck[];
  typeName: ZodFirstPartyTypeKind.ZodNumber;
  coerce: boolean;
}

export class ZodNumber extends ZodType<number, number> {
  override "~def": ZodNumberDef;
  constructor(_def: ZodNumberDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<number> {
    if (this._def.coerce) {
      input = Number(input);
    }

    if (
      this._def.checks.length === 0 &&
      typeof input === "number" &&
      !Number.isNaN(input)
    ) {
      return input;
    }

    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.number) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.number,
          received: typeof input,
        },
      ]);
    }

    let issues: core.IssueData[] | undefined;

    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!core.isInteger(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message,
          });
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input < check.value
          : input <= check.value;
        if (tooSmall) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input > check.value
          : input >= check.value;
        if (tooBig) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input, check.value) !== 0) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: core.ZodIssueCode.not_finite,
            message: check.message,
          });
        }
      } else {
        core.assertNever(check);
      }
    }

    if (issues?.length) {
      return new core.ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodNumber {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: params?.coerce || false,
      checks: [],
      ...processCreateParams(params),
    });
  }

  gte(value: number, message?: core.ErrMessage): ZodNumber {
    return this.setLimit("min", value, true, core.errToString(message));
  }
  min: (value: number, message?: core.ErrMessage) => ZodNumber = this.gte;

  gt(value: number, message?: core.ErrMessage): ZodNumber {
    return this.setLimit("min", value, false, core.errToString(message));
  }

  lte(value: number, message?: core.ErrMessage): ZodNumber {
    return this.setLimit("max", value, true, core.errToString(message));
  }
  max: (value: number, message?: core.ErrMessage) => ZodNumber = this.lte;

  lt(value: number, message?: core.ErrMessage): ZodNumber {
    return this.setLimit("max", value, false, core.errToString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: number,
    inclusive: boolean,
    message?: string
  ): ZodNumber {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: core.errToString(message),
        },
      ],
    });
  }

  _addCheck(check: ZodNumberCheck): ZodNumber {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  int(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "int",
      message: core.errToString(message),
    });
  }

  positive(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: core.errToString(message),
    });
  }

  negative(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: core.errToString(message),
    });
  }

  nonpositive(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: core.errToString(message),
    });
  }

  nonnegative(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: core.errToString(message),
    });
  }

  multipleOf(value: number, message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "multipleOf",
      value: value,
      message: core.errToString(message),
    });
  }
  step: (value: number, message?: core.ErrMessage) => ZodNumber =
    this.multipleOf;

  finite(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "finite",
      message: core.errToString(message),
    });
  }

  safe(message?: core.ErrMessage): ZodNumber {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: core.errToString(message),
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: core.errToString(message),
    });
  }

  get minValue(): number | null {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue(): number | null {
    let max: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }

  get isInt(): boolean {
    return !!this._def.checks.find(
      (ch) =>
        ch.kind === "int" ||
        (ch.kind === "multipleOf" && core.isInteger(ch.value))
    );
  }

  get isFinite(): boolean {
    let max: number | null = null;
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (
        ch.kind === "finite" ||
        ch.kind === "int" ||
        ch.kind === "multipleOf"
      ) {
        return true;
      }
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBigInt      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export type ZodBigIntCheck =
  | { kind: "min"; value: bigint; inclusive: boolean; message?: string }
  | { kind: "max"; value: bigint; inclusive: boolean; message?: string }
  | { kind: "multipleOf"; value: bigint; message?: string };

export interface ZodBigIntDef extends ZodTypeDef {
  // checks: ZodBigIntCheck[];
  typeName: ZodFirstPartyTypeKind.ZodBigInt;
  coerce: boolean;
}

export class ZodBigInt extends ZodType<bigint, bigint> {
  override "~def": ZodBigIntDef;
  constructor(_def: ZodBigIntDef) {
    super(_def);
  }

  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<bigint> {
    if (this._def.coerce) {
      input = BigInt(input);
    }
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.bigint) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.bigint,
          received: parsedType,
        },
      ]);
    }

    const issues: core.IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input < check.value
          : input <= check.value;
        if (tooSmall) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input > check.value
          : input >= check.value;
        if (tooBig) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message,
          });
        }
      } else if (check.kind === "multipleOf") {
        if (input % check.value !== BigInt(0)) {
          issues.push({
            input,
            code: core.ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else {
        core.assertNever(check);
      }
    }

    if (issues.length) {
      return new core.ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodBigInt {
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: params?.coerce ?? false,
      checks: [],
      ...processCreateParams(params),
    });
  }

  gte(value: bigint, message?: core.ErrMessage): ZodBigInt {
    return this.setLimit("min", value, true, core.errToString(message));
  }
  min: (value: bigint, message?: core.ErrMessage) => ZodBigInt = this.gte;

  gt(value: bigint, message?: core.ErrMessage): ZodBigInt {
    return this.setLimit("min", value, false, core.errToString(message));
  }

  lte(value: bigint, message?: core.ErrMessage): ZodBigInt {
    return this.setLimit("max", value, true, core.errToString(message));
  }
  max: (value: bigint, message?: core.ErrMessage) => ZodBigInt = this.lte;

  lt(value: bigint, message?: core.ErrMessage): ZodBigInt {
    return this.setLimit("max", value, false, core.errToString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: bigint,
    inclusive: boolean,
    message?: string
  ): ZodBigInt {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: core.errToString(message),
        },
      ],
    });
  }

  _addCheck(check: ZodBigIntCheck): ZodBigInt {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  positive(message?: core.ErrMessage): ZodBigInt {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: core.errToString(message),
    });
  }

  negative(message?: core.ErrMessage): ZodBigInt {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: core.errToString(message),
    });
  }

  nonpositive(message?: core.ErrMessage): ZodBigInt {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: core.errToString(message),
    });
  }

  nonnegative(message?: core.ErrMessage): ZodBigInt {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: core.errToString(message),
    });
  }

  multipleOf(value: bigint, message?: core.ErrMessage): ZodBigInt {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: core.errToString(message),
    });
  }

  get minValue(): bigint | null {
    let min: bigint | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue(): bigint | null {
    let max: bigint | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                     ///////////
//////////      ZodBoolean      //////////
//////////                     ///////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodBooleanDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodBoolean;
  coerce: boolean;
}

export class ZodBoolean extends ZodType<boolean, boolean> {
  override "~def": ZodBooleanDef;
  constructor(_def: ZodBooleanDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<boolean> {
    if (this._def.coerce) {
      input = Boolean(input);
    }
    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.boolean) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.boolean,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodBoolean {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      coerce: params?.coerce || false,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////
export type ZodDateCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string };
export interface ZodDateDef extends ZodTypeDef {
  // checks: ZodDateCheck[];
  coerce: boolean;
  typeName: ZodFirstPartyTypeKind.ZodDate;
}

export class ZodDate extends ZodType<Date, Date> {
  override "~def": ZodDateDef;
  constructor(_def: ZodDateDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    if (this._def.coerce) {
      input = new Date(input);
    }
    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.date) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.date,
          received: parsedType,
        },
      ]);
    }

    if (Number.isNaN(input.getTime())) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_date,
        },
      ]);
    }

    const issues: core.IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.getTime() < check.value) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date",
          });
        }
      } else if (check.kind === "max") {
        if (input.getTime() > check.value) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date",
          });
        }
      } else {
        core.assertNever(check);
      }
    }

    if (issues.length) {
      return new core.ZodFailure(issues);
    }

    return new Date(input.getTime());
  }

  _addCheck(check: ZodDateCheck): ZodDate {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  min(minDate: Date, message?: core.ErrMessage): ZodDate {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: core.errToString(message),
    });
  }

  max(maxDate: Date, message?: core.ErrMessage): ZodDate {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: core.errToString(message),
    });
  }

  get minDate(): Date | null {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }

    return min != null ? new Date(min) : null;
  }

  get maxDate(): Date | null {
    let max: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }

    return max != null ? new Date(max) : null;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodDate {
    return new ZodDate({
      checks: [],
      coerce: params?.coerce || false,
      typeName: ZodFirstPartyTypeKind.ZodDate,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       ZodSymbol        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodSymbolDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodSymbol;
}

export class ZodSymbol extends ZodType<symbol, symbol> {
  override "~def": ZodSymbolDef;
  constructor(_def: ZodSymbolDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.symbol) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.symbol,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): ZodSymbol {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodUndefined      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodUndefinedDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUndefined;
}

export class ZodUndefined extends ZodType<undefined, undefined> {
  override "~def": ZodUndefinedDef;
  constructor(_def: ZodUndefinedDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.undefined) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.undefined,
          received: parsedType,
        },
      ]);
    }
    return input;
  }
  params?: RawCreateParams;

  static create(params?: RawCreateParams): ZodUndefined {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodNull      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodNullDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNull;
}

export class ZodNull extends ZodType<null, null> {
  override "~def": ZodNullDef;
  constructor(_def: ZodNullDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.null) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.null,
          received: parsedType,
        },
      ]);
    }
    return input;
  }
  static create(params?: RawCreateParams): ZodNull {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodAny      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export interface ZodAnyDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodAny;
}

export class ZodAny extends ZodType<any, any> {
  override "~def": ZodAnyDef;
  constructor(_def: ZodAnyDef) {
    super(_def);
  }
  // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
  _any = true as const;
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    return input;
  }
  static create(params?: RawCreateParams): ZodAny {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodUnknown      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodUnknownDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUnknown;
}

export class ZodUnknown extends ZodType<unknown, unknown> {
  override "~def": ZodUnknownDef;
  constructor(_def: ZodUnknownDef) {
    super(_def);
  }
  // required
  _unknown = true as const;
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    return input;
  }

  static create(params?: RawCreateParams): ZodUnknown {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodNever      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export interface ZodNeverDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNever;
}

export class ZodNever extends ZodType<never, never> {
  override "~def": ZodNeverDef;
  constructor(_def: ZodNeverDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    return new core.ZodFailure([
      {
        input,
        code: core.ZodIssueCode.invalid_type,
        expected: core.ZodParsedType.never,
        received: parsedType,
      },
    ]);
  }
  static create(params?: RawCreateParams): ZodNever {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodVoid      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodVoidDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodVoid;
}

export class ZodVoid extends ZodType<void, void> {
  override "~def": ZodVoidDef;
  constructor(_def: ZodVoidDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.undefined) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.void,
          received: parsedType,
        },
      ]);
    }
    return input;
  }

  static create(params?: RawCreateParams): ZodVoid {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodArray      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodArray;
  exactLength: { value: number; message?: string } | null;
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
  uniqueness: {
    identifier?: <U extends T["~output"]>(item: U) => unknown;
    message?:
      | string
      | (<U extends T["~output"]>(duplicateItems: U[]) => string);
    showDuplicates?: boolean;
  } | null;
}

export type ArrayCardinality = "many" | "atleastone";
export type arrayOutputType<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many",
> = Cardinality extends "atleastone"
  ? [T["~output"], ...T["~output"][]]
  : T["~output"][];

export class ZodArray<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many",
> extends ZodType<
  arrayOutputType<T, Cardinality>,
  Cardinality extends "atleastone"
    ? [T["~input"], ...T["~input"][]]
    : T["~input"][]
> {
  override "~def": ZodArrayDef<T>;
  constructor(_def: ZodArrayDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const def = this._def;

    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.array) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    const issues: core.IssueData[] = [];

    if (def.exactLength !== null) {
      const tooBig = input.length > def.exactLength.value;
      const tooSmall = input.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        issues.push({
          input,
          code: tooBig
            ? core.ZodIssueCode.too_big
            : core.ZodIssueCode.too_small,
          minimum: (tooSmall ? def.exactLength.value : undefined) as number,
          maximum: (tooBig ? def.exactLength.value : undefined) as number,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message,
        });
      }
    }

    if (def.minLength !== null) {
      if (input.length < def.minLength.value) {
        issues.push({
          input,
          code: core.ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message,
        });
      }
    }

    if (def.maxLength !== null) {
      if (input.length > def.maxLength.value) {
        issues.push({
          input,
          code: core.ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message,
        });
      }
    }

    if (def.uniqueness !== null) {
      const { identifier, message, showDuplicates } = def.uniqueness;
      const duplicates = (
        identifier
          ? (input as this["~output"][]).map(identifier)
          : (input as this["~output"][])
      ).filter((item, idx, arr) => arr.indexOf(item) !== idx);
      if (duplicates.length) {
        issues.push({
          input,
          code: core.ZodIssueCode.not_unique,
          duplicates: showDuplicates ? duplicates : undefined,
          message:
            typeof message === "function" ? message(duplicates) : message,
        });
      }
    }

    let hasPromises = false;

    const parseResults = [...(input as any[])].map((item) => {
      const result = def.type["~parse"](item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then((result) => {
        issues.push(
          ...result.flatMap((r, i) =>
            core.isAborted(r)
              ? r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
              : []
          )
        );

        if (issues.length > 0) {
          return new core.ZodFailure(issues);
        }

        return result.map((x) => x as any) as any;
      });
    }

    const results = parseResults as core.SyncParseReturnType<any>[];
    // we know it's sync because hasPromises is false

    issues.push(
      ...results.flatMap((r, i) =>
        !core.isAborted(r)
          ? []
          : r.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
      )
    );

    if (issues.length > 0) {
      return new core.ZodFailure(issues);
    }

    return results.map((x) => x as any) as any;
  }

  get element(): T {
    return this._def.type;
  }

  min(minLength: number, message?: core.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: core.errToString(message) },
    }) as any;
  }

  max(maxLength: number, message?: core.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: core.errToString(message) },
    }) as any;
  }

  length(len: number, message?: core.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: core.errToString(message) },
    }) as any;
  }

  nonempty(message?: core.ErrMessage): ZodArray<T, "atleastone"> {
    return this.min(1, message) as any;
  }

  unique(params: ZodArrayDef<T>["uniqueness"] = {}): this {
    const message =
      typeof params?.message === "function"
        ? params.message
        : core.errToString(params?.message);

    return new ZodArray({
      ...this._def,
      uniqueness: { ...params, message },
    }) as any;
  }

  static create<T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodArray<T> {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      uniqueness: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

export type ZodNonEmptyArray<T extends ZodTypeAny> = ZodArray<T, "atleastone">;

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export interface ZodObjectDef<
  T extends ZodRawShape = ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
> extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodObject;
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
}

export type mergeTypes<A, B> = {
  [k in keyof A | keyof B]: k extends keyof B
    ? B[k]
    : k extends keyof A
      ? A[k]
      : never;
};

export type objectOutputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
> = core.flatten<core.addQuestionMarks<baseObjectOutputType<Shape>>> &
  CatchallOutput<Catchall> &
  PassthroughType<UnknownKeys>;

export type baseObjectOutputType<Shape extends ZodRawShape> = {
  [k in keyof Shape]: Shape[k]["~output"];
};

export type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
> = core.flatten<baseObjectInputType<Shape>> &
  CatchallInput<Catchall> &
  PassthroughType<UnknownKeys>;
export type baseObjectInputType<Shape extends ZodRawShape> =
  core.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["~input"];
  }>;

export type CatchallOutput<T extends ZodType> = ZodType extends T
  ? unknown
  : { [k: string]: T["~output"] };

export type CatchallInput<T extends ZodType> = ZodType extends T
  ? unknown
  : { [k: string]: T["~input"] };

export type PassthroughType<T extends UnknownKeysParam> =
  T extends "passthrough" ? { [k: string]: unknown } : unknown;

export type deoptional<T extends ZodTypeAny> = T extends ZodOptional<infer U>
  ? deoptional<U>
  : T extends ZodNullable<infer U>
    ? ZodNullable<deoptional<U>>
    : T;

export type SomeZodObject = ZodObject<
  ZodRawShape,
  UnknownKeysParam,
  ZodTypeAny
>;

export type noUnrecognized<Obj extends object, Shape extends object> = {
  [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};

function deepPartialify(schema: ZodTypeAny): any {
  if (schema instanceof ZodObject) {
    const newShape: any = {};

    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape,
    }) as any;
  }
  if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element),
    });
  }
  if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  }
  if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  }
  if (schema instanceof ZodTuple) {
    return ZodTuple.create(
      schema.items.map((item: any) => deepPartialify(item))
    );
  }
  return schema;
}

export class ZodObject<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>,
> extends ZodType<Output, Input> {
  override "~def": ZodObjectDef<T, UnknownKeys, Catchall>;
  constructor(_def: ZodObjectDef<T, UnknownKeys, Catchall>) {
    super(_def);
  }
  private _cached = core.makeCache(this, {
    shape() {
      return this._def.shape();
    },
    keys() {
      return Object.keys(this._def.shape());
    },
    keyset() {
      return new Set(Object.keys(this._def.shape()));
    },
  });

  "~parse"(
    input: core.ParseInput,
    ctx?: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.object) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const issues: core.IssueData[] = [];
    const extraKeys: string[] = [];

    if (
      !(
        this._def.catchall instanceof ZodNever &&
        this._def.unknownKeys === "strip"
      )
    ) {
      for (const key in input) {
        if (!this._cached.keys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }

    const final: any = {};

    const asyncResults: Array<{
      key: string;
      promise: core.AsyncParseReturnType<unknown>;
    }> = [];

    for (const key of this._cached.keys) {
      const keyValidator = this._cached.shape[key];
      const value = input[key];
      const parseResult = keyValidator["~parse"](value, ctx);
      if (parseResult instanceof Promise) {
        asyncResults.push({ key, promise: parseResult });
      } else if (core.isAborted(parseResult)) {
        issues.push(
          ...parseResult.issues.map((issue) => ({
            ...issue,
            path: [key, ...(issue.path || [])],
          }))
        );
      } else {
        if (
          key in input ||
          keyValidator instanceof ZodDefault ||
          keyValidator instanceof ZodCatch
        ) {
          final[key] = parseResult;
        }
      }
    }

    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;

      if (unknownKeys === "passthrough") {
        for (const extraKey of extraKeys) {
          if (extraKey === "__proto__") continue;
          final[extraKey] = input[extraKey];
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          issues.push({
            input,
            code: core.ZodIssueCode.unrecognized_keys,
            keys: extraKeys,
          });
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      // run catchall validation
      const catchall = this._def.catchall;

      for (const key of extraKeys) {
        const value = input[key];
        const parseResult = catchall["~parse"](value, ctx);
        if (parseResult instanceof Promise) {
          asyncResults.push({ key, promise: parseResult });
        } else if (core.isAborted(parseResult)) {
          issues.push(
            ...parseResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        } else {
          if (
            key in input ||
            catchall instanceof ZodDefault ||
            catchall instanceof ZodCatch
          ) {
            final[key] = parseResult;
          }
        }
      }
    }

    if (asyncResults.length) {
      return Promise.resolve()
        .then(async () => {
          for (const asyncResult of asyncResults) {
            const result = await asyncResult.promise;
            if (core.isAborted(result)) {
              issues.push(
                ...result.issues.map((issue) => ({
                  ...issue,
                  path: [asyncResult.key, ...(issue.path || [])],
                }))
              );
            } else {
              if (asyncResult.key in input) {
                final[asyncResult.key] = result;
              }
            }
          }
        })
        .then(() => {
          if (issues.length) {
            return new core.ZodFailure(issues);
          }

          return final;
        });
    }

    if (issues.length) {
      return new core.ZodFailure(issues);
    }

    return final;
  }

  get shape(): T {
    return this._cached.shape;
  }

  strict(message?: core.ErrMessage): ZodObject<T, "strict", Catchall> {
    core.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",

      ...(message !== undefined
        ? {
            errorMap: (issue, ctx) => {
              const defaultError =
                this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: core.errToObj(message).message ?? defaultError,
                };
              return {
                message: defaultError,
              };
            },
          }
        : {}),
    }) as any;
  }

  strip(): ZodObject<T, "strip", Catchall> {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip",
    }) as any;
  }

  passthrough(): ZodObject<T, "passthrough", Catchall> {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough",
    }) as any;
  }

  /**
   * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
   * If you want to pass through unknown properties, use `.passthrough()` instead.
   */
  nonstrict: () => ZodObject<T, "passthrough", Catchall> = this.passthrough;

  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend<Augmentation extends ZodRawShape>(
    augmentation: Augmentation & Partial<{ [k in keyof T]: unknown }>
  ): ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  extend<Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ): ZodObject<core.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  extend(augmentation: ZodRawShape) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation,
      }),
    }) as any;
  }
  // extend<
  //   Augmentation extends ZodRawShape,
  //   NewOutput extends core.flatten<{
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["~output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   }>,
  //   NewInput extends core.flatten<{
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["~input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }>
  // >(
  //   augmentation: Augmentation
  // ): ZodObject<
  //   extendShape<T, Augmentation>,
  //   UnknownKeys,
  //   Catchall,
  //   NewOutput,
  //   NewInput
  // > {
  //   return new ZodObject({
  //     ...this._def,
  //     shape: () => ({
  //       ...this._def.shape(),
  //       ...augmentation,
  //     }),
  //   }) as any;
  // }

  /**
   * @deprecated Use `.extend` instead
   *  */
  augment: (typeof this)["extend"] = this.extend;

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(
    merging: Incoming
  ): ZodObject<
    core.extendShape<T, Augmentation>,
    Incoming["_def"]["unknownKeys"],
    Incoming["_def"]["catchall"]
  > {
    const merged: any = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape(),
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject,
    }) as any;
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["~output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["~input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       core.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }

  setKey<Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> {
    return this.augment({ [key]: schema }) as any;
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = core.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       core.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }

  catchall<Index extends ZodTypeAny>(
    index: Index
  ): ZodObject<T, UnknownKeys, Index> {
    return new ZodObject({
      ...this._def,
      catchall: index,
    }) as any;
  }

  pick<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall> {
    const shape: any = {};

    for (const key of core.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }

    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

  omit<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall> {
    const shape: any = {};

    for (const key of core.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }

    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

  /**
   * @deprecated
   */
  // deepPartial(): core.DeepPartial<this> {
  //   return deepPartialify(this) as any;
  // }

  partial(): ZodObject<
    { [k in keyof T]: ZodOptional<T[k]> },
    UnknownKeys,
    Catchall
  >;

  partial<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<
    core.noNever<{
      [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  partial(mask?: any) {
    const newShape: any = {};

    // core.objectKeys(this.shape).forEach((key) => {
    //   const fieldSchema = this.shape[key];

    //   if (mask && !mask[key]) {
    //     newShape[key] = fieldSchema;
    //   } else {
    //     newShape[key] = fieldSchema.optional();
    //   }
    // });

    // rewrite to use for of
    for (const key of this._cached.keys) {
      const fieldSchema = this.shape[key];

      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }

    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  }

  required(): ZodObject<
    { [k in keyof T]: deoptional<T[k]> },
    UnknownKeys,
    Catchall
  >;
  required<Mask extends core.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<
    core.noNever<{
      [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  required(mask?: any) {
    const newShape: any = {};
    for (const key of this._cached.keys) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;

        while (newField instanceof ZodOptional) {
          newField = (newField as ZodOptional<any>)._def.innerType;
        }

        newShape[key] = newField;
      }
    }

    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  }

  keyof(): ZodEnum<core.UnionToTupleString<keyof T>> {
    return ZodEnum.create(
      core.objectKeys(this.shape) as [string, ...string[]]
    ) as any;
  }

  static create<T extends ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): ZodObject<
    T,
    "strip",
    ZodTypeAny,
    objectOutputType<T, ZodTypeAny, "strip">,
    objectInputType<T, ZodTypeAny, "strip">
  > {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  static strictCreate<T extends ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): ZodObject<T, "strict"> {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  static lazycreate<T extends ZodRawShape>(
    shape: () => T,
    params?: RawCreateParams
  ): ZodObject<T, "strip"> {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

export type AnyZodObject = ZodObject<any, any, any>;

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodUnion      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type ZodUnionOptions = Readonly<[ZodTypeAny, ...ZodTypeAny[]]>;
export interface ZodUnionDef<
  T extends ZodUnionOptions = Readonly<
    [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
  >,
> extends ZodTypeDef {
  options: T;
  typeName: ZodFirstPartyTypeKind.ZodUnion;
}

export class ZodUnion<T extends ZodUnionOptions> extends ZodType<
  T[number]["~output"],
  T[number]["~input"]
> {
  override "~def": ZodUnionDef<T>;
  constructor(_def: ZodUnionDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const options = this._def.options;

    function handleResults(results: core.SyncParseReturnType<any>[]) {
      // return first issue-free validation if it exists
      for (const result of results) {
        if (core.isValid(result)) {
          return result;
        }
      }

      const unionErrors: core.ZodError[] = [];

      for (const result of results) {
        if (core.isAborted(result)) {
          unionErrors.push(
            new core.ZodError(
              result.issues.map((issue) => core.makeIssue(issue, ctx))
            )
          );
        }
      }

      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_union,
          unionErrors,
        },
      ]);
    }

    let hasPromises = false;
    const parseResults = options.map((option) => {
      const result = option["~parse"](input, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then(handleResults);
    }
    const issues: core.ZodIssue[][] = [];
    for (const result of parseResults as core.SyncParseReturnType<any>[]) {
      // we know it's sync because hasPromises is false
      if (!core.isAborted(result)) {
        return result;
      }

      issues.push(result.issues.map((issue) => core.makeIssue(issue, ctx)));
    }

    const unionErrors = issues.map((issues) => new core.ZodError(issues));

    return new core.ZodFailure([
      {
        input,
        code: core.ZodIssueCode.invalid_union,
        unionErrors,
      },
    ]);
  }

  get options(): T {
    return this._def.options;
  }

  static create<T extends Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>>(
    types: T,
    params?: RawCreateParams
  ): ZodUnion<T> {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

const getDiscriminator = <T extends ZodTypeAny>(type: T): core.Primitive[] => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  }
  if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  }
  if (type instanceof ZodLiteral) {
    return [type.value];
  }
  if (type instanceof ZodEnum) {
    return type.options;
  }
  if (type instanceof ZodNativeEnum) {
    return core.objectValues(type.enum as any);
  }
  if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  }
  if (type instanceof ZodUndefined) {
    return [undefined];
  }
  if (type instanceof ZodNull) {
    return [null];
  }
  if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  }
  if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  }
  if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  }
  if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  }
  if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  }
  return [];
};

export type ZodDiscriminatedUnionOption<Discriminator extends string> =
  ZodObject<
    { [key in Discriminator]: ZodTypeAny } & ZodRawShape,
    UnknownKeysParam,
    ZodTypeAny
  >;

export interface ZodDiscriminatedUnionDef<
  Discriminator extends string,
  Options extends
    ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[],
> extends ZodTypeDef {
  discriminator: Discriminator;
  options: Options;
  optionsMap: Map<core.Primitive, ZodDiscriminatedUnionOption<any>>;
  typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
}

export class ZodDiscriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[],
> extends ZodType<core.output<Options[number]>, core.input<Options[number]>> {
  constructor(
    public override _def: ZodDiscriminatedUnionDef<Discriminator, Options>
  ) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.object) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const discriminator = this.discriminator;
    const discriminatorValue: string = input[discriminator];
    const option = this.optionsMap.get(discriminatorValue);

    if (!option) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator],
        },
      ]);
    }

    return option["~parse"](input, ctx) as any;
  }

  get discriminator(): Discriminator {
    return this._def.discriminator;
  }

  get options(): Options {
    return this._def.options;
  }

  get optionsMap(): Map<core.Primitive, ZodDiscriminatedUnionOption<any>> {
    return this._def.optionsMap;
  }

  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create<
    Discriminator extends string,
    Types extends [
      ZodDiscriminatedUnionOption<Discriminator>,
      ...ZodDiscriminatedUnionOption<Discriminator>[],
    ],
  >(
    discriminator: Discriminator,
    options: Types,
    params?: RawCreateParams
  ): ZodDiscriminatedUnion<Discriminator, Types> {
    // Get all the valid discriminator values
    const optionsMap: Map<core.Primitive, Types[number]> = new Map();

    // try {
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(
          `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
        );
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(
            `Discriminator property ${String(
              discriminator
            )} has duplicate value ${String(value)}`
          );
        }

        optionsMap.set(value, type);
      }
    }

    return new ZodDiscriminatedUnion<
      Discriminator,
      // DiscriminatorValue,
      Types
    >({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////////////
///////////////////////////////////////////////
//////////                           //////////
//////////      ZodIntersection      //////////
//////////                           //////////
///////////////////////////////////////////////
///////////////////////////////////////////////
export interface ZodIntersectionDef<
  T extends ZodTypeAny = ZodTypeAny,
  U extends ZodTypeAny = ZodTypeAny,
> extends ZodTypeDef {
  left: T;
  right: U;
  typeName: ZodFirstPartyTypeKind.ZodIntersection;
}

function mergeValues(
  a: any,
  b: any
):
  | { valid: true; data: any }
  | { valid: false; mergeErrorPath: (string | number)[] } {
  const aType = core.getParsedType(a);
  const bType = core.getParsedType(b);

  if (a === b) {
    return { valid: true, data: a };
  }
  if (
    aType === core.ZodParsedType.object &&
    bType === core.ZodParsedType.object
  ) {
    const bKeys = core.objectKeys(b);
    const sharedKeys = core
      .objectKeys(a)
      .filter((key) => bKeys.indexOf(key) !== -1);

    const newObj: any = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        };
      }
      newObj[key] = sharedValue.data;
    }

    return { valid: true, data: newObj };
  }
  if (
    aType === core.ZodParsedType.array &&
    bType === core.ZodParsedType.array
  ) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }

    const newArray: unknown[] = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);

      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        };
      }

      newArray.push(sharedValue.data);
    }

    return { valid: true, data: newArray };
  }
  if (
    aType === core.ZodParsedType.date &&
    bType === core.ZodParsedType.date &&
    +a === +b
  ) {
    return { valid: true, data: a };
  }
  return { valid: false, mergeErrorPath: [] };
}

export class ZodIntersection<
  T extends ZodTypeAny,
  U extends ZodTypeAny,
> extends ZodType<T["~output"] & U["~output"], T["~input"] & U["~input"]> {
  override "~def": ZodIntersectionDef<T, U>;
  constructor(_def: ZodIntersectionDef<T, U>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const handleParsed = (
      parsedLeft: core.SyncParseReturnType,
      parsedRight: core.SyncParseReturnType
    ): core.SyncParseReturnType<T & U> => {
      if (core.isAborted(parsedLeft) || core.isAborted(parsedRight)) {
        const issuesLeft = core.isAborted(parsedLeft) ? parsedLeft.issues : [];
        const issuesRight = core.isAborted(parsedRight)
          ? parsedRight.issues
          : [];
        return new core.ZodFailure(issuesLeft.concat(issuesRight));
      }

      const merged = mergeValues(parsedLeft, parsedRight);

      if (!merged.valid) {
        return new core.ZodFailure([
          {
            input,
            code: core.ZodIssueCode.invalid_intersection_types,
            mergeErrorPath: merged.mergeErrorPath,
          },
        ]);
      }

      return merged.data;
    };

    const parseResults = [
      this._def.left["~parse"](input, ctx),
      this._def.right["~parse"](input, ctx),
    ];

    const hasPromises = parseResults.some(
      (result) => result instanceof Promise
    );

    if (hasPromises) {
      return Promise.all(parseResults).then(([left, right]) =>
        handleParsed(left, right)
      );
    }
    return handleParsed(
      parseResults[0] as core.SyncParseReturnType,
      parseResults[1] as core.SyncParseReturnType
    );
  }

  static create<T extends ZodTypeAny, U extends ZodTypeAny>(
    left: T,
    right: U,
    params?: RawCreateParams
  ): ZodIntersection<T, U> {
    return new ZodIntersection({
      left: left,
      right: right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodTuple      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type ZodTupleItems = [ZodTypeAny, ...ZodTypeAny[]];
export type AssertArray<T> = T extends any[] ? T : never;
export type OutputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType ? T[k]["~output"] : never;
}>;
export type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null,
> = Rest extends ZodTypeAny
  ? [...OutputTypeOfTuple<T>, ...Rest["~output"][]]
  : OutputTypeOfTuple<T>;

export type InputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType ? T[k]["~input"] : never;
}>;
export type InputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null,
> = Rest extends ZodTypeAny
  ? [...InputTypeOfTuple<T>, ...Rest["~input"][]]
  : InputTypeOfTuple<T>;

export interface ZodTupleDef<
  T extends ZodTupleItems | [] = ZodTupleItems,
  Rest extends ZodTypeAny | null = null,
> extends ZodTypeDef {
  items: T;
  rest: Rest;
  typeName: ZodFirstPartyTypeKind.ZodTuple;
}

export type AnyZodTuple = ZodTuple<
  [ZodTypeAny, ...ZodTypeAny[]] | [],
  ZodTypeAny | null
>;
export class ZodTuple<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]],
  Rest extends ZodTypeAny | null = null,
> extends ZodType<
  OutputTypeOfTupleWithRest<T, Rest>,
  InputTypeOfTupleWithRest<T, Rest>
> {
  override "~def": ZodTupleDef<T, Rest>;
  constructor(_def: ZodTupleDef<T, Rest>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.array) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    if (input.length < this._def.items.length) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array",
        },
      ]);
    }

    const rest = this._def.rest;

    const issues: core.IssueData[] = [];

    if (!rest && input.length > this._def.items.length) {
      issues.push({
        input,
        code: core.ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array",
      });
    }

    let hasPromises = false;

    const items = ([...input] as any[])
      .map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return core.NOT_SET as any as core.SyncParseReturnType<any>;
        const result = schema["~parse"](item, ctx);
        if (result instanceof Promise) {
          hasPromises = true;
        }

        return result;
      })
      .filter((x) => x !== core.NOT_SET); // filter nulls

    if (hasPromises) {
      return Promise.all(items).then((results) => {
        issues.push(
          ...results.flatMap((r, i) =>
            !core.isAborted(r)
              ? []
              : r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
          )
        );

        if (issues.length) {
          return new core.ZodFailure(issues);
        }
        return results.map((x) => x as any) as any;
      });
    }
    issues.push(
      ...(items as core.SyncParseReturnType<any>[]).flatMap((r, i) =>
        !core.isAborted(r)
          ? []
          : r.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
      )
    );

    if (issues.length) {
      return new core.ZodFailure(issues);
    }
    return items.map((x) => x as any) as any;
  }

  get items(): T {
    return this._def.items;
  }

  rest<Rest extends ZodTypeAny>(rest: Rest): ZodTuple<T, Rest> {
    return new ZodTuple({
      ...this._def,
      rest,
    });
  }

  static create<T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: T,
    params?: RawCreateParams
  ): ZodTuple<T, null> {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodRecord      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface ZodRecordDef<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny,
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodRecord;
}

export type KeySchema = ZodType<string | number | symbol, any>;
export type RecordType<K extends string | number | symbol, V> = [
  string,
] extends [K]
  ? Record<K, V>
  : [number] extends [K]
    ? Record<K, V>
    : [symbol] extends [K]
      ? Record<K, V>
      : [BRAND<string | number | symbol>] extends [K]
        ? Record<K, V>
        : Partial<Record<K, V>>;
export class ZodRecord<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny,
> extends ZodType<
  RecordType<Key["~output"], Value["~output"]>,
  RecordType<Key["~input"], Value["~input"]>
> {
  override "~def": ZodRecordDef<Key, Value>;
  constructor(_def: ZodRecordDef<Key, Value>) {
    super(_def);
  }
  get keySchema(): Key {
    return this._def.keyType;
  }
  get valueSchema(): Value {
    return this._def.valueType;
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.object) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const issues: core.IssueData[] = [];

    const final: Record<any, any> = {};
    const asyncResults: {
      key: any;
      keyR: core.AsyncParseReturnType<any>;
      valueR: core.AsyncParseReturnType<any>;
    }[] = [];

    for (const key of core.objectKeys(input)) {
      if (key === "__proto__") continue;
      const keyResult = keyType["~parse"](key, ctx);
      const valueResult = valueType["~parse"](input[key], ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          key,
          keyR: keyResult as any,
          valueR: valueResult as any,
        });
      } else if (core.isAborted(keyResult) || core.isAborted(valueResult)) {
        if (core.isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        }
        if (core.isAborted(valueResult)) {
          issues.push(
            ...valueResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        }
      } else {
        final[keyResult as any] = valueResult as any;
      }
    }

    if (asyncResults.length) {
      return Promise.resolve().then(async () => {
        for (const asyncResult of asyncResults) {
          const key = asyncResult.key;
          const keyR = await asyncResult.keyR;
          const valueR = await asyncResult.valueR;
          if (core.isAborted(keyR) || core.isAborted(valueR)) {
            if (core.isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [key, ...(issue.path || [])],
                }))
              );
            }
            if (core.isAborted(valueR)) {
              issues.push(
                ...valueR.issues.map((issue) => ({
                  ...issue,
                  path: [key, ...(issue.path || [])],
                }))
              );
            }
          } else {
            final[keyR as any] = valueR;
          }
        }

        if (issues.length) {
          return new core.ZodFailure(issues);
        }
        return final as this["~output"];
      });
    }
    if (issues.length) {
      return new core.ZodFailure(issues);
    }
    return final as this["~output"];
  }

  get element(): Value {
    return this._def.valueType;
  }

  static create<Value extends ZodTypeAny>(
    valueType: Value,
    params?: RawCreateParams
  ): ZodRecord<ZodString, Value>;
  static create<Keys extends KeySchema, Value extends ZodTypeAny>(
    keySchema: Keys,
    valueType: Value,
    params?: RawCreateParams
  ): ZodRecord<Keys, Value>;
  static create(first: any, second?: any, third?: any): ZodRecord<any, any> {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        checks: [],
        ...processCreateParams(third),
      });
    }

    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      checks: [],
      ...processCreateParams(second),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodMap      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export interface ZodMapDef<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny,
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodMap;
}

export class ZodMap<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny,
> extends ZodType<
  Map<Key["~output"], Value["~output"]>,
  Map<Key["~input"], Value["~input"]>
> {
  override "~def": ZodMapDef<Key, Value>;
  constructor(_def: ZodMapDef<Key, Value>) {
    super(_def);
  }
  get keySchema(): Key {
    return this._def.keyType;
  }
  get valueSchema(): Value {
    return this._def.valueType;
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.map) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.map,
          received: parsedType,
        },
      ]);
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const asyncResults: {
      index: number;
      keyR: core.AsyncParseReturnType<any>;
      valueR: core.AsyncParseReturnType<any>;
    }[] = [];
    const issues: core.IssueData[] = [];
    const final = new Map();

    const entries = [...(input as Map<string | number, unknown>).entries()];
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const keyResult = keyType["~parse"](key, ctx);
      const valueResult = valueType["~parse"](value, ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          index: i,
          keyR: keyResult as core.AsyncParseReturnType<any>,
          valueR: valueResult as core.AsyncParseReturnType<any>,
        });
      } else if (core.isAborted(keyResult) || core.isAborted(valueResult)) {
        if (core.isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [i, "key", ...(issue.path || [])],
            }))
          );
        }
        if (core.isAborted(valueResult)) {
          issues.push(
            ...valueResult.issues.map((issue) => ({
              ...issue,
              path: [i, "value", ...(issue.path || [])],
            }))
          );
        }
      } else {
        final.set(keyResult, valueResult);
      }
    }

    if (asyncResults.length) {
      return Promise.resolve().then(async () => {
        for (const asyncResult of asyncResults) {
          const index = asyncResult.index;
          const keyR = await asyncResult.keyR;
          const valueR = await asyncResult.valueR;
          if (core.isAborted(keyR) || core.isAborted(valueR)) {
            if (core.isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [index, "key", ...(issue.path || [])],
                }))
              );
            }
            if (core.isAborted(valueR)) {
              issues.push(
                ...valueR.issues.map((issue) => ({
                  ...issue,
                  path: [index, "value", ...(issue.path || [])],
                }))
              );
            }
          } else {
            final.set(keyR, valueR);
          }
        }

        if (issues.length) {
          return new core.ZodFailure(issues);
        }

        return final;
      });
    }
    if (issues.length) {
      return new core.ZodFailure(issues);
    }

    return final;
  }
  static create<
    Key extends ZodTypeAny = ZodTypeAny,
    Value extends ZodTypeAny = ZodTypeAny,
  >(
    keyType: Key,
    valueType: Value,
    params?: RawCreateParams
  ): ZodMap<Key, Value> {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodSet      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  valueType: Value;
  typeName: ZodFirstPartyTypeKind.ZodSet;
  minSize: { value: number; message?: string } | null;
  maxSize: { value: number; message?: string } | null;
}

export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value["~output"]>,
  Set<Value["~input"]>
> {
  override "~def": ZodSetDef<Value>;
  constructor(_def: ZodSetDef<Value>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.set) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.set,
          received: parsedType,
        },
      ]);
    }

    const def = this._def;

    const issues: core.IssueData[] = [];

    if (def.minSize !== null) {
      if (input.size < def.minSize.value) {
        issues.push({
          input,
          code: core.ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message,
        });
      }
    }

    if (def.maxSize !== null) {
      if (input.size > def.maxSize.value) {
        issues.push({
          input,
          code: core.ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message,
        });
      }
    }

    const valueType = this._def.valueType;

    function finalizeSet(elements: core.SyncParseReturnType<any>[]) {
      const parsedSet = new Set();
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (core.isAborted(element)) {
          issues.push(
            ...element.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
          );
        } else {
          parsedSet.add(element);
        }
      }

      if (issues.length) {
        return new core.ZodFailure(issues);
      }

      return parsedSet;
    }

    let hasPromises = false;

    const elements = [...(input as Set<unknown>).values()].map((item) => {
      const result = valueType["~parse"](item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(elements).then(finalizeSet);
    }
    return finalizeSet(elements as core.SyncParseReturnType[]);
  }

  min(minSize: number, message?: core.ErrMessage): this {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: core.errToString(message) },
    }) as any;
  }

  max(maxSize: number, message?: core.ErrMessage): this {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: core.errToString(message) },
    }) as any;
  }

  size(size: number, message?: core.ErrMessage): this {
    return this.min(size, message).max(size, message) as any;
  }

  nonempty(message?: core.ErrMessage): ZodSet<Value> {
    return this.min(1, message) as any;
  }

  static create<Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value,
    params?: RawCreateParams
  ): ZodSet<Value> {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodFunction      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodFunctionDef<
  Args extends ZodTuple<any, any> = ZodTuple<any, any>,
  Returns extends ZodTypeAny = ZodTypeAny,
> extends ZodTypeDef {
  args: Args;
  returns: Returns;
  typeName: ZodFirstPartyTypeKind.ZodFunction;
}

export type OuterTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny,
> = Args["~input"] extends Array<any>
  ? (...args: Args["~input"]) => Returns["~output"]
  : never;

export type InnerTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny,
> = Args["~output"] extends Array<any>
  ? (...args: Args["~output"]) => Returns["~input"]
  : never;

export class ZodFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny,
> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  override "~def": ZodFunctionDef<Args, Returns>;
  constructor(_def: ZodFunctionDef<Args, Returns>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<any> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.function) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.function,
          received: parsedType,
        },
      ]);
    }

    function makeArgsIssue(args: any, error: core.ZodError): core.ZodIssue {
      return core.makeIssue(
        {
          input: args,
          code: core.ZodIssueCode.invalid_arguments,
          argumentsError: error,
        },
        ctx
      );
    }

    function makeReturnsIssue(
      returns: any,
      error: core.ZodError
    ): core.ZodIssue {
      return core.makeIssue(
        {
          input: returns,
          code: core.ZodIssueCode.invalid_return_type,
          returnTypeError: error,
        },
        ctx
      );
    }

    const params = { errorMap: ctx.contextualErrorMap };
    const fn = input;

    if (this._def.returns instanceof ZodPromise) {
      // Would love a way to avoid disabling this rule, but we need
      // an alias (using an arrow function was what caused 2651).
      const me = this;
      return async function (this: any, ...args: any[]) {
        const error = new core.ZodError([]);
        const parsedArgs = await me._def.args
          .parseAsync(args, params)
          .catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
        const result = await Reflect.apply(fn, this, parsedArgs as any);
        const parsedReturns = await (
          me._def.returns as unknown as ZodPromise<ZodTypeAny>
        )._def.type
          .parseAsync(result, params)
          .catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
        return parsedReturns;
      };
    }
    // Would love a way to avoid disabling this rule, but we need
    // an alias (using an arrow function was what caused 2651).
    const me = this;
    return function (this: any, ...args: any[]) {
      const parsedArgs = me._def.args.safeParse(args, params);
      if (!parsedArgs.success) {
        throw new core.ZodError([makeArgsIssue(args, parsedArgs.error)]);
      }
      const result = Reflect.apply(fn, this, parsedArgs.data);
      const parsedReturns = me._def.returns.safeParse(result, params);
      if (!parsedReturns.success) {
        throw new core.ZodError([
          makeReturnsIssue(result, parsedReturns.error),
        ]);
      }
      return parsedReturns.data;
    } as any;
  }

  parameters(): Args {
    return this._def.args;
  }

  returnType(): Returns {
    return this._def.returns;
  }

  args<Items extends Parameters<(typeof ZodTuple)["create"]>[0]>(
    ...items: Items
  ): ZodFunction<ZodTuple<Items, ZodUnknown>, Returns> {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create()) as any,
    });
  }

  returns<NewReturnType extends ZodType>(
    returnType: NewReturnType
  ): ZodFunction<Args, NewReturnType> {
    return new ZodFunction({
      ...this._def,
      returns: returnType,
    });
  }

  implement<F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ): ReturnType<F> extends Returns["~output"]
    ? (...args: Args["~input"]) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns> {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  }

  strictImplement(
    func: InnerTypeOfFunction<Args, Returns>
  ): InnerTypeOfFunction<Args, Returns> {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  }

  validate: (typeof this)["implement"] = this.implement;

  static create(): ZodFunction<ZodTuple<[], ZodUnknown>, ZodUnknown>;
  static create<T extends AnyZodTuple = ZodTuple<[], ZodUnknown>>(
    args: T
  ): ZodFunction<T, ZodUnknown>;
  static create<T extends AnyZodTuple, U extends ZodTypeAny>(
    args: T,
    returns: U
  ): ZodFunction<T, U>;
  static create<
    T extends AnyZodTuple = ZodTuple<[], ZodUnknown>,
    U extends ZodTypeAny = ZodUnknown,
  >(args: T, returns: U, params?: RawCreateParams): ZodFunction<T, U>;
  static create(
    args?: AnyZodTuple,
    returns?: ZodTypeAny,
    params?: RawCreateParams
  ) {
    return new ZodFunction({
      args: (args
        ? args
        : ZodTuple.create([]).rest(ZodUnknown.create())) as any,
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodLazy      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  getter: () => T;
  typeName: ZodFirstPartyTypeKind.ZodLazy;
}

export class ZodLazy<T extends ZodTypeAny> extends ZodType<
  core.output<T>,
  core.input<T>
> {
  override "~def": ZodLazyDef<T>;
  constructor(_def: ZodLazyDef<T>) {
    super(_def);
  }
  get schema(): T {
    return this._def.getter();
  }

  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const lazySchema = this._def.getter();
    return lazySchema["~parse"](input, ctx);
  }

  static create<T extends ZodTypeAny>(
    getter: () => T,
    params?: RawCreateParams
  ): ZodLazy<T> {
    return new ZodLazy({
      getter: getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodLiteral      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodLiteralDef<T = any> extends ZodTypeDef {
  value: T;
  typeName: ZodFirstPartyTypeKind.ZodLiteral;
  message?: string;
}

export class ZodLiteral<T> extends ZodType<T, T> {
  override "~def": ZodLiteralDef<T>;
  constructor(_def: ZodLiteralDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    if (input !== this._def.value) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_literal,
          expected: this._def.value,
          received: input,
          message: this._def.message,
        },
      ]);
    }
    return input;
  }

  get value(): T {
    return this._def.value;
  }

  static create<T extends core.Primitive>(
    value: T,
    params?: RawCreateParams & Exclude<core.ErrMessage, string>
  ): ZodLiteral<T> {
    return new ZodLiteral({
      value: value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      message: params?.message,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodEnum      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export type ArrayKeys = keyof any[];
export type Indices<T> = Exclude<keyof T, ArrayKeys>;

export type EnumValues<T extends string = string> = readonly [T, ...T[]];

export type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

export interface ZodEnumDef<T extends EnumValues = EnumValues>
  extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodEnum;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type FilterEnum<Values, ToExclude> = Values extends []
  ? []
  : Values extends [infer Head, ...infer Rest]
    ? Head extends ToExclude
      ? FilterEnum<Rest, ToExclude>
      : [Head, ...FilterEnum<Rest, ToExclude>]
    : never;

export type typecast<A, T> = A extends T ? A : never;

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  T[number]
> {
  override "~def": ZodEnumDef<T>;
  constructor(_def: ZodEnumDef<T>) {
    super(_def);
  }
  #cache: Set<T[number]> | undefined;

  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    if (typeof input !== "string") {
      const parsedType = core.getParsedType(input);
      const expectedValues = this._def.values;
      return new core.ZodFailure([
        {
          input,
          expected: core.joinValues(expectedValues) as "string",
          received: parsedType,
          code: core.ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(this._def.values);
    }

    if (!this.#cache.has(input)) {
      const expectedValues = this._def.values;

      return new core.ZodFailure([
        {
          input,
          received: input,
          code: core.ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input;
  }

  get options(): T {
    return this._def.values;
  }

  get enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Values(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  extract<ToExtract extends readonly [T[number], ...T[number][]]>(
    values: ToExtract,
    newDef: RawCreateParams = this._def
  ): ZodEnum<Writeable<ToExtract>> {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef,
    }) as any;
  }

  exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
    values: ToExclude,
    newDef: RawCreateParams = this._def
  ): ZodEnum<
    typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
  > {
    return ZodEnum.create(
      this.options.filter((opt) => !values.includes(opt)) as FilterEnum<
        T,
        ToExclude[number]
      >,
      {
        ...this._def,
        ...newDef,
      }
    ) as any;
  }

  static create<U extends string, T extends Readonly<[U, ...U[]]>>(
    values: T,
    params?: RawCreateParams
  ): ZodEnum<Writeable<T>>;
  static create<U extends string, T extends [U, ...U[]]>(
    values: T,
    params?: RawCreateParams
  ): ZodEnum<T>;
  static create(values: [string, ...string[]], params?: RawCreateParams) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodNativeEnum      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
  extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodNativeEnum;
}

export type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  T[keyof T]
> {
  override "~def": ZodNativeEnumDef<T>;
  constructor(_def: ZodNativeEnumDef<T>) {
    super(_def);
  }
  #cache: Set<T[keyof T]> | undefined;
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<T[keyof T]> {
    const nativeEnumValues = core.getValidEnumValues(this._def.values);

    const parsedType = core.getParsedType(input);
    if (
      parsedType !== core.ZodParsedType.string &&
      parsedType !== core.ZodParsedType.number
    ) {
      const expectedValues = core.objectValues(nativeEnumValues);
      return new core.ZodFailure([
        {
          input,
          expected: core.joinValues(expectedValues) as "string",
          received: parsedType,
          code: core.ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(core.getValidEnumValues(this._def.values));
    }

    if (!this.#cache.has(input)) {
      const expectedValues = core.objectValues(nativeEnumValues);

      return new core.ZodFailure([
        {
          input,
          received: input,
          code: core.ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input as any;
  }

  get enum(): T {
    return this._def.values;
  }

  static create<T extends EnumLike>(
    values: T,
    params?: RawCreateParams
  ): ZodNativeEnum<T> {
    return new ZodNativeEnum({
      values: values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodFile         //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export type ZodFileCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "type"; value: Array<string>; message?: string }
  | { kind: "filename"; value: ZodTypeAny; message?: string };

export interface ZodFileDef extends ZodTypeDef {
  // checks: ZodFileCheck[];
  typeName: ZodFirstPartyTypeKind.ZodFile;
}

interface _ZodBlob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream;
  text(): Promise<string>;
}

interface _ZodFile extends _ZodBlob {
  readonly lastModified: number;
  readonly name: string;
}

type File = typeof globalThis extends {
  File: {
    prototype: infer X;
  };
}
  ? X
  : _ZodFile;

export class ZodFile extends ZodType<File, File> {
  override "~def": ZodFileDef;
  constructor(_def: ZodFileDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<File> {
    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.file) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.file,
          received: parsedType,
        },
      ]);
    }

    const file: File = input;

    const issues: core.IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (file.size < check.value) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_small,
            minimum: check.value,
            type: "file",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "max") {
        if (file.size > check.value) {
          issues.push({
            input,
            code: core.ZodIssueCode.too_big,
            maximum: check.value,
            type: "file",
            inclusive: true,
            exact: false,
            message: check.message,
          });
        }
      } else if (check.kind === "type") {
        const _check: any = check;
        const cache: Set<string> = _check.cache ?? new Set(check.value);
        // @todo support extensions?
        // const extension =
        //   file.name.indexOf(".") >= 0
        //     ? file.name.slice(file.name.indexOf("."))
        //     : undefined;
        // const checkSpecifier = (fileTypeSpecifier: string): boolean => {
        //   if (fileTypeSpecifier.startsWith(".")) {
        //     return fileTypeSpecifier === extension;
        //   }
        //   return fileTypeSpecifier === file.type;
        // };
        if (!cache.has(file.type)) {
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_file_type,
            expected: check.value,
            received: file.type,
            message: check.message,
          });
        }
      } else if (check.kind === "filename") {
        const parsedFilename = check.value.safeParse(file.name);
        if (!parsedFilename.success) {
          issues.push({
            input,
            code: core.ZodIssueCode.invalid_file_name,
            message: check.message,
          });
        }
      } else {
        core.assertNever(check);
      }
    }

    if (issues.length > 0) {
      return new core.ZodFailure(issues);
    }

    return file;
  }

  _addCheck(check: ZodFileCheck): ZodFile {
    return new ZodFile({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  /**
   * Restricts file size to the specified min.
   */
  min(minSize: number, message?: core.ErrMessage): ZodFile {
    return this._addCheck({
      kind: "min",
      value: minSize,
      ...core.errToObj(message),
    });
  }

  /**
   * Restricts file size to the specified max.
   */
  max(maxSize: number, message?: core.ErrMessage): ZodFile {
    return this._addCheck({
      kind: "max",
      value: maxSize,
      ...core.errToObj(message),
    });
  }

  /**
   * Restrict accepted file types.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
   */
  type(fileTypes: Array<string>, message?: core.ErrMessage): ZodFile {
    const invalidTypes = [];
    for (const t of fileTypes) {
      if (!t.includes("/")) {
        invalidTypes.push(t);
      }
    }
    if (invalidTypes.length > 0) {
      throw new Error(`Invalid file type(s): ${invalidTypes.join(", ")}`);
    }
    return this._addCheck({
      kind: "type",
      value: fileTypes,
      ...core.errToObj(message),
    });
  }

  /**
   * Validates file name against the provided schema.
   */
  name(schema: ZodTypeAny, message?: core.ErrMessage): ZodFile {
    return this._addCheck({
      kind: "filename",
      value: schema,
      ...core.errToObj(message),
    });
  }

  get minSize(): number | null {
    let min: number | null = null;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (min === null || check.value > min) {
          min = check.value;
        }
      }
    }
    return min;
  }

  get maxSize(): number | null {
    let max: number | null = null;
    for (const check of this._def.checks) {
      if (check.kind === "max") {
        if (max === null || check.value < max) {
          max = check.value;
        }
      }
    }
    return max;
  }

  /**
   * Returns accepted file types or undefined if any file type is acceptable.
   */
  get acceptedTypes(): string[] | undefined {
    let result: Array<string> | undefined;
    for (const check of this._def.checks) {
      if (check.kind === "type") {
        if (check.value) {
          if (result) {
            // reduce to intersection
            result = result.filter((fileType) =>
              check.value.includes(fileType)
            );
          } else {
            result = check.value;
          }
        }
      }
    }
    return result;
  }

  static create = (params?: RawCreateParams): ZodFile => {
    if (typeof File === "undefined") {
      throw new Error("File is not supported in this environment");
    }
    return new ZodFile({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodFile,
      checks: [],
      ...processCreateParams(params),
    });
  };
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodPromise      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodPromise;
}

export class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T["~output"]>,
  Promise<T["~input"]>
> {
  override "~def": ZodPromiseDef<T>;
  constructor(_def: ZodPromiseDef<T>) {
    super(_def);
  }
  unwrap(): T {
    return this._def.type;
  }

  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.promise) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.promise,
          received: parsedType,
        },
      ]);
    }

    return input.then((inner: any) => {
      return this._def.type["~parse"](inner, ctx);
    });
  }

  static create<T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodPromise<T> {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////        ZodEffects        //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export type Refinement<T> = (arg: T, ctx: RefinementCtx) => any;
export type SuperRefinement<T> = (
  arg: T,
  ctx: RefinementCtx
) => void | Promise<void>;

export type RefinementEffect<T> = {
  type: "refinement";
  refinement: (arg: T, ctx: RefinementCtx) => any;
};
export type TransformEffect<T> = {
  type: "transform";
  transform: (arg: T, ctx: RefinementCtx) => any;
};
export type PreprocessEffect<T> = {
  type: "preprocess";
  transform: (arg: T, ctx: RefinementCtx) => any;
};
export type Effect<T> =
  | RefinementEffect<T>
  | TransformEffect<T>
  | PreprocessEffect<T>;

export interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  schema: T;
  typeName: ZodFirstPartyTypeKind.ZodEffects;
  effect: Effect<any>;
}

export class ZodEffects<
  T extends ZodTypeAny,
  Output = core.output<T>,
  Input = core.input<T>,
> extends ZodType<Output, Input> {
  override "~def": ZodEffectsDef<T>;
  constructor(_def: ZodEffectsDef<T>) {
    super(_def);
  }
  innerType(): T {
    return this._def.schema;
  }

  sourceType(): T {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
      ? (this._def.schema as unknown as ZodEffects<T>).sourceType()
      : (this._def.schema as T);
  }

  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const effect = this._def.effect || null;

    const issues: core.IssueData[] = [];

    const checkCtx: RefinementCtx = {
      addIssue: (arg: core.IssueData) => {
        issues.push(arg);
      },
    };

    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

    if (effect.type === "preprocess") {
      const processed = effect.transform(input, checkCtx);

      if (processed instanceof Promise) {
        return processed.then((processed) => {
          if (issues.some((i) => i.fatal)) {
            return new core.ZodFailure(issues);
          }
          const result = this._def.schema["~parse"](processed, ctx);
          if (result instanceof Promise) {
            return result.then((r) => {
              if (core.isAborted(r)) {
                issues.push(...r.issues);
              }
              if (issues.length) return new core.ZodFailure(issues);
              return r;
            });
          }

          if (core.isAborted(result)) {
            issues.push(...result.issues);
            return new core.ZodFailure(issues);
          }

          return issues.length ? new core.ZodFailure(issues) : result;
        }) as any;
      }
      if (issues.some((i) => i.fatal)) {
        return new core.ZodFailure(issues);
      }
      const result = this._def.schema["~parse"](processed, ctx);

      if (result instanceof Promise) {
        return result.then((r) => {
          if (core.isAborted(r)) {
            issues.push(...r.issues);
          }
          if (issues.length) return new core.ZodFailure(issues);
          return r;
        });
      }

      if (core.isAborted(result)) {
        issues.push(...result.issues);
        return new core.ZodFailure(issues);
      }

      return issues.length ? new core.ZodFailure(issues) : (result as any);
    }

    if (effect.type === "refinement") {
      const executeRefinement = (acc: unknown): any => {
        const result = effect.refinement(acc, checkCtx);
        if (result instanceof Promise) {
          return Promise.resolve(result);
        }
        return acc;
      };

      const inner = this._def.schema["~parse"](input, ctx);

      if (!(inner instanceof Promise)) {
        if (core.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        const value = core.isAborted(inner)
          ? inner.value !== core.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;
        // else, check core.ZodFailure for `.value` (set after transforms)
        // then fall back to original input
        if (issues.some((i) => i.fatal)) {
          return new core.ZodFailure(issues, value);
        }

        // return value is ignored
        const executed = executeRefinement(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new core.ZodFailure(issues, inner);
            return inner;
          }) as any;
        }

        if (issues.length) return new core.ZodFailure(issues, inner);
        return inner as any;
      }
      return inner.then((inner) => {
        if (core.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        if (issues.some((i) => i.fatal)) {
          return new core.ZodFailure(issues, inner);
        }

        const value = core.isAborted(inner)
          ? inner.value !== core.NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;

        const executed = executeRefinement(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new core.ZodFailure(issues, inner);
            return inner;
          });
        }

        if (issues.length) return new core.ZodFailure(issues, inner);
        return inner;
      });
    }

    if (effect.type === "transform") {
      const inner = this._def.schema["~parse"](input, ctx);
      if (!(inner instanceof Promise)) {
        if (core.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        // do not execute transform if any issues exist
        if (issues.length) return new core.ZodFailure(issues);

        const value = core.isAborted(inner)
          ? inner.value === core.NOT_SET
            ? input
            : inner.value
          : inner;

        const result = effect.transform(value, checkCtx);
        if (result instanceof Promise) {
          return result.then((result) => {
            if (issues.length) return new core.ZodFailure(issues, result);
            return result;
          });
        }

        if (issues.length) return new core.ZodFailure(issues, result);
        return result;
      }
      return inner.then((inner) => {
        if (core.isAborted(inner)) {
          issues.push(...inner.issues);
        }

        if (issues.length) return new core.ZodFailure(issues, inner);

        const value = core.isAborted(inner)
          ? inner.value === core.NOT_SET
            ? input
            : inner.value
          : inner;

        const result = effect.transform(value, checkCtx);

        if (result instanceof Promise) {
          return result.then((result) => {
            if (issues.length) return new core.ZodFailure(issues, result);
            return result;
          });
        }

        if (issues.length) return new core.ZodFailure(issues, result);
        return result;
      });
    }

    core.assertNever(effect);
  }

  static create<I extends ZodTypeAny>(
    schema: I,
    effect: Effect<I["~output"]>,
    params?: RawCreateParams
  ): ZodEffects<I, I["~output"]> {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      checks: [],
      ...processCreateParams(params),
    });
  }

  static createWithPreprocess<I extends ZodTypeAny>(
    preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ): ZodEffects<I, I["~output"], unknown> {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

export { ZodEffects as ZodTransformer };

class ZodCheckStringEmail extends ZodType<string, ZodTypeDef, unknown> {
  "~parse"(
    input: core.ParseInput,
    ctx?: core.ParseContext
  ): core.ParseReturnType<string> {
    if (typeof input !== "string") {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.string,
          received: core.getParsedType(input),
        },
      ]);
    }
    "~check"(ctx: CheckCt)
  }
  "~toJsonSchema"() {}
}
///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodOptional      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodOptional;
}

export type ZodOptionalType<T extends ZodTypeAny> = ZodOptional<T>;

export class ZodOptional<T extends ZodTypeAny> extends ZodType<
  T["~output"] | undefined,
  T["~input"] | undefined
> {
  override "~def": ZodOptionalDef<T>;
  constructor(_def: ZodOptionalDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType === core.ZodParsedType.undefined) {
      return undefined;
    }
    return this._def.innerType["~parse"](input, ctx);
  }

  unwrap(): T {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodOptional<T> {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodNullable      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodNullable;
}

export type ZodNullableType<T extends ZodTypeAny> = ZodNullable<T>;

export class ZodNullable<T extends ZodTypeAny> extends ZodType<
  T["~output"] | null,
  T["~input"] | null
> {
  override "~def": ZodNullableDef<T>;
  constructor(_def: ZodNullableDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType === core.ZodParsedType.null) {
      return null;
    }
    return this._def.innerType["~parse"](input, ctx);
  }

  unwrap(): T {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodNullable<T> {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  defaultValue: () => core.noUndefined<T["~input"]>;
  typeName: ZodFirstPartyTypeKind.ZodDefault;
}

export class ZodDefault<T extends ZodTypeAny> extends ZodType<
  core.noUndefined<T["~output"]>,
  T["~input"] | undefined
> {
  override "~def": ZodDefaultDef<T>;
  constructor(_def: ZodDefaultDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const parsedType = core.getParsedType(input);
    if (parsedType === core.ZodParsedType.undefined) {
      input = this._def.defaultValue();
    }
    return this._def.innerType["~parse"](input, ctx) as any;
  }

  removeDefault(): T {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      default: T["~input"] | (() => core.noUndefined<T["~input"]>);
    }
  ): ZodDefault<T> {
    return new ZodDefault({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue:
        typeof params.default === "function"
          ? params.default
          : ((() => params.default) as any),
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////       ZodCatch       //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodCatchDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  catchValue: (ctx: { error: core.ZodError; input: unknown }) => T["~input"];
  typeName: ZodFirstPartyTypeKind.ZodCatch;
}

export class ZodCatch<T extends ZodTypeAny> extends ZodType<
  T["~output"],
  unknown // any input will pass validation // T["~input"]
> {
  override "~def": ZodCatchDef<T>;
  constructor(_def: ZodCatchDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const result = this._def.innerType["~parse"](input, ctx);

    if (core.isAsync(result)) {
      return result.then((result) => {
        return {
          status: "valid",
          value: core.isAborted(result)
            ? this._def.catchValue({
                get error() {
                  return new core.ZodError(
                    result.issues.map((issue) => core.makeIssue(issue, ctx))
                  );
                },
                input,
              })
            : result,
        };
      });
    }
    return core.isAborted(result)
      ? this._def.catchValue({
          get error() {
            return new core.ZodError(
              result.issues.map((issue) => core.makeIssue(issue, ctx))
            );
          },
          input,
        })
      : result;
  }

  removeCatch(): T {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      catch: T["~output"] | (() => T["~output"]);
    }
  ): ZodCatch<T> {
    return new ZodCatch({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue:
        typeof params.catch === "function"
          ? params.catch
          : ((() => params.catch) as any),
      checks: [],
      ...processCreateParams(params),
    });
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNaN         //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodNaNDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNaN;
}

export class ZodNaN extends ZodType<number, number> {
  override "~def": ZodNaNDef;
  constructor(_def: ZodNaNDef) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<any> {
    const parsedType = core.getParsedType(input);
    if (parsedType !== core.ZodParsedType.nan) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.nan,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): ZodNaN {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      checks: [],
      ...processCreateParams(params),
    });
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodBranded      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodBrandedDef<T extends ZodTypeAny> extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodBranded;
}

export const BRAND: unique symbol = Symbol("zod_brand");
export type BRAND<T extends string | number | symbol> = {
  [BRAND]: { [k in T]: true };
};

export class ZodBranded<
  T extends ZodTypeAny,
  B extends string | number | symbol,
> extends ZodType<T["~output"] & BRAND<B>, T["~input"]> {
  override "~def": ZodBrandedDef<T>;
  constructor(_def: ZodBrandedDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<any> {
    return this._def.type["~parse"](input, ctx);
  }

  unwrap(): T {
    return this._def.type;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodPipeline       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////

export interface ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny>
  extends ZodTypeDef {
  in: A;
  out: B;
  typeName: ZodFirstPartyTypeKind.ZodPipeline;
}

export class ZodPipeline<
  A extends ZodTypeAny,
  B extends ZodTypeAny,
> extends ZodType<B["~output"], A["~input"]> {
  override "~def": ZodPipelineDef<A, B>;
  constructor(_def: ZodPipelineDef<A, B>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<any> {
    const result = this._def.in["~parse"](input, ctx);
    if (result instanceof Promise) {
      return result.then((inResult) => {
        if (core.isAborted(inResult)) return inResult;

        return this._def.out["~parse"](inResult, ctx);
      });
    }
    if (core.isAborted(result)) return result;

    return this._def.out["~parse"](result, ctx);
  }

  static create<A extends ZodTypeAny, B extends ZodTypeAny>(
    a: A,
    b: B
  ): ZodPipeline<A, B> {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline,
    });
  }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////      ZodReadonly      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? ReadonlyArray<V>
        : T extends BuiltIn
          ? T
          : Readonly<T>;

export interface ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodReadonly;
}

export class ZodReadonly<T extends ZodTypeAny> extends ZodType<
  MakeReadonly<T["~output"]>,
  MakeReadonly<T["~input"]>
> {
  override "~def": ZodReadonlyDef<T>;
  constructor(_def: ZodReadonlyDef<T>) {
    super(_def);
  }
  "~parse"(
    input: core.ParseInput,
    ctx: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    const result = this._def.innerType["~parse"](input, ctx);
    const freeze = (data: unknown) => {
      if (core.isValid(data)) {
        data = Object.freeze(data) as any;
      }
      return data;
    };
    return core.isAsync(result)
      ? result.then((data) => freeze(data))
      : (freeze(result) as any);
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodReadonly<T> {
    return new ZodReadonly({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodReadonly,
      checks: [],
      ...processCreateParams(params),
    }) as any;
  }

  unwrap(): T {
    return this._def.innerType;
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////  ZodTemplateLiteral  //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

type TemplateLiteralPrimitive = string | number | boolean | null | undefined;

type TemplateLiteralInterpolatedPosition = ZodType<
  TemplateLiteralPrimitive | bigint
>;
type TemplateLiteralPart =
  | TemplateLiteralPrimitive
  | TemplateLiteralInterpolatedPosition;

type appendToTemplateLiteral<
  Template extends string,
  Suffix extends TemplateLiteralPrimitive | ZodType,
> = Suffix extends TemplateLiteralPrimitive
  ? `${Template}${Suffix}`
  : Suffix extends ZodOptional<infer UnderlyingType>
    ? Template | appendToTemplateLiteral<Template, UnderlyingType>
    : Suffix extends ZodBranded<infer UnderlyingType, any>
      ? appendToTemplateLiteral<Template, UnderlyingType>
      : Suffix extends ZodType<infer Output, any>
        ? Output extends TemplateLiteralPrimitive | bigint
          ? `${Template}${Output}`
          : never
        : never;

type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
  [] extends Parts
    ? ``
    : Parts extends [
          ...infer Rest extends TemplateLiteralPart[],
          infer Last extends TemplateLiteralPart,
        ]
      ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
      : never;

export interface ZodTemplateLiteralDef extends ZodTypeDef {
  coerce: boolean;
  parts: readonly TemplateLiteralPart[];
  regexString: string;
  typeName: ZodFirstPartyTypeKind.ZodTemplateLiteral;
}

export class ZodTemplateLiteral<Template extends string = ""> extends ZodType<
  Template,
  Template
> {
  override "~def": ZodTemplateLiteralDef;
  constructor(_def: ZodTemplateLiteralDef) {
    super(_def);
  }
  interpolated<I extends TemplateLiteralInterpolatedPosition>(
    type: Exclude<I, ZodNever | ZodNaN | ZodPipeline<any, any> | ZodLazy<any>>
  ): ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
    // TODO: check for invalid types at runtime
    return this._addPart(type) as any;
  }

  literal<L extends TemplateLiteralPrimitive>(
    literal: L
  ): ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
    return this._addPart(literal) as any;
  }

  "~parse"(
    input: core.ParseInput,
    _ctx: core.ParseContext
  ): core.ParseReturnType<Template> {
    if (this._def.coerce) {
      input = String(input);
    }

    const parsedType = core.getParsedType(input);

    if (parsedType !== core.ZodParsedType.string) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.string,
          received: parsedType,
        },
      ]);
    }

    if (!new RegExp(this._def.regexString).test(input)) {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.custom,
          message: `String does not match template literal`,
        },
      ]);
    }

    return input;
  }

  protected _addParts(parts: TemplateLiteralPart[]): ZodTemplateLiteral {
    let r = this._def.regexString;
    for (const part of parts) {
      r = this._appendToRegexString(r, part);
    }
    return new ZodTemplateLiteral({
      ...this._def,
      parts: [...this._def.parts, ...parts],
      regexString: r,
    });
  }

  protected _addPart(
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): ZodTemplateLiteral {
    const parts = [...this._def.parts, part];

    return new ZodTemplateLiteral({
      ...this._def,
      parts,
      regexString: this._appendToRegexString(this._def.regexString, part),
    });
  }

  protected _appendToRegexString(
    regexString: string,
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): string {
    return `^${this._unwrapRegExp(
      regexString
    )}${this._transformPartToRegexString(part)}$`;
  }

  protected _transformPartToRegexString(
    part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
  ): string {
    if (!(part instanceof ZodType)) {
      return this._escapeRegExp(part);
    }

    if (part instanceof ZodLiteral) {
      return this._escapeRegExp(part._def.value);
    }

    if (part instanceof ZodString) {
      return this._transformZodStringPartToRegexString(part);
    }

    if (part instanceof ZodEnum || part instanceof ZodNativeEnum) {
      const values =
        part instanceof ZodEnum
          ? part._def.values
          : core.getValidEnumValues(part._def.values);

      return `(${values.map(this._escapeRegExp).join("|")})`;
    }

    if (part instanceof ZodUnion) {
      return `(${(part._def.options as any[])
        .map((option) => this._transformPartToRegexString(option))
        .join("|")})`;
    }

    if (part instanceof ZodNumber) {
      return this._transformZodNumberPartToRegexString(part);
    }

    if (part instanceof ZodOptional) {
      return `(${this._transformPartToRegexString(part.unwrap())})?`;
    }

    if (part instanceof ZodTemplateLiteral) {
      return this._unwrapRegExp(part._def.regexString);
    }

    if (part instanceof ZodBigInt) {
      // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
      return "\\-?\\d+";
    }

    if (part instanceof ZodBoolean) {
      return "(true|false)";
    }

    if (part instanceof ZodNullable) {
      do {
        part = part.unwrap();
      } while (part instanceof ZodNullable);

      return `(${this._transformPartToRegexString(part)}|null)${
        part instanceof ZodOptional ? "?" : ""
      }`;
    }

    if (part instanceof ZodBranded) {
      return this._transformPartToRegexString(part.unwrap());
    }

    if (part instanceof ZodAny) {
      return ".*";
    }

    if (part instanceof ZodNull) {
      return "null";
    }

    if (part instanceof ZodUndefined) {
      return "undefined";
    }

    throw new core.ZodTemplateLiteralUnsupportedTypeError();
  }

  // FIXME: we don't support transformations, so `.trim()` is not supported.
  protected _transformZodStringPartToRegexString(part: ZodString): string {
    let maxLength = Number.POSITIVE_INFINITY;
    let minLength = 0;
    let endsWith = "";
    let startsWith = "";

    for (const ch of part._def.checks) {
      const regex = this._resolveRegexForStringCheck(ch);

      if (regex) {
        return this._unwrapRegExp(regex);
      }

      if (ch.kind === "endsWith") {
        endsWith = ch.value;
      } else if (ch.kind === "length") {
        minLength = maxLength = ch.value;
      } else if (ch.kind === "max") {
        maxLength = Math.max(0, Math.min(maxLength, ch.value));
      } else if (ch.kind === "min") {
        minLength = Math.max(minLength, ch.value);
      } else if (ch.kind === "startsWith") {
        startsWith = ch.value;
      } else {
        throw new core.ZodTemplateLiteralUnsupportedCheckError(
          ZodFirstPartyTypeKind.ZodString,
          ch.kind
        );
      }
    }

    const constrainedMinLength = Math.max(
      0,
      minLength - startsWith.length - endsWith.length
    );
    const constrainedMaxLength = Number.isFinite(maxLength)
      ? Math.max(0, maxLength - startsWith.length - endsWith.length)
      : Number.POSITIVE_INFINITY;

    if (
      constrainedMaxLength === 0 ||
      constrainedMinLength > constrainedMaxLength
    ) {
      return `${startsWith}${endsWith}`;
    }

    return `${startsWith}.${this._resolveRegexWildcardLength(
      constrainedMinLength,
      constrainedMaxLength
    )}${endsWith}`;
  }

  protected _resolveRegexForStringCheck(check: ZodStringCheck): RegExp | null {
    return {
      [check.kind]: null,
      cuid: cuidRegex,
      cuid2: cuid2Regex,
      datetime: check.kind === "datetime" ? datetimeRegex(check) : null,
      email: emailRegex,
      ip:
        check.kind === "ip"
          ? {
              any: new RegExp(
                `^(${this._unwrapRegExp(
                  ipv4Regex.source
                )})|(${this._unwrapRegExp(ipv6Regex.source)})$`
              ),
              v4: ipv4Regex,
              v6: ipv6Regex,
            }[check.version || "any"]
          : null,
      regex: check.kind === "regex" ? check.regex : null,
      ulid: ulidRegex,
      uuid: uuidRegex,
    }[check.kind];
  }

  protected _resolveRegexWildcardLength(
    minLength: number,
    maxLength: number
  ): string {
    if (minLength === maxLength) {
      return minLength === 1 ? "" : `{${minLength}}`;
    }

    if (maxLength !== Number.POSITIVE_INFINITY) {
      return `{${minLength},${maxLength}}`;
    }

    if (minLength === 0) {
      return "*";
    }

    if (minLength === 1) {
      return "+";
    }

    return `{${minLength},}`;
  }

  // FIXME: we do not support exponent notation (e.g. 2e5) since it conflicts with `.int()`.
  protected _transformZodNumberPartToRegexString(part: ZodNumber): string {
    let canBeNegative = true;
    let canBePositive = true;
    let min = Number.NEGATIVE_INFINITY;
    let max = Number.POSITIVE_INFINITY;
    let canBeZero = true;
    let finite = false;
    let isInt = false;
    let acc = "";

    for (const ch of part._def.checks) {
      if (ch.kind === "finite") {
        finite = true;
      } else if (ch.kind === "int") {
        isInt = true;
      } else if (ch.kind === "max") {
        max = Math.min(max, ch.value);

        if (ch.value <= 0) {
          canBePositive = false;

          if (ch.value === 0 && !ch.inclusive) {
            canBeZero = false;
          }
        }
      } else if (ch.kind === "min") {
        min = Math.max(min, ch.value);

        if (ch.value >= 0) {
          canBeNegative = false;

          if (ch.value === 0 && !ch.inclusive) {
            canBeZero = false;
          }
        }
      } else {
        throw new core.ZodTemplateLiteralUnsupportedCheckError(
          ZodFirstPartyTypeKind.ZodNumber,
          ch.kind
        );
      }
    }

    if (Number.isFinite(min) && Number.isFinite(max)) {
      finite = true;
    }

    if (canBeNegative) {
      acc = `${acc}\\-`;

      if (canBePositive) {
        acc = `${acc}?`;
      }
    } else if (!canBePositive) {
      return "0+";
    }

    if (!finite) {
      acc = `${acc}(Infinity|(`;
    }

    if (!canBeZero) {
      if (!isInt) {
        acc = `${acc}((\\d*[1-9]\\d*(\\.\\d+)?)|(\\d+\\.\\d*[1-9]\\d*))`;
      } else {
        acc = `${acc}\\d*[1-9]\\d*`;
      }
    } else if (isInt) {
      acc = `${acc}\\d+`;
    } else {
      acc = `${acc}\\d+(\\.\\d+)?`;
    }

    if (!finite) {
      acc = `${acc}))`;
    }

    return acc;
  }

  protected _unwrapRegExp(regex: RegExp | string): string {
    const flags = typeof regex === "string" ? "" : regex.flags;
    const source = typeof regex === "string" ? regex : regex.source;

    if (flags.includes("i")) {
      return this._unwrapRegExp(this._makeRegexStringCaseInsensitive(source));
    }

    return source.replace(/(^\^)|(\$$)/g, "");
  }

  protected _makeRegexStringCaseInsensitive(regexString: string): string {
    const isAlphabetic = (char: string) => char.match(/[a-z]/i) != null;

    let caseInsensitive = "";
    let inCharacterSet = false;
    for (let i = 0; i < regexString.length; i++) {
      const char = regexString.charAt(i);
      const nextChar = regexString.charAt(i + 1);

      if (char === "\\") {
        caseInsensitive += `${char}${nextChar}`;
        i++;
        continue;
      }

      if (char === "[") {
        inCharacterSet = true;
      } else if (inCharacterSet && char === "]") {
        inCharacterSet = false;
      }

      if (!isAlphabetic(char)) {
        caseInsensitive += char;
        continue;
      }

      if (!inCharacterSet) {
        caseInsensitive += `[${char.toLowerCase()}${char.toUpperCase()}]`;
        continue;
      }

      const charAfterNext = regexString.charAt(i + 2);

      if (nextChar !== "-" || !isAlphabetic(charAfterNext)) {
        caseInsensitive += `${char.toLowerCase()}${char.toUpperCase()}`;
        continue;
      }

      caseInsensitive += `${char.toLowerCase()}-${charAfterNext.toLowerCase()}${char.toUpperCase()}-${charAfterNext.toUpperCase()}`;
      i += 2;
    }

    return caseInsensitive;
  }

  protected _escapeRegExp(str: unknown): string {
    if (typeof str !== "string") {
      str = `${str}`;
    }

    return (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  static empty = (
    params?: RawCreateParams & { coerce?: true }
  ): ZodTemplateLiteral => {
    return new ZodTemplateLiteral({
      checks: [],
      ...processCreateParams(params),
      coerce: params?.coerce ?? false,
      parts: [],
      regexString: "^$",
      typeName: ZodFirstPartyTypeKind.ZodTemplateLiteral,
    });
  };

  static create<
    Part extends TemplateLiteralPart,
    Parts extends [] | [Part, ...Part[]],
  >(
    parts: Parts,
    params?: RawCreateParams & { coerce?: true }
  ): ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
  static create(
    parts: TemplateLiteralPart[],
    params?: RawCreateParams & { coerce?: true }
  ) {
    return ZodTemplateLiteral.empty(params)._addParts(parts) as any;
  }
}

export enum ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodNaN = "ZodNaN",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
  ZodFile = "ZodFile",
  ZodSymbol = "ZodSymbol",
  ZodUndefined = "ZodUndefined",
  ZodNull = "ZodNull",
  ZodAny = "ZodAny",
  ZodUnknown = "ZodUnknown",
  ZodNever = "ZodNever",
  ZodVoid = "ZodVoid",
  ZodArray = "ZodArray",
  ZodObject = "ZodObject",
  ZodUnion = "ZodUnion",
  ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
  ZodIntersection = "ZodIntersection",
  ZodTuple = "ZodTuple",
  ZodRecord = "ZodRecord",
  ZodMap = "ZodMap",
  ZodSet = "ZodSet",
  ZodFunction = "ZodFunction",
  ZodLazy = "ZodLazy",
  ZodLiteral = "ZodLiteral",
  ZodEnum = "ZodEnum",
  ZodEffects = "ZodEffects",
  ZodNativeEnum = "ZodNativeEnum",
  ZodOptional = "ZodOptional",
  ZodNullable = "ZodNullable",
  ZodDefault = "ZodDefault",
  ZodCatch = "ZodCatch",
  ZodPromise = "ZodPromise",
  ZodBranded = "ZodBranded",
  ZodPipeline = "ZodPipeline",
  ZodReadonly = "ZodReadonly",
  ZodTemplateLiteral = "ZodTemplateLiteral",
}

export type ZodFirstPartySchemaTypes =
  | ZodString
  | ZodNumber
  | ZodNaN
  | ZodBigInt
  | ZodBoolean
  | ZodDate
  | ZodFile
  | ZodUndefined
  | ZodNull
  | ZodAny
  | ZodUnknown
  | ZodNever
  | ZodVoid
  | ZodArray<any, any>
  | ZodObject<any, any, any>
  | ZodUnion<any>
  | ZodDiscriminatedUnion<any, any>
  | ZodIntersection<any, any>
  | ZodTuple<any, any>
  | ZodRecord<any, any>
  | ZodMap<any>
  | ZodSet<any>
  | ZodFunction<any, any>
  | ZodLazy<any>
  | ZodLiteral<any>
  | ZodEnum<any>
  | ZodEffects<any, any, any>
  | ZodNativeEnum<any>
  | ZodOptional<any>
  | ZodNullable<any>
  | ZodDefault<any>
  | ZodCatch<any>
  | ZodPromise<any>
  | ZodBranded<any, any>
  | ZodPipeline<any, any>
  | ZodReadonly<any>
  | ZodSymbol
  | ZodTemplateLiteral<any>;
