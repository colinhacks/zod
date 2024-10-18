import { expect, test } from "vitest";
import * as core from "../../zod-core/src/index.js";
import * as z from "../src/index.js";

test("z.string", () => {
  const a = z.string();
  expect(a.parse("hello")).toEqual("hello");
  expect(() => a.parse(123)).toThrow();
  expect(() => a.parse(false)).toThrow();

  const b = z.string({ description: "string description" });
  b._def;
  expect(b._def.description).toEqual("string description");

  const c = z.string({ error: () => "BAD" });
  expect(c.safeParse(123).error!.issues[0].message).toEqual("BAD");
});

test("z.uuid", () => {
  const a = z.uuid();
  // parse uuid
  expect(a.parse("550e8400-e29b-41d4-a716-446655440000")).toEqual(
    "550e8400-e29b-41d4-a716-446655440000"
  );
  // bad uuid
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.email", () => {
  const a = z.email();
  expect(a.parse("test@test.com")).toEqual("test@test.com");
  expect(() => a.parse("test")).toThrow();
});

test("z.url", () => {
  const a = z.url();
  expect(a.parse("http://example.com")).toEqual("http://example.com");
  expect(() => a.parse("asdf")).toThrow();
});

test("z.emoji", () => {
  const a = z.emoji();
  expect(a.parse("😀")).toEqual("😀");
  expect(() => a.parse("hello")).toThrow();
});

test("z.nanoid", () => {
  const a = z.nanoid();
  expect(a.parse("8FHZpIxleEK3axQRBNNjN")).toEqual("8FHZpIxleEK3axQRBNNjN");
  expect(() => a.parse("abc")).toThrow();
});

test("z.cuid", () => {
  const a = z.cuid();
  expect(a.parse("cixs7y0c0000f7x3b1z6m3w6r")).toEqual(
    "cixs7y0c0000f7x3b1z6m3w6r"
  );
  expect(() => a.parse("abc")).toThrow();
});

test("z.cuid2", () => {
  const a = z.cuid2();
  expect(a.parse("cixs7y0c0000f7x3b1z6m3w6r")).toEqual(
    "cixs7y0c0000f7x3b1z6m3w6r"
  );
  expect(() => a.parse(123)).toThrow();
});

test("z.ulid", () => {
  const a = z.ulid();
  expect(a.parse("01ETGRM9QYVX6S9V2F3B6JXG4N")).toEqual(
    "01ETGRM9QYVX6S9V2F3B6JXG4N"
  );
  expect(() => a.parse("abc")).toThrow();
});

test("z.xid", () => {
  const a = z.xid();
  expect(a.parse("9m4e2mr0ui3e8a215n4g")).toEqual("9m4e2mr0ui3e8a215n4g");
  expect(() => a.parse("abc")).toThrow();
});

test("z.ksuid", () => {
  const a = z.ksuid();
  expect(a.parse("2naeRjTrrHJAkfd3tOuEjw90WCA")).toEqual(
    "2naeRjTrrHJAkfd3tOuEjw90WCA"
  );
  expect(() => a.parse("abc")).toThrow();
});

test("z.duration", () => {
  const a = z.duration();
  expect(a.parse("P3Y6M4DT12H30M5S")).toEqual("P3Y6M4DT12H30M5S");
  expect(() => a.parse("abc")).toThrow();
});

