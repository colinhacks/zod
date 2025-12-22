import * as z from "./packages/zod/src/index.js";

const schema = z.number().lt(100).gt(1);
console.log("Schema bag:", schema._zod.bag);

const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
console.log("JSON Schema:", JSON.stringify(jsonSchema, null, 2));