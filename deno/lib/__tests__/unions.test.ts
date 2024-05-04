// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

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

test("return errors from both union arms", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "invalid_union",
        input: "a",
        message: "Invalid input",
        path: [],
        unionErrors: [expect.any(z.ZodError), expect.any(z.ZodError)],
      },
    ]);
    expect((result.error.issues[0] as any).unionErrors[0].issues).toEqual([
      {
        code: "invalid_type",
        expected: "number",
        received: "string",
        path: [],
        message: "Expected number, received string",
        input: "a",
      },
    ]);
    expect((result.error.issues[0] as any).unionErrors[1].issues).toEqual([
      {
        code: "custom",
        message: "Invalid input",
        path: [],
        input: "a",
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
