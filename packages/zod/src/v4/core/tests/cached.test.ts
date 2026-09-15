import { expect, test } from "vitest";

import { util } from "zod/v4/core";

test("cached defers the getter until the first read", () => {
  let runs = 0;
  const box = util.cached(() => ++runs);
  expect(runs).toBe(0);
  expect(box.value).toBe(1);
  expect(box.value).toBe(1);
  expect(runs).toBe(1);
});

test("cached memoizes an undefined result", () => {
  let runs = 0;
  const box = util.cached(() => {
    runs++;
    return undefined;
  });
  expect(box.value).toBeUndefined();
  expect(box.value).toBeUndefined();
  expect(runs).toBe(1);
});

test("cached retries after the getter throws", () => {
  let attempts = 0;
  const box = util.cached(() => {
    if (++attempts < 2) throw new Error("boom");
    return "recovered";
  });
  expect(() => box.value).toThrow("boom");
  expect(box.value).toBe("recovered");
  expect(attempts).toBe(2);
});

test("cached rejects assignment to value", () => {
  const box = util.cached(() => 1);
  expect(() => {
    (box as { value: number }).value = 2;
  }).toThrow(TypeError);
});

// the getter is inherited, so a box carries only its two state slots and stays out of dictionary mode
test("cached keeps value on the prototype", () => {
  const box = util.cached(() => 1);
  expect(Object.getOwnPropertyDescriptor(box, "value")).toBeUndefined();
  expect("value" in box).toBe(true);
  expect(box.value).toBe(1);
});

test("allowsEval reads through the same box", () => {
  expect(util.allowsEval.value).toBe(true);
  expect(util.allowsEval.value).toBe(true);
});
