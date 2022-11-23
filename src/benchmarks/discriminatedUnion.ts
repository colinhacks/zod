import Benchmark from "benchmark";

import { z } from "../index";

const doubleSuite = new Benchmark.Suite("z.discriminatedUnion: double");
const manySuite = new Benchmark.Suite("z.discriminatedUnion: many");
const nestedSuite = new Benchmark.Suite("z.discriminatedUnion: nested");

const aSchema = z.object({
  type: z.literal("a"),
});
const objA = {
  type: "a",
};

const bSchema = z.object({
  type: z.literal("b"),
});
const objB = {
  type: "b",
};

const cSchema = z.object({
  type: z.literal("c"),
});
const objC = {
  type: "c",
};

const dSchema = z.object({
  type: z.literal("d"),
});

const double = z.discriminatedUnion("type", [aSchema, bSchema]);
const many = z.discriminatedUnion("type", [aSchema, bSchema, cSchema, dSchema]);
const nested = z.discriminatedUnion("type", [double, cSchema, dSchema]);

doubleSuite
  .add("valid: a", () => {
    double.parse(objA);
  })
  .add("valid: b", () => {
    double.parse(objB);
  })
  .add("invalid: null", () => {
    try {
      double.parse(null);
    } catch (err) {}
  })
  .add("invalid: wrong shape", () => {
    try {
      double.parse(objC);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(doubleSuite as any).name}: ${e.target}`);
  });

manySuite
  .add("valid: a", () => {
    many.parse(objA);
  })
  .add("valid: c", () => {
    many.parse(objC);
  })
  .add("invalid: null", () => {
    try {
      many.parse(null);
    } catch (err) {}
  })
  .add("invalid: wrong shape", () => {
    try {
      many.parse({ type: "unknown" });
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(manySuite as any).name}: ${e.target}`);
  });

nestedSuite
  .add("valid: a", () => {
    nested.parse(objA);
  })
  .add("valid: b", () => {
    nested.parse(objB);
  })
  .add("valid: c", () => {
    nested.parse(objC);
  })
  .add("invalid: null", () => {
    try {
      nested.parse(null);
    } catch (err) {}
  })
  .add("invalid: wrong shape", () => {
    try {
      nested.parse(objC);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(nestedSuite as any).name}: ${e.target}`);
  });

export default {
  suites: [doubleSuite, manySuite, nestedSuite],
};
