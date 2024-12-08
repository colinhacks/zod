import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";
import type * as util from "zod-core/util";

test("z.string", async () => {
  const a = z.string();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, false)).toThrow();
});

test("z.string with description", () => {
  const a = z.string({ description: "string description" });
  a._def;
  expect(a._def.description).toEqual("string description");
});

test("z.string with custom error", () => {
  const a = z.string({ error: () => "BAD" });
  expect(z.safeParse(a, 123).error!.issues[0].message).toEqual("BAD");
});

test("inference in checks", () => {
  const a = z.string([z.refine((val) => val.length)]);
  z.parse(a, "___");
  expect(() => z.parse(a, "")).toThrow();
  const b = z.string([z.refine((val) => val.length)]);
  z.parse(b, "___");
  expect(() => z.parse(b, "")).toThrow();
  const c = z.string({ description: "" }, [z.refine((val) => val.length)]);
  z.parse(c, "___");
  expect(() => z.parse(c, "")).toThrow();
  const d = z.string()._check(z.refine((val) => val.length));
  z.parse(d, "___");
  expect(() => z.parse(d, "")).toThrow();
});

test("z.string async", async () => {
  // async
  const a = z.string([z.refine(async (val) => val.length)]);
  expect(await z.parseAsync(a, "___")).toEqual("___");
  await expect(() => z.parseAsync(a, "")).rejects.toThrowError();
});

test("z.uuid", () => {
  const a = z.uuid();
  // parse uuid
  expect(z.parse(a, "550e8400-e29b-41d4-a716-446655440000")).toEqual(
    "550e8400-e29b-41d4-a716-446655440000"
  );
  // bad uuid
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.email", () => {
  const a = z.email();
  expect(z.parse(a, "test@test.com")).toEqual("test@test.com");
  expect(() => z.parse(a, "test")).toThrow();
  expect(
    z.safeParse(a, "bad email", { error: () => "bad email" }).error!.issues[0]
      .message
  ).toEqual("bad email");

  const b = z.email("bad email");
  expect(z.safeParse(b, "bad email").error!.issues[0].message).toEqual(
    "bad email"
  );

  const c = z.email({ error: "bad email" });
  expect(z.safeParse(c, "bad email").error!.issues[0].message).toEqual(
    "bad email"
  );

  const d = z.email({ error: () => "bad email" });
  expect(z.safeParse(d, "bad email").error!.issues[0].message).toEqual(
    "bad email"
  );
});

test("z.url", () => {
  const a = z.url();
  expect(z.parse(a, "http://example.com")).toEqual("http://example.com");
  expect(() => z.parse(a, "asdf")).toThrow();
});

