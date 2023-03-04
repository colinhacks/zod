import { z } from "./src";

const a = z.object({ a: z.string() }).passthrough();
type a = z.infer<typeof a>;
