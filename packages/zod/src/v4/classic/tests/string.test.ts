import { randomBytes } from "node:crypto";
import { expect, test } from "vitest";

import * as z from "zod/v4";

const minFive = z.string().min(5, "min5");
const maxFive = z.string().max(5, "max5");
const justFive = z.string().length(5);
const nonempty = z.string().min(1, "nonempty");
const includes = z.string().includes("includes");
const includesFromIndex2 = z.string().includes("includes", { position: 2 });
const startsWith = z.string().startsWith("startsWith");
const endsWith = z.string().endsWith("endsWith");

test("length checks", () => {
  minFive.parse("12345");
  minFive.parse("123456");
  maxFive.parse("12345");
  maxFive.parse("1234");
  nonempty.parse("1");
  justFive.parse("12345");

  expect(() => minFive.parse("1234")).toThrow();
  expect(() => maxFive.parse("123456")).toThrow();
  expect(() => nonempty.parse("")).toThrow();
  expect(() => justFive.parse("1234")).toThrow();
  expect(() => justFive.parse("123456")).toThrow();
});

test("includes", () => {
  includes.parse("XincludesXX");
  includesFromIndex2.parse("XXXincludesXX");

  expect(() => includes.parse("XincludeXX")).toThrow();
  expect(() => includesFromIndex2.parse("XincludesXX")).toThrow();
});

test("startswith/endswith", () => {
  startsWith.parse("startsWithX");
  endsWith.parse("XendsWith");

  expect(() => startsWith.parse("x")).toThrow();
  expect(() => endsWith.parse("x")).toThrow();
});

test("email validations", () => {
  const validEmails = [
    `email@domain.com`,
    `firstname.lastname@domain.com`,
    `email@subdomain.domain.com`,
    `firstname+lastname@domain.com`,
    `1234567890@domain.com`,
    `email@domain-one.com`,
    `_______@domain.com`,
    `email@domain.name`,
    `email@domain.co.jp`,
    `firstname-lastname@domain.com`,
    `very.common@example.com`,
    `disposable.style.email.with+symbol@example.com`,
    `other.email-with-hyphen@example.com`,
    `fully-qualified-domain@example.com`,
    `user.name+tag+sorting@example.com`,
    `x@example.com`,
    `mojojojo@asdf.example.com`,
    `example-indeed@strange-example.com`,
    `example@s.example`,
    `user-@example.org`,
    `user@my-example.com`,
    `a@b.cd`,
    `work+user@mail.com`,
    `tom@test.te-st.com`,
    `something@subdomain.domain-with-hyphens.tld`,
    `common'name@domain.com`,
    `francois@etu.inp-n7.fr`,
  ];
  const invalidEmails = [
    // no "printable characters"
    // `user%example.com@example.org`,
    // `mailhost!username@example.org`,
    // `test/test@test.com`,

    // double @
    `francois@@etu.inp-n7.fr`,
    // do not support quotes
    `"email"@domain.com`,
    `"e asdf sadf ?<>ail"@domain.com`,
    `" "@example.org`,
    `"john..doe"@example.org`,
    `"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com`,
    // do not support comma
    `a,b@domain.com`,

    // do not support IPv4
    `email@123.123.123.123`,
    `email@[123.123.123.123]`,
    `postmaster@123.123.123.123`,
    `user@[68.185.127.196]`,
    `ipv4@[85.129.96.247]`,
    `valid@[79.208.229.53]`,
    `valid@[255.255.255.255]`,
    `valid@[255.0.55.2]`,
    `valid@[255.0.55.2]`,

    // do not support ipv6
    `hgrebert0@[IPv6:4dc8:ac7:ce79:8878:1290:6098:5c50:1f25]`,
    `bshapiro4@[IPv6:3669:c709:e981:4884:59a3:75d1:166b:9ae]`,
    `jsmith@[IPv6:2001:db8::1]`,
    `postmaster@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:7334]`,
    `postmaster@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:192.168.1.1]`,

    // microsoft test cases
    `plainaddress`,
    `#@%^%#$@#$@#.com`,
    `@domain.com`,
    `Joe Smith &lt;email@domain.com&gt;`,
    `email.domain.com`,
    `email@domain@domain.com`,
    `.email@domain.com`,
    `email.@domain.com`,
    `email..email@domain.com`,
    `あいうえお@domain.com`,
    `email@domain.com (Joe Smith)`,
    `email@domain`,
    `email@-domain.com`,
    `email@111.222.333.44444`,
    `email@domain..com`,
    `Abc.example.com`,
    `A@b@c@example.com`,
    `colin..hacks@domain.com`,
    `a"b(c)d,e:f;g<h>i[j\k]l@example.com`,
    `just"not"right@example.com`,
    `this is"not\allowed@example.com`,
    `this\ still\"not\\allowed@example.com`,

    // random
    `i_like_underscore@but_its_not_allowed_in_this_part.example.com`,
    `QA[icon]CHOCOLATE[icon]@test.com`,
    `invalid@-start.com`,
    `invalid@end.com-`,
    `a.b@c.d`,
    `invalid@[1.1.1.-1]`,
    `invalid@[68.185.127.196.55]`,
    `temp@[192.168.1]`,
    `temp@[9.18.122.]`,
    `double..point@test.com`,
    `asdad@test..com`,
    `asdad@hghg...sd...au`,
    `asdad@hghg........au`,
    `invalid@[256.2.2.48]`,
    `invalid@[256.2.2.48]`,
    `invalid@[999.465.265.1]`,
    `jkibbey4@[IPv6:82c4:19a8::70a9:2aac:557::ea69:d985:28d]`,
    `mlivesay3@[9952:143f:b4df:2179:49a1:5e82:b92e:6b6]`,
    `gbacher0@[IPv6:bc37:4d3f:5048:2e26:37cc:248e:df8e:2f7f:af]`,
    `invalid@[IPv6:5348:4ed3:5d38:67fb:e9b:acd2:c13:192.168.256.1]`,
    `test@.com`,
    `aaaaaaaaaaaaaaalongemailthatcausesregexDoSvulnerability@test.c`,
  ];
  const emailSchema = z.string().email();

  expect(
    validEmails.every((email) => {
      return emailSchema.safeParse(email).success;
    })
  ).toBe(true);
  expect(
    invalidEmails.every((email) => {
      return emailSchema.safeParse(email).success === false;
    })
  ).toBe(true);
});

test("base64 validations", () => {
  const validBase64Strings = [
    "SGVsbG8gV29ybGQ=", // "Hello World"
    "VGhpcyBpcyBhbiBlbmNvZGVkIHN0cmluZw==", // "This is an encoded string"
    "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcms=", // "Many hands make light work"
    "UGF0aWVuY2UgaXMgdGhlIGtleSB0byBzdWNjZXNz", // "Patience is the key to success"
    "QmFzZTY0IGVuY29kaW5nIGlzIGZ1bg==", // "Base64 encoding is fun"
    "MTIzNDU2Nzg5MA==", // "1234567890"
    "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=", // "abcdefghijklmnopqrstuvwxyz"
    "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=", // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "ISIkJSMmJyonKCk=", // "!\"#$%&'()*"
    "", // Empty string is technically a valid base64
  ];

  for (const str of validBase64Strings) {
    expect(str + z.string().base64().safeParse(str).success).toBe(`${str}true`);
  }

  const invalidBase64Strings = [
    "12345", // Not padded correctly, not a multiple of 4 characters
    "SGVsbG8gV29ybGQ", // Missing padding
    "VGhpcyBpcyBhbiBlbmNvZGVkIHN0cmluZw", // Missing padding
    "!UGF0aWVuY2UgaXMgdGhlIGtleSB0byBzdWNjZXNz", // Invalid character '!'
    "?QmFzZTY0IGVuY29kaW5nIGlzIGZ1bg==", // Invalid character '?'
    ".MTIzND2Nzg5MC4=", // Invalid character '.'
    "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo", // Missing padding
  ];

  for (const str of invalidBase64Strings) {
    expect(str + z.string().base64().safeParse(str).success).toBe(`${str}false`);
  }
});

test("base64url validations", () => {
  const base64url = z.string().base64url();

  const validBase64URLStrings = [
    "SGVsbG8gV29ybGQ", // "Hello World"

    "VGhpcyBpcyBhbiBlbmNvZGVkIHN0cmluZw", // "This is an encoded string"

    "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcms", // "Many hands make light work"

    "UGF0aWVuY2UgaXMgdGhlIGtleSB0byBzdWNjZXNz", // "Patience is the key to success"
    "QmFzZTY0IGVuY29kaW5nIGlzIGZ1bg", // "Base64 encoding is fun"

    "MTIzNDU2Nzg5MA", // "1234567890"

    "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo", // "abcdefghijklmnopqrstuvwxyz"

    "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo", // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    "ISIkJSMmJyonKCk", // "!\"#$%&'()*"

    "", // Empty string is technically valid base64url
    "w7_Dv8O-w74K", // ÿÿþþ
    "123456",
  ];

  for (const str of validBase64URLStrings) {
    expect(str + base64url.safeParse(str).success).toBe(`${str}true`);
  }

  const invalidBase64URLStrings = [
    "w7/Dv8O+w74K", // Has + and / characters (is base64)
    "12345", // Invalid length (not a multiple of 4 characters when adding allowed number of padding characters)
    "12345===", // Not padded correctly
    "!UGF0aWVuY2UgaXMgdGhlIGtleSB0byBzdWNjZXNz", // Invalid character '!'
    "?QmFzZTY0IGVuY29kaW5nIGlzIGZ1bg==", // Invalid character '?'
    ".MTIzND2Nzg5MC4=", // Invalid character '.'

    // disallow valid padding
    "SGVsbG8gV29ybGQ=", // "Hello World" with padding
    "VGhpcyBpcyBhbiBlbmNvZGVkIHN0cmluZw==", // "This is an encoded string" with padding
    "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcms=", // "Many hands make light work" with padding
    "QmFzZTY0IGVuY29kaW5nIGlzIGZ1bg==", // "Base64 encoding is fun" with padding
    "MTIzNDU2Nzg5MA==", // "1234567890" with padding
    "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=", // "abcdefghijklmnopqrstuvwxyz with padding"
    "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=", // "ABCDEFGHIJKLMNOPQRSTUVWXYZ" with padding
    "ISIkJSMmJyonKCk=", // "!\"#$%&'()*" with padding
  ];

  for (const str of invalidBase64URLStrings) {
    expect(str + base64url.safeParse(str).success).toBe(`${str}false`);
  }
});

test("big base64 and base64url", () => {
  const bigbase64 = randomBytes(1024 * 1024 * 10).toString("base64");
  z.base64().parse(bigbase64);
  const bigbase64url = randomBytes(1024 * 1024 * 10).toString("base64url");
  z.base64url().parse(bigbase64url);
});

function makeJwt(header: object, payload: object) {
  const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "signature"; // Placeholder for the signature
  return `${headerBase64}.${payloadBase64}.${signature}`;
}

test("jwt token", () => {
  const jwt = z.string().jwt();
  expect(() => jwt.parse("invalid")).toThrow();
  expect(() => jwt.parse("invalid.invalid")).toThrow();
  expect(() => jwt.parse("invalid.invalid.invalid")).toThrow();

  // Valid JWTs
  const es256jwt = z.string().jwt({ alg: "ES256" });
  const d1 = makeJwt({ typ: "JWT", alg: "ES256" }, {});
  jwt.parse(d1);
  es256jwt.parse(d1);

  // Invalid header
  const d2 = makeJwt({}, {});
  expect(() => jwt.parse(d2)).toThrow();

  // Wrong algorithm
  const d3 = makeJwt({ typ: "JWT", alg: "RS256" }, {});
  expect(() => es256jwt.parse(d3)).toThrow();

  // missing typ is fine
  const d4 = makeJwt({ alg: "HS256" }, {});
  jwt.parse(d4);

  // type isn't JWT
  const d5 = makeJwt({ typ: "SUP", alg: "HS256" }, { foo: "bar" });
  expect(() => jwt.parse(d5)).toThrow();

  // const ONE_PART = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  // const NOT_BASE64 =
  //   "headerIsNotBase64Encoded.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.RRi1X2IlXd5rZa9Mf_0VUOf-RxOzAhbB4tgViUGamWE";
  // const NO_TYP =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.GuoUe6tw79bJlbU1HU0ADX0pr0u2kf3r_4OdrDufSfQ";
  // const TYP_NOT_JWT =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpUVyJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.RRi1X2IlXd5rZa9Mf_0VUOf-RxOzAhbB4tgViUGamWE";

  // const GOOD_JWT_HS256 =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  // const GOOD_JWT_ES256 =
  //   "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.tyh-VfuzIxCyGYDlkBA7DfyjrqmSHu6pQ2hoZuFqUSLPNY2N0mpHb3nk5K17HWP_3cYHBw7AhHale5wky6-sVA";

  // const jwtSchema = z.string().jwt();

  // expect(() => jwtSchema.parse(ONE_PART)).toThrow();
  // expect(() => jwtSchema.parse(NOT_BASE64)).toThrow();
  // expect(() => jwtSchema.parse(TYP_NOT_JWT)).toThrow();
  // expect(() => jwtSchema.parse(TYP_NOT_JWT)).toThrow();
  // expect(() => jwtSchema.parse(TYP_NOT_JWT)).toThrow();
  // expect(() => z.string().jwt({ alg: "ES256" }).parse(GOOD_JWT_HS256)).toThrow();
  // expect(() => z.string().jwt({ alg: "HS256" }).parse(GOOD_JWT_ES256)).toThrow();
  // //Success
  // jwtSchema.parse(NO_TYP); // allow no typ
  // expect(() => jwtSchema.parse(GOOD_JWT_HS256)).not.toThrow();
  // expect(() => jwtSchema.parse(GOOD_JWT_ES256)).not.toThrow();
  // expect(() => z.string().jwt({ alg: "HS256" }).parse(GOOD_JWT_HS256)).not.toThrow();
  // expect(() => z.string().jwt({ alg: "ES256" }).parse(GOOD_JWT_ES256)).not.toThrow();
});

