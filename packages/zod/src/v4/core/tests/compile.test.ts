import { expect, test } from "vitest";

import * as z from "../../index.js";
import { INVALID, compile } from "../compile.js";

// Helper to verify AOT matches Zod behavior
// Now we check that valid inputs return data and invalid return INVALID
function expectMatch(schema: z.ZodType, value: unknown) {
  const aot = compile(schema);
  const zodResult = schema.safeParse(value);
  if (zodResult.success) {
    const aotResult = aot(value);
    // For deep equality of parsed data
    expect(aotResult).toEqual(zodResult.data);
  } else {
    expect(aot(value)).toBe(INVALID);
  }
}

// Helper for simple valid/invalid checks
function valid<T>(aot: (input: unknown) => T | typeof INVALID, value: unknown): T {
  const result = aot(value);
  expect(result).not.toBe(INVALID);
  return result as T;
}

function invalid(aot: (input: unknown) => unknown, value: unknown) {
  expect(aot(value)).toBe(INVALID);
}

// === Primitives ===

test("string", () => {
  const aot = compile(z.string());
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, "")).toBe("");
  invalid(aot, 123);
  invalid(aot, null);
  invalid(aot, undefined);
});

test("number", () => {
  const aot = compile(z.number());
  expect(valid(aot, 123)).toBe(123);
  expect(valid(aot, 0)).toBe(0);
  expect(valid(aot, -5.5)).toBe(-5.5);
  expect(valid(aot, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
  invalid(aot, Number.NaN); // NaN rejected by z.number()
  invalid(aot, "123");
  invalid(aot, null);
});

test("boolean", () => {
  const aot = compile(z.boolean());
  expect(valid(aot, true)).toBe(true);
  expect(valid(aot, false)).toBe(false);
  invalid(aot, 1);
  invalid(aot, "true");
});

test("bigint", () => {
  const aot = compile(z.bigint());
  expect(valid(aot, 123n)).toBe(123n);
  expect(valid(aot, 0n)).toBe(0n);
  invalid(aot, 123);
  invalid(aot, "123");
});

test("symbol", () => {
  const aot = compile(z.symbol());
  const sym = Symbol();
  expect(valid(aot, sym)).toBe(sym);
  const namedSym = Symbol.for("test");
  expect(valid(aot, namedSym)).toBe(namedSym);
  invalid(aot, "symbol");
});

test("undefined", () => {
  const aot = compile(z.undefined());
  // Can't use valid() helper when undefined is a valid output
  expect(aot(undefined)).toBe(undefined);
  // But we can verify other values are rejected
  invalid(aot, null);
  invalid(aot, 0);
});

test("null", () => {
  const aot = compile(z.null());
  expect(valid(aot, null)).toBe(null);
  invalid(aot, undefined);
  invalid(aot, 0);
});

test("void", () => {
  const aot = compile(z.void());
  // void accepts undefined - can't use valid() helper
  expect(aot(undefined)).toBe(undefined);
  invalid(aot, null);
  invalid(aot, 0);
});

test("nan", () => {
  const aot = compile(z.nan());
  expect(Number.isNaN(valid(aot, Number.NaN))).toBe(true);
  expect(Number.isNaN(valid(aot, Number.NaN))).toBe(true);
  invalid(aot, 0);
  invalid(aot, Number.POSITIVE_INFINITY);
  invalid(aot, "NaN");
});

test("date", () => {
  const aot = compile(z.date());
  const d1 = new Date();
  expect(valid(aot, d1)).toBe(d1);
  const d2 = new Date(0);
  expect(valid(aot, d2)).toBe(d2);
  invalid(aot, new Date("invalid")); // Invalid date
  invalid(aot, "2024-01-01");
  invalid(aot, Date.now());
});

// === Special Types ===

test("any", () => {
  const aot = compile(z.any());
  expect(aot(null)).toBe(null);
  expect(aot(undefined)).toBe(undefined);
  expect(aot(123)).toBe(123);
  expect(aot({ nested: { deep: true } })).toEqual({ nested: { deep: true } });
});

test("unknown", () => {
  const aot = compile(z.unknown());
  expect(aot(null)).toBe(null);
  expect(aot(undefined)).toBe(undefined);
  expect(aot(123)).toBe(123);
});

test("never", () => {
  const aot = compile(z.never());
  invalid(aot, null);
  invalid(aot, undefined);
  invalid(aot, 123);
});

// === Literal ===

test("literal string", () => {
  const aot = compile(z.literal("hello"));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "Hello");
  invalid(aot, "");
});

test("literal number", () => {
  const aot = compile(z.literal(42));
  expect(valid(aot, 42)).toBe(42);
  invalid(aot, 43);
  invalid(aot, "42");
});

test("literal boolean", () => {
  const aot = compile(z.literal(true));
  expect(valid(aot, true)).toBe(true);
  invalid(aot, false);
});

test("literal null", () => {
  const aot = compile(z.literal(null));
  expect(valid(aot, null)).toBe(null);
  invalid(aot, undefined);
});

test("literal bigint", () => {
  const aot = compile(z.literal(100n));
  expect(valid(aot, 100n)).toBe(100n);
  invalid(aot, 100);
  invalid(aot, 101n);
});

// === Enum ===

test("enum", () => {
  const aot = compile(z.enum(["a", "b", "c"]));
  expect(valid(aot, "a")).toBe("a");
  expect(valid(aot, "b")).toBe("b");
  expect(valid(aot, "c")).toBe("c");
  invalid(aot, "d");
  invalid(aot, "A");
  invalid(aot, 1);
});

// === Wrapper Types ===

test("readonly", () => {
  const aot = compile(z.readonly(z.string()));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, 123);
});

