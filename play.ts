import { z } from "zod/v4";

const a = z.url({ hostname: /example\.com$/, protocol: /^https:$/ });
a.parse("https://example.com");
