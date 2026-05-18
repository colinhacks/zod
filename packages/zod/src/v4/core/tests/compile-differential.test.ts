import { expect, test } from "vitest";

import * as z from "../../index.js";
import { compile } from "../compile.js";

// Differential harness: assert compiled schema agrees with the original on every
// fixture. Success path: data deep-equal. Failure path: issues deep-equal.
function describe(value: unknown): string {
  try {
    return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v));
  } catch {
    return String(value);
  }
}

function differential(schema: z.ZodType, inputs: unknown[]) {
  const compiled = compile(schema);
  for (const input of inputs) {
    const a = schema.safeParse(input);
    const b = compiled.safeParse(input);
    expect(b.success, `success mismatch for input ${describe(input)}`).toBe(a.success);
    if (a.success && b.success) {
      expect(b.data, `data mismatch for input ${describe(input)}`).toEqual(a.data);
    } else if (!a.success && !b.success) {
      expect(b.error.issues, `issues mismatch for input ${describe(input)}`).toEqual(a.error.issues);
    }
  }
}

// --- primitives ---

test("string", () => {
  differential(z.string(), ["", "hello", " ", "\n", 0, null, undefined, [], {}]);
});

test("number", () => {
  differential(z.number(), [0, 1, -1, 1.5, Number.MAX_SAFE_INTEGER, Number.NaN, Number.POSITIVE_INFINITY, "1", null]);
});

test("boolean", () => {
  differential(z.boolean(), [true, false, 0, 1, "true", null, undefined]);
});

test("bigint", () => {
  differential(z.bigint(), [0n, 1n, -1n, 9999999999999999999n, 1, "1", null]);
});

test("date", () => {
  differential(z.date(), [new Date(), new Date(0), new Date("invalid"), "2024-01-01", 0, null]);
});

test("null/undefined/void", () => {
  differential(z.null(), [null, undefined, 0, false]);
  differential(z.undefined(), [undefined, null, 0, false]);
  differential(z.void(), [undefined, null, 0]);
});

test("nan", () => {
  differential(z.nan(), [Number.NaN, 0, "NaN", null, Number.POSITIVE_INFINITY]);
});

test("any/unknown", () => {
  differential(z.any(), [undefined, null, 0, "x", { a: 1 }, [1, 2]]);
  differential(z.unknown(), [undefined, null, 0, "x", { a: 1 }]);
});

test("never", () => {
  differential(z.never(), [undefined, null, 0, "x", {}]);
});

// --- literals & enums ---

test("literal single", () => {
  differential(z.literal("a"), ["a", "b", 1, null]);
  differential(z.literal(42), [42, 43, "42"]);
  differential(z.literal(true), [true, false, 1]);
});

test("literal multi-value", () => {
  differential(z.literal(["a", "b", 1]), ["a", "b", 1, "c", 2]);
});

test("enum", () => {
  differential(z.enum(["red", "green", "blue"]), ["red", "blue", "yellow", null]);
});

// --- wrappers ---

test("optional", () => {
  differential(z.string().optional(), ["hello", undefined, null, 0]);
});

test("nullable", () => {
  differential(z.string().nullable(), ["hello", null, undefined, 0]);
});

test("nullish", () => {
  differential(z.string().nullish(), ["hello", null, undefined, 0]);
});

test("default", () => {
  differential(z.string().default("fallback"), ["hi", undefined, null, 1]);
});

test("prefault runs default through inner schema", () => {
  differential(z.string().trim().prefault("  fallback  "), ["hi", undefined, null, 1]);
  differential(z.string().min(3).prefault("x"), [undefined, "abcd"]);
});

test("optional wrapping default/prefault", () => {
  differential(z.string().default("fallback").optional(), ["hi", undefined, null, 1]);
  differential(z.string().trim().prefault("  fallback  ").optional(), ["hi", undefined, null, 1]);
  differential(z.string().min(3).prefault("x").optional(), [undefined, "abcd", "x", null]);
});

test("exactOptional top-level rejects undefined", () => {
  differential(z.string().exactOptional(), ["hi", undefined, null, 1]);
});

test("default applies after transform output", () => {
  differential(
    z
      .string()
      .transform((value) => (value === "missing" ? undefined : value))
      .default("fallback"),
    ["hi", "missing", undefined, 1]
  );
});

test("readonly", () => {
  differential(z.string().readonly(), ["hello", 1, null]);
});

// --- containers ---

test("array", () => {
  differential(z.array(z.number()), [[], [1, 2, 3], [1, "x"], null, "abc"]);
});

test("array of objects", () => {
  differential(z.array(z.object({ id: z.number() })), [[], [{ id: 1 }], [{ id: "x" }], [{}, { id: 2 }]]);
});

