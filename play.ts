import { z } from "zod/v4";

const schema = z.union([z.literal("a"), z.literal("b"), z.literal("c")]);

console.log(schema._zod.values);
