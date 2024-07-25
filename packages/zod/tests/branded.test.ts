// @ts-ignore TS6133
import { test } from "vitest";
import * as core from "zod-core";

import * as z from "../src/index.js";

test("branded types", () => {
  const mySchema = z
    .object({
      name: z.string(),
    })
    .brand<"superschema">();

  // simple branding
  type MySchema = z.infer<typeof mySchema>;
  core.assertEqual<
    MySchema,
    { name: string } & { [z.BRAND]: { superschema: true } }
  >(true);

  const doStuff = (arg: MySchema) => arg;
  doStuff(mySchema.parse({ name: "hello there" }));

  // inheritance
  const extendedSchema = mySchema.brand<"subschema">();
  type ExtendedSchema = z.infer<typeof extendedSchema>;
  core.assertEqual<
    ExtendedSchema,
    { name: string } & z.BRAND<"superschema"> & z.BRAND<"subschema">
  >(true);

  doStuff(extendedSchema.parse({ name: "hello again" }));

  // number branding
  const numberSchema = z.number().brand<42>();
  type NumberSchema = z.infer<typeof numberSchema>;
  core.assertEqual<NumberSchema, number & { [z.BRAND]: { 42: true } }>(true);

  // symbol branding
  const MyBrand: unique symbol = Symbol("hello");
  type MyBrand = typeof MyBrand;
  const symbolBrand = z.number().brand<"sup">().brand<typeof MyBrand>();
  type SymbolBrand = z.infer<typeof symbolBrand>;
  // number & { [z.BRAND]: { sup: true, [MyBrand]: true } }
  core.assertEqual<SymbolBrand, number & z.BRAND<"sup"> & z.BRAND<MyBrand>>(
    true
  );

  // keeping brands out of input types
  const age = z.number().brand<"age">();

  type Age = z.infer<typeof age>;
  type AgeInput = z.input<typeof age>;

  core.assertEqual<AgeInput, Age>(false);
  core.assertEqual<number, AgeInput>(true);
  core.assertEqual<number & z.BRAND<"age">, Age>(true);

  // @ts-expect-error
  doStuff({ name: "hello there!" });
});
