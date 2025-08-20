import * as z from "zod/v4";
import * as zMini from "zod/v4/mini";

// Test z.hex() implementation in both versions
const hexSchema = z.hex();
const hexSchemaMini = zMini.hex();

console.log("Testing z.hex() in Classic:");
console.log("Valid hex '123abc':", hexSchema.safeParse("123abc"));
console.log("Valid hex 'DEADBEEF':", hexSchema.safeParse("DEADBEEF"));
console.log("Invalid hex 'xyz':", hexSchema.safeParse("xyz"));

console.log("\nTesting z.hex() in Mini:");
console.log("Valid hex '123abc':", hexSchemaMini.safeParse("123abc"));
console.log("Valid hex 'DEADBEEF':", hexSchemaMini.safeParse("DEADBEEF"));
console.log("Invalid hex 'xyz':", hexSchemaMini.safeParse("xyz"));
