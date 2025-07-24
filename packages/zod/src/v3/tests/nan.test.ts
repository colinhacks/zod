// @ts-ignore TS6133
import { expect, test } from "vitest";

import * as z from "zod/v3";

const schema = z.nan();

test("passing validations", () => {
  schema.parse(Number.NaN);
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
