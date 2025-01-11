// @ts-ignore TS6133
import { expect, test } from "vitest";

import * as z from "../src/index.js";

const num = z.number();
const gtFive = z.number().gt(5);
const gteFive = z.number().gte(5);
const minFive = z.number().min(5);
const ltFive = z.number().lt(5);
const lteFive = z.number().lte(5);
const maxFive = z.number().max(5);
const intNum = z.number().int();
const positive = z.number().positive();
const negative = z.number().negative();
const nonpositive = z.number().nonpositive();
const nonnegative = z.number().nonnegative();
const multipleOfFive = z.number().multipleOf(5);
const multipleOfNegativeFive = z.number().multipleOf(-5);
const finite = z.number().finite();
const safe = z.number().safe();
const stepPointOne = z.number().step(0.1);
const stepPointZeroZeroZeroOne = z.number().step(0.0001);
const stepSixPointFour = z.number().step(6.4);

test("z.number()", () => {
  expect(num.parse(1234)).toEqual(1234);
});

test("NaN not valid", () => {
  expect(() => z.number().parse(Number.NaN)).toThrow();
});

test("Infinity not valid", () => {
  expect(() => z.number().parse(Number.POSITIVE_INFINITY)).toThrow();
  expect(() => z.number().parse(Number.NEGATIVE_INFINITY)).toThrow();
});

test(".gt()", () => {
  expect(gtFive.parse(6)).toEqual(6);
  expect(() => gtFive.parse(5)).toThrow();
});

test(".gte()", () => {
  expect(gteFive.parse(5)).toEqual(5);
  expect(() => gteFive.parse(4)).toThrow();
});

test(".min()", () => {
  expect(minFive.parse(5)).toEqual(5);
  expect(() => minFive.parse(4)).toThrow();
});

test(".lt()", () => {
  expect(ltFive.parse(4)).toEqual(4);
  expect(() => ltFive.parse(5)).toThrow();
});

test(".lte()", () => {
  expect(lteFive.parse(5)).toEqual(5);
  expect(() => lteFive.parse(6)).toThrow();
});

test(".max()", () => {
  expect(maxFive.parse(5)).toEqual(5);
  expect(() => maxFive.parse(6)).toThrow();
});

test(".int()", () => {
  expect(intNum.parse(4)).toEqual(4);
  expect(() => intNum.parse(3.14)).toThrow();
});

test(".positive()", () => {
  expect(positive.parse(1)).toEqual(1);
  expect(() => positive.parse(0)).toThrow();
  expect(() => positive.parse(-1)).toThrow();
});

test(".negative()", () => {
  expect(negative.parse(-1)).toEqual(-1);
  expect(() => negative.parse(0)).toThrow();
  expect(() => negative.parse(1)).toThrow();
});

test(".nonpositive()", () => {
  expect(nonpositive.parse(0)).toEqual(0);
  expect(nonpositive.parse(-1)).toEqual(-1);
  expect(() => nonpositive.parse(1)).toThrow();
});

test(".nonnegative()", () => {
  expect(nonnegative.parse(0)).toEqual(0);
  expect(nonnegative.parse(1)).toEqual(1);
  expect(() => nonnegative.parse(-1)).toThrow();
});

test(".multipleOf()", () => {
  expect(multipleOfFive.parse(15)).toEqual(15);
  expect(multipleOfFive.parse(-15)).toEqual(-15);
  expect(() => multipleOfFive.parse(7.5)).toThrow();
  expect(() => multipleOfFive.parse(-7.5)).toThrow();
});

test(".multipleOf() with negative divisor", () => {
  expect(multipleOfNegativeFive.parse(-15)).toEqual(-15);
  expect(multipleOfNegativeFive.parse(15)).toEqual(15);
  expect(() => multipleOfNegativeFive.parse(-7.5)).toThrow();
  expect(() => multipleOfNegativeFive.parse(7.5)).toThrow();
});

test(".step()", () => {
  expect(stepPointOne.parse(6)).toEqual(6);
  expect(stepPointOne.parse(6.1)).toEqual(6.1);
  expect(stepSixPointFour.parse(12.8)).toEqual(12.8);
  expect(stepPointZeroZeroZeroOne.parse(3.01)).toEqual(3.01);
  expect(() => stepPointOne.parse(6.11)).toThrow();
  expect(() => stepPointOne.parse(6.1000000001)).toThrow();
  expect(() => stepSixPointFour.parse(6.41)).toThrow();
});

test(".finite()", () => {
  expect(finite.parse(123)).toEqual(123);
  expect(() => finite.parse(Number.POSITIVE_INFINITY)).toThrow();
  expect(() => finite.parse(Number.NEGATIVE_INFINITY)).toThrow();
});

test(".safe()", () => {
  expect(safe.parse(Number.MIN_SAFE_INTEGER)).toEqual(Number.MIN_SAFE_INTEGER);
  expect(safe.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
  expect(() => safe.parse(Number.MIN_SAFE_INTEGER - 1)).toThrow();
  expect(() => safe.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
});

test("min max getters", () => {
  expect(z.number().minValue).toBeNull;
  expect(ltFive.minValue).toBeNull;
  expect(lteFive.minValue).toBeNull;
  expect(maxFive.minValue).toBeNull;
  expect(negative.minValue).toBeNull;
  expect(nonpositive.minValue).toBeNull;
  expect(intNum.minValue).toBeNull;
  expect(multipleOfFive.minValue).toBeNull;
  expect(finite.minValue).toBeNull;
  expect(gtFive.minValue).toEqual(5);
  expect(gteFive.minValue).toEqual(5);
  expect(minFive.minValue).toEqual(5);
  expect(minFive.min(10).minValue).toEqual(10);
  expect(positive.minValue).toEqual(0);
  expect(nonnegative.minValue).toEqual(0);
  expect(safe.minValue).toEqual(Number.MIN_SAFE_INTEGER);

  expect(z.number().maxValue).toBeNull;
  expect(gtFive.maxValue).toBeNull;
  expect(gteFive.maxValue).toBeNull;
  expect(minFive.maxValue).toBeNull;
  expect(positive.maxValue).toBeNull;
  expect(nonnegative.maxValue).toBeNull;
  expect(intNum.minValue).toBeNull;
  expect(multipleOfFive.minValue).toBeNull;
  expect(finite.minValue).toBeNull;
  expect(ltFive.maxValue).toEqual(5);
  expect(lteFive.maxValue).toEqual(5);
  expect(maxFive.maxValue).toEqual(5);
  expect(maxFive.max(1).maxValue).toEqual(1);
  expect(negative.maxValue).toEqual(0);
  expect(nonpositive.maxValue).toEqual(0);
  expect(safe.maxValue).toEqual(Number.MAX_SAFE_INTEGER);
});

test("int getter", () => {
  expect(z.number().isInt).toEqual(false);
  expect(z.number().int().isInt).toEqual(true);
  expect(z.number().safe().isInt).toEqual(true);
  expect(multipleOfFive.isInt).toEqual(true);
});

/** In Zod 4, number schemas don't accept infinite values. */
test("finite getter", () => {
  expect(z.number().isFinite).toEqual(true);
});
