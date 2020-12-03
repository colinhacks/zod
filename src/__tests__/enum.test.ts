// @ts-ignore TS6133
import { describe, expect, test } from '@jest/globals';

import * as z from '../index';
import { util } from '../helpers/util';

test('create enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  expect(MyEnum.Values.Red).toEqual('Red');
  expect(MyEnum.Enum.Red).toEqual('Red');
  expect(MyEnum.enum.Red).toEqual('Red');
});

test('infer enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  type MyEnum = z.infer<typeof MyEnum>;
  const t1: util.AssertEqual<MyEnum, 'Red' | 'Green' | 'Blue'> = true;
  [t1];
});

test('get options', () => {
  expect(z.enum(['tuna', 'trout']).options).toEqual(['tuna', 'trout']);
});
