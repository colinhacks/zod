// import * as z from '.';

// const y = z.string();
// // // interface Category {
// // //   name: string;
// // //   categories: Array<Category>;
// // // }

// // // const Cat: z.ZodType<Category> = z.lazy(() => {
// // //   // console.log(Cat);
// // //   return z.object({
// // //     name: z.string(),
// // //     categories: z.array(Cat),
// // //   });
// // // });

// const C = z.object({
//   foo: z.string(),
//   bar: z.number().optional(),
// });

// const f: any = { foo: 'asdf', bar: 1234 };

// if (C.is(f)) {
//   console.log(`${f.bar}: ${f.foo}`);
// } else {
//   console.log('No C');
// }

// const run = (f: any) => {
//   C.assert(f);
// };

// type C = z.TypeOf<typeof C>;
// /* {
// 	foo: string;
// 	bar?: number | undefined
// } */
