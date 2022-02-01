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
          expectedOneOf: ["a", "b"],
          message: "Invalid discriminator value. Expected one of: a, b",
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
