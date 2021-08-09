import Benchmark from "benchmark";

import { z } from "../index";

const doubleSuite = new Benchmark.Suite("z.union: double");
const manySuite = new Benchmark.Suite("z.union: many");

const aSchema = z.object({
  type: z.literal("a"),
  a: z.string(),
});
const objA = {
  type: "a",
  a: "a string",
};

const bSchema = z.object({
  type: z.literal("b"),
  b: z.number(),
});
const objB = {
  type: "b",
  b: 42,
};

const cSchema = z.object({
  type: z.literal("c"),
  c: z.object({
    string: z.string(),
    number: z.number(),
    bool: z.boolean(),
  }),
});
const objC = {
  type: "c",
  c: {
    string: "a string",
    number: 42,
    bool: false,
  },
};

const dSchema = z.object({
  type: z.literal("d"),
  d: z.boolean(),
});

const double = z.union([aSchema, bSchema]);
const many = z.union([aSchema, bSchema, cSchema, dSchema]);

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

export default {
  suites: [doubleSuite, manySuite],
};
