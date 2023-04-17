// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("infer type", () => {
  const schema = z.select(["Red", "Green", "Blue", 10]);
  type Schema = z.infer<typeof schema>;
  util.assertEqual<Schema, string | number>(true);
});

test("infer const type", () => {
  const schema = z.select(["Red", "Green", "Blue", 10] as const);
  type Schema = z.infer<typeof schema>;
  util.assertEqual<Schema, "Red" | "Green" | "Blue" | 10>(true);
});

test("get options", () => {
  expect(z.select(["tuna", "trout"]).options).toEqual(["tuna", "trout"]);
});

test("parse string value", () => {
  const result = z.select(["Red", "Green", "Blue"]).safeParse("Green");
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data).toEqual("Green");
  }
});

test("parse number value", () => {
  const result = z.select([10, 20, 30]).safeParse(20);
  expect(result.success).toEqual(true);
  if (result.success) {
    expect(result.data).toEqual(20);
  }
});

test("parse missing value", () => {
  const result = z.select(["Red", "Green", "Blue"]).safeParse("Violet");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual(
      "Invalid value. Expected one of 3 options, received 'Violet'"
    );
  }
});

test("error params", () => {
  const result = z
    .select(["Red", "Green", "Blue"], { required_error: "REQUIRED" })
    .safeParse(undefined);
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("REQUIRED");
  }
});
