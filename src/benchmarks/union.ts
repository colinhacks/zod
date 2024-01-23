import Benchmark from "benchmark";

import { z } from "../index";

function getlargeNestedSchema(type: string, numKeys: number) {
  const shape: z.ZodObject<any>["shape"] = {};
  const nestedShape: z.ZodObject<any>["shape"] = {};
  for (let i = 0; i < numKeys; i++) {
    shape[`key${i}`] = z.literal(i);
  }
  for (let i = 0; i < numKeys; i++) {
    nestedShape[`key${i}`] = z.literal(i);
  }
  shape.nested = z.object(nestedShape);
  shape.type = z.literal(type);
  return z.object(shape);
}

function getlargeNestedObj(type: string, schema: z.ZodObject<any>) {
  const obj: { [k: string]: any } = {};
  Object.keys(schema.shape).forEach((key, i) => {
    if (key !== "nested" && key !== "type") {
      obj[key] = i;
    }
  });
  obj.nested = {...obj}
  obj.type = type;
  return obj;
}

const doubleSuite = new Benchmark.Suite("z.union: double");
const manySuite = new Benchmark.Suite("z.union: many");
const doubleLargeNestedSuite = new Benchmark.Suite("z.union: double large nested");
const manyLargeNestedSuite = new Benchmark.Suite("z.union: many large nested");

const aSchema = z.object({
  type: z.literal("a"),
});
const objA = {
  type: "a",
};
const aLargeNestedSchema = getlargeNestedSchema("a", 20);
const largeNestedObjA = getlargeNestedObj("a", aLargeNestedSchema);

const bSchema = z.object({
  type: z.literal("b"),
});
const objB = {
  type: "b",
};
const bLargeNestedSchema = getlargeNestedSchema("b", 20);
const largeNestedObjB = getlargeNestedObj("b", bLargeNestedSchema);

const cSchema = z.object({
  type: z.literal("c"),
});
const objC = {
  type: "c",
};
const cLargeNestedSchema = getlargeNestedSchema("c", 20);
const largeNestedObjC = getlargeNestedObj("c", cLargeNestedSchema);

const dSchema = z.object({
  type: z.literal("d"),
});
const dLargeNestedSchema = getlargeNestedSchema("d", 20);

const double = z.union([aSchema, bSchema]);
const doubleLargeNested = z.union([aLargeNestedSchema, bLargeNestedSchema]);
const many = z.union([aSchema, bSchema, cSchema, dSchema]);
const manyLargeNested = z.union([aLargeNestedSchema, bLargeNestedSchema, cLargeNestedSchema, dLargeNestedSchema]);

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

doubleLargeNestedSuite
  .add("valid: a", () => {
    doubleLargeNested.parse(largeNestedObjA);
  })
  .add("valid: b", () => {
    doubleLargeNested.parse(largeNestedObjB);
  })
  .add("invalid: null", () => {
    try {
      doubleLargeNested.parse(null);
    } catch (err) {}
  })
  .add("invalid: wrong shape", () => {
    try {
      doubleLargeNested.parse(largeNestedObjC);
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(doubleLargeNestedSuite as any).name}: ${e.target}`);
  });

manyLargeNestedSuite
  .add("valid: a", () => {
    manyLargeNested.parse(largeNestedObjA);
  })
  .add("valid: c", () => {
    manyLargeNested.parse(largeNestedObjC);
  })
  .add("invalid: null", () => {
    try {
      manyLargeNested.parse(null);
    } catch (err) {}
  })
  .add("invalid: wrong shape", () => {
    try {
      manyLargeNested.parse({ type: "unknown" });
    } catch (err) {}
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${(manyLargeNestedSuite as any).name}: ${e.target}`);
  });

export default {
  suites: [doubleSuite, doubleLargeNestedSuite, manySuite, manyLargeNestedSuite],
};
