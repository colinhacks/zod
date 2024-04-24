// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers";
import * as z from "../index";

const minTwo = z.string().array().min(2);
const maxTwo = z.string().array().max(2);
const justTwo = z.string().array().length(2);
const intNum = z.string().array().nonempty();
const nonEmptyMax = z.string().array().nonempty().max(2);
const unique = z.string().array().unique();
const uniqueArrayOfObjects = z
  .array(z.object({ name: z.string() }))
  .unique({ identifier: (item) => item.name });

type t1 = z.infer<typeof nonEmptyMax>;
util.assertEqual<[string, ...string[]], t1>(true);

type t2 = z.infer<typeof minTwo>;
util.assertEqual<string[], t2>(true);

test("passing validations", () => {
  minTwo.parse(["a", "a"]);
  minTwo.parse(["a", "a", "a"]);
  maxTwo.parse(["a", "a"]);
  maxTwo.parse(["a"]);
  justTwo.parse(["a", "a"]);
  intNum.parse(["a"]);
  nonEmptyMax.parse(["a"]);
});

test("failing validations", () => {
  expect(() => minTwo.parse(["a"])).toThrow();
  expect(() => maxTwo.parse(["a", "a", "a"])).toThrow();
  expect(() => justTwo.parse(["a"])).toThrow();
  expect(() => justTwo.parse(["a", "a", "a"])).toThrow();
  expect(() => intNum.parse([])).toThrow();
  expect(() => nonEmptyMax.parse([])).toThrow();
  expect(() => nonEmptyMax.parse(["a", "a", "a"])).toThrow();
  expect(() => unique.parse(["a", "b", "a"])).toThrow();
  expect(() =>
    uniqueArrayOfObjects.parse([
      { name: "Leo" },
      { name: "Joe" },
      { name: "Leo" },
    ])
  ).toThrow();
});

test("parse empty array in nonempty", () => {
  expect(() =>
    z
      .array(z.string())
      .nonempty()
      .parse([] as any)
  ).toThrow();
});

test("get element", () => {
  justTwo.element.parse("asdf");
  expect(() => justTwo.element.parse(12)).toThrow();
});

test("continue parsing despite array size error", () => {
  const schema = z.object({
    people: z.string().array().min(2),
  });

  const result = schema.safeParse({
    people: [123],
  });
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues.length).toEqual(2);
  }
});

test("parse should fail given sparse array", () => {
  const schema = z.array(z.string()).nonempty().min(1).max(3);

  expect(() => schema.parse(new Array(3))).toThrow();
});

test("continue parsing despite array of primitives uniqueness error", () => {
  const schema = z.number().array().unique();

  const result = schema.safeParse([1, 1, 2, 2, 3]);

  expect(result.success).toEqual(false);
  if (!result.success) {
    const issue = result.error.issues.find(({ code }) => code === "uniqueness");
    expect(issue?.message).toEqual("Values must be unique");
  }
});

test("continue parsing despite array of objects uniqueness error", () => {
  const schema = z.array(z.object({ name: z.string() })).unique({
    identifier: (item) => item.name,
    showDuplicates: true,
  });

  const result = schema.safeParse([
    { name: "Leo" },
    { name: "Joe" },
    { name: "Leo" },
  ]);

  expect(result.success).toEqual(false);
  if (!result.success) {
    const issue = result.error.issues.find(({ code }) => code === "uniqueness");
    expect(issue?.message).toEqual("Element(s): 'Leo' not unique");
  }
});

test("returns custom error message without duplicate elements", () => {
  const schema = z.number().array().unique({ message: "Custom message" });

  const result = schema.safeParse([1, 1, 2, 2, 3]);

  expect(result.success).toEqual(false);
  if (!result.success) {
    const issue = result.error.issues.find(({ code }) => code === "uniqueness");
    expect(issue?.message).toEqual("Custom message");
  }
});

test("returns error message with duplicate elements", () => {
  const schema = z.number().array().unique({ showDuplicates: true });

  const result = schema.safeParse([1, 1, 2, 2, 3]);

  expect(result.success).toEqual(false);
  if (!result.success) {
    const issue = result.error.issues.find(({ code }) => code === "uniqueness");
    expect(issue?.message).toEqual("Element(s): '1,2' not unique");
  }
});

test("returns custom error message with duplicate elements", () => {
  const schema = z
    .number()
    .array()
    .unique({
      message: (item) => `Custom message: '${item}' are not unique`,
      showDuplicates: true,
    });

  const result = schema.safeParse([1, 1, 2, 2, 3]);

  expect(result.success).toEqual(false);
  if (!result.success) {
    const issue = result.error.issues.find(({ code }) => code === "uniqueness");
    expect(issue?.message).toEqual("Custom message: '1,2' are not unique");
  }
});
