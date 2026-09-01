import { expect, expectTypeOf, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";

test("validate answers like safeParse.success", () => {
  expect(z.validate(z.string(), "asdf")).toBe(true);
  expect(z.validate(z.string(), 12)).toBe(false);
  expect(z.validate(z.number().int().min(0), 5)).toBe(true);
  expect(z.validate(z.number().int().min(0), -5)).toBe(false);
  const schema = z.object({ a: z.string(), b: z.array(z.number()) });
  expect(z.validate(schema, { a: "x", b: [1, 2] })).toBe(true);
  expect(z.validate(schema, { a: "x", b: [1, "2"] })).toBe(false);
  expect(z.validate(schema, null)).toBe(false);
});

test("validate runs transforms and refinements for the verdict only", () => {
  const schema = z
    .string()
    .transform((s) => s.length)
    .pipe(z.number().max(3));
  expect(z.validate(schema, "ab")).toBe(true);
  expect(z.validate(schema, "abcd")).toBe(false);
  expect(z.validate(z.coerce.number(), "5")).toBe(true);
});

test("validate narrows to the input type", () => {
  const value: unknown = "hi";
  if (z.validate(z.string(), value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
  const transforming = z.string().transform((s) => s.length);
  if (z.validate(transforming, value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
});

test("validate throws on async schemas; validateAsync handles them", async () => {
  const schema = z.string().refine(async (s) => s.length > 2);
  expect(() => z.validate(schema, "asdf")).toThrow();
  await expect(z.validateAsync(schema, "asdf")).resolves.toBe(true);
  await expect(z.validateAsync(schema, "a")).resolves.toBe(false);
  await expect(z.validateAsync(z.string(), "a")).resolves.toBe(true);
  // a promise-returning callback that is not declared async compiles, so the compiled schema must stay off the fast path
  const compiled = z.compile(z.string().refine((s) => Promise.resolve(s.length > 1)));
  await expect(z.validateAsync(compiled, "abc")).resolves.toBe(true);
  await expect(z.validateAsync(compiled, "a")).resolves.toBe(false);
});

test("validate agrees with the compiled fast path and keeps the callback bound", () => {
  let calls = 0;
  const schema = z.object({
    name: z.string().refine((s) => {
      calls++;
      return s.length > 1;
    }),
  });
  const compiled = z.compile(schema);

  calls = 0;
  expect(z.validate(compiled, { name: "ok" })).toBe(true);
  expect(calls).toBe(1);

  calls = 0;
  expect(z.validate(compiled, { name: "x" })).toBe(false);
  // a user callback can throw, so its rejection is not decidable and the fallback still runs
  expect(calls).toBeLessThanOrEqual(2);

  expect(z.validate(compiled, { name: 42 })).toBe(false);
  expect(z.validate(compiled, { name: "x" }, {})).toBe(false);
  expect(z.validate(schema, { name: "ok" })).toBe(true);
});

test("the validate shortcut is taken for callback-free schemas only", () => {
  const definite = (s: z.ZodType) => (z.compile(s, { strict: true }) as any)._zod.bag.validator?.definite;

  // nothing here can throw, so a compiled rejection is proof the runtime would reject
  expect(definite(z.object({ a: z.string().min(1), b: z.number().max(3), c: z.email() }))).toBe(true);
  expect(definite(z.array(z.enum(["a", "b"])))).toBe(true);

  // each of these can answer INVALID for something the interpreter throws on
  expect(definite(z.object({ a: z.string().refine(() => true) }))).toBe(false);
  expect(definite(z.string().transform((v) => v))).toBe(false);
  expect(definite(z.custom(() => true))).toBe(false);
  expect(definite(z.number().catch(0))).toBe(false);
  expect(definite(z.lazy(() => z.string()))).toBe(false);
  expect(
    definite(
      z.intersection(
        z.number(),
        z.number().transform((x) => x + 1)
      )
    )
  ).toBe(false);
  expect(
    definite(
      z.record(
        z.string().transform((k) => k),
        z.number()
      )
    )
  ).toBe(false);
});

test("compiled validate keeps the fallback where INVALID is not a decidable rejection", () => {
  // an intersection answers INVALID for an unmergeable merge, which the interpreter answers with a throw — a fast false would misreport a schema bug
  const unmergeable = z.compile(
    z.intersection(
      z.number(),
      z.number().transform((x) => x + 1)
    ),
    { strict: true }
  );
  expect(() => z.validate(unmergeable, 1234)).toThrow("Unmergable intersection");

  // a when-gated check islands at codegen, and an island answers INVALID for an async run too
  const gated = z.number().refine(() => Promise.resolve(true));
  (gated._zod.def.checks![0]!._zod.def as { when?: unknown }).when = () => true;
  const compiled = z.compile(z.object({ n: gated }), { strict: true });
  expect(() => z.validate(compiled, { n: 3 })).toThrow(z.core.$ZodAsyncError);
  expect(() => z.validate(z.object({ n: gated }), { n: 3 })).toThrow(z.core.$ZodAsyncError);

  // a plain function handing back a promise answers INVALID for union parity, so a transform is never a decidable rejection
  const piped = z.string().transform(() => Promise.resolve(1));
  expect(() => z.validate(z.compile(piped, { strict: true }), "x")).toThrow(z.core.$ZodAsyncError);
  expect(() => z.validate(piped, "x")).toThrow(z.core.$ZodAsyncError);

  // a continuable child issue short-circuits the compiled intersection before its merge, but the interpreter reaches the merge and throws
  const continuable = z.intersection(
    z.number().min(10),
    z.number().transform((x) => x + 1)
  );
  expect(() => z.validate(z.compile(continuable, { strict: true }), 1)).toThrow("Unmergable intersection");
  expect(() => z.validate(continuable, 1)).toThrow("Unmergable intersection");
});

test("compiled validate agrees with the interpreter, verdict and throw alike", () => {
  // guards the `definite` flag: a new generator that answers INVALID for something the interpreter throws on must clear it, or this fails
  const thenable = () => Promise.resolve(1) as never;
  const schemas: z.ZodType[] = [
    z.object({ a: z.string(), b: z.number().min(1) }),
    z.strictObject({ a: z.string() }),
    z.array(z.string().min(1)),
    z.tuple([z.string()], z.number()),
    z.record(z.string(), z.number()),
    // a record key compiles in its own context, so its definiteness has to be carried out
    z.record(z.string().transform(thenable), z.number()),
    z.record(z.email(), z.number()),
    z.union([z.string(), z.number()]),
    z.intersection(
      z.number(),
      z.number().transform((x) => x + 1)
    ),
    z.intersection(
      z.number().min(10),
      z.number().transform((x) => x + 1)
    ),
    // unmergeable with no user callback in it, so only the intersection itself can clear the flag
    z.intersection(z.string().default("a"), z.string().default("b")),
    z.lazy(() => z.object({ a: z.string() })),
    z.number().catch(0),
    z.nonoptional(z.string().optional()),
    z.map(z.string(), z.number()),
    z.set(z.string().min(2)),
    z.templateLiteral(["a", z.number()]),
    z.coerce.number(),
    z.stringbool(),
    z.string().transform(thenable),
    z.union([z.string().transform(thenable), z.number()]),
    z.array(z.string().transform(thenable)),
    z.custom(thenable),
    z.string().refine(thenable),
    z.string().pipe(z.string().min(3)),
    // a codec's decode is the pipe branch's transform, and a plain function can still hand back a promise
    z.codec(z.string(), z.number(), { decode: thenable, encode: String }),
    z.object({ first: z.string(), second: z.codec(z.string(), z.number(), { decode: thenable, encode: String }) }),
    // a user callback can throw, and compiled code can reject an earlier sibling before ever reaching it
    z.object({
      first: z.string(),
      second: z.string().refine(() => {
        throw new RangeError("u");
      }),
    }),
    z.object({
      first: z.string(),
      second: z.custom(() => {
        throw new TypeError("u");
      }),
    }),
    // superRefine and check take the other branch of the refine generator than refine does
    z.object({
      first: z.string(),
      second: z.string().superRefine(() => {
        throw new RangeError("u");
      }),
    }),
    z.string().superRefine(thenable as never),
    z.object({
      first: z.string(),
      second: z.string().transform(() => {
        throw new RangeError("u");
      }),
    }),
    z.object({ first: z.string(), second: z.custom(thenable) }),
    z.tuple([
      z.string(),
      z.number().catch(() => {
        throw new RangeError("u");
      }),
    ]),
  ];
  const inputs = [
    "x",
    "ab",
    "",
    0,
    1,
    Number.NaN,
    true,
    null,
    undefined,
    {},
    { a: "x" },
    { a: 1 },
    [],
    ["x"],
    new Map(),
    new Set(["a"]),
    "true",
    // the exposing shape: an earlier field the compiled path rejects before it reaches the throwing one
    { first: 1, second: "s" },
    { first: "s", second: "s" },
    { first: 1 },
    [1, "x"],
    ["s", "x"],
  ];
  const outcome = (fn: () => unknown) => {
    try {
      return `ok:${fn()}`;
    } catch (err) {
      return `throw:${(err as Error)?.constructor?.name}`;
    }
  };

  for (const schema of schemas) {
    let compiled: z.ZodType;
    try {
      compiled = z.compile(schema, { strict: true });
    } catch {
      continue; // refused at codegen, so there is no fast path to disagree
    }
    for (const input of inputs) {
      expect(
        outcome(() => z.validate(compiled, input)),
        `${JSON.stringify(input)} on ${schema._zod.def.type}`
      ).toBe(outcome(() => z.validate(schema, input)));
    }
  }
});

test("validate is exported from zod/mini", () => {
  expect(zm.validate(zm.string(), "a")).toBe(true);
  expect(zm.validate(zm.string(), 1)).toBe(false);
  expect(zm.validate(zm.object({ a: zm.number() }), { a: 1 })).toBe(true);
});

test("the validate method matches the top-level function", () => {
  expect(z.string().validate("asdf")).toBe(true);
  expect(z.string().validate(12)).toBe(false);
  expect(z.object({ a: z.string() }).validate({ a: "x" })).toBe(true);
  expect(z.object({ a: z.string() }).validate({ a: 1 })).toBe(false);
  expect(z.compile(z.object({ a: z.string() })).validate({ a: "x" })).toBe(true);
});

test("the validate method narrows to the input type", () => {
  const value: unknown = "hi";
  if (z.string().validate(value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
  const transforming = z.string().transform((s) => s.length);
  if (transforming.validate(value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
    expectTypeOf(value).not.toEqualTypeOf<number>();
  }
});

test("the validate method takes a params argument", () => {
  let calls = 0;
  const error = () => {
    calls++;
    return "bad";
  };
  expect(z.string().validate(12, { error })).toBe(false);
  expect(z.string().validate("ok", { error })).toBe(true);
  // a ctx defeats the compiled definite shortcut, so this is the fallback answering
  expect(z.compile(z.string()).validate(12, { error })).toBe(false);
  expect(z.string().validate("ok", { jitless: true })).toBe(true);
  // no issue is ever finalized, so an error map never runs
  expect(calls).toBe(0);
});

test("the validateAsync method handles async schemas the method form throws on", async () => {
  const schema = z.string().refine(async (s) => s.length > 2);
  expect(() => schema.validate("asdf")).toThrow(z.core.$ZodAsyncError);
  await expect(schema.validateAsync("asdf")).resolves.toBe(true);
  await expect(schema.validateAsync("a")).resolves.toBe(false);
  await expect(z.string().validateAsync(12)).resolves.toBe(false);
});

test("zod/mini has no validate method", () => {
  const schema = zm.string();
  expect("parse" in schema).toBe(true);
  expect("validate" in schema).toBe(false);
  expect("validateAsync" in schema).toBe(false);
});

// counts reads of each child slot, so a stopped walk is observable without putting a callback in the schema — a refinement spy would work too, but reading the input says nothing about what ran
function counted(
  slots: Record<string, unknown>,
  bad: Record<string, unknown> = {}
): [Record<string, unknown>, () => number] {
  let reads = 0;
  const obj: Record<string, unknown> = { ...bad };
  for (const [k, v] of Object.entries(slots)) {
    Object.defineProperty(obj, k, {
      enumerable: true,
      get() {
        reads++;
        return v;
      },
    });
  }
  return [obj, () => reads];
}

test("validate stops a container at its first aborting issue", () => {
  const shape = { a: z.number(), b: z.string(), c: z.string() };

  for (const jitless of [false, true]) {
    const label = jitless ? "interpreted" : "compiled";
    const [input, reads] = counted({ b: "x", c: "x" }, { a: "no" });
    expect(z.validate(z.object(shape), input, { jitless }), label).toBe(false);
    expect(reads(), `${label}: keys read after the first abort`).toBe(0);

    const [ok, okReads] = counted({ b: "x", c: "x" }, { a: 1 });
    expect(z.validate(z.object(shape), ok, { jitless }), label).toBe(true);
    expect(okReads(), `${label}: a valid parse still reads every key`).toBe(2);
  }

  // an array stops at the first bad element
  const arr: unknown[] = [1];
  let elementReads = 0;
  for (const i of [1, 2]) {
    Object.defineProperty(arr, i, {
      enumerable: true,
      get() {
        elementReads++;
        return "x";
      },
    });
  }
  expect(z.validate(z.array(z.string()), arr)).toBe(false);
  expect(elementReads, "elements read after the first abort").toBe(0);

  // the shape phase's abort carries across into the catchall
  const [co, coReads] = counted({ b: "x" }, { a: "no" });
  expect(z.validate(z.object({ a: z.number() }).catchall(z.string()), co)).toBe(false);
  expect(coReads(), "catchall keys read after the shape aborted").toBe(0);

  // and a tuple's fixed items carry into its rest
  const tup: unknown[] = ["no"];
  let restReads = 0;
  for (const i of [1, 2]) {
    Object.defineProperty(tup, i, {
      enumerable: true,
      get() {
        restReads++;
        return "x";
      },
    });
  }
  expect(z.validate(z.tuple([z.number()], z.string()), tup)).toBe(false);
  expect(restReads, "rest elements read after a fixed item aborted").toBe(0);
});

test("a default provider runs only when the key is absent", () => {
  const boom = (): never => {
    throw new RangeError("boom");
  };
  // the provider sits behind an accessor, so reading the def would call it
  for (const [name, schema] of [
    ["default", z.object({ a: z.number(), b: z.string().default(boom as any) })],
    ["prefault", z.object({ a: z.number(), b: z.string().prefault(boom as any) })],
  ] as const) {
    expect(z.validate(schema, { a: "bad", b: "ok" }), name).toBe(false);
    expect(z.validate(schema, { a: 1, b: "ok" }), name).toBe(true);
  }
  // absent, the provider does run, and its throw is the parse's own
  expect(() => z.validate(z.object({ b: z.string().default(boom as any) }), {})).toThrow(RangeError);
});

test("the first failure stops the walk whatever follows it", () => {
  // a sibling after the failure is never parsed, so its refinement never runs
  let calls = 0;
  const spy = z.string().refine(() => {
    calls++;
    return true;
  });
  expect(z.validate(z.object({ a: z.number(), b: spy, c: spy }), { a: "no", b: "x", c: "x" })).toBe(false);
  expect(calls).toBe(0);

  // reads of the trailing key say whether the walk stopped, without putting a callback in the schema
  const skips = (b: z.ZodType, value: unknown = "x") => {
    let reads = 0;
    const input: Record<string, unknown> = { a: "no" };
    Object.defineProperty(input, "b", {
      enumerable: true,
      get() {
        reads++;
        return value;
      },
    });
    z.validate(z.object({ a: z.number(), b }), input);
    return reads === 0;
  };

  // the trailing key is skipped no matter what it holds -- user code included, since it is never reached
  for (const [name, b, value] of [
    ["plain", z.string(), "x"],
    ["min", z.string().min(2), "x"],
    ["email", z.email(), "x"],
    ["array", z.array(z.string().min(2)), ["ab"]],
    ["error map", z.string({ error: () => "nope" }), "x"],
    ["transform", z.string().transform((v) => v), "x"],
    ["refine", z.string().refine(() => true), "x"],
    ["custom", z.custom(() => true), "x"],
    ["catch", z.string().catch("x"), "x"],
    ["lazy", z.lazy(() => z.string()), "x"],
    ["coerce", z.coerce.number(), 1],
  ] as [string, z.ZodType, unknown][]) {
    expect(skips(b, value), name).toBe(true);
  }
});

test("a continuable issue never stops the walk", () => {
  // .min() is continuable, so a surrounding schema can still reconcile it and the guard must not stop
  let calls = 0;
  const el = z
    .string()
    .min(5)
    .refine(() => {
      calls++;
      return true;
    });
  expect(z.validate(z.array(el), ["a", "b", "c"])).toBe(false);
  expect(calls).toBe(3);
});

test("z.record keeps walking under validate", () => {
  // deliberate asymmetry: a record's invalid_key aborts, but an enclosing intersection reconciles it against the sibling operand, so a stopped loop hides keys the sibling does not own
  let reads = 0;
  const input: Record<string, unknown> = { a: 1 };
  for (const k of ["b", "c"]) {
    Object.defineProperty(input, k, {
      enumerable: true,
      get() {
        reads++;
        return "x";
      },
    });
  }
  expect(z.validate(z.record(z.string(), z.string()), input)).toBe(false);
  expect(reads).toBe(2);
});

test("validate matches safeParse where an issue can still be reconciled away", async () => {
  const recA = z.record(z.string().regex(/^a/), z.any());
  const recB = z.record(z.string().regex(/^b/), z.any());
  const schemas: z.ZodType[] = [
    z.intersection(recA, recB),
    z.intersection(recA.pipe(z.any()), recB.pipe(z.any())),
    z.intersection(z.strictObject({ a: z.string() }), z.strictObject({ b: z.number() })),
    z.intersection(z.array(z.string()), z.array(z.string().min(2))),
    z.strictObject({ a: z.string() }).pipe(z.any()),
    z.union([z.strictObject({ a: z.string() }), z.strictObject({ a: z.string(), b: z.number() })]),
    z.array(z.string()).catch([]),
    z.object({ a: z.string() }).optional(),
  ];
  const inputs: unknown[] = [
    { a1: 1, b1: 2 },
    { a1: 1, b1: 2, zz: 3 },
    { a1: 1, zz: 2, b1: 3, yy: 4 },
    { b1: 1, a1: 2, zz: 3, yy: 4 },
    { a: "x", b: 1 },
    { a: "x", b: 1, c: 9 },
    { a: "x" },
    ["ab", "cd"],
    ["a", "b"],
    undefined,
  ];

  const outcome = (fn: () => unknown) => {
    try {
      return `ok:${fn()}`;
    } catch (err) {
      return `throw:${(err as Error)?.constructor?.name}`;
    }
  };
  const outcomeAsync = async (fn: () => Promise<unknown>) => {
    try {
      return `ok:${await fn()}`;
    } catch (err) {
      return `throw:${(err as Error)?.constructor?.name}`;
    }
  };

  for (const schema of schemas) {
    for (const input of inputs) {
      const label = `${schema._zod.def.type} on ${JSON.stringify(input)}`;
      expect(
        outcome(() => z.validate(schema, input)),
        label
      ).toBe(outcome(() => schema.safeParse(input).success));
      expect(await outcomeAsync(() => z.validateAsync(schema, input)), label).toBe(
        await outcomeAsync(async () => (await schema.safeParseAsync(input)).success)
      );
    }
  }
});

test("abortEarly does not leak into safeParse", () => {
  const schema = z.object({ a: z.string(), b: z.string(), c: z.string() });
  expect(schema.safeParse({ a: 1, b: 2, c: 3 }).error!.issues).toHaveLength(3);
  expect(z.validate(schema, { a: 1, b: 2, c: 3 })).toBe(false);
  expect(schema.safeParse({ a: 1, b: 2, c: 3 }).error!.issues).toHaveLength(3);
});

test("a callback after the first failure never runs, so validate answers where safeParse throws", () => {
  const boom = (): never => {
    throw new RangeError("boom");
  };
  // the deliberate divergence, in every shape that can carry a callback: an earlier sibling settles the boolean, so the later throw is never reached
  const lateSym = Symbol("late");
  const cases: [string, z.ZodType, unknown][] = [
    ["object transform", z.object({ a: z.number(), b: z.string().transform(boom) }), { a: "bad", b: "ok" }],
    ["object refine", z.object({ a: z.number(), b: z.string().refine(boom) }), { a: "bad", b: "ok" }],
    ["object custom", z.object({ a: z.number(), b: z.custom(boom) }), { a: "bad", b: "ok" }],
    // these three hang the callback off `_zod.check` rather than the def
    ["object check", z.object({ a: z.number(), b: z.string().check(boom) }), { a: "bad", b: "ok" }],
    ["object superRefine", z.object({ a: z.number(), b: z.string().superRefine(boom) }), { a: "bad", b: "ok" }],
    ["object overwrite", z.object({ a: z.number(), b: z.string().overwrite(boom as any) }), { a: "bad", b: "ok" }],
    // the input must carry the same symbol with a value the field accepts, or the transform never runs and the row asserts nothing
    [
      "symbol key",
      z.object({ a: z.number(), [lateSym]: z.string().transform(boom) } as any),
      { a: "bad", [lateSym]: "ok" },
    ],
    ["object catch", z.object({ a: z.number(), b: z.string().catch(boom) }), { a: "bad", b: 1 }],
    ["object lazy", z.object({ a: z.number(), b: z.lazy(() => z.string().transform(boom)) }), { a: "bad", b: "ok" }],
    ["array", z.array(z.union([z.number(), z.string().transform(boom)])), [true, "throws"]],
    ["tuple rest", z.tuple([z.number()], z.string().transform(boom)), ["bad", "throws"]],
    ["catchall", z.object({ a: z.number() }).catchall(z.string().transform(boom)), { a: "bad", b: "ok" }],
    ["set", z.set(z.union([z.number(), z.string().transform(boom)])), new Set([true, "throws"])],
    [
      "map",
      z.map(z.string(), z.union([z.number(), z.string().transform(boom)])),
      new Map<any, any>([
        [1, 0],
        ["k", "throws"],
      ]),
    ],
  ];

  const outcome = (fn: () => unknown) => {
    try {
      return `ok:${fn()}`;
    } catch (err) {
      return `throw:${(err as Error)?.constructor?.name}`;
    }
  };

  for (const [name, schema, input] of cases) {
    // safeParse walks the whole tree and reaches the throw; validate settled the answer at the earlier sibling and never runs it
    expect(
      outcome(() => schema.safeParse(input).success),
      `${name}: safeParse`
    ).toBe("throw:RangeError");
    expect(
      outcome(() => z.validate(schema, input)),
      `${name}: validate`
    ).toBe("ok:false");
  }
});

test("the stop lands between children, not inside one", () => {
  const boom = (): never => {
    throw new RangeError("boom");
  };
  // both parse as a unit, so an abort in one half cannot skip the other; stopping inside either risks a discarded issue turning a false into a true
  const pairs: [string, z.ZodType, unknown][] = [
    ["map entry", z.map(z.number(), z.string().transform(boom)), new Map([["bad", "ok"]])],
    ["tuple fixed item", z.tuple([z.number(), z.string().transform(boom)]), ["bad", "ok"]],
  ];
  for (const [name, schema, input] of pairs) {
    expect(() => z.validate(schema, input), name).toThrow(RangeError);
    expect(() => schema.safeParse(input), `${name}: safeParse agrees`).toThrow(RangeError);
  }

  // between children, the stop does happen
  expect(z.validate(z.object({ a: z.number(), b: z.string().transform(boom) }), { a: "bad", b: "ok" })).toBe(false);
  expect(z.validate(z.array(z.union([z.number(), z.string().transform(boom)])), [true, "ok"])).toBe(false);
});

test("validate rethrows a callback it actually reaches", () => {
  const boom = (): never => {
    throw new RangeError("boom");
  };
  // nothing rejects before the callback, so validate reaches it and the throw is the caller's
  const cases: [string, z.ZodType, unknown][] = [
    ["transform", z.object({ a: z.string().transform(boom), b: z.number() }), { a: "ok", b: "bad" }],
    ["refine", z.object({ a: z.string().refine(boom), b: z.number() }), { a: "ok", b: "bad" }],
    ["check", z.object({ a: z.string().check(boom), b: z.number() }), { a: "ok", b: "bad" }],
    ["array element", z.array(z.string().transform(boom)), ["ok", "ok"]],
    ["catchall", z.object({}).catchall(z.string().transform(boom)), { a: "ok" }],
    ["set", z.set(z.string().transform(boom)), new Set(["ok"])],
    ["map", z.map(z.string(), z.string().transform(boom)), new Map([["k", "ok"]])],
    ["tuple rest", z.tuple([z.string()], z.string().transform(boom)), ["ok", "ok"]],
  ];
  for (const [name, schema, input] of cases) {
    expect(() => z.validate(schema, input), name).toThrow(RangeError);
  }
});