test("default", () => {
  const aot = compile(z.string().default("hello"));
  expect(valid(aot, "world")).toBe("world");
  expect(valid(aot, undefined)).toBe("hello"); // default applies
  invalid(aot, 123);
});

test("prefault", () => {
  const aot = compile(z.string().prefault("hello"));
  expect(valid(aot, "world")).toBe("world");
  expect(valid(aot, undefined)).toBe("hello"); // prefault applies
  invalid(aot, 123);
});

test("nonoptional", () => {
  const aot = compile(z.string().optional().nonoptional());
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, undefined); // nonoptional rejects undefined
  invalid(aot, 123);
});

test("success", () => {
  const aot = compile(z.success(z.string()));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, 123);
});

// === Optional & Nullable ===

test("optional", () => {
  const aot = compile(z.optional(z.string()));
  expect(valid(aot, "hello")).toBe("hello");
  expect(aot(undefined)).toBe(undefined); // undefined is valid output
  invalid(aot, null);
  invalid(aot, 123);
});

test("nullable", () => {
  const aot = compile(z.nullable(z.string()));
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, null)).toBe(null);
  invalid(aot, undefined);
  invalid(aot, 123);
});

// === Array ===

test("array of strings", () => {
  const aot = compile(z.array(z.string()));
  expect(valid(aot, [])).toEqual([]);
  expect(valid(aot, ["a", "b"])).toEqual(["a", "b"]);
  invalid(aot, [1, 2]);
  invalid(aot, ["a", 1]);
  invalid(aot, "not array");
});

test("array of objects", () => {
  const aot = compile(z.array(z.object({ id: z.number() })));
  expect(valid(aot, [{ id: 1 }, { id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
  invalid(aot, [{ id: "1" }]);
  invalid(aot, [{}]);
});

// === Object ===

test("simple object", () => {
  const aot = compile(z.object({ name: z.string(), age: z.number() }));
  expect(valid(aot, { name: "Alice", age: 30 })).toEqual({ name: "Alice", age: 30 });
  expect(valid(aot, { name: "Bob", age: 25, extra: true })).toEqual({ name: "Bob", age: 25 }); // strip mode
  invalid(aot, { name: "Charlie" });
  invalid(aot, { name: 123, age: 30 });
  invalid(aot, null);
  invalid(aot, []);
});

test("nested object", () => {
  const aot = compile(
    z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          city: z.string(),
        }),
      }),
    })
  );
  expect(valid(aot, { user: { name: "Alice", address: { city: "NYC" } } })).toEqual({
    user: { name: "Alice", address: { city: "NYC" } },
  });
  invalid(aot, { user: { name: "Alice", address: {} } });
});

