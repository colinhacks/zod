import * as z from "zod/v4";

const objWithDefaults = z.object({
  a: z.string().default("defaultA"),
  b: z.string().default("defaultB"),
  c: z.string().default("defaultC"),
});

const objPartialWithOneRequired = objWithDefaults.partial(); //.required({ a: true });

const test = objPartialWithOneRequired.parse({});
console.log(test);
