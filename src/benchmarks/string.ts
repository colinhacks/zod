import { makeSchema, randomString } from "./benchUtil.js";
import { metabench } from "./metabench";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => randomString(10));

const bench = metabench("z.string().parse", {
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
