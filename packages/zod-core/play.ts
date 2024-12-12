import * as z from "zod-core";

z;

const a = z.envbool();

console.log(JSON.stringify(z.safeParse(a, "true"), null, 2));
