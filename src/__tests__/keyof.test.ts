import * as z from '../index';
import { util } from '../helpers/util';

test('keyof test with consts', () => {
  const Fruits = {
    Apple: 'apple',
    Banana: 'banana',
  } as const;
  const fruitKeyof = z.keyof(Fruits);
  Object.keys(Fruits).forEach(k => fruitKeyof.parse(k));
  type fruitKeyof = z.infer<typeof fruitKeyof>;
  const t1: util.AssertEqual<fruitKeyof, keyof typeof Fruits> = true;
  t1;
});

test('keyof test with real enum', () => {
  enum Fruits {
    Apple = 'apple',
    Banana = 'banana',
  }
  // @ts-ignore
  const fruitKeyof = z.keyof(Fruits);
  Object.keys(Fruits).forEach(k => fruitKeyof.parse(k));
  type fruitKeyof = z.infer<typeof fruitKeyof>;
  const t1: util.AssertEqual<fruitKeyof, keyof typeof Fruits> = true;
  t1;
});

test('keyof test with const with numeric keys', () => {
  const Fruits = {
    10: 'apple',
    20: 'banana',
  } as const;
  const fruitKeyof = z.keyof(Fruits);
  Object.keys(Fruits).forEach(k => fruitKeyof.parse(k));
  type fruitKeyof = z.infer<typeof fruitKeyof>;
  const t1: util.AssertEqual<fruitKeyof, keyof typeof Fruits> = true;
  t1;
});

test('from enum', () => {
  enum Fruits {
    Cantaloupe,
    Apple = 'apple',
    Banana = 'banana',
  }
  // @ts-ignore
  const fruitKeyof = z.keyof(Fruits);
  Object.keys(Fruits).forEach(k => fruitKeyof.parse(k));
  type fruitKeyof = z.infer<typeof fruitKeyof>;
  const t1: util.AssertEqual<fruitKeyof, keyof typeof Fruits> = true;
  t1;
  expect(() => fruitKeyof.parse(1)).toThrow();
  expect(() => fruitKeyof.parse('apple')).toThrow();
  expect(() => fruitKeyof.parse(0)).toThrow();
});
