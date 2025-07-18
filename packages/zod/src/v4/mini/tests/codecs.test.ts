import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

test("basic transform with reverseTransform", () => {
  const stringToNumberTransform = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => Number.parseInt(value, 10),
      from: (value: number) => value.toString(),
    }),
    z.number()
  );

  // unparse should take the output type (number) and return the input type (string)
  const result1 = stringToNumberTransform.unparse(123);
  expect(result1).toBe("123");
  expect(typeof result1).toBe("string");
  expectTypeOf(result1).toEqualTypeOf<string>();

  const result2 = stringToNumberTransform.unparse(456);
  expect(result2).toBe("456");
  expect(typeof result2).toBe("string");
  expectTypeOf(result2).toEqualTypeOf<string>();

  // Test parse direction types
  const parseResult = stringToNumberTransform.parse("789");
  expect(parseResult).toBe(789);
  expectTypeOf(parseResult).toEqualTypeOf<number>();
});

test("transform without reverseTransform should fail in backward mode", () => {
  const oneWayTransform = z.pipe(
    z.string(),
    z.transform((value: string) => Number.parseInt(value, 10))
  );

  expect(() => oneWayTransform.unparse(456)).toThrowError(
    "Cannot run transform in backward mode: reverseTransform is not defined"
  );

  // Test that parse still works and has correct types
  const parseResult = oneWayTransform.parse("123");
  expect(parseResult).toBe(123);
  expectTypeOf(parseResult).toEqualTypeOf<number>();
});

test("unparse methods are available on all schemas", () => {
  const stringSchema = z.string();

  // Test that unparse methods are available
  expect(typeof stringSchema.unparse).toBe("function");
  expect(typeof stringSchema.safeUnparse).toBe("function");
  expect(typeof stringSchema.unparseAsync).toBe("function");
  expect(typeof stringSchema.safeUnparseAsync).toBe("function");
});

test("transform API variations", () => {
  // Case 1: z.transform(fn) - single function transform
  const stringToUpper = z.transform((val: string) => val.toUpperCase());
  expect(stringToUpper.parse("hello")).toBe("HELLO");
  expect(stringToUpper.parse("world")).toBe("WORLD");

  // Case 2: z.pipe(A, z.transform(fn)) - transform with input schema
  const stringToNumber = z.pipe(
    z.string(),
    z.transform((val: string) => Number.parseInt(val, 10))
  );
  expect(stringToNumber.parse("123")).toBe(123);
  expect(stringToNumber.parse("456")).toBe(456);
  expect(() => stringToNumber.parse(123)).toThrow();

  // Case 3: z.pipe(A, z.transform({to, from}), B) - bidirectional transform
  const bidirectionalStringToNumber = z.pipe(
    z.string(),
    z.transform({
      to: (val: string) => Number.parseInt(val, 10),
      from: (val: number) => val.toString(),
    }),
    z.number()
  );

  // Forward direction
  const parseResult = bidirectionalStringToNumber.parse("123");
  expect(parseResult).toBe(123);
  expectTypeOf(parseResult).toEqualTypeOf<number>();

  // Backward direction
  const unparseResult = bidirectionalStringToNumber.unparse(123);
  expect(unparseResult).toBe("123");
  expectTypeOf(unparseResult).toEqualTypeOf<string>();
});

test("safe parsing and unparsing", () => {
  const stringToNumber = z.pipe(
    z.string(),
    z.transform({
      to: (val: string) => Number.parseInt(val, 10),
      from: (val: number) => val.toString(),
    }),
    z.number()
  );

  // Safe unparse
  const safeResult = stringToNumber.safeUnparse(123);
  expect(safeResult.success).toBe(true);
  if (safeResult.success) {
    expect(safeResult.data).toBe("123");
    expectTypeOf(safeResult.data).toEqualTypeOf<string>();
  }

  // Safe unparse with one-way transform should throw (structural error)
  const oneWayTransform = z.pipe(
    z.string(),
    z.transform((value: string) => Number.parseInt(value, 10))
  );
  expect(() => oneWayTransform.safeUnparse(456)).toThrowError(
    "Cannot run transform in backward mode: reverseTransform is not defined"
  );
});

test("async operations", async () => {
  const stringToNumber = z.pipe(
    z.string(),
    z.transform({
      to: (val: string) => Number.parseInt(val, 10),
      from: (val: number) => val.toString(),
    }),
    z.number()
  );

  // Async unparse
  const result = await stringToNumber.safeUnparseAsync(123);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe("123");
    expectTypeOf(result.data).toEqualTypeOf<string>();
  }

  // Async transform
  const asyncTransform = z.pipe(
    z.string(),
    z.transform(async (value: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Number.parseInt(value, 10);
    })
  );

  const asyncResult = await asyncTransform.parseAsync("123");
  expect(asyncResult).toBe(123);
  expect(typeof asyncResult).toBe("number");

  const safeAsyncResult = await asyncTransform.safeParseAsync("789");
  expect(safeAsyncResult.success).toBe(true);
  if (safeAsyncResult.success) {
    expect(safeAsyncResult.data).toBe(789);
  }
});

