import * as z from "@zod/mini";

// console.log(z.int().min(0).parse(234));

console.log(z.number().safe().parse(123.0));

z.number().safe();

z.core.$ZodCustom;

z._default;
