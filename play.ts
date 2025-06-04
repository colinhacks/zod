import { z } from "zod/v4";

const A = z.object({
  get x() {
    return A;
  },
});

const StrictA = A.strict();
