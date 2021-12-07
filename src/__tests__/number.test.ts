// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const gtFive = z.number().gt(5);
const gteFive = z.number().gte(5);
const ltFive = z.number().lt(5);
const lteFive = z.number().lte(5);
const intNum = z.number().int();
const multipleOfFive = z.number().multipleOf(5);
const stepSixPointFour = z.number().step(6.4);
const percentage = z.number().min(0).max(1).step(0.001);

test("passing validations", () => {
  gtFive.parse(6);
  gteFive.parse(5);
  ltFive.parse(4);
  lteFive.parse(5);
  intNum.parse(4);
  multipleOfFive.parse(15);
  stepSixPointFour.parse(12.8);
  percentage.parse(0.5);
});

test("failing validations", () => {
  expect(() => ltFive.parse(5)).toThrow();
  expect(() => lteFive.parse(6)).toThrow();
  expect(() => gtFive.parse(5)).toThrow();
  expect(() => gteFive.parse(4)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
  expect(() => multipleOfFive.parse(14.9)).toThrow();
  expect(() => stepSixPointFour.parse(6.41)).toThrow();
  expect(() => percentage.parse(0.00005)).toThrow();
});

test("parse NaN", () => {
  expect(() => z.number().parse(NaN)).toThrow();
});

test("min max getters", () => {
  expect(z.number().int().isInt).toEqual(true);
  expect(z.number().isInt).toEqual(false);

  expect(z.number().min(5).minValue).toEqual(5);
  expect(z.number().min(5).min(10).minValue).toEqual(10);

  expect(z.number().max(5).maxValue).toEqual(5);
  expect(z.number().max(5).max(1).maxValue).toEqual(1);
});
