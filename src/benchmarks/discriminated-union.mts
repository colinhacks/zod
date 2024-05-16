import { Bench } from "tinybench";
import { makeSchema, runBench } from "./benchUtil.mjs";

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

const DATA = { type: "c" };
const bench = new Bench()
  .add("zod3", () => {
    zod3.parse(DATA);
  })
  .add("zod4", () => {
    zod4.parse(DATA);
  });

export default async function run() {
  await runBench("z.discriminatedUnion().parse", bench);
}

if (import.meta.filename === process.argv[1]) {
  run();
}
