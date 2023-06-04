import Benchmark from "benchmark";

import discriminatedUnionBenchmarks from "./discriminatedUnion";
import objectBenchmarks from "./object";
import primitiveBenchmarks from "./primitives";
import realworld from "./realworld";
import stringBenchmarks from "./string";
import unionBenchmarks from "./union";

const argv = process.argv.slice(2);
let suites: Benchmark.Suite[] = [];

if (!argv.length) {
  suites = [
    ...realworld.suites,
    ...primitiveBenchmarks.suites,
    ...stringBenchmarks.suites,
    ...objectBenchmarks.suites,
    ...unionBenchmarks.suites,
    ...discriminatedUnionBenchmarks.suites,
  ];
} else {
  if (argv.includes("--realworld")) {
    suites.push(...realworld.suites);
  }
  if (argv.includes("--primitives")) {
    suites.push(...primitiveBenchmarks.suites);
  }
  if (argv.includes("--string")) {
    suites.push(...stringBenchmarks.suites);
  }
  if (argv.includes("--object")) {
    suites.push(...objectBenchmarks.suites);
  }
  if (argv.includes("--union")) {
    suites.push(...unionBenchmarks.suites);
  }
  if (argv.includes("--discriminatedUnion")) {
    suites.push(...discriminatedUnionBenchmarks.suites);
  }
}

for (const suite of suites) {
  suite.run();
}
