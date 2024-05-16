import { makeSchema, metabench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.number());
const DATA = Math.random();
const bench = metabench("z.number().parse");

bench.add("zod3", () => zod3.parse(DATA));
bench.add("zod4", () => zod4.parse(DATA));

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
