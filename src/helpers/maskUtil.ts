/* eslint-disable @typescript-eslint/no-explicit-any */
import { Primitive } from './primitive';

type AnyObject = { [k: string]: any };
type IsAny<T> = any extends T ? (T extends any ? true : false) : false;
type IsNever<T> = never extends T ? (T extends never ? true : false) : false;
type IsTrue<T> = true extends T ? (T extends true ? true : false) : false;
type IsObject<T> = T extends { [k: string]: any } ? (T extends any[] ? false : true) : false;
type IsObjectArray<T> = T extends { [k: string]: any }[] ? true : false;
// type IsObject<T> = T extends { [k: string]: any } ? (T extends Array<any> ? never : true) : never;

export type Params<T> = {
  array: T extends (infer _U)[] ? true | { [k in keyof _U]?: true | Params<_U[k]> } : never;
  object: T extends AnyObject ? { [k in keyof T]?: true | Params<T[k]> } : never;
  rest: never;
  never: never;
}[T extends null | undefined | Primitive | Primitive[]
  ? 'never'
  : any extends T
  ? 'never'
  : T extends AnyObject[]
  ? 'array'
  : IsObject<T> extends true
  ? 'object'
  : 'rest'];

export type PickTest<T, P extends any> = P extends true
  ? 'true'
  : true extends IsObject<T>
  ? 'object'
  : true extends IsObjectArray<T>
  ? 'array'
  : 'rest';

export type Pick<T, P> = null extends T
  ? undefined extends T
    ? BasePick<NonNullable<T>, P> | null | undefined
    : BasePick<NonNullable<T>, P> | null
  : undefined extends T
  ? BasePick<NonNullable<T>, P> | undefined
  : BasePick<NonNullable<T>, P>;
// export type HandleNull<T, P> = null extends T ? BasePick<NonNullable<T>, P> | null : BasePick<NonNullable<T>, P>;
// export type HandleUndefined<T, P> = undefined extends T ? BasePick<NonNullable<T>, P> | undefined : BasePick<NonNullable<T>, P>;
export type BasePick<T, P extends any> = {
  primitive: T;
  primitivearray: T;
  true: T;
  object: { [k in keyof P]: k extends keyof T ? Pick<T[k], P[k]> : never };
  array: T extends (infer U)[] ? Pick<U, P>[] : never;
  never: never;
  any: any;
}[IsAny<T> extends true
  ? 'any'
  : IsNever<T> extends true
  ? 'never'
  : IsNever<P> extends true
  ? 'true'
  : IsTrue<P> extends true
  ? 'true'
  : true extends IsObject<T>
  ? 'object'
  : true extends IsObjectArray<T>
  ? 'array'
  : 'any'];
