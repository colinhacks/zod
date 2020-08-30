// import * as z from '../index';

test('recursion', () => {});

// interface A {
//   val: number;
//   b: B;
// }

// interface B {
//   val: number;
//   a: A;
// }

// const A: z.ZodType<A> = z.late.object(() => ({
//   val: z.number(),
//   b: B,
// }));

// const B: z.ZodType<B> = z.late.object(() => ({
//   val: z.number(),
//   a: A,
// }));

// const a: any = { val: 1 };
// const b: any = { val: 2 };
// a.b = b;
// b.a = a;

// test('valid check', () => {
//   A.parse(a);
//   B.parse(b);
// });

// test('masking check', () => {
//   const FragmentOnA = z
//     .object({
//       val: z.number(),
//       b: z
//         .object({
//           val: z.number(),
//           a: z
//             .object({
//               val: z.number(),
//             })
//             .nonstrict(),
//         })
//         .nonstrict(),
//     })
//     .nonstrict();

//   const fragment = FragmentOnA.parse(a);
//   fragment;
// });

// test('invalid check', () => {
//   expect(() => A.parse({} as any)).toThrow();
// });

// test('toJSON throws', () => {
//   const checker = () => A.toJSON();
//   expect(checker).toThrow();
// });

// test('schema getter', () => {
//   (A as z.ZodLazy<any>).schema;
// });

// test('self recursion', () => {
//   interface Category {
//     name: string;
//     subcategories: Category[];
//   }

//   const Category: z.Schema<Category> = z.late.object(() => ({
//     name: z.string(),
//     subcategories: z.array(Category),
//   }));

//   const untypedCategory: any = {
//     name: 'Category A',
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory);
// });

// test('self recursion with base type', () => {
//   const BaseCategory = z.object({
//     name: z.string(),
//   });
//   type BaseCategory = z.infer<typeof BaseCategory>;

//   type Category = BaseCategory & { subcategories: Category[] };

//   const Category: z.Schema<Category> = z.late
//     .object(() => ({
//       subcategories: z.array(Category),
//     }))
//     .extend({
//       name: z.string(),
//     });

//   const untypedCategory: any = {
//     name: 'Category A',
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory); // parses successfully
// });
