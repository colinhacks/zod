import { z } from "./index.ts";

const run = async () => {
  z;
  z.instanceof(File);
  const schema = z
    .string()
    .nullable()
    .default("null")
    .transform((val) => val ?? undefined);

  const value = schema.parse(null);
  console.log(value);
};

run();

export {};
