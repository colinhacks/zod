// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
import { ZodIssueCode } from "../index.ts";

const stringSet = z.set(z.string());
type stringSet = z.infer<typeof stringSet>;

test("type inference", () => {
  const f1: util.AssertEqual<stringSet, Set<string>> = true;
  f1;
});

test("doesn’t throw when a valid value is given", () => {
  const result = stringSet.safeParse(new Set(["first", "second"]));
  expect(result.success).toEqual(true);
});

test("doesn’t throw when an empty set is given", () => {
  const result = stringSet.safeParse(new Set([]));
  expect(result.success).toEqual(true);
});

test("throws when a Map is given", () => {
  const result = stringSet.safeParse(new Map([]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
  }
});

test("throws when the given set has invalid input", () => {
  const result = stringSet.safeParse(new Set([Symbol()]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0]);
  }
});

test("throws when the given set has multiple invalid entries", () => {
  const result = stringSet.safeParse(new Set([1, 2] as any[]) as Set<any>);

  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0]);
    expect(result.error.issues[1].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[1].path).toEqual([1]);
  }
});
