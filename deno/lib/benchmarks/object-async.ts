import { metabench } from "./benchUtil.js";
import { DATA, zod3, zod4 } from "./object.js";

const bench = metabench("small: z.object().parseAsync", {
  zod3() {
    zod3.parseAsync(DATA);
  },
  zod4() {
    zod4.parseAsync(DATA);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