test("object with optional property", () => {
  const aot = compile(z.object({ name: z.string(), age: z.optional(z.number()) }));
  expect(valid(aot, { name: "Alice" })).toEqual({ name: "Alice" });
  expect(valid(aot, { name: "Alice", age: 30 })).toEqual({ name: "Alice", age: 30 });
  expect(valid(aot, { name: "Alice", age: undefined })).toEqual({ name: "Alice", age: undefined });
  invalid(aot, { name: "Alice", age: "30" });
});

test("strictObject", () => {
  const aot = compile(z.strictObject({ name: z.string() }));
  expect(valid(aot, { name: "Alice" })).toEqual({ name: "Alice" });
  invalid(aot, { name: "Alice", extra: true });
  invalid(aot, {});
});

test("strictObject with optional", () => {
  const aot = compile(z.strictObject({ name: z.string(), age: z.optional(z.number()) }));
  expect(valid(aot, { name: "Alice" })).toEqual({ name: "Alice" });
  expect(valid(aot, { name: "Alice", age: 30 })).toEqual({ name: "Alice", age: 30 });
  invalid(aot, { name: "Alice", extra: true });
});

test("looseObject", () => {
  const aot = compile(z.looseObject({ name: z.string() }));
  expect(valid(aot, { name: "Alice" })).toEqual({ name: "Alice" });
  expect(valid(aot, { name: "Alice", extra: true })).toEqual({ name: "Alice", extra: true });
  invalid(aot, {});
});

test("object with catchall", () => {
  const aot = compile(z.object({ name: z.string() }).catchall(z.number()));
  expect(valid(aot, { name: "Alice" })).toEqual({ name: "Alice" });
  expect(valid(aot, { name: "Alice", age: 30 })).toEqual({ name: "Alice", age: 30 });
  invalid(aot, { name: "Alice", age: "30" });
});

// === Matches Zod behavior ===

test("matches Zod: primitives", () => {
  expectMatch(z.string(), "hello");
  expectMatch(z.string(), 123);
  expectMatch(z.number(), 123);
  expectMatch(z.number(), Number.NaN);
  expectMatch(z.boolean(), true);
  expectMatch(z.boolean(), 1);
});

test("matches Zod: void/nan/date", () => {
  expectMatch(z.void(), undefined);
  expectMatch(z.void(), null);
  expectMatch(z.nan(), Number.NaN);
  expectMatch(z.nan(), 0);
  expectMatch(z.date(), new Date());
  expectMatch(z.date(), new Date("invalid"));
  expectMatch(z.date(), "2024-01-01");
});

test("matches Zod: complex schema", () => {
  const schema = z.strictObject({
    id: z.number(),
    name: z.string(),
    tags: z.array(z.string()),
    nested: z.object({
      active: z.boolean(),
    }),
  });

  expectMatch(schema, { id: 1, name: "test", tags: ["a"], nested: { active: true } });
  expectMatch(schema, { id: 1, name: "test", tags: ["a"], nested: { active: true }, extra: "x" });
  expectMatch(schema, { id: "1", name: "test", tags: ["a"], nested: { active: true } });
});

// === Checks ===

test("number min/max", () => {
  const aot = compile(z.number().min(0).max(100));
  expect(valid(aot, 50)).toBe(50);
  expect(valid(aot, 0)).toBe(0);
  expect(valid(aot, 100)).toBe(100);
  invalid(aot, -1);
  invalid(aot, 101);
});

test("number exclusive min/max", () => {
  const aot = compile(z.number().gt(0).lt(100));
  expect(valid(aot, 50)).toBe(50);
  expect(valid(aot, 1)).toBe(1);
  expect(valid(aot, 99)).toBe(99);
  invalid(aot, 0);
  invalid(aot, 100);
});

test("number int", () => {
  const aot = compile(z.number().int());
  expect(valid(aot, 5)).toBe(5);
  expect(valid(aot, -10)).toBe(-10);
  invalid(aot, 5.5);
});

