import Benchmark from "benchmark";

import { z as zNew } from "../src/index";
import { z as zOld } from "zod";

const DATA = Object.freeze({
  nest: {
    number: "asdf", // Math.random(),
    string: `${Math.random()}`,
    boolean: Math.random() > 0.5,
  },
});

const oldSchema = zOld.object({
  nest: zOld.object({
    string: zOld.string(),
    boolean: zOld.boolean(),
    number: zOld.number(),
  }),
});

const newSchema = zNew.object({
  nest: zNew.object({
    string: zNew.string(),
    boolean: zNew.boolean(),
    number: zNew.number(),
  }),
});

const suite = new Benchmark.Suite("object - comparison");

suite
  .add("newschema", () => {
    newSchema.safeParse(DATA);
  })
  .add("oldschema", () => {
    oldSchema.safeParse(DATA);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${suite.name}: ${e.target}`);
  })
  .run({
    minSamples: 200,
  });
