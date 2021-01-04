// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
import { ZodIssueCode } from "../index.ts";

const stringMap = z.map(z.string(), z.string());
type stringMap = z.infer<typeof stringMap>;

test("type inference", () => {
  const f1: util.AssertEqual<stringMap, Map<string, string>> = true;
  f1;
});

test("doesn’t throw when a valid value is given", () => {
  const result = stringMap.safeParse(
    new Map([
      ["first", "foo"],
      ["second", "bar"],
    ])
  );
  expect(result.success).toEqual(true);
});

test("throws when a Set is given", () => {
  const result = stringMap.safeParse(new Set([]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
  }
});

test("throws when the given map has invalid key and invalid value", () => {
  const result = stringMap.safeParse(new Map([[42, Symbol()]]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0, "key"]);
    expect(result.error.issues[1].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[1].path).toEqual([0, "value"]);
  }
});

test("throws when the given map has multiple invalid entries", () => {
  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));

  const result = stringMap.safeParse(
    new Map([
      [1, "foo"],
      ["bar", 2],
    ] as [any, any][]) as Map<any, any>
  );

  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0, "key"]);
    expect(result.error.issues[1].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[1].path).toEqual([1, "value"]);
  }
});
