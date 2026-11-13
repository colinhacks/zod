import * as z from "../zod/src/v4/index.js";
import { makeData } from "./benchUtil.js";
import { metabench } from "./metabench.js";

// flat sync object
{
  const schema = z.object({
    string: z.string(),
    boolean: z.boolean(),
    number: z.number(),
  });
  const DATA = makeData(1000, () => ({
    number: Math.random(),
    string: `${Math.random()}`,
    boolean: Math.random() > 0.5,
  }));
  const bench = metabench("flat sync object — safeParse vs safeParseMaybeAsync", {
    safeParse() {
      for (const _ of DATA) schema.safeParse(_);
    },
    safeParseMaybeAsync() {
      for (const _ of DATA) schema.safeParseMaybeAsync(_);
    },
  });
  await bench.run();
}

// nested sync object
{
  const inner = z.object({ tag: z.string(), score: z.number() });
  const schema = z.object({
    id: z.string(),
    nested: z.object({ a: z.string(), b: z.number(), c: z.boolean() }),
    items: z.array(inner),
    kind: z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), x: z.string() }),
      z.object({ type: z.literal("b"), y: z.number() }),
    ]),
  });
  const DATA = makeData(500, () => ({
    id: `${Math.random()}`,
    nested: { a: "x", b: 1, c: true },
    items: [
      { tag: "p", score: 1 },
      { tag: "q", score: 2 },
    ],
    kind: Math.random() > 0.5 ? { type: "a", x: "ok" } : { type: "b", y: 1 },
  }));
  const bench = metabench("nested + discriminated sync — safeParse vs safeParseMaybeAsync", {
    safeParse() {
      for (const _ of DATA) schema.safeParse(_);
    },
    safeParseMaybeAsync() {
      for (const _ of DATA) schema.safeParseMaybeAsync(_);
    },
  });
  await bench.run();
}

// one deep async refine
{
  const schema = z.object({
    id: z.string(),
    nested: z.object({ a: z.string(), b: z.number() }),
    tail: z.string().refine(async (s) => s.length >= 0),
  });
  const DATA = makeData(200, () => ({
    id: `${Math.random()}`,
    nested: { a: "x", b: 1 },
    tail: "y",
  }));
  const bench = metabench("mostly-sync + 1 async refine — safeParseAsync vs safeParseMaybeAsync", {
    async safeParseAsync() {
      for (const _ of DATA) await schema.safeParseAsync(_);
    },
    async safeParseMaybeAsync() {
      for (const _ of DATA) await schema.safeParseMaybeAsync(_);
    },
  });
  await bench.run();
}
