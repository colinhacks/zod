import * as z from "zod";

z;

console.log(z.int().min(0).parse(234));