test("z.emoji", () => {
  const a = z.emoji();
  expect(z.parse(a, "😀")).toEqual("😀");
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.nanoid", () => {
  const a = z.nanoid();
  expect(z.parse(a, "8FHZpIxleEK3axQRBNNjN")).toEqual("8FHZpIxleEK3axQRBNNjN");
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.cuid", () => {
  const a = z.cuid();
  expect(z.parse(a, "cixs7y0c0000f7x3b1z6m3w6r")).toEqual(
    "cixs7y0c0000f7x3b1z6m3w6r"
  );
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.cuid2", () => {
  const a = z.cuid2();
  expect(z.parse(a, "cixs7y0c0000f7x3b1z6m3w6r")).toEqual(
    "cixs7y0c0000f7x3b1z6m3w6r"
  );
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.ulid", () => {
  const a = z.ulid();
  expect(z.parse(a, "01ETGRM9QYVX6S9V2F3B6JXG4N")).toEqual(
    "01ETGRM9QYVX6S9V2F3B6JXG4N"
  );
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.xid", () => {
  const a = z.xid();
  expect(z.parse(a, "9m4e2mr0ui3e8a215n4g")).toEqual("9m4e2mr0ui3e8a215n4g");
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.ksuid", () => {
  const a = z.ksuid();
  expect(z.parse(a, "2naeRjTrrHJAkfd3tOuEjw90WCA")).toEqual(
    "2naeRjTrrHJAkfd3tOuEjw90WCA"
  );
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.ip", () => {
  const a = z.ip();
  expect(z.parse(a, "127.0.0.1")).toEqual("127.0.0.1");
  expect(z.parse(a, "2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual(
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
  );
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.ipv4", () => {
  const a = z.ipv4();
  // valid ipv4
  expect(z.parse(a, "192.168.1.1")).toEqual("192.168.1.1");
  expect(z.parse(a, "255.255.255.255")).toEqual("255.255.255.255");
  // invalid ipv4
  expect(() => z.parse(a, "999.999.999.999")).toThrow();
  expect(() => z.parse(a, "256.256.256.256")).toThrow();
  expect(() => z.parse(a, "192.168.1")).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.ipv6", () => {
  const a = z.ipv6();
  // valid ipv6
  expect(z.parse(a, "2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual(
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
  );
  expect(z.parse(a, "::1")).toEqual("::1");
  // invalid ipv6
  expect(() => z.parse(a, "2001:db8::85a3::8a2e:370:7334")).toThrow();
  expect(() => z.parse(a, "2001:db8:85a3:0:0:8a2e:370g:7334")).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.base64", () => {
  const a = z.base64();
  // valid base64
  expect(z.parse(a, "SGVsbG8gd29ybGQ=")).toEqual("SGVsbG8gd29ybGQ=");
  expect(z.parse(a, "U29tZSBvdGhlciBzdHJpbmc=")).toEqual(
    "U29tZSBvdGhlciBzdHJpbmc="
  );
  // invalid base64
  expect(() => z.parse(a, "SGVsbG8gd29ybGQ")).toThrow();
  expect(() => z.parse(a, "U29tZSBvdGhlciBzdHJpbmc")).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.jsonString", () => {
  const a = z.jsonString();
  // valid JSON string
  expect(z.parse(a, '{"key":"value"}')).toEqual('{"key":"value"}');
  expect(z.parse(a, '["item1", "item2"]')).toEqual('["item1", "item2"]');
  // invalid JSON string
  expect(() => z.parse(a, '{"key":value}')).toThrow();
  expect(() => z.parse(a, '["item1", "item2"')).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.e164", () => {
  const a = z.e164();
  // valid e164
  expect(z.parse(a, "+1234567890")).toEqual("+1234567890");
  expect(z.parse(a, "+19876543210")).toEqual("+19876543210");
  // invalid e164
  expect(() => z.parse(a, "1234567890")).toThrow();
  expect(() => z.parse(a, "+12345")).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.jwt", () => {
  const a = z.jwt();
  // valid jwt
  expect(
    z.parse(
      a,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    )
  ).toEqual(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  );
  // invalid jwt
  expect(() => z.parse(a, "invalid.jwt.token")).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
  // wrong type
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.number", () => {
  const a = z.number();
  expect(z.parse(a, 123)).toEqual(123);
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
});

test("z.number async", async () => {
  const a = z.number([z.refine(async (_) => _ > 0)]);
  await expect(z.parseAsync(a, 123)).resolves.toEqual(123);
  await expect(() => z.parseAsync(a, -123)).rejects.toThrow();
  await expect(() => z.parseAsync(a, "123")).rejects.toThrow();

  // a._check(()=>)
});

test("z.int", () => {
  const a = z.int();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
});

test("z.float32", () => {
  const a = z.float32();
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123.45")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  // -3.4028234663852886e38, 3.4028234663852886e38;
  expect(() => z.parse(a, 3.4028234663852886e38 * 2)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -3.4028234663852886e38 * 2)).toThrow(); // Exceeds min
});

test("z.float64", () => {
  const a = z.float64();
  expect(z.parse(a, 123.45)).toEqual(123.45);
  expect(() => z.parse(a, "123.45")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 1.7976931348623157e308 * 2)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -1.7976931348623157e308 * 2)).toThrow(); // Exceeds min
});

test("z.int32", () => {
  const a = z.int32();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 2147483648)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -2147483649)).toThrow(); // Exceeds min
});

test("z.uint32", () => {
  const a = z.uint32();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, -123)).toThrow();
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  expect(() => z.parse(a, 4294967296)).toThrow(); // Exceeds max
  expect(() => z.parse(a, -1)).toThrow(); // Below min
});

test("z.int64", () => {
  const a = z.int64();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  // expect(() => z.parse(a, BigInt("9223372036854775808"))).toThrow(); // Exceeds max
  // expect(() => z.parse(a, BigInt("-9223372036854775809"))).toThrow(); // Exceeds min
});

test("z.uint64", () => {
  const a = z.uint64();
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, -123)).toThrow();
  expect(() => z.parse(a, 123.45)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
  expect(() => z.parse(a, false)).toThrow();
  // expect(() => z.parse(a, BigInt("18446744073709551616"))).toThrow(); // Exceeds max
  // expect(() => z.parse(a, BigInt("-1"))).toThrow(); // Below min
});

