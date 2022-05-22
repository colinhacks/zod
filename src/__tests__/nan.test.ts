// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const schema = z.nan();

test("passing validations", () => {
  schema.parse(NaN);
  schema.parse(Number("Not a number"));
});

test("failing validations", () => {
  expect(() => schema.parse(5)).toThrow();
  expect(() => schema.parse("John")).toThrow();
  expect(() => schema.parse(true)).toThrow();
  expect(() => schema.parse(null)).toThrow();
  expect(() => schema.parse(undefined)).toThrow();
  expect(() => schema.parse({})).toThrow();
  expect(() => schema.parse([])).toThrow();
});
