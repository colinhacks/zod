// import { Primitive } from './primitive';
// import { ZodRawShape } from '../types/base';

// type AnyObject = { [k: string]: any };

export namespace maskUtil {
  // export type ObjectParams<T extends ZodRawShape> = Params<ZodObjectType<T, Params>>{
  //   [k in keyof T]: Params<T[k]>
  // }
  // export type WhitelistParams<T> = WhiteBlackParams<T, true>;
  // export type BlacklistParams<T> = WhiteBlackParams<T, false>;
  // export type Params<T> = BlacklistParams<T> | WhitelistParams<T>;
  // export type WhiteBlackParams<T, BoolValue extends boolean = boolean> = {
  // export type Params<T> = {
  //   never: never;
  //   undefined: never;
  //   primitive: true;
  //   primitivearr: true;
  //   tuple: true; // | { [k in keyof T]: Params<T[k]> };
  //   // array: true | (T extends Array<infer U> ? Params<U> : never);
  //   array: true; // | (T extends Array<infer U> ? Params<U> : never);
  //   // obj: true | (T extends AnyObject ? { [k in keyof T]?: Params<T[k]> } : never);
  //   obj: { [k in keyof T]?: Params<T[k]> };
  //   unknown: unknown; //'UnknownCaseError! Please file an issue with your code.';
  // }[T extends never
  //   ? 'never'
  //   : T extends undefined
  //   ? 'undefined'
  //   : T extends Primitive
  //   ? 'primitive'
  //   : T extends [any, ...any[]]
  //   ? 'tuple'
  //   : T extends Array<any>
  //   ? 'array'
  //   : T extends AnyObject
  //   ? 'obj'
  //   : 'unknown'];
  // export type Mask<T, P extends Params<T>> = {
  //   false: never;
  //   true: T;
  //   inferenceerror: 'InferenceError! Please file an issue with your code.';
  //   primitiveerror: 'PrimitiveError! Please file an issue with your code';
  //   // primitive: boolean;
  //   // tuple: { [k in keyof T & keyof P]: Mask<T[k], P[k]> };
  //   objarray: T extends Array<infer U> ? Mask<U, P>[] : never;
  //   // obj: T extends AnyObject ? { [k in keyof T & keyof P]: Mask<T[k], P[k]> } : never;
  //   obj: T extends AnyObject
  //     ? {
  //         [k in keyof T]: k extends keyof P ? Mask<T[k], P[k]> : never;
  //         // Mask<T[k], P[k]>
  //       }
  //     : never;
  //   unknown: 'MaskedTypeUnknownError! Please file an issue with your code.';
  // }[P extends false
  //   ? 'false'
  //   : P extends true
  //   ? 'true'
  //   : P extends boolean
  //   ? 'inferenceerror' // P extends [any,...any[]] ? //   'tuple' //  :
  //   : T extends Primitive
  //   ? 'primitiveerror'
  //   : T extends Array<any>
  //   ? 'objarray'
  //   : T extends AnyObject
  //   ? 'obj'
  //   : 'unknown'];
}
