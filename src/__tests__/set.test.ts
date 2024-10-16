// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";
import { ZodIssueCode } from "../index";

const stringSet = z.set(z.string());
type stringSet = z.infer<typeof stringSet>;

const minTwo = z.set(z.string()).min(2);
const maxTwo = z.set(z.string()).max(2);
const justTwo = z.set(z.string()).size(2);
const nonEmpty = z.set(z.string()).nonempty();
const nonEmptyMax = z.set(z.string()).nonempty().max(2);

test("type inference", () => {
  util.assertEqual<stringSet, Set<string>>(true);
});

test("valid parse", () => {
  const result = z.safeParse(stringSet, new Set(["first", "second"]));
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data.has("first")).toEqual(true);
    expect(result.data.has("second")).toEqual(true);
    expect(result.data.has("third")).toEqual(false);
  }

  expect(() => {
    minTwo.parse(new Set(["a", "b"]));
    minTwo.parse(new Set(["a", "b", "c"]));
    maxTwo.parse(new Set(["a", "b"]));
    maxTwo.parse(new Set(["a"]));
    justTwo.parse(new Set(["a", "b"]));
    nonEmpty.parse(new Set(["a"]));
    nonEmptyMax.parse(new Set(["a"]));
  }).not.toThrow();
});

test("valid parse async", async () => {
  const result = await z.spa(stringSet, new Set(["first", "second"]));
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data.has("first")).toEqual(true);
    expect(result.data.has("second")).toEqual(true);
    expect(result.data.has("third")).toEqual(false);
  }

  const asyncResult = await z.safeParse(
    stringSet,
    new Set(["first", "second"])
  );
  expect(asyncResult.success).toEqual(true);
  if (asyncResult.success) {
    expect(asyncResult.data.has("first")).toEqual(true);
    expect(asyncResult.data.has("second")).toEqual(true);
    expect(asyncResult.data.has("third")).toEqual(false);
  }
});

test("valid parse: size-related methods", () => {
  expect(() => {
    minTwo.parse(new Set(["a", "b"]));
    minTwo.parse(new Set(["a", "b", "c"]));
    maxTwo.parse(new Set(["a", "b"]));
    maxTwo.parse(new Set(["a"]));
    justTwo.parse(new Set(["a", "b"]));
    nonEmpty.parse(new Set(["a"]));
    nonEmptyMax.parse(new Set(["a"]));
  }).not.toThrow();

  const sizeZeroResult = stringSet.parse(new Set());
  expect(sizeZeroResult.size).toBe(0);

  const sizeTwoResult = minTwo.parse(new Set(["a", "b"]));
  expect(sizeTwoResult.size).toBe(2);
});

test("failing when parsing empty set in nonempty ", () => {
  const result = z.safeParse(nonEmpty, new Set());
  expect(result.success).toEqual(false);

  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.too_small);
  }
});

test("failing when set is smaller than min() ", () => {
  const result = z.safeParse(minTwo, new Set(["just_one"]));
  expect(result.success).toEqual(false);

  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.too_small);
  }
});

test("failing when set is bigger than max() ", () => {
  const result = z.safeParse(maxTwo, new Set(["one", "two", "three"]));
  expect(result.success).toEqual(false);

  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.too_big);
  }
});

test("doesn’t throw when an empty set is given", () => {
  const result = z.safeParse(stringSet, new Set([]));
  expect(result.success).toEqual(true);
});

test("throws when a Map is given", () => {
  const result = z.safeParse(stringSet, new Map([]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
  }
});

test("throws when the given set has invalid input", () => {
  const result = z.safeParse(stringSet, new Set([Symbol()]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0]);
  }
});

test("throws when the given set has multiple invalid entries", () => {
  const result = z.safeParse(stringSet, new Set([1, 2] as any[]) as Set<any>);

  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0]);
    expect(result.error.issues[1].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[1].path).toEqual([1]);
  }
});
