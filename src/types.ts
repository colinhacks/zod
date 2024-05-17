import { enumUtil, errorUtil, objectUtil, partialUtil, util } from "./helpers";
import {
  AsyncParseReturnType,
  ZodFailure,
  isAborted,
  isAsync,
  isValid,
  makeIssue,
  ParseContext,
  ParseInput,
  ParseParams,
  ParseReturnType,
  SyncParseReturnType,
  NOT_SET,
  ZOD_FAILURE,
} from "./helpers/parseUtil";
import { Primitive } from "./helpers/typeAliases";
import { getParsedType, objectKeys, ZodParsedType } from "./helpers/util";
import {
  IssueData,
  StringValidation,
  ZodCustomIssue,
  ZodError,
  ZodErrorMap,
  ZodIssue,
  ZodIssueCode,
  ZodTemplateLiteralUnsupportedCheckError,
  ZodTemplateLiteralUnsupportedTypeError,
} from "./ZodError";

export { ZodParsedType } from "./helpers/util";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RefinementCtx = {
  addIssue: (arg: IssueData) => void;
};
export type ZodRawShape = { [k: string]: ZodTypeAny };
export type ZodTypeAny = ZodType;
export type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
export type input<T extends ZodType<any, any, any>> = T["_input"];
export type output<T extends ZodType<any, any, any>> = T["_output"];
export type { TypeOf as infer };

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
export interface ZodTypeDef {
  typeName: string;
  errorMap?: ZodErrorMap;
  description?: string;
}

