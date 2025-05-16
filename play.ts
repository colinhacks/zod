import { z } from "zod/v4";

const baseCategorySchema = z.object({
  name: z.string(),
});
type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};
const categorySchema: z.ZodType<Category> = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});
