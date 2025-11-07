import { expect, test } from "vitest";
import { sayHello } from "../util.js";

test("sayHello without name", () => {
  expect(sayHello()).toBe("Hello!");
});

test("sayHello with name", () => {
  expect(sayHello("World")).toBe("Hello, World!");
});

test("sayHello with custom name", () => {
  expect(sayHello("Alice")).toBe("Hello, Alice!");
});
