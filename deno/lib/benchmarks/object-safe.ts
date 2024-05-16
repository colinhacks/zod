import { metabench } from "./benchUtil.js";
import { DATA, zod3, zod4 } from "./object.js";

const bench = metabench("small: z.object().safeParse", {
  zod3() {
    zod3.safeParse(DATA);
  },
  zod4() {
    zod4.safeParse(DATA);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