test("url validations", () => {
  const url = z.string().url();
  url.parse("http://google.com");
  url.parse("https://google.com/asdf?asdf=ljk3lk4&asdf=234#asdf");
  url.parse("https://anonymous:flabada@developer.mozilla.org/en-US/docs/Web/API/URL/password");
  url.parse("https://localhost");
  url.parse("https://my.local");
  url.parse("http://aslkfjdalsdfkjaf");
  url.parse("http://localhost");

  url.parse("c:");

  expect(() => url.parse("asdf")).toThrow();
  expect(() => url.parse("https:/")).toThrow();
  expect(() => url.parse("asdfj@lkjsdf.com")).toThrow();
  expect(() => url.parse("https://")).toThrow();
});

test("httpurl", () => {
  const httpUrl = z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
    // /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  });

  httpUrl.parse("https://example.com");
  httpUrl.parse("http://example.com");
  // ports
  httpUrl.parse("https://example.com:8080");
  httpUrl.parse("http://example.com:8080");
  // subdomains
  httpUrl.parse("https://sub.example.com");
  httpUrl.parse("http://sub.example.com");
  // paths
  httpUrl.parse("https://example.com/path/to/resource");
  httpUrl.parse("http://example.com/path/to/resource");
  // query parameters
  httpUrl.parse("https://example.com/path?query=param");
  httpUrl.parse("http://example.com/path?query=param");
  // fragment identifiers
  httpUrl.parse("https://example.com/path#fragment");
  httpUrl.parse("http://example.com/path#fragment");
  // fails
  expect(() => httpUrl.parse("ftp://example.com")).toThrow();
  expect(() => httpUrl.parse("shttp://example.com")).toThrow();
  expect(() => httpUrl.parse("httpz://example.com")).toThrow();
  expect(() => httpUrl.parse("http://")).toThrow();
  expect(() => httpUrl.parse("http://localhost")).toThrow();
  expect(() => httpUrl.parse("http://-asdf.com")).toThrow();
  expect(() =>
    httpUrl.parse(
      "http://asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf.com"
    )
  ).toThrow();
  expect(() => httpUrl.parse("http://asdf.c")).toThrow();
  expect(() => httpUrl.parse("mailto:asdf@lckj.com")).toThrow();
});

