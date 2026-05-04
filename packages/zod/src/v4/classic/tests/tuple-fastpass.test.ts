// Regression tests pinning the JIT fastpass for $ZodTuple. Each scenario
// constructs the SAME schema once with the JIT enabled (default) and once
// with `jitless: true`, parses identical input through both, and asserts
// the outputs and issue paths match. Any divergence between the codegen
// path and the interpreter path is a bug.
//
// The schemas are constructed *after* toggling `globalConfig.jitless`
// because the fastpass enable flag is captured at construction time.

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import * as z from "zod/v4";
import { globalConfig } from "zod/v4/core";

function buildJitless<T>(fn: () => T): T {
  globalConfig.jitless = true;
  try {
    return fn();
  } finally {
    globalConfig.jitless = false;
  }
}

describe("tuple fastpass — JIT vs jitless parity", () => {
  beforeEach(() => {
    globalConfig.jitless = false;
  });
  afterEach(() => {
    globalConfig.jitless = false;
  });

  test("3 required items — happy path", () => {
    const make = () => z.tuple([z.string(), z.number(), z.boolean()]);
    const jit = make();
    const jitless = buildJitless(make);
    const input = ["x", 1, true];
    expect(jit.parse(input)).toEqual(jitless.parse(input));
  });

  test("3 required items — invalid second element", () => {
    const make = () => z.tuple([z.string(), z.number(), z.boolean()]);
    const jit = make();
    const jitless = buildJitless(make);
    const input = ["x", "not-a-number", true];
    const j = jit.safeParse(input);
    const i = jitless.safeParse(input);
    expect(j.success).toBe(false);
    expect(i.success).toBe(false);
    expect(j.error?.issues).toEqual(i.error?.issues);
    expect(j.error?.issues[0]?.path).toEqual([1]);
  });

  test("nested tuple — issue path stays correct through both paths", () => {
    const make = () => z.tuple([z.string(), z.tuple([z.number(), z.number()])]);
    const jit = make();
    const jitless = buildJitless(make);
    const input = ["ok", [1, "bad"]];
    const j = jit.safeParse(input);
    const i = jitless.safeParse(input);
    expect(j.error?.issues).toEqual(i.error?.issues);
    expect(j.error?.issues[0]?.path).toEqual([1, 1]);
  });

  test("too_small / too_big invariants", () => {
    const make = () => z.tuple([z.string(), z.string(), z.string()]);
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.safeParse(["a"]).error?.issues).toEqual(jitless.safeParse(["a"]).error?.issues);
    expect(jit.safeParse(["a", "b", "c", "d"]).error?.issues).toEqual(
      jitless.safeParse(["a", "b", "c", "d"]).error?.issues
    );
  });

  test("rest element — extras validated", () => {
    const make = () => z.tuple([z.string()], z.number());
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.parse(["x", 1, 2, 3])).toEqual(jitless.parse(["x", 1, 2, 3]));
    const j = jit.safeParse(["x", 1, "bad", 3]);
    const i = jitless.safeParse(["x", 1, "bad", 3]);
    expect(j.error?.issues).toEqual(i.error?.issues);
    expect(j.error?.issues[0]?.path).toEqual([2]);
  });

  test("rest with no extras", () => {
    const make = () => z.tuple([z.string()], z.number());
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.parse(["x"])).toEqual(jitless.parse(["x"]));
  });

  test("optout tail — absent optional input truncates the result", () => {
    const make = () => z.tuple([z.string(), z.string().optional(), z.string().optional()]);
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.parse(["a"])).toEqual(jitless.parse(["a"]));
    expect(jit.parse(["a", "b"])).toEqual(jitless.parse(["a", "b"]));
    expect(jit.parse(["a", "b", "c"])).toEqual(jitless.parse(["a", "b", "c"]));
  });

  test("explicit undefined inside input is preserved (not truncated)", () => {
    const make = () => z.tuple([z.string(), z.string().or(z.undefined())]);
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.parse(["a", undefined])).toEqual(jitless.parse(["a", undefined]));
  });

  test("non-array input — invalid_type", () => {
    const make = () => z.tuple([z.string()]);
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.safeParse({ 0: "x", length: 1 }).error?.issues).toEqual(
      jitless.safeParse({ 0: "x", length: 1 }).error?.issues
    );
  });

  test("empty tuple", () => {
    const make = () => z.tuple([]);
    const jit = make();
    const jitless = buildJitless(make);
    expect(jit.parse([])).toEqual(jitless.parse([]));
    expect(jit.safeParse(["unexpected"]).error?.issues).toEqual(jitless.safeParse(["unexpected"]).error?.issues);
  });

  test("async item falls through to non-fastpass path", async () => {
    const make = () => z.tuple([z.string().refine(async (s) => s.length > 0)]);
    const jit = make();
    await expect(jit.parseAsync(["hi"])).resolves.toEqual(["hi"]);
  });
});
