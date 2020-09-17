// import * as z from '.';

// const run = async () => {
//   z.object({
//     columns: z.record(z.string()),
//     primaryKey: z.array(apiString({}).nonempty()).nonempty(),
//   })._refinement(
//     data => {
//       for (const pkItem of data.primaryKey) {
//         if (!(pkItem in data.columns)) {
//           // We'd like to include pkItem in the error message
//           return false;
//         }
//       }
//       return true;
//     },
//     {
//       message: `the primaryKey array must only contain keys from the columns record`,
//       path: ['primaryKey'],
//     },
//   );
// };

// run();
