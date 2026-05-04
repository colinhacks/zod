import { describe, expect, expectTypeOf, test } from "vitest";
import * as z from "zod";
import { deepPartial } from "../deep-partial.js";

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

  test("preserves ZodObject structural type; `.shape` is accessible", () => {
    const schema = z.object({
      name: z.string(),
      nested: z.object({ age: z.number() }),
    });
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodObject>();
    // Each shape entry is a ZodOptional wrapping the deep-partialed inner.
    expectTypeOf(partial.shape.name).toExtend<z.ZodOptional<z.ZodString>>();
    expectTypeOf(partial.shape.nested).toExtend<z.ZodOptional<z.ZodObject>>();
    // Nested shape access is still typed.
    const innerShape = partial.shape.nested._zod.def.innerType.shape;
    expectTypeOf(innerShape.age).toExtend<z.ZodOptional<z.ZodNumber>>();
  });

  test("recursive self-reference (via getter) is typeable (no TS depth explosion)", () => {
    const Category = z.object({
      name: z.string(),
      get subcategories() {
        return z.array(Category).optional();
      },
    });
    const partial = deepPartial(Category);
    expectTypeOf(partial).toExtend<z.ZodObject>();
    // Should not blow up TS recursion depth. We don't assert on the
    // inner recursive reference — depth-limited DeepPartial shells out
    // after one unfold.
    expect(partial.parse({ subcategories: [{}] })).toEqual({ subcategories: [{}] });
  });

  test("preserves ZodArray / ZodTuple / ZodUnion wrappers", () => {
    const arr = deepPartial(z.array(z.object({ a: z.string() })));
    expectTypeOf(arr).toExtend<z.ZodArray>();

    const tup = deepPartial(z.tuple([z.object({ a: z.string() }), z.object({ b: z.number() })]));
    expectTypeOf(tup).toExtend<z.ZodTuple>();

    const uni = deepPartial(z.union([z.object({ a: z.string() }), z.object({ b: z.number() })]));
    expectTypeOf(uni).toExtend<z.ZodUnion>();
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
    expect(partial.parse({})).toEqual({});
  });

  test("tuple elements stay required — only *objects inside* become partial", () => {
    const schema = z.tuple([z.object({ a: z.string() }), z.string()]);
    const partial = deepPartial(schema);
    // Positional items remain required: the second item (z.string) must be present.
    expect(() => partial.parse([{}])).toThrow();
    expect(partial.parse([{}, "x"])).toEqual([{}, "x"]);
    // The object INSIDE the tuple has its fields made optional.
    expect(partial.parse([{ a: "y" }, "x"])).toEqual([{ a: "y" }, "x"]);
  });

  test("intersection: both sides are deep-partialed independently", () => {
    const schema = z.intersection(
      z.object({ a: z.object({ inner: z.string() }) }),
      z.object({ b: z.object({ inner: z.number() }) })
    );
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodIntersection>();
    // Inner objects on either side accept their field as optional.
    expect(partial.parse({ a: {}, b: {} })).toEqual({ a: {}, b: {} });
    // Top-level props also optional (deepPartial partials both object sides).
    expect(partial.parse({})).toEqual({});
  });

  test("ZodPromise: inner is recursed", () => {
    const schema = z.promise(z.object({ a: z.string() }));
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodPromise>();
  });

  test("ZodSuccess: inner is recursed", () => {
    const schema = z.success(z.object({ a: z.string() }));
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodSuccess>();
  });

  test("ZodCodec: both sides recursed; preserved as ZodCodec (not degraded to ZodPipe)", () => {
    const schema = z.codec(z.object({ a: z.string() }), z.object({ a: z.string() }), {
      decode: (v) => v,
      encode: (v) => v,
    });
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodCodec>();
    expect(partial.parse({})).toEqual({});
  });

  test("ZodPreprocess: inner is recursed; preserved as ZodPreprocess (not degraded to ZodPipe)", () => {
    const schema = z.preprocess((v) => v, z.object({ a: z.string() }));
    const partial = deepPartial(schema);
    expectTypeOf(partial).toExtend<z.ZodPreprocess>();
    expect(partial.parse({})).toEqual({});
  });
});

describe("z.visit", () => {
  test("identity callback returns the input schema unchanged", () => {
    const schema = z.object({ a: z.string(), nested: z.object({ b: z.number() }) });
    expect(z.visit(schema, (s) => s)).toBe(schema);
  });

  test("empty handler map returns the input schema unchanged", () => {
    const schema = z.object({ a: z.string(), nested: z.object({ b: z.number() }) });
    expect(z.visit(schema, {})).toBe(schema);
  });

  test("only nodes touched by a handler are re-cloned; siblings keep identity", () => {
    const a = z.string();
    const b = z.number();
    const schema = z.object({ a, b });
    const result = z.visit(schema, { number: () => z.string() });
    // `a` was not rewritten; its reference flows through.
    expect((result._zod.def as any).shape.a).toBe(a);
    // `b` was rewritten; parent is a new clone.
    expect(result).not.toBe(schema);
  });

  test("callback: can target a specific def.type", () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const allStrings = z.visit(schema, (s) => (s._zod.def.type === "number" ? z.string() : s));
    expect(allStrings.parse({ a: "x", b: "y" } as any)).toEqual({ a: "x", b: "y" });
  });

  test("handler map: dispatches by kind; unhandled kinds pass through", () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const result = z.visit(schema, { number: () => z.string() });
    expect(result.parse({ a: "x", b: "y" } as any)).toEqual({ a: "x", b: "y" });
  });

  test("visits shared sub-schemas only once", () => {
    const inner = z.object({ a: z.string() });
    const schema = z.object({ x: inner, y: inner });
    let calls = 0;
    z.visit(schema, (s) => {
      calls++;
      return s;
    });
    // 3 unique nodes: schema, inner (shared), inner.shape.a (z.string()).
    expect(calls).toBe(3);
  });

  test("root is cached: lazy self-reference does not re-invoke fn at parse-time", () => {
    let calls = 0;
    const Self: z.ZodType = z.object({ self: z.lazy(() => Self).optional() });
    const result = z.visit(Self, (s) => {
      calls++;
      return s;
    });
    const baseline = calls;
    result.parse({ self: { self: { self: {} } } });
    expect(calls).toBe(baseline);
  });

  test("unknown def.type falls through unchanged (handler map form)", () => {
    const customSchema: any = z.string();
    customSchema._zod.def = { ...customSchema._zod.def, type: "myCustomType" };
    const result = z.visit(customSchema, { object: (o) => o });
    expect(result).toBe(customSchema);
  });
});
