// @ts-ignore TS6133
import { expect, test } from '@jest/globals';

import { util } from '../src/helpers/util';
import * as z from '../src/index';

const nested = z.object({
  name: z.string(),
  age: z.number(),
  outer: z.object({
    inner: z.string(),
  }),
});

test('shallow inference', () => {
  const shallow = nested.partial();
  type shallow = z.infer<typeof shallow>;
  type correct = {
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner: string } | undefined;
  };
  const t1: util.AssertEqual<shallow, correct> = true;
  t1;
});

test('shallow partial parse', () => {
  const shallow = nested.partial();
  shallow.parse({});
  shallow.parse({
    name: 'asdf',
    age: 23143,
  });
});

test('deep partial inference', () => {
  const deep = nested.deepPartial();
  type deep = z.infer<typeof deep>;
  type correct = {
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner?: string | undefined } | undefined;
  };

  const t1: util.AssertEqual<deep, correct> = true;
  t1;
});

test('deep partial parse', () => {
  const deep = nested.deepPartial();

  expect(deep.shape.name instanceof z.ZodOptional).toBe(true);
  expect(deep.shape.outer instanceof z.ZodOptional).toBe(true);
  expect(deep.shape.outer._def.innerType instanceof z.ZodObject).toBe(true);
  expect(
    deep.shape.outer._def.innerType.shape.inner instanceof z.ZodOptional
  ).toBe(true);
  expect(
    deep.shape.outer._def.innerType.shape.inner._def.innerType instanceof
      z.ZodString
  ).toBe(true);
});

test('deep partial runtime tests', () => {
  const deep = nested.deepPartial();
  deep.parse({});
  deep.parse({
    outer: {},
  });
  deep.parse({
    name: 'asdf',
    age: 23143,
    outer: {
      inner: 'adsf',
    },
  });
});
