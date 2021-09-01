// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

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
