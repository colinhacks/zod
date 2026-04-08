import { describe, expect, it } from "vitest";
import fr from "../../../locales/fr.js";

describe("French localization", () => {
  const localeError = fr().localeError;

  describe("pluralization rules", () => {
    for (const { type, cases } of TEST_CASES) {
      describe(`${type} pluralization`, () => {
        for (const { count, expected } of cases) {
          it(`correctly pluralizes ${count} ${type}`, () => {
            const error = localeError({
              code: "too_small",
              minimum: count,
              type: "number",
              inclusive: true,
              path: [],
              origin: type,
              input: count - 1,
            });

            expect(error).toContain(expected);
          });
        }
      });
    }

    it("handles negative numbers correctly", () => {
      const error = localeError({
        code: "too_small",
        minimum: -2,
        type: "number",
        inclusive: true,
        path: [],
        origin: "array",
        input: -3,
      });

      expect(error).toContain("-2 éléments");
    });

    it("handles zero correctly", () => {
      const error = localeError({
        code: "too_small",
        minimum: 0,
        type: "number",
        inclusive: true,
        path: [],
        origin: "array",
        input: -1,
      });

      expect(error).toContain("0 élément");
    });

    it("handles bigint values correctly", () => {
      const error = localeError({
        code: "too_small",
        minimum: BigInt(21),
        type: "number",
        inclusive: true,
        path: [],
        origin: "array",
        input: BigInt(20),
      });

      expect(error).toContain("21 éléments");
    });
  });

  describe("type name translations in too_small errors", () => {
    it("translates string origin", () => {
      const error = localeError({
        code: "too_small",
        origin: "string",
        minimum: 5,
        inclusive: true,
        path: [],
        input: "abc",
      });
      expect(error).toContain("chaîne");
      expect(error).toContain("5 caractères");
    });

    it("translates number origin", () => {
      const error = localeError({
        code: "too_small",
        origin: "number",
        minimum: 10,
        inclusive: true,
        path: [],
        input: 5,
      });
      expect(error).toContain("nombre");
      expect(error).toContain("10");
    });

    it("translates array origin", () => {
      const error = localeError({
        code: "too_small",
        origin: "array",
        minimum: 3,
        inclusive: true,
        path: [],
        input: ["a", "b"],
      });
      expect(error).toContain("tableau");
      expect(error).toContain("3 éléments");
    });

    it("translates set origin", () => {
      const error = localeError({
        code: "too_small",
        origin: "set",
        minimum: 2,
        inclusive: true,
        path: [],
        input: new Set(["a"]),
      });
      expect(error).toContain("ensemble");
      expect(error).toContain("2 éléments");
    });

    it("translates file origin", () => {
      const error = localeError({
        code: "too_small",
        origin: "file",
        minimum: 1,
        inclusive: true,
        path: [],
        input: new File([], "test.txt"),
      });
      expect(error).toContain("fichier");
      expect(error).toContain("1 octet");
    });
  });

  describe("type name translations in too_big errors", () => {
    it("translates string origin", () => {
      const error = localeError({
        code: "too_big",
        origin: "string",
        maximum: 3,
        inclusive: true,
        path: [],
        input: "abcde",
      });
      expect(error).toContain("chaîne");
      expect(error).toContain("3 caractères");
    });

    it("translates number origin", () => {
      const error = localeError({
        code: "too_big",
        origin: "number",
        maximum: 10,
        inclusive: true,
        path: [],
        input: 15,
      });
      expect(error).toContain("nombre");
      expect(error).toContain("10");
    });

    it("translates array origin", () => {
      const error = localeError({
        code: "too_big",
        origin: "array",
        maximum: 2,
        inclusive: true,
        path: [],
        input: ["a", "b", "c"],
      });
      expect(error).toContain("tableau");
      expect(error).toContain("2 éléments");
    });

    it("translates set origin", () => {
      const error = localeError({
        code: "too_big",
        origin: "set",
        maximum: 2,
        inclusive: true,
        path: [],
        input: new Set(["a", "b", "c"]),
      });
      expect(error).toContain("ensemble");
      expect(error).toContain("2 éléments");
    });
  });

  describe("type name translations in invalid_type errors", () => {
    it("translates expected string, received number", () => {
      const error = localeError({
        code: "invalid_type",
        expected: "string",
        path: [],
        input: 123,
      });
      expect(error).toContain("chaîne");
      expect(error).toContain("nombre");
    });

    it("translates expected number, received string", () => {
      const error = localeError({
        code: "invalid_type",
        expected: "number",
        path: [],
        input: "abc",
      });
      expect(error).toContain("nombre");
      expect(error).toContain("chaîne");
    });

    it("translates expected boolean, received null", () => {
      const error = localeError({
        code: "invalid_type",
        expected: "boolean",
        path: [],
        input: null,
      });
      expect(error).toContain("booléen");
      expect(error).toContain("null");
    });

    it("translates expected array, received object", () => {
      const error = localeError({
        code: "invalid_type",
        expected: "array",
        path: [],
        input: {},
      });
      expect(error).toContain("tableau");
      expect(error).toContain("objet");
    });
  });
});

const TEST_CASES = [
  {
    type: "array",
    cases: [
      { count: 1, expected: "1 élément" },
      { count: 2, expected: "2 éléments" },
      { count: 5, expected: "5 éléments" },
      { count: 11, expected: "11 éléments" },
      { count: 21, expected: "21 élément" },
      { count: 22, expected: "22 éléments" },
      { count: 25, expected: "25 éléments" },
      { count: 101, expected: "101 éléments" },
      { count: 111, expected: "111 éléments" },
    ],
  },
  {
    type: "set",
    cases: [
      { count: 1, expected: "1 élément" },
      { count: 2, expected: "2 éléments" },
      { count: 5, expected: "5 éléments" },
      { count: 11, expected: "11 éléments" },
      { count: 21, expected: "21 élément" },
      { count: 22, expected: "22 éléments" },
      { count: 25, expected: "25 éléments" },
      { count: 101, expected: "101 éléments" },
      { count: 111, expected: "111 éléments" },
    ],
  },
  {
    type: "string",
    cases: [
      { count: 1, expected: "1 caractère" },
      { count: 2, expected: "2 caractères" },
      { count: 5, expected: "5 caractères" },
      { count: 11, expected: "11 caractères" },
      { count: 21, expected: "21 caractère" },
      { count: 22, expected: "22 caractères" },
      { count: 25, expected: "25 caractères" },
    ],
  },
  {
    type: "file",
    cases: [
      { count: 0, expected: "0 octet" },
      { count: 1, expected: "1 octet" },
      { count: 2, expected: "2 octets" },
      { count: 5, expected: "5 octets" },
      { count: 11, expected: "11 octets" },
      { count: 21, expected: "21 octet" },
      { count: 22, expected: "22 octets" },
      { count: 25, expected: "25 octets" },
      { count: 101, expected: "101 octets" },
      { count: 110, expected: "110 octets" },
    ],
  },
] as const;
