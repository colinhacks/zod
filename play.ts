import * as z from "zod";

z.any()
  .refine((v) => typeof v === "string", { abort: true })
  .transform((v) => v.split(""))
  .parse(100);
