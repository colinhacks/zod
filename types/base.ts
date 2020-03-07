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

export type TypeOfFunction<
  Args extends ZodTuple<any>,
  Returns extends ZodAny
> = Args['_type'] extends Array<any>
  ? (...args: Args['_type']) => Returns['_type']
  : never;

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  _type: Type;
  _def: Def;

  parse: (x: unknown) => Type;

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
  }

  abstract toJSON: () => object;
}
