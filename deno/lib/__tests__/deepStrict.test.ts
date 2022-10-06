import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("deep strict flat object", () => {
  const flatObject = {
    knownKey: 1,
    unknownKey: 1,
  };

  const flatSchema = z.object({
    knownKey: z.number(),
  });

  flatSchema.parse(flatObject);
  expect(() => flatSchema.deepStrict().parse(flatObject)).toThrow();
});

test("deep strict nested object", () => {
  const nestedObject = {
    outer: {
      inner: {
        knownKey: 1,
        unknownKey: 1,
      },
    },
  };

  const nestedSchema = z.object({
    outer: z.object({
      inner: z.object({
        knownKey: z.number(),
      }),
    }),
  });

  nestedSchema.parse(nestedObject);
  expect(() => nestedSchema.deepStrict().parse(nestedObject)).toThrow();
});

test("deep strict nested array and tuple", () => {
  const nestedArray = {
    inner: [
      {
        knownKey: 1,
        unknownKey: 1,
      },
    ],
  };

  const objectWithKnownKey = z.object({
    knownKey: z.number(),
  });

  const nestedArraySchema = z.object({
    inner: z.array(objectWithKnownKey),
  });

  nestedArraySchema.parse(nestedArray);
  expect(() => nestedArraySchema.deepStrict().parse(nestedArray)).toThrow();

  const nestedTupleSchema = z.object({
    inner: z.tuple([objectWithKnownKey]),
  });

  nestedTupleSchema.parse(nestedArray);
  expect(() => nestedTupleSchema.deepStrict().parse(nestedArray)).toThrow();
});
