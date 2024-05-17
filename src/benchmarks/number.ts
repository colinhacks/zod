import { makeData, makeSchema } from "./benchUtil.js";
import { metabench } from "./metabench";

const { zod3, zod4 } = makeSchema((z) => z.number());

const DATA = makeData(10000, () => Math.random());
const bench = metabench("z.number().parse", {
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

if (require.main === module) {
  run();
}
