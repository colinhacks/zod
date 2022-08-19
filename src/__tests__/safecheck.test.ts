// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
const stringSchema = z.string();

test("safecheck typeerror", () => {
  // @ts-expect-error should expect string but receives number
  stringSchema.safeDecode(12);
  // @ts-expect-error should expect "key" to be present
  z.object({ key: z.string() }).safeDecode({});
});

test("safecheck pass", () => {
  const safe = stringSchema.safeDecode("12");
  expect(safe.success).toEqual(true);
  expect((safe as any).data).toEqual("12");
});

test("safecheck unexpected error", () => {
  expect(() =>
    stringSchema
      .refine((data) => {
        throw new Error(data.toString());
      })
      .safeDecode("12")
  ).toThrow();
});
