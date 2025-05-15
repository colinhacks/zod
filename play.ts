import { z } from "zod/v4";

// const schema = z.url();

// schema.parse("https://example.com"); // ✅
// schema.parse("http://localhost"); // ✅
// schema.parse("sup");

// const schema = z.url({ hostname: /^example.com$/ });
// schema.parse("https://example.com"); // ✅
// schema.parse("https://zombo.com"); // ❌

// const schema = z.url({ protocol: /^https$/ });
// schema.parse("https://example.com"); // ✅
// schema.parse("httpss://example.com"); // ❌
