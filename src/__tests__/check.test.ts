// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
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
