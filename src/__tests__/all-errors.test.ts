// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("all errors", () => {
  const propertySchema = z.string();
  const schema = z.object({
    a: propertySchema,
    b: propertySchema,
  });

  try {
    schema.parse({
      a: null,
      b: null,
    });
  } catch (error) {
    expect(error.flatten()).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ["Expected string, received null"],
        b: ["Expected string, received null"],
      },
    });
    // Test identity
    expect(error.flatMap((i: z.ZodIssue) => i)).toEqual({
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
    expect(error.flatMap((i: z.ZodIssue) => i.message.length)).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ["Expected string, received null".length],
        b: ["Expected string, received null".length],
      },
    });
  }
});
