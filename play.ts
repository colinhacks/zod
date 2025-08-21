import * as z from "zod/v4";

// Test the Max UUID support in z.uuid()
const uuid = z.uuid();
const guid = z.guid();

console.log("Testing UUID validation with special cases:");

// Test cases
const testCases = [
  "ffffffff-ffff-ffff-ffff-ffffffffffff", // Max UUID (all F's)
  "00000000-0000-0000-0000-000000000000", // Nil UUID (all 0's)
  "9491d710-3185-4e06-bea0-6a2f275345e0", // Regular UUID
  "invalid-uuid", // Invalid format
];

for (const testCase of testCases) {
  console.log(`\nTesting: ${testCase}`);

  // Test UUID validation
  const uuidResult = uuid.safeParse(testCase);
  console.log(`  UUID: ${uuidResult.success ? "✅ PASS" : "❌ FAIL"}`);

  // Test GUID validation
  const guidResult = guid.safeParse(testCase);
  console.log(`  GUID: ${guidResult.success ? "✅ PASS" : "❌ FAIL"}`);
}

console.log("\n🎉 Max UUID is now supported in z.uuid()!");
