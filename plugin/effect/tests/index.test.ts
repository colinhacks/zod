import "../src/index";

import { Cause, Effect, Exit } from "effect";
import assert from "node:assert";
import test from "node:test";
import * as z from "zod";

const syncSchema = z.string();
const asyncSchema = z.string().refine(async () => true);

test("Sync schema should return the input value", () => {
  const result = Effect.runSync(syncSchema.effect.parseSync("hello"));
  assert.strict.equal(result, "hello");
});

test("Async schema should return the input value", async () => {
  const result = await Effect.runPromise(asyncSchema.effect.parse("hello"));
  assert.strict.equal(result, "hello");
});

test("Sync schema should return fail ZodError", async () => {
  assert.throws(() => Effect.runSync(z.number().effect.parseSync("hello")));
});

test("ZodError should have the correct tag", () => {
  const err = new z.ZodError([]);
  assert.strict.equal(err._tag, "ZodError");
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
  assert.strict.equal(Exit.isFailure(result), true);
  if (Exit.isFailure(result)) {
    const cause = result.cause;
    assert.strict.equal(Cause.isFailType(cause), true);
    if (Cause.isFailType(cause)) {
      cause.error;
      assert.strict.equal(cause.error.issues[0].message, "CUSTOM");
    }
  }
});
