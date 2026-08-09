import { expect, test } from "vitest";
import * as z from "zod/v4-mini";

// Mini-side coverage for #5379 — methods are wired the same way on ZodMiniType.

test("ZodMiniType.parseMaybeAsync stays sync when nothing is async", () => {
  const result = z.string().parseMaybeAsync("hi");
  expect(result instanceof Promise).toBe(false);
  expect(result).toBe("hi");
});

test("ZodMiniType.parseMaybeAsync returns a Promise on async refinement", async () => {
  const schema = z.string().check(z.refine(async (v) => v.length > 0));
  const result = schema.parseMaybeAsync("hi");
  expect(result instanceof Promise).toBe(true);
  await expect(result).resolves.toBe("hi");
});

test("ZodMiniType.safeParseMaybeAsync sync success / failure", () => {
  const success = z.string().safeParseMaybeAsync("hi");
  expect(success instanceof Promise).toBe(false);
  expect(success).toEqual({ success: true, data: "hi" });

  const failure = z.string().safeParseMaybeAsync(42);
  expect(failure instanceof Promise).toBe(false);
  if (!(failure instanceof Promise)) expect(failure.success).toBe(false);
});
