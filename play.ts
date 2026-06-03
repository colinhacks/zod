import * as z from "zod";

// number format narrowing
function describeNumberFormat(schema: z.ZodInt | z.ZodFloat32 | z.ZodFloat64 | z.ZodInt32 | z.ZodUInt32) {
  const fmt = schema._zod.def.format;
  if (fmt === "safeint") return "safeint";
  if (fmt === "float32") return "float32";
  if (fmt === "float64") return "float64";
  if (fmt === "int32") return "int32";
  if (fmt === "uint32") return "uint32";
}

console.log(describeNumberFormat(z.int())); // safeint
console.log(describeNumberFormat(z.float32())); // float32
console.log(describeNumberFormat(z.float64())); // float64
console.log(describeNumberFormat(z.int32())); // int32
console.log(describeNumberFormat(z.uint32())); // uint32

// bigint format narrowing
function describeBigIntFormat(schema: z.ZodBigIntFormat<"int64"> | z.ZodBigIntFormat<"uint64">) {
  const fmt = schema._zod.def.format;
  if (fmt === "int64") return "int64";
  if (fmt === "uint64") return "uint64";
}

console.log(describeBigIntFormat(z.int64())); // int64
console.log(describeBigIntFormat(z.uint64())); // uint64
