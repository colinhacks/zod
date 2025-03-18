import * as z from "@zod/mini";
import { expect, expectTypeOf, test } from "vitest";

test("globalRegistry", () => {
  const reg = z.registry();

  const a = z.string();
  reg.add(a);
  expect(reg.has(a)).toEqual(true);

  reg.remove(a);
  expect(reg.has(a)).toEqual(false);

  a.register(z.globalRegistry, { field: "sup" });
  expect(z.globalRegistry.has(a)).toEqual(true);
  expect(z.globalRegistry.get(a)).toEqual({ field: "sup" });

  z.globalRegistry.remove(a);
  expect(z.globalRegistry.has(a)).toEqual(false);
});

test("z.registry", () => {
  const fieldRegistry = z.registry<{ name: string; description: string }>();

  const a = z.string();
  fieldRegistry.add(a, { name: "hello", description: "world" });
  const a_meta = fieldRegistry.get(a);
  expect(a_meta).toEqual({ name: "hello", description: "world" });

  fieldRegistry.remove(a);
  expect(fieldRegistry.has(a)).toEqual(false);
  expect(fieldRegistry.get(a)).toEqual(undefined);
});

test("z.registry no metadata", () => {
  const fieldRegistry = z.registry();

  const a = z.string();
  fieldRegistry.add(a);
  fieldRegistry.add(z.number());
  expect(fieldRegistry.get(a)).toEqual(undefined);
  expect(fieldRegistry.has(a)).toEqual(true);
});

test("z.registry with schema constraints", () => {
  const fieldRegistry = z.registry<{ name: string; description: string }, z.ZodMiniString>();

  const a = z.string();
  fieldRegistry.add(a, { name: "hello", description: "world" });
  // @ts-expect-error
  fieldRegistry.add(z.number(), { name: "test" });
  // @ts-expect-error
  z.number().register(fieldRegistry, { name: "test", description: "test" });
});

// test("z.namedRegistry", () => {
//   const namedReg = z
//     .namedRegistry<{ name: string; description: string }>()
//     .add(z.string(), { name: "hello", description: "world" })
//     .add(z.number(), { name: "number", description: "number" });

//   expect(namedReg.get("hello")).toEqual({
//     name: "hello",
//     description: "world",
//   });
//   expect(namedReg.has("hello")).toEqual(true);
//   expect(namedReg.get("number")).toEqual({
//     name: "number",
//     description: "number",
//   });

//   // @ts-expect-error
//   namedReg.get("world");
//   // @ts-expect-error
//   expect(namedReg.get("world")).toEqual(undefined);

//   const hello = namedReg.get("hello");
//   expect(hello).toEqual({ name: "hello", description: "world" });
//   expectTypeOf<typeof hello>().toEqualTypeOf<{
//     name: "hello";
//     description: "world";
//   }>();
//   expectTypeOf<typeof namedReg.items>().toEqualTypeOf<{
//     hello: { name: "hello"; description: "world" };
//     number: { name: "number"; description: "number" };
//   }>();
// });

test("output type in registry meta", () => {
  const reg = z.registry<z.OUTPUT>();
  const a = z.string();
  reg.add(a, "asdf");
  // @ts-expect-error
  reg.add(a, 1234);
  expectTypeOf(reg.get(a)).toEqualTypeOf<string | undefined>();
});

test("output type in registry meta - objects and arrays", () => {
  const reg = z.registry<{ name: string; examples: z.OUTPUT[] }>();
  const a = z.string();
  reg.add(a, { name: "hello", examples: ["world"] });

  // @ts-expect-error
  reg.add(a, { name: "hello", examples: "world" });
  expectTypeOf(reg.get(a)).toEqualTypeOf<{ name: string; examples: string[] } | undefined>();
});

test("input type in registry meta", () => {
  const reg = z.registry<z.INPUT>();
  const a = z.pipe(z.number(), z.transform(String));
  reg.add(a, 1234);
  // @ts-expect-error
  reg.add(a, "1234");
  expectTypeOf(reg.get(a)).toEqualTypeOf<number | undefined>();
});

test("input type in registry meta - objects and arrays", () => {
  const reg = z.registry<{ name: string; examples: z.INPUT[] }>();
  const a = z.pipe(z.number(), z.transform(String));
  reg.add(a, { name: "hello", examples: [1234] });

  // @ts-expect-error
  reg.add(a, { name: "hello", examples: "world" });
  expectTypeOf(reg.get(a)).toEqualTypeOf<{ name: string; examples: number[] } | undefined>();
});
