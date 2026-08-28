import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

const gtFive = z.bigint().gt(BigInt(5));
const gteFive = z.bigint().gte(BigInt(5));
const ltFive = z.bigint().lt(BigInt(5));
const lteFive = z.bigint().lte(BigInt(5));
const positive = z.bigint().positive();
const negative = z.bigint().negative();
const nonnegative = z.bigint().nonnegative();
const nonpositive = z.bigint().nonpositive();
const multipleOfFive = z.bigint().multipleOf(BigInt(5));

test("passing validations", () => {
  z.bigint().parse(BigInt(1));
  z.bigint().parse(BigInt(0));
  z.bigint().parse(BigInt(-1));
  gtFive.parse(BigInt(6));
  gteFive.parse(BigInt(5));
  gteFive.parse(BigInt(6));
  ltFive.parse(BigInt(4));
  lteFive.parse(BigInt(5));
  lteFive.parse(BigInt(4));
  positive.parse(BigInt(3));
  negative.parse(BigInt(-2));
  nonnegative.parse(BigInt(0));
  nonnegative.parse(BigInt(7));
  nonpositive.parse(BigInt(0));
  nonpositive.parse(BigInt(-12));
  multipleOfFive.parse(BigInt(15));
});

test("failing validations", () => {
  expect(() => gtFive.parse(BigInt(5))).toThrow();
  expect(() => gteFive.parse(BigInt(4))).toThrow();
  expect(() => ltFive.parse(BigInt(5))).toThrow();
  expect(() => lteFive.parse(BigInt(6))).toThrow();
  expect(() => positive.parse(BigInt(0))).toThrow();
  expect(() => positive.parse(BigInt(-2))).toThrow();
  expect(() => negative.parse(BigInt(0))).toThrow();
  expect(() => negative.parse(BigInt(3))).toThrow();
  expect(() => nonnegative.parse(BigInt(-1))).toThrow();
  expect(() => nonpositive.parse(BigInt(1))).toThrow();
  expect(() => multipleOfFive.parse(BigInt(13))).toThrow();
});

test("min max getters", () => {
  expect(z.bigint().min(BigInt(5)).minValue).toEqual(BigInt(5));
  expect(z.bigint().min(BigInt(5)).min(BigInt(10)).minValue).toEqual(BigInt(10));

  expect(z.bigint().max(BigInt(5)).maxValue).toEqual(BigInt(5));
  expect(z.bigint().max(BigInt(5)).max(BigInt(1)).maxValue).toEqual(BigInt(1));
});

test("bigint formats are distinct at the type level", () => {
  expectTypeOf(z.int64()._zod.def.format).toEqualTypeOf<"int64">();
  expectTypeOf(z.uint64()._zod.def.format).toEqualTypeOf<"uint64">();

  z.int64() satisfies z.ZodBigIntFormat;
  z.int64() satisfies z.ZodBigInt;

  // @ts-expect-error a uint64 schema is not a ZodInt64
  z.uint64() satisfies z.ZodInt64;
});

test("multipleOf(0n) does not throw from safeParse", () => {
  // `value % 0n` throws RangeError, so the compiled path declines and the runtime reports the failure
  const schema = z.bigint().multipleOf(BigInt(0));
  const result = schema.safeParse(BigInt(10));
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].code).toEqual("not_multiple_of");
  expect(schema.safeParse(BigInt(0)).success).toBe(false);

  // matches the number equivalent
  expect(z.number().multipleOf(0).safeParse(10).success).toBe(false);
  expect(z.number().multipleOf(0).safeParse(0).success).toBe(false);

  // a zero divisor nested in an object must not break the surrounding parse
  const obj = z.object({ a: z.bigint().multipleOf(BigInt(0)), b: z.bigint() });
  expect(obj.safeParse({ a: BigInt(1), b: BigInt(2) }).success).toBe(false);
  expect(obj.safeParse({ a: BigInt(1), b: 2 }).success).toBe(false);
});
