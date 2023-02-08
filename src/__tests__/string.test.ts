// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

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
  expect(() => email.parse("asdf@asdf.com-")).toThrow();
  expect(() => email.parse("asdf@-asdf.com")).toThrow();
  expect(() => email.parse("asdf@-a(sdf.com")).toThrow();
  expect(() => email.parse("asdf@-asdf.com(")).toThrow();
  expect(() =>
    email.parse("pawan.anand@%9y83&#$%R&#$%R&%#$R%%^^%5rw3ewe.d.d.aaaa.wef.co")
  ).toThrow();
});

test("more email validations", () => {
  const validEmails = [
    `very.common@example.com`,
    `disposable.style.email.with+symbol@example.com`,
    `other.email-with-hyphen@example.com`,
    `fully-qualified-domain@example.com`,
    `user.name+tag+sorting@example.com`,
    `x@example.com`,
    `example-indeed@strange-example.com`,
    `test/test@test.com`,
    `example@s.example`,
    `" "@example.org`,
    `"john..doe"@example.org`,
    `mailhost!username@example.org`,
    `"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com`,
    `user%example.com@example.org`,
    `user-@example.org`,
    `postmaster@[123.123.123.123]`,
    `user@my-example.com`,
    `a@b.cd`,
    `work+user@mail.com`,
    `user@[68.185.127.196]`,
    `ipv4@[85.129.96.247]`,
    `valid@[79.208.229.53]`,
  ];
  const invalidEmails = [
    `Abc.example.com`,
    `A@b@c@example.com`,
    `a"b(c)d,e:f;g<h>i[j\k]l@example.com`,
    `just"not"right@example.com`,
    `this is"not\allowed@example.com`,
    `this\ still\"not\\allowed@example.com`,
    `i_like_underscore@but_its_not_allowed_in_this_part.example.com`,
    `QA[icon]CHOCOLATE[icon]@test.com`,
    `invalid@-start.com`,
    `invalid@end.com-`,
    `a.b@c.d`,
    `invalid@[1.1.1.-1]`,
    `invalid@[68.185.127.196.55]`,
    `temp@[192.168.1]`,
    `temp@[9.18.122.]`,
  ];
  const emailSchema = z.string().email();
  expect(
    validEmails.every((email) => emailSchema.safeParse(email).success)
  ).toBe(true);
  expect(
    invalidEmails.every(
      (email) => emailSchema.safeParse(email).success === false
    )
  ).toBe(true);
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

test("cuid2", () => {
  const cuid2 = z.string().cuid2();
  const validStrings = [
    "a", // short string
    "tz4a98xxat96iws9zmbrgj3a", // normal string
    "kf5vz6ssxe4zjcb409rjgo747tc5qjazgptvotk6", // longer than require("@paralleldrive/cuid2").bigLength
  ];
  validStrings.forEach((s) => cuid2.parse(s));
  const invalidStrings = [
    "", // empty string
    "1z4a98xxat96iws9zmbrgj3a", // starts with a number
    "tz4a98xxat96iws9zMbrgj3a", // include uppercase
    "tz4a98xxat96iws-zmbrgj3a", // involve symbols
  ];
  const results = invalidStrings.map((s) => cuid2.safeParse(s));
  expect(results.every((r) => !r.success)).toEqual(true);
  if (!results[0].success) {
    expect(results[0].error.issues[0].message).toEqual("Invalid cuid2");
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
  expect(z.string().email().isCUID2).toEqual(false);
  expect(z.string().email().isUUID).toEqual(false);

  expect(z.string().url().isEmail).toEqual(false);
  expect(z.string().url().isURL).toEqual(true);
  expect(z.string().url().isCUID).toEqual(false);
  expect(z.string().url().isCUID2).toEqual(false);
  expect(z.string().url().isUUID).toEqual(false);

  expect(z.string().cuid().isEmail).toEqual(false);
  expect(z.string().cuid().isURL).toEqual(false);
  expect(z.string().cuid().isCUID).toEqual(true);
  expect(z.string().cuid().isCUID2).toEqual(false);
  expect(z.string().cuid().isUUID).toEqual(false);

  expect(z.string().cuid2().isEmail).toEqual(false);
  expect(z.string().cuid2().isURL).toEqual(false);
  expect(z.string().cuid2().isCUID).toEqual(false);
  expect(z.string().cuid2().isCUID2).toEqual(true);
  expect(z.string().cuid2().isUUID).toEqual(false);

  expect(z.string().uuid().isEmail).toEqual(false);
  expect(z.string().uuid().isURL).toEqual(false);
  expect(z.string().uuid().isCUID).toEqual(false);
  expect(z.string().uuid().isCUID2).toEqual(false);
  expect(z.string().uuid().isUUID).toEqual(true);
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

test("datetime", () => {
  const a = z.string().datetime({});
  expect(a.isDatetime).toEqual(true);

  const b = z.string().datetime({ offset: true });
  expect(b.isDatetime).toEqual(true);

  const c = z.string().datetime({ precision: 3 });
  expect(c.isDatetime).toEqual(true);

  const d = z.string().datetime({ offset: true, precision: 0 });
  expect(d.isDatetime).toEqual(true);

  const { isDatetime } = z.string().datetime();
  expect(isDatetime).toEqual(true);
});

test("datetime parsing", () => {
  const datetime = z.string().datetime();
  datetime.parse("1970-01-01T00:00:00.000Z");
  datetime.parse("2022-10-13T09:52:31.816Z");
  datetime.parse("2022-10-13T09:52:31.8162314Z");
  datetime.parse("1970-01-01T00:00:00Z");
  datetime.parse("2022-10-13T09:52:31Z");
  expect(() => datetime.parse("")).toThrow();
  expect(() => datetime.parse("foo")).toThrow();
  expect(() => datetime.parse("2020-10-14")).toThrow();
  expect(() => datetime.parse("T18:45:12.123")).toThrow();
  expect(() => datetime.parse("2020-10-14T17:42:29+00:00")).toThrow();

  const datetimeNoMs = z.string().datetime({ precision: 0 });
  datetimeNoMs.parse("1970-01-01T00:00:00Z");
  datetimeNoMs.parse("2022-10-13T09:52:31Z");
  expect(() => datetimeNoMs.parse("tuna")).toThrow();
  expect(() => datetimeNoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => datetimeNoMs.parse("1970-01-01T00:00:00.Z")).toThrow();
  expect(() => datetimeNoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();

  const datetime3Ms = z.string().datetime({ precision: 3 });
  datetime3Ms.parse("1970-01-01T00:00:00.000Z");
  datetime3Ms.parse("2022-10-13T09:52:31.123Z");
  expect(() => datetime3Ms.parse("tuna")).toThrow();
  expect(() => datetime3Ms.parse("1970-01-01T00:00:00.1Z")).toThrow();
  expect(() => datetime3Ms.parse("1970-01-01T00:00:00.12Z")).toThrow();
  expect(() => datetime3Ms.parse("2022-10-13T09:52:31Z")).toThrow();

  const datetimeOffset = z.string().datetime({ offset: true });
  datetimeOffset.parse("1970-01-01T00:00:00.000Z");
  datetimeOffset.parse("2022-10-13T09:52:31.816234134Z");
  datetimeOffset.parse("1970-01-01T00:00:00Z");
  datetimeOffset.parse("2022-10-13T09:52:31.4Z");
  datetimeOffset.parse("2020-10-14T17:42:29+00:00");
  datetimeOffset.parse("2020-10-14T17:42:29+03:15");
  datetimeOffset.parse("2020-10-14T17:42:29+0315");
  datetimeOffset.parse("2020-10-14T17:42:29+03");
  expect(() => datetimeOffset.parse("tuna")).toThrow();
  expect(() => datetimeOffset.parse("2022-10-13T09:52:31.Z")).toThrow();

  const datetimeOffsetNoMs = z
    .string()
    .datetime({ offset: true, precision: 0 });
  datetimeOffsetNoMs.parse("1970-01-01T00:00:00Z");
  datetimeOffsetNoMs.parse("2022-10-13T09:52:31Z");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00:00");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+0000");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00");
  expect(() => datetimeOffsetNoMs.parse("tuna")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("1970-01-01T00:00:00.Z")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();
  expect(() =>
    datetimeOffsetNoMs.parse("2020-10-14T17:42:29.124+00:00")
  ).toThrow();

  const datetimeOffset4Ms = z.string().datetime({ offset: true, precision: 4 });
  datetimeOffset4Ms.parse("1970-01-01T00:00:00.1234Z");
  datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+00:00");
  datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+0000");
  datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+00");
  expect(() => datetimeOffset4Ms.parse("tuna")).toThrow();
  expect(() => datetimeOffset4Ms.parse("1970-01-01T00:00:00.123Z")).toThrow();
  expect(() =>
    datetimeOffset4Ms.parse("2020-10-14T17:42:29.124+00:00")
  ).toThrow();
});
