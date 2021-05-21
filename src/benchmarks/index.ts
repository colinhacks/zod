import objectBenchmarks from "./object";
import stringBenchmarks from "./string";

for (const suite of [...stringBenchmarks.suites, ...objectBenchmarks.suites]) {
  suite.run();
}
