import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod";

test("object type inference", () => {
  const Test = z.interface({
    f1: z.number(),
    "f2?": z.string(),
    f3: z.string().nullable(),
    f4: z.array(z.interface({ t: z.union([z.string(), z.boolean()]) })),
  });

  type Test = z.output<typeof Test>;
  type TestType = {
    f1: number;
    f2?: string | undefined;
    f3: string | null;
    f4: { t: string | boolean }[];
  };

  expectTypeOf<Test>().toEqualTypeOf<TestType>();

  const data = {
    f1: 12,
    f2: "string",
    f3: "string",
    f4: [
      {
        t: "string",
      },
    ],
  };
  expect(Test.parse(data)).toEqual(data);
  expect(Test.safeParse("foo")).toMatchObject({ success: false });
});

// test("shape() should return schema of particular key", () => {
//   const schema = z.interface({
//     name: z.string(),
//   });

//   expect(schema.shape.name).toBeInstanceOf(z.ZodString);
// });

test("optional with .optional()", () => {
  const schema = z.interface({
    a: z.string().optional(),
  });

  expect(schema.parse({})).toEqual({ a: undefined });
  expect(schema.parse({ a: undefined })).toEqual({ a: undefined });
});

test("question mark optional", () => {
  const schema = z.interface({
    "a?": z.string().optional(),
  });
  expect(schema.parse({})).toEqual({});
  expect("a" in schema.parse({})).toEqual(false);
  expect(schema.parse({ a: undefined })).toEqual({ a: undefined });
  expect("a" in schema.parse({ a: undefined })).toEqual(true);
  expect(schema.parse({ a: "foo" })).toEqual({ a: "foo" });
});

test("defaulted key", () => {
  const schema = z.interface({
    "?a": z.string().default("asdf"),
  });

  expectTypeOf<typeof schema._zod.input>().toEqualTypeOf<{ a?: string }>();
  expectTypeOf<typeof schema._zod.output>().toEqualTypeOf<{ a: string }>();
  expect(schema.parse({})).toEqual({ a: "asdf" });
  expect(schema.parse({ a: undefined })).toEqual({ a: "asdf" });
});

test("z.interface - strip by default", () => {
  const schema = z.interface({ points: z.number() });
  const data = { points: 2314, unknown: "asdf" };
  const result = schema.safeParse(data);
  expect(result.data).toEqual({ points: 2314 });
});

test("z.looseInterface", () => {
  const schema = z.looseInterface({ points: z.number() });
  const data = { points: 2314, unknown: "asdf" };
  const val = schema.parse(data);
  expect(val).toEqual(data);
});

test("strict", () => {
  const schema = z.strictInterface({ points: z.number() });
  const data = { points: 2314, unknown: "asdf" };
  const val = schema.safeParse(data);
  expect(val.success).toEqual(false);
});

test("catchall", () => {
  const schema = z
    .interface({
      first: z.string(),
    })
    .catchall(z.number());

  const d1 = schema.safeParse({ first: "asdf", num: 1243 });
  expect(d1.data).toEqual({ first: "asdf", num: 1243 });

  const d2 = schema.safeParse({ first: "asdf", num: "asdf" });
  expect(d2.success).toEqual(false);
});

test("catchall overrides strict", () => {
  const schema = z.strictInterface({ first: z.string().optional() }).catchall(z.number());

  // setting a catchall overrides the unknownKeys behavior
  schema.parse({ asdf: 1234 });
});

