import { inspect, types } from "node:util";
import { afterEach, expect, test, vi } from "vitest";
import * as z from "zod/v4";

// Several tests install a global error map. Resetting on the last line of each leaks it into every later test in the file whenever an assertion above that line fails, which turns one real failure into a cascade.
afterEach(() => {
  z.config({ customError: undefined });
});

function getThrownError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected function to throw");
}

async function getRejectedError(fn: () => Promise<unknown>): Promise<unknown> {
  try {
    await fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected function to reject");
}

function expectFirstStackFrameAtCallsite(error: unknown): void {
  expect(error).toBeInstanceOf(Error);
  const stack = (error as Error).stack;
  expect(stack).toEqual(expect.any(String));

  const firstFrame = stack!.split("\n").find((line) => line.trim().startsWith("at "));
  expect(firstFrame).toBeDefined();
  expect(firstFrame).toContain("error.test.ts");
  expect(firstFrame).not.toContain("core/parse.ts");
  expect(firstFrame).not.toContain("classic/schemas.ts");
}

test("error creation", () => {
  const err1 = new z.ZodError([]);

  err1.issues.push({
    code: "invalid_type",
    expected: "object",
    path: [],
    message: "",
    input: "adf",
  });
  err1.isEmpty;

  const err2 = new z.ZodError(err1.issues);
  const err3 = new z.ZodError([]);
  err3.addIssues(err1.issues);
  err3.addIssue(err1.issues[0]);
  err1.message;
  err2.message;
  err3.message;
});

test("do not allow error and message together", () => {
  expect(() =>
    z.string().refine((_) => true, {
      message: "override",
      error: (iss) => (iss.input === undefined ? "asdf" : null),
    })
  ).toThrow();
});

const errorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type") {
    if (issue.expected === "string") {
      return { message: "bad type!" };
    }
  }
  if (issue.code === "custom") {
    return { message: `less-than-${issue.params?.minimum}` };
  }
  return undefined;
};

test("type error with custom error map", () => {
  const result = z.string().safeParse(234, { error: errorMap });
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [],
        "message": "bad type!"
      }
    ]]
  `);
});

test("refinement fail with params", () => {
  const result = z
    .number()
    .refine((val) => val >= 3, {
      params: { minimum: 3 },
    })
    .safeParse(2, { error: errorMap });
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "params": {
          "minimum": 3
        },
        "message": "less-than-3"
      }
    ]]
  `);
});

test("hard coded error  with custom errormap", () => {
  const result = z
    .string()
    .refine((val) => val.length > 12, {
      params: { minimum: 13 },
      message: "override",
    })
    .safeParse("asdf", { error: () => "contextual" });

  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "params": {
          "minimum": 13
        },
        "message": "override"
      }
    ]]
  `);
});

test("default error message", () => {
  const result = z
    .number()
    .refine((x) => x > 3)
    .safeParse(2);

  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "Invalid input"
      }
    ]]
  `);
});

test("override error in refine", () => {
  const result = z
    .number()
    .refine((x) => x > 3, "override")
    .safeParse(2);
  expect(result.success).toBe(false);
  expect(result.error!.issues.length).toEqual(1);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "override"
      }
    ]]
  `);
});

test("override error in refinement", () => {
  const result = z
    .number()
    .refine((x) => x > 3, {
      message: "override",
    })
    .safeParse(2);
  expect(result.success).toBe(false);
  expect(result.error!.issues.length).toEqual(1);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "override"
      }
    ]]
  `);
});

test("array minimum", () => {
  let result = z.array(z.string()).min(3, "tooshort").safeParse(["asdf", "qwer"]);
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].code).toEqual("too_small");
  expect(result.error!.issues[0].message).toEqual("tooshort");

  result = z.array(z.string()).min(3).safeParse(["asdf", "qwer"]);
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].code).toEqual("too_small");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "array",
        "code": "too_small",
        "minimum": 3,
        "inclusive": true,
        "path": [],
        "message": "Too small: expected array to have >=3 items"
      }
    ]]
  `);
});

test("literal bigint default error message", () => {
  const result = z.literal(BigInt(12)).safeParse(BigInt(13));
  expect(result.success).toBe(false);
  expect(result.error!.issues.length).toEqual(1);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "invalid_value",
        "values": [
          "12"
        ],
        "path": [],
        "message": "Invalid input: expected 12n"
      }
    ]]
  `);
});

