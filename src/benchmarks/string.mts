import Benchmark from "benchmark";
import * as mitata from "mitata";

import zOld from "zod";
import zNew from "../../src";

// import z from "..";

const SUITE_NAME = "z.string";
new Benchmark.Suite(SUITE_NAME);

const empty = "";
const short = "short";
const long = "long".repeat(256);

// const baseline = (str: unknown) => {
//   if (typeof str !== "string") {
//     throw new Error("Not a string");
//   }

//   return str;
// };

const olds = {
  string: zOld.string(),
  optional: zOld.string().optional(),
  nullable: zOld.string().nullable(),
};

const news = {
  string: zNew.string(),
  optional: zNew.string().optional(),
  nullable: zNew.string().nullable(),
};

mitata.group("empty string", () => {
  mitata.bench("zod3", () => olds.string.parse(empty));
  mitata.bench("zod4", () => news.string.parse(empty));
  // mitata.bench("baseline", () => baseline(empty));
});
mitata.group("short string", () => {
  mitata.bench("zod3", () => olds.string.parse(short));
  mitata.bench("zod4", () => news.string.parse(short));
  // mitata.bench("baseline", () => baseline(short));
});
mitata.group("long string", () => {
  mitata.bench("zod3", () => olds.string.parse(long));
  mitata.bench("zod4", () => news.string.parse(long));
  // mitata.bench("baseline", () => baseline(long));
});
mitata.group("optional string", () => {
  mitata.bench("zod3", () => olds.optional.parse(long));
  mitata.bench("zod4", () => news.optional.parse(long));
});
mitata.group("nullable string", () => {
  mitata.bench("zod3", () => olds.nullable.parse(long));
  mitata.bench("zod4", () => news.nullable.parse(long));
});
mitata.group("nullable (null) string", () => {
  mitata.bench("zod3", () => olds.nullable.parse(null));
  mitata.bench("zod4", () => news.nullable.parse(null));
});

export default function run() {
  mitata.run();
}
// await mitata.run();
// export default {
//   suites: [suite],
// };

// await suite.run();
