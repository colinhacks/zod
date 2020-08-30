import * as z from '.';
import { crazySchema } from './crazySchema';

// import { PseudoPromise } from './PseudoPromise';
// import { PseudoPromise } from './PseudoPromise';

const sleep = (time: number) => {
  return new Promise(res => setTimeout(res, time));
};

const numToString = z
  .transformer(z.number(), z.promise(z.string()), async n => {
    console.log(`n: ${n}`);
    return String(n);
  })
  .refine(async arg => {
    console.log(arg);
    const val = await arg;
    console.log(`val: ${val}`);
    return val.length > 6;
  });

const run1 = async () => {
  console.log(`run1`);
  const data = await numToString.parseAsync(57868768);
  console.log(data);
};

const run2 = () => {
  console.log(z.string().parse('asdf'));
};

const run3 = () => {
  crazySchema.parse({
    tuple: ['asdf', 1234, true, null, undefined, '1234'],
    merged: { k1: 'asdf', k2: 12 },
    union: ['asdf', 12, 'asdf', 12, 'asdf', 12],
    array: [12, 15, 16],
    intersection: {},
    enum: 'one',
    nonstrict: { points: 1234 },
    numProm: Promise.resolve(12),
    lenfun: (x: string) => x.length,
  });
};

const run4 = async () => {
  const val = await z
    .string()
    .transform(z.string(), async val => val.toUpperCase())
    .transform(z.string().array(), async val => val.split(''))
    .transform(z.string(), async val => val.join('_'))
    .refine(async _val => {
      await sleep(3000);
      return true;
    })
    .refine(async _val => {
      await sleep(3000);
      return true;
    })
    .refine(async _val => {
      await sleep(3000);
      return true;
    })
    .parseAsync('asdf');

  console.log(`RESULT ${val}`);
};
run1;
run2;
run3;
run4;

// run1();
// run2();
// run3();
run4();
