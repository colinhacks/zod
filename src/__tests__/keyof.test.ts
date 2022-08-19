// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

function expectEnumToHaveOptions(Enum: z.ZodEnum<any>, keys: string[]): void {
  const values = Object.fromEntries(keys.map((k) => [k, k]));
  expect(Enum.Values).toStrictEqual(values);
  expect(Enum.enum).toStrictEqual(values);
  expect(Enum._def.values).toStrictEqual(keys);
}

test("keyof enum for object", async () => {
  const schema = z.object({ a: z.string(), b: z.string().optional() });
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["a", "b"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for object intersection", async () => {
  const schema = z.intersection(
    z.object({ a: z.string(), b: z.string().optional() }),
    z.object({ c: z.string(), d: z.string().optional() })
  );
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["a", "b", "c", "d"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for overlapping object union", async () => {
  const schema = z.union([
    z.object({ a: z.string(), b: z.string().optional() }),
    z.object({ a: z.string(), c: z.string() }),
  ]);
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["a"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for non-overlapping object union", async () => {
  const schema = z.union([
    z.object({ a: z.string(), b: z.string().optional() }),
    z.object({ c: z.string(), d: z.string() }),
  ]);
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for discriminated union", async () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), a: z.string(), b: z.string().optional() }),
    z.object({ type: z.literal("b"), a: z.string(), c: z.string() }),
  ]);
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["type", "a"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for object schema with default value", async () => {
  const schema = z
    .object({ a: z.string(), b: z.string().optional() })
    .default({ a: "" });
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["a", "b"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for lazy object schema", async () => {
  const schema = z.lazy(() =>
    z.object({ a: z.string(), b: z.string().optional() })
  );
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, ["a", "b"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for optional object schema", async () => {
  const schema = z
    .object({ a: z.string(), b: z.string().optional() })
    .optional();
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for nullable object schema", async () => {
  const schema = z
    .object({ a: z.string(), b: z.string().nullable() })
    .optional();
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, keyof z.infer<typeof schema>>(true);
});

test("keyof enum for primitive schema", async () => {
  const schema = z.string();
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  // NOTE: We're choosing not to return `ZodEnum<["charAt", "length", ...]>` here.
  util.assertEqual<Enum, never>(true);
});

test("keyof enum for array schema", async () => {
  const schema = z.array(z.string());
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  // NOTE: We're choosing not to return `ZodEnum<["map", "length", ...]>` here.
  util.assertEqual<Enum, never>(true);
});

test("keyof enum for union of object with array", async () => {
  const schema = z.union([
    z.object({
      a: z.string(),
    }),
    z.array(z.string()),
  ]);
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, never>(true);
});

test("keyof enum for union of primitive and array", async () => {
  const schema = z.union([z.string(), z.array(z.string())]);
  const Enum = z.keyof(schema);
  expectEnumToHaveOptions(Enum, []); // never.
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, never>(true);
});
