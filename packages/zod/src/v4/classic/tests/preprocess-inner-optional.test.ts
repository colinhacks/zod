import { expect, test } from "vitest";
import * as z from "zod/v4";

// Regression tests for #5917.

// OP's first case: `.optional()` outside preprocess. Worked before, must keep working.
test("optional outside z.preprocess accepts missing key", () => {
  const schema = z.object({
    optionalNumber: z.preprocess((v) => v, z.number()).optional(),
  });
  expect(schema.safeParse({}).success).toBe(true);
});

// OP's second case: `.optional()` inside preprocess. Regressed in v4.4.0 → main bug.
test("optional inside z.preprocess accepts missing key (#5917 main bug)", () => {
  const schema = z.object({
    optionalNumber: z.preprocess((v) => v, z.number().optional()),
  });
  const result = schema.safeParse({});
  expect(result.success).toBe(true);
});

// Before the fix the failure mode was a specific error message — keep it pinned
// so we know what to look for if the pipe optin logic regresses again.
test("optional inside z.preprocess no longer reports `expected nonoptional`", () => {
  const schema = z.object({
    optionalNumber: z.preprocess((v) => v, z.number().optional()),
  });
  const result = schema.safeParse({});
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues));
  }
});

// Both placements should produce the same parsed shape for present values too.
test("both placements parse a present value identically", () => {
  const inside = z.object({ n: z.preprocess((v) => v, z.number().optional()) });
  const outside = z.object({ n: z.preprocess((v) => v, z.number()).optional() });
  expect(inside.safeParse({ n: 7 })).toEqual(outside.safeParse({ n: 7 }));
});

// Sanity: removing `.optional()` entirely must still reject missing keys.
test("z.preprocess without optional rejects missing keys", () => {
  const schema = z.object({
    requiredNumber: z.preprocess((v) => v, z.number()),
  });
  expect(schema.safeParse({}).success).toBe(false);
});

// Sanity: regular `pipe(realSchema, transform)` (NOT preprocess) keeps the old
// left-side optin behaviour — only the transform-on-the-left case shifts.
test("pipe with a real schema on the left keeps left-side optin", () => {
  const schema = z.object({
    s: z.string().pipe(z.transform((v) => v.toUpperCase())),
  });
  expect(schema.safeParse({}).success).toBe(false);
});
