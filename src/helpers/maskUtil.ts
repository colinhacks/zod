// import { Primitive } from './primitive';

// type AnyObject = { [k: string]: any };

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
