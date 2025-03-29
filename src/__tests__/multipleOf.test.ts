// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";


describe('z.number().multipleOf() behavior', () => {
  const numbers = {
    number3: 5.123,
    number6: 5.123456,
    number7: 5.1234567,
    number8: 5.12345678,
  };

  const schemas = {
    schema6: z.number().multipleOf(0.000001),
    schema7: z.number().multipleOf(0.0000001),
  };

    test('should not throw for number3', () => {
      expect(() => schemas.schema6.parse(numbers.number3)).not.toThrow();
    });

    test('should not throw for number6', () => {
      expect(() => schemas.schema6.parse(numbers.number6)).not.toThrow();
    });

    test('should throw for number7', () => {
      expect(() => schemas.schema6.parse(numbers.number7)).toThrow();
    });

    test('should throw for number8', () => {
      expect(() => schemas.schema6.parse(numbers.number8)).toThrow();
    });

    test('should not throw for number3', () => {
      expect(() => schemas.schema7.parse(numbers.number3)).not.toThrow();
    });

    test('should not throw for number6', () => {
      expect(() => schemas.schema7.parse(numbers.number6)).not.toThrow();
    });

    test('should not throw for number7', () => {
      expect(() => schemas.schema7.parse(numbers.number7)).not.toThrow();
    });

    test('should throw for number8', () => {
      expect(() => schemas.schema7.parse(numbers.number8)).toThrow();
    });
});
