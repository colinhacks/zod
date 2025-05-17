import { z } from "zod/v4";

z;

const schemas = [z.number().int(), z.int(), z.int().positive(), z.int().nonnegative(), z.int().gt(0), z.int().gte(0)];

const a = z.int();
console.dir(z.toJSONSchema(a), { depth: null });
const b = z.int().positive();
console.dir(b._zod.bag, { depth: null });
console.dir(z.toJSONSchema(b), { depth: null });
