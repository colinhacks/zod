import * as z from '.';

const run = async () => {
  const numToString = z.transformer(z.number(), z.string(), async n =>
    String(n),
  );
  const data = await z
    .object({
      id: numToString,
    })
    .parseAsync({ id: 5 });

  console.log(data);
};

run();
