import * as z from '.';
// import { PseudoPromise } from './PseudoPromise';
// import { PseudoPromise } from './PseudoPromise';

const run1 = async () => {
  console.log('starting async parse');
  z.date().parse('asdf');
  // z.object({
  //   password: z.string(),
  //   confirm: z.string(),
  // })
  //   .refine(data => data.confirm === data.password, { path: ['confirm'], message: "Passwords don't match." })
  //   .parseAsync({ password: 'asdf', confirm: 'qewr' })
  //   .then(v => {
  //     console.log('FINAL');
  //     console.log(v);
  //   });
};

const run2 = async () => {
  const arg = z.string();
  const data = 'asdkfhasdfasdf';
  // z.object({
  //   f1: z.number(),
  //   f2: z.string().nullable(),
  //   f3: z.array(z.boolean().optional()).optional(),
  // });
  // const data = {
  //   f1: 21,
  //   f2: 'asdf',
  //   f3: [true, false],
  // }

  // const returns2 = z.union([z.string(), z.number()]);

  const func = z.function(z.tuple([arg]), arg).validate(_x => {
    return _x;
  });

  console.log('\n\nRUNNING FUNCTION');
  const val = func(data);
  console.log('\ngot val');
  console.log(val);
  // console.log(typeof val);
  // const result = await val;
  // console.log(`got result!!`);
  // console.log(JSON.stringify(result, null, 2));
};

const run3 = async () => {
  console.log('\n');
  const arg = z.string();
  const func = z.function(z.tuple([arg]), arg).validate(x => x);

  const val = func('asdfasdfafs');
  console.log('\ngot val');
  console.log(val);
  // const func = await prom.getValue();
  // console.log(func);
};

interface A {
  val: number;
  a: A;
}

const A: z.ZodType<A> = z.late.object(() => ({
  val: z.number(),
  a: A,
}));

const run4 = () => {
  console.log(`run4`);
  const a: any = { val: 5 };
  a.a = a;
  const res = A.parse(a);
  console.log(res);
};

const run5 = async () => {
  console.log(
    await z
      .object({
        asdf: z.promise(z.number()),
      })
      .parse({ asdf: Promise.resolve(12) }),
  );
  // .then(val => {
  //   console.log(`val: ${val}`);
  // })
  // .catch(err => {
  //   console.log(JSON.stringify(err.errors, null, 2));
  // });

  // await z
  //   .union([z.string(), z.number()])
  //   .parseAsync(false)
  //   .catch(err => {
  //     console.log(JSON.stringify(err.errors, null, 2));
  //   });
};

const run6 = () => {
  // const testTuple = z.tuple([
  //   z.string(),
  //   z.object({ name: z.literal('Rudy'), score: z.number() }),
  //   z.array(z.literal('blue')),
  // ]);
  try {
    //   testTuple.parse([
    //     123,
    //     { name: 'Rudy2', score: 125334 },
    //     ['blue', 'red'],
    //   ] as any);
    console.log(z.promise(z.string()).parse(Promise.resolve('asfd')));
  } catch (err) {
    console.log(JSON.stringify(err.errors, null, 2));
  }
};

run1;
run2;
run3;
run4;
run5;
run6();
