import * as z from '.';

type isAny<T> = [any extends T ? 'true' : 'false'] extends ['true'] ? true : false;

type nonoptional<T> = [undefined] extends [T] ? (T extends undefined ? never : T) : never;
type nonnullable<T> = [null] extends [T] ? (T extends null ? never : T) : never;
type arrayelement<T extends any[]> = T extends (infer U)[] ? U : never;
type equals<X, Y> = [X] extends [Y] ? ([Y] extends [X] ? true : false) : false;

type User = {
  name: string;
  age: number | undefined;
  active: boolean | null;
  posts: Post[];
};

type Post = {
  content: string;
  // author: User;
};

// type t1 = nonoptional<string | undefined>;
// type t2 = arrayelement<string[]>;
// type t3 = toZod<number | undefined>;
// type t4 = toZod<number | null>;
// type t5 = [undefined] extends [string] ? true : false;
// type t6 = toZod<User>;
// type t7 = toZod<Post>;
// type t8 = toZod<boolean>;
// type t9 = isAny<boolean> extends true ? 'true' : 'false';
// type t10 = equals<boolean, boolean> extends true ? 'true' : 'false';

const User: toZod<User> = z.object({
  name: z
    .string()
    .min(5)
    .max(2314)
    .refine(() => false, 'asdf'),
  age: z.number().optional(),
  active: z.boolean().nullable(),
  posts: z.array(
    z.object({
      content: z.string(),
    }),
  ),
});

// const u = User.shape.posts;
type asdf = toZod<User>;
const a: asdf = 'asdf' as any;
a;

export type toZod<T> = {
  any: z.ZodAny;
  optional: z.ZodUnion<[toZod<nonoptional<T>>, z.ZodUndefined]>;
  nullable: z.ZodUnion<[toZod<nonnullable<T>>, z.ZodNull]>;
  array: T extends any[] ? z.ZodArray<toZod<arrayelement<T>>> : never;
  string: z.ZodString;
  bigint: z.ZodBigInt;
  number: z.ZodNumber;
  boolean: z.ZodBoolean;
  date: z.ZodDate;
  object: z.ZodObject<{ [k in keyof T]: toZod<T[k]> }>;
  rest: never;
}[zodKey<T>];

type zodKey<T> = isAny<T> extends true
  ? 'any'
  : equals<T, boolean> extends true //[T] extends [booleanUtil.Type]
  ? 'boolean'
  : [undefined] extends [T]
  ? 'optional'
  : [null] extends [T]
  ? 'nullable'
  : T extends any[]
  ? 'array'
  : equals<T, string> extends true
  ? 'string'
  : equals<T, bigint> extends true //[T] extends [bigintUtil.Type]
  ? 'bigint'
  : equals<T, number> extends true //[T] extends [numberUtil.Type]
  ? 'number'
  : equals<T, Date> extends true //[T] extends [dateUtil.Type]
  ? 'date'
  : T extends { [k: string]: any } //[T] extends [structUtil.Type]
  ? 'object'
  : 'rest';
