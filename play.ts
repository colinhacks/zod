import { expectTypeOf } from "vitest";
import { z } from "zod/v4";

// const Category = z.object({
//   name: z.string(),
//   get subcategories() {
//     return z.array(Category);
//   },
// });

// type Category = z.infer<typeof Category>["subcategories"][0]["subcategories"];
// type a = z.core._$ZodTypeInternals["output"];
// type b = z.core.$ZodTypeInternals["output"];
// type c = z.core.$ZodObjectInternals["output"];
// type d = z.ZodObjectInternals["output"];
// type e = z._ZodTypeInternals["output"];
// type f = z.ZodTypeInternals["output"];

// import { z } from "zod/v4";

// const feature = z.object({
//   title: z.string(),
//   get features(): z.ZodOptional<z.ZodArray<typeof feature>> {
//     return z.optional(z.array(feature)); //.optional();
//   },
// });
// const arg = feature.parse({});
// arg.title;

// // type Feature = z.infer<typeof feature>["features"];

// const output = z.object({
//   id: z.int(), //.nonnegative(),
//   name: z.string(),
//   features: z.array(feature), //.array(), // <—
// });

// type Output = z.output<typeof output>;
// // type Output = NonNullable<
// //   NonNullable<z.output<typeof output>["features"][0]["features"]>[0]["features"]
// // >[0]["features"];

// type _RefinedSchema<T extends z.ZodType<object> | z.ZodUnion> = T extends z.ZodUnion
//   ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
//   : T extends z.ZodType<object>
//     ? RefinedTypeSchema<z.output<T>> // <-- Type instantiation is excessively deep and possibly infinite.
//     : never;

// type RefinedTypeSchema<T extends object> = T;

// type RefinedUnionSchema<T extends z.ZodUnion> = T;

const Feature = z.object({
  title: z.string(),
  get features(): z.ZodOptional<z.ZodArray<typeof Feature>> {
    return z.optional(z.array(Feature)); //.optional();
  },
  get output() {
    return Output.optional();
  },
});

const f = Feature.parse({});
f.features![0].features![0].title;
type Feature = z.infer<typeof Feature>; //["features"];

const Output = z.object({
  id: z.int(), //.nonnegative(),
  name: z.string(),
  features: z.array(Feature), //.array(), // <—
});

type Output = z.output<typeof Output>;

type _Feature = {
  title: string;
  features?: _Feature[] | undefined;
  output?: _Output | undefined;
};

type _Output = {
  id: number;
  name: string;
  features: _Feature[];
};

expectTypeOf<Feature>().toEqualTypeOf<_Feature>();
expectTypeOf<Output>().toEqualTypeOf<_Output>();
