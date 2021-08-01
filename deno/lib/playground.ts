import { z } from "./index.ts";

const run = async () => {
  z;

  z.string().parse(1234);
};
run();

export {};