function issuesToZodError(ctx: ParseContext, issues: IssueData[]): ZodError {
  return new ZodError(issues.map((issue) => makeIssue(issue, ctx)));
}
function safeResult<Input, Output>(
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

export type RawCreateParams =
  | {
      errorMap?: ZodErrorMap;
      invalid_type_error?: string;
      required_error?: string;
      message?: string;
      description?: string;
    }
  | undefined;
export type ProcessedCreateParams = {
  errorMap?: ZodErrorMap;
  description?: string;
};
function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: ZodErrorMap = (iss, ctx) => {
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

export function makeCache<This, T extends { [k: string]: () => unknown }>(
  th: This,
  elements: T & ThisType<This>
): { [k in keyof T]: ReturnType<T[k]> } {
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
export abstract class ZodType<
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = unknown
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  get description() {
    return this._def.description;
  }

  abstract _parse(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<Output>;

  _getType(input: ParseInput): ReturnType<typeof getParsedType> {
    return getParsedType(input);
  }

  parse(data: unknown, params?: Partial<ParseParams>): Output {
    if (!params) {
      const result = this._parse(data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");

      if ((result as any)?._key === ZOD_FAILURE)
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
    const result = this._parse(data, ctx);
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
      const result = this._parse(data, this.cache.defaultSyncContext);
      if (result instanceof Promise)
        throw Error("Synchronous parse encountered promise.");
      return safeResult(this.cache.defaultSyncContext, result) as any;
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = this._parse(data, ctx);
    if (result instanceof Promise)
      throw Error("Synchronous parse encountered promise.");
    return safeResult(ctx, result) as any;
  }

  async parseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<Output> {
    if (!params) {
      const result = await this._parse(data, this.cache.defaultAsyncContext);
      if (isAborted(result))
        throw issuesToZodError(this.cache.defaultAsyncContext, result.issues);
      return result;
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };
    const result = await this._parse(data, ctx);
    if (isAborted(result)) throw issuesToZodError(ctx, result.issues);
    return result;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<SafeParseReturnType<Input, Output>> {
    if (!params) {
      const result = await this._parse(data, this.cache.defaultAsyncContext);
      return safeResult(this.cache.defaultAsyncContext, result);
    }
    const ctx: ParseContext = {
      contextualErrorMap: params?.errorMap,
      basePath: params?.path || [],
      schemaErrorMap: this._def.errorMap,
    };

    const result = await this._parse(data, ctx);
    return safeResult(ctx, result);
  }

  protected cache = makeCache(this, {
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
  spa = this.safeParseAsync;

  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, Input>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  refine(
    check: (arg: Output) => unknown,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input> {
    const getIssueProperties = (val: Output) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () =>
        ctx.addIssue({
          input: val,
          code: ZodIssueCode.custom,
          ...getIssueProperties(val),
        });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }

  refinement<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, RefinedOutput, Input>;
  refinement(
    check: (arg: Output) => boolean,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, Output, Input>;
  refinement(
    check: (arg: Output) => unknown,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, Output, Input> {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(
          typeof refinementData === "function"
            ? refinementData(val, ctx)
            : refinementData
        );
        return false;
      } else {
        return true;
      }
    });
  }

  _refinement(
    refinement: RefinementEffect<Output>["refinement"]
  ): ZodEffects<this, Output, Input> {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement },
    });
  }

  superRefine<RefinedOutput extends Output>(
    refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  ): ZodEffects<this, RefinedOutput, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => void
  ): ZodEffects<this, Output, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>
  ): ZodEffects<this, Output, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => unknown | Promise<unknown>
  ): ZodEffects<this, Output, Input> {
    return this._refinement(refinement);
  }

  constructor(def: Def) {
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
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
    }) as any;
  }

  default(def: util.noUndefined<Input>): ZodDefault<this>;
  default(def: () => util.noUndefined<Input>): ZodDefault<this>;
  default(def: any) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;

    return new ZodDefault({
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
      ...processCreateParams(this._def),
    });
  }

  catch(def: Output): ZodCatch<this>;
  catch(
    def: (ctx: { error: ZodError; input: Input }) => Output
  ): ZodCatch<this>;
  catch(def: any) {
    const catchValueFunc = typeof def === "function" ? def : () => def;

    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
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
  checks: ZodStringCheck[];
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
// eslint-disable-next-line
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
}) {
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

export class ZodString extends ZodType<string, ZodStringDef, string> {
  _parse(input: ParseInput, _ctx?: ParseContext): ParseReturnType<string> {
    if (this._def.coerce) {
      input = String(input) as string;
    }

    if (typeof input !== "string") {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: getParsedType(input),
        },
      ]);
    }

    if (this._def.checks.length === 0) {
      return input;
    }

    let issues: IssueData[] | undefined;

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.length < check.value) {
          issues = issues || [];
          issues.push({
            input,
            code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.too_big,
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
              code: ZodIssueCode.too_big,
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
              code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "jwt") {
        if (!isValidJwt(input, check.alg)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "guid") {
        if (!guidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "guid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "xid") {
        if (!xidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "xid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ksuid") {
        if (!ksuidRegex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ksuid",
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message,
          });
        }
      } else if (check.kind === "endsWith") {
        if (!(input as string).endsWith(check.value)) {
          issues = issues || [];
          issues.push({
            input,
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input, check.version)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input)) {
          issues = issues || [];
          issues.push({
            input,
            validation: "base64",
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
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
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues && issues.length) {
      return new ZodFailure(issues);
    }

    return input;
  }

  protected _regex(
    regex: RegExp,
    validation: StringValidation,
    message?: errorUtil.ErrMessage
  ) {
    return this.refinement(
      (data) => regex.test(data),
      (input) => ({
        input,
        validation,
        code: ZodIssueCode.invalid_string,
        ...errorUtil.errToObj(message),
      })
    );
  }

  _addCheck(check: ZodStringCheck) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  email(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }

  url(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }

  jwt(options?: string | { alg?: JwtAlgorithm; message?: string }) {
    return this._addCheck({
      kind: "jwt",
      alg: typeof options === "object" ? options.alg ?? null : null,
      ...errorUtil.errToObj(options),
    });
  }
  emoji(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }

  uuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  guid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "guid", ...errorUtil.errToObj(message) });
  }
  cuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }

  cuid2(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  xid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "xid", ...errorUtil.errToObj(message) });
  }
  ksuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "ksuid", ...errorUtil.errToObj(message) });
  }

  ip(options?: string | { version?: "v4" | "v6"; message?: string }) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }

  e164(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "e164", ...errorUtil.errToObj(message) });
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
  ) {
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
      ...errorUtil.errToObj(options?.message),
    });
  }

  date(message?: string) {
    return this._addCheck({ kind: "date", message });
  }

  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ) {
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
      ...errorUtil.errToObj(options?.message),
    });
  }

  duration(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }

  regex(regex: RegExp, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "regex",
      regex: regex,
      ...errorUtil.errToObj(message),
    });
  }

  includes(value: string, options?: { message?: string; position?: number }) {
    return this._addCheck({
      kind: "includes",
      value: value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message),
    });
  }

  startsWith(value: string, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "startsWith",
      value: value,
      ...errorUtil.errToObj(message),
    });
  }

  endsWith(value: string, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "endsWith",
      value: value,
      ...errorUtil.errToObj(message),
    });
  }

  json(message?: errorUtil.ErrMessage): this;
  json<T extends ZodTypeAny>(
    pipeTo: T
  ): ZodPipeline<ZodEffects<this, any, input<this>>, T>;
  json(input?: errorUtil.ErrMessage | ZodTypeAny) {
    if (!(input instanceof ZodType)) {
      return this._addCheck({ kind: "json", ...errorUtil.errToObj(input) });
    }
    const schema = this.transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch (error: unknown) {
        ctx.addIssue({
          input,
          code: ZodIssueCode.invalid_string,
          validation: "json",
          // message: (error as Error).message,
        });
        return NEVER;
      }
    });
    return input ? schema.pipe(input) : schema;
  }

  min(minLength: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message),
    });
  }

  max(maxLength: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message),
    });
  }

  length(len: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message),
    });
  }

  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(message?: errorUtil.ErrMessage) {
    return this.min(1, errorUtil.errToObj(message));
  }

  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }],
    });
  }

  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }],
    });
  }

  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }],
    });
  }

  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }

  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }

  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }

  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }

  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isJwt() {
    return !!this._def.checks.find((ch) => ch.kind === "jwt");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }

  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isGUID() {
    return !!this._def.checks.find((ch) => ch.kind === "guid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }

  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isXID() {
    return !!this._def.checks.find((ch) => ch.kind === "xid");
  }
  get isKSUID() {
    return !!this._def.checks.find((ch) => ch.kind === "ksuid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isE164() {
    return !!this._def.checks.find((ch) => ch.kind === "e164");
  }

  get minLength() {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxLength() {
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
      ...processCreateParams(params),
    });
    return base;
    // const instance = Object.assign(Object.create(base), {
    //   parse(input: unknown, params?: Partial<ParseParams>) {
    //     if (params) return base.parse(input, params);
    //     if (typeof input === "string") return input;
    //     return base.parse(input, params);
    //   },
    //   async parseAsync(data: unknown) {
    //     if (typeof data === "string") return data;
    //     return base.parseAsync(data);
    //   },
    // });
    // return instance;
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
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / Math.pow(10, decCount);
}

export interface ZodNumberDef extends ZodTypeDef {
  checks: ZodNumberCheck[];
  typeName: ZodFirstPartyTypeKind.ZodNumber;
  coerce: boolean;
}

export class ZodNumber extends ZodType<number, ZodNumberDef, number> {
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<number> {
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

    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.number) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: typeof input,
        },
      ]);
    }

    let issues: IssueData[] | undefined;

    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: ZodIssueCode.invalid_type,
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
            code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.too_big,
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
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input)) {
          issues = issues || [];
          issues.push({
            input,
            code: ZodIssueCode.not_finite,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues && issues.length) {
      return new ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodNumber {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: params?.coerce || false,
      ...processCreateParams(params),
    });
  }

  gte(value: number, message?: errorUtil.ErrMessage) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  min = this.gte;

  gt(value: number, message?: errorUtil.ErrMessage) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }

  lte(value: number, message?: errorUtil.ErrMessage) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  max = this.lte;

  lt(value: number, message?: errorUtil.ErrMessage) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: number,
    inclusive: boolean,
    message?: string
  ) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message),
        },
      ],
    });
  }

  _addCheck(check: ZodNumberCheck) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  int(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message),
    });
  }

  positive(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message),
    });
  }

  negative(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message),
    });
  }

  nonpositive(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message),
    });
  }

  nonnegative(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message),
    });
  }

  multipleOf(value: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "multipleOf",
      value: value,
      message: errorUtil.toString(message),
    });
  }
  step = this.multipleOf;

  finite(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message),
    });
  }

  safe(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message),
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message),
    });
  }

  get minValue() {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue() {
    let max: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }

  get isInt() {
    return !!this._def.checks.find(
      (ch) =>
        ch.kind === "int" ||
        (ch.kind === "multipleOf" && util.isInteger(ch.value))
    );
  }

  get isFinite() {
    let max: number | null = null,
      min: number | null = null;
    for (const ch of this._def.checks) {
      if (
        ch.kind === "finite" ||
        ch.kind === "int" ||
        ch.kind === "multipleOf"
      ) {
        return true;
      } else if (ch.kind === "min") {
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
  checks: ZodBigIntCheck[];
  typeName: ZodFirstPartyTypeKind.ZodBigInt;
  coerce: boolean;
}

export class ZodBigInt extends ZodType<bigint, ZodBigIntDef, bigint> {
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<bigint> {
    if (this._def.coerce) {
      input = BigInt(input);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: parsedType,
        },
      ]);
    }

    const issues: IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input < check.value
          : input <= check.value;
        if (tooSmall) {
          issues.push({
            input,
            code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.too_big,
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
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length) {
      return new ZodFailure(issues);
    }

    return input;
  }

  static create(params?: RawCreateParams & { coerce?: boolean }): ZodBigInt {
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params),
    });
  }

  gte(value: bigint, message?: errorUtil.ErrMessage) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  min = this.gte;

  gt(value: bigint, message?: errorUtil.ErrMessage) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }

  lte(value: bigint, message?: errorUtil.ErrMessage) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  max = this.lte;

  lt(value: bigint, message?: errorUtil.ErrMessage) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }

  protected setLimit(
    kind: "min" | "max",
    value: bigint,
    inclusive: boolean,
    message?: string
  ) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message),
        },
      ],
    });
  }

  _addCheck(check: ZodBigIntCheck) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  positive(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message),
    });
  }

  negative(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message),
    });
  }

  nonpositive(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message),
    });
  }

  nonnegative(message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message),
    });
  }

  multipleOf(value: bigint, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message),
    });
  }

  get minValue() {
    let min: bigint | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }

  get maxValue() {
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

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef, boolean> {
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<boolean> {
    if (this._def.coerce) {
      input = Boolean(input);
    }
    const parsedType = this._getType(input);

    if (parsedType !== ZodParsedType.boolean) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
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
  checks: ZodDateCheck[];
  coerce: boolean;
  typeName: ZodFirstPartyTypeKind.ZodDate;
}

export class ZodDate extends ZodType<Date, ZodDateDef, Date> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    if (this._def.coerce) {
      input = new Date(input);
    }
    const parsedType = this._getType(input);

    if (parsedType !== ZodParsedType.date) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: parsedType,
        },
      ]);
    }

    if (isNaN(input.getTime())) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_date,
        },
      ]);
    }

    const issues: IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.getTime() < check.value) {
          issues.push({
            input,
            code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date",
          });
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length) {
      return new ZodFailure(issues);
    }

    return new Date(input.getTime());
  }

  _addCheck(check: ZodDateCheck) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  min(minDate: Date, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message),
    });
  }

  max(maxDate: Date, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message),
    });
  }

  get minDate() {
    let min: number | null = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }

    return min != null ? new Date(min) : null;
  }

  get maxDate() {
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

export class ZodSymbol extends ZodType<symbol, ZodSymbolDef, symbol> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.symbol,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): ZodSymbol {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
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

export class ZodUndefined extends ZodType<
  undefined,
  ZodUndefinedDef,
  undefined
> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
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

export class ZodNull extends ZodType<null, ZodNullDef, null> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: parsedType,
        },
      ]);
    }
    return input;
  }
  static create(params?: RawCreateParams): ZodNull {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
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

export class ZodAny extends ZodType<any, ZodAnyDef, any> {
  // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
  _any = true as const;
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    return input;
  }
  static create(params?: RawCreateParams): ZodAny {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
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

export class ZodUnknown extends ZodType<unknown, ZodUnknownDef, unknown> {
  // required
  _unknown = true as const;
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    return input;
  }

  static create(params?: RawCreateParams): ZodUnknown {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
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

export class ZodNever extends ZodType<never, ZodNeverDef, never> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    return new ZodFailure([
      {
        input,
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: parsedType,
      },
    ]);
  }
  static create(params?: RawCreateParams): ZodNever {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
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

export class ZodVoid extends ZodType<void, ZodVoidDef, void> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: parsedType,
        },
      ]);
    }
    return input;
  }

  static create(params?: RawCreateParams): ZodVoid {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
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
    identifier?: <U extends T["_output"]>(item: U) => unknown;
    message?:
      | string
      | (<U extends T["_output"]>(duplicateItems: U[]) => string);
    showDuplicates?: boolean;
  } | null;
}

