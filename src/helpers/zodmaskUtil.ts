// import { ZodAny } from '../types/base';
// import { ZodObject } from '../types/object';
// import { ZodArray } from '..';

// type AnyObject = { [k: string]: any };

// export namespace zodmaskUtil {
//   export type Params<T extends ZodAny> = {
//     object: true | (T extends ZodObject<infer U, any> ? { [k in keyof U]?: Params<U[k]> } : 'objectnever');
//     array: true | (T extends ZodArray<ZodObject<infer U, any>> ? Params<ZodObject<U, any>> : 'arraynever');
//     rest: true;
//   }[T extends ZodObject<any, any> ? 'object' : T extends ZodArray<ZodObject<any>> ? 'array' : 'rest'];

//   export type pick<T extends ZodAny, P extends Params<T>> = {
//     false: never;
//     true: T;
//     array: T extends ZodArray<infer U> ? ZodArray<pick<U, P>> : never;
//     object: T extends ZodObject<infer U, infer V>
//       ? P extends AnyObject
//         ? ZodObject<{ [k in keyof P & keyof U]: pick<U[k], P[k]> }, V>
//         : never
//       : never;
//     never: never;
//   }[P extends false
//     ? 'false'
//     : P extends true
//     ? 'true'
//     : P extends boolean
//     ? 'never'
//     : P extends object
//     ? T extends ZodObject<any, any>
//       ? 'object'
//       : T extends ZodArray<ZodObject<any, any>>
//       ? 'array'
//       : 'never'
//     : 'never'];

//   export type omit<T extends ZodAny, P extends Params<T>> = {
//     false: T;
//     true: never;
//     array: T extends ZodArray<infer U> ? ZodArray<omit<U, P>> : never;
//     object: T extends ZodObject<infer U, infer V>
//       ? P extends AnyObject
//         ? ZodObject<{ [k in keyof U]: k extends keyof P ? omit<U[k], P[k]> : U[k] }, V>
//         : 'innernever'
//       : 'outernever';
//     never: never;
//   }[P extends false
//     ? 'false'
//     : P extends true
//     ? 'true'
//     : P extends boolean
//     ? 'never'
//     : P extends AnyObject
//     ? T extends ZodObject<any, any>
//       ? 'object'
//       : T extends ZodArray<ZodObject<any, any>>
//       ? 'array'
//       : 'never'
//     : 'never'];
// }
