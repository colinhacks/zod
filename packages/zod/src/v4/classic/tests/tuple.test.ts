import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("successful validation", () => {
  const testTuple = z.tuple([z.string(), z.number()]);
  expectTypeOf<typeof testTuple._output>().toEqualTypeOf<[string, number]>();

  const val = testTuple.parse(["asdf", 1234]);
  expect(val).toEqual(val);

  const r1 = testTuple.safeParse(["asdf", "asdf"]);
  expect(r1.success).toEqual(false);
  expect(r1.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "number",
        "code": "invalid_type",
        "path": [
          1
        ],
        "message": "Invalid input: expected number, received string"
      }
    ]]
  `);

  const r2 = testTuple.safeParse(["asdf", 1234, true]);
  expect(r2.success).toEqual(false);
  expect(r2.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "too_big",
        "maximum": 2,
        "inclusive": true,
        "origin": "array",
        "path": [],
        "message": "Too big: expected array to have <=2 items"
      }
    ]]
  `);

  const r3 = testTuple.safeParse({});
  expect(r3.success).toEqual(false);
  expect(r3.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "tuple",
        "code": "invalid_type",
        "path": [],
        "message": "Invalid input: expected tuple, received object"
      }
    ]]
  `);
});

test("async validation", async () => {
  const testTuple = z
    .tuple([z.string().refine(async () => true), z.number().refine(async () => true)])
    .refine(async () => true);
  expectTypeOf<typeof testTuple._output>().toEqualTypeOf<[string, number]>();

  const val = await testTuple.parseAsync(["asdf", 1234]);
  expect(val).toEqual(val);

  const r1 = await testTuple.safeParseAsync(["asdf", "asdf"]);
  expect(r1.success).toEqual(false);
  expect(r1.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "number",
        "code": "invalid_type",
        "path": [
          1
        ],
        "message": "Invalid input: expected number, received string"
      }
    ]]
  `);

  const r2 = await testTuple.safeParseAsync(["asdf", 1234, true]);
  expect(r2.success).toEqual(false);
  expect(r2.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "too_big",
        "maximum": 2,
        "inclusive": true,
        "origin": "array",
        "path": [],
        "message": "Too big: expected array to have <=2 items"
      }
    ]]
  `);

  const r3 = await testTuple.safeParseAsync({});
  expect(r3.success).toEqual(false);
  expect(r3.error!).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "tuple",
        "code": "invalid_type",
        "path": [],
        "message": "Invalid input: expected tuple, received object"
      }
    ]]
  `);
});

test("tuple with optional elements", () => {
  const myTuple = z.tuple([z.string(), z.number().optional(), z.string().optional()]).rest(z.boolean());
  expectTypeOf<typeof myTuple._output>().toEqualTypeOf<
    [string, (number | undefined)?, (string | undefined)?, ...boolean[]]
  >();

  const goodData = [["asdf"], ["asdf", 1234], ["asdf", 1234, "asdf"], ["asdf", 1234, "asdf", true, false, true]];
  for (const data of goodData) {
    expect(myTuple.parse(data)).toEqual(data);
  }

  const badData = [
    ["asdf", "asdf"],
    ["asdf", 1234, "asdf", "asdf"],
    ["asdf", 1234, "asdf", true, false, "asdf"],
  ];
  for (const data of badData) {
    expect(() => myTuple.parse(data)).toThrow();
  }
});

test("tuple with optional elements followed by required", () => {
  const myTuple = z.tuple([z.string(), z.number().optional(), z.string()]).rest(z.boolean());
  expectTypeOf<typeof myTuple._output>().toEqualTypeOf<[string, number | undefined, string, ...boolean[]]>();

  const goodData = [
    ["asdf", 1234, "asdf"],
    ["asdf", 1234, "asdf", true, false, true],
  ];
  for (const data of goodData) {
    expect(myTuple.parse(data)).toEqual(data);
  }

  const badData = [
    ["asdf"],
    ["asdf", 1234],
    ["asdf", 1234, "asdf", "asdf"],
    ["asdf", 1234, "asdf", true, false, "asdf"],
  ];
  for (const data of badData) {
    expect(() => myTuple.parse(data)).toThrow();
  }
});

