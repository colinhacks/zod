import Benchmark from "benchmark";

import { z } from "../index";

const enumSuite = new Benchmark.Suite("z.enum");
const enumSchema = z.enum(["a", "b", "c"]);

enumSuite
  .add("valid", () => {
    enumSchema.parse("a");
  })
  .add("invalid", () => {
    try {
      enumSchema.parse("x");
    } catch (e) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`z.enum: ${e.target}`);
  });

const undefinedSuite = new Benchmark.Suite("z.undefined");
const undefinedSchema = z.undefined();

undefinedSuite
  .add("valid", () => {
    undefinedSchema.parse(undefined);
  })
  .add("invalid", () => {
    try {
      undefinedSchema.parse(1);
    } catch (e) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`z.undefined: ${e.target}`);
  });

const literalSuite = new Benchmark.Suite("z.literal");
const short = "short";
const bad = "bad";
const literalSchema = z.literal("short");

literalSuite
  .add("valid", () => {
    literalSchema.parse(short);
  })
  .add("invalid", () => {
    try {
      literalSchema.parse(bad);
    } catch (e) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`z.literal: ${e.target}`);
  });

const numberSuite = new Benchmark.Suite("z.number");
const numberSchema = z.number().int();

numberSuite
  .add("valid", () => {
    numberSchema.parse(1);
  })
  .add("invalid type", () => {
    try {
      numberSchema.parse("bad");
    } catch (e) {}
  })
  .add("invalid number", () => {
    try {
      numberSchema.parse(0.5);
    } catch (e) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`z.number: ${e.target}`);
  });

export default {
  suites: [enumSuite, undefinedSuite, literalSuite, numberSuite],
};
