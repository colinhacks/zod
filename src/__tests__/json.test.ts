// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("parse string to json", () => {
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

  expect(() =>
    Env.parse({
      myJsonConfig: '{"foo": "not a number!"}',
      someOtherValue: null,
    })
  ).toThrow(
    JSON.stringify(
      [
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
      null,
      2
    )
  );

  expect(() =>
    Env.parse({
      myJsonConfig: "This is not valid json",
      someOtherValue: null,
    })
  ).toThrow(
    JSON.stringify(
      [
        {
          code: "invalid_string",
          validation: "json",
          message: "Unexpected token T in JSON at position 0",
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
      null,
      2
    )
  );
});
