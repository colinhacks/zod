// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { z } from "../index.ts";
import { util } from "../helpers/util.ts";

test("basic defaultOnMismatch", () => {
  expect(z.string().defaultOnMismatch("default").parse(undefined)).toBe("default");
});

test("defaultOnMismatch replace wrong types", () => {
  expect(z.string().defaultOnMismatch("default").parse(true)).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse(true)).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse(15)).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse([])).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse(new Map())).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse(new Set())).toBe("default");
  expect(z.string().defaultOnMismatch("default").parse({})).toBe("default");
});

test("defaultOnMismatch with transform", () => {
  const stringWithDefault = z
    .string()
    .transform((val) => val.toUpperCase())
    .defaultOnMismatch("default");
  expect(stringWithDefault.parse(undefined)).toBe("DEFAULT");
  expect(stringWithDefault.parse(15)).toBe("DEFAULT");
  expect(stringWithDefault).toBeInstanceOf(z.ZodDefaultOnMismatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodEffects);
  expect(stringWithDefault._def.innerType._def.schema).toBeInstanceOf(
    z.ZodSchema
  );

  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string> = true;
  f1;
  f2;
});

test("defaultOnMismatch on existing optional", () => {
  const stringWithDefault = z.string().optional().defaultOnMismatch("asdf");
  expect(stringWithDefault.parse(undefined)).toBe("asdf");
  expect(stringWithDefault.parse(15)).toBe("asdf");
  expect(stringWithDefault).toBeInstanceOf(z.ZodDefaultOnMismatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType._def.innerType).toBeInstanceOf(
    z.ZodString
  );

  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string> = true;
  f1;
  f2;
});

test("optional on defaultOnMismatch", () => {
  const stringWithDefault = z.string().defaultOnMismatch("asdf").optional();

  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string | undefined> = true;
  f1;
  f2;
});

test("complex chain example", () => {
  const complex = z
    .string()
    .defaultOnMismatch("asdf")
    .transform((val) => val + "!")
    .transform((val) => val.toUpperCase())
    .defaultOnMismatch("qwer")
    .removeDefault()
    .optional()
    .defaultOnMismatch("asdfasdf");

  expect(complex.parse(undefined)).toBe("ASDFASDF!");
  expect(complex.parse(15)).toBe("ASDFASDF!");
  expect(complex.parse(true)).toBe("ASDFASDF!");
});

test("removeDefault", () => {
  const stringWithRemovedDefault = z.string().defaultOnMismatch("asdf").removeDefault();

  type out = z.output<typeof stringWithRemovedDefault>;
  const f2: util.AssertEqual<out, string> = true;
  f2;
});

test("nested", () => {
  const inner = z.string().defaultOnMismatch("asdf");
  const outer = z.object({ inner }).defaultOnMismatch({
    inner: "asdf",
  });
  type input = z.input<typeof outer>;
  const f1: util.AssertEqual<
    input,
    { inner?: string | undefined } | undefined
  > = true;
  type out = z.output<typeof outer>;
  const f2: util.AssertEqual<out, { inner: string }> = true;
  f1;
  f2;
  expect(outer.parse(undefined)).toEqual({ inner: "asdf" });
  expect(outer.parse({})).toEqual({ inner: "asdf" });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: "asdf" });
});

test("chained defaultOnMismatch", () => {
  const stringWithDefault = z.string().defaultOnMismatch("inner").defaultOnMismatch("outer");
  const result = stringWithDefault.parse(undefined);
  expect(result).toEqual("outer");
  const resultDiff = stringWithDefault.parse(5);
  expect(resultDiff).toEqual("outer");
});

test("factory", () => {
  z.ZodDefaultOnMismatch.create(z.string()).parse(undefined);
});

test("native enum", () => {
  enum Fruits {
    apple = "apple",
    orange = "orange",
  }

  const schema = z.object({
    fruit: z.nativeEnum(Fruits).defaultOnMismatch(Fruits.apple),
  });

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple });
  expect(schema.parse({fruit:15})).toEqual({ fruit: Fruits.apple });
});

test("enum", () => {
  const schema = z.object({
    fruit: z.enum(["apple", "orange"]).defaultOnMismatch("apple"),
  });

  expect(schema.parse({})).toEqual({ fruit: "apple" });
  expect(schema.parse({fruit:true})).toEqual({ fruit: "apple" });
  expect(schema.parse({fruit:15})).toEqual({ fruit: "apple" });
});
