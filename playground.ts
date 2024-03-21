import { z, ZodNativeEnum } from "./src";

z;

const A = z.object({}).catchall(z.string());
type A = z.infer<typeof A>;
