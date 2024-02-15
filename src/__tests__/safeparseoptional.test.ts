// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
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