test("only run catchall on unknown keys", () => {
  const schema = z.strictInterface({ first: z.string().optional() }).catchall(z.number());
  schema.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("extend overrides existing", async () => {
  const a = z.interface({ a: z.string() });
  const b = z.interface({ a: z.number() });
  const c = a.extend(b);
  type c = z.infer<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<{ a: number }>();
});

test("extend overrides optionality", async () => {
  const a = z.interface({ "?a": z.string(), "b?": z.string() });
  const b = z.interface({ a: z.string(), b: z.string() });
  const c = a.extend(b);

  type c = z.infer<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<{ a: string; b: string }>();

  const aData = { a: "asdf" };
  expect(a.parse(aData)).toEqual(aData);

  expect(c.safeParse(aData).success).toEqual(false);

  const cData = { a: "asdf", b: "asdf" };
  expect(c.parse(cData)).toEqual(cData);
});

test("inferred merged object type with optional properties", async () => {
  const a = z.interface({ "a?": z.string(), b: z.string().optional() });
  const b = z.interface({ a: z.string().optional(), "b?": z.string() });
  const c = a.merge(b);
  // c.shape;
  type c = z.infer<typeof c>;
  expectTypeOf<c>().toEqualTypeOf<{ a: string | undefined; b?: string }>();
  expectTypeOf<typeof a>().toMatchTypeOf<z.ZodInterface>();
});

// declare let xx: z.ZodInterface<{a: z.ZodString}>;
// xx._output;
test("inferred unioned object type with optional properties", async () => {
  const Unioned = z.union([
    z.interface({ a: z.string(), "b?": z.string().optional() }),
    z.interface({ "a?": z.string().optional(), b: z.string() }),
  ]);
  type Unioned = z.infer<typeof Unioned>;
  expectTypeOf<Unioned>().toEqualTypeOf<{ a: string; b?: string } | { a?: string; b: string }>();
});

test("inferred enum type", async () => {
  const Enum = z.interface({ a: z.string(), b: z.string().optional() }).keyof();

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

test(".partial", async () => {
  const Partial = z.interface({ a: z.string(), b: z.string().optional() }).partial();
  type Partial = z.infer<typeof Partial>;
  expectTypeOf<Partial>().toEqualTypeOf<{ a?: string; b?: string }>();
  expect(Partial._zod.def.shape.a).toBeInstanceOf(z.ZodOptional);
  expect(Partial._zod.def.shape.b).toBeInstanceOf(z.ZodOptional);
  expect(Partial._zod.def.optional).toEqual(["a", "b"]);
});

test(".required", async () => {
  const Required = z
    .interface({ a: z.string(), b: z.string().optional(), "c?": z.string(), "?d": z.string() })
    .required();
  type Required = z.infer<typeof Required>;
  expectTypeOf<Required>().toEqualTypeOf<{ a: string; b: string; c: string; d: string }>();
  expectTypeOf<typeof Required._zod.optional>().toEqualTypeOf<never>();
  expectTypeOf<typeof Required._zod.defaulted>().toEqualTypeOf<"d">();
  expect(Required._zod.def.shape.a).toBeInstanceOf(z.ZodNonOptional);
  expect(Required._zod.def.shape.b).toBeInstanceOf(z.ZodNonOptional);
  expect(Required._zod.def.shape.c).toBeInstanceOf(z.ZodNonOptional);
  expect(Required._zod.def.shape.d).toBeInstanceOf(z.ZodNonOptional);
  expect(Required._zod.def.optional).toEqual([]);
  // expect(Required._zod.def.defaulted).toEqual(["d"]);
});

test("inferred picked object type with optional properties", async () => {
  const Picked = z.interface({ a: z.string(), "b?": z.string() }).pick({ b: true });
  type Picked = z.infer<typeof Picked>;
  expectTypeOf<Picked>().toEqualTypeOf<{ b?: string }>();
});

test("inferred type for unknown/any keys", () => {
  const myType = z.interface({
    anyOptional: z.any().optional(),
    anyRequired: z.any(),
    unknownOptional: z.unknown().optional(),
    unknownRequired: z.unknown(),
  });
  type myType = z.infer<typeof myType>;
  expectTypeOf<myType>().toEqualTypeOf<{
    anyOptional: any;
    anyRequired: any;
    unknownOptional: unknown;
    unknownRequired: unknown;
  }>();

  const myType2 = z.interface({
    "anyOptional?": z.any().optional(),
    "anyRequired?": z.any(),
    "unknownOptional?": z.unknown().optional(),
    "unknownRequired?": z.unknown(),
  });
  type myType2 = z.infer<typeof myType2>;
  expectTypeOf<myType2>().toEqualTypeOf<{
    anyOptional?: any;
    anyRequired?: any;
    unknownOptional?: unknown;
    unknownRequired?: unknown;
  }>();
});

// test("setKey", () => {
//   const base = z.interface({ name: z.string() });
//   const withNewKey = base.setKey("age", z.number());

//   type withNewKey = z.infer<typeof withNewKey>;
//   expectTypeOf<withNewKey>().toEqualTypeOf<{ name: string; age: number }>();
//   withNewKey.parse({ name: "asdf", age: 1234 });
// });

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
    .interface({
      a: z.string().default("foo"),
      b: z.number(),
    })
    .refine(() => true);
  expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: "foo" });
  const result = await schema.parseAsync({ b: 5 });
  expect(result).toEqual({ b: 5, a: "foo" });
});

