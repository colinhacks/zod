export type MergeShapes<U, V> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} & V;

// type optionalKeys<T extends object> = {
//   [k in keyof T]: undefined extends T[k] ? k : never;
// }[keyof T];

type requiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

// type alkjsdf = addQuestionMarks<{ a: any }>;

export type addQuestionMarks<
  T extends object,
  R extends keyof T = requiredKeys<T>
  // O extends keyof T = optionalKeys<T>
> = Pick<Required<T>, R> & Partial<T>;
//  = { [k in O]?: T[k] } & { [k in R]: T[k] };

export type identity<T> = T;
export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

export type noNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type noNever<T> = identity<{
  [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export const mergeShapes = <U, T>(first: U, second: T): T & U => {
  return {
    ...first,
    ...second, // second overwrites first
  };
};

export type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;
