// @ts-ignore TS6133
import { expect, test } from "vitest";
import * as z from "zod/v3";
import { util } from "../helpers/util.js";

// Regression tests for issue #2654
// https://github.com/colinhacks/zod/issues/2654
//
// Union types inside z.object() must infer the same type as standalone unions.
// The original v3 bug caused `addQuestionMarks` to produce spurious
// `& (T | undefined)` intersections due to distributive conditional types.

test("issue #2654: string | string[] union inside z.object", () => {
  // Original repro from the issue
  const EventNameSchema = z.string().or(z.array(z.string()));
  type EventName = z.infer<typeof EventNameSchema>;

  const EventSchema = z.object({
    name: z.string().or(z.array(z.string())),
  });
  type EventName2 = z.infer<typeof EventSchema>["name"];

  // Must be exactly `string | string[]`, not the buggy
  // `(string | string[]) & (string | string[] | undefined)`
  util.assertEqual<EventName, EventName2>(true);

  // Must not include undefined
  util.assertEqual<undefined extends EventName2 ? true : false, false>(true);

  expect(EventSchema.parse({ name: "x" })).toEqual({ name: "x" });
  expect(EventSchema.parse({ name: ["x", "y"] })).toEqual({ name: ["x", "y"] });
});

test("issue #2654: array | record union inside z.object", () => {
  // Variation reported in the issue thread by @szulcus
  const standalone = z.string().array().or(z.record(z.string()));
  type Standalone = z.infer<typeof standalone>;

  const schema = z.object({
    values: z.string().array().or(z.record(z.string())),
  });
  type InObject = z.infer<typeof schema>["values"];

  util.assertEqual<Standalone, InObject>(true);
  util.assertEqual<undefined extends InObject ? true : false, false>(true);

  expect(schema.parse({ values: ["a"] })).toEqual({ values: ["a"] });
  expect(schema.parse({ values: { k: "v" } })).toEqual({ values: { k: "v" } });
});

test("issue #2654: enum | record union inside z.object", () => {
  // Variation reported by @AlexGalays
  const role = z.enum(["Administrator", "Writer", "Readonly"]);
  const rolesPerLocale = z.record(role.optional());
  const repositoryRole = role.or(rolesPerLocale);

  type StandaloneRole = z.infer<typeof repositoryRole>;

  const schema = z.object({
    role: role.or(rolesPerLocale),
  });
  type InObjectRole = z.infer<typeof schema>["role"];

  util.assertEqual<StandaloneRole, InObjectRole>(true);
  util.assertEqual<undefined extends InObjectRole ? true : false, false>(true);

  expect(schema.parse({ role: "Administrator" })).toEqual({ role: "Administrator" });
  expect(schema.parse({ role: { en: "Writer" } })).toEqual({ role: { en: "Writer" } });
});

test("issue #2654: mixed required and optional keys with union", () => {
  // Ensure the fix doesn't break genuinely optional properties
  const schema = z.object({
    required: z.string().or(z.number()),
    optional: z.string().optional(),
  });
  type Schema = z.infer<typeof schema>;

  util.assertEqual<Schema, { required: string | number; optional?: string | undefined }>(true);

  // required field must not include undefined
  type RequiredField = Schema["required"];
  util.assertEqual<undefined extends RequiredField ? true : false, false>(true);

  expect(schema.parse({ required: "a" })).toEqual({ required: "a" });
  expect(schema.parse({ required: 1 })).toEqual({ required: 1 });
  expect(schema.parse({ required: "a", optional: "b" })).toEqual({ required: "a", optional: "b" });
});
