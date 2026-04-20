import { expect, test } from "vitest";
import * as z from "zod/v4";

/**
 * Regression tests for V8 fast-property mode.
 *
 * V8 switches from fast-property mode (inline cache) to a hash-map (dictionary
 * mode) when an object accumulates too many own properties. The threshold is
 * engine-specific but is around 20–30 for V8. Dictionary mode degrades property
 * access by ~24x for schema introspection.
 *
 * These tests assert that common schema instances stay well below that threshold,
 * ensuring the shadow-proto optimization has the intended effect.
 *
 * See: https://github.com/colinhacks/zod/issues/5760
 */

const MAX_OWN_PROPS = 25;

function ownPropCount(schema: unknown): number {
  return Object.getOwnPropertyNames(schema as object).length;
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

test("z.string() stays below fast-property threshold", () => {
  const schema = z.string();
  const count = ownPropCount(schema);
  expect(count).toBeLessThan(MAX_OWN_PROPS);
});

test("z.string().min(1).max(10).email() stays below threshold", () => {
  const schema = z.string().min(1).max(10).email();
  const count = ownPropCount(schema);
  expect(count).toBeLessThan(MAX_OWN_PROPS);
});

test("z.number() stays below fast-property threshold", () => {
  const schema = z.number();
  expect(ownPropCount(schema)).toBeLessThan(MAX_OWN_PROPS);
});

test("z.object({}) stays below fast-property threshold", () => {
  const schema = z.object({ name: z.string(), age: z.number() });
  expect(ownPropCount(schema)).toBeLessThan(MAX_OWN_PROPS);
});

test("z.array(z.string()) stays below fast-property threshold", () => {
  const schema = z.array(z.string());
  expect(ownPropCount(schema)).toBeLessThan(MAX_OWN_PROPS);
});

test("builder methods are on the prototype, not own properties", () => {
  const schema = z.string();
  // Builder methods must NOT be own properties (they live on the internal proto)
  expect(hasOwn(schema, "optional")).toBe(false);
  expect(hasOwn(schema, "nullable")).toBe(false);
  expect(hasOwn(schema, "describe")).toBe(false);
  expect(hasOwn(schema, "array")).toBe(false);
  // But they must still be callable via prototype lookup
  expect(typeof schema.optional).toBe("function");
  expect(typeof schema.nullable).toBe("function");
  expect(typeof schema.describe).toBe("function");
  expect(typeof schema.array).toBe("function");
});

test("parse methods are still own properties (for detached usage)", () => {
  const schema = z.string();
  // Parse-family must remain own properties so destructuring works
  expect(hasOwn(schema, "parse")).toBe(true);
  expect(hasOwn(schema, "safeParse")).toBe(true);
  expect(hasOwn(schema, "parseAsync")).toBe(true);
  expect(hasOwn(schema, "safeParseAsync")).toBe(true);
  // Verify detached usage works
  const { parse } = schema;
  expect(parse("hello")).toBe("hello");
});
