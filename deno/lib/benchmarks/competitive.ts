import Benchmark from "benchmark";
import mz from "myzod";

import { z } from "../index.ts";

const shortSuite = new Benchmark.Suite("competitive");

const MPeople = mz.array(
  mz.object({
    type: mz.literal("person"),
    hair: mz.enum(["blue", "brown"]),
    active: mz.boolean(),
    name: mz.string(),
    age: mz.number(),
    hobbies: mz.array(mz.string()),
    address: mz.object({
      street: mz.string(),
      zip: mz.string(),
      country: mz.string(),
    }),
  })
);

const People = z.array(
  z.object({
    type: z.literal("person"),
    hair: z.enum(["blue", "brown"]),
    active: z.boolean(),
    name: z.string(),
    age: z.number(),
    hobbies: z.array(z.string()),
    address: z.object({
      street: z.string(),
      zip: z.string(),
      country: z.string(),
    }),
  })
);

let i = 0;

function num() {
  return ++i;
}

function str() {
  return (++i % 100).toString(16);
}

function array<T>(fn: () => T): T[] {
  return Array.from({ length: ++i % 10 }, () => fn());
}

const people = Array.from({ length: 100 }, () => {
  return {
    type: "person",
    hair: i % 2 ? "blue" : "brown",
    active: !!(i % 2),
    name: str(),
    age: num(),
    hobbies: array(str),
    address: {
      street: str(),
      zip: str(),
      country: str(),
    },
  };
});

const zString = z.string();
const mzString = mz.string();
const zEnum = z.enum(["blue", "brown"]);
const mzEnum = mz.enum(["blue", "brown"]);

shortSuite

  .add("zod: string", () => {
    zString.parse("foo");
  })
  .add("mz: string", () => {
    mzString.parse("foo");
  })
  .add("zod: enum", () => {
    zEnum.parse("blue");
  })
  .add("mz: enum", () => {
    mzEnum.parse("blue");
  })
  .add("zod", () => {
    People.parse(people);
  })
  .add("myzod", () => {
    MPeople.parse(people);
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(shortSuite as any).name}: ${e.target}`);
  });

export default {
  suites: [shortSuite],
};

shortSuite.run();
