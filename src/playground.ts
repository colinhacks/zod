// import * as z from '.';

// const asdf = z
//   .union([
//     z.number(),
//     z.string().transform(z.number(), val => {
//       console.log(val);
//       return parseFloat(val);
//     }),
//   ])
//   .refine(v => v >= 1);

// console.log(asdf.safeParse('foo'));
// // const formValuesSchema = z.object({
// //   name: z.string(),
// //   company: z.string(),
// //   email: z.string().email(),
// // });

// // // only informs, that name and company is required, doesn't report about invalid email
// // formValuesSchema.parse({
// //   email: 'aaa',
// // });

// // // now when other values are present, informs about invalid email
// // formValuesSchema.parse({
// //   name: 'lorem',
// //   email: 'aaa',
// //   company: 'ipsum',
// // });
