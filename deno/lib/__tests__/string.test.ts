// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const minFive = z.string().min(5, "min5");
const maxFive = z.string().max(5, "max5");
const justFive = z.string().length(5);
const nonempty = z.string().min(1, "nonempty");
const includes = z.string().includes("includes");
const includesFromIndex2 = z.string().includes("includes", { position: 2 });
const startsWith = z.string().startsWith("startsWith");
const startsWithMultiple = z.string().startsWith(["foo_", "bar_", "baz_"]);
const endsWith = z.string().endsWith("endsWith");
const endsWithMultiple = z.string().endsWith(["foo_", "bar_", "baz_"]);

test("passing validations", () => {
  minFive.parse("12345");
  minFive.parse("123456");
  maxFive.parse("12345");
  maxFive.parse("1234");
  nonempty.parse("1");
  justFive.parse("12345");
  includes.parse("XincludesXX");
  includesFromIndex2.parse("XXXincludesXX");
  startsWith.parse("startsWithX");
  startsWithMultiple.parse("baz_12345");
  endsWith.parse("XendsWith");
  endsWithMultiple.parse("12345baz_");
});

test("failing validations", () => {
  expect(() => minFive.parse("1234")).toThrow();
  expect(() => maxFive.parse("123456")).toThrow();
  expect(() => nonempty.parse("")).toThrow();
  expect(() => justFive.parse("1234")).toThrow();
  expect(() => justFive.parse("123456")).toThrow();
  expect(() => includes.parse("XincludeXX")).toThrow();
  expect(() => includesFromIndex2.parse("XincludesXX")).toThrow();
  expect(() => startsWith.parse("x")).toThrow();
  expect(() => startsWithMultiple.parse("x")).toThrow();
  expect(() => endsWith.parse("x")).toThrow();
  expect(() => endsWithMultiple.parse("x")).toThrow();
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
    expect(str + z.string().base64().safeParse(str).success).toBe(str + "true");
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
    expect(str + z.string().base64().safeParse(str).success).toBe(
      str + "false"
    );
  }
});

