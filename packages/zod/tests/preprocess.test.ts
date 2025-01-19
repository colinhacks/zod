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
  const value = await schema.parseAsync("asdf");
  expect(value).toEqual(["asdf"]);
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
  expect(result.error).toMatchSnapshot();
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
  expect(result.error).toBeInstanceOf(z.ZodError);
  expect(result.error?.issues.length).toEqual(2);
  // expect(result).toMatchSnapshot();
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

  expect(result.error).toBeInstanceOf(z.ZodError);
  expect(result.error!.issues.length).toEqual(1);
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

  const result = schema.parseAsync("asdf");
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("z.NEVER in preprocess", () => {
  const foo = z.preprocess((val, ctx) => {
    if (!val) {
      ctx.addIssue({ input: val, code: z.ZodIssueCode.custom, message: "bad" });
      return z.NEVER;
    }
    return val;
  }, z.number());

  type foo = z.infer<typeof foo>;
  util.assertEqual<foo, number>(true);
  const arg = foo.safeParse(undefined);
  if (!arg.success) {
    expect(arg.error.issues[0].message).toEqual("bad");
  }
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
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues.length).toEqual(2);
    expect(result.error.issues[0].code).toEqual(z.ZodIssueCode.too_small);
    expect(result.error.issues[1].code).toEqual(z.ZodIssueCode.too_small);
  }
});

test("preprocess validates with sibling errors", () => {
  const schema = z.object({
    missing: z.string().refine(() => false),
    preprocess: z.preprocess((data: any) => data?.trim(), z.string().regex(/ asdf/)),
  });

  const result = schema.safeParse({ preprocess: " asdf" });
  expect(result.error).toBeInstanceOf(z.ZodError);
  expect(result.error?.issues.length).toEqual(2);
  expect(result.error!.issues).toMatchSnapshot();
});
