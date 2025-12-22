import * as z from "zod/v4";

// Helper to compare JSON Schema outputs
function testRoundTrip(name: string, schema: z.ZodType) {
  try {
    const jsonSchema1 = z.toJSONSchema(schema);
    const reconstructed = z.fromJSONSchema(jsonSchema1);
    const jsonSchema2 = z.toJSONSchema(reconstructed);

    const str1 = JSON.stringify(jsonSchema1, null, 2);
    const str2 = JSON.stringify(jsonSchema2, null, 2);

    if (str1 === str2) {
      console.log(`✅ ${name}: SOUND`);
    } else {
      console.log(`❌ ${name}: UNSOUND`);
      console.log("  Original JSON Schema:");
      console.log("  " + str1.split("\n").join("\n  "));
      console.log("  After round-trip:");
      console.log("  " + str2.split("\n").join("\n  "));
    }
  } catch (error: any) {
    console.log(`⚠️  ${name}: ERROR - ${error.message}`);
  }
}

const x: `${bigint}` = "123n";

console.log("=== Primitive Types ===\n");

testRoundTrip("z.string()", z.string());
testRoundTrip("z.number()", z.number());
testRoundTrip("z.boolean()", z.boolean());
testRoundTrip("z.null()", z.null());
testRoundTrip("z.any()", z.any());
testRoundTrip("z.unknown()", z.unknown());

console.log("\n=== String Constraints ===\n");

testRoundTrip("z.string().min(5)", z.string().min(5));
testRoundTrip("z.string().max(10)", z.string().max(10));
testRoundTrip("z.string().min(5).max(10)", z.string().min(5).max(10));
testRoundTrip("z.string().regex(/^[a-z]+$/)", z.string().regex(/^[a-z]+$/));
testRoundTrip("z.string().email()", z.string().email());
testRoundTrip("z.string().url()", z.string().url());
testRoundTrip("z.string().uuid()", z.string().uuid());
testRoundTrip("z.string().datetime()", z.string().datetime());

console.log("\n=== Number Constraints ===\n");

testRoundTrip("z.number().int()", z.number().int());
testRoundTrip("z.number().min(0)", z.number().min(0));
testRoundTrip("z.number().max(100)", z.number().max(100));
testRoundTrip("z.number().gt(0)", z.number().gt(0));
testRoundTrip("z.number().lt(100)", z.number().lt(100));
testRoundTrip("z.number().multipleOf(5)", z.number().multipleOf(5));
testRoundTrip("z.int()", z.int());

console.log("\n=== Literals and Enums ===\n");

testRoundTrip("z.literal('hello')", z.literal("hello"));
testRoundTrip("z.literal(42)", z.literal(42));
testRoundTrip("z.literal(true)", z.literal(true));
testRoundTrip("z.literal(null)", z.literal(null));
testRoundTrip("z.enum(['a', 'b', 'c'])", z.enum(["a", "b", "c"]));

console.log("\n=== Arrays ===\n");

testRoundTrip("z.array(z.string())", z.array(z.string()));
testRoundTrip("z.array(z.number()).min(1)", z.array(z.number()).min(1));
testRoundTrip("z.array(z.number()).max(10)", z.array(z.number()).max(10));
testRoundTrip("z.array(z.string()).min(1).max(5)", z.array(z.string()).min(1).max(5));

console.log("\n=== Tuples ===\n");

testRoundTrip("z.tuple([z.string(), z.number()])", z.tuple([z.string(), z.number()]));
testRoundTrip("z.tuple([z.string()]).rest(z.number())", z.tuple([z.string()]).rest(z.number()));

console.log("\n=== Objects ===\n");

testRoundTrip("z.object({ a: z.string() })", z.object({ a: z.string() }));
testRoundTrip("z.object({ a: z.string(), b: z.number() })", z.object({ a: z.string(), b: z.number() }));
testRoundTrip("z.object({ a: z.string().optional() })", z.object({ a: z.string().optional() }));
testRoundTrip("z.object({ a: z.string() }).strict()", z.object({ a: z.string() }).strict());
testRoundTrip("z.object({ a: z.string() }).passthrough()", z.object({ a: z.string() }).passthrough());
testRoundTrip("z.object({ a: z.string() }).catchall(z.number())", z.object({ a: z.string() }).catchall(z.number()));

console.log("\n=== Records ===\n");

testRoundTrip("z.record(z.string())", z.record(z.string()));
testRoundTrip("z.record(z.string(), z.number())", z.record(z.string(), z.number()));

console.log("\n=== Unions ===\n");

testRoundTrip("z.union([z.string(), z.number()])", z.union([z.string(), z.number()]));
testRoundTrip("z.union([z.literal('a'), z.literal('b')])", z.union([z.literal("a"), z.literal("b")]));
testRoundTrip(
  "discriminated union",
  z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), value: z.string() }),
    z.object({ type: z.literal("b"), value: z.number() }),
  ])
);

console.log("\n=== Intersections ===\n");

testRoundTrip(
  "z.intersection(z.object({a: z.string()}), z.object({b: z.number()}))",
  z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() }))
);

console.log("\n=== Optional/Nullable ===\n");

testRoundTrip("z.string().optional()", z.string().optional());
testRoundTrip("z.string().nullable()", z.string().nullable());
testRoundTrip("z.string().nullish()", z.string().nullish());

console.log("\n=== Other Types ===\n");

testRoundTrip("z.never()", z.never());

console.log("\n=== Metadata ===\n");

testRoundTrip("z.string().describe('A string field')", z.string().describe("A string field"));
testRoundTrip("z.string().default('hello')", z.string().default("hello"));

console.log("\n=== Complex Nested ===\n");

testRoundTrip(
  "nested object with array",
  z.object({
    name: z.string(),
    tags: z.array(z.string()),
    meta: z.object({
      created: z.string().datetime(),
      count: z.number().int(),
    }),
  })
);

testRoundTrip("array of unions", z.array(z.union([z.string(), z.number(), z.boolean()])));
