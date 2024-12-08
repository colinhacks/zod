import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod-core";

test("globalRegistry", () => {
  const reg = z.registry();

  const a = z.string();
  reg.add(a);
  expect(reg.has(a)).toEqual(true);

  reg.remove(a);
  expect(reg.has(a)).toEqual(false);

  a.register(z.globalRegistry, "sup");
  expect(z.globalRegistry.has(a)).toEqual(true);
  expect(z.globalRegistry.get(a)).toEqual("sup");

  z.globalRegistry.remove(a);
  expect(z.globalRegistry.has(a)).toEqual(false);
});

test("z.registry", () => {
  const fieldRegistry = z.registry<{ name: string; description: string }>();

  const a = z.string();
  fieldRegistry.add(a, { name: "hello", description: "world" });
  const a_meta = fieldRegistry.get(a);
  expect(a_meta).toEqual({ name: "hello", description: "world" });

  expect([...fieldRegistry._metaMap].length).toEqual(1);

  fieldRegistry.remove(a);
  expect(fieldRegistry.has(a)).toEqual(false);
  expect(fieldRegistry.get(a)).toEqual(undefined);
  expect([...fieldRegistry._metaMap].length).toEqual(0);
});

test("z.registry no metadata", () => {
  const fieldRegistry = z.registry();

  const a = z.string();
  fieldRegistry.add(a);
  fieldRegistry.add(z.number());
  expect(fieldRegistry.get(a)).toEqual(undefined);
  expect(fieldRegistry.has(a)).toEqual(true);
  expect([...fieldRegistry._metaMap].length).toEqual(2);
});

test("z.registry with schema constraints", () => {
  const fieldRegistry = z.registry<
    { name: string; description: string },
    z.$ZodString
  >();

  const a = z.string();
  fieldRegistry.add(a, { name: "hello", description: "world" });
  // @ts-expect-error
  fieldRegistry.add(z.number(), { name: "test" });
  // @ts-expect-error
  z.number().register(fieldRegistry, { name: "test", description: "test" });
});

test("z.namedRegistry", () => {
  const namedReg = z
    .namedRegistry<{ name: string; description: string }>()
    .add(z.string(), { name: "hello", description: "world" })
    .add(z.number(), { name: "number", description: "number" });

  expect(namedReg.get("hello")).toEqual({
    name: "hello",
    description: "world",
  });
  expect(namedReg.has("hello")).toEqual(true);
  expect(namedReg.get("number")).toEqual({
    name: "number",
    description: "number",
  });

  // @ts-expect-error
  namedReg.get("world");
  // @ts-expect-error
  expect(namedReg.get("world")).toEqual(undefined);

  const hello = namedReg.get("hello");
  expect(hello).toEqual({ name: "hello", description: "world" });
  expectTypeOf<typeof hello>().toEqualTypeOf<{
    name: "hello";
    description: "world";
  }>();
  expectTypeOf<typeof namedReg.items>().toEqualTypeOf<{
    hello: { name: "hello"; description: "world" };
    number: { name: "number"; description: "number" };
  }>();
});
