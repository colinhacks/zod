import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/mini";

const nested = z.object({
  name: z.string(),
  age: z.number(),
  outer: z.object({ inner: z.string() }),
  array: z.array(z.object({ asdf: z.string() })),
});

test("z.partial - shallow inference", () => {
  const shallow = z.partial(nested);
  expectTypeOf<z.infer<typeof shallow>>().toEqualTypeOf<{
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner: string } | undefined;
    array?: { asdf: string }[] | undefined;
  }>();
});

test("z.partial - shallow parse", () => {
  const shallow = z.partial(nested);
  expect(z.parse(shallow, {})).toEqual({});
  expect(z.parse(shallow, { name: "asdf", age: 23143 })).toEqual({ name: "asdf", age: 23143 });
});

test("z.required - wraps every key in ZodMiniNonOptional", () => {
  const object = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    field: z._default(z.optional(z.string()), "asdf"),
    nullableField: z.nullable(z.number()),
    nullishField: z.nullish(z.string()),
  });

  const requiredObject = z.required(object);
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodMiniNonOptional);
  expect(requiredObject.shape.name._zod.def.innerType).toBeInstanceOf(z.ZodMiniString);
  expect(requiredObject.shape.age._zod.def.innerType).toBeInstanceOf(z.ZodMiniOptional);
  expect(requiredObject.shape.field._zod.def.innerType).toBeInstanceOf(z.ZodMiniDefault);
  expect(requiredObject.shape.nullableField._zod.def.innerType).toBeInstanceOf(z.ZodMiniNullable);
  expect(requiredObject.shape.nullishField._zod.def.innerType).toBeInstanceOf(z.ZodMiniOptional);
  expect(requiredObject.shape.nullishField._zod.def.innerType._zod.def.innerType).toBeInstanceOf(z.ZodMiniNullable);
});

test("z.required - inference", () => {
  const object = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    field: z._default(z.optional(z.string()), "asdf"),
    nullableField: z.nullable(z.number()),
    nullishField: z.nullish(z.string()),
  });

  const requiredObject = z.required(object);
  expectTypeOf<z.infer<typeof requiredObject>>().toEqualTypeOf<{
    name: string;
    age: number;
    field: string;
    nullableField: number | null;
    nullishField: string | null;
  }>();
});

test("z.required - with mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    field: z._default(z.optional(z.string()), "asdf"),
    country: z.optional(z.string()),
  });

  const requiredObject = z.required(object, { age: true });
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodMiniString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodMiniNonOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodMiniDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodMiniOptional);
});

test("z.required - mask ignores falsy values", () => {
  const object = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    country: z.optional(z.string()),
  });

  // @ts-expect-error falsy mask values are not assignable
  const requiredObject = z.required(object, { age: true, country: false });
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodMiniNonOptional);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodMiniOptional);
});

test("z.partial - with mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    field: z._default(z.optional(z.string()), "asdf"),
    country: z.string(),
  });

  const masked = z.partial(object, { age: true, field: true, name: true });
  expect(masked.shape.name).toBeInstanceOf(z.ZodMiniOptional);
  expect(masked.shape.age).toBeInstanceOf(z.ZodMiniOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodMiniOptional);
  expect(masked.shape.country).toBeInstanceOf(z.ZodMiniString);

  // a masked key wrapping a default still emits that default when absent
  expect(z.parse(masked, { country: "US" })).toEqual({ field: "asdf", country: "US" });
  await expect(z.parseAsync(masked, { country: "US" })).resolves.toEqual({ field: "asdf", country: "US" });
});

test("z.partial - mask ignores falsy values", () => {
  const object = z.object({
    name: z.string(),
    field: z._default(z.optional(z.string()), "asdf"),
    country: z.string(),
  });

  // @ts-expect-error falsy mask values are not assignable
  const masked = z.partial(object, { name: true, country: false });
  expect(masked.shape.name).toBeInstanceOf(z.ZodMiniOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodMiniDefault);
  expect(masked.shape.country).toBeInstanceOf(z.ZodMiniString);
});

test("z.partial - rejects schemas containing refinements", () => {
  const base = z.object({ password: z.string(), confirmPassword: z.string() });
  const refined = base.check(z.refine((data) => data.password === data.confirmPassword, "Passwords must match"));

  expect(() => z.partial(refined)).toThrow(".partial() cannot be used on object schemas containing refinements");
});

test("z.required - preserves refinements", () => {
  const base = z.object({ name: z.optional(z.string()), age: z.optional(z.number()) });
  const refined = base.check(
    z.superRefine((val, ctx) => {
      if (val.name === "admin") ctx.issues.push({ code: "custom", input: val, message: "Name cannot be admin" });
    })
  );

  const requiredSchema = z.required(refined);
  const result = z.safeParse(requiredSchema, { name: "admin", age: 25 });
  expect(result.success).toBe(false);
  expect(result.error!.issues[0].message).toBe("Name cannot be admin");
  expect(z.safeParse(requiredSchema, { name: "user", age: 25 }).success).toBe(true);
});
