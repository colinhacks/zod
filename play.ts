import * as z from "zod";

z;
const blobSchema = z.string().check(z.property("length", z.number().min(10)));

blobSchema.parse("hello there!"); // ✅
blobSchema.parse("hello."); // ❌
