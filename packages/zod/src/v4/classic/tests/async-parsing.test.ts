import { expect, test } from "vitest";

import * as z from "zod/v4";

/// string
const stringSchema = z.string();

test("string async parse", async () => {
  const goodData = "XXX";
  const badData = 12;

  const goodResult = await stringSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await stringSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// number
const numberSchema = z.number();
test("number async parse", async () => {
  const goodData = 1234.2353;
  const badData = "1234";

  const goodResult = await numberSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await numberSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// bigInt
const bigIntSchema = z.bigint();
test("bigInt async parse", async () => {
  const goodData = BigInt(145);
  const badData = 134;

  const goodResult = await bigIntSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await bigIntSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// boolean
const booleanSchema = z.boolean();
test("boolean async parse", async () => {
  const goodData = true;
  const badData = 1;

  const goodResult = await booleanSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await booleanSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// date
const dateSchema = z.date();
test("date async parse", async () => {
  const goodData = new Date();
  const badData = new Date().toISOString();

  const goodResult = await dateSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await dateSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// undefined
const undefinedSchema = z.undefined();
test("undefined async parse", async () => {
  const goodData = undefined;
  const badData = "XXX";

  const goodResult = await undefinedSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(undefined);

  const badResult = await undefinedSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// null
const nullSchema = z.null();
test("null async parse", async () => {
  const goodData = null;
  const badData = undefined;

  const goodResult = await nullSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await nullSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// any
const anySchema = z.any();
test("any async parse", async () => {
  const goodData = [{}];
  // const badData = 'XXX';

  const goodResult = await anySchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  // const badResult = await anySchema.safeParseAsync(badData);
  // expect(badResult.success).toBe(false);
  // if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// unknown
const unknownSchema = z.unknown();
test("unknown async parse", async () => {
  const goodData = ["asdf", 124, () => {}];
  // const badData = 'XXX';

  const goodResult = await unknownSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  // const badResult = await unknownSchema.safeParseAsync(badData);
  // expect(badResult.success).toBe(false);
  // if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// void
const voidSchema = z.void();
test("void async parse", async () => {
  const goodData = undefined;
  const badData = 0;

  const goodResult = await voidSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await voidSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// array
const arraySchema = z.array(z.string());
test("array async parse", async () => {
  const goodData = ["XXX"];
  const badData = "XXX";

  const goodResult = await arraySchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await arraySchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// object
const objectSchema = z.object({ string: z.string() });
test("object async parse", async () => {
  const goodData = { string: "XXX" };
  const badData = { string: 12 };

  const goodResult = await objectSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await objectSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// union
const unionSchema = z.union([z.string(), z.undefined()]);
test("union async parse", async () => {
  const goodData = undefined;
  const badData = null;

  const goodResult = await unionSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await unionSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// record
const recordSchema = z.record(z.string(), z.object({}));
test("record async parse", async () => {
  const goodData = { adsf: {}, asdf: {} };
  const badData = [{}];

  const goodResult = await recordSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await recordSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// function
// const functionSchema = z.function();
// test("function async parse", async () => {
//   const goodData = () => {};
//   const badData = "XXX";

//   const goodResult = await functionSchema.safeParseAsync(goodData);
//   expect(goodResult.success).toBe(true);
//   if (goodResult.success) expect(typeof goodResult.data).toEqual("function");

//   const badResult = await functionSchema.safeParseAsync(badData);
//   expect(badResult.success).toBe(false);
//   if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
// });

/// literal
const literalSchema = z.literal("asdf");
test("literal async parse", async () => {
  const goodData = "asdf";
  const badData = "asdff";

  const goodResult = await literalSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await literalSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// enum
const enumSchema = z.enum(["fish", "whale"]);
test("enum async parse", async () => {
  const goodData = "whale";
  const badData = "leopard";

  const goodResult = await enumSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await enumSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// nativeEnum
enum nativeEnumTest {
  asdf = "qwer",
}
// @ts-ignore
const nativeEnumSchema = z.nativeEnum(nativeEnumTest);
test("nativeEnum async parse", async () => {
  const goodData = nativeEnumTest.asdf;
  const badData = "asdf";

  const goodResult = await nativeEnumSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await nativeEnumSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// promise
const promiseSchema = z.promise(z.number());
test("promise async parse good", async () => {
  const goodData = Promise.resolve(123);

  const goodResult = await promiseSchema.safeParseAsync(goodData);
  expect(goodResult.success).toBe(true);
  expect(typeof goodResult.data).toEqual("number");
  expect(goodResult.data).toEqual(123);
});

test("promise async parse bad", async () => {
  const badData = Promise.resolve("XXX");
  const badResult = await promiseSchema.safeParseAsync(badData);
  expect(badResult.success).toBe(false);
  expect(badResult.error).toBeInstanceOf(z.ZodError);
});

test("async validation non-empty strings", async () => {
  const base = z.object({
    hello: z.string().refine((x) => x && x.length > 0),
    foo: z.string().refine((x) => x && x.length > 0),
  });

  const testval = { hello: "", foo: "" };
  const result1 = base.safeParse(testval);
  const result2 = base.safeParseAsync(testval);

  const r1 = result1;
  await result2.then((r2) => {
    expect(r1.error!.issues.length).toBe(r2.error!.issues.length);
  });
});

test("async validation multiple errors 1", async () => {
  const base = z.object({
    hello: z.string(),
    foo: z.number(),
  });

  const testval = { hello: 3, foo: "hello" };
  const result1 = base.safeParse(testval);
  const result2 = base.safeParseAsync(testval);

  await result2.then((result2) => {
    expect(result2.error!.issues.length).toBe(result1.error!.issues.length);
  });
});

test("async validation multiple errors 2", async () => {
  const base = (is_async?: boolean) =>
    z.object({
      hello: z.string(),
      foo: z.object({
        bar: z.number().refine(
          is_async
            ? async () =>
                new Promise((resolve) => {
                  setTimeout(() => resolve(false), 500);
                })
            : () => false
        ),
      }),
    });

  const testval = { hello: 3, foo: { bar: 4 } };
  const result1 = base().safeParse(testval);
  const result2 = base(true).safeParseAsync(testval);

  await result2.then((result2) => {
    expect(result1.error!.issues.length).toBe(result2.error!.issues.length);
  });
});

test("ensure early async failure prevents follow-up refinement checks", async () => {
  let count = 0;
  const base = z.object({
    hello: z.string(),
    foo: z
      .number()
      .refine(async () => {
        count++;
        return true;
      })
      .refine(async () => {
        count++;
        return true;
      }, "Good"),
  });

  const testval = { hello: "bye", foo: 3 };
  const result = await base.safeParseAsync(testval);
  if (result.success === false) {
    expect(result.error.issues.length).toBe(1);
    expect(count).toBe(1);
  }

  // await result.then((r) => {
  //   if (r.success === false) expect(r.error.issues.length).toBe(1);
  //   expect(count).toBe(2);
  // });
});

test("async entry points walk synchronously until a schema hits async work", async () => {
  const sync = z.object({ a: z.string() });
  expect(await sync.safeParseAsync({ a: "x" })).toEqual({ success: true, data: { a: "x" } });
  expect(sync._zod.bag.async).toBeUndefined();

  let runs = 0;
  const schema = z.object({
    a: z.string().transform((v) => {
      runs++;
      return v;
    }),
    b: z.string().refine(async () => true),
  });
  expect(await schema.parseAsync({ a: "x", b: "x" })).toEqual({ a: "x", b: "x" });
  // sync work ahead of the async leaf runs once in the discarded attempt; the flag keeps every later call on the async walk
  expect(schema._zod.bag.async).toBe(true);
  expect(runs).toBe(2);
  await schema.parseAsync({ a: "x", b: "x" });
  expect(runs).toBe(3);
});

test("a sync parse of an object with an async transform throws $ZodAsyncError", () => {
  const schema = z.object({ a: z.string().transform(async (v) => v) });
  expect(() => schema.safeParse({ a: "x" })).toThrow(z.core.$ZodAsyncError);
  expect(() => schema.parse({ a: "x" })).toThrow(z.core.$ZodAsyncError);
});

test("async leaves resolve through the async entry points in every container position", async () => {
  const leaves: Record<string, [z.ZodType, unknown, unknown]> = {
    transform: [z.string().transform(async (v) => v.toUpperCase()), "a", "A"],
    "core transform": [
      z.pipe(
        z.string(),
        z.transform(async (v: string) => v.toUpperCase())
      ),
      "a",
      "A",
    ],
    refine: [z.string().refine(async (v) => v.length > 0), "a", "a"],
    superRefine: [z.string().superRefine(async () => {}), "a", "a"],
    check: [z.string().check(async () => {}), "a", "a"],
    codec: [z.codec(z.string(), z.number(), { decode: async (s) => s.length, encode: (n) => "x".repeat(n) }), "abc", 3],
    promise: [z.promise(z.string()), Promise.resolve("a"), "a"],
  };
  for (const [name, [leaf, input, output]] of Object.entries(leaves)) {
    const positions: [z.ZodType, unknown, unknown][] = [
      [leaf, input, output],
      [z.object({ a: leaf }), { a: input }, { a: output }],
      [z.array(leaf), [input], [output]],
    ];
    for (const [schema, i, o] of positions) {
      expect(await schema.parseAsync(i), name).toEqual(o);
      expect((await schema.safeParseAsync(i)).data, name).toEqual(o);
    }
  }
});

test("a declared-async callback is not invoked by the discarded sync attempt", async () => {
  const calls: string[] = [];
  const schema = z.object({
    t: z.string().transform(async (v) => {
      calls.push("transform");
      return v;
    }),
    r: z.string().refine(async () => {
      calls.push("refine");
      return true;
    }),
    s: z.string().superRefine(async () => {
      calls.push("superRefine");
    }),
    c: z.codec(z.string(), z.string(), {
      decode: async (v) => {
        calls.push("decode");
        return v;
      },
      encode: (v) => v,
    }),
  });
  await schema.parseAsync({ t: "a", r: "a", s: "a", c: "a" });
  expect(calls).toEqual(["transform", "refine", "superRefine", "decode"]);

  // a rejecting callback rejects the parse once and leaves no orphaned promise behind
  const rejecting = z.object({ a: z.string().transform(async () => Promise.reject(new Error("boom"))) });
  await expect(rejecting.parseAsync({ a: "x" })).rejects.toThrow("boom");
});

test("each codec direction learns its async-ness on its own", async () => {
  const codec = z.codec(z.string(), z.string(), {
    decode: (v) => v.toUpperCase(),
    encode: async (v) => v.toLowerCase(),
  });
  expect(await codec.encodeAsync("HELLO")).toBe("hello");
  expect(codec._zod.bag.asyncBackward).toBe(true);
  expect(codec._zod.bag.async).toBeUndefined();
  expect(await codec.decodeAsync("world")).toBe("WORLD");
  expect(codec._zod.bag.async).toBeUndefined();
});

test("a declared-async callback only refuses a sync parse where it would have run", () => {
  const refined = () => z.string().refine(async () => true);
  expect(z.union([refined(), z.number()]).parse(5)).toBe(5);
  expect(z.object({ a: refined() }).safeParse({ a: 123 }).success).toBe(false);
  expect(refined().catch("d").safeParse(123).data).toBe("d");
  expect(
    z
      .string()
      .refine(async () => true, { when: () => false })
      .parse("x")
  ).toBe("x");
  expect(() => refined().safeParse("x")).toThrow(z.core.$ZodAsyncError);
  expect(() =>
    z
      .string()
      .superRefine(async () => {})
      .safeParse("x")
  ).toThrow(z.core.$ZodAsyncError);
  expect(() =>
    z
      .string()
      .check(async () => {})
      .safeParse("x")
  ).toThrow(z.core.$ZodAsyncError);

  const codec = z.codec(z.string(), z.number(), { decode: async (s) => s.length, encode: (n) => "x".repeat(n) });
  expect(z.object({ a: codec }).safeParse({ a: 1 }).success).toBe(false);
  expect(codec.catch(0).safeParse(1).data).toBe(0);
  expect(() => codec.safeParse("x")).toThrow(z.core.$ZodAsyncError);
});

test("a plain function that hands back a rejected promise does not orphan it", async () => {
  const transform = z.object({ a: z.string().transform(() => Promise.reject(new Error("boom"))) });
  await expect(transform.parseAsync({ a: "x" })).rejects.toThrow("boom");
  const refine = z.string().refine(() => Promise.reject(new Error("boom")));
  await expect(refine.parseAsync("x")).rejects.toThrow("boom");
  expect(() => refine.safeParse("x")).toThrow(z.core.$ZodAsyncError);
});

test("a declared-async check or superRefine alone in an object is invoked once", async () => {
  let calls = 0;
  const schema = z.object({
    c: z.string().check(async () => {
      calls++;
    }),
    s: z.string().superRefine(async () => {
      calls++;
    }),
  });
  await schema.parseAsync({ c: "a", s: "a" });
  expect(calls).toBe(2);
});

test("a union with an async branch answers through the async entry points", async () => {
  // a sync parse throws once the async branch is reached, where main happened to fall through to the next branch
  const schema = z.union([z.promise(z.string()), z.string().transform(async (v) => v), z.number()]);
  expect(await schema.parseAsync(5)).toBe(5);
  expect(await schema.parseAsync("x")).toBe("x");
  expect(() => schema.safeParse(5)).toThrow(z.core.$ZodAsyncError);
});
