import { expectTypeOf, test } from "vitest";
import * as z from "zod";

test("branded types", () => {
  const mySchema = z
    .object({
      name: z.string(),
    })
    .brand<"superschema">();

  // simple branding
  type MySchema = z.infer<typeof mySchema>;

  expectTypeOf<MySchema>().toEqualTypeOf<{ name: string } & z.$brand<"superschema">>();

  const doStuff = (arg: MySchema) => arg;
  doStuff(mySchema.parse({ name: "hello there" }));

  // inheritance
  const extendedSchema = mySchema.brand<"subschema">();
  type ExtendedSchema = z.infer<typeof extendedSchema>;
  expectTypeOf<ExtendedSchema>().toEqualTypeOf<{ name: string } & z.$brand<"superschema"> & z.$brand<"subschema">>();

  doStuff(extendedSchema.parse({ name: "hello again" }));

  // number branding
  const numberSchema = z.number().brand<42>();
  type NumberSchema = z.infer<typeof numberSchema>;
  expectTypeOf<NumberSchema>().toEqualTypeOf<number & { [z.$brand]: 42 }>();

  // symbol branding
  const MyBrand: unique symbol = Symbol("hello");
  type MyBrand = typeof MyBrand;
  const symbolBrand = z.number().brand<"sup">().brand<typeof MyBrand>();
  type SymbolBrand = z.infer<typeof symbolBrand>;
  // number & { [z.BRAND]: { sup: true, [MyBrand]: true } }
  expectTypeOf<SymbolBrand>().toEqualTypeOf<number & z.$brand<"sup"> & z.$brand<MyBrand>>();

  // keeping brands out of input types
  const age = z.number().brand<"age">();

  type Age = z.infer<typeof age>;
  type AgeInput = z.input<typeof age>;

  expectTypeOf<AgeInput>().not.toEqualTypeOf<Age>();
  expectTypeOf<number>().toEqualTypeOf<AgeInput>();
  expectTypeOf<number & z.$brand<"age">>().toEqualTypeOf<Age>();

  // @ts-expect-error
  doStuff({ name: "hello there!" });
});
