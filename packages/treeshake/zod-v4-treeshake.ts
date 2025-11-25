// Test that Zod v4 tree-shakes unused locales
import * as z from "zod/v4";

const schema = z.string().min(5);
console.log(schema.parse("hello"));

// This bundles core + English locale (~24KB)
// NOT all 47 locales (~220KB)
// Savings: ~196KB by tree-shaking 46 unused locales
