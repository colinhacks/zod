import { util } from "../helpers/util.ts";
import { ZodTypes } from "../ZodTypes.ts";
import { ParseParams, ZodParser } from "../parser.ts";
import {
  ZodCustomIssue,
  ZodError,
  ZodIssueCode,
  MakeErrorData,
} from "../ZodError.ts";

import {
  ZodArray,
  ZodNullable,
  ZodNullableType,
  ZodOptional,
  ZodOptionalType,
  ZodTransformer,
} from "../index.ts";
// import { outputSchema } from "../output-schema";

type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
type InternalCheck<T> = {
  type: "check";
  check: (arg: T, ctx: RefinementCtx) => any;
  // refinementError: (arg: T) => MakeErrorData;
};

type Mod<T> = {
  type: "mod";
  mod: (arg: T) => any;
  // refinementError: (arg: T) => MakeErrorData;
};

type Effect<T> = InternalCheck<T> | Mod<T>;

// type Check<T> = {
//   check: (arg: T) => any;
//   path?: (string | number)[];
//   // message?: string;
//   // params?: {[k:string]:any}
// } & util.Omit<CustomError, 'code' | 'path'>;

// type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
// type Check<T> = {
//   check: (arg: T) => any;
//   refinementError: (arg: T) => CustomErrorParams;
// };
// export function declareZodType() {}

export interface ZodTypeDef {
  t: ZodTypes;
  effects?: Effect<any>[];
  // mods?: Mod<any>[];
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

  // get inputSchema(): ZodTypeAny = this;
  // outputSchema: ZodTypeAny = this;
  //  = ()=>{
  //   return this;
  // }
  //  outputSchema = () => {
  //    return this;
  //  };

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

  // is(u: Input): u is Input {
  //   try {
  //     this.parse(u as any);
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // }

  // check(u: unknown): u is Input {
  //   try {
  //     this.parse(u as any);
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // }
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
  or = this.optional;
  nullable: () => ZodNullableType<this> = () => {
    return ZodNullable.create(this) as any;
  };
  array: () => ZodArray<this> = () => ZodArray.create(this);

  // transform<
  //   This extends this,
  //   U extends ZodType<any>,
  //   Tx extends (arg: This["_output"]) => U["_input"] | Promise<U["_input"]>
  // >(input: U, transformer: Tx): ZodTransformer<This, U>;
  // transform<
  //   This extends this,
  //   Tx extends (
  //     arg: This["_output"]
  //   ) => This["_input"] | Promise<This["_input"]>
  // >(transformer: Tx): ZodTransformer<This, This>;
  // transform(input: any, transformer?: any) {
  //   if (transformer) {
  //     return ZodTransformer.create(this as any, input, transformer) as any;
  //   }
  //   return ZodTransformer.create(this as any, outputSchema(this), input) as any;
  // }

  // default<
  //   T extends Input = Input,
  //   Opt extends ReturnType<this["optional"]> = ReturnType<this["optional"]>
  // >(def: T): ZodTransformer<Opt, this>;
  // default<
  //   T extends (arg: this) => Input,
  //   Opt extends ReturnType<this["optional"]> = ReturnType<this["optional"]>
  // >(def: T): ZodTransformer<Opt, this>;
  // default(def: any) {
  //   return ZodTransformer.create(this.optional(), this, (x: any) => {
  //     return x === undefined
  //       ? typeof def === "function"
  //         ? def(this)
  //         : def
  //       : x;
  //   }) as any;
  // }

  // transform<This extends this, Out, U extends ZodType<any>>(
  //   input: U,
  //   transformer: (arg: Output) => Out | Promise<Out>
  // ): This extends ZodTransformer<infer T, any>
  //   ? ZodTransformer<T, Out>
  //   : ZodTransformer<This, Out>;
  // transform<Out, This extends this>(
  //   transformer: (arg: Output) => Out | Promise<Out>
  // ): This extends ZodTransformer<infer T, any>
  //   ? ZodTransformer<T, Out>
  //   : ZodTransformer<This, Out>;
  transform: <Out, This extends this>(
    transformer: (arg: Output) => Out | Promise<Out>
  ) => This extends ZodTransformer<infer T, any>
    ? ZodTransformer<T, Out>
    : ZodTransformer<This, Out> = (mod) => {
    // if(typeof first === "function")
    // const mod = typeof first === "function" ? first : second;
    // const newSchema = this.transform(txFunc);
    // if (!second) return newSchema;
    // if (typeof mod !== "function")
    //   throw new Error("Must provide a function to the .transform() method");

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

  //   if (!second) {
  //     return returnType;
  //   } else {
  //     return returnType.refine(
  //       (val: any) => {
  //         return first.parse(val);
  //       },
  //       { message: "Parsing error!" }
  //     );
  //   }
  // };

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
  // default<
  //   T extends (arg: this) => Input,
  //   Opt extends ReturnType<this["optional"]> = ReturnType<this["optional"]>
  // >(def: T): ZodTransformer<Opt, this>;
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
