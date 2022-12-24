import { z } from "./src";

z.object({ name: z.string() }).pick({
  name: true,
});
