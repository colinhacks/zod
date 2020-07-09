import * as z from '../index';
import { util } from '../helpers/util';

test('create enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  MyEnum.Values.Red === 'Red';
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
