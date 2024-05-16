import Benchmark, { Event } from "benchmark";
import { makeSchema } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => "this is a test");

const suite = new Benchmark.Suite();

suite
  .add("zod3", () => {
    for (const d of DATA) zod3.parse(d);
  })
  .add("zod4", () => {
    for (const d of DATA) zod4.parse(d);
  })
  .on("cycle", (event: Event) => {
    const target = event.target;
    console.log(target.name, target.hz, target.stats!.mean);
    // console.log(String(event.target));
  });

export default function run() {
  suite.run();
}

if (require.main === module) {
  run();
}
