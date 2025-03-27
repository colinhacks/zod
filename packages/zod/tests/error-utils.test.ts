import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
// type TestFlattenedErrors = core.inferFlattenedErrors<typeof Test, { message: string; code: number }>;
// type TestFormErrors = core.inferFlattenedErrors<typeof Test>;
const parsed = Test.safeParse({});

test("regular error", () => {
  expect(parsed).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "number",
            "message": "Invalid input: expected number, received undefined",
            "path": [
              "f1",
            ],
          },
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received undefined",
            "path": [
              "f3",
            ],
          },
          {
            "code": "invalid_type",
            "expected": "array",
            "message": "Invalid input: expected array, received undefined",
            "path": [
              "f4",
            ],
          },
        ],
      },
      "success": false,
    }
  `);
});

test(".flatten()", () => {
  const flattened = parsed.error!.flatten();
  expectTypeOf(flattened).toMatchTypeOf<{
    formErrors: string[];
    fieldErrors: {
      f2?: string[];
      f1?: string[];
      f3?: string[];
      f4?: string[];
    };
  }>();

  expect(flattened).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "f1": [
          "Invalid input: expected number, received undefined",
        ],
        "f3": [
          "Invalid input: expected string, received undefined",
        ],
        "f4": [
          "Invalid input: expected array, received undefined",
        ],
      },
      "formErrors": [],
    }
  `);
});

test("custom .flatten()", () => {
  type ErrorType = { message: string; code: number };
  const flattened = parsed.error!.flatten((iss) => ({ message: iss.message, code: 1234 }));
  expectTypeOf(flattened).toMatchTypeOf<{
    formErrors: ErrorType[];
    fieldErrors: {
      f2?: ErrorType[];
      f1?: ErrorType[];
      f3?: ErrorType[];
      f4?: ErrorType[];
    };
  }>();

  expect(flattened).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "f1": [
          {
            "code": 1234,
            "message": "Invalid input: expected number, received undefined",
          },
        ],
        "f3": [
          {
            "code": 1234,
            "message": "Invalid input: expected string, received undefined",
          },
        ],
        "f4": [
          {
            "code": 1234,
            "message": "Invalid input: expected array, received undefined",
          },
        ],
      },
      "formErrors": [],
    }
  `);
});

test(".format()", () => {
  const formatted = parsed.error!.format();
  expectTypeOf(formatted).toMatchTypeOf<{
    _errors: string[];
    f2?: { _errors: string[] };
    f1?: { _errors: string[] };
    f3?: { _errors: string[] };
    f4?: {
      [x: number]: {
        _errors: string[];
        t?: {
          _errors: string[];
        };
      };
      _errors: string[];
    };
  }>();

  expect(formatted).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "f1": {
        "_errors": [
          "Invalid input: expected number, received undefined",
        ],
      },
      "f3": {
        "_errors": [
          "Invalid input: expected string, received undefined",
        ],
      },
      "f4": {
        "_errors": [
          "Invalid input: expected array, received undefined",
        ],
      },
    }
  `);
});

test("custom .format()", () => {
  type ErrorType = { message: string; code: number };
  const formatted = parsed.error!.format((iss) => ({ message: iss.message, code: 1234 }));
  expectTypeOf(formatted).toMatchTypeOf<{
    _errors: ErrorType[];
    f2?: { _errors: ErrorType[] };
    f1?: { _errors: ErrorType[] };
    f3?: { _errors: ErrorType[] };
    f4?: {
      [x: number]: {
        _errors: ErrorType[];
        t?: {
          _errors: ErrorType[];
        };
      };
      _errors: ErrorType[];
    };
  }>();

  expect(formatted).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "f1": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected number, received undefined",
          },
        ],
      },
      "f3": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected string, received undefined",
          },
        ],
      },
      "f4": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected array, received undefined",
          },
        ],
      },
    }
  `);
});

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

  const r1 = schema.safeParse({
    a: "asdf",
    b: "qwer",
  });

  expect(z.flattenError(r1.error!)).toEqual({
    formErrors: ["Must be equal"],
    fieldErrors: {},
  });

  const r2 = schema.safeParse({
    a: null,
    b: null,
  });

  // const error = _error as z.ZodError;
  expect(z.flattenError(r2.error!)).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          "Invalid input: expected string, received null",
        ],
        "b": [
          "Invalid input: expected string, received null",
        ],
      },
      "formErrors": [],
    }
  `);

  expect(z.flattenError(r2.error!, (iss) => iss.message.toUpperCase())).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          "INVALID INPUT: EXPECTED STRING, RECEIVED NULL",
        ],
        "b": [
          "INVALID INPUT: EXPECTED STRING, RECEIVED NULL",
        ],
      },
      "formErrors": [],
    }
  `);
  // Test identity

  expect(z.flattenError(r2.error!, (i: z.ZodIssue) => i)).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received null",
            "path": [
              "a",
            ],
          },
        ],
        "b": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received null",
            "path": [
              "b",
            ],
          },
        ],
      },
      "formErrors": [],
    }
  `);

  // Test mapping
  const f1 = z.flattenError(r2.error!, (i: z.ZodIssue) => i.message.length);
  expect(f1).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          45,
        ],
        "b": [
          45,
        ],
      },
      "formErrors": [],
    }
  `);
  // expect(f1.fieldErrors.a![0]).toEqual("Invalid input: expected string".length);
  // expect(f1).toMatchObject({
  //   formErrors: [],
  //   fieldErrors: {
  //     a: ["Invalid input: expected string".length],
  //     b: ["Invalid input: expected string".length],
  //   },
  // });
});

const schema = z.object({
  username: z.string(),
  favoriteNumbers: z.array(
    z
      .number()
      .min(5)
      .refine(() => false, { error: "Boo" })
  ),
});
const result = schema.safeParse({
  username: 1234,
  favoriteNumbers: [true, 3],
});

test("z.treeifyError", () => {
  expect(z.treeifyError(result.error!)).toMatchInlineSnapshot(`
    {
      "errors": [],
      "fields": {
        "favoriteNumbers": {
          "errors": [],
          "items": [
            {
              "errors": [
                "Invalid input: expected number, received boolean",
              ],
            },
            {
              "errors": [
                "Too small: expected number to be >=5",
                "Boo",
              ],
            },
          ],
        },
        "username": {
          "errors": [
            "Invalid input: expected string, received number",
          ],
        },
      },
    }
  `);
});

test("z.prettyError", () => {
  expect(z.prettyError(result.error!)).toMatchInlineSnapshot(`
    "username
      ✖ Invalid input: expected string, received number
    favoriteNumbers[0]
      ✖ Invalid input: expected number, received boolean
    favoriteNumbers[1]
      ✖ Too small: expected number to be >=5
      ✖ Boo"
  `);
});
