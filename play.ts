import { z } from "zod/v4-mini";

const args = ["asdf"] as const;

z.enum(args);
