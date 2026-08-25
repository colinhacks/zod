import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test("basic catch", () => {
  expect(z.string().catch("default").parse(undefined)).toBe("default");
});

test("catch fn does not run when parsing succeeds", () => {
  let isCalled = false;
  const cb = () => {
    isCalled = true;
    return "asdf";
  };
  expect(z.string().catch(cb).parse("test")).toBe("test");
  expect(isCalled).toEqual(false);
});

test("basic catch async", async () => {
  const result = await z.string().catch("default").parseAsync(1243);
  expect(result).toBe("default");
});

test("catch replace wrong types", () => {
  expect(z.string().catch("default").parse(true)).toBe("default");
  expect(z.string().catch("default").parse(true)).toBe("default");
  expect(z.string().catch("default").parse(15)).toBe("default");
  expect(z.string().catch("default").parse([])).toBe("default");
  expect(z.string().catch("default").parse(new Map())).toBe("default");
  expect(z.string().catch("default").parse(new Set())).toBe("default");
  expect(z.string().catch("default").parse({})).toBe("default");
});

test("catch with transform", () => {
  const stringWithDefault = z
    .string()
    .transform((val) => val.toUpperCase())
    .catch("default");

  expect(stringWithDefault.parse(undefined)).toBe("default");
  expect(stringWithDefault.parse(15)).toBe("default");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault.unwrap()).toBeInstanceOf(z.ZodPipe);
  expect(stringWithDefault.unwrap().in).toBeInstanceOf(z.ZodString);
  expect(stringWithDefault.unwrap().out).toBeInstanceOf(z.ZodTransform);

  type inp = z.input<typeof stringWithDefault>;
  expectTypeOf<inp>().toEqualTypeOf<string>();
  type out = z.output<typeof stringWithDefault>;
  expectTypeOf<out>().toEqualTypeOf<string>();
});

test("catch on existing optional", () => {
  const stringWithDefault = z.string().optional().catch("asdf");
  expect(stringWithDefault.parse(undefined)).toBe(undefined);
  expect(stringWithDefault.parse(15)).toBe("asdf");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault.unwrap().unwrap()).toBeInstanceOf(z.ZodString);

  type inp = z.input<typeof stringWithDefault>;
  expectTypeOf<inp>().toEqualTypeOf<string | undefined>();
  type out = z.output<typeof stringWithDefault>;
  expectTypeOf<out>().toEqualTypeOf<string | undefined>();
});

test("optional on catch", () => {
  const stringWithDefault = z.string().catch("asdf").optional();

  type inp = z.input<typeof stringWithDefault>;
  expectTypeOf<inp>().toEqualTypeOf<string | undefined>();
  type out = z.output<typeof stringWithDefault>;
  expectTypeOf<out>().toEqualTypeOf<string | undefined>();
});

test("complex chain example", () => {
  const complex = z
    .string()
    .catch("asdf")
    .transform((val) => `${val}!`)
    .transform((val) => val.toUpperCase())
    .catch("qwer")
    .unwrap()
    .optional()
    .catch("asdfasdf");

  expect(complex.parse("qwer")).toBe("QWER!");
  expect(complex.parse(15)).toBe("ASDF!");
  expect(complex.parse(true)).toBe("ASDF!");
});

test("removeCatch", () => {
  const stringWithRemovedDefault = z.string().catch("asdf").unwrap();

  type out = z.output<typeof stringWithRemovedDefault>;
  expectTypeOf<out>().toEqualTypeOf<string>();
});

test("nested", () => {
  const inner = z.string().catch("asdf");
  const outer = z.object({ inner }).catch({
    inner: "asdf",
  });
  type input = z.input<typeof outer>;
  expectTypeOf<input>().toEqualTypeOf<{ inner: string }>();
  type out = z.output<typeof outer>;

  expectTypeOf<out>().toEqualTypeOf<{ inner: string }>();
  expect(outer.parse(undefined)).toEqual({ inner: "asdf" });
  expect(outer.parse({})).toEqual({ inner: "asdf" });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: "asdf" });
});

test("chained catch", () => {
  const stringWithDefault = z.string().catch("inner").catch("outer");
  const result = stringWithDefault.parse(undefined);
  expect(result).toEqual("inner");
  const resultDiff = stringWithDefault.parse(5);
  expect(resultDiff).toEqual("inner");
});

