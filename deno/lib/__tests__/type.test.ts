import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("ZodType is covariant with the output", () => {
  function f<S extends z.ZodType<string, any, any>>(_: S) {}
  f(z.literal("a"));
});

test("ZodType is contravariant with the input", () => {
  function f<S extends z.ZodType<any, any, "a">>(_: S) {}
  f(z.string());
});
