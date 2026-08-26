import { expect, expectTypeOf, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";

test("isValid answers like safeParse.success", () => {
  expect(z.isValid(z.string(), "asdf")).toBe(true);
  expect(z.isValid(z.string(), 12)).toBe(false);
  expect(z.isValid(z.number().int().min(0), 5)).toBe(true);
  expect(z.isValid(z.number().int().min(0), -5)).toBe(false);
  const schema = z.object({ a: z.string(), b: z.array(z.number()) });
  expect(z.isValid(schema, { a: "x", b: [1, 2] })).toBe(true);
  expect(z.isValid(schema, { a: "x", b: [1, "2"] })).toBe(false);
  expect(z.isValid(schema, null)).toBe(false);
});

test("isValid runs transforms and refinements for the verdict only", () => {
  const schema = z
    .string()
    .transform((s) => s.length)
    .pipe(z.number().max(3));
  expect(z.isValid(schema, "ab")).toBe(true);
  expect(z.isValid(schema, "abcd")).toBe(false);
  expect(z.isValid(z.coerce.number(), "5")).toBe(true);
});

test("isValid narrows to the input type", () => {
  const value: unknown = "hi";
  if (z.isValid(z.string(), value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
  const transforming = z.string().transform((s) => s.length);
  if (z.isValid(transforming, value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
});

test("isValid throws on async schemas; isValidAsync handles them", async () => {
  const schema = z.string().refine(async (s) => s.length > 2);
  expect(() => z.isValid(schema, "asdf")).toThrow();
  await expect(z.isValidAsync(schema, "asdf")).resolves.toBe(true);
  await expect(z.isValidAsync(schema, "a")).resolves.toBe(false);
  await expect(z.isValidAsync(z.string(), "a")).resolves.toBe(true);
});

test("isValid agrees with the compiled fast path and keeps the callback bound", () => {
  let calls = 0;
  const schema = z.object({
    name: z.string().refine((s) => {
      calls++;
      return s.length > 1;
    }),
  });
  const compiled = z.compile(schema);

  calls = 0;
  expect(z.isValid(compiled, { name: "ok" })).toBe(true);
  expect(calls).toBe(1);

  calls = 0;
  expect(z.isValid(compiled, { name: "x" })).toBe(false);
  expect(calls).toBeLessThanOrEqual(2);

  expect(z.isValid(compiled, { name: 42 })).toBe(false);
  expect(z.isValid(schema, { name: "ok" })).toBe(true);
});

test("isValid is exported from zod/mini", () => {
  expect(zm.isValid(zm.string(), "a")).toBe(true);
  expect(zm.isValid(zm.string(), 1)).toBe(false);
  expect(zm.isValid(zm.object({ a: zm.number() }), { a: 1 })).toBe(true);
});
