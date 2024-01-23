import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("valid", () => {
  const schema = z.switch((input: any) => {
    switch (input.type) {
      case "a":
        return z.object({ type: z.literal("a"), a: z.literal("abc") })
      default:
        return z.object({ b: z.literal("abc") })
    }
  });

  expect(
    schema.parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });

  expect(
    schema.parse({ b: "abc" })
  ).toEqual({ b: "abc" });
});

test("valid - various switch cases", () => {
  const schema = z.switch(input => {
    switch (input.type) {
      case "1":
        return z.object({ type: z.literal("1"), val: z.literal(1) });
      case 1:
        return z.object({ type: z.literal(1), val: z.literal(2) });
      case BigInt(1):
        return z.object({ type: z.literal(BigInt(1)), val: z.literal(3) });
      case "true":
        return z.object({ type: z.literal("true"), val: z.literal(4) });
      case true:
        return z.object({ type: z.literal(true), val: z.literal(5) });
      case "null":
        return z.object({ type: z.literal("null"), val: z.literal(6) });
      case null:
        return z.object({ type: z.literal(null), val: z.literal(7) });
      case "undefined":
        return z.object({ type: z.literal("undefined"), val: z.literal(8) });
      case undefined:
        return z.object({ type: z.literal(undefined), val: z.literal(9) });
      case "transform":
        return z.object({ type: z.literal("transform"), val: z.literal(10) });
      case "refine":
        return z.object({ type: z.literal("refine"), val: z.literal(11) });
      case "superRefine":
        return z.object({ type: z.literal("superRefine"), val: z.literal(12) });
      case "sub":
        return z.object({ type: z.literal("sub"), sub: z.object({ type: z.literal("1") }), value: z.literal(1) });
      default:
        return z.object({ type: z.literal("default"), val: z.literal(13) });
    }
  })

  expect(schema.parse({ type: "1", val: 1 })).toEqual({ type: "1", val: 1 });
  expect(schema.parse({ type: 1, val: 2 })).toEqual({ type: 1, val: 2 });
  expect(schema.parse({ type: BigInt(1), val: 3 })).toEqual({
    type: BigInt(1),
    val: 3,
  });
  expect(schema.parse({ type: "true", val: 4 })).toEqual({
    type: "true",
    val: 4,
  });
  expect(schema.parse({ type: true, val: 5 })).toEqual({
    type: true,
    val: 5,
  });
  expect(schema.parse({ type: "null", val: 6 })).toEqual({
    type: "null",
    val: 6,
  });
  expect(schema.parse({ type: null, val: 7 })).toEqual({
    type: null,
    val: 7,
  });
  expect(schema.parse({ type: "undefined", val: 8 })).toEqual({
    type: "undefined",
    val: 8,
  });
  expect(schema.parse({ type: undefined, val: 9 })).toEqual({
    type: undefined,
    val: 9,
  });
  expect(schema.parse({ type: "sub", sub: { type: "1" }, value: 1 })).toEqual({ type: "sub", sub: { type: "1" }, value: 1 });
})

test("async - valid", async () => {
  expect(
    //@ts-expect-error
    await z.switch(async val => {
      if (val.type === "a") {
        return z.object({
          type: z.literal("a"),
          a: z.string()
            .refine(async () => true)
            .transform(async (val) => Number(val))
        })
      }
    }).parseAsync({ type: "a", a: "1" })
  ).toEqual({ type: "a", a: 1 });
});

test("async - invalid", async () => {
  try {
    //@ts-expect-error
    await z.switch(async val => {
      if (val.type === "a") {
        return z.object({
          type: z.literal("a"),
          a: z.string()
            .refine(async () => true)
            .transform(async (val) => val)
        })
      }
    }).parseAsync({ type: "a", a: 1 })
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["a"],
        message: "Expected string, received number",
      },
    ]);
  }
});