test("pipe with transforms", () => {
  const stringToNumber = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => Number.parseInt(value, 10),
      from: (value: number) => value.toString(),
    }),
    z.number()
  );

  const pipeSchema = z.pipe(z.string(), stringToNumber);

  // Forward pipe test - parse direction
  const parseResult = pipeSchema.parse("123");
  expect(parseResult).toBe(123);

  // Backward pipe test - unparse direction
  const unparseResult = pipeSchema.unparse(456);
  expect(unparseResult).toBe("456");
  expect(typeof unparseResult).toBe("string");
});

test("dangling transform detection", () => {
  const stringWithChecks = z.string().check(z.minLength(3));
  const danglingTransform = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => value.toUpperCase(),
      from: (value: string) => value.toLowerCase(),
    }),
    z.string()
  );

  const danglingPipe = z.pipe(stringWithChecks, danglingTransform);

  // unparse should take the output type (string) and return the input type (string)
  const result = danglingPipe.unparse("TEST");
  expect(result).toBe("test");
});

test("pipe with checks and transforms", () => {
  const stringToNumber = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => Number.parseInt(value, 10),
      from: (value: number) => value.toString(),
    }),
    z.number()
  );

  const numberWithMinCheck = z.number().check(z.minimum(10));
  const pipeWithChecks = z.pipe(stringToNumber, numberWithMinCheck);

  // With the new pipe-centric API, unparse should work correctly
  expect(pipeWithChecks.unparse(15)).toBe("15");
  expect(() => pipeWithChecks.unparse(5)).toThrow();
});

test("complex pipes with multiple checks", () => {
  const stringWithLengthCheck = z.string().check(z.minLength(2)).check(z.maxLength(5));
  const numberWithRangeCheck = z.number().check(z.minimum(10)).check(z.maximum(100));
  const complexTransform = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => value.length,
      from: (value: number) => "x".repeat(value),
    }),
    z.number()
  );

  const complexPipe = z.pipe(stringWithLengthCheck, complexTransform, numberWithRangeCheck);

  // Forward mode should fail because "hello" length is 5, but min range is 10
  expect(() => complexPipe.parse("hello")).toThrow();

  // Backward mode should work - it validates the intermediate results
  // The value 15 should create "x".repeat(15) which is too long for the string check
  expect(() => complexPipe.unparse(15)).toThrow();
});

test("proper check execution order", () => {
  const stringMin3 = z.string().check(z.minLength(3));
  const stringToLength = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => value.length,
      from: (value: number) => "a".repeat(value),
    }),
    z.number()
  );
  const numberMin5 = z.number().check(z.minimum(5));

  const edgeCasePipe = z.pipe(stringMin3, stringToLength, numberMin5);

  // Test individual components work
  expect(stringToLength.unparse(10)).toBe("aaaaaaaaaa");
  expect(numberMin5.unparse(10)).toBe(10);

  // Test that it properly rejects invalid values
  expect(() => edgeCasePipe.unparse(2)).toThrow();

  // Test that parsing works correctly in the forward direction
  expect(edgeCasePipe.parse("hello")).toBe(5); // "hello".length = 5
});

test("functional z.unparse API", () => {
  // Test that z.unparse, z.safeUnparse, etc. are available as functions
  expect(typeof z.unparse).toBe("function");
  expect(typeof z.safeUnparse).toBe("function");
  expect(typeof z.unparseAsync).toBe("function");
  expect(typeof z.safeUnparseAsync).toBe("function");

  // Test basic usage
  const stringSchema = z.string();
  const result = z.unparse(stringSchema, "hello");
  expect(result).toBe("hello");

  const safeResult = z.safeUnparse(stringSchema, "world");
  expect(safeResult.success).toBe(true);
  if (safeResult.success) {
    expect(safeResult.data).toBe("world");
  }

  // Test with transforms
  const stringToNumberTransform = z.pipe(
    z.string(),
    z.transform({
      to: (value: string) => Number.parseInt(value, 10),
      from: (value: number) => value.toString(),
    }),
    z.number()
  );

  const transformResult = z.unparse(stringToNumberTransform, 123);
  expect(transformResult).toBe("123");
  expectTypeOf(transformResult).toEqualTypeOf<string>();

  const safeTransformResult = z.safeUnparse(stringToNumberTransform, 456);
  expect(safeTransformResult.success).toBe(true);
  if (safeTransformResult.success) {
    expect(safeTransformResult.data).toBe("456");
    expectTypeOf(safeTransformResult.data).toEqualTypeOf<string>();
  }
});

test("functional z.unparseAsync API", async () => {
  const stringSchema = z.string();

  const result = await z.unparseAsync(stringSchema, "hello");
  expect(result).toBe("hello");
  expectTypeOf(result).toEqualTypeOf<string>();

  const safeResult = await z.safeUnparseAsync(stringSchema, "world");
  expect(safeResult.success).toBe(true);
  if (safeResult.success) {
    expect(safeResult.data).toBe("world");
    expectTypeOf(safeResult.data).toEqualTypeOf<string>();
  }
});
