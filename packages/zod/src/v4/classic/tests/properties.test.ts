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

  // property reads work on any non-nullish value, so only null and undefined are a type error
  expect(z.properties({ length: z.number().min(3) }).parse("abc")).toBe("abc");
  for (const input of [null, undefined]) {
    expect(p.safeParse(input).error!.issues.map((i) => [i.code, i.path])).toEqual([["invalid_type", []]]);
  }

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