test("z.boolean", () => {
  const a = z.boolean();
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, false)).toEqual(false);
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, "true")).toThrow();
});

test("z.bigint", () => {
  const a = z.bigint();
  expect(z.parse(a, BigInt(123))).toEqual(BigInt(123));
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
});

test("z.symbol", () => {
  const a = z.symbol();
  const sym = Symbol();
  expect(z.parse(a, sym)).toEqual(sym);
  expect(() => z.parse(a, "symbol")).toThrow();
});

test("z.date", () => {
  const a = z.date();
  const date = new Date();
  expect(z.parse(a, date)).toEqual(date);
  expect(() => z.parse(a, "date")).toThrow();
});

test("z.coerce.string", () => {
  const a = z.coerce.string();
  expect(z.parse(a, 123)).toEqual("123");
  expect(z.parse(a, true)).toEqual("true");
  expect(z.parse(a, null)).toEqual("null");
  expect(z.parse(a, undefined)).toEqual("undefined");
});

test("z.coerce.number", () => {
  const a = z.coerce.number();
  expect(z.parse(a, "123")).toEqual(123);
  expect(z.parse(a, "123.45")).toEqual(123.45);
  expect(z.parse(a, true)).toEqual(1);
  expect(z.parse(a, false)).toEqual(0);
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.coerce.boolean", () => {
  const a = z.coerce.boolean();
  // test booleans
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, false)).toEqual(false);
  expect(z.parse(a, "true")).toEqual(true);
  expect(z.parse(a, "false")).toEqual(true);
  expect(z.parse(a, 1)).toEqual(true);
  expect(z.parse(a, 0)).toEqual(false);
  expect(z.parse(a, {})).toEqual(true);
  expect(z.parse(a, [])).toEqual(true);
  expect(z.parse(a, undefined)).toEqual(false);
  expect(z.parse(a, null)).toEqual(false);
  expect(z.parse(a, "")).toEqual(false);
});

test("z.coerce.bigint", () => {
  const a = z.coerce.bigint();
  expect(z.parse(a, "123")).toEqual(BigInt(123));
  expect(z.parse(a, 123)).toEqual(BigInt(123));
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.coerce.date", () => {
  const a = z.coerce.date();
  const date = new Date();
  expect(z.parse(a, date.toISOString())).toEqual(date);
  expect(z.parse(a, date.getTime())).toEqual(date);
  expect(() => z.parse(a, "invalid date")).toThrow();
});

test("z.iso.datetime", () => {
  const d1 = "2021-01-01T00:00:00Z";
  const d2 = "2021-01-01T00:00:00.123Z";
  const d3 = "2021-01-01T00:00:00";
  const d4 = "2021-01-01T00:00:00+07:00";
  const d5 = "bad data";

  // local: false, offset: false, precision: null
  const a = z.iso.datetime();
  expect(z.safeParse(a, d1).success).toEqual(true);
  expect(z.safeParse(a, d2).success).toEqual(true);
  expect(z.safeParse(a, d3).success).toEqual(false);
  expect(z.safeParse(a, d4).success).toEqual(false);
  expect(z.safeParse(a, d5).success).toEqual(false);

  const b = z.iso.datetime({ local: true });
  expect(z.safeParse(b, d1).success).toEqual(true);
  expect(z.safeParse(b, d2).success).toEqual(true);
  expect(z.safeParse(b, d3).success).toEqual(true);
  expect(z.safeParse(b, d4).success).toEqual(false);
  expect(z.safeParse(b, d5).success).toEqual(false);

  const c = z.iso.datetime({ offset: true });
  expect(z.safeParse(c, d1).success).toEqual(true);
  expect(z.safeParse(c, d2).success).toEqual(true);
  expect(z.safeParse(c, d3).success).toEqual(false);
  expect(z.safeParse(c, d4).success).toEqual(true);
  expect(z.safeParse(c, d5).success).toEqual(false);

  const d = z.iso.datetime({ precision: 3 });
  expect(z.safeParse(d, d1).success).toEqual(false);
  expect(z.safeParse(d, d2).success).toEqual(true);
  expect(z.safeParse(d, d3).success).toEqual(false);
  expect(z.safeParse(d, d4).success).toEqual(false);
  expect(z.safeParse(d, d5).success).toEqual(false);
});

