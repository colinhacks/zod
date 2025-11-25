// Test: Core + English + 10 additional locales
import * as z from "zod/v4";
import { de, fr, ja, es, ru, zhCN, pt, it, pl, ko } from "zod/v4/locales";

z.config(de());

const schema = z.string().min(5).email();
console.log(schema.parse("test@example.com"));
