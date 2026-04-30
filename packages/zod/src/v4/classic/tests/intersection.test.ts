import { expect, expectTypeOf, test, vi } from "vitest";
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

test("strict object intersection runs checks after unrecognized keys are reconciled", () => {
  const spy = vi.fn();
  const alwaysFailingCheck = (payload: z.core.ParsePayload) => {
    spy();
    payload.issues.push({
      code: "custom",
      input: payload.value,
      message: "This check always fails",
    });
  };

  const schema = z.intersection(
    z.strictObject({ x: z.string() }).check(alwaysFailingCheck),
    z.strictObject({ a: z.string() }).check(alwaysFailingCheck)
  );

  const result = schema.safeParse({ x: "test", a: "hello" });
  expect(spy).toHaveBeenCalledTimes(2);
  expect(result.error?.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "custom",
        "message": "This check always fails",
        "path": [],
      },
      {
        "code": "custom",
        "message": "This check always fails",
        "path": [],
      },
    ]
  `);
});

test("strict object intersection runs superRefine after unrecognized keys are reconciled", () => {
  const spy = vi.fn();
  const alwaysFailingSuperRefine = (_data: unknown, ctx: z.RefinementCtx) => {
    spy();
    ctx.addIssue({
      code: "custom",
      message: "This check always fails",
    });
  };

  const schema = z.intersection(
    z.strictObject({ x: z.string() }).superRefine(alwaysFailingSuperRefine),
    z.strictObject({ a: z.string() }).superRefine(alwaysFailingSuperRefine)
  );

  const result = schema.safeParse({ x: "test", a: "hello" });
  expect(spy).toHaveBeenCalledTimes(2);
  expect(result.error?.issues).toMatchInlineSnapshot(`
    [
      {
        "code": "custom",
        "message": "This check always fails",
        "path": [],
      },
      {
        "code": "custom",
        "message": "This check always fails",
        "path": [],
      },
    ]
  `);
});

test("strict object intersection runs transforms after unrecognized keys are reconciled", () => {
  const spy = vi.fn();
  const transformFn = <T extends object>(data: T) => {
    spy();
    return { ...data, transformed: true };
  };

  const schema = z.intersection(
    z.strictObject({ x: z.string() }).transform(transformFn),
    z.strictObject({ a: z.string() }).transform(transformFn)
  );

  expect(schema.parse({ x: "test", a: "hello" })).toEqual({
    x: "test",
    a: "hello",
    transformed: true,
  });
  expect(spy).toHaveBeenCalledTimes(2);
});

test("nested strict object intersection preserves merged value with defaults", () => {
  const inner = z.intersection(
    z.strictObject({
      x: z.string().default("X default"),
      y: z.number(),
    }),
    z.strictObject({
      z: z.boolean(),
    })
  );

  const schema = z.intersection(inner, z.strictObject({ a: z.string() }));
  type Schema = z.output<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<{ x: string; y: number } & { z: boolean } & { a: string }>();

  expect(schema.parse({ y: 34, z: true, a: "hello" })).toEqual({
    x: "X default",
    y: 34,
    z: true,
    a: "hello",
  });
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
