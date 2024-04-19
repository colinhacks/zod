// import { defaultErrorMap, getErrorMap } from "./errors";
import { getErrorMap } from "./errors.ts";
import { enumUtil } from "./helpers/enumUtil.ts";
import { errorUtil } from "./helpers/errorUtil.ts";
// import {
//   // addIssueToContext,
//   // AsyncParseReturnType,
//   // DIRTY,
//   // INVALID,
//   // isAborted,
//   // isAsync,
//   // isDirty,
//   // isValid,
//   makeIssue,
//   // OK,
//   ParseContext,
//   // BASEPATH,
//   ZodInternalError,
//   // ParseInput,
//   ParseParams,
//   // ParsePath,
//   // LazyPath,
//   // ParseReturnType,
//   // ParseStatus,
//   // SyncParseReturnType,
// } from "./helpers/parseUtil";
import { partialUtil } from "./helpers/partialUtil.ts";
import {
  getParsedType,
  objectUtil,
  Primitive,
  util,
  ZodParsedType,
} from "./helpers/util.ts";
import defaultErrorMap from "./locales/en.ts";
// import type { IssueData, ZodErrorMap, ZodIssue } from "../ZodError";
// import type { ZodParsedType } from "./util";
import type { ZodIssueOptionalMessage } from "./ZodError.ts";
import {
  IssueData,
  StringValidation,
  ZodCustomIssue,
  ZodError,
  ZodErrorMap,
  ZodIssue,
  ZodIssueCode,
} from "./ZodError.ts";

export const NEVER = Symbol.for("INVALID") as never;

export const makeIssue = (
  data: any,
  // // path: Path,
  // errorMaps: ZodErrorMap[],
  issueData: IssueData,
  contextualErrorMap: ZodErrorMap | undefined | null,
  schemaErrorMap: ZodErrorMap | undefined | null
): ZodIssue => {
  const fullPath = [...(issueData.path || [])];
  const fullIssue: ZodIssueOptionalMessage = {
    ...issueData,
    path: fullPath,
    fatal: issueData.fatal ?? true,
  };
  // message is explicitly set
  if (issueData.message) return fullIssue as ZodIssue;

  let errorMessage = "";
  const errorMaps = [
    contextualErrorMap, // contextual error map is first priority
    schemaErrorMap, // then schema-bound map if available
    getErrorMap(), // then global override map
    defaultErrorMap, // then global default map
  ].filter((x) => !!x) as ZodErrorMap[];
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse() as ZodErrorMap[];
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }

  fullIssue.message = errorMessage;
  return fullIssue as ZodIssue;
  // return {
  //   ...issueData,
  //   path: fullPath,
  //   message: issueData.message || errorMessage,
  // };
};

export class ZodInternalError {
  constructor(public issues: ZodIssue[]) {}
  // aborted: boolean = false;
  get aborted() {
    return this.issues.some((iss) => iss.fatal === true);
  }
  addIssue(...args: Parameters<typeof makeIssue>) {
    this.issues.push(makeIssue(...args));
    return this;
  }
  addIssues(issues: ZodIssue[]) {
    this.issues.push(...issues);
    return this;
  }
  merge(err: ZodInternalError, path?: PathSegment) {
    this.issues.push(
      ...(path !== undefined ? err.prefix(path).issues : err.issues)
    );
    // if (err.aborted) this.aborted = true;
    return this;
  }
  // abort() {
  // this.aborted = true;
  //   return this;
  // }
  prefix(prefix: string | number | symbol) {
    this.issues = this.issues.map((issue) => ({
      ...issue,
      path: [prefix, ...issue.path],
    }));
    return this;
  }
}
export type PathSegment = string | number | symbol;
export type Path = PathSegment[];
export class ParseContext {
  constructor(
    // public issues: ZodIssue[],
    // public async: boolean,
    public errorMap: ZodErrorMap | null,
    public async: boolean
  ) {}

  // addIssue(
  //   data: unknown,
  //   path: Path,
  //   issueData: IssueData,
  //   schemaErrorMap?: ZodErrorMap
  // ): void {
  //   // const issue = makeIssue(
  //   //   data,
  //   //   path,
  //   //   [
  //   //     this.errorMap, // contextual error map is first priority
  //   //     schemaErrorMap, // then schema-bound map if available
  //   //     getErrorMap(), // then global override map
  //   //     defaultErrorMap, // then global default map
  //   //   ].filter((x) => !!x) as ZodErrorMap[],
  //   //   issueData
  //   // );
  //   this.issues.push(this.makeIssue(data, path, issueData, schemaErrorMap));
  // }
}
///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RefinementCtx = {
  addIssue: (arg: IssueData) => void;
  // path: (string | number)[];
};
export type ZodRawShape = { [k: string]: ZodTypeAny };
export type ZodTypeAny = ZodType<any, any, any>;
export type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
export type input<T extends ZodType<any, any, any>> = T["_input"];
export type output<T extends ZodType<any, any, any>> = T["_output"];
export type { TypeOf as infer };

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
export interface ZodTypeDef {
  errorMap?: ZodErrorMap;
  description?: string;
}

// class ParseInputLazyPath implements ParseInput {
//   parent: ParseContext;
//   data: any;
//   _path: ParsePath;
//   _key: string | number | (string | number)[];
//   _cachedPath: ParsePath = [];
//   constructor(
//     parent: ParseContext,
//     value: any,
//     path: ParsePath,
//     key: string | number | (string | number)[]
//   ) {
//     this.parent = parent;
//     this.data = value;
//     this._path = path;
//     this._key = key;
//   }
//   get path() {
//     if (!this._cachedPath.length) {
//       if (this._key instanceof Array) {
//         this._cachedPath.push(...this._path, ...this._key);
//       } else {
//         this._cachedPath.push(...this._path, this._key);
//       }
//     }
//     // console.log("cache hit");
//     // console.log(this._cachedPath);
//     return this._cachedPath;
//   }
// }

// const handleResult = <Input, Output>(
//   ctx?: ParseContext,
//   result: SyncParseReturnType<Output>
// ):
//   | { success: true; data: Output }
//   | { success: false; error: ZodError<Input> } => {
//   if (isValid(result)) {
//     return { success: true, data: result.value };
//   } else {
//     if (!ctx.common.issues.length) {
//       throw new Error("Validation failed but no issues detected.");
//     }

//     return {
//       success: false,
//       get error() {
//         if ((this as any)._error) return (this as any)._error as Error;
//         const error = new ZodError(ctx.common.issues);
//         (this as any)._error = error;
//         return (this as any)._error;
//       },
//     };
//   }
// };

export type RawCreateParams =
  | {
      errorMap?: ZodErrorMap | undefined;
      invalid_type_error?: string | undefined;
      required_error?: string | undefined;
      description?: string | undefined;
    }
  | undefined;
