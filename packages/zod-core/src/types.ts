export type Primitive =
  | string
  | number
  | symbol
  | bigint
  | boolean
  | null
  | undefined;
export type Scalars = Primitive | Primitive[];

export type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
  V,
>() => V extends U ? 1 : 2
  ? true
  : false;

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
export type MakePartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;

export type noUndefined<T> = T extends undefined ? never : T;

export type optionalKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];
export type requiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];
export type addQuestionMarks<T extends object, _O = unknown> = {
  [K in requiredKeys<T>]: T[K];
} & {
  [K in optionalKeys<T>]?: T[K];
} & { [k in keyof T]?: unknown };

export type identity<T> = T;
export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

export type noNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type noNever<T> = identity<{
  [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export type extendShape<A extends object, B extends object> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

type UnionToIntersectionFn<T> = (
  T extends unknown
    ? (k: () => T) => void
    : never
) extends (k: infer Intersection) => void
  ? Intersection
  : never;

type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last
  ? Last
  : never;

type UnionToTuple<T, Tuple extends unknown[] = []> = [T] extends [never]
  ? Tuple
  : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>;

type CastToStringTuple<T> = T extends [string, ...string[]] ? T : never;

export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;

export type ErrMessage = string | { message?: string };

export type AnyFunc = (...args: any[]) => any;
export type IsProp<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
export type IsMethod<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
export type OmitString<T, Pattern extends string> = T extends Pattern
  ? never
  : T;
export type PickProps<T> = { [k in keyof T as IsProp<T, k>]: T[k] };
export type Def<T extends object> = PickProps<Omit<T, keyof T & `_${string}`>>;

export type MergeOverrides<
  Base extends object,
  Defaults extends Base,
  Overrides extends Partial<Base>,
> = {
  [k in keyof Base]: k extends keyof Overrides
    ? noUndefined<Overrides[k]>
    : Defaults[k];
};
