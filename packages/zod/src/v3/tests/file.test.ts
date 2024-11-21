// @ts-ignore TS6133
import { expect, test } from "vitest";

import * as z from "zod/v3";

class MockFile {
  static create(size?: number, name?: string, mimeType?: string) {
    name = name || "mock.txt";
    size = size || 1024;
    mimeType = mimeType || "plain/txt";

    function range(count: number) {
      let output = "";
      for (let i = 0; i < count; i++) {
        output += "a";
      }
      return output;
    }

    return new File([range(size)], name, { type: mimeType });
  }
}

const basicSchema = z.file().size({ max: 50000, min: 1024 });
const imageSchema = z
  .file()
  .size({ min: 20000 })
  .mimeType("image/*,image/jpeg,image/png", "Invalide mime type");

test("passing validations", () => {
  expect(basicSchema.parse(MockFile.create(1024))).toBeInstanceOf(File);
  expect(basicSchema.parse(MockFile.create(50000))).toBeInstanceOf(File);
  expect(basicSchema.parse(MockFile.create(2014))).toBeInstanceOf(File);
  expect(
    imageSchema.parse(MockFile.create(20000, "mock.jpeg", "image/jpeg")),
  ).toBeInstanceOf(File);
});

test("failing validations", () => {
  expect(() => basicSchema.parse(MockFile.create(1023))).toThrow();
  expect(() => basicSchema.parse(MockFile.create(50001))).toThrow();
  expect(() =>
    imageSchema.parse(MockFile.create(20000, "mock.jpeg", "video/mp4")),
  ).toThrow();
  expect(() => basicSchema.parse(undefined)).toThrow();
  expect(() => basicSchema.parse({})).toThrow();
  expect(() => basicSchema.parse([])).toThrow();
});
