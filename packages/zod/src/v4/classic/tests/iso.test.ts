import { expect, test } from "vitest";
import * as z from "zod/v4";

// ─────────────────────────────────────────────
// z.iso.datetime()
// ─────────────────────────────────────────────

test("z.iso.datetime - default (UTC only, any precision)", () => {
  const dt = z.iso.datetime();

  // valid
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00.123Z").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00.123456Z").success).toBe(true);
  expect(dt.safeParse("1970-01-01T00:00:00Z").success).toBe(true);
  expect(dt.safeParse("9999-12-31T23:59:59.999Z").success).toBe(true);

  // no timezone → rejected
  expect(dt.safeParse("2021-01-01T00:00:00").success).toBe(false);
  // offset → rejected (offset: false by default)
  expect(dt.safeParse("2021-01-01T00:00:00+07:00").success).toBe(false);
  // bad values
  expect(dt.safeParse("").success).toBe(false);
  expect(dt.safeParse("foo").success).toBe(false);
  expect(dt.safeParse("2021-01-01").success).toBe(false);
  expect(dt.safeParse("2021-13-01T00:00:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-32T00:00:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T24:00:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:60:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:60Z").success).toBe(false);
});

test("z.iso.datetime - offset: true", () => {
  const dt = z.iso.datetime({ offset: true });

  // valid UTC
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  // valid offsets
  expect(dt.safeParse("2020-10-14T17:42:29+00:00").success).toBe(true);
  expect(dt.safeParse("2020-10-14T17:42:29+03:15").success).toBe(true);
  expect(dt.safeParse("2020-10-14T17:42:29-05:30").success).toBe(true);
  // invalid offset formats
  expect(dt.safeParse("2020-10-14T17:42:29+0700").success).toBe(false);
  expect(dt.safeParse("2020-10-14T17:42:29+07").success).toBe(false);
  expect(dt.safeParse("2020-10-14T17:42:29+24:00").success).toBe(false);
  expect(dt.safeParse("2020-10-14T17:42:29+00:60").success).toBe(false);
  // no tz → rejected
  expect(dt.safeParse("2021-01-01T00:00:00").success).toBe(false);
});

test("z.iso.datetime - local: true", () => {
  const dt = z.iso.datetime({ local: true });

  // local (no tz) allowed
  expect(dt.safeParse("2021-01-01T00:00:00").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00.123").success).toBe(true);
  // UTC still allowed
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  // offset → rejected
  expect(dt.safeParse("2021-01-01T00:00:00+07:00").success).toBe(false);
  // invalid hours
  expect(dt.safeParse("2021-01-01T24:00:00").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:60:00").success).toBe(false);
});

test("z.iso.datetime - local: true, offset: true", () => {
  const dt = z.iso.datetime({ local: true, offset: true });

  expect(dt.safeParse("2021-01-01T00:00:00").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00+07:00").success).toBe(true);
  // malformed offset still rejected
  expect(dt.safeParse("2021-01-01T00:00:00+07").success).toBe(false);
  expect(dt.safeParse("foo").success).toBe(false);
});

test("z.iso.datetime - precision: 0 (no fractional seconds)", () => {
  const dt = z.iso.datetime({ precision: 0 });

  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  // fractional seconds → rejected
  expect(dt.safeParse("2021-01-01T00:00:00.1Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:00.123Z").success).toBe(false);
});

test("z.iso.datetime - precision: 3 (exactly 3 fractional digits)", () => {
  const dt = z.iso.datetime({ precision: 3 });

  expect(dt.safeParse("2021-01-01T00:00:00.123Z").success).toBe(true);
  // wrong precision → rejected
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:00.1Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:00.1234Z").success).toBe(false);
});

test("z.iso.datetime - precision: -1 (no seconds)", () => {
  const dt = z.iso.datetime({ precision: -1, offset: true, local: true });

  expect(dt.safeParse("2022-10-13T09:52Z").success).toBe(true);
  expect(dt.safeParse("2022-10-13T09:52+02:00").success).toBe(true);
  expect(dt.safeParse("2022-10-13T09:52").success).toBe(true);
  // with seconds → rejected
  expect(dt.safeParse("2022-10-13T09:52:31Z").success).toBe(false);
  expect(dt.safeParse("2022-10-13T09:52:31.816Z").success).toBe(false);
});

test("z.iso.datetime - precision: 3 + offset: true", () => {
  const dt = z.iso.datetime({ precision: 3, offset: true });

  expect(dt.safeParse("2021-01-01T00:00:00.123Z").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00.123+05:30").success).toBe(true);
  expect(dt.safeParse("2021-01-01T00:00:00Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:00.12Z").success).toBe(false);
  expect(dt.safeParse("2021-01-01T00:00:00.1234Z").success).toBe(false);
});

test("z.iso.datetime - error message", () => {
  const dt = z.iso.datetime();
  const result = dt.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Invalid ISO datetime");
  }
});

test("z.iso.datetime - custom error message (string)", () => {
  const dt = z.iso.datetime("must be a valid datetime");
  const result = dt.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("must be a valid datetime");
  }
});

test("z.iso.datetime - custom error message (object)", () => {
  const dt = z.iso.datetime({ message: "custom datetime error" });
  const result = dt.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("custom datetime error");
  }
});

test("z.iso.datetime - used as .check()", () => {
  const schema = z.string().check(z.iso.datetime());
  expect(schema.safeParse("2021-01-01T00:00:00Z").success).toBe(true);
  expect(schema.safeParse("not-a-date").success).toBe(false);
});

// ─────────────────────────────────────────────
// z.iso.date()
// ─────────────────────────────────────────────

test("z.iso.date - valid dates", () => {
  const d = z.iso.date();

  expect(d.safeParse("2021-01-01").success).toBe(true);
  expect(d.safeParse("1970-01-01").success).toBe(true);
  expect(d.safeParse("9999-12-31").success).toBe(true);
  // all months
  for (const mm of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]) {
    expect(d.safeParse(`2021-${mm}-01`).success).toBe(true);
  }
});

