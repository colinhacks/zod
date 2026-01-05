import * as z from "./packages/zod/src/v4/index.js";

z;

const schema = z.object({ name: z.string() }).and(z.looseRecord(z.string().regex(/_phone$/), z.e164()));

type _schema = z.infer<typeof schema>;
// { name: string } & Record<string, string> & Record<string, number>

z.e164();
