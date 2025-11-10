import * as z from "zod";

// Test the circular reference issue with z.lazy()
const schema = z.lazy(() => z.tuple([schema]));

console.log("Testing circular lazy schema creation:");
try {
  // Try to access properties that depend on innerType during construction
  // This should trigger the error if the bug exists
  const _pattern = schema._zod.pattern;
  const _optin = schema._zod.optin;
  console.log("✅ Schema created successfully");
  console.log("Pattern:", _pattern);
  console.log("Optin:", _optin);
} catch (error) {
  console.log("❌ Error during schema creation:", error);
  if (error instanceof Error) {
    console.log("Message:", error.message);
    console.log("Stack:", error.stack);
  }
}

console.log("\nTesting circular lazy schema parsing:");
try {
  const result = schema.parse([[]]);
  console.log("✅ Parse Success:", result);
} catch (error) {
  console.log("❌ Parse Error:", error);
}
