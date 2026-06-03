import * as z from "zod";

// this function should only work because TypeScript can now tell them apart
function toPostgresType(schema: z.ZodInt | z.ZodFloat32 | z.ZodFloat64 | z.ZodInt32 | z.ZodUInt32) {
  if (schema._zod.def.format === "safeint") return "INTEGER";
  if (schema._zod.def.format === "float32") return "REAL";
  if (schema._zod.def.format === "float64") return "DOUBLE PRECISION";
  if (schema._zod.def.format === "int32")   return "INTEGER";
  if (schema._zod.def.format === "uint32")  return "BIGINT";
}

console.log(toPostgresType(z.int()));     // INTEGER
console.log(toPostgresType(z.float32())); // REAL
console.log(toPostgresType(z.float64())); // DOUBLE PRECISION