import { z } from "./index.ts";

Error.stackTraceLimit = 100;
const run = async () => {
  z;

  const myFunc = z
    .function()
    .args(
      z.object({
        nested: z.object({ qwer: z.string() }),
      })
    )
    .returns(z.boolean())
    .implement((arg) => arg.nested.qwer.length > 10);
  myFunc({ nested: { qwer: 1234 as any } });
};
run();

export {};
