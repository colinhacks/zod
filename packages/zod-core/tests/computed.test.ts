import * as z from "@zod/core";
import { expect, test } from "vitest";
import { BIGINT_FORMAT_RANGES, NUMBER_FORMAT_RANGES } from "../src/util.js";

test("min/max", () => {
  const a = z.number([z.min(5), z.min(6), z.min(7), z.max(10), z.max(11), z.max(12)]);
  expect(a._computed.minimum).toEqual(7);
  expect(a._computed.maximum).toEqual(10);
});

test("multipleOf", () => {
  const b = z.number([z.multipleOf(5)]);
  expect(b._computed.multipleOf).toEqual(5);
});

test("int64 format", () => {
  const c = z.int64();
  expect(c._computed.format).toEqual("int64");
  expect(c._computed.minimum).toEqual(BIGINT_FORMAT_RANGES.int64[0]);
  expect(c._computed.maximum).toEqual(BIGINT_FORMAT_RANGES.int64[1]);
});

test("int32 format", () => {
  const d = z.int32();
  expect(d._computed.format).toEqual("int32");
  expect(d._computed.minimum).toEqual(NUMBER_FORMAT_RANGES.int32[0]);
  expect(d._computed.maximum).toEqual(NUMBER_FORMAT_RANGES.int32[1]);
});

test("array size", () => {
  const e = z.array(z.string()).check(z.size(5));
  expect(e._computed.size).toEqual(5);
  expect(e._computed.minimum).toEqual(5);
  expect(e._computed.maximum).toEqual(5);
});
