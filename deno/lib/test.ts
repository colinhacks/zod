import { z } from "./index.js";

//const user = z.string();
const enumSchema = z.enum(["a", "b", "c"]);
/*const longEnumSchema = z.enum([
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
]);
const undefinedSchema = z.undefined();
const literalSchema = z.literal("short");*/

for (let i = 0; i < 10; i++) {
  //user.safeParse(111);
  //enumSchema.parse("a");
  enumSchema.safeParse("x");
  //longEnumSchema.parse("five");
  //longEnumSchema.safeParse("invalid");
  //undefinedSchema.parse(undefined);
  //undefinedSchema.safeParse(1);
  //literalSchema.parse("short");
  //literalSchema.safeParse("bad");
}

/*
const numberSuite = new benchmark_1.default.Suite("z.number");
const numberSchema = index_1.z.number().int();
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
  .on("cycle", (e) => {
    console.log(`z.number: ${e.target}`);
  });
const dateSuite = new benchmark_1.default.Suite("z.date");
const plainDate = index_1.z.date();
const minMaxDate = index_1.z
  .date()
  .min(new Date("2021-01-01"))
  .max(new Date("2030-01-01"));
dateSuite
  .add("valid", () => {
    plainDate.parse(new Date());
  })
  .add("invalid", () => {
    try {
      plainDate.parse(1);
    } catch (e) {}
  })
  .add("valid min and max", () => {
    minMaxDate.parse(new Date("2023-01-01"));
  })
  .add("invalid min", () => {
    try {
      minMaxDate.parse(new Date("2019-01-01"));
    } catch (e) {}
  })
  .add("invalid max", () => {
    try {
      minMaxDate.parse(new Date("2031-01-01"));
    } catch (e) {}
  })
  .on("cycle", (e) => {
    console.log(`z.date: ${e.target}`);
  });
const symbolSuite = new benchmark_1.default.Suite("z.symbol");
const symbolSchema = index_1.z.symbol();
symbolSuite
  .add("valid", () => {
    symbolSchema.parse(val.symbol);
  })
  .add("invalid", () => {
    try {
      symbolSchema.parse(1);
    } catch (e) {}
  })
  .on("cycle", (e) => {
    console.log(`z.symbol: ${e.target}`);
  });
exports.default = {
  suites: [
    enumSuite,
    longEnumSuite,
        undefinedSuite,
        literalSuite,
        numberSuite,
        dateSuite,
        symbolSuite,
  ],
};*/
