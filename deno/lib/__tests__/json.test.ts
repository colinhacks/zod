// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

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

  await expect(
    Env.parseAsync({
      myJsonConfig: '{"foo": "not a number!"}',
      someOtherValue: null,
    })
  ).rejects.toMatchObject({
    issues: [
      {
        code: "invalid_type",
        expected: "string",
        received: "null",
        path: ["someOtherValue"],
        message: "Expected string, received null",
      },
      {
        code: "invalid_type",
        expected: "number",
        received: "string",
        path: ["myJsonConfig", "foo"],
        message: "Expected number, received string",
      },
    ],
  });

  await expect(
    Env.parseAsync({
      myJsonConfig: "This is not valid json",
      someOtherValue: null,
    })
  ).rejects.toMatchObject({
    issues: [
      {
        code: "invalid_type",
        expected: "string",
        received: "null",
        path: ["someOtherValue"],
        message: "Expected string, received null",
      },
      {
        code: "invalid_string",
        validation: "json",
        message: "Unexpected token T in JSON at position 0",
        path: ["myJsonConfig"],
      },
    ],
  });
});
