import * as util from "@zod/core/util";
import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

test("basic defaults", () => {
  expect(z.string().default("default").parse(undefined)).toBe("default");
});

test("default with optional", () => {
  const schema = z.string().optional().default("default");
  expect(schema.parse(undefined)).toBe("default");
  expect(schema.unwrap().parse(undefined)).toBe(undefined);
});

test("nonoptional with default", () => {
  const schema = z.string().optional().nonoptional("hi");
  expectTypeOf<typeof schema._input>().toEqualTypeOf<string | undefined>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<string>();
  expect(schema.parse(undefined)).toBe("hi");
});

test("nonoptional in object", () => {
  const schema =z.object({ hi: z.string().optional().nonoptional("hi");})
  expectTypeOf<typeof schema._input>().toEqualTypeOf<string | undefined>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<string>();
  expect(schema.parse(undefined)).toBe("hi");
});

test("default with transform", () => {
  const stringWithDefault = z
    .string()
    .transform((val) => val.toUpperCase())
    .default("default");
  expect(stringWithDefault.parse(undefined)).toBe("default");
  expect(stringWithDefault).toBeInstanceOf(z.ZodDefault);
  expect(stringWithDefault.unwrap()).toBeInstanceOf(z.ZodPipe);
  expect(stringWithDefault.unwrap().in).toBeInstanceOf(z.ZodString);
  expect(stringWithDefault.unwrap().out).toBeInstanceOf(z.ZodTransform);

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string>(true);
});

test("default on existing optional", () => {
  const stringWithDefault = z.string().optional().default("asdf");
  expect(stringWithDefault.parse(undefined)).toBe("asdf");
  expect(stringWithDefault).toBeInstanceOf(z.ZodDefault);
  expect(stringWithDefault.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault.unwrap().unwrap()).toBeInstanceOf(z.ZodString);

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string>(true);
});

test("optional on default", () => {
  const stringWithDefault = z.string().default("asdf").optional();

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, string | undefined>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string | undefined>(true);
});

test("complex chain example", () => {
  const complex = z
    .string()
    .default("asdf")
    .transform((val) => val.toUpperCase())
    .default("qwer")
    .unwrap()
    .optional()
    .default("asdfasdf");

  // expect(complex.parse(undefined)).toBe("ASDFASDF");
  expect(complex.parse(undefined)).toBe("asdfasdf");
});

test("removeDefault", () => {
  const stringWithRemovedDefault = z.string().default("asdf").removeDefault();

  type out = z.output<typeof stringWithRemovedDefault>;
  util.assertEqual<out, string>(true);
});

test("nested", () => {
  const inner = z.string().default("asdf");
  const outer = z.object({ inner }).default({
    inner: "qwer",
  });
  type input = z.input<typeof outer>;
  util.assertEqual<input, { inner?: string | undefined } | undefined>(true);
  type out = z.output<typeof outer>;
  util.assertEqual<out, { inner: string }>(true);
  expect(outer.parse(undefined)).toEqual({ inner: "qwer" });
  expect(outer.parse({})).toEqual({ inner: "asdf" });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: "asdf" });
});

test("chained defaults", () => {
  const stringWithDefault = z.string().default("inner").default("outer");
  const result = stringWithDefault.parse(undefined);
  expect(result).toEqual("outer");
});

test("native enum", () => {
  enum Fruits {
    apple = "apple",
    orange = "orange",
  }

  const schema = z.object({
    fruit: z.enum(Fruits).default(Fruits.apple),
  });

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple });
});

test("enum", () => {
  const schema = z.object({
    fruit: z.enum(["apple", "orange"]).default("apple"),
  });

  expect(schema.parse({})).toEqual({ fruit: "apple" });
});
