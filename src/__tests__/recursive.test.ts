// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

test("test", () => {});
// import * as z from '../index';

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

// test('repeated parsing', () => {
//   const extensions = z.object({
//     name: z.string(),
//   });

//   const dog = z.object({
//     extensions,
//   });

//   const cat = z.object({
//     extensions,
//   });

//   const animal = z.union([dog, cat]);

//   // it should output type error because name is ought to be type of string
//   expect(() => animal.parse({ extensions: { name: 123 } })).toThrow;
// });

// test('repeated errors', () => {
//   const Shape = z.array(
//     z.object({
//       name: z.string().nonempty(),
//       value: z.string().nonempty(),
//     }),
//   );

//   const data = [
//     {
//       name: 'Name 1',
//       value: 'Value',
//     },
//     {
//       name: '',
//       value: 'Value',
//     },
//     {
//       name: '',
//       value: '',
//     },
//   ];

//   try {
//     Shape.parse(data);
//   } catch (e) {
//     if (e instanceof z.ZodError) {
//       expect(e.issues.length).toEqual(3);
//     }
//   }
// });

// test('unions of object', () => {
//   const base = z.object({
//     id: z.string(),
//   });

//   const type1 = base.merge(
//     z.object({
//       type: z.literal('type1'),
//     }),
//   );

//   const type2 = base.merge(
//     z.object({
//       type: z.literal('type2'),
//     }),
//   );

//   const union1 = z.union([type1, type2]);
//   const union2 = z.union([type2, type1]);

//   const value1 = {
//     type: 'type1',
//   };

//   const value2 = {
//     type: 'type2',
//   };

//   expect(type1.check(value1)).toEqual(false);
//   expect(union1.check(value1)).toEqual(false);
//   expect(union2.check(value1)).toEqual(false);
//   expect(type2.check(value2)).toEqual(false);
//   expect(union1.check(value2)).toEqual(false);
//   expect(union2.check(value2)).toEqual(false);
// });
