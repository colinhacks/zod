import { z } from "./src";
const baseCategorySchema = z.object({
  // - name: z.string(),
  name: z.string().brand("CategoryName"),
});

type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};

const categorySchema: z.ZodType<Category> = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});
