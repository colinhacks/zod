// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const literalTuna = z.literal("tuna");
const literalTunaCustomMessage = z.literal("tuna", {
  message: "That's not a tuna",
});
const literalFortyTwo = z.literal(42);
const literalTrue = z.literal(true);

const terrificSymbol = Symbol("terrific");
const literalTerrificSymbol = z.literal(terrificSymbol);

test("passing validations", () => {
  literalTuna.parse("tuna");
  literalFortyTwo.parse(42);
  literalTrue.parse(true);
  literalTerrificSymbol.parse(terrificSymbol);
});

test("failing validations", () => {
  expect(() => literalTuna.parse("shark")).toThrow();
  expect(() => literalFortyTwo.parse(43)).toThrow();
  expect(() => literalTrue.parse(false)).toThrow();
  expect(() => literalTerrificSymbol.parse(Symbol("terrific"))).toThrow();
});

test("invalid_literal should have `received` field with data", () => {
  const data = "shark";
  const result = literalTuna.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue.code === "invalid_literal") {
      expect(issue.received).toBe(data);
    }
  }
});

test("invalid_literal should return default message", () => {
  const data = "shark";
  const result = literalTuna.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    expect(issue.message).toEqual(`Invalid literal value, expected \"tuna\"`);
  }
});

test("invalid_literal should return custom message", () => {
  const data = "shark";
  const result = literalTunaCustomMessage.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    expect(issue.message).toEqual(`That's not a tuna`);
  }
});