test("array with length checks", () => {
  differential(z.array(z.number()).min(1).max(3), [[], [1], [1, 2, 3], [1, 2, 3, 4]]);
});

test("tuple fixed", () => {
  differential(z.tuple([z.string(), z.number()]), [["a", 1], ["a"], ["a", 1, "x"], [1, "a"], null]);
});

test("tuple with rest", () => {
  differential(z.tuple([z.string()], z.number()), [["a"], ["a", 1, 2], ["a", "x"], [1]]);
});

test("tuple with trailing optional", () => {
  differential(z.tuple([z.string(), z.number().optional()]), [["a"], ["a", 1], [], ["a", "x"]]);
});

test("tuple with missing slots filled by default/prefault", () => {
  differential(z.tuple([z.string().default("fallback")]), [[], ["x"], [1]]);
  differential(z.tuple([z.string().trim().prefault("  fallback  ")]), [[], ["  x  "], [1]]);
  differential(z.tuple([z.string().default("fallback"), z.number().optional()]), [[], ["x"], ["x", 1], ["x", "bad"]]);
});

test("tuple optional-output tail can still fill or truncate", () => {
  differential(z.tuple([z.string().default("fallback").optional()]), [[], ["x"], [undefined], [1]]);
  differential(z.tuple([z.string().min(3).prefault("x").optional()]), [[], ["abcd"], ["x"], [1]]);
});

test("tuple with exactOptional distinguishes absent from explicit undefined", () => {
  differential(z.tuple([z.string().exactOptional()]), [[], ["x"], [undefined], [1]]);
  differential(z.tuple([z.number(), z.string().exactOptional()]), [
    [1],
    [1, "x"],
    [1, undefined],
    [],
    [1, "x", "extra"],
  ]);
  differential(z.tuple([z.string().optional(), z.number().exactOptional()]), [
    [],
    ["x"],
    ["x", 1],
    [undefined],
    [undefined, undefined],
    ["x", "bad"],
  ]);
});

test("object simple", () => {
  differential(z.object({ name: z.string(), age: z.number() }), [
    { name: "a", age: 1 },
    { name: "a", age: 1, extra: "x" },
    { name: 1, age: 1 },
    { name: "a" },
    null,
  ]);
});

test("object nested", () => {
  differential(z.object({ user: z.object({ name: z.string() }) }), [
    { user: { name: "a" } },
    { user: { name: 1 } },
    { user: {} },
    null,
  ]);
});

test("object with optional + default", () => {
  differential(z.object({ a: z.string().optional(), b: z.number().default(0) }), [
    {},
    { a: "x" },
    { b: 5 },
    { a: "x", b: 5 },
    { a: 1 },
  ]);
});

test("object with optional wrapping default/prefault", () => {
  differential(
    z.object({
      a: z.string().default("fallback").optional(),
      b: z.string().trim().prefault("  trimmed  ").optional(),
      c: z.string().min(3).prefault("x").optional(),
    }),
    [{}, { a: undefined, b: undefined, c: undefined }, { a: "x", b: " y ", c: "abc" }, { a: null }]
  );
});

test("object with exactOptional distinguishes absent from explicit undefined", () => {
  differential(
    z.object({
      exact: z.string().exactOptional(),
      loose: z.string().optional(),
    }),
    [{}, { exact: "x" }, { exact: undefined }, { loose: undefined }, { exact: null }]
  );
});

test("strictObject", () => {
  differential(z.strictObject({ a: z.string() }), [{ a: "x" }, { a: "x", extra: true }, { a: 1 }, {}]);
});

test("looseObject", () => {
  differential(z.looseObject({ a: z.string() }), [{ a: "x" }, { a: "x", extra: true }, { a: 1 }]);
});

test("object catchall", () => {
  differential(z.object({ a: z.string() }).catchall(z.number()), [
    { a: "x" },
    { a: "x", b: 1, c: 2 },
    { a: "x", b: "y" },
  ]);
});

test("record dynamic key", () => {
  differential(z.record(z.string(), z.number()), [{}, { a: 1, b: 2 }, { a: "x" }]);
});

test("record dynamic key rejects enumerable symbol keys", () => {
  const key = Symbol("record-key");
  const input = { a: 1, [key]: 2 };
  differential(z.record(z.string(), z.number()), [input]);
});

test("record enum key", () => {
  differential(z.record(z.enum(["a", "b"]), z.number()), [{ a: 1, b: 2 }, { a: 1, c: 3 }, {}]);
});

test("record enum key transform applies to output keys", () => {
  const schema = z.record(
    z.enum(["a", "b"]).transform((key) => (key === "a" ? "x" : "y")),
    z.number()
  );
  differential(schema, [{ a: 1, b: 2 }, { a: 1 }, { a: 1, b: "bad" }]);
});

