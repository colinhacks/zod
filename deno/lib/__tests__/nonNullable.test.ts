// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("parses a number correctly using z....nonNullable()", () => {
  const a = z.nullable(z.number()).nonNullable();
  type a = z.infer<typeof a>;
  const foo: a = a.parse(5);
  expect(foo).toEqual(5);
});

test("parses a number correctly using z.nonNullable(...)", () => {
  const a = z.nonNullable(z.any());
  type a = z.infer<typeof a>;
  const foo: a = a.parse(5);
  expect(foo).toEqual(5);
});

test("fails is passed null", () => {
  const a = z.nullable(z.any()).nonNullable();

  expect(() => {
    a.parse(null);
  }).toThrow(z.ZodError)
});

test("fails is passed undefined", () => {
  const a = z.nullable(z.any()).nonNullable();

  expect(() => {
    a.parse(undefined);
  }).toThrow(z.ZodError)
});

test("unwrap", () => {
  const unwrapped = z.any().nonNullable().unwrap();
  expect(unwrapped).toBeInstanceOf(z.ZodAny);
});
