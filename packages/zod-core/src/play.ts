import * as z from "./index.js";

const schema = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

const DATA = {
  a: "a",
  b: "b",
  c: "c",
};

const result = z.safeParse(schema, DATA);

console.log(result);
