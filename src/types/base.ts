import { util } from '../helpers/util';
import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import {
  ZodIssueCode,
  ZodArray,
  ZodTransformer,
  ZodError,
  ZodOptional,
  ZodNullable,
  ZodCustomIssue,
} from '../index';

import { ZodOptionalType } from './optional';
import { ZodNullableType } from './nullable';

export enum ZodTypes {
  string = 'string',
  number = 'number',
  bigint = 'bigint',
  boolean = 'boolean',
  date = 'date',
  undefined = 'undefined',
  null = 'null',
  array = 'array',
  object = 'object',
  union = 'union',
  intersection = 'intersection',
  tuple = 'tuple',
  record = 'record',
  map = 'map',
  function = 'function',
  lazy = 'lazy',
  literal = 'literal',
  enum = 'enum',
  nativeEnum = 'nativeEnum',
  promise = 'promise',
  any = 'any',
  unknown = 'unknown',
  never = 'never',
  void = 'void',
  transformer = 'transformer',
  optional = 'optional',
  nullable = 'nullable',
}

export type ZodTypeAny = ZodType<any, any, any>;
export type ZodRawShape = { [k: string]: ZodTypeAny };

export const inputSchema = (schema: ZodType<any>): ZodType<any> => {
  if (schema instanceof ZodTransformer) {
    return inputSchema(schema._def.input);
  } else {
    return schema;
  }
};

export const outputSchema = (schema: ZodType<any>): ZodType<any> => {
  if (schema instanceof ZodTransformer) {
    return inputSchema(schema._def.output);
  } else {
    return schema;
  }
};

export type RefinementCtx = {
  addIssue: (arg: MakeErrorData) => void;
  path: (string | number)[];
};
type InternalCheck<T> = {
  check: (arg: T, ctx: RefinementCtx) => any;
  // refinementError: (arg: T) => MakeErrorData;
};

// type Check<T> = {
//   check: (arg: T) => any;
//   path?: (string | number)[];
//   // message?: string;
//   // params?: {[k:string]:any}
// } & util.Omit<CustomError, 'code' | 'path'>;

type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, 'code'>>;
// type Check<T> = {
//   check: (arg: T) => any;
//   refinementError: (arg: T) => CustomErrorParams;
// };

export interface ZodTypeDef {
  t: ZodTypes;
  checks?: InternalCheck<any>[];
  accepts?: ZodType<any, any>;
}

export type TypeOf<T extends ZodType<any>> = T['_output'];
export type input<T extends ZodType<any>> = T['_input'];
export type output<T extends ZodType<any>> = T['_output'];
export type infer<T extends ZodType<any>> = T['_output'];

export abstract class ZodType<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _def!: Def;
  readonly _input!: Input;

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
    params?: ParseParams,
  ) => { success: true; data: Output } | { success: false; error: ZodError } = (
    data,
    params,
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
    params,
  ) => {
    return await this.parse(value, { ...params, async: true });
  };

  safeParseAsync: (
    x: unknown,
    params?: ParseParams,
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

  is(u: Input): u is Input {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  check(u: unknown): u is Input {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  refine = <Func extends (arg: Output) => any>(
    check: Func,
    message:
      | string
      | CustomErrorParams
      | ((arg: Output) => CustomErrorParams) = 'Invalid value.',
  ) => {
    if (typeof message === 'string') {
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () =>
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message,
          });
        if (result instanceof Promise) {
          return result.then(data => {
            if (!data) setError();
          });
        }
        if (!result) {
          setError();
          return result;
        }
      });
    }
    if (typeof message === 'function') {
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () =>
          ctx.addIssue({
            code: ZodIssueCode.custom,
            ...message(val),
          });
        if (result instanceof Promise) {
          return result.then(data => {
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
        return result.then(data => {
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
      | ((arg: Output, ctx: RefinementCtx) => MakeErrorData),
  ) => {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(
          typeof refinementData === 'function'
            ? refinementData(val, ctx)
            : refinementData,
        );
      }
    });
  };

  _refinement: (
    refinement: InternalCheck<Output>['check'],
  ) => this = refinement => {
    return new (this as any).constructor({
      ...this._def,
      checks: [...(this._def.checks || []), { check: refinement }],
    }) as this;
  };

  constructor(def: Def) {
    this._def = def;
    this.is = this.is.bind(this);
    this.check = this.check.bind(this);
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

  transform<
    This extends this,
    U extends ZodType<any>,
    Tx extends (arg: This['_output']) => U['_input'] | Promise<U['_input']>
  >(input: U, transformer: Tx): ZodTransformer<This, U>;
  transform<
    This extends this,
    Tx extends (
      arg: This['_output'],
    ) => This['_output'] | Promise<This['_output']>
  >(transformer: Tx): ZodTransformer<This, This>;
  transform(input: any, transformer?: any) {
    if (transformer) {
      return ZodTransformer.create(this as any, input, transformer) as any;
    }
    return ZodTransformer.create(this as any, outputSchema(this), input) as any;
  }

  default<
    T extends Input = Input,
    Opt extends ReturnType<this['optional']> = ReturnType<this['optional']>
  >(def: T): ZodTransformer<Opt, this>;
  default<
    T extends (arg: this) => Input,
    Opt extends ReturnType<this['optional']> = ReturnType<this['optional']>
  >(def: T): ZodTransformer<Opt, this>;
  default(def: any) {
    return ZodTransformer.create(this.optional(), this, (x: any) => {
      return x === undefined
        ? typeof def === 'function'
          ? def(this)
          : def
        : x;
    }) as any;
  }

  isOptional: () => boolean = () => this.safeParse(undefined).success;
  isNullable: () => boolean = () => this.safeParse(null).success;
}
