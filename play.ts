import { z } from "zod/v4";

const enumSchema = z.enum(["a", "b", "c"]);
const nativeEnumSchema = z.nativeEnum(enumSchema.enum);

console.dir(nativeEnumSchema.safeParse("a"), { depth: null }); // Valid
console.dir(nativeEnumSchema.safeParse("d"), { depth: null }); // Throws ZodError

z.file().mime([""]);
