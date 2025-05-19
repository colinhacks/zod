import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("preprocess", () => {
  const schema = z.preprocess((data) => [data], z.string().array());
  const value = schema.parse("asdf");
  expect(value).toEqual(["asdf"]);
  expectTypeOf<(typeof schema)["_input"]>().toEqualTypeOf<unknown>();
});

test("async preprocess", async () => {
  const schema = z.preprocess(async (data) => {
    return [data];
  }, z.string().array());
  const value = await schema.safeParseAsync("asdf");
  expect(value.data).toEqual(["asdf"]);
  expect(value).toMatchInlineSnapshot(`
    {
      "data": [
        "asdf",
      ],
      "success": true,
    }
  `);
});

test("ctx.addIssue accepts string", () => {
  const schema = z.preprocess((_, ctx) => {
    ctx.addIssue("bad stuff");
  }, z.string());
  const result = schema.safeParse("asdf");
  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "bad stuff",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue with parse", () => {
  const a = z.preprocess((data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      message: `${data} is not one of our allowed strings`,
    });
    return data;
  }, z.string());

  const result = a.safeParse("asdf");

  // expect(result.error!.toJSON()).toContain("not one of our allowed strings");

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "asdf is not one of our allowed strings",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue non-fatal by default", () => {
  const schema = z.preprocess((data, ctx) => {
    ctx.addIssue({
      code: "custom",
      message: `custom error`,
    });
    return data;
  }, z.string());
  const result = schema.safeParse(1234);

  expect(result.error!.issues).toHaveLength(2);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "custom error",
            "path": [],
          },
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received number",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue fatal true", () => {
  const schema = z.preprocess((data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      origin: "custom",
      message: `custom error`,
      fatal: true,
    });
    return data;
  }, z.string());

  const result = schema.safeParse(1234);

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "fatal": true,
            "message": "custom error",
            "origin": "custom",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("async preprocess ctx.addIssue with parseAsync", async () => {
  const schema = z.preprocess(async (data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      message: `${data} is not one of our allowed strings`,
    });
    return data;
  }, z.string());

  const result = await schema.safeParseAsync("asdf");

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "asdf is not one of our allowed strings",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("z.NEVER in preprocess", () => {
  const foo = z.preprocess((val, ctx) => {
    if (!val) {
      ctx.addIssue({ input: val, code: "custom", message: "bad" });
      return z.NEVER;
    }
    return val;
  }, z.number());

  type foo = z.infer<typeof foo>;
  expectTypeOf<foo>().toEqualTypeOf<number>();
  const result = foo.safeParse(undefined);

  expect(result.error!.issues).toHaveLength(2);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "bad",
            "path": [],
          },
          {
            "code": "invalid_type",
            "expected": "number",
            "message": "Invalid input: expected number, received object",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("preprocess as the second property of object", () => {
  const schema = z.object({
    nonEmptyStr: z.string().min(1),
    positiveNum: z.preprocess((v) => Number(v), z.number().positive()),
  });
  const result = schema.safeParse({
    nonEmptyStr: "",
    positiveNum: "",
  });

  expect(result.error!.issues).toHaveLength(2);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "too_small",
            "message": "Too small: expected string to have >1 characters",
            "minimum": 1,
            "origin": "string",
            "path": [
              "nonEmptyStr",
            ],
          },
          {
            "code": "too_small",
            "inclusive": false,
            "message": "Too small: expected number to be >0",
            "minimum": 0,
            "origin": "number",
            "path": [
              "positiveNum",
            ],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("preprocess validates with sibling errors", () => {
  const schema = z.object({
    missing: z.string().refine(() => false),
    preprocess: z.preprocess((data: any) => data?.trim(), z.string().regex(/ asdf/)),
  });

  const result = schema.safeParse({ preprocess: " asdf" });

  expect(result.error!.issues).toHaveLength(2);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received undefined",
            "path": [
              "missing",
            ],
          },
          {
            "code": "invalid_format",
            "format": "regex",
            "message": "Invalid string: must match pattern / asdf/",
            "origin": "string",
            "path": [
              "preprocess",
            ],
            "pattern": "/ asdf/",
          },
        ],
      },
      "success": false,
    }
  `);
});
