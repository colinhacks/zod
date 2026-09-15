import { expect, expectTypeOf, test } from "vitest";
import type { util } from "zod/v4/core";

import * as z from "zod/v4";

test("object intersection", () => {
  const A = z.object({ a: z.string() });
  const B = z.object({ b: z.string() });

  const C = z.intersection(A, B); // BaseC.merge(HasID);
  type C = z.infer<typeof C>;
  expectTypeOf<C>().toEqualTypeOf<{ a: string } & { b: string }>();
  const data = { a: "foo", b: "foo" };
  expect(C.parse(data)).toEqual(data);
  expect(() => C.parse({ a: "foo" })).toThrow();
});

test("object intersection: loose", () => {
  const A = z.looseObject({ a: z.string() });
  const B = z.object({ b: z.string() });

  const C = z.intersection(A, B); // BaseC.merge(HasID);
  type C = z.infer<typeof C>;
  expectTypeOf<C>().toEqualTypeOf<{ a: string; [x: string]: unknown } & { b: string }>();
  const data = { a: "foo", b: "foo", c: "extra" };
  expect(C.parse(data)).toEqual(data);
  expect(() => C.parse({ a: "foo" })).toThrow();
});

test("object intersection: strict + strip", () => {
  const A = z.strictObject({ a: z.string() });
  const B = z.object({ b: z.string() });

  const C = z.intersection(A, B);
  type C = z.infer<typeof C>;
  expectTypeOf<C>().toEqualTypeOf<{ a: string } & { b: string }>();

  // Keys recognized by either side should work
  expect(C.parse({ a: "foo", b: "bar" })).toEqual({ a: "foo", b: "bar" });

  // Extra keys are stripped (follows strip behavior from B)
  expect(C.parse({ a: "foo", b: "bar", c: "extra" })).toEqual({ a: "foo", b: "bar" });
});

test("object intersection: strict + strict", () => {
  const A = z.strictObject({ a: z.string() });
  const B = z.strictObject({ b: z.string() });

  const C = z.intersection(A, B);

  // Keys recognized by either side should work
  expect(C.parse({ a: "foo", b: "bar" })).toEqual({ a: "foo", b: "bar" });

  // Keys unrecognized by BOTH sides should error
  const result = C.safeParse({ a: "foo", b: "bar", c: "extra" });
  expect(result.error?.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "unrecognized_keys",
        "keys": [
          "c",
        ],
        "message": "Unrecognized key: "c"",
        "path": [],
      },
    ]
  `);
});

test("object intersection strips __proto__ from pass-through operands", () => {
  const cases = [
    [
      z.intersection(z.object({ name: z.string() }), z.unknown()),
      JSON.parse('{"__proto__":{"isAdmin":true},"name":"alice"}'),
      { name: "alice" },
    ],
    [z.intersection(z.record(z.string(), z.unknown()), z.any()), JSON.parse('{"__proto__":{},"a":1}'), { a: 1 }],
  ] as const;

  for (const [schema, input, expected] of cases) {
    const parsed = schema.parse(input);
    expect(parsed).toEqual(expected);
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(parsed, "__proto__")).toBe(false);
  }
});

test("deep intersection", () => {
  const Animal = z.object({
    properties: z.object({
      is_animal: z.boolean(),
    }),
  });
  const Cat = z.intersection(
    z.object({
      properties: z.object({
        jumped: z.boolean(),
      }),
    }),
    Animal
  );

  type Cat = util.Flatten<z.infer<typeof Cat>>;
  expectTypeOf<Cat>().toEqualTypeOf<{ properties: { is_animal: boolean } & { jumped: boolean } }>();
  const a = Cat.safeParse({ properties: { is_animal: true, jumped: true } });
  expect(a.data!.properties).toEqual({ is_animal: true, jumped: true });
});

test("deep intersection of arrays", async () => {
  const Author = z.object({
    posts: z.array(
      z.object({
        post_id: z.number(),
      })
    ),
  });
  const Registry = z.intersection(
    Author,
    z.object({
      posts: z.array(
        z.object({
          title: z.string(),
        })
      ),
    })
  );

  const posts = [
    { post_id: 1, title: "Novels" },
    { post_id: 2, title: "Fairy tales" },
  ];
  const cat = Registry.parse({ posts });
  expect(cat.posts).toEqual(posts);
  const asyncCat = await Registry.parseAsync({ posts });
  expect(asyncCat.posts).toEqual(posts);
});

test("invalid intersection types", async () => {
  const numberIntersection = z.intersection(
    z.number(),
    z.number().transform((x) => x + 1)
  );

  expect(() => {
    numberIntersection.parse(1234);
  }).toThrowErrorMatchingInlineSnapshot(`[Error: Unmergable intersection. Error path: []]`);
});

test("invalid array merge (incompatible lengths)", async () => {
  const stringArrInt = z.intersection(
    z.string().array(),
    z
      .string()
      .array()
      .transform((val) => [...val, "asdf"])
  );

  expect(() => stringArrInt.safeParse(["asdf", "qwer"])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unmergable intersection. Error path: []]`
  );
});

