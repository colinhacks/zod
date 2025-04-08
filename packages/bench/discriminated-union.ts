import { makeData, makeSchema, randomPick, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

const { zod3, zod4 } = makeSchema((z) => {
  const aSchema = z.object({
    type: z.literal("a"),
  });

  const bSchema = z.object({
    type: z.literal("b"),
  });

  const cSchema = z.object({
    type: z.literal("c"),
  });

  return z.discriminatedUnion("type", [aSchema, bSchema, cSchema]);
});

const DATA = makeData(1000, () => ({ type: randomPick(["a", "b", "c"]) }));

console.log(zod3.parse(DATA[0]));
console.log(zod4.parse(DATA[0]));

const bench = metabench("z.disriminatedUnion().parse")
  .add("zod3", () => {
    for (const x of DATA) zod3.parse(x);
  })
  .add("zod4", () => {
    for (const x of DATA) zod4.parse(x);
  });

await bench.run();
