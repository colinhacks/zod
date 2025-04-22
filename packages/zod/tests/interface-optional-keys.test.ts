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
  const base = z.interface({
    "defaultValue?": z.number(),
  });

  // Extended interface with another optional key
  const extended = base.extend({
    "alias?": z.string(),
  });

  // Runtime verification - these all work correctly
  const withBothFields = { defaultValue: 123, alias: "test" };
  expect(extended.parse(withBothFields)).toEqual(withBothFields);

  // Empty object is valid (both fields optional)
  expect(extended.parse({})).toEqual({});

  // Only defaultValue is valid
  expect(extended.parse({ defaultValue: 456 })).toEqual({ defaultValue: 456 });

  // Only alias is valid
  expect(extended.parse({ alias: "test-only" })).toEqual({
    alias: "test-only",
  });

  // Verify object property names in the parsed result
  const parsed = extended.parse(withBothFields);
  expect("alias?" in parsed).toBe(false); // "alias?" is not a property
  expect("alias" in parsed).toBe(true); // "alias" is a property (without the ?)
});

/**
 * This test demonstrates the TYPE INFERENCE bug.
 *
 * The test uses a utility type to check for the presence of keys in the inferred type.
 * The bug is that the key name may include the question mark in the inferred type.
 */
test("ZodInterface extended optional keys inference - type inference bug", () => {
  // Base interface with an optional key
  const base = z.interface({
    "defaultValue?": z.number(),
  });

  // Extended interface with another optional key
  const extended = base.extend({
    "alias?": z.string(),
  });

  // Utility type to check for property names in a type
  type HasProperty<T, K extends string> = K extends keyof T ? true : false;

  // Infer the type from our schemas
  type ExtendedType = z.infer<typeof extended>;

  // Check for property names in the inferred type
  type HasAlias = HasProperty<ExtendedType, "alias">;
  type HasAliasWithQuestion = HasProperty<ExtendedType, "alias?">;

  // This verifies the "alias" property exists (which is correct)
  expectTypeOf<HasAlias>().toEqualTypeOf<true>();

  // The following assertion would fail because of the bug:
  // When the bug is fixed, this assertion should pass
  expectTypeOf<HasAliasWithQuestion>().toEqualTypeOf<false>();

  // The bug causes the type to be something like:
  // {
  //   defaultValue?: number | undefined;
  //   "alias?": string;
  //   alias?: unknown;
  // }
  // Instead of the expected:
  // {
  //   defaultValue?: number | undefined;
  //   alias?: string | undefined;
  // }
});
