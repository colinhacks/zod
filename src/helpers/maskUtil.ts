import { Primitive } from "./primitive";

type AnyObject = { [k: string]: any };
type IsAny<T> = any extends T ? (T extends any ? true : false) : false;
type IsNever<T> = never extends T ? (T extends never ? true : false) : false;
type IsTrue<T> = true extends T ? (T extends true ? true : false) : false;
type IsObject<T> = T extends { [k: string]: any }
  ? T extends Array<any>
    ? false
    : true
  : false;
type IsObjectArray<T> = T extends Array<{ [k: string]: any }> ? true : false;
// type IsObject<T> = T extends { [k: string]: any } ? (T extends Array<any> ? never : true) : never;

export namespace maskUtil {
  export type Params<T> = {
    array: T extends Array<infer U>
      ? true | { [k in keyof U]?: true | Params<U[k]> }
      : never;
    object: T extends AnyObject
      ? { [k in keyof T]?: true | Params<T[k]> }
      : never;
    rest: never;
    never: never;
  }[T extends null | undefined | Primitive | Array<Primitive>
    ? "never"
    : any extends T
    ? "never"
    : T extends Array<AnyObject>
    ? "array"
    : IsObject<T> extends true
    ? "object"
    : "rest"];

  export type PickTest<T, P extends any> = P extends true
    ? "true"
    : true extends IsObject<T>
    ? "object"
    : true extends IsObjectArray<T>
    ? "array"
    : "rest";

  export type Pick<T, P> = null extends T
    ? undefined extends T
      ? BasePick<NonNullable<T>, P> | null | undefined
      : BasePick<NonNullable<T>, P> | null
    : undefined extends T
    ? BasePick<NonNullable<T>, P> | undefined
    : BasePick<NonNullable<T>, P>;

  export type BasePick<T, P extends any> = {
    primitive: T;
    primitivearray: T;
    true: T;
    object: { [k in keyof P]: k extends keyof T ? Pick<T[k], P[k]> : never };
    array: T extends (infer U)[] ? Pick<U, P>[] : never;
    never: never;
    any: any;
  }[IsAny<T> extends true
    ? "any"
    : IsNever<T> extends true
    ? "never"
    : IsNever<P> extends true
    ? "true"
    : IsTrue<P> extends true
    ? "true"
    : true extends IsObject<T>
    ? "object"
    : true extends IsObjectArray<T>
    ? "array"
    : "any"];
}
