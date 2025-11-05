import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("makeSchema creates a type-safe schema factory", () => {
  type User = {
    name: string;
    age: number;
  };

  const makeUserSchema = z.makeSchema<User>();

  const userSchema = makeUserSchema({
    name: z.string(),
    age: z.number(),
  });

  expectTypeOf<z.output<typeof userSchema>>().toEqualTypeOf<User>();
  expectTypeOf<z.input<typeof userSchema>>().toEqualTypeOf<User>();
});

test("makeSchema enforces type safety", () => {
  type User = {
    name: string;
    age: number;
  };

  const makeUserSchema = z.makeSchema<User>();

  // This should work
  const validSchema = makeUserSchema({
    name: z.string(),
    age: z.number(),
  });

  expect(validSchema).toBeDefined();
  expect(validSchema).toBeInstanceOf(z.ZodObject);
});

test("makeSchema creates strict schemas", () => {
  type User = {
    name: string;
    age: number;
  };

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    age: z.number(),
  });

  // Strict mode should reject unknown keys
  const result = userSchema.safeParse({
    name: "John",
    age: 30,
    unknown: "field",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0]?.code).toBe("unrecognized_keys");
  }
});

test("makeSchema validates correct data", () => {
  type User = {
    name: string;
    age: number;
  };

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    age: z.number(),
  });

  const result = userSchema.parse({
    name: "John",
    age: 30,
  });

  expect(result).toEqual({
    name: "John",
    age: 30,
  });
});

test("makeSchema works with nested objects", () => {
  type Address = {
    street: string;
    city: string;
  };

  type User = {
    name: string;
    address: Address;
  };

  const makeAddressSchema = z.makeSchema<Address>();
  const addressSchema = makeAddressSchema({
    street: z.string(),
    city: z.string(),
  });

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    address: addressSchema,
  });

  const result = userSchema.parse({
    name: "John",
    address: {
      street: "123 Main St",
      city: "New York",
    },
  });

  expect(result).toEqual({
    name: "John",
    address: {
      street: "123 Main St",
      city: "New York",
    },
  });

  expectTypeOf<z.output<typeof userSchema>>().toEqualTypeOf<User>();
});

test("makeSchema works with optional fields", () => {
  type User = {
    name: string;
    email?: string;
  };

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    email: z.string().optional(),
  });

  const result1 = userSchema.parse({
    name: "John",
  });

  expect(result1).toEqual({
    name: "John",
  });

  const result2 = userSchema.parse({
    name: "John",
    email: "john@example.com",
  });

  expect(result2).toEqual({
    name: "John",
    email: "john@example.com",
  });

  expectTypeOf<z.output<typeof userSchema>>().toEqualTypeOf<User>();
});

test("makeSchema rejects invalid data", () => {
  type User = {
    name: string;
    age: number;
  };

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    age: z.number(),
  });

  // Missing required field
  const result1 = userSchema.safeParse({
    name: "John",
  });

  expect(result1.success).toBe(false);

  // Wrong type
  const result2 = userSchema.safeParse({
    name: "John",
    age: "30",
  });

  expect(result2.success).toBe(false);
});

test("makeSchema works with arrays", () => {
  type User = {
    name: string;
    tags: string[];
  };

  const makeUserSchema = z.makeSchema<User>();
  const userSchema = makeUserSchema({
    name: z.string(),
    tags: z.array(z.string()),
  });

  const result = userSchema.parse({
    name: "John",
    tags: ["developer", "typescript"],
  });

  expect(result).toEqual({
    name: "John",
    tags: ["developer", "typescript"],
  });

  expectTypeOf<z.output<typeof userSchema>>().toEqualTypeOf<User>();
});
