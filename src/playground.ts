import * as z from '.';

const run = async () => {
  const result = await z
    .object({ name: z.string() })
    .catchall(z.number())
    .spa({ name: 'Foo', validExtraKey: 61 });
  console.log(result);
};

run();
