import * as z from "zod/v4";

z;

console.dir(z.ZodError.name, { depth: null });
console.dir(z.ZodRealError.name, { depth: null });
console.dir(z.core.$ZodError.name, { depth: null });
console.dir(z.core.$ZodRealError.name, { depth: null });

z.string().parse(1234);
