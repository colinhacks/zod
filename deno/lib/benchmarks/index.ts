import objectBenchmarks from "./object.ts";
import stringBenchmarks from "./string.ts";

for (const suite of [...stringBenchmarks.suites, ...objectBenchmarks.suites]) {
  suite.run();
}
