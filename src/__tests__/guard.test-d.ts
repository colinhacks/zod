import { describe, expectTypeOf, test } from "vitest";
import { z } from "../index";

describe("guard", () => {
  test("work as a type guard when Output extends Input", () => {
    expectTypeOf<true>().toEqualTypeOf<true>();
  });
  test("work as a type guard when Output *does* extend Input", () => {
    const inputExtendsOutputSchema = z.object({
      a: z.string(),
      b: z.enum(["x", "y"]).transform((arg) => arg as string),
    });
    const val = null as unknown;
    if (inputExtendsOutputSchema.guard(val)) {
      expectTypeOf(val).toEqualTypeOf<{ a: string; b: string }>();
    } else {
      expectTypeOf(val).toEqualTypeOf<unknown>();
    }
  });

  test("to be unavailable when Output *does not* extend Input", () => {
    const inputDiffersFromOutputSchema = z
      .string()
      .transform((arg) => parseFloat(arg));
    const val = null as unknown;
    // @ts-expect-error - compile error as Input does not extend Output
    inputDiffersFromOutputSchema.guard(val);
  });
});
