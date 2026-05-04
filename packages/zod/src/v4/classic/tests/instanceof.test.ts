import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("instanceof", async () => {
  class Test {}
  class Subtest extends Test {}
  abstract class AbstractBar {
    constructor(public val: string) {}
  }
  class Bar extends AbstractBar {}

  const TestSchema = z.instanceof(Test);
  const SubtestSchema = z.instanceof(Subtest);
  const AbstractSchema = z.instanceof(AbstractBar);
  const BarSchema = z.instanceof(Bar);

  TestSchema.parse(new Test());
  TestSchema.parse(new Subtest());
  SubtestSchema.parse(new Subtest());
  AbstractSchema.parse(new Bar("asdf"));
  const bar = BarSchema.parse(new Bar("asdf"));
  expect(bar.val).toEqual("asdf");

  await expect(() => SubtestSchema.parse(new Test())).toThrow();
  await expect(() => TestSchema.parse(12)).toThrow();

  expectTypeOf<Test>().toEqualTypeOf<z.infer<typeof TestSchema>>();
});

test("instanceof properties", () => {
  const httpsUrl = z.instanceof(URL).properties({
    protocol: z.literal("https:" as string),
    hostname: z.string().regex(z.regexes.domain),
  });
  const httpsUrlWithPath = httpsUrl.properties({ pathname: z.string().startsWith("/") });

  expectTypeOf<URL>().toEqualTypeOf<z.infer<typeof httpsUrlWithPath>>();
  expect(httpsUrlWithPath.safeParse(new URL("https://example.com")).success).toBe(true);
  expect(httpsUrl.safeParse(new URL("http://example.com")).success).toBe(false);
  expect(httpsUrl.safeParse(new URL("https://localhost")).success).toBe(false);
});

test("properties check", () => {
  const stringWithLength = z.string().check(z.properties({ length: z.number().min(5) }));

  expect(stringWithLength.safeParse("hello").success).toBe(true);
  const result = stringWithLength.safeParse("hi");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0]?.path).toEqual(["length"]);
  }
});

test("instanceof fatal", () => {
  const schema = z.instanceof(Date).refine((d) => d.toString());
  const res = schema.safeParse(null);
  expect(res.success).toBe(false);
});

test("instanceof respects customError", () => {
  class Test {
    name!: string;
  }

  z.config({
    customError: () => {
      return "This is invalid!";
    },
  });

  const TestSchema = z.instanceof(Test);
  const result = TestSchema.safeParse("whatever");
  expect(result.success).toBe(false);
  if (!result.success) {
    const issue = result.error.issues[0];
    expect(issue.code).toBe("invalid_type");
    if (issue.code === "invalid_type") {
      expect(issue.expected).toBe("Test");
    }
    expect(issue.message).toBe("This is invalid!");
  }

  z.config({ customError: undefined });
});
