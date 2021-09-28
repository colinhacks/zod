import { errorUtil } from "./helpers/errorUtil.ts";
import {
  AsyncParseReturnType,
  getParsedType,
  INVALID,
  isAsync,
  isInvalid,
  isOk,
  makeIssue,
  OK,
  ParseContext,
  ParseParamsNoData,
  ParseReturnType,
  pathFromArray,
  pathToArray,
  SyncParseReturnType,
  ZodParsedType,
} from "./helpers/parseUtil.ts";
import { partialUtil } from "./helpers/partialUtil.ts";
import { util } from "./helpers/util.ts";
import {
  IssueData,
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
export type { TypeOf as infer };

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
export interface ZodTypeDef {
  errorMap?: ZodErrorMap;
}

// function customErrorMap(arg: string | ZodErrorMap | undefined) {
//   if (typeof arg === "string") {
//     const map: ZodErrorMap = (iss, ctx) => {
//       if (iss.code === ZodIssueCode.invalid_type) {
//         return { message: arg };
//       }
//       return { message: ctx.defaultError };
//     };
//   }
// }

const createRootContext = (params: Partial<ParseParamsNoData>): ParseContext =>
  new ParseContext({
    path: pathFromArray(params.path || []),
    issues: [],
    errorMap: params.errorMap,
    async: params.async ?? false,
    parent: null,
    invalid: false,
  });

const handleResult = <Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> } => {
  if (isOk(result) && !ctx.issues.length) {
    return { success: true, data: result.value };
  } else {
    const error = new ZodError(ctx.issues);
    return { success: false, error };
  }
  // if (isOk(result)) {
  //   return { success: true, data: result.value };
  // } else {
  //   const error = new ZodError(ctx.issues);
  //   return { success: false, error };
  // }
};

type RawCreateParams =
  | {
      errorMap?: ZodErrorMap;
      invalid_type_error?: string;
      required_error?: string;
    }
  | undefined;
type ProcessedCreateParams = { errorMap?: ZodErrorMap };
function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
  if (!params) return {};
  if (params.errorMap && (params.invalid_type_error || params.required_error)) {
    throw new Error(
      `Can't use "invalid" or "required" in conjunction with custom error map.`
    );
  }
  if (params.errorMap) return { errorMap: params.errorMap };
  const customMap: ZodErrorMap = (iss, ctx) => {
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined" && params.required_error)
      return { message: params.required_error };
    if (params.invalid_type_error)
      return { message: params.invalid_type_error };
    return { message: ctx.defaultError };
  };
  return { errorMap: customMap };
}

