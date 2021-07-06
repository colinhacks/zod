// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
type Test = z.infer<typeof Test>;

test("object type inference", () => {
  type TestType = {
    f1: number;
    f2?: string | undefined;
    f3: string | null;
    f4: { t: string | boolean }[];
  };

  const t1: util.AssertEqual<z.TypeOf<typeof Test>, TestType> = true;
  [t1];
});

test("unknown throw", () => {
  const asdf: unknown = 35;
  expect(() => Test.parse(asdf)).toThrow();
});

test("correct parsing", () => {
  Test.parse({
    f1: 12,
    f2: "string",
    f3: "string",
    f4: [
      {
        t: "string",
      },
    ],
  });

  Test.parse({
    f1: 12,
    f3: null,
    f4: [
      {
        t: false,
      },
    ],
  });
});

test("incorrect #1", () => {
  expect(() => Test.parse({} as any)).toThrow();
});

test("nonstrict by default", () => {
  z.object({ points: z.number() }).parse({
    points: 2314,
    unknown: "asdf",
  });
});

const data = {
  points: 2314,
  unknown: "asdf",
};

test("strip by default", () => {
  const val = z.object({ points: z.number() }).parse(data);
  expect(val).toEqual({ points: 2314 });
});

test("unknownkeys override", () => {
  const val = z
    .object({ points: z.number() })
    .strict()
    .passthrough()
    .strip()
    .nonstrict()
    .parse(data);

  expect(val).toEqual(data);
});

test("passthrough unknown", () => {
  const val = z.object({ points: z.number() }).passthrough().parse(data);

  expect(val).toEqual(data);
});

test("strip unknown", () => {
  const val = z.object({ points: z.number() }).strip().parse(data);

  expect(val).toEqual({ points: 2314 });
});

test("strict", () => {
  const val = z.object({ points: z.number() }).strict().safeParse(data);

  expect(val.success).toEqual(false);
});

test("catchall inference", () => {
  const o1 = z
    .object({
      first: z.string(),
    })
    .catchall(z.number());

  const d1 = o1.parse({ first: "asdf", num: 1243 });
  const f1: util.AssertEqual<number, typeof d1["asdf"]> = true;
  const f2: util.AssertEqual<string, typeof d1["first"]> = true;
  f1;
  f2;
});

test("catchall overrides strict", () => {
  const o1 = z
    .object({ first: z.string().optional() })
    .strict()
    .catchall(z.number());

  // should run fine
  // setting a catchall overrides the unknownKeys behavior
  o1.parse({
    asdf: 1234,
  });

  // should only run catchall validation
  // against unknown keys
  o1.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("catchall overrides strict", () => {
  const o1 = z
    .object({
      first: z.string(),
    })
    .strict()
    .catchall(z.number());

  // should run fine
  // setting a catchall overrides the unknownKeys behavior
  o1.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("test that optional keys are unset", async () => {
  const SNamedEntity = z.object({
    id: z.string(),
    set: z.string().optional(),
    unset: z.string().optional(),
  });
  const result = await SNamedEntity.parse({
    id: "asdf",
    set: undefined,
  });
  expect(Object.keys(result)).toEqual(["id", "set"]);
});

test("test catchall parsing", async () => {
  const result = z
    .object({ name: z.string() })
    .catchall(z.number())
    .parse({ name: "Foo", validExtraKey: 61 });

  expect(result).toEqual({ name: "Foo", validExtraKey: 61 });

  const result2 = z
    .object({ name: z.string() })
    .catchall(z.number())
    .safeParse({ name: "Foo", validExtraKey: 61, invalid: "asdf" });

  expect(result2.success).toEqual(false);
});

test("test nonexistent keys", async () => {
  const Schema = z.union([
    z.object({ a: z.string() }),
    z.object({ b: z.number() }),
  ]);
  const obj = { a: "A" };
  const result = await Schema.spa(obj); // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result.success).toBe(true);
});

test("test async PseudoPromise.all", async () => {
  const Schema2 = z.union([
    z.object({
      ty: z.string(),
    }),
    z.object({
      ty: z.number(),
    }),
  ]);

  const obj = { ty: "A" };
  const result = await Schema2.spa(obj); // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result.success).toEqual(true);
});

test("test inferred merged type", async () => {
  const asdf = z.object({ a: z.string() }).merge(z.object({ a: z.number() }));
  type asdf = z.infer<typeof asdf>;
  const f1: util.AssertEqual<asdf, { a: number }> = true;
  f1;
});

test("inferred type for unknown/any keys", () => {
  const myType = z.object({
    anyOptional: z.any().optional(),
    anyRequired: z.any(),
    unknownOptional: z.unknown().optional(),
    unknownRequired: z.unknown(),
  });
  type myType = z.infer<typeof myType>;
  const _f1: util.AssertEqual<
    myType,
    {
      anyOptional?: any;
      anyRequired?: any;
      unknownOptional?: unknown;
      unknownRequired?: unknown;
    }
  > = true;
  _f1;
});
