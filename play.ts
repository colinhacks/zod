import * as z from "zod";

// const Keys = z.literal(["id", "name", "email"]);
// const schema = z.partialRecord(Keys, z.string());
// type Schema = z.infer<typeof schema>;

// schema.parse({ id: "1" });

// z.tuple([z.string()], z.number()).check(z.minLength(5));

// Demonstrate optStart bug: when all items are optional, findIndex returns -1
// This causes optStart = items.length - (-1) = items.length + 1
// Which incorrectly rejects empty arrays for tuples with all optional items

const allOptionalTuple = z.tuple([z.string().optional(), z.number().optional(), z.boolean().optional()]);

// This should work (all items optional, empty array should be valid)
// But currently fails because optStart = 3 - (-1) = 4, so tooSmall = 0 < 4 - 1 = 0 < 3
console.log("Testing empty array with all optional tuple:");
try {
  const result = allOptionalTuple.parse([]);
  console.log("✅ Success:", result);
} catch (error) {
  console.log("❌ Error:", error);
}

// This should also work (providing only some optional items)
console.log("\nTesting partial array with all optional tuple:");
try {
  const result = allOptionalTuple.parse(["hello"]);
  console.log("✅ Success:", result);
} catch (error) {
  console.log("❌ Error:", error);
}
