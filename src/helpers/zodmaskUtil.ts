import { ZodAny } from '../types/base';
import { ZodObject } from '../types/object';
import { ZodArray } from '..';

type AnyObject = { [k: string]: any };

export namespace zodmaskUtil {
  // export type ObjectParams<T extends ZodRawShape> = Params<ZodObjectType<T, Params>>{
  //   [k in keyof T]: Params<T[k]>
  // }

  // export type WhitelistParams<T> = WhiteBlackParams<T, true>;
  // export type BlacklistParams<T> = WhiteBlackParams<T, false>;

  // export type Params<T> = BlacklistParams<T> | WhitelistParams<T>;

  // export type WhiteBlackParams<T, BoolValue extends boolean = boolean> = {
  export type Params<T extends ZodAny> = {
    object: true | (T extends ZodObject<infer U, any> ? { [k in keyof U]?: Params<U[k]> } : 'objectnever');
    array: true | (T extends ZodArray<ZodObject<infer U, any>> ? Params<ZodObject<U, any>> : 'arraynever');
    rest: true;
  }[T extends ZodObject<any, any> ? 'object' : T extends ZodArray<ZodObject<any>> ? 'array' : 'rest'];

  // type ZodToKey<T extend ZodAny> =

  // export type WhitelistZodObject<T extends ZodObject<any, any>, P extends Params<T>> = T extends ZodObject<
  //   infer U,
  //   infer V
  // >
  //   ? P extends AnyObject
  //     ? ZodObject<{ [k in keyof P & keyof U]: Whitelist<U[k], P[k]> }, V>
  //     : never
  //   : never;

  export type Whitelist<T extends ZodAny, P extends Params<T>> = {
    false: never;
    true: T;
    array: T extends ZodArray<infer U> ? ZodArray<Whitelist<U, P>> : never;
    object: T extends ZodObject<infer U, infer V>
      ? P extends AnyObject
        ? ZodObject<{ [k in keyof P & keyof U]: Whitelist<U[k], P[k]> }, V>
        : never
      : never;
    never: never;
  }[P extends false
    ? 'false'
    : P extends true
    ? 'true'
    : P extends boolean
    ? 'never' // P extends [any,...any[]] ? //   'tuple' //  :
    : P extends object
    ? T extends ZodObject<any, any>
      ? 'object'
      : T extends ZodArray<ZodObject<any, any>>
      ? 'array'
      : 'never'
    : 'never'];

  export type Blacklist<T extends ZodAny, P extends Params<T>> = {
    false: T;
    true: never;
    array: T extends ZodArray<infer U> ? ZodArray<Blacklist<U, P>> : never;
    object: T extends ZodObject<infer U, infer V>
      ? P extends AnyObject
        ? ZodObject<{ [k in keyof U]: k extends keyof P ? Blacklist<U[k], P[k]> : U[k] }, V>
        : 'innernever'
      : 'outernever';
    never: never;
  }[P extends false
    ? 'false'
    : P extends true
    ? 'true'
    : P extends boolean
    ? 'never' // P extends [any,...any[]] ? //   'tuple' //  :
    : P extends AnyObject
    ? T extends ZodObject<any, any>
      ? 'object'
      : T extends ZodArray<ZodObject<any, any>>
      ? 'array'
      : 'never'
    : 'never'];
}
