import { Primitive } from './primitive';

type AnyObject = { [k: string]: any };
type IsAny<T> = any extends T ? (T extends any ? true : false) : false;
type IsNever<T> = never extends T ? (T extends never ? true : false) : false;
type IsTrue<T> = true extends T ? (T extends true ? true : false) : false;
type IsObject<T> = T extends { [k: string]: any } ? (T extends Array<any> ? false : true) : false;
type IsObjectArray<T> = T extends Array<{ [k: string]: any }> ? true : false;
// type IsObject<T> = T extends { [k: string]: any } ? (T extends Array<any> ? never : true) : never;

export namespace maskUtil {
  export type Params<T> = {
    array: T extends Array<infer U> ? true | { [k in keyof U]?: true | Params<U[k]> } : never;
    object: T extends AnyObject ? { [k in keyof T]?: true | Params<T[k]> } : never;
    rest: never;
    never: never;
  }[T extends null | undefined | Primitive | Array<Primitive>
    ? 'never'
    : any extends T
    ? 'never'
    : T extends Array<AnyObject>
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
}

// type test = any[] extends Record<string, any> ? true : false;
// type test1 = maskUtil.Params<{ name: string }>;
// type test2 = maskUtil.Params<{ name: string }[]>;
// type test3 = maskUtil.Params<{ name: string } | undefined>;
// type test4 = maskUtil.Params<undefined>;
// type test5 = maskUtil.Params<null>;
// type test6 = maskUtil.Params<string>;
// type test7 = maskUtil.Params<string | boolean | undefined>;
// type test8 = maskUtil.Params<{ properties: { name: string; number: number } }>;
// type test9 = IsObjectArray<[]>;
// type test10 = IsObject<[]>;
// type test11 = true extends IsObject<{ firstName: string; lastName: string }[]> ? true : false;
// type test11b = true extends IsObjectArray<{ firstName: string; lastName: string }[]> ? true : false;
// type test12 = maskUtil.Pick<{ firstName: string }, true>;
// type test13 = maskUtil.Pick<{ firstName: string }, {}>;

// type test14 = maskUtil.PickTest<{ firstName: string; lastName: string }, {}>;
// type test15 = maskUtil.Pick<
//   { firstName: string | undefined; lastName: string | undefined | null }[] | undefined,
//   { firstName: true }
// >;
// type test16 = maskUtil.Pick<{ username: string; points: number }, { points: true }>;

// type test16 = {} extends true ? true : false;
// export namespace maskUtil {
//   export type Params<T> = {
//     never: never;
//     undefined: never;
//     primitive: true;
//     primitivearr: true;
//     tuple: true;
//     array: true | (T extends Array<infer U> ? Params<U> : never);
//     obj: { [k in keyof T]?: Params<T[k]> };
//     unknown: unknown;
//   }[T extends never
//     ? 'never'
//     : T extends undefined
//     ? 'undefined'
//     : T extends Primitive
//     ? 'primitive'
//     : T extends [any, ...any[]]
//     ? 'tuple'
//     : T extends Array<any>
//     ? 'array'
//     : T extends AnyObject
//     ? 'obj'
//     : 'unknown'];
//   export type Mask<T, P extends Params<T>> = {
//     false: never;
//     true: T;
//     inferenceerror: 'InferenceError! Please file an issue with your code.';
//     primitiveerror: 'PrimitiveError! Please file an issue with your code';
//     objarray: T extends Array<infer U> ? Mask<U, P>[] : never;
//     obj: T extends AnyObject
//       ? {
//           [k in keyof T]: k extends keyof P ? Mask<T[k], P[k]> : never;
//         }
//       : never;
//     unknown: 'MaskedTypeUnknownError! Please file an issue with your code.';
//   }[P extends false
//     ? 'false'
//     : P extends true
//     ? 'true'
//     : P extends boolean
//     ? 'inferenceerror'
//     : T extends Primitive
//     ? 'primitiveerror'
//     : T extends Array<any>
//     ? 'objarray'
//     : T extends AnyObject
//     ? 'obj'
//     : 'unknown'];
// }
