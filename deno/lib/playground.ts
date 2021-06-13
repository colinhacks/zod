import { z } from "./index.ts";
const run = async () => {
  z;
  const a = z.string().transform((arg) => arg.toLowerCase());
  const b = a.transform((arg) => arg.length);
  b;
  // const infer = <C extends z.ZodTypeAny>(arg: C) => {
  //   return arg.transform((val) => ({ val }));
  // };
};

run();

export {};