test("native enum", () => {
  enum Fruits {
    apple = "apple",
    orange = "orange",
  }

  const schema = z.object({
    fruit: z.nativeEnum(Fruits).catch(Fruits.apple),
  });

  // Absent keys flow through to the catch handler.
  expect(schema.parse({})).toEqual({ fruit: Fruits.apple });
  expect(schema.parse({}, { jitless: true })).toEqual({ fruit: Fruits.apple });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: Fruits.apple });
});

test("enum", () => {
  const schema = z.object({
    fruit: z.enum(["apple", "orange"]).catch("apple"),
  });

  expect(schema.parse({})).toEqual({ fruit: "apple" });
  expect(schema.parse({}, { jitless: true })).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: true })).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: "apple" });
});

test("reported issues with nested usage", () => {
  const schema = z.object({
    string: z.string(),
    obj: z.object({
      sub: z.object({
        lit: z.literal("a"),
        subCatch: z.number().catch(23),
      }),
      midCatch: z.number().catch(42),
    }),
    number: z.number().catch(0),
    bool: z.boolean(),
  });

  try {
    schema.parse({
      string: {},
      obj: {
        sub: {
          lit: "b",
          subCatch: "24",
        },
        midCatch: 444,
      },
      number: "",
      bool: "yes",
    });
  } catch (error) {
    const issues = (error as z.ZodError).issues;

    expect(issues.length).toEqual(3);
    expect(issues).toMatchInlineSnapshot(`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "message": "Invalid input: expected string, received object",
          "path": [
            "string",
          ],
        },
        {
          "code": "invalid_value",
          "message": "Invalid input: expected "a"",
          "path": [
            "obj",
            "sub",
            "lit",
          ],
          "values": [
            "a",
          ],
        },
        {
          "code": "invalid_type",
          "expected": "boolean",
          "message": "Invalid input: expected boolean, received string",
          "path": [
            "bool",
          ],
        },
      ]
    `);
    // expect(issues[0].message).toMatch("string");
    // expect(issues[1].message).toMatch("literal");
    // expect(issues[2].message).toMatch("boolean");
  }
});

