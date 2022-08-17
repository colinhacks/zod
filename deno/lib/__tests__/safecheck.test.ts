// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
const stringSchema = z.string();

test("safecheck typeerror", () => {
  // @ts-expect-error should expect string but receives number
  console.log(stringSchema.safeCheck(12));
  // @ts-expect-error should expect "key" to be present
  z.object({ key: z.string() }).safeCheck({});
});

test("safecheck pass", () => {
  const safe = stringSchema.safeCheck("12");
  expect(safe.success).toEqual(true);
  expect((safe as any).data).toEqual("12");
});

test("safecheck unexpected error", () => {
  expect(() =>
    stringSchema
      .refine((data) => {
        throw new Error(data.toString());
      })
      .safeCheck("12")
  ).toThrow();
});
