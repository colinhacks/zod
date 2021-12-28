// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";
import { ZodNullable, ZodOptional } from "../index";

const nested = z.object({
  name: z.string(),
  age: z.number(),
  outer: z.object({
    inner: z.string(),
  }),
  array: z.array(z.object({ asdf: z.string() })),
});

test("shallow inference", () => {
  const shallow = nested.partial();
  type shallow = z.infer<typeof shallow>;
  type correct = {
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner: string } | undefined;
    array?: { asdf: string }[];
  };
  const t1: util.AssertEqual<shallow, correct> = true;
  t1;
});

test("shallow partial parse", () => {
  const shallow = nested.partial();
  shallow.parse({});
  shallow.parse({
    name: "asdf",
    age: 23143,
  });
});

test("deep partial inference", () => {
  const deep = nested.deepPartial();
  const asdf = deep.shape.array.unwrap().element.shape.asdf.unwrap();
  asdf.parse("asdf");
  type deep = z.infer<typeof deep>;
  type correct = {
    array?: { asdf?: string }[];
    name?: string | undefined;
    age?: number | undefined;
    outer?: { inner?: string | undefined } | undefined;
  };

  const t1: util.AssertEqual<deep, correct> = true;
  t1;
});

test("deep partial parse", () => {
  const deep = nested.deepPartial();

  expect(deep.shape.name instanceof z.ZodOptional).toBe(true);
  expect(deep.shape.outer instanceof z.ZodOptional).toBe(true);
  expect(deep.shape.outer._def.innerType instanceof z.ZodObject).toBe(true);
  expect(
    deep.shape.outer._def.innerType.shape.inner instanceof z.ZodOptional
  ).toBe(true);
  expect(
    deep.shape.outer._def.innerType.shape.inner._def.innerType instanceof
      z.ZodString
  ).toBe(true);
});

test("deep partial runtime tests", () => {
  const deep = nested.deepPartial();
  deep.parse({});
  deep.parse({
    outer: {},
  });
  deep.parse({
    name: "asdf",
    age: 23143,
    outer: {
      inner: "adsf",
    },
  });
});

test("deep partial optional/nullable", () => {
  const schema = z
    .object({
      name: z.string().optional(),
      age: z.number().nullable(),
    })
    .deepPartial();

  expect(schema.shape.name.unwrap()).toBeInstanceOf(ZodOptional);
  expect(schema.shape.age.unwrap()).toBeInstanceOf(ZodNullable);
});

test("deep partial tuple", () => {
  const schema = z
    .object({
      tuple: z.tuple([
        z.object({
          name: z.string().optional(),
          age: z.number().nullable(),
        }),
      ]),
    })
    .deepPartial();

  expect(schema.shape.tuple.unwrap().items[0].shape.name).toBeInstanceOf(
    ZodOptional
  );
});

test("deep partial inference", () => {
  const mySchema = z.object({
    name: z.string(),
    array: z.array(z.object({ asdf: z.string() })),
    tuple: z.tuple([z.object({ value: z.string() })]),
  });

  const partialed = mySchema.deepPartial();
  type partialed = z.infer<typeof partialed>;
  type expected = {
    name?: string | undefined;
    array?:
      | {
          asdf?: string | undefined;
        }[]
      | undefined;
    tuple?: [{ value?: string }] | undefined;
  };
  const f1: util.AssertEqual<expected, partialed> = true;
  f1;
});

test("required", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
  });

  const requiredObject = object.required();
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
});

test("with mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
  });

  const masked = object
    .partial({
      name: true,
      age: true,
      field: true,
    })
    .strict();

  masked.parse({});
  await masked.parseAsync({});
});
