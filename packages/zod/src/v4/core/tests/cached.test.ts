import { expect, test } from "vitest";

import { util } from "zod/v4/core";

// `cached` is public as `z.core.util.cached`, so its box shape is part of the contract; `cachedInternal` trades that shape for a fast prototype-backed box.
for (const [name, make] of [
  ["cached", util.cached],
  ["cachedInternal", util.cachedInternal],
] as const) {
  test(`${name} defers the getter until the first read`, () => {
    let runs = 0;
    const box = make(() => ++runs);
    expect(runs).toBe(0);
    expect(box.value).toBe(1);
    expect(box.value).toBe(1);
    expect(runs).toBe(1);
  });

  test(`${name} memoizes an undefined result`, () => {
    let runs = 0;
    const box = make(() => {
      runs++;
      return undefined;
    });
    expect(box.value).toBeUndefined();
    expect(box.value).toBeUndefined();
    expect(runs).toBe(1);
  });

  test(`${name} retries after the getter throws`, () => {
    let attempts = 0;
    const box = make(() => {
      if (++attempts < 2) throw new Error("boom");
      return "recovered";
    });
    expect(() => box.value).toThrow("boom");
    expect(box.value).toBe("recovered");
    expect(attempts).toBe(2);
  });

  test(`${name} rejects assignment to value`, () => {
    const box = make(() => 1);
    expect(() => {
      (box as { value: number }).value = 2;
    }).toThrow(TypeError);
  });
}

test("cached keeps its own enumerable value, before and after resolution", () => {
  const box = util.cached(() => 1);
  expect(Object.keys(box)).toEqual(["value"]);
  // spread reads `value`, which resolves the box
  expect({ ...box }).toEqual({ value: 1 });

  const desc = Object.getOwnPropertyDescriptor(box, "value")!;
  expect(desc.enumerable).toBe(true);
  expect(desc.configurable).toBe(true);
  expect(desc.writable).toBe(false);
  expect(Object.keys(box)).toEqual(["value"]);
});

test("cachedInternal inherits value and never exposes the getter through it", () => {
  const box = util.cachedInternal(() => 1);
  expect(Object.getOwnPropertyDescriptor(box, "value")).toBeUndefined();
  expect("value" in box).toBe(true);
  expect(box.value).toBe(1);
});

test("allowsEval keeps the cached box shape", () => {
  expect(util.allowsEval.value).toBe(true);
  expect(Object.keys(util.allowsEval)).toEqual(["value"]);
  expect({ ...util.allowsEval }).toEqual({ value: true });
});
