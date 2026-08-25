import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test("basic apply (object)", () => {
  const schema = z
    .object({
      a: z.number(),
      b: z.string(),
    })
    .apply((s) => s.omit({ b: true }))
    .apply((s) => s.extend({ c: z.boolean() }));

  expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "a": {
          "type": "number",
        },
        "c": {
          "type": "boolean",
        },
      },
      "required": [
        "a",
        "c",
      ],
      "type": "object",
    }
  `);
  expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<{
    a: number;
    c: boolean;
  }>();
});

test("basic apply (number)", () => {
  const setCommonNumberChecks = <T extends z.ZodNumber>(schema: T) => {
    return schema.min(0).max(100);
  };

  const schema = z.number().apply(setCommonNumberChecks).nullable();

  expect(() => schema.parse(-1)).toThrowError();
  expect(() => schema.parse(101)).toThrowError();
  expect(schema.parse(0)).toBe(0);
  expect(schema.parse(null)).toBe(null);
  expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<number | null>();
});

test("The callback's return value becomes the apply's return value.", () => {
  const symbol = Symbol();
  const result = z.number().apply(() => symbol);

  expect(result).toBe(symbol);
  expectTypeOf<typeof result>().toEqualTypeOf<symbol>();
});

test("apply forwards extra args to the callback", () => {
  const withDefault = <TSchema extends z.ZodType>(schema: TSchema, defaultValue: z.output<TSchema>) => {
    return schema.nullish().transform((x) => x ?? defaultValue);
  };

  const schema = z.string().apply(withDefault, "default-id");

  expect(schema.parse(undefined)).toBe("default-id");
  expect(schema.parse(null)).toBe("default-id");
  expect(schema.parse("value")).toBe("value");
  expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<string>();
});

test("apply type-checks the extra args", () => {
  const withMin = (schema: z.ZodString, n: number) => schema.min(n);

  expect(z.string().apply(withMin, 3).parse("abcd")).toBe("abcd");
  expectTypeOf(z.number().apply<z.ZodNumber>((schema) => schema.min(0))).toEqualTypeOf<z.ZodNumber>();

  // @ts-expect-error wrong arg type
  z.string().apply(withMin, "3");
  // @ts-expect-error missing arg
  z.string().apply(withMin);
  // @ts-expect-error extra arg for a single-parameter callback
  z.string().apply((schema: z.ZodString) => schema, 3);
});
