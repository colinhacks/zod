import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4-mini";

test("z.partial with record", () => {
  const recordSchema = z.record(z.string(), z.string());
  const partialRecordSchema = z.partial(recordSchema);

  type PartialRecordType = z.output<typeof partialRecordSchema>;
  expectTypeOf<PartialRecordType>().toMatchTypeOf<Partial<Record<string, string>>>();

  // Test with valid data
  const validData = { a: "hello", b: "world" };
  expect(partialRecordSchema.parse(validData)).toEqual(validData);

  // Test with empty object
  expect(partialRecordSchema.parse({})).toEqual({});

  // Test with invalid data
  expect(() => partialRecordSchema.parse({ a: 123 })).toThrow();
  expect(() => partialRecordSchema.parse("not an object")).toThrow();
});

test("z.partial with enum record", () => {
  const enumRecordSchema = z.record(z.enum(["a", "b", "c"]), z.string());
  const partialEnumRecordSchema = z.partial(enumRecordSchema);

  type PartialEnumRecordType = z.output<typeof partialEnumRecordSchema>;
  expectTypeOf<PartialEnumRecordType>().toMatchTypeOf<Partial<Record<"a" | "b" | "c", string>>>();

  // Test with valid data
  const validData = { a: "hello", b: "world" };
  expect(partialEnumRecordSchema.parse(validData)).toEqual(validData);

  // Test with empty object
  expect(partialEnumRecordSchema.parse({})).toEqual({});

  // Test with invalid data
  expect(() => partialEnumRecordSchema.parse({ d: "invalid" })).toThrow();
  expect(() => partialEnumRecordSchema.parse({ a: 123 })).toThrow();
});