test("custom path in custom error map", () => {
  const schema = z.object({
    items: z.array(z.string()).refine((data) => data.length > 3, {
      path: ["items-too-few"],
    }),
  });

  const errorMap: z.ZodErrorMap = (issue) => {
    expect((issue.path ?? []).length).toBe(2);
    return { message: "doesnt matter" };
  };
  const result = schema.safeParse({ items: ["first"] }, { error: errorMap });
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [
          "items",
          "items-too-few"
        ],
        "message": "doesnt matter"
      }
    ]]
  `);
});

// test("error metadata from value", () => {
//   const dynamicRefine = z.string().refine(
//     (val) => val === val.toUpperCase(),
//     (val) => ({ params: { val } })
//   );

//   const result = dynamicRefine.safeParse("asdf");
//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const sub = result.error.issues[0];
//     expect(result.error.issues[0].code).toEqual("custom");
//     if (sub.code === "custom") {
//       expect(sub.params?.val).toEqual("asdf");
//     }
//   }
// });

// test("don't call refine after validation failed", () => {
//   const asdf = z
//     .union([
//       z.number(),
//       z.string().transform(z.number(), (val) => {
//         return parseFloat(val);
//       }),
//     ])
//     .refine((v) => v >= 1);

//   expect(() => asdf.safeParse("foo")).not.toThrow();
// });

test("root level formatting", () => {
  const schema = z.string().email();
  const result = schema.safeParse("asdfsdf");
  expect(result.success).toBe(false);

  expect(result.error!.format()).toMatchInlineSnapshot(`
    {
      "_errors": [
        "Invalid email address",
      ],
    }
  `);
});

test("custom path", () => {
  const schema = z
    .object({
      password: z.string(),
      confirm: z.string(),
    })
    .refine((val) => val.confirm === val.password, { path: ["confirm"] });

  const result = schema.safeParse({
    password: "peanuts",
    confirm: "qeanuts",
  });

  expect(result.success).toBe(false);
  const error = result.error!.format();
  expect(error._errors).toEqual([]);
  expect(error.password?._errors).toEqual(undefined);
  expect(error.confirm?._errors).toEqual(["Invalid input"]);
});

test("custom path", () => {
  const schema = z
    .object({
      password: z.string().min(6),
      confirm: z.string().min(6),
    })
    .refine((val) => val.confirm === val.password);

  const result = schema.safeParse({
    password: "qwer",
    confirm: "asdf",
  });

  expect(result.success).toBe(false);
  expect(result.error!.issues.length).toEqual(3);
});

const schema = z.object({
  inner: z.object({
    name: z
      .string()
      .refine((val) => val.length > 5)
      .array()
      .refine((val) => val.length <= 1),
  }),
});

test("no abort early on refinements", () => {
  const invalidItem = {
    inner: { name: ["aasd", "asdfasdfasfd"] },
  };

  const result1 = schema.safeParse(invalidItem);
  expect(result1.success).toBe(false);
  expect(result1.error!.issues.length).toEqual(2);
});

test("detect issue with input fallback", () => {
  const schema = z
    .string()
    .transform((val) => val.length)
    .refine(() => false, { message: "always fails" })
    .refine(
      (val) => {
        if (typeof val !== "number") throw new Error();
        return (val ^ 2) > 10;
      } // should be number but it's a string
    );
  expect(() => schema.parse("hello")).toThrow(z.ZodError);
});

test("formatting", () => {
  const invalidItem = {
    inner: { name: ["aasd", "asdfasdfasfd"] },
  };
  const invalidArray = {
    inner: { name: ["asdfasdf", "asdfasdfasfd"] },
  };
  const result1 = schema.safeParse(invalidItem);
  const result2 = schema.safeParse(invalidArray);

  expect(result1.success).toBe(false);
  expect(result2.success).toBe(false);
  const error1 = result1.error!.format();
  expect(error1._errors).toEqual([]);
  expect(error1.inner?._errors).toEqual([]);
  expect(error1.inner?.name?.[1]).toEqual(undefined);

  type FormattedError = z.inferFormattedError<typeof schema>;
  const error2: FormattedError = result2.error!.format();
  expect(error2._errors).toEqual([]);
  expect(error2.inner?._errors).toEqual([]);
  expect(error2.inner?.name?._errors).toEqual(["Invalid input"]);
  expect(error2.inner?.name?.[0]).toEqual(undefined);
  expect(error2.inner?.name?.[1]).toEqual(undefined);
  expect(error2.inner?.name?.[2]).toEqual(undefined);

  // test custom mapper
  type FormattedErrorWithNumber = z.inferFormattedError<typeof schema, number>;
  const errorWithNumber: FormattedErrorWithNumber = result2.error!.format(() => 5);
  expect(errorWithNumber._errors).toEqual([]);
  expect(errorWithNumber.inner?._errors).toEqual([]);
  expect(errorWithNumber.inner?.name?._errors).toEqual([5]);
});

test("formatting with nullable and optional fields", () => {
  const nameSchema = z.string().refine((val) => val.length > 5);
  const schema = z.object({
    nullableObject: z.object({ name: nameSchema }).nullable(),
    nullableArray: z.array(nameSchema).nullable(),
    nullableTuple: z.tuple([nameSchema, nameSchema, z.number()]).nullable(),
    optionalObject: z.object({ name: nameSchema }).optional(),
    optionalArray: z.array(nameSchema).optional(),
    optionalTuple: z.tuple([nameSchema, nameSchema, z.number()]).optional(),
  });
  const invalidItem = {
    nullableObject: { name: "abcd" },
    nullableArray: ["abcd"],
    nullableTuple: ["abcd", "abcd", 1],
    optionalObject: { name: "abcd" },
    optionalArray: ["abcd"],
    optionalTuple: ["abcd", "abcd", 1],
  };
  const result = schema.safeParse(invalidItem);
  expect(result.success).toBe(false);
  const error: z.inferFormattedError<typeof schema> = result.error!.format();
  expect(error._errors).toEqual([]);
  expect(error.nullableObject?._errors).toEqual([]);
  expect(error.nullableObject?.name?._errors).toEqual(["Invalid input"]);
  expect(error.nullableArray?._errors).toEqual([]);
  expect(error.nullableArray?.[0]?._errors).toEqual(["Invalid input"]);
  expect(error.nullableTuple?._errors).toEqual([]);
  expect(error.nullableTuple?.[0]?._errors).toEqual(["Invalid input"]);
  expect(error.nullableTuple?.[1]?._errors).toEqual(["Invalid input"]);
  expect(error.optionalObject?._errors).toEqual([]);
  expect(error.optionalObject?.name?._errors).toEqual(["Invalid input"]);
  expect(error.optionalArray?._errors).toEqual([]);
  expect(error.optionalArray?.[0]?._errors).toEqual(["Invalid input"]);
  expect(error.optionalTuple?._errors).toEqual([]);
  expect(error.optionalTuple?.[0]?._errors).toEqual(["Invalid input"]);
  expect(error.optionalTuple?.[1]?._errors).toEqual(["Invalid input"]);

  expect(error).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "nullableArray": {
        "0": {
          "_errors": [
            "Invalid input",
          ],
        },
        "_errors": [],
      },
      "nullableObject": {
        "_errors": [],
        "name": {
          "_errors": [
            "Invalid input",
          ],
        },
      },
      "nullableTuple": {
        "0": {
          "_errors": [
            "Invalid input",
          ],
        },
        "1": {
          "_errors": [
            "Invalid input",
          ],
        },
        "_errors": [],
      },
      "optionalArray": {
        "0": {
          "_errors": [
            "Invalid input",
          ],
        },
        "_errors": [],
      },
      "optionalObject": {
        "_errors": [],
        "name": {
          "_errors": [
            "Invalid input",
          ],
        },
      },
      "optionalTuple": {
        "0": {
          "_errors": [
            "Invalid input",
          ],
        },
        "1": {
          "_errors": [
            "Invalid input",
          ],
        },
        "_errors": [],
      },
    }
  `);
});

