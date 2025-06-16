import { z } from "zod/v4";

z;

console.dir(z.literal(Number.POSITIVE_INFINITY).parse(Number.POSITIVE_INFINITY), { depth: null });
