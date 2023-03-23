// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";
import { ZodNullable, ZodOptional } from "../index";
import { MaskErrorType, PartialType } from "../types";

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
  util.assertEqual<shallow, correct>(true);
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

  util.assertEqual<deep, correct>(true);
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
  util.assertEqual<expected, partialed>(true);
});

test("required", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required();
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodNullable);
});

test("required inference", () => {
  const object = z.object({
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
  util.assertEqual<expected, required>(true);
});

test("required without mask and with nullable type", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required(PartialType.NULLABLE);

  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    nullableField: number;
    nullishField?: string;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodOptional);
});

test("required without mask and with nullish type", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required(PartialType.NULLISH);

  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age: number;
    field: string;
    nullableField: number;
    nullishField: string;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodString);
});

test("required with emtpy mask -- throws", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  expect(
    // @ts-expect-error
    () => object.required({})
  ).toThrow(MaskErrorType.EMPTY);
});

test("required with truthy mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: true });
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age: number;
    field: string;
    country?: string;
    nullableField: number | null;
    nullishField?: string | null;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodOptional);
});

test("required with truthy nullable mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: true }, PartialType.NULLABLE);
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country?: string;
    nullableField: number | null;
    nullishField?: string | null;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodOptional);
});

test("required with truthy nullish mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: true }, PartialType.NULLISH);
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age: number;
    field: string;
    country?: string;
    nullableField: number | null;
    nullishField?: string | null;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodOptional);
});

test("required with falsy mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: false });
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country: string;
    nullableField: number | null;
    nullishField: string | null;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodNullable);
});

test("required with falsy nullable mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: false }, PartialType.NULLABLE);
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country?: string;
    nullableField: number;
    nullishField?: string;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodOptional);
});

test("required with falsy nullish mask", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
    nullableField: z.number().nullable(),
    nullishField: z.string().nullish(),
  });

  const requiredObject = object.required({ age: false }, PartialType.NULLISH);
  type required = z.infer<typeof requiredObject>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country: string;
    nullableField: number;
    nullishField: string;
  };
  util.assertEqual<expected, required>(true);

  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodString);
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNumber);
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodString);
});

test("required with mask -- throw when mixing truthy and falsy values", () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string().optional(),
  });

  expect(
    // @ts-expect-error
    () => object.required({ age: true, country: false })
  ).toThrow(MaskErrorType.MIXED);
});

test("partial without mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object.partial().strict();
  type optional = z.infer<typeof masked>;
  type expected = {
    name?: string;
    age?: number;
    field?: string;
    country?: string;
    region?: string;
  };
  util.assertEqual<expected, optional>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.region).toBeInstanceOf(z.ZodOptional);

  masked.parse({});
  await masked.parseAsync({});
});

test("partial without mask and with nullable type", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object.partial(PartialType.NULLABLE).strict();

  type nullable = z.infer<typeof masked>;
  type expected = {
    name: string | null;
    age?: number | null;
    field: string | null;
    country: string | null;
    region: string | null;
  };
  util.assertEqual<expected, nullable>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.country).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.region).toBeInstanceOf(z.ZodNullable);

  masked.parse({ name: null, field: null, country: null, region: null });
  expect(() =>
    masked.parse({ name: null, field: null, country: null })
  ).toThrow();
  masked.parse({
    name: null,
    age: null,
    field: null,
    country: null,
    region: null,
  });
  await masked.parseAsync({
    name: null,
    age: null,
    field: null,
    country: null,
    region: null,
  });
  await expect(
    masked.parseAsync({
      name: null,
      field: null,
      country: null,
    })
  ).rejects.toThrow();
});

test("partial without mask and with nullish type", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object.partial(PartialType.NULLISH).strict();

  type nullish = z.infer<typeof masked>;
  type expected = {
    name?: string | null;
    age?: number | null;
    field?: string | null;
    country?: string | null;
    region?: string | null;
  };
  util.assertEqual<expected, nullish>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.name.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.age.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.field).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.region).toBeInstanceOf(z.ZodOptional);

  masked.parse({
    name: null,
    age: null,
    field: null,
    country: null,
    region: null,
  });
  masked.parse({});
  await masked.parseAsync({
    name: null,
    age: null,
    field: null,
    country: null,
    region: null,
  });
  await masked.parseAsync({});
});

test("partial with emtpy mask -- throws", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  expect(
    // @ts-expect-error
    () => object.partial({}).strict()
  ).toThrow(MaskErrorType.EMPTY);
});

test("partial with truthy mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: true, field: true, name: true })
    .strict();

  type optional = z.infer<typeof masked>;
  type expected = {
    name?: string;
    age?: number;
    field?: string;
    country: string;
    region: string;
  };
  util.assertEqual<expected, optional>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.country).toBeInstanceOf(z.ZodString);
  expect(masked.shape.region).toBeInstanceOf(z.ZodString);

  masked.parse({ country: "US", region: "Pacific Coast" });
  expect(() => masked.parse({ country: "US" })).toThrow();
  await masked.parseAsync({ country: "US", region: "Pacific Coast" });
  await expect(masked.parseAsync({ country: "US" })).rejects.toThrow();
});

