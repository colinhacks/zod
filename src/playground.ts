import * as z from '.';

const run = async () => {
  let count = 0;

  const base = z.object({
    hello: z.string(),
    foo: z
      .number()
      .refine(async () => {
        count++;
        return false;
      })
      .refine(async () => {
        count++;
        return false;
      }),
  });

  const testval = { hello: 'bye', foo: 3 };
  const result1 = await base.safeParseAsync(testval);
  const result2 = await base.safeParseAsync(testval, {
    runAsyncValidationsInSeries: true,
  });

  if (result1.success === false) {
    console.log(`count: ${count}`);
    console.log(`issues: ${result1.error.issues.length}`);
    console.log(result1);
  }

  if (result2.success === false) {
    console.log(`count: ${count}`);
    console.log(`issues: ${result2.error.issues.length}`);
    console.log(result2);
  }
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
