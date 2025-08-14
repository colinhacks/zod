import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("runtime type property exists and returns correct values", () => {
  const stringSchema = z.string();
  const numberSchema = z.number();
  const booleanSchema = z.boolean();
  const arraySchema = z.array(z.string());
  const recordSchema = z.record(z.string(), z.any());
  const objectSchema = z.object({ name: z.string() });

  expect(stringSchema.type).toBe("string");
  expect(numberSchema.type).toBe("number");
  expect(booleanSchema.type).toBe("boolean");
  expect(arraySchema.type).toBe("array");
  expect(recordSchema.type).toBe("record");
  expect(objectSchema.type).toBe("object");
});

test("type narrowing works with type property", () => {
  type ArrayOrRecord = z.ZodArray<z.ZodString> | z.ZodRecord<z.ZodString, z.ZodAny>;

  const arraySchema = z.array(z.string()) as ArrayOrRecord;
  const recordSchema = z.record(z.string(), z.any()) as ArrayOrRecord;

  if (arraySchema.type === "array") {
    expectTypeOf(arraySchema).toEqualTypeOf<z.ZodArray<z.ZodString>>();
    expect(arraySchema.element).toBeDefined();
  }

  if (recordSchema.type === "record") {
    expectTypeOf(recordSchema).toEqualTypeOf<z.ZodRecord<z.ZodString, z.ZodAny>>();
    expect(recordSchema.keyType).toBeDefined();
    expect(recordSchema.valueType).toBeDefined();
  }
});

test("type property is consistent with def.type", () => {
  const schemas = [
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.record(z.string(), z.any()),
    z.object({ name: z.string() }),
    z.union([z.string(), z.number()]),
    z.literal("test"),
    z.enum(["a", "b", "c"]),
  ];

  for (const schema of schemas) {
    expect(schema.type).toBe(schema.def.type);
  }
});

test("type property works with complex schemas", () => {
  const optionalString = z.string().optional();
  const nullableNumber = z.number().nullable();
  const defaultBoolean = z.boolean().default(false);

  expect(optionalString.type).toBe("optional");
  expect(nullableNumber.type).toBe("nullable");
  expect(defaultBoolean.type).toBe("default");
});

test("discriminated union example from issue #5087", () => {
  type ArrayOrRecord = z.ZodArray<z.ZodType> | z.ZodRecord<z.ZodString, z.ZodType>;
  const x = z.record(z.string(), z.any()) as ArrayOrRecord;

  if (x.type === "record") {
    expect(x.valueType).toBeDefined();
    expect(x.keyType).toBeDefined();
  }

  const y = z.array(z.string()) as ArrayOrRecord;
  if (y.type === "array") {
    expect(y.element).toBeDefined();
  }
});
