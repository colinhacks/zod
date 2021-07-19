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

test("required & invalid validations", () => {
  const requiredMessage = "This field is required";
  const invalidMessage = "Expected string, instead of whatever you input!";

  const s = z.string({ invalid: invalidMessage, required: requiredMessage });
  expect(() => s.parse(1)).toThrow(invalidMessage);
  expect(() => s.parse(undefined)).toThrow(requiredMessage);
});

test("required & invalid validation chain", () => {
  const message = { invalid: "invalid", required: "required" };

  const email = z.string(message).email();
  expect(() => email.parse(1)).toThrow(message.invalid);
  expect(() => email.parse(undefined)).toThrow(message.required);

  const url = z.string(message).url();
  expect(() => url.parse(1)).toThrow(message.invalid);
  expect(() => url.parse(undefined)).toThrow(message.required);

  const uuid = z.string(message).uuid("custom error");
  expect(() => uuid.parse(1)).toThrow(message.invalid);
  expect(() => uuid.parse(undefined)).toThrow(message.required);

  const regex = z.string(message).regex(/^moo+$/);
  expect(() => regex.parse(1)).toThrow(message.invalid);
  expect(() => regex.parse(undefined)).toThrow(message.required);

  const min = z.string(message).min(5, "min5");
  expect(() => min.parse(1)).toThrow(message.invalid);
  expect(() => min.parse(undefined)).toThrow(message.required);

  const max = z.string(message).max(5, "max5");
  expect(() => max.parse(1)).toThrow(message.invalid);
  expect(() => max.parse(undefined)).toThrow(message.required);
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
  } catch (err) {
    // console.log(JSON.stringify(err, null, 2));
  }
});

test("url error overrides", () => {
  try {
    z.string().url().parse("https");
  } catch (err) {
    expect(err.issues[0].message).toEqual("Invalid url");
  }
  try {
    z.string().url("badurl").parse("https");
  } catch (err) {
    expect(err.issues[0].message).toEqual("badurl");
  }
  try {
    z.string().url({ message: "badurl" }).parse("https");
  } catch (err) {
    expect(err.issues[0].message).toEqual("badurl");
  }
});

test("uuid", () => {
  const uuid = z.string().uuid("custom error");
  uuid.parse("9491d710-3185-4e06-bea0-6a2f275345e0");
  uuid.parse("00000000-0000-0000-0000-000000000000");
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