test("z.iso.date", () => {
  const d1 = "2021-01-01";
  const d2 = "bad data";

  const a = z.iso.date();
  expect(z.safeParse(a, d1).success).toEqual(true);
  expect(z.safeParse(a, d2).success).toEqual(false);

  const b = z.string([z.iso.date()]);
  expect(z.safeParse(b, d1).success).toEqual(true);
  expect(z.safeParse(b, d2).success).toEqual(false);
});

test("z.iso.time", () => {
  const d1 = "00:00:00";
  const d2 = "00:00:00.123";
  const d3 = "bad data";

  const a = z.iso.time();
  expect(z.safeParse(a, d1).success).toEqual(true);
  expect(z.safeParse(a, d2).success).toEqual(true);
  expect(z.safeParse(a, d3).success).toEqual(false);

  const b = z.iso.time({ precision: 3 });
  expect(z.safeParse(b, d1).success).toEqual(false);
  expect(z.safeParse(b, d2).success).toEqual(true);
  expect(z.safeParse(b, d3).success).toEqual(false);

  const c = z.string([z.iso.time()]);
  expect(z.safeParse(c, d1).success).toEqual(true);
  expect(z.safeParse(c, d2).success).toEqual(true);
  expect(z.safeParse(c, d3).success).toEqual(false);
});

test("z.iso.duration", () => {
  const d1 = "P3Y6M4DT12H30M5S";
  const d2 = "bad data";

  const a = z.iso.duration();
  expect(z.safeParse(a, d1).success).toEqual(true);
  expect(z.safeParse(a, d2).success).toEqual(false);

  const b = z.string([z.iso.duration()]);
  expect(z.safeParse(b, d1).success).toEqual(true);
  expect(z.safeParse(b, d2).success).toEqual(false);
});

test("z.undefined", () => {
  const a = z.undefined();
  expect(z.parse(a, undefined)).toEqual(undefined);
  expect(() => z.parse(a, "undefined")).toThrow();
});

test("z.null", () => {
  const a = z.null();
  expect(z.parse(a, null)).toEqual(null);
  expect(() => z.parse(a, "null")).toThrow();
});

test("z.any", () => {
  const a = z.any();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, 123)).toEqual(123);
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, null)).toEqual(null);
  expect(z.parse(a, undefined)).toEqual(undefined);
  z.parse(a, {});
  z.parse(a, []);
  z.parse(a, Symbol());
  z.parse(a, new Date());
});

test("z.unknown", () => {
  const a = z.unknown();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, 123)).toEqual(123);
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, null)).toEqual(null);
  expect(z.parse(a, undefined)).toEqual(undefined);
  z.parse(a, {});
  z.parse(a, []);
  z.parse(a, Symbol());
  z.parse(a, new Date());
});

test("z.never", () => {
  const a = z.never();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.void", () => {
  const a = z.void();
  expect(z.parse(a, undefined)).toEqual(undefined);
  expect(() => z.parse(a, null)).toThrow();
});

test("z.array", () => {
  const a = z.array(z.string());
  expect(z.parse(a, ["hello", "world"])).toEqual(["hello", "world"]);
  expect(() => z.parse(a, [123])).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.object", () => {
  const a = z.object({
    name: z.string(),
    age: z.number(),
    points: z.optional(z.number()),
    "test?": z.boolean(),
  });

  // a._params.qin;
  a._def.shape["test?"];
  a._def.shape.points._qout;

  type a = z.output<typeof a>;

  expectTypeOf<a>().toEqualTypeOf<{
    name: string;
    age: number;
    points?: number;
  }>();
  expect(z.parse(a, { name: "john", age: 30 })).toEqual({
    name: "john",
    age: 30,
  });
  expect(() => z.parse(a, { name: "john", age: "30" })).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.strictObject", () => {
  const a = z.strictObject({
    name: z.string(),
  });
  expect(z.parse(a, { name: "john" })).toEqual({ name: "john" });
  expect(() => z.parse(a, { name: "john", age: 30 })).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.looseObject", () => {
  const a = z.looseObject({
    name: z.string(),
    age: z.number(),
  });
  expect(z.parse(a, { name: "john", age: 30 })).toEqual({
    name: "john",
    age: 30,
  });
  expect(z.parse(a, { name: "john", age: 30, extra: true })).toEqual({
    name: "john",
    age: 30,
    extra: true,
  });
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.object one to one", () => {
  const A = z.object({
    name: z.string(),
    get b() {
      return B;
    },
  });
  const B = z.object({
    name: z.string(),
    get a() {
      return A;
    },
  });

  type A = util.Flatten<typeof A._output>;

  A._def.shape.b._output;
  A._output.b;
  A._output.b.a.b.a.b.a;
});

