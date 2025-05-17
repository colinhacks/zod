// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { z, ZodError } from "../index.ts";

const testEnum = ["pending", "completed", "cancelled"] as const;
const schema = z.looseEnum(testEnum);

test("accepts valid enum values", () => {
  expect(schema.parse("pending")).toBe("pending");
  expect(schema.parse("completed")).toBe("completed");
  expect(schema.parse("cancelled")).toBe("cancelled");
});

test("accepts other string values", () => {
  expect(schema.parse("other-value")).toBe("other-value");
  expect(schema.parse("PENDING")).toBe("PENDING");
  expect(schema.parse("")).toBe("");
});

test("rejects non-string values", () => {
  expect(() => schema.parse(123)).toThrow(ZodError);
  expect(() => schema.parse(null)).toThrow(ZodError);
  expect(() => schema.parse(undefined)).toThrow(ZodError);
  expect(() => schema.parse({})).toThrow(ZodError);
});

test("works with refine()", () => {
  const refined = schema.refine((val) => val.length > 3, {
    message: "Too short",
  });
  expect(refined.parse("long-value")).toBe("long-value");
  expect(() => refined.parse("abc")).toThrow(ZodError);
});

test("provides proper TypeScript inference", () => {
  const result = schema.parse("anything");
  const test: string = result;
  expect(test).toBe("anything");
});
test("works with objects", () => {
  const schema = z.object({
    status: z.looseEnum(["on", "off"] as const),
    id: z.string(),
  });

  expect(schema.parse({ status: "on", id: "1" })).toEqual({
    status: "on",
    id: "1",
  });
  expect(schema.parse({ status: "other", id: "1" })).toEqual({
    status: "other",
    id: "1",
  });
});

test("works with unions", () => {
  const schema = z.union([z.looseEnum(["A", "B"] as const), z.number()]);
  expect(schema.parse("A")).toBe("A");
  expect(schema.parse("C")).toBe("C");
  expect(schema.parse(42)).toBe(42);
});

test("works with transforms", () => {
  const schema = z
    .looseEnum(["yes", "no"] as const)
    .transform((val) => val.toUpperCase());
  expect(schema.parse("yes")).toBe("YES");
  expect(schema.parse("maybe")).toBe("MAYBE");
});

test("handles empty string", () => {
  const schema = z.looseEnum(["A", "B"] as const);
  expect(schema.parse("")).toBe("");
});

test("handles single-value enums", () => {
  const schema = z.looseEnum(["SINGLE"] as const);
  expect(schema.parse("SINGLE")).toBe("SINGLE");
  expect(schema.parse("OTHER")).toBe("OTHER");
});

test("handles very long strings", () => {
  const longString = "a".repeat(10000);
  const schema = z.looseEnum(["short"] as const);
  expect(schema.parse(longString)).toBe(longString);
});
