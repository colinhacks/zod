import { expect, test } from "vitest";
import * as z from "zod/v4";

test("parseMaybeAsync returns the value sync when no async work is involved", () => {
  const schema = z.string();
  const result = schema.parseMaybeAsync("hello");
  expect(result instanceof Promise).toBe(false);
  expect(result).toBe("hello");
});

test("parseMaybeAsync returns a Promise when an async refinement is encountered", async () => {
  const schema = z.string().refine(async (v) => v.length > 0);
  const result = schema.parseMaybeAsync("hello");
  expect(result instanceof Promise).toBe(true);
  await expect(result).resolves.toBe("hello");
});

test("parseMaybeAsync throws sync on validation failure with no async work", () => {
  const schema = z.string();
  expect(() => schema.parseMaybeAsync(42)).toThrow(z.ZodError);
});

test("parseMaybeAsync rejects with ZodError on async validation failure", async () => {
  const schema = z.string().refine(async (v) => v.length > 5, { message: "too short" });
  const result = schema.parseMaybeAsync("hi");
  expect(result instanceof Promise).toBe(true);
  await expect(result).rejects.toThrow(z.ZodError);
});

test("safeParseMaybeAsync mirrors parseMaybeAsync but wraps the result", () => {
  const sync = z.string().safeParseMaybeAsync("hi");
  expect(sync instanceof Promise).toBe(false);
  expect(sync).toEqual({ success: true, data: "hi" });

  const failure = z.string().safeParseMaybeAsync(42);
  expect(failure instanceof Promise).toBe(false);
  if (!(failure instanceof Promise)) expect(failure.success).toBe(false);
});

test("safeParseMaybeAsync awaits async refinements (success)", async () => {
  const schema = z.string().refine(async (v) => v.length > 0);
  const result = schema.safeParseMaybeAsync("hi");
  expect(result instanceof Promise).toBe(true);
  const settled = await result;
  expect(settled).toEqual({ success: true, data: "hi" });
});

test("safeParseMaybeAsync awaits async refinements (failure)", async () => {
  const schema = z.string().refine(async (v) => v.length > 5, { message: "too short" });
  const result = schema.safeParseMaybeAsync("hi");
  expect(result instanceof Promise).toBe(true);
  const settled = await result;
  expect(settled.success).toBe(false);
  if (!settled.success) expect(settled.error.issues[0].message).toBe("too short");
});

test("async is remembered per instance, not inherited by clones", async () => {
  const schema = z.string().refine(async () => true);
  await schema.parseMaybeAsync("a");
  expect(schema._zod.asyncSeen).toBe(true);
  expect(schema.clone()._zod.asyncSeen).toBeUndefined();
});

test("a union stays async once one branch has gone async", async () => {
  const schema = z.union([z.number(), z.string().refine(async () => true)]);
  expect(schema.parseMaybeAsync(1)).toBe(1);
  await schema.parseMaybeAsync("a");
  expect(schema.parseMaybeAsync(1)).toBeInstanceOf(Promise);
});

test("sync steps run twice only on the first async parse", async () => {
  let n = 0;
  const schema = z
    .string()
    .transform((v) => {
      n++;
      return v;
    })
    .refine(async () => true);
  await schema.parseMaybeAsync("a");
  expect(n).toBe(2);
  await schema.parseMaybeAsync("a");
  expect(n).toBe(3);
});

test("a user throw propagates sync and does not mark the schema async", () => {
  const schema = z.string().refine(() => {
    throw new Error("boom");
  });
  expect(() => schema.parseMaybeAsync("a")).toThrow("boom");
  expect(schema._zod.asyncSeen).toBeUndefined();
});
