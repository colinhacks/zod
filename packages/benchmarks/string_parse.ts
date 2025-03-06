import * as zNew from "@zod/core";
import * as zOld from "zod";
import { randomString } from "./benchUtil.js";
import { benchWithData } from "./metabench.js";

class Schema {
  parse(input: unknown, ctx?: unknown) {
    if (typeof input === "string") return input;
    throw new Error("Invalid input");
  }
}

const zOldSchema = zOld.string();
const zNewSchema1 = zNew.string();
const zNewSchema2 = zNew.string();
zNewSchema2._parse = zNewSchema2._parse.bind(zNewSchema2);
zNewSchema2._typeCheck = zNewSchema2._typeCheck.bind(zNewSchema2);
const zNewSchema3 = zNew.string();
zNewSchema3._typeCheck = zNewSchema3._typeCheck.bind(zNewSchema2);
zNewSchema3._parse = zNewSchema3._typeCheck;
const baselineSchema = new Schema();

const bench = benchWithData({
  name: "string parse",
  data() {
    return randomString(15);
  },
  batch: 1000,
  benchmarks: {
    // baseline(d) {
    //   return baselineSchema.parse(d);
    // },
    zod3(d) {
      return zOldSchema.parse(d);
    },
    // zod4_1a(d) {
    //   return zNewSchema1.parse(d);
    // },
    // zod4_1b(d) {
    //   return zNewSchema1._parse(d);
    // },
    // zod4_1c(d) {
    //   return zNewSchema1._typeCheck(d);
    // },
    // zod4_2a(d) {
    //   return zNewSchema2.parse(d);
    // },
    // zod4_2b(d) {
    //   return zNewSchema2._parse(d);
    // },
    // zod4_2c(d) {
    //   return zNewSchema2._typeCheck(d);
    // },
    zod4(d) {
      return zNewSchema3.parse(d);
    },
    // zod4_3b(d) {
    //   return zNewSchema3._parse(d);
    // },
    // zod4_3c(d) {
    //   return zNewSchema3._typeCheck(d);
    // },
  },
});

await bench.run();
