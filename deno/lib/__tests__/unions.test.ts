import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("function parsing", () => {
  const schema = z.union([
    z.string().refine(() => false),
    z.number().refine(() => false),
  ]);
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);
});

test("union 2", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
});
