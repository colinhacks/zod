// import * as z from '.';

// const objLit = z.literal({
//   asdf: 'adsf',
//   qwer: ['sdf', 1234],
//   lkjl: {
//     qwer: {
//       oiuwer: [5, 3, { asdf: ['12'] }],
//     },
//   },
// });

// const dogSchema = z
//   .object({
//     name: z.string(),
//     neutered: z.boolean(),
//   })
//   .merge(
//     z.object({
//       age: z.number(),
//     }),
//   )
//   .nonstrict();

// const dog = dogSchema.parse({
//   name: 'Spot',
//   neutered: true,
//   age: 12,
//   color: 'brown',
// });
// console.log(JSON.stringify(dog, null, 2));

// type Dog = z.TypeOf<typeof dogSchema>;
// const spot: Dog = {
//   name: 'Spot',
//   age: 8,
//   neutered: true,
//   color: 'brown', //
// };

// type Primitive = string | number | boolean | null | undefined;
// type Compound<U extends Primitive = Primitive> =
//   | U
//   | { [name: string]: Compound<U> }
//   | []
//   | [Compound<U>]
//   | [Compound<U>, ...Compound<U>[]];
// type Json<U extends Primitive> = U | Compound<U>;

// // this function infers the EXACT type of the value passed into it
// // and returns it as a const will full type information
// export const inferLiteral = <U extends Primitive, T extends Json<U>>(arg: T): T => {
//   return arg;
// };
// // import { ZodError } from './ZodError';

// // const asdf = z.object({
// //   arrstring: z.array(z.object({ str: z.string() })),
// //   tupletest: z.tuple([z.string(), z.number()]),
// //   objarr: z.array(
// //     z.object({
// //       inner: z.boolean(),
// //     }),
// //   ),
// // });

// // z.array(z.string()).parse([1234, 567]);

// // enum Key {
// //   One,
// //   Two
// // }
// // abstract class BaseClass{
// //   abstract key: Key
// // }

// // class Class1 extends BaseClass {
// //   readonly key = Key.One;
// //   one: string = 'one :)';
// // }

// // class Class2 extends BaseClass {
// //   readonly key = Key.Two;
// //   two: string = 'two!';
// // }

// // type SomeSubclass = Class1 | Class2;

// // const run = ()=>{
// //   const qwer: SomeSubclass = "asdf" as any;
// //   switch (qwer.key) {
// //     case Key.One:
// //       // const asdf = qwer.one;
// //       break;
// //     case Key.Two:

// //       break
// //       default:
// //         break
// //   }
// // }
// // run()

// // const qwer = z.literal([{
// //   asdf: Infinity,
// //   qwer:1234
// // }]);

// const obj1 = z
//   .object({
//     str: z.string(),
//   })
// type obj1 = z.TypeOf<typeof obj1>;

// const obj1lax = obj1.nonstrict();
// type obj1lax = z.TypeOf<typeof obj1lax>;
// type obj2p = (typeof obj1lax)['_params']

// const obj2 = z.object({ num: z.number() });

// const obj3 = obj1.merge(obj2).nonstrict();
// type obj3 = z.TypeOf<typeof obj3>;
// type obj3p = typeof obj3['_params'];
// // type obj3params = (typeof obj3)['_params'];

// obj1.parse({
//   str: 'qwer',
//   lkjf: 1234,
// });

// obj3.parse({
//   str: 'asdf',
//   num: 234,
// });

// // type dfgfg = z.Infer<typeof dfgfg>
// // const q: dfgfg = {
// //   asdf: 'asdf',
// //   qwer: 234,
// // };
// // console.log(qwer.);

// // const y:any = "asdf";
// // person.assert(y);

// try {
//   // asdf.parse({
//   //   arrstring: [{ str: 'sdjfksd' }],
//   //   tupletest: ['colin', 2.5],
//   //   objarr: [
//   //     {
//   //       inner: true,
//   //     },
//   //   ],
//   //   wrwerwr: 1234,
//   // });

//   // person.parse({
//   //   name: [{ first: 'Dave', last: 42 }],
//   //   age: 'threeve',
//   //   address: ['123 Maple Street', {}],
//   // });

