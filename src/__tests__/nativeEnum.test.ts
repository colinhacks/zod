// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("nativeEnum test with consts", () => {
  const Fruits: { Apple: "apple"; Banana: "banana" } = {
    Apple: "apple",
    Banana: "banana",
  };
  const fruitEnum = z.nativeEnum(Fruits);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse("apple");
  fruitEnum.parse("banana");
  fruitEnum.parse(Fruits.Apple);
  fruitEnum.parse(Fruits.Banana);
  util.assertEqual<fruitEnum, "apple" | "banana">(true);
});

test("nativeEnum test with real enum", () => {
  enum Fruits {
    Apple = "apple",
    Banana = "banana",
  }
  // @ts-ignore
  const fruitEnum = z.nativeEnum(Fruits);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse("apple");
  fruitEnum.parse("banana");
  fruitEnum.parse(Fruits.Apple);
  fruitEnum.parse(Fruits.Banana);
  util.assertIs<fruitEnum extends Fruits ? true : false>(true);
});

test("nativeEnum test with const with numeric keys", () => {
  const FruitValues = {
    Apple: 10,
    Banana: 20,
    // @ts-ignore
  } as const;
  const fruitEnum = z.nativeEnum(FruitValues);
  type fruitEnum = z.infer<typeof fruitEnum>;
  fruitEnum.parse(10);
  fruitEnum.parse(20);
  fruitEnum.parse(FruitValues.Apple);
  fruitEnum.parse(FruitValues.Banana);
  util.assertEqual<fruitEnum, 10 | 20>(true);
});

test("from enum", () => {
  enum Fruits {
    Cantaloupe,
    Apple = "apple",
    Banana = "banana",
  }

  const FruitEnum = z.nativeEnum(Fruits as any);
  type FruitEnum = z.infer<typeof FruitEnum>;
  FruitEnum.parse(Fruits.Cantaloupe);
  FruitEnum.parse(Fruits.Apple);
  FruitEnum.parse("apple");
  FruitEnum.parse(0);
  expect(() => FruitEnum.parse(1)).toThrow();
  expect(() => FruitEnum.parse("Apple")).toThrow();
  expect(() => FruitEnum.parse("Cantaloupe")).toThrow();
});

test("from const", () => {
  const Greek = {
    Alpha: "a",
    Beta: "b",
    Gamma: 3,
    // @ts-ignore
  } as const;

  const GreekEnum = z.nativeEnum(Greek);
  type GreekEnum = z.infer<typeof GreekEnum>;
  GreekEnum.parse("a");
  GreekEnum.parse("b");
  GreekEnum.parse(3);
  expect(() => GreekEnum.parse("v")).toThrow();
  expect(() => GreekEnum.parse("Alpha")).toThrow();
  expect(() => GreekEnum.parse(2)).toThrow();

  expect(GreekEnum.enum.Alpha).toEqual("a");
});