export type ProcessedCreateParams = {
  errorMap?: ZodErrorMap | undefined;
  description?: string | undefined;
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
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined") {
      return { message: required_error ?? ctx.defaultError };
    }
    return { message: invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export type SafeParseSuccess<Output> = { success: true; data: Output };
export type SafeParseError<Input> = { success: false; error: ZodError<Input> };

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Output>
  | SafeParseError<Input>;

export type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
};
// const defaultParseContext = new ParseContext(null);
export abstract class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  get description() {
    return this._def.description;
  }

  abstract _parse(data: unknown, ctx?: ParseContext): unknown;

  abstract _parseAsync(
    data: unknown,
    // path: LazyPath,
    ctx?: ParseContext
  ): Promise<unknown>;

  // _getType(input: ParseInput): string {
  //   return getParsedType(data);
  // }

  // "~getOrReturnCtx"(
  //   input: ParseInput,
  //   ctx?: ParseContext | undefined
  // ): ParseContext {
  //   return (
  //     ctx || {
  //       common: input.parent.common,
  //       data: data,

  //       parsedType: getParsedType(data),

  //       schemaErrorMap: this._def.errorMap,
  //       path: input.path,
  //       parent: input.parent,
  //     }
  //   );
  // }

  // _processInputParams(input: ParseInput): {
  //   status: ParseStatus;
  //   ctx?: ParseContext;
  // } {
  //   return {
  //     status: new ParseStatus(),
  //     ctx: {
  //       common: input.parent.common,
  //       data: data,

  //       parsedType: getParsedType(data),

  //       schemaErrorMap: this._def.errorMap,
  //       path: input.path,
  //       parent: input.parent,
  //     },
  //   };
  // }

  // _parseSync(input: ParseInput): SyncParseReturnType<Output> {
  //   const result = this._parse(input);
  //   if (isAsync(result)) {
  //     throw new Error("Synchronous parse encountered promise.");
  //   }
  //   return result;
  // }

  // _parseAsync(input: ParseInput): AsyncParseReturnType<Output> {
  //   const result = this._parse(input);
  //   return Promise.resolve(result);
  // }

  parse(data: unknown, params?: Partial<ParseParams>): Output {
    const ctx = params?.errorMap
      ? new ParseContext(params?.errorMap ?? null, false)
      : undefined;
    const result = this._parse(data, ctx);
    if (result instanceof ZodInternalError) throw new ZodError(result.issues);
    // if (ctx.issues.length) throw new ZodError(ctx.issues);
    return result as Output;
  }

  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<Input, Output> {
    // const ctx = new ParseContext([], false, params?.errorMap ?? null);
    const ctx = params?.errorMap
      ? new ParseContext(params?.errorMap ?? null, false)
      : undefined;
    // const ctx?: ParseContext = {
    //   common: {
    //     issues: [],
    //     async: params?.async ?? false,
    //     contextualErrorMap: params?.errorMap,
    //   },
    //   path: params?.path || [],
    //   schemaErrorMap: this._def.errorMap,
    //   parent: null,
    //   data,
    //   parsedType: getParsedType(data),
    // };
    // const inputContext = new ParseInputLazyPath(ctx, data, ctx.path, []);
    // const result = this._parseSync(inputContext);
    const result = this._parse(data, ctx);
    // if (ctx.issues.length) {
    //   return { success: false, error: new ZodError(ctx.issues) };
    // }
    if (result instanceof ZodInternalError) {
      return { success: false, error: new ZodError(result.issues) };
    }
    return { success: true, data: result as Output };
    // return handleResult(ctx, result);
  }

  async parseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<Output> {
    // const ctx = new ParseContext([], false, params?.errorMap ?? null);
    const ctx = new ParseContext(params?.errorMap ?? null, true);
    // const ctx = params?.errorMap
    //   ? new ParseContext(params?.errorMap ?? null, true)
    //   : undefined;
    const result = await Promise.resolve(
      this._parseAsync(
        data,
        // LazyPath.from(params?.path),
        ctx
      )
    );
    // if (ctx.issues.length) throw new ZodError(ctx.issues);
    if (result instanceof ZodInternalError) throw new ZodError(result.issues);
    return result as Output;
    // if (result.success) return result.data;
    // throw result.error;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<SafeParseReturnType<Input, Output>> {
    // const ctx?: ParseContext = {
    //   common: {
    //     issues: [],
    //     contextualErrorMap: params?.errorMap,
    //     async: true,
    //   },
    //   path: params?.path || [],
    //   schemaErrorMap: this._def.errorMap,
    //   parent: null,
    //   data,
    //   parsedType: getParsedType(data),
    // };

    // const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    // const result = await (isAsync(maybeAsyncResult)
    //   ? maybeAsyncResult
    //   : Promise.resolve(maybeAsyncResult));
    // return handleResult(ctx, result);
    // const ctx = new ParseContext([], false, params?.errorMap ?? null);
    // const ctx = new ParseContext(params?.errorMap ?? null, true);
    // const ctx = params?.errorMap
    //   ? new ParseContext(params?.errorMap ?? null, true)
    //   : undefined;
    const result = await this._parseAsync(
      data,
      new ParseContext(params?.errorMap ?? null, true)
    );
    // if (ctx.issues.length) {
    //   return { success: false, error: new ZodError(ctx.issues) };
    // }
    if (result instanceof ZodInternalError) {
      // const err = new ZodError(result.issues);
      return {
        success: false,
        error: new ZodError(result.issues),
        // error: (this instanceof ZodPromise
        //   ? Promise.((_res, rej) => {
        //       return rej(new ZodError(result.issues));
        //     })
        //   : new ZodError(result.issues)) as any,
      };
    }

    return {
      success: true,
      data: result as any,
    };
  }

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
          code: ZodIssueCode.custom,
          fatal: false,
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
    refinement: (arg: Output, ctx: RefinementCtx) => void | Promise<void>
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
export type ZodStringCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "length"; value: number; message?: string }
  | { kind: "email"; message?: string }
  | { kind: "url"; message?: string }
  | { kind: "emoji"; message?: string }
  | { kind: "uuid"; message?: string }
  | { kind: "cuid"; message?: string }
  | { kind: "includes"; value: string; position?: number; message?: string }
  | { kind: "cuid2"; message?: string }
  | { kind: "ulid"; message?: string }
  | { kind: "startsWith"; value: string; message?: string }
  | { kind: "endsWith"; value: string; message?: string }
  | { kind: "regex"; regex: RegExp; message?: string }
  | { kind: "trim"; message?: string }
  | { kind: "toLowerCase"; message?: string }
  | { kind: "toUpperCase"; message?: string }
  | {
      kind: "datetime";
      offset: boolean;
      precision: number | null;
      message?: string;
    }
  | { kind: "ip"; version?: IpVersion; message?: string };

export interface ZodStringDef extends ZodTypeDef {
  checks: ZodStringCheck[];
  typeName: ZodFirstPartyTypeKind.ZodString;
  coerce: boolean;
}

const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[a-z][a-z0-9]*$/;
const ulidRegex = /[0-9A-HJKMNP-TV-Z]{26}/;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
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
  /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;

// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;

const ipv4Regex =
  /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;

const ipv6Regex =
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;

