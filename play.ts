import { z } from "zod/v4";

z;

console.dir(z.toJSONSchema(z.string().meta({ id: "asdf" })), { depth: null });
