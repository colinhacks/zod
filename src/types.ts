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
  defaultErrorMap,
  MakeErrorData,
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

export type TypeOf<T extends ZodType<any>> = T["_output"];

export type input<T extends ZodType<any>> = T["_input"];
export type output<T extends ZodType<any>> = T["_output"];
export type { TypeOf as infer };

export type ZodTypeAny = ZodType<any, any, any>;

type InternalCheck<T> = {
  type: "check";
  check: (arg: T, ctx: RefinementCtx) => any;
};
type Mod<T> = {
  type: "mod";
  mod: (arg: T) => any;
};
type Effect<T> = InternalCheck<T> | Mod<T>;
type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;

export interface ZodTypeDef {
  // t: ZodTypes;
  effects?: Effect<any>[];
  accepts?: ZodType<any, any>;
}

type ParseReturnType<T> = T | INVALID | PseudoPromise<T | INVALID>;
export abstract class ZodType<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  readonly _def!: Def;

  // _parseInternal

  // _parse: (data: unknown, params: ParseParams) => PseudoPromise<Output> = (
  //   data,
  //   params
  // ) => {
  //   const def = this._def;

  //   let PROMISE: PseudoPromise<any> = PseudoPromise.resolve(INVALID);
  //   (PROMISE as any)._default = true;

  //   params.seen = params.seen || [];

  //   const ERROR = params.error;
  //   const parsedType = getParsedType(data);
  //   const promise = this;
  //   return PROMISE;
  // };
  abstract _parse(
    // data: unknown,
    _ctx: ParseContext
  ): any;

  abstract isScalar(params?: { root: boolean }): boolean;
  //  {
  //   // const def = this._def;
  //   // let PROMISE: PseudoPromise<any> = PseudoPromise.resolve(INVALID);
  //   // (PROMISE as any)._default = true;
  //   // const error = ctx.error;
  //   // ctx.
  //   // const parsedType = getParsedType(ctx.data);
  //   // const promise = this._parse(data, params);

  //   return PseudoPromise.resolve(INVALID);
  // }

  _parseInternal(params: ParseParams): ZodParserReturnType<Output> {
    const data = params.data;
    const ERROR = new ZodError([]);
    const { makeIssue, addIssue } = issueHelpers(ERROR, { ...params });

    // const def: ZodTypeDef = this._def as any;
    let PROMISE: PseudoPromise<any>;
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
    } catch {
      // default to invalid
      PROMISE = PseudoPromise.resolve(INVALID);
    }

    // params.seen = params.seen || [];

    const isSync = params.async === false || this instanceof ZodPromise;

    const effects = this._def.effects || [];
    const checkCtx: RefinementCtx = {
      addIssue: (arg: MakeErrorData) => {
        addIssue(arg);
      },
      path: params.path,
    };

    const THROW_ERROR_IF_PRESENT = (key: string) => (data: any) => {
      key;
      if (!ERROR.isEmpty) throw ERROR;
      return data;
    };

    let finalPromise = PROMISE.then(THROW_ERROR_IF_PRESENT("initial check"));

    for (const effect of effects) {
      if (effect.type === "check") {
        finalPromise = finalPromise
          .all((data) => {
            return [
              PseudoPromise.resolve(data),
              PseudoPromise.resolve(data).then(() => {
                const result = effect.check(data, checkCtx);

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
      } else if (effect.type === "mod") {
        finalPromise = finalPromise
          .then(THROW_ERROR_IF_PRESENT("before mod"))
          .then((data) => {
            if (!(this instanceof ZodTransformer))
              throw new Error(
                "Only transformers can contain transformation functions."
              );
            const newData = effect.mod(data);

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

    finalPromise = finalPromise
      .then(THROW_ERROR_IF_PRESENT("post effects"))
      .then((data) => {
        return { success: true, data };
      })
      .catch((error) => {
        params.parentError.addIssues(ERROR.issues);
        if (error instanceof ZodError) return { success: false, error: error };
        throw error;
      });

    return isSync ? finalPromise.getValueSync() : finalPromise.getValueAsync();
  }

  // _parseInternal: (params: ParseParams) => ZodParserReturnType<Output> = (
  //   params
  // ) => {
  //   const parser = ZodParser(this);
  //   return parser(params);
  // };

  _parseInternalOptionalParams: (
    params: ParseParamsWithOptionals
  ) => ZodParserReturnType<Output> = (params) => {
    // if(!params.data) throw

    const fullParams: ParseParams = {
      data: params.data,
      path: params.path || [],
      parentError: params.parentError || new ZodError([]),
      errorMap: params.errorMap || defaultErrorMap,
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
  ) => { success: true; data: Output } | { success: false; error: ZodError } = (
    data,
    params
  ) => {
    const result = this._parseInternalOptionalParams({ data, ...params });
    if (result instanceof Promise)
      throw new Error(
        "You can't use .safeParse() on a schema containing async elements. Use .parseAsync instead."
      );
    return result;
    // try {
    //   return this._parseInternalOptionalParams(data, params);
    //   if(result instanceof Promise) return result;
    //   return { success: true, data:  };
    // } catch (err) {
    //   if (err instanceof ZodError) {
    //     return { success: false, error: err };
    //   }
    //   throw err;
    // }
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
    // try {
    //   return await this.parseAsync(data, params);
    //   return { success: true, data: parsed };
    // } catch (err) {
    //   if (err instanceof ZodError) {
    //     return { success: false, error: err };
    //   }
    //   throw err;
    // }
  };

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

  refine = <Func extends (arg: Output) => any>(
    check: Func,
    message:
      | string
      | CustomErrorParams
      | ((arg: Output) => CustomErrorParams) = "Invalid value."
  ) => {
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

  refinement = (
    check: (arg: Output) => any,
    refinementData:
      | MakeErrorData
      | ((arg: Output, ctx: RefinementCtx) => MakeErrorData)
  ) => {
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

  _refinement: (refinement: InternalCheck<Output>["check"]) => this = (
    refinement
  ) => {
    return new (this as any).constructor({
      ...this._def,
      effects: [
        ...(this._def.effects || []),
        { type: "check", check: refinement },
      ],
    }) as this;
  };

  constructor(def: Def) {
    this._def = def;
    // this.is = this.is.bind(this);
    // this.check = this.check.bind(this);
    this.transform = this.transform.bind(this) as any;
    this.default = this.default.bind(this);
  }

  // abstract toJSON: () => object;

  optional: <This extends this = this>() => ZodOptionalType<This> = () =>
    ZodOptional.create(this) as any;
  nullable: <This extends this = this>() => ZodNullableType<This> = () =>
    ZodNullable.create(this) as any;

  array: () => ZodArray<this> = () => ZodArray.create(this);

  // transform<Out, This extends this>(
  //   transformer: (arg: Output) => Out | Promise<Out>
  // ): This extends ZodTransformer<infer T, any>
  //   ? ZodTransformer<T, Out>
  //   : ZodTransformer<This, Out>;

  // transform(mod) {
  //     let returnType;
  //     if (this instanceof ZodTransformer) {
  //       returnType = new (this as any).constructor({
  //         ...this._def,
  //         effects: [...(this._def.effects || []), { type: "mod", mod }],
  //       }) as any;
  //     } else {
  //       returnType = new ZodTransformer({
  //         // ...this._def,
  // t: ZodTypes.transformer,
  //         schema: this,
  //         effects: [{ type: "mod", mod }],
  //       }) as any;
  //     }
  //     return returnType;
  // }
  transform: <Out, This extends this>(
    transformer: (arg: Output) => Out | Promise<Out>
  ) => This extends ZodTransformer<infer T, any>
    ? ZodTransformer<T, Out>
    : ZodTransformer<This, Out> = (mod) => {
    let returnType;
    if (this instanceof ZodTransformer) {
      returnType = new (this as any).constructor({
        ...this._def,
        effects: [...(this._def.effects || []), { type: "mod", mod }],
      }) as any;
    } else {
      returnType = new ZodTransformer({
        // ...this._def,
        // t: ZodTypes.transformer,
        schema: this,
        effects: [{ type: "mod", mod }],
      }) as any;
    }
    return returnType;
  };

  prependMod = <Out>(
    mod: (arg: Output) => Out | Promise<Out>
  ): ZodType<Out, Def, Input> => {
    return new (this as any).constructor({
      ...this._def,
      effects: [{ type: "mod", mod }, ...(this._def.effects || [])],
    }) as any;
  };

  clearEffects = <Out>(): ZodType<Out, Def, Input> => {
    return new (this as any).constructor({
      ...this._def,
      effects: [],
    }) as any;
  };

  setEffects = <Out>(effects: Effect<any>[]): ZodType<Out, Def, Input> => {
    return new (this as any).constructor({
      ...this._def,
      effects,
    }) as any;
  };

  default<
    T extends util.noUndefined<Input>,
    This extends this = this
    // OptThis extends ZodOptionalType<this> = ZodOptionalType<this>
  >(def: T): ZodOptionalType<This, true>; //;ZodTransformer<ZodOptionalType<This>, Output>;
  default<T extends () => Input, This extends this = this>(
    def: T
  ): ZodOptionalType<This, true>; //ZodTransformer<ZodOptionalType<This>, Output>;
  default(def: any) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    if (this instanceof ZodOptional) {
      return new ZodOptional({
        ...this._def,
        defaultValue: defaultValueFunc,
      }) as any;
    }

    return new ZodOptional({
      innerType: this,
      defaultValue: defaultValueFunc,
    });
    // return (this as any).optional().transform((val: any) => {
    //   const defaultVal = typeof def === "function" ? def(this) : def;
    //   return typeof val !== "undefined" ? val : defaultVal;
    // }) as any;
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
  // t: ZodTypes.string;
  validation: {
    uuid?: true;
    custom?: ((val: any) => boolean)[];
  };
}

// eslint-disable-next-line
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;

export class ZodString extends ZodType<string, ZodStringDef> {
  isScalar() {
    return true;
  }

  _parse(ctx: ParseContext): ParseReturnType<string> {
    if (ctx.parsedType !== ZodParsedType.string) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType,
      });
      return INVALID;
    }
    return ctx.data;
  }

  min = (minLength: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data.length >= minLength, {
      code: ZodIssueCode.too_small,
      minimum: minLength,
      type: "string",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  max = (maxLength: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data.length <= maxLength, {
      code: ZodIssueCode.too_big,
      maximum: maxLength,
      type: "string",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  length(len: number, message?: errorUtil.ErrMessage) {
    return this.min(len, message).max(len, message);
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
    this._regex(emailRegex, "email", message);

  url = (message?: errorUtil.ErrMessage) =>
    this.refinement(
      (data) => {
        try {
          new URL(data);
          return true;
        } catch {
          return false;
        }
      },
      {
        code: ZodIssueCode.invalid_string,
        validation: "url",
        ...errorUtil.errToObj(message),
      }
    );

  // url = (message?: errorUtil.ErrMessage) => this._regex(urlRegex, 'url', message);

  uuid = (message?: errorUtil.ErrMessage) =>
    this._regex(uuidRegex, "uuid", message);

  regex = (regexp: RegExp, message?: errorUtil.ErrMessage) =>
    this._regex(regexp, "regex", message);

  nonempty = (message?: errorUtil.ErrMessage) =>
    this.min(1, errorUtil.errToObj(message));

  static create = (): ZodString => {
    return new ZodString({
      // t: ZodTypes.string,
      validation: {},
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

export type ZodNumberDef = ZodTypeDef;

export class ZodNumber extends ZodType<number, ZodNumberDef> {
  isScalar() {
    return true;
  }

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
    return ctx.data as number;
  }

  static create = (): ZodNumber => {
    return new ZodNumber({
      // t: ZodTypes.number,
    });
  };

  min = (minimum: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data >= minimum, {
      code: ZodIssueCode.too_small,
      minimum,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  max = (maximum: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data <= maximum, {
      code: ZodIssueCode.too_big,
      maximum,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  int = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => Number.isInteger(data), {
      code: ZodIssueCode.invalid_type,
      expected: "integer",
      received: "number",
      ...errorUtil.errToObj(message),
    });

  positive = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data > 0, {
      code: ZodIssueCode.too_small,
      minimum: 0,
      type: "number",
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  negative = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data < 0, {
      code: ZodIssueCode.too_big,
      maximum: 0,
      type: "number",
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  nonpositive = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data <= 0, {
      code: ZodIssueCode.too_big,
      maximum: 0,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  nonnegative = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data >= 0, {
      code: ZodIssueCode.too_small,
      minimum: 0,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
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
  isScalar() {
    return true;
  }
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

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
    return new ZodBigInt({
      // t: ZodTypes.bigint,
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
export type ZodBooleanDef = ZodTypeDef;

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  isScalar() {
    return true;
  }

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
    return new ZodBoolean({
      // t: ZodTypes.boolean,
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
export type ZodDateDef = ZodTypeDef;

export class ZodDate extends ZodType<Date, ZodDateDef> {
  isScalar() {
    return true;
  }

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
    return new ZodDate({
      // t: ZodTypes.date,
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
export type ZodUndefinedDef = ZodTypeDef;

export class ZodUndefined extends ZodType<undefined> {
  isScalar() {
    return true;
  }

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
    return new ZodUndefined({
      // t: ZodTypes.undefined,
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
export type ZodNullDef = ZodTypeDef;

export class ZodNull extends ZodType<null, ZodNullDef> {
  isScalar() {
    return true;
  }

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
    return new ZodNull({
      // t: ZodTypes.null,
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
export type ZodAnyDef = ZodTypeDef;

export class ZodAny extends ZodType<any, ZodAnyDef> {
  isScalar() {
    return false;
  }
  _parse(ctx: ParseContext): any {
    return ctx.data;
  }
  static create = (): ZodAny => {
    return new ZodAny({
      // t: ZodTypes.any,
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
export type ZodUnknownDef = ZodTypeDef;

export class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
  isScalar() {
    return false;
  }
  _parse(ctx: ParseContext): any {
    return ctx.data;
  }

  static create = (): ZodUnknown => {
    return new ZodUnknown({
      // t: ZodTypes.unknown,
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
export type ZodNeverDef = ZodTypeDef;

export class ZodNever extends ZodType<never, ZodNeverDef> {
  isScalar() {
    return false;
  }
  _parse(ctx: ParseContext): any {
    ctx.addIssue({
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType,
    });
    return;
  }
  static create = (): ZodNever => {
    return new ZodNever({
      // t: ZodTypes.never,
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
export type ZodVoidDef = ZodTypeDef;

export class ZodVoid extends ZodType<void, ZodVoidDef> {
  isScalar() {
    return false;
  }
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
    return new ZodVoid({
      // t: ZodTypes.void,
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
  // t: ZodTypes.array;
  type: T;
}

export class ZodArray<T extends ZodTypeAny> extends ZodType<
  T["_output"][],
  ZodArrayDef<T>,
  T["_input"][]
> {
  isScalar(params: { root: boolean } = { root: true }) {
    if (params.root === false) return false;
    return this._def.type.isScalar({ root: false });
  }
  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.array) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType,
      });

      return;
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

  get element() {
    return this._def.type;
  }

  min = (minLength: number, message?: string | { message?: string }) =>
    this.refinement((data) => data.length >= minLength, {
      code: ZodIssueCode.too_small,
      type: "array",
      inclusive: true,
      minimum: minLength,
      ...(typeof message === "string" ? { message } : message),
    });

  max = (maxLength: number, message?: string | { message?: string }) =>
    this.refinement((data) => data.length <= maxLength, {
      // check: data => data.length <= maxLength,
      code: ZodIssueCode.too_big,
      type: "array",
      inclusive: true,
      maximum: maxLength,
      ...(typeof message === "string" ? { message } : message),
    });

  length = (len: number, message?: string) =>
    this.min(len, { message }).max(len, { message });

  nonempty: () => ZodNonEmptyArray<T> = () => {
    return new ZodNonEmptyArray({ ...this._def });
  };

  static create = <T extends ZodTypeAny>(schema: T): ZodArray<T> => {
    return new ZodArray({
      // t: ZodTypes.array,
      type: schema,
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
  // t: ZodTypes.array;
  type: T;
}

export class ZodNonEmptyArray<T extends ZodTypeAny> extends ZodType<
  [T["_output"], ...T["_output"][]],
  ZodArrayDef<T>,
  [T["_input"], ...T["_input"][]]
> {
  isScalar(params: { root: boolean } = { root: true }) {
    if (params.root === false) return false;
    return this._def.type.isScalar({ root: false });
  }

  _parse(ctx: ParseContext): any {
    if (ctx.parsedType !== ZodParsedType.array) {
      ctx.addIssue({
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType,
      });

      return;
    }

    if (ctx.data.length === 0) {
      ctx.addIssue({
        code: ZodIssueCode.nonempty_array_is_empty,
      });

      return;
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

  min = (minLength: number, message?: string | { message?: string }) =>
    this.refinement((data) => data.length >= minLength, {
      code: ZodIssueCode.too_small,
      minimum: minLength,
      type: "array",
      inclusive: true,
      ...(typeof message === "string" ? { message } : message),
    });

  max = (maxLength: number, message?: string | { message?: string }) =>
    this.refinement((data) => data.length <= maxLength, {
      // check:
      code: ZodIssueCode.too_big,
      maximum: maxLength,
      type: "array",
      inclusive: true,
      ...(typeof message === "string" ? { message } : message),
    });

  length = (len: number, message?: string) =>
    this.min(len, { message }).max(len, { message });
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

  export type NoNeverKeys<T extends ZodRawShape> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type NoNever<T extends ZodRawShape> = identity<
    {
      [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }
  >;

  export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(
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
    // t: ZodTypes.object,
    effects: [...(first._def.effects || []), ...(second._def.effects || [])],
    unknownKeys: first._def.unknownKeys,
    catchall: first._def.catchall,
    // params: {
    //   strict: first.params.strict && second.params.strict,
    // },
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
  // Params extends ZodObjectParams = ZodObjectParams
> extends ZodTypeDef {
  // t: ZodTypes.object;
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
  // params: Params;
}

export type baseObjectOutputType<
  Shape extends ZodRawShape
  // Catchall extends ZodTypeAny
> = objectUtil.flatten<
  objectUtil.addQuestionMarks<
    {
      [k in keyof Shape]: Shape[k]["_output"];
    }
  > //{ [k: string]: Catchall['_output'] }
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

  isScalar() {
    return false;
  }

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

    return PseudoPromise.object(objectPromises);
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
    other: Incoming
  ) => ZodObject<
    T & Incoming["_shape"],
    UnknownKeys,
    Catchall
    // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
  > = mergeObjects(this as any) as any;

  catchall = <Index extends ZodTypeAny>(
    index: Index
  ): ZodObject<
    T,
    UnknownKeys,
    Index
    // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
  > => {
    return new ZodObject({
      ...this._def,
      // unknownKeys: 'passthrough',
      catchall: index,
    }) as any;
  };

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
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
    objectUtil.NoNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
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

  primitives = (): ZodObject<
    objectUtil.NoNever<
      {
        [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never;
      }
    >,
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      if (this.shape[key].isScalar()) {
        newShape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  nonprimitives = (): ZodObject<
    objectUtil.NoNever<
      {
        [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k];
      }
    >,
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      if (!this.shape[key].isScalar()) {
        newShape[key] = this.shape[key];
      }
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

  // keyof: ()=>ZodEnum<{[k in T]: k}>

  static create = <T extends ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      // t: ZodTypes.object,
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      //  params: {
      //    strict: true,
      //  },
    }) as any;
  };

  static lazycreate = <T extends ZodRawShape>(shape: () => T): ZodObject<T> => {
    return new ZodObject({
      // t: ZodTypes.object,
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
export interface ZodUnionDef<
  T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]] = [
    ZodTypeAny,
    ZodTypeAny,
    ...ZodTypeAny[]
  ]
> extends ZodTypeDef {
  // t: ZodTypes.union;
  options: T;
}

export class ZodUnion<
  T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
> extends ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
  isScalar(params: { root: boolean } = { root: true }) {
    if (params.root === false) return false;
    return this._def.options.every((x) => x.isScalar(params));
  }

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
      // t: ZodTypes.union,
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
  // t: ZodTypes.intersection;
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
  isScalar(params: { root: boolean } = { root: true }) {
    if (params.root === false) return false;
    return this._def.left.isScalar(params) && this._def.right.isScalar(params);
  }

  _parse(ctx: ParseContext): any {
    return PseudoPromise.all([
      new PseudoPromise().then(() => {
        return this._def.left._parseWithInvalidFallback(ctx.data, {
          ...ctx,
          parentError: ctx.currentError,
        });
      }),
      // .catch(HANDLE)
      new PseudoPromise().then(() => {
        return this._def.right._parseWithInvalidFallback(ctx.data, {
          ...ctx,
          parentError: ctx.currentError,
        });
      }),
      // .catch(HANDLE),
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
      // t: ZodTypes.intersection,
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
  // t: ZodTypes.tuple;
  items: T;
}

export class ZodTuple<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]]
> extends ZodType<OutputTypeOfTuple<T>, ZodTupleDef<T>, InputTypeOfTuple<T>> {
  isScalar(params: { root: boolean } = { root: true }) {
    if (params.root === false) return false;
    return this._def.items.every((x) => x.isScalar({ root: false }));
  }
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

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
    schemas: T
  ): ZodTuple<T> => {
    return new ZodTuple({
      // t: ZodTypes.tuple,
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
  // t: ZodTypes.record;
  valueType: Value;
}

export class ZodRecord<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Record<string, Value["_output"]>, // { [k in keyof T]: T[k]['_type'] },
  ZodRecordDef<Value>,
  Record<string, Value["_input"]>
> {
  isScalar() {
    return false;
  }

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
      // .catch(HANDLE);
    }
    return PseudoPromise.object(parsedRecordPromises);
  }

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value
  ): ZodRecord<Value> => {
    return new ZodRecord({
      // t: ZodTypes.record,
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
  // t: ZodTypes.map;
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
  isScalar() {
    return false;
  }

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
      // t: ZodTypes.map,
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
  // t: ZodTypes.set;
  valueType: Value;
}

export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  isScalar() {
    return false;
  }
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
      // t: ZodTypes.set,
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
  // t: ZodTypes.function;
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

// type as df = string extends unknown  ? true : false
export class ZodFunction<
  Args extends ZodTuple<any>,
  Returns extends ZodTypeAny
> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  isScalar() {
    return false;
  }

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

  validate = this.implement;

  static create = <
    T extends ZodTuple<any> = ZodTuple<[]>,
    U extends ZodTypeAny = ZodUnknown
  >(
    args?: T,
    returns?: U
  ): ZodFunction<T, U> => {
    return new ZodFunction({
      // t: ZodTypes.function,
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
  // t: ZodTypes.lazy;
  getter: () => T;
}

export class ZodLazy<T extends ZodTypeAny> extends ZodType<
  output<T>,
  ZodLazyDef<T>,
  input<T>
> {
  isScalar(params: { root: boolean } = { root: true }) {
    return this._def.getter().isScalar(params);
  }

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
      // t: ZodTypes.lazy,
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
  // t: ZodTypes.literal;
  value: T;
}

export class ZodLiteral<T extends any> extends ZodType<T, ZodLiteralDef<T>> {
  isScalar() {
    return true;
  }
  _parse(ctx: ParseContext): any {
    if (ctx.data !== this._def.value) {
      ctx.addIssue({
        // code: ZodIssueCode.invalid_literal_value,
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
      // t: ZodTypes.literal,
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
  // t: ZodTypes.enum;
  values: T;
}

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>
> {
  isScalar() {
    return true;
  }
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
      // t: ZodTypes.enum,
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
  // t: ZodTypes.nativeEnum;
  values: T;
}

type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>
> {
  isScalar() {
    return true;
  }
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
      // t: ZodTypes.nativeEnum,
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
  // t: ZodTypes.promise;
  type: T;
}

export class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T["_output"]>,
  ZodPromiseDef<T>,
  Promise<T["_input"]>
> {
  isScalar() {
    return false;
  }

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
          return this._def.type._parseWithInvalidFallback(data, {
            ...ctx,
            parentError: promiseError,
          });
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
      // t: ZodTypes.promise,
      type: schema,
    });
  };
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodTransformer      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////
export interface ZodTransformerDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  // t: ZodTypes.transformer;
  schema: T;
}

export class ZodTransformer<
  T extends ZodTypeAny,
  Output = T["_type"]
> extends ZodType<Output, ZodTransformerDef<T>, T["_input"]> {
  isScalar(params: { root: boolean } = { root: true }) {
    return this._def.schema.isScalar(params);
  }
  _parse(ctx: ParseContext): any {
    return new PseudoPromise().then(() => {
      return this._def.schema._parseWithInvalidFallback(ctx.data, {
        ...ctx,
        parentError: ctx.currentError,
      });
    });
  }

  constructor(def: ZodTransformerDef<T>) {
    super(def);
    if (def.schema instanceof ZodTransformer) {
      throw new Error("ZodTransformers cannot be nested.");
    }
  }

  /** You can't use the .default method on transformers! */
  // default: (..._args: any[]) => never = (..._args: any[]) => {
  //   throw new Error(
  //     "You can't use the .default method on a ZodTransformer instance."
  //   );
  // };

  static create = <I extends ZodTypeAny>(
    schema: I
  ): ZodTransformer<I, I["_output"]> => {
    const newTx = new ZodTransformer({
      // t: ZodTypes.transformer,
      schema,
    });

    return newTx;
  };

  // mod: <NewOut>(
  //   arg: (curr: Output) => NewOut | Promise<NewOut>
  // ) => ZodTransformer<T, NewOut> = (arg) => {
  //   return this.mod(arg);
  // };
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
  // t: ZodTypes.optional;
  innerType: T;
  defaultValue: undefined | (() => T["_input"]);
}

// This type allows for optional flattening
// type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type ZodOptionalType<
  T extends ZodTypeAny,
  HasDefault extends boolean = false
> = T extends ZodOptional<infer U, any>
  ? ZodOptional<U, HasDefault>
  : ZodOptional<T, HasDefault>;

export class ZodOptional<
  T extends ZodTypeAny,
  HasDefault extends boolean = false
> extends ZodType<
  HasDefault extends true ? T["_output"] : T["_output"] | undefined,
  ZodOptionalDef<T>,
  T["_input"] | undefined
> {
  isScalar(params: { root: boolean } = { root: true }) {
    return this._def.innerType.isScalar(params);
  }
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

  static create = <T extends ZodTypeAny>(type: T): ZodOptionalType<T> => {
    if (type instanceof ZodOptional) return type as any;
    return new ZodOptional({
      // t: ZodTypes.optional,
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
  // t: ZodTypes.nullable;
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
  isScalar(params: { root: boolean } = { root: true }) {
    return this._def.innerType.isScalar(params);
  }
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

  static create = <T extends ZodTypeAny>(type: T): ZodNullableType<T> => {
    // An nullable nullable is the original nullable
    if (type instanceof ZodNullable) return type as any;
    return new ZodNullable({
      // t: ZodTypes.nullable,
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
  | ZodTransformer<any>
  | ZodNativeEnum<any>
  | ZodOptional<any>
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
const transformerType = ZodTransformer.create;
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
  stringType as string,
  transformerType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};
