// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { crazySchema } from "./crazySchema.ts";
// import * as z from "../index";

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
});
