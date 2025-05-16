import { z } from "zod/v4";

z.pipe(z.string(), z.coerce.number());
