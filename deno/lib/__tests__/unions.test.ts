import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
import { ZodError } from "../ZodError.ts";

test("function parsing", () => {
  const schema = z.union([
    z.string().refine(() => false),
    z.number().refine(() => false),
  ]);
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);
});

test("union 2", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
});

test("return valid over invalid", () => {
  const schema = z.union([
    z.object({
      email: z.string().email(),
    }),
    z.string(),
  ]);
  expect(schema.parse("asdf")).toEqual("asdf");
  expect(schema.parse({ email: "asdlkjf@lkajsdf.com" })).toEqual({
    email: "asdlkjf@lkajsdf.com",
  });
});

test("return all results when there are no dirty", () => {
  const result = z.union([z.number(), z.boolean()]).safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "invalid_union",
        message: "Invalid input",
        path: [],
        unionErrors: [
          new ZodError([
            {
              code: "invalid_type",
              expected: "number",
              received: "string",
              path: [],
              message: "Expected number, received string",
            },
          ]),
          new ZodError([
            {
              code: "invalid_type",
              expected: "boolean",
              received: "string",
              path: [],
              message: "Expected boolean, received string",
            },
          ]),
        ],
      },
    ]);
  }
});

test("return all dirty results over aborted", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false), z.string().max(0)])
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "invalid_union",
        message: "Invalid input",
        path: [],
        unionErrors: [
          new ZodError([
            {
              code: "custom",
              message: "Invalid input",
              path: [],
            },
          ]),
          new ZodError([
            {
              code: "too_big",
              maximum: 0,
              type: "string",
              inclusive: true,
              message: "String must contain at most 0 character(s)",
              path: [],
            },
          ]),
        ],
      },
    ]);
  }
});

test("don't continue parsing on aborted result", () => {
  const result = z
    .union([z.number(), z.boolean()])
    .refine(() => false)
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "invalid_union",
        message: "Invalid input",
        path: [],
        unionErrors: [
          new ZodError([
            {
              code: "invalid_type",
              expected: "number",
              received: "string",
              path: [],
              message: "Expected number, received string",
            },
          ]),
          new ZodError([
            {
              code: "invalid_type",
              expected: "boolean",
              received: "string",
              path: [],
              message: "Expected boolean, received string",
            },
          ]),
        ],
      },
    ]);
  }
});

test("continue parsing on dirty result", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .refine(() => false)
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "invalid_union",
        message: "Invalid input",
        path: [],
        unionErrors: [
          new ZodError([
            {
              code: "custom",
              message: "Invalid input",
              path: [],
            },
          ]),
        ],
      },
      {
        code: "custom",
        message: "Invalid input",
        path: [],
      },
    ]);
  }
});

test("options getter", async () => {
  const union = z.union([z.string(), z.number()]);
  union.options[0].parse("asdf");
  union.options[1].parse(1234);
  await union.options[0].parseAsync("asdf");
  await union.options[1].parseAsync(1234);
});

test("readonly union", async () => {
  const options = [z.string(), z.number()] as const;
  const union = z.union(options);
  union.parse("asdf");
  union.parse(12);
});