test("url error overrides", () => {
  try {
    z.string().url().parse("https");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual("Invalid URL");
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

test("emoji validations", () => {
  const emoji = z.string().emoji();

  emoji.parse("👋👋👋👋");
  emoji.parse("🍺👩‍🚀🫡");
  emoji.parse("💚💙💜💛❤️");
  emoji.parse("🐛🗝🐏🍡🎦🚢🏨💫🎌☘🗡😹🔒🎬➡️🍹🗂🚨⚜🕑〽️🚦🌊🍴💍🍌💰😳🌺🍃");
  emoji.parse("🇹🇷🤽🏿‍♂️");
  emoji.parse(
    "😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚☺️☺🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲☹️☹🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🥳🥴🥺🤥🤫🤭🧐🤓😈👿🤡👹👺💀☠️☠👻👽👾🤖💩😺😸😹😻😼😽🙀😿😾🙈🙉🙊🏻🏼🏽🏾🏿👶👶🏻👶🏼👶🏽👶🏾👶🏿🧒🧒🏻🧒🏼🧒🏽🧒🏾🧒🏿👦👦🏻👦🏼👦🏽👦🏾👦🏿👧👧🏻👧🏼👧🏽👧🏾👧🏿🧑🧑🏻🧑🏼🧑🏽🧑🏾🧑🏿👨👨🏻👨🏼👨🏽👨🏾👨🏿👩👩🏻👩🏼👩🏽👩🏾👩🏿🧓🧓🏻🧓🏼🧓🏽🧓🏾🧓🏿👴👴🏻👴🏼👴🏽👴🏾👴🏿👵👵🏻👵🏼👵🏽👵🏾👵🏿👨‍⚕️👨‍⚕👨🏻‍⚕️👨🏻‍⚕👨🏼‍⚕️👨🏼‍⚕👨🏽‍⚕️👨🏽‍⚕👨🏾‍⚕️👨🏾‍⚕👨🏿‍⚕️👨🏿‍⚕👩‍⚕️👩‍⚕👩🏻‍⚕️👩🏻‍⚕👩🏼‍⚕️👩🏼‍⚕👩🏽‍⚕️👩🏽‍⚕👩🏾‍⚕️👩🏾‍⚕👩🏿‍⚕️👩🏿‍⚕👨‍🎓👨🏻‍🎓👨🏼‍🎓👨🏽‍🎓👨🏾‍🎓👨🏿‍🎓👩‍🎓👩🏻‍🎓👩🏼‍🎓👩🏽‍🎓👩🏾‍🎓👩🏿‍🎓👨‍🏫👨🏻‍🏫👨🏼‍🏫👨🏽‍🏫👨🏾‍🏫👨🏿‍🏫👩‍🏫👩🏻‍🏫👩🏼‍🏫👩🏽‍🏫👩🏾‍🏫👩🏿‍🏫👨‍⚖️👨‍⚖👨🏻‍⚖️👨🏻‍⚖👨🏼‍⚖️👨🏼‍⚖👨🏽‍⚖️👨🏽‍⚖👨🏾‍⚖️👨🏾‍⚖👨🏿‍⚖️👨🏿‍⚖👩‍⚖️👩‍⚖👩🏻‍⚖️👩🏻‍⚖👩🏼‍⚖️👩🏼‍⚖👩🏽‍⚖️👩🏽‍⚖👩🏾‍⚖️👩🏾‍⚖👩🏿‍⚖️👩🏿‍⚖👨‍🌾👨🏻‍🌾👨🏼‍🌾👨🏽‍🌾👨🏾‍🌾👨🏿‍🌾👩‍🌾👩🏻‍🌾👩🏼‍🌾👩🏽‍🌾👩🏾‍🌾👩🏿‍🌾👨‍🍳👨🏻‍🍳👨🏼‍🍳👨🏽‍🍳👨🏾‍🍳👨🏿‍🍳👩‍🍳👩🏻‍🍳👩🏼‍🍳👩🏽‍🍳👩🏾‍🍳👩🏿‍🍳👨‍🔧👨🏻‍🔧👨🏼‍🔧👨🏽‍🔧👨🏾‍🔧👨🏿‍🔧👩‍🔧👩🏻‍🔧👩🏼‍🔧👩🏽‍🔧👩🏾‍🔧👩🏿‍🔧👨‍🏭👨🏻‍🏭👨🏼‍🏭👨🏽‍🏭👨🏾‍🏭👨🏿‍🏭👩‍🏭👩🏻‍🏭👩🏼‍🏭👩🏽‍🏭👩🏾‍🏭👩🏿‍🏭👨‍💼👨🏻‍💼👨🏼‍💼👨🏽‍💼👨🏾‍💼👨🏿‍💼👩‍💼👩🏻‍💼👩🏼‍💼👩🏽‍💼👩🏾‍💼👩🏿‍💼👨‍🔬👨🏻‍🔬👨🏼‍🔬👨🏽‍🔬👨🏾‍🔬👨🏿‍🔬👩‍🔬👩🏻‍🔬👩🏼‍🔬👩🏽‍🔬👩🏾‍🔬👩🏿‍🔬👨‍💻👨🏻‍💻👨🏼‍💻👨🏽‍💻👨🏾‍💻👨🏿‍💻👩‍💻👩🏻‍💻👩🏼‍💻👩🏽‍💻👩🏾‍💻👩🏿‍💻👨‍🎤👨🏻‍🎤👨🏼‍🎤👨🏽‍🎤👨🏾‍🎤👨🏿‍🎤👩‍🎤👩🏻‍🎤👩🏼‍🎤👩🏽‍🎤👩🏾‍🎤👩🏿‍🎤👨‍🎨👨🏻‍🎨👨🏼‍🎨👨🏽‍🎨👨🏾‍🎨👨🏿‍🎨👩‍🎨👩🏻‍🎨👩🏼‍🎨👩🏽‍🎨👩🏾‍🎨👩🏿‍🎨👨‍✈️👨‍✈👨🏻‍✈️👨🏻‍✈👨🏼‍✈️👨🏼‍✈👨🏽‍✈️👨🏽‍✈👨🏾‍✈️👨🏾‍✈👨🏿‍✈️👨🏿‍✈👩‍✈️👩‍✈👩🏻‍✈️👩🏻‍✈👩🏼‍✈️👩🏼‍✈👩🏽‍✈️👩🏽‍✈👩🏾‍✈️👩🏾‍✈👩🏿‍✈️👩🏿‍✈👨‍🚀👨🏻‍🚀👨🏼‍🚀👨🏽‍🚀👨🏾‍🚀👨🏿‍🚀👩‍🚀👩🏻‍🚀👩🏼‍🚀👩🏽‍🚀👩🏾‍🚀👩🏿‍🚀👨‍🚒👨🏻‍🚒👨🏼‍🚒👨🏽‍🚒👨🏾‍🚒👨🏿‍🚒👩‍🚒👩🏻‍🚒👩🏼‍🚒👩🏽‍🚒👩🏾‍🚒👩🏿‍🚒👮👮🏻👮🏼👮🏽👮🏾👮🏿👮‍♂️👮‍♂👮🏻‍♂️👮🏻‍♂👮🏼‍♂️👮🏼‍♂👮🏽‍♂️👮🏽‍♂👮🏾‍♂️👮🏾‍♂👮🏿‍♂️👮🏿‍♂👮‍♀️👮‍♀👮🏻‍♀️👮🏻‍♀👮🏼‍♀️👮🏼‍♀👮🏽‍♀️👮🏽‍♀👮🏾‍♀️👮🏾‍♀👮🏿‍♀️👮🏿‍♀🕵️🕵🕵🏻🕵🏼🕵🏽🕵🏾🕵🏿🕵️‍♂️🕵‍♂️🕵️‍♂🕵‍♂🕵🏻‍♂️🕵🏻‍♂🕵🏼‍♂️🕵🏼‍♂🕵🏽‍♂️🕵🏽‍♂🕵🏾‍♂️🕵🏾‍♂🕵🏿‍♂️🕵🏿‍♂🕵️‍♀️🕵‍♀️🕵️‍♀🕵‍♀🕵🏻‍♀️🕵🏻‍♀🕵🏼‍♀️🕵🏼‍♀🕵🏽‍♀️🕵🏽‍♀🕵🏾‍♀️🕵🏾‍♀🕵🏿‍♀️🕵🏿‍♀💂💂🏻💂🏼💂🏽💂🏾💂🏿💂‍♂️💂‍♂💂🏻‍♂️💂🏻‍♂💂🏼‍♂️💂🏼‍♂💂🏽‍♂️💂🏽‍♂💂🏾‍♂️💂🏾‍♂💂🏿‍♂️💂🏿‍♂💂‍♀️💂‍♀💂🏻‍♀️💂🏻‍♀💂🏼‍♀️💂🏼‍♀💂🏽‍♀️💂🏽‍♀💂🏾‍♀️💂🏾‍♀💂🏿‍♀️💂🏿‍♀👷👷🏻👷🏼👷🏽👷🏾👷🏿👷‍♂️👷‍♂👷🏻‍♂️👷🏻‍♂👷🏼‍♂️👷🏼‍♂👷🏽‍♂️👷🏽‍♂👷🏾‍♂️👷🏾‍♂👷🏿‍♂️👷🏿‍♂👷‍♀️👷‍♀👷🏻‍♀️👷🏻‍♀👷🏼‍♀️👷🏼‍♀👷🏽‍♀️👷🏽‍♀👷🏾‍♀️👷🏾‍♀👷🏿‍♀️👷🏿‍♀🤴🤴🏻🤴🏼🤴🏽🤴🏾🤴🏿👸👸🏻👸🏼👸🏽👸🏾👸🏿👳👳🏻👳🏼👳🏽👳🏾👳🏿👳‍♂️👳‍♂👳🏻‍♂️👳🏻‍♂👳🏼‍♂️👳🏼‍♂👳🏽‍♂️👳🏽‍♂👳🏾‍♂️👳🏾‍♂👳🏿‍♂️👳🏿‍♂👳‍♀️👳‍♀👳🏻‍♀️👳🏻‍♀👳🏼‍♀️👳🏼‍♀👳🏽‍♀️👳🏽‍♀👳🏾‍♀️👳🏾‍♀👳🏿‍♀️👳🏿‍♀👲👲🏻👲🏼👲🏽👲🏾👲🏿🧕🧕🏻🧕🏼🧕🏽🧕🏾🧕🏿🧔🧔🏻🧔🏼🧔🏽🧔🏾🧔🏿👱👱🏻👱🏼👱🏽👱🏾👱🏿👱‍♂️👱‍♂👱🏻‍♂️👱🏻‍♂👱🏼‍♂️👱🏼‍♂👱🏽‍♂️👱🏽‍♂👱🏾‍♂️👱🏾‍♂👱🏿‍♂️👱🏿‍♂👱‍♀️👱‍♀👱🏻‍♀️👱🏻‍♀👱🏼‍♀️👱🏼‍♀👱🏽‍♀️👱🏽‍♀👱🏾‍♀️👱🏾‍♀👱🏿‍♀️👱🏿‍♀👨‍🦰👨🏻‍🦰👨🏼‍🦰👨🏽‍🦰👨🏾‍🦰👨🏿‍🦰👩‍🦰👩🏻‍🦰👩🏼‍🦰👩🏽‍🦰👩🏾‍🦰👩🏿‍🦰👨‍🦱👨🏻‍🦱👨🏼‍🦱👨🏽‍🦱👨🏾‍🦱👨🏿‍🦱👩‍🦱👩🏻‍🦱👩🏼‍🦱👩🏽‍🦱👩🏾‍🦱👩🏿‍🦱👨‍🦲👨🏻‍🦲👨🏼‍🦲👨🏽‍🦲👨🏾‍🦲👨🏿‍🦲👩‍🦲👩🏻‍🦲👩🏼‍🦲👩🏽‍🦲👩🏾‍🦲👩🏿‍🦲👨‍🦳👨🏻‍🦳👨🏼‍🦳👨🏽‍🦳👨🏾‍🦳👨🏿‍🦳👩‍🦳👩🏻‍🦳👩🏼‍🦳👩🏽‍🦳👩🏾‍🦳👩🏿‍🦳🤵🤵🏻🤵🏼🤵🏽🤵🏾🤵🏿👰👰🏻👰🏼👰🏽👰🏾👰🏿🤰🤰🏻🤰🏼🤰🏽🤰🏾🤰🏿🤱🤱🏻🤱🏼🤱🏽🤱🏾🤱🏿👼👼🏻👼🏼👼🏽👼🏾👼🏿🎅🎅🏻🎅🏼🎅🏽🎅🏾🎅🏿🤶🤶🏻🤶🏼🤶🏽🤶🏾🤶🏿🦸🦸🏻🦸🏼🦸🏽🦸🏾🦸🏿🦸‍♀️🦸‍♀🦸🏻‍♀️🦸🏻‍♀🦸🏼‍♀️🦸🏼‍♀🦸🏽‍♀️🦸🏽‍♀🦸🏾‍♀️🦸🏾‍♀🦸🏿‍♀️🦸🏿‍♀🦸‍♂️🦸‍♂🦸🏻‍♂️🦸🏻‍♂🦸🏼‍♂️🦸🏼‍♂🦸🏽‍♂️🦸🏽‍♂🦸🏾‍♂️🦸🏾‍♂🦸🏿‍♂️🦸🏿‍♂🦹🦹🏻🦹🏼🦹🏽🦹🏾🦹🏿🦹‍♀️🦹‍♀🦹🏻‍♀️🦹🏻‍♀🦹🏼‍♀️🦹🏼‍♀🦹🏽‍♀️🦹🏽‍♀🦹🏾‍♀️🦹🏾‍♀🦹🏿‍♀️🦹🏿‍♀🦹‍♂️🦹‍♂🦹🏻‍♂️🦹🏻‍♂🦹🏼‍♂️🦹🏼‍♂🦹🏽‍♂️🦹🏽‍♂🦹🏾‍♂️🦹🏾‍♂🦹🏿‍♂️🦹🏿‍♂🧙🧙🏻🧙🏼🧙🏽🧙🏾🧙🏿🧙‍♀️🧙‍♀🧙🏻‍♀️🧙🏻‍♀🧙🏼‍♀️🧙🏼‍♀🧙🏽‍♀️🧙🏽‍♀🧙🏾‍♀️🧙🏾‍♀🧙🏿‍♀️🧙🏿‍♀🧙‍♂️🧙‍♂🧙🏻‍♂️🧙🏻‍♂🧙🏼‍♂️🧙🏼‍♂🧙🏽‍♂️🧙🏽‍♂🧙🏾‍♂️🧙🏾‍♂🧙🏿‍♂️🧙🏿‍♂🧚🧚🏻🧚🏼🧚🏽🧚🏾🧚🏿🧚‍♀️🧚‍♀🧚🏻‍♀️🧚🏻‍♀🧚🏼‍♀️🧚🏼‍♀🧚🏽‍♀️🧚🏽‍♀🧚🏾‍♀️🧚🏾‍♀🧚🏿‍♀️🧚🏿‍♀🧚‍♂️🧚‍♂🧚🏻‍♂️🧚🏻‍♂🧚🏼‍♂️🧚🏼‍♂🧚🏽‍♂️🧚🏽‍♂🧚🏾‍♂️🧚🏾‍♂🧚🏿‍♂️🧚🏿‍♂🧛🧛🏻🧛🏼🧛🏽🧛🏾🧛🏿🧛‍♀️🧛‍♀🧛🏻‍♀️🧛🏻‍♀🧛🏼‍♀️🧛🏼‍♀🧛🏽‍♀️🧛🏽‍♀🧛🏾‍♀️🧛🏾‍♀🧛🏿‍♀️🧛🏿‍♀🧛‍♂️🧛‍♂🧛🏻‍♂️🧛🏻‍♂🧛🏼‍♂️🧛🏼‍♂🧛🏽‍♂️🧛🏽‍♂🧛🏾‍♂️🧛🏾‍♂🧛🏿‍♂️🧛🏿‍♂🧜🧜🏻🧜🏼🧜🏽🧜🏾🧜🏿🧜‍♀️🧜‍♀🧜🏻‍♀️🧜🏻‍♀🧜🏼‍♀️🧜🏼‍♀🧜🏽‍♀️🧜🏽‍♀🧜🏾‍♀️🧜🏾‍♀🧜🏿‍♀️🧜🏿‍♀🧜‍♂️🧜‍♂🧜🏻‍♂️🧜🏻‍♂🧜🏼‍♂️🧜🏼‍♂🧜🏽‍♂️🧜🏽‍♂🧜🏾‍♂️🧜🏾‍♂🧜🏿‍♂️🧜🏿‍♂🧝🧝🏻🧝🏼🧝🏽🧝🏾🧝🏿🧝‍♀️🧝‍♀🧝🏻‍♀️🧝🏻‍♀🧝🏼‍♀️🧝🏼‍♀🧝🏽‍♀️🧝🏽‍♀🧝🏾‍♀️🧝🏾‍♀🧝🏿‍♀️🧝🏿‍♀🧝‍♂️🧝‍♂🧝🏻‍♂️🧝🏻‍♂🧝🏼‍♂️🧝🏼‍♂🧝🏽‍♂️🧝🏽‍♂🧝🏾‍♂️🧝🏾‍♂🧝🏿‍♂️🧝🏿‍♂🧞🧞‍♀️🧞‍♀🧞‍♂️🧞‍♂🧟🧟‍♀️🧟‍♀🧟‍♂️🧟‍♂🙍🙍🏻🙍🏼🙍🏽🙍🏾🙍🏿🙍‍♂️🙍‍♂🙍🏻‍♂️🙍🏻‍♂🙍🏼‍♂️🙍🏼‍♂🙍🏽‍♂️🙍🏽‍♂🙍🏾‍♂️🙍🏾‍♂🙍🏿‍♂️🙍🏿‍♂🙍‍♀️🙍‍♀🙍🏻‍♀️🙍🏻‍♀🙍🏼‍♀️🙍🏼‍♀🙍🏽‍♀️🙍🏽‍♀🙍🏾‍♀️🙍🏾‍♀🙍🏿‍♀️🙍🏿‍♀🙎🙎🏻🙎🏼🙎🏽🙎🏾🙎🏿🙎‍♂️🙎‍♂🙎🏻‍♂️🙎🏻‍♂🙎🏼‍♂️🙎🏼‍♂🙎🏽‍♂️🙎🏽‍♂🙎🏾‍♂️🙎🏾‍♂🙎🏿‍♂️🙎🏿‍♂🙎‍♀️🙎‍♀🙎🏻‍♀️🙎🏻‍♀🙎🏼‍♀️🙎🏼‍♀🙎🏽‍♀️🙎🏽‍♀🙎🏾‍♀️🙎🏾‍♀🙎🏿‍♀️🙎🏿‍♀🙅🙅🏻🙅🏼🙅🏽🙅🏾🙅🏿🙅‍♂️🙅‍♂🙅🏻‍♂️🙅🏻‍♂🙅🏼‍♂️🙅🏼‍♂🙅🏽‍♂️🙅🏽‍♂🙅🏾‍♂️🙅🏾‍♂🙅🏿‍♂️🙅🏿‍♂🙅‍♀️🙅‍♀🙅🏻‍♀️🙅🏻‍♀🙅🏼‍♀️🙅🏼‍♀🙅🏽‍♀️🙅🏽‍♀🙅🏾‍♀️🙅🏾‍♀🙅🏿‍♀️🙅🏿‍♀🙆🙆🏻🙆🏼🙆🏽🙆🏾🙆🏿🙆‍♂️🙆‍♂🙆🏻‍♂️🙆🏻‍♂🙆🏼‍♂️🙆🏼‍♂🙆🏽‍♂️🙆🏽‍♂🙆🏾‍♂️🙆🏾‍♂🙆🏿‍♂️🙆🏿‍♂🙆‍♀️🙆‍♀🙆🏻‍♀️🙆🏻‍♀🙆🏼‍♀️🙆🏼‍♀🙆🏽‍♀️🙆🏽‍♀🙆🏾‍♀️🙆🏾‍♀🙆🏿‍♀️🙆🏿‍♀💁💁🏻💁🏼💁🏽💁🏾💁🏿💁‍♂️💁‍♂💁🏻‍♂️💁🏻‍♂💁🏼‍♂️💁🏼‍♂💁🏽‍♂️💁🏽‍♂💁🏾‍♂️💁🏾‍♂💁🏿‍♂️💁🏿‍♂💁‍♀️💁‍♀💁🏻‍♀️💁🏻‍♀💁🏼‍♀️💁🏼‍♀💁🏽‍♀️💁🏽‍♀💁🏾‍♀️💁🏾‍♀💁🏿‍♀️💁🏿‍♀🙋🙋🏻🙋🏼🙋🏽🙋🏾🙋🏿🙋‍♂️🙋‍♂🙋🏻‍♂️🙋🏻‍♂🙋🏼‍♂️🙋🏼‍♂🙋🏽‍♂️🙋🏽‍♂🙋🏾‍♂️🙋🏾‍♂🙋🏿‍♂️🙋🏿‍♂🙋‍♀️🙋‍♀🙋🏻‍♀️🙋🏻‍♀🙋🏼‍♀️🙋🏼‍♀🙋🏽‍♀️🙋🏽‍♀🙋🏾‍♀️🙋🏾‍♀🙋🏿‍♀️🙋🏿‍♀🙇🙇🏻🙇🏼🙇🏽🙇🏾🙇🏿🙇‍♂️🙇‍♂🙇🏻‍♂️🙇🏻‍♂🙇🏼‍♂️🙇🏼‍♂🙇🏽‍♂️🙇🏽‍♂🙇🏾‍♂️🙇🏾‍♂🙇🏿‍♂️🙇🏿‍♂🙇‍♀️🙇‍♀🙇🏻‍♀️🙇🏻‍♀🙇🏼‍♀️🙇🏼‍♀🙇🏽‍♀️🙇🏽‍♀🙇🏾‍♀️🙇🏾‍♀🙇🏿‍♀️🙇🏿‍♀🤦🤦🏻🤦🏼🤦🏽🤦🏾🤦🏿🤦‍♂️🤦‍♂🤦🏻‍♂️🤦🏻‍♂🤦🏼‍♂️🤦🏼‍♂🤦🏽‍♂️🤦🏽‍♂🤦🏾‍♂️🤦🏾‍♂🤦🏿‍♂️🤦🏿‍♂🤦‍♀️🤦‍♀🤦🏻‍♀️🤦🏻‍♀🤦🏼‍♀️🤦🏼‍♀🤦🏽‍♀️🤦🏽‍♀🤦🏾‍♀️🤦🏾‍♀🤦🏿‍♀️🤦🏿‍♀🤷🤷🏻🤷🏼🤷🏽🤷🏾🤷🏿🤷‍♂️🤷‍♂🤷🏻‍♂️🤷🏻‍♂🤷🏼‍♂️🤷🏼‍♂🤷🏽‍♂️🤷🏽‍♂🤷🏾‍♂️🤷🏾‍♂🤷🏿‍♂️🤷🏿‍♂🤷‍♀️🤷‍♀🤷🏻‍♀️🤷🏻‍♀🤷🏼‍♀️🤷🏼‍♀🤷🏽‍♀️🤷🏽‍♀🤷🏾‍♀️🤷🏾‍♀🤷🏿‍♀️🤷🏿‍♀💆💆🏻💆🏼💆🏽💆🏾💆🏿💆‍♂️💆‍♂💆🏻‍♂️💆🏻‍♂💆🏼‍♂️💆🏼‍♂💆🏽‍♂️💆🏽‍♂💆🏾‍♂️💆🏾‍♂💆🏿‍♂️💆🏿‍♂💆‍♀️💆‍♀💆🏻‍♀️💆🏻‍♀💆🏼‍♀️💆🏼‍♀💆🏽‍♀️💆🏽‍♀💆🏾‍♀️💆🏾‍♀💆🏿‍♀️💆🏿‍♀💇💇🏻💇🏼💇🏽💇🏾💇🏿💇‍♂️💇‍♂💇🏻‍♂️💇🏻‍♂💇🏼‍♂️💇🏼‍♂💇🏽‍♂️💇🏽‍♂💇🏾‍♂️💇🏾‍♂💇🏿‍♂️💇🏿‍♂💇‍♀️💇‍♀💇🏻‍♀️💇🏻‍♀💇🏼‍♀️💇🏼‍♀💇🏽‍♀️💇🏽‍♀💇🏾‍♀️💇🏾‍♀💇🏿‍♀️💇🏿‍♀🚶🚶🏻🚶🏼🚶🏽🚶🏾🚶🏿🚶‍♂️🚶‍♂🚶🏻‍♂️🚶🏻‍♂🚶🏼‍♂️🚶🏼‍♂🚶🏽‍♂️🚶🏽‍♂🚶🏾‍♂️🚶🏾‍♂🚶🏿‍♂️🚶🏿‍♂🚶‍♀️🚶‍♀🚶🏻‍♀️🚶🏻‍♀🚶🏼‍♀️🚶🏼‍♀🚶🏽‍♀️🚶🏽‍♀🚶🏾‍♀️🚶🏾‍♀🚶🏿‍♀️🚶🏿‍♀🏃🏃🏻🏃🏼🏃🏽🏃🏾🏃🏿🏃‍♂️🏃‍♂🏃🏻‍♂️🏃🏻‍♂🏃🏼‍♂️🏃🏼‍♂🏃🏽‍♂️🏃🏽‍♂🏃🏾‍♂️🏃🏾‍♂🏃🏿‍♂️🏃🏿‍♂🏃‍♀️🏃‍♀🏃🏻‍♀️🏃🏻‍♀🏃🏼‍♀️🏃🏼‍♀🏃🏽‍♀️🏃🏽‍♀🏃🏾‍♀️🏃🏾‍♀🏃🏿‍♀️🏃🏿‍♀💃💃🏻💃🏼💃🏽💃🏾💃🏿🕺🕺🏻🕺🏼🕺🏽🕺🏾🕺🏿👯👯‍♂️👯‍♂👯‍♀️👯‍♀🧖🧖🏻🧖🏼🧖🏽🧖🏾🧖🏿🧖‍♀️🧖‍♀🧖🏻‍♀️🧖🏻‍♀🧖🏼‍♀️🧖🏼‍♀🧖🏽‍♀️🧖🏽‍♀🧖🏾‍♀️🧖🏾‍♀🧖🏿‍♀️🧖🏿‍♀🧖‍♂️🧖‍♂🧖🏻‍♂️🧖🏻‍♂🧖🏼‍♂️🧖🏼‍♂🧖🏽‍♂️🧖🏽‍♂🧖🏾‍♂️🧖🏾‍♂🧖🏿‍♂️🧖🏿‍♂🧗🧗🏻🧗🏼🧗🏽🧗🏾🧗🏿🧗‍♀️🧗‍♀🧗🏻‍♀️🧗🏻‍♀🧗🏼‍♀️🧗🏼‍♀🧗🏽‍♀️🧗🏽‍♀🧗🏾‍♀️🧗🏾‍♀🧗🏿‍♀️🧗🏿‍♀🧗‍♂️🧗‍♂🧗🏻‍♂️🧗🏻‍♂🧗🏼‍♂️🧗🏼‍♂🧗🏽‍♂️🧗🏽‍♂🧗🏾‍♂️🧗🏾‍♂🧗🏿‍♂️🧗🏿‍♂🧘🧘🏻🧘🏼🧘🏽🧘🏾🧘🏿🧘‍♀️🧘‍♀🧘🏻‍♀️🧘🏻‍♀🧘🏼‍♀️🧘🏼‍♀🧘🏽‍♀️🧘🏽‍♀🧘🏾‍♀️🧘🏾‍♀🧘🏿‍♀️🧘🏿‍♀🧘‍♂️🧘‍♂🧘🏻‍♂️🧘🏻‍♂🧘🏼‍♂️🧘🏼‍♂🧘🏽‍♂️🧘🏽‍♂🧘🏾‍♂️🧘🏾‍♂🧘🏿‍♂️🧘🏿‍♂🛀🛀🏻🛀🏼🛀🏽🛀🏾🛀🏿🛌🛌🏻🛌🏼🛌🏽🛌🏾🛌🏿🕴️🕴🕴🏻🕴🏼🕴🏽🕴🏾🕴🏿🗣️🗣👤👥🤺🏇🏇🏻🏇🏼🏇🏽🏇🏾🏇🏿⛷️⛷🏂🏂🏻🏂🏼🏂🏽🏂🏾🏂🏿🏌️🏌🏌🏻🏌🏼🏌🏽🏌🏾🏌🏿🏌️‍♂️🏌‍♂️🏌️‍♂🏌‍♂🏌🏻‍♂️🏌🏻‍♂🏌🏼‍♂️🏌🏼‍♂🏌🏽‍♂️🏌🏽‍♂🏌🏾‍♂️🏌🏾‍♂🏌🏿‍♂️🏌🏿‍♂🏌️‍♀️🏌‍♀️🏌️‍♀🏌‍♀🏌🏻‍♀️🏌🏻‍♀🏌🏼‍♀️🏌🏼‍♀🏌🏽‍♀️🏌🏽‍♀🏌🏾‍♀️🏌🏾‍♀🏌🏿‍♀️🏌🏿‍♀🏄🏄🏻🏄🏼🏄🏽🏄🏾🏄🏿🏄‍♂️🏄‍♂🏄🏻‍♂️🏄🏻‍♂🏄🏼‍♂️🏄🏼‍♂🏄🏽‍♂️🏄🏽‍♂🏄🏾‍♂️🏄🏾‍♂🏄🏿‍♂️🏄🏿‍♂🏄‍♀️🏄‍♀🏄🏻‍♀️🏄🏻‍♀🏄🏼‍♀️🏄🏼‍♀🏄🏽‍♀️🏄🏽‍♀🏄🏾‍♀️🏄🏾‍♀🏄🏿‍♀️🏄🏿‍♀🚣🚣🏻🚣🏼🚣🏽🚣🏾🚣🏿🚣‍♂️🚣‍♂🚣🏻‍♂️🚣🏻‍♂🚣🏼‍♂️🚣🏼‍♂🚣🏽‍♂️🚣🏽‍♂🚣🏾‍♂️🚣🏾‍♂🚣🏿‍♂️🚣🏿‍♂🚣‍♀️🚣‍♀🚣🏻‍♀️🚣🏻‍♀🚣🏼‍♀️🚣🏼‍♀🚣🏽‍♀️🚣🏽‍♀🚣🏾‍♀️🚣🏾‍♀🚣🏿‍♀️🚣🏿‍♀🏊🏊🏻🏊🏼🏊🏽🏊🏾🏊🏿🏊‍♂️🏊‍♂🏊🏻‍♂️🏊🏻‍♂🏊🏼‍♂️🏊🏼‍♂🏊🏽‍♂️🏊🏽‍♂🏊🏾‍♂️🏊🏾‍♂🏊🏿‍♂️🏊🏿‍♂🏊‍♀️🏊‍♀🏊🏻‍♀️🏊🏻‍♀🏊🏼‍♀️🏊🏼‍♀🏊🏽‍♀️🏊🏽‍♀🏊🏾‍♀️🏊🏾‍♀🏊🏿‍♀️🏊🏿‍♀⛹️⛹⛹🏻⛹🏼⛹🏽⛹🏾⛹🏿⛹️‍♂️⛹‍♂️⛹️‍♂⛹‍♂⛹🏻‍♂️⛹🏻‍♂⛹🏼‍♂️⛹🏼‍♂⛹🏽‍♂️⛹🏽‍♂⛹🏾‍♂️⛹🏾‍♂⛹🏿‍♂️⛹🏿‍♂⛹️‍♀️⛹‍♀️⛹️‍♀⛹‍♀⛹🏻‍♀️⛹🏻‍♀⛹🏼‍♀️⛹🏼‍♀⛹🏽‍♀️⛹🏽‍♀⛹🏾‍♀️⛹🏾‍♀⛹🏿‍♀️⛹🏿‍♀🏋️🏋🏋🏻🏋🏼🏋🏽🏋🏾🏋🏿🏋️‍♂️🏋‍♂️🏋️‍♂🏋‍♂🏋🏻‍♂️🏋🏻‍♂🏋🏼‍♂️🏋🏼‍♂🏋🏽‍♂️🏋🏽‍♂🏋🏾‍♂️🏋🏾‍♂🏋🏿‍♂️🏋🏿‍♂🏋️‍♀️🏋‍♀️🏋️‍♀🏋‍♀🏋🏻‍♀️🏋🏻‍♀🏋🏼‍♀️🏋🏼‍♀🏋🏽‍♀️🏋🏽‍♀🏋🏾‍♀️🏋🏾‍♀🏋🏿‍♀️🏋🏿‍♀🚴🚴🏻🚴🏼🚴🏽🚴🏾🚴🏿🚴‍♂️🚴‍♂🚴🏻‍♂️🚴🏻‍♂🚴🏼‍♂️🚴🏼‍♂🚴🏽‍♂️🚴🏽‍♂🚴🏾‍♂️🚴🏾‍♂🚴🏿‍♂️🚴🏿‍♂🚴‍♀️🚴‍♀🚴🏻‍♀️🚴🏻‍♀🚴🏼‍♀️🚴🏼‍♀🚴🏽‍♀️🚴🏽‍♀🚴🏾‍♀️🚴🏾‍♀🚴🏿‍♀️🚴🏿‍♀🚵🚵🏻🚵🏼🚵🏽🚵🏾🚵🏿🚵‍♂️🚵‍♂🚵🏻‍♂️🚵🏻‍♂🚵🏼‍♂️🚵🏼‍♂🚵🏽‍♂️🚵🏽‍♂🚵🏾‍♂️🚵🏾‍♂🚵🏿‍♂️🚵🏿‍♂🚵‍♀️🚵‍♀🚵🏻‍♀️🚵🏻‍♀🚵🏼‍♀️🚵🏼‍♀🚵🏽‍♀️🚵🏽‍♀🚵🏾‍♀️🚵🏾‍♀🚵🏿‍♀️🚵🏿‍♀🏎️🏎🏍️🏍🤸🤸🏻🤸🏼🤸🏽🤸🏾🤸🏿🤸‍♂️🤸‍♂🤸🏻‍♂️🤸🏻‍♂🤸🏼‍♂️🤸🏼‍♂🤸🏽‍♂️🤸🏽‍♂🤸🏾‍♂️🤸🏾‍♂🤸🏿‍♂️🤸🏿‍♂🤸‍♀️🤸‍♀🤸🏻‍♀️🤸🏻‍♀🤸🏼‍♀️🤸🏼‍♀🤸🏽‍♀️🤸🏽‍♀🤸🏾‍♀️🤸🏾‍♀🤸🏿‍♀️🤸🏿‍♀🤼🤼‍♂️🤼‍♂🤼‍♀️🤼‍♀🤽🤽🏻🤽🏼🤽🏽🤽🏾🤽🏿🤽‍♂️🤽‍♂🤽🏻‍♂️🤽🏻‍♂🤽🏼‍♂️🤽🏼‍♂🤽🏽‍♂️🤽🏽‍♂🤽🏾‍♂️🤽🏾‍♂🤽🏿‍♂️🤽🏿‍♂🤽‍♀️🤽‍♀🤽🏻‍♀️🤽🏻‍♀🤽🏼‍♀️🤽🏼‍♀🤽🏽‍♀️🤽🏽‍♀🤽🏾‍♀️🤽🏾‍♀🤽🏿‍♀️🤽🏿‍♀🤾🤾🏻🤾🏼🤾🏽🤾🏾🤾🏿🤾‍♂️🤾‍♂🤾🏻‍♂️🤾🏻‍♂🤾🏼‍♂️🤾🏼‍♂🤾🏽‍♂️🤾🏽‍♂🤾🏾‍♂️🤾🏾‍♂🤾🏿‍♂️🤾🏿‍♂🤾‍♀️🤾‍♀🤾🏻‍♀️🤾🏻‍♀🤾🏼‍♀️🤾🏼‍♀🤾🏽‍♀️🤾🏽‍♀🤾🏾‍♀️🤾🏾‍♀🤾🏿‍♀️🤾🏿‍♀🤹🤹🏻🤹🏼🤹🏽🤹🏾🤹🏿🤹‍♂️🤹‍♂🤹🏻‍♂️🤹🏻‍♂🤹🏼‍♂️🤹🏼‍♂🤹🏽‍♂️🤹🏽‍♂🤹🏾‍♂️🤹🏾‍♂🤹🏿‍♂️🤹🏿‍♂🤹‍♀️🤹‍♀🤹🏻‍♀️🤹🏻‍♀🤹🏼‍♀️🤹🏼‍♀🤹🏽‍♀️🤹🏽‍♀🤹🏾‍♀️🤹🏾‍♀🤹🏿‍♀️🤹🏿‍♀👫👬👭💏👩‍❤️‍💋‍👨👩‍❤‍💋‍👨👨‍❤️‍💋‍👨👨‍❤‍💋‍👨👩‍❤️‍💋‍👩👩‍❤‍💋‍👩💑👩‍❤️‍👨👩‍❤‍👨👨‍❤️‍👨👨‍❤‍👨👩‍❤️‍👩👩‍❤‍👩👪👨‍👩‍👦👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧👨‍👦👨‍👦‍👦👨‍👧👨‍👧‍👦👨‍👧‍👧👩‍👦👩‍👦‍👦👩‍👧👩‍👧‍👦👩‍👧‍👧🤳🤳🏻🤳🏼🤳🏽🤳🏾🤳🏿💪💪🏻💪🏼💪🏽💪🏾💪🏿🦵🦵🏻🦵🏼🦵🏽🦵🏾🦵🏿🦶🦶🏻🦶🏼🦶🏽🦶🏾🦶🏿👈👈🏻👈🏼👈🏽👈🏾👈🏿👉👉🏻👉🏼👉🏽👉🏾👉🏿☝️☝☝🏻☝🏼☝🏽☝🏾☝🏿👆👆🏻👆🏼👆🏽👆🏾👆🏿🖕🖕🏻🖕🏼🖕🏽🖕🏾🖕🏿👇👇🏻👇🏼👇🏽👇🏾👇🏿✌️✌✌🏻✌🏼✌🏽✌🏾✌🏿🤞🤞🏻🤞🏼🤞🏽🤞🏾🤞🏿🖖🖖🏻🖖🏼🖖🏽🖖🏾🖖🏿🤘🤘🏻🤘🏼🤘🏽🤘🏾🤘🏿🤙🤙🏻🤙🏼🤙🏽🤙🏾🤙🏿🖐️🖐🖐🏻🖐🏼🖐🏽🖐🏾🖐🏿✋✋🏻✋🏼✋🏽✋🏾✋🏿👌👌🏻👌🏼👌🏽👌🏾👌🏿👍👍🏻👍🏼👍🏽👍🏾👍🏿👎👎🏻👎🏼👎🏽👎🏾👎🏿✊✊🏻✊🏼✊🏽✊🏾✊🏿👊👊🏻👊🏼👊🏽👊🏾👊🏿🤛🤛🏻🤛🏼🤛🏽🤛🏾🤛🏿🤜🤜🏻🤜🏼🤜🏽🤜🏾🤜🏿🤚🤚🏻🤚🏼🤚🏽🤚🏾🤚🏿👋👋🏻👋🏼👋🏽👋🏾👋🏿🤟🤟🏻🤟🏼🤟🏽🤟🏾🤟🏿✍️✍✍🏻✍🏼✍🏽✍🏾✍🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿👐👐🏻👐🏼👐🏽👐🏾👐🏿🙌🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿🤲🤲🏻🤲🏼🤲🏽🤲🏾🤲🏿🙏🙏🏻🙏🏼🙏🏽🙏🏾🙏🏿🤝💅💅🏻💅🏼💅🏽💅🏾💅🏿👂👂🏻👂🏼👂🏽👂🏾👂🏿👃👃🏻👃🏼👃🏽👃🏾👃🏿🦰🦱🦲🦳👣👀👁️👁👁️‍🗨️👁‍🗨️👁️‍🗨👁‍🗨🧠🦴🦷👅👄💋💘❤️❤💓💔💕💖💗💙💚💛🧡💜🖤💝💞💟❣️❣💌💤💢💣💥💦💨💫💬🗨️🗨🗯️🗯💭🕳️🕳👓🕶️🕶🥽🥼👔👕👖🧣🧤🧥🧦👗👘👙👚👛👜👝🛍️🛍🎒👞👟🥾🥿👠👡👢👑👒🎩🎓🧢⛑️⛑📿💄💍💎🐵🐒🦍🐶🐕🐩🐺🦊🦝🐱🐈🦁🐯🐅🐆🐴🐎🦄🦓🦌🐮🐂🐃🐄🐷🐖🐗🐽🐏🐑🐐🐪🐫🦙🦒🐘🦏🦛🐭🐁🐀🐹🐰🐇🐿️🐿🦔🦇🐻🐨🐼🦘🦡🐾🦃🐔🐓🐣🐤🐥🐦🐧🕊️🕊🦅🦆🦢🦉🦚🦜🐸🐊🐢🦎🐍🐲🐉🦕🦖🐳🐋🐬🐟🐠🐡🦈🐙🐚🦀🦞🦐🦑🐌🦋🐛🐜🐝🐞🦗🕷️🕷🕸️🕸🦂🦟🦠💐🌸💮🏵️🏵🌹🥀🌺🌻🌼🌷🌱🌲🌳🌴🌵🌾🌿☘️☘🍀🍁🍂🍃🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🥝🍅🥥🥑🍆🥔🥕🌽🌶️🌶🥒🥬🥦🍄🥜🌰🍞🥐🥖🥨🥯🥞🧀🍖🍗🥩🥓🍔🍟🍕🌭🥪🌮🌯🥙🥚🍳🥘🍲🥣🥗🍿🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🍼🥛☕🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🥤🥢🍽️🍽🍴🥄🔪🏺🌍🌎🌏🌐🗺️🗺🗾🧭🏔️🏔⛰️⛰🌋🗻🏕️🏕🏖️🏖🏜️🏜🏝️🏝🏞️🏞🏟️🏟🏛️🏛🏗️🏗🧱🏘️🏘🏚️🏚🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪🕌🕍⛩️⛩🕋⛲⛺🌁🌃🏙️🏙🌄🌅🌆🌇🌉♨️♨🌌🎠🎡🎢💈🎪🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞🚋🚌🚍🚎🚐🚑🚒🚓🚔🚕🚖🚗🚘🚙🚚🚛🚜🚲🛴🛹🛵🚏🛣️🛣🛤️🛤🛢️🛢⛽🚨🚥🚦🛑🚧⚓⛵🛶🚤🛳️🛳⛴️⛴🛥️🛥🚢✈️✈🛩️🛩🛫🛬💺🚁🚟🚠🚡🛰️🛰🚀🛸🛎️🛎🧳⌛⏳⌚⏰⏱️⏱⏲️⏲🕰️🕰🕛🕧🕐🕜🕑🕝🕒🕞🕓🕟🕔🕠🕕🕡🕖🕢🕗🕣🕘🕤🕙🕥🕚🕦🌑🌒🌓🌔🌕🌖🌗🌘🌙🌚🌛🌜🌡️🌡☀️☀🌝🌞⭐🌟🌠☁️☁⛅⛈️⛈🌤️🌤🌥️🌥🌦️🌦🌧️🌧🌨️🌨🌩️🌩🌪️🌪🌫️🌫🌬️🌬🌀🌈🌂☂️☂☔⛱️⛱⚡❄️❄☃️☃⛄☄️☄🔥💧🌊🎃🎄🎆🎇🧨✨🎈🎉🎊🎋🎍🎎🎏🎐🎑🧧🎀🎁🎗️🎗🎟️🎟🎫🎖️🎖🏆🏅🥇🥈🥉⚽⚾🥎🏀🏐🏈🏉🎾🥏🎳🏏🏑🏒🥍🏓🏸🥊🥋🥅⛳⛸️⛸🎣🎽🎿🛷🥌🎯🎱🔮🧿🎮🕹️🕹🎰🎲🧩🧸♠️♠♥️♥♦️♦♣️♣♟️♟🃏🀄🎴🎭🖼️🖼🎨🧵🧶🔇🔈🔉🔊📢📣📯🔔🔕🎼🎵🎶🎙️🎙🎚️🎚🎛️🎛🎤🎧📻🎷🎸🎹🎺🎻🥁📱📲☎️☎📞📟📠🔋🔌💻🖥️🖥🖨️🖨⌨️⌨🖱️🖱🖲️🖲💽💾💿📀🧮🎥🎞️🎞📽️📽🎬📺📷📸📹📼🔍🔎🕯️🕯💡🔦🏮📔📕📖📗📘📙📚📓📒📃📜📄📰🗞️🗞📑🔖🏷️🏷💰💴💵💶💷💸💳🧾💹💱💲✉️✉📧📨📩📤📥📦📫📪📬📭📮🗳️🗳✏️✏✒️✒🖋️🖋🖊️🖊🖌️🖌🖍️🖍📝💼📁📂🗂️🗂📅📆🗒️🗒🗓️🗓📇📈📉📊📋📌📍📎🖇️🖇📏📐✂️✂🗃️🗃🗄️🗄🗑️🗑🔒🔓🔏🔐🔑🗝️🗝🔨⛏️⛏⚒️⚒🛠️🛠🗡️🗡⚔️⚔🔫🏹🛡️🛡🔧🔩⚙️⚙🗜️🗜⚖️⚖🔗⛓️⛓🧰🧲⚗️⚗🧪🧫🧬🔬🔭📡💉💊🚪🛏️🛏🛋️🛋🚽🚿🛁🧴🧷🧹🧺🧻🧼🧽🧯🛒🚬⚰️⚰⚱️⚱🗿🏧🚮🚰♿🚹🚺🚻🚼🚾🛂🛃🛄🛅⚠️⚠🚸⛔🚫🚳🚭🚯🚱🚷📵🔞☢️☢☣️☣⬆️⬆↗️↗➡️➡↘️↘⬇️⬇↙️↙⬅️⬅↖️↖↕️↕↔️↔↩️↩↪️↪⤴️⤴⤵️⤵🔃🔄🔙🔚🔛🔜🔝🛐⚛️⚛🕉️🕉✡️✡☸️☸☯️☯✝️✝☦️☦☪️☪☮️☮🕎🔯♈♉♊♋♌♍♎♏♐♑♒♓⛎🔀🔁🔂▶️▶⏩⏭️⏭⏯️⏯◀️◀⏪⏮️⏮🔼⏫🔽⏬⏸️⏸⏹️⏹⏺️⏺⏏️⏏🎦🔅🔆📶📳📴♀️♀♂️♂⚕️⚕♾️♾♻️♻⚜️⚜🔱📛🔰⭕✅☑️☑✔️✔✖️✖❌❎➕➖➗➰➿〽️〽✳️✳✴️✴❇️❇‼️‼⁉️⁉❓❔❕❗〰️〰©️©®️®™️™#️⃣#⃣*️⃣*⃣0️⃣0⃣1️⃣1⃣2️⃣2⃣3️⃣3⃣4️⃣4⃣5️⃣5⃣6️⃣6⃣7️⃣7⃣8️⃣8⃣9️⃣9⃣🔟💯🔠🔡🔢🔣🔤🅰️🅰🆎🅱️🅱🆑🆒🆓ℹ️ℹ🆔Ⓜ️Ⓜ🆕🆖🅾️🅾🆗🅿️🅿🆘🆙🆚🈁🈂️🈂🈷️🈷🈶🈯🉐🈹🈚🈲🉑🈸🈴🈳㊗️㊗㊙️㊙🈺🈵▪️▪▫️▫◻️◻◼️◼◽◾⬛⬜🔶🔷🔸🔹🔺🔻💠🔘🔲🔳⚪⚫🔴🔵🏁🚩🎌🏴🏳️🏳🏳️‍🌈🏳‍🌈🏴‍☠️🏴‍☠🇦🇨🇦🇩🇦🇪🇦🇫🇦🇬🇦🇮🇦🇱🇦🇲🇦🇴🇦🇶🇦🇷🇦🇸🇦🇹🇦🇺🇦🇼🇦🇽🇦🇿🇧🇦🇧🇧🇧🇩🇧🇪🇧🇫🇧🇬🇧🇭🇧🇮🇧🇯🇧🇱🇧🇲🇧🇳🇧🇴🇧🇶🇧🇷🇧🇸🇧🇹🇧🇻🇧🇼🇧🇾🇧🇿🇨🇦🇨🇨🇨🇩🇨🇫🇨🇬🇨🇭🇨🇮🇨🇰🇨🇱🇨🇲🇨🇳🇨🇴🇨🇵🇨🇷🇨🇺🇨🇻🇨🇼🇨🇽🇨🇾🇨🇿🇩🇪🇩🇬🇩🇯🇩🇰🇩🇲🇩🇴🇩🇿🇪🇦🇪🇨🇪🇪🇪🇬🇪🇭🇪🇷🇪🇸🇪🇹🇪🇺🇫🇮🇫🇯🇫🇰🇫🇲🇫🇴🇫🇷🇬🇦🇬🇧🇬🇩🇬🇪🇬🇫🇬🇬🇬🇭🇬🇮🇬🇱🇬🇲🇬🇳🇬🇵🇬🇶🇬🇷🇬🇸🇬🇹🇬🇺🇬🇼🇬🇾🇭🇰🇭🇲🇭🇳🇭🇷🇭🇹🇭🇺🇮🇨🇮🇩🇮🇪🇮🇱🇮🇲🇮🇳🇮🇴🇮🇶🇮🇷🇮🇸🇮🇹🇯🇪🇯🇲🇯🇴🇯🇵🇰🇪🇰🇬🇰🇭🇰🇮🇰🇲🇰🇳🇰🇵🇰🇷🇰🇼🇰🇾🇰🇿🇱🇦🇱🇧🇱🇨🇱🇮🇱🇰🇱🇷🇱🇸🇱🇹🇱🇺🇱🇻🇱🇾🇲🇦🇲🇨🇲🇩🇲🇪🇲🇫🇲🇬🇲🇭🇲🇰🇲🇱🇲🇲🇲🇳🇲🇴🇲🇵🇲🇶🇲🇷🇲🇸🇲🇹🇲🇺🇲🇻🇲🇼🇲🇽🇲🇾🇲🇿🇳🇦🇳🇨🇳🇪🇳🇫🇳🇬🇳🇮🇳🇱🇳🇴🇳🇵🇳🇷🇳🇺🇳🇿🇴🇲🇵🇦🇵🇪🇵🇫🇵🇬🇵🇭🇵🇰🇵🇱🇵🇲🇵🇳🇵🇷🇵🇸🇵🇹🇵🇼🇵🇾🇶🇦🇷🇪🇷🇴🇷🇸🇷🇺🇷🇼🇸🇦🇸🇧🇸🇨🇸🇩🇸🇪🇸🇬🇸🇭🇸🇮🇸🇯🇸🇰🇸🇱🇸🇲🇸🇳🇸🇴🇸🇷🇸🇸🇸🇹🇸🇻🇸🇽🇸🇾🇸🇿🇹🇦🇹🇨🇹🇩🇹🇫🇹🇬🇹🇭🇹🇯🇹🇰🇹🇱🇹🇲🇹🇳🇹🇴🇹🇷🇹🇹🇹🇻🇹🇼🇹🇿🇺🇦🇺🇬🇺🇲🇺🇳🇺🇸🇺🇾🇺🇿🇻🇦🇻🇨🇻🇪🇻🇬🇻🇮🇻🇳🇻🇺🇼🇫🇼🇸🇽🇰🇾🇪🇾🇹🇿🇦🇿🇲🇿🇼🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿"
  );
  expect(() => emoji.parse(":-)")).toThrow();
  expect(() => emoji.parse("😀 is an emoji")).toThrow();
  expect(() => emoji.parse("😀stuff")).toThrow();
  expect(() => emoji.parse("stuff😀")).toThrow();
});

test("nanoid", () => {
  const nanoid = z.string().nanoid("custom error");
  nanoid.parse("lfNZluvAxMkf7Q8C5H-QS");
  nanoid.parse("mIU_4PJWikaU8fMbmkouz");
  nanoid.parse("Hb9ZUtUa2JDm_dD-47EGv");
  nanoid.parse("5Noocgv_8vQ9oPijj4ioQ");
  const result = nanoid.safeParse("Xq90uDyhddC53KsoASYJGX");
  expect(result).toMatchObject({ success: false });

  expect(result.error!.issues[0].message).toEqual("custom error");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "invalid_format",
        "format": "nanoid",
        "pattern": "/^[a-zA-Z0-9_-]{21}$/",
        "path": [],
        "message": "custom error"
      }
    ]]
  `);
});

test("bad nanoid", () => {
  const nanoid = z.string().nanoid("custom error");
  nanoid.parse("ySh_984wpDUu7IQRrLXAp");
  const result = nanoid.safeParse("invalid nanoid");
  expect(result).toMatchObject({ success: false });

  expect(result.error!.issues[0].message).toEqual("custom error");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "invalid_format",
        "format": "nanoid",
        "pattern": "/^[a-zA-Z0-9_-]{21}$/",
        "path": [],
        "message": "custom error"
      }
    ]]
  `);
});

