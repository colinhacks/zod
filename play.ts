import * as z from "zod";

type Category = z.infer<typeof Category>;

const Category = z.object({
  title: z.string(),
  get parent() {
    return Category.nullable();
  },
  get children() {
    return z.array(Category);
  },
});

const cat = Category.parse({
  /* data */
});
cat.children[0].parent!.children[0].parent!.parent!.parent!.parent!.parent!.parent!.parent;

export type { Category };
