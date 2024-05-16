import { Bench } from "tinybench";
import { runBench } from "./benchUtil.js";

const KEY = "~~key~~";
class ZodTest {
  [KEY] = true;
  constructor(public value: string) {}
}

const ex = new ZodTest("this is a test");
const prom = Promise.resolve("this is a test");

const bench = new Bench()
  .add("key in", () => {
    return typeof ex === "object" && KEY in (ex as any);
  })
  .add("key existence", () => {
    return ex[KEY];
  })
  .add("instanceof", () => {
    return ex instanceof ZodTest;
  })
  .add("promise instanceof", () => {
    return prom instanceof Promise;
  });

export default async function run() {
  await runBench("instanceof", bench);
}

if (require.main === module) {
  run();
}
