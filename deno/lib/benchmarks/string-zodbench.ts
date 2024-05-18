import { randomString } from "./benchUtil.js";
import { zodbench } from "./zodbench.ts";

const bench = zodbench({
  name: "z.string().parse",
  batch: 1000,
  schema(z) {
    return z.string();
  },
  data() {
    return randomString(10);
  },
  benchmark(d) {
    console.log(d);
    this.schema.parse(d);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
