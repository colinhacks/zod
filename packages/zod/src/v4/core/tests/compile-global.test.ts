// Tests the `zod/compile` subpath module — the user-facing API for enabling
// global AOT compilation. Importing this file (or running it under
// compile-mode where the setup file already imported `zod/compile`) installs
// the post-processor for the duration of this vitest worker. Vitest's
// `isolate: true` puts each test file in its own worker, so the install
// doesn't leak to other files.

import { expect, test } from "vitest";
import "zod/compile";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

test("zod/compile sets globalConfig.postProcessor", () => {
  expect(typeof core.globalConfig.postProcessor).toBe("function");
});

test("z.compile is exported from the public namespace", () => {
  expect(typeof z.compile).toBe("function");
  const schema = z.compile(z.object({ name: z.string() }));
  expect(schema.parse({ name: "ok" })).toEqual({ name: "ok" });
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
