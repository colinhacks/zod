import { expect, test } from "vitest";

import * as z from "../../index.js";
import { INVALID, ZodCompileUnsupportedError, compile, compileFn } from "../compile.js";

// Differential harness: assert compiled schema agrees with the original on every fixture. Success path: data identical (incl. key order and undefined-vs-absent, which toEqual cannot see) AND the fast path actually produced the value (a fixture set that silently falls back on valid inputs tests nothing). Failure path: issues deep-equal (errors always come from the runtime fallback).
function describe(value: unknown): string {
  try {
    return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v));
  } catch {
    return String(value);
  }
}

// Stricter-than-toEqual structural identity: own-key order, symbol keys, undefined-valued vs absent keys, array holes, frozenness, NaN/-0.
function assertIdentical(actual: unknown, expected: unknown, path: string): void {
  if (Object.is(actual, expected)) return;
  if (actual === null || expected === null || typeof expected !== "object" || typeof actual !== "object") {
    expect(actual, `value mismatch at ${path}`).toEqual(expected);
    expect(Object.is(actual, expected), `Object.is mismatch at ${path} (NaN/-0?)`).toBe(true);
    return;
  }
  expect(Object.getPrototypeOf(actual), `prototype mismatch at ${path}`).toBe(Object.getPrototypeOf(expected));
  expect(Object.isFrozen(actual), `frozenness mismatch at ${path}`).toBe(Object.isFrozen(expected));
  if (expected instanceof Date) {
    expect((actual as Date).getTime(), `Date mismatch at ${path}`).toBe(expected.getTime());
    return;
  }
  if (expected instanceof Map) {
    expect([...(actual as Map<unknown, unknown>).entries()], `Map mismatch at ${path}`).toEqual([
      ...expected.entries(),
    ]);
    return;
  }
  if (expected instanceof Set) {
    expect([...(actual as Set<unknown>)], `Set mismatch at ${path}`).toEqual([...expected]);
    return;
  }
  if (Array.isArray(expected)) {
    expect((actual as unknown[]).length, `length mismatch at ${path}`).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
      expect(i in (actual as object), `hole mismatch at ${path}[${i}]`).toBe(i in expected);
      if (i in expected) assertIdentical((actual as unknown[])[i], expected[i], `${path}[${i}]`);
    }
    return;
  }
  const actualKeys = Reflect.ownKeys(actual as object);
  const expectedKeys = Reflect.ownKeys(expected as object);
  expect(actualKeys, `key set/order mismatch at ${path}`).toEqual(expectedKeys);
  for (const k of expectedKeys) {
    assertIdentical(
      (actual as Record<PropertyKey, unknown>)[k],
      (expected as Record<PropertyKey, unknown>)[k],
      `${path}.${String(k)}`
    );
  }
}

function differential(schema: z.ZodType, inputs: unknown[], opts?: { fallbackOk?: boolean }) {
  const compiled = compile(schema);
  const fast = compileFn(schema);
  // Assert-mode codegen shares every validation path with the parser and only drops the output construction, so it must reach the same verdict on every fixture. Refusing to compile at all is fine (the caller falls back); silently disagreeing is the drift this catches.
  const assertFast = attempt(() => compileFn(schema, { assertOnly: true })).value;
  for (const input of inputs) {
    // A schema may throw rather than return — an async check reached synchronously does. Both sides have to agree on that too, and comparing results would just rethrow.
    const at = attempt(() => schema.safeParse(input));
    const bt = attempt(() => compiled.safeParse(input));
    expect(
      bt.threw,
      `throw mismatch for input ${describe(input)}: runtime ${at.threw ?? "did not throw"}, compiled ${bt.threw ?? "did not throw"}`
    ).toBe(at.threw);
    if (at.threw) continue;
    const a = at.value!;
    const b = bt.value!;
    expect(b.success, `success mismatch for input ${describe(input)}`).toBe(a.success);
    if (assertFast) {
      const parseVerdict = attempt(() => fast(input) !== INVALID);
      const assertVerdict = attempt(() => assertFast(input) !== INVALID);
      expect(assertVerdict.threw ?? "did not throw", `assert-mode threw differently for input ${describe(input)}`).toBe(
        parseVerdict.threw ?? "did not throw"
      );
      if (!parseVerdict.threw) {
        expect(
          assertVerdict.value,
          `assert-mode verdict disagreed with the parse fast path for input ${describe(input)}`
        ).toBe(parseVerdict.value);
      }
    }
    if (a.success && b.success) {
      if (!opts?.fallbackOk) {
        expect(fast(input) === INVALID, `fast path fell back on valid input ${describe(input)}`).toBe(false);
      }
      assertIdentical(b.data, a.data, "$");
    } else if (!a.success && !b.success) {
      expect(b.error.issues, `issues mismatch for input ${describe(input)}`).toEqual(a.error.issues);
    }
  }
  assertUnionSound(schema, inputs);
}

