// Test: Core + English + 3 additional locales
import * as z from "zod/v4";
import { de, fr, ja } from "zod/v4/locales";

// Can switch between locales
z.config(de());

const schema = z.string().min(5).email();
console.log(schema.parse("test@example.com"));
