import * as z from "zod";

const Category = z.object({
  name: z.string(),
  get parent() {
    return Category.nullable();
  },
});

type Category = z.output<typeof Category>;

const Alazy = z.object({
  val: z.number(),
  get b() {
    return Blazy;
  },
  get a() {
    return Alazy;
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
