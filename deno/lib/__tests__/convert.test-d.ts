import { assertType, describe, expectTypeOf, test } from "vitest";
import { SafeParseReturnType, z } from "../index.ts";

const stringToNumber = z.string().transform((arg) => parseFloat(arg));
const numberToString = z.number().transform((n) => String(n));

const asyncNumberToString = z.number().transform(async (n) => String(n));
const asyncStringToNumber = z.string().transform(async (n) => parseFloat(n));

describe("convert", () => {
  test("input and output types to be enforced in", () => {
    expectTypeOf(stringToNumber.convert).toBeFunction();
    expectTypeOf(stringToNumber.convert).parameter(0).toMatchTypeOf<string>();
    expectTypeOf(stringToNumber.convert).returns.toMatchTypeOf<number>();

    expectTypeOf(numberToString.convert).toBeFunction();
    expectTypeOf(numberToString.convert).parameter(0).toMatchTypeOf<number>();
    expectTypeOf(numberToString.convert).returns.toMatchTypeOf<string>();
  });

  test("valid schema conversion", () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      age: z.string().transform((age) => parseInt(age, 10)),
    });

    const validInput: z.input<typeof userSchema> = {
      id: "123",
      name: "Alice",
      age: "25",
    };

    const user = userSchema.convert(validInput);
    expectTypeOf(user).toMatchTypeOf<z.infer<typeof userSchema>>();
  });

  test("invalid schema conversion", () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      age: z.string().transform((age) => parseInt(age, 10)),
    });

    // Input not matching the schema's input type
    const invalidInput = {
      name: "Alice",
      age: "25",
    };

    expectTypeOf(numberToString.convert)
      .parameter(0)
      .not.toMatchTypeOf<typeof invalidInput>();

    try {
      // @ts-expect-error - compile error
      userSchema.convert(invalidInput);
    } catch {}
  });
});

describe("safeConvert", () => {
  test("input and output types to be enforced in", () => {
    expectTypeOf(stringToNumber.safeConvert).toBeFunction();
    expectTypeOf(stringToNumber.safeConvert)
      .parameter(0)
      .toMatchTypeOf<string>();
    expectTypeOf(stringToNumber.safeConvert).returns.toMatchTypeOf<
      SafeParseReturnType<string, number>
    >();

    const resA = stringToNumber.safeConvert(""); // valid input but invlaid output
    if (resA.success) {
      assertType<number>(resA.data);
    } else {
      assertType<z.ZodError>(resA.error);
    }

    expectTypeOf(numberToString.safeConvert).toBeFunction();
    expectTypeOf(numberToString.safeConvert)
      .parameter(0)
      .toMatchTypeOf<number>();
    expectTypeOf(numberToString.safeConvert).returns.toMatchTypeOf<
      SafeParseReturnType<number, string>
    >();

    const resB = numberToString.safeConvert(321);
    if (resB.success) {
      assertType<string>(resB.data);
    } else {
      assertType<z.ZodError>(resB.error);
    }
  });
});

describe("convertAsync", () => {
  test("input and output types to be enforced in", () => {
    expectTypeOf(asyncStringToNumber.convertAsync).toBeFunction();
    expectTypeOf(asyncStringToNumber.convertAsync)
      .parameter(0)
      .toMatchTypeOf<string>();
    expectTypeOf(asyncStringToNumber.convertAsync).returns.toMatchTypeOf<
      Promise<number>
    >();

    expectTypeOf(asyncNumberToString.convertAsync).toBeFunction();
    expectTypeOf(asyncNumberToString.convertAsync)
      .parameter(0)
      .toMatchTypeOf<number>();
    expectTypeOf(asyncNumberToString.convertAsync).returns.toMatchTypeOf<
      Promise<string>
    >();
  });
});

describe("safeConvertAsync", () => {
  test("input and output types to be enforced in", async () => {
    expectTypeOf(asyncStringToNumber.safeConvertAsync).toBeFunction();
    expectTypeOf(asyncStringToNumber.safeConvertAsync)
      .parameter(0)
      .toMatchTypeOf<string>();
    expectTypeOf(asyncStringToNumber.safeConvertAsync).returns.toMatchTypeOf<
      Promise<SafeParseReturnType<string, number>>
    >();

    const resA = await asyncStringToNumber.safeConvertAsync(""); // valid input but invlaid output
    if (resA.success) {
      assertType<number>(resA.data);
    } else {
      assertType<z.ZodError>(resA.error);
    }

    expectTypeOf(asyncNumberToString.safeConvertAsync).toBeFunction();
    expectTypeOf(asyncNumberToString.safeConvertAsync)
      .parameter(0)
      .toMatchTypeOf<number>();
    expectTypeOf(asyncNumberToString.safeConvertAsync).returns.toMatchTypeOf<
      Promise<SafeParseReturnType<number, string>>
    >();

    const resB = await asyncNumberToString.safeConvertAsync(321);
    if (resB.success) {
      assertType<string>(resB.data);
    } else {
      assertType<z.ZodError>(resB.error);
    }
  });
});
