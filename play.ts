import { z } from "zod/v4";

z;

// import * as z from "zod/v4";

export type SomeRecursiveUnion1 = z.ZodUnion<
  [
    z.ZodObject<{
      foo: z.ZodReadonly<z.ZodPrefault<SomeRecursiveUnion1>>;
    }>,
  ]
>;

// type Foo = z.core.$ZodRecord<z.ZodString, B>;
// type B = z.ZodPipe<B, Foo>;

const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(z.union([z.string(), Category]));
  },
});

const err = new z.core.$ZodError([
  {
    code: "invalid_type",
    expected: "string",
    path: [],
    message: "Expected string, received number",
    input: 1,
  },
]);
console.log(err.toString());
// But it works without `z.ZodReadonly` or without recursive reference:

// export type SomeRecursiveUnion2 = z.ZodUnion<
//   [
//     z.ZodObject<{
//       foo: z.ZodRecord<z.ZodString, SomeRecursiveUnion2>;
//       bar: z.ZodReadonly<z.ZodRecord<z.ZodString, z.ZodString>>;
//     }>,
//   ]
// >;
