import { expect, test } from "vitest";
import * as z from "zod/mini";

test("change can modify existing properties", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
  });

  const schema2 = z.change(schema1, {
    email: z.string(),
    age: z.number(),
  });

  // Should parse valid data
  const result = schema2.parse({ email: "test@example.com", age: 25 });
  expect(result).toEqual({ email: "test@example.com", age: 25 });
});

test("change can partially modify properties", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
    name: z.string(),
  });

  // Only change age, keep email and name as they were
  const schema2 = z.change(schema1, {
    age: z.number(),
  });

  const result = schema2.parse({
    email: "test@example.com",
    age: 25,
    name: "John",
  });
  expect(result).toEqual({ email: "test@example.com", age: 25, name: "John" });
});

test("change throws error when adding new properties", () => {
  const schema1 = z.object({
    email: z.string(),
  });

  // This should work - existing property
  const validChange = z.change(schema1, {
    email: z.string(),
  });
  expect(validChange).toBeDefined();

  // TypeScript should prevent this, test runtime error with explicit bypass
  expect(() => {
    z.change(schema1, {
      // @ts-expect-error
      newProperty: z.string(),
    });
  }).toThrow('Cannot change non-existing property: "newProperty"');
});

test("change preserves type inference", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
  });

  const schema2 = z.change(schema1, {
    email: z.string(),
  });

  // TypeScript should infer the correct type
  type Schema2Type = z.infer<typeof schema2>;
  const _typeTest: Schema2Type = { email: "test@example.com", age: 25 };
  expect(_typeTest).toBeDefined();
});

test("change works with schema containing refinements using safeChange", () => {
  const schema1 = z
    .object({
      email: z.string(),
      age: z.number(),
    })
    .check(({ value }) => {
      if (value.age < 0) throw new Error("Age must be non-negative");
    });

  // change() should throw with refinements
  expect(() => {
    z.change(schema1, { email: z.string() });
  }).toThrow("Object schemas containing refinements cannot be changed. Use `.safeChange()` instead.");

  // safeChange() should work
  const schema2 = z.safeChange(schema1, {
    email: z.string(),
  });

  const result = schema2.parse({ email: "test@example.com", age: 25 });
  expect(result).toEqual({ email: "test@example.com", age: 25 });
});

test("safeChange throws error when adding new properties", () => {
  const schema1 = z.object({
    email: z.string(),
  });

  expect(() => {
    z.safeChange(schema1, {
      email: z.string(),
      // @ts-expect-error
      newProperty: z.string(),
    });
  }).toThrow('Cannot change non-existing property: "newProperty"');
});

test("safeChange enforces type compatibility at TypeScript level", () => {
  const baseSchema = z.object({
    id: z.string(),
    count: z.number(),
  });

  // This should work - compatible changes (same types)
  const validChange = z.safeChange(baseSchema, {
    id: z.string(),
    count: z.number(),
  });

  expect(validChange).toBeDefined();

  const result = validChange.parse({ id: "test", count: 42 });
  expect(result).toEqual({ id: "test", count: 42 });
});

test("safeChange allows partial property changes", () => {
  const baseSchema = z.object({
    id: z.string(),
    count: z.number(),
    active: z.boolean(),
  });

  // Should work - only changing one property with compatible type
  const partialChange = z.safeChange(baseSchema, {
    count: z.number(),
  });

  const result = partialChange.parse({ id: "test", count: 42, active: true });
  expect(result).toEqual({ id: "test", count: 42, active: true });
});

test("safeChange runtime behavior is identical to change", () => {
  const baseSchema = z.object({
    id: z.string(),
    count: z.number(),
  });

  const changeResult = z.change(baseSchema, {
    id: z.string(),
  });

  const safeChangeResult = z.safeChange(baseSchema, {
    id: z.string(),
  });

  const testData = { id: "test", count: 42 };

  // Runtime behavior should be identical
  expect(changeResult.parse(testData)).toEqual(safeChangeResult.parse(testData));

  // Both should handle the same valid data
  expect(changeResult.parse(testData)).toEqual(testData);
  expect(safeChangeResult.parse(testData)).toEqual(testData);
});

test("TypeScript prevents non-existing properties in change()", () => {
  const user = z.object({
    id: z.string(),
    name: z.string(),
  });

  // This should work - existing property
  const validChange = z.change(user, { name: z.string() });
  expect(validChange).toBeDefined();

  // TypeScript should prevent these at compile time - they would cause TS errors if uncommented:
  // z.change(user, { nonExisting: z.string() });
  // z.safeChange(user, { nonExisting: z.string() });

  // Test runtime error with explicit bypass of TypeScript for edge cases
  expect(() => {
    (z as any).change(user, { nonExisting: z.string() });
  }).toThrow('Cannot change non-existing property: "nonExisting"');
});
