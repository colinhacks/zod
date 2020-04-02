import * as z from '../index';
import { AssertEqual } from '../helpers/util';

test('create enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  MyEnum.Values.Red === 'Red';
});

test('infer enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  type MyEnum = z.Infer<typeof MyEnum>;
  const t1: AssertEqual<MyEnum, 'Red' | 'Green' | 'Blue'> = true;
  [t1];
});
