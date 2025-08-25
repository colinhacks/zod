import { expect, test } from "vitest";
import * as z from "zod/v4";

test("jsonString() validates JSON syntax", () => {
  const schema = z.jsonString();

  // Valid JSON
  expect(schema.parse("{}")).toBe("{}");
  expect(schema.parse("42")).toBe("42");
  expect(schema.parse('"hello"')).toBe('"hello"');
  expect(schema.parse("true")).toBe("true");
  expect(schema.parse("null")).toBe("null");
  expect(schema.parse("[1,2,3]")).toBe("[1,2,3]");

  // Invalid JSON
  expect(() => schema.parse("")).toThrow();
  expect(() => schema.parse("invalid")).toThrow();
  expect(() => schema.parse("{")).toThrow();
  expect(() => schema.parse('{"key":}')).toThrow();
  expect(() => schema.parse('{"key": "value",}')).toThrow();
});

test("jsonString() preserves whitespace and formatting", () => {
  const schema = z.jsonString();
  expect(schema.parse('  {"key": "value"}  ')).toBe('  {"key": "value"}  ');
  expect(schema.parse('\n\t{"key": "value"}\n')).toBe('\n\t{"key": "value"}\n');
});

test("jsonString() handles unicode and special characters", () => {
  const schema = z.jsonString();
  expect(schema.parse('"Hello 世界"')).toBe('"Hello 世界"');
  expect(schema.parse('"🎉🎊🎈"')).toBe('"🎉🎊🎈"');
  expect(schema.parse('"\\"quoted\\""')).toBe('"\\"quoted\\""');
  expect(schema.parse('{"key世界": "value"}')).toBe('{"key世界": "value"}');
});

test("jsonString() rejects malformed nested structures", () => {
  const schema = z.jsonString();
  expect(() => schema.parse('{"a": {"b": {"c":}')).toThrow();
  expect(() => schema.parse('{"a": [1, 2, 3}')).toThrow();
  expect(() => schema.parse('{"a": [1, 2, 3]]')).toThrow();
});

test("jsonString() with inner schema parses and validates", () => {
  const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  });
  const schema = z.jsonString(userSchema);

  // Valid
  const valid = schema.parse('{"id": 123, "name": "John", "email": "john@example.com"}');
  expect(valid).toEqual({ id: 123, name: "John", email: "john@example.com" });

  // Missing fields
  const missing = schema.safeParse('{"id": 123}');
  expect(missing.success).toBe(false);
  if (!missing.success) {
    expect(missing.error.issues.some((issue) => issue.path.includes("name"))).toBe(true);
  }

  // Invalid JSON syntax
  const invalidSyntax = schema.safeParse('{"id": 123, "name": "John", "email":');
  expect(invalidSyntax.success).toBe(false);
  if (!invalidSyntax.success) {
    expect(invalidSyntax.error.issues[0].code).toBe("invalid_format");
    expect((invalidSyntax.error.issues[0] as any).format).toBe("json_string");
  }
});

test("jsonString() with primitive schemas", () => {
  expect(z.jsonString(z.number()).parse("42")).toBe(42);
  expect(z.jsonString(z.string()).parse('"hello"')).toBe("hello");
  expect(z.jsonString(z.boolean()).parse("true")).toBe(true);
  expect(z.jsonString(z.array(z.number())).parse("[1,2,3]")).toEqual([1, 2, 3]);
});

test("jsonString() with union schemas", () => {
  const unionSchema = z.union([z.string(), z.number()]);
  const schema = z.jsonString(unionSchema);
  expect(schema.parse('"hello"')).toBe("hello");
  expect(schema.parse("42")).toBe(42);
  expect(() => schema.parse("true")).toThrow();
});

test("jsonString() handles large payloads", () => {
  const schema = z.jsonString();
  const largeObject = {
    users: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `User ${i}` })),
  };
  const largeJson = JSON.stringify(largeObject);
  expect(schema.parse(largeJson)).toBe(largeJson);
});

test("jsonString() works with async parsing", async () => {
  const schema = z.jsonString(z.object({ name: z.string() }));
  const result = await schema.parseAsync('{"name": "Alice"}');
  expect(result).toEqual({ name: "Alice" });
});

test("jsonString() works with transforms", () => {
  const schema = z.jsonString(z.object({ count: z.number() })).transform((data) => data.count * 2);
  expect(schema.parse('{"count": 5}')).toBe(10);
});