export abstract class ZodType<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  abstract _parse(
    _ctx: ParseContext,
    _data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<Output>;

  _addIssue(ctx: ParseContext, issueData: IssueData, params: { data: any }) {
    ctx.addIssue(params.data, issueData, {
      schemaErrorMap: this._def.errorMap,
    });
  }

  _parseSync(
    _ctx: ParseContext,
    _data: any,
    _parsedType: ZodParsedType
  ): SyncParseReturnType<Output> {
    const result = this._parse(_ctx, _data, _parsedType);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }

  _parseAsync(
    _ctx: ParseContext,
    _data: any,
    _parsedType: ZodParsedType
  ): AsyncParseReturnType<Output> {
    const result = this._parse(_ctx, _data, _parsedType);
    // if (isAsync(result)) {
    //   return result;
    // }

    return Promise.resolve(result);
  }

  parse(data: unknown, params?: Partial<ParseParamsNoData>): Output {
    const result = this.safeParse(data, params);
    if (result.success) return result.data;
    throw result.error;
  }

  safeParse(
    data: unknown,
    params?: Partial<ParseParamsNoData>
  ):
    | { success: true; data: Output }
    | { success: false; error: ZodError<Input> } {
    const ctx = createRootContext({ ...params, async: false });
    const result = this._parseSync(ctx, data, getParsedType(data));
    return handleResult(ctx, result);
  }

  async parseAsync(
    data: unknown,
    params?: Partial<ParseParamsNoData>
  ): Promise<Output> {
    const result = await this.safeParseAsync(data, params);
    if (result.success) return result.data;
    throw result.error;
  }

  async safeParseAsync(
    data: unknown,
    params?: Partial<ParseParamsNoData>
  ): Promise<
    { success: true; data: Output } | { success: false; error: ZodError }
  > {
    const ctx = createRootContext({ ...params, async: true });
    const maybeAsyncResult = this._parse(ctx, data, getParsedType(data));
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

  refine<Func extends (arg: Output) => any>(
    check: Func,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this> {
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
      if (result instanceof Promise) {
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

  refinement(
    check: (arg: Output) => any,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this> {
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
  ): ZodEffects<this> {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement },
    }) as any;
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
    // if (this instanceof ZodOptional) {
    //   return new ZodOptional({
    //     ...this._def,
    //     defaultValue: defaultValueFunc,
    //   }) as any;
    // }
    return new ZodDefault({
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
    }) as any;
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
  | { kind: "regex"; regex: RegExp; message?: string };

export interface ZodStringDef extends ZodTypeDef {
  checks: ZodStringCheck[];
  typeName: ZodFirstPartyTypeKind.ZodString;
}

const cuidRegex = /^c[^\s-]{8,}$/i;
const uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
// eslint-disable-next-line
const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export class ZodString extends ZodType<string, ZodStringDef> {
  _parse(
    ctx: ParseContext,
    data: string,
    parsedType: ZodParsedType
  ): ParseReturnType<string> {
    if (parsedType !== ZodParsedType.string) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: parsedType,
        },
        { data }
      );
      return INVALID;
    }
    const invalid = false;

    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (data.length < check.value) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "max") {
        if (data.length > check.value) {
          // invalid = true;

          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              message: check.message,
              // ...errorUtil.errToObj(this._def.maxLength.message),
            },
            { data }
          );
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(data)) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(data)) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(data)) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "url") {
        try {
          new URL(data);
        } catch {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "regex") {
        if (!check.regex.test(data)) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            },
            { data }
          );
        }
      }
    }

    return invalid ? INVALID : OK(data);
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
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
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

export interface ZodNumberDef extends ZodTypeDef {
  checks: ZodNumberCheck[];
  typeName: ZodFirstPartyTypeKind.ZodNumber;
}

