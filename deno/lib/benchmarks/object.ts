import { Bench } from "tinybench";
import { makeSchema, runBench } from "./benchUtil.js";

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

const parseBench = new Bench();
parseBench.add("zod3", () => zod3.parse(DATA));
parseBench.add("zod4", () => zod4.parse(DATA));

const safeParseBench = new Bench();
safeParseBench.add("zod3", () => zod3.safeParse(DATA));
safeParseBench.add("zod4", () => zod4.safeParse(DATA));

export default async function run() {
  await runBench("small: z.object().parse", parseBench);
  await runBench("small: z.object().safeParse", safeParseBench);
}

if (require.main === module) {
  run();
}
