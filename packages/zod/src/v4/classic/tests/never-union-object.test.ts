import { expect, test } from "vitest";
import * as z from "zod/v4";

// Regression test for https://github.com/colinhacks/zod/issues/5993

const choicesSchema = z.union([z.never(), z.array(z.never()), z.undefined()]);

// The exact discord.js scenario: choices field in an object
const optionSchema = z.object({
  name: z.string(),
  choices: choicesSchema,
});

test("z.never() union in object: accepts choices: undefined", () => {
  expect(optionSchema.safeParse({ name: "opt", choices: undefined }).success).toBe(true);
});

test("z.never() union in object: accepts choices: []", () => {
  expect(optionSchema.safeParse({ name: "opt", choices: [] }).success).toBe(true);
});

test("z.never() union in object: rejects choices: [{name:'x',value:'y'}]", () => {
  // This is the broken case reported in #5993
  const result = optionSchema.safeParse({ name: "opt", choices: [{ name: "x", value: "y" }] });
  expect(result.success).toBe(false);
});

test("z.never() union in object: accepts missing choices key (optional-in because z.undefined() is a member)", () => {
  // Because z.undefined() is one of the union options, the field should be optional-in
  // (a missing key is treated as undefined, which is valid)
  const result = optionSchema.safeParse({ name: "opt" });
  expect(result.success).toBe(true);
});

test("z.union with z.undefined() is optional-in at the schema level", () => {
  expect(choicesSchema._zod.optin).toBe("optional");
});

test("z.union without z.undefined() is NOT optional-in", () => {
  const required = z.union([z.string(), z.number()]);
  expect(required._zod.optin).toBeUndefined();
});
