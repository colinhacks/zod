import { errorUtil } from "./helpers/errorUtil.ts";
import {
  addIssueToContext,
  AsyncParseReturnType,
  getParsedType,
  INVALID,
  isAborted,
  isAsync,
  isDirty,
  isValid,
  makeIssue,
  OK,
  ParseContext,
  ParseInput,
  ParseParams,
  ParseReturnType,
  ParseStatus,
  SyncParseReturnType,
  ZodParsedType,
} from "./helpers/parseUtil.ts";
import { partialUtil } from "./helpers/partialUtil.ts";
import { util } from "./helpers/util.ts";
import {
  defaultErrorMap,
  IssueData,
  overrideErrorMap,
  StringValidation,
  ZodCustomIssue,
  ZodError,
  ZodErrorMap,
  ZodIssue,
  ZodIssueCode,
} from "./ZodError.ts";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RefinementCtx = {
  addIssue: (arg: IssueData) => void;
  path: (string | number)[];
};
export type ZodRawShape = { [k: string]: ZodTypeAny };
export type ZodTypeAny = ZodType<any, any, any>;
export type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
export type input<T extends ZodType<any, any, any>> = T["_input"];
export type output<T extends ZodType<any, any, any>> = T["_output"];
export type TypeOfFlattenedError<
  T extends ZodType<any, any, any>,
  U = string
> = {
  formErrors: U[];
  fieldErrors: {
    [P in keyof TypeOf<T>]?: U[];
  };
};
export type TypeOfFormErrors<T extends ZodType<any, any, any>> =
  TypeOfFlattenedError<T>;
export type {
  TypeOf as infer,
  TypeOfFlattenedError as inferFlattenedErrors,
  TypeOfFormErrors as inferFormErrors,
};

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
export interface ZodTypeDef {
  errorMap?: ZodErrorMap;
  description?: string;
}

const handleResult = <Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> } => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    const error = new ZodError(ctx.issues);
    return { success: false, error };
  }
};

type RawCreateParams =
  | {
      errorMap?: ZodErrorMap;
      invalid_type_error?: string;
      required_error?: string;
      description?: string;
    }
  | undefined;
