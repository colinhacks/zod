import { z } from "@zod/mini";

z.config(z.core.locales.en());

z.string().parse(12);
