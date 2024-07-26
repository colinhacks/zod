// @ts-ignore TS6133
import { describe, expect, it, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

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

  util.assertEqual<z.TypeOf<typeof Test>, TestType>(true);
});

test("unknown throw", () => {
  const asdf: unknown = 35;
  expect(() => Test.parse(asdf)).toThrow();
});

test("shape() should return schema of particular key", () => {
  const f1Schema = Test.shape.f1;
  const f2Schema = Test.shape.f2;
  const f3Schema = Test.shape.f3;
  const f4Schema = Test.shape.f4;

  expect(f1Schema).toBeInstanceOf(z.ZodNumber);
  expect(f2Schema).toBeInstanceOf(z.ZodOptional);
  expect(f3Schema).toBeInstanceOf(z.ZodNullable);
  expect(f4Schema).toBeInstanceOf(z.ZodArray);
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
  util.assertEqual<number, (typeof d1)["asdf"]>(true);
  util.assertEqual<string, (typeof d1)["first"]>(true);
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
  // eslint-disable-next-line ban/ban
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

test("test async union", async () => {
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
  util.assertEqual<asdf, { a: number }>(true);
});

test("inferred merged object type with optional properties", async () => {
  const Merged = z
    .object({ a: z.string(), b: z.string().optional() })
    .merge(z.object({ a: z.string().optional(), b: z.string() }));
  type Merged = z.infer<typeof Merged>;
  util.assertEqual<Merged, { a?: string; b: string }>(true);
  // todo
  // util.assertEqual<Merged, { a?: string; b: string }>(true);
});

test("inferred unioned object type with optional properties", async () => {
  const Unioned = z.union([
    z.object({ a: z.string(), b: z.string().optional() }),
    z.object({ a: z.string().optional(), b: z.string() }),
  ]);
  type Unioned = z.infer<typeof Unioned>;
  util.assertEqual<
    Unioned,
    { a: string; b?: string } | { a?: string; b: string }
  >(true);
});

test("inferred enum type", async () => {
  const Enum = z.object({ a: z.string(), b: z.string().optional() }).keyof();

  expect(Enum.Values).toEqual({
    a: "a",
    b: "b",
  });
  expect(Enum.enum).toEqual({
    a: "a",
    b: "b",
  });
  expect(Enum._def.values).toEqual(["a", "b"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, "a" | "b">(true);
});

test("inferred partial object type with optional properties", async () => {
  const Partial = z
    .object({ a: z.string(), b: z.string().optional() })
    .partial();
  type Partial = z.infer<typeof Partial>;
  util.assertEqual<Partial, { a?: string; b?: string }>(true);
});

test("inferred picked object type with optional properties", async () => {
  const Picked = z
    .object({ a: z.string(), b: z.string().optional() })
    .pick({ b: true });
  type Picked = z.infer<typeof Picked>;
  util.assertEqual<Picked, { b?: string }>(true);
});

test("inferred type for unknown/any keys", () => {
  const myType = z.object({
    anyOptional: z.any().optional(),
    anyRequired: z.any(),
    unknownOptional: z.unknown().optional(),
    unknownRequired: z.unknown(),
  });
  type myType = z.infer<typeof myType>;
  util.assertEqual<
    myType,
    {
      anyOptional?: any;
      anyRequired?: any;
      unknownOptional?: unknown;
      unknownRequired?: unknown;
    }
  >(true);
});

test("setKey", () => {
  const base = z.object({ name: z.string() });
  const withNewKey = base.setKey("age", z.number());

  type withNewKey = z.infer<typeof withNewKey>;
  util.assertEqual<withNewKey, { name: string; age: number }>(true);
  withNewKey.parse({ name: "asdf", age: 1234 });
});

test("strictcreate", async () => {
  const strictObj = z.strictObject({
    name: z.string(),
  });

  const syncResult = strictObj.safeParse({ name: "asdf", unexpected: 13 });
  expect(syncResult.success).toEqual(false);

  const asyncResult = await strictObj.spa({ name: "asdf", unexpected: 13 });
  expect(asyncResult.success).toEqual(false);
});

test("object with refine", async () => {
  const schema = z
    .object({
      a: z.string().default("foo"),
      b: z.number(),
    })
    .refine(() => true);
  expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: "foo" });
  const result = await schema.parseAsync({ b: 5 });
  expect(result).toEqual({ b: 5, a: "foo" });
});

test("intersection of object with date", async () => {
  const schema = z.object({
    a: z.date(),
  });
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  });
  const result = await schema.parseAsync({ a: new Date(1637353595983) });
  expect(result).toEqual({ a: new Date(1637353595983) });
});

