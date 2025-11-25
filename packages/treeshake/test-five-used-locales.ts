// Test: Core + English + 5 additional locales that are ACTUALLY USED
import * as z from "zod/v4";
import { de, fr, ja, es, it } from "zod/v4/locales";

// Store all locale functions so bundler can't strip them
const locales = [de, fr, ja, es, it];

// Use a random locale to prevent dead code elimination
const randomLocale = locales[Math.floor(Math.random() * locales.length)];
z.config(randomLocale());

const schema = z.string().min(5).email();
console.log(schema.parse("test@example.com"));

// Export locales to ensure they're kept in bundle
export { locales };
