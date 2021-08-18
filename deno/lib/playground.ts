import { z } from "./index.ts";

const run = async () => {
  z;

  const myFunc = z
    .function()
    .args(z.string())
    .returns(z.boolean())
    .implement((arg: string) => arg.length > 10);
  myFunc(1234 as any);
};
run();

export {};