test("url validations", () => {
  const url = z.string().url();
  url.parse("http://google.com");
  url.parse("https://google.com/asdf?asdf=ljk3lk4&asdf=234#asdf");
  expect(() => url.parse("asdf")).toThrow();
  expect(() => url.parse("https:/")).toThrow();
  expect(() => url.parse("asdfj@lkjsdf.com")).toThrow();
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

test("uuid", () => {
  const uuid = z.string().uuid("custom error");
  uuid.parse("9491d710-3185-4e06-bea0-6a2f275345e0");
  uuid.parse("d89e7b01-7598-ed11-9d7a-0022489382fd"); // new sequential id
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

test("nanoid", () => {
  const nanoid = z.string().nanoid("custom error");
  nanoid.parse("lfNZluvAxMkf7Q8C5H-QS");
  nanoid.parse("mIU_4PJWikaU8fMbmkouz");
  nanoid.parse("Hb9ZUtUa2JDm_dD-47EGv");
  nanoid.parse("5Noocgv_8vQ9oPijj4ioQ");
  const result = nanoid.safeParse("Xq90uDyhddC53KsoASYJGX");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("custom error");
  }
});

test("bad nanoid", () => {
  const nanoid = z.string().nanoid("custom error");
  nanoid.parse("ySh_984wpDUu7IQRrLXAp");
  const result = nanoid.safeParse("invalid nanoid");
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
  expect(result.success).toEqual(false);
  const tooLong = "01ARZ3NDEKTSV4RRFFQ69G5FAVA";
  expect(ulid.safeParse(tooLong).success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toEqual("Invalid ulid");
  }
  const caseInsensitive = ulid.safeParse("01arZ3nDeKTsV4RRffQ69G5FAV");
  expect(caseInsensitive.success).toEqual(true);
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
  expect(z.string().email().isNANOID).toEqual(false);
  expect(z.string().email().isIP).toEqual(false);
  expect(z.string().email().isULID).toEqual(false);

  expect(z.string().url().isEmail).toEqual(false);
  expect(z.string().url().isURL).toEqual(true);
  expect(z.string().url().isCUID).toEqual(false);
  expect(z.string().url().isCUID2).toEqual(false);
  expect(z.string().url().isUUID).toEqual(false);
  expect(z.string().url().isNANOID).toEqual(false);
  expect(z.string().url().isIP).toEqual(false);
  expect(z.string().url().isULID).toEqual(false);

  expect(z.string().cuid().isEmail).toEqual(false);
  expect(z.string().cuid().isURL).toEqual(false);
  expect(z.string().cuid().isCUID).toEqual(true);
  expect(z.string().cuid().isCUID2).toEqual(false);
  expect(z.string().cuid().isUUID).toEqual(false);
  expect(z.string().cuid().isNANOID).toEqual(false);
  expect(z.string().cuid().isIP).toEqual(false);
  expect(z.string().cuid().isULID).toEqual(false);

  expect(z.string().cuid2().isEmail).toEqual(false);
  expect(z.string().cuid2().isURL).toEqual(false);
  expect(z.string().cuid2().isCUID).toEqual(false);
  expect(z.string().cuid2().isCUID2).toEqual(true);
  expect(z.string().cuid2().isUUID).toEqual(false);
  expect(z.string().cuid2().isNANOID).toEqual(false);
  expect(z.string().cuid2().isIP).toEqual(false);
  expect(z.string().cuid2().isULID).toEqual(false);

  expect(z.string().uuid().isEmail).toEqual(false);
  expect(z.string().uuid().isURL).toEqual(false);
  expect(z.string().uuid().isCUID).toEqual(false);
  expect(z.string().uuid().isCUID2).toEqual(false);
  expect(z.string().uuid().isUUID).toEqual(true);
  expect(z.string().uuid().isNANOID).toEqual(false);
  expect(z.string().uuid().isIP).toEqual(false);
  expect(z.string().uuid().isULID).toEqual(false);

  expect(z.string().nanoid().isEmail).toEqual(false);
  expect(z.string().nanoid().isURL).toEqual(false);
  expect(z.string().nanoid().isCUID).toEqual(false);
  expect(z.string().nanoid().isCUID2).toEqual(false);
  expect(z.string().nanoid().isUUID).toEqual(false);
  expect(z.string().nanoid().isNANOID).toEqual(true);
  expect(z.string().nanoid().isIP).toEqual(false);
  expect(z.string().nanoid().isULID).toEqual(false);

  expect(z.string().ip().isEmail).toEqual(false);
  expect(z.string().ip().isURL).toEqual(false);
  expect(z.string().ip().isCUID).toEqual(false);
  expect(z.string().ip().isCUID2).toEqual(false);
  expect(z.string().ip().isUUID).toEqual(false);
  expect(z.string().ip().isNANOID).toEqual(false);
  expect(z.string().ip().isIP).toEqual(true);
  expect(z.string().ip().isULID).toEqual(false);

  expect(z.string().ulid().isEmail).toEqual(false);
  expect(z.string().ulid().isURL).toEqual(false);
  expect(z.string().ulid().isCUID).toEqual(false);
  expect(z.string().ulid().isCUID2).toEqual(false);
  expect(z.string().ulid().isUUID).toEqual(false);
  expect(z.string().ulid().isNANOID).toEqual(false);
  expect(z.string().ulid().isIP).toEqual(false);
  expect(z.string().ulid().isULID).toEqual(true);
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

test("lowerCase", () => {
  expect(z.string().toLowerCase().parse("ASDF")).toEqual("asdf");
  expect(z.string().toUpperCase().parse("asdf")).toEqual("ASDF");
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
  expect(() => datetimeOffset.parse("2020-10-14T17:42:29+03"));
  expect(() => datetimeOffset.parse("tuna")).toThrow();
  expect(() => datetimeOffset.parse("2022-10-13T09:52:31.Z")).toThrow();

  const datetimeOffsetNoMs = z
    .string()
    .datetime({ offset: true, precision: 0 });
  datetimeOffsetNoMs.parse("1970-01-01T00:00:00Z");
  datetimeOffsetNoMs.parse("2022-10-13T09:52:31Z");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00:00");
  datetimeOffsetNoMs.parse("2020-10-14T17:42:29+0000");
  expect(() => datetimeOffsetNoMs.parse("2020-10-14T17:42:29+00")).toThrow();
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
  expect(() =>
    datetimeOffset4Ms.parse("2020-10-14T17:42:29.1234+00")
  ).toThrow();
  expect(() => datetimeOffset4Ms.parse("tuna")).toThrow();
  expect(() => datetimeOffset4Ms.parse("1970-01-01T00:00:00.123Z")).toThrow();
  expect(() =>
    datetimeOffset4Ms.parse("2020-10-14T17:42:29.124+00:00")
  ).toThrow();
});

test("date", () => {
  const a = z.string().date();
  expect(a.isDate).toEqual(true);
});

test("date parsing", () => {
  const date = z.string().date();
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

test("time", () => {
  const a = z.string().time();
  expect(a.isTime).toEqual(true);
});

test("time parsing", () => {
  const time = z.string().time();
  time.parse("00:00:00");
  time.parse("23:00:00");
  time.parse("00:59:00");
  time.parse("00:00:59");
  time.parse("23:59:59");
  time.parse("09:52:31");
  time.parse("23:59:59.9999999");
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

  const time2 = z.string().time({ precision: 2 });
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

  // const time3 = z.string().time({ offset: true });
  // time3.parse("00:00:00Z");
  // time3.parse("09:52:31Z");
  // time3.parse("00:00:00+00:00");
  // time3.parse("00:00:00+0000");
  // time3.parse("00:00:00.000Z");
  // time3.parse("00:00:00.000+00:00");
  // time3.parse("00:00:00.000+0000");
  // expect(() => time3.parse("")).toThrow();
  // expect(() => time3.parse("foo")).toThrow();
  // expect(() => time3.parse("00:00:00")).toThrow();
  // expect(() => time3.parse("00:00:00.000")).toThrow();

  // const time4 = z.string().time({ offset: true, precision: 0 });
  // time4.parse("00:00:00Z");
  // time4.parse("09:52:31Z");
  // time4.parse("00:00:00+00:00");
  // time4.parse("00:00:00+0000");
  // expect(() => time4.parse("")).toThrow();
  // expect(() => time4.parse("foo")).toThrow();
  // expect(() => time4.parse("00:00:00.0")).toThrow();
  // expect(() => time4.parse("00:00:00.000")).toThrow();
  // expect(() => time4.parse("00:00:00.000+00:00")).toThrow();
});

test("duration", () => {
  const duration = z.string().duration();
  expect(duration.isDuration).toEqual(true);

  const validDurations = [
    "P3Y6M4DT12H30M5S",
    "P2Y9M3DT12H31M8.001S",
    "+P3Y6M4DT12H30M5S",
    "-PT0.001S",
    "+PT0.001S",
    "PT0,001S",
    "PT12H30M5S",
    "-P2M1D",
    "P-2M-1D",
    "-P5DT10H",
    "P-5DT-10H",
    "P1Y",
    "P2MT30M",
    "PT6H",
    "P5W",
    "P0.5Y",
    "P0,5Y",
    "P42YT7.004M",
  ];

  const invalidDurations = [
    "foo bar",
    "",
    " ",
    "P",
    "T1H",
    "P0.5Y1D",
    "P0,5Y6M",
    "P1YT",
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

    expect(result.error.issues[0].message).toEqual("Invalid duration");
  }
});

test("IP validation", () => {
  const ip = z.string().ip();
  expect(ip.safeParse("122.122.122.122").success).toBe(true);

  const ipv4 = z.string().ip({ version: "v4" });
  expect(() => ipv4.parse("6097:adfa:6f0b:220d:db08:5021:6191:7990")).toThrow();

  const ipv6 = z.string().ip({ version: "v6" });
  expect(() => ipv6.parse("254.164.77.1")).toThrow();

  const validIPs = [
    "1e5e:e6c8:daac:514b:114b:e360:d8c0:682c",
    "9d4:c956:420f:5788:4339:9b3b:2418:75c3",
    "a6ea::2454:a5ce:94.105.123.75",
    "474f:4c83::4e40:a47:ff95:0cda",
    "d329:0:25b4:db47:a9d1:0:4926:0000",
    "e48:10fb:1499:3e28:e4b6:dea5:4692:912c",
    "114.71.82.94",
    "0.0.0.0",
    "37.85.236.115",
    "2001:4888:50:ff00:500:d::",
    "2001:4888:50:ff00:0500:000d:000:0000",
    "2001:4888:50:ff00:0500:000d:0000:0000",
  ];

  const invalidIPs = [
    "d329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af",
    "d5e7:7214:2b78::3906:85e6:53cc:709:32ba",
    "8f69::c757:395e:976e::3441",
    "54cb::473f:d516:0.255.256.22",
    "54cb::473f:d516:192.168.1",
    "256.0.4.4",
    "-1.0.555.4",
    "0.0.0.0.0",
    "1.1.1",
  ];
  // no parameters check IPv4 or IPv6
  const ipSchema = z.string().ip();
  expect(validIPs.every((ip) => ipSchema.safeParse(ip).success)).toBe(true);
  expect(
    invalidIPs.every((ip) => ipSchema.safeParse(ip).success === false)
  ).toBe(true);
});
