import { Bench } from "tinybench";
import { makeSchema, runBench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => "this is a test");
let d = "this is a test";

const bench = new Bench({
  time: 1000,
});

bench.add("zod3", () => {
  for (const _ of DATA) zod3.parse(d);
});
bench.add("zod4", () => {
  for (const _ of DATA) zod4.parse(d);
});

export default async function run() {
  await runBench("z.string().parse", bench);
}

if (require.main === module) {
  run();
}
