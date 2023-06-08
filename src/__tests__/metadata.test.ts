import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

const metadata = { foo: "bar" as const };

test("extractMetadata from ZodTypeAny", () => {
  const schema = z.any();
  util.assertEqual<z.extractMetadata<typeof schema>, never>(true);
  expect(z.extractMetadata(schema)).toEqual(undefined);
});
test("extractMetadata from ZodObject", () => {
  const schema = z.object({ a: z.string().withMetadata(metadata) });
  util.assertEqual<z.extractMetadata<typeof schema>, never>(true);
  expect(z.extractMetadata(schema)).toEqual(undefined);
});
test("extractMetadata from ZodUnion", () => {
  const schema = z.union([
    z.string().withMetadata(metadata),
    z.number().withMetadata(metadata),
  ]);
  util.assertEqual<z.extractMetadata<typeof schema>, never>(true);
  expect(z.extractMetadata(schema)).toEqual(undefined);
});
test("extractMetadata from ZodLazy of ZodAny", () => {
  const schema = z.lazy(() => z.any());
  util.assertEqual<z.extractMetadata<typeof schema>, never>(true);
  expect(z.extractMetadata(schema)).toEqual(undefined);
});

test("extractMetadata from ZodString", () => {
  const schema = z.string().withMetadata(metadata);
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodOptional", () => {
  const schema = z.string().withMetadata(metadata).optional();
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodNullable", () => {
  const schema = z.string().withMetadata(metadata).nullable();
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodDefault", () => {
  const schema = z.string().withMetadata(metadata).default("default");
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodLazy", () => {
  const schema = z.lazy(() => z.string().withMetadata(metadata));
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodCatch", () => {
  const schema = z.string().withMetadata(metadata).catch("default");
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodBrand", () => {
  const schema = z.string().withMetadata(metadata).brand("blah");
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodEffects", () => {
  const schema = z
    .number()
    .withMetadata(metadata)
    .transform((x) => String(x));
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodPipeline", () => {
  const schema = z
    .number()
    .transform((x) => String(x))
    .pipe(z.string())
    .withMetadata(metadata);
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from ZodPromise", () => {
  const schema = z.string().withMetadata(metadata).promise();
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});
test("extractMetadata from big chain", () => {
  const schema = z.lazy(() =>
    z
      .string()
      .withMetadata({ foo: "glarb" as const })
      .nullable()
      .withMetadata(metadata)
      .default("default")
      .promise()
  );
  util.assertEqual<z.extractMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractMetadata(schema)).toEqual(metadata);
});

test("extractDeepMetadata from ZodTypeAny", () => {
  const schema = z.any();
  util.assertEqual<z.extractDeepMetadata<typeof schema>, never>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(undefined);
});
test("extractDeepMetadata from ZodObject", () => {
  const schema = z.object({ a: z.string().withMetadata(metadata) });
  util.assertEqual<z.extractDeepMetadata<typeof schema>, never>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(undefined);
});
test("extractDeepMetadata from ZodUnion", () => {
  const schema = z.union([
    z.string().withMetadata(metadata),
    z.number().withMetadata(metadata),
  ]);
  util.assertEqual<z.extractDeepMetadata<typeof schema>, never>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(undefined);
});
test("extractDeepMetadata from ZodArray of ZodAny", () => {
  const schema = z.any().array();
  util.assertEqual<z.extractDeepMetadata<typeof schema>, never>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(undefined);
});

test("extractDeepMetadata from ZodString", () => {
  const schema = z.string().withMetadata(metadata);
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodOptional", () => {
  const schema = z.string().withMetadata(metadata).optional();
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodNullable", () => {
  const schema = z.string().withMetadata(metadata).nullable();
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodDefault", () => {
  const schema = z.string().withMetadata(metadata).default("default");
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodLazy", () => {
  const schema = z.lazy(() => z.string().withMetadata(metadata));
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodCatch", () => {
  const schema = z.string().withMetadata(metadata).catch("default");
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodBrand", () => {
  const schema = z.string().withMetadata(metadata).brand("blah");
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodEffects", () => {
  const schema = z
    .number()
    .withMetadata(metadata)
    .transform((x) => String(x));
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodPipeline", () => {
  const schema = z
    .number()
    .transform((x) => String(x))
    .pipe(z.string())
    .withMetadata(metadata);
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodPromise", () => {
  const schema = z.string().withMetadata(metadata).promise();
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodArray", () => {
  const schema = z.array(z.string().withMetadata(metadata));
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodSet", () => {
  const schema = z.set(z.string().withMetadata(metadata));
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from ZodPromise", () => {
  const schema = z.promise(z.string().withMetadata(metadata));
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
test("extractDeepMetadata from big chain", () => {
  const schema = z.lazy(() =>
    z
      .string()
      .withMetadata({ foo: "glarb" as const })
      .nullable()
      .withMetadata(metadata)
      .default("default")
      .array()
      .promise()
  );
  util.assertEqual<z.extractDeepMetadata<typeof schema>, typeof metadata>(true);
  expect(z.extractDeepMetadata(schema)).toEqual(metadata);
});
