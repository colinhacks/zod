import { z } from ".";

const run = async () => {
  const schema = z.string().min(5);
  const result = schema.safeParse("adsf");
  console.log(result);
};

run();

export {};
