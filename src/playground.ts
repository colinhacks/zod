import * as z from '.';
import { ZodCodec } from './types/codec';

const stringToNumber = ZodCodec.create(z.union([z.string(), z.number()]), z.number(), x => parseFloat(`${x}`));

const adsf = stringToNumber.parse('12345');
console.log(adsf);

const FormData = z
  .object({
    email: z.string().email(),
    password: z.string().min(10),
    confirm: z.string().min(10),
  })
  .refine(obj => obj.password === obj.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'], // sets the path of the error thrown by this refinement
  });

try {
  FormData.parse({
    email: 'not an email',
    password: 'tooshort',
    confirm: 'nomatch',
  });
} catch (err) {
  if (!(err instanceof z.ZodError)) throw err;

  console.log(err.errors);
  /*
  [
    { code: 'invalid_string', validation: 'email', path: ['email'], message: 'Invalid email' },
    {
      code: 'too_small',
      minimum: 10,
      type: 'string',
      inclusive: true,
      path: ['password'],
      message: 'Should be at least 10 characters',
    },
    {
      code: 'too_small',
      minimum: 10,
      type: 'string',
      inclusive: true,
      path: ['confirm'],
      message: 'Should be at least 10 characters',
    },
    { code: 'custom_error', message: 'Passwords do not match', path: ['confirm'] },
  ]; 
  */

  console.log(err.formErrors);
  /*
    {
    formErrors: [],
    fieldErrors: {
      email: ['Invalid email'],
      password: ['Should be at least 10 characters'],
      confirm: ['Should be at least 10 characters', 'Passwords do not match'],
    },
  }
  */
}
