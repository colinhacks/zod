import * as z from "zod/v4";

console.log("=== Testing Boolean Coercion Fix ===\n");

const schema = z.coerce.boolean();

console.log("Updated behavior with enhanced boolean coercion:");
console.log(`z.coerce.boolean().parse("true"):     ${schema.parse("true")}`);
console.log(`z.coerce.boolean().parse("false"):    ${schema.parse("false")}`);  // Should now be false!
console.log(`z.coerce.boolean().parse(""):         ${schema.parse("")}`);
console.log(`z.coerce.boolean().parse("0"):        ${schema.parse("0")}`);
console.log(`z.coerce.boolean().parse("1"):        ${schema.parse("1")}`);
console.log(`z.coerce.boolean().parse(0):          ${schema.parse(0)}`);
console.log(`z.coerce.boolean().parse(1):          ${schema.parse(1)}`);

console.log("\nTesting more string representations:");
console.log(`z.coerce.boolean().parse("TRUE"):     ${schema.parse("TRUE")}`);
console.log(`z.coerce.boolean().parse("FALSE"):    ${schema.parse("FALSE")}`);
console.log(`z.coerce.boolean().parse("Yes"):      ${schema.parse("Yes")}`);
console.log(`z.coerce.boolean().parse("No"):       ${schema.parse("No")}`);
console.log(`z.coerce.boolean().parse("on"):       ${schema.parse("on")}`);
console.log(`z.coerce.boolean().parse("off"):      ${schema.parse("off")}`);
console.log(`z.coerce.boolean().parse("enabled"):  ${schema.parse("enabled")}`);
console.log(`z.coerce.boolean().parse("disabled"): ${schema.parse("disabled")}`);

console.log("\nTesting edge cases:");
console.log(`z.coerce.boolean().parse("hello"):    ${schema.parse("hello")}`);    // Should use Boolean()
console.log(`z.coerce.boolean().parse("  false  "): ${schema.parse("  false  ")}`); // Should use Boolean() since spaces
console.log(`z.coerce.boolean().parse(null):       ${schema.parse(null)}`);       // Should be false
console.log(`z.coerce.boolean().parse(undefined):  ${schema.parse(undefined)}`);  // Should be false