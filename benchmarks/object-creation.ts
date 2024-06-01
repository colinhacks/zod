import { metabench } from "./metabench";

class ZodFail {
  status = "fail";
  constructor(public value: string) {}
}

const bench = metabench("object creation")
  .add("raw object", () => {
    const obj = { status: "fail", value: "this is a test" };
    obj.value;
  })
  .add("constructor", () => {
    const obj = new ZodFail("this is a test");
    obj.value;
  });

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
