// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const gtFive = z.number().gt(5);
const gteFive = z.number().gte(5);
const ltFive = z.number().lt(5);
const lteFive = z.number().lte(5);
const intNum = z.number().int();

test("passing validations", () => {
  gtFive.parse(6);
  gteFive.parse(5);
  ltFive.parse(4);
  lteFive.parse(5);
  intNum.parse(4);
});

test("failing validations", () => {
  expect(() => ltFive.parse(5)).toThrow();
  expect(() => lteFive.parse(6)).toThrow();
  expect(() => gtFive.parse(5)).toThrow();
  expect(() => gteFive.parse(4)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
});

test("required & invalid validations", () => {
  const requiredMessage = "This field is required";
  const invalidMessage = "Expected number, instead of whatever you input!";

  const n = z.number({ invalid: invalidMessage, required: requiredMessage });
  expect(() => n.parse(true)).toThrow(invalidMessage);
  expect(() => n.parse(undefined)).toThrow(requiredMessage);
});

test("required & invalid validations chain", () => {
  const message = { invalid: "invalid", required: "required" };

  const min = z.number(message).min(5, "min5");
  expect(() => min.parse(true)).toThrow(message.invalid);
  expect(() => min.parse(undefined)).toThrow(message.required);

  const max = z.number(message).max(5, "max5");
  expect(() => max.parse(true)).toThrow(message.invalid);
  expect(() => max.parse(undefined)).toThrow(message.required);

  const int = z.number(message).int("int error");
  expect(() => int.parse(true)).toThrow(message.invalid);
  expect(() => int.parse(undefined)).toThrow(message.required);

  const positive = z.number(message).positive("positive error");
  expect(() => positive.parse(true)).toThrow(message.invalid);
  expect(() => positive.parse(undefined)).toThrow(message.required);

  const negative = z.number(message).negative("negative error");
  expect(() => negative.parse(true)).toThrow(message.invalid);
  expect(() => negative.parse(undefined)).toThrow(message.required);

  const nonpositive = z.number(message).nonpositive("nonpositive error");
  expect(() => nonpositive.parse(true)).toThrow(message.invalid);
  expect(() => nonpositive.parse(undefined)).toThrow(message.required);

  const nonnegative = z.number(message).nonnegative("nonnegative error");
  expect(() => nonnegative.parse(true)).toThrow(message.invalid);
  expect(() => nonnegative.parse(undefined)).toThrow(message.required);
});

test("parse NaN", () => {
  expect(() => z.number().parse(NaN)).toThrow();
});
