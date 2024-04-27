// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("create enum", () => {
  const MyEnum = z.enum(["Red", "Green", "Blue"]);
  expect(MyEnum.Values.Red).toEqual("Red");
  expect(MyEnum.Enum.Red).toEqual("Red");
  expect(MyEnum.enum.Red).toEqual("Red");
});

test("infer enum", () => {
  const MyEnum = z.enum(["Red", "Green", "Blue"]);
  type MyEnum = z.infer<typeof MyEnum>;
  util.assertEqual<MyEnum, "Red" | "Green" | "Blue">(true);
});

test("get options", () => {
  expect(z.enum(["tuna", "trout"]).options).toEqual(["tuna", "trout"]);
});

test("readonly enum", () => {
  const HTTP_SUCCESS = ["200", "201"] as const;
  const arg = z.enum(HTTP_SUCCESS);
  type arg = z.infer<typeof arg>;
  util.assertEqual<arg, "200" | "201">(true);

  arg.parse("201");
  expect(() => arg.parse("202")).toThrow();
});

test("error params", () => {
  const result = z
    .enum(["test"], { required_error: "REQUIRED" })
    .safeParse(undefined);
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("REQUIRED");
  }
});

test("extract/exclude", () => {
  const foods = ["Pasta", "Pizza", "Tacos", "Burgers", "Salad"] as const;
  const FoodEnum = z.enum(foods);
  const ItalianEnum = FoodEnum.extract(["Pasta", "Pizza"]);
  const UnhealthyEnum = FoodEnum.exclude(["Salad"]);
  const EmptyFoodEnum = FoodEnum.exclude(foods);

  util.assertEqual<z.infer<typeof ItalianEnum>, "Pasta" | "Pizza">(true);
  util.assertEqual<
    z.infer<typeof UnhealthyEnum>,
    "Pasta" | "Pizza" | "Tacos" | "Burgers"
  >(true);
  // @ts-expect-error TS2344
  util.assertEqual<typeof EmptyFoodEnum, z.ZodEnum<[]>>(true);
  util.assertEqual<z.infer<typeof EmptyFoodEnum>, never>(true);
});

test("extract/exclude with single value", () => {
  const _enum = z.enum(["Red", "Green", "Blue"]);

  const a1 = _enum.exclude("Red");
  util.assertEqual<typeof a1, z.ZodEnum<["Green", "Blue"]>>(true);
  const a2 = _enum.exclude(["Red"]);
  util.assertEqual<typeof a2, z.ZodEnum<["Green", "Blue"]>>(true);
  const a3 = _enum.extract("Red");
  util.assertEqual<typeof a3, z.ZodEnum<["Red"]>>(true);
  const a4 = _enum.extract(["Red"]);
  util.assertEqual<typeof a4, z.ZodEnum<["Red"]>>(true);

  expect(a1.parse("Green")).toEqual("Green");
  expect(() => a1.parse("Red")).toThrow();
  expect(a2.parse("Green")).toEqual("Green");
  expect(() => a2.parse("Red")).toThrow();
  expect(a3.parse("Red")).toEqual("Red");
  expect(() => a3.parse("Green")).toThrow();
  expect(a4.parse("Red")).toEqual("Red");
  expect(() => a4.parse("Green")).toThrow();
});
