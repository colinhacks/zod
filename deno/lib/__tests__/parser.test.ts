// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("parse strict object with unknown keys", () => {
  expect(() =>
    z
      .object({ name: z.string() })
      .strict()
      .parse({ name: "bill", unknownKey: 12 } as any)
  ).toThrow();
});

test("parse nonstrict object with unknown keys", () => {
  z.object({ name: z.string() })
    .nonstrict()
    .parse({ name: "bill", unknownKey: 12 });
});

test("invalid left side of intersection", () => {
  expect(() =>
    z.intersection(z.string(), z.number()).parse(12 as any)
  ).toThrow();
});

test("invalid right side of intersection", () => {
  expect(() =>
    z.intersection(z.string(), z.number()).parse("12" as any)
  ).toThrow();
});

test("parsing non-array in tuple schema", () => {
  expect(() => z.tuple([]).parse("12" as any)).toThrow();
});

test("incorrect num elements in tuple", () => {
  expect(() => z.tuple([]).parse(["asdf"] as any)).toThrow();
});

test("invalid enum value", () => {
  expect(() => z.enum(["Blue"]).parse("Red" as any)).toThrow();
});

test("parsing unknown", () => {
  z.string().parse("Red" as unknown);
});
