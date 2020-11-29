// import * as z from '.';

// (async () => {
//   const numberString = z.string().refine(val => !isNaN(Number.parseFloat(val)), {message:"Invalid string input."}).transform(z.number(), Number.parseFloat);
//   const s1 = z
//     .union([
//       z.number(),
//       z
//         .string()
//         .transform(z.number().refine(), Number.parseFloat)
//         .refine(val => typeof val === 'number' && !isNaN(val), {
//           message: 'Invalid string input',
//         }),
//     ])
//     .refine(v => v >= 1, { message: 'Too small' });
//   console.log(await s1.spa('foo')); // throws "Invalid string input"
//   console.log(await s1.spa('0.4')); // throws "Too small"
//   console.log(await s1.spa('1.6')); // returns 1.6
//   //  console.log(d1);
// })();
