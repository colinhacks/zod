import { z } from "./index";

const run = async () => {
  z;
  const stringWithDefault = z
    .string()

    .default("default")
    .default("default2");
  console.log(stringWithDefault.parse(undefined));
};

run();

export {};
