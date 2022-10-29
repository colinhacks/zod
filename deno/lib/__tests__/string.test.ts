// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const minFive = z.string().min(5, "min5");
const maxFive = z.string().max(5, "max5");
const justFive = z.string().length(5);
const nonempty = z.string().nonempty("nonempty");
const startsWith = z.string().startsWith("startsWith");
const endsWith = z.string().endsWith("endsWith");

test("passing validations", () => {
  minFive.parse("12345");
  minFive.parse("123456");
  maxFive.parse("12345");
  maxFive.parse("1234");
  nonempty.parse("1");
  justFive.parse("12345");
  startsWith.parse("startsWithX");
  endsWith.parse("XendsWith");
});

test("failing validations", () => {
  expect(() => minFive.parse("1234")).toThrow();
  expect(() => maxFive.parse("123456")).toThrow();
  expect(() => nonempty.parse("")).toThrow();
  expect(() => justFive.parse("1234")).toThrow();
  expect(() => justFive.parse("123456")).toThrow();
  expect(() => startsWith.parse("x")).toThrow();
  expect(() => endsWith.parse("x")).toThrow();
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

test("date getters", () => {
  const utc = z.string().utc();
  const utcMs = z.string().utc({ ms: true });
  const utcMsLen = z.string().utc({ ms: true, msLength: 3 });
  const utcNoMs = z.string().utc({ ms: false });
  const iso8601 = z.string().iso8601();
  const iso8601Ms = z.string().iso8601({ ms: true });
  const iso8601MsLen = z.string().iso8601({ ms: true, msLength: 5 });
  const iso8601NoMs = z.string().iso8601({ ms: false });

  expect(utc.isUTC()).toEqual(true);
  expect(utcMs.isUTC()).toEqual(false);
  expect(utcMsLen.isUTC()).toEqual(false);
  expect(utcNoMs.isUTC()).toEqual(false);

  expect(iso8601.isISO8601()).toEqual(true);
  expect(iso8601Ms.isISO8601()).toEqual(false);
  expect(iso8601MsLen.isISO8601()).toEqual(false);
  expect(iso8601NoMs.isISO8601()).toEqual(false);

  expect(utc.isUTC({ ms: true })).toEqual(false);
  expect(utcMs.isUTC({ ms: true })).toEqual(true);
  expect(utcMsLen.isUTC({ ms: true })).toEqual(false);
  expect(utcNoMs.isUTC({ ms: true })).toEqual(false);

  expect(iso8601.isISO8601({ ms: true })).toEqual(false);
  expect(iso8601Ms.isISO8601({ ms: true })).toEqual(true);
  expect(iso8601MsLen.isISO8601({ ms: true })).toEqual(false);
  expect(iso8601NoMs.isISO8601({ ms: true })).toEqual(false);

  expect(utc.isUTC({ ms: true, msLength: 3 })).toEqual(false);
  expect(utcMs.isUTC({ ms: true, msLength: 3 })).toEqual(false);
  expect(utcMsLen.isUTC({ ms: true, msLength: 3 })).toEqual(true);
  expect(utcNoMs.isUTC({ ms: true, msLength: 3 })).toEqual(false);

  expect(iso8601.isISO8601({ ms: true, msLength: 5 })).toEqual(false);
  expect(iso8601Ms.isISO8601({ ms: true, msLength: 5 })).toEqual(false);
  expect(iso8601MsLen.isISO8601({ ms: true, msLength: 5 })).toEqual(true);
  expect(iso8601NoMs.isISO8601({ ms: true, msLength: 5 })).toEqual(false);

  expect(utc.isUTC({ ms: false })).toEqual(false);
  expect(utcMs.isUTC({ ms: false })).toEqual(false);
  expect(utcMsLen.isUTC({ ms: false })).toEqual(false);
  expect(utcNoMs.isUTC({ ms: false })).toEqual(true);

  expect(iso8601.isISO8601({ ms: false })).toEqual(false);
  expect(iso8601Ms.isISO8601({ ms: false })).toEqual(false);
  expect(iso8601MsLen.isISO8601({ ms: false })).toEqual(false);
  expect(iso8601NoMs.isISO8601({ ms: false })).toEqual(true);
});

test("min max getters", () => {
  expect(z.string().min(5).minLength).toEqual(5);
  expect(z.string().min(5).min(10).minLength).toEqual(10);
  expect(z.string().minLength).toEqual(null);

  expect(z.string().max(5).maxLength).toEqual(5);
  expect(z.string().max(5).max(1).maxLength).toEqual(1);
  expect(z.string().maxLength).toEqual(null);
});

test("trim", () => {
  expect(z.string().trim().min(2).parse(" 12 ")).toEqual("12");

  // ordering of methods is respected
  expect(z.string().min(2).trim().parse(" 1 ")).toEqual("1");
  expect(() => z.string().trim().min(2).parse(" 1 ")).toThrow();
});

test("utc", () => {
  const utc = z.string().utc();
  const utcMs = z.string().utc({ ms: true });
  const utcMs1Len = z.string().utc({ ms: true, msLength: 1 });
  const utcMsInf = z.string().utc({ ms: true, msLength: 0 });
  const utcNoMs = z.string().utc({ ms: false });

  utc.parse("1970-01-01T00:00:00.000Z");
  utc.parse("2022-10-13T09:52:31.816Z");
  utc.parse("1970-01-01T00:00:00Z");
  utc.parse("2022-10-13T09:52:31Z");
  utcMs.parse("1970-01-01T00:00:00.000Z");
  utcMs.parse("2022-10-13T09:52:31.816Z");
  utcMs1Len.parse("1970-01-01T00:00:00.0Z");
  utcMs1Len.parse("2022-10-13T09:52:31.8Z");
  utcMsInf.parse("2022-10-13T09:52:31.9999999Z");
  utcMsInf.parse("2022-10-13T09:52:31.1Z");
  utcNoMs.parse("1970-01-01T00:00:00Z");
  utcNoMs.parse("2022-10-13T09:52:31Z");

  expect(() => utc.parse("")).toThrow();
  expect(() => utc.parse("foo")).toThrow();
  expect(() => utc.parse("2020-10-14")).toThrow();
  expect(() => utc.parse("T18:45:12.123")).toThrow();
  expect(() => utc.parse("2020-10-14T17:42:29+00:00")).toThrow();
  expect(() => utcMs.parse("1970-01-01T00:00:00Z")).toThrow();
  expect(() => utcMs.parse("2022-10-13T09:52:31:00Z")).toThrow();
  expect(() => utcMs1Len.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => utcMs1Len.parse("2022-10-13T09:52:31:00.00Z")).toThrow();
  expect(() => utcMsInf.parse("1970-01-01T00:00:00")).toThrow();
  expect(() => utcMsInf.parse("2022-10-13T09:52:31:00")).toThrow();
  expect(() => utcNoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => utcNoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();
});

test("iso8601", () => {
  const iso8601 = z.string().iso8601();
  const iso8601Ms = z.string().iso8601({ ms: true });
  const iso8601Ms5Len = z.string().iso8601({ ms: true, msLength: 5 });
  const iso8601MsInf = z.string().iso8601({ ms: true, msLength: 0 });
  const iso8601NoMs = z.string().iso8601({ ms: false });

  iso8601.parse("1970-01-01T00:00:00.000Z");
  iso8601.parse("2022-10-13T09:52:31.816Z");
  iso8601.parse("1970-01-01T00:00:00Z");
  iso8601.parse("2022-10-13T09:52:31Z");
  iso8601.parse("2020-10-14T17:42:29+00:00");
  iso8601Ms.parse("1970-01-01T00:00:00.000Z");
  iso8601Ms.parse("2022-10-13T09:52:31.816Z");
  iso8601Ms.parse("2020-10-14T17:42:29.999+00:00");
  iso8601Ms5Len.parse("1970-01-01T00:00:00.00000Z");
  iso8601Ms5Len.parse("2022-10-13T09:52:31.81600Z");
  iso8601Ms5Len.parse("2020-10-14T17:42:29.99900+00:00");
  iso8601MsInf.parse("1970-01-01T00:00:00.0Z");
  iso8601MsInf.parse("2022-10-13T09:52:31.81Z");
  iso8601MsInf.parse("2020-10-14T17:42:29.99900+00:00");
  iso8601NoMs.parse("1970-01-01T00:00:00Z");
  iso8601NoMs.parse("2022-10-13T09:52:31Z");
  iso8601NoMs.parse("2020-10-14T17:42:29+00:00");

  expect(() => iso8601.parse("")).toThrow();
  expect(() => iso8601.parse("foo")).toThrow();
  expect(() => iso8601.parse("2020-10-14")).toThrow();
  expect(() => iso8601.parse("T18:45:12.123")).toThrow();
  expect(() => iso8601Ms.parse("1970-01-01T00:00:00Z")).toThrow();
  expect(() => iso8601Ms.parse("2022-10-13T09:52:31:00Z")).toThrow();
  expect(() => iso8601Ms.parse("2020-10-14T17:42:29+00:00")).toThrow();
  expect(() => iso8601Ms5Len.parse("1970-01-01T00:00:00.0Z")).toThrow();
  expect(() => iso8601Ms5Len.parse("2022-10-13T09:52:31:00.00Z")).toThrow();
  expect(() => iso8601Ms5Len.parse("2020-10-14T17:42:29.000+00:00")).toThrow();
  expect(() => iso8601MsInf.parse("1970-01-01T00:00:00.Z")).toThrow();
  expect(() => iso8601MsInf.parse("2022-10-13T09:52:31:00Z")).toThrow();
  expect(() => iso8601MsInf.parse("2020-10-14T17:42:29+00:00")).toThrow();
  expect(() => iso8601NoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => iso8601NoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();
  expect(() => iso8601NoMs.parse("2020-10-14T17:42:29.999+00:00")).toThrow();
});
