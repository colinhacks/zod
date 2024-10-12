import { test } from "@jest/globals";

import * as z from "../index";

test("ZodType is covariant with the output", () => {
  function f<S extends z.ZodType<string, any, any>>(_: S) {}
  f(z.literal("a"));

  function g<S extends z.ZodType<"a", any, any>>(_: S) {}
  // @ts-expect-error
  g(z.string());
});

test("ZodType is contravariant with the input", () => {
  function f<S extends z.ZodType<any, any, "a">>(_: S) {}
  f(z.string());

  function g<S extends z.ZodType<any, any, string>>(_: S) {}
  // @ts-expect-error
  g(z.literal("a"));
});
