import { Primitive } from './primitive';

type Test = {
  name: string;
  nest: {
    name: string;
  };
  address: {
    line1: string;
  };
  inventory: {
    name: string;
    quantity: number;
  }[];
  optinventory:
    | {
        name: string;
        quantity: number;
      }[]
    | undefined;
  names: string[];
  optnames: string[] | null;
  nothing: null;
  undef: undefined;
  tuple: [string, { name: string }];
};

interface A {
  val: number;
  b: B;
}

interface B {
  val: number;
  a: A;
}

type AnyObject = { [k: string]: any };
// type ObjOrArray<T extends AnyObject> = T | T[];
// type OptionalObjOrArray = ObjOrArray<AnyObject> | undefined | null;
// type Required<T extends OptionalObjOrArray> = T extends undefined | null ? never : T;
// type UnwrapArray<T extends any[]> = T extends Array<infer U> ? U : never;
// type OptionalObject = { [k: string]: any } | undefined | null;

export type MaskParams<T> = {
  undefined: never;
  primitive: boolean;
  primitivearr: boolean;
  tuple: boolean; // | { [k in keyof T]: MaskParams<T[k]> };
  array: boolean | (T extends Array<infer U> ? MaskParams<U> : never);
  obj: boolean | (T extends AnyObject ? { [k in keyof T]?: MaskParams<T[k]> } : never);
  unknown: 'UnknownCaseError! Please file an issue with your code.';
}[T extends undefined
  ? 'undefined'
  : T extends Primitive
  ? 'primitive'
  : T extends [any, ...any[]]
  ? 'tuple'
  : T extends Array<any>
  ? 'array'
  : T extends AnyObject
  ? 'obj'
  : 'unknown'];

export type TestParams = MaskParams<Test>;

export type MaskedType<T extends any, P extends MaskParams<T>> = {
  false: never;
  true: T;
  inferenceerror: 'InferenceError! Please file an issue with your code.';
  primitiveerror: 'PrimitiveError! Please file an issue with your code';
  // primitive: boolean;
  // tuple: { [k in (keyof T & keyof P)]: MaskedType<T[k],P[k]> };
  objarray: T extends Array<infer U> ? MaskedType<U, P>[] : never;
  obj: T extends AnyObject ? { [k in keyof T & keyof P]: MaskedType<T[k], P[k]> } : never;
  unknown: 'MaskedTypeUnknownError! Please file an issue with your code.';
}[P extends false
  ? 'false'
  : P extends true
  ? 'true'
  : P extends boolean
  ? 'inferenceerror'
  : T extends Primitive
  ? 'primitiveerror'
  : T extends Array<any>
  ? 'objarray'
  : T extends AnyObject
  ? 'obj'
  : 'unknown'];
