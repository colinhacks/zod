import { z } from "./packages/zod/src/v4/index.js";

const rec = z.record(z.string(), z.string());
const result = rec.safeParse(new Date());
process.stdout.write(`record runtime: success=${result.success}, error=${JSON.stringify(result.error?.issues, null, 2)}\n`);
