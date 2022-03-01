import discriminatedUnionBenchmarks from "./discriminatedUnion.ts";
import objectBenchmarks from "./object.ts";
import stringBenchmarks from "./string.ts";
import unionBenchmarks from "./union.ts";

for (const suite of [
  ...stringBenchmarks.suites,
  ...objectBenchmarks.suites,
  ...unionBenchmarks.suites,
  ...discriminatedUnionBenchmarks.suites,
]) {
  suite.run();
}
