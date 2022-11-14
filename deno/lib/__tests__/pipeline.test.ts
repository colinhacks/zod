// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("string to number pipeline", () => {
  const schema = z.string().transform(Number).pipe(z.number());
  expect(schema.parse("1234")).toEqual(1234);
});

test("string to number pipeline async", async () => {
  const schema = z
    .string()
    .transform(async (val) => Number(val))
    .pipe(z.number());
  expect(await schema.parseAsync("1234")).toEqual(1234);
});

test("break if dirty", () => {
  const schema = z
    .string()
    .refine((c) => c === "1234")
    .transform(async (val) => Number(val))
    .pipe(z.number().refine((v) => v < 100));
  const r1: any = schema.safeParse("12345");
  expect(r1.error.issues.length).toBe(1);
  const r2: any = schema.safeParse("3");
  expect(r2.error.issues.length).toBe(1);
});