test("intersection of object with refine with date", async () => {
  const schema = z
    .object({
      a: z.date(),
    })
    .refine(() => true);
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  });
  const result = await schema.parseAsync({ a: new Date(1637353595983) });
  expect(result).toEqual({ a: new Date(1637353595983) });
});

test("constructor key", () => {
  const person = z
    .object({
      name: z.string(),
    })
    .strict();

  expect(() =>
    person.parse({
      name: "bob dylan",
      constructor: 61,
    })
  ).toThrow();
});

test("constructor key", () => {
  const Example = z.object({
    prop: z.string(),
    opt: z.number().optional(),
    arr: z.string().array(),
  });

  type Example = z.infer<typeof Example>;
  util.assertEqual<keyof Example, "prop" | "opt" | "arr">(true);
});

test("unknownkeys merging", () => {
  // This one is "strict"
  const schemaA = z
    .object({
      a: z.string(),
    })
    .strict();

  // This one is "strip"
  const schemaB = z
    .object({
      b: z.string(),
    })
    .catchall(z.string());

  const mergedSchema = schemaA.merge(schemaB);
  type mergedSchema = typeof mergedSchema;
  util.assertEqual<mergedSchema["_def"]["unknownKeys"], "strip">(true);
  expect(mergedSchema._def.unknownKeys).toEqual("strip");

  util.assertEqual<mergedSchema["_def"]["catchall"], z.ZodString>(true);
  expect(mergedSchema._def.catchall instanceof z.ZodString).toEqual(true);
});

const personToExtend = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

test("extend() should return schema with new key", () => {
  const PersonWithNickname = personToExtend.extend({ nickName: z.string() });
  type PersonWithNickname = z.infer<typeof PersonWithNickname>;

  const expected = { firstName: "f", nickName: "n", lastName: "l" };
  const actual = PersonWithNickname.parse(expected);

  expect(actual).toEqual(expected);
  util.assertEqual<
    keyof PersonWithNickname,
    "firstName" | "lastName" | "nickName"
  >(true);
  util.assertEqual<
    PersonWithNickname,
    { firstName: string; lastName: string; nickName: string }
  >(true);
});

test("extend() should have power to override existing key", () => {
  const PersonWithNumberAsLastName = personToExtend.extend({
    lastName: z.number(),
  });
  type PersonWithNumberAsLastName = z.infer<typeof PersonWithNumberAsLastName>;

  const expected = { firstName: "f", lastName: 42 };
  const actual = PersonWithNumberAsLastName.parse(expected);

  expect(actual).toEqual(expected);
  util.assertEqual<
    PersonWithNumberAsLastName,
    { firstName: string; lastName: number }
  >(true);
});

test("passthrough index signature", () => {
  const a = z.object({ a: z.string() });
  type a = z.infer<typeof a>;
  util.assertEqual<{ a: string }, a>(true);
  const b = a.passthrough();
  type b = z.infer<typeof b>;
  util.assertEqual<{ a: string } & { [k: string]: unknown }, b>(true);
});

test("xor", () => {
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  type A = { name: string; a: number };
  type B = { name: string; b: number };
  type C = XOR<A, B>;
  type Outer = { data: C };
  const Outer: z.ZodType<Outer> = z.object({
    data: z.union([
      z.object({ name: z.string(), a: z.number() }),
      z.object({ name: z.string(), b: z.number() }),
    ]),
  });
});