test("good uuid", () => {
  const uuid = z.string().uuid("custom error");
  const goodUuids = [
    "9491d710-3185-1e06-bea0-6a2f275345e0",
    "9491d710-3185-2e06-bea0-6a2f275345e0",
    "9491d710-3185-3e06-bea0-6a2f275345e0",
    "9491d710-3185-4e06-bea0-6a2f275345e0",
    "9491d710-3185-5e06-bea0-6a2f275345e0",
    "9491d710-3185-5e06-aea0-6a2f275345e0",
    "9491d710-3185-5e06-8ea0-6a2f275345e0",
    "9491d710-3185-5e06-9ea0-6a2f275345e0",
    "00000000-0000-0000-0000-000000000000",
  ];

  for (const goodUuid of goodUuids) {
    const result = uuid.safeParse(goodUuid);
    expect(result.success).toEqual(true);
  }
});

test(`bad uuid`, () => {
  const uuid = z.string().uuid("custom error");
  for (const badUuid of [
    "9491d710-3185-0e06-bea0-6a2f275345e0",
    "9491d710-3185-5e06-0ea0-6a2f275345e0",
    "d89e7b01-7598-ed11-9d7a-0022489382fd", // new sequential id
    "b3ce60f8-e8b9-40f5-1150-172ede56ff74", // Variant 0 - RFC 4122: Reserved, NCS backward compatibility
    "92e76bf9-28b3-4730-cd7f-cb6bc51f8c09", // Variant 2 - RFC 4122: Reserved, Microsoft Corporation backward compatibility
    "invalid uuid",
    "9491d710-3185-4e06-bea0-6a2f275345e0X",
    "ffffffff-ffff-ffff-ffff-ffffffffffff",
  ]) {
    const result = uuid.safeParse(badUuid);
    expect(result).toMatchObject({ success: false });
    expect(result.error?.issues[0].message).toEqual("custom error");
  }
});