export type ArrayCardinality = "many" | "atleastone";
export type arrayOutputType<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many"
> = Cardinality extends "atleastone"
  ? [T["_output"], ...T["_output"][]]
  : T["_output"][];

export class ZodArray<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many"
> extends ZodType<
  arrayOutputType<T, Cardinality>,
  ZodArrayDef<T>,
  Cardinality extends "atleastone"
    ? [T["_input"], ...T["_input"][]]
    : T["_input"][]
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const def = this._def;

    const parsedType = getParsedType(input);

    if (parsedType !== ZodParsedType.array) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    const issues: IssueData[] = [];

    if (def.exactLength !== null) {
      const tooBig = input.length > def.exactLength.value;
      const tooSmall = input.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        issues.push({
          input,
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
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
          code: ZodIssueCode.too_small,
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
          code: ZodIssueCode.too_big,
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
          ? (input as this["_output"][]).map(identifier)
          : (input as this["_output"][])
      ).filter((item, idx, arr) => arr.indexOf(item) !== idx);
      if (duplicates.length) {
        issues.push({
          input,
          code: ZodIssueCode.uniqueness,
          duplicateElements: showDuplicates ? duplicates : undefined,
          message:
            typeof message === "function" ? message(duplicates) : message,
        });
      }
    }

    let hasPromises = false;

    const parseResults = [...(input as any[])].map((item) => {
      const result = def.type._parse(item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then((result) => {
        issues.push(
          ...result.flatMap((r, i) =>
            isAborted(r)
              ? r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
              : []
          )
        );

        if (issues.length > 0) {
          return new ZodFailure(issues);
        }

        return result.map((x) => x as any) as any;
      });
    }

    const results = parseResults as SyncParseReturnType<any>[]; // we know it's sync because hasPromises is false

    issues.push(
      ...results.flatMap((r, i) =>
        !isAborted(r)
          ? []
          : r.issues.map((issue) => ({
              ...issue,
              path: [i, ...(issue.path || [])],
            }))
      )
    );

    if (issues.length > 0) {
      return new ZodFailure(issues);
    }

    return results.map((x) => x as any) as any;
  }

  get element() {
    return this._def.type;
  }

  min(minLength: number, message?: errorUtil.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) },
    }) as any;
  }

  max(maxLength: number, message?: errorUtil.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) },
    }) as any;
  }

  length(len: number, message?: errorUtil.ErrMessage): this {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) },
    }) as any;
  }

  nonempty(message?: errorUtil.ErrMessage): ZodArray<T, "atleastone"> {
    return this.min(1, message) as any;
  }

  unique(params: ZodArrayDef<T>["uniqueness"] = {}): this {
    const message =
      typeof params?.message === "function"
        ? params.message
        : errorUtil.toString(params?.message);

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
  Catchall extends ZodTypeAny = ZodTypeAny
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
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<
  objectUtil.addQuestionMarks<baseObjectOutputType<Shape>>
> &
  CatchallOutput<Catchall> &
  PassthroughType<UnknownKeys>;

export type baseObjectOutputType<Shape extends ZodRawShape> = {
  [k in keyof Shape]: Shape[k]["_output"];
};

export type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<baseObjectInputType<Shape>> &
  CatchallInput<Catchall> &
  PassthroughType<UnknownKeys>;
export type baseObjectInputType<Shape extends ZodRawShape> =
  objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
  }>;

export type CatchallOutput<T extends ZodType> = ZodType extends T
  ? unknown
  : { [k: string]: T["_output"] };

export type CatchallInput<T extends ZodType> = ZodType extends T
  ? unknown
  : { [k: string]: T["_input"] };

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
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element),
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(
      schema.items.map((item: any) => deepPartialify(item))
    );
  } else {
    return schema;
  }
}

