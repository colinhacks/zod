import { expect, test } from "vitest";

import * as z from "zod/v4";

test("string format methods", () => {
  const a = z.email().min(10);
  const b = z.email().max(10);
  const c = z.email().length(10);
  const d = z.email().uppercase();
  const e = z.email().lowercase();

  // Positive and negative cases for `a`
  expect(a.safeParse("longemail@example.com").success).toBe(true); // Positive
  expect(a.safeParse("ort@e.co").success).toBe(false); // Negative

  // Positive and negative cases for `b`
  expect(b.safeParse("sho@e.co").success).toBe(true); // Positive
  expect(b.safeParse("longemail@example.com").success).toBe(false); // Negative

  // Positive and negative cases for `c`
  expect(c.safeParse("56780@e.co").success).toBe(true); // Positive
  expect(c.safeParse("shoasdfasdfrt@e.co").success).toBe(false); // Negative

  // Positive and negative cases for `d`
  expect(d.safeParse("EMAIL@EXAMPLE.COM").success).toBe(true); // Positive
  expect(d.safeParse("email@example.com").success).toBe(false); // Negative

  // Positive and negative cases for `e`
  expect(e.safeParse("email@example.com").success).toBe(true); // Positive
  expect(e.safeParse("EMAIL@EXAMPLE.COM").success).toBe(false); // Negative
});
