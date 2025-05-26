import * as z from "zod/v3";

console.log({
  href: new URL(import.meta.url).href,
  hostname: new URL(import.meta.url).hostname,
  pathname: new URL(import.meta.url).pathname,
});

// z.
// z.string.url({ hostname: /.*/ }).parse(import.meta.url);

// const a = z.url({
//   protocol: /^https?$/,
// });
const a = z.string().url();

a.parse("https://example.com");
a.parse("http://example.com");
a.parse("htt://example.com");
a.parse("c:");
a.parse("mailto:noreply@zod.dev"); // ❌

// const a = z.url();

// a.parse("https://example.com"); // ✅
// a.parse("http://localhost"); // ✅
// a.parse("mailto:noreply@zod.dev"); // ❌
// a.parse("sup"); // ❌
/^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