export class ZodObject<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>
> extends ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
  private _cached = makeCache(this, {
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

  _parse(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const issues: IssueData[] = [];
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
      promise: AsyncParseReturnType<unknown>;
    }> = [];

    for (const key of this._cached.keys) {
      const keyValidator = this._cached.shape[key];
      const value = input[key];
      const parseResult = keyValidator._parse(value, ctx);
      if (parseResult instanceof Promise) {
        asyncResults.push({ key, promise: parseResult });
      } else if (isAborted(parseResult)) {
        issues.push(
          ...parseResult.issues.map((issue) => ({
            ...issue,
            path: [key, ...(issue.path || [])],
          }))
        );
      } else {
        (key in input ||
          keyValidator instanceof ZodDefault ||
          keyValidator instanceof ZodCatch) &&
          (final[key] = parseResult);
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
            code: ZodIssueCode.unrecognized_keys,
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
        const parseResult = catchall._parse(value, ctx);
        if (parseResult instanceof Promise) {
          asyncResults.push({ key, promise: parseResult });
        } else if (isAborted(parseResult)) {
          issues.push(
            ...parseResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        } else {
          (key in input ||
            catchall instanceof ZodDefault ||
            catchall instanceof ZodCatch) &&
            (final[key] = parseResult);
        }
      }
    }

    if (asyncResults.length) {
      return Promise.resolve()
        .then(async () => {
          for (const asyncResult of asyncResults) {
            const result = await asyncResult.promise;
            if (isAborted(result)) {
              issues.push(
                ...result.issues.map((issue) => ({
                  ...issue,
                  path: [asyncResult.key, ...(issue.path || [])],
                }))
              );
            } else {
              asyncResult.key in input && (final[asyncResult.key] = result);
            }
          }
        })
        .then(() => {
          if (issues.length) {
            return new ZodFailure(issues);
          }

          return final;
        });
    }

    if (issues.length) {
      return new ZodFailure(issues);
    }

    return final;
  }

  get shape() {
    return this._def.shape();
  }

  strict(message?: errorUtil.ErrMessage): ZodObject<T, "strict", Catchall> {
    errorUtil.errToObj;
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
                  message: errorUtil.errToObj(message).message ?? defaultError,
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
  nonstrict = this.passthrough;

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
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  extend<Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
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
  //   NewOutput extends util.flatten<{
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   }>,
  //   NewInput extends util.flatten<{
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
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
  augment = this.extend;

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(
    merging: Incoming
  ): ZodObject<
    objectUtil.extendShape<T, Augmentation>,
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
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
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
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
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
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
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

  pick<Mask extends util.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall> {
    const shape: any = {};

    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });

    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

  omit<Mask extends util.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall> {
    const shape: any = {};

    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });

    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

  /**
   * @deprecated
   */
  deepPartial(): partialUtil.DeepPartial<this> {
    return deepPartialify(this) as any;
  }

  partial(): ZodObject<
    { [k in keyof T]: ZodOptional<T[k]> },
    UnknownKeys,
    Catchall
  >;
  partial<Mask extends util.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  partial(mask?: any) {
    const newShape: any = {};

    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];

      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });

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
  required<Mask extends util.Exactly<{ [k in keyof T]?: true }, Mask>>(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  required(mask?: any) {
    const newShape: any = {};

    util.objectKeys(this.shape).forEach((key) => {
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
    });

    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  }

  keyof(): ZodEnum<enumUtil.UnionToTupleString<keyof T>> {
    return ZodEnum.create(
      util.objectKeys(this.shape) as [string, ...string[]]
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
  >
> extends ZodTypeDef {
  options: T;
  typeName: ZodFirstPartyTypeKind.ZodUnion;
}

export class ZodUnion<T extends ZodUnionOptions> extends ZodType<
  T[number]["_output"],
  ZodUnionDef<T>,
  T[number]["_input"]
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const options = this._def.options;

    function handleResults(results: SyncParseReturnType<any>[]) {
      // return first issue-free validation if it exists
      for (const result of results) {
        if (isValid(result)) {
          return result;
        }
      }

      const unionErrors: ZodError[] = [];

      for (const result of results) {
        if (isAborted(result)) {
          unionErrors.push(
            new ZodError(result.issues.map((issue) => makeIssue(issue, ctx)))
          );
        }
      }

      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_union,
          unionErrors,
        },
      ]);
    }

    let hasPromises = false;
    const parseResults = options.map((option) => {
      const result = option._parse(input, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(parseResults).then(handleResults);
    } else {
      const issues: ZodIssue[][] = [];
      for (const result of parseResults as SyncParseReturnType<any>[]) {
        // we know it's sync because hasPromises is false
        if (!isAborted(result)) {
          return result;
        }

        issues.push(result.issues.map((issue) => makeIssue(issue, ctx)));
      }

      const unionErrors = issues.map((issues) => new ZodError(issues));

      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_union,
          unionErrors,
        },
      ]);
    }
  }

  get options() {
    return this._def.options;
  }

  static create<T extends Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>>(
    types: T,
    params?: RawCreateParams
  ): ZodUnion<T> {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
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

const getDiscriminator = <T extends ZodTypeAny>(type: T): Primitive[] => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    // eslint-disable-next-line ban/ban
    return util.objectValues(type.enum as any);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

export type ZodDiscriminatedUnionOption<Discriminator extends string> =
  ZodObject<
    { [key in Discriminator]: ZodTypeAny } & ZodRawShape,
    UnknownKeysParam,
    ZodTypeAny
  >;

export interface ZodDiscriminatedUnionDef<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[]
> extends ZodTypeDef {
  discriminator: Discriminator;
  options: Options;
  optionsMap: Map<Primitive, ZodDiscriminatedUnionOption<any>>;
  typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
}

export class ZodDiscriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
> extends ZodType<
  output<Options[number]>,
  ZodDiscriminatedUnionDef<Discriminator, Options>,
  input<Options[number]>
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);

    if (parsedType !== ZodParsedType.object) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const discriminator = this.discriminator;

    const discriminatorValue: string = input[discriminator];

    const option = this.optionsMap.get(discriminatorValue);

    if (!option) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator],
        },
      ]);
    }

    return option._parse(input, ctx) as any;
  }

  get discriminator() {
    return this._def.discriminator;
  }

  get options() {
    return this._def.options;
  }

  get optionsMap() {
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
      ...ZodDiscriminatedUnionOption<Discriminator>[]
    ]
  >(
    discriminator: Discriminator,
    options: Types,
    params?: RawCreateParams
  ): ZodDiscriminatedUnion<Discriminator, Types> {
    // Get all the valid discriminator values
    const optionsMap: Map<Primitive, Types[number]> = new Map();

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
  U extends ZodTypeAny = ZodTypeAny
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
  const aType = getParsedType(a);
  const bType = getParsedType(b);

  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util
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
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
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
  } else if (
    aType === ZodParsedType.date &&
    bType === ZodParsedType.date &&
    +a === +b
  ) {
    return { valid: true, data: a };
  } else {
    return { valid: false, mergeErrorPath: [] };
  }
}

export class ZodIntersection<
  T extends ZodTypeAny,
  U extends ZodTypeAny
> extends ZodType<
  T["_output"] & U["_output"],
  ZodIntersectionDef<T, U>,
  T["_input"] & U["_input"]
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const handleParsed = (
      parsedLeft: SyncParseReturnType,
      parsedRight: SyncParseReturnType
    ): SyncParseReturnType<T & U> => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        const issuesLeft = isAborted(parsedLeft) ? parsedLeft.issues : [];
        const issuesRight = isAborted(parsedRight) ? parsedRight.issues : [];
        return new ZodFailure(issuesLeft.concat(issuesRight));
      }

      const merged = mergeValues(parsedLeft, parsedRight);

      if (!merged.valid) {
        return new ZodFailure([
          {
            input,
            code: ZodIssueCode.invalid_intersection_types,
            mergeErrorPath: merged.mergeErrorPath,
          },
        ]);
      }

      return merged.data;
    };

    const parseResults = [
      this._def.left._parse(input, ctx),
      this._def.right._parse(input, ctx),
    ];

    const hasPromises = parseResults.some(
      (result) => result instanceof Promise
    );

    if (hasPromises) {
      return Promise.all(parseResults).then(([left, right]) =>
        handleParsed(left, right)
      );
    } else {
      return handleParsed(
        parseResults[0] as SyncParseReturnType,
        parseResults[1] as SyncParseReturnType
      );
    }
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
  [k in keyof T]: T[k] extends ZodType<any, any, any> ? T[k]["_output"] : never;
}>;
export type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...OutputTypeOfTuple<T>, ...Rest["_output"][]]
  : OutputTypeOfTuple<T>;

export type InputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType<any, any, any> ? T[k]["_input"] : never;
}>;
export type InputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...InputTypeOfTuple<T>, ...Rest["_input"][]]
  : InputTypeOfTuple<T>;

export interface ZodTupleDef<
  T extends ZodTupleItems | [] = ZodTupleItems,
  Rest extends ZodTypeAny | null = null
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
  Rest extends ZodTypeAny | null = null
