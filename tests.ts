import * as z from '.';

interface Category {
  name: string;
  categories: Array<Category>;
}

const Cat: z.ZodType<Category> = z.lazy(() => {
  // console.log(Cat);
  return z.object({
    name: z.string(),
    categories: z.array(Cat),
  });
});