test("inferFlattenedErrors", () => {
  const schemaWithTransform = z.object({ foo: z.string() }).transform((o) => ({ bar: o.foo }));

  const result = schemaWithTransform.safeParse({});

  expect(result.success).toBe(false);
  type ValidationErrors = z.inferFlattenedErrors<typeof schemaWithTransform>;
  const error: ValidationErrors = result.error!.flatten();
  expect(error).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "foo": [
          "Invalid input: expected string, received undefined",
        ],
      },
      "formErrors": [],
    }
  `);
});

const stringWithCustomError = z.string({
  error: () => "bound",
});

test("schema-bound error map", () => {
  const result = stringWithCustomError.safeParse(1234);
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("bound");
});

test("bound error map overrides contextual", () => {
  // support contextual override
  const result = stringWithCustomError.safeParse(undefined, {
    error: () => ({ message: "override" }),
  });
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("bound");
});

test("z.config customError ", () => {
  // support overrideErrorMap

  z.config({ customError: () => ({ message: "override" }) });
  const result = z.string().min(10).safeParse("tooshort");
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "too_small",
        "minimum": 10,
        "inclusive": true,
        "path": [],
        "message": "override"
      }
    ]]
  `);
  expect(result.error!.issues[0].message).toEqual("override");
});

test("bound error map covers issues raised by its own checks", () => {
  const result = stringWithCustomError.min(10).safeParse("tooshort");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("bound");
});

