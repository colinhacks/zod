import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/mini";

test("z.number", () => {
  const a = z.number();
  expect(z.parse(a, 123)).toEqual(123);
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();

  type a = z.infer<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<number>();
});

test("z.number async", async () => {
  const a = z.number().check(z.refine(async (_) => _ > 0));
  await expect(z.parseAsync(a, 123)).resolves.toEqual(123);
  await expect(() => z.parseAsync(a, -123)).rejects.toThrow();
  await expect(() => z.parseAsync(a, "123")).rejects.toThrow();
});

test("z.int", () => {
  const a = z.int();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
});

test("z.float32", () => {
  const a = z.float32();
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123.45")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  // -3.4028234663852886e38, 3.4028234663852886e38;
  expect(() => z.parse(a, 3.4028234663852886e38 * 2)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -3.4028234663852886e38 * 2)).toThrow(); // Exceeds min
});

test("z.float64", () => {
  const a = z.float64();
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123.45")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 1.7976931348623157e308 * 2)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -1.7976931348623157e308 * 2)).toThrow(); // Exceeds min
});

test("z.int32", () => {
  const a = z.int32();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 2147483648)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -2147483649)).toThrow(); // Exceeds min
});

test("z.uint32", () => {
  const a = z.uint32();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, -123)).toThrow();
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 4294967296)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -1)).toThrow(); // Below min
});

test("z.int64", () => {
  const a = z.int64();
  expect(z.parse(a, BigInt(123))).toEqual(BigInt(123));
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, BigInt("9223372036854775808"))).toThrow();
  expect(() => z.parse(a, BigInt("-9223372036854775809"))).toThrow();
  // expect(() => z.parse(a, BigInt("9223372036854775808"))).toThrow(); // Exceeds max
  // expect(() => z.parse(a, BigInt("-9223372036854775809"))).toThrow(); // Exceeds min
});

test("z.uint64", () => {
  const a = z.uint64();
  expect(z.parse(a, BigInt(123))).toEqual(BigInt(123));
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, -123)).toThrow();
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, BigInt("18446744073709551616"))).toThrow(); // Exceeds max
  expect(() => z.parse(a, BigInt("-1"))).toThrow(); // Below min
  // expect(() => z.parse(a, BigInt("18446744073709551616"))).toThrow(); // Exceeds max
  // expect(() => z.parse(a, BigInt("-1"))).toThrow(); // Below min
});

test("number and bigint formats are distinct at the type level", () => {
  expectTypeOf(z.int()._zod.def.format).toEqualTypeOf<"safeint">();
  expectTypeOf(z.uint32()._zod.def.format).toEqualTypeOf<"uint32">();
  expectTypeOf(z.int64()._zod.def.format).toEqualTypeOf<"int64">();

  z.int32() satisfies z.ZodMiniInt32;
  z.uint64() satisfies z.ZodMiniUInt64;

  // @ts-expect-error a float64 schema is not a ZodMiniFloat32
  z.float64() satisfies z.ZodMiniFloat32;
  // @ts-expect-error a uint64 schema is not a ZodMiniInt64
  z.uint64() satisfies z.ZodMiniInt64;
});
