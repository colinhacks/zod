// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";
import { ZodIssueCode } from "../ZodError.ts";

test("refinement", () => {
  const obj1 = z.object({
    first: z.string(),
    second: z.string(),
  });
  const obj2 = obj1.partial().strict();

  const obj3 = obj2.refine(
    (data) => data.first || data.second,
    "Either first or second should be filled in."
  );

  expect(obj1 === (obj2 as any)).toEqual(false);
  expect(obj2 === (obj3 as any)).toEqual(false);

  expect(() => obj1.parse({})).toThrow();
  expect(() => obj2.parse({ third: "adsf" })).toThrow();
  expect(() => obj3.parse({})).toThrow();
  obj3.parse({ first: "a" });
  obj3.parse({ second: "a" });
  obj3.parse({ first: "a", second: "a" });
});

test("refinement 2", () => {
  const validationSchema = z
    .object({
      email: z.string().email(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .refine(
      (data) => data.password === data.confirmPassword,
      "Both password and confirmation must match"
    );

  expect(() =>
    validationSchema.parse({
      email: "aaaa@gmail.com",
      password: "aaaaaaaa",
      confirmPassword: "bbbbbbbb",
    })
  ).toThrow();
});

test("custom path", async () => {
  const result = await z
    .object({
      password: z.string(),
      confirm: z.string(),
    })
    .refine((data) => data.confirm === data.password, { path: ["confirm"] })
    .spa({ password: "asdf", confirm: "qewr" });
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].path).toEqual(["confirm"]);
  }
});

test("use path in refinement context", async () => {
  const noNested = z.string()._refinement((_val, ctx) => {
    if (ctx.path.length > 0) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `schema cannot be nested. path: ${ctx.path.join(".")}`,
      });
      return false;
    } else {
      return true;
    }
  });

  const data = z.object({
    foo: noNested,
  });

  const t1 = await noNested.spa("asdf");
  const t2 = await data.spa({ foo: "asdf" });
  // console.log(t1);
  // console.log(t2);

  expect(t1.success).toBe(true);
  expect(t2.success).toBe(false);
  if (t2.success === false) {
    expect(t2.error.issues[0].message).toEqual(
      "schema cannot be nested. path: foo"
    );
  }
});

test("superRefine", () => {
  const Strings = z.array(z.string()).superRefine((val, ctx) => {
    if (val.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 3,
        type: "array",
        inclusive: true,
        message: "Too many items 😡",
      });
    }

    if (val.length !== new Set(val).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `No duplicates allowed.`,
      });
    }
  });

  const result = Strings.safeParse(["asfd", "asfd", "asfd", "asfd"]);

  expect(result.success).toEqual(false);
  if (!result.success) expect(result.error.issues.length).toEqual(2);

  Strings.parse(["asfd", "qwer"]);
});

test("get inner type", () => {
  z.string()
    .refine(() => true)
    .innerType()
    .parse("asdf");
});
