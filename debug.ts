#!/usr/bin/env tsx
import { z } from "./packages/zod/src/index.js";

console.log("=== Number schema test ===");
const numberSchema = z.number().lt(100).gt(1);
console.log("Schema:", JSON.stringify(numberSchema, null, 2));
const jsonSchema = z.toJSONSchema(numberSchema, { target: "openapi-3.0" });
console.log("JSON Schema:", JSON.stringify(jsonSchema, null, 2));

console.log("\n=== File schema test ===");
const fileSchema = z.file().mime("image/png").min(1000).max(10000);
console.log("Schema:", JSON.stringify(fileSchema, null, 2));
const fileJsonSchema = z.toJSONSchema(fileSchema);
console.log("File JSON Schema:", JSON.stringify(fileJsonSchema, null, 2));