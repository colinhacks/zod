import { expect, test } from "vitest";
import * as z from "zod/v4";

test("static string mask", () => {
  const schema = z.object({ a: z.string().mask("***") });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "***" });
});

test("array mask picks deterministically", () => {
  const opts = ["x", "y", "z"];
  const schema = z.object({
    id: z.string(),
    name: z.string().mask(opts),
  });
  const a = schema.parseAndMask({ id: "1", name: "asdf" });
  const b = schema.parseAndMask({ id: "1", name: "qwer" });
  expect(a.name).toBe(b.name);
  expect(opts).toContain(a.name);

  const c = schema.parseAndMask({ id: "2", name: "asdf" });
  expect(opts).toContain(c.name);
});

test("function mask receives seed", () => {
  const schema = z.object({
    id: z.string(),
    v: z.string().mask((seed) => `m-${seed}`),
  });
  expect(schema.parseAndMask({ id: "abc", v: "secret" }).v).toBe("m-abc");
});

test("seed from id field", () => {
  const schema = z.object({
    id: z.string(),
    s: z.string().mask((seed) => `s-${seed}`),
  });
  const r = schema.parseAndMask({ id: "id1", s: "hidden" });
  expect(r.s).toBe("s-id1");
  expect(r.id).toBe("id1");
});

test("composite seed when no id", () => {
  const schema = z.object({
    a: z.string().mask(["X", "Y"]),
    b: z.string().mask(["P", "Q"]),
  });
  const r = schema.parseAndMask({ a: "foo", b: "bar" });
  expect(["X", "Y"]).toContain(r.a);
  expect(["P", "Q"]).toContain(r.b);
});

test("nested objects", () => {
  const schema = z.object({
    inner: z.object({
      id: z.string(),
      s: z.string().mask("R"),
    }),
  });
  const r = schema.parseAndMask({ inner: { id: "1", s: "asdf" } });
  expect(r.inner.s).toBe("R");
  expect(r.inner.id).toBe("1");
});

test("array of objects", () => {
  const schema = z.object({
    items: z.array(z.object({ id: z.string(), s: z.string().mask("H") })),
  });
  const r = schema.parseAndMask({
    items: [
      { id: "1", s: "a" },
      { id: "2", s: "b" },
    ],
  });
  expect(r.items[0].s).toBe("H");
  expect(r.items[1].s).toBe("H");
  expect(r.items[0].id).toBe("1");
});

test("array of primitives", () => {
  const schema = z.object({ tags: z.array(z.string().mask("*")) });
  expect(schema.parseAndMask({ tags: ["a", "b"] })).toEqual({ tags: ["*", "*"] });
});

test("optional with value", () => {
  const schema = z.object({ a: z.string().mask("M").optional() });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "M" });
});

test("optional undefined passthrough", () => {
  const schema = z.object({ a: z.string().mask("M").optional() });
  expect(schema.parseAndMask({})).toEqual({});
});

test("nullable with value", () => {
  const schema = z.object({ a: z.string().mask("M").nullable() });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "M" });
});

test("nullable null passthrough", () => {
  const schema = z.object({ a: z.string().mask("M").nullable() });
  expect(schema.parseAndMask({ a: null })).toEqual({ a: null });
});

test("default wrapper", () => {
  const schema = z.object({ a: z.string().mask("M").default("d") });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "M" });
  expect(schema.parseAndMask({})).toEqual({ a: "M" });
});

test("readonly wrapper", () => {
  const schema = z.object({ a: z.string().mask("M").readonly() });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "M" });
});

test("union", () => {
  const schema = z.object({
    v: z.union([
      z.object({ t: z.literal("a"), s: z.string().mask("X") }),
      z.object({ t: z.literal("b"), s: z.string().mask("Y") }),
    ]),
  });
  expect(schema.parseAndMask({ v: { t: "a", s: "foo" } }).v.s).toBe("X");
  expect(schema.parseAndMask({ v: { t: "b", s: "bar" } }).v.s).toBe("Y");
});

