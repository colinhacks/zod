import * as z from "zod/v4-mini"

z.config(z.locales.en());

z.string().parse(12);
