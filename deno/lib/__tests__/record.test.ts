// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const booleanRecord = z.record(z.boolean());
type booleanRecord = z.infer<typeof booleanRecord>;

const recordWithEnumKeys = z.record(z.enum(["Tuna", "Salmon"]), z.string());
type recordWithEnumKeys = z.infer<typeof recordWithEnumKeys>;

const recordWithLiteralKeys = z.record(
  z.union([z.literal("Tuna"), z.literal("Salmon")]),
  z.string()
);
type recordWithLiteralKeys = z.infer<typeof recordWithLiteralKeys>;

test("type inference", () => {
  const f1: util.AssertEqual<booleanRecord, Record<string, boolean>> = true;
  f1;

  const f2: util.AssertEqual<
    recordWithEnumKeys,
    Record<"Tuna" | "Salmon", string>
  > = true;
  f2;
  const f3: util.AssertEqual<
    recordWithLiteralKeys,
    Record<"Tuna" | "Salmon", string>
  > = true;
  f3;
});

test("methods", () => {
  booleanRecord.optional();
  booleanRecord.nullable();
});

test("string record parse - pass", () => {
  booleanRecord.parse({
    k1: true,
    k2: false,
    1234: false,
  });
});

test("string record parse - fail", () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: 1234,
    } as any);
  expect(badCheck).toThrow();

  expect(() => booleanRecord.parse("asdf")).toThrow();
});

test("string record parse - fail", () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: {},
    } as any);
  expect(badCheck).toThrow();
});

test("string record parse - fail", () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: [],
    } as any);
  expect(badCheck).toThrow();
});

test("key schema", () => {
  const result1 = recordWithEnumKeys.parse({
    Tuna: "asdf",
    Salmon: "asdf",
  });
  expect(result1).toEqual({
    Tuna: "asdf",
    Salmon: "asdf",
  });

  const result2 = recordWithLiteralKeys.parse({
    Tuna: "asdf",
    Salmon: "asdf",
  });
  expect(result2).toEqual({
    Tuna: "asdf",
    Salmon: "asdf",
  });

  expect(() =>
    recordWithEnumKeys.parse({
      Tuna: "asdf",
      Salmon: "asdf",
      Trout: "asdf",
    })
  ).toThrow();

  expect(() =>
    recordWithLiteralKeys.parse({
      Tuna: "asdf",
      Salmon: "asdf",

      Trout: "asdf",
    })
  ).toThrow();
});

// test("record element", () => {
//   expect(booleanRecord.element).toBeInstanceOf(z.ZodBoolean);
// });
