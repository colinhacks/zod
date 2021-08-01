import { z } from "./index.ts";

const run = async () => {
  z;

  const schema = z.object({
    people: z.string().array().min(2),
  });

  const result = schema.safeParse({
    people: [1234],
  });

  console.log(result);
};
run();

export {};
