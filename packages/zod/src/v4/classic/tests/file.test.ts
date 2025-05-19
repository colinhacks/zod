import { File as WebFile } from "@web-std/file";

import { afterEach, beforeEach, expect, test } from "vitest";

import * as z from "zod/v4";

const minCheck = z.file().min(5);
const maxCheck = z.file().max(8);
const mimeCheck = z.file().mime(["text/plain", "application/json"]);

const originalFile = global.File;
beforeEach(async () => {
  if (!globalThis.File) globalThis.File = WebFile;
});
afterEach(() => {
  if (globalThis.File !== originalFile) {
    globalThis.File = originalFile;
  }
});

test("passing validations", () => {
  minCheck.parse(new File(["12345"], "test.txt"));
  maxCheck.parse(new File(["12345678"], "test.txt"));
  mimeCheck.parse(new File([""], "test.csv", { type: "text/plain" }));
  expect(() => mimeCheck.parse(new File([""], "test.txt"))).toThrow();
  expect(() => mimeCheck.parse(new File([""], "test.txt", { type: "text/csv" }))).toThrow();
});

test("failing validations", () => {
  expect(() => minCheck.parse(new File(["1234"], "test.txt"))).toThrow();
  expect(() => maxCheck.parse(new File(["123456789"], "test.txt"))).toThrow();
  expect(() => mimeCheck.parse(new File([""], "test.csv"))).toThrow();
  expect(() => mimeCheck.parse(new File([""], "test.csv", { type: "text/csv" }))).toThrow();
});

// test("min max getters", () => {
//   expect(minCheck.minSize).toEqual(5);
//   expect(minCheck.min(10).minSize).toEqual(10);

//   expect(maxCheck.maxSize).toEqual(8);
//   expect(maxCheck.max(6).maxSize).toEqual(6);
// });

// test("accept getter", () => {
//   expect(mimeCheck.acceptedTypes).toEqual(["text/plain", "application/json"]);
//   expect(mimeCheck.type(["text/plain", "application/xml"]).acceptedTypes).toEqual(["text/plain"]);
// });

// test("invalid mime types", () => {
//   expect(() => z.file().type([".txt"])).toThrow();
// });
