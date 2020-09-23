import * as z from '.';
// import { Scalars } from './helpers/primitive';

// const obj = z.object({
//   primitiveTuple: z.tuple([z.string(), z.number()]),
//   nonprimitiveTuple: z.tuple([z.string(), z.number().array()]),
// });

// type obj = z.infer<typeof obj>;

// const prim = obj.primitives();
// console.log(prim.shape);
// const nonprim = obj.nonprimitives();
// console.log(nonprim.shape);
// // .primitives();

export const T = z.object({
  test: z.string().optional(),
});

console.log(T.safeParse({}));

const r = T.safeParse({});

if (r.success) {
  console.log(JSON.stringify(r.data));
}

// type t1 = [[string, number]] extends [Scalars] ? true : false;
