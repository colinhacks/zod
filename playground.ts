import { z } from "./src";

console.log(z.coerce.string().safeParse(null));
