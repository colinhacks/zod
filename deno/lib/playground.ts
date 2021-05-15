import { z } from "./index.ts";

const run = async () => {
  z;

  // const schema = z.string().refine((val) => val.length === 5);
  // const result = schema.safeParse(undefined);
  // console.log(result);
};

run();

export {};
