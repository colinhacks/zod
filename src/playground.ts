import { z } from ".";

const run = async () => {
  const schema = z.string().email();
  const result = schema.safeParse("asdfsdf");
  console.log(result);
  if (!result.success) {
    console.log(result.error.format());
  }
};

run();

export {};
