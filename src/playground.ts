// import * as z from './index';

// const run = () => {
//   const base = z.object({
//     id: z.string(),
//   });

//   const type1 = base.merge(
//     z.object({
//       type: z.literal('type1'),
//     }),
//   );

//   const type2 = base.merge(
//     z.object({
//       type: z.literal('type2'),
//     }),
//   );

//   const union1 = z.union([type1, type2]);
//   const union2 = z.union([type2, type1]);

//   const value1 = {
//     type: 'type1',
//   };

//   const value2 = {
//     type: 'type2',
//   };

//   type1.parse(value1);
//   console.log(type1.check(value1));
//   console.log(union1.check(value1));
//   console.log(union2.check(value1));
//   console.log(type2.check(value2));
//   console.log(union1.check(value2));
//   console.log(union2.check(value2));
// };

// run();
