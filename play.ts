import * as z from "zod/v4";

// import { z } from "zod/v4";

const result = z
  .object({
    email: z.email().endsWith("@example.com", "CUSTOM"),
  })
  .safeParse({
    email: "test@github.com",
  });

console.log(JSON.stringify(result.error!.issues, null, 2));
