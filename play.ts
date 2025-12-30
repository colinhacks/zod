import * as z from "./packages/zod/src/index.js";

// Test: metadata order matters?

// Case 1: .meta() before .min() - reported as losing metadata
const schema1 = z.object({
  name: z.string().meta({ description: "first name" }).min(1),
});

// Case 2: .meta() after .min() - reported as working
const schema2 = z.object({
  name: z.string().min(1).meta({ description: "A user name" }),
});

console.log("Case 1 - .meta() before .min():");
console.log(JSON.stringify(z.toJSONSchema(schema1), null, 2));

console.log("\nCase 2 - .meta() after .min():");
console.log(JSON.stringify(z.toJSONSchema(schema2), null, 2));
