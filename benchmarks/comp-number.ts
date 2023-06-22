import Benchmark from "benchmark";

import { z as zNew } from "../src/index";
import { z as zOld } from "../node_modules/zod";

const DATA = Math.random();

const oldSchema = zOld.number();
const newSchema = zNew.number();

const suite = new Benchmark.Suite("number perf");
suite
  .add("oldschema", () => {
    oldSchema.parse(DATA);
  })
  .add("newschema", () => {
    newSchema.parse(DATA);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${suite.name}: ${e.target}`);
  })
  .run();
