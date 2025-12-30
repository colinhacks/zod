import { describe, expectTypeOf, test } from "vitest";
import type * as core from "../../core/index.js";
import * as z from "../index.js";

describe("type refinement with type guards", () => {
  test("type guard narrows output type", () => {
    const schema = z.string().refine((s): s is "a" => s === "a");

    expectTypeOf<core.input<typeof schema>>().toEqualTypeOf<string>();
    expectTypeOf<core.output<typeof schema>>().toEqualTypeOf<"a">();
  });

  test("non-type-guard refine does not narrow", () => {
    const schema = z.string().refine((s) => s.length > 0);

    expectTypeOf<core.input<typeof schema>>().toEqualTypeOf<string>();
    expectTypeOf<core.output<typeof schema>>().toEqualTypeOf<string>();
  });
});
