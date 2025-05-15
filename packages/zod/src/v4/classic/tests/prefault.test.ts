import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test("basic prefault", () => {
  const a = z.prefault(z.string().trim(), "  default  ");
  expect(a).toBeInstanceOf(z.ZodPipe);
  expect(a.parse("  asdf  ")).toEqual("asdf");
  expect(a.parse(undefined)).toEqual("default");

  type inp = z.input<typeof a>;
  expectTypeOf<inp>().toEqualTypeOf<string | undefined>();
  type out = z.output<typeof a>;
  expectTypeOf<out>().toEqualTypeOf<string>();
});

test("prefault inside object", () => {});
