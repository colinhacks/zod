import objectBenchmarks from "./object";
import stringBenchmarks from "./string";
import unionBenchmarks from "./union";

for (const suite of [
  ...stringBenchmarks.suites,
  ...objectBenchmarks.suites,
  ...unionBenchmarks.suites,
]) {
  suite.run();
}
