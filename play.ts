import type { z } from "zod/v4";

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

export type RefinedSchema<T extends z.ZodType<object> | z.ZodUnion> = T extends z.ZodUnion
  ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
  : T extends z.ZodType<object>
    ? RefinedTypeSchema<z.output<T>> // <-- Type instantiation is excessively deep and possibly infinite.
    : never;

export type RefinedTypeSchema<T extends object> = T;

export type RefinedUnionSchema<T extends z.ZodUnion> = T;
