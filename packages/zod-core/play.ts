import * as z from "zod-core";

z;

const schema = z.array(z.string());
const data = ["a", "b", "c"];

// console.log(z.parseB(schema, data));
console.log(z.safeParse(schema, data));
// console.log(z.parseAsyncB(schema, data));
// console.log(z.safeParseAsyncB(schema, data));
