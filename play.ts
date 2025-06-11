import { z } from "zod/v4";

const A = z.string().describe("name");
const B = A.superRefine((val, ctx) => {
  ctx.addIssue({
    message: `Invalid ${A.description}`,
  });
});

// B.parse("test"); // Should pass

console.log(navigator, { depth: null });