test("z.iso.date - leap years", () => {
  const d = z.iso.date();

  // divisible by 4 → valid
  expect(d.safeParse("2000-02-29").success).toBe(true);
  expect(d.safeParse("2400-02-29").success).toBe(true);
  expect(d.safeParse("2024-02-29").success).toBe(true);
  // century years not divisible by 400 → invalid
  expect(d.safeParse("2100-02-29").success).toBe(false);
  expect(d.safeParse("2200-02-29").success).toBe(false);
  expect(d.safeParse("2300-02-29").success).toBe(false);
  // non-leap year → invalid
  expect(d.safeParse("2022-02-29").success).toBe(false);
  expect(d.safeParse("2023-02-29").success).toBe(false);
});

test("z.iso.date - month day limits", () => {
  const d = z.iso.date();

  // 30-day months
  expect(d.safeParse("2021-04-30").success).toBe(true);
  expect(d.safeParse("2021-04-31").success).toBe(false);
  expect(d.safeParse("2021-06-31").success).toBe(false);
  expect(d.safeParse("2021-09-31").success).toBe(false);
  expect(d.safeParse("2021-11-31").success).toBe(false);
  // 31-day months
  expect(d.safeParse("2021-01-31").success).toBe(true);
  expect(d.safeParse("2021-03-31").success).toBe(true);
  expect(d.safeParse("2021-05-31").success).toBe(true);
  expect(d.safeParse("2021-07-31").success).toBe(true);
  expect(d.safeParse("2021-08-31").success).toBe(true);
  expect(d.safeParse("2021-10-31").success).toBe(true);
  expect(d.safeParse("2021-12-31").success).toBe(true);
});

test("z.iso.date - invalid formats", () => {
  const d = z.iso.date();

  expect(d.safeParse("").success).toBe(false);
  expect(d.safeParse("foo").success).toBe(false);
  expect(d.safeParse("21-01-01").success).toBe(false);
  expect(d.safeParse("2021/01/01").success).toBe(false);
  expect(d.safeParse("01-01-2021").success).toBe(false);
  expect(d.safeParse("2021-00-01").success).toBe(false);
  expect(d.safeParse("2021-13-01").success).toBe(false);
  expect(d.safeParse("2021-01-00").success).toBe(false);
  expect(d.safeParse("2021-01-32").success).toBe(false);
  // datetime string → rejected
  expect(d.safeParse("2021-01-01T00:00:00Z").success).toBe(false);
});

test("z.iso.date - error message", () => {
  const d = z.iso.date();
  const result = d.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Invalid ISO date");
  }
});

test("z.iso.date - custom error message (string)", () => {
  const d = z.iso.date("must be YYYY-MM-DD");
  const result = d.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("must be YYYY-MM-DD");
  }
});

test("z.iso.date - used as .check()", () => {
  const schema = z.string().check(z.iso.date());
  expect(schema.safeParse("2021-01-01").success).toBe(true);
  expect(schema.safeParse("not-a-date").success).toBe(false);
});

// ─────────────────────────────────────────────
// z.iso.time()
// ─────────────────────────────────────────────

test("z.iso.time - valid times", () => {
  const t = z.iso.time();

  expect(t.safeParse("00:00:00").success).toBe(true);
  expect(t.safeParse("23:59:59").success).toBe(true);
  expect(t.safeParse("09:52:31").success).toBe(true);
  expect(t.safeParse("00:00:00.1").success).toBe(true);
  expect(t.safeParse("00:00:00.123").success).toBe(true);
  expect(t.safeParse("23:59:59.9999999").success).toBe(true);
  // minute-only
  expect(t.safeParse("00:00").success).toBe(true);
});

