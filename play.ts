import * as z from "zod";

const Category = z.object({
  name: z.string(),
  get self() {
    return Category.optional().nullable();
  },
  get parent() {
    return Category.nullable();
  },
  get subcategories() {
    return z.array(Category);
  },
});

type Category = z.output<typeof Category>;

const Alazy = z.object({
  val: z.number(),
  get b() {
    return Blazy;
  },
});
type Alazy = z.infer<typeof Alazy>;

const Blazy = z.object({
  val: z.number(),
  get a() {
    return z.optional(Alazy);
  },
});
type Blazy = z.infer<typeof Blazy>;

export type { Category };
