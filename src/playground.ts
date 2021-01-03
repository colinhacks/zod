import * as z from ".";
import { ZodIssueCode } from ".";

// const asyncNumberToString = z
//   .transformer(z.number())
//   .transform(async (n) => String(n));
// console.log(
//   z
//     .object({
//       id: asyncNumberToString,
//     })
//     .parse({ id: 5 })
// );

const run = async () => {
  const schema = z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .refinement(
      ({ start, end }) => start <= end,
      (arg) => ({
        code: ZodIssueCode.custom,
        path: ["end"],
        message: `End must be greater than ${arg.start}`,
      }) // It won't work :(
    );

  console.log(
    schema.parse({
      start: 5,
      end: 3,
    })
  );
};
run();
