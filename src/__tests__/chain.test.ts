// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test.each([
  {
    input: "1",
    output: {
      success: true,
      data: 1,
    },
  },
  {
    input: "",
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "invalid_type",
            expected: "number",
            received: "nan",
            path: [],
            message: "Expected number, received nan",
          },
        ],
      }),
    },
  },
  {
    input: null,
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "invalid_type",
            expected: "string",
            received: "null",
            path: [],
            message: "Expected string, received null",
          },
        ],
      }),
    },
  },
  {
    input: "5",
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Cannot be 5",
            path: ["new_path"],
          },
          {
            code: "custom",
            message: "It really can not be 5",
            path: ["newer_path"],
          },
        ],
      }),
    },
  },
  {
    input: "6",
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Cannot be 6",
            fatal: true,
            path: [],
          },
        ],
      }),
    },
  },
  {
    input: "11",
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "too_big",
            maximum: 10,
            type: "number",
            inclusive: true,
            message: "Number must be less than or equal to 10",
            path: [],
          },
        ],
      }),
    },
  },
])('Scalar schema chaining "$input"', async ({ input, output }) => {
  const fromSchema = z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional()
    .superRefine((val, ctx) => {
      if (val === 5) {
        ctx.addIssue({
          code: "custom",
          message: "Cannot be 5",
          path: ["new_path"],
        });
      }
      if (val === 6) {
        ctx.addIssue({
          code: "custom",
          message: "Cannot be 6",
          fatal: true,
        });
      }
    });
  const toSchema = z
    .number()
    .min(1)
    .max(10)
    .nullable()
    .optional()
    .superRefine((val, ctx) => {
      if (val === 5) {
        ctx.addIssue({
          code: "custom",
          message: "It really can not be 5",
          path: ["newer_path"],
        });
      }
    })
    .refine((val) => val !== 6, { message: "It really can not be 6" });

  type FromInput = z.input<typeof fromSchema>;
  type FromOutput = z.output<typeof fromSchema>;

  type ToInput = z.input<typeof toSchema>;
  type ToOutput = z.output<typeof toSchema>;

  util.assertAssignable<ToInput, FromOutput>(true);
  util.assertAssignable<FromOutput, ToInput>(false);

  const chain = z.chain(fromSchema, toSchema);

  type ChainInput = z.input<typeof chain>;
  type ChainOutput = z.output<typeof chain>;

  util.assertEqual<ChainInput, FromInput>(true);
  util.assertEqual<ChainOutput, ToOutput>(true);

  const resSync = chain.safeParse(input);
  expect(resSync).toEqual(output);
  const resAsync = await chain.safeParseAsync(input);
  expect(resAsync).toEqual(output);
});

const numProm = Promise.resolve(12);

