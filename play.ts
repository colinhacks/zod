// import * as z from "zod";

import * as z from "@zod/mini";

z.object({
  a: z.string(),
  b: z.string(),
}).def.shape;