test("number multipleOf", () => {
  const aot = compile(z.number().multipleOf(5));
  expect(valid(aot, 0)).toBe(0);
  expect(valid(aot, 5)).toBe(5);
  expect(valid(aot, 10)).toBe(10);
  invalid(aot, 7);
});

test("string length checks", () => {
  const aot = compile(z.string().min(3).max(10));
  expect(valid(aot, "abc")).toBe("abc");
  expect(valid(aot, "0123456789")).toBe("0123456789");
  invalid(aot, "ab");
  invalid(aot, "01234567890");
});

test("string exact length", () => {
  const aot = compile(z.string().length(5));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "hi");
  invalid(aot, "toolong");
});

test("string regex", () => {
  const aot = compile(z.string().regex(/^[a-z]+$/));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "Hello");
  invalid(aot, "hello123");
});

test("string startsWith/endsWith/includes", () => {
  const aot = compile(z.string().startsWith("hello").endsWith("world").includes("beautiful"));
  expect(valid(aot, "hello beautiful world")).toBe("hello beautiful world");
  invalid(aot, "hello world");
  invalid(aot, "beautiful world");
});

test("string lowercase/uppercase", () => {
  const lower = compile(z.string().lowercase());
  expect(valid(lower, "hello")).toBe("hello");
  invalid(lower, "Hello");

  const upper = compile(z.string().uppercase());
  expect(valid(upper, "HELLO")).toBe("HELLO");
  invalid(upper, "Hello");
});

test("array length checks", () => {
  const aot = compile(z.array(z.number()).min(1).max(3));
  expect(valid(aot, [1])).toEqual([1]);
  expect(valid(aot, [1, 2, 3])).toEqual([1, 2, 3]);
  invalid(aot, []);
  invalid(aot, [1, 2, 3, 4]);
});

test("bigint min/max", () => {
  const aot = compile(z.bigint().min(0n).max(100n));
  expect(valid(aot, 50n)).toBe(50n);
  expect(valid(aot, 0n)).toBe(0n);
  invalid(aot, -1n);
  invalid(aot, 101n);
});

test("matches Zod: checks", () => {
  const schema = z
    .string()
    .min(3)
    .max(10)
    .regex(/^[a-z]+$/);
  expectMatch(schema, "hello");
  expectMatch(schema, "ab");
  expectMatch(schema, "Hello");
  expectMatch(schema, "toolongstring");
});

test("custom refine", () => {
  const aot = compile(z.string().refine((x) => x.length > 3));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "abc");
  invalid(aot, "ab");
});

test("custom refine with object", () => {
  const aot = compile(
    z
      .object({
        password: z.string(),
        confirm: z.string(),
      })
      .refine((data) => data.password === data.confirm)
  );
  expect(valid(aot, { password: "secret", confirm: "secret" })).toEqual({ password: "secret", confirm: "secret" });
  invalid(aot, { password: "secret", confirm: "wrong" });
});

// === String Formats ===

test("email", () => {
  const aot = compile(z.email());
  expect(valid(aot, "test@example.com")).toBe("test@example.com");
  expect(valid(aot, "user.name+tag@example.co.uk")).toBe("user.name+tag@example.co.uk");
  invalid(aot, "invalid");
  invalid(aot, "@example.com");
  invalid(aot, 123);
});

