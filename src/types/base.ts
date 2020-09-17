import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import { util } from '../helpers/util';
import { ZodErrorCode, ZodArray, ZodUnion, ZodNull, ZodError, ZodOptional } from '../index';

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
  optional = 'optional'
}

export type ZodTypeAny = ZodType<any, any>;
export type ZodRawShape = { [k: string]: ZodTypeAny };

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

export type TypeOf<T extends { _type: any }> = T['_type'];
export type Infer<T extends { _type: any }> = T['_type'];

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;

  parse: (x: Type | unknown, params?: ParseParams) => Type;

  safeParse: (
    x: Type | unknown,
    params?: ParseParams,
  ) => { success: true; data: Type } | { success: false; error: ZodError } = (data, params) => {
    try {
      const parsed = this.parse(data, params);
      return {
        success: true,
        data: parsed,
      };
    } catch (err) {
      if (err instanceof ZodError) {
        return {
          success: false,
          error: err,
        };
      }
      throw err;
    }
  };

  parseAsync: (x: Type | unknown, params?: ParseParams) => Promise<Type> = (value, params) => {
    return new Promise((res, rej) => {
      try {
        const parsed = this.parse(value, params);
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

  refine = <Func extends (arg: Type) => any>(
    check: Func,
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
    this._def = def;
    this.parse = ZodParser(def);
  }

  abstract toJSON: () => object;
  //  abstract // opt optional: () => any;
  optional: () => this extends ZodOptional<ZodTypeAny> ? this : ZodOptional<this> = () => ZodOptional.create(this);
  nullable: () => ZodUnion<readonly [this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  array: () => this extends ZodArray<ZodTypeAny> ? this : ZodArray<this>  = () => ZodArray.create(this) as any;
  or: <U extends ZodType<any>>(arg: U) => ZodUnion<readonly[this, U]> = arg => {
    return ZodUnion.create([this, arg]);
  };
  isOptional: () => boolean = () => this._def.t === ZodTypes.optional;
}