type ProcessedCreateParams = { errorMap?: ZodErrorMap; description?: string };
function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid" or "required" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: ZodErrorMap = (iss, ctx) => {
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined" && required_error)
      return { message: required_error };
    if (params.invalid_type_error)
      return { message: params.invalid_type_error };
    return { message: ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export type SafeParseSuccess<Output> = { success: true; data: Output };
export type SafeParseError<Input> = { success: false; error: ZodError<Input> };

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Output>
  | SafeParseError<Input>;

export abstract class ZodType<
  Output,
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

  abstract _parse(input: ParseInput): ParseReturnType<Output>;

  _processInputParams(input: ParseInput): {
    status: ParseStatus;
    ctx: ParseContext;
  } {
    return {
      status: new ParseStatus(),
      ctx: {
        ...input.parent,
        data: input.data,
        parsedType: getParsedType(input.data, input.parent.typeCache),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent,
      },
    };
  }

  _parseSync(input: ParseInput): SyncParseReturnType<Output> {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }

  _parseAsync(input: ParseInput): AsyncParseReturnType<Output> {
    const result = this._parse(input);

    return Promise.resolve(result);
  }

  parse(data: unknown, params?: Partial<ParseParams>): Output {
    const result = this.safeParse(data, params);
    if (result.success) return result.data;
    throw result.error;
  }

  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<Input, Output> {
    const ctx: ParseContext = {
      path: params?.path || [],
      issues: [],
      contextualErrorMap: params?.errorMap,
      schemaErrorMap: this._def.errorMap,
      async: params?.async ?? false,
      typeCache: typeof Map !== "undefined" ? new Map() : undefined,
      parent: null,
      data,
      parsedType: getParsedType(data),
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });

    return handleResult(ctx, result);
  }

  async parseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<Output> {
    const result = await this.safeParseAsync(data, params);
    if (result.success) return result.data;
    throw result.error;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<SafeParseReturnType<Input, Output>> {
    const ctx: ParseContext = {
      path: params?.path || [],
      issues: [],
      contextualErrorMap: params?.errorMap,
      schemaErrorMap: this._def.errorMap,
      async: true,
      typeCache: typeof Map !== "undefined" ? new Map() : undefined,
      parent: null,
      data,
      parsedType: getParsedType(data),
    };

    const maybeAsyncResult = this._parse({ data, path: [], parent: ctx });
    const result = await (isAsync(maybeAsyncResult)
      ? maybeAsyncResult
      : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }

  /** Alias of safeParseAsync */
  spa = this.safeParseAsync;

  /** The .is method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
  is!: never;

  /** The .check method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
  check!: never;

  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, RefinedOutput>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  refine(
    check: (arg: Output) => unknown,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input> {
    const getIssueProperties: any = (val: Output) => {
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
  ): ZodEffects<this, RefinedOutput, RefinedOutput>;
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
  superRefine = this._refinement;

  constructor(def: Def) {
    this._def = def;
    this.transform = this.transform.bind(this) as any;
    this.default = this.default.bind(this);
  }

  optional(): ZodOptional<this> {
    return ZodOptional.create(this) as any;
  }
  nullable(): ZodNullable<this> {
    return ZodNullable.create(this) as any;
  }
  nullish(): ZodNullable<ZodOptional<this>> {
    return this.optional().nullable();
  }
  array(): ZodArray<this> {
    return ZodArray.create(this);
  }
  promise(): ZodPromise<this> {
    return ZodPromise.create(this);
  }

  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]> {
    return ZodUnion.create([this, option]) as any;
  }

  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T> {
    return ZodIntersection.create(this, incoming);
  }

  transform<NewOut>(
    transform: (arg: Output) => NewOut | Promise<NewOut>
  ): ZodEffects<this, NewOut> {
    return new ZodEffects({
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
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
    }) as any;
  }

  describe(description: string): this {
    const This = (this as any).constructor;
    return new This({
      ...this._def,
      description,
    });
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
type ZodStringCheck =
  | { kind: "min"; value: number; message?: string }
  | { kind: "max"; value: number; message?: string }
  | { kind: "email"; message?: string }
  | { kind: "url"; message?: string }
  | { kind: "uuid"; message?: string }
  | { kind: "cuid"; message?: string }
  | { kind: "regex"; regex: RegExp; message?: string }
  | { kind: "hex"; message?: string };

export interface ZodStringDef extends ZodTypeDef {
  checks: ZodStringCheck[];
  typeName: ZodFirstPartyTypeKind.ZodString;
}

const cuidRegex = /^c[^\s-]{8,}$/i;
const uuidRegex =
  /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
// eslint-disable-next-line
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const hexRegex = /^#[a-f1-9]{6}$/i;

export class ZodString extends ZodType<string, ZodStringDef> {
  _parse(input: ParseInput): ParseReturnType<string> {
    const { status, ctx } = this._processInputParams(input);

    if (ctx.parsedType !== ZodParsedType.string) {
      addIssueToContext(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx.parsedType,
        }
        //
      );
      return INVALID;
    }

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (ctx.data.length < check.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (ctx.data.length > check.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(ctx.data)) {
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(ctx.data)) {
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(ctx.data)) {
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "hex") {
        if (!hexRegex.test(ctx.data)) {
          addIssueToContext(ctx, {
            validation: "hex",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(ctx.data);
        } catch {
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(ctx.data);
        if (!testResult) {
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message,
          });
          status.dirty();
        }
      }
    }

    return { status: status.value, value: ctx.data };
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

  hex(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "hex", ...errorUtil.errToObj(message) });
  }

  email(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  uuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  cuid(message?: errorUtil.ErrMessage) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  regex(regex: RegExp, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "regex",
      regex: regex,
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
    return this.min(len, message).max(len, message);
  }

  /**
   * Deprecated.
   * Use z.string().min(1) instead.
   */
  nonempty = (message?: errorUtil.ErrMessage) =>
    this.min(1, errorUtil.errToObj(message));

  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }

  get isHex() {
    return !!this._def.checks.find((ch) => ch.kind === "hex");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get minLength() {
    let min: number | null = -Infinity;
    this._def.checks.map((ch) => {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) {
          min = ch.value;
        }
      }
    });
    return min;
  }
  get maxLength() {
    let max: number | null = null;
    this._def.checks.map((ch) => {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) {
          max = ch.value;
        }
      }
    });
    return max;
  }
  static create = (params?: RawCreateParams): ZodString => {
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      ...processCreateParams(params),
    });
  };
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
type ZodNumberCheck =
  | { kind: "min"; value: number; inclusive: boolean; message?: string }
  | { kind: "max"; value: number; inclusive: boolean; message?: string }
  | { kind: "int"; message?: string }
  | { kind: "multipleOf"; value: number; message?: string };

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
}