> extends ZodType<
  OutputTypeOfTupleWithRest<T, Rest>,
  ZodTupleDef<T, Rest>,
  InputTypeOfTupleWithRest<T, Rest>
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.array) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: parsedType,
        },
      ]);
    }

    if (input.length < this._def.items.length) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array",
        },
      ]);
    }

    const rest = this._def.rest;

    const issues: IssueData[] = [];

    if (!rest && input.length > this._def.items.length) {
      issues.push({
        input,
        code: ZodIssueCode.too_big,
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
        if (!schema) return NOT_SET as any as SyncParseReturnType<any>;
        const result = schema._parse(item, ctx);
        if (result instanceof Promise) {
          hasPromises = true;
        }

        return result;
      })
      .filter((x) => x !== NOT_SET); // filter nulls

    if (hasPromises) {
      return Promise.all(items).then((results) => {
        issues.push(
          ...results.flatMap((r, i) =>
            !isAborted(r)
              ? []
              : r.issues.map((issue) => ({
                  ...issue,
                  path: [i, ...(issue.path || [])],
                }))
          )
        );

        if (issues.length) {
          return new ZodFailure(issues);
        }
        return results.map((x) => x as any) as any;
      });
    } else {
      issues.push(
        ...(items as SyncParseReturnType<any>[]).flatMap((r, i) =>
          !isAborted(r)
            ? []
            : r.issues.map((issue) => ({
                ...issue,
                path: [i, ...(issue.path || [])],
              }))
        )
      );

      if (issues.length) {
        return new ZodFailure(issues);
      }
      return items.map((x) => x as any) as any;
    }
  }

  get items() {
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
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodRecord;
}

export type KeySchema = ZodType<string | number | symbol, any, any>;
export type RecordType<K extends string | number | symbol, V> = [
  string
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
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  RecordType<Key["_output"], Value["_output"]>,
  ZodRecordDef<Key, Value>,
  RecordType<Key["_input"], Value["_input"]>
> {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.object) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        },
      ]);
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const issues: IssueData[] = [];

    const final: Record<any, any> = {};
    const asyncResults: {
      key: any;
      keyR: AsyncParseReturnType<any>;
      valueR: AsyncParseReturnType<any>;
    }[] = [];

    for (const key of objectKeys(input)) {
      if (key === "__proto__") continue;
      const keyResult = keyType._parse(key, ctx);
      const valueResult = valueType._parse(input[key], ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          key,
          keyR: keyResult as any,
          valueR: valueResult as any,
        });
      } else if (isAborted(keyResult) || isAborted(valueResult)) {
        if (isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [key, ...(issue.path || [])],
            }))
          );
        }
        if (isAborted(valueResult)) {
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
          if (isAborted(keyR) || isAborted(valueR)) {
            if (isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [key, ...(issue.path || [])],
                }))
              );
            }
            if (isAborted(valueR)) {
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
          return new ZodFailure(issues);
        }
        return final as this["_output"];
      });
    } else {
      if (issues.length) {
        return new ZodFailure(issues);
      }
      return final as this["_output"];
    }
  }

  get element() {
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
        ...processCreateParams(third),
      });
    }

    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
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
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodMap;
}

export class ZodMap<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Map<Key["_output"], Value["_output"]>,
  ZodMapDef<Key, Value>,
  Map<Key["_input"], Value["_input"]>
> {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.map) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: parsedType,
        },
      ]);
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const asyncResults: {
      index: number;
      keyR: AsyncParseReturnType<any>;
      valueR: AsyncParseReturnType<any>;
    }[] = [];
    const issues: IssueData[] = [];
    const final = new Map();

    const entries = [...(input as Map<string | number, unknown>).entries()];
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const keyResult = keyType._parse(key, ctx);
      const valueResult = valueType._parse(value, ctx);

      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        asyncResults.push({
          index: i,
          keyR: keyResult as AsyncParseReturnType<any>,
          valueR: valueResult as AsyncParseReturnType<any>,
        });
      } else if (isAborted(keyResult) || isAborted(valueResult)) {
        if (isAborted(keyResult)) {
          issues.push(
            ...keyResult.issues.map((issue) => ({
              ...issue,
              path: [i, "key", ...(issue.path || [])],
            }))
          );
        }
        if (isAborted(valueResult)) {
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
          if (isAborted(keyR) || isAborted(valueR)) {
            if (isAborted(keyR)) {
              issues.push(
                ...keyR.issues.map((issue) => ({
                  ...issue,
                  path: [index, "key", ...(issue.path || [])],
                }))
              );
            }
            if (isAborted(valueR)) {
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
          return new ZodFailure(issues);
        }

        return final;
      });
    } else {
      if (issues.length) {
        return new ZodFailure(issues);
      }

      return final;
    }
  }
  static create<
    Key extends ZodTypeAny = ZodTypeAny,
    Value extends ZodTypeAny = ZodTypeAny
  >(
    keyType: Key,
    valueType: Value,
    params?: RawCreateParams
  ): ZodMap<Key, Value> {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
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
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.set) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: parsedType,
        },
      ]);
    }

    const def = this._def;

    const issues: IssueData[] = [];

    if (def.minSize !== null) {
      if (input.size < def.minSize.value) {
        issues.push({
          input,
          code: ZodIssueCode.too_small,
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
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message,
        });
      }
    }

    const valueType = this._def.valueType;

    function finalizeSet(elements: SyncParseReturnType<any>[]) {
      const parsedSet = new Set();
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (isAborted(element)) {
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
        return new ZodFailure(issues);
      }

      return parsedSet;
    }

    let hasPromises = false;

    const elements = [...(input as Set<unknown>).values()].map((item) => {
      const result = valueType._parse(item, ctx);
      if (result instanceof Promise) {
        hasPromises = true;
      }
      return result;
    });

    if (hasPromises) {
      return Promise.all(elements).then(finalizeSet);
    } else {
      return finalizeSet(elements as SyncParseReturnType[]);
    }
  }

  min(minSize: number, message?: errorUtil.ErrMessage): this {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) },
    }) as any;
  }

  max(maxSize: number, message?: errorUtil.ErrMessage): this {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) },
    }) as any;
  }

  size(size: number, message?: errorUtil.ErrMessage): this {
    return this.min(size, message).max(size, message) as any;
  }

  nonempty(message?: errorUtil.ErrMessage): ZodSet<Value> {
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
  Returns extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  args: Args;
  returns: Returns;
  typeName: ZodFirstPartyTypeKind.ZodFunction;
}

export type OuterTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> = Args["_input"] extends Array<any>
  ? (...args: Args["_input"]) => Returns["_output"]
  : never;

export type InnerTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> = Args["_output"] extends Array<any>
  ? (...args: Args["_output"]) => Returns["_input"]
  : never;

