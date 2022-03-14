import { expect, test } from "@jest/globals";

import * as z from "../index";

const file = z.file();
const max = z.file().max(4);
const min = z.file().min(2);
const type = z.file().type("image/png");
const multipleTypes = z.file().type(["image/png", "image/jpeg"]);

test("passing validations", () => {
  file.parse(
    new File([], "file.png", {
      type: "image/png",
    })
  );
  max.parse(
    new File([], "file.png", {
      type: "image/png",
    })
  );
  min.parse(
    new File(["d", "b", "e", "z"], "file.png", {
      type: "image/png",
    })
  );
  type.parse(
    new File(["m", "i"], "file.png", {
      type: "image/png",
    })
  );
  multipleTypes.parse(
    new File([], "file.png", {
      type: "image/png",
    })
  );
});

test("failing validations", () => {
  expect(() => file.parse(null)).toThrow();
  expect(() =>
    max.parse(
      new File(["z", "o", "d", "l", "i", "b"], "file.png", {
        type: "image/png",
      })
    )
  ).toThrow();
  expect(() =>
    max.parse(
      new File(["z", "o", "d", "l", "i"], "file.png", {
        type: "image/png",
      })
    )
  ).toThrow();
  expect(() =>
    min.parse(
      new File(["s"], "file.png", {
        type: "image/png",
      })
    )
  ).toThrow();
  expect(() =>
    min.parse(
      new File([], "file.png", {
        type: "image/png",
      })
    )
  ).toThrow();
  expect(() =>
    type.parse(
      new File([], "file.gif", {
        type: "image/jpg",
      })
    )
  ).toThrow();
  expect(() =>
    multipleTypes.parse(
      new File([], "file.gif", {
        type: "image/jpg",
      })
    )
  ).toThrow();
});

test("min max getters", () => {
  expect(z.file().min(5).minSize).toEqual(5);
  expect(z.file().min(5).min(10).minSize).toEqual(10);

  expect(z.file().max(5).maxSize).toEqual(5);
  expect(z.file().max(5).max(1).maxSize).toEqual(1);
});

test("type getter", () => {
  expect(z.file().type("image/png").allowedTypes).toEqual(["image/png"]);
  expect(z.file().type(["image/png"]).allowedTypes).toEqual(["image/png"]);
  expect(
    z.file().type("image/png").type(["image/gif", "image/png"]).allowedTypes
  ).toEqual(["image/png", "image/gif"]);
});
