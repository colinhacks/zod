// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;
import { util } from "../helpers/util.ts";

import * as z from "../index.ts";

import type { StandardSchemaV1 } from "@standard-schema/spec";

test("assignability", () => {
  const _s1: StandardSchemaV1 = z.string();
  const _s2: StandardSchemaV1<string> = z.string();
  const _s3: StandardSchemaV1<string, string> = z.string();
  const _s4: StandardSchemaV1<unknown, string> = z.string();
  [_s1, _s2, _s3, _s4];
});

test("type inference", () => {
  const stringToNumber = z.string().transform((x) => x.length);
  type input = StandardSchemaV1.InferInput<typeof stringToNumber>;
  util.assertEqual<input, string>(true);
  type output = StandardSchemaV1.InferOutput<typeof stringToNumber>;
  util.assertEqual<output, number>(true);
});

test("valid parse", () => {
  const schema = z.string();
  const result = schema["~standard"]["validate"]("hello");
  if (result instanceof Promise) {
    throw new Error("Expected sync result");
  }
  expect(result.issues).toEqual(undefined);
  if (result.issues) {
    throw new Error("Expected no issues");
  } else {
    expect(result.value).toEqual("hello");
  }
});

test("invalid parse", () => {
  const schema = z.string();
  const result = schema["~standard"]["validate"](1234);
  if (result instanceof Promise) {
    throw new Error("Expected sync result");
  }
  expect(result.issues).toBeDefined();
  if (!result.issues) {
    throw new Error("Expected issues");
  }
  expect(result.issues.length).toEqual(1);
  expect(result.issues[0].path).toEqual([]);
});

test("valid parse async", async () => {
  const schema = z.string().refine(async () => true);
  const _result = schema["~standard"]["validate"]("hello");
  if (_result instanceof Promise) {
    const result = await _result;
    expect(result.issues).toEqual(undefined);
    if (result.issues) {
      throw new Error("Expected no issues");
    } else {
      expect(result.value).toEqual("hello");
    }
  } else {
    throw new Error("Expected async result");
  }
});

test("invalid parse async", async () => {
  const schema = z.string().refine(async () => false);
  const _result = schema["~standard"]["validate"]("hello");
  if (_result instanceof Promise) {
    const result = await _result;
    expect(result.issues).toBeDefined();
    if (!result.issues) {
      throw new Error("Expected issues");
    }
    expect(result.issues.length).toEqual(1);
    expect(result.issues[0].path).toEqual([]);
  } else {
    throw new Error("Expected async result");
  }
});