test("map", () => {
  differential(z.map(z.string(), z.number()), [new Map(), new Map([["a", 1]]), new Map([["a", "x" as any]]), {}]);
});

test("set", () => {
  differential(z.set(z.number()), [new Set(), new Set([1, 2]), new Set(["x"]), []]);
});

// --- unions / intersection ---

test("union of primitives", () => {
  differential(z.union([z.string(), z.number()]), ["a", 1, true, null]);
});

test("union all-literals (Set optimization)", () => {
  differential(z.union([z.literal("a"), z.literal("b"), z.literal("c")]), ["a", "b", "c", "d", 1]);
});

test("xor exactly one branch", () => {
  differential(z.xor([z.string(), z.number()]), ["a", 1, true, null]);
});

test("xor multiple matches fails", () => {
  differential(z.xor([z.string(), z.any()]), ["a", 1, null]);
});

test("intersection of objects", () => {
  differential(z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })), [
    { a: "x", b: 1 },
    { a: "x" },
    { a: 1, b: 1 },
  ]);
});

test("intersection deep merge", () => {
  differential(
    z.intersection(
      z.object({ nested: z.object({ a: z.string() }) }),
      z.object({ nested: z.object({ b: z.number() }) })
    ),
    [{ nested: { a: "x", b: 1 } }, { nested: { a: "x" } }, { nested: { b: 1 } }, { nested: { a: "x", b: "bad" } }]
  );
});

// --- string formats & checks ---

test("string length checks", () => {
  differential(z.string().min(3).max(5), ["abc", "abcde", "ab", "abcdef", "abcd"]);
});

test("string regex", () => {
  differential(z.string().regex(/^[a-z]+$/), ["abc", "ABC", "abc123", ""]);
});

test("string startsWith/endsWith/includes", () => {
  differential(z.string().startsWith("a").endsWith("z").includes("m"), ["amz", "az", "abz", "amzz", "xyz"]);
});

test("email/uuid", () => {
  differential(z.email(), ["a@b.co", "not-email", ""]);
  differential(z.uuid(), ["00000000-0000-0000-0000-000000000000", "abc", ""]);
});

// --- numeric checks ---

test("number min/max", () => {
  differential(z.number().min(0).max(100), [0, 50, 100, -1, 101]);
});

test("number int / multipleOf", () => {
  differential(z.number().int(), [0, 5, -5, 1.5, "1"]);
  differential(z.number().multipleOf(5), [0, 5, 10, 7, 0.5]);
  // float tolerance regression (#5793)
  differential(z.number().multipleOf(1e-7), [0, 1e-7, 3e-7, 2.5e-7, 1.5e-7]);
});

// --- overwrites & transforms ---

test("trim/toLowerCase/toUpperCase", () => {
  differential(z.string().trim(), ["  hello  ", "hello", "", 1]);
  differential(z.string().toLowerCase(), ["HELLO", "hello", 1]);
  differential(z.string().toUpperCase(), ["hello", "HELLO", 1]);
});

test("trim chained with min", () => {
  differential(z.string().trim().min(3), ["  hi  ", "  hello  ", "", "abc"]);
});

test("transform basic", () => {
  differential(
    z.string().transform((s) => s.length),
    ["", "hi", "hello", 1]
  );
});

// --- codec ---

test("codec stringbool", () => {
  differential(z.stringbool(), ["true", "false", "1", "0", "yes", "no", "maybe", 1, null]);
});

// --- refinements ---

test("refine predicate", () => {
  differential(
    z.string().refine((s) => s.length > 3),
    ["hello", "hi", "abc"]
  );
});

test("superRefine adds issues", () => {
  const schema = z.string().superRefine((val, ctx) => {
    if (!val.includes("@")) ctx.addIssue({ code: "custom", message: "missing @" });
  });
  differential(schema, ["a@b", "ab", 1]);
});

// --- pathological / regression cases ---

test("__proto__ in object catchall", () => {
  const schema = z.looseObject({ name: z.string() });
  const polluted = JSON.parse('{"name":"ok","__proto__":{"x":1}}');
  differential(schema, [polluted, { name: "ok" }, { name: 1 }]);
});

test("nested array of objects of unions", () => {
  const schema = z.array(
    z.object({
      kind: z.string(),
      value: z.union([z.string(), z.number(), z.array(z.boolean())]),
    })
  );
  differential(schema, [
    [],
    [{ kind: "s", value: "hi" }],
    [
      { kind: "n", value: 5 },
      { kind: "b", value: [true, false] },
    ],
    [{ kind: "n", value: { wrong: true } }],
  ]);
});

test("deep optional defaults", () => {
  const schema = z.object({
    a: z
      .object({
        b: z.number().default(10),
      })
      .optional(),
  });
  differential(schema, [{}, { a: {} }, { a: { b: 1 } }, { a: { b: "x" } }]);
});
