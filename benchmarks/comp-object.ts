import Benchmark from "benchmark";

import { z as zNew } from "../src/index";
import { z as zOld } from "zod";

const DATA = Object.freeze({
  number: Math.random(),
  string: `${Math.random()}`,
  boolean: Math.random() > 0.5,
});

const oldSchema = zOld.object({
  string: zOld.string(),
  boolean: zOld.boolean(),
  number: zOld.number(),
});

const newSchema = zNew.object({
  string: zNew.string(),
  boolean: zNew.boolean(),
  number: zNew.number(),
});

const suite = new Benchmark.Suite("object - comparison");

suite
  .add("newschema", () => {
    newSchema.parse(DATA);
  })
  .add("oldschema", () => {
    oldSchema.parse(DATA);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${suite.name}: ${e.target}`);
  })
  .run({
    minSamples: 200,
  });
