import * as z from "zod-core";

z;

const schema = z.string();

const DATA = "asdf";
console.log(JSON.stringify(z.safeParse(schema, DATA), null, 2));
console.log(JSON.stringify(z.safeParseB(schema, DATA), null, 2));
console.log(JSON.stringify(z.safeParseC(schema, DATA), null, 2));