export class ZodNumber extends ZodType<number, ZodNumberDef> {
  _parse(
    ctx: ParseContext,
    data: number,
    parsedType: ZodParsedType
  ): ParseReturnType<number> {
    if (parsedType !== ZodParsedType.number) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    const invalid = false;

    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(data)) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "min") {
        // const MIN = check.value;
        const tooSmall = check.inclusive
          ? data < check.value
          : data <= check.value;
        if (tooSmall) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? data > check.value
          : data >= check.value;
        if (tooBig) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message,
            },
            { data }
          );
        }
      } else if (check.kind === "multipleOf") {
        if (data % check.value !== 0) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message,
            },
            { data }
          );
        }
      } else {
        util.assertNever(check);
      }
    }

    return invalid ? INVALID : OK(data);
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
  _parse(
    ctx: ParseContext,
    data: bigint,
    parsedType: ZodParsedType
  ): ParseReturnType<bigint> {
    if (parsedType !== ZodParsedType.bigint) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: boolean,
    parsedType: ZodParsedType
  ): ParseReturnType<boolean> {
    if (parsedType !== ZodParsedType.boolean) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: Date,
    parsedType: ZodParsedType
  ): ParseReturnType<Date> {
    if (parsedType !== ZodParsedType.date) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    if (isNaN(data.getTime())) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_date,
        },
        { data }
      );

      return INVALID;
    }

    return OK(new Date((data as Date).getTime()));
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
  _parse(
    ctx: ParseContext,
    data: undefined,
    parsedType: ZodParsedType
  ): ParseReturnType<undefined> {
    if (parsedType !== ZodParsedType.undefined) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: null,
    parsedType: ZodParsedType
  ): ParseReturnType<null> {
    if (parsedType !== ZodParsedType.null) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    return OK(data);
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
  _parse(
    _ctx: ParseContext,
    data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<any> {
    return OK(data);
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
  _parse(
    _ctx: ParseContext,
    data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<unknown> {
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<never> {
    this._addIssue(
      ctx,
      {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: parsedType,
      },
      { data }
    );
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<void> {
    if (parsedType !== ZodParsedType.undefined) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    _data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<arrayOutputType<T, Cardinality>> {
    // return parseArray(ctx, data, parsedType, this._def) as any;
    const def = this._def;

    if (parsedType !== ZodParsedType.array) {
      ctx.addIssue(_data, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: parsedType,
      });

      return INVALID;
    }

    const data: any[] = _data;

    let invalid = false;
    if (def.minLength !== null) {
      if (data.length < def.minLength.value) {
        // invalid = true;
        this._addIssue(
          ctx,
          {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            message: def.minLength.message,
          },
          { data }
        );
      }
    }

    if (def.maxLength !== null) {
      if (data.length > def.maxLength.value) {
        // invalid = true;
        this._addIssue(
          ctx,
          {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            message: def.maxLength.message,
          },
          { data }
        );
      }
    }

    const tasks: Promise<any>[] = [];
    const result: any = new Array(data.length);
    const type = def.type;
    const handleParsed = (
      index: number,
      parsedItem: ParseReturnType<T>
    ): void => {
      if (isOk(parsedItem)) {
        result[index] = parsedItem.value;
      } else if (isInvalid(parsedItem)) {
        invalid = true;
      } else {
        tasks.push(parsedItem.then((parsed) => handleParsed(index, parsed)));
      }
    };

    data.forEach((item, index) => {
      handleParsed(
        index,
        type._parse(ctx.stepInto(index), item, getParsedType(item))
      );
    });

    if (ctx.async) {
      return Promise.all(tasks).then(() => (invalid ? INVALID : OK(result)));
    } else {
      return invalid ? INVALID : OK(result);
    }
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
    return this.min(1, message) as any; // new ZodArray({ ...this._def, cardinality:"atleastone" });
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
  } &
    V;

  type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];

  type requiredKeys<T extends object> = Exclude<keyof T, optionalKeys<T>>;

  export type addQuestionMarks<T extends object> = {
    [k in optionalKeys<T>]?: T[k];
  } &
    { [k in requiredKeys<T>]: T[k] };

  export type identity<T> = T;
  export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;

  export type noNeverKeys<T extends ZodRawShape> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type noNever<T extends ZodRawShape> = identity<
    {
      [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }
  >;

  export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(
    first: U,
    second: T
  ): T & U => {
    return {
      ...first,
      ...second, // second overwrites first
    };
  };

  export const intersectShapes = <U extends ZodRawShape, T extends ZodRawShape>(
    first: U,
    second: T
  ): T & U => {
    const firstKeys = util.objectKeys(first);
    const secondKeys = util.objectKeys(second);
    const sharedKeys = firstKeys.filter((k) => secondKeys.indexOf(k) !== -1);

    const sharedShape: any = {};
    for (const k of sharedKeys) {
      sharedShape[k] = ZodIntersection.create(first[k], second[k]);
    }
    return {
      ...(first as object),
      ...(second as object),
      ...sharedShape,
    };
  };
}
export const mergeObjects = <First extends AnyZodObject>(first: First) => <
  Second extends AnyZodObject
>(
  second: Second
): ZodObject<
  First["_shape"] & Second["_shape"],
  First["_unknownKeys"],
  First["_catchall"]
> => {
  const mergedShape = objectUtil.mergeShapes(
    first._def.shape(),
    second._def.shape()
  );
  const merged: any = new ZodObject({
    // effects: [...(first._def.effects || []), ...(second._def.effects || [])],
    unknownKeys: first._def.unknownKeys,
    catchall: first._def.catchall,
    shape: () => mergedShape,
    typeName: ZodFirstPartyTypeKind.ZodObject,
  }) as any;
  return merged;
};

export type extendShape<A, B> = {
  [k in Exclude<keyof A, keyof B>]: A[k];
} &
  { [k in keyof B]: B[k] };

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <
  Augmentation extends ZodRawShape
>(
  augmentation: Augmentation
): ZodObject<
  extendShape<ReturnType<Def["shape"]>, Augmentation>,
  // {
  //   [k in Exclude<
  //     keyof ReturnType<Def["shape"]>,
  //     keyof Augmentation
  //   >]: ReturnType<Def["shape"]>[k];
  // } &
  //   { [k in keyof Augmentation]: Augmentation[k] },
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

export type baseObjectOutputType<
  Shape extends ZodRawShape
> = objectUtil.flatten<
  objectUtil.addQuestionMarks<
    {
      [k in keyof Shape]: Shape[k]["_output"];
    }
  >
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
  objectUtil.addQuestionMarks<
    {
      [k in keyof Shape]: Shape[k]["_input"];
    }
  >
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

  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<Output> {
    if (parsedType !== ZodParsedType.object) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    const { shape, keys: shapeKeys } = this._getCached();

    let invalid = false;
    const tasks: Promise<any>[] = [];
    const resultObject: Record<string, any> = {};

    const handleParsed = (
      key: string,
      parsedValue: ParseReturnType<any>
    ): void => {
      if (isOk(parsedValue)) {
        const value = parsedValue.value;
        if (typeof value !== "undefined" || key in data) {
          // key was valid but result was undefined: add it to the result object
          // only if key was in the input data object - if it wasn't, then it's
          // an optional key that should not be added
          resultObject[key] = value;
        }
      } else if (isInvalid(parsedValue)) {
        invalid = true;
      } else {
        tasks.push(parsedValue.then((parsed) => handleParsed(key, parsed)));
      }
    };

    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = data[key];
      handleParsed(
        key,
        keyValidator._parse(ctx.stepInto(key), value, getParsedType(value))
      );
    }

    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;

      if (unknownKeys === "passthrough") {
        const dataKeys = util.objectKeys(data);
        const extraKeys = dataKeys.filter((k) => !(k in shape));
        for (const key of extraKeys) {
          resultObject[key] = data[key];
        }
      } else if (unknownKeys === "strict") {
        const dataKeys = util.objectKeys(data);
        const extraKeys = dataKeys.filter((k) => !(k in shape));
        if (extraKeys.length > 0) {
          // invalid = true;
          this._addIssue(
            ctx,
            {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys,
            },
            { data }
          );
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      // run catchall validation
      const catchall = this._def.catchall;
      const dataKeys = util.objectKeys(data);
      const extraKeys = dataKeys.filter((k) => !(k in shape));
      for (const key of extraKeys) {
        const value = data[key];
        handleParsed(
          key,
          catchall._parse(ctx.stepInto(key), value, getParsedType(value))
        );
      }
    }
    if (ctx.async) {
      return Promise.all(tasks).then(() =>
        invalid ? INVALID : OK(resultObject as Output)
      );
    } else {
      return invalid ? INVALID : OK(resultObject as Output);
    }
  }

  get shape() {
    return this._def.shape();
  }

  strict(): ZodObject<T, "strict", Catchall> {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
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
      // effects: [], // wipe all refinements
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
    objectUtil.noNever<
      {
        [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
      }
    >,
    UnknownKeys,
    Catchall
  >;
  partial(mask?: any) {
    const newShape: any = {};
    if (mask) {
      // const newShape: any = {};
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
type ZodUnionOptions = [ZodTypeAny, ...ZodTypeAny[]];
export interface ZodUnionDef<
  T extends ZodUnionOptions = [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
> extends ZodTypeDef {
  options: T;
  typeName: ZodFirstPartyTypeKind.ZodUnion;
}

// export type toOpts<T> = T extends ZodUnionOptions ? T : never;
// export type ZodUnionType<
//   A extends ZodTypeAny,
//   B extends ZodTypeAny
// > = A extends ZodUnion<infer AOpts>
//   ? B extends ZodUnion<infer BOpts>
//     ? ZodUnion<toOpts<[...AOpts, ...BOpts]>>
//     : ZodUnion<toOpts<[...AOpts, B]>>
//   : B extends ZodUnion<infer BOpts>
//   ? ZodUnion<toOpts<[A, ...BOpts]>>
//   : ZodUnion<toOpts<[A, B]>>;

export class ZodUnion<T extends ZodUnionOptions> extends ZodType<
  T[number]["_output"],
  ZodUnionDef<T>,
  T[number]["_input"]
> {
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<T[number]["_output"]> {
    const options = this._def.options;
    const noMatch = (allIssues: ZodIssue[][]) => {
      const unionErrors = allIssues.map((issues) => new ZodError(issues));
      const nonTypeErrors = unionErrors.filter((err) => {
        return err.issues[0].code !== "invalid_type";
      });
      if (nonTypeErrors.length === 1) {
        // TODO encapsulate
        nonTypeErrors[0].issues.forEach((issue) => ctx.issues.push(issue));
      } else {
        this._addIssue(
          ctx,
          {
            code: ZodIssueCode.invalid_union,
            unionErrors,
          },
          { data }
        );
      }
      return INVALID;
    };

    if (ctx.async) {
      const contexts = options.map(() => ctx.clone().clearIssues());
      return Promise.all(
        options.map((option, index) =>
          option._parse(contexts[index], data, parsedType)
        )
      ).then((parsedOptions) => {
        for (const parsedOption of parsedOptions) {
          if (isOk(parsedOption)) {
            return parsedOption;
          }
        }
        return noMatch(contexts.map((ctx) => ctx.issues));
      });
    } else {
      const allIssues: ZodIssue[][] = [];
      for (const option of options) {
        const optionCtx = ctx.clone().clearIssues(); // new ParseContext({ ...ctx.def, issues: [] });
        const parsedOption = option._parseSync(optionCtx, data, parsedType);
        if (isInvalid(parsedOption)) {
          allIssues.push(optionCtx.issues);
        } else {
          return parsedOption;
        }
      }
      return noMatch(allIssues);
    }
  }

  get options() {
    return this._def.options;
  }

  static create = <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<T["_output"] & U["_output"]> {
    const handleParsed = (
      parsedLeft: SyncParseReturnType<T>,
      parsedRight: SyncParseReturnType<U>
    ): SyncParseReturnType<T & U> => {
      if (isInvalid(parsedLeft) || isInvalid(parsedRight)) {
        return INVALID;
      }

      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        this._addIssue(
          ctx,
          {
            code: ZodIssueCode.invalid_intersection_types,
          },
          { data }
        );
        return INVALID;
      }
      return OK(merged.data);
    };

    if (ctx.async) {
      return Promise.all([
        this._def.left._parse(ctx, data, parsedType),
        this._def.right._parse(ctx, data, parsedType),
      ]).then(([left, right]: any) => handleParsed(left, right));
    } else {
      return handleParsed(
        this._def.left._parseSync(ctx, data, parsedType),
        this._def.right._parseSync(ctx, data, parsedType)
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
export type OutputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<
  {
    [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_output"] : never;
  }
>;
export type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...OutputTypeOfTuple<T>, ...Rest["_output"][]]
  : OutputTypeOfTuple<T>;

export type InputTypeOfTuple<T extends ZodTupleItems | []> = AssertArray<
  {
    [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_input"] : never;
  }
>;
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<any> {
    if (parsedType !== ZodParsedType.array) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: parsedType,
        },
        { data }
      );
      return INVALID;
    }

    const rest = this._def.rest;

    if (!rest && data.length > this._def.items.length) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          type: "array",
        },
        { data }
      );
      return INVALID;
    }

    if (data.length < this._def.items.length) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          type: "array",
        },
        { data }
      );
      return INVALID;
    }

    const tasks: Promise<unknown>[] = [];
    const items = this._def.items as ZodType<any, any, any>[];

    const parseResult: any[] = new Array(data.length);
    let invalid = false;

    const handleParsed = (index: number, parsedItem: ParseReturnType<any>) => {
      if (isOk(parsedItem)) {
        parseResult[index] = parsedItem.value;
      } else if (isInvalid(parsedItem)) {
        invalid = true;
      } else {
        tasks.push(parsedItem.then((parsed) => handleParsed(index, parsed)));
      }
    };

    items.forEach((item, index) => {
      handleParsed(
        index,
        item._parse(
          ctx.stepInto(index),
          data[index],
          getParsedType(data[index])
        )
      );
    });

    if (rest) {
      const restData: any[] = data.slice(items.length);
      restData.forEach((dataItem, _index) => {
        const index = _index + items.length;
        handleParsed(
          index,
          rest._parse(ctx.stepInto(index), dataItem, getParsedType(dataItem))
        );
      });
    }

    if (ctx.async) {
      return Promise.all(tasks).then(() =>
        invalid ? INVALID : OK(parseResult)
      );
    } else {
      return invalid ? INVALID : OK(parseResult);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<Record<any, any>> {
    if (parsedType !== ZodParsedType.object) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        },
        { data }
      );
      return INVALID;
    }

    const tasks: Promise<unknown>[] = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const parseResult: Record<string, ParseReturnType<any>> = {};
    let invalid = false;
    const handleParsed = (
      parsedKey: ParseReturnType<any>,
      parsedValue: ParseReturnType<any>
    ): void => {
      if (isOk(parsedKey) && isOk(parsedValue)) {
        parseResult[parsedKey.value] = parsedValue.value;
      } else if (isAsync(parsedKey) || isAsync(parsedValue)) {
        tasks.push(
          Promise.all([parsedKey, parsedValue]).then(([k, v]) =>
            handleParsed(k, v)
          )
        );
      } else {
        invalid = true;
      }
    };

    for (const key in data) {
      handleParsed(
        keyType._parse(ctx.stepInto(key), key, getParsedType(key)),
        valueType._parse(ctx.stepInto(key), data[key], getParsedType(data[key]))
      );
    }

    if (ctx.async) {
      return Promise.all(tasks).then(() =>
        invalid ? INVALID : OK(parseResult)
      );
    } else {
      return invalid ? INVALID : OK(parseResult);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<Map<any, any>> {
    if (parsedType !== ZodParsedType.map) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const dataMap: Map<unknown, unknown> = data;
    const parseResult = new Map();
    const tasks: Promise<unknown>[] = [];
    let invalid = false;
    const handleParsed = (
      parsedKey: ParseReturnType<any>,
      parsedValue: ParseReturnType<any>
    ): void => {
      if (isAsync(parsedKey) || isAsync(parsedValue)) {
        tasks.push(
          Promise.all([parsedKey, parsedValue]).then(([k, v]) =>
            handleParsed(k, v)
          )
        );
      } else if (isInvalid(parsedKey) || isInvalid(parsedValue)) {
        invalid = true;
      } else {
        parseResult.set(parsedKey.value, parsedValue.value);
      }
    };

    [...dataMap.entries()].forEach(([key, value], index) => {
      const entryCtx = ctx.stepInto(index);
      const parsedKey = keyType._parse(
        entryCtx.stepInto("key"),
        key,
        getParsedType(key)
      );
      const parsedValue = valueType._parse(
        entryCtx.stepInto("value"),
        value,
        getParsedType(value)
      );
      handleParsed(parsedKey, parsedValue);
    });

    if (ctx.async) {
      return Promise.all(tasks).then(() =>
        invalid ? INVALID : OK(parseResult)
      );
    } else {
      return invalid ? INVALID : OK(parseResult);
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
}

export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<Set<any>> {
    if (parsedType !== ZodParsedType.set) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    const dataSet: Set<unknown> = data;
    const valueType = this._def.valueType;
    const parsedSet = new Set();
    const tasks: Promise<unknown>[] = [];
    let invalid = false;

    const handleParsed = (parsedItem: ParseReturnType<any>): void => {
      if (isOk(parsedItem)) {
        parsedSet.add(parsedItem.value);
      } else if (isInvalid(parsedItem)) {
        invalid = true;
      } else {
        tasks.push(parsedItem.then((parsed) => handleParsed(parsed)));
      }
    };

    [...dataSet.values()].forEach((item, i) =>
      handleParsed(valueType._parse(ctx.stepInto(i), item, getParsedType(item)))
    );

    if (ctx.async) {
      return Promise.all(tasks).then(() => (invalid ? INVALID : OK(parsedSet)));
    } else {
      return invalid ? INVALID : OK(parsedSet);
    }
  }

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value,
    params?: RawCreateParams
  ): ZodSet<Value> => {
    return new ZodSet({
      valueType,
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<any> {
    if (parsedType !== ZodParsedType.function) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    function makeArgsIssue(args: any, error: ZodError): ZodIssue {
      return makeIssue({
        data: args,
        path: pathToArray(ctx.path),
        errorMaps: [ctx.errorMap],
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error,
        },
      });
    }

    function makeReturnsIssue(returns: any, error: ZodError): ZodIssue {
      return makeIssue({
        data: returns,
        path: pathToArray(ctx.path),
        errorMaps: [ctx.errorMap],
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error,
        },
      });
    }

    const params = { errorMap: ctx.errorMap };
    const fn = data;

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
        const parsedReturns = await this._def.returns
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
      });
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

  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<output<T>> {
    const lazySchema = this._def.getter();
    return lazySchema._parse(ctx, data, parsedType);
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
  _parse(
    ctx: ParseContext,
    data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<T> {
    if (data !== this._def.value) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: this._def.value as any,
          received: data,
        },
        { data }
      );
      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<T[number]> {
    if (this._def.values.indexOf(data) === -1) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_enum_value,
          options: this._def.values,
        },
        { data }
      );
      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: any,
    _parsedType: ZodParsedType
  ): ParseReturnType<T[keyof T]> {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    if (nativeEnumValues.indexOf(data) === -1) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_enum_value,
          options: util.objectValues(nativeEnumValues),
        },
        { data }
      );
      return INVALID;
    }
    return OK(data);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<Promise<T["_output"]>> {
    if (parsedType !== ZodParsedType.promise && ctx.async === false) {
      this._addIssue(
        ctx,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: parsedType,
        },
        { data }
      );

      return INVALID;
    }

    const promisified =
      parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

    return OK(
      promisified.then((data: any) => {
        return this._def.type.parseAsync(data, {
          path: pathToArray(ctx.path),
          errorMap: ctx.errorMap,
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

  _parse(
    ctx: ParseContext,
    initialData: any,
    initialParsedType: ZodParsedType
  ): ParseReturnType<Output> {
    const isSync = ctx.async === false;
    const effect = this._def.effect || null;
    const data = initialData;
    const parsedType: ZodParsedType = initialParsedType;

    if (effect.type === "preprocess") {
      const processed = effect.transform(initialData);

      if (ctx.async) {
        return Promise.resolve(processed).then((val) =>
          this._def.schema._parseAsync(ctx, val, getParsedType(val))
        );
      } else {
        const result = this._def.schema._parseSync(
          ctx,
          processed,
          getParsedType(processed)
        );
        if (result instanceof Promise)
          throw new Error(
            "Asynchronous preprocess step encountered during synchronous parse operation. Use .parseAsync instead."
          );
        return result;
      }
    }

    if (effect.type === "refinement") {
      const invalid = false;

      const executeRefinement = (
        acc: any,
        effect: RefinementEffect<any>
      ): any => {
        const result = effect.refinement(acc, checkCtx);
        if (result instanceof Promise) {
          if (isSync) {
            throw new Error(
              "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
            );
          }
          return result.then(() => acc);
        }
        return acc;
      };

      const _addIssue = (arg: IssueData) => {
        // don't abort early on refinement issues
        // invalid = true;
        this._addIssue(ctx, arg, { data });
      };
      const checkCtx: RefinementCtx = {
        addIssue: _addIssue,
        get path() {
          return pathToArray(ctx.path);
        },
      };

      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

      if (isSync) {
        const base = this._def.schema._parseSync(ctx, data, parsedType);
        if (isInvalid(base)) return INVALID;
        const result = executeRefinement(base.value, effect);
        return invalid ? INVALID : OK(result);
      } else {
        return this._def.schema
          ._parseAsync(ctx, data, parsedType)
          .then((result) => {
            if (isInvalid(result)) return INVALID;
            return executeRefinement(result.value, effect);
          })
          .then((val) => (invalid ? INVALID : OK(val)));
      }
    }

    if (effect.type === "transform") {
      const invalid = false;
      const applyTransform = (acc: any, effect: TransformEffect<any>): any => {
        const transformed = effect.transform(acc);
        if (transformed instanceof Promise && isSync) {
          throw new Error(
            `Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`
          );
        }
        return transformed;
      };
      if (isSync) {
        const base = this._def.schema._parseSync(ctx, data, parsedType);
        if (isInvalid(base)) return INVALID;
        const result = applyTransform(base.value, effect);
        return invalid ? INVALID : OK(result);
      } else {
        return this._def.schema
          ._parseAsync(ctx, data, parsedType)
          .then((base) => {
            if (isInvalid(base)) return INVALID;
            return applyTransform(base.value, effect);
          })
          .then((val) => (invalid ? INVALID : OK(val)));
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<T["_output"] | undefined> {
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(ctx, data, parsedType);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<T["_output"] | null> {
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(ctx, data, parsedType);
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
  _parse(
    ctx: ParseContext,
    data: any,
    parsedType: ZodParsedType
  ): ParseReturnType<util.noUndefined<T["_output"]>> {
    if (parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse(ctx, data, getParsedType(data));
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
  | ZodArray<any>
  | ZodObject<any>
  | ZodUnion<any>
  | ZodIntersection<any, any>
  | ZodTuple
  | ZodRecord
  | ZodMap
  | ZodSet
  | ZodFunction<any, any>
  | ZodLazy<any>
  | ZodLiteral<any>
  | ZodEnum<any>
  | ZodEffects<any>
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
