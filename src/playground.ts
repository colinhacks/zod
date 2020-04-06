// import * as z from '.';

// const Animal = z
//   .object({
//     species: z.string(),
//   })
//   .augment({
//     population: z.number(),
//   });

// // overwrites `species`
// const ModifiedAnimal = Animal.augment({
//   species: z.array(z.string()),
// });

// ModifiedAnimal.parse({
//   species: ['asd'],
//   population: 1324,
// });
// ({
//   population:11324,
// })
// import { util } from './types/utils';

// const fish = z.object({
//   name: z.string(),
//   props: z.object({
//     color: z.string(),
//     numScales: z.number(),
//   }),
// }).augment({
//   name:z.number()
// });

// type fish = z.infer<typeof fish>

// interface A {
//   val: number;
//   b: B;
// }

// interface B {
//   val: number;
//   a: A;
// }

// type TypeToShape<T> = {
//   string: z.ZodString;
//   number: z.ZodNumber;
//   boolean: z.ZodBoolean;
//   undefined: z.ZodUndefined;
//   null: z.ZodNull;
//   array: T extends (infer U)[] ? z.ZodArray<TypeToShape<U>> : never;
//   object: z.ZodObject;
//   union: z.ZodUnion;
//   intersection: z.ZodIntersection;
//   tuple: z.ZodTuple;
//   record: z.ZodRecord;
//   literal: T extends infer U ? z.ZodLiteral<U> : never;
//   optional: z.ZodUnion<[z.ZodUndefined, TypeToShape<NoUndef<T>>]>;
//   nullable: z.ZodUnion<[z.ZodNull, TypeToShape<NoNull<T>>]>;
//   // nullable: z.ZodNull;
//   // ZodFunction,
//   // ZodLazy,
//   // ZodEnum,
//   // ZodType,
//   // ZodAny,
//   // ZodDef,
//   // ZodError,
// }[
//   // undefined extends T ?
//   util.AssertEqual<T, string> extends true ? 'string' :
//   util.AssertEqual<T, number> extends true ? 'number' :
//   util.AssertEqual<T, boolean> extends true ? 'boolean' :
//   util.AssertEqual<T, null> extends true ? 'null' :
//   util.AssertEqual<T, undefined> extends true ? 'undefined' :
//   never
// ]

// type StripUndefined<T>  =  T extends (undefined | infer U)  ? U : false
// type NoUndef<T> = T extends undefined ? never : T;
// type NoNull<T> = T extends null ? never : T;

// // type adsf = NoUndef<string | undefined>

// // type lk = keyof number;

// // const fishList = z.array(fish);
// // const numList = z.array(z.string());
// // const modnumList = numList.pick(true);

// // const modFishList = fishList.pick({
// //   // properties: true,
// //   name:true,
// //   properties: {
// //     color:true
// //   }
// // });
// // const modFish = fish.omit({
// //   name: true,
// // });

// // const modFishList = fishList.omit({
// //   name: true,
// //   properties: {
// //     numScales: true,
// //   },
// // });
// // type nonameFish = z.infer<typeof nonameFish>;
