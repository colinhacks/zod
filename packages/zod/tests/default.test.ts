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

  expect(stringWithDefault.parse(undefined)).toBe(undefined);
});

// test("complex chain example", () => {
//   const complex = z
//     .string()
//     .default("asdf")
//     .transform((val) => val.toUpperCase())
//     .default("qwer")
//     .unwrap()
//     .optional()
//     .default("asdfasdf");

//   expect(complex.parse(undefined)).toBe("asdfasdf");
// });

test("removeDefault", () => {
  const stringWithRemovedDefault = z.string().default("asdf").removeDefault();

  type out = z.output<typeof stringWithRemovedDefault>;
  util.assertEqual<out, string>(true);
});

test("apply default at output", () => {
  const schema = z
    .string()
    .transform((_) => (Math.random() > 0 ? undefined : _))
    .default("asdf");
  expect(schema.parse("")).toEqual("asdf");
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

test("object optionality", () => {
  const schema = z.object({
    hi: z.string().default("hi"),
  });
  type schemaInput = z.input<typeof schema>;
  type schemaOutput = z.output<typeof schema>;
  expectTypeOf<schemaInput>().toEqualTypeOf<{ hi?: string | undefined }>();
  expectTypeOf<schemaOutput>().toEqualTypeOf<{ hi: string }>();
  expect(schema.parse({})).toEqual({
    hi: "hi",
  });
});

test("interface optionality", () => {
  const schema = z.interface({
    "?hi": z.string().default("hi"),
  });

  expect(
    schema.parse({
      hi: "hi",
    })
  ).toEqual({
    hi: "hi",
  });
});
