import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";
import * as util from "zod-core/util";

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
type TestFlattenedErrors = z.inferFlattenedErrors<typeof Test, { message: string; code: number }>;
type TestFormErrors = z.inferFlattenedErrors<typeof Test>;

test("default flattened errors type inference", () => {
  type TestTypeErrors = {
    formErrors: string[];
    fieldErrors: { [P in keyof z.TypeOf<typeof Test>]?: string[] | undefined };
  };

  util.assertEqual<z.inferFlattenedErrors<typeof Test>, TestTypeErrors>(true);
  util.assertEqual<z.inferFlattenedErrors<typeof Test, { message: string }>, TestTypeErrors>(false);
});

test("custom flattened errors type inference", () => {
  type ErrorType = { message: string; code: number };
  type TestTypeErrors = {
    formErrors: ErrorType[];
    fieldErrors: {
      [P in keyof z.TypeOf<typeof Test>]?: ErrorType[] | undefined;
    };
  };

  util.assertEqual<z.inferFlattenedErrors<typeof Test>, TestTypeErrors>(false);
  util.assertEqual<z.inferFlattenedErrors<typeof Test, { message: string; code: number }>, TestTypeErrors>(true);
  util.assertEqual<z.inferFlattenedErrors<typeof Test, { message: string }>, TestTypeErrors>(false);
});

test("form errors type inference", () => {
  type TestTypeErrors = {
    formErrors: string[];
    fieldErrors: { [P in keyof z.TypeOf<typeof Test>]?: string[] | undefined };
  };

  util.assertEqual<z.inferFlattenedErrors<typeof Test>, TestTypeErrors>(true);
});

test(".flatten() type assertion", () => {
  const parsed = Test.safeParse({}).error!;
  const flattened = z.flatten(parsed);
  expect(flattened).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "f1": [
          "Invalid input: expected number",
        ],
        "f3": [
          "Invalid input: expected string",
        ],
        "f4": [
          "Invalid input: expected array",
        ],
      },
      "formErrors": [],
    }
  `);

  expectTypeOf(flattened).toEqualTypeOf<TestFlattenedErrors>();
  // expectTypeOf(parsed).toEqualTypeOf
  //   const validFlattenedErrors: TestFlattenedErrors = z.flatten(parsed.error).flatten(() => ({ message: "", code: 0 }));
  //   // @ts-expect-error should fail assertion between `TestFlattenedErrors` and unmapped `flatten()`.
  //   const invalidFlattenedErrors: TestFlattenedErrors = parsed.error.flatten();
  //   const validFormErrors: TestFormErrors = parsed.error.flatten();
  //   // @ts-expect-error should fail assertion between `TestFormErrors` and mapped `flatten()`.
  //   const invalidFormErrors: TestFormErrors = parsed.error.flatten(() => ({
  //     message: "string",
  //     code: 0,
  //   }));

  //   [validFlattenedErrors, invalidFlattenedErrors, validFormErrors, invalidFormErrors];
});

test(".formErrors type assertion", () => {
  const parsed = Test.safeParse({}).error!;
  const formatted = z.format(parsed);
  expect(formatted).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "f1": {
        "_errors": [
          "Invalid input: expected number",
        ],
      },
      "f3": {
        "_errors": [
          "Invalid input: expected string",
        ],
      },
      "f4": {
        "_errors": [
          "Invalid input: expected array",
        ],
      },
    }
  `);
  // const parsed = Test.safeParse({}) as z.SafeParseError<void>;
  // const validFormErrors: TestFormErrors = parsed.error.formErrors;
  // // @ts-expect-error should fail assertion between `TestFlattenedErrors` and `.formErrors`.
  // const invalidFlattenedErrors: TestFlattenedErrors = parsed.error.formErrors;

  // [validFormErrors, invalidFlattenedErrors];
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

  expect(z.flatten(r1.error!)).toEqual({
    formErrors: ["Must be equal"],
    fieldErrors: {},
  });

  const r2 = schema.safeParse({
    a: null,
    b: null,
  });

  // const error = _error as z.ZodError;
  expect(z.flatten(r2.error!)).toEqual({
    formErrors: [],
    fieldErrors: {
      a: ["Invalid input: expected string"],
      b: ["Invalid input: expected string"],
    },
  });

  expect(z.flatten(r2.error!, (iss) => iss.message.toUpperCase())).toEqual({
    formErrors: [],
    fieldErrors: {
      a: ["INVALID INPUT: EXPECTED STRING"],
      b: ["INVALID INPUT: EXPECTED STRING"],
    },
  });
  // Test identity

  expect(z.flatten(r2.error!, (i: z.ZodIssue) => i)).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string",
            "path": [
              "a",
            ],
          },
        ],
        "b": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string",
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
  const f1 = z.flatten(r2.error!, (i: z.ZodIssue) => i.message.length);
  expect(f1.fieldErrors.a![0]).toEqual("Invalid input: expected string".length);
  expect(f1).toMatchObject({
    formErrors: [],
    fieldErrors: {
      a: ["Invalid input: expected string".length],
      b: ["Invalid input: expected string".length],
    },
  });
});
