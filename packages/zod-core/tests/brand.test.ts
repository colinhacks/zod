import type * as core from "@zod/core";
import * as util from "@zod/core/util";

import { test } from "vitest";

import * as z from "../src/index.js";

test("branded types", () => {
  const mySchema = z
    .object({
      name: z.string(),
    })
    .$brand<"superschema">();

  // simple branding
  type MySchema = z.infer<typeof mySchema>;

  util.assertEqual<MySchema, { name: string } & core.$brand<"superschema">>(true);

  const doStuff = (arg: MySchema) => arg;
  doStuff(z.parse(mySchema, { name: "hello there" }));

  // inheritance
  const extendedSchema = mySchema.$brand<"subschema">();
  type ExtendedSchema = z.infer<typeof extendedSchema>;
  util.assertEqual<ExtendedSchema, { name: string } & z.$brand<"superschema"> & z.$brand<"subschema">>(true);

  doStuff(z.parse(extendedSchema, { name: "hello again" }));

  // number branding
  const numberSchema = z.number().$brand<42>();
  type NumberSchema = z.infer<typeof numberSchema>;
  util.assertEqual<NumberSchema, number & { [z.BRAND]: { 42: true } }>(true);

  // symbol branding
  const MyBrand: unique symbol = Symbol("hello");
  type MyBrand = typeof MyBrand;
  const symbolBrand = z.number().$brand<"sup">().$brand<typeof MyBrand>();
  type SymbolBrand = z.infer<typeof symbolBrand>;
  // number & { [z.BRAND]: { sup: true, [MyBrand]: true } }
  util.assertEqual<SymbolBrand, number & z.$brand<"sup"> & z.$brand<MyBrand>>(true);

  // keeping brands out of input types
  const age = z.number().$brand<"age">();

  type Age = z.infer<typeof age>;
  type AgeInput = z.input<typeof age>;

  util.assertEqual<AgeInput, Age>(false);
  util.assertEqual<number, AgeInput>(true);
  util.assertEqual<number & z.$brand<"age">, Age>(true);

  // @ts-expect-error
  doStuff({ name: "hello there!" });
});
