import { ZodParser, ParseParams } from '../parser';
// import { MaskParams, MaskedType } from './object';

export enum ZodTypes {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  undefined = 'undefined',
  null = 'null',
  array = 'array',
  object = 'object',
  interface = 'interface',
  union = 'union',
  intersection = 'intersection',
  tuple = 'tuple',
  function = 'function',
  lazy = 'lazy',
  literal = 'literal',
  enum = 'enum',
}

export type ZodRawShape = { [k: string]: ZodAny };

export interface ZodTypeDef {
  t: ZodTypes;
}

export type ZodAny = ZodType<any>;

export type TypeOf<T extends { _type: any }> = T['_type'];
export type Infer<T extends { _type: any }> = T['_type'];

//   interface Assertable<T> {
//     is(value: any): value is T;
//     assert(value: any): asserts value is T;
// }

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;
  readonly _maskParams!: Def;

  //  is(value: any): value is Type;
  //  assert(value: any): asserts value is Type;

  parse: (x: Type, params?: ParseParams) => Type;

  //  mask: (params: MaskParams, params?: ParseParams) => Type;

  //  mask = <P extends MaskParams<Type>>(params: P): MaskedType<Type, P> => {
  //    return params as any;
  //  };

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

  // assert: zodAssertion<Type> = (value: unknown) => zodAssert(this, value);
  //  (u: unknown) => asserts u is Type = u => {
  //   try {
  //     this.parse(u);
  //   } catch (err) {
  //     throw new Error(err.message);
  //   }
  // };

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
    // this._type = null as any as Type;
  }

  abstract toJSON: () => object;
  abstract optional: () => any;
  abstract nullable: () => any;
}
