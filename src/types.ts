import { errorUtil } from "./helpers/errorUtil";
import {
  getParsedType,
  issueHelpers,
  ParseContext,
  ParseParams,
  ParseParamsNoData,
  ParseParamsWithOptionals,
  ZodParsedType,
  ZodParserReturnType,
} from "./helpers/parseUtil";
import { partialUtil } from "./helpers/partialUtil";
import { INVALID, util } from "./helpers/util";
import { NOSET, PseudoPromise } from "./PseudoPromise";
import {
  MakeErrorData,
  overrideErrorMap,
  StringValidation,
  ZodCustomIssue,
  ZodError,
  ZodIssueCode,
} from "./ZodError";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RefinementCtx = {
  addIssue: (arg: MakeErrorData) => void;
  path: (string | number)[];
};
export type ZodRawShape = { [k: string]: ZodTypeAny };
export type ZodTypeAny = ZodType<any, any, any>;
export type TypeOf<T extends ZodType<any>> = T["_output"];
export type input<T extends ZodType<any>> = T["_input"];
export type output<T extends ZodType<any>> = T["_output"];
export type { TypeOf as infer };

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
export interface ZodTypeDef {}

type ParseReturnType<T> = T | INVALID | PseudoPromise<T | INVALID>;
type ZodEffectsType<T extends ZodTypeAny> = T extends ZodEffects<
  infer Inner,
  infer Out
>
  ? ZodEffects<Inner, Out>
  : ZodEffects<T, T["_output"]>;
