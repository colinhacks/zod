import { makeSchema, metabench, runBench } from "./benchUtil.js";

export const { zod3, zod4 } = makeSchema((z) =>
  z.object({
    string: z.string(),
    boolean: z.boolean(),
    number: z.number(),
  })
);

export const DATA = Object.freeze({
  number: Math.random(),
  string: `${Math.random()}`,
  boolean: Math.random() > 0.5,
});

const bench = metabench("small: z.object().parse");
bench.add("zod3", () => zod3.parse(DATA));
bench.add("zod4", () => zod4.parse(DATA));

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
