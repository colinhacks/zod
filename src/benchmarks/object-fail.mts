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
  nest: {
    number: "asdf",
    string: 12,
    // boolean: undefined,
  },
});

const bench = new Bench();

bench.add("zod3", () => zod3.safeParse(DATA));
bench.add("zod4", () => zod4.safeParse(DATA));

export default async function run() {
  await runBench("fail: z.object().parse", bench);
}

if (import.meta.filename === process.argv[1]) {
  run();
}
