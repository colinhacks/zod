import { z } from "./src/index";

z;

function test<T extends Readonly<object>>(args: T): "readonly";
function test<T extends object>(args: T): "regular";
function test(...args: any[]) {
  return args as any;
}

const v1 = test({ arg: "asdf" });

type asdf = {
  readonly arg: string;
};

type removeReadonly<T> = {
  -readonly [K in keyof T]: T[K];
};
type allReadonly<T> = Readonly<T>;

type hasReadonly<T> = allReadonly<T> extends infer U
  ? U extends T
    ? true
    : false
  : never;

type f1 = objectContainsReadonly<{ a: string; readonly b: string }>;
type f2 = objectContainsReadonly<{ a: string; b: string }>;
// type f2 = hasReadonlyKeys<{ a: string, b: string }>;

declare function test2<T>(arg: T): "noreadonly";
declare function test2<T>(arg: Readonly<T>): "readonly";
const asdf = test2({ arg: 3 });
const asd2 = test2({
  get arg() {
    return 3;
  },
});
const sldkjf = {
  get arg() {
    return 3;
  },
};

const arg: { arg: string } = { arg: "asdf" } as const;

// check if a type contains any readonly properties
type objectContainsReadonly<T> = util.AssertEqual<
  T,
  {
    -readonly [k in keyof T]: T[k];
  }
> extends true
  ? false
  : true;

// type exactOptionalPropertyTypes = {
//   b?: string | undefined;
// } extends { b?: string }
//   ? false
//   : true;
// extends true
//   ? false
//   : true;
// type asdf = exactOptionalPropertyTypesIsEnabled;

const p1 = z.object({
  arg: z.string().optional(),
  "arg2?": z.string().optional(),
});
type p1 = z.infer<typeof p1>;
