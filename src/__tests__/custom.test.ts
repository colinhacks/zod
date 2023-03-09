// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("passing validations", () => {
  const example1 = z.custom<number>((x) => typeof x === "number");
  example1.parse(1234);
  expect(() => example1.parse({})).toThrow();
});

test("string params", () => {
  const example1 = z.custom<number>((x) => typeof x !== "number", "customerr");
  const result = example1.safeParse(1234);
  expect(result.success).toEqual(false);
  // @ts-ignore
  expect(JSON.stringify(result.error).includes("customerr")).toEqual(true);
});
