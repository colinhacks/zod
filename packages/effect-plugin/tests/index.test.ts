import "../src/index.js";

import { Cause, Effect, Exit } from "effect";
import { describe, expect, test, expectTypeOf } from "vitest";
import * as z from "zod";

const syncSchema = z.string();
const asyncSchema = z.string().refine(async () => true);

describe("Schema validation tests", () => {
  test("Sync schema should return the input value", () => {
    const result = Effect.runSync(syncSchema.effect.parseSync("hello"));
    expect(result).toBe("hello");
  });

  test("Async schema should return the input value", async () => {
    const result = await Effect.runPromise(asyncSchema.effect.parse("hello"));
    expect(result).toBe("hello");
  });

  test("Sync schema should return fail ZodError", () => {
    expect(() => Effect.runSync(z.number().effect.parseSync("hello"))).toThrow();
  });

  test("ZodError should have the correct tag", () => {
    const err = new z.ZodError([]);
    expect(err._tag).toBe("ZodError");
  });

  test("Pass parse params into .effect.parseSync as the second params", () => {
    const schema = z.string().min(5);

    const result = Effect.runSyncExit(
      schema.effect.parseSync(5, {
        errorMap() {
          return { message: "CUSTOM" };
        },
      })
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const cause = result.cause;
      expect(Cause.isFailType(cause)).toBe(true);
      if (Cause.isFailType(cause)) {
        expect(cause.error.issues[0].message).toBe("CUSTOM");
      }
    }
  });

  expectTypeOf<z.infer<typeof syncSchema>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof asyncSchema>>().toEqualTypeOf<string>();
});
