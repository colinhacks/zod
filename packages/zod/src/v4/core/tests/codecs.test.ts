import { expect, test } from "vitest";
import { z } from "zod";
import { safeUnparse, safeUnparseAsync, unparse, unparseAsync } from "../parse.js";
import { $ZodPipe, $ZodTransform } from "../schemas.js";

test("basic transform with reverseTransform", () => {
  const stringToNumberTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
    reverseTransform: (value: unknown) => (value as number).toString(),
  });

  const result1 = unparse(stringToNumberTransform, "123");
  expect(result1).toBe("123");
  expect(typeof result1).toBe("string");

  const result2 = unparse(stringToNumberTransform, 456);
  expect(result2).toBe("456");
  expect(typeof result2).toBe("string");
});

test("transform without reverseTransform should fail in backward mode", () => {
  const oneWayTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
  });

  expect(() => unparse(oneWayTransform, 456)).toThrowError(
    "Cannot run transform in backward mode: reverseTransform is not defined"
  );
});

test("pipe with transforms", () => {
  const stringSchema = z.string();
  const stringToNumberTransform2 = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
    reverseTransform: (value: unknown) => (value as number).toString(),
  });

  const pipeSchema = new $ZodPipe({
    type: "pipe",
    in: stringSchema,
    out: stringToNumberTransform2,
  });

  // Forward pipe test
  const forwardResult = unparse(pipeSchema, "123");
  expect(forwardResult).toBe("123");
  expect(typeof forwardResult).toBe("string");

  // Backward pipe test
  const backwardResult = unparse(pipeSchema, 456);
  expect(backwardResult).toBe("456");
  expect(typeof backwardResult).toBe("string");
});

test("dangling transform detection", () => {
  const stringWithChecks = z.string().min(3);
  const danglingTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => (value as string).toUpperCase(),
    reverseTransform: (value: unknown) => (value as string).toLowerCase(),
  });

  const danglingPipe = new $ZodPipe({
    type: "pipe",
    in: stringWithChecks,
    out: danglingTransform,
  });

  const result = unparse(danglingPipe, "test");
  expect(result).toBe("test");
});

test("check ordering - A's checks should run on A's output type", () => {
  const stringToNumberWithCheck = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
    reverseTransform: (value: unknown) => (value as number).toString(),
  });

  const numberWithMinCheck = z.number().min(10);
  const pipeWithChecks = new $ZodPipe({
    type: "pipe",
    in: numberWithMinCheck,
    out: stringToNumberWithCheck,
  });

  // All tests should throw because unparse runs in backward mode
  // and the input type doesn't match the expected type
  expect(() => unparse(pipeWithChecks, 15)).toThrow();
  expect(() => unparse(pipeWithChecks, 5)).toThrow();
  expect(() => unparse(pipeWithChecks, "15")).toThrow();
  expect(() => unparse(pipeWithChecks, "5")).toThrow();
});

test("complex pipes with multiple checks and deferred execution", () => {
  const stringWithLengthCheck = z.string().min(2).max(5);
  const numberWithRangeCheck = z.number().min(10).max(100);
  const complexTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => (value as string).length,
    reverseTransform: (value: unknown) => "x".repeat(value as number),
  });

  const complexPipe = new $ZodPipe({
    type: "pipe",
    in: stringWithLengthCheck,
    out: new $ZodPipe({
      type: "pipe",
      in: complexTransform,
      out: numberWithRangeCheck,
    }),
  });

  // Forward mode should fail because "hello" length is 5, but min range is 10
  expect(() => unparse(complexPipe, "hello")).toThrow();

  // Backward mode should detect dangling transform
  expect(() => unparse(complexPipe, 15)).toThrowError(
    "Encountered dangling transform during encode. Use z.codec() instead of .transform()."
  );
});

test("edge case - proper check execution order", () => {
  const stringMin3 = z.string().min(3);
  const stringToLength = new $ZodTransform({
    type: "transform",
    transform: (value: any) => value.length,
    reverseTransform: (value: any) => "a".repeat(value),
  });
  const numberMin5 = z.number().min(5);

  const edgeCasePipe = new $ZodPipe({
    type: "pipe",
    in: stringMin3,
    out: new $ZodPipe({
      type: "pipe",
      in: stringToLength,
      out: numberMin5,
    }),
  });

  // Valid input
  expect(() => unparse(edgeCasePipe, 6)).toThrowError(
    "Encountered dangling transform during encode. Use z.codec() instead of .transform()."
  );

  // Invalid input (too small)
  expect(() => unparse(edgeCasePipe, 2)).toThrowError(
    "Encountered dangling transform during encode. Use z.codec() instead of .transform()."
  );
});

test("async unparse functions", async () => {
  const asyncTransform = new $ZodTransform({
    type: "transform",
    transform: async (value: unknown) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Number.parseInt(value as string, 10);
    },
    reverseTransform: async (value: unknown) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      return (value as number).toString();
    },
  });

  const result = await unparseAsync(asyncTransform, 123);
  expect(result).toBe("123");
  expect(typeof result).toBe("string");
});

test("safe unparse functions", () => {
  const stringToNumberTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
    reverseTransform: (value: unknown) => (value as number).toString(),
  });

  const oneWayTransform = new $ZodTransform({
    type: "transform",
    transform: (value: unknown) => Number.parseInt(value as string, 10),
  });

  // Safe unparse with valid transform
  const safeResult = safeUnparse(stringToNumberTransform, 456);
  expect(safeResult.success).toBe(true);
  if (safeResult.success) {
    expect(safeResult.data).toBe("456");
  }

  // Safe unparse with structural error (missing reverseTransform) should throw
  // Structural errors are not caught by safeParse - they indicate schema misconfiguration
  expect(() => safeUnparse(oneWayTransform, 456)).toThrowError(
    "Cannot run transform in backward mode: reverseTransform is not defined"
  );
});

test("safe async unparse", async () => {
  const asyncTransform = new $ZodTransform({
    type: "transform",
    transform: async (value: unknown) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Number.parseInt(value as string, 10);
    },
    reverseTransform: async (value: unknown) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return (value as number).toString();
    },
  });

  const safeAsyncResult = await safeUnparseAsync(asyncTransform, 789);
  expect(safeAsyncResult.success).toBe(true);
  if (safeAsyncResult.success) {
    expect(safeAsyncResult.data).toBe("789");
  }
});
