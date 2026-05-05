import { beforeEach, expect, test } from "vitest";
import * as z from "zod/v4";

// English is the default locale and must register on first ZodType
// construction even when bundlers tree-shake `sideEffects: false` modules
// (#5953, #5725). Reset between tests so each one observes the lazy init.
beforeEach(() => {
  z.config({ localeError: undefined });
});

test("first ZodType construction registers the English default locale", () => {
  expect(z.config().localeError).toBeUndefined();
  const schema = z.enum(["km", "mi"]);
  expect(z.config().localeError).toBeDefined();
  const result = schema.safeParse("feet");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toBe('Invalid option: expected one of "km"|"mi"');
});

test("explicit locale set before schema construction is preserved", () => {
  z.config(z.locales.fr());
  const schema = z.enum(["km", "mi"]);
  const result = schema.safeParse("feet");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toBe('Option invalide : une valeur parmi "km"|"mi" attendue');
});

test("explicit locale set after schema construction overrides default", () => {
  const schema = z.enum(["km", "mi"]);
  z.config(z.locales.fr());
  const result = schema.safeParse("feet");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toBe('Option invalide : une valeur parmi "km"|"mi" attendue');
});
