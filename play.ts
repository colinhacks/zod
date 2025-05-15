import { z } from "zod/v4";

z;

console.log(z.toJSONSchema(z.never()));
