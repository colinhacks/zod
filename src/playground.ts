import * as z from '.';
// import { ZodCodec } from './types/codec';

const test = z.codec(z.string(), z.string(), x => x.trim().toUpperCase());
const adsf = test.parse(' asdf ');
console.log(adsf); // => 'ASDF'

const stringToNumber = z.number().accepts(z.string().or(z.number()), data => parseFloat(`${data}`));
console.log(stringToNumber.parse('5') * 5); // 25

export const parseAndCatch = <T extends z.ZodType<any, any>>(schema: T, data: unknown): T['_type'] => {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error();
      // transform err.errors and throw custom error class
    } else {
      throw new Error();
    }
  }
};

export const parseFactory = <T extends z.ZodType<any, any>>(schema: T) => (data: unknown): T['_type'] => {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error();
      // transform err.errors and throw custom error class
    } else {
      throw new Error();
    }
  }
};

const user = z.object({ name: z.string() });
const userParse = parseFactory(user);
const myUser = userParse({ name: 'asdf' });
console.log(JSON.stringify(myUser, null, 2));

// class MyZodString extends z.ZodString {
//   _length: number;

//   length(...args: Parameters<z.ZodString['length']>): this {
//     const [len, err] = args;
//     this._length = len;
//     return super.length(len, err);
//   }
// }

// const u = z.string().uuid();
const uuid = '9491d710-3185-4e06-bea0-6a2f275345e0';
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;

console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
console.log(uuidRegex.test(uuid));
// console.log(u.parse(uuid));
// console.log(u.parse(uuid));
