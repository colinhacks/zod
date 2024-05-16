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
  nest: {
    number: "asdf",
    string: 12,
    // boolean: undefined,
  },
});

const failBench = new Bench();
failBench.add("zod3", () => {
  try {
    zod3.parse(DATA);
  } catch (e) {}
});
failBench.add("zod4", () => {
  try {
    zod4.parse(DATA);
  } catch (e) {}
});

export default async function run() {
  await runBench("fail: z.object().parse", failBench);
}

if (require.main === module) {
  run();
}
