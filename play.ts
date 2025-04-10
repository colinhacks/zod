// import * as z from "zod";

import * as z from "@zod/mini";

z.array(z.number()).check(
  z.minLength(5),
  z.maxLength(10),
  z.refine((arr) => arr.includes(5))
);
// import * as z from "zod";

// z.array(z.number())
//   .min(5)
//   .max(10)
//   .refine((arr) => arr.includes(5));

z.core.locales.en();
