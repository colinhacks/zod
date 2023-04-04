// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

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

test("UTC parser", () => {
  const schemaUTCDate = z.date().utc();

  const date = new Date("2023-04-04");

  expect(schemaUTCDate.parse(date).toString()).toEqual('Mon Apr 04 2023 00:00:00 GMT+0000 (Coordinated Universal Time)');
});
