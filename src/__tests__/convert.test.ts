// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("convert (failure) with parse", () => {
  const strs = ["foo", "bar"];

  expect(() => {
    z.string()
      .convert((data) => {
        const i = strs.indexOf(data);
        if (i === -1) {
          return z.failure([
            {
              code: "custom",
              message: `${data} is not one of our allowed strings`,
            },
          ]);
        }
        return z.success(data.length);
      })
      .refine((arg) => isNaN(arg), "!!! SHOULD NOT EXECUTE !!!")
      .parse("asdf");
  }).toThrow(
    JSON.stringify(
      [
        {
          code: "custom",
          message: "asdf is not one of our allowed strings",
          fatal: true,
          path: [],
        },
      ],
      null,
      2
    )
  );
});

test("convert (failure) with parseAsync", async () => {
  const strs = ["foo", "bar"];

  const result = await z
    .string()
    .convert((data) => {
      const i = strs.indexOf(data);
      if (i === -1) {
        return z.failure([
          {
            code: "custom",
            message: `${data} is not one of our allowed strings`,
          },
        ]);
      }
      return z.success(data.length);
    })
    .refine((arg) => isNaN(arg), "!!! SHOULD NOT EXECUTE !!!")
    .safeParseAsync("asdf");

  expect(JSON.parse(JSON.stringify(result))).toEqual({
    success: false,
    error: {
      issues: [
        {
          code: "custom",
          fatal: true,
          message: "asdf is not one of our allowed strings",
          path: [],
        },
      ],
      name: "ZodError",
    },
  });
});

test("basic convertations", () => {
  const r1 = z
    .string()
    .convert((data) => z.success(data.length))
    .parse("asdf");
  expect(r1).toEqual(4);
});

test("coercion", () => {
  const numToString = z.number().convert((n) => z.success(String(n)));
  const data = z
    .object({
      id: numToString,
    })
    .parse({ id: 5 });

  expect(data).toEqual({ id: "5" });
});

test("async coercion", async () => {
  const numToString = z.number().convert(async (n) => z.success(String(n)));
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
        id: z.number().convert(async (n) => z.success(String(n))),
      })
      .parse({ id: 5 })
  ).toThrow();
});

test("object typing", () => {
  const t1 = z.object({
    stringToNumber: z.string().convert((arg) => z.success(parseFloat(arg))),
  });

  type t1 = z.input<typeof t1>;
  type t2 = z.output<typeof t1>;

  const f1: util.AssertEqual<t1, { stringToNumber: string }> = true;
  const f2: util.AssertEqual<t2, { stringToNumber: number }> = true;
  expect([f1, f2]).toEqual([true, true]);
});

test("convert method overloads", () => {
  const t1 = z.string().convert((val) => z.success(val.toUpperCase()));
  expect(t1.parse("asdf")).toEqual("ASDF");

  const t2 = z.string().convert((val) => z.success(val.length));
  expect(t2.parse("asdf")).toEqual(4);
});

test("multiple converters", () => {
  const doubler = z
    .string()
    .convert((arg) => z.success(parseFloat(arg)))
    .convert((val) => {
      return z.success(val * 2);
    });
  expect(doubler.parse("5")).toEqual(10);
});

test("short circuit on dirty", () => {
  const schema = z
    .string()
    .refine(() => false)
    .convert((val) => z.success(val.toUpperCase()));
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);

  const issues1 = result.success ? null : result.error.issues;
  expect(issues1?.length).toBe(1);

  expect(issues1?.[0].code).toEqual(z.ZodIssueCode.custom);

  const result2 = schema.safeParse(1234);
  expect(result2.success).toEqual(false);

  const issues2 = result2.success ? null : result2.error.issues;

  expect(issues2?.length).toBe(1);
  expect(issues2?.[0].code).toEqual(z.ZodIssueCode.invalid_type);
});

test("async short circuit on dirty", async () => {
  const schema = z
    .string()
    .refine(() => false)
    .convert((val) => z.success(val.toUpperCase()));
  const result = await schema.spa("asdf");
  expect(result.success).toEqual(false);

  const issues1 = result.success ? null : result.error.issues;
  expect(issues1?.length).toBe(1);

  expect(issues1?.[0].code).toEqual(z.ZodIssueCode.custom);

  const result2 = await schema.spa(1234);
  expect(result2.success).toEqual(false);

  const issues2 = result2.success ? null : result2.error.issues;

  expect(issues2?.length).toBe(1);
  expect(issues2?.[0].code).toEqual(z.ZodIssueCode.invalid_type);
});
