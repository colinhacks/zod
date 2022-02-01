import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

describe("discriminated union", () => {
  test("valid", () => {
    expect(
      z
        .discriminatedUnion("type", [
          z.object({ type: z.literal("a"), a: z.string() }),
          z.object({ type: z.literal("b"), b: z.string() }),
        ])
        .parse({ type: "a", a: "abc" })
    ).toEqual({ type: "a", a: "abc" });
  });

  test("valid - discriminator value of various primitive types", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("1"), val: z.literal(1) }),
      z.object({ type: z.literal(1), val: z.literal(2) }),
      z.object({ type: z.literal(BigInt(1)), val: z.literal(3) }),
      z.object({ type: z.literal("true"), val: z.literal(4) }),
      z.object({ type: z.literal(true), val: z.literal(5) }),
      z.object({ type: z.literal("null"), val: z.literal(6) }),
      z.object({ type: z.literal(null), val: z.literal(7) }),
      z.object({ type: z.literal("undefined"), val: z.literal(8) }),
      z.object({ type: z.literal(undefined), val: z.literal(9) }),
    ]);

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
  });

  test("invalid - null", () => {
    expect.assertions(1);
    try {
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ]).parse(null);
    } catch (e: any) {
      expect(JSON.parse(e.message)).toEqual([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: z.ZodParsedType.object,
          message: "Expected object, received null",
          received: z.ZodParsedType.null,
          path: [],
        },
      ]);
    }
  });

  test("invalid discriminator value", () => {
    expect.assertions(1);
    try {
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ]).parse({ type: "x", a: "abc" });
    } catch (e: any) {
      expect(JSON.parse(e.message)).toEqual([
        {
          code: z.ZodIssueCode.invalid_union_discriminator,
          options: ["a", "b"],
          message: "Invalid discriminator value. Expected 'a' | 'b'",
          path: ["type"],
        },
      ]);
    }
  });

  test("valid discriminator value, invalid data", () => {
    expect.assertions(1);
    try {
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ]).parse({ type: "a", b: "abc" });
    } catch (e: any) {
      expect(JSON.parse(e.message)).toEqual([
        {
          code: z.ZodIssueCode.invalid_type,
          expected: z.ZodParsedType.string,
          message: "Required",
          path: ["a"],
          received: z.ZodParsedType.undefined,
        },
      ]);
    }
  });

  test("wrong schema - missing discriminator", () => {
    expect.assertions(1);
    try {
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ b: z.string() }) as any,
      ]);
    } catch (e) {
      expect(e).toHaveProperty(
        "message",
        "The discriminator value could not be extracted from all the provided schemas"
      );
    }
  });

  test("wrong schema - duplicate discriminator values", () => {
    expect.assertions(1);
    try {
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("a"), b: z.string() }),
      ]);
    } catch (e) {
      expect(e).toHaveProperty(
        "message",
        "Some of the discriminator values are not unique"
      );
    }
  });

  describe("async", () => {
    test("valid", () => {
      expect(
        z
          .discriminatedUnion("type", [
            z.object({
              type: z.literal("a"),
              a: z
                .string()
                .refine(async () => true)
                .transform(async (val) => Number(val)),
            }),
            z.object({
              type: z.literal("b"),
              b: z.string(),
            }),
          ])
          .parseAsync({ type: "a", a: "1" })
      ).resolves.toEqual({ type: "a", a: 1 });
    });

    test("invalid", () => {
      expect(
        z
          .discriminatedUnion("type", [
            z.object({
              type: z.literal("a"),
              a: z
                .string()
                .refine(async () => true)
                .transform(async (val) => val),
            }),
            z.object({
              type: z.literal("b"),
              b: z.string(),
            }),
          ])
          .parseAsync({ type: "a", a: 1 })
      ).rejects.toHaveProperty(
        "message",
        JSON.stringify(
          [
            {
              code: "invalid_type",
              expected: "string",
              received: "number",
              path: ["a"],
              message: "Expected string, received number",
            },
          ],
          null,
          2
        )
      );
    });
  });
});
