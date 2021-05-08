import Benchmark from "benchmark";

import { z } from "../index";

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

suite
  .add("empty string", () => {
    z.string().parse(empty);
  })
  .add("short string", () => {
    z.string().parse(short);
  })
  .add("long string", () => {
    z.string().parse(long);
  })
  .add("manual parser: long", () => {
    manual(long);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(String(e.target));
  })
  .run({ async: true });
