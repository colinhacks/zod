import { z } from "zod/v4";

const feature = z.object({
  title: z.string(),
  get features() {
    return z.array(feature).optional();
  },
});

const output = z.object({
  id: z.int().nonnegative(),
  name: z.string(),
  features: feature.array(), // <—
});

type Output = z.output<typeof output>;
