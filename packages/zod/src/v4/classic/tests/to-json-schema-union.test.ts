import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.toJSONSchema union option", () => {
  test("default: inclusive union → anyOf", () => {
    const schema = z.union([z.string(), z.number()]);
    const json = z.toJSONSchema(schema);
    expect(json.anyOf).toBeDefined();
    expect(json.oneOf).toBeUndefined();
  });

  test('union: "oneOf" → inclusive union emits oneOf (regression #5807, #5493, #5494)', () => {
    const schema = z.union([z.string(), z.number()]);
    const json = z.toJSONSchema(schema, { union: "oneOf" });
    expect(json.oneOf).toBeDefined();
    expect(json.anyOf).toBeUndefined();
  });

  test('union: "anyOf" (explicit) matches default', () => {
    const schema = z.union([z.string(), z.number()]);
    expect(z.toJSONSchema(schema, { union: "anyOf" })).toEqual(z.toJSONSchema(schema));
  });

  test("discriminated unions always use oneOf, regardless of union option", () => {
    const schema = z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("a"), a: z.string() }),
      z.object({ kind: z.literal("b"), b: z.number() }),
    ]);
    expect(z.toJSONSchema(schema).oneOf).toBeDefined();
    expect(z.toJSONSchema(schema, { union: "oneOf" }).oneOf).toBeDefined();
    expect(z.toJSONSchema(schema, { union: "anyOf" }).oneOf).toBeDefined();
  });

  test("nested unions inside object are also rewritten", () => {
    const schema = z.object({
      x: z.union([z.string(), z.number()]),
      y: z.union([z.boolean(), z.null()]),
    });
    const json = z.toJSONSchema(schema, { union: "oneOf" });
    expect((json.properties as any).x.oneOf).toBeDefined();
    expect((json.properties as any).y.oneOf).toBeDefined();
    expect((json.properties as any).x.anyOf).toBeUndefined();
  });
});
