// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("create enum", () => {
  const MyEnum = z.enum(["Red", "Green", "Blue"]);
  expect(MyEnum.Values.Red).toEqual("Red");
  expect(MyEnum.Enum.Red).toEqual("Red");
  expect(MyEnum.enum.Red).toEqual("Red");
});

test("infer enum", () => {
  const MyEnum = z.enum(["Red", "Green", "Blue"]);
  type MyEnum = z.infer<typeof MyEnum>;
  const t1: util.AssertEqual<MyEnum, "Red" | "Green" | "Blue"> = true;
  [t1];
});

test("get options", () => {
  expect(z.enum(["tuna", "trout"]).options).toEqual(["tuna", "trout"]);
});

test("readonly enum", () => {
  const HTTP_SUCCESS = ["200", "201"] as const;
  const arg = z.enum(HTTP_SUCCESS);
  type arg = z.infer<typeof arg>;
  const f1: util.AssertEqual<arg, "200" | "201"> = true;
  f1;
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