export class ZodNumber extends ZodType<number, ZodNumberDef> {
  _parse(input: ParseInput): ParseReturnType<number> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.number) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(ctx.data)) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? ctx.data < check.value
          : ctx.data <= check.value;
        if (tooSmall) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? ctx.data > check.value
          : ctx.data >= check.value;
        if (tooBig) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            message: check.message,
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(ctx.data, check.value) !== 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message,
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }

    return { status: status.value, value: ctx.data };
  }

  static create = (params?: RawCreateParams): ZodNumber => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      ...processCreateParams(params),
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
    return !!this._def.checks.find((ch) => ch.kind === "int");
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBigInt      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodBigIntDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodBigInt;
}

export class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
  _parse(input: ParseInput): ParseReturnType<bigint> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.bigint) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return OK(ctx.data);
  }

  static create = (params?: RawCreateParams): ZodBigInt => {
    return new ZodBigInt({
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      ...processCreateParams(params),
    });
  };
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
}

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  _parse(input: ParseInput): ParseReturnType<boolean> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.boolean) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return OK(ctx.data);
  }

  static create = (params?: RawCreateParams): ZodBoolean => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
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
export interface ZodDateDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodDate;
}

export class ZodDate extends ZodType<Date, ZodDateDef> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.date) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    if (isNaN(ctx.data.getTime())) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_date,
      });
      return INVALID;
    }

    return {
      status: status.value,
      value: new Date((ctx.data as Date).getTime()),
    };
  }

  static create = (params?: RawCreateParams): ZodDate => {
    return new ZodDate({
      typeName: ZodFirstPartyTypeKind.ZodDate,
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.undefined) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return OK(ctx.data);
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.null) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return OK(ctx.data);
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
  _any: true = true;
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    return OK(ctx.data);
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
  _unknown: true = true;
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    return OK(ctx.data);
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType,
    });
    return INVALID;
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.undefined) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return OK(ctx.data);
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
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
}

export type ArrayCardinality = "many" | "atleastone";
type arrayOutputType<
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);

    const def = this._def;

    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          message: def.minLength.message,
        });
        status.dirty();
      }
    }

    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          message: def.maxLength.message,
        });
        status.dirty();
      }
    }

    if (ctx.async) {
      return Promise.all(
        (ctx.data as any[]).map((item, i) => {
          return def.type._parseAsync({
            parent: ctx,
            path: [...ctx.path, i],
            data: item,
          });
        })
      ).then((result) => {
        return ParseStatus.mergeArray(status, result);
      });
    }

    const result = (ctx.data as any[]).map((item, i) => {
      return def.type._parseSync({
        parent: ctx,
        path: [...ctx.path, i],
        data: item,
      });
    });

    return ParseStatus.mergeArray(status, result);
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
    return this.min(len, message).max(len, message) as any;
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

export namespace objectUtil {
  export type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
    [k in Exclude<keyof U, keyof V>]: U[k];
  } & V;

  type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];

  type requiredKeys<T extends object> = Exclude<keyof T, optionalKeys<T>>;

  export type addQuestionMarks<T extends object> = {
    [k in optionalKeys<T>]?: T[k];
  } & { [k in requiredKeys<T>]: T[k] };

  export type identity<T> = T;
  export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;

  export type noNeverKeys<T extends ZodRawShape> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type noNever<T extends ZodRawShape> = identity<{
    [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
  }>;

  export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(
    first: U,
    second: T
  ): T & U => {
    return {
      ...first,
      ...second, // second overwrites first
    };
  };
}

export type extendShape<A, B> = {
  [k in Exclude<keyof A, keyof B>]: A[k];
} & { [k in keyof B]: B[k] };

const AugmentFactory =
  <Def extends ZodObjectDef>(def: Def) =>
  <Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ): ZodObject<
    extendShape<ReturnType<Def["shape"]>, Augmentation>,
    Def["unknownKeys"],
    Def["catchall"]
  > => {
    return new ZodObject({
      ...def,
      shape: () => ({
        ...def.shape(),
        ...augmentation,
      }),
    }) as any;
  };

