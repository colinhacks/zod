import * as z from "zod";

const fn = z
  .function({
    input: [z.string()],
    output: z.number(),
  })
  .implementAsync((data: string) => data.length);

console.log(await fn("hello"));
