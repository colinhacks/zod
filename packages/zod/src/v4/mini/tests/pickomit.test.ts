import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/mini";

const fish = z.object({
  name: z.string(),
  age: z.number(),
  nested: z.object({}),
});

test("z.pick - inference and parse", () => {
  const nameonly = z.pick(fish, { name: true });
  expectTypeOf<z.infer<typeof nameonly>>().toEqualTypeOf<{ name: string }>();
  expect(z.parse(nameonly, { name: "bob" })).toEqual({ name: "bob" });
  // unknown keys are stripped, not rejected
  expect(z.parse(nameonly, { name: "bob", age: 12 } as any)).toEqual({ name: "bob" });
  expect(() => z.parse(nameonly, { age: 12 } as any)).toThrow();
});

test("z.pick - falsy mask values are ignored at runtime", () => {
  // @ts-expect-error falsy mask values are not assignable
  const picked = z.pick(fish, { name: true, age: false });
  expect(Object.keys(picked._zod.def.shape)).toEqual(["name"]);
});

test("z.pick - drops unpicked keys from the shape", () => {
  const schema = z.object({ a: z.string(), b: z.optional(z.string()) });
  const picked = z.pick(schema, { a: true });
  expect("a" in picked._zod.def.shape).toBe(true);
  expect("b" in picked._zod.def.shape).toBe(false);
});

test("z.omit - inference and parse", () => {
  const noname = z.omit(fish, { name: true });
  expectTypeOf<z.infer<typeof noname>>().toEqualTypeOf<{ age: number; nested: Record<string, never> }>();
  expect(z.parse(noname, { age: 12, nested: {} })).toEqual({ age: 12, nested: {} });
  expect(() => z.parse(noname, { age: 12 } as any)).toThrow();
  expect(() => z.parse(noname, {} as any)).toThrow();
});

test("z.omit - drops the omitted key from the shape", () => {
  const schema = z.object({ a: z.string(), b: z.optional(z.string()) });
  const omitted = z.omit(schema, { a: true });
  expect("a" in omitted._zod.def.shape).toBe(false);
  expect("b" in omitted._zod.def.shape).toBe(true);
});

test("z.pick - preserves catchall", () => {
  const lax = z.pick(z.catchall(fish, z.any()), { name: true });
  expectTypeOf<z.infer<typeof lax>>().toEqualTypeOf<{ name: string; [k: string]: any }>();
  expect(z.parse(lax, { name: "asdf", whatever: "asdf" })).toEqual({ name: "asdf", whatever: "asdf" });
  expect(() => z.parse(lax, { whatever: "asdf" } as any)).toThrow();
});

test("pick/omit/partial/required - reject unknown mask keys", () => {
  const schema = z.object({ name: z.string(), age: z.number() });

  // @ts-expect-error unknown key
  expect(() => z.safeParse(z.pick(schema, { name: true, asdf: true }), {})).toThrow('Unrecognized key: "asdf"');
  // @ts-expect-error unknown key
  expect(() => z.safeParse(z.omit(schema, { name: true, asdf: true }), {})).toThrow('Unrecognized key: "asdf"');
  // @ts-expect-error unknown key
  expect(() => z.safeParse(z.partial(schema, { name: true, asdf: true }), {})).toThrow('Unrecognized key: "asdf"');
  // @ts-expect-error unknown key
  expect(() => z.safeParse(z.required(schema, { name: true, asdf: true }), {})).toThrow('Unrecognized key: "asdf"');
  // @ts-expect-error unknown key
  expect(() => z.safeParse(z.pick(schema, { $unknown: true }), {})).toThrow('Unrecognized key: "$unknown"');
});

test("z.pick / z.omit - reject schemas containing refinements", () => {
  const base = z.object({ id: z.string(), name: z.string() });
  const refined = base.check(z.refine((val) => val.id.length > 0, "Must have an id"));

  expect(() => z.pick(refined, { name: true })).toThrow(
    ".pick() cannot be used on object schemas containing refinements"
  );
  expect(() => z.omit(refined, { id: true })).toThrow(
    ".omit() cannot be used on object schemas containing refinements"
  );
});

test("z.extend - only rejects refined schemas when a key is overwritten", () => {
  const base = z.object({ id: z.string(), name: z.string() });
  const refined = base.check(z.refine((val) => val.id.length > 0, "Must have an id"));

  expect(() => z.extend(refined, { name: z.number() })).toThrow(
    "Cannot overwrite keys on object schemas containing refinements"
  );
  expect(Object.keys(z.extend(refined, { extra: z.number() })._zod.def.shape)).toEqual(["id", "name", "extra"]);

  // safeExtend permits the overwrite that extend rejects, but only when the
  // replacement narrows the original type
  const narrowed = z.safeExtend(refined, { name: z.literal("bob") });
  expect(Object.keys(narrowed._zod.def.shape)).toEqual(["id", "name"]);
  expect(z.parse(narrowed, { id: "1", name: "bob" })).toEqual({ id: "1", name: "bob" });
  // @ts-expect-error a widening replacement is rejected at the type level
  z.safeExtend(refined, { name: z.number() });
});
