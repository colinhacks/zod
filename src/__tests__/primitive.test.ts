// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
import { Mocker } from "./Mocker";

const literalStringSchema = z.literal("asdf");
const literalNumberSchema = z.literal(12);
const literalBooleanSchema = z.literal(true);
const stringSchema = z.string();
const numberSchema = z.number();
const bigintSchema = z.bigint();
const booleanSchema = z.boolean();
const dateSchema = z.date();
const nullSchema = z.null();
const undefinedSchema = z.undefined();
const stringSchemaOptional = z.string().optional();
const stringSchemaNullable = z.string().nullable();
const numberSchemaOptional = z.number().optional();
const numberSchemaNullable = z.number().nullable();
const bigintSchemaOptional = z.bigint().optional();
const bigintSchemaNullable = z.bigint().nullable();
const booleanSchemaOptional = z.boolean().optional();
const booleanSchemaNullable = z.boolean().nullable();
const dateSchemaOptional = z.date().optional();
const dateSchemaNullable = z.date().nullable();

const val = new Mocker();

test("literal string correct", () => {
  expect(literalStringSchema.parse("asdf")).toBe("asdf");
});

test("literal string incorrect", () => {
  const f = () => literalStringSchema.parse("not_asdf");
  expect(f).toThrow();
});

test("literal string number", () => {
  const f = () => literalStringSchema.parse(123);
  expect(f).toThrow();
});

test("literal string boolean", () => {
  const f = () => literalStringSchema.parse(true);
  expect(f).toThrow();
});

test("literal string boolean", () => {
  const f = () => literalStringSchema.parse(true);
  expect(f).toThrow();
});

test("literal string object", () => {
  const f = () => literalStringSchema.parse({});
  expect(f).toThrow();
});

test("literal number correct", () => {
  expect(literalNumberSchema.parse(12)).toBe(12);
});

test("literal number incorrect", () => {
  const f = () => literalNumberSchema.parse(13);
  expect(f).toThrow();
});

test("literal number number", () => {
  const f = () => literalNumberSchema.parse(val.string);
  expect(f).toThrow();
});

