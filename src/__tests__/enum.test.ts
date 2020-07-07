import * as z from '../index';
import * as util from '../helpers/util';

test('create enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  expect(MyEnum.Values.Red === 'Red').toBeTruthy();
});

test('infer enum', () => {
  const MyEnum = z.enum(['Red', 'Green', 'Blue']);
  type MyEnum = z.infer<typeof MyEnum>;
  const t1: util.AssertEqual<MyEnum, 'Red' | 'Green' | 'Blue'> = true;
  expect(t1).toBeTruthy();
});
