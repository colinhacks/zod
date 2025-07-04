import { z } from "zod/v4";

z;
const A = z.partialRecord(z.string(), z.string());
type A = z.infer<typeof A>;