export class ZodFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  _parse(input: ParseInput, ctx: ParseContext): ParseReturnType<any> {
    const parsedType = getParsedType(input);
    if (parsedType !== ZodParsedType.function) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: parsedType,
        },
      ]);
    }

    function makeArgsIssue(args: any, error: ZodError): ZodIssue {
      return makeIssue(
        {
          input: args,
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error,
        },
        ctx
      );
    }

    function makeReturnsIssue(returns: any, error: ZodError): ZodIssue {
      return makeIssue(
        {
          input: returns,
          code: ZodIssueCode.invalid_return_type,
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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const me = this;
      return async function (this: any, ...args: any[]) {
        const error = new ZodError([]);
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
    } else {
      // Would love a way to avoid disabling this rule, but we need
      // an alias (using an arrow function was what caused 2651).
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const me = this;
      return function (this: any, ...args: any[]) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      } as any;
    }
  }

  parameters() {
    return this._def.args;
  }

  returnType() {
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

  returns<NewReturnType extends ZodType<any, any, any>>(
    returnType: NewReturnType
  ): ZodFunction<Args, NewReturnType> {
    return new ZodFunction({
      ...this._def,
      returns: returnType,
    });
  }

  implement<F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ): ReturnType<F> extends Returns["_output"]
    ? (...args: Args["_input"]) => ReturnType<F>
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

  validate = this.implement;

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
    U extends ZodTypeAny = ZodUnknown
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
  output<T>,
  ZodLazyDef<T>,
  input<T>
> {
  get schema(): T {
    return this._def.getter();
  }

  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const lazySchema = this._def.getter();
    return lazySchema._parse(input, ctx);
  }

  static create<T extends ZodTypeAny>(
    getter: () => T,
    params?: RawCreateParams
  ): ZodLazy<T> {
    return new ZodLazy({
      getter: getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
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

export class ZodLiteral<T> extends ZodType<T, ZodLiteralDef<T>, T> {
  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    if (input !== this._def.value) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value,
          received: input,
          message: this._def.message,
        },
      ]);
    }
    return input;
  }

  get value() {
    return this._def.value;
  }

  static create<T extends Primitive>(
    value: T,
    params?: RawCreateParams & Exclude<errorUtil.ErrMessage, string>
  ): ZodLiteral<T> {
    return new ZodLiteral({
      value: value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      message: params?.message,
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
  ZodEnumDef<T>,
  T[number]
> {
  #cache: Set<T[number]> | undefined;

  _parse(
    input: ParseInput,
    _ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    if (typeof input !== "string") {
      const parsedType = getParsedType(input);
      const expectedValues = this._def.values;
      return new ZodFailure([
        {
          input,
          expected: util.joinValues(expectedValues) as "string",
          received: parsedType,
          code: ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(this._def.values);
    }

    if (!this.#cache.has(input)) {
      const expectedValues = this._def.values;

      return new ZodFailure([
        {
          input,
          received: input,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input;
  }

  get options() {
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
  ZodNativeEnumDef<T>,
  T[keyof T]
> {
  #cache: Set<T[keyof T]> | undefined;
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<T[keyof T]> {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);

    const parsedType = getParsedType(input);
    if (
      parsedType !== ZodParsedType.string &&
      parsedType !== ZodParsedType.number
    ) {
      const expectedValues = util.objectValues(nativeEnumValues);
      return new ZodFailure([
        {
          input,
          expected: util.joinValues(expectedValues) as "string",
          received: parsedType,
          code: ZodIssueCode.invalid_type,
        },
      ]);
    }

    if (!this.#cache) {
      this.#cache = new Set(util.getValidEnumValues(this._def.values));
    }

    if (!this.#cache.has(input)) {
      const expectedValues = util.objectValues(nativeEnumValues);

      return new ZodFailure([
        {
          input,
          received: input,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues,
        },
      ]);
    }

    return input as any;
  }

  get enum() {
    return this._def.values;
  }

  static create<T extends EnumLike>(
    values: T,
    params?: RawCreateParams
  ): ZodNativeEnum<T> {
    return new ZodNativeEnum({
      values: values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
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
  checks: ZodFileCheck[];
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
export class ZodFile extends ZodType<File, ZodFileDef> {
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<File> {
    const parsedType = this._getType(input);

    if (parsedType !== ZodParsedType.file) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.file,
          received: parsedType,
        },
      ]);
    }

    const file: File = input;

    const issues: IssueData[] = [];

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (file.size < check.value) {
          issues.push({
            input,
            code: ZodIssueCode.too_small,
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
            code: ZodIssueCode.too_big,
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
            code: ZodIssueCode.invalid_file_type,
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
            code: ZodIssueCode.invalid_file_name,
            message: check.message,
          });
          // addIssueToContext(
          //   ctx,
          //   check.message
          //     ? {
          //         code: ZodIssueCode.custom,
          //         message: check.message,
          //       }
          //     : parsedFilename.error.errors[0]
          // );
        }
      } else {
        util.assertNever(check);
      }
    }

    if (issues.length > 0) {
      return new ZodFailure(issues);
    }

    return file;
  }

  _addCheck(check: ZodFileCheck) {
    return new ZodFile({
      ...this._def,
      checks: [...this._def.checks, check],
    });
  }

  /**
   * Restricts file size to the specified min.
   */
  min(minSize: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: minSize,
      ...errorUtil.errToObj(message),
    });
  }

  /**
   * Restricts file size to the specified max.
   */
  max(maxSize: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: maxSize,
      ...errorUtil.errToObj(message),
    });
  }

  /**
   * Restrict accepted file types.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
   */
  type(fileTypes: Array<string>, message?: errorUtil.ErrMessage) {
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
      ...errorUtil.errToObj(message),
    });
  }

  /**
   * Validates file name against the provided schema.
   */
  name(schema: ZodTypeAny, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "filename",
      value: schema,
      ...errorUtil.errToObj(message),
    });
  }

  get minSize() {
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

  get maxSize() {
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
  get acceptedTypes() {
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
  Promise<T["_output"]>,
  ZodPromiseDef<T>,
  Promise<T["_input"]>
> {
  unwrap() {
    return this._def.type;
  }

  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);

    if (parsedType !== ZodParsedType.promise) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: parsedType,
        },
      ]);
    }

    return input.then((inner: any) => {
      return this._def.type._parse(inner, ctx);
    });
  }

  static create<T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodPromise<T> {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
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
  Output = output<T>,
  Input = input<T>
> extends ZodType<Output, ZodEffectsDef<T>, Input> {
  innerType() {
    return this._def.schema;
  }

  sourceType(): T {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
      ? (this._def.schema as unknown as ZodEffects<T>).sourceType()
      : (this._def.schema as T);
  }

  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const effect = this._def.effect || null;

    const issues: IssueData[] = [];

    const checkCtx: RefinementCtx = {
      addIssue: (arg: IssueData) => {
        issues.push(arg);
      },
    };

    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

    if (effect.type === "preprocess") {
      const processed = effect.transform(input, checkCtx);

      if (processed instanceof Promise) {
        return processed.then((processed) => {
          if (issues.some((i) => i.fatal)) {
            return new ZodFailure(issues);
          }
          const result = this._def.schema._parse(processed, ctx);
          if (result instanceof Promise) {
            return result.then((r) => {
              if (isAborted(r)) {
                issues.push(...r.issues);
              }
              if (issues.length) return new ZodFailure(issues);
              return r;
            });
          }

          if (isAborted(result)) {
            issues.push(...result.issues);
            return new ZodFailure(issues);
          }

          return issues.length ? new ZodFailure(issues) : result;
        }) as any;
      } else {
        if (issues.some((i) => i.fatal)) {
          return new ZodFailure(issues);
        }
        const result = this._def.schema._parse(processed, ctx);

        if (result instanceof Promise) {
          return result.then((r) => {
            if (isAborted(r)) {
              issues.push(...r.issues);
            }
            if (issues.length) return new ZodFailure(issues);
            return r;
          });
        }

        if (isAborted(result)) {
          issues.push(...result.issues);
          return new ZodFailure(issues);
        }

        return issues.length ? new ZodFailure(issues) : (result as any);
      }
    }

    if (effect.type === "refinement") {
      const executeRefinement = (acc: unknown): any => {
        const result = effect.refinement(acc, checkCtx);
        if (result instanceof Promise) {
          return Promise.resolve(result);
        }
        return acc;
      };

      const inner = this._def.schema._parse(input, ctx);

      if (!(inner instanceof Promise)) {
        if (isAborted(inner)) {
          issues.push(...inner.issues);
        }

        const value = isAborted(inner)
          ? inner.value !== NOT_SET
            ? inner.value
            : input // if valid, use parsed value
          : inner;
        // else, check ZodFailure for `.value` (set after transforms)
        // then fall back to original input
        if (issues.some((i) => i.fatal)) {
          return new ZodFailure(issues, value);
        }

        // return value is ignored
        const executed = executeRefinement(value);

        if (executed instanceof Promise) {
          return executed.then(() => {
            if (issues.length) return new ZodFailure(issues, inner);
            return inner;
          }) as any;
        }

        if (issues.length) return new ZodFailure(issues, inner);
        return inner as any;
      } else {
        return inner.then((inner) => {
          if (isAborted(inner)) {
            issues.push(...inner.issues);
          }

          if (issues.some((i) => i.fatal)) {
            return new ZodFailure(issues, inner);
          }

          const value = isAborted(inner)
            ? inner.value !== NOT_SET
              ? inner.value
              : input // if valid, use parsed value
            : inner;

          const executed = executeRefinement(value);

          if (executed instanceof Promise) {
            return executed.then(() => {
              if (issues.length) return new ZodFailure(issues, inner);
              return inner;
            });
          }

          if (issues.length) return new ZodFailure(issues), inner;
          return inner;
        });
      }
    }

    if (effect.type === "transform") {
      const inner = this._def.schema._parse(input, ctx);
      if (!(inner instanceof Promise)) {
        if (isAborted(inner)) {
          issues.push(...inner.issues);
        }

        // do not execute transform if any issues exist
        if (issues.length) return new ZodFailure(issues);

        const value = isAborted(inner)
          ? inner.value === NOT_SET
            ? input
            : inner.value
          : inner;

        const result = effect.transform(value, checkCtx);
        if (result instanceof Promise) {
          return result.then((result) => {
            if (issues.length) return new ZodFailure(issues, result);
            return result;
          });
        }

        if (issues.length) return new ZodFailure(issues, result);
        return result;
      } else {
        return inner.then((inner) => {
          if (isAborted(inner)) {
            issues.push(...inner.issues);
          }

          if (issues.length) return new ZodFailure(issues, inner);

          const value = isAborted(inner)
            ? inner.value === NOT_SET
              ? input
              : inner.value
            : inner;

          const result = effect.transform(value, checkCtx);

          if (result instanceof Promise) {
            return result.then((result) => {
              if (issues.length) return new ZodFailure(issues, result);
              return result;
            });
          }

          if (issues.length) return new ZodFailure(issues, result);
          return result;
        });
      }
    }

    util.assertNever(effect);
  }

  static create<I extends ZodTypeAny>(
    schema: I,
    effect: Effect<I["_output"]>,
    params?: RawCreateParams
  ): ZodEffects<I, I["_output"]> {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params),
    });
  }

  static createWithPreprocess<I extends ZodTypeAny>(
    preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ): ZodEffects<I, I["_output"], unknown> {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params),
    });
  }
}

