import { expect, test } from "vitest";

import * as z from "zod/v4";

test("withExample with string schema", () => {
  const exampleValue = "example@test.com";
  const schema = z.string().email().withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample with number schema", () => {
  const exampleValue = 42;
  const schema = z.number().withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample with boolean schema", () => {
  const exampleValue = true;
  const schema = z.boolean().withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample with object schema", () => {
  const exampleValue = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
  };
  const schema = z
    .object({
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
    })
    .withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample with complex nested object", () => {
  const CommandMessage = z.object({
    action: z.literal("command"),
  });

  const AssemblyV2SettingsSchema = z.object({
    name: z.string(),
    xref: z.boolean(),
    collapse_model: z.boolean(),
    pqpm: z.string(),
    custom_parts: z.boolean(),
    toOrigin: z.boolean(),
  });

  const exampleValue = {
    type: "assembly" as const,
    action: "command" as const,
    command: "akassembler3" as const,
    name: "ASY_ART_90628285_S01_NV01",
    xref: true,
    collapse_model: true,
    pqpm: "PQPM20000",
    custom_parts: false,
    ak_id: "ASY_ART_90628285_S01_NV01",
    toOrigin: true,
    db_env: "PROD" as const,
    z_msgId: 15,
  };

  const AssemblyV2MessageSchema = CommandMessage.merge(AssemblyV2SettingsSchema)
    .extend({
      type: z.literal("assembly"),
      command: z.literal("akassembler3"),
      ak_id: z.string(),
      db_env: z.enum(["PROD", "DEV"]),
      z_msgId: z.number(),
    })
    .withExample(exampleValue);

  const meta = AssemblyV2MessageSchema.meta();
  expect(meta?.examples).toEqual([exampleValue]);

  // Verify the schema still works for validation
  const result = AssemblyV2MessageSchema.safeParse(exampleValue);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toEqual(exampleValue);
  }
});

test("withExample with array schema", () => {
  const exampleValue = [1, 2, 3, 4, 5];
  const schema = z.array(z.number()).withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample preserves validation", () => {
  const exampleValue = { name: "Alice", age: 25 };
  const schema = z
    .object({
      name: z.string(),
      age: z.number().min(0),
    })
    .withExample(exampleValue);

  // Valid data should pass
  expect(schema.safeParse({ name: "Bob", age: 30 }).success).toBe(true);

  // Invalid data should fail
  expect(schema.safeParse({ name: "Bob", age: -5 }).success).toBe(false);
  expect(schema.safeParse({ name: 123, age: 30 }).success).toBe(false);
});

test("withExample can be chained with other methods", () => {
  const exampleValue1 = "test@example.com";
  const exampleValue2 = "another@example.com";
  const baseSchema = z.string().email().withExample(exampleValue1).withExample(exampleValue2);
  const schema = baseSchema.optional();

  expect(schema.safeParse(undefined).success).toBe(true);
  expect(schema.safeParse("yet@example.com").success).toBe(true);

  // Verify the base schema has multiple examples
  const meta = baseSchema.meta();
  expect(meta?.examples).toEqual([exampleValue1, exampleValue2]);
});

test("withExample with null", () => {
  const exampleValue = null;
  const schema = z.null().withExample(exampleValue);
  const meta = schema.meta();
  expect(meta?.examples).toEqual([exampleValue]);
});

test("withExample retrieval via globalRegistry", () => {
  const exampleValue = { foo: "bar" };
  const schema = z.object({ foo: z.string() }).withExample(exampleValue);

  // The example is accessible via globalRegistry
  const meta = z.core.globalRegistry.get(schema);
  expect(meta?.examples).toEqual([exampleValue]);
});