test("a check's own error map beats the schema's", () => {
  const result = stringWithCustomError.min(10, { error: () => "check" }).safeParse("tooshort");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("check");
});

test("the schema's error map beats contextual and global for a check issue", () => {
  z.config({ customError: () => "global" });
  const result = stringWithCustomError.min(10).safeParse("tooshort", { error: () => "contextual" });
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("bound");
});

test("a schema map returning undefined defers to the next rung, and runs once", () => {
  let calls = 0;
  const deferring = z.string({
    error: () => {
      calls++;
      return undefined;
    },
  });
  z.config({ customError: () => "global" });
  const result = deferring.min(10).safeParse("tooshort");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("global");
  expect(calls).toEqual(1);
});

// test("invalid and required", () => {
//   const str = z.string({
//     invalid_type_error: "Invalid name",
//     required_error: "Name is required",
//   });
//   const result1 = str.safeParse(1234);
//   expect(result1.success).toBe(false);
//   if (!result1.success) {
//     expect(result1.error.issues[0].message).toEqual("Invalid name");
//   }
//   const result2 = str.safeParse(undefined);
//   expect(result2.success).toBe(false);
//   if (!result2.success) {
//     expect(result2.error.issues[0].message).toEqual("Name is required");
//   }
// });

// test("Fallback to default required error", () => {
//   const str = z.string({
//     invalid_type_error: "Invalid name",
//     // required_error: "Name is required",
//   });

//   const result2 = str.safeParse(undefined);
//   expect(result2.success).toBe(false);
//   if (!result2.success) {
//     expect(result2.error.issues[0].message).toEqual("Required");
//   }
// });

// test("invalid and required and errorMap", () => {
//   expect(() => {
//     return z.string({
//       invalid_type_error: "Invalid name",
//       required_error: "Name is required",
//       errorMap: () => ({ message: "override" }),
//     });
//   }).toThrow();
// });

// test("strict error message", () => {
//   const errorMsg = "Invalid object";
//   const obj = z.object({ x: z.string() }).strict(errorMsg);
//   const result = obj.safeParse({ x: "a", y: "b" });
//   expect(result.success).toBe(false);
//   if (!result.success) {
//     expect(result.error.issues[0].message).toEqual(errorMsg);
//   }
// });