test("partial with truthy nullable mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: true, field: true, name: true }, PartialType.NULLABLE)
    .strict();

  type nullable = z.infer<typeof masked>;
  type expected = {
    name: string | null;
    age?: number | null;
    field: string | null;
    country: string;
    region: string;
  };
  util.assertEqual<expected, nullable>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age.unwrap()).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.country).toBeInstanceOf(z.ZodString);
  expect(masked.shape.region).toBeInstanceOf(z.ZodString);

  masked.parse({
    name: null,
    age: null,
    field: null,
    country: "US",
    region: "Pacific Coast",
  });
  masked.parse({ name: null, country: "US", region: "Pacific Coast" });
  expect(() =>
    masked.parse({ country: "US", region: "Pacific Coast" })
  ).toThrow();
  expect(() => masked.parse({ name: null, country: "US" })).toThrow();
  await masked.parseAsync({
    name: null,
    age: null,
    field: null,
    country: "US",
    region: "Pacific Coast",
  });
  await masked.parseAsync({
    name: null,
    country: "US",
    region: "Pacific Coast",
  });
  await expect(
    masked.parseAsync({
      country: "US",
      region: "Pacific Coast",
    })
  ).rejects.toThrow();
  await expect(
    masked.parseAsync({
      name: null,
      country: "US",
    })
  ).rejects.toThrow();
});

test("partial with truthy nullish mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: true, field: true, name: true }, PartialType.NULLISH)
    .strict();

  type nullish = z.infer<typeof masked>;
  type expected = {
    name?: string | null;
    age?: number | null;
    field?: string | null;
    country: string;
    region: string;
  };
  util.assertEqual<expected, nullish>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.name.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.age.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.field).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.country).toBeInstanceOf(z.ZodString);
  expect(masked.shape.region).toBeInstanceOf(z.ZodString);

  masked.parse({
    name: null,
    age: null,
    field: null,
    country: "US",
    region: "Pacific Coast",
  });
  masked.parse({ country: "US", region: "Pacific Coast" });
  expect(() => masked.parse({ country: "US" })).toThrow();
  expect(() => masked.parse({ name: null, country: "US" })).toThrow();
  await masked.parseAsync({
    name: null,
    age: null,
    field: null,
    country: "US",
    region: "Pacific Coast",
  });
  await masked.parseAsync({
    country: "US",
    region: "Pacific Coast",
  });
  await expect(
    masked.parseAsync({
      country: "US",
    })
  ).rejects.toThrow();
});

test("partial with falsy mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: false, field: false, name: false })
    .strict();

  type optional = z.infer<typeof masked>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country?: string;
    region?: string;
  };
  util.assertEqual<expected, optional>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodString);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(masked.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.region).toBeInstanceOf(z.ZodOptional);

  masked.parse({ name: "Abc" });
  expect(() => masked.parse({})).toThrow();
  await masked.parseAsync({ name: "Abc" });
  await expect(masked.parseAsync({})).rejects.toThrow();
});

test("partial with falsy nullable mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: false, field: false, name: false }, PartialType.NULLABLE)
    .strict();

  type nullable = z.infer<typeof masked>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country: string | null;
    region: string | null;
  };
  util.assertEqual<expected, nullable>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodString);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(masked.shape.country).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.region).toBeInstanceOf(z.ZodNullable);

  masked.parse({ name: "Abc", country: null, region: null });
  expect(() => masked.parse({ name: "Abc", country: null })).toThrow();
  expect(() => masked.parse({ ncountry: null, region: null })).toThrow();
  await masked.parseAsync({ name: "Abc", country: null, region: null });
  await expect(
    masked.parseAsync({ name: "Abc", country: null })
  ).rejects.toThrow();
  await expect(
    masked.parseAsync({ country: null, region: null })
  ).rejects.toThrow();
});

test("partial with falsy nullish mask", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  const masked = object
    .partial({ age: false, field: false, name: false }, PartialType.NULLISH)
    .strict();

  type nullable = z.infer<typeof masked>;
  type expected = {
    name: string;
    age?: number;
    field: string;
    country?: string | null;
    region?: string | null;
  };
  util.assertEqual<expected, nullable>(true);

  expect(masked.shape.name).toBeInstanceOf(z.ZodString);
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.field).toBeInstanceOf(z.ZodDefault);
  expect(masked.shape.country).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.country.unwrap()).toBeInstanceOf(z.ZodNullable);
  expect(masked.shape.region).toBeInstanceOf(z.ZodOptional);
  expect(masked.shape.region.unwrap()).toBeInstanceOf(z.ZodNullable);

  masked.parse({ name: "Abc" });
  expect(() => masked.parse({})).toThrow();
  await masked.parseAsync({ name: "Abc" });
  await expect(masked.parseAsync({})).rejects.toThrow();
});

test("partial with mask -- throw when mixing truthy and falsy values", async () => {
  const object = z.object({
    name: z.string(),
    age: z.number().optional(),
    field: z.string().optional().default("asdf"),
    country: z.string(),
    region: z.string(),
  });

  expect(
    // @ts-expect-error
    () => object.partial({ name: true, country: false }).strict()
  ).toThrow(MaskErrorType.MIXED);
});

test("deeppartial array", () => {
  const schema = z.object({ array: z.string().array().min(42) }).deepPartial();

  // works as expected
  schema.parse({});

  // should be false, but is true
  expect(schema.safeParse({ array: [] }).success).toBe(false);
});