export { ZodEffects as ZodTransformer };

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
  T["_output"] | undefined,
  ZodOptionalDef<T>,
  T["_input"] | undefined
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return undefined;
    }
    return this._def.innerType._parse(input, ctx);
  }

  unwrap() {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodOptional<T> {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
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
  T["_output"] | null,
  ZodNullableDef<T>,
  T["_input"] | null
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return null;
    }
    return this._def.innerType._parse(input, ctx);
  }

  unwrap() {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodNullable<T> {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
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
  defaultValue: () => util.noUndefined<T["_input"]>;
  typeName: ZodFirstPartyTypeKind.ZodDefault;
}

export class ZodDefault<T extends ZodTypeAny> extends ZodType<
  util.noUndefined<T["_output"]>,
  ZodDefaultDef<T>,
  T["_input"] | undefined
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const parsedType = getParsedType(input);
    if (parsedType === ZodParsedType.undefined) {
      input = this._def.defaultValue();
    }
    return this._def.innerType._parse(input, ctx) as any;
  }

  removeDefault() {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      default: T["_input"] | (() => util.noUndefined<T["_input"]>);
    }
  ): ZodDefault<T> {
    return new ZodDefault({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue:
        typeof params.default === "function"
          ? params.default
          : ((() => params.default) as any),
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
  catchValue: (ctx: { error: ZodError; input: unknown }) => T["_input"];
  typeName: ZodFirstPartyTypeKind.ZodCatch;
}

export class ZodCatch<T extends ZodTypeAny> extends ZodType<
  T["_output"],
  ZodCatchDef<T>,
  unknown // any input will pass validation // T["_input"]
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const result = this._def.innerType._parse(input, ctx);

    if (isAsync(result)) {
      return result.then((result) => {
        return {
          status: "valid",
          value: isAborted(result)
            ? this._def.catchValue({
                get error() {
                  return new ZodError(
                    result.issues.map((issue) => makeIssue(issue, ctx))
                  );
                },
                input,
              })
            : result,
        };
      });
    } else {
      return isAborted(result)
        ? this._def.catchValue({
            get error() {
              return new ZodError(
                result.issues.map((issue) => makeIssue(issue, ctx))
              );
            },
            input,
          })
        : result;
    }
  }

  removeCatch() {
    return this._def.innerType;
  }

  static create<T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      catch: T["_output"] | (() => T["_output"]);
    }
  ): ZodCatch<T> {
    return new ZodCatch({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue:
        typeof params.catch === "function"
          ? params.catch
          : ((() => params.catch) as any),
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

export class ZodNaN extends ZodType<number, ZodNaNDef, number> {
  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<any> {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: parsedType,
        },
      ]);
    }

    return input;
  }

  static create(params?: RawCreateParams): ZodNaN {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
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
  B extends string | number | symbol
> extends ZodType<T["_output"] & BRAND<B>, ZodBrandedDef<T>, T["_input"]> {
  _parse(input: ParseInput, ctx: ParseContext): ParseReturnType<any> {
    return this._def.type._parse(input, ctx);
  }

  unwrap() {
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
  B extends ZodTypeAny
> extends ZodType<B["_output"], ZodPipelineDef<A, B>, A["_input"]> {
  _parse(input: ParseInput, ctx: ParseContext): ParseReturnType<any> {
    const result = this._def.in._parse(input, ctx);
    if (result instanceof Promise) {
      return result.then((inResult) => {
        if (isAborted(inResult)) return inResult;

        return this._def.out._parse(inResult, ctx);
      });
    } else {
      if (isAborted(result)) return result;

      return this._def.out._parse(result, ctx);
    }
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
  MakeReadonly<T["_output"]>,
  ZodReadonlyDef<T>,
  MakeReadonly<T["_input"]>
> {
  _parse(
    input: ParseInput,
    ctx: ParseContext
  ): ParseReturnType<this["_output"]> {
    const result = this._def.innerType._parse(input, ctx);
    const freeze = (data: unknown) => {
      if (isValid(data)) {
        data = Object.freeze(data) as any;
      }
      return data;
    };
    return isAsync(result)
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
      ...processCreateParams(params),
    }) as any;
  }

  unwrap() {
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
  Suffix extends TemplateLiteralPrimitive | ZodType
> = Suffix extends TemplateLiteralPrimitive
  ? `${Template}${Suffix}`
  : Suffix extends ZodOptional<infer UnderlyingType>
  ? Template | appendToTemplateLiteral<Template, UnderlyingType>
  : Suffix extends ZodBranded<infer UnderlyingType, any>
  ? appendToTemplateLiteral<Template, UnderlyingType>
  : Suffix extends ZodType<infer Output, any, any>
  ? Output extends TemplateLiteralPrimitive | bigint
    ? `${Template}${Output}`
    : never
  : never;

type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
  [] extends Parts
    ? ``
    : Parts extends [
        ...infer Rest extends TemplateLiteralPart[],
        infer Last extends TemplateLiteralPart
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
  ZodTemplateLiteralDef
> {
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

  _parse(input: ParseInput, _ctx: ParseContext): ParseReturnType<Template> {
    if (this._def.coerce) {
      input = String(input);
    }

    const parsedType = this._getType(input);

    if (parsedType !== ZodParsedType.string) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: parsedType,
        },
      ]);
    }

    if (!new RegExp(this._def.regexString).test(input)) {
      return new ZodFailure([
        {
          input,
          code: ZodIssueCode.custom,
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
          : util.getValidEnumValues(part._def.values);

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

    throw new ZodTemplateLiteralUnsupportedTypeError();
  }

  // FIXME: we don't support transformations, so `.trim()` is not supported.
  protected _transformZodStringPartToRegexString(part: ZodString): string {
    let maxLength = Infinity,
      minLength = 0,
      endsWith = "",
      startsWith = "";

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
        throw new ZodTemplateLiteralUnsupportedCheckError(
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
      : Infinity;

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

    if (maxLength !== Infinity) {
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
    let canBeNegative = true,
      canBePositive = true,
      min = -Infinity,
      max = Infinity,
      canBeZero = true,
      isFinite = false,
      isInt = false,
      acc = "";

    for (const ch of part._def.checks) {
      if (ch.kind === "finite") {
        isFinite = true;
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
        throw new ZodTemplateLiteralUnsupportedCheckError(
          ZodFirstPartyTypeKind.ZodNumber,
          ch.kind
        );
      }
    }

    if (Number.isFinite(min) && Number.isFinite(max)) {
      isFinite = true;
    }

    if (canBeNegative) {
      acc = `${acc}\\-`;

      if (canBePositive) {
        acc = `${acc}?`;
      }
    } else if (!canBePositive) {
      return "0+";
    }

    if (!isFinite) {
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

    if (!isFinite) {
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
      ...processCreateParams(params),
      coerce: params?.coerce ?? false,
      parts: [],
      regexString: "^$",
      typeName: ZodFirstPartyTypeKind.ZodTemplateLiteral,
    });
  };

  static create<
    Part extends TemplateLiteralPart,
    Parts extends [] | [Part, ...Part[]]
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

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      z.custom      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
type CustomParams = CustomErrorParams & { fatal?: boolean };
export function custom<T>(
  check?: (data: any) => any,
  params: string | CustomParams | ((input: any) => CustomParams) = {},
  /**
   * @deprecated
   *
   * Pass `fatal` into the params object instead:
   *
   * ```ts
   * z.string().custom((val) => val.length > 5, { fatal: false })
   * ```
   *
   */

  fatal?: boolean
): ZodType<T, ZodTypeDef, T> {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      if (!check(data)) {
        const p =
          typeof params === "function"
            ? params(data)
            : typeof params === "string"
            ? { message: params }
            : params;
        const _fatal = p.fatal ?? fatal ?? true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ input: data, code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}

export { ZodType as Schema, ZodType as ZodSchema };

const lateObject: typeof ZodObject.lazycreate = (...args: [any]) =>
  ZodObject.lazycreate(...args);
export const late = {
  object: lateObject,
};

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

// requires TS 4.4+
abstract class Class {
  constructor(..._: any[]) {}
}
const instanceOfType = <T extends typeof Class>(
  // const instanceOfType = <T extends new (...args: any[]) => any>(
  cls: T,
  params: CustomParams = {
    message: `Input not instance of ${cls.name}`,
  }
) => custom<InstanceType<T>>((data) => data instanceof cls, params);

//////////////////////////////////////////////////////
// MUST be aliased using wrapper functions.         //
// See: https://github.com/colinhacks/zod/pull/2850 //
//////////////////////////////////////////////////////
const stringType: typeof ZodString.create = (...args) =>
  ZodString.create(...args);
const numberType: typeof ZodNumber.create = (...args) =>
  ZodNumber.create(...args);
const nanType: typeof ZodNaN.create = (...args) => ZodNaN.create(...args);
const bigIntType: typeof ZodBigInt.create = (...args) =>
  ZodBigInt.create(...args);
const booleanType: typeof ZodBoolean.create = (...args) =>
  ZodBoolean.create(...args);
const dateType: typeof ZodDate.create = (...args) => ZodDate.create(...args);
const fileType: typeof ZodFile.create = (...args) => ZodFile.create(...args);
const symbolType: typeof ZodSymbol.create = (...args) =>
  ZodSymbol.create(...args);
const undefinedType: typeof ZodUndefined.create = (...args) =>
  ZodUndefined.create(...args);
const nullType: typeof ZodNull.create = (...args) => ZodNull.create(...args);
const anyType: typeof ZodAny.create = (...args) => ZodAny.create(...args);
const unknownType: typeof ZodUnknown.create = (...args) =>
  ZodUnknown.create(...args);
const neverType: typeof ZodNever.create = (...args) => ZodNever.create(...args);
const voidType: typeof ZodVoid.create = (...args) => ZodVoid.create(...args);
const arrayType: typeof ZodArray.create = (...args) => ZodArray.create(...args);
const objectType: typeof ZodObject.create = (...args) =>
  ZodObject.create(...args);
const strictObjectType: typeof ZodObject.strictCreate = (...args) =>
  ZodObject.strictCreate(...args);
const unionType: typeof ZodUnion.create = (...args) => ZodUnion.create(...args);
const discriminatedUnionType: typeof ZodDiscriminatedUnion.create = (...args) =>
  ZodDiscriminatedUnion.create(...args);
const intersectionType: typeof ZodIntersection.create = (...args) =>
  ZodIntersection.create(...args);
const tupleType: typeof ZodTuple.create = (...args) => ZodTuple.create(...args);
const recordType: typeof ZodRecord.create = (...args: [any]) =>
  ZodRecord.create(...args);
const mapType: typeof ZodMap.create = (...args) => ZodMap.create(...args);
const setType: typeof ZodSet.create = (...args) => ZodSet.create(...args);
const functionType: typeof ZodFunction.create = (...args: [any?]) =>
  ZodFunction.create(...args);
const lazyType: typeof ZodLazy.create = (...args) => ZodLazy.create(...args);
const enumType: typeof ZodEnum.create = (...args: [any]) =>
  ZodEnum.create(...args);
const nativeEnumType: typeof ZodNativeEnum.create = (...args) =>
  ZodNativeEnum.create(...args);
const promiseType: typeof ZodPromise.create = (...args) =>
  ZodPromise.create(...args);
const effectsType: typeof ZodEffects.create = (...args) =>
  ZodEffects.create(...args);
const optionalType: typeof ZodOptional.create = (...args) =>
  ZodOptional.create(...args);
const nullableType: typeof ZodNullable.create = (...args) =>
  ZodNullable.create(...args);
const preprocessType: typeof ZodEffects.createWithPreprocess = (...args) =>
  ZodEffects.createWithPreprocess(...args);
const pipelineType: typeof ZodPipeline.create = (...args) =>
  ZodPipeline.create(...args);

interface Literal {
  <T extends Primitive>(
    value: T,
    params?: RawCreateParams & Exclude<errorUtil.ErrMessage, string>
  ): ZodLiteral<T>;

  template: typeof ZodTemplateLiteral.create;
}
const _literalType: typeof ZodLiteral.create = (...args) =>
  ZodLiteral.create(...args);
Object.defineProperty(_literalType, "template", {
  value: ZodTemplateLiteral.create,
});
const literalType = _literalType as Literal;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

export * as coerce from "./coerce";

export {
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  discriminatedUnionType as discriminatedUnion,
  effectsType as effect,
  enumType as enum,
  fileType as file,
  functionType as function,
  instanceOfType as instanceof,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
  nanType as nan,
  nativeEnumType as nativeEnum,
  neverType as never,
  nullType as null,
  nullableType as nullable,
  numberType as number,
  objectType as object,
  oboolean,
  onumber,
  optionalType as optional,
  ostring,
  pipelineType as pipeline,
  preprocessType as preprocess,
  promiseType as promise,
  recordType as record,
  setType as set,
  strictObjectType as strictObject,
  stringType as string,
  symbolType as symbol,
  // templateLiteralType as templateLiteral,
  effectsType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};

export const NEVER = ZodFailure as never;
