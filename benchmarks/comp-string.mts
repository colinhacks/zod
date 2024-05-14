// import Benchmark from "benchmark";

import * as mitata from "mitata";
import { z as zOld } from "zod";

import zNew from "../src";

const DATA = `${Math.random()}`;

const oldSchema = zOld.string();
const newSchema = zNew.string();

// const suite = new Benchmark.Suite("z.string()");
// suite
//   .add("zod3", () => {
//     oldSchema.parse(DATA);
//   })
//   .add("zod4", () => {
//     newSchema.parse(DATA);
//   })
//   .on("cycle", (e: Benchmark.Event) => {
//     console.log(`${suite.name}: ${e.target}`);
//   })
//   .on("complete", function () {
//     console.log("Fastest is " + this.filter("fastest").map("name"));
//   })
//   .run();

// import { Bench } from "tinybench";

// const bench = new Bench({ time: 1000 });

// bench
//   .add("zod3", () => {
//     oldSchema.parse(DATA);
//   })
//   .add("zod4", () => {
//     newSchema.parse(DATA);
//   });

// await bench.run();

// console.table(bench.table());

// deno
// import { ... } from 'https://esm.sh/mitata';

// d8/jsc
// import { ... } from '<path to mitata>/src/cli.mjs';

mitata.group("z.string()", () => {
  mitata.bench("zod3", () => {
    oldSchema.parse(DATA);
  });
  mitata.bench("zod4", () => {
    newSchema.parse(DATA);
  });
});

await mitata.run({
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  collect: true, // enable/disable collecting returned values into an array during the benchmark (default: false)
  percentiles: true, // enable/disable percentiles column (default: true)
});
