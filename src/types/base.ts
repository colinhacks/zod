import { ZodParser, ParseParams, MakeErrorData } from '../parser';
import { util } from '../helpers/util';
import { ZodErrorCode } from '..';
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
  // interface = 'interface',
  union = 'union',
  intersection = 'intersection',
  tuple = 'tuple',
  record = 'record',
  function = 'function',
  lazy = 'lazy',
  lazyobject = 'lazyobject',
  literal = 'literal',
  enum = 'enum',
  promise = 'promise',
  any = 'any',
  unknown = 'unknown',
  void = 'void',
}

export type ZodTypeAny = ZodType<any>;
export type ZodRawShape = { [k: string]: ZodTypeAny };

// const asdf = { asdf: ZodString.create() };
// type tset1 = typeof asdf extends ZodRawShape ? true :false

type InternalCheck<T> = {
  check: (arg: T) => any;
} & MakeErrorData;

type Check<T> = {
  check: (arg: T) => any;
  // message?: string;
  path?: (string | number)[];
  // params?: { [k: string]: any };
  // code?: ZodErrorCode;
} & util.Omit<CustomError, 'code' | 'path'>;
export interface ZodTypeDef {
  t: ZodTypes;
  checks?: InternalCheck<any>[];
}

export type TypeOf<T extends { _type: any }> = T['_type'];
export type Infer<T extends { _type: any }> = T['_type'];

//   interface Assertable<T> {
//     is(value: any): value is T;
//     assert(value: any): asserts value is T;
// }

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;

  // get subclass() {
  //   console.log(this.constructor);
  //   return this.constructor;
  // }

  parse: (x: Type | unknown, params?: ParseParams) => Type;

  parseAsync: (x: Type | unknown, params?: ParseParams) => Promise<Type> = value => {
    return new Promise((res, rej) => {
      try {
        const parsed = this.parse(value);
        return res(parsed);
      } catch (err) {
        // console.log(err);
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
  abstract optional: () => any;
  abstract nullable: () => any;
}
