// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("required type validations", () => {
  const message = "This field is required";
  const required = z.boolean({ required: message });
  expect(() => required.parse(undefined)).toThrow(message);
});

test("invalid type validations", () => {
  const message = "Expected boolean, instead of whatever you input!";
  const invalid = z.boolean({ invalid: message });
  expect(() => invalid.parse("false")).toThrow(message);
});
