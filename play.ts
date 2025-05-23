import * as z from "zod/v4-mini";

z.string().register(z.globalRegistry, {
  examples: ["example"], // Type 'string' is not assignable to type 'unique symbol'.
});