/**
 * Every other assertion here is rescued by the fallback: a fast path that bails
 * out returns INVALID, the wrapper re-runs the interpreter, and the answer comes
 * out right. A union is the one place that cannot happen — it reads INVALID from
 * a branch as "the interpreter would reject this" and moves to the next branch,
 * so a bail-out silently becomes a different parse result with no error at all.
 *
 * Wrap the schema next to a branch that accepts anything and assert the sentinel
 * never wins on input the schema itself accepts.
 */
/** Runs `fn`, reporting the error's class rather than letting it escape. `constructor.name`, not `.name`: `$ZodAsyncError` never sets `.name`, so it reads as plain `"Error"` and a swapped error class would compare equal to a user throw. */
function attempt<T>(fn: () => T): { value?: T; threw?: string } {
  try {
    return { value: fn() };
  } catch (err) {
    return { threw: (err as Error)?.constructor?.name || "Error" };
  }
}

function assertUnionSound(schema: z.ZodType, inputs: unknown[]) {
  const marker = Symbol("sentinel");
  const sentinel = z.any().transform(() => marker);
  let union: z.ZodType;
  let compiledUnion: z.ZodType;
  try {
    union = z.union([schema, sentinel]) as unknown as z.ZodType;
    compiledUnion = compile(union);
  } catch {
    return; // Refused at codegen, which is the outcome a union honours.
  }
  for (const input of inputs) {
    const direct = attempt(() => schema.safeParse(input));
    const viaUnion = attempt(() => compiledUnion.safeParse(input));

    if (direct.threw) {
      // A bare throw does not decide what the union does, so the interpreted union is the only reference: `refine`, `superRefine` and `custom` propagate out of it, while `transform` and `pipe` let it answer with a later branch. Measure it rather than assume. Nothing else in this file can see this class — the bare differential compares a fast path that returned INVALID against a fallback that re-runs the interpreter, so both sides reproduce the throw whichever way the guard is written.
      const interpreted = attempt(() => union.safeParse(input));
      expect(
        viaUnion.threw ?? "did not throw",
        `union disagreed on throwing for input ${describe(input)}: interpreted ${interpreted.threw ?? "did not throw"}, compiled ${viaUnion.threw ?? "did not throw"}`
      ).toBe(interpreted.threw ?? "did not throw");
      continue;
    }
    if (!direct.value!.success) continue;

    expect(
      viaUnion.threw,
      `compiled union threw ${viaUnion.threw} for input ${describe(input)} the schema accepts`
    ).toBe(undefined);
    const got = viaUnion.value!;
    expect(
      got.success && got.data === marker,
      `union selected the sentinel for input ${describe(input)} the schema accepts — a bail-out read as a rejection`
    ).toBe(false);
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

// A wrapper around a container is where assert mode stops building: the wrapper itself constructs nothing, so the object or array inside it drops its output. Wrapping a scalar exercises none of that.
test("wrapped containers", () => {
  const shape = { a: z.string(), b: z.number() };
  differential(z.object(shape).nullable(), [{ a: "x", b: 1 }, null, undefined, { a: 1, b: 1 }, "no"]);
  differential(z.looseObject(shape).optional(), [{ a: "x", b: 1, extra: 9 }, undefined, null, { a: 1 }]);
  differential(z.strictObject(shape).nullable(), [{ a: "x", b: 1 }, null, { a: "x", b: 1, extra: 9 }]);
  differential(z.array(z.object(shape)).nullable(), [[{ a: "x", b: 1 }], [], null, [{ a: 1 }]]);
  differential(z.object({ inner: z.object(shape).nullable() }), [
    { inner: { a: "x", b: 1 } },
    { inner: null },
    { inner: { a: 1, b: 1 } },
  ]);
  differential(z.object({ inner: z.looseObject(shape).optional() }), [{ inner: { a: "x", b: 1 } }, {}, { inner: 5 }]);
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

test("xor is unsupported directly; parity holds through a container island", () => {
  // Exactly-one-match counting is unsound against any falsely-rejecting branch, so xor always uses the runtime.
  expect(() => compile(z.xor([z.string(), z.number()]), { strict: true })).toThrow();
  differential(z.object({ v: z.xor([z.string(), z.number()]) }), [{ v: "a" }, { v: 1 }, { v: true }, { v: null }]);
  differential(z.object({ v: z.xor([z.string(), z.any()]) }), [{ v: "a" }, { v: 1 }, { v: null }]);
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

test("string length checks measure code points", () => {
  const inputs = [
    "abc",
    "\u{1F600}",
    "\u{1F600}\u{1F600}",
    "\u{1F600}\u{1F600}\u{1F600}",
    "\u{1F600}\u{1F600}ab",
    "\uD83D",
    "",
  ];
  differential(z.string().min(3), inputs);
  differential(z.string().max(3), inputs);
  differential(z.string().length(3), inputs);
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

// --- catch ---

test("catch primitive", () => {
  // A caught failure hands the parse back: finalizing the issues the callback sees needs the caller's error map, which the fast path has no access to.
  differential(z.catch(z.string(), "fb"), ["x", "", 1, null, undefined], { fallbackOk: true });
});

test("catch inside object property", () => {
  differential(
    z.object({ name: z.catch(z.string().min(2), "anon") }),
    [{ name: "Alice" }, { name: "x" }, { name: 42 }, {}],
    { fallbackOk: true }
  );
});

test("catch with function reading issues is refused", () => {
  // The callback reads issues finalized against the caller's per-parse error map, which generated code has no access to. Refusing at codegen is what makes it safe inside a union; returning INVALID at parse time would read as a rejected branch.
  const schema = z.catch(z.string().min(5), (ctx) => `e:${ctx.error.issues.length}`);
  expect(() => compile(schema, { strict: true })).toThrow(ZodCompileUnsupportedError);
  expect(schema.parse("ab")).toBe("e:1");
  expect(schema.parse(123 as never, { error: () => "MAPPED" })).toBe("e:1");
});

test("catch with a callback is refused inside a container, not islanded", () => {
  // A container normally absorbs an unsupported child by running just that node through the runtime. That is only equivalent for a node that *propagates* its issues: an island gets no parse context, and catch CONSUMES issues, so an islanded catch finalizes against an empty error map and still succeeds. The divergence is silent — the parse returns a different string with no error anywhere. Refusing the whole schema is what keeps the container honest, so this asserts the throw rather than a matching value.
  const inner = z.catch(z.string(), (ctx) => `msg=${ctx.error.issues[0]?.message}`);
  const schema = z.object({ a: inner, b: z.number() });
  const mapped = { error: () => "MAPPED" };

  expect(() => compile(schema, { strict: true })).toThrow(ZodCompileUnsupportedError);
  expect(schema.parse({ a: 1, b: 2 }, mapped)).toEqual({ a: "msg=MAPPED", b: 2 });

  // The sibling stays compilable on its own, so the refusal is about catch and not about the container.
  expect(() => compile(z.object({ a: z.string(), b: z.number() }), { strict: true })).not.toThrow();
});

test("catch with a constant value keeps the fast path", () => {
  differential(z.catch(z.string().min(5), "fb"), ["abcdef", "ab", 42, undefined]);
});

// --- runtime islands ---

test("xor inside object falls back per-property via runtime island", () => {
  differential(z.object({ x: z.xor([z.string(), z.number()]), y: z.boolean() }), [
    { x: "a", y: true },
    { x: 1, y: false },
    { x: true, y: true },
    { x: "a", y: 1 },
  ]);
});

test("xor inside array element via runtime island", () => {
  differential(z.array(z.xor([z.string(), z.number()])), [[], ["a", 1, "b"], ["a", true]]);
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

// --- url: guards the one place the compiler reimplements runtime semantics ---

test("url options match the runtime across the whole option matrix", () => {
  // `parseValidURL` is a second implementation of what `$ZodURL`'s own check does inline — the trim, the `://` guard, the hostname and protocol tests, the normalize step. Deduplicating them faithfully is awkward, because hostname and protocol can both fail and each pushes its own issue, so the shared helper would have to return a list of reasons rather than a value. Until that happens this matrix is what keeps the two copies honest: a fix to either that the other misses fails here rather than drifting silently, which is exactly how z.creditCard() went wrong.
  const inputs = [
    "https://example.com",
    "https://example.com/a/b?c=1#d",
    "  https://example.com  ",
    "http://example.com",
    "http:example.com",
    "https:/path",
    "ftp://example.com",
    "https://sub.example.co.uk",
    "https://example.com:8443/x",
    "not a url",
    "",
    "//example.com",
    "mailto:a@b.com",
    // The WHATWG parser deletes these rather than failing, so the two paths only agree if both apply that deletion to the value they return.
    "https://exa\nmple.com",
    "https://exa\tmple.com",
    "https://example.com/a\rb?c=d#e",
  ];
  const schemas: z.ZodType[] = [
    z.url(),
    z.url({ normalize: true }),
    z.url({ hostname: /^example\.com$/ }),
    z.url({ protocol: /^https$/ }),
    z.url({ protocol: /^https?$/ }),
    z.url({ hostname: /^example\.com$/, protocol: /^https$/ }),
    z.url({ hostname: /^example\.com$/, normalize: true }),
    z.httpUrl(),
  ];
  for (const schema of schemas) differential(schema, inputs);
});

test("empty strict object compiles", () => {
  // With no keys the unknown-key condition is empty, and `if () return INVALID;` is a syntax error the single top-level `new Function` rejects — too late for compileChild to island, so the whole tree lost its fast path.
  differential(z.strictObject({}), [{}, { a: 1 }, Object.create({ inherited: 1 })]);
  differential(z.object({ inner: z.strictObject({}) }), [{ inner: {} }, { inner: { a: 1 } }]);
});

test("loose record with an enumerated key set", () => {
  // `mode: "loose"` only changes what happens to unrecognized keys; every enumerated key is still required, so this belongs on the exhaustive path.
  differential(z.looseRecord(z.enum(["a", "b"]), z.number()), [
    { a: 1, b: 2 },
    { a: 1 },
    { a: 1, b: 2, extra: "kept" },
    { a: 1, b: "no" },
    JSON.parse('{"a":1,"b":2,"__proto__":{"p":1}}'),
  ]);
});

test("a catch callback is refused however it declares its arity", () => {
  // Function.length reports 0 for rest and defaulted parameters alike, so arity cannot separate a user callback from the thunk `.catch(value)` synthesises. Provenance can.
  const rest = z.catch(z.string().min(5), ((...a: any[]) => `e:${a[0].error.issues.length}`) as never);
  const dflt = z.catch(
    z.string().min(5),
    ((ctx: any = { error: { issues: [] } }) => `e:${ctx.error.issues.length}`) as never
  );
  for (const schema of [rest, dflt]) {
    expect(() => compile(schema, { strict: true })).toThrow(ZodCompileUnsupportedError);
    expect(schema.parse("ab")).toBe("e:1");
  }
  differential(z.catch(z.string().min(5), "fb"), ["abcdef", "ab", 42]);
});

test("a coercing object key cannot materialize an absent key", () => {
  // Compilation refuses coercion, so the child becomes a runtime island — and an island receives `input[key]` with no way to tell an absent key from an explicit undefined. The runtime object keeps them apart (#6405): absent rejects, explicit undefined coerces. Without a presence guard the fast path answered `{ k: "undefined" }` for `{}`.
  differential(z.object({ k: z.coerce.string() }), [{}, { k: 5 }, { k: undefined }, { k: "s" }]);
  differential(z.object({ k: z.coerce.number() }), [{}, { k: "42" }, { k: undefined }]);
  differential(z.object({ k: z.coerce.boolean() }), [{}, { k: 1 }, { k: undefined }]);
  differential(z.object({ a: z.string(), k: z.coerce.string() }), [{ a: "x" }, { a: "x", k: 5 }]);
});

test("a thenable predicate throws rather than rejecting", () => {
  // `isAsyncFunction` is syntactic, so a plain function returning a promise reaches the codegen. The interpreter throws $ZodAsyncError for it — returning INVALID instead is a bail-out, and a union reads a bail-out as a rejected branch and answers with a later one. Routed through differential() precisely so assertUnionSound sees it; the previous bespoke helper skipped that and is why this shipped.
  differential(
    z.custom(() => Promise.resolve(true) as never),
    ["x", 1, null]
  );
  differential(z.string().refine((() => Promise.resolve(true)) as never), ["x", 1]);
  differential(z.string().superRefine(((_v: any, _c: any) => Promise.resolve(true)) as never), ["x", 1]);

  // A transform is the other way round: the interpreter's own union also falls through to the next branch, so INVALID there is parity rather than a bail-out.
  differential(z.string().transform((() => Promise.resolve(1)) as never), ["x"], { fallbackOk: true });

  // A real async predicate is still refused at codegen, and an ordinary one still compiles.
  expect(() =>
    compile(
      z.custom(async () => true),
      { strict: true }
    )
  ).toThrow();
  differential(
    z.custom((v) => typeof v === "string"),
    ["x", 1, null, undefined]
  );
});

// Generated corpus. The hand-written fixtures above pin the shapes we reasoned about; this covers the combinations nobody thought to write, which is where a codegen flag actually breaks. Seeded so a failure reproduces.
function makeRng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nonEmpty(v: unknown): boolean {
  if (v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (v !== null && typeof v === "object" && !(v instanceof Date)) return Object.keys(v).length > 0;
  return true;
}

interface Generated {
  schema: z.ZodType;
  ok: () => unknown;
}

function generate(rnd: () => number, depth: number): Generated {
  const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)];
  const leaves = ["string", "number", "boolean", "literal", "enum", "bounded", "int"];
  // Only object, array, optional and nullable consume `buildsValue`; every other generator calls the 4-arg `compileChild`, which defaults `needsValue` to true and puts the subtree back in full-value mode. Assert-mode-specific state only arises in chains of those four, so they are weighted to make such chains common rather than incidental.
  const nodes = [
    "object",
    "looseObject",
    "strictObject",
    "array",
    "optional",
    "nullable",
    "object",
    "array",
    "optional",
    "nullable",
    "union",
    "tuple",
    "record",
    "default",
    "catch",
    "refine",
    "refine",
    "refine",
    "transform",
    "pipe",
  ];
  switch (depth <= 0 ? pick(leaves) : pick(rnd() < 0.45 ? leaves : nodes)) {
    case "string":
      return { schema: z.string(), ok: () => pick(["a", "", "hello"]) };
    case "bounded":
      return { schema: z.string().min(2).max(6), ok: () => pick(["ab", "abcdef"]) };
    case "number":
      return { schema: z.number(), ok: () => pick([0, 1, -1, 3.5]) };
    case "int":
      return { schema: z.number().int().min(0), ok: () => pick([0, 42]) };
    case "boolean":
      return { schema: z.boolean(), ok: () => rnd() < 0.5 };
    case "literal":
      return { schema: z.literal("lit"), ok: () => "lit" };
    case "enum":
      return { schema: z.enum(["a", "b"]), ok: () => pick(["a", "b"]) };
    case "object":
    case "looseObject":
    case "strictObject": {
      const kids: Record<string, Generated> = {};
      const shape: Record<string, z.ZodType> = {};
      for (let i = 0; i < 1 + Math.floor(rnd() * 3); i++) {
        kids[`k${i}`] = generate(rnd, depth - 1);
        shape[`k${i}`] = kids[`k${i}`].schema;
      }
      const ctor = pick([z.object, z.looseObject, z.strictObject]) as typeof z.object;
      return {
        schema: ctor(shape as never),
        ok: () => Object.fromEntries(Object.entries(kids).map(([k, v]) => [k, v.ok()])),
      };
    }
    case "array": {
      const c = generate(rnd, depth - 1);
      return { schema: z.array(c.schema), ok: () => Array.from({ length: Math.floor(rnd() * 3) }, () => c.ok()) };
    }
    case "tuple": {
      const a = generate(rnd, depth - 1);
      const b = generate(rnd, depth - 1);
      return { schema: z.tuple([a.schema, b.schema]), ok: () => [a.ok(), b.ok()] };
    }
    case "record": {
      const c = generate(rnd, depth - 1);
      return { schema: z.record(z.string(), c.schema), ok: () => ({ p: c.ok(), q: c.ok() }) };
    }
    case "optional": {
      const c = generate(rnd, depth - 1);
      return { schema: z.optional(c.schema), ok: () => (rnd() < 0.3 ? undefined : c.ok()) };
    }
    case "nullable": {
      const c = generate(rnd, depth - 1);
      return { schema: z.nullable(c.schema), ok: () => (rnd() < 0.3 ? null : c.ok()) };
    }
    case "union": {
      const a = generate(rnd, depth - 1);
      const b = generate(rnd, depth - 1);
      return { schema: z.union([a.schema, b.schema]), ok: () => (rnd() < 0.5 ? a.ok() : b.ok()) };
    }
    case "default": {
      const c = generate(rnd, depth - 1);
      return { schema: z.optional(c.schema).default(c.ok() as never), ok: () => (rnd() < 0.3 ? undefined : c.ok()) };
    }
    case "catch": {
      const c = generate(rnd, depth - 1);
      return { schema: c.schema.catch(c.ok() as never), ok: () => (rnd() < 0.4 ? 12345 : c.ok()) };
    }
    case "refine": {
      const c = generate(rnd, depth - 1);
      // Keyed to the value's own content, not a sentinel nothing produces. `refine` is the only generator that hangs a check on a container, so this predicate is what exercises the "carries checks of its own" half of `buildsValue`, and a check that can never reject leaves that half uncovered. Rejecting every empty value makes that rejection common rather than lucky.
      return { schema: c.schema.refine(nonEmpty), ok: () => c.ok() };
    }
    case "transform": {
      const c = generate(rnd, depth - 1);
      return { schema: c.schema.transform((v: unknown) => ({ wrapped: v })), ok: () => c.ok() };
    }
    default: {
      const c = generate(rnd, depth - 1);
      return { schema: c.schema.pipe(z.any()), ok: () => c.ok() };
    }
  }
}

const HOSTILE: unknown[] = [
  undefined,
  null,
  Number.NaN,
  -0,
  0,
  "",
  "x",
  true,
  false,
  [],
  {},
  [1, 2],
  { k0: 1 },
  Object.create(null),
  new Date(Number.NaN),
  1n,
  Symbol.iterator,
  Number.POSITIVE_INFINITY,
];

function corrupt(rnd: () => number, value: unknown, depth = 0): unknown {
  const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)];
  if (depth > 2 || rnd() < 0.35) return pick(HOSTILE);
  if (Array.isArray(value)) {
    const out = value.slice();
    if (out.length && rnd() < 0.6) out[Math.floor(rnd() * out.length)] = corrupt(rnd, out[0], depth + 1);
    else out.push(pick(HOSTILE));
    return out;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    const keys = Object.keys(out);
    if (keys.length && rnd() < 0.6) out[pick(keys)] = corrupt(rnd, out[pick(keys)], depth + 1);
    else if (rnd() < 0.5) out[`extra${Math.floor(rnd() * 3)}`] = pick(HOSTILE);
    else delete out[pick(keys)];
    return out;
  }
  return pick(HOSTILE);
}

test("assert mode agrees with the parser and the runtime across generated schemas", () => {
  let accepted = 0;
  let rejected = 0;
  let refused = 0;

  for (const seed of [1, 7, 42, 1337]) {
    const rnd = makeRng(seed);
    for (let i = 0; i < 150; i++) {
      const g = generate(rnd, 1 + Math.floor(rnd() * 3));
      const parser = attempt(() => compileFn(g.schema));
      const validator = attempt(() => compileFn(g.schema, { assertOnly: true }));
      // A one-sided refusal is a silent loss of the fast path, so it fails here rather than dropping the schema.
      expect(!!validator.threw, `assert-mode refusal disagrees with the parser, seed ${seed} case ${i}`).toBe(
        !!parser.threw
      );
      const parseFn = parser.value;
      const assertFn = validator.value;
      if (!parseFn || !assertFn) {
        refused++;
        continue;
      }
      const compiled = attempt(() => compile(g.schema));
      const compiledSchema = compiled.value;

      for (let j = 0; j < 6; j++) {
        const input = j < 3 ? g.ok() : corrupt(rnd, g.ok());
        const label = `seed ${seed} case ${i}/${j} input ${describe(input)}`;

        const viaParser = attempt(() => parseFn(input) !== INVALID);
        const viaValidator = attempt(() => assertFn(input) !== INVALID);
        expect(viaValidator.threw ?? "did not throw", `assert-mode throw disagrees, ${label}`).toBe(
          viaParser.threw ?? "did not throw"
        );
        if (viaParser.threw) continue;
        expect(viaValidator.value, `assert-mode verdict disagrees, ${label}`).toBe(viaParser.value);

        const runtime = attempt(() => g.schema.safeParse(input).success);
        if (runtime.threw) continue;
        expect(viaParser.value, `compiled verdict disagrees with the runtime, ${label}`).toBe(runtime.value);
        if (compiledSchema) {
          expect(z.validate(compiledSchema, input), `z.validate disagrees with the runtime, ${label}`).toBe(
            runtime.value
          );
        }
        if (runtime.value) accepted++;
        else rejected++;
      }
    }
  }

  // Guard against a corpus that only ever passes: agreement on 3600 accepted verdicts would prove nothing about rejection.
  expect(accepted, "generated corpus produced too few accepted inputs").toBeGreaterThan(500);
  expect(rejected, "generated corpus produced too few rejected inputs").toBeGreaterThan(500);
  // Every construct the generator emits compiles today. Pinning it means a schema that starts refusing surfaces here instead of quietly shrinking the corpus behind the floors above.
  expect(refused, "a generated schema stopped compiling").toBe(0);
});
