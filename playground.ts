import { z } from "./src";

z;

function dataObj<T extends z.ZodTypeAny>(schema: T) {
  return z.object({ data: schema as T }).transform((a: T['_output']) => a.data);
}

const arg= dataObj(z.string()).parse({ data: "asdf" });
