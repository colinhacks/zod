import * as z from '.';
// import { User, Post } from './userpost';

// const gen = z.codegen();
// gen.generate(User);
// gen.generate(Post);
// console.log(gen.dump());
const errorMap: z.ZodErrorMap = (error, ctx) => {
  if (error.code === z.ZodErrorCode.invalid_type) {
    if (error.expected === 'string') {
      return "This ain't no string!";
    }
  }
  if (error.code === z.ZodErrorCode.custom_error) {
    return JSON.stringify(error.params, null, 2);
  }
  return ctx.defaultError;
};

try {
  z.string()
    .refinement({
      check: val => val.length > 12,
      // params: { test: 15 },
      message: 'override',
    })
    .parse('asdf', { errorMap });
} catch (err) {
  const zerr: z.ZodError = err;
  console.log(zerr.errors[0].message);
  // expect(zerr.errors[0].message).toEqual('override');
}
