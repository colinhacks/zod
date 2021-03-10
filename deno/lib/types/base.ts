import { errorUtil } from "../helpers/errorUtil.ts";
import { util } from "../helpers/util.ts";
import {
  ZodArray,
  ZodNullable,
  ZodNullableType,
  ZodOptional,
  ZodOptionalType,
  ZodTransformer,
} from "../index.ts";
import { ParseParams, ZodParser } from "../parser.ts";
import {
  StringValidation,
  MakeErrorData,
  ZodCustomIssue,
  ZodError,
  ZodIssueCode,
} from "../ZodError.ts";
import { ZodTypes } from "../ZodTypes.ts";

type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
type InternalCheck<T> = {
  type: "check";
  check: (arg: T, ctx: RefinementCtx) => any;
};

type Mod<T> = {
  type: "mod";
  mod: (arg: T) => any;
};

type Effect<T> = InternalCheck<T> | Mod<T>;

export interface ZodTypeDef {
  t: ZodTypes;
  effects?: Effect<any>[];
  accepts?: ZodType<any, any>;
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

  parse: (x: unknown, params?: ParseParams) => Output = ZodParser(this);

  safeParse: (
    x: unknown,
    params?: ParseParams
  ) => { success: true; data: Output } | { success: false; error: ZodError } = (
    data,
    params
  ) => {
    try {
      const parsed = this.parse(data, params);
      return { success: true, data: parsed };
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, error: err };
      }
      throw err;
    }
  };

  parseAsync: (x: unknown, params?: ParseParams) => Promise<Output> = async (
    value,
    params
  ) => {
    return await this.parse(value, { ...params, async: true });
  };

  safeParseAsync: (
    x: unknown,
    params?: ParseParams
  ) => Promise<
    { success: true; data: Output } | { success: false; error: ZodError }
  > = async (data, params) => {
    try {
      const parsed = await this.parseAsync(data, params);
      return { success: true, data: parsed };
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, error: err };
      }
      throw err;
    }
  };

  spa = this.safeParseAsync;

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
    this.transform = this.transform.bind(this);
    this.default = this.default.bind(this);
  }

  abstract toJSON: () => object;

  optional: () => ZodOptionalType<this> = () => ZodOptional.create(this);
  nullable: () => ZodNullableType<this> = () => {
    return ZodNullable.create(this) as any;
  };
  array: () => ZodArray<this> = () => ZodArray.create(this);
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
        t: ZodTypes.transformer,
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

  default<T extends Input, This extends this = this>(
    def: T
  ): ZodTransformer<ZodOptional<This>, Input>;
  default<T extends (arg: this) => Input, This extends this = this>(
    def: T
  ): ZodTransformer<ZodOptional<This>, Input>;
  default(def: any) {
    return this.optional().transform((val: any) => {
      const defaultVal = typeof def === "function" ? def(this) : def;
      return typeof val !== "undefined" ? val : defaultVal;
    }) as any;
  }

  isOptional: () => boolean = () => this.safeParse(undefined).success;
  isNullable: () => boolean = () => this.safeParse(null).success;
}

export type RefinementCtx = {
  addIssue: (arg: MakeErrorData) => void;
  path: (string | number)[];
};

export type ZodRawShape = { [k: string]: ZodTypeAny };

export type TypeOf<T extends ZodType<any>> = T["_output"];
export type input<T extends ZodType<any>> = T["_input"];
export type output<T extends ZodType<any>> = T["_output"];
export type infer<T extends ZodType<any>> = T["_output"];

export type ZodTypeAny = ZodType<any, any, any>;

export interface ZodStringDef extends ZodTypeDef {
  t: ZodTypes.string;
  validation: {
    uuid?: true;
    custom?: ((val: any) => boolean)[];
  };
}

// eslint-disable-next-line
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;

export class ZodString extends ZodType<string, ZodStringDef> {
  inputSchema = this;
  outputSchema = this;

  toJSON = () => this._def;
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
      t: ZodTypes.string,
      validation: {},
    });
  };
}