//   console.log('successful parse!');
// } catch (err) {
//   // console.log(JSON.stringify(err.errors, null, 2));
//   console.log(err.message);
// }

// // type Primitive = string | number | boolean | null | undefined;
// // type Compound<U extends Primitive = Primitive> =
// //   | U
// //   | { [name: string]: Compound<U> }
// //   | []
// //   | [Compound<U>]
// //   | [Compound<U>, ...Compound<U>[]];
// // type Json<U extends Primitive = Primitive> = U | Compound<U>;

// // this function infers the EXACT type of the value passed into it
// // and returns it as a const will full type information
// // const infer1 = <T extends Json>(arg: T): T => {
// //   return arg;
// // };

// // const infer2 = <U extends Json<Primitive>>(arg: U): U extends Json<infer T> ? Json<T> : never => {
// //   return arg as Json<T>;
// // };

// // const inferLiteral = infer1;

// // const test1 = inferLiteral('asdf'); // typeof test1 => "asdf"
// // const test2 = inferLiteral(341); // typeof test2 => 341
// // const test3 = inferLiteral(false); // typeof test3 => false
// // const test4 = inferLiteral(null); // typeof test4 => null
// // const test5 = inferLiteral(undefined); // typeof test5 => undefined
// // const test6 = inferLiteral([]); // typeof test6 => []
// // const test7 = inferLiteral(['asdf']); // typeof test6 => []
// // const test8 = inferLiteral([{ asdf: 'qer' }]); // typeof test7 => [{ asdf: 'qer' }]
// // const test9 = inferLiteral({
// //   asdf: [
// //     {
// //       asdf: 'qwer',
// //       asdfn: 12,
// //       asdfb: false,
// //       wer: {},
// //       lkulk: [false, 'asdf', 1234],
// //       empt: [],
// //       emptr: ['asdf'],
// //     },
// //   ],
// // });

// // const und = z.literal(undefined);

// // const MyEnum = z.enum([z.literal('Hello'), z.literal('There'), z.literal('Bobby')]);
// // MyEnum.parse('Bobby');
// // type MyEnum = z.Infer<typeof MyEnum>;

// // const CellText = z.object({
// //   kind: z.literal('text'),
// //   body: z.string(),
// // });

// // const CellCode = z.object({
// //   kind: z.literal('code'),
// //   code: z.string(),
// // });

// // const Schema = z.array(
// //   z.object({
// //     category: z.string(),
// //     cells: z.array(z.union([CellText, CellCode])).nonempty(),
// //   }),
// // );

// // // const y: ['asdf', 'qwer'] = ['asdf', 'qwer'];
// // type U = ['asdf', 'qwer']
// // type Tail<Tuple extends any[]> = ((...args: Tuple) => any) extends (_: any, ..._1: infer Rest) => any
// //   ? Rest extends any[] ? Rest : never
// //   : never;

// //   export type ArrayKeys = keyof any[];
// // export type Indices<T> = Exclude<keyof T, ArrayKeys>;

// // type UM<T extends string[]> = {[k in Indices<T>]: T[k] extends string ? z.ZodLiteral<T[k]> : never};
// // type UMU = UM<U>
// // type p = UMU[0]

// // type Ad = Tail<string[]>
// // type Mapper<T extends string[]> = {
// //   empty: T,
// //   single: T,
// //   many: [T[0], ...ForceArray<Mapper<T>>],
// //   never: never
// // }[T extends [] ? 'empty' : T extends [any] ? 'single' : T extends any[] ? 'many' : 'never'];

// // type ForceArray<T extends any[]> = T extends (infer U) ? U extends any[] ? U : never : never;
// // type MapRest<T extends string[]> = { 0: Mapper<Tail<T>> extends any[] ? Mapper<Tail<T>> : never, 1: never }[true ? 0 : 1]
// // type MU = MapRest<["wer", "asdf"]>

// // // if (!Schema.is(y)) {
// // //   y[0].cells[0].kind; // => "text" | "code"
// // //   throw new Error("adsf")
// // // }
