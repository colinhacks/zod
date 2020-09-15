import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import { util } from '../helpers/util';
import {
  ZodErrorCode,
  ZodArray,
  ZodUnion,
  ZodNull,
  ZodUndefined,
  ZodTransformer,
} from '../index';
import { ZodError } from '../ZodError';

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
  function = 'function',
  lazy = 'lazy',
  literal = 'literal',
  enum = 'enum',
  nativeEnum = 'nativeEnum',
  promise = 'promise',
  any = 'any',
  unknown = 'unknown',
  void = 'void',
  transformer = 'transformer',
}

export type ZodTypeAny = ZodType<any, any>;
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

type InternalCheck<T> = {
  check: (arg: T) => any;
} & MakeErrorData;

// type Check<T> = {
//   check: (arg: T) => any;
//   path?: (string | number)[];
//   // message?: string;
//   // params?: {[k:string]:any}
// } & util.Omit<CustomError, 'code' | 'path'>;

type Check<T> = {
  check: (arg: T) => any;
  path?: (string | number)[];
  message?: string;
  params?: { [k: string]: any };
};

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
  Input,
  Def extends ZodTypeDef = ZodTypeDef,
  Output = Input
> {
  readonly _input!: Input;
  readonly _output!: Output;
  //  readonly _type!: Input;
  readonly _def!: Def;

  parse: (x: unknown, params?: ParseParams) => Output;

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
    message: string | util.Omit<Check<Output>, 'check'> = 'Invalid value.',
  ) => {
    if (typeof message === 'string') {
      return this.refinement({ check, message });
    }
    return this.refinement({ check, ...message });
  };

  refinement = (refinement: Check<Output>) => {
    return this._refinement({
      code: ZodErrorCode.custom_error,
      ...refinement,
    });
  };

  protected _refinement: (
    refinement: InternalCheck<Output>,
  ) => this = refinement => {
    return new (this as any).constructor({
      ...this._def,
      checks: [...(this._def.checks || []), refinement],
    }) as this;
  };

  constructor(def: Def) {
    this._def = def;
    this.parse = ZodParser(this);
  }

  abstract toJSON: () => object;
  //  abstract // opt optional: () => any;
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () =>
    ZodUnion.create([this, ZodNull.create()]);
  array: () => ZodArray<this> = () => ZodArray.create(this);
  // pre: <T extends string>(
  //   input: T,
  //   transformer: (arg: T) => Type,
  // ) => any = (input, transformer) => 'adsf';

  // transformFrom: <U extends ZodType<any>, Tx extends (arg: U['_type']) => this['_type']>(
  //   x: U,
  //   transformer: Tx,
  // ) => ZodTransformer<U, this> = (input, transformer) => {
  //   return ZodTransformer.create(input, this, transformer);
  // };

  // transformFrom: <This extends this, U extends ZodType<any>, Tx extends (arg: U['_type']) => this['_type']>(
  //   x: U,
  //   transformer: Tx,
  // ) => ZodTransformer<This, U> = (input, transformer) => {
  //   return ZodTransformer.create(this as any, input, transformer) as any;
  // };
  transform: <
    This extends this,
    U extends ZodType<any>,
    Tx extends (arg: This['_output']) => U['_input'] | Promise<U['_input']>
  >(
    x: U,
    transformer: Tx,
  ) => ZodTransformer<This, U> = (input, transformer) => {
    return ZodTransformer.create(this as any, input, transformer) as any;
  };

  default: <
    T extends Output = Output,
    Opt extends ZodUnion<[this, ZodUndefined]> = ZodUnion<[this, ZodUndefined]>
  >(
    def: T,
  ) => ZodTransformer<Opt, this> = def => {
    return ZodTransformer.create(this.optional(), this, (x: any) => {
      return (x || def) as any;
    }) as any;
  };

  //  default: (val: Type) => ZodTransformer<ZodType<Type | undefined>, this> = val => {
  //    return ZodTransformer.create(this.optional(), this, x => {
  //      return (x || val) as any;
  //    }) as any;
  //  };

  //  codec = (): ZodCodec<this, this> => {
  //    return ZodCodec.create(this, this, x => x);
  //  };

  //  transform: <U extends ZodType<any>, Tx extends (arg: Type) => U['_type']>(
  //    x: U,s
  //    transformer: Tx,
  //  ) => ZodCodec<this, U> = (input, transformer) => {
  //    return ZodCodec.create(input, this, transformer);
  //  };

  or: <U extends ZodType<any>>(arg: U) => ZodUnion<[this, U]> = arg => {
    return ZodUnion.create([this, arg]);
  };
}
