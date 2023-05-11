// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
const stringSchema = z.string();

test("assert fail", () => {
  const data = 12 as unknown;
  const asserted = stringSchema.assert(data);
  let output = data;

  if (asserted) {
    // Type coerced from unknown to string. Should NOT happen in runtime.
    output = data.toLowerCase?.();
  }

  expect(output).toBe(12);
  expect(asserted).toBe(false);
});

test("assert pass", () => {
  const data = "ABC" as unknown;
  const asserted = stringSchema.assert(data);
  let output = data;

  if (asserted) {
    // Type coerced from unknown to string. SHOULD happen in runtime.
    output = data.toLowerCase();
  }

  expect(output).toBe("abc");
  expect(asserted).toBe(true);
});

test("assert unexpected error", () => {
  expect(() =>
    stringSchema
      .refine((data) => {
        throw new Error(data);
      })
      .assert("12")
  ).toThrow();
});
