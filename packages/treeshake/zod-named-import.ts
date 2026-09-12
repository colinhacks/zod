import { z } from "zod";

const schema = z.object({ title: z.string().min(5) });
console.log(schema.safeParse({ title: "hi" }).error?.issues[0].message);
