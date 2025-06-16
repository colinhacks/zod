import { z } from "zod/v4";

console.dir(z.string().date({ error: "Invalid date string!" }).safeParse("asdf"), { depth: null });
