import { describe, expect, expectTypeOf, test } from "vitest";
import * as z from "zod";
import * as core from "../../core/index.js";
import { deepPartial } from "../deep-partial.js";

const { mapOnSchema } = core;

describe("deepPartial", () => {
  test("makes shallow object optional", () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ a: "x" })).toEqual({ a: "x" });
    expect(partial.parse({ a: "x", b: 1 })).toEqual({ a: "x", b: 1 });
  });

  test("makes nested object optional at every level", () => {
    const schema = z.object({
      name: z.string(),
      profile: z.object({
        bio: z.string(),
        age: z.number(),
      }),
    });
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ profile: {} })).toEqual({ profile: {} });
    expect(partial.parse({ profile: { bio: "x" } })).toEqual({ profile: { bio: "x" } });
  });

  test("recurses through arrays", () => {
    const schema = z.object({ items: z.array(z.object({ a: z.string(), b: z.number() })) });
    const partial = deepPartial(schema);
    expect(partial.parse({ items: [{}, { a: "x" }] })).toEqual({ items: [{}, { a: "x" }] });
  });

  test("recurses through tuples and rest", () => {
    const schema = z.tuple([z.object({ a: z.string() }), z.object({ b: z.number() })], z.object({ c: z.boolean() }));
    const partial = deepPartial(schema);
    expect(partial.parse([{}, {}])).toEqual([{}, {}]);
    expect(partial.parse([{}, {}, {}])).toEqual([{}, {}, {}]);
  });

  test("recurses through unions", () => {
    const schema = z.union([z.object({ a: z.string() }), z.object({ b: z.number() })]);
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
  });

  test("recurses through optional/nullable wrappers", () => {
    const schema = z.object({ x: z.object({ a: z.string() }).optional() });
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ x: {} })).toEqual({ x: {} });
  });

  test("terminates on recursive (lazy) schemas", () => {
    const Node: z.ZodType = z.object({
      name: z.string(),
      children: z.array(z.lazy(() => Node)).optional(),
    });
    const partial = deepPartial(Node);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ name: "root", children: [{ name: "child" }] })).toEqual({
      name: "root",
      children: [{ name: "child" }],
    });
    expect(partial.parse({ children: [{}] })).toEqual({ children: [{}] });
  });

  test("preserves primitives at leaves", () => {
    const schema = z.object({ a: z.string().min(1), b: z.number().int() });
    const partial = deepPartial(schema);
    expect(() => partial.parse({ a: "" })).toThrow();
    expect(() => partial.parse({ b: 1.5 })).toThrow();
    expect(partial.parse({ a: "ok", b: 1 })).toEqual({ a: "ok", b: 1 });
  });

  test("keyof preserved on output type", () => {
    const schema = z.object({
      name: z.string(),
      profile: z.object({ bio: z.string() }),
    });
    type Out = z.output<typeof schema> extends infer X ? X : never;
    const partial = deepPartial(schema);
    type PartialOut = z.output<typeof partial>;
    expectTypeOf<keyof PartialOut>().toEqualTypeOf<keyof Out>();
  });

  test("3-level deep nesting", () => {
    const schema = z.object({
      a: z.object({
        b: z.object({
          c: z.object({ d: z.string() }),
        }),
      }),
    });
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ a: {} })).toEqual({ a: {} });
    expect(partial.parse({ a: { b: { c: {} } } })).toEqual({ a: { b: { c: {} } } });
  });

  test("discriminated union: degrades to plain union (discriminator becomes optional)", () => {
    const schema = z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("a"), a: z.string() }),
      z.object({ kind: z.literal("b"), b: z.number() }),
    ]);
    const partial = deepPartial(schema);
    expect(partial.parse({ kind: "a", a: "x" })).toEqual({ kind: "a", a: "x" });
    expect(partial.parse({ kind: "b", b: 1 })).toEqual({ kind: "b", b: 1 });
    // With discriminator partial, an empty object matches the first option.
    expect(partial.parse({})).toEqual({});
  });

  test("intersection", () => {
    const schema = z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }));
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({});
    expect(partial.parse({ a: "x" })).toEqual({ a: "x" });
    expect(partial.parse({ b: 1 })).toEqual({ b: 1 });
  });

  test("record / map / set value schemas are recursed", () => {
    const rec = deepPartial(z.record(z.string(), z.object({ a: z.string() })));
    expect(rec.parse({ k: {} })).toEqual({ k: {} });

    const m = deepPartial(z.map(z.string(), z.object({ a: z.string() })));
    expect(m.parse(new Map([["k", {}]]))).toEqual(new Map([["k", {}]]));

    const s = deepPartial(z.set(z.object({ a: z.string() })));
    expect(s.parse(new Set([{}]))).toEqual(new Set([{}]));
  });

  test("wrapper composition (optional + default + readonly)", () => {
    const schema = z.object({
      x: z.object({ a: z.string() }).default({ a: "hi" }).readonly(),
    });
    const partial = deepPartial(schema);
    expect(partial.parse({})).toEqual({ x: { a: "hi" } });
    expect(partial.parse({ x: {} })).toEqual({ x: {} });
  });

  test("transform standalone is left untouched", () => {
    const schema = z.object({ a: z.string().transform((s) => s.length) });
    const partial = deepPartial(schema);
    expect(partial.parse({ a: "hi" })).toEqual({ a: 2 });
    expect(partial.parse({})).toEqual({});
  });

  test("pipe input and output are both recursed", () => {
    const schema = z.object({ a: z.string() }).pipe(z.object({ a: z.string() }));
    const partial = deepPartial(schema);
    // Both sides of the pipe should accept missing fields.
    expect(partial.parse({})).toEqual({});
  });
});

describe("mapOnSchema", () => {
  test("identity rewrite preserves parse semantics", () => {
    const schema = z.object({ a: z.string(), nested: z.object({ b: z.number() }) });
    const same = mapOnSchema(schema, (s) => s);
    expect(same.parse({ a: "x", nested: { b: 1 } })).toEqual({ a: "x", nested: { b: 1 } });
  });

  test("can target a specific def.type", () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const allStrings = mapOnSchema(schema, (s) => (s._zod.def.type === "number" ? z.string() : s));
    expect(allStrings.parse({ a: "x", b: "y" } as any)).toEqual({ a: "x", b: "y" });
  });

  test("visits shared sub-schema only once", () => {
    // schema has 3 unique nodes: schema, inner (referenced twice), inner.shape.a (z.string()).
    const inner = z.object({ a: z.string() });
    const schema = z.object({ x: inner, y: inner });
    let calls = 0;
    mapOnSchema(schema, (s) => {
      calls++;
      return s;
    });
    expect(calls).toBe(3);
  });

  test("root is cached: lazy self-reference does not re-invoke fn at parse-time", () => {
    let calls = 0;
    const Self: z.ZodType = z.object({ self: z.lazy(() => Self).optional() });
    const result = mapOnSchema(Self, (s) => {
      calls++;
      return s;
    });
    const baseline = calls;
    result.parse({ self: { self: { self: {} } } });
    expect(calls).toBe(baseline);
  });

  test("unknown def.type falls through unchanged", () => {
    const customSchema: any = z.string();
    customSchema._zod.def = { ...customSchema._zod.def, type: "myCustomType" };
    const result = mapOnSchema(customSchema, (s) => s);
    expect(result).toBe(customSchema);
  });
});