describe(".upgrade()", () => {
  const objectToUpgrade = z.object({
    firstName: z.string(),
    lastName: z.string(),
  });

  test("upgrade() should not have power to override existing key with other z type", () => {
    expect(() => {
      objectToUpgrade.upgrade({
        // @ts-expect-error
        lastName: (lastName) => z.number(),
      });
    }).toThrow("Cannot override existing key 'lastName'");
  });

  test("upgrade() should not have power to override existing key with anything", () => {
    expect(() => {
      objectToUpgrade.upgrade({
        // @ts-expect-error
        lastName: (lastName) => "None",
      });
    }).toThrow("Cannot override existing key 'lastName'");
  });

  test("upgrade() should have power to upgrade existing key", () => {
    const PersonUpgraded = objectToUpgrade.upgrade({
      lastName: (lastName) => lastName.min(2),
    });

    type PersonUpgraded = z.infer<typeof PersonUpgraded>;

    const validPerson: PersonUpgraded = {
      firstName: "John",
      lastName: "Doe",
    };
    expect(PersonUpgraded.parse(validPerson)).toEqual(validPerson);

    expect(() =>
      PersonUpgraded.parse({ firstName: "John", lastName: "D" })
    ).toThrow();

    util.assertEqual<PersonUpgraded, { firstName: string; lastName: string }>(
      true
    );
  });

  test("upgrade() should not have power to add new keys", () => {
    const PersonUpgraded = objectToUpgrade.upgrade({
      // @ts-expect-error
      nickName: () => z.string(),
    });

    type PersonUpgraded = z.infer<typeof PersonUpgraded>;

    util.assertEqual<PersonUpgraded, { firstName: string; lastName: string }>(
      true
    );
  });

  test("flat object", () => {
    const originalSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const upgradedSchema = originalSchema.upgrade({
      name: (name) => name.min(2).max(50),
      age: (age) => age.min(0).max(120),
    });

    expect(upgradedSchema.shape.name).toBeInstanceOf(z.ZodString);
    expect(upgradedSchema.shape.age).toBeInstanceOf(z.ZodNumber);

    expect(upgradedSchema.parse({ name: "John", age: 30 })).toEqual({
      name: "John",
      age: 30,
    });
    expect(() => upgradedSchema.parse({ name: "J", age: 30 })).toThrow();
    expect(() => upgradedSchema.parse({ name: "John", age: -1 })).toThrow();
  });

  test("default upgrade", () => {
    const originalSchema = z.object({
      text: z.string(),
    });

    const upgradedSchema = originalSchema.upgrade({
      text: (text) => text.default("Hello World"),
    });

    expect(upgradedSchema.shape.text).toBeInstanceOf(z.ZodDefault);

    expect(upgradedSchema.parse({})).toEqual({
      text: "Hello World",
    });
  });

  test("optional upgrade", () => {
    const originalSchema = z.object({
      text: z.string(),
    });

    const upgradedSchema = originalSchema.upgrade({
      text: (text) => text.optional(),
    });

    expect(upgradedSchema.shape.text).toBeInstanceOf(z.ZodOptional);

    expect(upgradedSchema.parse({})).toEqual({});
  });

  test("enum w/ default", () => {
    const originalSchema = z.object({
      theme: z.enum(["light", "dark"]),
    });

    const upgradedSchema = originalSchema.upgrade({
      theme: (theme) => theme.default("light"),
    });

    expect(upgradedSchema.shape.theme).toBeInstanceOf(z.ZodDefault);

    expect(
      upgradedSchema.parse({
        theme: "dark",
      })
    ).toEqual({
      theme: "dark",
    });

    expect(() =>
      upgradedSchema.parse({
        theme: "lol",
      })
    ).toThrow();

    expect(upgradedSchema.parse({})).toEqual({
      theme: "light",
    });
  });

  test("nested objects", () => {
    const originalSchema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string(),
      }),
      settings: z.object({
        theme: z.string(),
      }),
    });

    const upgradedSchema = originalSchema.upgrade({
      user: {
        name: (name) => name.min(2).max(50),
        email: (email) => email.email(),
      },
      settings: {
        theme: (theme) => theme.trim(),
      },
    });

    expect(upgradedSchema.shape.user).toBeInstanceOf(z.ZodObject);
    expect(upgradedSchema.shape.settings).toBeInstanceOf(z.ZodObject);

    expect(
      upgradedSchema.parse({
        user: { name: "John", email: "john@example.com" },
        settings: { theme: "dark" },
      })
    ).toEqual({
      user: { name: "John", email: "john@example.com" },
      settings: { theme: "dark" },
    });

    expect(() =>
      upgradedSchema.parse({
        user: { name: "J", email: "john@example.com" },
        settings: { theme: "dark" },
      })
    ).toThrow();

    expect(() =>
      upgradedSchema.parse({
        user: { name: "John", email: "not-an-email" },
        settings: { theme: "dark" },
      })
    ).toThrow();
  });

  test("preserve non-upgraded fields", () => {
    const originalSchema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string(),
    });

    const upgradedSchema = originalSchema.upgrade({
      name: (name) => name.min(2),
      email: (email) => email.email(),
    });

    expect(upgradedSchema.shape.age).toBe(originalSchema.shape.age);

    expect(
      upgradedSchema.parse({
        name: "John",
        age: 30,
        email: "john@example.com",
      })
    ).toEqual({ name: "John", age: 30, email: "john@example.com" });
  });

  test("handle arrays", () => {
    const originalSchema = z.object({
      tags: z.array(z.string()),
    });

    const upgradedSchema = originalSchema.upgrade({
      tags: (tags) => tags.min(1).max(5),
    });

    expect(upgradedSchema.shape.tags).toBeInstanceOf(z.ZodArray);

    expect(upgradedSchema.parse({ tags: ["a", "b", "c"] })).toEqual({
      tags: ["a", "b", "c"],
    });

    expect(() => upgradedSchema.parse({ tags: [] })).toThrow();

    expect(() =>
      upgradedSchema.parse({ tags: ["a", "b", "c", "d", "e", "f"] })
    ).toThrow();
  });

  test("complex nested structures", () => {
    const originalSchema = z.object({
      user: z.object({
        name: z.string(),
        contacts: z.array(
          z.object({
            type: z.enum(["email", "phone"]),
            value: z.string(),
          })
        ),
      }),
    });

    const upgradedSchema = originalSchema.upgrade({
      user: {
        name: (name) => name.min(2).max(50),
        contacts: (contacts) => contacts.min(1).max(3),
      },
    });

    expect(upgradedSchema.shape.user).toBeInstanceOf(z.ZodObject);

    const validData = {
      user: {
        name: "John",
        contacts: [
          { type: "email", value: "john@example.com" },
          { type: "phone", value: "1234567890" },
        ],
      },
    };

    expect(upgradedSchema.parse(validData)).toEqual(validData);

    expect(() =>
      upgradedSchema.parse({
        user: {
          name: "J",
          contacts: [],
        },
      })
    ).toThrow();
  });

  // it.todo("can we upgrade elements in an array ?", () => {
  //   // or do we also remove array beforehand ?
  // });

  // Test ZodOptional
  test("should add ZodOptional to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.optional(),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodOptional);
    expect(upgradedSchema.parse({})).toEqual({});
    expect(upgradedSchema.parse({ field: "test" })).toEqual({
      field: "test",
    });
  });

  // Test ZodNullable
  test("should add ZodNullable to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.nullable(),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodNullable);
    expect(upgradedSchema.parse({ field: null })).toEqual({ field: null });
    expect(upgradedSchema.parse({ field: "test" })).toEqual({
      field: "test",
    });
    expect(() => upgradedSchema.parse({ field: undefined })).toThrow(
      z.ZodError
    );
  });

  // Test ZodPromise
  test("should add ZodPromise to a field", async () => {
    const originalSchema = z.object({ field: z.number() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => z.promise(field),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodPromise);
  });

  // Test ZodLazy (with recursive structure)
  test("should add ZodLazy to create a recursive structure", () => {
    type Tree = { value: number; children?: Tree[] };
    const treeSchema: z.ZodType<Tree> = z.lazy(() =>
      z.object({
        value: z.number(),
        children: z.array(treeSchema).optional(),
      })
    );

    const originalSchema = z.object({ tree: z.number() });
    const upgradedSchema = originalSchema.upgrade({
      tree: () => treeSchema,
    });

    expect(upgradedSchema.shape.tree).toBeInstanceOf(z.ZodLazy);
    expect(
      upgradedSchema.parse({ tree: { value: 1, children: [{ value: 2 }] } })
    ).toEqual({ tree: { value: 1, children: [{ value: 2 }] } });
    expect(() => upgradedSchema.parse({ tree: { value: "1" } })).toThrow(
      z.ZodError
    );
  });

  // Test ZodCatch
  test("should add ZodCatch to a field", () => {
    const originalSchema = z.object({ field: z.number() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.catch(0),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodCatch);
    expect(upgradedSchema.parse({ field: 5 })).toEqual({ field: 5 });
    expect(upgradedSchema.parse({ field: "invalid" })).toEqual({ field: 0 });
  });

  // Test ZodPipeline
  test("should add ZodPipeline to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.pipe(z.coerce.number()),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodPipeline);
    expect(upgradedSchema.parse({ field: "5" })).toEqual({ field: 5 });
    expect(() => upgradedSchema.parse({ field: "invalid" })).toThrow(
      z.ZodError
    );
  });

  // Test ZodUnion
  test("should add ZodUnion to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => z.union([field, z.number()]),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodUnion);
    expect(upgradedSchema.parse({ field: "test" })).toEqual({
      field: "test",
    });
    expect(upgradedSchema.parse({ field: 5 })).toEqual({ field: 5 });
    expect(() => upgradedSchema.parse({ field: true })).toThrow(z.ZodError);
  });

  // Test ZodIntersection
  test("should add ZodIntersection to a field", () => {
    const originalSchema = z.object({ field: z.object({ a: z.string() }) });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => z.intersection(field, z.object({ b: z.number() })),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodIntersection);
    expect(upgradedSchema.parse({ field: { a: "test", b: 5 } })).toEqual({
      field: { a: "test", b: 5 },
    });
    expect(() => upgradedSchema.parse({ field: { a: "test" } })).toThrow(
      z.ZodError
    );
  });

  // Test ZodEffects (with multiple effect types)
  test("should add various ZodEffects to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) =>
        field
          .transform((val) => val.toUpperCase())
          .refine((val) => val.length > 3, {
            message: "String must be longer than 3 characters",
          })
          .transform((val) => ({ value: val })),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodEffects);
    expect(upgradedSchema.parse({ field: "test" })).toEqual({
      field: { value: "TEST" },
    });
    expect(() => upgradedSchema.parse({ field: "ab" })).toThrow(z.ZodError);
  });

  // Test ZodReadonly
  test("should add ZodReadonly to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.readonly(),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodReadonly);
    expect(upgradedSchema.parse({ field: "test" })).toEqual({
      field: "test",
    });
  });

  // Test ZodBranded (with type checking)
  test("should add ZodBranded to a field", () => {
    const originalSchema = z.object({ field: z.string() });
    const upgradedSchema = originalSchema.upgrade({
      field: (field) => field.brand<"special">(),
    });

    expect(upgradedSchema.shape.field).toBeInstanceOf(z.ZodBranded);
    const result = upgradedSchema.parse({ field: "test" });
    expect(result).toEqual({ field: "test" });

    // Type checking (this would cause a TypeScript error if uncommented)
    // const wrongType: { field: string } = result;
  });
});
