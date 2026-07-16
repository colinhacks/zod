import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

// Regression tests for issue #2654
// https://github.com/colinhacks/zod/issues/2654
//
// Union types inside z.object() must infer the same type as standalone unions.

test("issue #2654: string | string[] union inside z.object", () => {
  const EventNameSchema = z.string().or(z.array(z.string()));
  type EventName = z.infer<typeof EventNameSchema>;

  const EventSchema = z.object({
    name: z.string().or(z.array(z.string())),
  });
  type EventName2 = z.infer<typeof EventSchema>["name"];

  expectTypeOf<EventName2>().toEqualTypeOf<EventName>();
  expectTypeOf<EventName2>().toEqualTypeOf<string | string[]>();

  expect(EventSchema.parse({ name: "x" })).toEqual({ name: "x" });
  expect(EventSchema.parse({ name: ["x", "y"] })).toEqual({ name: ["x", "y"] });
  expect(EventSchema.safeParse({ name: undefined }).success).toEqual(false);
});

test("issue #2654: array | record union inside z.object", () => {
  const standalone = z.string().array().or(z.record(z.string(), z.string()));
  type Standalone = z.infer<typeof standalone>;

  const schema = z.object({
    values: z.string().array().or(z.record(z.string(), z.string())),
  });
  type InObject = z.infer<typeof schema>["values"];

  expectTypeOf<InObject>().toEqualTypeOf<Standalone>();

  expect(schema.parse({ values: ["a"] })).toEqual({ values: ["a"] });
  expect(schema.parse({ values: { k: "v" } })).toEqual({ values: { k: "v" } });
});

test("issue #2654: enum | record union inside z.object", () => {
  const role = z.enum(["Administrator", "Writer", "Readonly"]);
  const rolesPerLocale = z.record(z.string(), role.optional());
  const repositoryRole = role.or(rolesPerLocale);

  type StandaloneRole = z.infer<typeof repositoryRole>;

  const schema = z.object({
    role: role.or(rolesPerLocale),
  });
  type InObjectRole = z.infer<typeof schema>["role"];

  expectTypeOf<InObjectRole>().toEqualTypeOf<StandaloneRole>();

  expect(schema.parse({ role: "Administrator" })).toEqual({ role: "Administrator" });
  expect(schema.parse({ role: { en: "Writer" } })).toEqual({ role: { en: "Writer" } });
});

test("issue #2654: mixed required and optional keys with union", () => {
  const schema = z.object({
    required: z.string().or(z.number()),
    optional: z.string().optional(),
  });
  type Schema = z.infer<typeof schema>;

  expectTypeOf<Schema>().toEqualTypeOf<{ required: string | number; optional?: string | undefined }>();

  expect(schema.parse({ required: "a" })).toEqual({ required: "a" });
  expect(schema.parse({ required: 1, optional: "b" })).toEqual({ required: 1, optional: "b" });
});

test("issue #2654: union with nullable inside z.object", () => {
  const schema = z.object({
    field: z.string().or(z.number()).nullable(),
  });
  type Field = z.infer<typeof schema>["field"];

  expectTypeOf<Field>().toEqualTypeOf<string | number | null>();

  expect(schema.parse({ field: null })).toEqual({ field: null });
  expect(schema.parse({ field: "a" })).toEqual({ field: "a" });
  expect(schema.parse({ field: 1 })).toEqual({ field: 1 });
});

test("issue #2654: union inside nested z.object", () => {
  const inner = z.object({
    tag: z.string().or(z.array(z.string())),
  });
  const outer = z.object({
    data: inner,
  });

  type Tag = z.infer<typeof outer>["data"]["tag"];
  expectTypeOf<Tag>().toEqualTypeOf<string | string[]>();

  expect(outer.parse({ data: { tag: "a" } })).toEqual({ data: { tag: "a" } });
  expect(outer.parse({ data: { tag: ["a", "b"] } })).toEqual({ data: { tag: ["a", "b"] } });
});
