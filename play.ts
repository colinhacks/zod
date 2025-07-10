import { z } from "zod";

const Parent = z.object({ key1: z.object({ key2: z.string() }) });

console.log(Parent._zod.def.shape.key1._zod.run);
// => [Function (anonymous)]

console.log(z.parse(Parent._zod.def.shape.key1, { key2: "asdf" }));
