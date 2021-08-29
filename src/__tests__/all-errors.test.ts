// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("all errors", () => {
  const propertySchema = z.string();
  const schema = z
    .object({
      a: propertySchema,
      b: propertySchema,
    })
    .refine(
      (val) => {
        return val.a === val.b;
      },
      { message: "Must be equal" }
    );

  try {
    schema.parse({
      a: "asdf",
      b: "qwer",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      expect(error.flatten()).toEqual({
        formErrors: ["Must be equal"],
        fieldErrors: {},
      });
    }
  }

  try {
    schema.parse({
      a: null,
      b: null,
    });
  } catch (_error) {
    const error = _error as z.ZodError;
    expect(error.flatten()).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ["Expected string, received null"],
        b: ["Expected string, received null"],
      },
    });

    expect(error.flatten((iss) => iss.message.toUpperCase())).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ["EXPECTED STRING, RECEIVED NULL"],
        b: ["EXPECTED STRING, RECEIVED NULL"],
      },
    });
    // Test identity

    expect(error.flatten((i: z.ZodIssue) => i)).toEqual({
      formErrors: [],
      fieldErrors: {
        a: [
          {
            code: "invalid_type",
            expected: "string",
            message: "Expected string, received null",
            path: ["a"],
            received: "null",
          },
        ],
        b: [
          {
            code: "invalid_type",
            expected: "string",
            message: "Expected string, received null",
            path: ["b"],
            received: "null",
          },
        ],
      },
    });
    // Test mapping
    expect(error.flatten((i: z.ZodIssue) => i.message.length)).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ["Expected string, received null".length],
        b: ["Expected string, received null".length],
      },
    });
  }
});
