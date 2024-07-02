import { metabench } from "./metabench";
import { DATA, zod3, zod4 } from "./object-old";

const bench = metabench("small: z.object().safeParseAsync", {
  zod3() {
    for (const _ of DATA) zod3.parse(_);
  },
  zod4() {
    for (const _ of DATA) zod4.parse(_);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