test("z.object one to many", () => {
  const C = z.object({
    name: z.string(),
    get d() {
      return z.array(D);
    },
  });
  const D = z.object({
    age: z.number(),
    get c() {
      return C;
    },
  });
  // C._output;
  // C._def.shape.d;
  C._def.shape.d._def.element._def.shape.c;
  type C = z.output<typeof C>;
  // util.assertEqual<C['d']>
  // C._output.d[0].c;
  C._output.d[0].c.d[0].c.d[0].c.d[0].c;
});

test("z.object self recursive", () => {
  const E = z.object({
    name: z.string(),
    get e() {
      return E;
    },
  });

  // declare const ee: z.output<typeof E>;
  // ee.e.e.e.e.e.e;
  E._output.e.e.e.e.e.name;
  function testE(_: z.output<typeof E>) {}
  type E = z.output<typeof E>;
  testE({ name: "hello", e: { name: "sadf", e: {} as E } });
});

test("z.object self recursive with optional", () => {
  const arg = z.optional(z.string());

  const F = z.object({
    name: z.string(),
    "age?": z.number(),
    points: z.optional(z.number()),
    get f() {
      return z.optional(F);
    },
    // get f() {
    //   return z.optional(F);
    // },
  });
  // const G = z.extend(F, {
  //   get g() {
  //     return z.optional(G);
  //   },
  // });
  // G._def.shape.f
  // F._paam
  // F._def.shape.
  // F._def.shape.

  F._def.shape.f._def.innerType;
  type F = z.infer<typeof F>;

  F._def.shape.f._def.innerType._def.shape.name;
  F._output.age; //.age;
  F._output.f!.f!.f!;
  // should not be any
  const t1: util.IsAny<typeof F._def.shape.f> = false;
  // util.assertNotEqual<typeof F._def.shape.f, any>(true);
  // type F = (typeof F)["_output"];
  // F._output.age;
  // F._output.f?.f?.f;
  // function testF(_: (typeof F)["_output"]) {}
  // testF({ name: "hello", age: 12, f: { name: "asdf", f: null } });
});

test("z.keyof", () => {
  const a = z.object({
    a: z.string(),
    b: z.number(),
    c: z.boolean(),
  });
  const b = z.keyof(a);
  expect(z.parse(b, "a")).toEqual("a");
  expect(z.parse(b, "b")).toEqual("b");
  expect(z.parse(b, "c")).toEqual("c");
  expect(() => z.parse(b, "d")).toThrow();
});

test("z.extend", () => {
  const a = z.object({
    name: z.string(),
  });
  const b = z.extend(a, {
    age: z.number(),
  });
  expect(z.parse(b, { name: "john", age: 30 })).toEqual({
    name: "john",
    age: 30,
  });
  expect(() => z.parse(b, { name: "john" })).toThrow();
  expect(() => z.parse(b, "hello")).toThrow();
});

// test("z.merge", () => {});

test("z.pick", () => {
  const a = z.strictObject({
    name: z.string(),
    age: z.number(),
  });
  const b = z.pick(a, { name: true });
  expect(z.parse(b, { name: "john" })).toEqual({ name: "john" });
  expect(() => z.parse(b, { name: "john", age: 30 })).toThrow();
  expect(() => z.parse(b, "hello")).toThrow();
});

test("z.omit", () => {
  const a = z.strictObject({
    name: z.string(),
    age: z.number(),
  });
  const b = z.omit(a, { age: true });
  expect(z.parse(b, { name: "john" })).toEqual({ name: "john" });
  expect(() => z.parse(b, { name: "john", age: 30 })).toThrow();
  expect(() => z.parse(b, "hello")).toThrow();
});