test("good guid", () => {
  const guid = z.string().guid("custom error");
  for (const goodGuid of [
    "9491d710-3185-4e06-bea0-6a2f275345e0",
    "d89e7b01-7598-ed11-9d7a-0022489382fd", // new sequential id
    "b3ce60f8-e8b9-40f5-1150-172ede56ff74", // Variant 0 - RFC 4122: Reserved, NCS backward compatibility
    "92e76bf9-28b3-4730-cd7f-cb6bc51f8c09", // Variant 2 - RFC 4122: Reserved, Microsoft Corporation backward compatibility
    "00000000-0000-0000-0000-000000000000",
    "ffffffff-ffff-ffff-ffff-ffffffffffff",
  ]) {
    const result = guid.safeParse(goodGuid);
    expect(result.success).toEqual(true);
  }
});

test("bad guid", () => {
  const guid = z.string().guid("custom error");
  for (const badGuid of ["9491d710-3185-4e06-bea0-6a2f275345e0X"]) {
    const result = guid.safeParse(badGuid);
    expect(result).toMatchObject({ success: false });
    expect(result.error?.issues[0].message).toEqual("custom error");
  }
});

test("cuid", () => {
  const cuid = z.string().cuid();
  cuid.parse("ckopqwooh000001la8mbi2im9");
  const result = cuid.safeParse("cifjhdsfhsd-invalid-cuid");
  expect(result).toMatchObject({ success: false });

  expect(result.error!.issues[0].message).toEqual("Invalid cuid");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "invalid_format",
        "format": "cuid",
        "pattern": "/^[cC][^\\\\s-]{8,}$/",
        "path": [],
        "message": "Invalid cuid"
      }
    ]]
  `);
});

test("cuid2", () => {
  const cuid2 = z.string().cuid2();
  const validStrings = [
    "a", // short string
    "tz4a98xxat96iws9zmbrgj3a", // normal string
    "kf5vz6ssxe4zjcb409rjgo747tc5qjazgptvotk6", // longer than require("@paralleldrive/cuid2").bigLength
  ];
  for (const s of validStrings) {
    cuid2.parse(s);
  }

  const invalidStrings = [
    "", // empty string
    "tz4a98xxat96iws9zMbrgj3a", // include uppercase
    "tz4a98xxat96iws-zmbrgj3a", // involve symbols
  ];
  const results = invalidStrings.map((s) => cuid2.safeParse(s));
  expect(results.every((r) => !r.success)).toEqual(true);
  if (!results[0].success) {
    expect(results[0].error.issues[0].message).toEqual("Invalid cuid2");
  }
});

test("ulid", () => {
  const ulid = z.string().ulid();
  ulid.parse("01ARZ3NDEKTSV4RRFFQ69G5FAV");
  const result = ulid.safeParse("invalidulid");
  expect(result).toMatchObject({ success: false });
  const tooLong = "01ARZ3NDEKTSV4RRFFQ69G5FAVA";
  expect(ulid.safeParse(tooLong)).toMatchObject({ success: false });

  const caseInsensitive = ulid.safeParse("01arZ3nDeKTsV4RRffQ69G5FAV");
  expect(caseInsensitive.success).toEqual(true);

  expect(result.error!.issues[0].message).toEqual("Invalid ULID");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "invalid_format",
        "format": "ulid",
        "pattern": "/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/",
        "path": [],
        "message": "Invalid ULID"
      }
    ]]
  `);
});