test("empty string error message", () => {
  const schema = z.string().max(1, { message: "" });
  const result = schema.safeParse("asdf");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toEqual("");
});

test("dont short circuit on continuable errors", () => {
  const user = z
    .object({
      password: z.string().min(6),
      confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Passwords don't match",
      path: ["confirm"],
    });
  const result = user.safeParse({ password: "asdf", confirm: "qwer" });
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "too_small",
        "minimum": 6,
        "inclusive": true,
        "path": [
          "password"
        ],
        "message": "Too small: expected string to have >=6 characters"
      },
      {
        "code": "custom",
        "path": [
          "confirm"
        ],
        "message": "Passwords don't match"
      }
    ]]
  `);
  // expect(result.error!.issues.length).toEqual(2);
});

test("string error params", () => {
  const a = z.string("Bad!");
  expect(a.safeParse(123).error!.issues[0].message).toBe("Bad!");

  const b = z.string().min(5, "Too short!");
  expect(b.safeParse("abc").error!.issues[0].message).toBe("Too short!");

  const c = z.uuid("Bad UUID!");
  expect(c.safeParse("not-a-uuid").error!.issues[0].message).toBe("Bad UUID!");

  const d = z.string().datetime({ message: "Bad date!" });
  expect(d.safeParse("not-a-date").error!.issues[0].message).toBe("Bad date!");

  const e = z.array(z.string(), "Bad array!");
  expect(e.safeParse("not-an-array").error!.issues[0].message).toBe("Bad array!");

  const f = z.array(z.string()).min(5, "Too few items!");
  expect(f.safeParse(["a", "b"]).error!.issues[0].message).toBe("Too few items!");

  const g = z.set(z.string(), "Bad set!");
  expect(g.safeParse("not-a-set").error!.issues[0].message).toBe("Bad set!");

  const h = z.array(z.string(), "Bad array!");
  expect(h.safeParse(123).error!.issues[0].message).toBe("Bad array!");

  const i = z.set(z.string(), "Bad set!");
  expect(i.safeParse(123).error!.issues[0].message).toBe("Bad set!");

  const j = z.array(z.string(), "Bad array!");
  expect(j.safeParse(null).error!.issues[0].message).toBe("Bad array!");
});

test("error inheritance", () => {
  const e1 = z.string().safeParse(123).error!;
  expect(e1).toBeInstanceOf(z.core.$ZodError);
  expect(e1).toBeInstanceOf(z.ZodError);
  expect(e1).toBeInstanceOf(z.ZodRealError);
  expect(e1).toBeInstanceOf(Error);

  try {
    z.string().parse(123);
  } catch (e2) {
    expect(e1).toBeInstanceOf(z.core.$ZodError);
    expect(e2).toBeInstanceOf(z.ZodError);
    expect(e2).toBeInstanceOf(z.ZodRealError);
    expect(e2).toBeInstanceOf(Error);
  }
});

test("parse errors capture the caller stack frame", async () => {
  const schema = z.string();
  const parse = schema.parse;
  const parseAsync = schema.parseAsync;

  expectFirstStackFrameAtCallsite(getThrownError(() => schema.parse(123)));
  expectFirstStackFrameAtCallsite(getThrownError(() => parse(123)));
  expectFirstStackFrameAtCallsite(getThrownError(() => z.parse(schema, 123)));

  expectFirstStackFrameAtCallsite(await getRejectedError(() => schema.parseAsync(123)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => parseAsync(123)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => z.parseAsync(schema, 123)));
});

test("codec errors capture the caller stack frame", async () => {
  const schema = z.string();
  const encode = schema.encode;
  const decode = schema.decode;
  const encodeAsync = schema.encodeAsync;
  const decodeAsync = schema.decodeAsync;

  expectFirstStackFrameAtCallsite(getThrownError(() => schema.encode(123 as any)));
  expectFirstStackFrameAtCallsite(getThrownError(() => encode(123 as any)));
  expectFirstStackFrameAtCallsite(getThrownError(() => z.encode(schema, 123 as any)));

  expectFirstStackFrameAtCallsite(getThrownError(() => schema.decode(123 as any)));
  expectFirstStackFrameAtCallsite(getThrownError(() => decode(123 as any)));
  expectFirstStackFrameAtCallsite(getThrownError(() => z.decode(schema, 123 as any)));

  expectFirstStackFrameAtCallsite(await getRejectedError(() => schema.encodeAsync(123 as any)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => encodeAsync(123 as any)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => z.encodeAsync(schema, 123 as any)));

  expectFirstStackFrameAtCallsite(await getRejectedError(() => schema.decodeAsync(123 as any)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => decodeAsync(123 as any)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => z.decodeAsync(schema, 123 as any)));
});

test("async errors that fail after suspending capture the caller stack frame", async () => {
  // `Error.captureStackTrace` is skip-until-seen: when it cannot find its callee it discards every frame, not just the ones above. An async wrapper that returns its inner promise without awaiting has already left the async chain by the time the rejection is built, so its callee is unfindable and the stack comes back empty. Only a schema that actually suspends reaches that path — the sync cases above run straight through to their first await and pass either way.
  const refined = z.string().refine(async () => false, "nope");
  const codec = z.codec(z.string(), z.number(), {
    decode: async (value) => value as never,
    encode: async (value) => value as never,
  });

  expectFirstStackFrameAtCallsite(await getRejectedError(() => refined.parseAsync("x")));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => codec.decodeAsync("x")));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => z.decodeAsync(codec, "x")));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => codec.encodeAsync(5)));
  expectFirstStackFrameAtCallsite(await getRejectedError(() => z.encodeAsync(codec, 5)));
});

test("error serialization", () => {
  try {
    z.string().parse(123);
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [],
          "message": "Invalid input: expected string, received number"
        }
      ]]
    `);
    expect(inspect(e).split("\n").slice(0, 8).join("\n")).toMatchInlineSnapshot(`
      "ZodError: [
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [],
          "message": "Invalid input: expected string, received number"
        }
      ]"
    `);
  }
});

