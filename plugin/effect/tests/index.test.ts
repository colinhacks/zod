import "../src/index";

import { Effect } from "effect";
import assert from "node:assert";
import * as z from "zod";

async function run() {
  const syncSchema = z.string();
  const asyncSchema = z.string().refine(async () => true);
  {
    const result = Effect.runSync(syncSchema.effectSync("hello"));
    assert.strict.equal(result, "hello");
  }

  await Effect.runPromise(asyncSchema.effect("hello")).then((result) => {
    assert.strict.equal(result, "hello");
  });
}

run();
