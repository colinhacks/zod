// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("array min", async () => {
  try {
    await z.array(z.string()).min(4).parseAsync([]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain at least 4 element(s)"
    );
  }
});

test("array max", async () => {
  try {
    await z.array(z.string()).max(2).parseAsync(["asdf", "asdf", "asdf"]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain at most 2 element(s)"
    );
  }
});

test("string min", async () => {
  try {
    await z.string().min(4).parseAsync("asd");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain at least 4 character(s)"
    );
  }
});

test("string max", async () => {
  try {
    await z.string().max(4).parseAsync("aasdfsdfsd");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain at most 4 character(s)"
    );
  }
});

test("number min", async () => {
  try {
    await z.number().gte(3).parseAsync(2);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than or equal to 3"
    );
  }
});

test("number max", async () => {
  try {
    await z.number().lte(3).parseAsync(4);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than or equal to 3"
    );
  }
});

test("number nonnegative", async () => {
  try {
    await z.number().nonnegative().parseAsync(-1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than or equal to 0"
    );
  }
});

test("number nonpositive", async () => {
  try {
    await z.number().nonpositive().parseAsync(1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than or equal to 0"
    );
  }
});

test("number negative", async () => {
  try {
    await z.number().negative().parseAsync(1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than 0"
    );
  }
});

test("number positive", async () => {
  try {
    await z.number().positive().parseAsync(-1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than 0"
    );
  }
});

test("instantiation", () => {
  z.string().min(5);
  z.string().max(5);
  z.string().length(5);
  z.string().email();
  z.string().url();
  z.string().uuid();
  z.string().min(5, { message: "Must be 5 or more characters long" });
  z.string().max(5, { message: "Must be 5 or fewer characters long" });
  z.string().length(5, { message: "Must be exactly 5 characters long" });
  z.string().email({ message: "Invalid email address." });
  z.string().url({ message: "Invalid url" });
  z.string().uuid({ message: "Invalid UUID" });
});

test("int", async () => {
  const int = z.number().int();
  int.parse(4);
  expect(() => int.parse(3.5)).toThrow();
});
