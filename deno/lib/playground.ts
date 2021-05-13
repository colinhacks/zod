import { z } from "./index.ts";

const run = async () => {
  z;

  console.log(
    z
      .object({
        one: z.string().default("1"),
        two: z.string().default("2"),
      })
      .optional()
      .parse(undefined)
  );
};

run();

export {};
