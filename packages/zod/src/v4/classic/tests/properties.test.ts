import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("z.properties is a schema", () => {
  const p = z.properties({ a: z.literal("x"), b: z.literal("y") });

  expectTypeOf<z.infer<typeof p>>().toEqualTypeOf<{ a: "x"; b: "y" }>();

  // asserts in place: the parse returns the input identity, extra keys pass
  const ok = { a: "x", b: "y", extra: 1 };
  expect(p.parse(ok)).toBe(ok);

  // every failing key reports
  expect(p.safeParse({ a: "!", b: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"], ["b"]]);

  // as a schema it is the type gate and infers an object shape, so a primitive is a type error
  for (const input of [null, undefined, 5, "abc"]) {
    expect(p.safeParse(input).error!.issues.map((i) => [i.code, i.path])).toEqual([["invalid_type", []]]);
  }

  // as a check the base already typed the value, so the properties are asserted on whatever it produced — a string's length, as z.property() does
  const long = z.string().check(...z.properties({ length: z.number().min(3) }));
  expect(long.parse("abc")).toBe("abc");
  expect(long.safeParse("ab").error!.issues.map((i) => i.path)).toEqual([["length"]]);
  expect(
    z
      .compile(long)
      .safeParse("ab")
      .error!.issues.map((i) => i.path)
  ).toEqual([["length"]]);

  // an optional key may be absent
  const opt = z.properties({ a: z.string().optional() });
  expect(opt.safeParse({}).success).toBe(true);
  expectTypeOf<z.infer<typeof opt>>().toEqualTypeOf<{ a?: string | undefined }>();
});

test("z.properties discards transformed output", () => {
  // asserts and never writes back, exactly as z.property() behaves; a nested object schema rebuilds its output even without transforms, so identity cannot distinguish the two
  const p = z.properties({ a: z.string().transform((s) => s.toUpperCase()) });
  const input = { a: "hi" };
  expect(p.parse(input)).toBe(input);
  expect(input.a).toBe("hi");
});

test("z.properties narrows through intersection", () => {
  const httpsUrl = z.instanceof(URL).and(z.properties({ protocol: z.literal("https:") }));
  expectTypeOf<z.infer<typeof httpsUrl>>().toEqualTypeOf<URL & { protocol: "https:" }>();

  const u = new URL("https://example.com");
  expect(httpsUrl.parse(u)).toBe(u);
  expect(httpsUrl.safeParse(new URL("http://example.com")).success).toBe(false);
});

test("z.instanceof().properties()", () => {
  const httpsUrl = z.instanceof(URL).properties({ protocol: z.literal("https:") });
  expectTypeOf<z.infer<typeof httpsUrl>>().toEqualTypeOf<URL & { protocol: "https:" }>();

  const u = new URL("https://example.com");
  expect(httpsUrl.parse(u)).toBe(u);
  expect(httpsUrl.safeParse(new URL("http://example.com")).error!.issues.map((i) => i.path)).toEqual([["protocol"]]);

  // chains, and each call narrows further
  const chained = httpsUrl.properties({ port: z.literal("") });
  expectTypeOf<z.infer<typeof chained>>().toEqualTypeOf<URL & { protocol: "https:" } & { port: "" }>();
  expect(chained.safeParse(u).success).toBe(true);
  expect(chained.safeParse(new URL("https://example.com:8443")).error!.issues.map((i) => i.path)).toEqual([["port"]]);
});

test("z.properties spreads into .check()", () => {
  // the pre-4.6 array call sites: the schema yields itself from Symbol.iterator
  const p = z.properties({ a: z.literal("x") });
  const spread = [...p];
  expect(spread).toEqual([p]);

  const s = z.object({ a: z.string() }).check(...z.properties({ a: z.literal("x") }));
  expect(s.safeParse({ a: "x" }).success).toBe(true);
  expect(s.safeParse({ a: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"]]);
});

test("z.properties JSON Schema", () => {
  const p = z.properties({ a: z.string(), b: z.number().optional() });
  expect(z.toJSONSchema(p)).toEqual({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { a: { type: "string" }, b: { type: "number" } },
    required: ["a"],
  });
});

test("z.properties compiles", () => {
  const p = z.properties({ a: z.literal("x"), b: z.literal("y") });
  const compiled = z.compile(p);
  const ok = { a: "x", b: "y", extra: 1 };
  expect(compiled.parse(ok)).toBe(ok);
  expect(compiled.safeParse({ a: "!", b: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"], ["b"]]);
  expect(compiled.safeParse(null).error!.issues.map((i) => [i.code, i.path])).toEqual([["invalid_type", []]]);

  // nested in a container
  const outer = z.compile(z.object({ url: z.instanceof(URL).properties({ protocol: z.literal("https:") }) }));
  expect(outer.safeParse({ url: new URL("http://example.com") }).error!.issues.map((i) => i.path)).toEqual([
    ["url", "protocol"],
  ]);
});

test("z.properties async", async () => {
  const p = z.properties({ a: z.string().refine(async (s) => s.length > 1) });
  const ok = { a: "hi" };
  await expect(p.parseAsync(ok)).resolves.toBe(ok);
  const bad = await p.safeParseAsync({ a: "!" });
  expect(bad.error!.issues.map((i) => i.path)).toEqual([["a"]]);
});

test("z.properties infers the input side", () => {
  // nothing is written back, so an output-typed inference would lie for every shape entry whose output differs from its input
  const withDefault = z.properties({ a: z.string().default("x") });
  expectTypeOf<z.infer<typeof withDefault>>().toEqualTypeOf<{ a?: string | undefined }>();
  expect(withDefault.parse({})).toEqual({});

  const withTransform = z.properties({ a: z.string().transform((s) => s.length) });
  expectTypeOf<z.infer<typeof withTransform>>().toEqualTypeOf<{ a: string }>();
  expect(withTransform.parse({ a: "hi" })).toEqual({ a: "hi" });

  // a plain schema has the same input and output, so the documented narrowing is unchanged
  const W = z.instanceof(URL).properties({ protocol: z.literal("https:") });
  expectTypeOf<z.infer<typeof W>>().toEqualTypeOf<URL & { protocol: "https:" }>();
});

test("z.properties validates symbol keys", () => {
  const sym = Symbol("tag");
  const p = z.properties({ [sym]: z.string() });
  expect(p.safeParse({ [sym]: "ok" }).success).toBe(true);
  expect(p.safeParse({ [sym]: 123 }).error!.issues.map((i) => i.path)).toEqual([[sym]]);
  expect(
    z
      .compile(p)
      .safeParse({ [sym]: 123 })
      .error!.issues.map((i) => i.path)
  ).toEqual([[sym]]);
});

test("z.properties compiled and interpreted agree on a nullish value", () => {
  // a base that permits null reaches the check role with one; the compiled property read must not throw where the runtime reports an issue
  const s = z.any().check(...z.properties({ a: z.string() }));
  const expected = [["invalid_type", []]];
  expect(s.safeParse(null).error!.issues.map((i) => [i.code, i.path])).toEqual(expected);
  expect(
    z
      .compile(s)
      .safeParse(null)
      .error!.issues.map((i) => [i.code, i.path])
  ).toEqual(expected);
});

test("z.properties with a custom when refuses to compile", () => {
  // `when` is not publicly settable, since it gates a check inside the run loop and means nothing to a parsed schema. A hand-built def can still carry one, and compiling it must refuse rather than run the shape unconditionally: a union branch compiles to its own IIFE, so a wrong rejection is absorbed as a branch failure with no fallback.
  const p = new z.core.$ZodProperties({
    type: "properties",
    check: "properties",
    shape: { a: z.literal("x") },
    when: () => false,
  });
  const s = z.union([p as unknown as z.ZodType, z.object({ b: z.string() })]);
  const input = { a: "wrong", b: "hello" };
  expect(z.compile(s).safeParse(input)).toEqual(s.safeParse(input));
});

test("z.properties parses cyclic input", () => {
  // the input is its own output, so it registers as its own memo entry; without that a cycle re-enters forever
  const Node: z.ZodType<{ id: string; next?: unknown }> = z.lazy(() =>
    z.properties({ id: z.string(), next: Node.optional() })
  );
  const cyclic: Record<string, unknown> = { id: "a" };
  cyclic.next = cyclic;
  expect(Node.parse(cyclic)).toBe(cyclic);
  expect(z.compile(Node).parse(cyclic)).toBe(cyclic);

  // the cycle guard must not swallow a real failure further down
  expect(Node.safeParse({ id: "a", next: { id: 1 } }).error!.issues.map((i) => i.path)).toEqual([["next", "id"]]);
});

test("z.properties asserts forward while encoding", () => {
  // both sides declare the shape's input type, so encoding must still check the value against it; running the children backward would encode them and reject that type
  const codec = z.codec(z.string(), z.number(), { decode: (s) => Number(s), encode: (n) => String(n) });
  const p = z.properties({ a: codec, b: z.string().transform((s) => s.length) });
  const value = { a: "1", b: "hi" };
  expect(z.decode(p, value)).toBe(value);
  expect(z.encode(p, value)).toBe(value);
  expect(z.safeEncode(p, { a: 1, b: "hi" } as never).error!.issues.map((i) => i.path)).toEqual([["a"]]);
});

test("z.properties parses a cyclic callable", () => {
  // property reads work on a function too, so the cycle guard has to recognize one as a reference
  const Fn: z.ZodType<{ self?: unknown }> = z.lazy(() => z.properties({ self: Fn.optional() }));
  const fn = (() => {}) as unknown as Record<string, unknown>;
  fn.self = fn;
  expect(Fn.parse(fn)).toBe(fn);
});

test("z.properties survives shape mutation", () => {
  // key and schema are snapshotted together; caching one and reading the other live paired a stale key with a missing schema
  const shape: Record<string, z.ZodType> = { a: z.string() };
  const p = z.properties(shape);
  expect(p.safeParse({ a: "x" }).success).toBe(true);
  delete shape.a;
  expect(p.safeParse({ a: "x" }).success).toBe(true);
  shape.b = z.string();
  expect(p.safeParse({ a: "x" }).success).toBe(true);
});

test("z.properties JSON Schema describes the input side", () => {
  // the parsed value is the input, so a defaulted key that stays absent must not be required of the output either
  const p = z.properties({ a: z.string().default("x") });
  expect(p.parse({})).toEqual({});
  expect(z.toJSONSchema(p, { io: "output" })).toEqual({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { a: { default: "x", type: "string" } },
  });

  // an output mode emission for a transforming child would describe a value this schema never returns
  const t = z.properties({ a: z.string().transform((s) => s.length) });
  expect(() => z.toJSONSchema(t, { io: "output" })).toThrow(/cannot be represented/);
  expect(z.toJSONSchema(t, { io: "input" })).toMatchObject({ properties: { a: { type: "string" } }, required: ["a"] });
});
