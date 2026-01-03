import { type } from "arktype";

// Schema WITHOUT morph
const noMorph = type({
  name: "string",
  age: "number",
});

// Schema WITH morph (trim the string)
const withMorph = type({
  name: "string.trim",
  age: "number",
});

// Schema with pipe morph
const withPipeMorph = type({
  name: type("string").pipe((s) => s.toUpperCase()),
  age: "number",
});

const testData = { name: "  Alice  ", age: 30 };
const cleanData = { name: "Alice", age: 30 };

console.log("=== Arktype Morph Object Identity Test ===\n");

// Test without morph
const noMorphResult = noMorph(cleanData);
console.log("Without morph:");
console.log("  Result:", noMorphResult);
console.log("  Same object?", noMorphResult === cleanData);
console.log("");

// Test with built-in morph (trim)
const withMorphResult = withMorph(testData);
console.log("With string.trim morph:");
console.log("  Input:", testData);
console.log("  Result:", withMorphResult);
console.log("  Same object?", withMorphResult === testData);
if (typeof withMorphResult === "object" && withMorphResult !== null && "name" in withMorphResult) {
  console.log("  Result name:", JSON.stringify((withMorphResult as any).name));
}
console.log("");

// Test with pipe morph
const pipeMorphResult = withPipeMorph(testData);
console.log("With pipe morph (toUpperCase):");
console.log("  Input:", testData);
console.log("  Result:", pipeMorphResult);
console.log("  Same object?", pipeMorphResult === testData);
if (typeof pipeMorphResult === "object" && pipeMorphResult !== null && "name" in pipeMorphResult) {
  console.log("  Result name:", JSON.stringify((pipeMorphResult as any).name));
}
console.log("");

// Test nested object with morph
const nestedWithMorph = type({
  user: {
    name: "string.trim",
    email: "string.lower",
  },
});

const nestedData = { user: { name: "  Bob  ", email: "BOB@EXAMPLE.COM" } };
const nestedResult = nestedWithMorph(nestedData);
console.log("Nested object with morphs:");
console.log("  Input:", nestedData);
console.log("  Result:", nestedResult);
console.log("  Same outer object?", nestedResult === nestedData);
if (typeof nestedResult === "object" && nestedResult !== null && "user" in nestedResult) {
  console.log("  Same inner object?", (nestedResult as any).user === nestedData.user);
  console.log("  Result user:", (nestedResult as any).user);
}