test("xid", () => {
  const xid = z.string().xid();
  xid.parse("9m4e2mr0ui3e8a215n4g");
  const result = xid.safeParse("invalidxid");
  expect(result).toMatchObject({ success: false });

  expect(result.error!.issues[0].message).toEqual("Invalid XID");
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "origin": "string",
        "code": "invalid_format",
        "format": "xid",
        "pattern": "/^[0-9a-vA-V]{20}$/",
        "path": [],
        "message": "Invalid XID"
      }
    ]]
  `);
});

test("ksuid", () => {
  const ksuid = z.string().ksuid();
  ksuid.parse("0o0t9hkGxgFLtd3lmJ4TSTeY0Vb");
  const result = ksuid.safeParse("invalidksuid");
  expect(result).toMatchObject({ success: false });
  const tooLong = "0o0t9hkGxgFLtd3lmJ4TSTeY0VbA";
  expect(ksuid.safeParse(tooLong)).toMatchObject({ success: false });
  expect(result.error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "ksuid",
        "message": "Invalid KSUID",
        "origin": "string",
        "path": [],
        "pattern": "/^[A-Za-z0-9]{27}$/",
      },
    ]
  `);
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
  expect(result.error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "regex",
        "message": "Invalid string: must match pattern /^moo+$/",
        "origin": "string",
        "path": [],
        "pattern": "/^moo+$/",
      },
    ]
  `);

  expect(() => z.string().uuid().parse("purr")).toThrow();
});

test("regexp error custom message", () => {
  const result = z
    .string()
    .regex(/^moo+$/, { message: "Custom error message" })
    .safeParse("boooo");
  expect(result.error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "regex",
        "message": "Custom error message",
        "origin": "string",
        "path": [],
        "pattern": "/^moo+$/",
      },
    ]
  `);

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