test("message is lazy but stays own and enumerable", () => {
  const err = z.object({ a: z.string() }).safeParse({ a: 1 }).error!;

  expect(Object.keys(err)).toEqual(["name", "message"]);
  expect(Object.keys({ ...err })).toEqual(["name", "message"]);
  expect(JSON.parse(JSON.stringify(err)).message).toEqual(err.message);
  expect(Object.getOwnPropertyDescriptor(err, "message")!.enumerable).toBe(true);
  expect(Object.getOwnPropertyDescriptor(err, "issues")!.enumerable).toBe(false);

  // computed once, then stable against later mutation of `.issues`
  const computed = err.message;
  err.issues.push({ code: "custom", message: "later", path: [], input: undefined });
  expect(err.message).toEqual(computed);

  // assignment wins over the computed value, and `toString` follows it
  err.message = "overwritten";
  expect(err.message).toEqual("overwritten");
  expect(err.toString()).toEqual("overwritten");

  // a second error computes its own message
  expect(z.string().safeParse(1).error!.message).not.toEqual(computed);
});

test("error helpers survive detaching", () => {
  const err = z.object({ a: z.string() }).safeParse({ a: 1 }).error!;
  const { format, flatten } = err;
  const stringify = err.toString;

  expect(format().a?._errors).toEqual(["Invalid input: expected string, received number"]);
  expect(flatten().fieldErrors.a).toEqual(["Invalid input: expected string, received number"]);
  expect(stringify()).toEqual(err.message);
  expect(err.isEmpty).toBe(false);
  expect(new z.ZodError([]).isEmpty).toBe(true);

  // addIssue refreshes a message that was already materialized
  const empty = new z.ZodError([]);
  expect(empty.message).toEqual("[]");
  empty.addIssue({ code: "custom", message: "added", path: [], input: undefined });
  expect(empty.message).toContain("added");
});

