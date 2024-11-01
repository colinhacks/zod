export type Primitive =
  | string
  | number
  | symbol
  | bigint
  | boolean
  | null
  | undefined;

export type Scalars = Primitive | Primitive[];

export type Sizeable = string | Array<unknown> | Set<unknown> | File;

export type Numeric = number | bigint | Date;

export type JWTAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512";

export type IntegerTypes =
  | "int8"
  | "uint8"
  | "int16"
  | "uint16"
  | "int32"
  | "uint32"
  | "int64"
  | "uint64"
  | "int128"
  | "uint128";

export type IPVersion = "v4" | "v6";

export type MimeTypes =
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "application/javascript"
  | "application/pdf"
  | "application/zip"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/octet-stream"
  | "application/graphql"
  | "text/html"
  | "text/plain"
  | "text/css"
  | "text/javascript"
  | "text/csv"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/svg+xml"
  | "image/webp"
  | "audio/mpeg"
  | "audio/ogg"
  | "audio/wav"
  | "audio/webm"
  | "video/mp4"
  | "video/webm"
  | "video/ogg"
  | "font/woff"
  | "font/woff2"
  | "font/ttf"
  | "font/otf"
  | "multipart/form-data"
  | (string & {});

export type ParsedTypes =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "file"
  | "date"
  | "array"
  | "map"
  | "set"
  | "nan"
  | "null"
  | "promise";

/////////////////////////////
///////     UTILS     ///////
/////////////////////////////
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

export type NoUndefined<T> = T extends undefined ? never : T;

// export type OptionalKeys<T extends object> = {
//   [k in keyof T]: undefined extends T[k] ? k : never;
// }[keyof T];
// export type RequiredKeys<T extends object> = {
//   [k in keyof T]: undefined extends T[k] ? never : k;
// }[keyof T];
// export type AddQuestionMarks<T extends object, _O = unknown> = {
//   [K in RequiredKeys<T>]: T[K];
// } & {
//   [K in OptionalKeys<T>]?: T[K];
// } & { [k in keyof T]?: unknown };

export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;

export type NoNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type NoNever<T> = Identity<{
  [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export type ExtendShape<A extends object, B extends object> = {
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
    ? NoUndefined<Overrides[k]>
    : Defaults[k];
};

export type MaybeAsync<T> = T | Promise<T>;

export type OmitIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : K extends string
      ? K
      : never]: T[K];
};

export type ExtractIndex<T> = {
  [K in keyof T as string extends K ? K : K extends string ? never : K]: T[K];
};

export type Keys<T extends object> = keyof OmitIndex<T>;
