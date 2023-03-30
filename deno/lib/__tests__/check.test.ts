// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
const stringSchema = z.string();

test("check fail", () => {
  const safe = stringSchema.check(12);
  expect(safe).toEqual(false);
});

test("safeparse pass", () => {
  const safe = stringSchema.check("12");
  expect(safe).toEqual(true);
});

test("safeparse unexpected error", () => {
  expect(() =>
    stringSchema
      .refine((data) => {
        throw new Error(data);
      })
      .check("12")
  ).toThrow();
});
