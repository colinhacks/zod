import { expect, expectTypeOf, test } from "vitest";
import * as z from "../src/index.js";

test("z.string", async () => {
  const a = z.string();
  expect(a.parse("hello")).toEqual("hello");
  expect(() => a.parse(123)).toThrow();
  expect(() => a.parse(false)).toThrow();

  const b = z.string({ description: "string description" });
  b._def;
  expect(b._def.description).toEqual("string description");

  const c = z.string({ error: () => "BAD" });
  expect(c.safeParse(123).error!.issues[0].message).toEqual("BAD");

  // async
  const d = z.string([z.refine<string>(async (_) => false)]);
  expect(d.parse("hello")).toEqual("hello");
  expect(() => d.parse("hi")).toThrow();
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

  // async
  const b = z.number([z.refine<number>(async (_) => false)]);
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
  // -3.4028234663852886e38, 3.4028234663852886e38;
  expect(() => a.parse(3.4028234663852886e38 * 2)).toThrow(); // Exceeds max
  expect(() => a.parse(-3.4028234663852886e38 * 2)).toThrow(); // Exceeds min
});

test("z.float64", () => {
  const a = z.float64();
  expect(a.parse(123.45)).toEqual(123.45);
  expect(() => a.parse("123.45")).toThrow();
  expect(() => a.parse(false)).toThrow();
  expect(() => a.parse(1.7976931348623157e308 * 2)).toThrow(); // Exceeds max
  expect(() => a.parse(-1.7976931348623157e308 * 2)).toThrow(); // Exceeds min
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

test("z.boolean", () => {
  const a = z.boolean();
  expect(a.parse(true)).toEqual(true);
  expect(a.parse(false)).toEqual(false);
  expect(() => a.parse(123)).toThrow();
  expect(() => a.parse("true")).toThrow();
});

test("z.bigint", () => {
  const a = z.bigint();
  expect(a.parse(BigInt(123))).toEqual(BigInt(123));
  expect(() => a.parse(123)).toThrow();
  expect(() => a.parse("123")).toThrow();
});

test("z.symbol", () => {
  const a = z.symbol();
  const sym = Symbol();
  expect(a.parse(sym)).toEqual(sym);
  expect(() => a.parse("symbol")).toThrow();
});

test("z.date", () => {
  const a = z.date();
  const date = new Date();
  expect(a.parse(date)).toEqual(date);
  expect(() => a.parse("date")).toThrow();
});

test("z.coerce.string", () => {
  const a = z.coerce.string();
  expect(a.parse(123)).toEqual("123");
  expect(a.parse(true)).toEqual("true");
  expect(a.parse(null)).toEqual("null");
  expect(a.parse(undefined)).toEqual("undefined");
});

test("z.coerce.number", () => {
  const a = z.coerce.number();
  expect(a.parse("123")).toEqual(123);
  expect(a.parse("123.45")).toEqual(123.45);
  expect(a.parse(true)).toEqual(1);
  expect(a.parse(false)).toEqual(0);
  expect(() => a.parse("abc")).toThrow();
});

test("z.coerce.boolean", () => {
  const a = z.coerce.boolean();
  // test booleans
  expect(a.parse(true)).toEqual(true);
  expect(a.parse(false)).toEqual(false);
  expect(a.parse("true")).toEqual(true);
  expect(a.parse("false")).toEqual(true);
  expect(a.parse(1)).toEqual(true);
  expect(a.parse(0)).toEqual(false);
  expect(a.parse({})).toEqual(true);
  expect(a.parse([])).toEqual(true);
  expect(a.parse(undefined)).toEqual(false);
  expect(a.parse(null)).toEqual(false);
  expect(a.parse("")).toEqual(false);
});

test("z.coerce.bigint", () => {
  const a = z.coerce.bigint();
  expect(a.parse("123")).toEqual(BigInt(123));
  expect(a.parse(123)).toEqual(BigInt(123));
  expect(() => a.parse("abc")).toThrow();
});

test("z.coerce.date", () => {
  const a = z.coerce.date();
  const date = new Date();
  expect(a.parse(date.toISOString())).toEqual(date);
  expect(a.parse(date.getTime())).toEqual(date);
  expect(() => a.parse("invalid date")).toThrow();
});

test("z.undefined", () => {
  const a = z.undefined();
  expect(a.parse(undefined)).toEqual(undefined);
  expect(() => a.parse("undefined")).toThrow();
});

test("z.null", () => {
  const a = z.null();
  expect(a.parse(null)).toEqual(null);
  expect(() => a.parse("null")).toThrow();
});

test("z.any", () => {
  const a = z.any();
  expect(a.parse("hello")).toEqual("hello");
  expect(a.parse(123)).toEqual(123);
  expect(a.parse(true)).toEqual(true);
  expect(a.parse(null)).toEqual(null);
  expect(a.parse(undefined)).toEqual(undefined);
  a.parse({});
  a.parse([]);
  a.parse(Symbol());
  a.parse(new Date());
});

test("z.unknown", () => {
  const a = z.unknown();
  expect(a.parse("hello")).toEqual("hello");
  expect(a.parse(123)).toEqual(123);
  expect(a.parse(true)).toEqual(true);
  expect(a.parse(null)).toEqual(null);
  expect(a.parse(undefined)).toEqual(undefined);
  a.parse({});
  a.parse([]);
  a.parse(Symbol());
  a.parse(new Date());
});

test("z.never", () => {
  const a = z.never();
  expect(() => a.parse("hello")).toThrow();
});

test("z.void", () => {
  const a = z.void();
  expect(a.parse(undefined)).toEqual(undefined);
  expect(() => a.parse(null)).toThrow();
});

test("z.array", () => {
  const a = z.array(z.string());
  expect(a.parse(["hello", "world"])).toEqual(["hello", "world"]);
  expect(() => a.parse([123])).toThrow();
  expect(() => a.parse("hello")).toThrow();
});

test("z.object", () => {
  const a = z.object({
    name: z.string(),
    age: z.number(),
    points: z.optional(z.number()),
  });

  type a = z.output<typeof a>;

  expectTypeOf<a>().toEqualTypeOf<{
    name: string;
    age: number;
    points?: number;
  }>();
  expect(a.parse({ name: "john", age: 30 })).toEqual({ name: "john", age: 30 });
  expect(() => a.parse({ name: "john", age: "30" })).toThrow();
  expect(() => a.parse("hello")).toThrow();
});

test("z.strictObject", () => {
  const a = z.strictObject({
    name: z.string(),
  });
  expect(a.parse({ name: "john" })).toEqual({ name: "john" });
  expect(() => a.parse({ name: "john", age: 30 })).toThrow();
  expect(() => a.parse("hello")).toThrow();
});

test("z.looseObject", () => {
  const a = z.looseObject({
    name: z.string(),
    age: z.number(),
  });
  expect(a.parse({ name: "john", age: 30 })).toEqual({ name: "john", age: 30 });
  expect(a.parse({ name: "john", age: 30, extra: true })).toEqual({
    name: "john",
    age: 30,
    extra: true,
  });
  expect(() => a.parse("hello")).toThrow();
});

test("z.keyof", () => {
  const a = z.object({
    a: z.string(),
    b: z.number(),
    c: z.boolean(),
  });
  const b = z.keyof(a);
  expect(b.parse("a")).toEqual("a");
  expect(b.parse("b")).toEqual("b");
  expect(b.parse("c")).toEqual("c");
  expect(() => b.parse("d")).toThrow();
});

test("z.extend", () => {
  const a = z.object({
    name: z.string(),
  });
  const b = z.extend(a, {
    age: z.number(),
  });
  expect(b.parse({ name: "john", age: 30 })).toEqual({ name: "john", age: 30 });
  expect(() => b.parse({ name: "john" })).toThrow();
  expect(() => b.parse("hello")).toThrow();
});

// test("z.merge", () => {});

test("z.pick", () => {
  const a = z.strictObject({
    name: z.string(),
    age: z.number(),
  });
  const b = z.pick(a, { name: true });
  expect(b.parse({ name: "john" })).toEqual({ name: "john" });
  expect(() => b.parse({ name: "john", age: 30 })).toThrow();
  expect(() => b.parse("hello")).toThrow();
});

test("z.omit", () => {
  const a = z.strictObject({
    name: z.string(),
    age: z.number(),
  });
  const b = z.omit(a, { age: true });
  expect(b.parse({ name: "john" })).toEqual({ name: "john" });
  expect(() => b.parse({ name: "john", age: 30 })).toThrow();
  expect(() => b.parse("hello")).toThrow();
});

test("z.partial", () => {
  const a = z.partial(z.object({ name: z.string() }));
  expect(a.parse({ name: "john" })).toEqual({ name: "john" });
  expect(a.parse({})).toEqual({});
  expect(() => a.parse({ name: 123 })).toThrow();
  expect(() => a.parse("hello")).toThrow();
});

test("z.union", () => {
  const a = z.union([z.string(), z.number()]);
  expect(a.parse("hello")).toEqual("hello");
  expect(a.parse(123)).toEqual(123);
  expect(() => a.parse(true)).toThrow();
});

test("z.discriminatedUnion", () => {
  const a = z.object({
    type: z.literal("A"),
    name: z.string(),
  });
  expect(a._disc.get("type")).toEqual({
    values: new Set(["A"]),
    maps: [],
  });

  const b = z.object({
    type: z.literal("B"),
    age: z.number(),
  });

  const c = z.discriminatedUnion([a, b]);

  expect(c._def.options.length).toEqual(2);
  expect(c._disc.get("type")!.values.has("A")).toEqual(true);
  expect(c._disc.get("type")!.values.has("B")).toEqual(true);

  expect(c.parse({ type: "A", name: "john" })).toEqual({
    type: "A",
    name: "john",
  });
  expect(c.parse({ type: "B", age: 30 })).toEqual({ type: "B", age: 30 });
});

test("z.discriminatedUnion with nested discriminator", () => {
  const a = z.object({
    type: z.object({ key: z.literal("A") }),
    name: z.string(),
  });

  const b = z.object({
    type: z.object({ key: z.literal("B") }),
    age: z.number(),
  });

  const c = z.discriminatedUnion([a, b]);
  expect(c._disc!.get("type")!.maps[0].get("key")!.values.has("A")).toEqual(
    true
  );
  expect(c._disc!.get("type")!.maps[1].get("key")!.values.has("B")).toEqual(
    true
  );

  expect(c.parse({ type: { key: "A" }, name: "john" })).toEqual({
    type: { key: "A" },
    name: "john",
  });
  expect(c.parse({ type: { key: "B" }, age: 30 })).toEqual({
    type: { key: "B" },
    age: 30,
  });
});

test("z.discriminatedUnion nested", () => {
  const schema1 = z.discriminatedUnion([
    z.object({
      type: z.literal("A"),
      name: z.string(),
    }),
    z.object({
      num: z.literal(1),
      type: z.literal("B"),
      age: z.number(),
    }),
  ]);

  const schema2 = z.discriminatedUnion([
    z.object({
      num: z.literal(2),
      type: z.literal("C"),
      name: z.string(),
    }),
    z.object({
      num: z.literal(2),
      type: z.literal("D"),
      age: z.number(),
    }),
  ]);

  const hyper = z.discriminatedUnion([schema1, schema2]);
  expect(hyper._disc.get("num")).toEqual({
    values: new Set([1, 2]),
    maps: [],
  });
  expect(hyper._disc.get("type")).toEqual({
    values: new Set(["A", "B", "C", "D"]),
    maps: [],
  });
});
test("z.intersection", () => {
  const a = z.intersection(
    z.object({ a: z.string() }),
    z.object({ b: z.number() })
  );
  expect(a.parse({ a: "hello", b: 123 })).toEqual({ a: "hello", b: 123 });
  expect(() => a.parse({ a: "hello" })).toThrow();
  expect(() => a.parse({ b: 123 })).toThrow();
  expect(() => a.parse("hello")).toThrow();
});

test("z.tuple", () => {
  const a = z.tuple([z.string(), z.number()]);
  expect(a.parse(["hello", 123])).toEqual(["hello", 123]);
  expect(() => a.parse(["hello", "world"])).toThrow();
  expect(() => a.parse([123, 456])).toThrow();
  expect(() => a.parse("hello")).toThrow();

  // tuple with rest
  const b = z.tuple(
    [z.string(), z.number(), z.optional(z.string())],
    z.boolean()
  );

  // z.optional(z.string())._qout
  type b = z.output<typeof b>;
  // const arg: [string, number, number?] = ["hello", 123, undefined];
  // const arg: [string, number, number?, ...boolean[]] = ["hello", 123, true];
  expectTypeOf<b>().toEqualTypeOf<[string, number, string?, ...boolean[]]>();
  const datas = [
    ["hello", 123],
    ["hello", 123, "world"],
    ["hello", 123, "world", true],
    ["hello", 123, "world", true, false, true],
  ];
  for (const data of datas) {
    expect(b.parse(data)).toEqual(data);
  }

  expect(() => b.parse(["hello", 123, 123])).toThrow();
  expect(() => b.parse(["hello", 123, "world", 123])).toThrow();
});

test("z.record", () => {
  // record schema with enum keys
  const a = z.record(z.string(), z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<Record<string, string>>();

  const b = z.record(z.union([z.string(), z.number(), z.symbol()]), z.string());
  type b = z.output<typeof b>;
  expectTypeOf<b>().toEqualTypeOf<Record<string | number | symbol, string>>();
  expect(
    b.parse({ a: "hello", 1: "world", [Symbol.for("asdf")]: "symbol" })
  ).toEqual({
    a: "hello",
    1: "world",
    [Symbol.for("asdf")]: "symbol",
  });

  // enum keys
  const c = z.record(z.enum(["a", "b", "c"]), z.string());
  type c = z.output<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<Record<"a" | "b" | "c", string>>();
  expect(c.parse({ a: "hello", b: "world", c: "world" })).toEqual({
    a: "hello",
    b: "world",
    c: "world",
  });
  // missing keys
  expect(() => c.parse({ a: "hello", b: "world" })).toThrow();
  // extra keys
  expect(() =>
    c.parse({ a: "hello", b: "world", c: "world", d: "world" })
  ).toThrow();
});

test("z.map", () => {
  const a = z.map(z.string(), z.number());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<Map<string, number>>();
  expect(a.parse(new Map([["hello", 123]]))).toEqual(new Map([["hello", 123]]));
  expect(() => a.parse(new Map([["hello", "world"]]))).toThrow();
  expect(() => a.parse(new Map([[1243, "world"]]))).toThrow();
  expect(() => a.parse("hello")).toThrow();

  const b = z.map(
    z.string()._refine((val) => val.length > 3),
    z.number()
  );
});

test("z.set", () => {});

test("z.enum", () => {});

test("z.nativeEnum", () => {});

test("z.literal", () => {
  // check _values
});

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

test("z.brand()", () => {
  const a = z.string().brand<"my-brand">();
  type a = z.output<typeof a>;
  const branded = (_: a) => {};
  // @ts-expect-error
  branded("asdf");
});
