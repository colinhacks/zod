import { expect, test } from "vitest";
import * as z from "zod/v4";

// Test data
const beforeStr = "1970-01-01T00:00:00Z";
const benchStr = "1970-01-02T00:00:00Z";
const afterStr = "1970-01-03T00:00:00Z";

const dateBeforeStr = "1970-01-01";
const dateBenchStr = "1970-01-02";
const dateAfterStr = "1970-01-03";

const timeBeforeStr = "00:00:00";
const timeBenchStr = "01:00:00";
const timeAfterStr = "02:00:00";

const ymBeforeStr = "1970-01";
const ymBenchStr = "1970-02";
const ymAfterStr = "1970-03";

const zonedBeforeStr = "1970-01-01T00:00:00+00:00[UTC]";
const zonedBenchStr = "1970-01-02T00:00:00+00:00[UTC]";
const zonedAfterStr = "1970-01-03T00:00:00+00:00[UTC]";

test("instant", () => {
  const schema = z.instant();
  const minCheck = schema.min(benchStr);
  const maxCheck = schema.max(benchStr);

  expect(schema.parse(benchStr).toString()).toEqual(Temporal.Instant.from(benchStr).toString());

  minCheck.parse(benchStr);
  minCheck.parse(afterStr);
  expect(minCheck.safeParse(beforeStr).success).toBe(false);

  maxCheck.parse(benchStr);
  maxCheck.parse(beforeStr);
  expect(maxCheck.safeParse(afterStr).success).toBe(false);
});

test("plainDate", () => {
  const schema = z.plainDate();
  const minCheck = schema.min(dateBenchStr);
  const maxCheck = schema.max(dateBenchStr);

  expect(schema.parse(dateBenchStr).toString()).toEqual(Temporal.PlainDate.from(dateBenchStr).toString());

  minCheck.parse(dateBenchStr);
  minCheck.parse(dateAfterStr);
  expect(minCheck.safeParse(dateBeforeStr).success).toBe(false);

  maxCheck.parse(dateBenchStr);
  maxCheck.parse(dateBeforeStr);
  expect(maxCheck.safeParse(dateAfterStr).success).toBe(false);
});

test("plainDateTime", () => {
  const schema = z.plainDateTime();
  const minCheck = schema.min(benchStr.slice(0, -1)); // remove Z
  const maxCheck = schema.max(benchStr.slice(0, -1));

  expect(schema.parse(benchStr.slice(0, -1)).toString()).toEqual(
    Temporal.PlainDateTime.from(benchStr.slice(0, -1)).toString()
  );

  minCheck.parse(benchStr.slice(0, -1));
  minCheck.parse(afterStr.slice(0, -1));
  expect(minCheck.safeParse(beforeStr.slice(0, -1)).success).toBe(false);

  maxCheck.parse(benchStr.slice(0, -1));
  maxCheck.parse(beforeStr.slice(0, -1));
  expect(maxCheck.safeParse(afterStr.slice(0, -1)).success).toBe(false);
});

test("plainTime", () => {
  const schema = z.plainTime();
  const minCheck = schema.min(timeBenchStr);
  const maxCheck = schema.max(timeBenchStr);

  expect(schema.parse(timeBenchStr).toString()).toEqual(Temporal.PlainTime.from(timeBenchStr).toString());

  minCheck.parse(timeBenchStr);
  minCheck.parse(timeAfterStr);
  expect(minCheck.safeParse(timeBeforeStr).success).toBe(false);

  maxCheck.parse(timeBenchStr);
  maxCheck.parse(timeBeforeStr);
  expect(maxCheck.safeParse(timeAfterStr).success).toBe(false);
});

test("plainYearMonth", () => {
  const schema = z.plainYearMonth();
  const minCheck = schema.min(ymBenchStr);
  const maxCheck = schema.max(ymBenchStr);

  expect(schema.parse(ymBenchStr).toString()).toEqual(Temporal.PlainYearMonth.from(ymBenchStr).toString());

  minCheck.parse(ymBenchStr);
  minCheck.parse(ymAfterStr);
  expect(minCheck.safeParse(ymBeforeStr).success).toBe(false);

  maxCheck.parse(ymBenchStr);
  maxCheck.parse(ymBeforeStr);
  expect(maxCheck.safeParse(ymAfterStr).success).toBe(false);
});

test("zonedDateTime", () => {
  const schema = z.zonedDateTime();
  const minCheck = schema.min(zonedBenchStr);
  const maxCheck = schema.max(zonedBenchStr);

  expect(schema.parse(zonedBenchStr).toString()).toEqual(Temporal.ZonedDateTime.from(zonedBenchStr).toString());

  minCheck.parse(zonedBenchStr);
  minCheck.parse(zonedAfterStr);
  expect(minCheck.safeParse(zonedBeforeStr).success).toBe(false);

  maxCheck.parse(zonedBenchStr);
  maxCheck.parse(zonedBeforeStr);
  expect(maxCheck.safeParse(zonedAfterStr).success).toBe(false);
});
