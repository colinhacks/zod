import { expect, test } from "vitest";

import * as z from "../../index.js";
import * as core from "../index.js";

// Global compilation is opt-in through `import "zod/compile"`, and that opt-in mutates `globalThis.__zod_globalConfig` — process-global state, not module state. Two things therefore have to hold, and neither is evident from reading the module: importing zod must not install the post-processor, and the compile-mode vitest project must not leak its setup file into the default one. Both projects run this file and each asserts the state it is supposed to be in, so a leak in either direction fails here instead of silently turning the default suite into a second compiled run (or the compiled suite into a second uncompiled one).
const compileMode = (globalThis as any).__zodCompileStats !== undefined;

test("global compilation is installed only under compile mode", () => {
  if (compileMode) {
    expect(core.globalConfig.postProcessor).toBeTypeOf("function");
  } else {
    expect(core.globalConfig.postProcessor).toBeUndefined();
  }
});

test("a freshly constructed schema is compiled only under compile mode", () => {
  const schema = z.object({ a: z.string() });
  // The global shim replaces `_zod.run` at construction time and tags itself with `__originalRun` so a later compile can unwrap past it. An untagged `run` is proof the post-processor never touched this schema.
  const tagged = (schema._zod.run as { __originalRun?: unknown }).__originalRun !== undefined;
  expect(tagged).toBe(compileMode);

  // Either way the schema has to parse identically.
  expect(schema.parse({ a: "x" })).toEqual({ a: "x" });
  expect(schema.safeParse({ a: 1 }).success).toBe(false);
});
