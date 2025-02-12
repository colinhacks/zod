import * as z from "@zod/core";
import { expect, expectTypeOf, test } from "vitest";

test("z.interface", () => {
  const a = z.interface({
    name: z.string(),
    age: z.number(),
  });
  expect(z.parse(a, { name: "john", age: 30 })).toEqual({
    name: "john",
    age: 30,
  });
  expect(() => z.parse(a, { name: "john", age: "30" })).toThrow();
  expect(() => z.parse(a, "hello")).toThrow();
});

test("optionals", () => {
  const a = z.interface({
    a: z.string(),
    "b?": z.string(),
    "?c": z._default(z.string(), "c"),
    d: z._default(z.string(), "d"),
    e: z.optional(z.string()),
    "?f": z.optional(z.string()),
  });

  interface a_in {
    a: string;
    b?: string;
    c?: string;
    d: string | undefined;
    e: string | undefined;
    f?: string | undefined;
  }
  interface a_out {
    a: string;
    b?: string;
    c: string;
    d: string;
    e: string | undefined;
    f: string | undefined;
  }

  expectTypeOf<(typeof a)["_output"]>().toEqualTypeOf<a_out>();
  expectTypeOf<(typeof a)["_input"]>().toEqualTypeOf<a_in>();

  // check parsing behavior
  // b is optional in input and output
  // c is optional in input but will always show up in output
  // d is required in input & output but will be overwritten if `undefined`
  // e is required in input & output but can be `undefined`
  // f is optional in input but will always show up in output
  expect(z.parse(a, { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f" })).toEqual({
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    e: "e",
    f: "f",
  });

  // omit b, c, and f to test optionality
  expect(z.parse(a, { a: "a", d: "d", e: "e" })).toEqual({
    a: "a",
    c: "c", // default
    d: "d",
    e: "e",
    f: undefined,
  });

  // test default values for d and f
  expect(z.parse(a, { a: "a", d: undefined, e: "e", f: undefined })).toEqual({
    a: "a",
    c: "c",
    d: "d",
    e: "e",
    f: undefined,
  });
});

test("one to one", () => {
  const A = z.interface({
    name: z.string(),
    get b() {
      return z._default(z.optional(B), {} as any);
    },
  });

  const B = z.interface({
    name: z.string(),
    get a() {
      return A;
    },
  });

  interface A {
    name: string;
    b: B | undefined;
  }
  interface B {
    name: string;
    a: A;
  }
  expectTypeOf<(typeof A)["_output"]["b"]["a"]["b"]["name"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof A)["_input"]["b"]>().toEqualTypeOf<B | undefined>();
});

test("one to many", () => {
  const C = z.interface({
    name: z.string(),
    get d() {
      return z.array(D);
    },
  });

  const D = z.interface({
    age: z.number(),
    get c() {
      return C;
    },
  });

  interface _C {
    name: string;
    d: _D[];
  }
  interface _D {
    age: number;
    c: _C;
  }

  // C["_output"].d.c.d.c.d;
  expectTypeOf<(typeof C)["_def"]["shape"]>().toEqualTypeOf<z.$ZodShape>();
  expectTypeOf<(typeof C)["_output"]>().toEqualTypeOf<_C>();
  expectTypeOf<(typeof D)["_output"]["c"]["d"][number]>().toEqualTypeOf<_D>();
});

test("many to many", () => {
  const E = z.interface({
    name: z.string(),
    get f() {
      return z.array(F);
    },
  });

  const F = z.interface({
    age: z.number(),
    get e() {
      return z.array(E);
    },
  });

  interface _E {
    name: string;
    f: _F[];
  }
  interface _F {
    age: number;
    e: _E[];
  }

  expectTypeOf<(typeof E)["_output"]>().toEqualTypeOf<_E>();
  expectTypeOf<(typeof F)["_output"]["e"][number]>().toEqualTypeOf<_E>();
});

test("self recursive", () => {
  const E = z.interface({
    name: z.string(),
    get e() {
      return E;
    },
  });

  interface _E {
    name: string;
    e: _E;
  }
  expectTypeOf<(typeof E)["_output"]["e"]["e"]["e"]>().toEqualTypeOf<_E>();
});

test("self recursive optional", () => {
  const F = z.interface({
    name: z.string(),
    get "f?"() {
      return z.nullable(F);
    },
  });

  interface _F {
    name: string;
    f?: _F | null;
  }

  expectTypeOf<(typeof F)["_output"]>().toEqualTypeOf<_F>();
});

const userSchema = z.interface({
  name: z.string(),
  age: z.number(),
  "email?": z.string(),
});

test("z.keyof", () => {
  const userKeysSchema = z.keyof(userSchema);
  type UserKeys = z.infer<typeof userKeysSchema>;
  expectTypeOf<UserKeys>().toEqualTypeOf<"name" | "age" | "email">();
  expect(userKeysSchema).toBeDefined();
  expect(z.safeParse(userKeysSchema, "name").success).toBe(true);
  expect(z.safeParse(userKeysSchema, "age").success).toBe(true);
  expect(z.safeParse(userKeysSchema, "email").success).toBe(true);
  expect(z.safeParse(userKeysSchema, "isAdmin").success).toBe(false);
});

test("z.extend", () => {
  const extendedSchema = z.extend(userSchema, {
    isAdmin: z.boolean(),
  });
  type ExtendedUser = z.infer<typeof extendedSchema>;
  expectTypeOf<ExtendedUser>().toEqualTypeOf<{
    name: string;
    age: number;
    email?: string;
    isAdmin: boolean;
  }>();
  expect(extendedSchema).toBeDefined();
  expect(z.safeParse(extendedSchema, { name: "John", age: 30, isAdmin: true }).success).toBe(true);
});

test("z.pick", () => {
  const pickedSchema = z.pick(userSchema, { name: true, "email?": true });
  type PickedUser = z.infer<typeof pickedSchema>;
  expectTypeOf<PickedUser>().toEqualTypeOf<{ name: string; email?: string }>();
  expect(pickedSchema).toBeDefined();
  expect(z.safeParse(pickedSchema, { name: "John", email: "john@example.com" }).success).toBe(true);
});

test("z.omit", () => {
  const omittedSchema = z.omit(userSchema, { age: true });

  type OmittedUser = z.infer<typeof omittedSchema>;
  expectTypeOf<OmittedUser>().toEqualTypeOf<{ name: string; email?: string }>();
  expect(omittedSchema).toBeDefined();
  expect(z.safeParse(omittedSchema, { name: "John", email: "john@example.com" }).success).toBe(true);
});

test("z.partial", () => {
  const partialSchema = z.partial(userSchema);

  type PartialUser = z.infer<typeof partialSchema>;
  expectTypeOf<PartialUser>().toEqualTypeOf<{
    name?: string;
    age?: number;
    email?: string;
  }>();
  expect(z.safeParse(partialSchema, {}).success).toBe(true);
  expect(z.safeParse(partialSchema, { name: "foo" }).success).toBe(true);
  expect(z.safeParse(partialSchema, { age: 123 }).success).toBe(true);
  expect(z.safeParse(partialSchema, { email: "foo" }).success).toBe(true);

  const partialSchemaWithMask = z.partial(userSchema, { name: true });
  type PartialUserWithMask = z.infer<typeof partialSchemaWithMask>;
  expectTypeOf<PartialUserWithMask>().toEqualTypeOf<{
    name?: string;
    age: number;
    email?: string;
  }>();
  expect(z.safeParse(partialSchemaWithMask, { age: 30 }).success).toBe(true);
  expect(z.safeParse(partialSchemaWithMask, { name: "John" }).success).toBe(false);
});

test("z.required()", () => {
  const reqSchema = z.required(userSchema);
  expect(z.parse(reqSchema, { name: "John", age: 30, email: "foo" })).toEqual({
    name: "John",
    age: 30,
    email: "foo",
  });

  expect(() => z.parse(reqSchema, { age: 30 })).toThrow();
  expect(() => z.parse(reqSchema, { name: "John" })).toThrow();
  expect(() => z.parse(reqSchema, { email: "John" })).toThrow();
  expect(() => z.parse(reqSchema, {})).toThrow();
});