test("uuid", () => {
  const aot = compile(z.uuid());
  expect(valid(aot, "550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  expect(valid(aot, "00000000-0000-0000-0000-000000000000")).toBe("00000000-0000-0000-0000-000000000000");
  invalid(aot, "not-a-uuid");
  invalid(aot, "550e8400-e29b-41d4-a716");
});

test("url", () => {
  const aot = compile(z.url());
  expect(valid(aot, "https://example.com")).toBe("https://example.com");
  expect(valid(aot, "http://localhost:3000/path")).toBe("http://localhost:3000/path");
  expect(valid(aot, "ftp://files.example.com")).toBe("ftp://files.example.com");
  invalid(aot, "not a url");
  invalid(aot, "example.com");
});

test("ipv4", () => {
  const aot = compile(z.ipv4());
  expect(valid(aot, "192.168.1.1")).toBe("192.168.1.1");
  expect(valid(aot, "0.0.0.0")).toBe("0.0.0.0");
  expect(valid(aot, "255.255.255.255")).toBe("255.255.255.255");
  invalid(aot, "192.168.1");
  invalid(aot, "256.0.0.0");
});

test("matches Zod: string formats", () => {
  expectMatch(z.email(), "test@example.com");
  expectMatch(z.email(), "invalid");
  expectMatch(z.uuid(), "550e8400-e29b-41d4-a716-446655440000");
  expectMatch(z.uuid(), "not-a-uuid");
  expectMatch(z.url(), "https://example.com");
  expectMatch(z.url(), "not a url");
});

// === Tuple ===

test("tuple basic", () => {
  const aot = compile(z.tuple([z.string(), z.number()]));
  expect(valid(aot, ["hello", 42])).toEqual(["hello", 42]);
  invalid(aot, ["hello", "world"]);
  invalid(aot, ["hello"]);
  invalid(aot, ["hello", 42, "extra"]);
  invalid(aot, {});
});

test("tuple with rest", () => {
  const aot = compile(z.tuple([z.string(), z.number()]).rest(z.boolean()));
  expect(valid(aot, ["hello", 42])).toEqual(["hello", 42]);
  expect(valid(aot, ["hello", 42, true])).toEqual(["hello", 42, true]);
  expect(valid(aot, ["hello", 42, true, false])).toEqual(["hello", 42, true, false]);
  invalid(aot, ["hello", 42, "extra"]);
  invalid(aot, ["hello"]);
});

test("tuple empty", () => {
  const aot = compile(z.tuple([]));
  expect(valid(aot, [])).toEqual([]);
  invalid(aot, ["extra"]);
});

test("matches Zod: tuple", () => {
  const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
  expectMatch(schema, ["hello", 42]);
  expectMatch(schema, ["hello", 42, true, false]);
  expectMatch(schema, ["hello", 42, "not boolean"]);
  expectMatch(schema, ["hello"]);
});

// === Union ===

test("union of primitives", () => {
  const aot = compile(z.union([z.string(), z.number()]));
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, 42)).toBe(42);
  invalid(aot, true);
  invalid(aot, null);
});

test("union of literals (Set optimization)", () => {
  const aot = compile(z.union([z.literal("a"), z.literal("b"), z.literal("c")]));
  expect(valid(aot, "a")).toBe("a");
  expect(valid(aot, "b")).toBe("b");
  expect(valid(aot, "c")).toBe("c");
  invalid(aot, "d");
});

test("union single option", () => {
  const aot = compile(z.union([z.string()]));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, 42);
});

test("union with objects", () => {
  const aot = compile(
    z.union([
      z.object({ type: z.literal("a"), value: z.string() }),
      z.object({ type: z.literal("b"), value: z.number() }),
    ])
  );
  expect(valid(aot, { type: "a", value: "hello" })).toEqual({ type: "a", value: "hello" });
  expect(valid(aot, { type: "b", value: 42 })).toEqual({ type: "b", value: 42 });
  invalid(aot, { type: "a", value: 42 });
  invalid(aot, { type: "c", value: "hello" });
});

test("matches Zod: union", () => {
  const schema = z.union([z.string(), z.number(), z.null()]);
  expectMatch(schema, "hello");
  expectMatch(schema, 42);
  expectMatch(schema, null);
  expectMatch(schema, true);
  expectMatch(schema, undefined);
});

// === Intersection ===

test("intersection of objects", () => {
  const aot = compile(z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() })));
  expect(valid(aot, { name: "Alice", age: 30 })).toEqual({ name: "Alice", age: 30 });
  invalid(aot, { name: "Alice" });
  invalid(aot, { age: 30 });
});

test("matches Zod: intersection", () => {
  const schema = z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }));
  expectMatch(schema, { a: "hello", b: 42 });
  expectMatch(schema, { a: "hello" });
  expectMatch(schema, { b: 42 });
});

// === Record ===

