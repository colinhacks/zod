// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
const stringSchema = z.string();

test("safeparseoptional fail", () => {
  const safe = stringSchema.safeParseOptional(12);
  expect(safe).toBeUndefined();
});

test("safeparseoptional pass", () => {
  const safe = stringSchema.safeParseOptional("12");
  expect(safe).toEqual("12");
});

test("safeparseoptional unexpected error", () => {
  expect(() =>
    stringSchema
      // deno-lint-ignore no-explicit-any
      .refine((data: any) => {
        throw new Error(data);
      })
      .safeParseOptional("12")
  ).toThrow();
});
