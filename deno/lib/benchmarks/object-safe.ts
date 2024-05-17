import { metabench } from "./metabench.ts";
import { DATA, zod3, zod4 } from "./object.js";

const bench = metabench("small: z.object().safeParse", {
  zod3() {
    for (const _ of DATA) zod3.safeParse(_);
  },
  zod4() {
    for (const _ of DATA) zod4.safeParse(_);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
