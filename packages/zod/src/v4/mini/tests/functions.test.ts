import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/mini";

const args1 = z.tuple([z.string()]);
const returns1 = z.number();
const func1 = z.function({
  input: args1,
  output: returns1,
});

test("function parsing", () => {
  const parsed = func1.implement((arg: any) => arg.length);
  const result = parsed("asdf");
  expect(result).toBe(4);
});

test("parsed function fail: invalid return", () => {
  // @ts-expect-error
  const parsed = func1.implement((x: string) => x);
  expect(() => parsed("asdf")).toThrow();
});

test("parsed function fail: invalid arg", () => {
  const parsed = func1.implement((x: string) => x.length);
  expect(() => parsed(13 as any)).toThrow();
});

test("function inference (tuple input)", () => {
  type T = (typeof func1)["_input"];
  expectTypeOf<T>().toEqualTypeOf<(k: string) => number>();
});

test("method parsing (sync)", () => {
  const methodObject = z.object({
    property: z.number(),
    method: z
      .function()
      .input(z.tuple([z.string()]))
      .output(z.number()),
  });
  const methodInstance = {
    property: 3,
    method: function (s: string) {
      return s.length + this.property;
    },
  };
  const parsed = z.parse(methodObject, methodInstance);
  expect(parsed.method("length=8")).toBe(11);
});

test("method parsing (async)", async () => {
  const methodObject = z.object({
    property: z.number(),
    method: z.function().input([z.string()]).output(z.promise(z.number())),
  });
  const methodInstance = {
    property: 3,
    method: async function (s: string) {
      return s.length + this.property;
    },
  };
  const parsed = z.parse(methodObject, methodInstance);
  expect(await parsed.method("length=8")).toBe(11);
});

test("args method chaining", () => {
  const t1 = z.function();
  type T1 = (typeof t1)["_input"];
  expectTypeOf<T1>().toEqualTypeOf<(...args_1: never[]) => unknown>();

  const t2args = z.tuple([z.string()], z.unknown());
  const t2 = t1.input(t2args);
  type T2 = (typeof t2)["_input"];
  expectTypeOf<T2>().toEqualTypeOf<(arg: string, ...args_1: unknown[]) => unknown>();

  const t3 = t2.output(z.boolean());
  type T3 = (typeof t3)["_input"];
  expectTypeOf<T3>().toEqualTypeOf<(arg: string, ...args_1: unknown[]) => boolean>();
});

const args2 = z.tuple([
  z.object({
    f1: z.number(),
    f2: z.nullable(z.string()),
    f3: z.optional(z.array(z.optional(z.boolean()))),
  }),
]);
const returns2 = z.union([z.string(), z.number()]);
const func2 = z.function({ input: args2, output: returns2 });

test("function inference (complex tuple)", () => {
  type T = (typeof func2)["_input"];
  expectTypeOf<T>().toEqualTypeOf<
    (arg: { f3?: (boolean | undefined)[] | undefined; f1: number; f2: string | null }) => string | number
  >();
});

test("valid function run (complex)", () => {
  const validFunc = func2.implement((_x) => {
    _x.f2;
    _x.f3?.[0];
    return "adf" as any;
  });

  validFunc({ f1: 21, f2: "asdf", f3: [true, false] });
});

const args3 = [
  z.object({
    f1: z.number(),
    f2: z.nullable(z.string()),
    f3: z.optional(z.array(z.optional(z.boolean()))),
  }),
] as const;
const returns3 = z.union([z.string(), z.number()]);
const func3 = z.function({ input: args3, output: returns3 });

test("function inference (array input)", () => {
  type T = (typeof func3)["_input"];
  expectTypeOf<T>().toEqualTypeOf<
    (arg: { f3?: (boolean | undefined)[] | undefined; f1: number; f2: string | null }) => string | number
  >();
});

test("array inputs (implement)", () => {
  const a = z.function({
    input: [
      z.object({
        name: z.string(),
        age: z.int(),
      }),
    ],
    output: z.string(),
  });

  const parsed = a.implement((args) => `${args.age}`);
  expect(parsed({ name: "x", age: 2 })).toEqual("2");

  const b = z.function({
    input: [
      z.object({
        name: z.string(),
        age: z.int(),
      }),
    ],
  });
  const parsedB = b.implement((args) => `${args.age}`);
  expect(parsedB({ name: "x", age: 3 })).toEqual("3");
});

test("input validation error", () => {
  const schema = z.function({ input: z.tuple([z.string()]), output: z.void() });
  const fn = schema.implement(() => 1234 as any);

  // @ts-expect-error
  const checker = () => fn();
  expect(() => checker()).toThrow();
});

test("output validation error", () => {
  const schema = z.function({ input: z.tuple([]), output: z.string() });
  const fn = schema.implement(() => 1234 as any);
  expect(() => fn()).toThrow();
});

test("function with async refinements", async () => {
  const schema = z
    .function()
    .input([z.string().check(z.refine(async (val: string) => val.length > 10))])
    .output(z.promise(z.number().check(z.refine(async (val: number) => val > 10))));

  const func = schema.implementAsync(async (val) => {
    return val.length;
  });
  const results: string[] = [];
  try {
    await func("asdfasdf");
    results.push("success");
  } catch (_) {
    results.push("fail");
  }
  try {
    await func("asdflkjasdflkjsf");
    results.push("success");
  } catch (_) {
    results.push("fail");
  }

  expect(results).toEqual(["fail", "success"]);
});

test("non async function with async refinements should fail", async () => {
  const func = z
    .function()
    .input([z.string().check(z.refine(async (val: string) => val.length > 10))])
    .output(z.number().check(z.refine(async (val: number) => val > 10)))
    .implement((val: string) => {
      return val.length;
    });

  const results: string[] = [];
  try {
    // calling a sync wrapper when async refinements exist should reject
    await func("asdasdfasdffasdf");
    results.push("success");
  } catch (_) {
    results.push("fail");
  }

  expect(results).toEqual(["fail"]);
});

test("extra parameters with rest", () => {
  const maxLength5 = z
    .function()
    .input([z.string()], z.unknown())
    .output(z.boolean())
    .implement((str, _arg, _qewr) => str.length <= 5);

  const filteredList = ["apple", "orange", "pear", "banana", "strawberry"].filter(maxLength5);
  expect(filteredList.length).toEqual(2);
});
