import * as z from "zod/v4";

console.log("=== Zod .change() method demo ===");

// Create a base schema
const userSchema = z.object({
  email: z.string(),
  age: z.number(),
  name: z.string(),
});

console.log("\n1. Original schema:");
console.log("userSchema.parse({email: 'test@example.com', age: 25, name: 'John'})");
try {
  const result = userSchema.parse({
    email: "test@example.com",
    age: 25,
    name: "John",
  });
  console.log("✓ Success:", result);
} catch (e) {
  console.log("✗ Error:", (e as Error).message);
}

// Use .change() to modify existing properties only
const strictUserSchema = userSchema.change({
  email: z.string().email(), // Add email validation
  age: z.number().min(18), // Add minimum age requirement
  // name is left unchanged
});

console.log("\n2. Using .change() to add validation to existing properties:");
console.log("strictUserSchema.parse({email: 'test@example.com', age: 25, name: 'John'})");
try {
  const result = strictUserSchema.parse({
    email: "test@example.com",
    age: 25,
    name: "John",
  });
  console.log("✓ Success:", result);
} catch (e) {
  console.log("✗ Error:", (e as Error).message);
}

console.log("\nstrictUserSchema.parse({email: 'invalid-email', age: 25, name: 'John'})");
try {
  const result = strictUserSchema.parse({
    email: "invalid-email",
    age: 25,
    name: "John",
  });
  console.log("✓ Success:", result);
} catch (e) {
  console.log("✗ Error:", (e as Error).message);
}

console.log("\nstrictUserSchema.parse({email: 'test@example.com', age: 16, name: 'John'})");
try {
  const result = strictUserSchema.parse({
    email: "test@example.com",
    age: 16,
    name: "John",
  });
  console.log("✓ Success:", result);
} catch (e) {
  console.log("✗ Error:", (e as Error).message);
}

// Try to add a non-existing property (this should fail at compile time AND runtime)
console.log("\n3. TypeScript prevents adding non-existing properties at compile time:");
console.log("// This would cause a TypeScript error:");
console.log("// userSchema.change({ newProperty: z.string() })");
console.log('// Error: \'newProperty\' does not exist in type \'Partial<Record<"email" | "age" | "name", SomeType>>\'');

console.log("\n4. Runtime check also prevents it (bypassing TypeScript):");
console.log("(userSchema as any).change({newProperty: z.string()})");
try {
  (userSchema as any).change({ newProperty: z.string() });
  console.log("✓ Success: This shouldn't happen!");
} catch (e) {
  console.log("✗ Error (expected):", (e as Error).message);
}

// Compare with .extend() which allows new properties
console.log("\n5. For comparison, .extend() allows new properties:");
console.log("userSchema.extend({newProperty: z.string()})");
try {
  const extendedSchema = userSchema.extend({ newProperty: z.string() });
  const result = extendedSchema.parse({
    email: "test@example.com",
    age: 25,
    name: "John",
    newProperty: "new value",
  });
  console.log("✓ Success:", result);
} catch (e) {
  console.log("✗ Error:", (e as Error).message);
}
