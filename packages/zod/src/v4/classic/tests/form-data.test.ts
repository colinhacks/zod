import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fd(entries: Record<string, string | string[] | File | undefined>): FormData {
  const form = new FormData();
  for (const [key, val] of Object.entries(entries)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      for (const v of val) form.append(key, v);
    } else {
      form.append(key, val);
    }
  }
  return form;
}

// ---------------------------------------------------------------------------
// Basic string field
// ---------------------------------------------------------------------------

test("parses string fields", () => {
  const schema = z.formData({ name: z.string() });
  const result = schema.parse(fd({ name: "Alice" }));
  expect(result).toEqual({ name: "Alice" });
});

// ---------------------------------------------------------------------------
// Number coercion
// ---------------------------------------------------------------------------

test("coerces number fields", () => {
  const schema = z.formData({ age: z.number() });
  expect(schema.parse(fd({ age: "42" }))).toEqual({ age: 42 });
  expect(schema.parse(fd({ age: "3.14" }))).toEqual({ age: 3.14 });
});

test("fails validation when number is invalid", () => {
  const schema = z.formData({ age: z.number().int().positive() });
  expect(() => schema.parse(fd({ age: "-5" }))).toThrow();
});

test("treats empty number fields as undefined", () => {
  const optionalSchema = z.formData({ age: z.number().optional() });
  expect(optionalSchema.parse(fd({ age: "" }))).toEqual({ age: undefined });

  const requiredSchema = z.formData({ age: z.number() });
  expect(() => requiredSchema.parse(fd({ age: "" }))).toThrow();
});

// ---------------------------------------------------------------------------
// Boolean / checkbox coercion
// ---------------------------------------------------------------------------

test("coerces boolean: 'on' → true", () => {
  const schema = z.formData({ agree: z.boolean() });
  expect(schema.parse(fd({ agree: "on" }))).toEqual({ agree: true });
});

test("coerces boolean: 'true' → true", () => {
  const schema = z.formData({ agree: z.boolean() });
  expect(schema.parse(fd({ agree: "true" }))).toEqual({ agree: true });
});

test("coerces boolean: '1' → true", () => {
  const schema = z.formData({ agree: z.boolean() });
  expect(schema.parse(fd({ agree: "1" }))).toEqual({ agree: true });
});

test("absent boolean key → false (unchecked checkbox)", () => {
  const schema = z.formData({ agree: z.boolean() });
  // 'agree' not in FormData at all — classic unchecked-checkbox behaviour
  expect(schema.parse(fd({}))).toEqual({ agree: false });
});

test("coerces boolean: 'false' → false", () => {
  const schema = z.formData({ agree: z.boolean() });
  expect(schema.parse(fd({ agree: "false" }))).toEqual({ agree: false });
});

// ---------------------------------------------------------------------------
// Date coercion
// ---------------------------------------------------------------------------

test("coerces date fields", () => {
  const schema = z.formData({ dob: z.date() });
  const result = schema.parse(fd({ dob: "2000-01-15" }));
  expect(result.dob).toBeInstanceOf(Date);
  expect(result.dob.toISOString().startsWith("2000-01-15")).toBe(true);
});

// ---------------------------------------------------------------------------
// Array (multi-value) fields
// ---------------------------------------------------------------------------

test("coerces array fields via getAll()", () => {
  const schema = z.formData({ tags: z.array(z.string()) });
  expect(schema.parse(fd({ tags: ["a", "b", "c"] }))).toEqual({
    tags: ["a", "b", "c"],
  });
});

test("array of numbers is coerced element-wise", () => {
  const schema = z.formData({ scores: z.array(z.number()) });
  expect(schema.parse(fd({ scores: ["1", "2", "3"] }))).toEqual({
    scores: [1, 2, 3],
  });
});

test("single-value array field", () => {
  const schema = z.formData({ tags: z.array(z.string()) });
  expect(schema.parse(fd({ tags: ["only"] }))).toEqual({ tags: ["only"] });
});

test("absent array field → empty array passes min(0)", () => {
  const schema = z.formData({ tags: z.array(z.string()) });
  expect(schema.parse(fd({}))).toEqual({ tags: [] });
});

// ---------------------------------------------------------------------------
// File fields
// ---------------------------------------------------------------------------

test("passes File objects through unchanged", () => {
  const schema = z.formData({ avatar: z.file() });
  const file = new File(["content"], "avatar.png", { type: "image/png" });
  const form = new FormData();
  form.append("avatar", file);
  const result = schema.parse(form);
  expect(result.avatar).toBe(file);
});

test("rejects File values for non-file fields", () => {
  const schema = z.formData({ name: z.string() });
  const result = schema.safeParse(fd({ name: new File(["content"], "name.txt") }));
  expect(result.success).toBe(false);
});

// ---------------------------------------------------------------------------
// Optional, nullable, default fields
// ---------------------------------------------------------------------------

test("optional field absent from FormData", () => {
  const schema = z.formData({ nick: z.string().optional() });
  expect(schema.parse(fd({}))).toEqual({ nick: undefined });
});

test("default field absent from FormData uses default", () => {
  const schema = z.formData({ role: z.string().default("user") });
  expect(schema.parse(fd({}))).toEqual({ role: "user" });
});

test("nullable field present", () => {
  const schema = z.formData({ bio: z.string().nullable() });
  expect(schema.parse(fd({ bio: "hello" }))).toEqual({ bio: "hello" });
});

// ---------------------------------------------------------------------------
// Mixed / realistic form
// ---------------------------------------------------------------------------

test("realistic signup form", () => {
  const signupSchema = z.formData({
    username: z.string().min(3),
    email: z.email(),
    age: z.number().int().min(13),
    agree: z.boolean(),
    tags: z.array(z.string()),
  });

  const data = fd({
    username: "alice",
    email: "alice@example.com",
    age: "25",
    agree: "on",
    tags: ["typescript", "zod"],
  });

  const result = signupSchema.parse(data);

  expect(result).toEqual({
    username: "alice",
    email: "alice@example.com",
    age: 25,
    agree: true,
    tags: ["typescript", "zod"],
  });
});

test("safeParse returns typed errors on validation failure", () => {
  const schema = z.formData({ age: z.number().min(18) });
  const result = schema.safeParse(fd({ age: "5" }));
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.length).toBeGreaterThan(0);
  }
});

// ---------------------------------------------------------------------------
// Type-level inference
// ---------------------------------------------------------------------------

test("inferred type is correct", () => {
  const schema = z.formData({
    name: z.string(),
    age: z.number(),
    active: z.boolean(),
  });

  type Result = z.infer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    name: string;
    age: number;
    active: boolean;
  }>();
});

// ---------------------------------------------------------------------------
// Non-FormData input → custom error
// ---------------------------------------------------------------------------

test("rejects non-FormData input with a clear error", () => {
  const schema = z.formData({ name: z.string() });
  const result = schema.safeParse({ name: "Alice" });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0]?.message).toMatch(/FormData/i);
  }
});