test("format", () => {
  expect(z.string().email().format).toEqual("email");
  expect(z.string().url().format).toEqual("url");
  expect(z.string().jwt().format).toEqual("jwt");
  expect(z.string().emoji().format).toEqual("emoji");
  expect(z.string().guid().format).toEqual("guid");
  expect(z.string().uuid().format).toEqual("uuid");
  expect(z.string().uuidv4().format).toEqual("uuid");
  expect(z.string().uuidv6().format).toEqual("uuid");
  expect(z.string().uuidv7().format).toEqual("uuid");
  expect(z.string().nanoid().format).toEqual("nanoid");
  expect(z.string().guid().format).toEqual("guid");
  expect(z.string().cuid().format).toEqual("cuid");
  expect(z.string().cuid2().format).toEqual("cuid2");
  expect(z.string().ulid().format).toEqual("ulid");
  expect(z.string().base64().format).toEqual("base64");
  // expect(z.string().jsonString().format).toEqual("json_string");
  // expect(z.string().json().format).toEqual("json_string");
  expect(z.string().xid().format).toEqual("xid");
  expect(z.string().ksuid().format).toEqual("ksuid");
  // expect(z.string().ip().format).toEqual("ip");
  expect(z.string().ipv4().format).toEqual("ipv4");
  expect(z.string().ipv6().format).toEqual("ipv6");
  expect(z.string().e164().format).toEqual("e164");
  expect(z.string().datetime().format).toEqual("datetime");
  expect(z.string().date().format).toEqual("date");
  expect(z.string().time().format).toEqual("time");
  expect(z.string().duration().format).toEqual("duration");
});

test("min max getters", () => {
  expect(z.string().min(5).minLength).toEqual(5);
  expect(z.string().min(5).min(10).minLength).toEqual(10);
  expect(z.string().minLength).toEqual(null);

  expect(z.string().max(5).maxLength).toEqual(5);
  expect(z.string().max(5).max(1).maxLength).toEqual(1);
  expect(z.string().max(5).max(10).maxLength).toEqual(5);
  expect(z.string().maxLength).toEqual(null);
});

test("trim", () => {
  expect(z.string().trim().min(2).parse(" 12 ")).toEqual("12");

  // ordering of methods is respected
  expect(z.string().min(2).trim().parse(" 1 ")).toEqual("1");
  expect(() => z.string().trim().min(2).parse(" 1 ")).toThrow();
});

test("lowerCase", () => {
  expect(z.string().toLowerCase().parse("ASDF")).toEqual("asdf");
  expect(z.string().toUpperCase().parse("asdf")).toEqual("ASDF");
});

