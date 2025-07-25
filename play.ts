import * as z from "zod";

// Base schema with broader enum
const baseSchema = z.object({
  gender: z.enum(["Rüde", "Hündin", "männlich", "weiblich"]).nullable(),
  // ... other fields
});
// Trying to create a more specific schema with narrower enum
const dogSchema = z.object({
  gender: z.enum(["Rüde", "Hündin"]).nullable(),
  // ... other fields
});
// Generic interface that should accept both schemas
interface MyInterface<T extends typeof baseSchema> {
  schema: T;
  // ... other properties
}
// This fails with type error even though dogSchema's enum is a subset of baseSchema's enum
const implementation: MyInterface<typeof dogSchema> = {
  schema: dogSchema,
};
