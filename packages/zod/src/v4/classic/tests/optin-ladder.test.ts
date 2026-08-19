import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

/* ------------------------------------------------------------------ *
 * TYPE-LEVEL — the dangerous half. Defaults must stay OPTIONAL in
 * z.input and REQUIRED in z.output, exactly as before the ladder.
 * ------------------------------------------------------------------ */
test("ladder: z.input / z.output unchanged by the extra rung", () => {
  const objDefault = z.object({ a: z.string().default("D"), b: z.number() });
  expectTypeOf<z.input<typeof objDefault>>().toEqualTypeOf<{ a?: string | undefined; b: number }>();
  expectTypeOf<z.output<typeof objDefault>>().toEqualTypeOf<{ a: string; b: number }>();

  const objPrefault = z.object({ a: z.string().prefault("P"), b: z.number() });
  expectTypeOf<z.input<typeof objPrefault>>().toEqualTypeOf<{ a?: string | undefined; b: number }>();
  expectTypeOf<z.output<typeof objPrefault>>().toEqualTypeOf<{ a: string; b: number }>();

  const objOptional = z.object({ a: z.string().optional() });
  expectTypeOf<z.input<typeof objOptional>>().toEqualTypeOf<{ a?: string | undefined }>();

  const objTransform = z.object({
    a: z
      .string()
      .default("")
      .transform((v) => v.length),
  });
  expectTypeOf<z.input<typeof objTransform>>().toEqualTypeOf<{ a?: string | undefined }>();
  expectTypeOf<z.output<typeof objTransform>>().toEqualTypeOf<{ a: number }>();

  const standalone = z.string().default("D");
  expectTypeOf<z.input<typeof standalone>>().toEqualTypeOf<string | undefined>();
  expectTypeOf<z.output<typeof standalone>>().toEqualTypeOf<string>();

  // a trailing defaulted tuple slot stays optional in the input tuple
  const tup = z.tuple([z.string(), z.number().default(1)]);
  expectTypeOf<z.input<typeof tup>>().toEqualTypeOf<[string, (number | undefined)?]>();

  const partialed = objDefault.partial();
  expectTypeOf<z.input<typeof partialed>>().toEqualTypeOf<{ a?: string | undefined; b?: number | undefined }>();
});

/* ------------------------------------------------------------------ *
 * RUNTIME
 * ------------------------------------------------------------------ */
test("ladder: the #6321 regression is fixed", () => {
  const arr = z
    .string()
    .default("")
    .transform((v) => (v ? v.split(",") : []));
  expect(z.object({ a: arr }).partial().parse({})).toEqual({ a: [] });
  expect(z.object({ a: arr }).partial().parse({ a: undefined })).toEqual({ a: [] });
  expect(z.object({ a: arr }).partial().parse({ a: "x,y" })).toEqual({ a: ["x", "y"] });
  expect(arr.optional().parse(undefined)).toEqual([]);
  expect(
    z
      .string()
      .prefault("hi")
      .transform((v) => v.length)
      .optional()
      .parse(undefined)
  ).toBe(2);
});

test("ladder: key-level admissibility across every rung", () => {
  expect(z.object({ a: z.string().default("D") }).parse({})).toEqual({ a: "D" });
  expect(z.object({ a: z.string().prefault("P") }).parse({})).toEqual({ a: "P" });
  expect(z.object({ a: z.string().optional() }).parse({})).toEqual({});
  expect(z.object({ a: z.transform(() => "T") }).parse({})).toEqual({ a: "T" });
  expect(z.object({ a: z.string().catch("C") }).parse({})).toEqual({ a: "C" });
  expect(z.object({ a: z.string() }).safeParse({}).success).toBe(false);
});

test("ladder: exactOptional keeps its distinct meaning", () => {
  expect(z.object({ a: z.string().exactOptional() }).parse({})).toEqual({});
  expect(z.object({ a: z.string().exactOptional() }).safeParse({ a: undefined }).success).toBe(false);
});

