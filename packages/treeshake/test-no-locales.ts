// Test: Default import only (core + English auto-configured)
import * as z from "zod/v4";

const schema = z.string().min(5).email();
console.log(schema.parse("test@example.com"));
