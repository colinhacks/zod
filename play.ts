import { fromJSONSchema } from "./packages/zod/src/v4/classic/from-json-schema.ts";
const json = { type: "object", propertyNames: { enum: ["a", "b"] }, additionalProperties: { type: "string" } };
const from = fromJSONSchema(json as any);
const r = from.safeParse({ a: "x" });
console.log("success:", r.success);
if (!r.success) console.log(JSON.stringify(r.error.issues));