test("invalid array merge (incompatible elements)", async () => {
  const stringArrInt = z.intersection(
    z.string().array(),
    z
      .string()
      .array()
      .transform((val) => [...val.slice(0, -1), "asdf"])
  );

  expect(() => stringArrInt.safeParse(["asdf", "qwer"])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unmergable intersection. Error path: [1]]`
  );
});

test("invalid object merge", async () => {
  const Cat = z.object({
    phrase: z.string().transform((val) => `${val} Meow`),
  });
  const Dog = z.object({
    phrase: z.string().transform((val) => `${val} Woof`),
  });
  const CatDog = z.intersection(Cat, Dog);

  expect(() => CatDog.parse({ phrase: "Hello, my name is CatDog." })).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unmergable intersection. Error path: ["phrase"]]`
  );
});

test("invalid deep merge of object and array combination", async () => {
  const University = z.object({
    students: z.array(
      z.object({
        name: z.string().transform((val) => `Student name: ${val}`),
      })
    ),
  });
  const Registry = z.intersection(
    University,
    z.object({
      students: z.array(
        z.object({
          name: z.string(),
          surname: z.string(),
        })
      ),
    })
  );

  const students = [{ name: "John", surname: "Doe" }];

  expect(() => Registry.parse({ students })).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unmergable intersection. Error path: ["students",0,"name"]]`
  );
});

// A record's key schema says which keys that record GOVERNS; it is not a predicate
// every key in the result must satisfy. TypeScript works the same way: in
// `{name: string} & Record<`S_${string}`, string>` the index signature constrains
// only the keys matching it, so `name` is fine. So a key one side does not govern
// is reconciled against the other side, exactly as unrecognized_keys already is.
test("a record's key schema governs only its own keys inside an intersection", () => {
  const Obj = z.object({ name: z.string() });
  const value = { name: "a", S_a: "s" };

  // Every key-schema flavor behaves the same: `name` belongs to the object side.
  expect(z.intersection(Obj, z.record(z.string().regex(/^S_/), z.string())).parse(value)).toEqual(value);
  expect(z.intersection(Obj, z.record(z.templateLiteral(["S_", z.string()]), z.string())).parse(value)).toEqual(value);
  expect(z.intersection(Obj, z.partialRecord(z.enum(["p1", "p2"]), z.string())).parse({ name: "a", p1: "x" })).toEqual({
    name: "a",
    p1: "x",
  });
  expect(z.intersection(Obj, z.record(z.enum(["p1"]), z.string())).parse({ name: "a", p1: "x" })).toEqual({
    name: "a",
    p1: "x",
  });

  // A key the record DOES govern still has its value validated across the intersection.
  const governed = z.intersection(z.object({ S_x: z.number() }), z.record(z.string().regex(/^S_/), z.string()));
  expect(governed.safeParse({ S_x: 1 }).success).toBe(false);

  // A key NEITHER side governs is still rejected.
  const strict = z.intersection(z.strictObject({ name: z.string() }), z.record(z.string().regex(/^S_/), z.string()));
  expect(strict.parse(value)).toEqual(value);
  expect(strict.safeParse({ ...value, evil: "q" }).success).toBe(false);

  // Standalone, a record still rejects a key it does not govern.
  expect(z.record(z.string().regex(/^S_/), z.string()).safeParse({ S_a: "s", bad: "x" }).success).toBe(false);
});

test("partialRecord reports an out-of-set key as unrecognized, not invalid", () => {
  const enumKeys = z.partialRecord(z.enum(["a", "b"]), z.string()).safeParse({ a: "x", zzz: "q" });
  expect(enumKeys.success).toBe(false);
  expect(enumKeys.error!.issues[0].code).toBe("unrecognized_keys");

  // A regex key schema still reports the failure as an invalid key.
  const regexKeys = z.record(z.string().regex(/^S_/), z.string()).safeParse({ S_a: "x", zzz: "q" });
  expect(regexKeys.success).toBe(false);
  expect(regexKeys.error!.issues[0].code).toBe("invalid_key");
});

test("intersection operands run their own checks, refinements and transforms", () => {
  let checks = 0;
  const failing = z.intersection(
    z.strictObject({ x: z.string() }).check(() => {
      checks++;
    }),
    z.strictObject({ a: z.string() }).superRefine((_data, ctx) => {
      checks++;
      ctx.addIssue({ code: "custom", message: "boom" });
    })
  );
  expect(failing.safeParse({ x: "test", a: "hello" })).toMatchObject({
    success: false,
    error: { issues: [{ code: "custom", message: "boom" }] },
  });
  expect(checks).toBe(2);

  const transformed = z.intersection(
    z.strictObject({ x: z.string() }).transform((v) => ({ ...v, x: v.x.toUpperCase() })),
    z.strictObject({ a: z.string() }).transform((v) => ({ ...v, seen: true }))
  );
  expect(transformed.parse({ x: "test", a: "hello" })).toEqual({ x: "TEST", a: "hello", seen: true });
});

test("intersection operands apply defaults, including through a nested intersection", () => {
  const inner = z.intersection(
    z.strictObject({ x: z.string().default("X default"), y: z.number() }),
    z.strictObject({ z: z.boolean() })
  );
  const schema = z.intersection(inner, z.strictObject({ a: z.string() }));
  expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<{ x: string; y: number } & { z: boolean } & { a: string }>();

  expect(schema.parse({ y: 34, z: true, a: "hello" })).toEqual({ x: "X default", y: 34, z: true, a: "hello" });
});

test("a record operand runs its own refinements inside an intersection", () => {
  let calls = 0;
  const schema = z
    .record(z.enum(["p1", "p2"]), z.string())
    .superRefine((_data, ctx) => {
      calls++;
      ctx.addIssue({ code: "custom", message: "record refined" });
    })
    .and(z.strictObject({ name: z.string() }));

  expect(schema.safeParse({ p1: "a", p2: "b", name: "n" })).toMatchObject({
    success: false,
    error: { issues: [{ code: "custom", message: "record refined" }] },
  });
  expect(calls).toBe(1);
});

test("a strict object nested under an operand keeps its strictness", () => {
  const schema = z.intersection(
    z.object({ inner: z.strictObject({ a: z.string() }) }),
    z.object({ other: z.string() })
  );

  expect(schema.parse({ inner: { a: "x" }, other: "y" })).toEqual({ inner: { a: "x" }, other: "y" });
  expect(schema.safeParse({ inner: { a: "x", extra: 1 }, other: "y" })).toMatchObject({
    success: false,
    error: { issues: [{ code: "unrecognized_keys", keys: ["extra"], path: ["inner"] }] },
  });
});

test("a strict object composes with a refined object", () => {
  const A = z.object({ key1: z.boolean() }).strict();
  const B = z.object({ key2: z.boolean() }).refine(({ key2 }) => key2, "key2 must be true");

  expect(A.and(B).parse({ key1: true, key2: true })).toEqual({ key1: true, key2: true });
  expect(A.and(B).safeParse({ key1: true, key2: false }).success).toBe(false);
});