test("literal number boolean", () => {
  const f = () => literalNumberSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("literal number object", () => {
  const f = () => literalStringSchema.parse({});
  expect(f).toThrow();
});

test("literal boolean correct", () => {
  expect(literalBooleanSchema.parse(true)).toBe(true);
});

test("literal boolean incorrect", () => {
  const f = () => literalBooleanSchema.parse(false);
  expect(f).toThrow();
});

test("literal boolean number", () => {
  const f = () => literalBooleanSchema.parse("asdf");
  expect(f).toThrow();
});

test("literal boolean boolean", () => {
  const f = () => literalBooleanSchema.parse(123);
  expect(f).toThrow();
});

test("literal boolean object", () => {
  const f = () => literalBooleanSchema.parse({});
  expect(f).toThrow();
});

test("parse stringSchema string", () => {
  stringSchema.parse(val.string);
});

test("parse stringSchema number", () => {
  const f = () => stringSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse stringSchema boolean", () => {
  const f = () => stringSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse stringSchema undefined", () => {
  const f = () => stringSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse stringSchema null", () => {
  const f = () => stringSchema.parse(val.null);
  expect(f).toThrow();
});

test("parse numberSchema string", () => {
  const f = () => numberSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse numberSchema number", () => {
  numberSchema.parse(val.number);
});

test("parse numberSchema bigint", () => {
  const f = () => numberSchema.parse(val.bigint);
  expect(f).toThrow();
});

test("parse numberSchema boolean", () => {
  const f = () => numberSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse numberSchema undefined", () => {
  const f = () => numberSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse numberSchema null", () => {
  const f = () => numberSchema.parse(val.null);
  expect(f).toThrow();
});

test("parse bigintSchema string", () => {
  const f = () => bigintSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse bigintSchema number", () => {
  const f = () => bigintSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse bigintSchema bigint", () => {
  bigintSchema.parse(val.bigint);
});

test("parse bigintSchema boolean", () => {
  const f = () => bigintSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse bigintSchema undefined", () => {
  const f = () => bigintSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse bigintSchema null", () => {
  const f = () => bigintSchema.parse(val.null);
  expect(f).toThrow();
});

test("parse booleanSchema string", () => {
  const f = () => booleanSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse booleanSchema number", () => {
  const f = () => booleanSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse booleanSchema boolean", () => {
  booleanSchema.parse(val.boolean);
});

test("parse booleanSchema undefined", () => {
  const f = () => booleanSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse booleanSchema null", () => {
  const f = () => booleanSchema.parse(val.null);
  expect(f).toThrow();
});

// ==============

test("parse dateSchema string", () => {
  const f = () => dateSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse dateSchema number", () => {
  const f = () => dateSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse dateSchema boolean", () => {
  const f = () => dateSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse dateSchema date", () => {
  dateSchema.parse(val.date);
});

test("parse dateSchema undefined", () => {
  const f = () => dateSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse dateSchema null", () => {
  const f = () => dateSchema.parse(val.null);
  expect(f).toThrow();
});

test("parse dateSchema invalid date", async () => {
  try {
    await dateSchema.parseAsync(new Date("invalid"));
  } catch (err) {
    expect((err as z.ZodError).issues[0].code).toEqual(
      z.ZodIssueCode.invalid_date
    );
  }
});
// ==============

test("parse undefinedSchema string", () => {
  const f = () => undefinedSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse undefinedSchema number", () => {
  const f = () => undefinedSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse undefinedSchema boolean", () => {
  const f = () => undefinedSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse undefinedSchema undefined", () => {
  undefinedSchema.parse(val.undefined);
});

test("parse undefinedSchema null", () => {
  const f = () => undefinedSchema.parse(val.null);
  expect(f).toThrow();
});

test("parse nullSchema string", () => {
  const f = () => nullSchema.parse(val.string);
  expect(f).toThrow();
});

test("parse nullSchema number", () => {
  const f = () => nullSchema.parse(val.number);
  expect(f).toThrow();
});

test("parse nullSchema boolean", () => {
  const f = () => nullSchema.parse(val.boolean);
  expect(f).toThrow();
});

test("parse nullSchema undefined", () => {
  const f = () => nullSchema.parse(val.undefined);
  expect(f).toThrow();
});

test("parse nullSchema null", () => {
  nullSchema.parse(val.null);
});

export type AssertEqualTest = boolean | undefined extends true
  ? true extends boolean | undefined
    ? true
    : never
  : never;

type AssertEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : never;

test("primitive inference", () => {
  const literalStringSchemaTest: AssertEqual<
    z.TypeOf<typeof literalStringSchema>,
    "asdf"
  > = true;
  const literalNumberSchemaTest: AssertEqual<
    z.TypeOf<typeof literalNumberSchema>,
    12
  > = true;
  const literalBooleanSchemaTest: AssertEqual<
    z.TypeOf<typeof literalBooleanSchema>,
    true
  > = true;
  const stringSchemaTest: AssertEqual<
    z.TypeOf<typeof stringSchema>,
    string
  > = true;
  const numberSchemaTest: AssertEqual<
    z.TypeOf<typeof numberSchema>,
    number
  > = true;
  const bigintSchemaTest: AssertEqual<
    z.TypeOf<typeof bigintSchema>,
    bigint
  > = true;
  const booleanSchemaTest: AssertEqual<
    z.TypeOf<typeof booleanSchema>,
    boolean
  > = true;
  const dateSchemaTest: AssertEqual<z.TypeOf<typeof dateSchema>, Date> = true;
  const nullSchemaTest: AssertEqual<z.TypeOf<typeof nullSchema>, null> = true;
  const undefinedSchemaTest: AssertEqual<
    z.TypeOf<typeof undefinedSchema>,
    undefined
  > = true;
  const stringSchemaOptionalTest: AssertEqual<
    z.TypeOf<typeof stringSchemaOptional>,
    string | undefined
  > = true;
  const stringSchemaNullableTest: AssertEqual<
    z.TypeOf<typeof stringSchemaNullable>,
    string | null
  > = true;
  const numberSchemaOptionalTest: AssertEqual<
    z.TypeOf<typeof numberSchemaOptional>,
    number | undefined
  > = true;
  const numberSchemaNullableTest: AssertEqual<
    z.TypeOf<typeof numberSchemaNullable>,
    number | null
  > = true;
  const bigintSchemaOptionalTest: AssertEqual<
    z.TypeOf<typeof bigintSchemaOptional>,
    bigint | undefined
  > = true;
  const bigintSchemaNullableTest: AssertEqual<
    z.TypeOf<typeof bigintSchemaNullable>,
    bigint | null
  > = true;
  const booleanSchemaOptionalTest: AssertEqual<
    z.TypeOf<typeof booleanSchemaOptional>,
    boolean | undefined
  > = true;
  const booleanSchemaNullableTest: AssertEqual<
    z.TypeOf<typeof booleanSchemaNullable>,
    boolean | null
  > = true;
  const dateSchemaOptionalTest: AssertEqual<
    z.TypeOf<typeof dateSchemaOptional>,
    Date | undefined
  > = true;
  const dateSchemaNullableTest: AssertEqual<
    z.TypeOf<typeof dateSchemaNullable>,
    Date | null
  > = true;

  [
    literalStringSchemaTest,
    literalNumberSchemaTest,
    literalBooleanSchemaTest,
    stringSchemaTest,
    numberSchemaTest,
    bigintSchemaTest,
    booleanSchemaTest,
    dateSchemaTest,
    nullSchemaTest,
    undefinedSchemaTest,
    stringSchemaOptionalTest,
    stringSchemaNullableTest,
    numberSchemaOptionalTest,
    numberSchemaNullableTest,
    bigintSchemaOptionalTest,
    bigintSchemaNullableTest,
    booleanSchemaOptionalTest,
    booleanSchemaNullableTest,
    dateSchemaOptionalTest,
    dateSchemaNullableTest,
  ];
});

test("get literal value", () => {
  expect(literalStringSchema.value).toEqual("asdf");
});

test("optional convenience methd", () => {
  z.ostring().parse(undefined);
  z.onumber().parse(undefined);
  z.oboolean().parse(undefined);
});
