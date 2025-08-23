import { describe, expect, it } from "vitest";
import * as z from "zod/v4";

describe(".with() method - Integration Tests", () => {
  it("should work with tRPC-style branded types", () => {
    type UserId = string & { __brand: "UserId" };
    type Email = string & { __brand: "Email" };

    const UserIdSchema = z.string().uuid().with<UserId, UserId>();
    const EmailSchema = z.string().email().with<Email, Email>();

    const UserSchema = z.object({
      id: UserIdSchema,
      email: EmailSchema,
      name: z.string().min(1),
    });

    type User = z.output<typeof UserSchema>;

    const user: User = {
      id: "123e4567-e89b-12d3-a456-426614174000" as UserId,
      email: "test@example.com" as Email,
      name: "John Doe",
    };

    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.name).toBe("John Doe");

    const validData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      name: "John Doe",
    };

    const invalidData = {
      id: "invalid-uuid",
      email: "invalid-email",
      name: "",
    };

    expect(UserSchema.safeParse(validData).success).toBe(true);
    expect(UserSchema.safeParse(invalidData).success).toBe(false);
  });

  it("should work with complex nested schemas", () => {
    type ProductId = string & { __brand: "ProductId" };
    type CategoryId = string & { __brand: "CategoryId" };

    const ProductSchema = z.object({
      id: z.string().uuid().with<ProductId, ProductId>(),
      name: z.string().min(1),
      price: z.number().positive(),
      categoryId: z.string().uuid().with<CategoryId, CategoryId>(),
      tags: z.array(z.string()),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    type Product = z.output<typeof ProductSchema>;

    const product: Product = {
      id: "123e4567-e89b-12d3-a456-426614174000" as ProductId,
      name: "Test Product",
      price: 99.99,
      categoryId: "987fcdeb-51d2-43a1-b456-426614174000" as CategoryId,
      tags: ["electronics", "gadget"],
      metadata: { color: "blue", weight: "1kg" },
    };

    expect(product.id).toBeDefined();
    expect(product.categoryId).toBeDefined();

    const validProduct = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test Product",
      price: 99.99,
      categoryId: "987fcdeb-51d2-43a1-b456-426614174000",
      tags: ["electronics", "gadget"],
    };

    expect(ProductSchema.safeParse(validProduct).success).toBe(true);

    const invalidProduct = {
      id: "invalid-uuid",
      name: "",
      price: -10,
      categoryId: "invalid-uuid",
      tags: "not-an-array",
    };

    expect(ProductSchema.safeParse(invalidProduct).success).toBe(false);
  });

  it("should work with transforms and branded types", () => {
    type UppercaseString = string & { __brand: "Uppercase" };

    const schema = z
      .string()
      .min(1)
      .transform((val) => val.toUpperCase())
      .with<string, UppercaseString>();

    const result = schema.parse("hello");
    expect(result).toBe("HELLO");

    type Output = z.output<typeof schema>;
    const _typeCheck: Output = "HELLO" as UppercaseString;
    expect(_typeCheck).toBe("HELLO");

    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("test").success).toBe(true);
  });

  it("should work with unions and branded types", () => {
    type StringId = string & { __brand: "StringId" };
    type NumberId = number & { __brand: "NumberId" };

    const stringIdSchema = z.string().with<StringId, StringId>();
    const numberIdSchema = z.number().with<NumberId, NumberId>();

    const unionSchema = z.union([stringIdSchema, numberIdSchema]);

    type UnionOutput = z.output<typeof unionSchema>;

    const stringResult: UnionOutput = "test" as StringId;
    const numberResult: UnionOutput = 123 as NumberId;

    expect(stringResult).toBe("test");
    expect(numberResult).toBe(123);

    expect(unionSchema.safeParse("test").success).toBe(true);
    expect(unionSchema.safeParse(123).success).toBe(true);
    expect(unionSchema.safeParse(true).success).toBe(false);
  });

  it("should preserve all chaining capabilities", () => {
    type CustomString = string & { __brand: "Custom" };

    const schema = z
      .string()
      .min(5)
      .max(20)
      .regex(/^[a-zA-Z]+$/)
      .with<string, CustomString>()
      .optional()
      .default("defaultValue" as CustomString);

    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse("hi").success).toBe(false);
    expect(schema.safeParse("verylongstringthatexceedslimit").success).toBe(false);
    expect(schema.safeParse("hello123").success).toBe(false);
    expect(schema.safeParse(undefined).success).toBe(true);

    const result = schema.parse(undefined);
    expect(result).toBe("defaultValue");
  });

  it("should work with lazy schemas", () => {
    type UserId = string & { __brand: "UserId" };

    const UserSchema = z.object({
      id: z.string().uuid().with<UserId, UserId>(),
      name: z.string().min(1),
    });

    const LazyUserSchema = z.lazy(() => UserSchema);

    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
    };

    const invalidUser = {
      id: "invalid-uuid",
      name: "",
    };

    expect(LazyUserSchema.safeParse(validUser).success).toBe(true);
    expect(LazyUserSchema.safeParse(invalidUser).success).toBe(false);

    type LazyOutput = z.output<typeof LazyUserSchema>;
    const user: LazyOutput = {
      id: "123e4567-e89b-12d3-a456-426614174000" as UserId,
      name: "John Doe",
    };

    expect(user.id).toBeDefined();
    expect(user.name).toBe("John Doe");
  });
});
