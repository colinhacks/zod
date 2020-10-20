import * as z from '.';

const run = async () => {
  const data = z
    .string()
    .default(schema => `${schema._def.t}`)
    .parse(undefined); // => "string"
  console.log(data);
};

run();