type UnknownKeysParam = "passthrough" | "strict" | "strip";

export type Primitive = string | number | bigint | boolean | null | undefined;
export type Scalars = Primitive | Primitive[];

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

export type baseObjectOutputType<Shape extends ZodRawShape> =
  objectUtil.flatten<
    objectUtil.addQuestionMarks<{
      [k in keyof Shape]: Shape[k]["_output"];
    }>
  >;

export type objectOutputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny
> = ZodTypeAny extends Catchall
  ? baseObjectOutputType<Shape>
  : objectUtil.flatten<
      baseObjectOutputType<Shape> & { [k: string]: Catchall["_output"] }
    >;

export type baseObjectInputType<Shape extends ZodRawShape> = objectUtil.flatten<
  objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
  }>
>;

export type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny
> = ZodTypeAny extends Catchall
  ? baseObjectInputType<Shape>
  : objectUtil.flatten<
      baseObjectInputType<Shape> & { [k: string]: Catchall["_input"] }
    >;

type deoptional<T extends ZodTypeAny> = T extends ZodOptional<infer U>
  ? deoptional<U>
  : T;

export type SomeZodObject = ZodObject<
  ZodRawShape,
  UnknownKeysParam,
  ZodTypeAny,
  any,
  any
>;

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
    return ZodArray.create(deepPartialify(schema.element));
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
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
> extends ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
  readonly _shape!: T;
  readonly _unknownKeys!: UnknownKeys;
  readonly _catchall!: Catchall;
  private _cached: { shape: T; keys: string[] } | null = null;

  _getCached(): { shape: T; keys: string[] } {
    if (this._cached !== null) return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return (this._cached = { shape, keys });
  }

  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    const { shape, keys: shapeKeys } = this._getCached();
    const dataKeys = util.objectKeys(ctx.data);
    const extraKeys = dataKeys.filter((k) => !(k in shape));

    const pairs: {
      key: ParseReturnType<any>;
      value: ParseReturnType<any>;
      alwaysSet?: boolean;
    }[] = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse({
          parent: ctx,
          data: value,
          path: [...ctx.path, key],
        }),
        alwaysSet: key in ctx.data,
      });
    }

    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;

      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] },
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys,
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      // run catchall validation
      const catchall = this._def.catchall;

      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            { parent: ctx, path: [...ctx.path, key], data: value } //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data,
        });
      }
    }

    if (ctx.async) {
      return Promise.resolve()
        .then(async () => {
          const syncPairs: any[] = [];
          for (const pair of pairs) {
            const key = await pair.key;
            syncPairs.push({
              key,
              value: await pair.value,
              alwaysSet: pair.alwaysSet,
            });
          }
          return syncPairs;
        })
        .then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs as any);
    }
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

  augment = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);
  extend = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);

  setKey<Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> {
    return this.augment({ [key]: schema }) as any;
  }

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject>(
    merging: Incoming
  ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  ZodObject<extendShape<T, Incoming["_shape"]>, UnknownKeys, Catchall> {
    const mergedShape = objectUtil.mergeShapes(
      this._def.shape(),
      merging._def.shape()
    );
    const merged: any = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => mergedShape,
      typeName: ZodFirstPartyTypeKind.ZodObject,
    }) as any;
    return merged;
  }

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
  ): ZodObject<
    objectUtil.noNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
    UnknownKeys,
    Catchall
  > {
    const shape: any = {};
    util.objectKeys(mask).map((key) => {
      shape[key] = this.shape[key];
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

  omit<Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
    UnknownKeys,
    Catchall
  > {
    const shape: any = {};
    util.objectKeys(this.shape).map((key) => {
      if (util.objectKeys(mask).indexOf(key) === -1) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  }

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
    if (mask) {
      util.objectKeys(this.shape).map((key) => {
        if (util.objectKeys(mask).indexOf(key) === -1) {
          newShape[key] = this.shape[key];
        } else {
          newShape[key] = this.shape[key].optional();
        }
      });
      return new ZodObject({
        ...this._def,
        shape: () => newShape,
      }) as any;
    } else {
      for (const key in this.shape) {
        const fieldSchema = this.shape[key];
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
  > {
    const newShape: any = {};
    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      let newField = fieldSchema;
      while (newField instanceof ZodOptional) {
        newField = (newField as ZodOptional<any>)._def.innerType;
      }

      newShape[key] = newField;
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  }

  static create = <T extends ZodRawShape>(
    shape: T,
    params?: RawCreateParams
  ): ZodObject<T> => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params),
    }) as any;
  };

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
  ): ZodObject<T> => {
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
type ZodUnionOptions = Readonly<[ZodTypeAny, ...ZodTypeAny[]]>;
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;

    function handleResults(
      results: { ctx: ParseContext; result: SyncParseReturnType<any> }[]
    ) {
      // return first issue-free validation if it exists
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }

      for (const result of results) {
        if (result.result.status === "dirty") {
          // add issues from dirty option

          ctx.issues.push(...result.ctx.issues);
          return result.result;
        }
      }

      // return invalid
      const unionErrors = results.map(
        (result) => new ZodError(result.ctx.issues)
      );
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors,
      });
      return INVALID;
    }

    if (ctx.async) {
      return Promise.all(
        options.map(async (option) => {
          const childCtx: ParseContext = {
            ...ctx,
            issues: [],
            parent: null,
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx,
            }),
            ctx: childCtx,
          };
        })
      ).then(handleResults);
    } else {
      const optionResults = options.map((option) => {
        const childCtx: ParseContext = {
          ...ctx,
          issues: [],
          parent: null,
        };
        return {
          result: option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx,
          }),
          ctx: childCtx,
        };
      });

      return handleResults(optionResults);
    }
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (
      parsedLeft: SyncParseReturnType,
      parsedRight: SyncParseReturnType
    ): SyncParseReturnType<T & U> => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }

      const merged = mergeValues(parsedLeft.value, parsedRight.value);

      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types,
        });
        return INVALID;
      }

      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }

      return { status: status.value, value: merged.data as any };
    };

    if (ctx.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        }),
      ]).then(([left, right]: any) => handleParsed(left, right));
    } else {
      return handleParsed(
        this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        }),
        this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        })
      );
    }
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
export type AssertArray<T extends any> = T extends any[] ? T : never;
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

