import * as z from '.';
const asyncNumberToString = z.transformer(z.number(), z.string(), async n =>
  String(n),
);
const run = async () => {
  console.log(
    z
      .object({
        id: asyncNumberToString,
      })
      .parse({ id: 5 }),
  );
};

run();