test("z.ip", () => {
  const a = z.ip();
  expect(a.parse("127.0.0.1")).toEqual("127.0.0.1");
  expect(a.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual(
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
  );
  expect(() => a.parse("abc")).toThrow();
});

test("z.ipv4", () => {
  const a = z.ipv4();
  // valid ipv4
  expect(a.parse("192.168.1.1")).toEqual("192.168.1.1");
  expect(a.parse("255.255.255.255")).toEqual("255.255.255.255");
  // invalid ipv4
  expect(() => a.parse("999.999.999.999")).toThrow();
  expect(() => a.parse("256.256.256.256")).toThrow();
  expect(() => a.parse("192.168.1")).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.ipv6", () => {
  const a = z.ipv6();
  // valid ipv6
  expect(a.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual(
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
  );
  expect(a.parse("::1")).toEqual("::1");
  // invalid ipv6
  expect(() => a.parse("2001:db8::85a3::8a2e:370:7334")).toThrow();
  expect(() => a.parse("2001:db8:85a3:0:0:8a2e:370g:7334")).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.base64", () => {
  const a = z.base64();
  // valid base64
  expect(a.parse("SGVsbG8gd29ybGQ=")).toEqual("SGVsbG8gd29ybGQ=");
  expect(a.parse("U29tZSBvdGhlciBzdHJpbmc=")).toEqual(
    "U29tZSBvdGhlciBzdHJpbmc="
  );
  // invalid base64
  expect(() => a.parse("SGVsbG8gd29ybGQ")).toThrow();
  expect(() => a.parse("U29tZSBvdGhlciBzdHJpbmc")).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.jsonString", () => {
  const a = z.jsonString();
  // valid JSON string
  expect(a.parse('{"key":"value"}')).toEqual('{"key":"value"}');
  expect(a.parse('["item1", "item2"]')).toEqual('["item1", "item2"]');
  // invalid JSON string
  expect(() => a.parse('{"key":value}')).toThrow();
  expect(() => a.parse('["item1", "item2"')).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.e164", () => {
  const a = z.e164();
  // valid e164
  expect(a.parse("+1234567890")).toEqual("+1234567890");
  expect(a.parse("+19876543210")).toEqual("+19876543210");
  // invalid e164
  expect(() => a.parse("1234567890")).toThrow();
  expect(() => a.parse("+12345")).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.jwt", () => {
  const a = z.jwt();
  // valid jwt
  expect(
    a.parse(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    )
  ).toEqual(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  );
  // invalid jwt
  expect(() => a.parse("invalid.jwt.token")).toThrow();
  expect(() => a.parse("hello")).toThrow();
  // wrong type
  expect(() => a.parse(123)).toThrow();
});

test("z.number", () => {
  const a = z.number();
  expect(a.parse(123)).toEqual(123);
  expect(a.parse(123.45)).toEqual(123.45);
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
});

test("z.int", () => {
  const a = z.int();
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(123.45)).toThrow();
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
});

test("z.float32", () => {
  const a = z.float32();
  expect(a.parse(123.45)).toEqual(123.45);
  expect(() => a.parse("123.45")).toThrow();
  expect(() => a.parse(false)).toThrow();
  expect(() => a.parse(3.4028234663852886e38 + 1)).toThrow(); // Exceeds max
  expect(() => a.parse(-3.4028234663852886e38 - 1)).toThrow(); // Exceeds min
});

test("z.float64", () => {
  const a = z.float64();
  expect(a.parse(123.45)).toEqual(123.45);
  expect(() => a.parse("123.45")).toThrow();
  expect(() => a.parse(false)).toThrow();
  expect(() => a.parse(1.7976931348623157e308 + 1)).toThrow(); // Exceeds max
  expect(() => a.parse(-1.7976931348623157e308 - 1)).toThrow(); // Exceeds min
});

test("z.int32", () => {
  const a = z.int32();
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(123.45)).toThrow();
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
  expect(() => a.parse(2147483648)).toThrow(); // Exceeds max
  expect(() => a.parse(-2147483649)).toThrow(); // Exceeds min
});

test("z.uint32", () => {
  const a = z.uint32();
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(-123)).toThrow();
  expect(() => a.parse(123.45)).toThrow();
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
  expect(() => a.parse(4294967296)).toThrow(); // Exceeds max
  expect(() => a.parse(-1)).toThrow(); // Below min
});

test("z.int64", () => {
  const a = z.int64();
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(123.45)).toThrow();
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
  // expect(() => a.parse(BigInt("9223372036854775808"))).toThrow(); // Exceeds max
  // expect(() => a.parse(BigInt("-9223372036854775809"))).toThrow(); // Exceeds min
});

test("z.uint64", () => {
  const a = z.uint64();
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(-123)).toThrow();
  expect(() => a.parse(123.45)).toThrow();
  expect(() => a.parse("123")).toThrow();
  expect(() => a.parse(false)).toThrow();
  // expect(() => a.parse(BigInt("18446744073709551616"))).toThrow(); // Exceeds max
  // expect(() => a.parse(BigInt("-1"))).toThrow(); // Below min
});

test("z.boolean", () => {});

test("z.bigint", () => {});

test("z.symbol", () => {});

test("z.date", () => {});

test("z.undefined", () => {});

test("z.null", () => {});

test("z.any", () => {});

test("z.unknown", () => {});

test("z.never", () => {});

test("z.voi", () => {});

test("z.array", () => {});

test("z.object", () => {});

test("z.strictObject", () => {});

test("z.looseObject", () => {});

test("z.keyof", () => {});

test("z.extend", () => {});

test("z.merge", () => {});

test("z.pick", () => {});

test("z.omit", () => {});

test("z.partial", () => {});

test("z.union", () => {});

test("z.discriminatedUnion", () => {});

test("z.intersection", () => {});

test("z.tuple", () => {});

test("z.record", () => {});

test("z.map", () => {});

test("z.set", () => {});

test("z.enum", () => {});

test("z.nativeEnum", () => {});

test("z.literal", () => {});

test("z.file", () => {});

test("z.transform", () => {});

test("z.preprocess", () => {});

test("z.optional", () => {});

test("z.nullable", () => {});

test("z.default", () => {});

test("z.catch", () => {});

test("z.nan", () => {});

test("z.pipeline", () => {});

test("z.readonly", () => {});

test("z.templateLiteral", () => {});

test("z.custom", () => {});

test("z.instanceof", () => {});

test("z.refine", () => {});

test("z.effect", () => {
  const a = z.effect((val: number, ctx) => {
    return `${val}`;
  });
  expect(a.parse(123)).toEqual("123");
});

test(".brand()", () => {
  const a = z.string().brand<"my-brand">();
  type a = z.output<typeof a>;
  const branded = (_: a) => {};
  // @ts-expect-error
  branded("asdf");
});
