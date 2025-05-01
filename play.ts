import * as z from "zod";

const Category = z.object({
  name: z.string(),
  age: z.optional(z.number()),
  get nullself() {
    return Category.nullable();
  },
  get optself() {
    return Category.optional();
  },
  get self() {
    return Category;
  },
  get subcategories() {
    return z.array(Category);
  },
  nested: z.object({
    get sub() {
      return Category;
    },
  }),
});

type _Category = z.output<typeof Category>;
