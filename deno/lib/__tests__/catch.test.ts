// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { z } from "../index.ts";
import { util } from "../helpers/util.ts";

test("basic catch", () => {
  expect(z.string().catch("default").parse(undefined)).toBe("default");
});

test("catch fn does not run when parsing succeeds", () => {
  let isCalled = false;
  const cb = () => {
    isCalled = true;
    return "asdf";
  };
  expect(z.string().catch(cb).parse("test")).toBe("test");
  expect(isCalled).toEqual(false);
});

test("basic catch async", async () => {
  const result = await z.string().catch("default").parseAsync(1243);
  expect(result).toBe("default");
});

test("catch replace wrong types", () => {
  expect(z.string().catch("default").parse(true)).toBe("default");
  expect(z.string().catch("default").parse(true)).toBe("default");
  expect(z.string().catch("default").parse(15)).toBe("default");
  expect(z.string().catch("default").parse([])).toBe("default");
  expect(z.string().catch("default").parse(new Map())).toBe("default");
  expect(z.string().catch("default").parse(new Set())).toBe("default");
  expect(z.string().catch("default").parse({})).toBe("default");
});

test("catch with transform", () => {
  const stringWithDefault = z
    .string()
    .transform((val) => val.toUpperCase())
    .catch("default");
  expect(stringWithDefault.parse(undefined)).toBe("default");
  expect(stringWithDefault.parse(15)).toBe("default");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodEffects);
  expect(stringWithDefault._def.innerType._def.schema).toBeInstanceOf(
    z.ZodSchema
  );

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string>(true);
});

test("catch on existing optional", () => {
  const stringWithDefault = z.string().optional().catch("asdf");
  expect(stringWithDefault.parse(undefined)).toBe(undefined);
  expect(stringWithDefault.parse(15)).toBe("asdf");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType._def.innerType).toBeInstanceOf(
    z.ZodString
  );

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string>(true);
});

test("optional on catch", () => {
  const stringWithDefault = z.string().catch("asdf").optional();

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string | undefined>(true);
});

test("complex chain example", () => {
  const complex = z
    .string()
    .catch("asdf")
    .transform((val) => val + "!")
    .transform((val) => val.toUpperCase())
    .catch("qwer")
    .removeDefault()
    .optional()
    .catch("asdfasdf");

  expect(complex.parse("qwer")).toBe("QWER!");
  expect(complex.parse(15)).toBe("ASDF!");
  expect(complex.parse(true)).toBe("ASDF!");
});

test("removeDefault", () => {
  const stringWithRemovedDefault = z.string().catch("asdf").removeDefault();

  type out = z.output<typeof stringWithRemovedDefault>;
  util.assertEqual<out, string>(true);
});

test("nested", () => {
  const inner = z.string().catch("asdf");
  const outer = z.object({ inner }).catch({
    inner: "asdf",
  });
  type input = z.input<typeof outer>;
  util.assertEqual<input, { inner?: string | undefined } | undefined>(true);
  type out = z.output<typeof outer>;
  util.assertEqual<out, { inner: string }>(true);
  expect(outer.parse(undefined)).toEqual({ inner: "asdf" });
  expect(outer.parse({})).toEqual({ inner: "asdf" });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: "asdf" });
});

test("chained catch", () => {
  const stringWithDefault = z.string().catch("inner").catch("outer");
  const result = stringWithDefault.parse(undefined);
  expect(result).toEqual("inner");
  const resultDiff = stringWithDefault.parse(5);
  expect(resultDiff).toEqual("inner");
});

test("factory", () => {
  z.ZodCatch.create(z.string(), {
    default: "asdf",
  }).parse(undefined);
});

test("native enum", () => {
  enum Fruits {
    apple = "apple",
    orange = "orange",
  }

  const schema = z.object({
    fruit: z.nativeEnum(Fruits).catch(Fruits.apple),
  });

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: Fruits.apple });
});

test("enum", () => {
  const schema = z.object({
    fruit: z.enum(["apple", "orange"]).catch("apple"),
  });

  expect(schema.parse({})).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: true })).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: "apple" });
});
