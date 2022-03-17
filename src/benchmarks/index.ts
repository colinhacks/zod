import discriminatedUnionBenchmarks from "./discriminatedUnion";
import objectBenchmarks from "./object";
import realworld from "./realworld";
import stringBenchmarks from "./string";
import unionBenchmarks from "./union";

for (const suite of [
  ...realworld.suites,
  ...stringBenchmarks.suites,
  ...objectBenchmarks.suites,
  ...unionBenchmarks.suites,
  ...discriminatedUnionBenchmarks.suites,
]) {
  suite.run();
}