test("union with transform matches original branch", () => {
  const schema = z.object({
    v: z.union([
      z
        .string()
        .mask("MASKED")
        .transform((s) => Number(s)),
      z.number().mask(0),
    ]),
  });
  expect(schema.parseAndMask({ v: "42" }).v).toBe("MASKED");
  expect(schema.parseAndMask({ v: 99 }).v).toBe(0);
});

test("discriminated union", () => {
  const schema = z.object({
    v: z.discriminatedUnion("t", [
      z.object({ t: z.literal("a"), s: z.string().mask("X") }),
      z.object({ t: z.literal("b"), s: z.string().mask("Y") }),
    ]),
  });
  expect(schema.parseAndMask({ v: { t: "a", s: "foo" } }).v.s).toBe("X");
});

test("pipe", () => {
  const schema = z.object({ a: z.string().mask("M").pipe(z.string().min(1)) });
  expect(schema.parseAndMask({ a: "asdf" })).toEqual({ a: "M" });
});

test("unmasked fields pass through", () => {
  const schema = z.object({ a: z.string(), b: z.string().mask("R") });
  const r = schema.parseAndMask({ a: "hello", b: "hidden" });
  expect(r.a).toBe("hello");
  expect(r.b).toBe("R");
});

test("parseAndMask throws on invalid", () => {
  const schema = z.object({ a: z.string().mask("M") });
  expect(() => schema.parseAndMask({ a: 123 })).toThrow();
});

test("safeParseAndMask success", () => {
  const schema = z.object({ a: z.string().mask("M") });
  const r = schema.safeParseAndMask({ a: "asdf" });
  expect(r.success).toBe(true);
  if (r.success) expect(r.data.a).toBe("M");
});

test("safeParseAndMask error", () => {
  const schema = z.object({ a: z.string().mask("M") });
  const r = schema.safeParseAndMask({ a: 123 });
  expect(r.success).toBe(false);
  if (!r.success) expect(r.error.issues.length).toBeGreaterThan(0);
});

test("parseAndMaskAsync success", async () => {
  const schema = z.object({ a: z.string().mask("M") });
  expect(await schema.parseAndMaskAsync({ a: "asdf" })).toEqual({ a: "M" });
});

test("parseAndMaskAsync throws on invalid", async () => {
  const schema = z.object({ a: z.string().mask("M") });
  await expect(schema.parseAndMaskAsync({ a: 123 })).rejects.toThrow();
});

test("safeParseAndMaskAsync success", async () => {
  const schema = z.object({ a: z.string().mask("M") });
  const r = await schema.safeParseAndMaskAsync({ a: "asdf" });
  expect(r.success).toBe(true);
  if (r.success) expect(r.data.a).toBe("M");
});

test("safeParseAndMaskAsync error", async () => {
  const schema = z.object({ a: z.string().mask("M") });
  const r = await schema.safeParseAndMaskAsync({ a: 123 });
  expect(r.success).toBe(false);
});

test("async transform with mask", async () => {
  const schema = z.object({
    a: z
      .string()
      .transform(async (v) => v.trim())
      .pipe(z.string().mask("M")),
  });
  expect(await schema.parseAndMaskAsync({ a: "  asdf  " })).toEqual({ a: "M" });
});

test("async union branch masks correctly", async () => {
  const schema = z.object({
    v: z.union([
      z
        .string()
        .mask("MASKED")
        .transform(async (s) => s.toUpperCase()),
      z.number(),
    ]),
  });
  expect((await schema.parseAndMaskAsync({ v: "hello" })).v).toBe("MASKED");
  expect((await schema.parseAndMaskAsync({ v: 42 })).v).toBe(42);
});

test("z.parseAndMask function form", () => {
  const schema = z.object({ a: z.string().mask("M") });
  expect(z.parseAndMask(schema, { a: "asdf" })).toEqual({ a: "M" });
});

