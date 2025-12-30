import * as z from "zod/v4";

z;
z.unknown()
  .refine((val) => typeof val === "number")
  .parse(1);
