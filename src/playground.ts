import * as z from '.';
// import { ZodCodec } from './types/codec';

const test = z.codec(z.string(), z.string(), x => x.trim().toUpperCase());
const adsf = test.parse(' asdf ');
console.log(adsf); // => 'ASDF'

const stringToNumber = z.number().accepts(z.string().or(z.number()), data => parseFloat(`${data}`));
console.log(stringToNumber.parse('5') * 5); // 25

// const FormData = z
//   .object({
//     email: z.string().email(),
//     password: z.string().min(10),
//     confirm: z.string().min(10),
//   })
//   .refine(obj => obj.password === obj.confirm, {
//     message: 'Passwords do not match',
//     path: ['confirm'], // sets the path of the error thrown by this refinement
//   });

// try {
//   FormData.parse({
//     email: 'not an email',
//     password: 'tooshort',
//     confirm: 'nomatch',
//   });
// } catch (err) {
//   if (!(err instanceof z.ZodError)) throw err;

//   console.log(err.errors);
//   /*
//   [
//     { code: 'invalid_string', validation: 'email', path: ['email'], message: 'Invalid email' },
//     {
//       code: 'too_small',
//       minimum: 10,
//       type: 'string',
//       inclusive: true,
//       path: ['password'],
//       message: 'Should be at least 10 characters',
//     },
//     {
//       code: 'too_small',
//       minimum: 10,
//       type: 'string',
//       inclusive: true,
//       path: ['confirm'],
//       message: 'Should be at least 10 characters',
//     },
//     { code: 'custom_error', message: 'Passwords do not match', path: ['confirm'] },
//   ];
//   */

//   console.log(err.formErrors);
//   /*
//     {
//     formErrors: [],
//     fieldErrors: {
//       email: ['Invalid email'],
//       password: ['Should be at least 10 characters'],
//       confirm: ['Should be at least 10 characters', 'Passwords do not match'],
//     },
//   }
//   */
// }
//
