import { metabench } from "./metabench";
import { DATA, zod3, zod4 } from "./object-old.js";

const bench = metabench("small: z.object().safeParseAsync", {
  async zod3() {
    for (const _ of DATA) await zod3.spa(_);
  },
  async zod4() {
    for (const _ of DATA) await zod4.spa(_);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
