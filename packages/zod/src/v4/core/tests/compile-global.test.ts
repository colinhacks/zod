// Tests the `zod/compile` subpath module — the user-facing API for enabling
// global AOT compilation. This file is run under the default test suite (NOT
// compile-mode) because it intentionally toggles the post-processor on/off to
// validate the import side effect.
//
// Manages its own globalConfig.postProcessor state with beforeAll/afterAll so
// it doesn't pollute other test files that share the worker.

import { afterAll, beforeAll, expect, test } from "vitest";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

const savedPostProcessor = core.globalConfig.postProcessor;

beforeAll(async () => {
  core.globalConfig.postProcessor = undefined;
  // Dynamic import so the side effect happens after we've cleared any
  // pre-existing post-processor.
  await import("zod/compile");
});

afterAll(() => {
  core.globalConfig.postProcessor = savedPostProcessor;
});

test("zod/compile sets globalConfig.postProcessor", () => {
  expect(typeof core.globalConfig.postProcessor).toBe("function");
});

test("schemas constructed after import are compiled on first parse", () => {
  const schema = z.object({ name: z.string(), age: z.number() });

  // First parse: shim fires, compiles, replaces self.
  const r1 = schema.safeParse({ name: "ok", age: 1 });
  expect(r1.success).toBe(true);

  // Second parse: directly through compiled wrapper.
  const r2 = schema.safeParse({ name: "ok", age: 2 });
  expect(r2.success).toBe(true);

  const bad = schema.safeParse({ name: 1, age: "x" });
  expect(bad.success).toBe(false);
});

test("schemas with unsupported features fall back without crashing", () => {
  const schema = z.string().refine(async () => true);
  // First call attempts compile, falls back. Subsequent calls use runtime.
  // Sync parse of an async-refined schema is its own runtime concern; we
  // only care that the post-processor doesn't crash with a compile error.
  expect(() => schema.safeParse("ok")).not.toThrow(/ZodCompile/);
});