test.each([
  {
    input: {
      tuple: ["abcd", 1234, true, null, undefined, "1234"],
      merged: { k1: "abdc", k2: "1234", k3: 12 },
      union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
      array: [12, 15, 16],
      sumMinLength: { values: [12, 15, 16, 98, 24, 63, 89, 65] },
      intersection: { p2: 0 },
      enum: "one",
      passthrough: { points: 1234, score: 999, name: "General Zod" },
      numProm,
      lenfun: (x: string, y?: number) => x.length + (y ?? 0),
    },
    output: {
      success: true,
      data: {
        tuple: ["abcd", 1234, true, null, undefined, "1234"],
        merged: { k1: "abdc" },
        union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
        array: [12, 15, 16],
        sumMinLength: { values: [12, 15, 16, 98, 24, 63, 89, 65] },
        intersection: { p2: 0 },
        enum: "one",
        passthrough: { points: 1234, score: 999 },
        numProm,
        lenfun: 42,
      },
    },
  },
  {
    input: {
      tuple: ["abcd", 1234, true, null, undefined, "1234"],
      merged: { k1: "abdc", k2: "1234", k3: 12 },
      union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
      array: [12, 15, 16],
      sumMinLength: { values: [12, 15, 16, 98, 24, 63, 89] },
      intersection: { p2: 0 },
      enum: "one",
      passthrough: { points: 1234, score: 999, name: "General Zod" },
      numProm,
      lenfun: (x: string, y?: number) => x.length + (y ?? 0),
    },
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Array must be at least 8 items long",
            path: ["sumMinLength", "values"],
          },
        ],
      }),
    },
  },
  {
    input: {
      tuple: ["abcd", 1234, true, null, undefined, "1234"],
      merged: { k1: "abdc", k2: "1234", k3: 12 },
      union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
      array: [12, 15, 16],
      sumMinLength: { values: [12, 15, 16, 98, 24] },
      intersection: { p2: 0 },
      enum: "one",
      passthrough: { points: 1234, score: 999, name: "General Zod" },
      numProm,
      lenfun: (x: string, y?: number) => x.length + (y ?? 0),
    },
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Array must be at least 6 items long",
            path: ["sumMinLength", "values"],
          },
          {
            code: "custom",
            message: "Array must be at least 8 items long",
            path: ["sumMinLength", "values"],
          },
        ],
      }),
    },
  },
  {
    input: {
      tuple: ["abcd", 1234, true, null, undefined, "1234"],
      merged: { k1: "abdc", k2: "1234", k3: 12 },
      union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
      array: [12, 15, 16],
      sumMinLength: { values: [12, 15, 16] },
      intersection: { p2: 0 },
      enum: "one",
      passthrough: { points: 1234, score: 999, name: "General Zod" },
      numProm,
      lenfun: (x: string, y?: number) => x.length + (y ?? 0),
    },
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Array must be at least 6 items long",
            path: ["sumMinLength", "values"],
          },
          {
            code: "custom",
            message: "Array really must be at least 4 items long",
            path: ["sumMinLength", "values"],
            fatal: true,
          },
          {
            code: "custom",
            message: "Array must be at least 8 items long",
            path: ["sumMinLength", "values"],
          },
        ],
      }),
    },
  },
  {
    input: {
      tuple: ["abcd", 1234, true, null, undefined, "1234"],
      merged: { k1: "abdc", k2: "1234", k3: 12 },
      union: ["ABCD", 42, "ABCD", 42, "ABCD", 42],
      array: [12, 15, 16],
      sumMinLength: { values: [12] },
      intersection: { p2: 0 },
      enum: "one",
      passthrough: { points: 1234, score: 999, name: "General Zod" },
      numProm,
      lenfun: (x: string, y?: number) => x.length + (y ?? 0),
    },
    output: {
      success: false,
      error: expect.objectContaining({
        issues: [
          {
            code: "custom",
            message: "Array really must be at least 2 items long",
            path: ["sumMinLength", "values"],
            fatal: true,
          },
          {
            code: "custom",
            message: "Array must be at least 6 items long",
            path: ["sumMinLength", "values"],
          },
        ],
      }),
    },
  },
])("Object schema chaining - $#", async ({ input, output }) => {
  const fromSchema = z.object({
    tuple: z.tuple([
      z.string().nullable(),
      z.number().optional(),
      z.boolean().nullable().optional(),
      z.null(),
      z.undefined(),
      z.literal("1234"),
    ]),
    merged: z
      .object({
        k1: z.string(),
      })
      .merge(z.object({ k2: z.string(), k3: z.number() })),
    union: z.array(z.union([z.literal("ABCD"), z.literal(42)])).nonempty(),
    array: z.array(z.number()),
    sumMinLength: z.object({
      values: z.array(z.number()).superRefine((arg, ctx) => {
        if (arg.length < 2) {
          ctx.addIssue({
            code: "custom",
            message: "Array really must be at least 2 items long",
            fatal: true,
          });
        }
        if (arg.length < 6) {
          ctx.addIssue({
            code: "custom",
            message: "Array must be at least 6 items long",
          });
        }
      }),
    }),
    intersection: z.intersection(
      z.object({ p1: z.string().optional() }),
      z.object({ p2: z.number() }),
      z.object({ p3: z.number().optional() })
    ),
    enum: z.intersection(z.enum(["zero", "one"]), z.enum(["one", "two"])),
    passthrough: z.object({ points: z.number(), score: z.number() }),
    numProm: z.promise(z.number()),
    lenfun: z.function(
      z.tuple([z.string(), z.number().optional()]),
      z.number()
    ),
  });

  const toSchema = z.object({
    tuple: z.tuple([
      z.string().nullable().optional(),
      z.number().nullable().optional(),
      z.boolean().nullable().optional(),
      z.null().optional(),
      z.undefined().optional(),
      z.literal("1234").nullable().optional(),
    ]),
    merged: z
      .object({
        k1: z.string().optional(),
      })
      .merge(z.object({ k1: z.string().nullable() })),
    union: z
      .array(z.union([z.literal("ABCD"), z.literal(42), z.literal("42")]))
      .nonempty(),
    array: z.array(z.number()),
    sumMinLength: z.object({
      values: z.array(z.number()).superRefine((arg, ctx) => {
        if (arg.length < 4) {
          ctx.addIssue({
            code: "custom",
            message: "Array really must be at least 4 items long",
            fatal: true,
          });
        }
        if (arg.length < 8) {
          ctx.addIssue({
            code: "custom",
            message: "Array must be at least 8 items long",
          });
        }
      }),
    }),
    intersection: z.intersection(
      z.object({ p1: z.string().optional() }),
      z.object({ p2: z.number().optional() })
    ),
    enum: z.enum(["zero", "one"]),
    passthrough: z.object({ points: z.number() }).passthrough(),
    numProm: z.promise(z.number()),
    lenfun: z
      .function(z.tuple([z.string(), z.number().optional()]), z.number())
      .transform((fn) => fn("Hello", 37)),
  });

  type FromInput = z.input<typeof fromSchema>;
  type FromOutput = z.output<typeof fromSchema>;

  type ToInput = z.input<typeof toSchema>;
  type ToOutput = z.output<typeof toSchema>;

  util.assertAssignable<ToInput, FromOutput>(true);
  util.assertAssignable<FromOutput, ToInput>(false);

  const chain = z.chain(fromSchema, toSchema);

  type ChainInput = z.input<typeof chain>;
  type ChainOutput = z.output<typeof chain>;

  util.assertEqual<ChainInput, FromInput>(true);
  util.assertEqual<ChainOutput, ToOutput>(true);

  const resSync = chain.safeParse(input);
  expect(resSync).toEqual(output);
  const resAsync = await chain.safeParseAsync(input);
  expect(resAsync).toEqual(output);
});