test("tuple with all optional elements", () => {
  const allOptionalTuple = z.tuple([z.string().optional(), z.number().optional(), z.boolean().optional()]);
  expectTypeOf<typeof allOptionalTuple._output>().toEqualTypeOf<
    [(string | undefined)?, (number | undefined)?, (boolean | undefined)?]
  >();

  // Empty array should be valid (all items optional)
  expect(allOptionalTuple.parse([])).toEqual([]);

  // Partial arrays should be valid
  expect(allOptionalTuple.parse(["hello"])).toEqual(["hello"]);
  expect(allOptionalTuple.parse(["hello", 42])).toEqual(["hello", 42]);

  // Full array should be valid
  expect(allOptionalTuple.parse(["hello", 42, true])).toEqual(["hello", 42, true]);

  // Array that's too long should fail
  expect(() => allOptionalTuple.parse(["hello", 42, true, "extra"])).toThrow();
});

test("tuple fills defaults for missing trailing elements", () => {
  // Issue #5229: trailing `.default()`/`.prefault()` elements should be
  // filled in when the input array is shorter than the tuple.
  const t = z.tuple([z.string(), z.string().default("bravo")]);
  expectTypeOf<typeof t._output>().toEqualTypeOf<[string, string]>();
  expectTypeOf<typeof t._input>().toEqualTypeOf<[string, (string | undefined)?]>();

  expect(t.parse(["alpha", "charlie"])).toEqual(["alpha", "charlie"]);
  expect(t.parse(["alpha"])).toEqual(["alpha", "bravo"]);

  // Multiple trailing defaults
  const multi = z.tuple([z.string(), z.number().default(42), z.boolean().default(true)]);
  expect(multi.parse(["hello"])).toEqual(["hello", 42, true]);
  expect(multi.parse(["hello", 100])).toEqual(["hello", 100, true]);
  expect(multi.parse(["hello", 100, false])).toEqual(["hello", 100, false]);

  // Prefault parity
  expect(z.tuple([z.string(), z.string().prefault("delta")]).parse(["alpha"])).toEqual(["alpha", "delta"]);

  // Defaults wrapped in modifiers: `optout` propagates through these, so the
  // fix is not type-name specific.
  expect(z.tuple([z.string(), z.string().default("x").nullable()]).parse(["alpha"])).toEqual(["alpha", "x"]);
  expect(z.tuple([z.string(), z.string().default("x").readonly()]).parse(["alpha"])).toEqual(["alpha", "x"]);
  expect(z.tuple([z.string(), z.string().default("x").catch("y")]).parse(["alpha"])).toEqual(["alpha", "x"]);
  expect(z.tuple([z.string(), z.string().default("x").pipe(z.string())]).parse(["alpha"])).toEqual(["alpha", "x"]);
});

test("tuple fills defaults under async parse", async () => {
  const t = z.tuple([z.string(), z.string().default("zulu")]);
  await expect(t.parseAsync(["alpha"])).resolves.toEqual(["alpha", "zulu"]);
});

test("tuple keeps length-1 array for missing `.optional()` elements", () => {
  // Backwards compat: a trailing `.optional()` element that is omitted from
  // the input must NOT be filled with `undefined` — the result stays length-1.
  // Only schemas that produce a defined value get materialized.
  const t = z.tuple([z.string(), z.string().optional()]);
  const out = t.parse(["alpha"]);
  expect(out).toEqual(["alpha"]);
  expect(out.length).toEqual(1);

  expect(z.tuple([z.string(), z.undefined()]).parse(["alpha"])).toHaveLength(1);
  expect(z.tuple([z.string(), z.string().optional().nullable()]).parse(["alpha"])).toHaveLength(1);
});

