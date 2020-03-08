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

// const inp = z.string();
// const outp = z.number();
// const fun = z.function(z.tuple([inp]), outp);
// fun.validate((s)=>{
//   return 4
// })