test("intersection of object with date", async () => {
  const schema = z.interface({
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
    .interface({
      a: z.date(),
    })
    .refine(() => true);
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  });
  const result = await schema.parseAsync({ a: new Date(1637353595983) });
  expect(result).toEqual({ a: new Date(1637353595983) });
});

test("strictInterface", () => {
  const person = z.strictInterface({
    name: z.string(),
  });

  expect(() =>
    person.parse({
      name: "bob dylan",
      constructor: 61,
    })
  ).toThrow();
});

test("catchall", () => {
  const a = z.interface({});
  expect(a._zod.def.catchall).toBeUndefined();

  const b = z.strictObject({});
  expect(b._zod.def.catchall).toBeInstanceOf(z.ZodNever);

  const c = z.looseObject({});
  expect(c._zod.def.catchall).toBeInstanceOf(z.ZodUnknown);

  const d = z.interface({}).catchall(z.number());
  expect(d._zod.def.catchall).toBeInstanceOf(z.ZodNumber);
});

test("unknownkeys merging", () => {
  // This one is "strict"
  const a = z.looseObject({
    a: z.string(),
  });

  const b = z.strictObject({ b: z.string() });

  // incoming object overrides
  const c = a.merge(b);
  expect(c._zod.def.catchall).toBeInstanceOf(z.ZodNever);

  // // This one is "strip"
  // const schemaB = z
  //   .interface({
  //     b: z.string(),
  //   })
  //   .catchall(z.string());

  // const mergedSchema = schemaA.merge(schemaB);
  // type mergedSchema = typeof mergedSchema;
  // // expectTypeOf<mergedSchema["_def"].catchall>().toEqualTypeOf<"strip">(true);
  // expect(mergedSchema._zod.def.catchall).toBeInstanceOf(z.ZodUnknown);

  // expectTypeOf<mergedSchema["_def"]["catchall"]>().toEqualTypeOf<z.ZodString>(true);
  // expect(mergedSchema._zod.def.catchall instanceof z.ZodString).toEqual(true);
});

const personToExtend = z.interface({
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

// test("passthrough index signature", () => {
//   const a = z.interface({ a: z.string() });
//   type a = z.infer<typeof a>;
//   expectTypeOf<{ a: string }>().toEqualTypeOf<a>(true);
//   const b = a.passthrough();
//   type b = z.infer<typeof b>;
//   expectTypeOf<{ a: string } & { [k: string]: unknown }>().toEqualTypeOf<b>(true);
// });

test("xor", () => {
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T extends object ? (U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U) : T;

  type A = { name: string; a: number };
  type B = { name: string; b: number };
  type C = XOR<A, B>;
  type Outer = { data: C };
  const Outer: z.ZodType<Outer> = z.interface({
    data: z.union([z.interface({ name: z.string(), a: z.number() }), z.interface({ name: z.string(), b: z.number() })]),
  });
});
