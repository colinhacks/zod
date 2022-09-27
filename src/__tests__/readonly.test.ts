// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

// Objects

const testObject = z
  .object({
    f1: z.number(),
    f2: z.string().optional(),
    f3: z.string().nullable(),
    f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
  })
  .readonly();
type testObject = z.infer<typeof testObject>;

// Records

const testBooleanRecord = z.record(z.boolean()).readonly();
type testBooleanRecord = z.infer<typeof testBooleanRecord>;

const testRecordWithEnumKeys = z
  .record(z.enum(["Tuna", "Salmon"]), z.string())
  .readonly();
type testRecordWithEnumKeys = z.infer<typeof testRecordWithEnumKeys>;

const testRecordWithLiteralKeys = z
  .record(z.union([z.literal("Tuna"), z.literal("Salmon")]), z.string())
  .readonly();
type testRecordWithLiteralKeys = z.infer<typeof testRecordWithLiteralKeys>;

// Arrays

const testArray = z.string().array().readonly();
type testArray = z.infer<typeof testArray>;

// Maps / Sets

const testMap = z.map(z.string(), z.number()).readonly();
type testMap = z.infer<typeof testMap>;

const testSet = z.set(z.string()).readonly();
type testSet = z.infer<typeof testSet>;

// Tuples

const testTuple = z.tuple([testObject, testArray, z.string()]).readonly();
type testTuple = z.infer<typeof testTuple>;

// Unions

const testUnion = z
  .union([testMap.unwrap(), z.string(), z.number()])
  .readonly();
type testUnion = z.infer<typeof testUnion>;

// Intersections

// const testIntersection = z.intersection(testObject, testMap).readonly();
// type testIntersection = z.infer<typeof testIntersection>;

// Functions

const testFunction = z
  .function(z.tuple([testObject, testArray, z.string()]), z.number())
  .readonly();
type testFunction = z.infer<typeof testFunction>;

// Dates

const testDate = z.date().readonly();
type testDate = z.infer<typeof testDate>;

test("type inference", () => {
  type testObjectType = {
    readonly f1: number;
    readonly f2?: string | undefined;
    readonly f3: string | null;
    readonly f4: { t: string | boolean }[];
  };
  util.assertEqual<testObject, testObjectType>(true);

  util.assertEqual<testBooleanRecord, Readonly<Record<string, boolean>>>(true);
  util.assertEqual<
    testRecordWithEnumKeys,
    Readonly<Partial<Record<"Tuna" | "Salmon", string>>>
  >(true);
  util.assertEqual<
    testRecordWithLiteralKeys,
    Readonly<Partial<Record<"Tuna" | "Salmon", string>>>
  >(true);

  util.assertEqual<testArray, Readonly<string[]>>(true);

  util.assertEqual<testMap, ReadonlyMap<string, number>>(true);
  util.assertEqual<testSet, ReadonlySet<string>>(true);

  util.assertEqual<
    testTuple,
    readonly [testObjectType, Readonly<string[]>, string]
  >(true);

  util.assertEqual<testUnion, ReadonlyMap<string, number> | string | number>(
    true
  );

  // util.assertEqual<
  //   testIntersection,
  //   testObjectType & ReadonlyMap<string, number>
  // >(true);

  util.assertEqual<
    testFunction,
    (arg0: testObjectType, arg1: Readonly<string[]>, arg2: string) => number
  >(true);

  util.assertEqual<
    testDate,
    Readonly<
      Omit<
        Date,
        | "setTime"
        | "setMilliseconds"
        | "setUTCMilliseconds"
        | "setSeconds"
        | "setUTCSeconds"
        | "setMinutes"
        | "setUTCMinutes"
        | "setHours"
        | "setUTCHours"
        | "setDate"
        | "setUTCDate"
        | "setMonth"
        | "setUTCMonth"
        | "setFullYear"
        | "setUTCFullYear"
      >
    >
  >(true);
});

test("correct freezing", () => {
  const testObjectValue = {
    f1: 12,
    f2: "string",
    f3: "string",
    f4: [{ t: "string" }],
  };
  expect(Object.isFrozen(testObject.parse(testObjectValue))).toBe(true);

  expect(Object.isFrozen(testBooleanRecord.parse({ a: true, b: false }))).toBe(
    true
  );
  expect(Object.isFrozen(testRecordWithEnumKeys.parse({ Tuna: "Tuna" }))).toBe(
    true
  );

  expect(Object.isFrozen(testArray.parse(["a", "b"]))).toBe(true);

  expect(Object.isFrozen(testMap.parse(new Map([["a", 12]])))).toBe(true);
  expect(Object.isFrozen(testSet.parse(new Set(["a"])))).toBe(true);

  const testTupleResult = testTuple.parse([testObjectValue, ["a"], "b"]);
  expect(Object.isFrozen(testTupleResult)).toBe(true);
  expect(Object.isFrozen(testTupleResult[0])).toBe(true);
  expect(Object.isFrozen(testTupleResult[1])).toBe(true);

  expect(Object.isFrozen(testUnion.parse(new Map([["a", 12]])))).toBe(true);
  expect(Object.isFrozen(testUnion.parse("a"))).toBe(true);
  expect(Object.isFrozen(testUnion.parse(12))).toBe(true);

  expect(Object.isFrozen(testDate.parse(new Date("2020-01-01")))).toBe(true);
});