test("record basic", () => {
  const aot = compile(z.record(z.string(), z.number()));
  expect(valid(aot, {})).toEqual({});
  expect(valid(aot, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  invalid(aot, { a: "hello" });
  invalid(aot, null);
  invalid(aot, []);
});

test("record with enum keys", () => {
  const aot = compile(z.record(z.enum(["a", "b"]), z.number()));
  expect(valid(aot, { a: 1 })).toEqual({ a: 1 });
  expect(valid(aot, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  invalid(aot, { c: 3 });
});

test("matches Zod: record", () => {
  const schema = z.record(z.string(), z.number());
  expectMatch(schema, {});
  expectMatch(schema, { a: 1, b: 2 });
  expectMatch(schema, { a: "hello" });
});

// === Map ===

test("map basic", () => {
  const aot = compile(z.map(z.string(), z.number()));
  expect(valid(aot, new Map())).toEqual(new Map());
  expect(
    valid(
      aot,
      new Map([
        ["a", 1],
        ["b", 2],
      ])
    )
  ).toEqual(
    new Map([
      ["a", 1],
      ["b", 2],
    ])
  );
  invalid(aot, new Map([["a", "hello"]]));
  invalid(aot, new Map([[1, 1]]));
  invalid(aot, {});
});

test("matches Zod: map", () => {
  const schema = z.map(z.string(), z.number());
  expectMatch(schema, new Map());
  expectMatch(schema, new Map([["a", 1]]));
  expectMatch(schema, new Map([["a", "hello"]]));
  expectMatch(schema, {});
});

// === Set ===

test("set basic", () => {
  const aot = compile(z.set(z.number()));
  expect(valid(aot, new Set())).toEqual(new Set());
  expect(valid(aot, new Set([1, 2, 3]))).toEqual(new Set([1, 2, 3]));
  invalid(aot, new Set(["hello"]));
  invalid(aot, []);
});

test("set size checks", () => {
  const aot = compile(z.set(z.number()).min(1).max(3));
  expect(valid(aot, new Set([1]))).toEqual(new Set([1]));
  expect(valid(aot, new Set([1, 2, 3]))).toEqual(new Set([1, 2, 3]));
  invalid(aot, new Set());
  invalid(aot, new Set([1, 2, 3, 4]));
});

test("matches Zod: set", () => {
  const schema = z.set(z.string());
  expectMatch(schema, new Set());
  expectMatch(schema, new Set(["a", "b"]));
  expectMatch(schema, new Set([1, 2]));
  expectMatch(schema, []);
});

// === Template Literal ===

test("template literal basic", () => {
  const aot = compile(z.templateLiteral([z.literal("hello"), z.literal("-"), z.literal("world")]));
  expect(valid(aot, "hello-world")).toBe("hello-world");
  invalid(aot, "hello-world!");
  invalid(aot, "helloworld");
  invalid(aot, 123);
});

test("template literal with types", () => {
  const aot = compile(z.templateLiteral(["user-", z.number()]));
  expect(valid(aot, "user-123")).toBe("user-123");
  expect(valid(aot, "user-0")).toBe("user-0");
  invalid(aot, "user-abc");
  invalid(aot, "admin-123");
});

test("matches Zod: template literal", () => {
  const schema = z.templateLiteral(["id-", z.number()]);
  expectMatch(schema, "id-123");
  expectMatch(schema, "id-abc");
  expectMatch(schema, "other-123");
});

// === Lazy ===

test("lazy basic", () => {
  const aot = compile(z.lazy(() => z.string()));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, 123);
});

test("lazy recursive (simple)", () => {
  interface Node {
    value: string;
    next?: Node | undefined;
  }
  const nodeSchema: z.ZodType<Node> = z.object({
    value: z.string(),
    next: z.lazy(() => nodeSchema).optional(),
  });

  const aot = compile(nodeSchema);
  expect(valid(aot, { value: "a" })).toEqual({ value: "a" });
  expect(valid(aot, { value: "a", next: { value: "b" } })).toEqual({ value: "a", next: { value: "b" } });
  invalid(aot, { value: "a", next: { value: 123 } });
  invalid(aot, { value: 123 });
});

test("matches Zod: lazy", () => {
  const schema = z.lazy(() => z.string());
  expectMatch(schema, "hello");
  expectMatch(schema, 123);
});

// === Pipe ===

test("pipe without transform", () => {
  // Pipe with both schemas validating the same type
  const aot = compile(z.string().pipe(z.string().min(3)));
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "ab");
  invalid(aot, 123);
});

test("matches Zod: pipe without transform", () => {
  const schema = z.string().pipe(z.string().min(3));
  expectMatch(schema, "hello");
  expectMatch(schema, "ab");
  expectMatch(schema, 123);
});

// === Custom / Instanceof ===

test("instanceof", () => {
  class MyClass {
    value: number;
    constructor(v: number) {
      this.value = v;
    }
  }

  const aot = compile(z.instanceof(MyClass));
  const instance = new MyClass(1);
  expect(valid(aot, instance)).toBe(instance);
  invalid(aot, { value: 1 });
  invalid(aot, null);
});

test("instanceof Date", () => {
  const aot = compile(z.instanceof(Date));
  const d = new Date();
  expect(valid(aot, d)).toBe(d);
  invalid(aot, "2024-01-01");
  invalid(aot, {});
});

test("matches Zod: instanceof", () => {
  class Test {}
  const schema = z.instanceof(Test);
  expectMatch(schema, new Test());
  expectMatch(schema, {});
  expectMatch(schema, null);
});

// === Bigint Format Checks ===

test("bigint int64 format", () => {
  const aot = compile(z.int64());
  expect(valid(aot, 0n)).toBe(0n);
  expect(valid(aot, 9223372036854775807n)).toBe(9223372036854775807n);
  expect(valid(aot, -9223372036854775808n)).toBe(-9223372036854775808n);
  invalid(aot, 9223372036854775808n); // too big
  invalid(aot, -9223372036854775809n); // too small
});

test("bigint uint64 format", () => {
  const aot = compile(z.uint64());
  expect(valid(aot, 0n)).toBe(0n);
  expect(valid(aot, 18446744073709551615n)).toBe(18446744073709551615n);
  invalid(aot, -1n); // negative
  invalid(aot, 18446744073709551616n); // too big
});

test("matches Zod: bigint format", () => {
  const schema = z.int64();
  expectMatch(schema, 0n);
  expectMatch(schema, 9223372036854775807n);
  expectMatch(schema, 9223372036854775808n);
});

// === Nullish (combines optional + nullable) ===

test("nullish", () => {
  const aot = compile(z.string().nullish());
  expect(valid(aot, "hello")).toBe("hello");
  expect(aot(null)).toBe(null);
  expect(aot(undefined)).toBe(undefined); // undefined is valid output
  invalid(aot, 123);
});

test("matches Zod: nullish", () => {
  const schema = z.string().nullish();
  expectMatch(schema, "hello");
  expectMatch(schema, null);
  expectMatch(schema, undefined);
  expectMatch(schema, 123);
});

// === Codec (extends pipe with transform) ===
// Note: Codecs involve transforms, so AOT validates input and executes transforms.

test("codec validates and transforms", () => {
  // stringbool is a codec from string to boolean
  const aot = compile(z.stringbool());
  expect(valid(aot, "true")).toBe(true);
  expect(valid(aot, "false")).toBe(false);
  expect(valid(aot, "1")).toBe(true);
  expect(valid(aot, "0")).toBe(false);
  invalid(aot, 123); // Not a string
  invalid(aot, null);
});

// === SuperRefine ===

test("superRefine basic", () => {
  const schema = z.string().superRefine((val, ctx) => {
    if (val.length < 3) {
      ctx.addIssue({ code: "custom", message: "Too short" });
    }
  });
  const aot = compile(schema);
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "ab");
  invalid(aot, 123);
});

test("superRefine with multiple issues", () => {
  const schema = z.number().superRefine((val, ctx) => {
    if (val < 0) ctx.addIssue({ code: "custom", message: "Must be positive" });
    if (val > 100) ctx.addIssue({ code: "custom", message: "Must be <= 100" });
  });
  const aot = compile(schema);
  expect(valid(aot, 50)).toBe(50);
  invalid(aot, -1);
  invalid(aot, 101);
});

test("matches Zod: superRefine", () => {
  const schema = z.string().superRefine((val, ctx) => {
    if (!val.includes("@")) {
      ctx.addIssue({ code: "custom", message: "Must contain @" });
    }
  });
  expectMatch(schema, "test@example.com");
  expectMatch(schema, "invalid");
  expectMatch(schema, 123);
});

// === Transform ===

test("transform basic", () => {
  const schema = z.string().transform((val) => val.toUpperCase());
  const aot = compile(schema);
  expect(valid(aot, "hello")).toBe("HELLO"); // Transform succeeds
  invalid(aot, 123); // Not a string (fails before transform)
});

test("transform with validation", () => {
  const schema = z.string().transform((val, ctx) => {
    if (val.length === 0) {
      ctx.addIssue({ code: "custom", message: "Empty string" });
      return z.NEVER;
    }
    return val.length;
  });
  const aot = compile(schema);
  expect(valid(aot, "hello")).toBe(5);
  invalid(aot, ""); // Transform adds issue
});

test("matches Zod: transform", () => {
  const schema = z.string().transform((val) => val.length);
  expectMatch(schema, "hello");
  expectMatch(schema, 123);
});

// === Overwrite Checks (trim, toLowerCase, toUpperCase) ===

test("trim", () => {
  const schema = z.string().trim();
  const aot = compile(schema);

  // AOT validates the input type and applies trim transform
  expect(valid(aot, "  hello  ")).toBe("hello");
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, "")).toBe("");
  invalid(aot, 123);
});