test("z.partial", () => {
  const a = z.partial(z.object({ name: z.string() }));
  expect(z.parse(a, { name: "john" })).toEqual({ name: "john" });
  expect(z.parse(a, {})).toEqual({});
  expect(() => z.parse(a, { name: 123 })).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.union", () => {
  const a = z.union([z.string(), z.number()]);
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, 123)).toEqual(123);
  expect(() => z.parse(a, true)).toThrow();
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

  expect(z.parse(c, { type: "A", name: "john" })).toEqual({
    type: "A",
    name: "john",
  });
  expect(z.parse(c, { type: "B", age: 30 })).toEqual({ type: "B", age: 30 });
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

  expect(z.parse(c, { type: { key: "A" }, name: "john" })).toEqual({
    type: { key: "A" },
    name: "john",
  });
  expect(z.parse(c, { type: { key: "B" }, age: 30 })).toEqual({
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
  expect(z.parse(a, { a: "hello", b: 123 })).toEqual({ a: "hello", b: 123 });
  expect(() => z.parse(a, { a: "hello" })).toThrow();
  expect(() => z.parse(a, { b: 123 })).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("z.tuple", () => {
  const a = z.tuple([z.string(), z.number()]);
  expect(z.parse(a, ["hello", 123])).toEqual(["hello", 123]);
  expect(() => z.parse(a, ["hello", "world"])).toThrow();
  expect(() => z.parse(a, [123, 456])).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();

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
    expect(z.parse(b, data)).toEqual(data);
  }

  expect(() => z.parse(b, ["hello", 123, 123])).toThrow();
  expect(() => z.parse(b, ["hello", 123, "world", 123])).toThrow();
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
    z.parse(b, { a: "hello", 1: "world", [Symbol.for("asdf")]: "symbol" })
  ).toEqual({
    a: "hello",
    1: "world",
    [Symbol.for("asdf")]: "symbol",
  });

  // enum keys
  const c = z.record(z.enum(["a", "b", "c"]), z.string());
  type c = z.output<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<Record<"a" | "b" | "c", string>>();
  expect(z.parse(c, { a: "hello", b: "world", c: "world" })).toEqual({
    a: "hello",
    b: "world",
    c: "world",
  });
  // missing keys
  expect(() => z.parse(c, { a: "hello", b: "world" })).toThrow();
  // extra keys
  expect(() =>
    z.parse(c, { a: "hello", b: "world", c: "world", d: "world" })
  ).toThrow();
});

test("z.map", () => {
  const a = z.map(z.string(), z.number());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<Map<string, number>>();
  expect(z.parse(a, new Map([["hello", 123]]))).toEqual(
    new Map([["hello", 123]])
  );
  expect(() => z.parse(a, new Map([["hello", "world"]]))).toThrow();
  expect(() => z.parse(a, new Map([[1243, "world"]]))).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();

  const r1: any = a._parse(new Map([[123, 123]]));
  expect(r1.issues[0].code).toEqual("invalid_type");
  expect(r1.issues[0].path).toEqual([123]);

  const r2: any = z.safeParse(a, new Map([[BigInt(123), 123]]));
  expect(r2.error!.issues[0].code).toEqual("invalid_key");
  expect(r2.error!.issues[0].path).toEqual([]);

  const r3: any = a._parse(new Map([["hello", "world"]]));
  expect(r3.issues[0].code).toEqual("invalid_type");
  expect(r3.issues[0].path).toEqual(["hello"]);
});

test("z.map invalid_element", () => {
  const a = z.map(z.bigint(), z.number());
  const r1 = z.safeParse(a, new Map([[BigInt(123), BigInt(123)]]));

  expect(r1.error!.issues[0].code).toEqual("invalid_element");
  expect(r1.error!.issues[0].path).toEqual([]);
});

test("z.map async", async () => {
  const a = z.map(
    z.string()._check(z.refine(async () => true)),
    z.number()._check(z.refine(async () => true))
  );
  const d1 = new Map([["hello", 123]]);
  expect(await z.parseAsync(a, d1)).toEqual(d1);

  await expect(z.parseAsync(a, new Map([[123, 123]]))).rejects.toThrow();
  await expect(z.parseAsync(a, new Map([["hi", "world"]]))).rejects.toThrow();
  await expect(z.parseAsync(a, new Map([[1243, "world"]]))).rejects.toThrow();
  await expect(z.parseAsync(a, "hello")).rejects.toThrow();

  const r = await z.safeParseAsync(a, new Map([[123, 123]]));
  expect(r.success).toEqual(false);
  expect(r.error!.issues[0].code).toEqual("invalid_type");
  expect(r.error!.issues[0].path).toEqual([123]);
});

