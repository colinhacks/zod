import { z } from "zod/v4";

const schema = z.file();
console.log(schema);
console.log(schema.safeParse("").error);
