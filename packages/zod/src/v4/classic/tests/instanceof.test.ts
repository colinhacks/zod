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

test("z.properties", () => {
  const httpsUrl = z.instanceof(URL).check(
    ...z.properties({
      protocol: z.literal("https:" as string),
      hostname: z.string().regex(z.regexes.domain),
    })
  );

  expectTypeOf<URL>().toEqualTypeOf<z.infer<typeof httpsUrl>>();
  expect(httpsUrl.safeParse(new URL("https://example.com")).success).toBe(true);

  // Every property reports, rather than only the first one to fail.
  const both = httpsUrl.safeParse(new URL("http://localhost"));
  expect(both.error!.issues.map((i) => i.path)).toEqual([["protocol"], ["hostname"]]);

  // A failing base schema yields its own issue and no property issues.
  for (const input of ["not a url", null]) {
    const issues = httpsUrl.safeParse(input).error!.issues;
    expect(issues.map((i) => [i.code, i.path])).toEqual([["custom", []]]);
  }

  // Not specific to z.instanceof().
  const obj = z
    .object({ a: z.string(), b: z.string() })
    .check(...z.properties({ a: z.literal("x"), b: z.literal("y") }));
  expect(obj.safeParse({ a: "x", b: "y" }).success).toBe(true);
  expect(obj.safeParse({ a: "!", b: "!" }).error!.issues.map((i) => i.path)).toEqual([["a"], ["b"]]);

  // The `when` gate that buys the aggregation makes the check itself uncompilable, so a container absorbs it as a runtime island instead of dropping the whole schema off the fast path.
  const compiled = z.compile(z.object({ url: httpsUrl }));
  expect(compiled.safeParse({ url: new URL("https://example.com") }).success).toBe(true);
  expect(compiled.safeParse({ url: new URL("http://localhost") }).error!.issues.map((i) => i.path)).toEqual([
    ["url", "protocol"],
    ["url", "hostname"],
  ]);
});
