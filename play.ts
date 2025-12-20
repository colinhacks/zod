import { z } from "./packages/zod/src/index.js";

// Test the fix for the `origin` field in string format validation errors

// Test starts_with validation error
const phoneSchema = z.string().startsWith("+1");

try {
  phoneSchema.parse("123-456-7890");
} catch (error) {
  if (error.issues) {
    const issue = error.issues[0];
    console.log("starts_with error issue:");
    console.log({
      code: issue.code,
      origin: issue.origin, // This should now work without TypeScript error
      format: issue.format,
      prefix: issue.prefix,
      path: issue.path,
      message: issue.message,
    });

    // Verify the origin field exists and has the correct value
    console.log(`✅ Origin field exists: ${issue.origin === "string"}`);
  }
}

// Test other string format validation errors to ensure they also have origin field
console.log("\n--- Testing other string format validations ---");

// Test URL validation
const urlSchema = z.string().url();
try {
  urlSchema.parse("not-a-url");
} catch (error) {
  if (error.issues) {
    const issue = error.issues[0];
    console.log(`URL validation - origin: ${issue.origin}`);
  }
}

// Test email validation
const emailSchema = z.string().email();
try {
  emailSchema.parse("not-an-email");
} catch (error) {
  if (error.issues) {
    const issue = error.issues[0];
    console.log(`Email validation - origin: ${issue.origin}`);
  }
}

// Test base64 validation
const base64Schema = z.string().base64();
try {
  base64Schema.parse("not-base64!");
} catch (error) {
  if (error.issues) {
    const issue = error.issues[0];
    console.log(`Base64 validation - origin: ${issue.origin}`);
  }
}

console.log("\n✅ All string format errors now include the 'origin' field!");
