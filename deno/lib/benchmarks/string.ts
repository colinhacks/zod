import Benchmark from "benchmark";

import { z } from "../index.ts";

const suite = new Benchmark.Suite("z.string");

const empty = "";
const short = "short";
const long = "long".repeat(256);
const manual = (str: unknown) => {
  if (typeof str !== "string") {
    throw new Error("Not a string");
  }

  return str;
};
const stringSchema = z.string();

suite
  .add("empty string", () => {
    stringSchema.parse(empty);
  })
  .add("short string", () => {
    stringSchema.parse(short);
  })
  .add("long string", () => {
    stringSchema.parse(long);
  })
  .add("invalid: null", () => {
    try {
      stringSchema.parse(null);
    } catch (err) {}
  })
  .add("manual parser: long", () => {
    manual(long);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(String(e.target));
  })
  .run({ async: true });