test("z.iso.time - boundary values", () => {
  const t = z.iso.time();

  // out-of-range
  expect(t.safeParse("24:00:00").success).toBe(false);
  expect(t.safeParse("00:60:00").success).toBe(false);
  expect(t.safeParse("00:00:60").success).toBe(false);
  // bad format
  expect(t.safeParse("0:00:00").success).toBe(false);
  expect(t.safeParse("00:0:00").success).toBe(false);
  expect(t.safeParse("00:00:0").success).toBe(false);
  // timezone not allowed
  expect(t.safeParse("00:00:00Z").success).toBe(false);
  expect(t.safeParse("00:00:00+00:00").success).toBe(false);
});

test("z.iso.time - invalid formats", () => {
  const t = z.iso.time();

  expect(t.safeParse("").success).toBe(false);
  expect(t.safeParse("foo").success).toBe(false);
  expect(t.safeParse("2021-01-01").success).toBe(false);
  expect(t.safeParse("2021-01-01T00:00:00Z").success).toBe(false);
});

test("z.iso.time - precision: 0 (no fractional seconds)", () => {
  const t = z.iso.time({ precision: 0 });

  expect(t.safeParse("00:00:00").success).toBe(true);
  expect(t.safeParse("23:59:59").success).toBe(true);
  expect(t.safeParse("00:00:00.1").success).toBe(false);
  expect(t.safeParse("00:00:00.000").success).toBe(false);
});

test("z.iso.time - precision: 2", () => {
  const t = z.iso.time({ precision: 2 });

  expect(t.safeParse("00:00:00.00").success).toBe(true);
  expect(t.safeParse("09:52:31.12").success).toBe(true);
  expect(t.safeParse("00:00:00").success).toBe(false);
  expect(t.safeParse("00:00:00.0").success).toBe(false);
  expect(t.safeParse("00:00:00.000").success).toBe(false);
  expect(t.safeParse("00:00:00.00Z").success).toBe(false);
});

test("z.iso.time - precision: 3", () => {
  const t = z.iso.time({ precision: 3 });

  expect(t.safeParse("00:00:00.000").success).toBe(true);
  expect(t.safeParse("23:59:59.999").success).toBe(true);
  expect(t.safeParse("00:00:00").success).toBe(false);
  expect(t.safeParse("00:00:00.00").success).toBe(false);
  expect(t.safeParse("00:00:00.0000").success).toBe(false);
});

test("z.iso.time - error message", () => {
  const t = z.iso.time();
  const result = t.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Invalid ISO time");
  }
});

test("z.iso.time - custom error message (string)", () => {
  const t = z.iso.time("must be HH:MM:SS");
  const result = t.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("must be HH:MM:SS");
  }
});

test("z.iso.time - used as .check()", () => {
  const schema = z.string().check(z.iso.time());
  expect(schema.safeParse("00:00:00").success).toBe(true);
  expect(schema.safeParse("bad").success).toBe(false);
});

// ─────────────────────────────────────────────
// z.iso.duration()
// ─────────────────────────────────────────────

test("z.iso.duration - valid durations", () => {
  const d = z.iso.duration();

  const valid = ["P3Y6M4DT12H30M5S", "P2Y9M3DT12H31M8.001S", "PT0,001S", "PT12H30M5S", "P1Y", "P2MT30M", "PT6H", "P5W"];

  for (const val of valid) {
    expect(d.safeParse(val).success, `expected valid: ${val}`).toBe(true);
  }
});

test("z.iso.duration - invalid durations", () => {
  const d = z.iso.duration();

  const invalid = [
    "foo bar",
    "",
    " ",
    "P",
    "PT",
    "P1Y2MT",
    "T1H",
    "P0.5Y1D",
    "P0,5Y6M",
    "P1YT",
    "P-2M-1D",
    "P-5DT-10H",
    "P1W2D",
    "-P1D",
  ];

  for (const val of invalid) {
    expect(d.safeParse(val).success, `expected invalid: ${val}`).toBe(false);
  }
});

test("z.iso.duration - error message", () => {
  const d = z.iso.duration();
  const result = d.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Invalid ISO duration");
  }
});

test("z.iso.duration - custom error message (string)", () => {
  const d = z.iso.duration("must be a valid ISO 8601 duration");
  const result = d.safeParse("bad");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("must be a valid ISO 8601 duration");
  }
});

test("z.iso.duration - used as .check()", () => {
  const schema = z.string().check(z.iso.duration());
  expect(schema.safeParse("P1Y").success).toBe(true);
  expect(schema.safeParse("bad").success).toBe(false);
});
