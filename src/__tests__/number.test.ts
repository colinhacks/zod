// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const minFive = z.number().min(5, "min5");
const maxFive = z.number().max(5, "max5");
const intNum = z.number().int();

test("passing validations", () => {
  minFive.parse(5);
  minFive.parse(6);
  maxFive.parse(5);
  maxFive.parse(4);
  intNum.parse(4);
});

test("failing validations", () => {
  expect(() => minFive.parse(4)).toThrow();
  expect(() => maxFive.parse(6)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
});

test("required type validations", () => {
  const message = "This field is required";
  const required = z.number({ required: message });
  expect(() => required.parse(undefined)).toThrow(message);
});

test("invalid type validations", () => {
  const message = "Expected number, instead of whatever you input!";
  const invalid = z.number({ invalid: message });
  expect(() => invalid.parse(true)).toThrow(message);
});

test("parse NaN", () => {
  expect(() => z.number().parse(NaN)).toThrow();
});
