import { describe, expect, it } from "vitest";
import ru from "../ru.js";

describe("Russian localization", () => {
  const { localeError } = ru();

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

      expect(error).toContain("-2 элемента");
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

      expect(error).toContain("0 элементов");
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

      expect(error).toContain("21 элемент");
    });
  });

  describe("error messages", () => {
    it("formats too_small error correctly", () => {
      const error = localeError({
        code: "too_small",
        minimum: 2,
        type: "number",
        inclusive: true,
        path: [],
        origin: "array",
        input: 1,
      });

      expect(error).toBe("Слишком маленькое значение: ожидалось, что array будет иметь >=2 элемента");
    });

    it("formats too_big error correctly", () => {
      const error = localeError({
        code: "too_big",
        maximum: 5,
        type: "number",
        inclusive: true,
        path: [],
        origin: "string",
        input: 6,
      });

      expect(error).toBe("Слишком большое значение: ожидалось, что string будет иметь <=5 символов");
    });

    it("formats invalid_value error correctly with single value", () => {
      const error = localeError({
        code: "invalid_value",
        values: ["ок"],
        path: [],
        input: "не ок",
      });

      expect(error).toBe('Неверный ввод: ожидалось "ок"');
    });

    it("formats invalid_format error correctly for email", () => {
      const error = localeError({
        code: "invalid_format",
        format: "email",
        path: [],
        input: "not-an-email",
      });

      expect(error).toBe("Неверный email адрес");
    });

    it("formats invalid_format error correctly for starts_with", () => {
      const error = localeError({
        code: "invalid_format",
        format: "starts_with",
        prefix: "https://",
        path: [],
        input: "http://example.com",
      });

      expect(error).toBe('Неверная строка: должна начинаться с "https://"');
    });

    it("formats not_multiple_of error correctly", () => {
      const error = localeError({
        code: "not_multiple_of",
        divisor: 5,
        path: [],
        input: 7,
      });

      expect(error).toBe("Неверное число: должно быть кратным 5");
    });

    it("formats unrecognized_keys error correctly for single key", () => {
      const error = localeError({
        code: "unrecognized_keys",
        keys: ["extraField"],
        path: [],
        input: { extraField: "value" },
      });

      expect(error).toBe('Нераспознанный ключ: "extraField"');
    });

    it("formats unrecognized_keys error correctly for multiple keys", () => {
      const error = localeError({
        code: "unrecognized_keys",
        keys: ["field1", "field2"],
        path: [],
        input: { field1: "value1", field2: "value2" },
      });

      expect(error).toBe('Нераспознанные ключи: "field1", "field2"');
    });

    it("formats invalid_union error correctly", () => {
      const error = localeError({
        code: "invalid_union",
        path: [],
        input: "invalid",
        errors: [
          [
            {
              code: "invalid_type",
              expected: "number",
              path: [],
              input: "invalid",
              message: "Invalid type",
            },
          ],
        ],
      });

      expect(error).toBe("Неверные входные данные");
    });

    it("formats invalid_element error correctly", () => {
      const error = localeError({
        code: "invalid_element",
        path: [],
        origin: "set",
        input: "invalid",
        issues: [
          {
            code: "invalid_type",
            expected: "number",
            path: [],
            input: "invalid",
            message: "Invalid type",
          },
        ],
        key: 0,
      });

      expect(error).toBe("Неверное значение в set");
    });
  });
});

const TEST_CASES = [
  {
    type: "array",
    cases: [
      { count: 1, expected: "1 элемент" },
      { count: 2, expected: "2 элемента" },
      { count: 5, expected: "5 элементов" },
      { count: 11, expected: "11 элементов" },
      { count: 21, expected: "21 элемент" },
      { count: 22, expected: "22 элемента" },
      { count: 25, expected: "25 элементов" },
      { count: 101, expected: "101 элемент" },
      { count: 111, expected: "111 элементов" },
    ],
  },
  {
    type: "set",
    cases: [
      { count: 1, expected: "1 элемент" },
      { count: 2, expected: "2 элемента" },
      { count: 5, expected: "5 элементов" },
      { count: 11, expected: "11 элементов" },
      { count: 21, expected: "21 элемент" },
      { count: 22, expected: "22 элемента" },
      { count: 25, expected: "25 элементов" },
      { count: 101, expected: "101 элемент" },
      { count: 111, expected: "111 элементов" },
    ],
  },
  {
    type: "string",
    cases: [
      { count: 1, expected: "1 символ" },
      { count: 2, expected: "2 символа" },
      { count: 5, expected: "5 символов" },
      { count: 11, expected: "11 символов" },
      { count: 21, expected: "21 символ" },
      { count: 22, expected: "22 символа" },
      { count: 25, expected: "25 символов" },
    ],
  },
  {
    type: "file",
    cases: [
      { count: 0, expected: "0 байт" },
      { count: 1, expected: "1 байт" },
      { count: 2, expected: "2 байта" },
      { count: 5, expected: "5 байт" },
      { count: 11, expected: "11 байт" },
      { count: 21, expected: "21 байт" },
      { count: 22, expected: "22 байта" },
      { count: 25, expected: "25 байт" },
      { count: 101, expected: "101 байт" },
      { count: 110, expected: "110 байт" },
    ],
  },
] as const;
