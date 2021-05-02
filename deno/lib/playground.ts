import { z } from "./index.ts";

const run = async () => {
  z;
  const stringWithDefault = z
    .string()
    .transform((val) => {
      console.log(`TRANSFORM`);
      console.log(val);
      return val.toUpperCase();
    })
    .default("default");
  console.log(stringWithDefault.parse(undefined));
};

run();

export {};
