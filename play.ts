import * as z from "zod";

// console.log(z.int().min(0).parse(234));

console.log(z.number().safe().parse(123.0));
