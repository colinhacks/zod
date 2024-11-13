// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
import { ZodIssueCode } from "../index.ts";

const stringMap = z.map(z.string(), z.string());
type stringMap = z.infer<typeof stringMap>;

test("type inference", () => {
  util.assertEqual<stringMap, Map<string, string>>(true);
});

test("valid parse", () => {
  const result = z.safeParse(
    stringMap,
    new Map([
      ["first", "foo"],
      ["second", "bar"],
    ])
  );
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data.has("first")).toEqual(true);
    expect(result.data.has("second")).toEqual(true);
    expect(result.data.get("first")).toEqual("foo");
    expect(result.data.get("second")).toEqual("bar");
  }
});

test("valid parse async", async () => {
  const result = await z.spa(
    stringMap,
    new Map([
      ["first", "foo"],
      ["second", "bar"],
    ])
  );
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data.has("first")).toEqual(true);
    expect(result.data.has("second")).toEqual(true);
    expect(result.data.get("first")).toEqual("foo");
    expect(result.data.get("second")).toEqual("bar");
  }
});

test("throws when a Set is given", () => {
  const result = z.safeParse(stringMap, new Set([]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(1);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
  }
});

test("throws when the given map has invalid key and invalid input", () => {
  const result = z.safeParse(stringMap, new Map([[42, Symbol()]]));
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
  // const result = z.safeParse(stringMap, new Map([[42, Symbol()]]));

  const result = z.safeParse(
    stringMap,
    new Map([
      [1, "foo"],
      ["bar", 2],
    ] as [any, any][]) as Map<any, any>
  );

  // const result = z.safeParse(stringMap, new Map([[42, Symbol()]]));
  expect(result.success).toEqual(false);
  if (result.success === false) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[0].path).toEqual([0, "key"]);
    expect(result.error.issues[1].code).toEqual(ZodIssueCode.invalid_type);
    expect(result.error.issues[1].path).toEqual([1, "value"]);
  }
});

test("dirty", async () => {
  const map = z.map(
    z.string().refine((val) => val === val.toUpperCase(), {
      message: "Keys must be uppercase",
    }),
    z.string()
  );
  const result = await z.spa(
    map,
    new Map([
      ["first", "foo"],
      ["second", "bar"],
    ])
  );
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(z.ZodIssueCode.custom);
    expect(result.error.issues[0].message).toEqual("Keys must be uppercase");
    expect(result.error.issues[1].code).toEqual(z.ZodIssueCode.custom);
    expect(result.error.issues[1].message).toEqual("Keys must be uppercase");
  }
});
