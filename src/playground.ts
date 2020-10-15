import * as z from '.';

const run = async () => {
  const base = z.object({
    hello: z.string(),
    foo: z.number().refine(
      async () => {
        return false;
      },
      { message: 'invalid' },
    ),
  });
  const result = await base.safeParseAsync({ hello: 3, foo: 3 });
  console.log(result);
};

run();

// export const T = z.object({
//   test: z.string().optional(),
// });

// console.log(T.safeParse({}));

// const r = T.safeParse({});

// if (r.success) {
//   console.log(JSON.stringify(r.data));
// }

// console.log(JSON.stringify({ test: undefined, test2: undefined }, null, 2));
