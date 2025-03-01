import { expect, test } from "vitest";

import * as z from "zod";

test(".nullable()", () => {
  const nullable = z.string().nullable();
  expect(nullable.parse(null)).toBe(null);
  expect(nullable.parse("asdf")).toBe("asdf");
  expect(() => nullable.parse(123)).toThrow();
});

test(".nullable unwrap", () => {
  const schema = z.string().nullable();
  expect(schema).toBeInstanceOf(z.ZodUnion);
  expect(schema.options[0]).toBeInstanceOf(z.ZodString);
  expect(schema.options[1]).toBeInstanceOf(z.ZodNull);
});

test("z.null", () => {
  const n = z.null();
  expect(n.parse(null)).toBe(null);
  expect(() => n.parse("asdf")).toThrow();
});
