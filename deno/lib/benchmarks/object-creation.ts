import { Bench } from "tinybench";
import { runBench } from "./benchUtil.js";

class ZodFail {
  status = "fail";
  constructor(public value: string) {}
}

const bench = new Bench()
  .add("raw object", () => {
    const obj = { status: "fail", value: "this is a test" };
    obj.value;
  })
  .add("constructor", () => {
    const obj = new ZodFail("this is a test");
    obj.value;
  });

export default async function run() {
  await runBench("object creation", bench);
}

if (require.main === module) {
  run();
}