// An absent key never materializes a value from a schema that only claims the middle rung, however that schema answers `undefined`. The top rung still substitutes, and an explicitly present `undefined` still runs the inner.
test.each([true, false])("ladder: an absent key stays absent on the middle rung (jitless=%s)", (jitless) => {
  const opts = { jitless };
  expect(z.object({ a: z.coerce.string().exactOptional() }).parse({}, opts)).toStrictEqual({});
  expect(z.object({ a: z.string().catch("C").exactOptional() }).parse({}, opts)).toStrictEqual({});
  expect(z.object({ a: z.preprocess((v) => v ?? "X", z.string()).exactOptional() }).parse({}, opts)).toStrictEqual({});
  expect(z.object({ a: z.union([z.coerce.string(), z.string().optional()]) }).parse({}, opts)).toStrictEqual({});

  expect(z.object({ a: z.string().default("D").exactOptional() }).parse({}, opts)).toStrictEqual({ a: "D" });
  expect(z.object({ a: z.string().prefault("P").exactOptional() }).parse({}, opts)).toStrictEqual({ a: "P" });
  expect(z.object({ a: z.coerce.string().exactOptional() }).parse({ a: undefined }, opts)).toStrictEqual({
    a: "undefined",
  });
  expect(z.object({ a: z.coerce.string() }).parse({ a: undefined }, opts)).toStrictEqual({ a: "undefined" });
});

test("ladder: an absent tuple slot on the middle rung truncates the tail", () => {
  expect(z.tuple([z.string(), z.coerce.string().exactOptional()]).parse(["x"])).toStrictEqual(["x"]);
  expect(z.tuple([z.string(), z.string().catch("C").exactOptional()]).parse(["x"])).toStrictEqual(["x"]);
  expect(z.tuple([z.string(), z.string().default("D").exactOptional()]).parse(["x"])).toStrictEqual(["x", "D"]);
});

// z.compile() assembles its own output, so the gate has to be mirrored there or compile mode silently keeps the invented value.
test("ladder: compile mode agrees with the interpreted and JIT paths on absent middle-rung slots", () => {
  const objects = [
    [z.object({ a: z.coerce.string().exactOptional() }), {}],
    [z.object({ a: z.string().catch("C").exactOptional() }), {}],
    [z.object({ a: z.string().default("D").exactOptional() }), { a: "D" }],
    [z.object({ a: z.string().catch("C") }), { a: "C" }],
  ] as const;
  for (const [schema, expected] of objects) {
    expect(z.compile(schema).parse({})).toStrictEqual(expected);
    expect(schema.parse({}, { jitless: true })).toStrictEqual(expected);
    expect(schema.parse({})).toStrictEqual(expected);
  }

  const tuples = [
    [z.tuple([z.string(), z.coerce.string().exactOptional()]), ["x"]],
    [z.tuple([z.string(), z.string().default("D").exactOptional()]), ["x", "D"]],
  ] as const;
  for (const [schema, expected] of tuples) {
    expect(z.compile(schema).parse(["x"])).toStrictEqual(expected);
    expect(schema.parse(["x"], { jitless: true })).toStrictEqual(expected);
  }
});

test("ladder: tuple minimum length respects every rung", () => {
  expect(z.tuple([z.string().default("D")]).parse([])).toEqual(["D"]);
  expect(z.tuple([z.string().prefault("P")]).parse([])).toEqual(["P"]);
  expect(z.tuple([z.string().optional()]).parse([])).toEqual([]);
  expect(z.tuple([z.string()]).safeParse([]).success).toBe(false);
  expect(z.tuple([z.string(), z.number().default(1)]).parse(["x"])).toEqual(["x", 1]);
});

