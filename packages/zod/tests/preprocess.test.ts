// @ts-ignore TS6133
import { expect, test } from "vitest";
import * as util from "zod-core/util";
import * as z from "../src/index.js";

test("preprocess", () => {
  const schema = z.preprocess((data) => [data], z.string().array());
  const value = schema.parse("asdf");
  expect(value).toEqual(["asdf"]);
  util.assertEqual<(typeof schema)["~input"], unknown>(true);
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
  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
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
  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "custom error",
            "path": [],
          },
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string",
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

  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
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

  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
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
  util.assertEqual<foo, number>(true);
  const result = foo.safeParse(undefined);

  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "bad",
            "path": [],
          },
          {
            "code": "invalid_type",
            "expected": "number",
            "message": "Invalid input: expected number",
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

  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
        "issues": [
          {
            "code": "too_small",
            "message": "Too small: expected string to have greater than 1 characters",
            "minimum": 1,
            "origin": "string",
            "path": [
              "nonEmptyStr",
            ],
          },
          {
            "code": "too_small",
            "inclusive": false,
            "message": "Too small: expected number to be greater than 0",
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
  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string",
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
