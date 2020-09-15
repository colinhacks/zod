import * as z from '..';
/// string
const stringSchema = z.string();
test('string async parse', async () => {
  const goodData = 'XXX';
  const badData = 12;

  const goodResult = await stringSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await stringSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// number
const numberSchema = z.number();
test('number async parse', async () => {
  const goodData = 1234.2353;
  const badData = '1234';

  const goodResult = await numberSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await numberSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// bigInt
const bigIntSchema = z.bigint();
test('bigInt async parse', async () => {
  const goodData = BigInt(145);
  const badData = 134;

  const goodResult = await bigIntSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await bigIntSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// boolean
const booleanSchema = z.boolean();
test('boolean async parse', async () => {
  const goodData = true;
  const badData = 1;

  const goodResult = await booleanSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await booleanSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// date
const dateSchema = z.date();
test('date async parse', async () => {
  const goodData = new Date();
  const badData = new Date().toISOString();

  const goodResult = await dateSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await dateSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// undefined
const undefinedSchema = z.undefined();
test('undefined async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await undefinedSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await undefinedSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// null
const nullSchema = z.null();
test('null async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await nullSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await nullSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// any
const anySchema = z.any();
test('any async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await anySchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await anySchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// unknown
const unknownSchema = z.unknown();
test('unknown async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await unknownSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await unknownSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// void
const voidSchema = z.void();
test('void async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await voidSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await voidSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// array
const arraySchema = z.array(z.string());
test('array async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await arraySchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await arraySchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// object
const objectSchema = z.object();
test('object async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await objectSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await objectSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// union
const unionSchema = z.union();
test('union async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await unionSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await unionSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// intersection
const intersectionSchema = z.intersection();
test('intersection async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await intersectionSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await intersectionSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// tuple
const tupleSchema = z.tuple();
test('tuple async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await tupleSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await tupleSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// record
const recordSchema = z.record();
test('record async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await recordSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await recordSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// function
const functionSchema = z.function();
test('function async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await functionSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await functionSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// lazy
const lazySchema = z.lazy();
test('lazy async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await lazySchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await lazySchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// literal
const literalSchema = z.literal();
test('literal async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await literalSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await literalSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// enum
const enumSchema = z.enum();
test('enum async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await enumSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await enumSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// nativeEnum
const nativeEnumSchema = z.nativeEnum();
test('nativeEnum async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await nativeEnumSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await nativeEnumSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// promise
const promiseSchema = z.promise();
test('promise async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await promiseSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await promiseSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// transformer
const transformerSchema = z.transformer();
test('transformer async parse', async () => {
  const goodData = 'XXX';
  const badData = 'XXX';

  const goodResult = await transformerSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await transformerSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});
