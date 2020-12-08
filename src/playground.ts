import * as z from '.';

// let e = new Error('x');
// const asdf = z.object({ message: z.string() }).parse(e);
// console.log(asdf);

// const SNamedEntity = z.object({
//   id: z.string(),
//   set: z.string().optional(),
//   unset: z.string().optional(),
// });
// console.log(
//   SNamedEntity.parse({
//     id: 'asdf',
//     set: undefined,
//   }),
// );

const run = async () => {
  // const s1 = z.union([z.string(), z.undefined()]);
  // const goodData = undefined;
  // // const badData = null;

  // const goodResult = await s1.safeParseAsync(goodData);
  // console.log(goodResult);
  //   const badResult = await s1.safeParseAsync(badData);
  //   console.log(badResult);

  const checker = z
    .function(z.tuple([z.string()]), z.boolean())
    .implement(arg => {
      return arg.length as any;
    });
  checker(12 as any);
};

run();
