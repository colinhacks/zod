import { z } from ".";

const run = async () => {
  z.string().array().nonempty().max(2);
  console.log(z.array(z.string()).nonempty().safeParse([]));
  // const asdf = z.array(z.string()).nonempty().parse([])
};

run();

export {};