export class ZodTuple<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]],
  Rest extends ZodTypeAny | null = null
> extends ZodType<
  OutputTypeOfTupleWithRest<T, Rest>,
  ZodTupleDef<T, Rest>,
  InputTypeOfTupleWithRest<T, Rest>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        type: "array",
      });

      return INVALID;
    }

    const rest = this._def.rest;

    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        type: "array",
      });
      status.dirty();
    }

    const items = (ctx.data as any[])
      .map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema) return null as any as SyncParseReturnType<any>;
        return schema._parse({
          data: item,
          path: [...ctx.path, itemIndex],
          parent: ctx,
        });
      })
      .filter((x) => !!x); // filter nulls

    if (ctx.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items as SyncParseReturnType[]);
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

  static create = <T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: T,
    params?: RawCreateParams
  ): ZodTuple<T, null> => {
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

type KeySchema = ZodType<string | number | symbol, any, any>;
export class ZodRecord<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Record<Key["_output"], Value["_output"]>,
  ZodRecordDef<Key, Value>,
  Record<Key["_input"], Value["_input"]>
> {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    const pairs: {
      key: ParseReturnType<any>;
      value: ParseReturnType<any>;
    }[] = [];

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse({
          data: key,
          path: [...ctx.path, key],
          parent: ctx,
        }),
        value: valueType._parse({
          data: ctx.data[key],
          path: [...ctx.path, key],
          parent: ctx,
        }),
      });
    }

    if (ctx.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs as any);
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;

    const pairs = [...(ctx.data as Map<unknown, unknown>).entries()].map(
      ([key, value], index) => {
        return {
          key: keyType._parse({
            data: key,
            path: [...ctx.path, index, "key"],
            parent: ctx,
          }),
          value: valueType._parse({
            data: value,
            path: [...ctx.path, index, "value"],
            parent: ctx,
          }),
        };
      }
    );

    if (ctx.async) {
      const finalMap = new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }

          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map();
      for (const pair of pairs) {
        const key = pair.key as SyncParseReturnType;
        const value = pair.value as SyncParseReturnType;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }

        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    const def = this._def;

    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          message: def.minSize.message,
        });
        status.dirty();
      }
    }

    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          message: def.maxSize.message,
        });
        status.dirty();
      }
    }

    const valueType = this._def.valueType;

    function finalizeSet(elements: SyncParseReturnType<any>[]) {
      const parsedSet = new Set();
      for (const element of elements) {
        if (element.status === "aborted") return INVALID;
        if (element.status === "dirty") status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }

    const elements = [...(ctx.data as Set<unknown>).values()].map((item, i) =>
      valueType._parse({ data: item, path: [...ctx.path, i], parent: ctx })
    );

    if (ctx.async) {
      return Promise.all(elements).then((elements) => finalizeSet(elements));
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
  _parse(input: ParseInput): ParseReturnType<any> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    function makeArgsIssue(args: any, error: ZodError): ZodIssue {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.contextualErrorMap,
          ctx.schemaErrorMap,
          overrideErrorMap,
          defaultErrorMap,
        ].filter((x) => !!x) as ZodErrorMap[],
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error,
        },
      });
    }

    function makeReturnsIssue(returns: any, error: ZodError): ZodIssue {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.contextualErrorMap,
          ctx.schemaErrorMap,
          overrideErrorMap,
          defaultErrorMap,
        ].filter((x) => !!x) as ZodErrorMap[],
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error,
        },
      });
    }

    const params = { errorMap: ctx.contextualErrorMap };
    const fn = ctx.data;

    if (this._def.returns instanceof ZodPromise) {
      return OK(async (...args: any[]) => {
        const error = new ZodError([]);
        const parsedArgs = await this._def.args
          .parseAsync(args, params)
          .catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
        const result = await fn(...(parsedArgs as any));
        const parsedReturns = await (
          this._def.returns as ZodPromise<ZodTypeAny>
        )._def.type
          .parseAsync(result, params)
          .catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
        return parsedReturns;
      });
    } else {
      return OK((...args: any[]) => {
        const parsedArgs = this._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = fn(...(parsedArgs.data as any));
        const parsedReturns = this._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      }) as any;
    }
  }

  parameters() {
    return this._def.args;
  }

  returnType() {
    return this._def.returns;
  }

  args<Items extends Parameters<typeof ZodTuple["create"]>[0]>(
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

  implement<F extends InnerTypeOfFunction<Args, Returns>>(func: F): F {
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

  static create = <
    T extends ZodTuple<any, any> = ZodTuple<[], ZodUnknown>,
    U extends ZodTypeAny = ZodUnknown
  >(
    args?: T,
    returns?: U,
    params?: RawCreateParams
  ): ZodFunction<T, U> => {
    return new ZodFunction({
      args: (args
        ? args.rest(ZodUnknown.create())
        : ZodTuple.create([]).rest(ZodUnknown.create())) as any,
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params),
    }) as any;
  };
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

  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
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
export interface ZodLiteralDef<T extends any = any> extends ZodTypeDef {
  value: T;
  typeName: ZodFirstPartyTypeKind.ZodLiteral;
}

export class ZodLiteral<T extends any> extends ZodType<T, ZodLiteralDef<T>> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.data !== this._def.value) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: getParsedType(this._def.value),
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return { status: status.value, value: ctx.data };
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

