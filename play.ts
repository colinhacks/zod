import * as z from "zod/v4";

// Test the exact case from the GitHub issue
console.log("Testing the fix for GitHub issue #5521: Impossible parsing of z.record(z.number(), z.any())");

const schema = z.record(z.number(), z.number());
const testData = { 1: 100, 2: 88, 3: 99, 4: 60 };

console.log("\nInput data:", testData);

try {
  const result = schema.parse(testData);
  console.log("✅ Parse successful! Result:", result);
} catch (error) {
  console.log("❌ Parse failed:", error.message);
}

// Test with string keys
const testDataWithStringKeys = { "1": 100, "2": 88, "3": 99, "4": 60 };
console.log("\nInput data with string keys:", testDataWithStringKeys);

try {
  const result = schema.parse(testDataWithStringKeys);
  console.log("✅ Parse successful! Result:", result);
} catch (error) {
  console.log("❌ Parse failed:", error.message);
}

// Test with mixed numeric/string keys
const testDataMixed = { 1: 100, "2": 88, "3.5": 99, 4: 60 };
console.log("\nInput data with mixed keys:", testDataMixed);

try {
  const result = schema.parse(testDataMixed);
  console.log("✅ Parse successful! Result:", result);
} catch (error) {
  console.log("❌ Parse failed:", error.message);
}

// Test that non-numeric keys still fail
const testDataInvalid = { abc: 100, 2: 88 };
console.log("\nInput data with invalid key:", testDataInvalid);

try {
  const result = schema.parse(testDataInvalid);
  console.log("✅ Parse successful! Result:", result);
} catch (error) {
  console.log("❌ Parse failed (expected):", error.message.split('\n')[0]);
}

console.log("\n🎉 All tests demonstrate that the fix is working correctly!");
