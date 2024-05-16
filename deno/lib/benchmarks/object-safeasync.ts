import { metabench } from "./benchUtil.js";
import { DATA, zod3, zod4 } from "./object.js";

const bench = metabench("small: z.object().safeParseAsync", {
  zod3() {
    zod3.safeParseAsync(DATA);
  },
  zod4() {
    zod4.safeParseAsync(DATA);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
