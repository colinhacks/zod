import { z } from "./src";
z;

const baseCategorySchema = z.object({
  name: z.string().brand("CategoryName"),
});

type CategoryInput = z.input<typeof baseCategorySchema> & {
  subcategories: CategoryInput[];
};
type CategoryOutput = z.output<typeof baseCategorySchema> & {
  subcategories: CategoryOutput[];
};

const categorySchema: z.ZodType<CategoryOutput, any, CategoryInput> =
  baseCategorySchema.extend({
    subcategories: z.lazy(() => categorySchema.array()),
  });