// Adapted from https://stackoverflow.com/a/3143231
const datetimeRegex = (args: { precision: number | null; offset: boolean }) => {
  if (args.precision) {
    if (args.offset) {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`
      );
    } else {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`
      );
    }
  } else if (args.precision === 0) {
    if (args.offset) {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`
      );
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
    }
  } else {
    if (args.offset) {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`
      );
    } else {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`
      );
    }
  }
};

function isValidIP(ip: string, version?: IpVersion) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }

  return false;
}
function assert<T>(_arg: any): _arg is T {
  return true;
}

export class ZodString extends ZodType<string, ZodStringDef> {
  async _parseAsync(
    data: any,
    // path: LazyPath,
    ctx?: ParseContext
  ): Promise<unknown> {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // };

    if (this._def.coerce) {
      data = String(data);
    }

    // const parsedType = this._getType(input);

    if (typeof data !== "string") {
      // const ctx = this["~getOrReturnCtx"](input);
      // return new ZodInternalError([
      //   ctx.makeIssue(
      //     data,
      // path.resolve(),
      //     {
      //       code: ZodIssueCode.invalid_type,
      //       expected: ZodParsedType.string,
      //       received: getParsedType(data),
      //     },
      //     this._def.errorMap
      //     //
      //   ),
      // ]);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);

      // return INVALID;
    }

    assert<string>(data);

    // const status = new ParseStatus();
    // let ctx: undefined | ParseContext = undefined;

    let err!: ZodInternalError;

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (data.length < check.value) {
          // ctx = this["~getOrReturnCtx"](input, ctx);
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
        }
      } else if (check.kind === "max") {
        if (data.length > check.value) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = data.length > check.value;
        const tooSmall = data.length < check.value;
        if (tooBig || tooSmall) {
          // ctx = this["~getOrReturnCtx"](input, ctx);
          if (tooBig) {
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message,
                fatal: false,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
          } else if (tooSmall) {
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,

              {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message,
                fatal: false,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
          }
          // status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "emoji",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "cuid2",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "ulid",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(data);
        } catch {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(data);
        if (!testResult) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "trim") {
        data = data.trim();
      } else if (check.kind === "includes") {
        if (!(data as string).includes(check.value, check.position)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              code: ZodIssueCode.invalid_string,
              validation: { includes: check.value, position: check.position },
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        data = data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        data = data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!(data as string).startsWith(check.value)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!(data as string).endsWith(check.value)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);

        if (!regex.test(data)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              code: ZodIssueCode.invalid_string,
              validation: "datetime",
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(data, check.version)) {
          err = err || new ZodInternalError([]);
          err.addIssue(
            data,
            // path.resolve(),
            {
              validation: "ip",
              code: ZodIssueCode.invalid_string,
              message: check.message,
              fatal: false,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }

    return err ?? data; // { status: status.value, value: data };
  }

  protected _regex = (
    regex: RegExp,
    validation: StringValidation,
    message?: errorUtil.ErrMessage
  ) =>
    this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message),
    });

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
  emoji(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
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

  ip(options?: string | { version?: "v4" | "v6"; message?: string }) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }

  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
        }
  ) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        message: options,
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      ...errorUtil.errToObj(options?.message),
    });
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
  nonempty = (message?: errorUtil.ErrMessage) =>
    this.min(1, errorUtil.errToObj(message));

  trim = () =>
    new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }],
    });

  toLowerCase = () =>
    new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }],
    });

  toUpperCase = () =>
    new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }],
    });

  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }

  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
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
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
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

  static create = (params?: RawCreateParams & { coerce?: true }): ZodString => {
    const base = new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params),
    });
    const instance = Object.assign(Object.create(base), {
      parse(data: unknown) {
        if (typeof data === "string") return data;
        return base.parse(data);
      },
      async parseAsync(data: unknown) {
        if (typeof data === "string") return data;
        return base.parseAsync(data);
      },
    });
    return instance;
  };
}

// const baseString = new ZodString({
//       checks: [],
//       typeName: ZodFirstPartyTypeKind.ZodString,
//       coerce: params?.coerce ?? false,
//       ...processCreateParams(params),
//     });

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

export class ZodNumber extends ZodType<number, ZodNumberDef> {
  async _parseAsync(
    data: any,
    // path: LazyPath,
    ctx?: ParseContext
  ): Promise<unknown> {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (this._def.coerce) {
      data = Number(data);
    }
    // const parsedType = this._getType(input);
    if (typeof data !== ZodParsedType.number) {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
      // return INVALID;
    }
    if (isNaN(data)) {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: "nan",
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
      // return INVALID;
    }

    // let ctx: undefined | ParseContext = undefined;
    let err!: ZodInternalError;

    if (this._def.checks.length) {
      // const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util.isInteger(data)) {
            // ctx = this["~getOrReturnCtx"](input, ctx);
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              // path.resolve(),
              {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
            // status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive
            ? data < check.value
            : data <= check.value;
          if (tooSmall) {
            // ctx = this["~getOrReturnCtx"](input, ctx);
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              // path.resolve(),
              {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
            // status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive
            ? data > check.value
            : data >= check.value;
          if (tooBig) {
            // ctx = this["~getOrReturnCtx"](input, ctx);
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              // path.resolve(),
              {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
            // status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(data, check.value) !== 0) {
            // ctx = this["~getOrReturnCtx"](input, ctx);
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              // path.resolve(),
              {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
            // status.dirty();
          }
        } else if (check.kind === "finite") {
          if (!Number.isFinite(data)) {
            // ctx = this["~getOrReturnCtx"](input, ctx);
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              // path.resolve(),
              {
                code: ZodIssueCode.not_finite,
                message: check.message,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
            // status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
    }
    //
    return err ?? data; // { status: status.value, value: data };
  }

  static create = (
    params?: RawCreateParams & { coerce?: boolean }
  ): ZodNumber => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params),
    });
  };

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

export class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (this._def.coerce) {
      data = BigInt(data);
    }
    // const parsedType = this._getType(input);
    if (typeof data !== "bigint") {
      // const ctx = this["~getOrReturnCtx"](input);
      const err = new ZodInternalError([]);
      // err = err ?? new ZodInternalError([]);
      err.addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: getParsedType(data),
        },
        ctx?.errorMap,
        this._def.errorMap
      );
      return err;
    }

    // const status = new ParseStatus();

    let err!: ZodInternalError;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? data < check.value
          : data <= check.value;
        if (tooSmall) {
          // ctx = this["~getOrReturnCtx"](input, ctx);
          err = err ?? new ZodInternalError([]);
          err.addIssue(
            ctx,
            {
              code: ZodIssueCode.too_small,
              type: "bigint",
              minimum: check.value,
              inclusive: check.inclusive,
              message: check.message,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? data > check.value
          : data >= check.value;
        if (tooBig) {
          // ctx = this["~getOrReturnCtx"](input, ctx);
          err = err ?? new ZodInternalError([]);
          err.addIssue(
            ctx,
            {
              code: ZodIssueCode.too_big,
              type: "bigint",
              maximum: check.value,
              inclusive: check.inclusive,
              message: check.message,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (data % check.value !== BigInt(0)) {
          // ctx = this["~getOrReturnCtx"](input, ctx);
          err = err ?? new ZodInternalError([]);
          err.addIssue(
            ctx,
            {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message,
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }

    return err ?? data;
  }

  static create = (
    params?: RawCreateParams & { coerce?: boolean }
  ): ZodBigInt => {
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: params?.coerce ?? false,
      ...processCreateParams(params),
    });
  };

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

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (this._def.coerce) {
      data = Boolean(data);
    }
    // const parsedType = this._getType(input);

    if (typeof data !== "boolean") {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
      // return INVALID;
    }
    return data;
  }

  static create = (
    params?: RawCreateParams & { coerce?: boolean }
  ): ZodBoolean => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      coerce: params?.coerce || false,
      ...processCreateParams(params),
    });
  };
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

export class ZodDate extends ZodType<Date, ZodDateDef> {
  async _parseAsync(data: unknown, ctx?: ParseContext): Promise<unknown> {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (this._def.coerce) {
      data = new Date(data);
    }
    // const parsedType = this._getType(input);

    if (!(data instanceof Date)) {
      // const ctx = this["~getOrReturnCtx"](input);
      const err = new ZodInternalError([]);
      err.addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: getParsedType(data),
        },
        ctx?.errorMap,
        this._def.errorMap
      );
      return err;
    }

    if (isNaN(data.getTime())) {
      // const ctx = this["~getOrReturnCtx"](input);
      const err = new ZodInternalError([]);
      err.addIssue(
        data,
        {
          code: ZodIssueCode.invalid_date,
        },
        ctx?.errorMap,
        this._def.errorMap
      );
      return err;
    }

    let err!: ZodInternalError;
    // const status = new ParseStatus();
    // let ctx: undefined | ParseContext = undefined;

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (data.getTime() < check.value) {
          err = err ?? new ZodInternalError([]);
          err.addIssue(
            ctx,
            {
              code: ZodIssueCode.too_small,
              message: check.message,
              inclusive: true,
              exact: false,
              minimum: check.value,
              type: "date",
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else if (check.kind === "max") {
        if (data.getTime() > check.value) {
          err = err ?? new ZodInternalError([]);
          err.addIssue(
            ctx,
            {
              code: ZodIssueCode.too_big,
              message: check.message,
              inclusive: true,
              exact: false,
              maximum: check.value,
              type: "date",
            },
            ctx?.errorMap,
            this._def.errorMap
          );
          // status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }

    return err ?? new Date((data as Date).getTime());
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

  static create = (
    params?: RawCreateParams & { coerce?: boolean }
  ): ZodDate => {
    return new ZodDate({
      checks: [],
      coerce: params?.coerce || false,
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const parsedType = this._getType(input);
    if (typeof data !== "symbol") {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    return data;
  }

  static create = (params?: RawCreateParams): ZodSymbol => {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      ...processCreateParams(params),
    });
  };
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

export class ZodUndefined extends ZodType<undefined, ZodUndefinedDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const parsedType = this._getType(input);
    if (typeof data !== "undefined") {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }
    return data;
  }
  params?: RawCreateParams;

  static create = (params?: RawCreateParams): ZodUndefined => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams(params),
    });
  };
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

export class ZodNull extends ZodType<null, ZodNullDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const parsedType = this._getType(input);
    if (data !== null) {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }
    return data;
  }
  static create = (params?: RawCreateParams): ZodNull => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams(params),
    });
  };
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

export class ZodAny extends ZodType<any, ZodAnyDef> {
  // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
  _any = true as const;
  async _parseAsync(data: any, _ctx?: ParseContext) {
    return data;
  }
  _parse(data: any, _ctx?: ParseContext): unknown {
    return data;
  }
  static create = (params?: RawCreateParams): ZodAny => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams(params),
    });
  };
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

export class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
  // required
  _unknown = true as const;
  async _parseAsync(data: any, _ctx?: ParseContext) {
    return data;
  }
  _parse(data: any, _ctx?: ParseContext): unknown {
    return data;
  }

  static create = (params?: RawCreateParams): ZodUnknown => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams(params),
    });
  };
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

export class ZodNever extends ZodType<never, ZodNeverDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    return new ZodInternalError([
      makeIssue(
        data,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: getParsedType(data),
        },
        ctx?.errorMap,
        this._def.errorMap
      ),
    ]);
  }
  static create = (params?: RawCreateParams): ZodNever => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams(params),
    });
  };
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

export class ZodVoid extends ZodType<void, ZodVoidDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const parsedType = this._getType(input);
    if (typeof data !== "undefined") {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }
    return data;
  }

  static create = (params?: RawCreateParams): ZodVoid => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams(params),
    });
  };
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
  // "~preparse"(data: any, ctx?: ParseContext): unknown {

  //   return err ?? data;
  // }

  _parse(data: any, ctx?: ParseContext): unknown {
    const def = this._def;

    if (!Array.isArray(data)) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    let err!: ZodInternalError;

    if (def.exactLength !== null) {
      const tooBig = data.length > def.exactLength.value;
      const tooSmall = data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        err = err ?? new ZodInternalError([]);
        err.addIssue(
          data,
          {
            code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
            minimum: (tooSmall ? def.exactLength.value : undefined) as number,
            maximum: (tooBig ? def.exactLength.value : undefined) as number,
            type: "array",
            inclusive: true,
            exact: true,
            message: def.exactLength.message,
          },
          ctx?.errorMap,
          this._def.errorMap
        );
        // status.dirty();
      }
    }

    if (def.minLength !== null) {
      if (data.length < def.minLength.value) {
        err = err ?? new ZodInternalError([]);
        err.addIssue(
          data,
          {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.minLength.message,
            fatal: false,
          },
          ctx?.errorMap,
          this._def.errorMap
        );
        // status.dirty();
      }
    }

    if (def.maxLength !== null) {
      if (data.length > def.maxLength.value) {
        err = err ?? new ZodInternalError([]);
        err.addIssue(
          data,
          {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.maxLength.message,
            fatal: false,
          },
          ctx?.errorMap,
          this._def.errorMap
        );
        // status.dirty();
      }
    }

    // const basicResult = this["~preparse"](data, ctx);
    // let err!: ZodInternalError;
    // if (basicResult instanceof ZodInternalError) {
    //   if (basicResult.aborted) {
    //     return basicResult;
    //   } else {
    //     err = basicResult;
    //   }
    // }

    // for (const [item, i] of data.entries()) {
    //   const result = this._def.type._parse(item, ctx);
    //   if (result instanceof ZodInternalError) {
    //     err = err ?? new ZodInternalError([]);
    //     err.addIssues(result.prefix(i).issues);
    //   }
    // }
    if (ctx?.async) {
      const promises: Promise<any>[] = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        const item = data[i];
        const index = i;
        promises[i] = Promise.resolve(this._def.type._parse(item, ctx)).then(
          (result) => {
            if (result instanceof ZodInternalError) {
              err = err ?? new ZodInternalError([]);
              err.addIssues(result.prefix(index).issues);
              return NEVER;
            }
            return result;
          }
        );
      }
      return Promise.all(promises).then((results) => err ?? results);
    } else {
      const results: any[] = [];
      for (var i = 0; i < data.length; i++) {
        const item = data[i];
        const result = this._def.type._parse(item, ctx);
        if (result instanceof ZodInternalError) {
          err = err ?? new ZodInternalError([]);
          err.merge(result, i);
          results.push(NEVER);
        } else {
          results.push(result);
        }
      }
      // (data as any[]).map((item, i) => {
      //   const result = this._def.type._parse(item, ctx);
      //   if (result instanceof ZodInternalError) {
      //     err = err ?? new ZodInternalError([]);
      //     err.addIssues(result.prefix(i).issues);
      //     return null;
      //   }
      //   return result;
      // });

      return err ?? results;
    }
  }
  async _parseAsync(data: unknown, ctx?: ParseContext): Promise<unknown> {
    // const basicResult = this["~preparse"](data, ctx);
    // let err!: ZodInternalError;
    // if (basicResult instanceof ZodInternalError) {
    //   if (basicResult.aborted) {
    //     return basicResult;
    //   } else {
    //     err = basicResult;
    //   }
    // }
    // const promises = (data as any[]).map(async (item, i) => {
    //   const result = await this._def.type._parseAsync(item, ctx);
    //   if (result instanceof ZodInternalError) {
    //     err = err ?? new ZodInternalError([]);
    //     err.addIssues(result.prefix(i).issues);
    //     return null;
    //   }
    //   return result;
    // });

    // const results = await Promise.all(promises);
    // return err ?? results;
    return this._parse(data, ctx);
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

  static create = <T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodArray<T> => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams(params),
    });
  };
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
> = ZodRawShape extends Shape
  ? object
  : util.exactOptionalPropertyTypes extends true
  ? baseObjectOutputType<Shape>
  : objectUtil.flatten<
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
> = ZodRawShape extends Shape
  ? object
  : objectUtil.flatten<baseObjectInputType<Shape>> &
      CatchallInput<Catchall> &
      PassthroughType<UnknownKeys>;
export type baseObjectInputType<Shape extends ZodRawShape> =
  objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
  }>;

export type CatchallOutput<T extends ZodTypeAny> = ZodTypeAny extends T
  ? unknown
  : { [k: string]: T["_output"] };

export type CatchallInput<T extends ZodTypeAny> = ZodTypeAny extends T
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
  // Output = simpleObjectOutputType<T>,
  // Input = simpleObjectInputType<T>
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>
> extends ZodType<
  // objectOutputType<T, Catchall, UnknownKeys>,
  Output,
  ZodObjectDef<T, UnknownKeys, Catchall>,
  // Input
  // objectInputType<T, Catchall, UnknownKeys>
  Input
> {
  private _cached: {
    shape: T;
    keys: string[];
    keyset: { [k: string]: boolean };
  } | null = null;

  "~getShape"(): {
    shape: T;
    keys: string[];
    keyset: { [k: string]: boolean };
  } {
    // if (this._cached) {
    //   return this._cached;
    // }
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    const keyset: { [k: string]: boolean } = {};
    for (const key in shape) {
      if (Object.prototype.hasOwnProperty.call(shape, key)) {
        keyset[key] = true;
      }
    }
    this._cached = { shape, keys, keyset };
    return this._cached;
  }

  _parse(data: any, ctx?: ParseContext): unknown {
    // if (Object.getPrototypeOf(data) !== Object.prototype) {
    //   return new ZodInternalError([
    //     makeIssue(
    //       data,
    //       {
    //         code: ZodIssueCode.invalid_type,
    //         expected: ZodParsedType.object,
    //         received: getParsedType(data),
    //       },
    //       ctx?.errorMap,
    //       this._def.errorMap
    //     ),
    //   ]);
    // }
    const checkType = this["~checkType"](data, ctx);
    if (checkType) return checkType;

    const shape = this._cached || this["~getShape"]();

    const finalObject: any = {};
    let err!: ZodInternalError;

    for (const key of shape.keys) {
      const result = shape.shape[key]._parse(data[key], ctx);
      if (result instanceof ZodInternalError) {
        err = err || new ZodInternalError([]);
        err.merge(result, key);
      } else {
        finalObject[key] = result;
      }
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "strip") {
      } else {
        const extraKeys = util.objectKeys(data).filter((k) => !shape.keyset[k]);
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys || []) {
            finalObject[key] = data[key];
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys && extraKeys.length > 0) {
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
          }
        } else {
          throw new Error(
            `Internal ZodObject error: invalid unknownKeys value.`
          );
        }
      }
    } else {
      // run catchall validation
      const catchall = this._def.catchall;
      const extraKeys = util.objectKeys(data).filter((k) => !shape.keyset[k]);

      for (const key of extraKeys || []) {
        const result = catchall._parse(data[key], ctx);
        if (result instanceof ZodInternalError) {
          err = err || new ZodInternalError([]);
          err.merge(result, key);
        } else {
          if (key in data) {
            finalObject[key] = result;
          }
        }
      }
    }
    return err ?? finalObject;
  }

  "~checkType"(data: any, ctx?: ParseContext) {
    if (!data || Object.getPrototypeOf(data) !== Object.prototype) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }
    return undefined;
  }

  async _parseAsync(data: any, ctx?: ParseContext): Promise<unknown> {
    const checkType = this["~checkType"](data, ctx);
    if (checkType) return checkType;

    const shape = this._cached || this["~getShape"]();

    const finalObject: any = {};
    let err!: ZodInternalError;

    for (const key of shape.keys) {
      const result = await shape.shape[key]._parseAsync(data[key], ctx);

      if (result instanceof ZodInternalError) {
        err = err || new ZodInternalError([]);
        err.addIssues(result.prefix(key).issues);
      } else {
        finalObject[key] = result;
      }
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "strip") {
      } else {
        const extraKeys = util.objectKeys(data).filter((k) => !shape.keyset[k]);
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys || []) {
            finalObject[key] = data[key];
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys && extraKeys.length > 0) {
            err = err || new ZodInternalError([]);
            err.addIssue(
              data,
              {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys,
              },
              ctx?.errorMap,
              this._def.errorMap
            );
          }
        } else {
          throw new Error(
            `Internal ZodObject error: invalid unknownKeys value.`
          );
        }
      }
    } else {
      // run catchall validation
      const catchall = this._def.catchall;
      const extraKeys = util.objectKeys(data).filter((k) => !shape.keyset[k]);

      await Promise.all(
        extraKeys.map(async (key) => {
          const result = await catchall._parseAsync(data[key], ctx);
          if (result instanceof ZodInternalError) {
            err = err ?? new ZodInternalError([]);
            err.addIssues(result.prefix(key).issues);
          } else if (key in data) {
            finalObject[key] = result;
          }
        })
      );
    }
    return err ?? finalObject;
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
    augmentation: Augmentation
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall> {
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

  pick<Mask extends { [k in keyof T]?: true }>(
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

  omit<Mask extends { [k in keyof T]?: true }>(
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
  partial<Mask extends { [k in keyof T]?: true }>(
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
  required<Mask extends { [k in keyof T]?: true }>(
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
    return createZodEnum(
      util.objectKeys(this.shape) as [string, ...string[]]
    ) as any;
  }

  // static create = <T extends ZodRawShape>(
  //   shape: T,
  //   params?: RawCreateParams
  // ): ZodObject<T, "strip"> => {
  //   return new ZodObject({
  //     shape: () => shape,
  //     unknownKeys: "strip",
  //     catchall: ZodNever.create(),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //     ...processCreateParams(params),
  //   }) as any;
  // };

  static create<T extends { [k: string]: any }>(
    shape: T,
    params?: RawCreateParams
  ): ZodObject<
    {
      [k in keyof T]: T[k] extends ZodTypeAny ? T[k] : never;
    },
    "strip",
    ZodTypeAny
    // simpleObjectOutputType<T>,
    // objectUtil.addQuestionMarks<shapifyOutput<T>>,
    // objectUtil.flatten<objectUtil.addQuestionMarks<shapifyOutput<T>>>,
    // shapifyOutput<T>,
    // {}
  > {
    const cleanShape: ZodRawShape = {};
    for (const key in shape) {
      if ((shape[key] as any) instanceof ZodType) {
        cleanShape[key] = shape[key];
      }
    }
    return new ZodObject({
      shape: () => cleanShape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params),
    }) as any;
  }

  static recursive<T extends { [k: string]: any }>(
    _shape: T,
    _params?: RawCreateParams
  ): ZodObject<
    shapifyOutput<T>,
    "strip",
    ZodTypeAny,
    simpleObjectOutputType<T>,
    simpleObjectInputType<T>
  > {
    return "asdf" as any;
  }

  static strictCreate = <T extends ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): ZodObject<T, "strict"> => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params),
    }) as any;
  };

  static lazycreate = <T extends ZodRawShape>(
    shape: () => T,
    params?: RawCreateParams
  ): ZodObject<T, "strip"> => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params),
    }) as any;
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    const options = this._def.options;
    let isValid = false;
    const results = await Promise.all(
      options.map(async (option) => {
        const result = await option._parseAsync(data, ctx);
        if (!(result instanceof ZodInternalError)) {
          isValid = true;
        }
        return result;
      })
    );
    if (isValid) {
      return results.find((result) => !(result instanceof ZodInternalError));
    }
    return new ZodInternalError([
      makeIssue(
        data,
        {
          code: ZodIssueCode.invalid_union,
          unionErrors: (results as ZodInternalError[]).map(
            (err) => new ZodError(err.issues)
          ),
        },
        ctx?.errorMap,
        this._def.errorMap
      ),
    ]);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    const options = this._def.options;

    // let dirty: undefined | { result: DIRTY<any>; ctx?: ParseContext } =
    //   undefined;
    // const issues: ZodIssue[][] = [];
    let isValid = false;
    let validResult;
    const results = options.map((option) => {
      const result = option._parse(data, ctx);
      if (!(result instanceof ZodInternalError)) {
        // isValid = true;
        if (!isValid) {
          isValid = true;
          validResult = result;
        }
      }
      return result;
    });

    if (isValid) return validResult;

    return new ZodInternalError([
      makeIssue(
        data,
        {
          code: ZodIssueCode.invalid_union,
          unionErrors: (results as ZodInternalError[]).map(
            (err) => new ZodError(err.issues)
          ),
        },
        ctx?.errorMap,
        this._def.errorMap
      ),
    ]);
  }

  get options() {
    return this._def.options;
  }

  static create = <
    T extends Readonly<[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>
  >(
    types: T,
    params?: RawCreateParams
  ): ZodUnion<T> => {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams(params),
    });
  };
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

const getDiscriminator = <T extends ZodTypeAny>(
  type: T
): Primitive[] | null => {
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
    return Object.keys(type.enum as any);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else {
    return null;
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
  "~preparse"(data: any, ctx?: ParseContext) {
    if (!data || Object.getPrototypeOf(data) !== Object.prototype) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: getParsedType(data),
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    const discriminator = this.discriminator;
    const discriminatorValue: string = data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);

    if (!option) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator],
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }
    return option;
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    const preparsed = this["~preparse"](data, ctx);
    if (preparsed instanceof ZodInternalError) return preparsed;

    return preparsed._parse(data, ctx); // as any;
  }

  async _parseAsync(data: any, ctx?: ParseContext) {
    const preparsed = this["~preparse"](data, ctx);
    if (preparsed instanceof ZodInternalError) return preparsed;
    return preparsed._parseAsync(data, ctx) as any;
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
      if (!discriminatorValues) {
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
): { valid: true; data: any } | { valid: false } {
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
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }

    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }

    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);

      if (!sharedValue.valid) {
        return { valid: false };
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
    return { valid: false };
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
  _parse(data: any, ctx?: ParseContext): unknown {
    const left = this._def.left._parse(data, ctx);
    const right = this._def.right._parse(data, ctx);

    if (left instanceof ZodInternalError) {
      return right instanceof ZodInternalError ? left.merge(right) : left;
    }
    if (right instanceof ZodInternalError) return right;
    const merged = mergeValues(left, right);
    if (!merged.valid) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_intersection_types,
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    return merged.data;
  }

  async _parseAsync(data: any, ctx?: ParseContext) {
    const [left, right] = await Promise.all([
      this._def.left._parseAsync(data, ctx),
      this._def.right._parseAsync(data, ctx),
    ]);

    if (left instanceof ZodInternalError) {
      return right instanceof ZodInternalError ? left.merge(right) : left;
    }
    if (right instanceof ZodInternalError) return right;
    const merged = mergeValues(left, right);
    if (!merged.valid) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_intersection_types,
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    return merged.data;
  }

  static create = <T extends ZodTypeAny, U extends ZodTypeAny>(
    left: T,
    right: U,
    params?: RawCreateParams
  ): ZodIntersection<T, U> => {
    return new ZodIntersection({
      left: left,
      right: right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams(params),
    });
  };
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
  [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_output"] : never;
}>;
export type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...OutputTypeOfTuple<T>, ...Rest["_output"][]]
  : OutputTypeOfTuple<T>;

export type InputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<{
  [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_input"] : never;
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
  _parse(data: any, ctx?: ParseContext): unknown {
    if (!Array.isArray(data)) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
    }

    if (data.length < this._def.items.length) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array",
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
    }

    // const rest = this._def.rest;
    let err!: ZodInternalError;
    if (!this._def.rest && data.length > this._def.items.length) {
      err = err ?? new ZodInternalError([]);
      err.addIssue(
        data,
        {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array",
          fatal: false,
        },
        this._def.errorMap,
        ctx?.errorMap
      );
    }

    // const items = ([...data] as any[])
    //   .map((item, itemIndex) => {
    //     const schema = this._def.items[itemIndex] || this._def.rest;
    //     if (!schema) return null as any; // as SyncParseReturnType<any>;
    //     return schema._parse(
    //       item,
    //       ctx
    //       // new ParseInputLazyPath(ctx, item, ctx.path, itemIndex)
    //     );
    //   })
    // .filter((x) => !!x); // filter nulls

    if (ctx?.async) {
      return Promise.all(
        [...data].map(async (item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema) return null as any; // as SyncParseReturnType<any>;
          const result = await schema._parse(
            item,
            ctx
            // new ParseInputLazyPath(ctx, item, ctx.path, itemIndex)
          );
          // const result = await datum;
          if (result instanceof ZodInternalError) {
            err = err ?? new ZodInternalError([]);
            err.merge(result, itemIndex);
          }
          return result;
        })
      ).then((results) => {
        return err ?? results;
      });
      // .then();
      // if (el instanceof ZodInternalError) {
      //   err = err ?? new ZodInternalError([]);
      //   err.merge(el, itemIndex);
      // }
      // return el;
    } else {
      const items = ([...data] as any[]).map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema) return null as any; // as SyncParseReturnType<any>;
        const result = schema._parse(
          item,
          ctx
          // new ParseInputLazyPath(ctx, item, ctx.path, itemIndex)
        );
        if (result instanceof ZodInternalError) {
          err = err ?? new ZodInternalError([]);
          err.merge(result, itemIndex);
        }
        return result;
      });
      return err ?? items;
      // return ParseStatus.mergeArray(status, items as SyncParseReturnType[]);
    }
  }
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
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

  static create = <T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: T,
    params?: RawCreateParams
  ): ZodTuple<T, null> => {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { status, ctx } = this._processInputParams(input);
    // if (ctx.parsedType !== ZodParsedType.object) {
    if (!data || Object.getPrototypeOf(data) !== Object.prototype) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.object,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }

    // const pairs: {
    //   key: ParseReturnType<any>;
    //   value: ParseReturnType<any>;
    // }[] = [];

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    let err!: ZodInternalError;
    const finalResult: any = {};
    if (ctx?.async) {
      return Promise.all(
        Object.keys(data).map(async (key) => {
          const [k, v] = await Promise.all([
            keyType._parse(key, ctx),
            valueType._parse(data[key], ctx),
          ]);
          //  const v = valueType._parse(data[key], ctx);
          if (k instanceof ZodInternalError || v instanceof ZodInternalError) {
            if (k instanceof ZodInternalError) {
              err = err ?? new ZodInternalError([]);
              err.merge(k, key);
            }
            if (v instanceof ZodInternalError) {
              err = err ?? new ZodInternalError([]);
              err.merge(v, key);
            }
          } else {
            finalResult[k as any] = v;
          }
        })
      ).then(() => {
        if (err) return err;
        return finalResult;
      });
      // for (const key in data) {
      //   const k = keyType._parse(key, ctx);
      //   const v = valueType._parse(data[key], ctx);
      //   if (k instanceof ZodInternalError || v instanceof ZodInternalError) {
      //     if (k instanceof ZodInternalError) {
      //       err = err ?? new ZodInternalError([]);
      //       err.merge(k);
      //     }
      //     if (v instanceof ZodInternalError) {
      //       err = err ?? new ZodInternalError([]);
      //       err.merge(v);
      //     }
      //   } else {
      //     finalResult[k as any] = v;
      //   }
      // pairs.push({
      //   key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
      //   value: valueType._parse(
      //     new ParseInputLazyPath(ctx, data[key], ctx.path, key)
      //   ),
      // });
      // }
      // return finalResult;
      // return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      for (const key in data) {
        const k = keyType._parse(key, ctx);
        const v = valueType._parse(data[key], ctx);
        if (k instanceof ZodInternalError || v instanceof ZodInternalError) {
          if (k instanceof ZodInternalError) {
            err = err ?? new ZodInternalError([]);
            err.merge(k, key);
          }
          if (v instanceof ZodInternalError) {
            err = err ?? new ZodInternalError([]);
            err.merge(v, key);
          }
        } else {
          finalResult[k as any] = v;
        }
        // pairs.push({
        //   key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        //   value: valueType._parse(
        //     new ParseInputLazyPath(ctx, data[key], ctx.path, key)
        //   ),
        // });
      }
      return err ? err : finalResult;
      // return ParseStatus.mergeObjectSync(status, pairs as any);
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

  "~preparse"(data: any, ctx?: ParseContext) {
    if (!(data instanceof Map)) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // makeIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.map,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }
    return undefined;
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { status, ctx } = this._processInputParams(input);
    const pre = this["~preparse"](data, ctx);
    if (pre instanceof ZodInternalError) return pre;

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const finalMap = new Map();
    let err!: ZodInternalError;
    let counter = 0;
    for (const [key, value] of data as Map<unknown, unknown>) {
      const k = keyType._parse(key, ctx);
      const v = valueType._parse(value, ctx);
      if (k instanceof ZodInternalError || v instanceof ZodInternalError) {
        err = err ?? new ZodInternalError([]);
        if (k instanceof ZodInternalError) err.merge(k.prefix("key"), counter);
        if (v instanceof ZodInternalError)
          err.merge(v.prefix("value"), counter);
      }
      finalMap.set(k, v);
      counter++;
    }

    return err ?? finalMap;
    // const pairs = [...(data as Map<unknown, unknown>).entries()].map(
    //   ([key, value], index) => {
    //     return {
    //       key: keyType._parse(
    //         key,
    //         ctx
    //         // new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])
    //       ),
    //       value: valueType._parse(
    //         value,
    //         ctx
    //         // new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])
    //       ),
    //     };
    //   }
    // );

    // if (ctx?.async) {
    //   const finalMap = new Map();
    //   return Promise.resolve().then(async () => {
    //     for (const pair of pairs) {
    //       const key = await pair.key;
    //       const value = await pair.value;
    //       if (key.status === "aborted" || value.status === "aborted") {
    //         return INVALID;
    //       }
    //       if (key.status === "dirty" || value.status === "dirty") {
    //         status.dirty();
    //       }

    //       finalMap.set(key.value, value.value);
    //     }
    //     return { status: status.value, value: finalMap };
    //   });
    // } else {
    //   const finalMap = new Map();
    //   for (const pair of pairs) {
    //     const key = pair.key as SyncParseReturnType;
    //     const value = pair.value as SyncParseReturnType;
    //     if (key.status === "aborted" || value.status === "aborted") {
    //       return INVALID;
    //     }
    //     if (key.status === "dirty" || value.status === "dirty") {
    //       status.dirty();
    //     }

    //     finalMap.set(key.value, value.value);
    //   }
    //   return { status: status.value, value: finalMap };
    // }
  }

  async _parseAsync(data: any, ctx?: ParseContext) {
    // return this._parse(data, ctx);
    const pre = this["~preparse"](data, ctx);
    if (pre instanceof ZodInternalError) return pre;

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const finalMap = new Map();
    let err!: ZodInternalError;

    let counter = 0;
    for (const [key, value] of data as Map<string, unknown>) {
      const [k, v] = await Promise.all([
        keyType._parse(key, ctx),
        valueType._parse(value, ctx),
      ]);

      if (k instanceof ZodInternalError || v instanceof ZodInternalError) {
        err = err ?? new ZodInternalError([]);
        if (k instanceof ZodInternalError) err.merge(k.prefix("key"), counter);
        if (v instanceof ZodInternalError)
          err.merge(v.prefix("value"), counter);
      }
      finalMap.set(k, v);
      counter++;
    }

    return err ?? finalMap;
  }

  static create = <
    Key extends ZodTypeAny = ZodTypeAny,
    Value extends ZodTypeAny = ZodTypeAny
  >(
    keyType: Key,
    valueType: Value,
    params?: RawCreateParams
  ): ZodMap<Key, Value> => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { status, ctx } = this._processInputParams(input);
    if (!(data instanceof Set)) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.set,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }

    const def = this._def;
    let err!: ZodInternalError;

    if (def.minSize !== null) {
      if (data.size < def.minSize.value) {
        err = err ?? new ZodInternalError([]);
        err.addIssue(
          data,
          {
            code: ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.minSize.message,
          },
          this._def.errorMap,
          ctx?.errorMap
        );
        // status.dirty();
      }
    }

    if (def.maxSize !== null) {
      if (data.size > def.maxSize.value) {
        err = err ?? new ZodInternalError([]);
        err.addIssue(
          data,
          {
            code: ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.maxSize.message,
          },
          this._def.errorMap,
          ctx?.errorMap
        );
        // status.dirty();
      }
    }

    // const valueType = this._def.valueType;

    // function finalizeSet(elements: SyncParseReturnType<any>[]) {
    //   const parsedSet = new Set();
    //   for (const element of elements) {
    //     if (element.status === "aborted") return INVALID;
    //     if (element.status === "dirty") status.dirty();
    //     parsedSet.add(element.value);
    //   }
    //   return { status: status.value, value: parsedSet };
    // }

    if (ctx?.async) {
      const parsedSet = new Set();
      // for(const el of data.values()) {
      //   parsedSet.add(

      //   )
      // }
      const elements = [...(data as Set<unknown>).values()].map((item, i) =>
        this._def.valueType
          ._parseAsync(
            item,
            ctx
            // new ParseInputLazyPath(ctx, item, ctx.path, i)
          )
          .then((item) => {
            if (item instanceof ZodInternalError) {
              err = err ?? new ZodInternalError([]);
              err.merge(item, i);
            } else {
              parsedSet.add(item);
            }
          })
      );
      return Promise.all(elements).then(() => {
        // for (const el of elements) {
        //   if (el instanceof ZodInternalError) {
        //     err = err ?? new ZodInternalError([]);
        //     err.merge(el, i);
        //   } else {
        //     parsedSet.add(el);
        //   }
        // }
        return err ?? parsedSet;
      });
    } else {
      const parsedSet = new Set();
      for (const [item, i] of data.entries()) {
        const parsed = this._def.valueType._parse(item, ctx);
        if (parsed instanceof ZodInternalError) {
          err = err ?? new ZodInternalError([]);
          err.merge(parsed, i);
        } else {
          parsedSet.add(parsed);
        }
      }
      return err ?? parsedSet;
      // return finalizeSet(elements as SyncParseReturnType[]);
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

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value,
    params?: RawCreateParams
  ): ZodSet<Value> => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    if (typeof data !== "function") {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.function,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }

    // const thisErrorMap = this._def.errorMap;

    // return makeIssue({
    //   data: args,
    //   path: ctx.path,
    //   errorMaps: [
    //     ctx.common.contextualErrorMap,
    //     ctx.schemaErrorMap,
    //     getErrorMap(),
    //     defaultErrorMap,
    //   ].filter((x) => !!x) as ZodErrorMap[],
    //   issueData: {
    //     code: ZodIssueCode.invalid_arguments,
    //     argumentsError: error,
    //   },
    // });
    // function makeArgsIssue(args: any, error: ZodError): ZodIssue {
    //   return makeIssue(
    //     args,
    //     {
    //       code: ZodIssueCode.invalid_arguments,
    //       argumentsError: error,
    //     },
    //     thisErrorMap,
    //     ctx?.errorMap
    //   );
    // }

    // function makeReturnsIssue(returns: any, error: ZodError): ZodIssue {
    //   return makeIssue(
    //     returns,
    //     {
    //       code: ZodIssueCode.invalid_return_type,
    //       returnTypeError: error,
    //     },
    //     thisErrorMap,
    //     ctx?.errorMap
    //   );
    // }
    // return makeIssue({
    //   data: returns,
    //   path: ctx.path,
    //   errorMaps: [
    //     ctx.common.contextualErrorMap,
    //     ctx.schemaErrorMap,
    //     getErrorMap(),
    //     defaultErrorMap,
    //   ].filter((x) => !!x) as ZodErrorMap[],
    //   issueData: {
    //     code: ZodIssueCode.invalid_return_type,
    //     returnTypeError: error,
    //   },
    // });

    // const params = { errorMap: ctx?.errorMap };
    const fn = data;

    // if (this._def.returns instanceof ZodPromise) {
    //   return OK(async (...args: any[]) => {
    //     const error = new ZodError([]);
    //     const parsedArgs = await this._def.args
    //       .parseAsync(args, params)
    //       .catch((e) => {
    //         error.addIssue(makeArgsIssue(args, e));
    //         throw error;
    //       });
    //     const result = await fn(...(parsedArgs as any));
    //     const parsedReturns = await (
    //       this._def.returns as unknown as ZodPromise<ZodTypeAny>
    //     )._def.type
    //       .parseAsync(result, params)
    //       .catch((e) => {
    //         error.addIssue(makeReturnsIssue(result, e));
    //         throw error;
    //       });
    //     return parsedReturns;
    //   });
    // } else {
    if (this._def.returns instanceof ZodPromise) {
      return async (...args: any[]) => {
        const parsedArgs = await this._def.args.parseAsync(args);
        // if (parsedArgs instanceof ZodInternalError) {
        //   throw new ZodError(parsedArgs.issues);
        //   // throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        // }
        const result = await fn(...(parsedArgs as any[]));
        return this._def.returns.parseAsync(result);
        // if (parsedReturns instanceof ZodInternalError) {
        //   throw new ZodError(parsedReturns.issues);
        // }
        // return parsedReturns;
      };
    }
    return (...args: any[]) => {
      const parsedArgs = this._def.args.parse(args);
      // if (parsedArgs instanceof ZodInternalError) {
      //   throw new ZodError(parsedArgs.issues);
      //   // throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
      // }
      const result = fn(...(parsedArgs as any[]));
      // if (result instanceof Promise) {
      //   return result.then(async (result) => {
      //     const parsedReturns = await this._def.returns._parse(result, ctx);
      //     if (parsedReturns instanceof ZodInternalError) {
      //       throw new ZodError(parsedReturns.issues);
      //     }
      //     return parsedReturns;
      //   });
      // }
      return this._def.returns.parse(result);
      // if (parsedReturns instanceof ZodInternalError) {
      //   throw new ZodError(parsedReturns.issues);
      // }
      // return parsedReturns;
    };
    // return OK((...args: any[]) => {
    //   const parsedArgs = this._def.args.safeParse(args, params);
    //   if (!parsedArgs.success) {
    //     throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
    //   }
    //   const result = fn(...(parsedArgs.data as any));
    //   const parsedReturns = this._def.returns.safeParse(result, params);
    //   if (!parsedReturns.success) {
    //     throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
    //   }
    //   return parsedReturns.data;
    // }) as any;
    // }
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

  returns<NewReturnType extends ZodType<any, any>>(
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

  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse(data, ctx);
  }

  static create = <T extends ZodTypeAny>(
    getter: () => T,
    params?: RawCreateParams
  ): ZodLazy<T> => {
    return new ZodLazy({
      getter: getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams(params),
    });
  };
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
}

export class ZodLiteral<T> extends ZodType<T, ZodLiteralDef<T>> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (data !== this._def.value) {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            received: data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value,
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   received: data,
      //   code: ZodIssueCode.invalid_literal,
      //   expected: this._def.value,
      // });
      // return INVALID;
    }
    return data;
  }

  get value() {
    return this._def.value;
  }

  static create = <T extends Primitive>(
    value: T,
    params?: RawCreateParams
  ): ZodLiteral<T> => {
    return new ZodLiteral({
      value: value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams(params),
    });
  };
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

export type EnumValues = [string, ...string[]];

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

function createZodEnum<U extends string, T extends Readonly<[U, ...U[]]>>(
  values: T,
  params?: RawCreateParams
): ZodEnum<Writeable<T>>;
function createZodEnum<U extends string, T extends [U, ...U[]]>(
  values: T,
  params?: RawCreateParams
): ZodEnum<T>;
function createZodEnum(
  values: [string, ...string[]],
  params?: RawCreateParams
) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params),
  });
}

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>
> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    if (typeof data !== "string") {
      // const ctx = this["~getOrReturnCtx"](input);
      const expectedValues = this._def.values;
      return new ZodInternalError([
        makeIssue(
          data,
          {
            expected: util.joinValues(expectedValues) as "string",
            received: getParsedType(data),
            code: ZodIssueCode.invalid_type,
          },
          ctx?.errorMap,
          this._def.errorMap
        ),
      ]);
    }

    if (this._def.values.indexOf(data) === -1) {
      // const ctx = this["~getOrReturnCtx"](input);
      // const expectedValues = this._def.values;

      return new ZodInternalError([
        makeIssue(
          data,
          {
            received: data,
            code: ZodIssueCode.invalid_enum_value,
            options: this._def.values,
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   received: data,
      //   code: ZodIssueCode.invalid_enum_value,
      //   options: expectedValues,
      // });
      // return INVALID;
    }
    return data;
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
    values: ToExtract
  ): ZodEnum<Writeable<ToExtract>> {
    return ZodEnum.create(values) as any;
  }

  exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
    values: ToExclude
  ): ZodEnum<
    typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
  > {
    return ZodEnum.create(
      this.options.filter((opt) => !values.includes(opt)) as FilterEnum<
        T,
        ToExclude[number]
      >
    ) as any;
  }

  static create = createZodEnum;
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
  ZodNativeEnumDef<T>
> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);

    // const ctx = this["~getOrReturnCtx"](input);
    if (typeof data !== "string" && typeof data !== "number") {
      const expectedValues = util.objectValues(nativeEnumValues);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            expected: util.joinValues(expectedValues) as "string",
            received: getParsedType(data),
            code: ZodIssueCode.invalid_type,
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   expected: util.joinValues(expectedValues) as "string",
      //   received: getParsedType(data),
      //   code: ZodIssueCode.invalid_type,
      // });
      // return INVALID;
    }

    if (nativeEnumValues.indexOf(data) === -1) {
      const expectedValues = util.objectValues(nativeEnumValues);

      return new ZodInternalError([
        makeIssue(
          data,
          {
            received: data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues,
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   received: data,
      //   code: ZodIssueCode.invalid_enum_value,
      //   options: expectedValues,
      // });
      // return INVALID;
    }
    return data;
  }

  get enum() {
    return this._def.values;
  }

  static create = <T extends EnumLike>(
    values: T,
    params?: RawCreateParams
  ): ZodNativeEnum<T> => {
    return new ZodNativeEnum({
      values: values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
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

  async safeParseAsync(data: unknown, params?: Partial<ParseParams>) {
    return {
      success: true,
      data: this._parseAsync(
        data,
        new ParseContext(params?.errorMap ?? null, true)
      ).then((val) => {
        if (val instanceof ZodInternalError) {
          throw new ZodError(val.issues);
        } else {
          return val;
        }
      }),
    } as any;
    //  const result = await this._parseAsync(
    //    data,
    //    new ParseContext(params?.errorMap ?? null, true)
    //  );

    //  if (result instanceof ZodInternalError) {
    //    return {
    //      success: true,
    //      error: new ZodError(result.issues),
    //      // error: (this instanceof ZodPromise
    //      //   ? Promise.((_res, rej) => {
    //      //       return rej(new ZodError(result.issues));
    //      //     })
    //      //   : new ZodError(result.issues)) as any,
    //    };
    //  }
  }
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    if (!(data instanceof Promise) && !ctx?.async) {
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.promise,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }

    // const promisified =
    //   ctx.parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

    // return OK(
    //   promisified.then((data: any) => {
    //     return this._def.type.parseAsync(data, {
    //       path: ctx.path,
    //       errorMap: ctx.common.contextualErrorMap,
    //     });
    //   })
    // );

    return Promise.resolve(data).then((data) => {
      return this._def.type._parse(data, ctx);
    });
  }

  static create = <T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodPromise<T> => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams(params),
    });
  };
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

  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { status, ctx } = this._processInputParams(input);

    const effect = this._def.effect; // || null;

    let err!: ZodInternalError;

    if (effect.type === "preprocess") {
      const checkCtx: RefinementCtx = {
        addIssue: (arg: IssueData) => {
          err = err ?? new ZodInternalError([]);
          arg.fatal = arg.fatal ?? true;
          err.addIssue(data, arg, this._def.errorMap, ctx?.errorMap);
        },
      };

      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      const processed = effect.transform(data, checkCtx);
      if (err) return err;

      if (ctx?.async) {
        return Promise.resolve(processed).then((processed) => {
          return this._def.schema._parse(processed, ctx);
        });
      } else {
        return this._def.schema._parse(processed, ctx);
      }
    }
    if (effect.type === "refinement") {
      const checkCtx: RefinementCtx = {
        addIssue: (arg: IssueData) => {
          err = err ?? new ZodInternalError([]);
          arg.fatal = arg.fatal ?? false;
          err.addIssue(data, arg, this._def.errorMap, ctx?.errorMap);
        },
      };

      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      // const executeRefinement = (
      //   acc: unknown
      //   // effect: RefinementEffect<any>
      // ): any => {
      //   const result = effect.refinement(acc, checkCtx);
      //   if (ctx.common.async) {
      //     return Promise.resolve(result);
      //   }
      //   if (result instanceof Promise) {
      //     throw new Error(
      //       "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
      //     );
      //   }
      //   return acc;
      // };

      if (!ctx?.async) {
        const inner = this._def.schema._parse(data, ctx);
        // if (inner.status === "aborted") return INVALID;
        // if (inner.status === "dirty") status.dirty();
        if (inner instanceof ZodInternalError && inner.aborted) {
          return inner;
        }

        // return value is ignored]
        const result = effect.refinement(inner, checkCtx);
        if (result instanceof Promise) {
          throw new Error(
            "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
          );
        }
        return err ?? inner;
        // const result = effect.refinement(acc, checkCtx);
        // if (ctx.async) {
        //   return Promise.resolve(result);
        // }
        // if (result instanceof Promise) {
        //   throw new Error(
        //     "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
        //   );
        // }
        // executeRefinement(inner.value);
        // return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync(data, ctx).then(async (inner) => {
          if (inner instanceof ZodInternalError) return inner;
          await effect.refinement(inner, checkCtx);
          return err ?? inner;
          // if (inner.status === "aborted") return INVALID;
          // if (inner.status === "dirty") status.dirty();

          // return executeRefinement(inner.value).then(() => {
          //   return { status: status.value, value: inner.value };
          // });
        });
      }
    }

    if (effect.type === "transform") {
      const checkCtx: RefinementCtx = {
        addIssue: (arg: IssueData) => {
          err = err ?? new ZodInternalError([]);
          arg.fatal = arg.fatal ?? true;
          err.addIssue(data, arg, this._def.errorMap, ctx?.errorMap);
        },
      };

      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (!ctx?.async) {
        const base = this._def.schema._parse(data, ctx);
        if (base instanceof ZodInternalError) return base;
        // if (!isValid(base)) return base;

        const result = effect.transform(base, checkCtx);
        if (result instanceof Promise) {
          throw new Error(
            `Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`
          );
        }

        if (err && err.aborted) return err;
        return result;
      } else {
        return this._def.schema._parseAsync(data, ctx).then(async (base) => {
          if (base instanceof ZodInternalError) return base;
          // if (!isValid(base)) return base;
          const result = await effect.transform(base, checkCtx);
          return err ?? result;
          // return Promise.resolve(effect.transform(base.value, checkCtx)).then(
          //   (result) => ({ status: status.value, value: result })
          // );
        });
      }
    }

    util.assertNever(effect);
  }

  static create = <I extends ZodTypeAny>(
    schema: I,
    effect: Effect<I["_output"]>,
    params?: RawCreateParams
  ): ZodEffects<I, I["_output"]> => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params),
    });
  };

  static createWithPreprocess = <I extends ZodTypeAny>(
    preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ): ZodEffects<I, I["_output"], unknown> => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    return typeof data === "undefined"
      ? data
      : this._def.innerType._parse(data, ctx);
  }

  unwrap() {
    return this._def.innerType;
  }

  static create = <T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodOptional<T> => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params),
    }) as any;
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    return data === null ? data : this._def.innerType._parse(data, ctx);
    // const parsedType = this._getType(input);
    // if (parsedType === ZodParsedType.null) {
    //   return OK(null);
    // }
    // return this._def.innerType._parse(input);
  }

  unwrap() {
    return this._def.innerType;
  }

  static create = <T extends ZodTypeAny>(
    type: T,
    params?: RawCreateParams
  ): ZodNullable<T> => {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams(params),
    }) as any;
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    // let data = data;
    // if (typeof data === "undefined") {
    //   data = this._def.defaultValue();
    // }
    return this._def.innerType._parse(
      typeof data === "undefined" ? this._def.defaultValue() : data,
      ctx
    );
  }

  removeDefault() {
    return this._def.innerType;
  }

  static create = <T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      default: T["_input"] | (() => util.noUndefined<T["_input"]>);
    }
  ): ZodDefault<T> => {
    return new ZodDefault({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue:
        typeof params.default === "function"
          ? params.default
          : () => params.default as any,
      ...processCreateParams(params),
    }) as any;
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);

    // newCtx is used to not collect issues from inner types in ctx
    // const newCtx?: ParseContext = {
    //   ...ctx,
    //   common: {
    //     ...ctx.common,
    //     issues: [],
    //   },
    // };

    if (ctx?.async) {
      return this._def.innerType._parseAsync(data, ctx).then(async (result) => {
        if (result instanceof ZodInternalError) {
          return this._def.catchValue({
            get error() {
              return new ZodError(result.issues);
            },
            input: data,
          });
        }
        return result;
      });
    }

    const result = this._def.innerType._parse(data, ctx);
    if (result instanceof ZodInternalError) {
      return this._def.catchValue({
        get error() {
          return new ZodError(result.issues);
        },
        input: data,
      });
    }
    return result;

    // if (isAsync(result)) {
    //   return result.then((result) => {
    //     return {
    //       status: "valid",
    //       value:
    //         result.status === "valid"
    //           ? result.value
    //           : this._def.catchValue({
    //               get error() {
    //                 return new ZodError(newCtx.common.issues);
    //               },
    //               input: newdata,
    //             }),
    //     };
    //   });
    // } else {
    //   return {
    //     status: "valid",
    //     value:
    //       result.status === "valid"
    //         ? result.value
    //         : this._def.catchValue({
    //             get error() {
    //               return new ZodError(newCtx.common.issues);
    //             },
    //             input: newdata,
    //           }),
    //   };
    // }
  }

  removeCatch() {
    return this._def.innerType;
  }

  static create = <T extends ZodTypeAny>(
    type: T,
    params: RawCreateParams & {
      catch: T["_output"] | (() => T["_output"]);
    }
  ): ZodCatch<T> => {
    return new ZodCatch({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue:
        typeof params.catch === "function" ? params.catch : () => params.catch,
      ...processCreateParams(params),
    });
  };
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

export class ZodNaN extends ZodType<number, ZodNaNDef> {
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const parsedType = this._getType(input);
    if (typeof data !== "number" || !isNaN(data)) {
      // const ctx = this["~getOrReturnCtx"](input);
      return new ZodInternalError([
        makeIssue(
          data,
          {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: getParsedType(data),
          },
          this._def.errorMap,
          ctx?.errorMap
        ),
      ]);
      // err.addIssue(data, {
      //   code: ZodIssueCode.invalid_type,
      //   expected: ZodParsedType.nan,
      //   received: getParsedType(data),
      // });
      // return INVALID;
    }

    return data;
  }

  static create = (params?: RawCreateParams): ZodNaN => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams(params),
    });
  };
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { ctx } = this._processInputParams(input);
    // const data = data;
    return this._def.type._parse(data, ctx);
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
  async _parseAsync(data: any, ctx?: ParseContext) {
    return this._parse(data, ctx);
  }
  _parse(data: any, ctx?: ParseContext): unknown {
    // const { status, ctx } = this._processInputParams(input);
    if (ctx?.async) {
      return Promise.resolve().then(async () => {
        const inResult = await this._def.in._parseAsync(data, ctx);
        if (inResult instanceof ZodInternalError) return inResult;
        return this._def.out._parseAsync(inResult, ctx);
        //  return outResult;
        //  if (inResult.status === "aborted") return INVALID;
        //  if (inResult.status === "dirty") {
        //    status.dirty();
        //    return DIRTY(inResult.value);
        //  } else {
        //    return this._def.out._parseAsync({
        //      data: inResult.value,
        //      path: ctx.path,
        //      parent: ctx,
        //    });
        //  }
      });
      // const handleAsync = async () => {
      //   const inResult = await this._def.in._parseAsync({
      //     data: data,
      //     path: ctx.path,
      //     parent: ctx,
      //   });
      //   if (inResult.status === "aborted") return INVALID;
      //   if (inResult.status === "dirty") {
      //     status.dirty();
      //     return DIRTY(inResult.value);
      //   } else {
      //     return this._def.out._parseAsync({
      //       data: inResult.value,
      //       path: ctx.path,
      //       parent: ctx,
      //     });
      //   }
      // };
      // return handleAsync();
    } else {
      const inResult = this._def.in._parse(data, ctx);
      // {
      //   data: data,
      //   path: ctx.path,
      //   parent: ctx,
      // });
      if (inResult instanceof ZodInternalError) return inResult;
      return this._def.out._parse(inResult, ctx);
      // if (inResult.status === "aborted") return INVALID;
      // if (inResult.status === "dirty") {
      //   status.dirty();
      //   return {
      //     status: "dirty",
      //     value: inResult.value,
      //   };
      // } else {
      //   return this._def.out._parseSync({
      //     data: inResult.value,
      //     path: ctx.path,
      //     parent: ctx,
      //   });
      // }
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

type CustomParams = CustomErrorParams & { fatal?: boolean };
export const custom = <T>(
  check?: (data: unknown) => any,
  params: string | CustomParams | ((input: any) => CustomParams) = {},
  /*
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
): ZodType<T> => {
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
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
};

export { ZodType as Schema, ZodType as ZodSchema };

export const late = {
  object: ZodObject.lazycreate,
};

export enum ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodNaN = "ZodNaN",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
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
}
export type ZodFirstPartySchemaTypes =
  | ZodString
  | ZodNumber
  | ZodNaN
  | ZodBigInt
  | ZodBoolean
  | ZodDate
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
  | ZodPipeline<any, any>;

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

const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

export const coerce = {
  string: ((arg) =>
    ZodString.create({ ...arg, coerce: true })) as (typeof ZodString)["create"],
  number: ((arg) =>
    ZodNumber.create({ ...arg, coerce: true })) as (typeof ZodNumber)["create"],
  boolean: ((arg) =>
    ZodBoolean.create({
      ...arg,
      coerce: true,
    })) as (typeof ZodBoolean)["create"],
  bigint: ((arg) =>
    ZodBigInt.create({ ...arg, coerce: true })) as (typeof ZodBigInt)["create"],
  date: ((arg) =>
    ZodDate.create({ ...arg, coerce: true })) as (typeof ZodDate)["create"],
};

export {
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  discriminatedUnionType as discriminatedUnion,
  effectsType as effect,
  enumType as enum,
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
  effectsType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};

// export const NEVER = INVALID as never;

type shapeToOutput<T extends { [k: string]: any }> = {
  [k in keyof T]: T[k]["_type"];
};
type shapeToInput<T extends { [k: string]: any }> = {
  [k in keyof T]: T[k]["_type"];
};
type addQs<T extends { [k: string]: any }> = {
  [k in keyof T as undefined extends T[k] ? k : never]?: T[k];
} & {
  [k in keyof T as undefined extends T[k] ? never : k]: T[k];
};
// type partialifyOutput<T extends { [k: string]: any }> = {
//   [k in keyof T as undefined extends T[k]["_output"]
//     ? k
//     : never]?: T[k]["_output"];
// } & {
//   [k in keyof T as undefined extends T[k]["_output"]
//     ? never
//     : k]: T[k]["_output"];
// };
// type partialifyInput<T extends { [k: string]: any }> = {
//   [k in keyof T as undefined extends T[k]["_input"]
//     ? k
//     : never]?: T[k]["_input"];
// } & {
//   [k in keyof T as undefined extends T[k]["_input"]
//     ? never
//     : k]: T[k]["_input"];
// };

export type flattenFunctions<T> = {
  [k in keyof T]: T[k] extends ZodTypeAny
    ? T[k]
    : T[k] extends (...args: any[]) => infer U
    ? U extends ZodTypeAny
      ? U
      : never
    : never;
};
export type shapifyOutput<T> = {
  [k in keyof T]: T[k] extends ZodTypeAny ? T[k]["_output"] : never;
};
export type shapifyInput<T> = {
  [k in keyof T]: T[k] extends ZodTypeAny ? T[k]["_output"] : never;
};
export type simpleObjectOutputType<T extends { [k: string]: any }> =
  ZodRawShape extends T ? object : addQs<shapeToOutput<T>>;

export type simpleObjectInputType<T extends { [k: string]: any }> =
  ZodRawShape extends T ? object : addQs<shapeToInput<T>>;

declare function makeObject<T extends { [k: string]: any }>(
  _shape: T,
  _params?: RawCreateParams
): ZodObject<
  shapifyOutput<T>,
  "strip",
  ZodTypeAny,
  simpleObjectOutputType<T>,
  simpleObjectInputType<T>
>;
ZodObject.create;

export type identity<T> = T;
export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

const Node = makeObject({
  label: ZodString.create().optional(),
  get children() {
    return Node.array();
  }, //.array();
});
const node = Node.parse("asdf");
node.children[0].children[0].children[0].label;

// declare function makeObject<T extends { [k: string]: any }>(
declare function lazyObject<T extends { [k: string]: any }>(
  _shape: () => T,
  _params?: RawCreateParams
): ZodObject<
  // flattenFunctions<T>,
  T,
  "strip",
  ZodTypeAny,
  simpleObjectOutputType<T>,
  simpleObjectInputType<T>
>;

const Node2 = ZodObject.recursive({
  label: ZodString.create().optional(),
  // get children() {
  //   return Node2.array();
  // },
  get children() {
    return Node2.array();
  },
});
type Node2 = TypeOf<typeof Node2>;
const node2 = Node2.parse("asdf");
node2.children[0].children[0].children[0].label;

type asdf = typeof import("../tsconfig.json");

export const User = makeObject({
  name: ZodString.create().optional(),
  get posts() {
    return Post.array(); //.array();
  },
});

export const Post = makeObject({
  title: ZodString.create().optional(),
  get author() {
    return User; //.array();
  },
});

type User = TypeOf<typeof User>;
const user = User.parse("adsf");
// const post = Post.parse("adsf");
user.posts[0].author.name;
