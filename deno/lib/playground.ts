import * as z from "./index.ts";

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
  const numToString = z.transformer(z.number()).transform(async (n) => {
    const res = String(n);
    return res;
  });

  console.log(typeof (await numToString.parseAsync(1234)));
  const obj = z.object({
    id: numToString,
  });
  const data = await obj.parseAsync({ id: 5 });
  console.log(data);
};
run();
