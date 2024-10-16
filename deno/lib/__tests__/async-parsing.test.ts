// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

/// string
const stringSchema = z.string();

test("string async parse", async () => {
  const goodData = "XXX";
  const badData = 12;

  const goodResult = await z.safeParseAsync(stringSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(stringSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// number
const numberSchema = z.number();
test("number async parse", async () => {
  const goodData = 1234.2353;
  const badData = "1234";

  const goodResult = await z.safeParseAsync(numberSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(numberSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// bigInt
const bigIntSchema = z.bigint();
test("bigInt async parse", async () => {
  const goodData = BigInt(145);
  const badData = 134;

  const goodResult = await z.safeParseAsync(bigIntSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(bigIntSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// boolean
const booleanSchema = z.boolean();
test("boolean async parse", async () => {
  const goodData = true;
  const badData = 1;

  const goodResult = await z.safeParseAsync(booleanSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(booleanSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// date
const dateSchema = z.date();
test("date async parse", async () => {
  const goodData = new Date();
  const badData = new Date().toISOString();

  const goodResult = await z.safeParseAsync(dateSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(dateSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// undefined
const undefinedSchema = z.undefined();
test("undefined async parse", async () => {
  const goodData = undefined;
  const badData = "XXX";

  const goodResult = await z.safeParseAsync(undefinedSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(undefined);

  const badResult = await z.safeParseAsync(undefinedSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// null
const nullSchema = z.null();
test("null async parse", async () => {
  const goodData = null;
  const badData = undefined;

  const goodResult = await z.safeParseAsync(nullSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(nullSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// any
const anySchema = z.any();
test("any async parse", async () => {
  const goodData = [{}];
  // const badData = 'XXX';

  const goodResult = await z.safeParseAsync(anySchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  // const badResult = await z.safeParseAsync(anySchema, badData);
  // expect(badResult.success).toBe(false);
  // if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// unknown
const unknownSchema = z.unknown();
test("unknown async parse", async () => {
  const goodData = ["asdf", 124, () => {}];
  // const badData = 'XXX';

  const goodResult = await z.safeParseAsync(unknownSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  // const badResult = await z.safeParseAsync(unknownSchema, badData);
  // expect(badResult.success).toBe(false);
  // if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// void
const voidSchema = z.void();
test("void async parse", async () => {
  const goodData = undefined;
  const badData = 0;

  const goodResult = await z.safeParseAsync(voidSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(voidSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// array
const arraySchema = z.array(z.string());
test("array async parse", async () => {
  const goodData = ["XXX"];
  const badData = "XXX";

  const goodResult = await z.safeParseAsync(arraySchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(arraySchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// object
const objectSchema = z.object({ string: z.string() });
test("object async parse", async () => {
  const goodData = { string: "XXX" };
  const badData = { string: 12 };

  const goodResult = await z.safeParseAsync(objectSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(objectSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// union
const unionSchema = z.union([z.string(), z.undefined()]);
test("union async parse", async () => {
  const goodData = undefined;
  const badData = null;

  const goodResult = await z.safeParseAsync(unionSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(unionSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// record
const recordSchema = z.record(z.object({}));
test("record async parse", async () => {
  const goodData = { adsf: {}, asdf: {} };
  const badData = [{}];

  const goodResult = await z.safeParseAsync(recordSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(recordSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// function
const functionSchema = z.function();
test("function async parse", async () => {
  const goodData = () => {};
  const badData = "XXX";

  const goodResult = await z.safeParseAsync(functionSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(typeof goodResult.data).toEqual("function");

  const badResult = await z.safeParseAsync(functionSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// literal
const literalSchema = z.literal("asdf");
test("literal async parse", async () => {
  const goodData = "asdf";
  const badData = "asdff";

  const goodResult = await z.safeParseAsync(literalSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(literalSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// enum
const enumSchema = z.enum(["fish", "whale"]);
test("enum async parse", async () => {
  const goodData = "whale";
  const badData = "leopard";

  const goodResult = await z.safeParseAsync(enumSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(enumSchema, badData);
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

  const goodResult = await z.safeParseAsync(nativeEnumSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) expect(goodResult.data).toEqual(goodData);

  const badResult = await z.safeParseAsync(nativeEnumSchema, badData);
  expect(badResult.success).toBe(false);
  if (!badResult.success) expect(badResult.error).toBeInstanceOf(z.ZodError);
});

/// promise
const promiseSchema = z.promise(z.number());
test("promise async parse good", async () => {
  const goodData = Promise.resolve(123);

  const goodResult = await z.safeParseAsync(promiseSchema, goodData);
  expect(goodResult.success).toBe(true);
  if (goodResult.success) {
    expect(goodResult.data).toBeInstanceOf(Promise);
    const data = await goodResult.data;
    expect(data).toEqual(123);
    // expect(goodResult.data).resolves.toEqual(124);
    // return goodResult.data;
  } else {
    throw new Error("success should be true");
  }
});

test("promise async parse bad", async () => {
  const badData = Promise.resolve("XXX");
  const badResult = await z.safeParseAsync(promiseSchema, badData);
  expect(badResult.success).toBe(true);
  if (badResult.success) {
    await expect(badResult.data).rejects.toBeInstanceOf(z.ZodError);
  } else {
    throw new Error("success should be true");
  }
});

test("async validation non-empty strings", async () => {
  const base = z.object({
    hello: z.string().refine((x) => x && x.length > 0),
    foo: z.string().refine((x) => x && x.length > 0),
  });

  const testval = { hello: "", foo: "" };
  const result1 = z.safeParse(base, testval);
  const result2 = z.safeParseAsync(base, testval);

  const r1 = result1;
  await result2.then((r2) => {
    if (r1.success === false && r2.success === false)
      expect(r1.error.issues.length).toBe(r2.error.issues.length); // <--- r1 has length 2, r2 has length 1
  });
});

test("async validation multiple errors 1", async () => {
  const base = z.object({
    hello: z.string(),
    foo: z.number(),
  });

  const testval = { hello: 3, foo: "hello" };
  const result1 = z.safeParse(base, testval);
  const result2 = z.safeParseAsync(base, testval);

  const r1 = result1;
  await result2.then((r2) => {
    if (r1.success === false && r2.success === false)
      expect(r2.error.issues.length).toBe(r1.error.issues.length);
  });
});

test("async validation multiple errors 2", async () => {
  const base = (is_async?: boolean) =>
    z.object({
      hello: z.string(),
      foo: z.object({
        bar: z.number().refine(is_async ? async () => false : () => false),
      }),
    });

  const testval = { hello: 3, foo: { bar: 4 } };
  const result1 = z.safeParse(base(), testval);
  const result2 = z.safeParseAsync(base(true), testval);

  const r1 = result1;
  await result2.then((r2) => {
    if (r1.success === false && r2.success === false)
      expect(r2.error.issues.length).toBe(r1.error.issues.length);
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
  const result = await z.safeParseAsync(base, testval);
  if (result.success === false) {
    expect(result.error.issues.length).toBe(1);
    expect(count).toBe(1);
  }

  // await result.then((r) => {
  //   if (r.success === false) expect(r.error.issues.length).toBe(1);
  //   expect(count).toBe(2);
  // });
});
