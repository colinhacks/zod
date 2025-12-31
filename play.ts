import * as z from "./packages/zod/src/v4/index.js";

// Without passthrough
const withoutPassthrough = z.object({ name: z.string() }).and(z.looseRecord(z.string().regex(/^S_/), z.string()));

// With passthrough
const withPassthrough = z
  .object({ name: z.string() })
  .passthrough()
  .and(z.looseRecord(z.string().regex(/^S_/), z.string()));

const testData = { name: "John", S_foo: "bar", other: "value" };

console.log("=== Without passthrough ===");
try {
  const result = withoutPassthrough.parse(testData);
  console.log("Success:", result);
} catch (e: any) {
  console.log("Error:", e.message);
}

console.log("\n=== With passthrough ===");
try {
  const result = withPassthrough.parse(testData);
  console.log("Success:", result);
} catch (e: any) {
  console.log("Error:", e.message);
}

const schema = z
  .object({ name: z.string() })
  .and(z.looseRecord(z.string().regex(/^S_/), z.string()))
  .and(z.looseRecord(z.string().regex(/^N_/), z.number()));

type schema = z.infer<typeof schema>;
// { name: string } & Record<string, string> & Record<string, number>
