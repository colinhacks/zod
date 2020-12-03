// @ts-ignore TS6133
import { expect } from 'https://deno.land/x/expect@v0.2.6/mod.ts';
const test = Deno.test;

import * as z from '../index.ts';
import { util } from '../helpers/util.ts';

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
