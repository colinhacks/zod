// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

// @ts-ignore TS2304
const isDeno = typeof Deno === "object";

test("parse string to json", async () => {
  const Env = z.object({
    myJsonConfig: z.string().json(z.object({ foo: z.number() })),
    someOtherValue: z.string(),
  });

  expect(
    Env.parse({
      myJsonConfig: '{ "foo": 123 }',
      someOtherValue: "abc",
    })
  ).toEqual({
    myJsonConfig: { foo: 123 },
    someOtherValue: "abc",
  });

  const invalidValues = Env.safeParse({
    myJsonConfig: '{"foo": "not a number!"}',
    someOtherValue: null,
  });
  expect(JSON.parse(JSON.stringify(invalidValues))).toEqual({
    success: false,
    error: {
      name: "ZodError",
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "string",
          path: ["myJsonConfig", "foo"],
          message: "Expected number, received string",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "null",
          path: ["someOtherValue"],
          message: "Expected string, received null",
        },
      ],
    },
  });

  const invalidJsonSyntax = Env.safeParse({
    myJsonConfig: "This is not valid json",
    someOtherValue: null,
  });
  expect(JSON.parse(JSON.stringify(invalidJsonSyntax))).toEqual({
    success: false,
    error: {
      name: "ZodError",
      issues: [
        {
          code: "invalid_string",
          validation: "json",
          message: isDeno
            ? `Unexpected token 'T', "This is no"... is not valid JSON`
            : "Unexpected token T in JSON at position 0",
          path: ["myJsonConfig"],
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "null",
          path: ["someOtherValue"],
          message: "Expected string, received null",
        },
      ],
    },
  });
});
