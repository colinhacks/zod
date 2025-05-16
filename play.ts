import { z } from "zod/v4";

const err = new z.ZodError([]);

console.dir(err instanceof z.ZodRealError, { depth: null });
