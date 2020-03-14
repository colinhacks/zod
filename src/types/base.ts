import { ZodTuple } from './tuple';
import { ZodParser } from '../parser';

export enum ZodTypes {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  undefined = 'undefined',
  null = 'null',
  array = 'array',
  object = 'object',
  union = 'union',
  intersection = 'intersection',
  tuple = 'tuple',
  function = 'function',
  lazy = 'lazy',
}

export type ZodRawShape = { [k: string]: ZodAny };

export interface ZodTypeDef {
  t: ZodTypes;
}

export type ZodAny = ZodType<any>;

export type TypeOf<T extends ZodAny> = T['_type'];

export type TypeOfTuple<T extends [ZodAny, ...ZodAny[]] | []> = {
  [k in keyof T]: T[k] extends ZodType<infer U> ? U : never;
};

export type TypeOfFunction<Args extends ZodTuple<any>, Returns extends ZodAny> = Args['_type'] extends Array<any>
  ? (...args: Args['_type']) => Returns['_type']
  : never;

//   interface Assertable<T> {
//     is(value: any): value is T;
//     assert(value: any): asserts value is T;
// }

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;

  //  is(value: any): value is Type;
  //  assert(value: any): asserts value is Type;

  parse: (x: unknown) => Type;

  is(u: any): u is Type {
    try {
      this.parse(u);
      return true;
    } catch (err) {
      return false;
    }
  }

  // assert(u: unknown): asserts u is Type {
  //   try {
  //     this.parse(u);
  //   } catch (err) {
  //     throw new Error(err.message);
  //   }
  // }

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
    // this._type = null as any as Type;
  }

  abstract toJSON: () => object;
  abstract optional: () => any;
  abstract nullable: () => any;
}
