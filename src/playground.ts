import * as z from '.';
import { util } from './helpers/util';
const promSchema = z.promise(
  z.object({
    name: z.string(),
    age: z.number(),
  }),
);

const y = () => util.getObjectType(new Promise(() => {}));
y.toString();

const run = async () => {
  await promSchema.parse(Promise.resolve({ name: 'Bobby', age: 10 }));

  const bad = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
  // await bad;

  bad
    .then(val => {
      console.log(JSON.stringify(val, null, 2));
    })
    .catch(err => {
      if (err instanceof z.ZodError) {
        console.log(JSON.stringify(err.errors, null, 2));
      }
    });
  return bad;
};
run().catch((err: any) => {
  console.log('caught zod error!');
  console.log(err);
});

// expect(bad).toThrow();

// const failPromise = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
// failPromise.catch(err => {
//   console.log(err);
//   console.log(err.message);
//   expect(err instanceof ZodError).toBeTruthy();
// });
