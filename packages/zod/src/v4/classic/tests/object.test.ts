import { describe, expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});

test("object type inference", () => {
  type TestType = {
    f1: number;
    f2?: string | undefined;
    f3: string | null;
    f4: { t: string | boolean }[];
  };

  expectTypeOf<z.TypeOf<typeof Test>>().toEqualTypeOf<TestType>();
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

test("nonstrict by default", () => {
  z.object({ points: z.number() }).parse({
    points: 2314,
    unknown: "asdf",
  });
});

test("parse optional keys ", () => {
  const schema = z.object({
    a: z.string().optional(),
  });
  expect(schema.parse({ a: "asdf" })).toEqual({ a: "asdf" });
});

test("empty object", () => {
  const schema = z.object({});
  expect(schema.parse({})).toEqual({});
  expect(schema.parse({ name: "asdf" })).toEqual({});
  expect(schema.safeParse(null).success).toEqual(false);
  expect(schema.safeParse("asdf").success).toEqual(false);
  expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<Record<string, never>>();
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
  const val = z.object({ points: z.number() }).strict().passthrough().strip().passthrough().parse(data);

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
  // expectTypeOf<(typeof d1)["asdf"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof d1)["first"]>().toEqualTypeOf<string>();
});

test("catchall overrides strict", () => {
  const o1 = z.object({ first: z.string().optional() }).strict().catchall(z.number());

  // should run fine setting a catchall overrides the unknownKeys behavior
  o1.parse({
    asdf: 1234,
  });

  // should only run catchall validation against unknown keys
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

  // should run fine setting a catchall overrides the unknownKeys behavior
  o1.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("optional keys are unset", () => {
  const SNamedEntity = z.object({
    id: z.string(),
    set: z.string().optional(),
    unset: z.string().optional(),
  });
  const result = SNamedEntity.parse({
    id: "asdf",
    set: undefined,
  });
  expect(Object.keys(result)).toEqual(["id", "set"]);
});

test("catchall parsing", async () => {
  const result = z.object({ name: z.string() }).catchall(z.number()).parse({ name: "Foo", validExtraKey: 61 });

  expect(result).toEqual({ name: "Foo", validExtraKey: 61 });

  const result2 = z
    .object({ name: z.string() })
    .catchall(z.number())
    .safeParse({ name: "Foo", validExtraKey: 61, invalid: "asdf" });

  expect(result2.success).toEqual(false);
});

test("nonexistent keys", async () => {
  const Schema = z.union([z.object({ a: z.string() }), z.object({ b: z.number() })]);
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

  expectTypeOf<asdf>().toEqualTypeOf<{ a: number }>();
});

test("inferred type with Record shape", () => {
  type A = z.ZodObject<Record<string, z.ZodType<string, number>>>;
  expectTypeOf<z.infer<A>>().toEqualTypeOf<Record<string, string>>();
  expectTypeOf<z.input<A>>().toEqualTypeOf<Record<string, number>>();

  type B = z.ZodObject;
  expectTypeOf<z.infer<B>>().toEqualTypeOf<Record<string, unknown>>();
  expectTypeOf<z.input<B>>().toEqualTypeOf<Record<string, unknown>>();
});

test("inferred merged object type with optional properties", async () => {
  const Merged = z
    .object({ a: z.string(), b: z.string().optional() })
    .merge(z.object({ a: z.string().optional(), b: z.string() }));
  type Merged = z.infer<typeof Merged>;
  expectTypeOf<Merged>().toEqualTypeOf<{ a?: string | undefined; b: string }>();
});

test("inferred unioned object type with optional properties", async () => {
  const Unioned = z.union([
    z.object({ a: z.string(), b: z.string().optional() }),
    z.object({ a: z.string().optional(), b: z.string() }),
  ]);
  type Unioned = z.infer<typeof Unioned>;
  expectTypeOf<Unioned>().toEqualTypeOf<
    { a: string; b?: string | undefined } | { a?: string | undefined; b: string }
  >();
});

test("inferred enum type", async () => {
  const Enum = z.object({ a: z.string(), b: z.string().optional() }).keyof();

  expect(Enum.enum).toEqual({
    a: "a",
    b: "b",
  });

  expect(Enum._zod.def.entries).toEqual({
    a: "a",
    b: "b",
  });
  type Enum = z.infer<typeof Enum>;
  expectTypeOf<Enum>().toEqualTypeOf<"a" | "b">();
});

test("z.keyof returns enum", () => {
  const User = z.object({ name: z.string(), age: z.number() });
  const keysSchema = z.keyof(User);
  expect(keysSchema.enum).toEqual({
    name: "name",
    age: "age",
  });
  expect(keysSchema._zod.def.entries).toEqual({
    name: "name",
    age: "age",
  });
  type Keys = z.infer<typeof keysSchema>;
  expectTypeOf<Keys>().toEqualTypeOf<"name" | "age">();
});

test("inferred partial object type with optional properties", async () => {
  const Partial = z.object({ a: z.string(), b: z.string().optional() }).partial();
  type Partial = z.infer<typeof Partial>;
  expectTypeOf<Partial>().toEqualTypeOf<{ a?: string | undefined; b?: string | undefined }>();
});

test("inferred picked object type with optional properties", async () => {
  const Picked = z.object({ a: z.string(), b: z.string().optional() }).pick({ b: true });
  type Picked = z.infer<typeof Picked>;
  expectTypeOf<Picked>().toEqualTypeOf<{ b?: string | undefined }>();
});

test("inferred type for unknown/any keys", () => {
  const myType = z.object({
    anyOptional: z.any().optional(),
    anyRequired: z.any(),
    unknownOptional: z.unknown().optional(),
    unknownRequired: z.unknown(),
  });
  type myType = z.infer<typeof myType>;
  expectTypeOf<myType>().toEqualTypeOf<{
    anyOptional?: any;
    anyRequired: any;
    unknownOptional?: unknown;
    unknownRequired: unknown;
  }>();
});

test("strictObject", async () => {
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
  expect(z.intersection(schema, schema).parse({ a: new Date(1637353595983) })).toEqual({
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
  expect(z.intersection(schema, schema).parse({ a: new Date(1637353595983) })).toEqual({
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
  expectTypeOf<keyof Example>().toEqualTypeOf<"prop" | "opt" | "arr">();
});

test("catchall", () => {
  const a = z.object({});
  expect(a._zod.def.catchall).toBeUndefined();

  const b = z.strictObject({});
  expect(b._zod.def.catchall).toBeInstanceOf(core.$ZodNever);

  const c = z.looseObject({});
  expect(c._zod.def.catchall).toBeInstanceOf(core.$ZodUnknown);

  const d = z.object({}).catchall(z.number());
  expect(d._zod.def.catchall).toBeInstanceOf(core.$ZodNumber);
});

test("unknownkeys merging", () => {
  // This one is "strict"
  const a = z.looseObject({
    a: z.string(),
  });

  const b = z.strictObject({ b: z.string() });

  // incoming object overrides
  const c = a.merge(b);
  expect(c._zod.def.catchall).toBeInstanceOf(core.$ZodNever);
});

test("merge() throws when receiver has refinements", () => {
  const a = z
    .object({
      password: z.string(),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword);

  const b = z.object({ email: z.string() });

  expect(() => a.merge(b)).toThrow(".merge() cannot be used on object schemas containing refinements");
});

test("merge() throws when receiver has superRefine", () => {
  const a = z.object({ x: z.string() }).superRefine(() => {});
  const b = z.object({ y: z.number() });

  expect(() => a.merge(b)).toThrow(".merge() cannot be used on object schemas containing refinements");
});

test("merge() preserves refinements on the second schema", () => {
  const a = z.object({ name: z.string() });
  const b = z.object({ age: z.number() }).refine((data) => data.age >= 18, { message: "Must be 18+" });

  const merged = a.merge(b);

  expect(merged.parse({ name: "n", age: 21 })).toEqual({ name: "n", age: 21 });
  expect(() => merged.parse({ name: "n", age: 12 })).toThrow("Must be 18+");
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
  expectTypeOf<keyof PersonWithNickname>().toEqualTypeOf<"firstName" | "lastName" | "nickName">();
  expectTypeOf<PersonWithNickname>().toEqualTypeOf<{ firstName: string; lastName: string; nickName: string }>();
});

test("extend() should have power to override existing key", () => {
  const PersonWithNumberAsLastName = personToExtend.extend({
    lastName: z.number(),
  });
  type PersonWithNumberAsLastName = z.infer<typeof PersonWithNumberAsLastName>;

  const expected = { firstName: "f", lastName: 42 };
  const actual = PersonWithNumberAsLastName.parse(expected);

  expect(actual).toEqual(expected);
  expectTypeOf<PersonWithNumberAsLastName>().toEqualTypeOf<{ firstName: string; lastName: number }>();
});

test("safeExtend() should have power to override existing key", () => {
  const PersonWithMinLastName = personToExtend.safeExtend({
    lastName: z.string().min(3),
  });
  type PersonWithMinLastName = z.infer<typeof PersonWithMinLastName>;

  const expected = { firstName: "f", lastName: "abc" };
  const actual = PersonWithMinLastName.parse(expected);

  expect(actual).toEqual(expected);
  expect(() => PersonWithMinLastName.parse({ firstName: "f", lastName: "ab" })).toThrow();
  expectTypeOf<PersonWithMinLastName>().toEqualTypeOf<{ firstName: string; lastName: string }>();
});

test("safeExtend() maintains refinements", () => {
  const schema = z.object({ name: z.string().min(1) });
  const extended = schema.safeExtend({ name: z.string().min(2) });
  expect(() => extended.parse({ name: "" })).toThrow();
  expect(extended.parse({ name: "ab" })).toEqual({ name: "ab" });
  type Extended = z.infer<typeof extended>;
  expectTypeOf<Extended>().toEqualTypeOf<{ name: string }>();
  // @ts-expect-error
  schema.safeExtend({ name: z.number() });
});

test("passthrough index signature", () => {
  const a = z.object({ a: z.string() });
  type a = z.infer<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<{ a: string }>();
  const b = a.passthrough();
  type b = z.infer<typeof b>;
  expectTypeOf<b>().toEqualTypeOf<{ a: string; [k: string]: unknown }>();
});

// test("xor", () => {
//   type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
//   type XOR<T, U> = T extends object ? (U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U) : T;

//   type A = { name: string; a: number };
//   type B = { name: string; b: number };
//   type C = XOR<A, B>;
//   type Outer = { data: C };
//   const Outer = z.object({
//     data: z.union([z.object({ name: z.string(), a: z.number() }), z.object({ name: z.string(), b: z.number() })]),
//   }) satisfies z.ZodType<Outer, any>;
// });

test("assignability", () => {
  z.object({ a: z.string() }) satisfies z.ZodObject<{ a: z.ZodString }>;
  z.object({ a: z.string() }).catchall(z.number()) satisfies z.ZodObject<{ a: z.ZodString }>;
  z.object({ a: z.string() }).strict() satisfies z.ZodObject;
  z.object({}) satisfies z.ZodObject;

  z.looseObject({ name: z.string() }) satisfies z.ZodObject<
    {
      name: z.ZodString;
    },
    z.core.$loose
  >;
  z.looseObject({ name: z.string() }) satisfies z.ZodObject<{
    name: z.ZodString;
  }>;
  z.strictObject({ name: z.string() }) satisfies z.ZodObject<
    {
      name: z.ZodString;
    },
    z.core.$loose
  >;
  z.strictObject({ name: z.string() }) satisfies z.ZodObject<
    {
      name: z.ZodString;
    },
    z.core.$strict
  >;
  z.object({ name: z.string() }) satisfies z.ZodObject<{
    name: z.ZodString;
  }>;
  z.object({
    a: z.string(),
    b: z.number(),
    c: z.boolean(),
  }) satisfies z.core.$ZodObject;
});

test("null prototype", () => {
  const schema = z.object({ a: z.string() });
  const obj = Object.create(null);
  obj.a = "foo";
  expect(schema.parse(obj)).toEqual({ a: "foo" });
});

test("empty objects", () => {
  const A = z.looseObject({});
  type Ain = z.input<typeof A>;
  expectTypeOf<Ain>().toEqualTypeOf<Record<string, unknown>>();
  type Aout = z.output<typeof A>;
  expectTypeOf<Aout>().toEqualTypeOf<Record<string, unknown>>();

  const B = z.object({});
  type Bout = z.output<typeof B>;
  expectTypeOf<Bout>().toEqualTypeOf<Record<string, never>>();
  type Bin = z.input<typeof B>;
  expectTypeOf<Bin>().toEqualTypeOf<Record<string, never>>();

  const C = z.strictObject({});
  type Cout = z.output<typeof C>;
  expectTypeOf<Cout>().toEqualTypeOf<Record<string, never>>();
  type Cin = z.input<typeof C>;
  expectTypeOf<Cin>().toEqualTypeOf<Record<string, never>>();
});

test("preserve key order", () => {
  const schema = z.object({
    a: z.string().optional(),
    b: z.string(),
  });
  const r1 = schema.safeParse({ a: "asdf", b: "qwer" });
  const r2 = schema.safeParse({ a: "asdf", b: "qwer" }, { jitless: true });

  expect(Object.keys(r1.data!)).toMatchInlineSnapshot(`
    [
      "a",
      "b",
    ]
  `);
  expect(Object.keys(r1.data!)).toEqual(Object.keys(r2.data!));
});

test("empty shape", () => {
  const a = z.object({});

  a.parse({});
  a.parse({}, { jitless: true });
  a.parse(Object.create(null));
  a.parse(Object.create(null), { jitless: true });

  expect(() => a.parse([])).toThrow();
  expect(() => a.parse([], { jitless: true })).toThrow();
});

test("zodtype assignability", () => {
  // Does not error
  z.object({ hello: z.string().optional() }) satisfies z.ZodType<{ hello?: string | undefined }>;
  z.object({ hello: z.string() }) satisfies z.ZodType<{ hello?: string | undefined }>;
  // @ts-expect-error
  z.object({}) satisfies z.ZodType<{ hello: string | undefined }>;
  // @ts-expect-error
  z.object({ hello: z.string().optional() }) satisfies z.ZodType<{ hello: string | undefined }>;
  // @ts-expect-error
  z.object({ hello: z.string().optional() }) satisfies z.ZodType<{ hello: string }>;
  // @ts-expect-error
  z.object({ hello: z.number() }) satisfies z.ZodType<{ hello?: string | undefined }>;
});

test("index signature in shape", () => {
  function makeZodObj<const T extends string>(key: T) {
    return z.looseObject({
      [key]: z.string(),
    });
  }

  const schema = makeZodObj("foo");
  type schema = z.infer<typeof schema>;

  expectTypeOf<schema>().toEqualTypeOf<Record<string, string>>();
});

test("extend() on object with refinements should throw when overwriting properties", () => {
  const schema = z
    .object({
      a: z.string(),
    })
    .refine(() => true);

  expect(() => schema.extend({ a: z.number() })).toThrow();
});

test("extend() on object with refinements should not throw when adding new properties", () => {
  const schema = z
    .object({
      a: z.string(),
    })
    .refine((data) => data.a.length > 0);

  // Should not throw since 'b' doesn't overlap with 'a'
  const extended = schema.extend({ b: z.number() });

  // Verify the extended schema works correctly
  expect(extended.parse({ a: "hello", b: 42 })).toEqual({ a: "hello", b: 42 });

  // Verify the original refinement still applies
  expect(() => extended.parse({ a: "", b: 42 })).toThrow();
});

test("safeExtend() on object with refinements should not throw", () => {
  const schema = z
    .object({
      a: z.string(),
    })
    .refine(() => true);

  expect(() => schema.safeExtend({ b: z.string() })).not.toThrow();
});

// __proto__ in input must not replace the prototype of the parsed object via the assignment setter on the result {}.
describe("__proto__ in object catchall paths", () => {
  const protoInput = () => JSON.parse('{"__proto__":{"isAdmin":true},"name":"alice"}');

  test("looseObject drops __proto__ and preserves Object.prototype", () => {
    const schema = z.looseObject({ name: z.string() });
    const parsed = schema.parse(protoInput());
    expect(Object.keys(parsed)).toEqual(["name"]);
    expect((parsed as any).isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  test("passthrough drops __proto__", () => {
    const schema = z.object({ name: z.string() }).passthrough();
    const parsed = schema.parse(protoInput());
    expect((parsed as any).isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  test("catchall(unknown) drops __proto__", () => {
    const schema = z.object({ name: z.string() }).catchall(z.unknown());
    const parsed = schema.parse(protoInput());
    expect((parsed as any).isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  test("safeParseAsync + jitless drops __proto__", async () => {
    const schema = z.looseObject({ name: z.string() });
    const result = await schema.safeParseAsync(protoInput(), { jitless: true } as any);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).isAdmin).toBeUndefined();
      expect(Object.getPrototypeOf(result.data)).toBe(Object.prototype);
    }
  });

  test("strict surfaces __proto__ as unrecognized without copying it", () => {
    const schema = z.object({ name: z.string() }).strict();
    const result = schema.safeParse(protoInput());
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe("unrecognized_keys");
      expect((result.error.issues[0] as any).keys).toEqual(["__proto__"]);
    }
  });

  test("strict accepts but strips a __proto__ key the shape declares", () => {
    const shape: any = { name: z.string() };
    Object.defineProperty(shape, "__proto__", {
      value: z.string(),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    const input = JSON.parse('{"name":"alice","__proto__":"hello"}');

    for (const schema of [z.object(shape).strict(), z.object(shape).catchall(z.any()), z.object(shape)]) {
      const result = schema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data)).toEqual(["name"]);
        expect(Object.getPrototypeOf(result.data)).toBe(Object.prototype);
      }
    }
  });

  test("strictObject and jitless agree with .strict()", async () => {
    for (const schema of [z.strictObject({ name: z.string() }), z.object({ name: z.string() }).strict()]) {
      for (const result of [
        schema.safeParse(protoInput()),
        await schema.safeParseAsync(protoInput(), {
          jitless: true,
        } as any),
      ]) {
        expect(result.success).toBe(false);
        if (!result.success) {
          expect((result.error.issues[0] as any).keys).toEqual(["__proto__"]);
        }
      }
    }
  });
});

// Parsed objects always strip __proto__, including keys explicitly declared by the schema.
describe("__proto__ as a declared shape key", () => {
  const protoInput = () => JSON.parse('{"__proto__":{"isAdmin":true},"name":"alice"}');
  const makeShape = () =>
    Object.fromEntries([
      ["__proto__", z.object({ isAdmin: z.boolean() })],
      ["name", z.string()],
    ]) as Record<string, any>;

  const expectStripped = (parsed: any) => {
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(parsed, "__proto__")).toBe(false);
    expect((parsed as any).isAdmin).toBeUndefined();
    expect(Object.keys(parsed)).toEqual(["name"]);
  };

  test("jit fastpass", () => {
    expectStripped(z.object(makeShape()).parse(protoInput()));
  });

  test("jitless", () => {
    expectStripped(z.object(makeShape()).parse(protoInput(), { jitless: true } as any));
  });

  test("async", async () => {
    const shape = Object.fromEntries([
      ["__proto__", z.object({ isAdmin: z.boolean() }).refine(async () => true)],
      ["name", z.string()],
    ]) as Record<string, any>;
    expectStripped(await z.object(shape).parseAsync(protoInput()));
  });

  test("primitive value is stripped", () => {
    const schema = z.object(Object.fromEntries([["__proto__", z.string()]]) as Record<string, any>);
    const parsed: any = schema.parse(JSON.parse('{"__proto__":"hello"}'));
    expect(Object.prototype.hasOwnProperty.call(parsed, "__proto__")).toBe(false);
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  test("declared key is not validated", () => {
    const schema = z.object(Object.fromEntries([["__proto__", z.string()]]) as Record<string, any>);
    expect(schema.parse(JSON.parse('{"__proto__":123}'))).toEqual({});
  });

  test("required, optional, and defaulted declarations are all stripped", () => {
    const shape = (schema: z.ZodType) => Object.fromEntries([["__proto__", schema]]) as Record<string, any>;

    for (const jitless of [false, true]) {
      const ctx = { jitless } as any;
      expect(z.object(shape(z.unknown())).parse({}, ctx)).toEqual({});
      expect(z.object(shape(z.string().optional())).parse({}, ctx)).toEqual({});
      expect(z.object(shape(z.string().default("fallback"))).parse({}, ctx)).toEqual({});
    }
  });

  test("an own getter is not evaluated", () => {
    let reads = 0;
    const input = Object.defineProperty({}, "__proto__", {
      get() {
        reads++;
        return "value";
      },
      enumerable: true,
    });
    const schema = z.object(Object.fromEntries([["__proto__", z.string()]]) as Record<string, any>);

    expect(schema.parse(input)).toEqual({});
    expect(reads).toBe(0);
  });

  test("pick keeps a declared key", () => {
    const shape = Object.fromEntries([["__proto__", z.string()]]) as Record<string, any>;
    const mask = Object.fromEntries([["__proto__", true]]) as Record<string, true>;
    const picked = z.object(shape).pick(mask);

    expect(Object.keys(picked.shape)).toEqual(["__proto__"]);
    const parsed: any = picked.parse(Object.fromEntries([["__proto__", "value"]]));
    expect(parsed).toEqual({});
    expect(() => z.object({ value: z.string() }).pick(mask as any).shape).toThrow('Unrecognized key: "__proto__"');
  });

  test.each(["omit", "partial", "required"] as const)("%s rejects an undeclared key", (method) => {
    const mask = Object.fromEntries([["__proto__", true]]);
    const schema = z.object({ value: z.string() });

    expect(() => (schema[method] as any)(mask).shape).toThrow('Unrecognized key: "__proto__"');
  });

  test("shape helpers preserve a declared key", () => {
    const shape = () =>
      Object.fromEntries([
        ["__proto__", z.string()],
        ["value", z.string()],
      ]) as Record<string, any>;
    const protoMask = Object.fromEntries([["__proto__", true]]);
    const valueMask = { value: true } as const;
    const shapes = [
      z.object(shape()).omit(valueMask).shape,
      z.object(shape()).partial(protoMask as any).shape,
      z.object(shape()).required(protoMask as any).shape,
    ];

    for (const next of shapes) {
      expect(Object.getPrototypeOf(next)).toBe(Object.prototype);
      expect(Object.prototype.hasOwnProperty.call(next, "__proto__")).toBe(true);
    }
  });

  test("Object.prototype is untouched", () => {
    z.object(makeShape()).parse(protoInput());
    expect(({} as any).isAdmin).toBeUndefined();
  });
});

test("object parsing still reads ordinary inherited properties", () => {
  const input = Object.create({ value: "inherited" });
  const schema = z.object({ value: z.string() });

  expect(schema.parse(input)).toEqual({ value: "inherited" });
  expect(schema.parse(input, { jitless: true } as any)).toEqual({ value: "inherited" });
});

describe("symbol keys in object shape", () => {
  const SYM = Symbol("sym");
  const OTHER = Symbol("other");

  test("parses and validates a declared symbol key", () => {
    const schema = z.object({ name: z.string(), [SYM]: z.number() });
    expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<{ name: string; [SYM]: number }>();

    for (const params of [undefined, { jitless: true } as any]) {
      expect(schema.parse({ name: "alice", [SYM]: 42 }, params)).toEqual({ name: "alice", [SYM]: 42 });
      expect(schema.safeParse({ name: "alice", [SYM]: "nope" }, params).success).toBe(false);
      expect(schema.safeParse({ name: "alice" }, params).success).toBe(false);
    }
  });

  test("reports an invalid symbol value at the symbol's own path", () => {
    const schema = z.object({ [SYM]: z.number() });
    const result = schema.safeParse({ [SYM]: "nope" });
    expect(result.error!.issues[0].path).toEqual([SYM]);
  });

  test("honours optionality and defaults on a symbol key", () => {
    expect(z.object({ [SYM]: z.number().optional() }).parse({})).toEqual({});
    expect(z.object({ [SYM]: z.number().default(7) }).parse({})).toEqual({ [SYM]: 7 });
  });

  test("a declared symbol key survives strict and loose", () => {
    expect(z.strictObject({ [SYM]: z.number() }).safeParse({ [SYM]: 1 }).success).toBe(true);
    expect(z.strictObject({ [SYM]: z.number() }).safeParse({ [SYM]: 1, extra: 1 }).success).toBe(false);
    expect(z.looseObject({ [SYM]: z.number() }).parse({ [SYM]: 1, extra: "e" })).toEqual({ [SYM]: 1, extra: "e" });
  });

  // Deliberate: hunting each input for undeclared symbols costs a `getOwnPropertySymbols` call on every parse of every strict/loose/catchall object, which measured +16-44% on `z.strictObject`. Declared keys are static and cost nothing, so only they are supported.
  test("an undeclared symbol key is ignored, not passed through or flagged", () => {
    expect(z.looseObject({ name: z.string() }).parse({ name: "a", [OTHER]: "x" })).toEqual({ name: "a" });
    expect(z.strictObject({ name: z.string() }).safeParse({ name: "a", [OTHER]: "x" }).success).toBe(true);
  });

  test("builder methods reach symbol keys", () => {
    const base = z.object({ a: z.string(), [SYM]: z.number() });
    expect(base.partial().safeParse({ a: "x" }).success).toBe(true);
    expect(base.partial().required().safeParse({ a: "x" }).success).toBe(false);
    expect(Reflect.ownKeys(base.pick({ [SYM]: true }).shape)).toEqual([SYM]);
    expect(Reflect.ownKeys(base.omit({ [SYM]: true }).shape)).toEqual(["a"]);
    expect(Reflect.ownKeys(z.object({ a: z.string() }).extend({ [SYM]: z.number() }).shape)).toEqual(["a", SYM]);
  });

  test("a cycle through a symbol key is detected like a string-keyed one", () => {
    const A: any = z.object({
      name: z.string(),
      get [SYM]() {
        return A.optional();
      },
    });
    const input: any = { name: "root" };
    input[SYM] = input;
    expect(A.safeParse(input).success).toBe(true);
    expect(() => z.compile(A, { strict: true })).toThrow(/does not support/);
  });

  test("extend's refinement-overlap guard sees symbol keys", () => {
    const refined = z.object({ a: z.string(), [SYM]: z.number() }).refine(() => true);
    expect(() => refined.extend({ a: z.string() })).toThrow(/Cannot overwrite keys/);
    expect(() => refined.extend({ [SYM]: z.string() })).toThrow(/Cannot overwrite keys/);
  });

  test("a symbol key is unrepresentable in JSON Schema", () => {
    const schema = z.object({ a: z.string(), [SYM]: z.number() });
    expect(() => z.toJSONSchema(schema)).toThrow(/Symbol keys cannot be represented/);
    expect(z.toJSONSchema(schema, { unrepresentable: "any" })).toMatchObject({ properties: { a: { type: "string" } } });
  });

  test("rejects a non-schema value under a symbol key", () => {
    expect(() => z.object({ [SYM]: 123 as any }).parse({})).toThrow(/Invalid element at key "Symbol\(sym\)"/);
  });
});
