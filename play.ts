import en from "@zod/core/locales/en.js";
import { z } from "zod";

z.config(en());

const schema = z.object({
  username: z.string(),
  favoriteNumbers: z.array(z.number()),
});
const result = schema.safeParse({
  username: 1234,
  favoriteNumbers: [1234, "4567"],
});

const tree = z.treeifyError(result.error!);
const pretty = z.prettyError(result.error!);
console.log(pretty);
