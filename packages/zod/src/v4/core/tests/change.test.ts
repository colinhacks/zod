import { expect, test } from "vitest";
import * as z from "zod/v4";

test("change can modify existing properties", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
  });

  const schema2 = schema1.change({
    email: z.string().email(),
    age: z.number().min(18),
  });

  // Should parse valid data
  const result = schema2.parse({ email: "test@example.com", age: 25 });
  expect(result).toEqual({ email: "test@example.com", age: 25 });

  // Should fail validation on invalid email
  expect(() => schema2.parse({ email: "invalid-email", age: 25 })).toThrow();

  // Should fail validation on age < 18
  expect(() => schema2.parse({ email: "test@example.com", age: 16 })).toThrow();
});

test("change can partially modify properties", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
    name: z.string(),
  });

  // Only change age, keep email and name as they were
  const schema2 = schema1.change({
    age: z.number().min(18),
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
  const validChange = schema1.change({
    email: z.string().email(),
  });
  expect(validChange).toBeDefined();

  // TypeScript correctly prevents this at compile time with:
  // Error: 'newProperty' does not exist in type 'Partial<Record<"email", SomeType>>'
  expect(() => {
    schema1.change({
      // @ts-expect-error
      newProperty: z.string(),
    });
  }).toThrow('Cannot change non-existing property: "newProperty"');
});

test("change throws error for completely new properties", () => {
  const schema1 = z.object({
    email: z.string(),
  });

  expect(() => {
    schema1.change({
      // @ts-expect-error
      nonExistentProp: z.number(),
    });
  }).toThrow('Cannot change non-existing property: "nonExistentProp"');
});

test("change preserves type inference", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
  });

  const schema2 = schema1.change({
    email: z.string().email(),
  });

  // TypeScript should infer the correct type
  type Schema2Type = z.infer<typeof schema2>;
  const _typeTest: Schema2Type = { email: "test@example.com", age: 25 };
  // Just ensure the variable exists to satisfy TypeScript
  expect(_typeTest).toBeDefined();
});

test("change works with schema containing refinements using safeChange", () => {
  const schema1 = z
    .object({
      email: z.string(),
      age: z.number(),
    })
    .refine((data) => data.age >= 0, { message: "Age must be non-negative" });

  // change() should throw with refinements
  expect(() => {
    schema1.change({ email: z.string().email() });
  }).toThrow("Object schemas containing refinements cannot be changed. Use `.safeChange()` instead.");

  // safeChange() should work
  const schema2 = schema1.safeChange({
    email: z.string().email(),
  });

  const result = schema2.parse({ email: "test@example.com", age: 25 });
  expect(result).toEqual({ email: "test@example.com", age: 25 });
});

test("safeChange throws error when adding new properties", () => {
  const schema1 = z.object({
    email: z.string(),
  });

  expect(() => {
    schema1.safeChange({
      email: z.string().email(),
      newProperty: z.string(),
    });
  }).toThrow('Cannot change non-existing property: "newProperty"');
});

test("change chaining preserves and overrides properties", () => {
  const schema1 = z.object({
    email: z.string(),
    age: z.number(),
  });

  const schema2 = schema1.change({
    email: z.string().email(),
  });

  const schema3 = schema2.change({
    email: z.string().email().or(z.literal("")),
    age: z.number().min(18),
  });

  // Should accept valid email and age
  schema3.parse({ email: "test@example.com", age: 25 });

  // Should accept empty string email
  schema3.parse({ email: "", age: 25 });

  // Should reject invalid age
  expect(() => schema3.parse({ email: "", age: 16 })).toThrow();
});
