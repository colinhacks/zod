import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

// Helper: a JSON string <-> object codec
const jsonCodec = <T extends z.ZodType>(inner: T) =>
  z.codec(z.string(), inner, {
    decode: (s) => JSON.parse(s),
    encode: (v) => JSON.stringify(v),
  });

test("leaf schema returns same instance", () => {
  const str = z.string();
  expect(z.toOutputSchema(str)).toBe(str);

  const num = z.number();
  expect(z.toOutputSchema(num)).toBe(num);

  const bool = z.boolean();
  expect(z.toOutputSchema(bool)).toBe(bool);
});

test("simple codec replaced by .out schema", () => {
  const codec = z.codec(z.string(), z.number(), {
    decode: (s) => Number(s),
    encode: (n) => String(n),
  });

  const output = z.toOutputSchema(codec);
  // The output schema should validate numbers, not strings
  expect(output.safeParse(42).success).toBe(true);
  expect(output.safeParse("42").success).toBe(false);
});

test("object with codec field — validates decoded objects, rejects encoded strings", () => {
  const schema = z.object({
    name: z.string(),
    metadata: jsonCodec(z.object({ role: z.string() })),
  });

  const output = z.toOutputSchema(schema);

  // Should accept the decoded form
  expect(output.safeParse({ name: "Alice", metadata: { role: "admin" } }).success).toBe(true);

  // Should reject the encoded (string) form
  expect(output.safeParse({ name: "Alice", metadata: '{"role":"admin"}' }).success).toBe(false);
});

test("array of objects with codecs", () => {
  const itemSchema = z.object({
    value: jsonCodec(z.number()),
  });
  const schema = z.array(itemSchema);

  const output = z.toOutputSchema(schema);
  expect(output.safeParse([{ value: 42 }, { value: 7 }]).success).toBe(true);
  expect(output.safeParse([{ value: "42" }]).success).toBe(false);
});

test("discriminated union with codec fields", () => {
  const schema = z.union([
    z.object({ type: z.literal("a"), data: jsonCodec(z.number()) }),
    z.object({ type: z.literal("b"), data: z.string() }),
  ]);

  const output = z.toOutputSchema(schema);
  expect(output.safeParse({ type: "a", data: 123 }).success).toBe(true);
  expect(output.safeParse({ type: "b", data: "hello" }).success).toBe(true);
  expect(output.safeParse({ type: "a", data: "123" }).success).toBe(false);
});

test("optional/nullable codec field", () => {
  const schema = z.object({
    opt: jsonCodec(z.number()).optional(),
    nul: jsonCodec(z.boolean()).nullable(),
  });

  const output = z.toOutputSchema(schema);
  expect(output.safeParse({ opt: 42, nul: true }).success).toBe(true);
  expect(output.safeParse({ nul: null }).success).toBe(true);
  expect(output.safeParse({ opt: undefined, nul: false }).success).toBe(true);
  expect(output.safeParse({ opt: "42", nul: true }).success).toBe(false);
});

test("schema with no codecs returns same instance (identity optimisation)", () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
    tags: z.array(z.string()),
  });

  expect(z.toOutputSchema(schema)).toBe(schema);
});

test("deeply nested: codec inside optional inside array inside object", () => {
  const schema = z.object({
    items: z.array(jsonCodec(z.object({ id: z.number() })).optional()),
  });

  const output = z.toOutputSchema(schema);
  expect(output.safeParse({ items: [{ id: 1 }, undefined, { id: 3 }] }).success).toBe(true);
  expect(output.safeParse({ items: ['{"id":1}'] }).success).toBe(false);
});

test("z.output<> type inference on the result", () => {
  const codec = z.codec(z.string(), z.number(), {
    decode: (s) => Number(s),
    encode: (n) => String(n),
  });
  const schema = z.object({ value: codec });

  const output = z.toOutputSchema(schema);
  type OutputType = z.output<typeof output>;

  // The output type should have `value: number`, not `value: string`
  expectTypeOf<OutputType>().toEqualTypeOf<{ value: number }>();
});

test("standalone z.toOutputSchema() function works same as instance method", () => {
  const schema = z.object({
    data: jsonCodec(z.number()),
  });

  const fromStandalone = z.toOutputSchema(schema);
  const fromInstance = schema.outputSchema();

  // Both should validate the same way
  const testData = { data: 42 };
  expect(fromStandalone.safeParse(testData).success).toBe(true);
  expect(fromInstance.safeParse(testData).success).toBe(true);

  const badData = { data: "42" };
  expect(fromStandalone.safeParse(badData).success).toBe(false);
  expect(fromInstance.safeParse(badData).success).toBe(false);
});
