import discriminatedUnionBenchmarks from "./discriminatedUnion.ts";
import objectBenchmarks from "./object.ts";
import primitiveBenchmarks from "./primitives.ts";
import realworld from "./realworld.ts";
import stringBenchmarks from "./string.ts";
import unionBenchmarks from "./union.ts";

for (const suite of [
  ...realworld.suites,
  ...primitiveBenchmarks.suites,
  ...stringBenchmarks.suites,
  ...objectBenchmarks.suites,
  ...unionBenchmarks.suites,
  ...discriminatedUnionBenchmarks.suites,
]) {
  suite.run();
}
