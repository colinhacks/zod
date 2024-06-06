// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("parse defer primitives", () => {
  const schema = z.number().defer();

  expect(() => schema.parse("not a number")).not.toThrow();
  expect(() => schema.parse("not a number")()).toThrow();

  expect(() => schema.parse(42)).not.toThrow();
  expect(schema.parse(42)()).toEqual(42);
});

test("defer type inference", () => {
  const schema = z
    .object({
      a: z.string(),
      b: z.number().nullable(),
    })
    .partial();
  type Schema = z.infer<typeof schema>;

  const deferredSchema = schema.defer();

  type inferred = z.infer<typeof deferredSchema>;
  util.assertEqual<inferred, () => Schema>(true);
});

test("parse deferred object props", () => {
  const schema1 = z.object({
    a: z.string(),
    b: z.string().defer(),
  });

  expect(() => schema1.parse({ a: "foo", b: 1 })).not.toThrow();

  const parsed = schema1.parse({ a: "foo", b: 1 });
  expect(() => parsed.b()).toThrow();

  expect(schema1.parse({ a: "foo", b: "bar" }).b()).toEqual("bar");

  const schema2 = z
    .object({
      a: z.string(),
      b: z.string(),
    })
    .deferProps();
  const parsed2 = schema2.parse({ a: "foo", b: 1 });
  expect(parsed2.a()).toEqual("foo");
  expect(() => parsed2.b()).toThrow();
});

test("deferProps", () => {
  const schema = z.object({
    stringField: z.string(),
    numberField: z.number(),
    nullableField: z.string().nullable(),
    objectField: z.object({
      a: z.string(),
      b: z.number(),
    }),
  });

  const deferredSchema = schema.deferProps();

  type deferred = z.infer<typeof deferredSchema>;
  type expectedDeferred = {
    stringField: () => string;
    numberField: () => number;
    nullableField: () => string | null;
    objectField: () => {
      a: string;
      b: number;
    };
  };
  util.assertEqual<deferred, expectedDeferred>(true);

  const deferredSchemaWithMask = schema.deferProps({
    stringField: true,
    objectField: true,
  });

  type deferredWithMask = z.infer<typeof deferredSchemaWithMask>;
  type expectedDeferredWithMask = {
    stringField: () => string;
    numberField: number;
    nullableField: string | null;
    objectField: () => {
      a: string;
      b: number;
    };
  };
  util.assertEqual<deferredWithMask, expectedDeferredWithMask>(true);
});

test("usage with effects", () => {
  const transformSchema = z
    .string()
    .transform((value) => value.length)
    .defer();

  expect(() => transformSchema.parse(32)).not.toThrow();
  expect(() => transformSchema.parse(32)()).toThrow();
  expect(() => transformSchema.parse("hello")).not.toThrow();
  expect(transformSchema.parse("hello")()).toEqual(5);
});
