// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const minFive = z.string().min(5, "min5");
const maxFive = z.string().max(5, "max5");
const justFive = z.string().length(5);
const nonempty = z.string().nonempty("nonempty");

test("passing validations", () => {
  minFive.parse("12345");
  minFive.parse("123456");
  maxFive.parse("12345");
  maxFive.parse("1234");
  nonempty.parse("1");
  justFive.parse("12345");
});

test("failing validations", () => {
  expect(() => minFive.parse("1234")).toThrow();
  expect(() => maxFive.parse("123456")).toThrow();
  expect(() => nonempty.parse("")).toThrow();
  expect(() => justFive.parse("1234")).toThrow();
  expect(() => justFive.parse("123456")).toThrow();
});

test("email validations", () => {
  const email = z.string().email();
  email.parse("mojojojo@example.com");
  expect(() => email.parse("asdf")).toThrow();
  expect(() => email.parse("@lkjasdf.com")).toThrow();
  expect(() => email.parse("asdf@sdf.")).toThrow();
});

test("more email validations", () => {
  const data = [
    `"josé.arrañoça"@domain.com`,
    `"сайт"@domain.com`,
    `"💩"@domain.com`,
    `"🍺🕺🎉"@domain.com`,
    `poop@💩.la`,
    `"🌮"@i❤️tacos.ws`,
  ];
  const email = z.string().email();
  for (const datum of data) {
    email.parse(datum);
  }
});

test("url validations", () => {
  const url = z.string().url();
  try {
    url.parse("http://google.com");
    url.parse("https://google.com/asdf?asdf=ljk3lk4&asdf=234#asdf");
    expect(() => url.parse("asdf")).toThrow();
    expect(() => url.parse("https:/")).toThrow();
    expect(() => url.parse("asdfj@lkjsdf.com")).toThrow();
  } catch (err) {}
});

test("url error overrides", () => {
  try {
    z.string().url().parse("https");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual("Invalid url");
  }
  try {
    z.string().url("badurl").parse("https");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual("badurl");
  }
  try {
    z.string().url({ message: "badurl" }).parse("https");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual("badurl");
  }
});

test("uuid", () => {
  const uuid = z.string().uuid("custom error");
  uuid.parse("9491d710-3185-4e06-bea0-6a2f275345e0");
  uuid.parse("00000000-0000-0000-0000-000000000000");
  uuid.parse("b3ce60f8-e8b9-40f5-1150-172ede56ff74"); // Variant 0 - RFC 4122: Reserved, NCS backward compatibility
  uuid.parse("92e76bf9-28b3-4730-cd7f-cb6bc51f8c09"); // Variant 2 - RFC 4122: Reserved, Microsoft Corporation backward compatibility
  const result = uuid.safeParse("9491d710-3185-4e06-bea0-6a2f275345e0X");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("custom error");
  }
});

test("bad uuid", () => {
  const uuid = z.string().uuid("custom error");
  uuid.parse("9491d710-3185-4e06-bea0-6a2f275345e0");
  const result = uuid.safeParse("invalid uuid");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("custom error");
  }
});

test("cuid", () => {
  const cuid = z.string().cuid();
  cuid.parse("ckopqwooh000001la8mbi2im9");
  const result = cuid.safeParse("cifjhdsfhsd-invalid-cuid");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("Invalid cuid");
  }
});

test("regex", () => {
  z.string()
    .regex(/^moo+$/)
    .parse("mooooo");
  expect(() => z.string().uuid().parse("purr")).toThrow();
});

test("regexp error message", () => {
  const result = z
    .string()
    .regex(/^moo+$/)
    .safeParse("boooo");
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("Invalid");
  } else {
    throw new Error("validation should have failed");
  }

  expect(() => z.string().uuid().parse("purr")).toThrow();
});

test("regex lastIndex reset", () => {
  const schema = z.string().regex(/^\d+$/g);
  expect(schema.safeParse("123").success).toEqual(true);
  expect(schema.safeParse("123").success).toEqual(true);
  expect(schema.safeParse("123").success).toEqual(true);
  expect(schema.safeParse("123").success).toEqual(true);
  expect(schema.safeParse("123").success).toEqual(true);
});

test("checks getters", () => {
  expect(z.string().email().isEmail).toEqual(true);
  expect(z.string().email().isURL).toEqual(false);
  expect(z.string().email().isCUID).toEqual(false);
  expect(z.string().email().isUUID).toEqual(false);

  expect(z.string().url().isEmail).toEqual(false);
  expect(z.string().url().isURL).toEqual(true);
  expect(z.string().url().isCUID).toEqual(false);
  expect(z.string().url().isUUID).toEqual(false);

  expect(z.string().cuid().isEmail).toEqual(false);
  expect(z.string().cuid().isURL).toEqual(false);
  expect(z.string().cuid().isCUID).toEqual(true);
  expect(z.string().cuid().isUUID).toEqual(false);

  expect(z.string().uuid().isEmail).toEqual(false);
  expect(z.string().uuid().isURL).toEqual(false);
  expect(z.string().uuid().isCUID).toEqual(false);
  expect(z.string().uuid().isUUID).toEqual(true);
});

test("min max getters", () => {
  expect(z.string().min(5).minLength).toEqual(5);
  expect(z.string().min(5).min(10).minLength).toEqual(10);

  expect(z.string().max(5).maxLength).toEqual(5);
  expect(z.string().max(5).max(1).maxLength).toEqual(1);
});

test("trim", () => {
  expect(z.string().trim().min(2).parse(" 12 ")).toEqual("12");

  // ordering of methods is respected
  expect(z.string().min(2).trim().parse(" 1 ")).toEqual("1");
  expect(() => z.string().trim().min(2).parse(" 1 ")).toThrow();
});
