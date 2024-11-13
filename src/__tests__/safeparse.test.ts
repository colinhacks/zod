// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
const stringSchema = z.string();

test("safeparse fail", () => {
  const safe = z.safeParse(stringSchema, 12);
  expect(safe.success).toEqual(false);
  expect(safe.error).toBeInstanceOf(z.ZodError);
});

test("safeparse pass", () => {
  const safe = z.safeParse(stringSchema, "12");
  expect(safe.success).toEqual(true);
  expect(safe.data).toEqual("12");
});

test("safeparse unexpected error", () => {
  expect(() =>
    z.safeParse(
      stringSchema.refine((data) => {
        throw new Error(data);
      }),
      "12"
    )
  ).toThrow();
});
