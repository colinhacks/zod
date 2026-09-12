import { expect, test } from "vitest";
import * as z from "zod/mini";
import { util as zc } from "zod/v4/core";

// checks no longer write metadata into the bag at attach time; the converter folds the checks itself, so the derived values are asserted through it

test("min/max", () => {
  const a = z.number().check(z.minimum(5), z.minimum(6), z.minimum(7), z.maximum(10), z.maximum(11), z.maximum(12));
  expect(z.toJSONSchema(a)).toMatchObject({ minimum: 7, maximum: 10 });
  expect(a._zod.bag).toEqual({});
});

test("multipleOf", () => {
  const b = z.number().check(z.multipleOf(5));
  expect(z.toJSONSchema(b)).toMatchObject({ multipleOf: 5 });
});

test("int32 format", () => {
  const d = z.int32();
  expect(z.toJSONSchema(d)).toMatchObject({
    type: "integer",
    minimum: zc.NUMBER_FORMAT_RANGES.int32[0],
    maximum: zc.NUMBER_FORMAT_RANGES.int32[1],
  });
});

test("array size", () => {
  const e = z.array(z.string()).check(z.length(5));
  expect(z.toJSONSchema(e)).toMatchObject({ minItems: 5, maxItems: 5 });
});
