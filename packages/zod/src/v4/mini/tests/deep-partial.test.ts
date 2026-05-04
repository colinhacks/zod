import { describe, expect, expectTypeOf, test } from "vitest";
import * as z from "zod/mini";

describe("mini deepPartial", () => {
  test("makes a ZodMiniObject's fields optional recursively", () => {
    const schema = z.object({
      name: z.string(),
      profile: z.object({ bio: z.string(), age: z.number() }),
    });
    const partial = z.deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodMiniObject>();
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ profile: {} })).toEqual({ profile: {} });
    expect(partial.parse({ name: "x", profile: { bio: "b" } })).toEqual({
      name: "x",
      profile: { bio: "b" },
    });
  });

  test("preserves ZodMiniObject structural type (shape accessible)", () => {
    const schema = z.object({ a: z.string(), nested: z.object({ b: z.number() }) });
    const partial = z.deepPartial(schema);
    expectTypeOf(partial.shape.a).toExtend<z.ZodMiniOptional<z.ZodMiniString>>();
    expectTypeOf(partial.shape.nested).toExtend<z.ZodMiniOptional<z.ZodMiniObject>>();
  });

  test("tuple elements stay required", () => {
    const schema = z.tuple([z.object({ a: z.string() }), z.string()]);
    const partial = z.deepPartial(schema);
    expect(() => partial.parse([{}])).toThrow();
    expect(partial.parse([{}, "x"])).toEqual([{}, "x"]);
  });

  test("ZodMiniCodec preserved through deepPartial", () => {
    const schema = z.codec(z.object({ a: z.string() }), z.object({ a: z.string() }), {
      decode: (v) => v,
      encode: (v) => v,
    });
    const partial = z.deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodMiniCodec>();
  });

  test("recursive getter-based object is typeable", () => {
    const Category = z.object({
      name: z.string(),
      get subcategories() {
        return z.optional(z.array(Category));
      },
    });
    const partial = z.deepPartial(Category);
    expectTypeOf(partial).toExtend<z.ZodMiniObject>();
    expect(partial.parse({ subcategories: [{}] })).toEqual({ subcategories: [{}] });
  });
});
