import { expect, test } from "vitest";
import * as z from "zod/v4";

test("missing required property: clearer message and `received: missing` flag", () => {
  const schema = z.object({ value: z.undefined() });
  const issues = schema.safeParse({}).error!.issues;
  expect(issues).toEqual([
    {
      code: "invalid_type",
      expected: "nonoptional",
      message: "Invalid input: missing required property",
      path: ["value"],
      received: "missing",
    },
  ]);
});

test("missing required property: jitless path matches", () => {
  const schema = z.object({ value: z.undefined() });
  const issues = schema.safeParse({}, { jitless: true }).error!.issues;
  expect(issues).toEqual([
    {
      code: "invalid_type",
      expected: "nonoptional",
      message: "Invalid input: missing required property",
      path: ["value"],
      received: "missing",
    },
  ]);
});

test("explicit z.nonoptional() rejecting undefined keeps the existing message", () => {
  const schema = z.object({ hi: z.string().optional().nonoptional() });
  const issues = schema.safeParse({ hi: undefined }).error!.issues;
  expect(issues).toHaveLength(1);
  expect(issues[0]).toMatchObject({
    code: "invalid_type",
    expected: "nonoptional",
    message: "Invalid input: expected nonoptional, received undefined",
    path: ["hi"],
  });
  expect((issues[0] as any).received).toBeUndefined();
});

test("Vercel Workflow repro: discriminated union with z.undefined() in inactive branch", () => {
  const Run = z.discriminatedUnion("status", [
    z.object({
      status: z.enum(["pending", "running"]),
      output: z.undefined(),
      error: z.undefined(),
      completedAt: z.undefined(),
    }),
    z.object({
      status: z.literal("done"),
      output: z.string(),
      error: z.string(),
      completedAt: z.string(),
    }),
  ]);

  const issues = Run.safeParse({ status: "running" }).error!.issues;
  expect(issues).toHaveLength(3);
  for (const iss of issues) {
    expect(iss.message).toBe("Invalid input: missing required property");
    expect((iss as any).received).toBe("missing");
  }
});
