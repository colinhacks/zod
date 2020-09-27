import * as z from '.';

const run = async () => {
  const data = z
    .object({
      foo: z
        .boolean()
        .nullable()
        .default(true),
      bar: z.boolean().default(true),
    })
    .parse({ foo: null });

  console.log(data);
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
