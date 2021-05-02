import { z } from "./index.ts";

const run = async () => {
  z;

  const schema = z.string().refine((val: string) => val.length > 5);

  schema.parse("abc", {
    errorMap: () => ({ message: "custom error message" }),
  });
};

run();

export {};