test("tuple result is dense when optional precedes a default", () => {
  // `.optional()` before a `.default()` must produce an explicit `undefined`
  // (not a sparse hole), otherwise `1 in r`, `JSON.stringify`, `Object.keys`,
  // and iteration all behave wrong.
  const t = z.tuple([z.string(), z.string().optional(), z.string().default("z")]);
  const r = t.parse(["alpha"]);
  expect(r).toEqual(["alpha", undefined, "z"]);
  expect(r.length).toEqual(3);
  expect(1 in r).toEqual(true);
  expect(JSON.stringify(r)).toEqual('["alpha",null,"z"]');

  // Trailing optional after a default is still dropped (no later default
  // forces it to materialize).
  expect(z.tuple([z.string(), z.string().default("d"), z.string().optional()]).parse(["alpha"])).toEqual([
    "alpha",
    "d",
  ]);

  // Multiple interleaved optional/default — every slot up to the last
  // default must be present and dense.
  const interleaved = z.tuple([
    z.string(),
    z.string().optional(),
    z.string().default("d"),
    z.string().optional(),
    z.string().default("e"),
  ]);
  const out = interleaved.parse(["alpha"]);
  expect(out).toEqual(["alpha", undefined, "d", undefined, "e"]);
  expect(1 in out && 3 in out).toEqual(true);
});

test("tuple with rest schema", () => {
  const myTuple = z.tuple([z.string(), z.number()]).rest(z.boolean());
  expect(myTuple.parse(["asdf", 1234, true, false, true])).toEqual(["asdf", 1234, true, false, true]);

  expect(myTuple.parse(["asdf", 1234])).toEqual(["asdf", 1234]);

  expect(() => myTuple.parse(["asdf", 1234, "asdf"])).toThrow();
  type t1 = z.output<typeof myTuple>;

  expectTypeOf<t1>().toEqualTypeOf<[string, number, ...boolean[]]>();
});

test("sparse array input", () => {
  const schema = z.tuple([z.string(), z.number()]);
  expect(() => schema.parse(new Array(2))).toThrow();
});

test("under-length tuple emits a single too_small with optStart minimum", () => {
  const allRequired = z.tuple([z.string(), z.string()]);
  expect(allRequired.safeParse(["a"]).error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "too_small",
        "inclusive": true,
        "message": "Too small: expected array to have >=2 items",
        "minimum": 2,
        "origin": "array",
        "path": [],
      },
    ]
  `);
  expect(allRequired.safeParse([]).error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "too_small",
        "inclusive": true,
        "message": "Too small: expected array to have >=2 items",
        "minimum": 2,
        "origin": "array",
        "path": [],
      },
    ]
  `);

  const trailingOptional = z.tuple([z.string(), z.number().optional()]);
  expect(trailingOptional.safeParse([]).error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "too_small",
        "inclusive": true,
        "message": "Too small: expected array to have >=1 items",
        "minimum": 1,
        "origin": "array",
        "path": [],
      },
    ]
  `);

  const interiorOptional = z.tuple([z.string(), z.number().optional(), z.string()]);
  expect(interiorOptional.safeParse(["a", 1]).error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "too_small",
        "inclusive": true,
        "message": "Too small: expected array to have >=3 items",
        "minimum": 3,
        "origin": "array",
        "path": [],
      },
    ]
  `);
});

test("too_big tuple still surfaces element-wise type errors for present indices", () => {
  const schema = z.tuple([z.string(), z.number()]);
  expect(schema.safeParse([1, "x", "extra"]).error!.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "too_big",
        "inclusive": true,
        "maximum": 2,
        "message": "Too big: expected array to have <=2 items",
        "origin": "array",
        "path": [],
      },
      {
        "code": "invalid_type",
        "expected": "string",
        "message": "Invalid input: expected string, received number",
        "path": [
          0,
        ],
      },
      {
        "code": "invalid_type",
        "expected": "number",
        "message": "Invalid input: expected number, received string",
        "path": [
          1,
        ],
      },
    ]
  `);
});
