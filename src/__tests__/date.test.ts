// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const beforeBenchmarkDate = new Date(2022, 10, 4);
const benchmarkDate = new Date(2022, 10, 5);
const afterBenchmarkDate = new Date(2022, 10, 6);

const minCheck = z.date().min(benchmarkDate);
const maxCheck = z.date().max(benchmarkDate);

test("passing validations", () => {
  minCheck.parse(benchmarkDate);
  minCheck.parse(afterBenchmarkDate);

  maxCheck.parse(benchmarkDate);
  maxCheck.parse(beforeBenchmarkDate);
});

test("failing validations", () => {
  expect(() => minCheck.parse(beforeBenchmarkDate)).toThrow();
  expect(() => maxCheck.parse(afterBenchmarkDate)).toThrow();
});

test("min max getters", () => {
  expect(minCheck.minDate).toEqual(benchmarkDate);
  expect(minCheck.min(afterBenchmarkDate).minDate).toEqual(afterBenchmarkDate);

  expect(maxCheck.maxDate).toEqual(benchmarkDate);
  expect(maxCheck.max(beforeBenchmarkDate).maxDate).toEqual(
    beforeBenchmarkDate
  );
});

test("custom error message on invalid_date", () => {
  const invalidDate = new Date("I am not a date");
  const customMsg = "I am custom";
  const dateWithMsg = z.date({ message: customMsg });
  try {
    dateWithMsg.parse(invalidDate);
  } catch (error) {
    const issue = (error as z.ZodError).issues[0];
    expect(issue.code).toBe("invalid_date");
    expect(issue.message).toBe(customMsg);
  }
});