test("ladder: the #5941 / #5939 clobber invariants still hold", () => {
  expect(
    z
      .preprocess((v) => v ?? "X", z.string())
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(z.string().catch("X").optional().parse(undefined)).toBeUndefined();
  expect(
    z
      .string()
      .catch("X")
      .transform((s) => `${s}!`)
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(
    z
      .transform(() => "T")
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(
    z
      .union([z.preprocess((v) => v ?? "X", z.string()), z.number()])
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(z.object({ a: z.preprocess((v) => v ?? "X", z.string()) }).parse({})).toEqual({ a: "X" });
});

test("ladder: the top rung survives every wrapper order", () => {
  expect(z.string().default("D").optional().parse(undefined)).toBe("D");
  expect(z.string().default("D").optional().optional().parse(undefined)).toBe("D");
  expect(z.string().default("D").nullable().optional().parse(undefined)).toBe("D");
  expect(z.string().default("D").readonly().optional().parse(undefined)).toBe("D");
  expect(z.string().default("D").catch("C").optional().parse(undefined)).toBe("D");
  expect(z.string().default("D").pipe(z.string()).optional().parse(undefined)).toBe("D");
  expect(
    z
      .union([z.string().default("D"), z.number()])
      .optional()
      .parse(undefined)
  ).toBe("D");
  expect(
    z
      .lazy(() => z.string().default("D"))
      .optional()
      .parse(undefined)
  ).toBe("D");
});

test("ladder: record and catchall paths that read optin", () => {
  expect(z.record(z.string(), z.string().default("D")).parse({ k: undefined })).toEqual({ k: "D" });
  expect(z.object({}).catchall(z.string().default("D")).parse({ x: undefined })).toEqual({ x: "D" });
});

test("ladder: async parity", async () => {
  const a = z
    .string()
    .default("")
    .transform(async (v) => (v ? v.split(",") : []));
  expect((await a.optional().safeParseAsync(undefined)).data).toEqual([]);
  expect((await z.object({ a }).partial().safeParseAsync({})).data).toEqual({ a: [] });
  expect(
    (
      await z
        .preprocess(async (v) => v ?? "X", z.string())
        .optional()
        .safeParseAsync(undefined)
    ).data
  ).toBeUndefined();
});

test("ladder: the rung values themselves", () => {
  expect(z.string()._zod.optin).toBeUndefined();
  expect(z.string().optional()._zod.optin).toBe("optional");
  expect(z.transform(() => 1)._zod.optin).toBe("optional");
  expect(z.string().catch("C")._zod.optin).toBe("optional");
  expect(z.string().default("D")._zod.optin).toBe("defaulted");
  expect(z.string().prefault("P")._zod.optin).toBe("defaulted");
  expect(
    z
      .string()
      .default("D")
      .transform((v) => v)._zod.optin
  ).toBe("defaulted");
  expect(z.string().default("D").optional()._zod.optin).toBe("defaulted");
  expect(z.union([z.string().default("D"), z.number()])._zod.optin).toBe("defaulted");
  expect(z.union([z.string().optional(), z.number()])._zod.optin).toBe("optional");
});

test("exactOptional overrides the values and pattern optional installs", () => {
  expect(z.exactOptional(z.enum(["a", "b"]))._zod.values).toEqual(new Set(["a", "b"]));
  expect(z.exactOptional(z.string().regex(/^abc$/))._zod.pattern).toEqual(/^abc$/);
  expect(z.templateLiteral(["a", z.exactOptional(z.literal("b"))]).safeParse("a").success).toEqual(false);
});

// The override is installed once, on a prototype every instance of the type shares, so it has to hold for instances built after the first.
test("exactOptional's override holds for later instances", () => {
  z.exactOptional(z.enum(["a", "b"]));
  expect(z.exactOptional(z.enum(["c", "d"]))._zod.values).toEqual(new Set(["c", "d"]));
  expect(z.exactOptional(z.string().regex(/^xyz$/))._zod.pattern).toEqual(/^xyz$/);
});