test("datetime parsing", () => {
  const datetime = z.iso.datetime();
  datetime.parse("1970-01-01T00:00:00.000Z");
  datetime.parse("2022-10-13T09:52:31.816Z");
  datetime.parse("2022-10-13T09:52:31.8162314Z");
  datetime.parse("1970-01-01T00:00:00Z");
  datetime.parse("2022-10-13T09:52:31Z");
  datetime.parse("2022-10-13T09:52Z");
  expect(() => datetime.parse("")).toThrow();
  expect(() => datetime.parse("foo")).toThrow();
  expect(() => datetime.parse("2020-10-14")).toThrow();
  expect(() => datetime.parse("T18:45:12.123")).toThrow();
  expect(() => datetime.parse("2020-10-14T17:42:29+00:00")).toThrow();
  expect(() => datetime.parse("2020-10-14T17:42.123+00:00")).toThrow();

  const datetimeNoMs = z.iso.datetime({ precision: 0 });
  datetimeNoMs.parse("1970-01-01T00:00:00Z");
  datetimeNoMs.parse("2022-10-13T09:52:31Z");
  datetimeNoMs.parse("2022-10-13T09:52Z");
  expect(() => datetimeNoMs.parse("tuna")).toThrow();
  expect(() => datetimeNoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => datetimeNoMs.parse("1970-01-01T00:00:00.Z")).toThrow();
  expect(() => datetimeNoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();

  const datetime3Ms = z.iso.datetime({ precision: 3 });
  datetime3Ms.parse("1970-01-01T00:00:00.000Z");
  datetime3Ms.parse("2022-10-13T09:52:31.123Z");
  expect(() => datetime3Ms.parse("tuna")).toThrow();
  expect(() => datetime3Ms.parse("1970-01-01T00:00:00.1Z")).toThrow();
  expect(() => datetime3Ms.parse("1970-01-01T00:00:00.12Z")).toThrow();
  expect(() => datetime3Ms.parse("2022-10-13T09:52:31Z")).toThrow();
  expect(() => datetime3Ms.parse("2022-10-13T09:52Z")).toThrow();

  const datetimeOffset = z.iso.datetime({ offset: true });
  datetimeOffset.parse("1970-01-01T00:00:00.000Z");
  datetimeOffset.parse("2022-10-13T09:52:31.816234134Z");
  datetimeOffset.parse("1970-01-01T00:00:00Z");
  datetimeOffset.parse("2022-10-13T09:52:31.4Z");
  datetimeOffset.parse("2020-10-14T17:42:29+00:00");
  datetimeOffset.parse("2020-10-14T17:42:29+03:15");
  datetimeOffset.parse("2020-10-14T17:42:29+0315");
  datetimeOffset.parse("2020-10-14T17:42+0315");
  expect(() => datetimeOffset.parse("2020-10-14T17:42:29+03"));
  expect(() => datetimeOffset.parse("tuna")).toThrow();
  expect(() => datetimeOffset.parse("2022-10-13T09:52:31.Z")).toThrow();

  const datetimeOffsetNoMs = z.iso.datetime({ offset: true, precision: 0 });
  datetimeOffsetNoMs.parse("1970-01-01T00:00:00Z");
  datetimeOffsetNoMs.parse("2022-10-13T09:52:31Z");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00:00");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+0000");
  datetimeOffsetNoMs.parse("2020-10-14T17:42+0000");
  expect(() => datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("tuna")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("1970-01-01T00:00:00.000Z")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("1970-01-01T00:00:00.Z")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("2022-10-13T09:52:31.816Z")).toThrow();
  expect(() => datetimeOffsetNoMs.parse("2020-10-14T17:42:29.124+00:00")).toThrow();

  const datetimeOffset4Ms = z.iso.datetime({ offset: true, precision: 4 });
  datetimeOffset4Ms.parse("1970-01-01T00:00:00.1234Z");
  datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+00:00");
  datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+0000");
  expect(() => datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+00")).toThrow();
  expect(() => datetimeOffset4Ms.parse("tuna")).toThrow();
  expect(() => datetimeOffset4Ms.parse("1970-01-01T00:00:00.123Z")).toThrow();
  expect(() => datetimeOffset4Ms.parse("2020-10-14T17:42:29.124+00:00")).toThrow();
  expect(() => datetimeOffset4Ms.parse("2020-10-14T17:42+00:00")).toThrow();
});

test("date parsing", () => {
  const date = z.iso.date();
  date.parse("1970-01-01");
  date.parse("2022-01-31");
  date.parse("2022-03-31");
  date.parse("2022-04-30");
  date.parse("2022-05-31");
  date.parse("2022-06-30");
  date.parse("2022-07-31");
  date.parse("2022-08-31");
  date.parse("2022-09-30");
  date.parse("2022-10-31");
  date.parse("2022-11-30");
  date.parse("2022-12-31");

  date.parse("2000-02-29");
  date.parse("2400-02-29");
  expect(() => date.parse("2022-02-29")).toThrow();
  expect(() => date.parse("2100-02-29")).toThrow();
  expect(() => date.parse("2200-02-29")).toThrow();
  expect(() => date.parse("2300-02-29")).toThrow();
  expect(() => date.parse("2500-02-29")).toThrow();

  expect(() => date.parse("")).toThrow();
  expect(() => date.parse("foo")).toThrow();
  expect(() => date.parse("200-01-01")).toThrow();
  expect(() => date.parse("20000-01-01")).toThrow();
  expect(() => date.parse("2000-0-01")).toThrow();
  expect(() => date.parse("2000-011-01")).toThrow();
  expect(() => date.parse("2000-01-0")).toThrow();
  expect(() => date.parse("2000-01-011")).toThrow();
  expect(() => date.parse("2000/01/01")).toThrow();
  expect(() => date.parse("01-01-2022")).toThrow();
  expect(() => date.parse("01/01/2022")).toThrow();
  expect(() => date.parse("2000-01-01 00:00:00Z")).toThrow();
  expect(() => date.parse("2020-10-14T17:42:29+00:00")).toThrow();
  expect(() => date.parse("2020-10-14T17:42:29Z")).toThrow();
  expect(() => date.parse("2020-10-14T17:42:29")).toThrow();
  expect(() => date.parse("2020-10-14T17:42:29.123Z")).toThrow();

  expect(() => date.parse("2000-00-12")).toThrow();
  expect(() => date.parse("2000-12-00")).toThrow();
  expect(() => date.parse("2000-01-32")).toThrow();
  expect(() => date.parse("2000-13-01")).toThrow();
  expect(() => date.parse("2000-21-01")).toThrow();

  expect(() => date.parse("2000-02-30")).toThrow();
  expect(() => date.parse("2000-02-31")).toThrow();
  expect(() => date.parse("2000-04-31")).toThrow();
  expect(() => date.parse("2000-06-31")).toThrow();
  expect(() => date.parse("2000-09-31")).toThrow();
  expect(() => date.parse("2000-11-31")).toThrow();
});

test("time parsing", () => {
  const time = z.iso.time();
  time.parse("00:00:00");
  time.parse("23:00:00");
  time.parse("00:59:00");
  time.parse("00:00:59");
  time.parse("23:59:59");
  time.parse("09:52:31");
  time.parse("23:59:59.9999999");
  time.parse("23:59");
  expect(() => time.parse("")).toThrow();
  expect(() => time.parse("foo")).toThrow();
  expect(() => time.parse("00:00:00Z")).toThrow();
  expect(() => time.parse("0:00:00")).toThrow();
  expect(() => time.parse("00:0:00")).toThrow();
  expect(() => time.parse("00:00:0")).toThrow();
  expect(() => time.parse("00:00:00.000+00:00")).toThrow();

  expect(() => time.parse("24:00:00")).toThrow();
  expect(() => time.parse("00:60:00")).toThrow();
  expect(() => time.parse("00:00:60")).toThrow();
  expect(() => time.parse("24:60:60")).toThrow();
  expect(() => time.parse("24:60")).toThrow();

  const time2 = z.iso.time({ precision: 2 });
  time2.parse("00:00:00.00");
  time2.parse("09:52:31.12");
  time2.parse("23:59:59.99");
  expect(() => time2.parse("")).toThrow();
  expect(() => time2.parse("foo")).toThrow();
  expect(() => time2.parse("00:00:00")).toThrow();
  expect(() => time2.parse("00:00:00.00Z")).toThrow();
  expect(() => time2.parse("00:00:00.0")).toThrow();
  expect(() => time2.parse("00:00:00.000")).toThrow();
  expect(() => time2.parse("00:00:00.00+00:00")).toThrow();
  expect(() => time2.parse("23:59")).toThrow();
});

test("duration", () => {
  const duration = z.string().duration();

  const validDurations = [
    "P3Y6M4DT12H30M5S",
    "P2Y9M3DT12H31M8.001S",
    // "+P3Y6M4DT12H30M5S",
    // "-PT0.001S",
    // "+PT0.001S",
    "PT0,001S",
    "PT12H30M5S",
    // "-P2M1D",
    // "P-2M-1D",
    // "-P5DT10H",
    // "P-5DT-10H",
    "P1Y",
    "P2MT30M",
    "PT6H",
    "P5W",
    // "P0.5Y",
    // "P0,5Y",
    // "P42YT7.004M",
  ];

  const invalidDurations = [
    "foo bar",
    "",
    " ",
    "P",
    "PT",
    "P1Y2MT",
    "T1H",
    "P0.5Y1D",
    "P0,5Y6M",
    "P1YT",
    "P-2M-1D",
    "P-5DT-10H",
    "P1W2D",
    "-P1D",
  ];

  for (const val of validDurations) {
    const result = duration.safeParse(val);
    if (!result.success) {
      throw Error(`Valid duration could not be parsed: ${val}`);
    }
  }

  for (const val of invalidDurations) {
    const result = duration.safeParse(val);

    if (result.success) {
      throw Error(`Invalid duration was successful parsed: ${val}`);
    }

    expect(result.error.issues[0].message).toEqual("Invalid ISO duration");
  }
});

// test("IP validation", () => {
//   const ipSchema = z.string().ip();

//   // General IP validation (accepts both v4 and v6)
//   expect(ipSchema.safeParse("114.71.82.94").success).toBe(true);
//   expect(ipSchema.safeParse("0.0.0.0").success).toBe(true);
//   expect(ipSchema.safeParse("37.85.236.115").success).toBe(true);
//   expect(ipSchema.safeParse("1e5e:e6c8:daac:514b:114b:e360:d8c0:682c").success).toBe(true);
//   expect(ipSchema.safeParse("9d4:c956:420f:5788:4339:9b3b:2418:75c3").success).toBe(true);
//   expect(ipSchema.safeParse("a6ea::2454:a5ce:94.105.123.75").success).toBe(true);
//   expect(ipSchema.safeParse("474f:4c83::4e40:a47:ff95:0cda").success).toBe(true);
//   expect(ipSchema.safeParse("d329:0:25b4:db47:a9d1:0:4926:0000").success).toBe(true);
//   expect(ipSchema.safeParse("e48:10fb:1499:3e28:e4b6:dea5:4692:912c").success).toBe(true);

//   expect(ipSchema.safeParse("d329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af").success).toBe(false);
//   expect(ipSchema.safeParse("d5e7:7214:2b78::3906:85e6:53cc:709:32ba").success).toBe(false);
//   expect(ipSchema.safeParse("8f69::c757:395e:976e::3441").success).toBe(false);
//   expect(ipSchema.safeParse("54cb::473f:d516:0.255.256.22").success).toBe(false);
//   expect(ipSchema.safeParse("54cb::473f:d516:192.168.1").success).toBe(false);
//   expect(ipSchema.safeParse("256.0.4.4").success).toBe(false);
//   expect(ipSchema.safeParse("-1.0.555.4").success).toBe(false);
//   expect(ipSchema.safeParse("0.0.0.0.0").success).toBe(false);
//   expect(ipSchema.safeParse("1.1.1").success).toBe(false);
// });

test("IPv4 validation", () => {
  const ipv4 = z.string().ipv4();

  // Valid IPv4 addresses
  expect(ipv4.safeParse("114.71.82.94").success).toBe(true);
  expect(ipv4.safeParse("0.0.0.0").success).toBe(true);
  expect(ipv4.safeParse("37.85.236.115").success).toBe(true);
  expect(ipv4.safeParse("192.168.0.1").success).toBe(true);
  expect(ipv4.safeParse("255.255.255.255").success).toBe(true);
  expect(ipv4.safeParse("1.2.3.4").success).toBe(true);

  // Invalid IPv4 addresses
  expect(ipv4.safeParse("256.0.4.4").success).toBe(false);
  expect(ipv4.safeParse("-1.0.555.4").success).toBe(false);
  expect(ipv4.safeParse("0.0.0.0.0").success).toBe(false);
  expect(ipv4.safeParse("1.1.1").success).toBe(false);
  expect(ipv4.safeParse("1e5e:e6c8:daac:514b:114b:e360:d8c0:682c").success).toBe(false);
  expect(ipv4.safeParse("a6ea::2454:a5ce:94.105.123.75").success).toBe(false);
  expect(ipv4.safeParse("not an ip").success).toBe(false);
  expect(ipv4.safeParse("1.2.3").success).toBe(false);
  expect(ipv4.safeParse("1.2.3.4.5").success).toBe(false);
  expect(ipv4.safeParse("1.2.3.256").success).toBe(false);

  // Test specific error
  expect(() => ipv4.parse("6097:adfa:6f0b:220d:db08:5021:6191:7990")).toThrow();
});

test("IPv6 validation", () => {
  const ipv6 = z.string().ipv6();

  // Valid IPv6 addresses
  expect(ipv6.safeParse("1e5e:e6c8:daac:514b:114b:e360:d8c0:682c").success).toBe(true);
  expect(ipv6.safeParse("9d4:c956:420f:5788:4339:9b3b:2418:75c3").success).toBe(true);
  expect(ipv6.safeParse("a6ea::2454:a5ce:94.105.123.75").success).toBe(true);
  expect(ipv6.safeParse("474f:4c83::4e40:a47:ff95:0cda").success).toBe(true);
  expect(ipv6.safeParse("d329:0:25b4:db47:a9d1:0:4926:0000").success).toBe(true);
  expect(ipv6.safeParse("e48:10fb:1499:3e28:e4b6:dea5:4692:912c").success).toBe(true);
  expect(ipv6.safeParse("::1").success).toBe(true);
  expect(ipv6.safeParse("2001:db8::").success).toBe(true);
  expect(ipv6.safeParse("2001:0db8:85a3:0000:0000:8a2e:0370:7334").success).toBe(true);
  expect(ipv6.safeParse("2001:db8::192.168.0.1").success).toBe(true);
  expect(ipv6.safeParse("::ffff:192.168.0.1").success).toBe(true);
  expect(ipv6.safeParse("::ffff:c000:0280").success).toBe(true); // IPv4-mapped IPv6 address
  expect(ipv6.safeParse("64:ff9b::192.168.0.1").success).toBe(true); // IPv4/IPv6 translation

  // Invalid IPv6 addresses
  expect(ipv6.safeParse("d329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af").success).toBe(false);
  expect(ipv6.safeParse("d5e7:7214:2b78::3906:85e6:53cc:709:32ba").success).toBe(false);
  expect(ipv6.safeParse("8f69::c757:395e:976e::3441").success).toBe(false);
  expect(ipv6.safeParse("54cb::473f:d516:0.255.256.22").success).toBe(false);
  expect(ipv6.safeParse("54cb::473f:d516:192.168.1").success).toBe(false);
  expect(ipv6.safeParse("114.71.82.94").success).toBe(false);
  expect(ipv6.safeParse("not an ip").success).toBe(false);
  expect(ipv6.safeParse("g123::1234:5678").success).toBe(false);

  // Test specific error
  expect(() => ipv6.parse("254.164.77.1")).toThrow();
});

test("CIDR v4 validation", () => {
  const cidrV4 = z.string().cidrv4();

  // Valid CIDR v4 addresses
  expect(cidrV4.safeParse("192.168.0.0/24").success).toBe(true);
  expect(cidrV4.safeParse("10.0.0.0/8").success).toBe(true);
  expect(cidrV4.safeParse("172.16.0.0/12").success).toBe(true);
  expect(cidrV4.safeParse("0.0.0.0/0").success).toBe(true);
  expect(cidrV4.safeParse("255.255.255.255/32").success).toBe(true);

  // Invalid CIDR v4 addresses
  expect(cidrV4.safeParse("192.168.0.0").success).toBe(false); // Missing prefix
  expect(cidrV4.safeParse("192.168.0.0/33").success).toBe(false); // Invalid prefix length
  expect(cidrV4.safeParse("256.0.0.0/24").success).toBe(false); // Invalid IP
  expect(cidrV4.safeParse("192.168.0.0/-1").success).toBe(false); // Negative prefix length
  expect(cidrV4.safeParse("not a cidr").success).toBe(false); // Invalid format
});

test("CIDR v6 validation", () => {
  const cidrV6 = z.string().cidrv6();

  // Valid CIDR v6 addresses
  expect(cidrV6.safeParse("2001:db8::/32").success).toBe(true);
  expect(cidrV6.safeParse("::/0").success).toBe(true);
  expect(cidrV6.safeParse("fe80::/10").success).toBe(true);
  expect(cidrV6.safeParse("::1/128").success).toBe(true);
  expect(cidrV6.safeParse("2001:0db8:85a3::/64").success).toBe(true);

  // Invalid CIDR v6 addresses
  expect(cidrV6.safeParse("2001:db8::").success).toBe(false); // Missing prefix
  expect(cidrV6.safeParse("2001:db8::/129").success).toBe(false); // Invalid prefix length
  expect(cidrV6.safeParse("2001:db8::/abc").success).toBe(false); // Invalid prefix format
  expect(cidrV6.safeParse("not a cidr").success).toBe(false); // Invalid format
  expect(cidrV6.safeParse("192.168.0.0/24").success).toBe(false); // IPv4 CIDR in v6 validation
});

test("E.164 validation", () => {
  const e164Number = z.string().e164();
  expect(e164Number.safeParse("+1555555").success).toBe(true);

  const validE164Numbers = [
    "+1555555", // min-length (7 digits + '+')
    "+15555555",
    "+155555555",
    "+1555555555",
    "+15555555555",
    "+155555555555",
    "+1555555555555",
    "+15555555555555",
    "+155555555555555",
    "+105555555555555",
    "+100555555555555", // max-length (15 digits + '+')
  ];

  const invalidE164Numbers = [
    "", // empty
    "+", // only plus sign
    "-", // wrong sign
    " 555555555", // starts with space
    "555555555", // missing plus sign
    "+1 555 555 555", // space after plus sign
    "+1555 555 555", // space between numbers
    "+1555+555", // multiple plus signs
    "+1555555555555555", // too long
    "+115abc55", // non numeric characters in number part
    "+1555555 ", // space after number
  ];

  expect(validE164Numbers.every((number) => e164Number.safeParse(number).success)).toBe(true);
  expect(invalidE164Numbers.every((number) => e164Number.safeParse(number).success === false)).toBe(true);
});

test("continuability", () => {
  /** 
   *  | $ZodGUID
  | $ZodUUID
  | $ZodEmail
  | $ZodURL
  | $ZodEmoji
  | $ZodNanoID
  | $ZodCUID
  | $ZodCUID2
  | $ZodULID
  | $ZodXID
  | $ZodKSUID
  | $ZodISODateTime
  | $ZodISODate
  | $ZodISOTime
  | $ZodISODuration
  | $ZodIPv4
  | $ZodIPv6
  | $ZodCIDRv4
  | $ZodCIDRv6
  | $ZodBase64
  | $ZodBase64URL
  | $ZodE164
  | $ZodJWT;
   */
  expect(
    z
      .email()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "email",
        "message": "Invalid email address",
        "origin": "string",
        "path": [],
        "pattern": "/^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .uuid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "uuid",
        "message": "Invalid UUID",
        "origin": "string",
        "path": [],
        "pattern": "/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .url()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "url",
        "message": "Invalid URL",
        "path": [],
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .jwt()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "jwt",
        "message": "Invalid JWT",
        "path": [],
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .cidrv4()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "cidrv4",
        "message": "Invalid IPv4 range",
        "origin": "string",
        "path": [],
        "pattern": "/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\/([0-9]|[1-2][0-9]|3[0-2])$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .cidrv6()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "cidrv6",
        "message": "Invalid IPv6 range",
        "path": [],
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .ipv4()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "ipv4",
        "message": "Invalid IPv4 address",
        "origin": "string",
        "path": [],
        "pattern": "/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .ipv6()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "ipv6",
        "message": "Invalid IPv6 address",
        "path": [],
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .emoji()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "emoji",
        "message": "Invalid emoji",
        "origin": "string",
        "path": [],
        "pattern": "/^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$/u",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .nanoid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "nanoid",
        "message": "Invalid nanoid",
        "origin": "string",
        "path": [],
        "pattern": "/^[a-zA-Z0-9_-]{21}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .cuid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "cuid",
        "message": "Invalid cuid",
        "origin": "string",
        "path": [],
        "pattern": "/^[cC][^\\s-]{8,}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .cuid2()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "cuid2",
        "message": "Invalid cuid2",
        "origin": "string",
        "path": [],
        "pattern": "/^[0-9a-z]+$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .ulid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "ulid",
        "message": "Invalid ULID",
        "origin": "string",
        "path": [],
        "pattern": "/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .xid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "xid",
        "message": "Invalid XID",
        "origin": "string",
        "path": [],
        "pattern": "/^[0-9a-vA-V]{20}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
  expect(
    z
      .ksuid()
      .refine(() => false)
      .safeParse("invalid_value").error!.issues
  ).toMatchInlineSnapshot(`
    [
      {
        "code": "invalid_format",
        "format": "ksuid",
        "message": "Invalid KSUID",
        "origin": "string",
        "path": [],
        "pattern": "/^[A-Za-z0-9]{27}$/",
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [],
      },
    ]
  `);
});
