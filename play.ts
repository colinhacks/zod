import { z } from "zod/v3";

console.dir(z, { depth: null });
const schema = z.string();
console.dir(schema.parse("Hello, Zod!"), { depth: null });