type EnumValues = [string, ...string[]];

type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

export interface ZodEnumDef<T extends EnumValues = EnumValues>
  extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodEnum;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

function createZodEnum<U extends string, T extends Readonly<[U, ...U[]]>>(
  values: T
): ZodEnum<Writeable<T>>;
function createZodEnum<U extends string, T extends [U, ...U[]]>(
  values: T
): ZodEnum<T>;
function createZodEnum(values: any) {
  return new ZodEnum({
    values: values as any,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
  }) as any;
}

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (this._def.values.indexOf(ctx.data) === -1) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_enum_value,
        options: this._def.values,
      });
      return INVALID;
    }
    return OK(ctx.data);
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

type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>
> {
  _parse(input: ParseInput): ParseReturnType<T[keyof T]> {
    const { ctx } = this._processInputParams(input);
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    if (nativeEnumValues.indexOf(ctx.data) === -1) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_enum_value,
        options: util.objectValues(nativeEnumValues),
      });
      return INVALID;
    }
    return OK(ctx.data);
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    const promisified =
      ctx.parsedType === ZodParsedType.promise
        ? ctx.data
        : Promise.resolve(ctx.data);

    return OK(
      promisified.then((data: any) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.contextualErrorMap,
        });
      })
    );
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
export type SuperRefinement<T> = (arg: T, ctx: RefinementCtx) => void;

