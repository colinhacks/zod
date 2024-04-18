import Benchmark from "benchmark";

import datetimeBenchmarks from "./datetime";
import discriminatedUnionBenchmarks from "./discriminatedUnion";
import ipv4Benchmarks from "./ipv4";
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
    suites.push(...datetimeBenchmarks.suites);
  }
  if (argv.includes("--datetime")) {
    suites.push(...datetimeBenchmarks.suites);
  }
  if (argv.includes("--ipv4")) {
    suites.push(...ipv4Benchmarks.suites);
  }
}

for (const suite of suites) {
  suite.run({});
}

// exit on Ctrl-C
process.on("SIGINT", function () {
  console.log("Exiting...");
  process.exit();
});
