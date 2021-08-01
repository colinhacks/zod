import { z } from "./index.ts";

const run = async () => {
  z;

  const arr = z.string().array().nonempty("CANT BE EMPTY");
  arr.parse([]);
};
run();

export {};
