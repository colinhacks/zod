import * as z from "zod-core";

z;

// z.omit;
// const schema = z.object({
//   name: z.string([z.refine(async (ctx) => ctx.length)]),
// });

// const DATA = "asdf";
// console.log(JSON.stringify(z.safeParse(schema, DATA), null, 2));
// console.log(JSON.stringify(z.safeParseB(schema, DATA), null, 2));
// console.log(JSON.stringify(z.safeParseC(schema, DATA), null, 2));

// z.string({
//   checks: [z.refine(async (ctx) => ctx.length)],
// });

// z.object({name:z.string(), {

// }})