test("an error is a real Error, minus the captured frames", () => {
  const err = z.string().safeParse(123).error!;

  // suppressing the capture, not skipping the constructor, keeps every brand check working
  expect(err).toBeInstanceOf(Error);
  expect(types.isNativeError(err)).toBe(true);
  expect(Object.prototype.toString.call(err)).toBe("[object Error]");
  expect(structuredClone(err)).toBeInstanceOf(Error);

  // only a returned error loses its frames; the throwing paths restore them
  expect(err.stack!.startsWith("ZodError: [")).toBe(true);
  expect(err.stack!).toContain("invalid_type");
  expect(err.stack!.split("\n").some((line) => line.trim().startsWith("at "))).toBe(false);

  // the borrowed global is given back unchanged, including a caller's own value
  const ambient = Error.stackTraceLimit;
  z.string().safeParse(123);
  expect(Error.stackTraceLimit).toBe(ambient);
  Error.stackTraceLimit = ambient + 3;
  try {
    z.string().safeParse(123);
    expect(Error.stackTraceLimit).toBe(ambient + 3);
  } finally {
    Error.stackTraceLimit = ambient;
  }
});

test("an engine without captureStackTrace keeps the frames on a thrown error", async () => {
  // suppressing the capture is only safe where `parse()` can put the frames back; Safari 11.1 through 17.1 has `stackTraceLimit` but not `captureStackTrace`, and suppressing there would strip the throw's stack
  const desc = Object.getOwnPropertyDescriptor(Error, "captureStackTrace")!;
  vi.resetModules();
  delete (Error as { captureStackTrace?: unknown }).captureStackTrace;

  let thrown: unknown;
  try {
    const fresh = await import("zod/v4");
    function callSite() {
      fresh.string().parse(1);
    }
    try {
      callSite();
    } catch (err) {
      thrown = err;
    }
  } finally {
    Object.defineProperty(Error, "captureStackTrace", desc);
  }

  expect(thrown).toBeInstanceOf(Error);
  expect((thrown as Error).stack).toContain("callSite");
});

test("a realm that hardens Error after import degrades instead of throwing", async () => {
  // lockdown() runs after zod's module graph evaluates, so the latch fires in a throwaway instance rather than the one this file uses
  vi.resetModules();
  const fresh = await import("zod/v4");
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit")!;
  Object.defineProperty(Error, "stackTraceLimit", { value: 10, writable: false, configurable: true });

  try {
    for (const err of [fresh.string().safeParse(1).error!, fresh.string().safeParse(2).error!]) {
      expect(err).toBeInstanceOf(Error);
      expect(err.issues).toHaveLength(1);
    }
    expect(Error.stackTraceLimit).toBe(10);
  } finally {
    Object.defineProperty(Error, "stackTraceLimit", desc);
  }
});

test("an engine with no stackTraceLimit is never written to", () => {
  // off v8 the property is absent and SES deletes it before hardening; an accessor makes the write observable where a data property would not
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit")!;
  let writes = 0;
  Object.defineProperty(Error, "stackTraceLimit", {
    get: () => undefined,
    set: () => {
      writes++;
    },
    configurable: true,
  });

  try {
    const err = z.string().safeParse(123).error!;
    expect(err).toBeInstanceOf(z.ZodError);
    expect(types.isNativeError(err)).toBe(true);
    expect(err.issues).toHaveLength(1);
    expect(writes).toBe(0);
  } finally {
    Object.defineProperty(Error, "stackTraceLimit", desc);
  }
});

test("error initializer never installs onto an intrinsic prototype", () => {
  // `init` accepts any object; a foreign one must not leak accessors onto the prototype it happens to inherit from.
  z.core.$ZodError.init({} as any, []);
  z.ZodError.init({} as any, []);
  z.core.$ZodError.init(new Error() as any, []);

  expect(Object.getOwnPropertyDescriptor(Object.prototype, "toString")!.get).toBeUndefined();
  expect(Object.getOwnPropertyDescriptor(Error.prototype, "toString")!.get).toBeUndefined();
  expect(Object.getOwnPropertyNames(Object.prototype)).not.toContain("format");
  expect({}.toString()).toEqual("[object Object]");
  expect(String(new Error("boom"))).toEqual("Error: boom");
});
