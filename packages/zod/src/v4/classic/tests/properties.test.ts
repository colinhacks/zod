import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("z.properties is a check", () => {
  const s = z.object({ a: z.string(), b: z.string() }).check(z.properties({ a: z.literal("x"), b: z.literal("y") }));

  // asserts in place: extra keys pass, and every failing key reports
  expect(s.safeParse({ a: "x", b: "y", extra: 1 }).success).toBe(true);
  expect(s.safeParse({ a: "!", b: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"], ["b"]]);

  // the base already typed the value, so the properties are asserted on whatever it produced — a string's length, as z.property() does
  const long = z.string().check(z.properties({ length: z.number().min(3) }));
  expect(long.parse("abc")).toBe("abc");
  expect(long.safeParse("ab").error!.issues.map((i) => i.path)).toEqual([["length"]]);
  expect(
    z
      .compile(long)
      .safeParse("ab")
      .error!.issues.map((i) => i.path)
  ).toEqual([["length"]]);

  // not a schema
  // @ts-expect-error a check has no parse of its own
  z.properties({ a: z.string() }).parse;
});

test("z.properties discards transformed output", () => {
  // asserts and never writes back, exactly as z.property() behaves; a nested object schema rebuilds its output even without transforms, so identity cannot distinguish the two
  const s = z.any().check(z.properties({ a: z.string().transform((s) => s.toUpperCase()) }));
  const input = { a: "hi" };
  expect(s.parse(input)).toBe(input);
  expect(input.a).toBe("hi");
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

  // nothing is written back, so the narrowing is over the shape's input side
  const W = z.instanceof(URL).properties({ search: z.string().transform((s) => s.length) });
  expectTypeOf<z.infer<typeof W>>().toEqualTypeOf<URL & { search: string }>();
});

test("z.properties spreads into .check()", () => {
  // the 4.5 array call sites: the check yields itself from Symbol.iterator
  const p = z.properties({ a: z.literal("x") });
  expect([...p]).toEqual([p]);

  const s = z.object({ a: z.string() }).check(...z.properties({ a: z.literal("x") }));
  expect(s.safeParse({ a: "x" }).success).toBe(true);
  expect(s.safeParse({ a: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"]]);
});

test("z.properties compiles inside a container", () => {
  const outer = z.compile(z.object({ url: z.instanceof(URL).properties({ protocol: z.literal("https:") }) }));
  expect(outer.safeParse({ url: new URL("http://example.com") }).error!.issues.map((i) => i.path)).toEqual([
    ["url", "protocol"],
  ]);
});

test("z.properties async", async () => {
  const s = z.any().check(z.properties({ a: z.string().refine(async (s) => s.length > 1) }));
  const ok = { a: "hi" };
  await expect(s.parseAsync(ok)).resolves.toBe(ok);
  const bad = await s.safeParseAsync({ a: "!" });
  expect(bad.error!.issues.map((i) => i.path)).toEqual([["a"]]);
});

test("z.properties validates symbol keys", () => {
  const sym = Symbol("tag");
  const s = z.any().check(z.properties({ [sym]: z.string() }));
  expect(s.safeParse({ [sym]: "ok" }).success).toBe(true);
  expect(s.safeParse({ [sym]: 123 }).error!.issues.map((i) => i.path)).toEqual([[sym]]);
  expect(
    z
      .compile(s)
      .safeParse({ [sym]: 123 })
      .error!.issues.map((i) => i.path)
  ).toEqual([[sym]]);
});

test("z.properties compiled and interpreted agree on a nullish value", () => {
  // a base that permits null reaches the check with one; the compiled property read must not throw where the runtime reports an issue
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
  // `when` is not publicly settable, since it gates the assertion inside the run loop. A hand-built def can still carry one, and compiling it must refuse rather than run the shape unconditionally: a union branch compiles to its own IIFE, so a wrong rejection is absorbed as a branch failure with no fallback.
  const p = new z.core.$ZodCheckProperties({ check: "properties", shape: { a: z.literal("x") }, when: () => false });
  const s = z.union([z.any().check(p), z.object({ b: z.string() })]);
  const input = { a: "wrong", b: "hello" };
  expect(z.compile(s).safeParse(input)).toEqual(s.safeParse(input));
});

test("z.properties survives shape mutation", () => {
  // key and schema are snapshotted together; caching one and reading the other live paired a stale key with a missing schema
  const shape: Record<string, z.ZodType> = { a: z.string() };
  const s = z.any().check(z.properties(shape));
  expect(s.safeParse({ a: "x" }).success).toBe(true);
  delete shape.a;
  expect(s.safeParse({ a: "x" }).success).toBe(true);
  shape.b = z.string();
  expect(s.safeParse({ a: "x" }).success).toBe(true);
});
