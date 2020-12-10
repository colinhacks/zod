import { crazySchema } from "../crazySchema";
import * as z from "../index";

test("parse", () => {
  crazySchema.parse({
    tuple: ["asdf", 1234, true, null, undefined, "1234"],
    merged: { k1: "asdf", k2: 12 },
    union: ["asdf", 12, "asdf", 12, "asdf", 12],
    array: [12, 15, 16],
    // sumTransformer: [12, 15, 16],
    sumMinLength: [12, 15, 16, 98, 24, 63],
    intersection: {},
    enum: "one",
    nonstrict: { points: 1234 },
    numProm: Promise.resolve(12),
    lenfun: (x: string) => x.length,
  });

  // expect(typeof value.sumTransformer).toEqual("number");
});

test("to JSON", () => {
  crazySchema.toJSON();
});

const stringSchema = z.string();

test("type guard", () => {
  if (stringSchema.check("adsf" as any)) {
  }
});

test("type guard fail", () => {
  if (crazySchema.check("asdf" as any)) {
  }
});

test("type guard (is)", () => {
  if (stringSchema.is("asdf" as any)) {
  }
});

test("type guard failure (is)", () => {
  if (crazySchema.is("asdf" as any)) {
  }
});

test("ZodCodeGenerator", () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
});