test("catch error", () => {
  const schema = z.object({
    age: z.number(),
    name: z.string().catch((ctx) => {
      ctx.issues;
      // issues = ctx.issues;

      return "John Doe";
    }),
  });

  const result = schema.safeParse({
    age: null,
    name: null,
  });

  expect(result.success).toEqual(false);
  expect(result.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "number",
        "code": "invalid_type",
        "path": [
          "age"
        ],
        "message": "Invalid input: expected number, received null"
      }
    ]]
  `);
});

test("ctx.input", () => {
  const schema = z.string().catch((ctx) => {
    return String(ctx.input);
  });

  expect(schema.parse(123)).toEqual("123");
});

test("ctx.value is the input to the catch, not what the inner schema made of it", async () => {
  const seen: unknown[] = [];
  const cb = (ctx: z.core.$ZodCatchCtx) => {
    seen.push(ctx.value, ctx.input);
    return -1;
  };

  expect(z.coerce.number().min(10).catch(cb).parse("5")).toBe(-1);
  expect(
    await z.coerce
      .number()
      .refine(async (n) => n >= 10)
      .catch(cb)
      .parseAsync("6")
  ).toBe(-1);
  expect(
    z
      .string()
      .transform((s) => s.length)
      .refine((n) => n > 10)
      .catch(cb)
      .parse("abc")
  ).toBe(-1);

  expect(seen).toEqual(["5", "5", "6", "6", "abc", "abc"]);
});

test("ctx.issues outlives the callback", () => {
  let stashed!: z.core.$ZodRawIssue[];
  z.string()
    .min(10)
    .catch((ctx) => {
      stashed = ctx.issues;
      return "fallback";
    })
    .parse("hi");

  expect(stashed).toHaveLength(1);
  expect(stashed[0].code).toBe("too_small");
});

test("catch ctx carries the rest of the payload through", () => {
  let seen!: z.core.$ZodCatchCtx;
  z.string()
    .min(10)
    .pipe(z.string())
    .catch((ctx) => {
      seen = ctx;
      return "fallback";
    })
    .parse("hi");

  expect(seen.aborted).toBe(true);
});

test("catch does not swallow an issue it did not cause", () => {
  // A pipe hands its `out` schema the caller's issues array so an unrecognized key can survive to an enclosing intersection. The catch must not read that as its own inner failing.
  const result = z.strictObject({ a: z.string() }).pipe(z.any().catch("CAUGHT")).safeParse({ a: "x", extra: 1 });

  expect(result.success).toBe(false);
  expect(result.error!.issues.map((i) => i.code)).toEqual(["unrecognized_keys"]);
});

test("catch does not break intersection reconciliation", () => {
  // Forwarding the unrecognized key is what lets the intersection reconcile it. A catch that fired on it substituted its fallback into one side, and the merge threw out of safeParse.
  const schema = z.intersection(
    z.strictObject({ a: z.string() }).pipe(z.any().catch("CAUGHT")),
    z.strictObject({ b: z.string() })
  );

  expect(schema.parse({ a: "x", b: "y" })).toEqual({ a: "x", b: "y" });
});

test("catch propagates a back-edge to whatever wraps it", () => {
  // The memoizer marks a payload whose value is a node still being parsed. That mark has to survive the catch: an enclosing readonly must not freeze a half-built object, and the node's checks belong to the node itself rather than to the back-edge.
  const Node: any = z.object({
    get self() {
      return z
        .lazy(() => Node)
        .catch(null)
        .readonly()
        .optional();
    },
  });
  const cyclic: any = {};
  cyclic.self = cyclic;
  const frozen = Node.safeParse(cyclic);
  expect(frozen.success).toBe(true);
  expect(Object.keys(frozen.data)).toEqual(["self"]);

  let checks = 0;
  const Checked: any = z.object({
    get self() {
      return z
        .lazy(() => Checked)
        .catch(null)
        .refine(() => {
          checks++;
          return true;
        })
        .optional();
    },
  });
  const cyclic2: any = {};
  cyclic2.self = cyclic2;
  Checked.safeParse(cyclic2);
  expect(checks).toBe(0);
});

test("a catch that fires does not rescue an issue from outside it", () => {
  // The callback still runs and still computes its fallback — the inner schema really did fail. What it cannot do is answer for the unrecognized key the pipe forwarded past it, so the parse fails anyway.
  let fired = 0;
  const result = z
    .strictObject({ a: z.string() })
    .pipe(
      z
        .object({ a: z.string() })
        .refine(() => false)
        .catch(() => {
          fired++;
          return { a: "FALLBACK" };
        })
    )
    .safeParse({ a: "x", extra: 1 });

  expect(fired).toBe(1);
  expect(result.success).toBe(false);
  expect(result.error!.issues.map((i) => i.code)).toEqual(["unrecognized_keys"]);
});

test("direction-aware catch", () => {
  const schema = z.string().catch("fallback");

  // Forward direction (regular parse): catch should be applied
  expect(schema.parse(123)).toBe("fallback");

  // Reverse direction (encode): catch should NOT be applied, invalid value should fail validation
  expect(z.safeEncode(schema, 123 as any)).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [],
        "message": "Invalid input: expected string, received number"
      }
    ]],
      "success": false,
    }
  `);

  // But valid values should still work in reverse
  expect(z.encode(schema, "world")).toBe("world");
});

