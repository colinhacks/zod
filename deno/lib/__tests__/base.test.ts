// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("type guard", () => {
  const stringToNumber = z.string().transform((arg) => arg.length);

  const s1 = z.object({
    stringToNumber,
  });
  type t1 = z.input<typeof s1>;

  const data = { stringToNumber: "asdf" };
  const parsed = z.safeParse(s1, data);
  if (parsed.success) {
    util.assertEqual<typeof data, t1>(true);
  }
});

test("test this binding", () => {
  const callback = (predicate: (val: string) => boolean) => {
    return predicate("hello");
  };

  expect(callback((value) => z.safeParse(z.string(), value).success)).toBe(
    true
  ); // true
  expect(callback((value) => z.safeParse(z.string(), value).success)).toBe(
    true
  ); // true
});
