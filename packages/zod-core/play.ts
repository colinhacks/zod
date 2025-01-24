import * as z from "zod-core";

z;

const schema = z.interface({
  a: z.string(),
  b: z.string(),
  c: z.string(),
  // c: z.number(),
});

const data = {
  a: "asdf",
  b: "asdf",
  c: "asdf",
};
const a = await z.parse(schema, data);
console.log(a);

const b = await z.parseB(schema, data);
console.log(b);
