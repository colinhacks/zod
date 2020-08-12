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

test('nativeEnum test with consts', () => {
  const Fruits: { Apple: 'apple'; Banana: 'banana' } = { Apple: 'apple', Banana: 'banana' };
  const fruitEnum = z.nativeEnum(Fruits);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse('apple');
  fruitEnum.parse('banana');
  fruitEnum.parse(Fruits.Apple);
  fruitEnum.parse(Fruits.Banana);
  const t1: util.AssertEqual<fruitEnum, 'apple' | 'banana'> = true;
  [t1];
});

test('nativeEnum test with real enum', () => {
  enum Fruits {
    Apple = 'apple',
    Banana = 'banana',
  }
  const fruitEnum = z.nativeEnum(Fruits);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse('apple');
  fruitEnum.parse('banana');
  fruitEnum.parse(Fruits.Apple);
  fruitEnum.parse(Fruits.Banana);
  const t1: util.AssertEqual<fruitEnum, Fruits> = true;
  [t1];
});

test('nativeEnum test with const with numeric keys', () => {
  const FruitValues = {
    Apple: 10,
    Banana: 20,
  } as const;
  const fruitEnum = z.nativeEnum(FruitValues);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse('apple');
  fruitEnum.parse('banana');
  fruitEnum.parse(FruitValues.Apple);
  fruitEnum.parse(FruitValues.Banana);
  const t1: util.AssertEqual<fruitEnum, 10 | 20> = true;
  [t1];
});