test("z.set", () => {
  const a = z.set(z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<Set<string>>();
  expect(z.parse(a, new Set(["hello", "world"]))).toEqual(
    new Set(["hello", "world"])
  );
  expect(() => z.parse(a, new Set([123]))).toThrow();
  expect(() => z.parse(a, ["hello", "world"])).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();

  const b = z.set(z.number());
  expect(z.parse(b, new Set([1, 2, 3]))).toEqual(new Set([1, 2, 3]));
  expect(() => z.parse(b, new Set(["hello"]))).toThrow();
  expect(() => z.parse(b, [1, 2, 3])).toThrow();
  expect(() => z.parse(b, 123)).toThrow();
});

test("z.enum", () => {
  const a = z.enum(["A", "B", "C"]);
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<"A" | "B" | "C">();
  expect(z.parse(a, "A")).toEqual("A");
  expect(z.parse(a, "B")).toEqual("B");
  expect(z.parse(a, "C")).toEqual("C");
  expect(() => z.parse(a, "D")).toThrow();
  expect(() => z.parse(a, 123)).toThrow();

  expect(a.enum.A).toEqual("A");
  expect(a.enum.B).toEqual("B");
  expect(a.enum.C).toEqual("C");
  expect((a.enum as any).D).toEqual(undefined);
});

test("z.nativeEnum", () => {
  enum NativeEnum {
    A = "A",
    B = "B",
    C = "C",
  }
  const a = z.nativeEnum(NativeEnum);
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<NativeEnum>();
  expect(z.parse(a, NativeEnum.A)).toEqual(NativeEnum.A);
  expect(z.parse(a, NativeEnum.B)).toEqual(NativeEnum.B);
  expect(z.parse(a, NativeEnum.C)).toEqual(NativeEnum.C);
  expect(() => z.parse(a, "D")).toThrow();
  expect(() => z.parse(a, 123)).toThrow();

  // test a.enum
  a;
  expect(a.enum.A).toEqual(NativeEnum.A);
  expect(a.enum.B).toEqual(NativeEnum.B);
  expect(a.enum.C).toEqual(NativeEnum.C);
});

test("z.literal", () => {
  const a = z.literal("hello");
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<"hello">();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(() => z.parse(a, "world")).toThrow();
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.file", () => {
  const a = z.file();
  const file = new File(["content"], "filename.txt", { type: "text/plain" });
  expect(z.parse(a, file)).toEqual(file);
  expect(() => z.parse(a, "file")).toThrow();
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.transform", () => {
  const a = z.transform(z.string(), (val) => val.toUpperCase());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string>();
  expect(z.parse(a, "hello")).toEqual("HELLO");
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.transform async", async () => {
  const a = z.transform(z.string(), async (val) => val.toUpperCase());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string>();
  expect(await z.parseAsync(a, "hello")).toEqual("HELLO");
  await expect(() => z.parseAsync(a, 123)).rejects.toThrow();
});

test("z.preprocess", () => {
  const a = z.preprocess((val) => String(val).toUpperCase(), z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string>();
  expect(z.parse(a, 123)).toEqual("123");
  expect(z.parse(a, true)).toEqual("TRUE");
  expect(z.parse(a, BigInt(1234))).toEqual("1234");
  // expect(() => z.parse(a, Symbol("asdf"))).toThrow();
});

// test("z.preprocess async", () => {
//   const a = z.preprocess(async (val) => String(val), z.string());
//   type a = z.output<typeof a>;
//   expectTypeOf<a>().toEqualTypeOf<string>();
//   expect(z.parse(a, 123)).toEqual("123");
//   expect(z.parse(a, true)).toEqual("true");
//   expect(() => z.parse(a, {})).toThrow();
// });

test("z.optional", () => {
  const a = z.optional(z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string | undefined>();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, undefined)).toEqual(undefined);
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.nullable", () => {
  const a = z.nullable(z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string | null>();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, null)).toEqual(null);
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.default", () => {
  const a = z._default(z.string(), "default");
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string>();
  expect(z.parse(a, undefined)).toEqual("default");
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(() => z.parse(a, 123)).toThrow();

  const b = z._default(z.string(), () => "default");
  expect(z.parse(b, undefined)).toEqual("default");
  expect(z.parse(b, "hello")).toEqual("hello");
  expect(() => z.parse(b, 123)).toThrow();
});

test("z.catch", () => {
  const a = z.catch(z.string(), "default");
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<string>();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(z.parse(a, 123)).toEqual("default");

  const b = z.catch(z.string(), () => "default");
  expect(z.parse(b, "hello")).toEqual("hello");
  expect(z.parse(b, 123)).toEqual("default");
});

test("z.nan", () => {
  const a = z.nan();
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<number>();
  expect(z.parse(a, Number.NaN)).toEqual(Number.NaN);
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, "NaN")).toThrow();
});

