import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import { util } from '../helpers/util';
import { ZodErrorCode, ZodArray, ZodUnion, ZodNull, ZodUndefined, ZodTransformer } from '..';
import { CustomError } from '../ZodError';

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
  promise = 'promise',
  any = 'any',
  unknown = 'unknown',
  void = 'void',
  transformer = 'transformer',
}

export type ZodTypeAny = ZodType<any, any>;
export type ZodRawShape = { [k: string]: ZodTypeAny };

type InternalCheck<T> = {
  check: (arg: T) => any;
} & MakeErrorData;

type Check<T> = {
  check: (arg: T) => any;
  path?: (string | number)[];
} & util.Omit<CustomError, 'code' | 'path'>;
export interface ZodTypeDef {
  t: ZodTypes;
  checks?: InternalCheck<any>[];
  accepts?: ZodType<any, any>;
}

export type TypeOf<T extends { _type: any }> = T['_type'];
export type input<T extends { _input: any }> = T['_input'];
export type output<T extends { _output: any }> = T['_output'];
export type infer<T extends { _type: any }> = T['_type'];

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _input!: Type;
  readonly _output!: Type;
  readonly _type!: Type;
  readonly _def!: Def;

  parse: (x: Type | unknown, params?: ParseParams) => Type;

  parseAsync: (x: Type | unknown, params?: ParseParams) => Promise<Type> = async (value, params) => {
    console.log('ASYNCPARSE');
    const parsed = await this.parse(value, { ...params, async: true });
    // console.log(parsed);
    return parsed;
  };

  is(u: Type): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  check(u: Type | unknown): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  refine = <Val extends (arg: Type) => any>(
    check: Val,
    message: string | util.Omit<Check<Type>, 'check'> = 'Invalid value.',
  ) => {
    if (typeof message === 'string') {
      return this.refinement({ check, message });
    }
    return this.refinement({ check, ...message });
  };

  refinement = (refinement: Check<Type>) => {
    return this._refinement({ code: ZodErrorCode.custom_error, ...refinement });
  };

  protected _refinement: (refinement: InternalCheck<Type>) => this = refinement => {
    return new (this as any).constructor({
      ...this._def,
      checks: [...(this._def.checks || []), refinement],
    }) as this;
  };

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
  }

  abstract toJSON: () => object;
  //  abstract // opt optional: () => any;
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
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
  transform: <This extends this, U extends ZodType<any>, Tx extends (arg: This['_type']) => U['_type']>(
    x: U,
    transformer: Tx,
  ) => ZodTransformer<This, U> = (input, transformer) => {
    return ZodTransformer.create(this as any, input, transformer) as any;
  };

  default: <T extends Type = Type, Opt extends ZodUnion<[this, ZodUndefined]> = ZodUnion<[this, ZodUndefined]>>(
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
