import { expect, test } from "@jest/globals";

import { z, ZodError } from "../index";

test("z.looseEnum()", () => {
  const testEnum = ["pending", "completed", "cancelled"] as const;
  const schema = z.looseEnum(testEnum);

  it("should accept valid enum values", () => {
    expect(schema.parse("pending")).toBe("pending");
    expect(schema.parse("completed")).toBe("completed");
    expect(schema.parse("cancelled")).toBe("cancelled");
  });

  it("should accept other string values", () => {
    expect(schema.parse("other-value")).toBe("other-value");
    expect(schema.parse("PENDING")).toBe("PENDING"); // case-sensitive
    expect(schema.parse("")).toBe("");
  });

  it("should reject non-string values", () => {
    expect(() => schema.parse(123)).toThrow(ZodError);
    expect(() => schema.parse(null)).toThrow(ZodError);
    expect(() => schema.parse(undefined)).toThrow(ZodError);
    expect(() => schema.parse({})).toThrow(ZodError);
  });

  it("should work with refine()", () => {
    const refined = schema.refine((val: any) => val.length > 3, {
      message: "Too short",
    });
    expect(refined.parse("long-value")).toBe("long-value");
    expect(() => refined.parse("abc")).toThrow(ZodError);
  });

  it("should provide proper TypeScript inference", () => {
    const result = schema.parse("anything");
    const test: string = result; // Should pass type check
    expect(test).toBe("anything");
  });
});

test("z.looseEnum() integration", () => {
  it("should work with objects", () => {
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

  it("should work with unions", () => {
    const schema = z.union([z.looseEnum(["A", "B"] as const), z.number()]);

    expect(schema.parse("A")).toBe("A");
    expect(schema.parse("C")).toBe("C");
    expect(schema.parse(42)).toBe(42);
  });

  it("should work with transforms", () => {
    const schema = z
      .looseEnum(["yes", "no"] as const)
      .transform((val: any) => val.toUpperCase());
    expect(schema.parse("yes")).toBe("YES");
    expect(schema.parse("maybe")).toBe("MAYBE");
  });
});

test("z.looseEnum() edge cases", () => {
  it("should handle empty string", () => {
    const schema = z.looseEnum(["A", "B"] as const);
    expect(schema.parse("")).toBe("");
  });

  it("should handle single-value enums", () => {
    const schema = z.looseEnum(["SINGLE"] as const);
    expect(schema.parse("SINGLE")).toBe("SINGLE");
    expect(schema.parse("OTHER")).toBe("OTHER");
  });

  it("should handle very long strings", () => {
    const longString = "a".repeat(10000);
    const schema = z.looseEnum(["short"] as const);
    expect(schema.parse(longString)).toBe(longString);
  });
});
