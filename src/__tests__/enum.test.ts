// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("create enum", () => {
  const MyEnum = z.enumeration(["Red", "Green", "Blue"]);
  expect(MyEnum.Values.Red).toEqual("Red");
  expect(MyEnum.Enum.Red).toEqual("Red");
  expect(MyEnum.enum.Red).toEqual("Red");
});

test("infer enum", () => {
  const MyEnum = z.enumeration(["Red", "Green", "Blue"]);
  type MyEnum = z.infer<typeof MyEnum>;
  const t1: util.AssertEqual<MyEnum, "Red" | "Green" | "Blue"> = true;
  [t1];
});

test("get options", () => {
  expect(z.enumeration(["tuna", "trout"]).options).toEqual(["tuna", "trout"]);
});
