import * as z from "zod/v4"; // 👈

z.object({ name: z.string() })
  .refine((val) => val.name.startsWith("a"))
  .parse({ name: "Anselm" });
