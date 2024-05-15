import { Bench } from "tinybench";
import { makeSchema, runBench } from "./benchUtil.mjs";

const { zod3, zod4 } = makeSchema((z) =>
  z.object({
    string: z.string(),
    boolean: z.boolean(),
    number: z.number(),
  })
);

const DATA = Object.freeze({
  number: Math.random(),
  string: `${Math.random()}`,
  boolean: Math.random() > 0.5,
});

const bench = new Bench();

bench.add("zod3", () => zod3.parse(DATA));
bench.add("zod4", () => zod4.parse(DATA));

export default async function run() {
  await runBench("z.object().parse", bench);
}

run();
