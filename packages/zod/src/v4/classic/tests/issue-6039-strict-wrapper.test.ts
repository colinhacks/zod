import { describe, expect, test } from "vitest";
import * as z from "zod";

// Test reproducer for #6039

describe("#6039 nested type inference with wrappers", () => {
  test(".strict() wrapper breaks nested inference (issue)", () => {
    const strictIfTesting = <T extends z.ZodObject>(schema: T) => {
      return schema.strict();
    };

    const wrapped = strictIfTesting(
      z.object({
        someKey: z.object({
          anotherKey: z.string(),
        }),
      })
    );

    // expect: myObject.someKey is { anotherKey: string }
    type T = z.infer<typeof wrapped>;
    const t: T = { someKey: { anotherKey: "x" } };
    expect(typeof t.someKey.anotherKey).toBe("string");
  });

  test(".passthrough() wrapper (control)", () => {
    const wrap = <T extends z.ZodObject>(schema: T) => schema.passthrough();

    const wrapped = wrap(
      z.object({
        someKey: z.object({
          anotherKey: z.string(),
        }),
      })
    );

    type T = z.infer<typeof wrapped>;
    const t: T = { someKey: { anotherKey: "x" } };
    expect(typeof t.someKey.anotherKey).toBe("string");
  });

  test(".loose() wrapper (control)", () => {
    const wrap = <T extends z.ZodObject>(schema: T) => schema.loose();

    const wrapped = wrap(
      z.object({
        someKey: z.object({
          anotherKey: z.string(),
        }),
      })
    );

    type T = z.infer<typeof wrapped>;
    const t: T = { someKey: { anotherKey: "x" } };
    expect(typeof t.someKey.anotherKey).toBe("string");
  });

  test(".strip() wrapper (control)", () => {
    const wrap = <T extends z.ZodObject>(schema: T) => schema.strip();

    const wrapped = wrap(
      z.object({
        someKey: z.object({
          anotherKey: z.string(),
        }),
      })
    );

    type T = z.infer<typeof wrapped>;
    const t: T = { someKey: { anotherKey: "x" } };
    expect(typeof t.someKey.anotherKey).toBe("string");
  });

  test("issue's exact reproducer", () => {
    const strictIfTesting = <T extends z.ZodObject>(schema: T) => {
      const isProductionEnvironment = "window" in globalThis;
      return isProductionEnvironment ? schema : schema.strict();
    };

    const mySchema = () =>
      strictIfTesting(
        z.object({
          someKey: strictIfTesting(
            z.object({
              anotherKey: z.string().nonempty().nonoptional(),
            })
          ).nonoptional(),
        })
      );

    const myObject = mySchema().parse({ someKey: { anotherKey: "hello" } });

    expect(typeof myObject.someKey.anotherKey).toBe("string");
    expect(myObject.someKey.anotherKey).toBe("hello");
  });
});
