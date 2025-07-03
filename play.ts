import { z } from "zod/v4";

console.dir(z.object({ a: z.never() }).parse({}), { depth: null });
