import { expect, test } from "vitest";

import * as z from "zod";

const beforeBenchmarkDate = new Date(2022, 10, 4);
const benchmarkDate = new Date(2022, 10, 5);
const afterBenchmarkDate = new Date(2022, 10, 6);

const y2k = new Date("2000-01-01T00:00:00.000Z");

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
  expect(maxCheck.max(beforeBenchmarkDate).maxDate).toEqual(beforeBenchmarkDate);
});

test("coerce true", () => {
  const withCoerce = z.date({ coerce: true });

  expect(withCoerce.parse(new Date("2000-01-01T00:00:00.000Z"))).toEqual(y2k);
  expect(withCoerce.parse("2000-01-01T00:00:00.000Z")).toEqual(y2k);
  expect(withCoerce.parse("1/1/2000 UTC")).toEqual(
    new Date("2000-01-01T00:00:00.000Z")
  );
  expect(withCoerce.parse(y2k.getTime())).toEqual(y2k);

  // you'll need to watch out for nulls/0 if you use coerce: true
  expect(withCoerce.parse(null)).toEqual(new Date("1970-01-01T00:00:00.000Z"));
  expect(withCoerce.parse(0)).toEqual(new Date("1970-01-01T00:00:00.000Z"));
});

test("coerce iso", () => {
  const withCoerce = z.date({ coerce: "iso" });

  expect(withCoerce.parse(new Date("2000-01-01T00:00:00.000Z"))).toEqual(y2k);
  expect(withCoerce.parse("2000-01-01T00:00:00.000Z")).toEqual(y2k);

  expect(() => withCoerce.parse("1/1/2000 UTC")).toThrow(
    /Expected date, received string/
  );
  expect(() => withCoerce.parse(0)).toThrow(/Expected date, received number/);
  expect(() => withCoerce.parse(null)).toThrow(/Expected date, received null/);
});
