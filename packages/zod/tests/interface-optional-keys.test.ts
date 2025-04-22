import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";

/**
 * This test file specifically demonstrates the bug in ZodInterface's type
 * inference with optional keys in extended interfaces.
 *
 * The bug occurs when extending an interface that has optional keys (with a "?" suffix)
 * The extended interface does not correctly maintain the optionality in the TypeScript
 * type inference.
 */
test("ZodInterface extended optional keys inference - runtime works correctly", () => {
  // Base interface with an optional key
  const BaseSchema = z.interface({
    "optionalBaseProp?": z.number(),
  });

  // Extended interface with another optional key
  const ExtendedSchema = BaseSchema.extend({
    "optionalExtendedProp?": z.string(),
  });

  // Runtime verification - these all work correctly
  const withBothFields = { optionalBaseProp: 123, optionalExtendedProp: "test" };
  expect(ExtendedSchema.parse(withBothFields)).toEqual(withBothFields);

  // Empty object is valid (both fields optional)
  expect(ExtendedSchema.parse({})).toEqual({});

  // Only optionalBaseProp is valid
  expect(ExtendedSchema.parse({ optionalBaseProp: 456 })).toEqual({ optionalBaseProp: 456 });

  // Only optionalExtendedProp is valid
  expect(ExtendedSchema.parse({ optionalExtendedProp: "test-only" })).toEqual({
    optionalExtendedProp: "test-only",
  });

  // Verify object property names in the parsed result
  const parsed = ExtendedSchema.parse(withBothFields);
  expect("optionalExtendedProp?" in parsed).toBe(false); // "optionalExtendedProp?" is not a property
  expect("optionalExtendedProp" in parsed).toBe(true); // "optionalExtendedProp" is a property (without the ?)
});

/**
 * This test demonstrates the TYPE INFERENCE bug.
 *
 * The test uses a utility type to check for the presence of keys in the inferred type.
 * The bug is that the key name may include the question mark in the inferred type.
 */
test("ZodInterface extended optional keys inference - type inference bug", () => {
  // Base interface with an optional key
  const BaseSchema = z.interface({
    "optionalBaseProp?": z.number(),
  });

  // Extended interface with another optional key
  const ExtendedSchema = BaseSchema.extend({
    "optionalExtendedProp?": z.string(),
  });

  // Utility type to check for property names in a type
  type HasProperty<T, K extends string> = K extends keyof T ? true : false;

  // Infer the type from our schemas
  type ExtendedType = z.infer<typeof ExtendedSchema>;

  // Check for property names in the inferred type
  type HasExtendedProp = HasProperty<ExtendedType, "optionalExtendedProp">;
  type HasExtendedPropWithQuestion = HasProperty<ExtendedType, "optionalExtendedProp?">;

  // This verifies the "optionalExtendedProp" property exists (which is correct)
  expectTypeOf<HasExtendedProp>().toEqualTypeOf<true>();

  // The following assertion would fail because of the bug:
  // When the bug is fixed, this assertion should pass
  expectTypeOf<HasExtendedPropWithQuestion>().toEqualTypeOf<false>();

  // The bug causes the type to be something like:
  // {
  //   optionalBaseProp?: number | undefined;
  //   "optionalExtendedProp?": string;
  //   optionalExtendedProp?: unknown;
  // }
  // Instead of the expected:
  // {
  //   optionalBaseProp?: number | undefined;
  //   optionalExtendedProp?: string | undefined;
  // }
});

test("ZodInterface complex extended/discriminated union optional keys inference - type inference bug", () => {
  // Utility type to check for property names in a type
  type HasProperty<T, K extends string> = K extends keyof T ? true : false;

  // Generic Base Schema with an optional property
  const BaseSchema = z.interface({
    id: z.string(),
    "baseOptional?": z.boolean(),
  });

  // Extended Schema A
  const ExtendedSchemaA = BaseSchema.extend({
    kind: z.literal("A"),
    propA: z.string(),
    "optionalA?": z.number(),
  });

  // Extended Schema B
  const ExtendedSchemaB = BaseSchema.extend({
    kind: z.literal("B"),
    propB: z.boolean(),
    "optionalB?": z.date(),
  });

  // Discriminated Union Schema
  const GenericDiscriminatedSchema = z.discriminatedUnion("kind", [
    ExtendedSchemaA,
    ExtendedSchemaB,
  ]);

  // Infer types
  type DiscriminatedType = z.infer<typeof GenericDiscriminatedSchema>;
  type TypeA = z.infer<typeof ExtendedSchemaA>;
  type TypeB = z.infer<typeof ExtendedSchemaB>;

  // --- Type A Checks ---
  // Check base optional property
  type HasBaseOptionalA = HasProperty<TypeA, "baseOptional">;
  type HasBaseOptionalAQ = HasProperty<TypeA, "baseOptional?">;
  expectTypeOf<HasBaseOptionalA>().toEqualTypeOf<true>();
  expectTypeOf<HasBaseOptionalAQ>().toEqualTypeOf<false>(); // Should not have '?'

  // Check extended optional property A
  type HasOptionalA = HasProperty<TypeA, "optionalA">;
  type HasOptionalAQ = HasProperty<TypeA, "optionalA?">;
  expectTypeOf<HasOptionalA>().toEqualTypeOf<true>();
  expectTypeOf<HasOptionalAQ>().toEqualTypeOf<false>(); // Should not have '?'

  // --- Type B Checks ---
  // Check base optional property
  type HasBaseOptionalB = HasProperty<TypeB, "baseOptional">;
  type HasBaseOptionalBQ = HasProperty<TypeB, "baseOptional?">;
  expectTypeOf<HasBaseOptionalB>().toEqualTypeOf<true>();
  expectTypeOf<HasBaseOptionalBQ>().toEqualTypeOf<false>(); // Should not have '?'

  // Check extended optional property B
  type HasOptionalB = HasProperty<TypeB, "optionalB">;
  type HasOptionalBQ = HasProperty<TypeB, "optionalB?">;
  expectTypeOf<HasOptionalB>().toEqualTypeOf<true>();
  expectTypeOf<HasOptionalBQ>().toEqualTypeOf<false>(); // Should not have '?'

  // --- Discriminated Union Checks ---
  // Check optional properties on the union type itself
  // We primarily rely on checking the individual members (TypeA, TypeB) as done above.
  // We can also check properties common to all members (like baseOptional) on the union type.

  type HasUnionBaseOptional = HasProperty<DiscriminatedType, "baseOptional">;
  type HasUnionBaseOptionalQ = HasProperty<DiscriminatedType, "baseOptional?">;
  expectTypeOf<HasUnionBaseOptional>().toEqualTypeOf<true>(); // Common property exists
  expectTypeOf<HasUnionBaseOptionalQ>().toEqualTypeOf<false>(); // Common property exists without '?'

  // Runtime check example (optional)
  const exampleA: TypeA = { id: "1", kind: "A", propA: "hello" };
  const exampleB: TypeB = { id: "2", kind: "B", propB: true, optionalB: new Date() };
  const exampleBaseOptional: TypeA = { id: "3", kind: "A", propA: "world", baseOptional: true };

  expect(GenericDiscriminatedSchema.parse(exampleA)).toEqual(exampleA);
  expect(GenericDiscriminatedSchema.parse(exampleB)).toEqual(exampleB);
  expect(GenericDiscriminatedSchema.parse(exampleBaseOptional)).toEqual(exampleBaseOptional);
});
