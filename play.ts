import { z } from "zod/v4";

z.pipe(z.coerce.number(), z.coerce.number());