test("optional clobbers catch through pipe boundaries", () => {
  expect(
    z
      .string()
      .catch("X")
      .transform((s) => s + "!")
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(z.string().catch("X").pipe(z.string()).optional().parse(undefined)).toBeUndefined();
  expect(
    z
      .string()
      .catch("X")
      .transform((s) => s + "!")
      .transform((s) => s.toLowerCase())
      .optional()
      .parse(undefined)
  ).toBeUndefined();
  expect(
    z
      .object({
        a: z
          .string()
          .catch("X")
          .transform((s) => s + "!")
          .optional(),
      })
      .parse({})
  ).toEqual({});

  expect(
    z
      .string()
      .catch("X")
      .transform((s) => s + "!")
      .parse("hi")
  ).toBe("hi!");
  expect(
    z
      .string()
      .catch("X")
      .transform((s) => s + "!")
      .parse(123)
  ).toBe("X!");
});

test("catch does not resurrect issues an inner optional already resolved", () => {
  // `.catch()` reads issues off the payload it passed down, so an optional that resolved a failure without clearing that array let the failure resurface. The pipe rows matter: a pipe shares the array with a different payload object.
  const chains: [string, () => z.ZodType][] = [
    [
      "prefault.optional",
      () =>
        z
          .undefined()
          .prefault(null as any)
          .optional(),
    ],
    [
      "default.optional",
      () =>
        z
          .undefined()
          .default(null as any)
          .optional(),
    ],
    ["prefault.pipe.optional", () => z.string().prefault("abc").pipe(z.string().min(10)).optional()],
    ["default.pipe.optional", () => z.string().default("abc").pipe(z.string().min(10)).optional()],
    [
      "prefault.optional.optional",
      () =>
        z
          .undefined()
          .prefault(null as any)
          .optional()
          .optional(),
    ],
    [
      "prefault.pipe.optional.optional",
      () => z.string().prefault("abc").pipe(z.string().min(10)).optional().optional(),
    ],
  ];

  for (const [name, make] of chains) {
    expect(make().safeParse(undefined).success, `${name} without catch`).toBe(true);
    expect((make() as any).catch(null).safeParse(undefined).success, `${name} + catch(value)`).toBe(true);
    expect((make() as any).catch(() => null).safeParse(undefined).success, `${name} + catch(callback)`).toBe(true);
  }

  expect(
    z
      .object({
        a: z
          .undefined()
          .prefault(null as any)
          .optional()
          .catch(null as any),
      })
      .safeParse({ a: undefined }).success
  ).toBe(true);

  expect(z.string().catch("FB").parse(123)).toBe("FB");
  expect(z.string().optional().safeParse(123).success).toBe(false);
});

test("resolving an optional's failure clears the abort flag with it", () => {
  // A pipe marks the payload aborted when its `in` fails, and `util.aborted` tests that flag alone, so leaving it set skips every check after the optional.
  const schema = z
    .string()
    .min(10)
    .prefault("abc")
    .pipe(z.string())
    .optional()
    .refine(() => false, "REFINE RAN");

  const result = schema.safeParse(undefined);
  expect(result.success).toBe(false);
  expect(result.error!.issues[0]?.message).toBe("REFINE RAN");
});

test("catch clears the abort flag along with the issues", () => {
  // Same as the optional case one wrapper over: a catch that clears only the issues leaves the flag set, skipping every check after it.
  const schema = z
    .string()
    .min(10)
    .pipe(z.string())
    .catch("FB")
    .refine(() => false, "REFINE RAN");

  const result = schema.safeParse("abc");
  expect(result.success).toBe(false);
  expect(result.error!.issues[0]?.message).toBe("REFINE RAN");

  expect(
    z
      .string()
      .min(2)
      .pipe(z.string())
      .catch("FB")
      .refine(() => false, "REFINE RAN")
      .safeParse("abcdef").success
  ).toBe(false);
  expect(
    z
      .string()
      .min(10)
      .catch("FB")
      .refine(() => false, "REFINE RAN")
      .safeParse("abc").success
  ).toBe(false);
});

test("catch clears the abort flag on the async branch too", () => {
  // Reaching the async branch needs the catch's own inner to be async; an async refinement outside it leaves the inner sync.
  const schema = z
    .string()
    .refine(async () => false, "INNER")
    .pipe(z.string())
    .catch("FB")
    .refine(() => false, "REFINE RAN");

  return expect(schema.safeParseAsync("abc")).resolves.toMatchObject({
    success: false,
    error: { issues: [{ message: "REFINE RAN" }] },
  });
});

test("catch resolves the issues array itself, so an outer catch does not resurrect them", () => {
  // A pipe runs its `out` on a payload sharing the caller's issues array, so a catch that rebinds its own reference leaves the caller's copy dirty.
  const inner = z.string().pipe(z.string().min(10).catch("FB"));

  expect(inner.safeParse("abc")).toMatchObject({ success: true, data: "FB" });
  expect(inner.catch("FB2").safeParse("abc")).toMatchObject({ success: true, data: "FB" });

  expect(z.string().catch("FB").parse(123)).toBe("FB");
  expect(z.string().catch("FB").parse("ok")).toBe("ok");
  expect(
    z
      .string()
      .catch((ctx) => `n=${ctx.error.issues.length}`)
      .parse(123)
  ).toBe("n=1");
});

test("catch resolves the issues array on the async branch too", () => {
  const inner = z.string().pipe(
    z
      .string()
      .refine(async () => false, "INNER")
      .catch("FB")
  );

  return expect(inner.catch("FB2").safeParseAsync("abc")).resolves.toMatchObject({ success: true, data: "FB" });
});
