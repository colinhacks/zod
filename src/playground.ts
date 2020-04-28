import * as z from '.';

// const CellResults = z.object({
//   kind: z.literal('results'),
//   results: z
//     .array(
//       z.union([
//         z.object({
//           kind: z.literal('data'),
//           data: z.tuple([z.string(), z.string(), z.string()]),
//         }),
//         z.object({
//           kind: z.literal('error'),
//           error: z.tuple([z.string(), z.string(), z.object({})]),
//         }),
//         z.object({
//           kind: z.literal('skipped'),
//         }),
//       ]),
//     )
//     .nonempty(),
// });

// export const CellResultsAPIValidator = z.union([
//   z.object({
//     kind: z.literal('error'),
//     error: z.object({
//       message: z.string(),
//       type: z.string(),
//     }),
//   }),
//   CellResults,
// ]);

// CellResults.parse({
//   kind: 'results',
//   results: [
//     {
//       kind: 'error',
//       error: [
//         'InvalidReferenceError',
//         "object type or alias 'User' does not exist",
//         {
//           '65521': '7',
//           '65522': '11',
//           '65523': '1',
//           '65524': '8',
//         },
//       ],
//     },
//   ],
// });

const obj = z
  .object({
    asdf: z.string(),
  })
  .refine({ check: val => val.asdf.includes('hello') });

console.log(obj.parse({ asdf: 'hello there' }));
console.log(obj.parse({ asdf: 'bye bye' }));
