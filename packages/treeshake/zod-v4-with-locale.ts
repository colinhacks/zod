// Test that other locales work when explicitly imported
import * as z from "zod/v4";
import { de } from "zod/v4/locales";

// Switch from English (default) to German
z.config(de());

const schema = z.string().min(5);
console.log(schema.parse("hi")); // Should show German error message

// This bundles core + English + German (~28KB)
// NOT all 47 locales (~220KB)
// Only the locales you import are bundled
