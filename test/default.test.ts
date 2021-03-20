// @ts-ignore TS6133
import { expect, test } from '@jest/globals';
import { util } from '../src/helpers/util';
import { z } from '../src/index';

test('basic defaults', () => {
  expect(z.string().default('default').parse(undefined)).toBe('default');
});

test('default with transform', () => {
  const stringWithDefault = z
    .string()
    .transform((val) => val.toUpperCase())
    .default('default');
  expect(stringWithDefault.parse(undefined)).toBe('DEFAULT');
  expect(stringWithDefault).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodEffects);
  expect(stringWithDefault._def.innerType._def.schema).toBeInstanceOf(
    z.ZodSchema
  );

  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string> = true;
  f1;
  f2;
});

test('default on existing optional', () => {
  const stringWithDefault = z.string().optional().default('asdf');
  expect(stringWithDefault.parse(undefined)).toBe('asdf');
  expect(stringWithDefault).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType._def.innerType).toBeInstanceOf(
    z.ZodString
  );
  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string | undefined> = true;
  f1;
  f2;
});

test('optional on default', () => {
  const stringWithDefault = z.string().default('asdf').optional();

  type inp = z.input<typeof stringWithDefault>;
  const f1: util.AssertEqual<inp, string | undefined> = true;
  type out = z.output<typeof stringWithDefault>;
  const f2: util.AssertEqual<out, string> = true;
  f1;
  f2;
});

test('complex chain example', () => {
  const complex = z
    .string()
    .default('asdf')
    .optional()
    .transform((val) => val.toUpperCase())
    .default('qwer')
    .removeDefault()
    .optional()
    .default('asdfasdf');

  expect(complex.parse(undefined)).toBe('ASDFASDF');
});

test('removeDefault', () => {
  const stringWithRemovedDefault = z.string().default('asdf').removeDefault();

  type out = z.output<typeof stringWithRemovedDefault>;
  const f2: util.AssertEqual<out, string | undefined> = true;
  f2;
  expect(stringWithRemovedDefault.parse(undefined)).toBe(undefined);
});

test('nested', () => {
  const inner = z.string().default('asdf');
  const outer = z.object({ inner }).default({
    inner: undefined,
  });
  type input = z.input<typeof outer>;
  const f1: util.AssertEqual<
    input,
    { inner?: string | undefined } | undefined
  > = true;
  type out = z.output<typeof outer>;
  const f2: util.AssertEqual<out, { inner: string }> = true;
  f1;
  f2;
  expect(outer.parse(undefined)).toEqual({ inner: 'asdf' });
  expect(outer.parse({})).toEqual({ inner: 'asdf' });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: 'asdf' });
});
