import { z } from "zod";

z.string();

console.dir(z, { depth: null });

const schema = z.string();
console.dir(schema.parse("Hello, Zod!"), { depth: null });
