import { expect, expectTypeOf, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";

test("validate answers like safeParse.success", () => {
  expect(z.validate(z.string(), "asdf")).toBe(true);
  expect(z.validate(z.string(), 12)).toBe(false);
  expect(z.validate(z.number().int().min(0), 5)).toBe(true);
  expect(z.validate(z.number().int().min(0), -5)).toBe(false);
  const schema = z.object({ a: z.string(), b: z.array(z.number()) });
  expect(z.validate(schema, { a: "x", b: [1, 2] })).toBe(true);
  expect(z.validate(schema, { a: "x", b: [1, "2"] })).toBe(false);
  expect(z.validate(schema, null)).toBe(false);
});

test("validate runs transforms and refinements for the verdict only", () => {
  const schema = z
    .string()
    .transform((s) => s.length)
    .pipe(z.number().max(3));
  expect(z.validate(schema, "ab")).toBe(true);
  expect(z.validate(schema, "abcd")).toBe(false);
  expect(z.validate(z.coerce.number(), "5")).toBe(true);
});

test("validate narrows to the input type", () => {
  const value: unknown = "hi";
  if (z.validate(z.string(), value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
  const transforming = z.string().transform((s) => s.length);
  if (z.validate(transforming, value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
});

test("validate throws on async schemas; validateAsync handles them", async () => {
  const schema = z.string().refine(async (s) => s.length > 2);
  expect(() => z.validate(schema, "asdf")).toThrow();
  await expect(z.validateAsync(schema, "asdf")).resolves.toBe(true);
  await expect(z.validateAsync(schema, "a")).resolves.toBe(false);
  await expect(z.validateAsync(z.string(), "a")).resolves.toBe(true);
  // a promise-returning callback that is not declared async compiles, so the compiled schema must stay off the fast path
  const compiled = z.compile(z.string().refine((s) => Promise.resolve(s.length > 1)));
  await expect(z.validateAsync(compiled, "abc")).resolves.toBe(true);
  await expect(z.validateAsync(compiled, "a")).resolves.toBe(false);
});

test("validate agrees with the compiled fast path and keeps the callback bound", () => {
  let calls = 0;
  const schema = z.object({
    name: z.string().refine((s) => {
      calls++;
      return s.length > 1;
    }),
  });
  const compiled = z.compile(schema);

  calls = 0;
  expect(z.validate(compiled, { name: "ok" })).toBe(true);
  expect(calls).toBe(1);

  calls = 0;
  expect(z.validate(compiled, { name: "x" })).toBe(false);
  // the compiled rejection is definitive, so the interpreted fallback never runs and the callback fires once
  expect(calls).toBe(1);

  expect(z.validate(compiled, { name: 42 })).toBe(false);
  // a ctx can change the verdict, so it still takes the interpreted path
  expect(z.validate(compiled, { name: "x" }, {})).toBe(false);
  expect(z.validate(schema, { name: "ok" })).toBe(true);
});

test("compiled validate still throws where parsing throws", () => {
  // both sides pass but the outputs conflict, which the interpreter answers with a throw — a definitive false would misreport a schema bug
  const unmergeable = z.compile(
    z.intersection(
      z.number(),
      z.number().transform((x) => x + 1)
    ),
    { strict: true }
  );
  expect(() => z.validate(unmergeable, 1234)).toThrow("Unmergable intersection");

  // an async child behind a when-gated check islands at codegen; its thenable at parse time throws like the interpreter
  const gated = z.number().refine(() => Promise.resolve(true));
  (gated._zod.def.checks![0]!._zod.def as { when?: unknown }).when = () => true;
  const compiled = z.compile(z.object({ n: gated }), { strict: true });
  expect(() => z.validate(compiled, { n: 3 })).toThrow(z.core.$ZodAsyncError);
  expect(() => z.validate(z.object({ n: gated }), { n: 3 })).toThrow(z.core.$ZodAsyncError);
});

test("validate is exported from zod/mini", () => {
  expect(zm.validate(zm.string(), "a")).toBe(true);
  expect(zm.validate(zm.string(), 1)).toBe(false);
  expect(zm.validate(zm.object({ a: zm.number() }), { a: 1 })).toBe(true);
});
