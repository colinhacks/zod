import * as z from '../index';
import { Mocker } from '../helpers/Mocker';

const literalStringSchema = z.literal('asdf');
const literalNumberSchema = z.literal(12);
const literalBooleanSchema = z.literal(true);
const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();
const nullSchema = z.null();
const undefinedSchema = z.undefined();
const stringSchemaOptional = z.string().optional();
const stringSchemaNullable = z.string().nullable();
const numberSchemaOptional = z.number().optional();
const numberSchemaNullable = z.number().nullable();
const booleanSchemaOptional = z.boolean().optional();
const booleanSchemaNullable = z.boolean().nullable();

const val = new Mocker();

test('literal string correct', () => {
  expect(literalStringSchema.parse('asdf')).toBe('asdf');
});

test('literal string incorrect', () => {
  const f = () => literalStringSchema.parse('not_asdf' as any);
  expect(f).toThrow();
});

test('literal string number', () => {
  const f = () => literalStringSchema.parse(123 as any);
  expect(f).toThrow();
});

test('literal string boolean', () => {
  const f = () => literalStringSchema.parse(true as any);
  expect(f).toThrow();
});

test('literal string object', () => {
  const f = () => literalStringSchema.parse({} as any);
  expect(f).toThrow();
});

test('literal number correct', () => {
  expect(literalNumberSchema.parse(12)).toBe(12);
});

test('literal number incorrect', () => {
  const f = () => literalNumberSchema.parse(13 as any);
  expect(f).toThrow();
});

test('literal number number', () => {
  const f = () => literalNumberSchema.parse(val.string as any);
  expect(f).toThrow();
});

test('literal number boolean', () => {
  const f = () => literalNumberSchema.parse(val.boolean as any);
  expect(f).toThrow();
});

test('literal number object', () => {
  const f = () => literalStringSchema.parse({} as any);
  expect(f).toThrow();
});

test('literal boolean correct', () => {
  expect(literalBooleanSchema.parse(true)).toBe(true);
});

test('literal boolean incorrect', () => {
  const f = () => literalBooleanSchema.parse(false as any);
  expect(f).toThrow();
});

test('literal boolean number', () => {
  const f = () => literalBooleanSchema.parse('asdf' as any);
  expect(f).toThrow();
});

test('literal boolean boolean', () => {
  const f = () => literalBooleanSchema.parse(123 as any);
  expect(f).toThrow();
});

test('literal boolean object', () => {
  const f = () => literalBooleanSchema.parse({} as any);
  expect(f).toThrow();
});

test('parse stringSchema string', () => {
  stringSchema.parse(val.string);
});

test('parse stringSchema number', () => {
  const f = () => stringSchema.parse(val.number as any);
  expect(f).toThrow();
});

test('parse stringSchema boolean', () => {
  const f = () => stringSchema.parse(val.boolean as any);
  expect(f).toThrow();
});

test('parse stringSchema undefined', () => {
  const f = () => stringSchema.parse(val.undefined as any);
  expect(f).toThrow();
});

test('parse stringSchema null', () => {
  const f = () => stringSchema.parse(val.null as any);
  expect(f).toThrow();
});

test('parse numberSchema string', () => {
  const f = () => numberSchema.parse(val.string as any);
  expect(f).toThrow();
});

test('parse numberSchema number', () => {
  numberSchema.parse(val.number);
});

test('parse numberSchema boolean', () => {
  const f = () => numberSchema.parse(val.boolean as any);
  expect(f).toThrow();
});

test('parse numberSchema undefined', () => {
  const f = () => numberSchema.parse(val.undefined as any);
  expect(f).toThrow();
});

test('parse numberSchema null', () => {
  const f = () => numberSchema.parse(val.null as any);
  expect(f).toThrow();
});

test('parse booleanSchema string', () => {
  const f = () => booleanSchema.parse(val.string as any);
  expect(f).toThrow();
});

test('parse booleanSchema number', () => {
  const f = () => booleanSchema.parse(val.number as any);
  expect(f).toThrow();
});

