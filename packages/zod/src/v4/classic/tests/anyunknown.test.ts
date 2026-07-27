import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test("check any inference", () => {
  const t1 = z.any();
  t1.optional();
  t1.nullable();
  type t1 = z.infer<typeof t1>;
  expectTypeOf<t1>().toEqualTypeOf<any>();
});

test("check unknown inference", () => {
  const t1 = z.unknown();
  t1.optional();
  t1.nullable();
  type t1 = z.infer<typeof t1>;
  expectTypeOf<t1>().toEqualTypeOf<unknown>();
});

test("check never inference", () => {
  const t1 = z.never();
  expect(() => t1.parse(undefined)).toThrow();
  expect(() => t1.parse("asdf")).toThrow();
  expect(() => t1.parse(null)).toThrow();
});

test("any object property tolerates an absent key (#5997)", () => {
  const schema = z.object({ foo: z.any() });
  const result = schema.safeParse({});
  expect(result.success).toBe(true);
  expect(result.data).toEqual({});
});

test("unknown object property tolerates an absent key", () => {
  const schema = z.object({ foo: z.unknown() });
  const result = schema.safeParse({});
  expect(result.success).toBe(true);
  expect(result.data).toEqual({});
});
