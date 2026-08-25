import { expect, expectTypeOf, test } from "vitest";
import * as z from "../index.js";

test("basic apply (number)", () => {
  const setCommonNumberChecks = <T extends z.ZodMiniNumber>(schema: T) => {
    return schema.check(z.minimum(0), z.maximum(100));
  };

  const schema = z.nullable(z.number().apply(setCommonNumberChecks));

  expect(() => z.parse(schema, -1)).toThrowError();
  expect(() => z.parse(schema, 101)).toThrowError();
  expect(z.parse(schema, 0)).toBe(0);
  expect(z.parse(schema, null)).toBe(null);
  expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<number | null>();
});

test("The callback's return value becomes the apply's return value.", () => {
  const symbol = Symbol();
  const result = z.number().apply(() => symbol);

  expect(result).toBe(symbol);
  expectTypeOf<typeof result>().toEqualTypeOf<symbol>();
});

test("apply forwards extra args to the callback", () => {
  const calls: unknown[] = [];
  const capture = (schema: z.ZodMiniString, ...args: unknown[]) => {
    calls.push(schema, ...args);
    return schema;
  };

  const schema = z.string();
  const result = schema.apply(capture, "id", 42);

  expect(calls[0]).toBe(schema);
  expect(calls[1]).toBe("id");
  expect(calls[2]).toBe(42);
  expect(z.parse(result, "value")).toBe("value");
  expectTypeOf<z.infer<typeof result>>().toEqualTypeOf<string>();
});

test("apply type-checks the extra args", () => {
  const withMin = (schema: z.ZodMiniString, n: number) => schema.check(z.minLength(n));

  expect(z.parse(z.string().apply(withMin, 3), "abcd")).toBe("abcd");
  expectTypeOf(
    z.number().apply<z.ZodMiniNumber>((schema) => schema.check(z.minimum(0)))
  ).toEqualTypeOf<z.ZodMiniNumber>();

  // @ts-expect-error wrong arg type
  z.string().apply(withMin, "3");
  // @ts-expect-error missing arg
  z.string().apply(withMin);
  // @ts-expect-error extra arg for a single-parameter callback
  z.string().apply((schema: z.ZodMiniString) => schema, 3);
});
