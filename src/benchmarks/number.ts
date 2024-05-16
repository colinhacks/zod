import { Bench } from "tinybench";
import { makeSchema, runBench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.number());
const DATA = Math.random();
const bench = new Bench();

bench.add("zod3", () => zod3.parse(DATA));
bench.add("zod4", () => zod4.parse(DATA));

export default async function run() {
  await runBench("z.number().parse", bench);
}

if (require.main === module) {
  run();
}
