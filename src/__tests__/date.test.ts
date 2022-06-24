// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const benchmarkDate = new Date(2022, 10, 5);

const minCheck = z.date().min(benchmarkDate);
const maxCheck = z.date().max(benchmarkDate);

test("passing validations", () => {
  minCheck.parse(new Date(benchmarkDate));
  minCheck.parse(new Date(benchmarkDate.getTime() + 1));

  maxCheck.parse(new Date(benchmarkDate));
  maxCheck.parse(new Date(benchmarkDate.getTime() - 1));
});

test("failing validations", () => {
  expect(() => minCheck.parse(benchmarkDate.getTime() - 1)).toThrow();
  expect(() => maxCheck.parse(benchmarkDate.getTime() + 1)).toThrow();
});