test("toLowerCase", () => {
  const schema = z.string().toLowerCase();
  const aot = compile(schema);

  // AOT validates the input type and applies toLowerCase transform
  expect(valid(aot, "HELLO")).toBe("hello");
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, "")).toBe("");
  invalid(aot, 123);
});

test("toUpperCase", () => {
  const schema = z.string().toUpperCase();
  const aot = compile(schema);

  // AOT validates the input type and applies toUpperCase transform
  expect(valid(aot, "hello")).toBe("HELLO");
  expect(valid(aot, "HELLO")).toBe("HELLO");
  expect(valid(aot, "")).toBe("");
  invalid(aot, 123);
});

test("chained overwrites", () => {
  const schema = z.string().trim().toLowerCase();
  const aot = compile(schema);

  // AOT validates the input type and applies transforms in order
  expect(valid(aot, "  HELLO  ")).toBe("hello");
  expect(valid(aot, "hello")).toBe("hello");
  expect(valid(aot, "")).toBe("");
  invalid(aot, 123);
});

test("overwrite with validation", () => {
  const schema = z.string().trim().min(3);
  const aot = compile(schema);

  // After trim, check min length
  expect(valid(aot, "  hello  ")).toBe("hello"); // "hello" length 5 >= 3
  expect(valid(aot, "hello")).toBe("hello");
  invalid(aot, "  ab  "); // "ab" length 2 < 3
  expect(valid(aot, "abc")).toBe("abc");
  invalid(aot, 123);
});

test("matches Zod: trim", () => {
  const schema = z.string().trim();
  expectMatch(schema, "  hello  ");
  expectMatch(schema, "hello");
  expectMatch(schema, 123);
});

test("matches Zod: toLowerCase", () => {
  const schema = z.string().toLowerCase();
  expectMatch(schema, "HELLO");
  expectMatch(schema, "hello");
  expectMatch(schema, 123);
});

test("matches Zod: toUpperCase", () => {
  const schema = z.string().toUpperCase();
  expectMatch(schema, "hello");
  expectMatch(schema, "HELLO");
  expectMatch(schema, 123);
});

test("matches Zod: chained overwrites", () => {
  const schema = z.string().trim().toLowerCase();
  expectMatch(schema, "  HELLO  ");
  expectMatch(schema, "hello");
  expectMatch(schema, 123);
});

test("matches Zod: overwrite with validation", () => {
  const schema = z.string().trim().min(3);
  expectMatch(schema, "  hello  ");
  expectMatch(schema, "  ab  ");
  expectMatch(schema, "abc");
  expectMatch(schema, 123);
});
