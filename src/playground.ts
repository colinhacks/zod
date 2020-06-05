// import * as z from '.';
// // const stringSchema = z.string();
// // try {
// //   stringSchema.parse(12);
// // } catch (err) {
// //   const zerr: z.ZodError = err;
// //   zerr.stack;
// //   console.log(err instanceof z.ZodError);
// //   if (err instanceof z.ZodError) {
// //     // handle
// //     // err.
// //   }
// // }

// const myObject = z
//   .object({
//     first: z.string(),
//     second: z.string(),
//   })
//   .partial()
//   .refine(data => data.first || data.second, 'Either first or second should be filled in.');

// myObject.parse({
//   first: 'asdf',
// });

// myObject.parse({
//   second: 'asdf',
// });

// myObject.parse({
//   first: 'wqewdscsdf',
//   second: 'asdf',
// });

// myObject.parse({});