test("z.safeParseAndMask function form", () => {
  const schema = z.object({ a: z.string().mask("M") });
  const r = z.safeParseAndMask(schema, { a: "asdf" });
  expect(r.success).toBe(true);
  if (r.success) expect(r.data.a).toBe("M");
});

test("no masks acts as normal parse", () => {
  const schema = z.object({ a: z.string(), b: z.number() });
  expect(schema.parseAndMask({ a: "asdf", b: 5 })).toEqual({ a: "asdf", b: 5 });
});

test("deeply nested", () => {
  const schema = z.object({ l1: z.object({ l2: z.object({ l3: z.object({ s: z.string().mask("D") }) }) }) });
  expect(schema.parseAndMask({ l1: { l2: { l3: { s: "asdf" } } } }).l1.l2.l3.s).toBe("D");
});

test("recursive lazy schema does not blow stack", () => {
  type Tree = { v: string; children: Tree[] };
  const Tree: z.ZodType<Tree> = z.lazy(() => z.object({ v: z.string(), children: z.array(Tree) }));
  const schema = z.object({ tree: Tree.pipe(z.any()) });
  const data = { tree: { v: "root", children: [{ v: "leaf", children: [] }] } };
  expect(schema.parseAndMask(data)).toEqual(data);
});

test("number single value mask", () => {
  const schema = z.object({ n: z.number().mask(0) });
  expect(schema.parseAndMask({ n: 1234 })).toEqual({ n: 0 });
});

test("number array mask picks deterministically", () => {
  const opts = [10, 20, 30];
  const schema = z.object({ id: z.string(), n: z.number().mask(opts) });
  const a = schema.parseAndMask({ id: "1", n: 999 });
  const b = schema.parseAndMask({ id: "1", n: 777 });
  expect(a.n).toBe(b.n);
  expect(opts).toContain(a.n);
});

test("number function mask", () => {
  const schema = z.object({ id: z.string(), n: z.number().mask(() => 42) });
  expect(schema.parseAndMask({ id: "1", n: 999 }).n).toBe(42);
});

test("boolean single value mask", () => {
  const schema = z.object({ b: z.boolean().mask(false) });
  expect(schema.parseAndMask({ b: true })).toEqual({ b: false });
});

test("boolean array mask picks deterministically", () => {
  const schema = z.object({ id: z.string(), b: z.boolean().mask([true, false]) });
  const a = schema.parseAndMask({ id: "1", b: true });
  const b = schema.parseAndMask({ id: "1", b: false });
  expect(a.b).toBe(b.b);
  expect([true, false]).toContain(a.b);
});

test("boolean function mask", () => {
  const schema = z.object({ b: z.boolean().mask(() => false) });
  expect(schema.parseAndMask({ b: true }).b).toBe(false);
});

test("string array mask picks deterministically", () => {
  const opts = ["a", "b", "c"];
  const schema = z.object({ id: z.string(), s: z.string().mask(opts) });
  const a = schema.parseAndMask({ id: "1", s: "x" });
  const b = schema.parseAndMask({ id: "1", s: "y" });
  expect(a.s).toBe(b.s);
  expect(opts).toContain(a.s);
});

test("mask type safety", () => {
  z.string().mask("ok");
  z.string().mask(["a", "b"]);
  z.number().mask(0);
  z.number().mask([1, 2]);
  z.boolean().mask(true);
  z.boolean().mask([true, false]);

  // @ts-expect-error - number not assignable to string mask
  z.string().mask(123);
  // @ts-expect-error - string not assignable to number mask
  z.number().mask("asdf");
  // @ts-expect-error - string not assignable to boolean mask
  z.boolean().mask("asdf");
  // @ts-expect-error - number array not assignable to string mask
  z.string().mask([1, 2]);
  // @ts-expect-error - string array not assignable to number mask
  z.number().mask(["a", "b"]);
});
