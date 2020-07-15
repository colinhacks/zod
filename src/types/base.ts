import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import { util } from '../helpers/util';
import { ZodErrorCode, ZodArray, ZodUnion, ZodNull, ZodUndefined } from '..';
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
  codec = 'codec',
}

export type ZodTypeAny = ZodType<any>;
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
export type Infer<T extends { _type: any }> = T['_type'];

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;

  parse: (x: Type | unknown, params?: ParseParams) => Type;

  parseAsync: (x: Type | unknown, params?: ParseParams) => Promise<Type> = value => {
    return new Promise((res, rej) => {
      try {
        const parsed = this.parse(value);
        return res(parsed);
      } catch (err) {
        return rej(err);
      }
    });
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
  // pre: <T extends ZodType<any, any>>(
  //   input: T,
  //   transformer: (arg: T['_type']) => this['_type'],
  // ) => ZodCodec<T, ZodType<Type>> = (input, transformer) => ZodCodec.create(input, this as any, transformer);
}
