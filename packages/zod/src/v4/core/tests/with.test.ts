import { describe, expect, it } from "vitest";
import * as z from "zod/v4";

describe(".with() method", () => {
  it("should override output type while preserving validation", () => {
    const schema = z.string().min(5).with<string, "CustomString">();

    type Output = z.output<typeof schema>;
    const _typeCheck: Output = "CustomString" as any;
    expect(_typeCheck).toBe("CustomString");

    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse("hi").success).toBe(false);
  });

  it("should override input type", () => {
    const schema = z.string().with<"InputType", string>();

    type Input = z.input<typeof schema>;
    const _typeCheck: Input = "InputType" as any;
    expect(_typeCheck).toBe("InputType");
  });

  it("should override both input and output types", () => {
    const schema = z.string().with<"InputType", "OutputType">();

    type Input = z.input<typeof schema>;
    type Output = z.output<typeof schema>;

    const _inputCheck: Input = "InputType" as any;
    const _outputCheck: Output = "OutputType" as any;

    expect(_inputCheck).toBe("InputType");
    expect(_outputCheck).toBe("OutputType");
  });

  it("should work with branded types", () => {
    const UserId = z.string().uuid().brand<"UserId">();
    const UserIdWithInput = UserId.with<string & { __brand: "UserId" }, string & { __brand: "UserId" }>();

    type Input = z.input<typeof UserIdWithInput>;
    type Output = z.output<typeof UserIdWithInput>;

    const testInput: Input = "test" as any;
    const testOutput: Output = "test" as any;

    expect(testInput).toBeDefined();
    expect(testOutput).toBeDefined();

    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const invalidUuid = "not-a-uuid";

    expect(UserIdWithInput.safeParse(validUuid).success).toBe(true);
    expect(UserIdWithInput.safeParse(invalidUuid).success).toBe(false);
  });

  it("should be chainable with other methods", () => {
    const schema = z.string().min(5).with<string, "LongString">().optional();

    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse("hi").success).toBe(false);
    expect(schema.safeParse(undefined).success).toBe(true);
  });

  it("should preserve validation logic with email", () => {
    const emailSchema = z.string().email();
    const customEmailSchema = emailSchema.with<string, "Email">();

    expect(customEmailSchema.safeParse("valid@email.com").success).toBe(true);
    expect(customEmailSchema.safeParse("invalid").success).toBe(false);
  });

  it("should work with transform", () => {
    const schema = z
      .string()
      .transform((val) => val.length)
      .with<string, number & { __brand: "StringLength" }>();

    const result = schema.parse("hello");
    expect(result).toBe(5);

    type Output = z.output<typeof schema>;
    const _typeCheck: Output = 5 as any;
    expect(typeof _typeCheck).toBe("number");
  });

  it("should work with complex schemas (objects)", () => {
    const userSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
    });

    const customUserSchema = userSchema.with<
      { id: string; name: string },
      { id: string & { __brand: "UserId" }; name: string }
    >();

    const validUser = { id: "123e4567-e89b-12d3-a456-426614174000", name: "John" };
    const invalidUser = { id: "invalid-uuid", name: "John" };

    expect(customUserSchema.safeParse(validUser).success).toBe(true);
    expect(customUserSchema.safeParse(invalidUser).success).toBe(false);
  });

  it("should work with arrays", () => {
    const stringArraySchema = z.array(z.string());
    const customArraySchema = stringArraySchema.with<string[], ReadonlyArray<string>>();

    const testArray = ["a", "b", "c"];
    expect(customArraySchema.safeParse(testArray).success).toBe(true);
    expect(customArraySchema.safeParse([1, 2, 3]).success).toBe(false);
  });

  it("should handle never types correctly", () => {
    const schema1 = z.string().with<"CustomInput">();
    type Input1 = z.input<typeof schema1>;
    type Output1 = z.output<typeof schema1>;

    const _input1: Input1 = "CustomInput" as any;
    const _output1: Output1 = "original" as any;

    expect(_input1).toBe("CustomInput");
    expect(_output1).toBe("original");

    const schema2 = z.string().with<never, "CustomOutput">();
    type Input2 = z.input<typeof schema2>;
    type Output2 = z.output<typeof schema2>;

    const _input2: Input2 = "original" as any;
    const _output2: Output2 = "CustomOutput" as any;

    expect(_input2).toBe("original");
    expect(_output2).toBe("CustomOutput");
  });

  it("should not affect runtime behavior", () => {
    const originalSchema = z.string().min(5);
    const withSchema = originalSchema.with<string, "Custom">();

    const testValue = "hello";
    const invalidValue = "hi";

    expect(originalSchema.safeParse(testValue).success).toBe(withSchema.safeParse(testValue).success);
    expect(originalSchema.safeParse(invalidValue).success).toBe(withSchema.safeParse(invalidValue).success);
  });

  it("should work with refinements", () => {
    const schema = z
      .string()
      .refine((val) => val.includes("@"), "Must contain @")
      .with<string, "EmailLike">();

    expect(schema.safeParse("test@example.com").success).toBe(true);
    expect(schema.safeParse("invalid").success).toBe(false);
  });
});
