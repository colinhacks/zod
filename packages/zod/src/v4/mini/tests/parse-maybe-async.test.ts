import { expect, test } from "vitest";
import * as z from "zod/v4-mini";

test("z.parseMaybeAsync stays sync when nothing is async", () => {
  const result = z.parseMaybeAsync(z.string(), "hi");
  expect(result instanceof Promise).toBe(false);
  expect(result).toBe("hi");
});

test("z.parseMaybeAsync returns a Promise on async refinement", async () => {
  const schema = z.string().check(z.refine(async (v) => v.length > 0));
  const result = z.parseMaybeAsync(schema, "hi");
  expect(result instanceof Promise).toBe(true);
  await expect(result).resolves.toBe("hi");
});

test("z.safeParseMaybeAsync sync success / failure", () => {
  const success = z.safeParseMaybeAsync(z.string(), "hi");
  expect(success instanceof Promise).toBe(false);
  expect(success).toEqual({ success: true, data: "hi" });

  const failure = z.safeParseMaybeAsync(z.string(), 42);
  expect(failure instanceof Promise).toBe(false);
  if (!(failure instanceof Promise)) expect(failure.success).toBe(false);
});

test("zod/mini has no parseMaybeAsync method", () => {
  expect("parseMaybeAsync" in z.string()).toBe(false);
});
