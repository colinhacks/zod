import Benchmark from "benchmark";

import { z } from "../index";

const emptySuite = new Benchmark.Suite("z.object: empty");
const shortSuite = new Benchmark.Suite("z.object: short");
const longSuite = new Benchmark.Suite("z.object: long");
const partialSuite = new Benchmark.Suite("z.object: partial");
const requiredSuite = new Benchmark.Suite("z.object: required");

const empty = z.object({});
const short = z.object({
  string: z.string(),
});
const long = z.object({
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
});
const partial = long.partial({
  string: true,
  boolean: true,
});
const required = partial.required();

emptySuite
  .add("valid", () => {
    empty.parse({});
  })
  .add("valid: extra keys", () => {
    empty.parse({ string: "string" });
  })
  .add("invalid: null", () => {
    try {
      empty.parse(null);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(emptySuite as any).name}: ${e.target}`);
  });

shortSuite
  .add("valid", () => {
    short.parse({ string: "string" });
  })
  .add("valid: extra keys", () => {
    short.parse({ string: "string", number: 42 });
  })
  .add("invalid: null", () => {
    try {
      short.parse(null);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(shortSuite as any).name}: ${e.target}`);
  });

longSuite
  .add("valid", () => {
    long.parse({ string: "string", number: 42, boolean: true });
  })
  .add("valid: extra keys", () => {
    long.parse({ string: "string", number: 42, boolean: true, list: [] });
  })
  .add("invalid: null", () => {
    try {
      long.parse(null);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(longSuite as any).name}: ${e.target}`);
  });

partialSuite
  .add("valid: all defined", () => {
    partial.parse({ string: "string", number: 42, boolean: true });
  })
  .add("valid: optionals undefined", () => {
    partial.parse({ number: 42 });
  })
  .add("valid: extra keys", () => {
    partial.parse({ string: "string", number: 42, boolean: true, list: [] });
  })
  .add("invalid: null", () => {
    try {
      partial.parse(null);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(partialSuite as any).name}: ${e.target}`);
  });

requiredSuite
  .add("valid", () => {
    required.parse({ string: "string", number: 42, boolean: true });
  })
  .add("valid: extra keys", () => {
    partial.parse({ string: "string", number: 42, boolean: true, list: [] });
  })
  .add("invalid: null", () => {
    try {
      required.parse(null);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(requiredSuite as any).name}: ${e.target}`);
  });

export default {
  suites: [emptySuite, shortSuite, longSuite, partialSuite, requiredSuite],
};