test("z.pipeline", () => {
  const a = z.pipeline(
    z.transform(z.string(), (val) => val.length),
    z.number()
  );
  type a_in = z.input<typeof a>;
  expectTypeOf<a_in>().toEqualTypeOf<string>();
  type a_out = z.output<typeof a>;
  expectTypeOf<a_out>().toEqualTypeOf<number>();

  expect(z.parse(a, "123")).toEqual(3);
  expect(z.parse(a, "hello")).toEqual(5);
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.readonly", () => {
  const a = z.readonly(z.string());
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<Readonly<string>>();
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.templateLiteral", () => {
  const a = z.templateLiteral([z.string(), z.number()]);
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<`${string}${number}`>();
  expect(z.parse(a, "hello123")).toEqual("hello123");
  expect(() => z.parse(a, "hello")).toThrow();
  expect(() => z.parse(a, 123)).toThrow();

  // multipart
  const b = z.templateLiteral([z.string(), z.number(), z.string()]);
  type b = z.output<typeof b>;
  expectTypeOf<b>().toEqualTypeOf<`${string}${number}${string}`>();
  expect(z.parse(b, "hello123world")).toEqual("hello123world");
  expect(z.parse(b, "123")).toEqual("123");
  expect(() => z.parse(b, "hello")).toThrow();
  expect(() => z.parse(b, 123)).toThrow();

  // include boolean
  const c = z.templateLiteral([z.string(), z.boolean()]);
  type c = z.output<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<`${string}${boolean}`>();
  expect(z.parse(c, "hellotrue")).toEqual("hellotrue");
  expect(z.parse(c, "hellofalse")).toEqual("hellofalse");
  expect(() => z.parse(c, "hello")).toThrow();
  expect(() => z.parse(c, 123)).toThrow();

  // include literal prefix
  const d = z.templateLiteral([z.literal("hello"), z.number()]);
  type d = z.output<typeof d>;
  expectTypeOf<d>().toEqualTypeOf<`hello${number}`>();
  expect(z.parse(d, "hello123")).toEqual("hello123");
  expect(() => z.parse(d, 123)).toThrow();
  expect(() => z.parse(d, "world123")).toThrow();

  // include literal union
  const e = z.templateLiteral([z.literal(["aa", "bb"]), z.number()]);
  type e = z.output<typeof e>;
  expectTypeOf<e>().toEqualTypeOf<`aa${number}` | `bb${number}`>();
  expect(z.parse(e, "aa123")).toEqual("aa123");
  expect(z.parse(e, "bb123")).toEqual("bb123");
  expect(() => z.parse(e, "cc123")).toThrow();
  expect(() => z.parse(e, 123)).toThrow();
});

test("z.custom", () => {
  const a = z.custom((val) => {
    return typeof val === "string";
  });
  expect(z.parse(a, "hello")).toEqual("hello");
  expect(() => z.parse(a, 123)).toThrow();
});

test("z.instanceof", () => {
  class A {}

  const a = z.instanceof(A);
  expect(z.parse(a, new A())).toBeInstanceOf(A);
  expect(() => z.parse(a, {})).toThrow();
});

test("z.refine", () => {
  const a = z.number()._check(
    z.refine((val) => val > 3),
    z.refine((val) => val < 10)
  );
  expect(z.parse(a, 5)).toEqual(5);
  expect(() => z.parse(a, 2)).toThrow();
  expect(() => z.parse(a, 11)).toThrow();
  expect(() => z.parse(a, "hi")).toThrow();
});

test("z.superRefine", () => {
  const a = z.number()._check(
    z.superRefine((val, ctx) => {
      if (val < 3) {
        return ctx.addIssue({
          code: "custom",
          origin: "custom",
          message: "Too small",
          input: val,
        });
      }
      if (val > 10) {
        return ctx.addIssue("Too big");
      }
    })
    // z.superRefine((val) => val < 10, "must be less than 10")
  );

  expect(z.parse(a, 5)).toEqual(5);
  expect(() => z.parse(a, 2)).toThrow();
  expect(() => z.parse(a, 11)).toThrow();
  expect(() => z.parse(a, "hi")).toThrow();
});

test("z.effect", () => {
  const a = z.effect((val: number) => {
    return `${val}`;
  });
  type a_in = z.input<typeof a>;
  expectTypeOf<a_in>().toEqualTypeOf<number>();
  type a_out = z.output<typeof a>;
  expectTypeOf<a_out>().toEqualTypeOf<string>();
  expect(z.parse(a, 123)).toEqual("123");
});

test("z.brand()", () => {
  const a = z.string().brand<"my-brand">();
  type a = z.output<typeof a>;
  const branded = (_: a) => {};
  // @ts-expect-error
  branded("asdf");
});
