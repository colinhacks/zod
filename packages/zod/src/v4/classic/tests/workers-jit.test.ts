import { expect, test, vi } from "vitest";
import * as z from "zod/v4";

test("precompile compiles object schemas", () => {
  const schema = z.object({
    a: z.string(),
  });

  const result = z.precompile(schema);
  expect(result.compiled).toBe(1);
  expect(result.visited).toBeGreaterThanOrEqual(2);
});

test("precompile walks nested schemas", () => {
  const schema = z.object({
    nested: z.object({
      value: z.number(),
    }),
  });

  const result = z.precompile(schema);
  expect(result.compiled).toBe(2);
});

test("precompile traverses wrapped and recursive schema graphs", () => {
  const User = z.object({
    id: z.uuidv4(),
    profile: z.object({
      name: z.string(),
    }),
  });

  const Node: z.ZodType<{ value: number; next?: any }> = z.lazy(() =>
    z.object({
      value: z.number(),
      next: Node.optional(),
    })
  );

  const Wrapped = z
    .object({
      data: z.union([User, Node]),
      payload: z.record(z.string(), User).optional(),
    })
    .readonly()
    .catch({
      data: { id: "00000000-0000-4000-8000-000000000000", profile: { name: "fallback" } },
    });

  const result = z.precompile([Wrapped, Node]);
  expect(result.compiled).toBeGreaterThanOrEqual(4);
  expect(result.visited).toBeGreaterThan(result.compiled);
});

test("object parse falls back gracefully when Function constructor is blocked", () => {
  const schema = z.object({
    a: z.string(),
  });

  vi.stubGlobal("Function", function ThrowingFunction() {
    throw new Error("Function constructor disabled");
  });

  try {
    const result = schema.safeParse({ a: "ok" });
    expect(result.success).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
