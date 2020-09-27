import * as z from '.';

const run = async () => {
  const SNamedEntity = z.object({
    id: z.string(),
    set: z.string().optional(),
    unset: z.string().optional(),
  });
  const result = await SNamedEntity.parse({
    id: 'asdf',
    set: undefined,
  });
  console.log(result);
  console.log(Object.keys(result));
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
