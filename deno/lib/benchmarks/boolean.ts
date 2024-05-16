import { makeSchema, metabench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.boolean());
const DATA = Math.random() > 0.5;

const bench = metabench("z.boolean().parse", {
  zod3() {
    zod3.parse(DATA);
  },
  zod4() {
    zod4.parse(DATA);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
