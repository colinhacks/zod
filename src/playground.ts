import * as z from '.';

const schema = z.object({
  items: z.array(z.string()).refine(data => data.length > 3, {
    path: ['items-too-few'],
    // message: 'asldkfjsd',
  }),
});

const customErrorMap: z.ZodErrorMap = (error, ctx) => {
  // console.log(`code: ${error.code}`);
  // console.log('message:', error.message);
  // console.log('path:', error.path);
  console.log(JSON.stringify(error, null, 2));
  console.log('data:', data);

  return { message: error.message || ctx.defaultError };
};
const data = { items: ['first'] };
const parsed = schema.safeParse(data, { errorMap: customErrorMap });
console.log(JSON.stringify(parsed, null, 2));
