// Test: Core + English + 1 additional locale (German)
import * as z from "zod/v4";
import { de } from "zod/v4/locales";

z.config(de());

const schema = z.string().min(5).email();
console.log(schema.parse("test@example.com"));