export type RefinementEffect<T> = {
  type: "refinement";
  refinement: (arg: T, ctx: RefinementCtx) => any;
};
export type TransformEffect<T> = {
  type: "transform";
  transform: (arg: T) => any;
};
export type PreprocessEffect<T> = {
  type: "preprocess";
  transform: (arg: T) => any;
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
  Output = T["_output"],
  Input = T["_input"]
> extends ZodType<Output, ZodEffectsDef<T>, Input> {
  innerType() {
    return this._def.schema;
  }

  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input);

    const effect = this._def.effect || null;

    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data);

      if (ctx.async) {
        return Promise.resolve(processed).then((processed) => {
          return this._def.schema._parseAsync({
            data: processed,
            path: ctx.path,
            parent: ctx,
          });
        });
      } else {
        return this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx,
        });
      }
    }

    if (effect.type === "refinement") {
      const checkCtx: RefinementCtx = {
        addIssue: (arg: IssueData) => {
          addIssueToContext(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        },
      };

      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

      const executeRefinement = (
        acc: unknown
        // effect: RefinementEffect<any>
      ): any => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error(
            "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
          );
        }
        return acc;
      };

      if (ctx.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        });
        if (inner.status === "aborted") return INVALID;
        if (inner.status === "dirty") status.dirty();

        // return value is ignored
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema
          ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
          .then((inner) => {
            if (inner.status === "aborted") return INVALID;
            if (inner.status === "dirty") status.dirty();

            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
      }
    }

    if (effect.type === "transform") {
      if (ctx.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        });
        // if (base.status === "aborted") return INVALID;
        // if (base.status === "dirty") {
        //   return { status: "dirty", value: base.value };
        // }
        if (!isValid(base)) return base;

        const result = effect.transform(base.value);
        if (result instanceof Promise) {
          throw new Error(
            `Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`
          );
        }
        return OK(result);
      } else {
        return this._def.schema
          ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
          .then((base) => {
            if (!isValid(base)) return base;
            // if (base.status === "aborted") return INVALID;
            // if (base.status === "dirty") {
            //   return { status: "dirty", value: base.value };
            // }
            return Promise.resolve(effect.transform(base.value)).then(OK);
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
    preprocess: (arg: unknown) => unknown,
    schema: I,
    params?: RawCreateParams
  ): ZodEffects<I, I["_output"]> => {
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse({
      data: ctx.data,
      path: ctx.path,
      parent: ctx,
    });
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse({
      data: ctx.data,
      path: ctx.path,
      parent: ctx,
    });
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
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx,
    });
  }

  removeDefault() {
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

export const custom = <T>(
  check?: (data: unknown) => any,
  params?: Parameters<ZodTypeAny["refine"]>[1]
): ZodType<T> => {
  if (check) return ZodAny.create().refine(check, params);
  return ZodAny.create();
};

export { ZodType as Schema, ZodType as ZodSchema };

export const late = {
  object: ZodObject.lazycreate,
};

export enum ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
  ZodUndefined = "ZodUndefined",
  ZodNull = "ZodNull",
  ZodAny = "ZodAny",
  ZodUnknown = "ZodUnknown",
  ZodNever = "ZodNever",
  ZodVoid = "ZodVoid",
  ZodArray = "ZodArray",
  ZodObject = "ZodObject",
  ZodUnion = "ZodUnion",
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
  ZodPromise = "ZodPromise",
}
export type ZodFirstPartySchemaTypes =
  | ZodString
  | ZodNumber
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
  | ZodObject<any, any, any, any, any>
  | ZodUnion<any>
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
  | ZodPromise<any>;

const instanceOfType = <T extends new (...args: any[]) => any>(
  cls: T,
  params: Parameters<ZodTypeAny["refine"]>[1] = {
    message: `Input not instance of ${cls.name}`,
  }
) => custom<InstanceType<T>>((data) => data instanceof cls, params);

const stringType = ZodString.create;
const numberType = ZodNumber.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
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
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

export {
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  effectsType as effect,
  enumType as enum,
  functionType as function,
  instanceOfType as instanceof,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
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
  preprocessType as preprocess,
  promiseType as promise,
  recordType as record,
  setType as set,
  strictObjectType as strictObject,
  stringType as string,
  effectsType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};
