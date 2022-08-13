// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

const stringToNumber = z.string().transform((arg) => parseFloat(arg));
// const numberToString = z
//   .transformer(z.number())
//   .transform((n) => String(n));
const asyncNumberToString = z.number().transform(async (n) => String(n));

test("transform ctx.addIssue with parse", () => {
  const strs = ["foo", "bar"];

  expect(() => {
    z.string()
      .transform((data, ctx) => {
        const i = strs.indexOf(data);
        if (i === -1) {
          ctx.addIssue({
            code: "custom",
            message: `${data} is not one of our allowed strings`,
          });
        }
        return data.length;
      })
      .parse("asdf");
  }).toThrow(
    JSON.stringify(
      [
        {
          code: "custom",
          message: "asdf is not one of our allowed strings",
          path: [],
        },
      ],
      null,
      2
    )
  );
});

test("transform ctx.addIssue with parseAsync", async () => {
  const strs = ["foo", "bar"];

  const result = await z
    .string()
    .transform((data, ctx) => {
      const i = strs.indexOf(data);
      if (i === -1) {
        ctx.addIssue({
          code: "custom",
          message: `${data} is not one of our allowed strings`,
        });
      }
      return data.length;
    })
    .safeParseAsync("asdf");

  expect(JSON.parse(JSON.stringify(result))).toEqual({
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          message: "asdf is not one of our allowed strings",
          path: [],
        },
      ],
      name: "ZodError",
    },
  });
});

test("basic transformations", () => {
  const r1 = z
    .string()
    .transform((data) => data.length)
    .parse("asdf");
  expect(r1).toEqual(4);
});

test("coercion", () => {
  const numToString = z.number().transform((n) => String(n));
  const data = z
    .object({
      id: numToString,
    })
    .parse({ id: 5 });

  expect(data).toEqual({ id: "5" });
});

test("async coercion", async () => {
  const numToString = z.number().transform(async (n) => String(n));
  const data = await z
    .object({
      id: numToString,
    })
    .parseAsync({ id: 5 });

  expect(data).toEqual({ id: "5" });
});

test("sync coercion async error", async () => {
  expect(() =>
    z
      .object({
        id: asyncNumberToString,
      })
      .parse({ id: 5 })
  ).toThrow();
  // expect(data).toEqual({ id: '5' });
});

test("default", () => {
  const data = z.string().default("asdf").parse(undefined); // => "asdf"
  expect(data).toEqual("asdf");
});

test("dynamic default", () => {
  const data = z
    .string()
    .default(() => "string")
    .parse(undefined); // => "asdf"
  expect(data).toEqual("string");
});

test("default when property is null or undefined", () => {
  const data = z
    .object({
      foo: z.boolean().nullable().default(true),
      bar: z.boolean().default(true),
    })
    .parse({ foo: null });

  expect(data).toEqual({ foo: null, bar: true });
});

test("default with falsy values", () => {
  const schema = z.object({
    emptyStr: z.string().default("def"),
    zero: z.number().default(5),
    falseBoolean: z.boolean().default(true),
  });
  const input = { emptyStr: "", zero: 0, falseBoolean: true };
  const output = schema.parse(input);
  // defaults are not supposed to be used
  expect(output).toEqual(input);
});

test("object typing", () => {
  const t1 = z.object({
    stringToNumber,
  });

  type t1 = z.input<typeof t1>;
  type t2 = z.output<typeof t1>;

  util.assertEqual<t1, { stringToNumber: string }>(true);
  util.assertEqual<t2, { stringToNumber: number }>(true);
});

test("transform method overloads", () => {
  const t1 = z.string().transform((val) => val.toUpperCase());
  expect(t1.parse("asdf")).toEqual("ASDF");

  const t2 = z.string().transform((val) => val.length);
  expect(t2.parse("asdf")).toEqual(4);
});

test("multiple transformers", () => {
  const doubler = stringToNumber.transform((val) => {
    return val * 2;
  });
  expect(doubler.parse("5")).toEqual(10);
});

test("preprocess", () => {
  const schema = z.preprocess((data) => [data], z.string().array());

  const value = schema.parse("asdf");
  expect(value).toEqual(["asdf"]);
});

test("async preprocess", async () => {
  const schema = z.preprocess(async (data) => [data], z.string().array());

  const value = await schema.parseAsync("asdf");
  expect(value).toEqual(["asdf"]);
});

test("short circuit on dirty", () => {
  const schema = z
    .string()
    .refine(() => false)
    .transform((val) => val.toUpperCase());
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].code).toEqual(z.ZodIssueCode.custom);
  }

  const result2 = schema.safeParse(1234);
  expect(result2.success).toEqual(false);
  if (!result2.success) {
    expect(result2.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_type);
  }
});

test("async short circuit on dirty", async () => {
  const schema = z
    .string()
    .refine(() => false)
    .transform((val) => val.toUpperCase());
  const result = await schema.spa("asdf");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].code).toEqual(z.ZodIssueCode.custom);
  }

  const result2 = await schema.spa(1234);
  expect(result2.success).toEqual(false);
  if (!result2.success) {
    expect(result2.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_type);
  }
});
