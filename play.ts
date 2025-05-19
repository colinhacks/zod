import * as z from "zod/v4";

console.dir(z.url().safeParse("https://https://example.com"), { depth: null });
