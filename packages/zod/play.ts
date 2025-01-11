import * as z from "zod";
import type { $ZodShape } from "zod-core";
import type * as util from "zod-core/util";
// import type { $InferObjectOutput } from "zod-core";

z;

const a = z.uint32();
console.log(z.safeParse(a, 123));
console.log(z.safeParse(a, -123));

type Shape = {
  name: z.ZodString;
  [k: string]: z.ZodType<unknown>;
};

type OptionalOutKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qout": "true" } ? k : never;
}[keyof T];

type OptionalOutProps<T extends $ZodShape> = {
  [k in OptionalOutKeys<T>]?: T[k]["~output"];
};
export type RequiredOutKeys<T extends $ZodShape> = {
  [k in keyof T]: T[k] extends { "~qout": "true" } ? never : k;
}[keyof T];
export type RequiredOutProps<T extends $ZodShape> = {
  [k in RequiredOutKeys<T>]: T[k]["~output"];
};

export type Props<T extends $ZodShape> = {
  [k in keyof T]: T[k]["~output"];
};

type asdf = Props<util.ExtractIndexSignature<Shape>>;
export type $InferObjectOutput<T extends $ZodShape> = util.Flatten<
  OptionalOutProps<util.OmitIndexSignature<T>> &
    RequiredOutProps<util.OmitIndexSignature<T>> &
    Props<util.ExtractIndexSignature<T>>
>;

interface Test<out T> {
  a: T;
}

const test: Test<{ [k: string]: unknown }> = {} as Test<{}>;
test.a;
