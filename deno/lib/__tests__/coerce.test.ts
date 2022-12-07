// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("string coercion", () => {
  const schema = z.coerce.string();
  expect(schema.parse("sup")).toEqual("sup");
  expect(schema.parse(12)).toEqual("12");
  expect(schema.parse(true)).toEqual("true");
  expect(schema.parse(BigInt(15))).toEqual("15");
});

test("number coercion", () => {
  const schema = z.coerce.number();
  expect(schema.parse("12")).toEqual(12);
  expect(schema.parse(12)).toEqual(12);
  expect(schema.parse(true)).toEqual(1);
  expect(schema.parse(BigInt(15))).toEqual(15);
  expect(schema.parse(new Date(1670139203496))).toEqual(1670139203496);
});

test("boolean coercion", () => {
  const schema = z.coerce.boolean();
  expect(schema.parse("")).toEqual(false);
  expect(schema.parse("12")).toEqual(true);
  expect(schema.parse(0)).toEqual(false);
  expect(schema.parse(12)).toEqual(true);
  expect(schema.parse(true)).toEqual(true);
});

test("bigint coercion", () => {
  const schema = z.coerce.bigint();
  expect(schema.parse("5")).toEqual(BigInt(5));
  expect(schema.parse(0)).toEqual(BigInt(0));
  expect(schema.parse(BigInt(5))).toEqual(BigInt(5));
  expect(schema.parse(new Date(1670139203496))).toEqual(BigInt(1670139203496));
});

test("date coercion", () => {
  const schema = z.coerce.date();
  expect(schema.parse("5") instanceof Date).toEqual(true);
  expect(schema.parse(0) instanceof Date).toEqual(true);
  expect(schema.parse(new Date()) instanceof Date).toEqual(true);
});
