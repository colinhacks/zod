// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const gtFive = z.number().gt(5);
const gteFive = z.number().gte(5);
const ltFive = z.number().lt(5);
const lteFive = z.number().lte(5);
const intNum = z.number().int();
const multipleOfFive = z.number().multipleOf(5);
const modSixPointFour = z.number().mod(6.4);

test("passing validations", () => {
  gtFive.parse(6);
  gteFive.parse(5);
  ltFive.parse(4);
  lteFive.parse(5);
  intNum.parse(4);
  multipleOfFive.parse(15);
  modSixPointFour.parse(12.8);
});

test("failing validations", () => {
  expect(() => ltFive.parse(5)).toThrow();
  expect(() => lteFive.parse(6)).toThrow();
  expect(() => gtFive.parse(5)).toThrow();
  expect(() => gteFive.parse(4)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
  expect(() => multipleOfFive.parse(14.9)).toThrow();
  expect(() => modSixPointFour.parse(6.41)).toThrow();
});

test("parse NaN", () => {
  expect(() => z.number().parse(NaN)).toThrow();
});
