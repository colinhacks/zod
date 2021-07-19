// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("required & invalid validations", () => {
  const requiredMessage = "This field is required";
  const invalidMessage = "Expected number, instead of whatever you input!";

  const b = z.boolean({ invalid: invalidMessage, required: requiredMessage });
  expect(() => b.parse("false")).toThrow(invalidMessage);
  expect(() => b.parse(undefined)).toThrow(requiredMessage);
});
