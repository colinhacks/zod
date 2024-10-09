import * as core from "zod-core";
import * as checks from "zod-core";
import type * as err from "zod-core/error";

export type CustomErrorParams = Omit<err.$ZodIssueBase, "code">;
export interface ParseContext extends core.ParseContext {}

interface RefinementCtx {
  addIssue(issue: err.$ZodIssueData, schema?: { error?: err.$ZodErrorMap<never> | undefined }): void;
}

/////////////////////////////////////////
////////////     ZodType     ////////////
/////////////////////////////////////////
export interface ZodTypeDef extends core.$ZodTypeDef {}
export interface ZodType<Output = unknown, Input = unknown, Def extends ZodTypeDef = ZodTypeDef>
  extends core.$ZodType<Output, Input, Def> {
  // parse methods
  parse(data: unknown, params?: Partial<ParseContext>): Output;
  safeParse(data: unknown, params?: Partial<ParseContext>): core.SafeParseReturnType<Input, Output>;
  parseAsync(data: unknown, params?: Partial<ParseContext>): Promise<Output>;
  safeParseAsync(data: unknown, params?: Partial<ParseContext>): Promise<core.SafeParseReturnType<Input, Output>>;
  spa: (data: unknown, params?: Partial<ParseContext>) => Promise<core.SafeParseReturnType<Input, Output>>;

  // schema methods
  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, Input>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  refinement<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    refinementData: core.IssueData | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  ): ZodEffects<this, RefinedOutput, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  refinement(
    check: (arg: Output) => boolean,
    refinementData: core.IssueData | ((arg: Output, ctx: RefinementCtx) => core.IssueData)
  ): ZodEffects<this, Output, Input>;
  _refinement(refinement: RefinementEffect<Output>["refinement"]): ZodEffects<this, Output, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine<RefinedOutput extends Output>(
    refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  ): ZodEffects<this, RefinedOutput, Input>;
  /**
   * @deprecated Use `.check()` instead.
   */
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void | Promise<void>): ZodEffects<this, Output, Input>;
  optional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  array(): ZodArray<this>;
  promise(): ZodPromise<this>;
  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]>;
  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>): ZodEffects<this, NewOut>;
  default(def: core.noUndefined<Input>): ZodDefault<this>;
  default(def: () => core.noUndefined<Input>): ZodDefault<this>;
  // brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
  catch(def: Output): ZodCatch<this>;
  describe(description: string): this;
  pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
  isOptional(): boolean;
  isNullable(): boolean;
}

export const ZodType: core.$constructor<ZodType, ZodTypeDef> = core.$constructor("ZodType", (inst, def) => {
  inst.parse = (data, params) => {
    const result = inst._parse(data, params);
    if (result instanceof Promise) {
      throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
    }
    if (core.succeeded(result)) return result;
    throw result;
  };
  inst.safeParse = (data, params) => {
    const result = inst._parse(data, params);
    if (result instanceof Promise)
      throw new Error("Encountered Promise during synchronous .parse(). Use .parseAsync() instead.");
    return core.succeeded(result) ? { success: true, data: result } : { success: false, error: result };
  };
  inst.parseAsync = async (data, params) => {
    let result = inst._parse(data, params);
    if (result instanceof Promise) result = await result;
    if (core.succeeded(result)) return result;
    throw result;
  };
  inst.safeParseAsync = async (data, params) => {
    let result = inst._parse(data, params);
    if (result instanceof Promise) result = await result;
    return core.succeeded(result) ? { success: true, data: result } : { success: false, error: result };
  };
  // inst.refine =
  return inst;
});

/** @deprecated Use z.ZodType (without generics) instead. */
type ZodTypeAny = ZodType;

///////////////////////////////////////////
////////////     ZodString     ////////////
///////////////////////////////////////////

export interface ZodStringDef extends core.$ZodStringDef {}
export interface ZodString extends core.$ZodString, ZodType<string, string, ZodStringDef> {
  email(message?: core.ErrMessage): ZodString;
  url(message?: core.ErrMessage): ZodString;
  jwt(options?: string | { alg?: core.JWTAlgorithm; message?: string }): ZodString;
  emoji(message?: core.ErrMessage): ZodString;
  uuid(message?: core.ErrMessage): ZodString;
  nanoid(message?: core.ErrMessage): ZodString;
  guid(message?: core.ErrMessage): ZodString;
  cuid(message?: core.ErrMessage): ZodString;
  cuid2(message?: core.ErrMessage): ZodString;
  ulid(message?: core.ErrMessage): ZodString;
  base64(message?: core.ErrMessage): ZodString;
  xid(message?: core.ErrMessage): ZodString;
  ksuid(message?: core.ErrMessage): ZodString;
  ip(options?: string | { version?: "v4" | "v6"; message?: string }): ZodString;
  e164(message?: core.ErrMessage): ZodString;
  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): ZodString;
  date(message?: string): ZodString;
  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): ZodString;
  duration(message?: core.ErrMessage): ZodString;
  regex(regex: RegExp, message?: core.ErrMessage): ZodString;
  includes(value: string, options?: { message?: string; position?: number }): ZodString;
  startsWith(value: string, message?: core.ErrMessage): ZodString;
  endsWith(value: string, message?: core.ErrMessage): ZodString;
  json(message?: core.ErrMessage): this;
  json<T extends ZodTypeAny>(pipeTo: T): ZodPipeline<ZodEffects<this, any, core.input<this>>, T>;
  min(minLength: number, message?: core.ErrMessage): ZodString;
  max(maxLength: number, message?: core.ErrMessage): ZodString;
  length(len: number, message?: core.ErrMessage): ZodString;
  nonempty(message?: core.ErrMessage): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;

  get minLength(): number | null;
  get maxLength(): number | null;
}
export const ZodString: core.$constructor<ZodString, ZodStringDef> = core.$constructor("ZodString", (inst, def) => {
  core.$ZodString.init(inst, def);
  inst.email = (message) => inst.refinement(checks);
});
