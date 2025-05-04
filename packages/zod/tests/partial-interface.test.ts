import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";

const nested = z.interface({
  name: z.string(),
  age: z.number(),
  outer: z.interface({
    inner: z.string(),
  }),
  array: z.array(z.interface({ asdf: z.string() })),
});

test("shallow inference", () => {
  const shallow = nested.partial();

  type shallow = z.infer<typeof shallow>;

  expectTypeOf<shallow>().toEqualTypeOf<{
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner: string } | undefined;
    array?: { asdf: string }[] | undefined;
  }>();
});

test("shallow partial parse", () => {
  const shallow = nested.partial();
  shallow.parse({});
  shallow.parse({
    name: "asdf",
    age: 23143,
  });
});

test("required", () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required();
  expect(requiredObject._zod.def.shape.name.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.name.type.unwrap()).toBeInstanceOf(z.ZodString);
  expect(requiredObject._zod.def.shape.age.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.age.type.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject._zod.def.shape.field.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.field.type.unwrap()).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject._zod.def.shape.nullableField.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.nullableField.type.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject._zod.def.shape.nullishField.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.nullishField.type.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject._zod.def.shape.nullishField.type.unwrap().unwrap()).toBeInstanceOf(z.ZodNullable);
});

test("required inference", () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required();

  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age: number;
    field: string;
    nullableField: number | null;
    nullishField: string | null;
  };
  expectTypeOf<expected>().toEqualTypeOf<required>();
});

test("required with mask", () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
  });

  const requiredObject = object.required({ age: true });
  expect(requiredObject._zod.def.shape.name.type).toBeInstanceOf(z.ZodString);
  expect(requiredObject._zod.def.shape.age.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.field.type).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject._zod.def.shape.country.type).toBeInstanceOf(z.ZodOptional);
});

test("required with mask -- ignore falsy values", () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
  });

  // @ts-expect-error
  const requiredObject = object.required({ age: true, country: false });
  expect(requiredObject._zod.def.shape.name.type).toBeInstanceOf(z.ZodString);
  expect(requiredObject._zod.def.shape.age.type).toBeInstanceOf(z.ZodNonOptional);
  expect(requiredObject._zod.def.shape.field.type).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject._zod.def.shape.country.type).toBeInstanceOf(z.ZodOptional);
});

test("partial with mask", async () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
  });

  const masked = object.partial({ age: true, field: true, name: true }).strict();

  expect(masked._zod.def.shape.name!.type).toBeInstanceOf(z.ZodString);
  expect(masked._zod.def.shape.name!.optionality).toEqual("optional");
  expect(masked._zod.def.shape.age!.type).toBeInstanceOf(z.ZodOptional);
  expect(masked._zod.def.shape.age!.optionality).toEqual("optional");
  expect(masked._zod.def.shape.field!.type).toBeInstanceOf(z.ZodDefault);
  expect(masked._zod.def.shape.field!.optionality).toEqual("optional");
  expect(masked._zod.def.shape.country.type).toBeInstanceOf(z.ZodString);
  expect(masked._zod.def.shape.country.optionality).toEqual("required");

  masked.parse({ country: "US" });
  await masked.parseAsync({ country: "US" });
});

test("partial with mask -- ignore falsy values", async () => {
  const object = z.interface({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
  });

  // @ts-expect-error
  const masked = object.partial({ name: true, country: false }).strict();

  expect(object._zod.def.shape.name!.optionality).toEqual("required");
  expect(object._zod.def.shape.country!.optionality).toEqual("required");
  expect(masked._zod.def.shape.name!.optionality).toEqual("optional");
  expect(masked._zod.def.shape.country!.optionality).toEqual("required");

  masked.parse({ country: "US" });
  await masked.parseAsync({ country: "US" });
});
