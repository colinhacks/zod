// import * as z from '.';

// const und = z.literal(undefined);

// const MyEnum = z.enum([z.literal('Hello'), z.literal('There'), z.literal('Bobby')]);
// MyEnum.parse('Bobby');
// type MyEnum = z.Infer<typeof MyEnum>;

// const CellText = z.object({
//   kind: z.literal('text'),
//   body: z.string(),
// });

// const CellCode = z.object({
//   kind: z.literal('code'),
//   code: z.string(),
// });

// const Schema = z.array(
//   z.object({
//     category: z.string(),
//     cells: z.array(z.union([CellText, CellCode])).nonempty(),
//   }),
// );

// // const y: ['asdf', 'qwer'] = ['asdf', 'qwer'];
// type U = ['asdf', 'qwer']
// type Tail<Tuple extends any[]> = ((...args: Tuple) => any) extends (_: any, ..._1: infer Rest) => any
//   ? Rest extends any[] ? Rest : never
//   : never;

//   export type ArrayKeys = keyof any[];
// export type Indices<T> = Exclude<keyof T, ArrayKeys>;

// type UM<T extends string[]> = {[k in Indices<T>]: T[k] extends string ? z.ZodLiteral<T[k]> : never};
// type UMU = UM<U>
// type p = UMU[0]

// type Ad = Tail<string[]>
// type Mapper<T extends string[]> = {
//   empty: T,
//   single: T,
//   many: [T[0], ...ForceArray<Mapper<T>>],
//   never: never
// }[T extends [] ? 'empty' : T extends [any] ? 'single' : T extends any[] ? 'many' : 'never'];

// type ForceArray<T extends any[]> = T extends (infer U) ? U extends any[] ? U : never : never;
// type MapRest<T extends string[]> = { 0: Mapper<Tail<T>> extends any[] ? Mapper<Tail<T>> : never, 1: never }[true ? 0 : 1]
// type MU = MapRest<["wer", "asdf"]>

// // if (!Schema.is(y)) {
// //   y[0].cells[0].kind; // => "text" | "code"
// //   throw new Error("adsf")
// // }