export abstract class ZodType<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  abstract _parse(_ctx: ParseContext): any;

  _parseInternal(params: ParseParams): ZodParserReturnType<Output> {
    const data = params.data;
    let PROMISE: PseudoPromise<any>;
    const ERROR = new ZodError([]);
    const { makeIssue, addIssue } = issueHelpers(ERROR, { ...params });

    const parsedType = getParsedType(data);
    try {
      const parsedValue = this._parse({
        ...params,
        currentError: ERROR,
        makeIssue,
        addIssue,
        parsedType,
      });

      PROMISE =
        parsedValue instanceof PseudoPromise
          ? parsedValue
          : PseudoPromise.resolve(parsedValue);
    } catch (err) {
      // default to invalid
      PROMISE = PseudoPromise.resolve(INVALID);
    }

    const isSync = params.async === false || this instanceof ZodPromise;

    const THROW_ERROR_IF_PRESENT = (key: string) => (data: any) => {
      key;
      if (!ERROR.isEmpty) throw ERROR;
      return data;
    };

    PROMISE = PROMISE.then(THROW_ERROR_IF_PRESENT("post effects"))
      .then((data) => {
        return { success: true, data };
      })
      .catch((error) => {
        params.parentError.addIssues(ERROR.issues);
        if (error instanceof ZodError) return { success: false, error: error };
        throw error;
      });

    return isSync ? PROMISE.getValueSync() : PROMISE.getValueAsync();
  }

  _parseInternalOptionalParams: (
    params: ParseParamsWithOptionals
  ) => ZodParserReturnType<Output> = (params) => {
    // if(!params.data) throw

    const fullParams: ParseParams = {
      data: params.data,
      path: params.path || [],
      parentError: params.parentError || new ZodError([]),
      errorMap: params.errorMap || overrideErrorMap,
      async: params.async ?? false,
    };

    return this._parseInternal(fullParams);
  };

  parse: (data: unknown, params?: Partial<ParseParamsNoData>) => Output = (
    data,
    params
  ) => {
    const result = this._parseInternalOptionalParams({ data, ...params });
    if (result instanceof Promise)
      throw new Error(
        "You can't use .parse() on a schema containing async elements. Use .parseAsync instead."
      );
    if (result.success) return result.data;
    throw result.error;
  };

  safeParse: (
    data: unknown,
    params?: Partial<ParseParamsNoData>
  ) =>
    | { success: true; data: Output }
    | { success: false; error: ZodError<Input> } = (data, params) => {
    const result = this._parseInternalOptionalParams({ data, ...params });
    if (result instanceof Promise)
      throw new Error(
        "You can't use .safeParse() on a schema containing async elements. Use .parseAsync instead."
      );
    return result;
  };

  parseAsync: (
    x: unknown,
    params?: Partial<ParseParamsNoData>
  ) => Promise<Output> = async (data, params) => {
    const result = await this._parseInternalOptionalParams({
      data,
      ...params,
      async: true,
    });
    if (result.success) return result.data;
    throw result.error;
  };

  safeParseAsync: (
    x: unknown,
    params?: Partial<ParseParamsNoData>
  ) => Promise<
    { success: true; data: Output } | { success: false; error: ZodError }
  > = async (data, params) => {
    return await this._parseInternalOptionalParams({
      data,
      ...params,
      async: true,
    });
  };

  /** Alias of safeParseAsync */
  spa = this.safeParseAsync;

  _parseWithInvalidFallback: (
    data: unknown,
    params: ParseParamsNoData
  ) => Promise<Output | INVALID> | Output | INVALID = (data, params) => {
    const result = this._parseInternal({ ...params, data });
    // const parser = ZodParser(this);
    // const result = parser({ ...params, data });
    if (result instanceof Promise) {
      return result.then((result) => {
        if (result.success) return result.data;
        return INVALID;
      });
    }
    if (result.success) return result.data;
    return INVALID;
  };

  /** The .is method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
  is: never;

  /** The .check method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
  check: never;

  refine: <Func extends (arg: Output) => any, This extends this = this>(
    check: Func,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ) => ZodEffectsType<This> = (check, message = "Invalid value.") => {
    if (typeof message === "string") {
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () =>
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message,
          });
        if (result instanceof Promise) {
          return result.then((data) => {
            if (!data) setError();
          });
        }
        if (!result) {
          setError();
          return result;
        }
      });
    }
    if (typeof message === "function") {
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () =>
          ctx.addIssue({
            code: ZodIssueCode.custom,
            ...message(val),
          });
        if (result instanceof Promise) {
          return result.then((data) => {
            if (!data) setError();
          });
        }
        if (!result) {
          setError();
          return result;
        }
      });
    }
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () =>
        ctx.addIssue({
          code: ZodIssueCode.custom,
          ...message,
        });
      if (result instanceof Promise) {
        return result.then((data) => {
          if (!data) setError();
        });
      }

      if (!result) {
        setError();
        return result;
      }
    });
  };

  refinement: <This extends this = this>(
    check: (arg: Output) => any,
    refinementData:
      | MakeErrorData
      | ((arg: Output, ctx: RefinementCtx) => MakeErrorData)
  ) => ZodEffectsType<This> = (check, refinementData) => {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(
          typeof refinementData === "function"
            ? refinementData(val, ctx)
            : refinementData
        );
      }
    });
  };

  // _refinement: (refinement: InternalCheck<Output>["refinement"]) => this = (
  //   refinement
  // ) => {
  //   return new (this as any).constructor({
  //     ...this._def,
  //     effects: [
  //       // ...(this._def.effects || []),
  //       { type: "check", check: refinement },
  //     ],
  //   }) as this;
  // };
  _refinement<This extends this>(
    refinement: InternalCheck<Output>["refinement"]
  ): ZodEffectsType<This> {
    let returnType;
    if (this instanceof ZodEffects) {
      returnType = new ZodEffects({
        ...this._def,
        effects: [
          ...(this._def.effects || []),
          { type: "refinement", refinement },
        ],
      }) as any;
    } else {
      returnType = new ZodEffects({
        schema: this,
        effects: [{ type: "refinement", refinement }],
      }) as any;
    }
    return returnType;
  }
  superRefine = this._refinement;

  constructor(def: Def) {
    this._def = def;
    this.transform = this.transform.bind(this) as any;
    this.default = this.default.bind(this);
  }

  optional: <This extends this = this>() => ZodOptionalType<This> = () =>
    ZodOptional.create(this) as any;
  nullable: <This extends this = this>() => ZodNullableType<This> = () =>
    ZodNullable.create(this) as any;

  array: () => ZodArray<this> = () => ZodArray.create(this);

  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]> {
    return ZodUnion.create([this, option]);
  }

  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T> {
    return ZodIntersection.create(this, incoming);
  }

  transform<NewOut, This extends this>(
    transform: (arg: Output) => NewOut | Promise<NewOut>
  ): This extends ZodEffects<infer T, any>
    ? ZodEffects<T, NewOut>
    : ZodEffects<This, NewOut> {
    let returnType;
    if (this instanceof ZodEffects) {
      returnType = new ZodEffects({
        ...this._def,
        effects: [
          ...(this._def.effects || []),
          { type: "transform", transform },
        ],
      }) as any;
    } else {
      returnType = new ZodEffects({
        schema: this,
        effects: [{ type: "transform", transform }],
      }) as any;
    }
    return returnType;
  }

  default<T extends Input, This extends this = this>(
    def: T
  ): ZodOptional<This, true>;
  default<T extends () => Input, This extends this = this>(
    def: T
  ): ZodOptional<This, true>;
  default(def: any) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    // if (this instanceof ZodOptional) {
    //   return new ZodOptional({
    //     ...this._def,
    //     defaultValue: defaultValueFunc,
    //   }) as any;
    // }
    return new ZodOptional({
      innerType: this,
      defaultValue: defaultValueFunc,
    }) as any;
  }

  isOptional: () => boolean = () => this.safeParse(undefined).success;
  isNullable: () => boolean = () => this.safeParse(null).success;
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodString      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface ZodStringDef extends ZodTypeDef {
  // validation: {
  //   uuid?: true;
  //   custom?: ((val: any) => boolean)[];
  // };
  isEmail: { message?: string } | false;
  isURL: { message?: string } | false;
  isUUID: { message?: string } | false;
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
}

// eslint-disable-next-line
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/;

export class ZodString extends ZodType<string, ZodStringDef> {
  _parse(ctx: ParseContext): ParseReturnType<string> {
    if (ctx.parsedType !== ZodParsedType.string) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType,
      });
      return INVALID;
    }

    if (this._def.isEmail && !emailRegex.test(ctx.data)) {
      ctx.addIssue({
        validation: "email",
        code: ZodIssueCode.invalid_string,
        message: this._def.isEmail.message,
      });
    }

    if (this._def.isURL) {
      try {
        new URL(ctx.data);
      } catch {
        ctx.addIssue({
          validation: "url",
          code: ZodIssueCode.invalid_string,
          message: this._def.isURL.message,
        });
      }
    }

    if (this._def.isUUID && !uuidRegex.test(ctx.data)) {
      ctx.addIssue({
        validation: "uuid",
        code: ZodIssueCode.invalid_string,
        message: this._def.isUUID.message,
      });
    }

    if (this._def.minLength !== null) {
      if (ctx.data.length < this._def.minLength.value) {
        ctx.addIssue({
          code: ZodIssueCode.too_small,
          minimum: this._def.minLength.value,
          type: "string",
          inclusive: true,
          message: this._def.minLength.message,
          // ...errorUtil.errToObj(this._def.minLength.message),
        });
      }
    }

    if (this._def.maxLength !== null) {
      if (ctx.data.length > this._def.maxLength.value) {
        ctx.addIssue({
          code: ZodIssueCode.too_big,
          maximum: this._def.maxLength.value,
          type: "string",
          inclusive: true,
          message: this._def.maxLength.message,
          // ...errorUtil.errToObj(this._def.maxLength.message),
        });
      }
    }

    return ctx.data;
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

  email = (message?: errorUtil.ErrMessage) =>
    new ZodString({
      ...this._def,
      isEmail: errorUtil.errToObj(message),
    });

  url = (message?: errorUtil.ErrMessage) =>
    new ZodString({
      ...this._def,
      isURL: errorUtil.errToObj(message),
    });

  uuid = (message?: errorUtil.ErrMessage) =>
    new ZodString({
      ...this._def,
      isUUID: errorUtil.errToObj(message),
    });

  regex = (regexp: RegExp, message?: errorUtil.ErrMessage) =>
    this._regex(regexp, "regex", message);

  min = (minLength: number, message?: errorUtil.ErrMessage) =>
    new ZodString({
      ...this._def,
      minLength: {
        value: minLength,
        message: errorUtil.errToObj(message).message,
      },
    });

  max = (maxLength: number, message?: errorUtil.ErrMessage) =>
    new ZodString({
      ...this._def,
      maxLength: {
        value: maxLength,
        message: errorUtil.errToObj(message).message,
      },
    });

  length(len: number, message?: errorUtil.ErrMessage) {
    return this.min(len, message).max(len, message);
  }

  nonempty = (message?: errorUtil.ErrMessage) =>
    this.min(1, errorUtil.errToObj(message));

  static create = (): ZodString => {
    return new ZodString({
      isEmail: false,
      isURL: false,
      isUUID: false,
      minLength: null,
      maxLength: null,
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

export interface ZodNumberDef extends ZodTypeDef {
  minimum: null | { value: number; inclusive: boolean; message?: string };
  maximum: null | { value: number; inclusive: boolean; message?: string };
  isInteger: false | { message?: string };
}

export class ZodNumber extends ZodType<number, ZodNumberDef> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.number) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx.parsedType,
      });

      return INVALID;
    }
    if (Number.isNaN(ctx.data)) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ZodParsedType.nan,
      });

      return INVALID;
    }

    if (this._def.minimum) {
      const MIN = this._def.minimum;
      const tooSmall = MIN.inclusive
        ? ctx.data < MIN.value
        : ctx.data <= MIN.value;
      if (tooSmall) {
        ctx.addIssue({
          code: ZodIssueCode.too_small,
          minimum: MIN.value,
          type: "number",
          inclusive: MIN.inclusive,
          message: MIN.message,
        });
      }
    }

    if (this._def.maximum) {
      const MAX = this._def.maximum;
      const tooBig = MAX.inclusive
        ? ctx.data > MAX.value
        : ctx.data >= MAX.value;
      if (tooBig) {
        ctx.addIssue({
          code: ZodIssueCode.too_big,
          maximum: MAX.value,
          type: "number",
          inclusive: MAX.inclusive,
          message: MAX.message,
        });
      }
    }

    if (this._def.isInteger) {
      if (!Number.isInteger(ctx.data)) {
        ctx.addIssue({
          code: ZodIssueCode.invalid_type,
          expected: "integer",
          received: "float",
          message: this._def.isInteger.message,
        });
      }
    }

    return ctx.data as number;
  }

  static create = (): ZodNumber => {
    return new ZodNumber({
      minimum: null,
      maximum: null,
      isInteger: false,
    });
  };

  min = (minimum: number, message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      minimum: {
        value: minimum,
        inclusive: true,
        message: errorUtil.toString(message),
      },
    });

  max = (maximum: number, message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      maximum: {
        value: maximum,
        inclusive: true,
        message: errorUtil.toString(message),
      },
    });

  int = (message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      isInteger: { message: errorUtil.toString(message) },
    });

  positive = (message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      minimum: {
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message),
      },
    });

  negative = (message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      maximum: {
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message),
      },
    });

  nonpositive = (message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      maximum: {
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message),
      },
    });

  nonnegative = (message?: errorUtil.ErrMessage) =>
    new ZodNumber({
      ...this._def,
      minimum: {
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message),
      },
    });
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodBigInt      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export type ZodBigIntDef = ZodTypeDef;

export class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.bigint) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx.parsedType,
      });

      return;
    }
    return ctx.data;
  }

  static create = (): ZodBigInt => {
    return new ZodBigInt({});
  };
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                     ///////////
//////////      ZodBoolean      //////////
//////////                     ///////////
//////////////////////////////////////////
//////////////////////////////////////////
export type ZodBooleanDef = ZodTypeDef;

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.boolean) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType,
      });

      return;
    }
    return ctx.data;
  }

  static create = (): ZodBoolean => {
    return new ZodBoolean({});
  };
}

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////
export type ZodDateDef = ZodTypeDef;

export class ZodDate extends ZodType<Date, ZodDateDef> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.date) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx.parsedType,
      });

      return;
    }
    if (isNaN(ctx.data.getTime())) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_date,
      });

      return;
    }

    return new Date((ctx.data as Date).getTime());
  }

  static create = (): ZodDate => {
    return new ZodDate({});
  };
}

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodUndefined      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export type ZodUndefinedDef = ZodTypeDef;

export class ZodUndefined extends ZodType<undefined> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.undefined) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType,
      });

      return;
    }
    return ctx.data;
  }

  static create = (): ZodUndefined => {
    return new ZodUndefined({});
  };
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodNull      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export type ZodNullDef = ZodTypeDef;

export class ZodNull extends ZodType<null, ZodNullDef> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.null) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType,
      });

      return;
    }
    return ctx.data;
  }
  static create = (): ZodNull => {
    return new ZodNull({});
  };
}

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      ZodAny      //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////
export type ZodAnyDef = ZodTypeDef;

export class ZodAny extends ZodType<any, ZodAnyDef> {
  _parse(ctx: ParseContext): any {
    return ctx.data;
  }
  static create = (): ZodAny => {
    return new ZodAny({});
  };
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodUnknown      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export type ZodUnknownDef = ZodTypeDef;

export class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
  _parse(ctx: ParseContext): any {
    return ctx.data;
  }

  static create = (): ZodUnknown => {
    return new ZodUnknown({});
  };
}

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      ZodNever      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
export type ZodNeverDef = ZodTypeDef;

export class ZodNever extends ZodType<never, ZodNeverDef> {
  _parse(ctx: ParseContext): any {
    ctx.addIssue({
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType,
    });
    return;
  }
  static create = (): ZodNever => {
    return new ZodNever({});
  };
}

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodVoid      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export type ZodVoidDef = ZodTypeDef;

export class ZodVoid extends ZodType<void, ZodVoidDef> {
  _parse(ctx: ParseContext): any {
    if (
      ctx.parsedType !== ZodParsedType.undefined &&
      ctx.parsedType !== ZodParsedType.null
    ) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType,
      });

      return;
    }
    return ctx.data;
  }

  static create = (): ZodVoid => {
    return new ZodVoid({});
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
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
}

const parseArray = (ctx: ParseContext, def: ZodArrayDef<any>) => {
  if (ctx.parsedType !== ZodParsedType.array) {
    ctx.addIssue({
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.array,
      received: ctx.parsedType,
    });

    return false;
  }

  if (def.minLength !== null) {
    if (ctx.data.length < def.minLength.value) {
      ctx.addIssue({
        code: ZodIssueCode.too_small,
        minimum: def.minLength.value,
        type: "array",
        inclusive: true,
        message: def.minLength.message,
      });
    }
  }

  if (def.maxLength !== null) {
    if (ctx.data.length > def.maxLength.value) {
      ctx.addIssue({
        code: ZodIssueCode.too_big,
        maximum: def.maxLength.value,
        type: "array",
        inclusive: true,
        message: def.maxLength.message,
      });
    }
  }

  return true;
};

export class ZodArray<T extends ZodTypeAny> extends ZodType<
  T["_output"][],
  ZodArrayDef<T>,
  T["_input"][]
> {
  _parse(ctx: ParseContext): any {
    const result = parseArray(ctx, this._def);
    if (!result) return;

    return PseudoPromise.all(
      (ctx.data as any[]).map((item, i) => {
        return new PseudoPromise().then(() =>
          this._def.type._parseWithInvalidFallback(item, {
            ...ctx,
            path: [...ctx.path, i],
            parentError: ctx.currentError,
          })
        );
      }) as any
    );
  }

  get element() {
    return this._def.type;
  }

  min = (minLength: number, message?: errorUtil.ErrMessage): this =>
    new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) },
    }) as any;

  max = (maxLength: number, message?: errorUtil.ErrMessage): this =>
    new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) },
    }) as any;

  length = (len: number, message?: errorUtil.ErrMessage): this =>
    this.min(len, message).max(len, message) as any;

  nonempty: () => ZodNonEmptyArray<T> = () => {
    return new ZodNonEmptyArray({ ...this._def });
  };

  static create = <T extends ZodTypeAny>(schema: T): ZodArray<T> => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
    });
  };
}

////////////////////////////////////////////////
////////////////////////////////////////////////
//////////                            //////////
//////////      ZodNonEmptyArray      //////////
//////////                            //////////
////////////////////////////////////////////////
////////////////////////////////////////////////
export interface ZodNonEmptyArrayDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  minLength: { value: number; message?: string } | null;
  maxLength: { value: number; message?: string } | null;
}

export class ZodNonEmptyArray<T extends ZodTypeAny> extends ZodType<
  [T["_output"], ...T["_output"][]],
  ZodNonEmptyArrayDef<T>,
  [T["_input"], ...T["_input"][]]
> {
  _parse(ctx: ParseContext): any {
    // if (ctx.parsedType !== ZodParsedType.array) {
    //   ctx.addIssue({
    //     code: ZodIssueCode.invalid_type,
    //     expected: ZodParsedType.array,
    //     received: ctx.parsedType,
    //   });

    //   return;
    // }

    const result = parseArray(ctx, this._def);
    if (!result) return;

    if (ctx.data.length < 1) {
      ctx.addIssue({
        code: ZodIssueCode.too_small,
        minimum: 1,
        type: "array",
        inclusive: true,
        // message: this._def.minLength.message,
        // ...errorUtil.errToObj(this._def.minLength.message),
      });
    }

    return PseudoPromise.all(
      (ctx.data as any[]).map((item, i) => {
        return new PseudoPromise().then(() =>
          this._def.type._parseWithInvalidFallback(item, {
            ...ctx,
            path: [...ctx.path, i],
            parentError: ctx.currentError,
          })
        );
      }) as any
    );
  }

  min = (minLength: number, message?: errorUtil.ErrMessage) =>
    new ZodNonEmptyArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) },
    });

  max = (maxLength: number, message?: errorUtil.ErrMessage) =>
    new ZodNonEmptyArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) },
    });

  length = (len: number, message?: errorUtil.ErrMessage) =>
    this.min(len, message).max(len, message);

  static create = <T extends ZodTypeAny>(schema: T): ZodNonEmptyArray<T> => {
    return new ZodNonEmptyArray({
      type: schema,
      minLength: null,
      maxLength: null,
    });
  };
}

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
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);
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
  }) as any;
  return merged;
};

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <
  Augmentation extends ZodRawShape
>(
  augmentation: Augmentation
): ZodObject<
  {
    [k in Exclude<
      keyof ReturnType<Def["shape"]>,
      keyof Augmentation
    >]: ReturnType<Def["shape"]>[k];
  } &
    { [k in keyof Augmentation]: Augmentation[k] },
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

type deoptional<T extends ZodTypeAny> = T extends ZodOptional<infer U, any>
  ? deoptional<U>
  : T;

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

  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.object) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType,
      });

      return;
    }

    const objectPromises: { [k: string]: PseudoPromise<any> } = {};

    const shape = this._def.shape();
    const shapeKeys = Object.keys(shape);
    const dataKeys = Object.keys(ctx.data);

    const extraKeys = dataKeys.filter((k) => shapeKeys.indexOf(k) === -1);

    for (const key of shapeKeys) {
      const keyValidator = shapeKeys.includes(key)
        ? shape[key]
        : !(this._def.catchall instanceof ZodNever)
        ? this._def.catchall
        : undefined;

      if (!keyValidator) {
        continue;
      }

      // if value for key is not set
      // and schema is optional
      // don't add the
      // first check is required to avoid non-enumerable keys
      if (typeof ctx.data[key] === "undefined" && !dataKeys.includes(key)) {
        objectPromises[key] = new PseudoPromise()
          .then(() => {
            return keyValidator._parseWithInvalidFallback(undefined, {
              ...ctx,
              path: [...ctx.path, key],
              parentError: ctx.currentError,
            });
          })

          .then((data) => {
            if (data === undefined) {
              // schema is optional
              // data is not defined
              // don't explicity add `key: undefined` to outut
              // this is a feature of PseudoPromises
              return NOSET;
            } else {
              return data;
            }
          });

        continue;
      }

      objectPromises[key] = new PseudoPromise()
        .then(() => {
          return keyValidator._parseWithInvalidFallback(ctx.data[key], {
            ...ctx,
            path: [...ctx.path, key],
            parentError: ctx.currentError,
          });
        })
        .then((data) => {
          return data;
        });
    }

    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;

      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          objectPromises[key] = PseudoPromise.resolve(ctx.data[key]);
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          ctx.addIssue({
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
      for (const key of extraKeys) {
        objectPromises[key] = new PseudoPromise().then(() => {
          const parsedValue = this._def.catchall._parseWithInvalidFallback(
            ctx.data[key],
            {
              ...ctx,
              path: [...ctx.path, key],
              parentError: ctx.currentError,
            }
          );

          return parsedValue;
        });
      }
    }

    return PseudoPromise.object(objectPromises).then((data) => {
      return data;
    });
  }

  get shape() {
    return this._def.shape();
  }

  strict = (): ZodObject<T, "strict", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "strict",
    }) as any;

  strip = (): ZodObject<T, "strip", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "strip",
    }) as any;

  passthrough = (): ZodObject<T, "passthrough", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "passthrough",
    }) as any;

  nonstrict = this.passthrough;

  augment = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);
  extend = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);

  setKey = <Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> => {
    return this.augment({ [key]: schema }) as any;
  };

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <Incoming extends AnyZodObject>(
    merging: Incoming
  ) => ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    const mergedShape = objectUtil.mergeShapes(
      this._def.shape(),
      merging._def.shape()
    );
    const merged: any = new ZodObject({
      // effects: [], // wipe all refinements
      unknownKeys: this._def.unknownKeys,
      catchall: this._def.catchall,
      shape: () => mergedShape,
    }) as any;
    return merged;
  };

  catchall = <Index extends ZodTypeAny>(
    index: Index
  ): ZodObject<T, UnknownKeys, Index> => {
    return new ZodObject({
      ...this._def,
      catchall: index,
    }) as any;
  };

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
    UnknownKeys,
    Catchall
  > => {
    const shape: any = {};
    Object.keys(mask).map((key) => {
      shape[key] = this.shape[key];
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  };

  omit = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
    UnknownKeys,
    Catchall
  > => {
    const shape: any = {};
    Object.keys(this.shape).map((key) => {
      if (Object.keys(mask).indexOf(key) === -1) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    }) as any;
  };

  partial = (): ZodObject<
    { [k in keyof T]: ReturnType<T[k]["optional"]> },
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      newShape[key] = fieldSchema.isOptional()
        ? fieldSchema
        : fieldSchema.optional();
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  deepPartial: () => partialUtil.RootDeepPartial<this> = () => {
    const newShape: any = {};

    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      if (fieldSchema instanceof ZodObject) {
        newShape[key] = fieldSchema.isOptional()
          ? fieldSchema
          : (fieldSchema.deepPartial() as any).optional();
      } else {
        newShape[key] = fieldSchema.isOptional()
          ? fieldSchema
          : fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  required = (): ZodObject<
    { [k in keyof T]: deoptional<T[k]> },
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      let newField = fieldSchema;
      while (newField instanceof ZodOptional) {
        newField = (newField as ZodOptional<any, any>)._def.innerType;
      }

      newShape[key] = newField;
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  static create = <T extends ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
    }) as any;
  };

  static strictCreate = <T extends ZodRawShape>(
    shape: T
  ): ZodObject<T, "strict"> => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
    }) as any;
  };

  static lazycreate = <T extends ZodRawShape>(shape: () => T): ZodObject<T> => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
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
  _parse(ctx: ParseContext): any {
    const unionErrors: ZodError[] = [...Array(this._def.options.length)].map(
      () => new ZodError([])
    );

    return PseudoPromise.all(
      this._def.options.map((opt, _j) => {
        return new PseudoPromise().then(() => {
          return opt._parseWithInvalidFallback(ctx.data, {
            ...ctx,
            parentError: unionErrors[_j],
          });
        });
      }) as any
    )
      .then((unionResults) => {
        const isValid = !!unionErrors.find((err) => err.isEmpty);
        const GUESSING = false;

        if (!isValid) {
          if (!GUESSING) {
            ctx.addIssue({
              code: ZodIssueCode.invalid_union,
              unionErrors,
            });
          } else {
            const nonTypeErrors = unionErrors.filter((err) => {
              return err.issues[0].code !== "invalid_type";
            });
            if (nonTypeErrors.length === 1) {
              ctx.currentError.addIssues(nonTypeErrors[0].issues);
            } else {
              ctx.addIssue({
                code: ZodIssueCode.invalid_union,
                unionErrors,
              });
            }
          }
        }

        return unionResults;
      })
      .then((unionResults: any) => {
        const validIndex = unionErrors.indexOf(
          unionErrors.find((err) => err.isEmpty)!
        );
        return unionResults[validIndex];
      });
  }

  get options() {
    return this._def.options;
  }

  static create = <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
    types: T
  ): ZodUnion<T> => {
    return new ZodUnion({
      options: types,
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
}

export class ZodIntersection<
  T extends ZodTypeAny,
  U extends ZodTypeAny
> extends ZodType<
  T["_output"] & U["_output"],
  ZodIntersectionDef<T, U>,
  T["_input"] & U["_input"]
> {
  _parse(ctx: ParseContext): any {
    return PseudoPromise.all([
      new PseudoPromise().then(() => {
        return this._def.left._parseWithInvalidFallback(ctx.data, {
          ...ctx,
          parentError: ctx.currentError,
        });
      }),
      new PseudoPromise().then(() => {
        return this._def.right._parseWithInvalidFallback(ctx.data, {
          ...ctx,
          parentError: ctx.currentError,
        });
      }),
    ]).then(([parsedLeft, parsedRight]: any) => {
      if (parsedLeft === INVALID || parsedRight === INVALID) return INVALID;

      const parsedLeftType = getParsedType(parsedLeft);
      const parsedRightType = getParsedType(parsedRight);

      if (parsedLeft === parsedRight) {
        return parsedLeft;
      } else if (
        parsedLeftType === ZodParsedType.object &&
        parsedRightType === ZodParsedType.object
      ) {
        return { ...parsedLeft, ...parsedRight };
      } else {
        ctx.addIssue({
          code: ZodIssueCode.invalid_intersection_types,
        });
      }
    });
  }

  static create = <T extends ZodTypeAny, U extends ZodTypeAny>(
    left: T,
    right: U
  ): ZodIntersection<T, U> => {
    return new ZodIntersection({
      left: left,
      right: right,
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
export type OutputTypeOfTuple<T extends [ZodTypeAny, ...ZodTypeAny[]] | []> = {
  [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_output"] : never;
};

export type InputTypeOfTuple<T extends [ZodTypeAny, ...ZodTypeAny[]] | []> = {
  [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_input"] : never;
};

export interface ZodTupleDef<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]]
> extends ZodTypeDef {
  items: T;
}

export class ZodTuple<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]]
> extends ZodType<OutputTypeOfTuple<T>, ZodTupleDef<T>, InputTypeOfTuple<T>> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.array) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType,
      });

      return;
    }

    if (ctx.data.length > this._def.items.length) {
      ctx.addIssue({
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        type: "array",
      });
    } else if (ctx.data.length < this._def.items.length) {
      ctx.addIssue({
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        type: "array",
      });
    }

    const tupleData: any[] = ctx.data;

    return PseudoPromise.all(
      tupleData.map((item, index) => {
        const itemParser = this._def.items[index];
        return new PseudoPromise()
          .then(() => {
            return itemParser._parseWithInvalidFallback(item, {
              ...ctx,
              path: [...ctx.path, index],
              parentError: ctx.currentError,
            });
          })
          .then((tupleItem) => {
            return tupleItem;
          });
      }) as any
    );
  }

  get items() {
    return this._def.items;
  }

  static create = <T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: T
  ): ZodTuple<T> => {
    return new ZodTuple({
      items: schemas,
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
export interface ZodRecordDef<Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  valueType: Value;
}

export class ZodRecord<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Record<string, Value["_output"]>,
  ZodRecordDef<Value>,
  Record<string, Value["_input"]>
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.object) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType,
      });

      return;
    }

    const parsedRecordPromises: { [k: string]: PseudoPromise<any> } = {};
    for (const key in ctx.data) {
      parsedRecordPromises[key] = new PseudoPromise().then(() => {
        return this._def.valueType._parseWithInvalidFallback(ctx.data[key], {
          ...ctx,
          path: [...ctx.path, key],
          parentError: ctx.currentError,
        });
      });
    }
    return PseudoPromise.object(parsedRecordPromises);
  }

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value
  ): ZodRecord<Value> => {
    return new ZodRecord({
      valueType,
    });
  };
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
}

export class ZodMap<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Map<Key["_output"], Value["_output"]>,
  ZodMapDef<Key, Value>,
  Map<Key["_input"], Value["_input"]>
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.map) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType,
      });

      return;
    }

    const dataMap: Map<unknown, unknown> = ctx.data;
    const returnedMap = new Map();

    return PseudoPromise.all(
      [...dataMap.entries()].map(([key, value], index) => {
        return PseudoPromise.all([
          new PseudoPromise().then(() => {
            return this._def.keyType._parseWithInvalidFallback(key, {
              ...ctx,
              path: [...ctx.path, index, "key"],
              parentError: ctx.currentError,
            });
          }),
          new PseudoPromise().then(() => {
            const mapValue = this._def.valueType._parseWithInvalidFallback(
              value,
              {
                ...ctx,
                path: [...ctx.path, index, "value"],
                parentError: ctx.currentError,
              }
            );

            return mapValue;
          }),
        ]).then((item: any) => {
          returnedMap.set(item[0], item[1]);
        });
      }) as any
    ).then(() => {
      return returnedMap;
    });
  }
  static create = <
    Key extends ZodTypeAny = ZodTypeAny,
    Value extends ZodTypeAny = ZodTypeAny
  >(
    keyType: Key,
    valueType: Value
  ): ZodMap<Key, Value> => {
    return new ZodMap({
      valueType,
      keyType,
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
}

export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.set) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType,
      });

      return;
    }

    const dataSet: Set<unknown> = ctx.data;
    const returnedSet = new Set();

    return PseudoPromise.all(
      [...dataSet.values()].map((item, i) => {
        return new PseudoPromise()
          .then(() =>
            this._def.valueType._parseWithInvalidFallback(item, {
              ...ctx,
              path: [...ctx.path, i],
              parentError: ctx.currentError,
            })
          )
          .then((item) => {
            returnedSet.add(item);
          });
      }) as any
    ).then(() => {
      return returnedSet;
    });
  }

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value
  ): ZodSet<Value> => {
    return new ZodSet({
      valueType,
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
  Args extends ZodTuple<any> = ZodTuple<any>,
  Returns extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  args: Args;
  returns: Returns;
}

export type OuterTypeOfFunction<
  Args extends ZodTuple<any>,
  Returns extends ZodTypeAny
> = Args["_input"] extends Array<any>
  ? (...args: Args["_input"]) => Returns["_output"]
  : never;

export type InnerTypeOfFunction<
  Args extends ZodTuple<any>,
  Returns extends ZodTypeAny
> = Args["_output"] extends Array<any>
  ? (...args: Args["_output"]) => Returns["_input"]
  : never;

export class ZodFunction<
  Args extends ZodTuple<any>,
  Returns extends ZodTypeAny
> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.function) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType,
      });

      return;
    }

    const isAsyncFunction = this._def.returns instanceof ZodPromise;

    const validatedFunction = (...args: any[]) => {
      const argsError = new ZodError([]);
      const returnsError = new ZodError([]);
      const internalProm = new PseudoPromise()
        .then(() => {
          return this._def.args._parseWithInvalidFallback(args as any, {
            ...ctx,
            parentError: argsError,
            async: isAsyncFunction,
          });
        })
        .then((args) => {
          if (!argsError.isEmpty) {
            const newError = new ZodError([]);
            const issue = ctx.makeIssue({
              code: ZodIssueCode.invalid_arguments,
              argumentsError: argsError,
            });
            newError.addIssue(issue);
            throw newError;
          }

          return args;
        })
        .then((args) => {
          return ctx.data(...(args as any));
        })
        .then((result) => {
          return this._def.returns._parseWithInvalidFallback(result, {
            ...ctx,
            parentError: returnsError,
            async: isAsyncFunction,
          });
        })
        .then((result) => {
          if (!returnsError.isEmpty) {
            const newError = new ZodError([]);
            const issue = ctx.makeIssue({
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: returnsError,
            });
            newError.addIssue(issue);
            throw newError;
          }
          return result;
        });

      if (isAsyncFunction) {
        return internalProm.getValueAsync();
      } else {
        return internalProm.getValueSync();
      }
    };
    return validatedFunction;
  }

  parameters() {
    return this._def.args;
  }

  returnType() {
    return this._def.returns;
  }

  args = <Items extends Parameters<typeof ZodTuple["create"]>[0]>(
    ...items: Items
  ): ZodFunction<ZodTuple<Items>, Returns> => {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items),
    });
  };

  returns = <NewReturnType extends ZodType<any, any>>(
    returnType: NewReturnType
  ): ZodFunction<Args, NewReturnType> => {
    return new ZodFunction({
      ...this._def,
      returns: returnType,
    });
  };

  implement = <F extends InnerTypeOfFunction<Args, Returns>>(func: F): F => {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  };

  strictImplement = (
    func: InnerTypeOfFunction<Args, Returns>
  ): InnerTypeOfFunction<Args, Returns> => {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  };

  validate = this.implement;

  static create = <
    T extends ZodTuple<any> = ZodTuple<[]>,
    U extends ZodTypeAny = ZodUnknown
  >(
    args?: T,
    returns?: U
  ): ZodFunction<T, U> => {
    return new ZodFunction({
      args: args || ZodTuple.create([]),
      returns: returns || ZodUnknown.create(),
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
}

export class ZodLazy<T extends ZodTypeAny> extends ZodType<
  output<T>,
  ZodLazyDef<T>,
  input<T>
> {
  get schema(): T {
    return this._def.getter();
  }

  _parse(ctx: ParseContext): any {
    const lazySchema = this._def.getter();
    return PseudoPromise.resolve(
      lazySchema._parseWithInvalidFallback(ctx.data, {
        ...ctx,
        parentError: ctx.currentError,
      })
    );
  }

  static create = <T extends ZodTypeAny>(getter: () => T): ZodLazy<T> => {
    return new ZodLazy({
      getter: getter,
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
}

export class ZodLiteral<T extends any> extends ZodType<T, ZodLiteralDef<T>> {
  _parse(ctx: ParseContext): any {
    if (ctx.data !== this._def.value) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: this._def.value as any,
        received: ctx.data,
      });
      return;
    }
    return ctx.data;
  }

  static create = <T extends Primitive>(value: T): ZodLiteral<T> => {
    return new ZodLiteral({
      value: value,
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
}

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>
> {
  _parse(ctx: ParseContext): any {
    if (this._def.values.indexOf(ctx.data) === -1) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_enum_value,
        options: this._def.values,
      });
      return;
    }
    return ctx.data;
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

  static create = <U extends string, T extends [U, ...U[]]>(
    values: T
  ): ZodEnum<T> => {
    return new ZodEnum({
      values: values,
    }) as any;
  };
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
}

type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>
> {
  _parse(ctx: ParseContext): any {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    if (nativeEnumValues.indexOf(ctx.data) === -1) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_enum_value,
        options: util.objectValues(nativeEnumValues),
      });
      return;
    }
    return ctx.data;
  }
  static create = <T extends EnumLike>(values: T): ZodNativeEnum<T> => {
    return new ZodNativeEnum({
      values: values,
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
}

export class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T["_output"]>,
  ZodPromiseDef<T>,
  Promise<T["_input"]>
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.promise && ctx.async === false) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType,
      });

      return;
    }

    const promisified =
      ctx.parsedType === ZodParsedType.promise
        ? ctx.data
        : Promise.resolve(ctx.data);
    const promiseError = new ZodError([]);
    return PseudoPromise.resolve(
      promisified
        .then((data: any) => {
          const value = this._def.type._parseWithInvalidFallback(data, {
            ...ctx,
            parentError: promiseError,
          });
          return value;
        })
        .then((data: any) => {
          if (!promiseError.isEmpty) {
            throw promiseError;
          }
          return data;
        })
    );
  }

  static create = <T extends ZodTypeAny>(schema: T): ZodPromise<T> => {
    return new ZodPromise({
      type: schema,
    });
  };
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodEffects      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////
export type InternalCheck<T> = {
  type: "refinement";
  refinement: (arg: T, ctx: RefinementCtx) => any;
};
export type Mod<T> = {
  type: "transform";
  transform: (arg: T) => any;
};
export type Effect<T> = InternalCheck<T> | Mod<T>;

export interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  schema: T;
  effects?: Effect<any>[];
}

export class ZodEffects<
  T extends ZodTypeAny,
  Output = T["_type"]
> extends ZodType<Output, ZodEffectsDef<T>, T["_input"]> {
  _parse(ctx: ParseContext): any {
    const isSync = ctx.async === false || this instanceof ZodPromise;
    const effects = this._def.effects || [];
    const checkCtx: RefinementCtx = {
      addIssue: (arg: MakeErrorData) => {
        ctx.addIssue(arg);
      },
      path: ctx.path,
    };

    // let refinementError: Error | null = null;

    const THROW_ERROR_IF_PRESENT = (key: string) => (data: any) => {
      key;
      if (!ctx.currentError.isEmpty) throw ctx.currentError;
      // if (ctx.data === INVALID) throw ctx.currentError;
      // if (refinementError !== null) throw refinementError;
      return data;
    };

    let finalPromise = new PseudoPromise()
      .then(() => {
        return this._def.schema._parseWithInvalidFallback(ctx.data, {
          ...ctx,
          parentError: ctx.currentError,
        });
      })
      .then(THROW_ERROR_IF_PRESENT("pre-refinement"));

    for (const effect of effects) {
      if (effect.type === "refinement") {
        finalPromise = finalPromise
          .all((data) => {
            return [
              PseudoPromise.resolve(data),
              PseudoPromise.resolve(data).then(() => {
                const result = effect.refinement(data, checkCtx);
                // try {
                //   result = effect.refinement(data, checkCtx);
                // } catch (err) {
                //   throw err;
                //   // if (refinementError === null) refinementError = err;
                // }

                if (isSync && result instanceof Promise)
                  throw new Error(
                    "You can't use .parse() on a schema containing async refinements. Use .parseAsync instead."
                  );
                return result;
              }),
            ];
          })
          .then(([data, _]) => {
            return data;
          });
      } else if (effect.type === "transform") {
        finalPromise = finalPromise
          .then(THROW_ERROR_IF_PRESENT("before transform"))
          .then((data) => {
            if (!(this instanceof ZodEffects))
              throw new Error(
                "Only transformers can contain transformation functions."
              );
            const newData = effect.transform(data);

            return newData;
          })
          .then((data) => {
            if (isSync && data instanceof Promise) {
              throw new Error(
                `You can't use .parse() on a schema containing async transformations. Use .parseAsync instead.`
              );
            }
            return data;
          });
      } else {
        throw new Error(`Invalid effect type.`);
      }
    }

    return finalPromise;
  }

  constructor(def: ZodEffectsDef<T>) {
    super(def);
    if (def.schema instanceof ZodEffects) {
      throw new Error("ZodEffectss cannot be nested.");
    }
  }

  static create = <I extends ZodTypeAny>(
    schema: I
  ): ZodEffects<I, I["_output"]> => {
    const newTx = new ZodEffects({
      schema,
    });

    return newTx;
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
  defaultValue: undefined | (() => T["_input"]);
}

export type addDefaultToOptional<
  T extends ZodOptional<any, any>
> = T extends ZodOptional<infer U, any> ? ZodOptional<U, true> : never;

export type removeDefaultFromOptional<
  T extends ZodOptional<any, any>
> = T extends ZodOptional<infer U, any> ? ZodOptional<U, false> : never;

export type ZodOptionalType<T extends ZodTypeAny> = T extends ZodOptional<
  infer U,
  infer H
>
  ? ZodOptional<U, H>
  : ZodOptional<T, false>; // no default by default

export class ZodOptional<
  T extends ZodTypeAny,
  HasDefault extends boolean = false
> extends ZodType<
  HasDefault extends true ? T["_output"] : T["_output"] | undefined,
  ZodOptionalDef<T>,
  T["_input"] | undefined
> {
  _parse(ctx: ParseContext): any {
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      if (this._def.defaultValue !== undefined) {
        data = this._def.defaultValue();
      } else {
        return undefined;
      }
    }

    return new PseudoPromise().then(() => {
      return this._def.innerType._parseWithInvalidFallback(data, {
        ...ctx,
        parentError: ctx.currentError,
      });
    });
  }

  unwrap() {
    return this._def.innerType;
  }

  removeDefault(): ZodOptional<T, false> {
    return new ZodOptional({
      ...this._def,
      defaultValue: undefined,
    });
  }

  static create = <T extends ZodTypeAny>(type: T): ZodOptionalType<T> => {
    if (type instanceof ZodOptional) return type as any;
    return new ZodOptional({
      innerType: type,
      defaultValue: undefined,
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
}

// This type allows for nullable flattening
export type ZodNullableType<T extends ZodTypeAny> = T extends ZodNullable<
  infer U
>
  ? ZodNullable<U>
  : ZodNullable<T>;

export class ZodNullable<T extends ZodTypeAny> extends ZodType<
  T["_output"] | null,
  ZodNullableDef<T>,
  T["_input"] | null
> {
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType === ZodParsedType.null) {
      return null;
    }

    return new PseudoPromise().then(() => {
      return this._def.innerType._parseWithInvalidFallback(ctx.data, {
        ...ctx,
        parentError: ctx.currentError,
      });
    });
  }

  unwrap() {
    return this._def.innerType;
  }

  static create = <T extends ZodTypeAny>(type: T): ZodNullableType<T> => {
    // An nullable nullable is the original nullable
    if (type instanceof ZodNullable) return type as any;
    return new ZodNullable({
      innerType: type,
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
  | ZodOptional<any, any>
  | ZodNullable<any>
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
