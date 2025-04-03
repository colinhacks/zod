import * as z from "@zod/mini";

z.string().check(
  z.minLength(5),
  z.maxLength(64),
  z.refine((val) => val.includes("@")),
  z.trim()
);

z.string();

const t: z.core.$ZodString;

t._zod;
