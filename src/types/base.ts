import { ZodParser, ParseParams } from '../parser';
import { maskUtil } from '../helpers/maskUtil';
import { Masker } from '../masker';
// import { ZodString } from './string';
// import { maskUtil } from '../helpers/maskUtil';

export enum ZodTypes {
  string = 'string',
  number = 'number',
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
}

export type ZodAny = ZodType<any>;
export type ZodRawShape = { [k: string]: ZodAny };

// const asdf = { asdf: ZodString.create() };
// type tset1 = typeof asdf extends ZodRawShape ? true :false

export interface ZodTypeDef {
  t: ZodTypes;
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

  parse: (x: Type, params?: ParseParams) => Type;

  is(u: Type): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  check(u: Type): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  mask = <P extends maskUtil.Params<Type>>(_params: P): ZodType<maskUtil.Pick<Type, P>> => {
    return Masker(this, _params) as any;
  };

  // pick = <Params extends maskUtil.Params<Type>>(_params: Params): maskUtil.Mask<Type, Params> => {
  //   return 'asdf' as any;
  // };

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
  }

  abstract toJSON: () => object;
  abstract optional: () => any;
  abstract nullable: () => any;
}