test('parse booleanSchema boolean', () => {
  booleanSchema.parse(val.boolean);
});

test('parse booleanSchema undefined', () => {
  const f = () => booleanSchema.parse(val.undefined as any);
  expect(f).toThrow();
});

test('parse booleanSchema null', () => {
  const f = () => booleanSchema.parse(val.null as any);
  expect(f).toThrow();
});

test('parse undefinedSchema string', () => {
  const f = () => undefinedSchema.parse(val.string as any);
  expect(f).toThrow();
});

test('parse undefinedSchema number', () => {
  const f = () => undefinedSchema.parse(val.number as any);
  expect(f).toThrow();
});

test('parse undefinedSchema boolean', () => {
  const f = () => undefinedSchema.parse(val.boolean as any);
  expect(f).toThrow();
});

test('parse undefinedSchema undefined', () => {
  undefinedSchema.parse(val.undefined);
});

test('parse undefinedSchema null', () => {
  const f = () => undefinedSchema.parse(val.null as any);
  expect(f).toThrow();
});

test('parse nullSchema string', () => {
  const f = () => nullSchema.parse(val.string as any);
  expect(f).toThrow();
});

test('parse nullSchema number', () => {
  const f = () => nullSchema.parse(val.number as any);
  expect(f).toThrow();
});

test('parse nullSchema boolean', () => {
  const f = () => nullSchema.parse(val.boolean as any);
  expect(f).toThrow();
});

test('parse nullSchema undefined', () => {
  const f = () => nullSchema.parse(val.undefined as any);
  expect(f).toThrow();
});

test('parse nullSchema null', () => {
  nullSchema.parse(val.null);
});

export type AssertEqualTest = boolean | undefined extends true
  ? true extends boolean | undefined
    ? true
    : never
  : never;

type AssertEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : never;

test('primitive inference', () => {
  const literalStringSchemaTest: AssertEqual<z.TypeOf<typeof literalStringSchema>, 'asdf'> = true;
  const literalNumberSchemaTest: AssertEqual<z.TypeOf<typeof literalNumberSchema>, 12> = true;
  const literalBooleanSchemaTest: AssertEqual<z.TypeOf<typeof literalBooleanSchema>, true> = true;
  const stringSchemaTest: AssertEqual<z.TypeOf<typeof stringSchema>, string> = true;
  const numberSchemaTest: AssertEqual<z.TypeOf<typeof numberSchema>, number> = true;
  const booleanSchemaTest: AssertEqual<z.TypeOf<typeof booleanSchema>, boolean> = true;
  const nullSchemaTest: AssertEqual<z.TypeOf<typeof nullSchema>, null> = true;
  const undefinedSchemaTest: AssertEqual<z.TypeOf<typeof undefinedSchema>, undefined> = true;
  const stringSchemaOptionalTest: AssertEqual<z.TypeOf<typeof stringSchemaOptional>, string | undefined> = true;
  const stringSchemaNullableTest: AssertEqual<z.TypeOf<typeof stringSchemaNullable>, string | null> = true;
  const numberSchemaOptionalTest: AssertEqual<z.TypeOf<typeof numberSchemaOptional>, number | undefined> = true;
  const numberSchemaNullableTest: AssertEqual<z.TypeOf<typeof numberSchemaNullable>, number | null> = true;
  const booleanSchemaOptionalTest: AssertEqual<z.TypeOf<typeof booleanSchemaOptional>, boolean | undefined> = true;
  const booleanSchemaNullableTest: AssertEqual<z.TypeOf<typeof booleanSchemaNullable>, boolean | null> = true;

  [
    literalStringSchemaTest,
    literalNumberSchemaTest,
    literalBooleanSchemaTest,
    stringSchemaTest,
    numberSchemaTest,
    booleanSchemaTest,
    nullSchemaTest,
    undefinedSchemaTest,
    stringSchemaOptionalTest,
    stringSchemaNullableTest,
    numberSchemaOptionalTest,
    numberSchemaNullableTest,
    booleanSchemaOptionalTest,
    booleanSchemaNullableTest,
  ];
});
