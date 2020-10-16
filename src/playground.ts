import * as z from '.';
import { ZodIssueCode } from './ZodError';

const run = async () => {
  const noNested = z.string()._refinement((_val, ctx) => {
    if (ctx.path.length > 0) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `schema cannot be nested. path: ${ctx.path.join('.')}`,
      });
    }
  });

  const data = z.object({
    foo: noNested,
  });

  const t1 = await noNested.spa('asdf');
  const t2 = await data.spa({ foo: 'asdf' });
  console.log(t1);
  console.log(t2);
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
